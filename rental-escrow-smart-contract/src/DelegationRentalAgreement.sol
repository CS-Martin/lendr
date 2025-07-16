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
 * @title DelegationRentalAgreement
 * @dev Manages the escrow and state for a single NFT DELEGATION rental.
 * This contract handles delegation-based rentals for ERC721, ERC1155, and ERC4907 NFTs.
 */
contract DelegationRentalAgreement is ERC721Holder, ERC1155Holder {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error RentalAgreement__InvalidState(State expected, State actual);
    error RentalAgreement__InvalidPayment();
    error RentalAgreement__RenterMustNotBeLender();
    error RentalAgreement__DurationCannotBeZero();
    error RentalAgreement__InvalidUser(address expected, address actual);

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event RentalInitiated(address indexed renter);
    event NftDepositedByLender(
        address indexed nftContract,
        uint256 indexed tokenId
    );
    event RentalStarted(uint256 endTime);
    event RentalCompleted();
    event RentalCancelled(string reason);
    event PayoutsDistributed(
        address indexed lender,
        address indexed platform,
        uint256 lenderPayout,
        uint256 platformFee
    );

    /*//////////////////////////////////////////////////////////////
                            TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/
    // Enums duplicated for blueprint simplicity. Will be refactored into a shared library later.
    enum State {
        LISTED,
        PENDING,
        READY_TO_DELEGATE, // Awaiting delegation activation
        ACTIVE_DELEGATION,
        COMPLETED,
        CANCELLED
    }

    enum NftStandard {
        ERC721,
        ERC1155,
        ERC4907,
        _MAX
    }

    enum DealDuration {
        ONE_DAY,
        THREE_DAYS,
        ONE_WEEK,
        _MAX
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public immutable i_lender;
    address public immutable i_nftContract;
    uint256 public immutable i_tokenId;
    uint256 public immutable i_hourlyRentalFee;
    uint256 public immutable i_rentalDurationInHours;
    NftStandard public immutable i_nftStandard;
    DealDuration public immutable i_DealDuration;
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
    constructor(
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _rentalDurationInHours,
        NftStandard _nftStandard,
        DealDuration _dealDuration
    ) {
        if (_rentalDurationInHours == 0) {
            revert RentalAgreement__DurationCannotBeZero();
        }
        // Specific checks for delegation can be added here
        // e.g., if (_nftStandard != NftStandard.ERC4907) { ... }

        i_lender = _lender;
        i_nftContract = _nftContract;
        i_tokenId = _tokenId;
        i_hourlyRentalFee = _hourlyRentalFee;
        i_rentalDurationInHours = _rentalDurationInHours;
        i_nftStandard = _nftStandard;
        i_DealDuration = _dealDuration;
        s_rentalState = State.LISTED;
    }

    /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Renter calls this to initiate a delegation-based rental.
     * @dev Renter must send `totalRentalFee`.
     */
    function initiateDelegationRental() external payable renterNotLender {
        uint256 requiredPayment = getTotalHourlyFee();
        _initiateRental(requiredPayment);
    }

    /**
     * @notice Lender calls this to activate delegation for the renter.
     * @dev This function's implementation will depend on the NFT standard.
     * For ERC4907, it would call `setUser`. For others, it might be an on-chain approval.
     */
    function activateDelegation() external {
        // TODO: Implement delegation activation logic
        // This should only be callable by the lender.
        // It should set the state to ACTIVE_DELEGATION and emit RentalStarted.
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _initiateRental(uint256 _requiredPayment)
        private
        inState(State.LISTED)
    {
        if (msg.value != _requiredPayment) {
            revert RentalAgreement__InvalidPayment();
        }

        s_renter = msg.sender;

        if (i_DealDuration == DealDuration.ONE_DAY) {
            s_lenderDepositDeadline = block.timestamp + 1 days;
        } else if (
            i_DealDuration == DealDuration.THREE_DAYS
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

    function getTotalHourlyFee() public view returns (uint256) {
        return i_hourlyRentalFee * i_rentalDurationInHours;
    }
} 