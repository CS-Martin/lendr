// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {IERC1155} from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import {ERC721Holder} from '@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol';
import {ERC1155Holder} from '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import {ReentrancyGuard} from '@openzeppelin/contracts/utils/ReentrancyGuard.sol';
import {LendrRentalSystem} from './LendrRentalSystem.sol';
import {RentalEnums} from './libraries/RentalEnums.sol';
import {FeeSplitter} from './utils/FeeSplitter.sol';

/**
 * @title CollateralRegistry
 * @dev Manages the escrow and state for all collateral-based NFT rentals.
 * This contract handles collateral-based rentals, supporting both ERC721 and ERC1155 NFTs,
 * without deploying a new contract for each rental.
 */
contract CollateralRegistry is ERC721Holder, ERC1155Holder, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error CollateralRegistry__InvalidState(State expected, State actual);
    error CollateralRegistry__InvalidPayment();
    error CollateralRegistry__RenterMustNotBeLender();
    error CollateralRegistry__InvalidUser(address expected, address actual);
    error CollateralRegistry__NftNotInEscrow();
    error CollateralRegistry__CollateralRentalDoesNotSupportNFTType();
    error CollateralRegistry__RentalNotEnded();
    error CollateralRegistry__InvalidDealDuration();
    error CollateralRegistry__InvalidStateForDefault();
    error CollateralRegistry__PaymentFailed();
    error CollateralRegistry__DeadlinePassed();
    error CollateralRegistry__LenderStillHasTime();
    error CollateralRegistry__RenterStillHasTime();
    error CollateralRegistry__ReturnDeadlineMissed();
    error CollateralRegistry__NotOwner();
    error CollateralRegistry__AgreementAlreadyExists();
    error CollateralRegistry__AgreementDoesNotExist();
    error CollateralRegistry__NftStandardNotSupported();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event RentalInitiated(uint256 indexed rentalId, address indexed renter);
    event NftDepositedByLender(
        uint256 indexed rentalId,
        address indexed nftContract,
        uint256 tokenId
    );
    event NftReleasedToRenter(uint256 indexed rentalId);
    event NftReturnedByRenter(
        uint256 indexed rentalId,
        address indexed renter,
        address indexed lender,
        uint256 tokenId
    );
    event RentalStarted(uint256 indexed rentalId, uint256 endTime);
    event CollateralClaimed(
        uint256 indexed rentalId,
        address indexed lender,
        uint256 amount
    );
    event PayoutsDistributed(
        uint256 indexed rentalId,
        address indexed lender,
        address indexed platform,
        uint256 lenderPayout,
        uint256 platformFee
    );
    event StateChanged(uint256 indexed rentalId, State oldState, State newState);

    /*//////////////////////////////////////////////////////////////
                            TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/
    enum State {
        LISTED,
        READY_TO_RELEASE,
        ACTIVE_RENTAL,
        COMPLETED,
        DEFAULTED,
        CANCELLED
    }

    struct CollateralAgreement {
        address lender;
        address nftContract;
        uint256 tokenId;
        uint256 hourlyRentalFee;
        uint256 collateral;
        uint256 rentalDurationInHours;
        RentalEnums.NftStandard nftStandard;
        RentalEnums.DealDuration dealDuration;
        address renter;
        State rentalState;
        uint256 rentalEndTime;
        uint256 lenderDepositDeadline;
        uint256 returnDeadline;
        uint256 renterClaimDeadline;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public i_owner;
    LendrRentalSystem public i_factoryContract;
    mapping(uint256 => CollateralAgreement) public s_agreements;

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert CollateralRegistry__NotOwner();
        }
        _;
    }

    modifier onlyRenter(uint256 _rentalId) {
        if (msg.sender != s_agreements[_rentalId].renter) {
            revert CollateralRegistry__InvalidUser(
                s_agreements[_rentalId].renter,
                msg.sender
            );
        }
        _;
    }

    modifier onlyLender(uint256 _rentalId) {
        if (msg.sender != s_agreements[_rentalId].lender) {
            revert CollateralRegistry__InvalidUser(
                s_agreements[_rentalId].lender,
                msg.sender
            );
        }
        _;
    }

    modifier inState(uint256 _rentalId, State _expected) {
        if (s_agreements[_rentalId].rentalState != _expected) {
            revert CollateralRegistry__InvalidState(
                _expected,
                s_agreements[_rentalId].rentalState
            );
        }
        _;
    }

    modifier renterNotLender(uint256 _rentalId) {
        if (msg.sender == s_agreements[_rentalId].lender) {
            revert CollateralRegistry__RenterMustNotBeLender();
        }
        _;
    }

    modifier agreementExists(uint256 _rentalId) {
        if (s_agreements[_rentalId].lender == address(0)) {
            revert CollateralRegistry__AgreementDoesNotExist();
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
     * @param _factoryAddress The address of the LendrRentalSystem factory contract.
     */
    function setFactory(address _factoryAddress) external onlyOwner {
        require(
            address(i_factoryContract) == address(0),
            "Factory already set"
        );
        i_factoryContract = LendrRentalSystem(payable(_factoryAddress));
    }

    /**
     * @notice Creates a new rental agreement, called by LendrRentalSystem.
     */
    function createAgreement(
        uint256 _rentalId,
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _collateral,
        uint256 _rentalDurationInHours,
        RentalEnums.NftStandard _nftStandard,
        RentalEnums.DealDuration _dealDuration
    ) external onlyOwner {
        if (s_agreements[_rentalId].lender != address(0)) {
            revert CollateralRegistry__AgreementAlreadyExists();
        }
        if (_nftStandard == RentalEnums.NftStandard.ERC4907) {
            revert CollateralRegistry__CollateralRentalDoesNotSupportNFTType();
        }
        if (uint256(_dealDuration) >= uint256(RentalEnums.DealDuration._MAX)) {
            revert CollateralRegistry__InvalidDealDuration();
        }

        s_agreements[_rentalId] = CollateralAgreement({
            lender: _lender,
            nftContract: _nftContract,
            tokenId: _tokenId,
            hourlyRentalFee: _hourlyRentalFee,
            collateral: _collateral,
            rentalDurationInHours: _rentalDurationInHours,
            nftStandard: _nftStandard,
            dealDuration: _dealDuration,
            renter: address(0),
            rentalState: State.LISTED,
            rentalEndTime: 0,
            lenderDepositDeadline: 0,
            returnDeadline: 0,
            renterClaimDeadline: 0
        });
    }

    /////////////// --- RENTER-FACING FUNCTIONS --- ////////////////
    /**
     * @notice Renter calls this to initiate a collateral-based rental.
     * @dev Renter must send `totalRentalFee` + `collateral`.
     */
    function initiateRental(uint256 _rentalId)
        external
        payable
        agreementExists(_rentalId)
        renterNotLender(_rentalId)
        inState(_rentalId, State.LISTED)
    {
        CollateralAgreement storage agreement = s_agreements[_rentalId];

        uint256 requiredPayment = getTotalRentalFeeWithCollateral(_rentalId);
        if (msg.value != requiredPayment) {
            revert CollateralRegistry__InvalidPayment();
        }

        agreement.renter = msg.sender;
        agreement.lenderDepositDeadline =
            block.timestamp +
            getCustomDuration(agreement.dealDuration);
        State oldState = agreement.rentalState;
        agreement.rentalState = State.READY_TO_RELEASE;
        emit StateChanged(_rentalId, oldState, State.READY_TO_RELEASE);

        emit RentalInitiated(_rentalId, agreement.renter);
    }

    /**
     * @notice Renter calls this to receive the NFT from escrow.
     * @dev Only available for collateral-based rentals.
     * @dev Uses TimeConverter to convert hours to seconds.
     */
    function releaseNFTToRenter(uint256 _rentalId)
        external
        agreementExists(_rentalId)
        onlyRenter(_rentalId)
        inState(_rentalId, State.READY_TO_RELEASE)
    {
        CollateralAgreement storage agreement = s_agreements[_rentalId];

        if (agreement.renterClaimDeadline == 0) {
            revert CollateralRegistry__NftNotInEscrow();
        }
        if (block.timestamp > agreement.renterClaimDeadline) {
            revert CollateralRegistry__DeadlinePassed();
        }

        _validateNftInEscrow(
            agreement.nftContract,
            agreement.tokenId,
            agreement.nftStandard
        );

        State oldState = agreement.rentalState;
        agreement.rentalState = State.ACTIVE_RENTAL;
        emit StateChanged(_rentalId, oldState, State.ACTIVE_RENTAL);
        agreement.rentalEndTime =
            block.timestamp +
            (agreement.rentalDurationInHours * 1 hours);
        agreement.returnDeadline =
            agreement.rentalEndTime +
            getCustomDuration(agreement.dealDuration);

        _transferNftFromEscrow(
            agreement.renter,
            agreement.nftContract,
            agreement.tokenId,
            agreement.nftStandard
        );

        emit NftReleasedToRenter(_rentalId);
        emit RentalStarted(_rentalId, agreement.rentalEndTime);
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
    function returnNFTToLender(uint256 _rentalId)
        external
        agreementExists(_rentalId)
        onlyRenter(_rentalId)
        inState(_rentalId, State.ACTIVE_RENTAL)
        nonReentrant
    {
        CollateralAgreement storage agreement = s_agreements[_rentalId];
        State oldState = agreement.rentalState;

        if (block.timestamp > agreement.returnDeadline) {
            agreement.rentalState = State.DEFAULTED;
            emit StateChanged(_rentalId, oldState, State.DEFAULTED);
            revert CollateralRegistry__ReturnDeadlineMissed();
        }

        agreement.rentalState = State.COMPLETED;
        emit StateChanged(_rentalId, oldState, State.COMPLETED);

        _distributePayouts(_rentalId);

        if (agreement.nftStandard == RentalEnums.NftStandard.ERC721) {
            IERC721(agreement.nftContract).safeTransferFrom(
                agreement.renter,
                agreement.lender,
                agreement.tokenId
            );
        } else if (agreement.nftStandard == RentalEnums.NftStandard.ERC1155) {
            IERC1155(agreement.nftContract).safeTransferFrom(
                agreement.renter,
                agreement.lender,
                agreement.tokenId,
                1,
                ''
            );
        }

        emit NftReturnedByRenter(
            _rentalId,
            agreement.renter,
            agreement.lender,
            agreement.tokenId
        );
    }

    /**
     * @notice Renter calls this to cancel the rental if they failed to claim the NFT in time.
     * @dev This refunds the renter and returns the NFT to the lender.
     */
    function cancelRentalAfterClaimTimeout(uint256 _rentalId)
        external
        agreementExists(_rentalId)
        onlyRenter(_rentalId)
        inState(_rentalId, State.READY_TO_RELEASE)
        nonReentrant
    {
        CollateralAgreement storage agreement = s_agreements[_rentalId];
        if (agreement.renterClaimDeadline == 0) {
            revert CollateralRegistry__NftNotInEscrow();
        }
        if (block.timestamp <= agreement.renterClaimDeadline) {
            revert CollateralRegistry__RenterStillHasTime();
        }

        State oldState = agreement.rentalState;
        agreement.rentalState = State.CANCELLED;
        emit StateChanged(_rentalId, oldState, State.CANCELLED);

        _transferNftFromEscrow(
            agreement.lender,
            agreement.nftContract,
            agreement.tokenId,
            agreement.nftStandard
        );

        uint256 refundAmount = getTotalRentalFeeWithCollateral(_rentalId);
        if (refundAmount > 0) {
            (bool success, ) = payable(agreement.renter).call{
                value: refundAmount
            }('');
            if (!success) revert CollateralRegistry__PaymentFailed();
        }
    }

    /////////////// --- LENDER-FACING FUNCTIONS --- ////////////////
    /**
     * @notice Lender deposits the NFT to escrow start the rental process.
     * @dev For collateral rentals, this makes the NFT available for the renter to claim.
     * Before calling, the lender MUST approve this contract to transfer the NFT.
     * For ERC721, call `approve(address(this), tokenId)` on the NFT contract.
     * For ERC1155, call `setApprovalForAll(address(this), true)` on the NFT contract.
     */
    function depositNFTByLender(uint256 _rentalId)
        external
        agreementExists(_rentalId)
        onlyLender(_rentalId)
        inState(_rentalId, State.READY_TO_RELEASE)
        nonReentrant
    {
        CollateralAgreement storage agreement = s_agreements[_rentalId];
        if (block.timestamp > agreement.lenderDepositDeadline) {
            revert CollateralRegistry__DeadlinePassed();
        }

        agreement.renterClaimDeadline =
            block.timestamp +
            getCustomDuration(agreement.dealDuration);

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
            revert CollateralRegistry__CollateralRentalDoesNotSupportNFTType();
        }
        emit NftDepositedByLender(
            _rentalId,
            agreement.nftContract,
            agreement.tokenId
        );
    }

    /**
     * @notice Lender calls this to claim the NFT if the renter is unable to claim it on or before the deadline.
     * @dev Only available for collateral rentals.
     */
    function claimNFTWhenRenterUnableToClaim(uint256 _rentalId)
        external
        agreementExists(_rentalId)
        onlyLender(_rentalId)
        inState(_rentalId, State.READY_TO_RELEASE)
        nonReentrant
    {
        CollateralAgreement storage agreement = s_agreements[_rentalId];
        if (agreement.renterClaimDeadline == 0) {
            revert CollateralRegistry__NftNotInEscrow();
        }
        if (block.timestamp <= agreement.renterClaimDeadline) {
            revert CollateralRegistry__RenterStillHasTime();
        }

        State oldState = agreement.rentalState;
        agreement.rentalState = State.CANCELLED;
        emit StateChanged(_rentalId, oldState, State.CANCELLED);
        _transferNftFromEscrow(
            agreement.lender,
            agreement.nftContract,
            agreement.tokenId,
            agreement.nftStandard
        );

        uint256 refundAmount = getTotalRentalFeeWithCollateral(_rentalId);
        if (refundAmount > 0) {
            (bool success, ) = payable(agreement.renter).call{
                value: refundAmount
            }('');
            if (!success) revert CollateralRegistry__PaymentFailed();
        }
    }

    /**
     * @notice Lender calls this to claim collateral if renter defaults.
     */
    function claimCollateralWhenDefaulted(uint256 _rentalId)
        external
        agreementExists(_rentalId)
        onlyLender(_rentalId)
        nonReentrant
    {
        CollateralAgreement storage agreement = s_agreements[_rentalId];
        if (
            agreement.rentalState != State.ACTIVE_RENTAL &&
            agreement.rentalState != State.DEFAULTED
        ) {
            revert CollateralRegistry__InvalidStateForDefault();
        }

        if (agreement.rentalState == State.ACTIVE_RENTAL) {
            if (block.timestamp < agreement.returnDeadline) {
                revert CollateralRegistry__RentalNotEnded();
            }

            State oldState = agreement.rentalState;
            agreement.rentalState = State.DEFAULTED;
            emit StateChanged(_rentalId, oldState, State.DEFAULTED);
        }

        _distributePayouts(_rentalId);
        emit CollateralClaimed(_rentalId, agreement.lender, agreement.collateral);
    }

    /////////////// --- CANCELLATION FUNCTIONS --- ////////////////

    /**
     * @notice Renter calls this to reclaim funds if the lender does not deposit the NFT before the deadline.
     */
    function reclaimFundsOnLenderTimeout(uint256 _rentalId)
        external
        agreementExists(_rentalId)
        onlyRenter(_rentalId)
        inState(_rentalId, State.READY_TO_RELEASE)
        nonReentrant
    {
        CollateralAgreement storage agreement = s_agreements[_rentalId];
        bool lenderTimedOut = agreement.renterClaimDeadline == 0 &&
            block.timestamp > agreement.lenderDepositDeadline;

        if (!lenderTimedOut) {
            revert CollateralRegistry__LenderStillHasTime();
        }

        State oldState = agreement.rentalState;
        agreement.rentalState = State.CANCELLED;
        emit StateChanged(_rentalId, oldState, State.CANCELLED);

        uint256 refundAmount = getTotalRentalFeeWithCollateral(_rentalId);
        if (refundAmount > 0) {
            (bool success, ) = payable(agreement.renter).call{
                value: refundAmount
            }('');
            if (!success) revert CollateralRegistry__PaymentFailed();
        }
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @dev Internal helper to validate that the NFT is in escrow.
     */
    function _validateNftInEscrow(
        address _nftContract,
        uint256 _tokenId,
        RentalEnums.NftStandard _nftStandard
    ) internal view {
        if (_nftStandard == RentalEnums.NftStandard.ERC721) {
            if (IERC721(_nftContract).ownerOf(_tokenId) != address(this)) {
                revert CollateralRegistry__NftNotInEscrow();
            }
        } else if (_nftStandard == RentalEnums.NftStandard.ERC1155) {
            if (
                IERC1155(_nftContract).balanceOf(address(this), _tokenId) != 1
            ) {
                revert CollateralRegistry__NftNotInEscrow();
            }
        } else {
            revert CollateralRegistry__CollateralRentalDoesNotSupportNFTType();
        }
    }

    /**
     * @dev Internal helper to transfer the NFT from escrow to a specified recipient.
     */
    function _transferNftFromEscrow(
        address _to,
        address _nftContract,
        uint256 _tokenId,
        RentalEnums.NftStandard _nftStandard
    ) private {
        if (_nftStandard == RentalEnums.NftStandard.ERC721) {
            IERC721(_nftContract).safeTransferFrom(
                address(this),
                _to,
                _tokenId
            );
        } else if (_nftStandard == RentalEnums.NftStandard.ERC1155) {
            IERC1155(_nftContract).safeTransferFrom(
                address(this),
                _to,
                _tokenId,
                1,
                ''
            );
        } else {
            revert CollateralRegistry__CollateralRentalDoesNotSupportNFTType();
        }
    }

    /**
     * @dev Internal helper to distribute payouts to the lender and platform.
     */
    function _distributePayouts(uint256 _rentalId) private {
        CollateralAgreement storage agreement = s_agreements[_rentalId];
        uint256 totalRentalFee = getTotalHourlyFee(_rentalId);
        (uint256 lenderPayout, uint256 platformFee) = FeeSplitter.splitFee(
            totalRentalFee,
            i_factoryContract.s_feeBps()
        );

        if (agreement.rentalState == State.COMPLETED) {
            if (agreement.collateral > 0) {
                (bool success, ) = payable(agreement.renter).call{
                    value: agreement.collateral
                }('');
                if (!success) revert CollateralRegistry__PaymentFailed();
            }
        } else if (agreement.rentalState == State.DEFAULTED) {
            if (agreement.collateral > 0) {
                lenderPayout += agreement.collateral;
            }
        }

        if (lenderPayout > 0) {
            (bool success, ) = payable(agreement.lender).call{
                value: lenderPayout
            }('');
            if (!success) revert CollateralRegistry__PaymentFailed();
        }
        if (platformFee > 0) {
            (bool success, ) = payable(address(i_factoryContract)).call{
                value: platformFee
            }('');
            if (!success) revert CollateralRegistry__PaymentFailed();
        }

        emit PayoutsDistributed(
            _rentalId,
            agreement.lender,
            address(i_factoryContract),
            lenderPayout,
            platformFee
        );
    }

    /*//////////////////////////////////////////////////////////////
                        PURE FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev Internal helper to convert deal duration to seconds.
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
        revert CollateralRegistry__InvalidDealDuration();
    }

    /*//////////////////////////////////////////////////////////////
                        GETTER FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @dev Public getter to get the total hourly fee for a rental.
     */
    function getTotalHourlyFee(uint256 _rentalId)
        public
        view
        returns (uint256)
    {
        return
            s_agreements[_rentalId].hourlyRentalFee *
            s_agreements[_rentalId].rentalDurationInHours;
    }

    /**
     * @dev Public getter to get the total rental fee with collateral for a rental.
     */
    function getTotalRentalFeeWithCollateral(uint256 _rentalId)
        public
        view
        returns (uint256)
    {
        return
            getTotalHourlyFee(_rentalId) + s_agreements[_rentalId].collateral;
    }
}
