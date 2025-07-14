// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {IERC1155} from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import {ERC721Holder} from '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import {ERC1155Holder} from '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import {TimeConverter} from './utils/TimeConverter.sol';

interface IERC4907 {
    function setUser(uint256 tokenId, address user, uint64 expires) external;
}

/**
 * @title RentalAgreement
 * @dev Manages the escrow and state for a single NFT rental.
 * This contract handles two rental models: collateral-based and delegation-based.
 * Supports both ERC721, ERC1155, and ERC4907 NFTs.
 */
contract RentalAgreement is ERC721Holder, ERC1155Holder {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error RentalAgreement__InvalidState(State expected, State actual);
    error RentalAgreement__InvalidPayment();
    error RentalAgreement__WrongRentalType(
        RentalType expected,
        RentalType actual
    );
    error RentalAgreement__RenterMustNotBeLender();
    error RentalAgreement__DurationCannotBeZero();
    error RentalAgreement__CollateralCannotBeZeroForCollateralType();
    error RentalAgreement__InvalidRentalType();
    error RentalAgreement__InvalidUser(address expected, address actual);

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event RentalInitiated(address indexed renter);
    event NftDepositedByLender(
        address indexed nftContract,
        uint256 indexed tokenId
    );
    event NftReleasedToRenter();
    event NftReturnedByRenter();
    event RentalStarted(uint256 endTime);
    event RentalCompleted();
    event RentalDefaulted();
    event RentalCancelled(string reason);
    event CollateralClaimed(address indexed lender, uint256 amount);
    event PayoutsDistributed(
        address indexed lender,
        address indexed platform,
        uint256 lenderPayout,
        uint256 platformFee
    );

    /*//////////////////////////////////////////////////////////////
                            TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/
    enum State {
        LISTED, // Waiting for a renter
        PENDING, // Renter has paid, waiting for lender to deposit the NFT
        READY_TO_RELEASE, // NFT is in escrow, renter can claim it
        ACTIVE_RENTAL, // Renter possesses the NFT
        ACTIVE_DELEGATION, // Renter has usage rights
        COMPLETED, // Rental finished successfully
        DEFAULTED, // Renter failed to return the NFT on time
        CANCELLED // Rental was voided
    }

    enum RentalType {
        COLLATERAL,
        DELEGATION
    }

    enum NftStandard {
        ERC721,
        ERC1155,
        ERC4907
    }

    enum NFTDepositDuration {
        ONE_DAY,
        THREE_DAYS,
        ONE_WEEK
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public immutable i_lender;
    address public immutable i_nftContract;
    uint256 public immutable i_tokenId;
    uint256 public immutable i_hourlyRentalFee;
    uint256 public immutable i_collateral;
    uint256 public immutable i_rentalDurationInHours;
    RentalType public immutable i_rentalType;
    NftStandard public immutable i_nftStandard;
    NFTDepositDuration public immutable i_NFTDepositDuration;
    address public s_renter;
    State public s_rentalState;
    uint256 public s_rentalEndTime;
    uint256 public s_lenderDepositDeadline;

    /*//////////////////////////////////////////////////////////////
                             MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier renterNotLender() {
        if (msg.sender == i_lender) {
            revert RentalAgreement__RenterMustNotBeLender();
        }
        _;
    }

    modifier onlyRentalType(RentalType _expectedType) {
        if (i_rentalType != _expectedType) {
            revert RentalAgreement__WrongRentalType(_expectedType, i_rentalType);
        }
        _;
    }

    modifier inState(State _expected) {
        if (s_rentalState != _expected) {
            revert RentalAgreement__InvalidState(_expected, s_rentalState);
        }
        _;
    }

    modifier onlyRenter() {
        if (msg.sender != s_renter) {
            revert RentalAgreement__InvalidUser(s_renter, msg.sender);
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Creates a new rental agreement.
     * @param _lender The address of the NFT owner.
     * @param _nftContract The contract address of the NFT collection.
     * @param _tokenId The specific NFT ID of the NFT to be rented.
     * @param _hourlyRentalFee The rental fee per hour, in wei.
     * @param _collateral The collateral amount in wei.
     * @param _rentalDurationInHours The duration of the rental in hours.
     * @param _rentalType The type of rental (COLLATERAL or DELEGATION).
     * @param _nftStandard The NFT standard (ERC721, ERC1155, or ERC4907).
     * @param _depositDeadline The deadline for the lender to deposit the NFT.
     */
    constructor(
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _collateral,
        uint256 _rentalDurationInHours,
        RentalType _rentalType,
        NftStandard _nftStandard,
        NFTDepositDuration _depositDeadline
    ) {
        if (_rentalDurationInHours == 0) {
            revert RentalAgreement__DurationCannotBeZero();
        }
        if (_rentalType == RentalType.COLLATERAL && _collateral == 0) {
            revert RentalAgreement__CollateralCannotBeZeroForCollateralType();
        }
        i_lender = _lender;
        i_nftContract = _nftContract;
        i_tokenId = _tokenId;
        i_hourlyRentalFee = _hourlyRentalFee;
        i_collateral = _collateral;
        i_rentalDurationInHours = _rentalDurationInHours;
        i_rentalType = _rentalType;
        i_nftStandard = _nftStandard;
        i_NFTDepositDuration = _depositDeadline;
        s_rentalState = State.LISTED;
    }

    /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    // --- RENTER-FACING FUNCTIONS --- //

    /**
     * @notice Renter calls this to initiate a collateral-based rental.
     * @dev Renter must send `totalRentalFee` + `collateral`.
     */
    function initiateCollateralRental()
        external
        payable
        renterNotLender
        onlyRentalType(RentalType.COLLATERAL)
    {
        uint256 requiredPayment = getTotalRentalFeeWithCollateral();
        _initiateRental(requiredPayment);
    }

    /**
     * @notice Renter calls this to initiate a delegation-based rental.
     * @dev Renter must send `totalRentalFee`.
     */
    function initiateDelegationRental()
        external
        payable
        renterNotLender
        onlyRentalType(RentalType.DELEGATION)
    {
        uint256 requiredPayment = getTotalHourlyFee();
        _initiateRental(requiredPayment);
    }

    /**
     * @notice Renter calls this to receive the NFT from escrow.
     * @dev Only available for collateral-based rentals.
     * @dev Uses TimeConverter to convert hours to seconds.
     */
    function releaseNFTToRenter()
        external
        onlyRenter
        onlyRentalType(RentalType.COLLATERAL)
        inState(State.READY_TO_RELEASE)
    {
        s_rentalEndTime = block.timestamp + TimeConverter.hoursToSeconds(i_rentalDurationInHours);

        s_rentalState = State.ACTIVE_RENTAL;

        if (i_nftStandard == NftStandard.ERC721) {
            IERC721(i_nftContract).safeTransferFrom(address(this), s_renter, i_tokenId);
        } else if (i_nftStandard == NftStandard.ERC1155) {
            IERC1155(i_nftContract).safeTransferFrom(address(this), s_renter, i_tokenId, 1, "");
        }

        emit NftReleasedToRenter();
        emit RentalStarted(s_rentalEndTime);
    }

    // --- LENDER-FACING FUNCTIONS --- //

    // --- CANCELLATION FUNCTIONS --- //

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Internal function to handle the core logic of initiating a rental.
     * @param _requiredPayment The total amount of ether that must be sent.
     */
    function _initiateRental(uint256 _requiredPayment)
        private
        inState(State.LISTED)
    {
        if (msg.value != _requiredPayment) {
            revert RentalAgreement__InvalidPayment();
        }

        s_renter = msg.sender;

        if (i_NFTDepositDuration == NFTDepositDuration.ONE_DAY) {
            s_lenderDepositDeadline = block.timestamp + 1 days;
        } else if (
            i_NFTDepositDuration == NFTDepositDuration.THREE_DAYS
        ) {
            s_lenderDepositDeadline = block.timestamp + 3 days;
        } else {
            s_lenderDepositDeadline = block.timestamp + 1 weeks;
        }

        s_rentalState = State.PENDING;

        emit RentalInitiated(s_renter);
    }

    /*//////////////////////////////////////////////////////////////
                        GETTER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Calculates the total rental fee based on the hourly rate and duration.
     * @return The total rental fee.
     */
    function getTotalHourlyFee() public view returns (uint256) {
        return i_hourlyRentalFee * i_rentalDurationInHours;
    }

    /**
     * @notice Calculates the total rental fee with collateral.
     * @return The total rental fee with collateral.
     */
    function getTotalRentalFeeWithCollateral() public view returns (uint256) {
        return getTotalHourlyFee() + i_collateral;
    }
}
