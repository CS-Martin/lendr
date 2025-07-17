// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {IERC1155} from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import {ERC721Holder} from '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import {ERC1155Holder} from '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {TimeConverter} from './utils/TimeConverter.sol';
import {FeeCalculator} from './utils/ComputePercentage.sol';
import {LendrRentalSystem} from './LendrRentalSystem.sol';
import {RentalEnums} from './libraries/RentalEnums.sol';

interface IERC4907 {
    function setUser(uint256 tokenId, address user, uint64 expires) external;
}

/**
 * @title CollateralRentalAgreement
 * @dev Manages the escrow and state for a single collateral-based NFT rental.
 * This contract handles collateral-based rentals.
 * Supports both ERC721 and ERC1155 NFTs.
 */
contract CollateralRentalAgreement is
    ERC721Holder,
    ERC1155Holder,
    ReentrancyGuard
{
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error RentalAgreement__InvalidState(State expected, State actual);
    error RentalAgreement__InvalidPayment();
    error RentalAgreement__RenterMustNotBeLender();
    error RentalAgreement__DurationCannotBeZero();
    error RentalAgreement__CollateralCannotBeZeroForCollateralType();
    error RentalAgreement__InvalidUser(address expected, address actual);
    error RentalAgreement__NftNotInEscrow();
    error RentalAgreement__CollateralRentalDoesNotSupportNFTType();
    error RentalAgreement__RentalNotEnded();
    error RentalAgreement__InvalidDealDuration();
    error RentalAgreement__InvalidStateForDefault();
    error RentalAgreement__PaymentFailed();
    error RentalAgreement__DeadlinePassed();
    error RentalAgreement__LenderStillHasTime();
    error RentalAgreement__RenterStillHasTime();
    error RentalAgreement__ReturnDeadlineMissed();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event RentalInitiated(address indexed renter);
    event NftDepositedByLender(
        address indexed nftContract,
        uint256 indexed tokenId
    );
    event NftReleasedToRenter();
    event NftReturnedByRenter(
        address indexed renter,
        address indexed lender,
        uint256 indexed tokenId
    );
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
        READY_TO_RELEASE, // NFT will be sent to escrow, then renter can claim it
        ACTIVE_RENTAL, // Renter possesses the NFT
        COMPLETED, // Rental finished successfully
        DEFAULTED, // Renter failed to return the NFT on time
        CANCELLED // Rental was voided
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
    RentalEnums.NftStandard public immutable i_nftStandard;
    RentalEnums.DealDuration public immutable i_dealDuration;
    LendrRentalSystem public immutable i_factoryContract;
    address public s_renter;
    State public s_rentalState;
    uint256 public s_rentalEndTime;
    uint256 public s_lenderDepositDeadline;
    uint256 public s_returnDeadline;
    uint256 public s_renterClaimDeadline;

    /*//////////////////////////////////////////////////////////////
                             MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier renterNotLender() {
        if (msg.sender == i_lender) {
            revert RentalAgreement__RenterMustNotBeLender();
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

    modifier onlyLender() {
        if (msg.sender != i_lender) {
            revert RentalAgreement__InvalidUser(i_lender, msg.sender);
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
     * @param _nftStandard The NFT standard (ERC721, ERC1155, or ERC4907).
     * @param _dealDuration The duration for the lender to deposit the NFT.
     */
    constructor(
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _collateral,
        uint256 _rentalDurationInHours,
        RentalEnums.NftStandard _nftStandard,
        RentalEnums.DealDuration _dealDuration
    ) {
        if (_rentalDurationInHours == 0) {
            revert RentalAgreement__DurationCannotBeZero();
        }
        if (_collateral == 0) {
            revert RentalAgreement__CollateralCannotBeZeroForCollateralType();
        }
        if (_nftStandard == RentalEnums.NftStandard.ERC4907) {
            revert RentalAgreement__CollateralRentalDoesNotSupportNFTType();
        }
        if (uint256(_dealDuration) >= uint256(RentalEnums.DealDuration._MAX)) {
            revert RentalAgreement__InvalidDealDuration();
        }
        i_lender = _lender;
        i_nftContract = _nftContract;
        i_tokenId = _tokenId;
        i_hourlyRentalFee = _hourlyRentalFee;
        i_collateral = _collateral;
        i_rentalDurationInHours = _rentalDurationInHours;
        i_nftStandard = _nftStandard;
        i_dealDuration = _dealDuration;
        i_factoryContract = LendrRentalSystem(payable(msg.sender));
        s_rentalState = State.LISTED;
    }

    /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /////////////// --- RENTER-FACING FUNCTIONS --- ////////////////

    /**
     * @notice Renter calls this to initiate a collateral-based rental.
     * @dev Renter must send `totalRentalFee` + `collateral`.
     */
    function initiateRental() external payable renterNotLender {
        uint256 requiredPayment = getTotalRentalFeeWithCollateral();
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
        inState(State.READY_TO_RELEASE)
    {
        if (s_renterClaimDeadline != 0 && block.timestamp > s_renterClaimDeadline) {
            revert RentalAgreement__DeadlinePassed();
        }

        if (i_nftStandard == RentalEnums.NftStandard.ERC721) {
            if (IERC721(i_nftContract).ownerOf(i_tokenId) != address(this)) {
                revert RentalAgreement__NftNotInEscrow();
            }
        } else if (i_nftStandard == RentalEnums.NftStandard.ERC1155) {
            if (
                IERC1155(i_nftContract).balanceOf(address(this), i_tokenId) != 1
            ) {
                revert RentalAgreement__NftNotInEscrow();
            }
        } else {
            revert RentalAgreement__CollateralRentalDoesNotSupportNFTType();
        }

        s_rentalState = State.ACTIVE_RENTAL;
        s_rentalEndTime = block.timestamp + TimeConverter.hoursToSeconds(i_rentalDurationInHours);
        s_returnDeadline = s_rentalEndTime + getCustomDuration(i_dealDuration);

        if (i_nftStandard == RentalEnums.NftStandard.ERC721) {
            IERC721(i_nftContract).safeTransferFrom(address(this), s_renter, i_tokenId);
        } else if (i_nftStandard == RentalEnums.NftStandard.ERC1155) {
            IERC1155(i_nftContract).safeTransferFrom(address(this), s_renter, i_tokenId, 1, "");
        }

        emit NftReleasedToRenter();
        emit RentalStarted(s_rentalEndTime);
    }

    /**
     * @notice Renter calls this to return the NFT to the lender.
     * @dev Before calling this, the renter MUST approve this contract to transfer the NFT.
     * For ERC721, call `approve(address(this), tokenId)` on the NFT contract.
     * For ERC1155, call `setApprovalForAll(address(this), true)` on the NFT contract.
     * @dev If this function is called after the return deadline, the rental is marked
     * as defaulted. The renter will not receive their collateral back. The lender can
     * then claim the collateral. The NFT is not transferred back to the lender if
     * the deadline is missed.
     */
    function returnNFTToLender()
        external
        onlyRenter
        inState(State.ACTIVE_RENTAL)
        nonReentrant
    {
        if (block.timestamp > s_returnDeadline) {
            s_rentalState = State.DEFAULTED;
            emit RentalDefaulted();
            revert RentalAgreement__ReturnDeadlineMissed();
        }

        s_rentalState = State.COMPLETED;

        _distributePayouts();

        if (i_nftStandard == RentalEnums.NftStandard.ERC721) {
            IERC721(i_nftContract).safeTransferFrom(s_renter, i_lender, i_tokenId);
        } else if (i_nftStandard == RentalEnums.NftStandard.ERC1155) {
            IERC1155(i_nftContract).safeTransferFrom(s_renter, i_lender, i_tokenId, 1, "");
        }

        emit NftReturnedByRenter(s_renter, i_lender, i_tokenId);
        emit RentalCompleted();
    }

    /**
     * @notice Renter calls this to cancel the rental if they failed to claim the NFT in time.
     * @dev This refunds the renter and returns the NFT to the lender.
     */
    function cancelRentalAfterClaimTimeout()
        external
        onlyRenter
        inState(State.READY_TO_RELEASE)
        nonReentrant
    {
        if (s_renterClaimDeadline == 0) {
            revert RentalAgreement__NftNotInEscrow();
        }
        if (block.timestamp <= s_renterClaimDeadline) {
            revert RentalAgreement__RenterStillHasTime();
        }

        s_rentalState = State.CANCELLED;

        _transferNftFromEscrow(i_lender);

        uint256 refundAmount = getTotalRentalFeeWithCollateral();
        if (refundAmount > 0) {
            (bool success, ) = payable(s_renter).call{value: refundAmount}("");
            if (!success) revert RentalAgreement__PaymentFailed();
        }

        emit RentalCancelled("Renter failed to claim NFT before deadline.");
    }

    /////////////// --- LENDER-FACING FUNCTIONS --- ////////////////

    /**
     * @notice Lender deposits the NFT to escrow start the rental process.
     * @dev For collateral rentals, this makes the NFT available for the renter to claim.
     * Before calling, the lender MUST approve this contract to transfer the NFT.
     * For ERC721, call `approve(address(this), tokenId)` on the NFT contract.
     * For ERC1155, call `setApprovalForAll(address(this), true)` on the NFT contract.
     */
    function depositNFTByLender()
        external
        onlyLender
        inState(State.READY_TO_RELEASE)
        nonReentrant
    {
        if (block.timestamp > s_lenderDepositDeadline) {
            revert RentalAgreement__DeadlinePassed();
        }

        s_renterClaimDeadline = block.timestamp + getCustomDuration(i_dealDuration);

        if (i_nftStandard == RentalEnums.NftStandard.ERC721) {
            IERC721(i_nftContract).safeTransferFrom(i_lender, address(this), i_tokenId);
        } else if (i_nftStandard == RentalEnums.NftStandard.ERC1155) {
            IERC1155(i_nftContract).safeTransferFrom(i_lender, address(this), i_tokenId, 1, "");
        } else {
            revert RentalAgreement__CollateralRentalDoesNotSupportNFTType();
        }
        emit NftDepositedByLender(i_nftContract, i_tokenId);
    }

    /**
     * @notice Lender calls this to claim the NFT if the renter is unable to claim it on or before the deadline.
     * @dev Only available for collateral rentals.
     */
    function claimNFTWhenRenterUnableToClaim()
        external
        onlyLender
        inState(State.READY_TO_RELEASE)
        nonReentrant
    {
        if (s_renterClaimDeadline == 0) {
            revert RentalAgreement__NftNotInEscrow();
        }
        if (block.timestamp <= s_renterClaimDeadline) {
            revert RentalAgreement__RenterStillHasTime();
        }

        s_rentalState = State.CANCELLED;
        _transferNftFromEscrow(i_lender);

        uint256 refundAmount = getTotalRentalFeeWithCollateral();
        if (refundAmount > 0) {
            (bool success, ) = payable(s_renter).call{value: refundAmount}("");
            if (!success) revert RentalAgreement__PaymentFailed();
        }

        emit RentalCancelled("Renter failed to claim NFT before deadline.");
    }

    /**
     * @notice Lender calls this to claim collateral if renter defaults.
     */
    function claimCollateralWhenDefaulted() external onlyLender nonReentrant {
        if (
            s_rentalState != State.ACTIVE_RENTAL &&
            s_rentalState != State.DEFAULTED
        ) {
            revert RentalAgreement__InvalidStateForDefault();
        }

        if (s_rentalState == State.ACTIVE_RENTAL) {
            if (block.timestamp < s_returnDeadline) {
                revert RentalAgreement__RentalNotEnded();
            }

            s_rentalState = State.DEFAULTED;
            emit RentalDefaulted();
        }

        _distributePayouts();
        emit CollateralClaimed(i_lender, i_collateral);
    }

    /////////////// --- CANCELLATION FUNCTIONS --- ////////////////

    /**
     * @notice Renter calls this to reclaim funds if the lender does not deposit the NFT before the deadline.
     */
    function reclaimFundsOnLenderTimeout()
        external
        onlyRenter
        inState(State.READY_TO_RELEASE)
        nonReentrant
    {
        bool lenderTimedOut = s_renterClaimDeadline == 0 && block.timestamp > s_lenderDepositDeadline;

        if (!lenderTimedOut) {
            revert RentalAgreement__LenderStillHasTime();
        }

        s_rentalState = State.CANCELLED;

        emit RentalCancelled("Lender failed to deposit NFT before deadline.");

        uint256 refundAmount = getTotalRentalFeeWithCollateral();
        if (refundAmount > 0) {
            (bool success, ) = payable(s_renter).call{value: refundAmount}("");
            if (!success) revert RentalAgreement__PaymentFailed();
        }
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Internal helper to transfer the NFT from escrow to a specified recipient.
     * @param _to The address to receive the NFT.
     */
    function _transferNftFromEscrow(address _to) private {
        if (i_nftStandard == RentalEnums.NftStandard.ERC721) {
            IERC721(i_nftContract).safeTransferFrom(address(this), _to, i_tokenId);
        } else if (i_nftStandard == RentalEnums.NftStandard.ERC1155) {
            IERC1155(i_nftContract).safeTransferFrom(address(this), _to, i_tokenId, 1, "");
        } else {
            revert RentalAgreement__CollateralRentalDoesNotSupportNFTType();
        }
    }

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
        s_lenderDepositDeadline = block.timestamp + getCustomDuration(i_dealDuration);
        s_rentalState = State.READY_TO_RELEASE;

        emit RentalInitiated(s_renter);
    }

    /**
     * @dev Internal function to handle the distribution of all funds.
     * This function is called when a rental is completed or defaulted.
     * It handles the distribution of the rental fee to the lender and the platform,
     * and the collateral to the renter (on completion) or lender (on default).
     */
    function _distributePayouts() private {
        uint256 totalRentalFee = getTotalHourlyFee();
        uint256 platformFee = FeeCalculator.calculateFee(totalRentalFee, i_factoryContract.s_feeBps());
        uint256 lenderPayout = totalRentalFee - platformFee;

        if (s_rentalState == State.COMPLETED) {
            if (i_collateral > 0) {
                (bool success, ) = payable(s_renter).call{value: i_collateral}("");
                if (!success) revert RentalAgreement__PaymentFailed();
            }
        } else if (s_rentalState == State.DEFAULTED) {
            if (i_collateral > 0) {
                lenderPayout += i_collateral;
            }
        }

        if (lenderPayout > 0) {
            (bool success, ) = payable(i_lender).call{value: lenderPayout}("");
            if (!success) revert RentalAgreement__PaymentFailed();
        }
        if (platformFee > 0) {
            (bool success, ) = payable(address(i_factoryContract)).call{value: platformFee}("");
            if (!success) revert RentalAgreement__PaymentFailed();
        }

        emit PayoutsDistributed(
            i_lender,
            address(i_factoryContract),
            lenderPayout,
            platformFee
        );
    }

    /*//////////////////////////////////////////////////////////////
                        PURE FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev Converts DealDuration enum to a time value in seconds.
     * @param _duration The DealDuration enum member.
     * @return The duration in seconds.
     */
    function getCustomDuration(RentalEnums.DealDuration _duration)
        private
        pure
        returns (uint256)
    {
        if (_duration == RentalEnums.DealDuration.SIX_HOURS) {
            return 6 hours;
        }
        if (_duration == RentalEnums.DealDuration.TWELVE_HOURS) {
            return 12 hours;
        }
        if (_duration == RentalEnums.DealDuration.ONE_DAY) {
            return 1 days;
        }
        if (_duration == RentalEnums.DealDuration.THREE_DAYS) {
            return 3 days;
        }
        if (_duration == RentalEnums.DealDuration.ONE_WEEK) {
            return 1 weeks;
        }
        revert RentalAgreement__InvalidDealDuration();
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