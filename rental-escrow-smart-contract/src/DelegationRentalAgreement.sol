// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {IERC1155} from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import {ERC721Holder} from '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import {ERC1155Holder} from '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import {TimeConverter} from './utils/TimeConverter.sol';
import {LendrRentalSystem} from './LendrRentalSystem.sol';
import {FeeCalculator} from './utils/ComputePercentage.sol';
import {DelegationRegistry} from './DelegationRegistryERC1155ERC721.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {RentalEnums} from './libraries/RentalEnums.sol';

interface IERC4907 {
    // Logged when the user of an NFT is changed or expires is changed
    /// @notice Emitted when the `user` of an NFT or the `expires` of the `user` is changed
    /// The zero address for user indicates that there is no user address
    event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

    /// @notice set the user and expires of an NFT
    /// @dev The zero address indicates there is no user
    /// Throws if `tokenId` is not valid NFT
    /// @param user  The new user of the NFT
    /// @param expires  UNIX timestamp, The new user could use the NFT before expires
    function setUser(uint256 tokenId, address user, uint64 expires) external;

    /// @notice Get the user address of an NFT
    /// @dev The zero address indicates that there is no user or the user is expired
    /// @param tokenId The NFT to get the user address for
    /// @return The user address for this NFT
    function userOf(uint256 tokenId) external view returns(address);

    /// @notice Get the user expires of an NFT
    /// @dev The zero value indicates that there is no user
    /// @param tokenId The NFT to get the user expires for
    /// @return The user expires for this NFT
    function userExpires(uint256 tokenId) external view returns(uint256);

    /// @notice Get the owner of an NFT
    /// @dev The zero address indicates that there is no owner
    /// @param tokenId The NFT to get the owner for
    /// @return The owner of this NFT
    function ownerOf(uint256 tokenId) external view returns(address);
}

/**
 * @title DelegationRentalAgreement
 * @dev Manages the escrow and state for a single NFT DELEGATION rental.
 * This contract handles delegation-based rentals for ERC721, ERC1155, and ERC4907 NFTs.
 */
contract DelegationRentalAgreement is ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error RentalAgreement__InvalidState(State expected, State actual);
    error RentalAgreement__InvalidPayment();
    error RentalAgreement__RenterMustNotBeLender();
    error RentalAgreement__DurationCannotBeZero();
    error RentalAgreement__InvalidUser(address expected, address actual);
    error RentalAgreement__InvalidDealDuration();
    error RentalAgreement__PaymentFailed();
    error RentalAgreement__DelegationDeadlineNotPassed();
    error RentalAgreement__NoBreachDetected();
    error RentalAgreement__RentalNotOver();
    error RentalAgreement__InvalidNftStandard();
    error RentalAgreement__RentalIsOver();
    error RentalAgreement__NftNotDeposited();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event RentalInitiated(address indexed renter);
    event RentalStarted(uint256 endTime);
    event RentalCancelled();
    event PayoutsDistributed(
        address indexed lender,
        address indexed platform,
        uint256 lenderPayout,
        uint256 platformFee
    );

    /*//////////////////////////////////////////////////////////////
                            TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/
    // State enum is specific to this contract's lifecycle.
    enum State {
        LISTED,
        PENDING,
        ACTIVE_DELEGATION,
        COMPLETED,
        CANCELLED
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public immutable i_lender;
    address public immutable i_nftContract;
    uint256 public immutable i_tokenId;
    uint256 public immutable i_hourlyRentalFee;
    uint256 public immutable i_rentalDurationInHours;
    RentalEnums.NftStandard public immutable i_nftStandard;
    RentalEnums.DealDuration public immutable i_DealDuration;
    address public s_renter;
    State public s_rentalState;
    uint256 public s_rentalEndTime;
    uint256 public s_lenderDelegationDeadline;
    LendrRentalSystem public immutable i_factoryContract;
    DelegationRegistry public immutable i_delegationRegistry;
    uint256 public immutable i_platformFeeBps;

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
    constructor(
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _rentalDurationInHours,
        RentalEnums.NftStandard _nftStandard,
        RentalEnums.DealDuration _dealDuration,
        DelegationRegistry _delegationRegistry
    ) {
        if (_rentalDurationInHours == 0) {
            revert RentalAgreement__DurationCannotBeZero();
        }
        if (uint256(_dealDuration) >= uint256(RentalEnums.DealDuration._MAX)) {
            revert RentalAgreement__InvalidDealDuration();
        }
        i_lender = _lender;
        i_nftContract = _nftContract;
        i_tokenId = _tokenId;
        i_hourlyRentalFee = _hourlyRentalFee;
        i_rentalDurationInHours = _rentalDurationInHours;
        i_factoryContract = LendrRentalSystem(payable(msg.sender));
        i_delegationRegistry = _delegationRegistry;
        i_nftStandard = _nftStandard;
        i_DealDuration = _dealDuration;
        s_rentalState = State.LISTED;
        i_platformFeeBps = i_factoryContract.s_feeBps();
    }

    /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /////////////// --- RENTER-FACING FUNCTIONS --- ////////////////

    /**
     * @notice Renter calls this to initiate a delegation-based rental.
     * @dev Renter must send `totalRentalFee`.
     */
    function initiateDelegationRental() 
        external 
        payable 
        renterNotLender 
    {
        uint256 requiredPayment = getTotalHourlyFee();
        _initiateRental(requiredPayment);
    }

    /**
     * @notice Renter calls this to cancel the rental if the lender fails to delegate in time.
     * @dev Can only be called after the lender's delegation deadline has passed.
     * The renter will receive a full refund of the amount they paid.
     */
    function cancelDelegationRental()
        external
        onlyRenter
        inState(State.PENDING)
    {
        if (block.timestamp <= s_lenderDelegationDeadline) {
            revert RentalAgreement__DelegationDeadlineNotPassed();
        }

        uint256 refundAmount = getTotalHourlyFee();

        s_rentalState = State.CANCELLED;
        emit RentalCancelled();

        (bool success, ) = payable(s_renter).call{value: refundAmount}('');
        if (!success) {
            revert RentalAgreement__PaymentFailed();
        }
    }

    /**
     * @notice Renter calls this to cancel the rental if the lender breaches the agreement.
     * @dev Can only be called during an active delegation.
     * The renter will receive a full refund of the amount they paid.
     */
    function reportBreach()
        external
        onlyRenter
        inState(State.ACTIVE_DELEGATION)
        nonReentrant
    {
        if (i_nftStandard == RentalEnums.NftStandard.ERC4907) {
            if (IERC4907(i_nftContract).userOf(i_tokenId) == s_renter) {
                revert RentalAgreement__NoBreachDetected();
            }
        } else {
            if (i_delegationRegistry.userOf(i_nftContract, i_tokenId) == s_renter) {
                revert RentalAgreement__NoBreachDetected();
            }
        }
        if (block.timestamp >= s_rentalEndTime) {
            revert RentalAgreement__RentalIsOver();
        }

        s_rentalState = State.CANCELLED;
        uint256 refundAmount = getTotalHourlyFee();
        emit RentalCancelled();

        (bool success, ) = payable(s_renter).call{value: refundAmount}('');
        if (!success) {
            revert RentalAgreement__PaymentFailed();
        }
    }

    /////////////// --- LENDER-FACING FUNCTIONS --- ////////////////

    /**
     * @notice Lender calls this to activate delegation for the renter.
     * @dev This function's implementation will depend on the NFT standard.
     * For ERC4907, it would call `setUser`. For others, it might be an on-chain approval.
     */
    function activateDelegation() 
        external 
        onlyLender 
        inState(State.PENDING) 
    {
        if (i_nftStandard == RentalEnums.NftStandard.ERC4907) {
            if (IERC721(i_nftContract).ownerOf(i_tokenId) != i_lender) {
                revert RentalAgreement__InvalidUser(i_lender, IERC721(i_nftContract).ownerOf(i_tokenId));
            }
        } else { // For ERC721 and ERC1155 delegation
            if (i_delegationRegistry.originalOwnerOf(i_nftContract, i_tokenId) != i_lender) {
                revert RentalAgreement__NftNotDeposited();
            }
        }

        uint64 delegationExpiry = uint64(
            block.timestamp + TimeConverter.hoursToSeconds(i_rentalDurationInHours)
        );

        if (i_nftStandard == RentalEnums.NftStandard.ERC4907) {
            IERC4907(i_nftContract).setUser(
                i_tokenId,
                s_renter,
                delegationExpiry
            );
        } else {
            i_delegationRegistry.setDelegation(
                i_nftContract,
                i_tokenId,
                s_renter,
                delegationExpiry
            );
        }

        s_rentalEndTime = delegationExpiry;
        s_rentalState = State.ACTIVE_DELEGATION;
        emit RentalStarted(delegationExpiry);
    }

    /**
     * @notice Completes the rental after the duration has passed and pays the lender.
     * @dev Can be called by anyone after the rental period is over.
     * This function transfers the rental fee to the lender.
     */
    function completeDelegationRental() external inState(State.ACTIVE_DELEGATION) {
        if (block.timestamp < s_rentalEndTime) {
            revert RentalAgreement__RentalNotOver();
        }

        s_rentalState = State.COMPLETED;

        uint256 totalFee = getTotalHourlyFee();
        uint256 platformFee = FeeCalculator.calculateFee(totalFee, i_platformFeeBps);
        uint256 lenderPayout = totalFee - platformFee;

        if (i_nftStandard == RentalEnums.NftStandard.ERC4907) {
            IERC4907(i_nftContract).setUser(i_tokenId, address(0), 0);
        } else {
            i_delegationRegistry.revokeDelegation(i_nftContract, i_tokenId);
        }

        emit PayoutsDistributed(
            i_lender,
            address(i_factoryContract),
            lenderPayout,
            platformFee
        );

        if (lenderPayout > 0) {
            (bool success, ) = payable(i_lender).call{value: lenderPayout}("");
            if (!success) {
                revert RentalAgreement__PaymentFailed();
            }
        }
        if (platformFee > 0) {
            (bool success, ) = payable(address(i_factoryContract)).call{value: platformFee}("");
            if (!success) {
                revert RentalAgreement__PaymentFailed();
            }
        }
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
        s_lenderDelegationDeadline = block.timestamp + getCustomDuration(i_DealDuration);
        s_rentalState = State.PENDING;

        emit RentalInitiated(s_renter);
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

    function getTotalHourlyFee() public view returns (uint256) {
        return i_hourlyRentalFee * i_rentalDurationInHours;
    }
} 