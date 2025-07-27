// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721Receiver} from '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import {IERC1155Receiver} from '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {IERC1155} from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {RentalEnums} from './libraries/RentalEnums.sol';
import {TimeConverter} from './utils/TimeConverter.sol';
import {FeeSplitter} from './utils/FeeSplitter.sol';
import {LendrRentalSystem} from './LendrRentalSystem.sol';

interface IERC4907 {
    event UpdateUser(
        uint256 indexed tokenId,
        address indexed user,
        uint64 expires
    );

    function setUser(uint256 tokenId, address user, uint64 expires) external;

    function userOf(uint256 tokenId) external view returns (address);

    function userExpires(uint256 tokenId) external view returns (uint256);
}

/**
 * @title DelegationRegistry
 * @dev Manages NFT custody and delegation for non-ERC4907 assets.
 * This contract acts as a centralized escrow and registry for ERC721 and ERC1155 NFTs,
 * allowing rental agreements to manage usage rights without taking direct custody.
 * It also manages the entire lifecycle of delegation-based rentals.
 */
contract DelegationRegistry is
    IERC721Receiver,
    IERC1155Receiver,
    ReentrancyGuard
{
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error DelegationRegistry__NotAuthorized();
    error DelegationRegistry__NotOriginalOwner();
    error DelegationRegistry__ActiveDelegation();
    error DelegationRegistry__WithdrawalFailed();
    error DelegationRegistry__InvalidNftContract();
    error DelegationRegistry__InvalidAmount();
    error DelegationRegistry__InvalidState(State expected, State actual);
    error DelegationRegistry__InvalidPayment();
    error DelegationRegistry__RenterMustNotBeLender();
    error DelegationRegistry__DurationCannotBeZero();
    error DelegationRegistry__InvalidUser(address expected, address actual);
    error DelegationRegistry__InvalidDealDuration();
    error DelegationRegistry__PaymentFailed();
    error DelegationRegistry__DelegationDeadlineNotPassed();
    error DelegationRegistry__NoBreachDetected();
    error DelegationRegistry__RentalNotOver();
    error DelegationRegistry__InvalidNftStandard();
    error DelegationRegistry__RentalIsOver();
    error DelegationRegistry__NftNotDeposited();
    error DelegationRegistry__AgreementDoesNotExist();
    error DelegationRegistry__DeadlinePassed();
    error DelegationRegistry__DelegationRentalDoesNotSupportNFTType();
    error DelegationRegistry__NotOwner();
    error DelegationRegistry__NotFactory();
    error DelegationRegistry__FactoryAlreadySet();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event NftDeposited(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed owner
    );
    event NftWithdrawn(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed owner
    );
    event DelegationSet(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed user,
        uint64 expires
    );
    event DelegationRevoked(
        address indexed nftContract,
        uint256 indexed tokenId
    );
    event AuthorizationSet(address indexed newAuthorizedAddress);
    event AuthorizationRemoved(address indexed removedAuthorizedAddress);
    event RentalInitiated(uint256 indexed rentalId, address indexed renter);
    event RentalStarted(uint256 indexed rentalId, uint256 endTime);
    event PayoutsDistributed(
        uint256 indexed rentalId,
        address indexed lender,
        address indexed platform,
        uint256 lenderPayout,
        uint256 platformFee
    );
    event StateChanged(uint256 indexed rentalId, State oldState, State newState);
    event NftDepositedByLender(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed owner
    );

    /*//////////////////////////////////////////////////////////////
                            TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/

    struct Delegation {
        address user;
        uint64 expires;
    }

    enum State {
        LISTED,
        PENDING,
        ACTIVE_DELEGATION,
        COMPLETED,
        CANCELLED
    }

    struct RentalAgreement {
        address lender;
        address nftContract;
        uint256 tokenId;
        uint256 hourlyRentalFee;
        uint256 rentalDurationInHours;
        RentalEnums.NftStandard nftStandard;
        RentalEnums.DealDuration dealDuration;
        address renter;
        State rentalState;
        uint256 rentalEndTime;
        uint256 lenderDelegationDeadline;
        uint256 platformFeeBps;
        address factoryAddress;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    mapping(address => mapping(uint256 => Delegation)) private _delegations;
    mapping(address => mapping(uint256 => address)) public originalOwnerOf;
    address public i_owner;
    mapping(address => bool) public isAuthorized;
    mapping(address => RentalEnums.NftStandard) public nftStandard;
    mapping(uint256 => RentalAgreement) public rentalAgreements;

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyAuthorized() {
        if (!isAuthorized[msg.sender]) {
            revert DelegationRegistry__NotAuthorized();
        }
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert DelegationRegistry__NotOwner();
        }
        _;
    }

    modifier renterNotLender(uint256 rentalId) {
        if (msg.sender == rentalAgreements[rentalId].lender) {
            revert DelegationRegistry__RenterMustNotBeLender();
        }
        _;
    }

    modifier inState(uint256 rentalId, State _expected) {
        if (rentalAgreements[rentalId].rentalState != _expected) {
            revert DelegationRegistry__InvalidState(
                _expected,
                rentalAgreements[rentalId].rentalState
            );
        }
        _;
    }

    modifier onlyRenter(uint256 rentalId) {
        if (msg.sender != rentalAgreements[rentalId].renter) {
            revert DelegationRegistry__InvalidUser(
                rentalAgreements[rentalId].renter,
                msg.sender
            );
        }
        _;
    }

    modifier agreementExists(uint256 _rentalId) {
        if (rentalAgreements[_rentalId].lender == address(0)) {
            revert DelegationRegistry__AgreementDoesNotExist();
        }
        _;
    }

    modifier onlyLender(uint256 rentalId) {
        if (msg.sender != rentalAgreements[rentalId].lender) {
            revert DelegationRegistry__InvalidUser(
                rentalAgreements[rentalId].lender,
                msg.sender
            );
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor() {
        i_owner = msg.sender;
    }

    /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets the factory contract address. Can only be called once by the owner.
     */
    function addAuthorized(address _factoryAddress) external onlyOwner {
        isAuthorized[_factoryAddress] = true;
        emit AuthorizationSet(_factoryAddress);
    }

    /**
     * @notice Removes authorization from a contract.
     */
    function removeAuthorized(address _factoryAddress) external onlyOwner {
        isAuthorized[_factoryAddress] = false;
    }

    /**
     * @notice Creates a new delegation rental agreement.
     * @dev Called by LendrRentalSystem.
     */
    function createRentalAgreement(
        uint256 rentalId,
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _rentalDurationInHours,
        RentalEnums.NftStandard _nftStandard,
        RentalEnums.DealDuration _dealDuration
    ) external onlyAuthorized {
        if (_rentalDurationInHours == 0) {
            revert DelegationRegistry__DurationCannotBeZero();
        }
        if (
            uint256(_dealDuration) >= uint256(RentalEnums.DealDuration._MAX)
        ) {
            revert DelegationRegistry__InvalidDealDuration();
        }

        RentalAgreement storage agreement = rentalAgreements[rentalId];
        agreement.lender = _lender;
        agreement.nftContract = _nftContract;
        agreement.tokenId = _tokenId;
        agreement.hourlyRentalFee = _hourlyRentalFee;
        agreement.rentalDurationInHours = _rentalDurationInHours;
        agreement.nftStandard = _nftStandard;
        agreement.dealDuration = _dealDuration;
        agreement.rentalState = State.LISTED;
        agreement.platformFeeBps = LendrRentalSystem(payable(msg.sender)).s_feeBps();
        agreement.factoryAddress = msg.sender;
    }

    /////////////// --- RENTER-FACING FUNCTIONS --- ////////////////

    /**
     * @notice Renter calls this to initiate a delegation-based rental.
     * @dev Renter must send `totalRentalFee`.
     */
    function initiateDelegationRental(uint256 rentalId)
        external
        payable
        renterNotLender(rentalId)
        inState(rentalId, State.LISTED)
    {
        uint256 requiredPayment = getTotalHourlyFee(rentalId);
        _initiateRental(rentalId, requiredPayment);
    }

    /**
     * @notice Renter calls this to cancel the rental if the lender fails to delegate in time.
     * @dev Can only be called after the lender's delegation deadline has passed.
     * The renter will receive a full refund of the amount they paid.
     */
    function cancelDelegationRental(uint256 rentalId)
        external
        onlyRenter(rentalId)
        inState(rentalId, State.PENDING)
    {
        RentalAgreement storage agreement = rentalAgreements[rentalId];
        if (block.timestamp <= agreement.lenderDelegationDeadline) {
            revert DelegationRegistry__DelegationDeadlineNotPassed();
        }

        uint256 refundAmount = getTotalHourlyFee(rentalId);

        agreement.rentalState = State.CANCELLED;
        emit StateChanged(
            rentalId,
            State.PENDING,
            State.CANCELLED
        );

        (bool success, ) = payable(agreement.renter).call{
            value: refundAmount
        }("");
        if (!success) {
            revert DelegationRegistry__PaymentFailed();
        }
    }

    /**
     * @notice Renter calls this to cancel the rental if the lender breaches the agreement.
     * @dev Can only be called during an active delegation.
     * The renter will receive a full refund of the amount they paid.
     */
    function reportBreach(uint256 rentalId)
        external
        onlyRenter(rentalId)
        inState(rentalId, State.ACTIVE_DELEGATION)
        nonReentrant
    {
        RentalAgreement storage agreement = rentalAgreements[rentalId];
        if (agreement.nftStandard == RentalEnums.NftStandard.ERC4907) {
            if (
                IERC4907(agreement.nftContract).userOf(agreement.tokenId) ==
                agreement.renter
            ) {
                revert DelegationRegistry__NoBreachDetected();
            }
        } else {
            if (
                userOf(agreement.nftContract, agreement.tokenId) ==
                agreement.renter
            ) {
                revert DelegationRegistry__NoBreachDetected();
            }
        }
        if (block.timestamp >= agreement.rentalEndTime) {
            revert DelegationRegistry__RentalIsOver();
        }

        State oldState = agreement.rentalState;
        agreement.rentalState = State.CANCELLED;
        uint256 refundAmount = getTotalHourlyFee(rentalId);
        emit StateChanged(rentalId, oldState, State.CANCELLED);

        (bool success, ) = payable(agreement.renter).call{
            value: refundAmount
        }("");
        if (!success) {
            revert DelegationRegistry__PaymentFailed();
        }
    }

    /////////////// --- LENDER-FACING FUNCTIONS --- ////////////////

    /**
     * @notice Allows a user to deposit an NFT they own into the escrow.
     * @dev This function requires the user to have approved the DelegationRegistry contract
     * to transfer the NFT on their behalf. It supports both ERC721 and ERC1155 standards.
     * The function determines the NFT standard, verifies ownership, and then transfers the NFT.
     * Upon successful transfer, the corresponding ERC receiver hook (`onERC721Received` or `onERC1155Received`)
     * is triggered, which records the deposit details.
     */
     function depositNFTtoEscrow(address contractAddress, uint256 tokenId) external {
        IERC165 nftContract = IERC165(contractAddress);

        if (nftContract.supportsInterface(type(IERC721).interfaceId)) {
            if (IERC721(contractAddress).ownerOf(tokenId) != msg.sender) {
                revert DelegationRegistry__NotOriginalOwner();
            }
            IERC721(contractAddress).safeTransferFrom(msg.sender, address(this), tokenId);
        } else if (nftContract.supportsInterface(type(IERC1155).interfaceId)) {
            if (IERC1155(contractAddress).balanceOf(msg.sender, tokenId) < 1) {
                revert DelegationRegistry__NotOriginalOwner();
            }
            IERC1155(contractAddress).safeTransferFrom(msg.sender, address(this), tokenId, 1, "");
        } else {
            revert DelegationRegistry__InvalidNftContract();
        }
    }

    /**
     * @notice Lender calls this to activate delegation for the renter.
     * @dev This function's implementation will depend on the NFT standard.
     * For ERC4907, it would call `setUser`. For others, it might be an on-chain approval.
     */
    function activateDelegation(uint256 rentalId)
        external
        onlyLender(rentalId)
        inState(rentalId, State.PENDING)
    {
        RentalAgreement storage agreement = rentalAgreements[rentalId];
        if (agreement.nftStandard == RentalEnums.NftStandard.ERC4907) {
            if (
                IERC721(agreement.nftContract).ownerOf(agreement.tokenId) !=
                agreement.lender
            ) {
                revert DelegationRegistry__InvalidUser(
                    agreement.lender,
                    IERC721(agreement.nftContract).ownerOf(agreement.tokenId)
                );
            }
        } else {
            if (
                originalOwnerOf[agreement.nftContract][agreement.tokenId] !=
                agreement.lender
            ) {
                revert DelegationRegistry__NftNotDeposited();
            }
        }

        uint64 delegationExpiry = uint64(
            block.timestamp +
                TimeConverter.hoursToSeconds(agreement.rentalDurationInHours)
        );

        if (agreement.nftStandard == RentalEnums.NftStandard.ERC4907) {
            IERC4907(agreement.nftContract).setUser(
                agreement.tokenId,
                agreement.renter,
                delegationExpiry
            );
        } else {
            _setDelegation(
                agreement.nftContract,
                agreement.tokenId,
                agreement.renter,
                delegationExpiry
            );
        }

        agreement.rentalEndTime = delegationExpiry;
        State oldState = agreement.rentalState;
        agreement.rentalState = State.ACTIVE_DELEGATION;
        emit StateChanged(rentalId, oldState, State.ACTIVE_DELEGATION);
        emit RentalStarted(rentalId, delegationExpiry);
    }

    /**
     * @notice Lender deposits the NFT to escrow to start the rental process.
     * @dev For delegation rentals, this makes the NFT available for the renter to claim.
     * Before calling, the lender MUST approve this contract to transfer the NFT.
     * For ERC721, call `approve(address(this), tokenId)` on the NFT contract.
     * For ERC1155, call `setApprovalForAll(address(this), true)` on the NFT contract.
     */
     function depositNFTByLender(uint256 _rentalId)
        external
        agreementExists(_rentalId)
        onlyLender(_rentalId)
        inState(_rentalId, State.PENDING)
        nonReentrant
    {
        RentalAgreement storage agreement = rentalAgreements[_rentalId];
        if (block.timestamp > agreement.lenderDelegationDeadline) {
            revert DelegationRegistry__DeadlinePassed();
        }

        if (agreement.nftStandard == RentalEnums.NftStandard.ERC721) {
            IERC721(agreement.nftContract).safeTransferFrom(
                agreement.lender,
                address(this),
                agreement.tokenId
            );
        } else if (agreement.nftStandard == RentalEnums.NftStandard.ERC1155) {
            IERC1155(agreement.nftContract).safeTransferFrom(
                agreement.lender,
                address(this),
                agreement.tokenId,
                1,
                ''
            );
        } else {
            revert DelegationRegistry__DelegationRentalDoesNotSupportNFTType();
        }
        emit NftDepositedByLender(
            agreement.nftContract,
            agreement.tokenId,
            agreement.lender
        );
    }

    /**
     * @notice Completes the rental after the duration has passed and pays the lender.
     * @dev Can be called by anyone after the rental period is over.
     * This function transfers the rental fee to the lender.
     */
    function completeDelegationRental(uint256 rentalId)
        external
        inState(rentalId, State.ACTIVE_DELEGATION)
        nonReentrant
    {
        RentalAgreement storage agreement = rentalAgreements[rentalId];
        if (block.timestamp < agreement.rentalEndTime) {
            revert DelegationRegistry__RentalNotOver();
        }

        State oldState = agreement.rentalState;
        agreement.rentalState = State.COMPLETED;
        emit StateChanged(rentalId, oldState, State.COMPLETED);

        uint256 totalFee = getTotalHourlyFee(rentalId);
        (uint256 lenderPayout, uint256 platformFee) = FeeSplitter.splitFee(totalFee, agreement.platformFeeBps);

        if (agreement.nftStandard == RentalEnums.NftStandard.ERC4907) {
            IERC4907(agreement.nftContract).setUser(
                agreement.tokenId,
                address(0),
                0
            );
        } else {
            _revokeDelegation(agreement.nftContract, agreement.tokenId);
        }

        emit PayoutsDistributed(
            rentalId,
            agreement.lender,
            agreement.factoryAddress,
            lenderPayout,
            platformFee
        );

        if (lenderPayout > 0) {
            (bool success, ) = payable(agreement.lender).call{
                value: lenderPayout
            }("");
            if (!success) {
                revert DelegationRegistry__PaymentFailed();
            }
        }
        if (platformFee > 0) {
            (bool success, ) = payable(agreement.factoryAddress).call{value: platformFee}("");
            if (!success) {
                revert DelegationRegistry__PaymentFailed();
            }
        }
    }

    /**
     * @notice Removes authorization from a contract.
     * @dev Can only be called by the factory contract that deployed this registry.
     * @param addressToRemove The address to de-authorize.
     */
    function removeAuthorized(address addressToRemove) external onlyOwner {
        isAuthorized[addressToRemove] = false;
        emit AuthorizationRemoved(addressToRemove);
    }

    /**
     * @notice Sets or updates the delegation for a given NFT.
     * @dev Can only be called by an authorized contract.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     * @param user The address of the user to delegate to.
     * @param expires The UNIX timestamp when the delegation expires.
     */
    function setDelegation(
        address nftContract,
        uint256 tokenId,
        address user,
        uint64 expires
    ) external onlyAuthorized {
        _setDelegation(nftContract, tokenId, user, expires);
    }

    /**
     * @notice Revokes the delegation for a given NFT.
     * @dev Can only be called by an authorized contract.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     */
    function revokeDelegation(address nftContract, uint256 tokenId)
        external
        onlyAuthorized
    {
        _revokeDelegation(nftContract, tokenId);
    }

    /**
     * @notice Allows the original owner to withdraw their NFT from the registry.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     */
    function withdrawNft(address nftContract, uint256 tokenId)
        external
        nonReentrant
    {
        address originalOwner = originalOwnerOf[nftContract][tokenId];
        if (msg.sender != originalOwner) {
            revert DelegationRegistry__NotOriginalOwner();
        }
        if (userOf(nftContract, tokenId) != address(0)) {
            revert DelegationRegistry__ActiveDelegation();
        }

        delete originalOwnerOf[nftContract][tokenId];
        emit NftWithdrawn(nftContract, tokenId, originalOwner);

        RentalEnums.NftStandard standard = nftStandard[nftContract];
        if (standard == RentalEnums.NftStandard.ERC721) {
            IERC721(nftContract).safeTransferFrom(
                address(this),
                originalOwner,
                tokenId
            );
        } else if (standard == RentalEnums.NftStandard.ERC1155) {
            IERC1155(nftContract).safeTransferFrom(
                address(this),
                originalOwner,
                tokenId,
                1,
                ""
            );
        } else {
            revert DelegationRegistry__WithdrawalFailed();
        }
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _initiateRental(uint256 rentalId, uint256 _requiredPayment)
        private
    {
        if (msg.value != _requiredPayment) {
            revert DelegationRegistry__InvalidPayment();
        }
        RentalAgreement storage agreement = rentalAgreements[rentalId];
        agreement.renter = msg.sender;
        agreement.lenderDelegationDeadline =
            block.timestamp +
            getCustomDuration(agreement.dealDuration);
        State oldState = agreement.rentalState;
        agreement.rentalState = State.PENDING;

        emit RentalInitiated(rentalId, agreement.renter);
        emit StateChanged(rentalId, oldState, State.PENDING);
    }

    function _setDelegation(
        address nftContract,
        uint256 tokenId,
        address user,
        uint64 expires
    ) internal {
        _delegations[nftContract][tokenId] = Delegation(user, expires);
        emit DelegationSet(nftContract, tokenId, user, expires);
    }

    function _revokeDelegation(address nftContract, uint256 tokenId) internal {
        delete _delegations[nftContract][tokenId];
        emit DelegationRevoked(nftContract, tokenId);
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
        revert DelegationRegistry__InvalidDealDuration();
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function getTotalHourlyFee(uint256 rentalId)
        public
        view
        returns (uint256)
    {
        RentalAgreement storage agreement = rentalAgreements[rentalId];
        return agreement.hourlyRentalFee * agreement.rentalDurationInHours;
    }

    function getRentalAgreement(uint256 rentalId)
        public
        view
        returns (RentalAgreement memory)
    {
        return rentalAgreements[rentalId];
    }

    /**
     * @notice Gets the user of an NFT if a valid delegation exists.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     * @return The address of the user if the delegation is active, otherwise address(0).
     */
    function userOf(address nftContract, uint256 tokenId)
        public
        view
        returns (address)
    {
        Delegation storage delegation = _delegations[nftContract][tokenId];
        if (block.timestamp < delegation.expires) {
            return delegation.user;
        }
        return address(0);
    }

    /**
     * @notice Gets the expiration timestamp of a delegation.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     * @return The expiration timestamp.
     */
    function userExpires(address nftContract, uint256 tokenId)
        public
        view
        returns (uint256)
    {
        return _delegations[nftContract][tokenId].expires;
    }

    function getDelegation(address nftContract, uint256 tokenId)
        public
        view
        returns (Delegation memory)
    {
        return _delegations[nftContract][tokenId];
    }

    /*//////////////////////////////////////////////////////////////
                        ERC RECEIVER HOOKS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Handles the receipt of an ERC721 token.
     */
    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        nftStandard[msg.sender] = RentalEnums.NftStandard.ERC721;
        originalOwnerOf[msg.sender][tokenId] = from;
        emit NftDeposited(msg.sender, tokenId, from);
        return this.onERC721Received.selector;
    }

    /**
     * @notice Handles the receipt of an ERC1155 token.
     */
    function onERC1155Received(
        address,
        address from,
        uint256 id,
        uint256 amount,
        bytes calldata
    ) external override returns (bytes4) {
        if (amount != 1) {
            revert DelegationRegistry__InvalidAmount();
        }
        nftStandard[msg.sender] = RentalEnums.NftStandard.ERC1155;
        originalOwnerOf[msg.sender][id] = from;
        emit NftDeposited(msg.sender, id, from);
        return this.onERC1155Received.selector;
    }

    /**
     * @notice Handles the receipt of multiple ERC1155 tokens.
     * @dev Not supported for this rental system's logic.
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        revert("Batch deposit not supported");
    }

    /**
     * @notice Checks if the contract supports an interface.
     * @param interfaceId The interface identifier.
     * @return bool True if the interface is supported, false otherwise.
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override
        returns (bool)
    {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
} 