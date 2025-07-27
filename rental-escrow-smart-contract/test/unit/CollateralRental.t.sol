// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from 'forge-std/Test.sol';
import {CollateralRegistry} from '../../src/CollateralRegistry.sol';
import {LendrRentalSystem} from '../../src/LendrRentalSystem.sol';
import {RentalEnums} from '../../src/libraries/RentalEnums.sol';
import {ERC721Mock} from '../mocks/ERC721Mock.sol';
import {ERC1155Mock} from '../mocks/ERC1155Mock.sol';
import {Attacker} from '../mocks/Attacker.sol';

/// @title CollateralRentalBaseTest
/// @notice This abstract contract serves as the base for all collateral rental system tests.
/// It sets up the testing environment, including deploying contracts, creating users,
/// and preparing a default rental agreement. It also provides internal helper functions
/// for common test arrangement scenarios.
abstract contract CollateralRentalBaseTest is Test {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    LendrRentalSystem internal lendrRentalSystem;
    CollateralRegistry internal collateralRegistry;
    ERC721Mock internal mockERC721;
    ERC1155Mock internal mockERC1155;

    // Users
    address internal deployer = makeAddr('deployer');
    address internal lender = makeAddr('lender');
    address internal renter = makeAddr('renter');
    address internal thirdParty = makeAddr('thirdParty');

    // NFT details
    uint256 internal constant TOKEN_ID = 1;
    uint256 internal rentalId;

    // Rental terms
    uint256 internal constant HOURLY_RENTAL_FEE = 1 ether;
    uint256 internal constant RENTAL_DURATION_IN_HOURS = 24;
    uint256 internal constant COLLATERAL_AMOUNT = 5 ether;

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/
    /// @notice Sets up the initial state for each test.
    function setUp() public virtual {
        // Deploy LendrRentalSystem
        vm.startPrank(deployer);
        lendrRentalSystem = new LendrRentalSystem(500); // 5% fee
        collateralRegistry = lendrRentalSystem.i_collateralRegistry();
        vm.stopPrank();

        // Deploy and setup ERC721 mock
        mockERC721 = new ERC721Mock('MockNFT', 'MNFT');
        mockERC721.mint(lender, TOKEN_ID);

        // Deploy and setup ERC1155 mock
        mockERC1155 = new ERC1155Mock('');
        mockERC1155.mint(lender, TOKEN_ID, 1, '');

        // Create a collateral rental agreement for an ERC721 token
        vm.startPrank(lender);
        lendrRentalSystem.createCollateralRentalAgreement(
            lender,
            address(mockERC721),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            COLLATERAL_AMOUNT,
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC721,
            RentalEnums.DealDuration.ONE_DAY
        );
        rentalId = lendrRentalSystem.s_totalRentals();
        vm.stopPrank();

        // Approve the rental contract to manage the lender's NFT
        vm.startPrank(lender);
        mockERC721.setApprovalForAll(address(collateralRegistry), true);
        mockERC1155.setApprovalForAll(address(collateralRegistry), true);
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Initiates a rental agreement by the renter.
    function _givenRentalInitiated() internal {
        uint256 totalPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(rentalId);
        vm.deal(renter, totalPayment);

        vm.startPrank(renter);
        collateralRegistry.initiateRental{value: totalPayment}(rentalId);
        vm.stopPrank();
    }

    /// @notice Deposits the NFT by the lender after the rental is initiated.
    function _givenNftDeposited() internal {
        _givenRentalInitiated();
        vm.startPrank(lender);
        collateralRegistry.depositNFTByLender(rentalId);
        vm.stopPrank();
    }

    /// @notice Releases the NFT to the renter after it has been deposited.
    function _givenNftReleasedToRenter() internal {
        _givenNftDeposited();
        vm.startPrank(renter);
        collateralRegistry.releaseNFTToRenter(rentalId);
        vm.stopPrank();
    }
}

/// @title HappyPathTest
/// @notice Tests the primary success scenarios and the "happy path" of the rental lifecycle.
contract HappyPathTest is CollateralRentalBaseTest {
    function test_initiateRental_successfully() public {
        // Arrange
        uint256 totalPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(rentalId);
        vm.deal(renter, totalPayment);

        // Act
        vm.startPrank(renter);
        collateralRegistry.initiateRental{value: totalPayment}(rentalId);
        vm.stopPrank();

        // Assert
        (
            ,,,,,,,,
            address renterAddress,
            CollateralRegistry.State rentalState,
            ,
            ,
            ,
            ,
            ,
        ) = collateralRegistry.s_agreements(rentalId);
        assertEq(
            uint(rentalState),
            uint(CollateralRegistry.State.READY_TO_RELEASE),
            'Rental state should be READY_TO_RELEASE'
        );
        assertEq(renterAddress, renter, 'Renter address should be set');
        assertEq(
            address(collateralRegistry).balance,
            totalPayment,
            'Contract balance should match total payment'
        );
    }

    function test_depositNFTByLender_successfully() public {
        // Arrange
        _givenRentalInitiated(); // Ensure rental is initiated

        // Act
        vm.startPrank(lender);
        collateralRegistry.depositNFTByLender(rentalId);
        vm.stopPrank();

        // Assert
        assertEq(
            mockERC721.ownerOf(TOKEN_ID),
            address(collateralRegistry),
            'NFT should be in escrow'
        );
        (,,,,,,,,,,,,, uint256 renterClaimDeadline,,) = collateralRegistry
            .s_agreements(rentalId);
        assertTrue(
            renterClaimDeadline > 0,
            'Renter claim deadline should be set'
        );
    }

    function test_releaseNFTToRenter_successfully() public {
        // Arrange
        _givenNftDeposited(); // Ensure NFT is in escrow

        // Act
        vm.startPrank(renter);
        collateralRegistry.releaseNFTToRenter(rentalId);
        vm.stopPrank();

        // Assert
        (
            ,,,,,,,,,
            CollateralRegistry.State rentalState,
            uint256 rentalEndTime,
            ,
            uint256 returnDeadline,
            ,
            ,
        ) = collateralRegistry.s_agreements(rentalId);
        assertEq(
            uint(rentalState),
            uint(CollateralRegistry.State.ACTIVE_RENTAL),
            'Rental state should be ACTIVE_RENTAL'
        );
        assertEq(
            mockERC721.ownerOf(TOKEN_ID),
            renter,
            'Renter should own the NFT'
        );
        assertTrue(rentalEndTime > 0, 'Rental end time should be set');
        assertTrue(returnDeadline > 0, 'Return deadline should be set');
    }

    function test_returnNFTToLender_successfully() public {
        // Arrange
        _givenNftReleasedToRenter(); // Ensure rental is active
        vm.startPrank(renter);
        mockERC721.setApprovalForAll(address(collateralRegistry), true);
        vm.stopPrank();

        uint256 lenderInitialBalance = lender.balance;
        uint256 renterInitialBalance = renter.balance;
        uint256 factoryInitialBalance = address(lendrRentalSystem).balance;

        // Act
        vm.startPrank(renter);
        collateralRegistry.returnNFTToLender(rentalId);
        vm.stopPrank();

        // Assert
        (,,,,,,,,, CollateralRegistry.State rentalState,,,,,,) = collateralRegistry
            .s_agreements(rentalId);
        assertEq(
            uint(rentalState),
            uint(CollateralRegistry.State.COMPLETED),
            'Rental state should be COMPLETED'
        );
        assertEq(
            mockERC721.ownerOf(TOKEN_ID),
            lender,
            'Lender should own the NFT again'
        );

        // Check payouts
        uint256 totalRentalFee = collateralRegistry.getTotalHourlyFee(rentalId);
        uint256 platformFee = (totalRentalFee * 500) / 10000;
        uint256 lenderPayout = totalRentalFee - platformFee;

        assertEq(
            lender.balance,
            lenderInitialBalance + lenderPayout,
            'Lender payout is incorrect'
        );
        assertEq(
            renter.balance,
            renterInitialBalance + COLLATERAL_AMOUNT,
            'Renter should get collateral back'
        );
        assertEq(
            address(lendrRentalSystem).balance,
            factoryInitialBalance + platformFee,
            'Platform fee is incorrect'
        );
    }

    function test_erc1155_rental_happy_path() public {
        // Arrange
        vm.startPrank(lender);
        lendrRentalSystem.createCollateralRentalAgreement(
            lender,
            address(mockERC1155),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            COLLATERAL_AMOUNT,
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC1155,
            RentalEnums.DealDuration.ONE_DAY
        );
        uint256 erc1155RentalId = lendrRentalSystem.s_totalRentals();
        vm.stopPrank();

        vm.startPrank(lender);
        mockERC1155.setApprovalForAll(address(collateralRegistry), true);
        vm.stopPrank();

        uint256 totalPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(erc1155RentalId);
        vm.deal(renter, totalPayment);

        // Act 1: Initiate Rental
        vm.startPrank(renter);
        collateralRegistry.initiateRental{value: totalPayment}(erc1155RentalId);
        vm.stopPrank();

        // Act 2: Deposit NFT
        vm.startPrank(lender);
        collateralRegistry.depositNFTByLender(erc1155RentalId);
        vm.stopPrank();

        // Act 3: Release NFT
        vm.startPrank(renter);
        collateralRegistry.releaseNFTToRenter(erc1155RentalId);
        vm.stopPrank();

        // Act 4: Return NFT
        vm.startPrank(renter);
        mockERC1155.setApprovalForAll(address(collateralRegistry), true);
        collateralRegistry.returnNFTToLender(erc1155RentalId);
        vm.stopPrank();

        // Assert
        (,,,,,,,,, CollateralRegistry.State rentalState,,,,,,) = collateralRegistry
            .s_agreements(erc1155RentalId);
        assertEq(
            uint(rentalState),
            uint(CollateralRegistry.State.COMPLETED),
            'ERC1155 rental should be COMPLETED'
        );
        assertEq(
            mockERC1155.balanceOf(lender, TOKEN_ID),
            1, // Lender gets their token back
            'Lender should have the ERC1155 token back'
        );
    }
}

/// @title FailureModesTest
/// @notice Tests various failure modes, revert conditions, and invalid inputs.
contract FailureModesTest is CollateralRentalBaseTest {
    function test_initiateRental_reverts_if_payment_is_incorrect() public {
        // Arrange
        uint256 incorrectPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(rentalId) - 1;
        vm.deal(renter, incorrectPayment);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__InvalidPayment.selector
        );
        collateralRegistry.initiateRental{value: incorrectPayment}(rentalId);
        vm.stopPrank();
    }

    function test_initiateRental_reverts_if_renter_is_lender() public {
        // Arrange
        uint256 totalPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(rentalId);
        vm.deal(lender, totalPayment);

        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__RenterMustNotBeLender
                .selector
        );
        collateralRegistry.initiateRental{value: totalPayment}(rentalId);
        vm.stopPrank();
    }

    function test_initiateRental_reverts_if_already_initiated() public {
        // Arrange
        _givenRentalInitiated(); // First initiation
        uint256 totalPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(rentalId);
        vm.deal(renter, totalPayment);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            abi.encodeWithSelector(
                CollateralRegistry.CollateralRegistry__InvalidState.selector,
                CollateralRegistry.State.LISTED,
                CollateralRegistry.State.READY_TO_RELEASE
            )
        );
        collateralRegistry.initiateRental{value: totalPayment}(rentalId);
        vm.stopPrank();
    }

    function test_releaseNFTToRenter_reverts_if_not_in_escrow() public {
        // Arrange
        _givenRentalInitiated(); // Rental initiated, but NFT not deposited

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__NftNotInEscrow.selector
        );
        collateralRegistry.releaseNFTToRenter(rentalId);
        vm.stopPrank();
    }

    function test_constructor_reverts_if_duration_is_zero() public {
        vm.startPrank(lender);
        vm.expectRevert(
            LendrRentalSystem
                .LendrRentalSystem__RentalDurationMustBeGreaterThanZero.selector
        );
        lendrRentalSystem.createCollateralRentalAgreement(
            lender,
            address(mockERC721),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            COLLATERAL_AMOUNT,
            0, // Zero duration
            RentalEnums.NftStandard.ERC721,
            RentalEnums.DealDuration.ONE_DAY
        );
        vm.stopPrank();
    }

    function test_constructor_reverts_if_collateral_is_zero() public {
        vm.startPrank(lender);
        vm.expectRevert(
            LendrRentalSystem
                .LendrRentalSystem__CollateralMustBeGreaterThanZero.selector
        );
        lendrRentalSystem.createCollateralRentalAgreement(
            lender,
            address(mockERC721),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            0, // Zero collateral
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC721,
            RentalEnums.DealDuration.ONE_DAY
        );
        vm.stopPrank();
    }

    function test_constructor_reverts_if_nftStandard_is_ERC4907() public {
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRegistry
                .CollateralRegistry__CollateralRentalDoesNotSupportNFTType
                .selector
        );
        lendrRentalSystem.createCollateralRentalAgreement(
            lender,
            address(mockERC721),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            COLLATERAL_AMOUNT,
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC4907, // Unsupported type
            RentalEnums.DealDuration.ONE_DAY
        );
        vm.stopPrank();
    }

    function test_constructor_reverts_if_dealDuration_is_invalid() public {
        vm.startPrank(lender);
        vm.expectRevert(
            LendrRentalSystem.LendrRentalSystem__InvalidDepositDeadline.selector
        );
        lendrRentalSystem.createCollateralRentalAgreement(
            lender,
            address(mockERC721),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            COLLATERAL_AMOUNT,
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC721,
            RentalEnums.DealDuration._MAX // Invalid duration
        );
        vm.stopPrank();
    }

    function test_claimCollateralWhenDefaulted_reverts_if_invalid_state()
        public
    {
        // Arrange - rental is in LISTED state, not ACTIVE or DEFAULTED
        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__InvalidStateForDefault
                .selector
        );
        collateralRegistry.claimCollateralWhenDefaulted(rentalId);
        vm.stopPrank();
    }
}

/// @title TimeoutsAndDefaultsTest
/// @notice Tests scenarios related to deadlines, timeouts, and rental defaults.
contract TimeoutsAndDefaultsTest is CollateralRentalBaseTest {
    function test_claimCollateralWhenDefaulted_successfully() public {
        // Arrange
        _givenNftReleasedToRenter(); // Ensure rental is active

        uint256 lenderInitialBalance = lender.balance;
        uint256 factoryInitialBalance = address(lendrRentalSystem).balance;

        // Warp time to after the return deadline
        (,,,,,,,,,,,, uint256 returnDeadline,,,) = collateralRegistry
            .s_agreements(rentalId);
        vm.warp(returnDeadline + 1);

        // Act
        vm.startPrank(lender);
        collateralRegistry.claimCollateralWhenDefaulted(rentalId);
        vm.stopPrank();

        // Assert
        (,,,,,,,,, CollateralRegistry.State rentalState,,,,,,) = collateralRegistry
            .s_agreements(rentalId);
        assertEq(
            uint(rentalState),
            uint(CollateralRegistry.State.DEFAULTED),
            'Rental state should be DEFAULTED'
        );

        // Check payouts
        uint256 totalRentalFee = collateralRegistry.getTotalHourlyFee(rentalId);
        uint256 platformFee = (totalRentalFee * 500) / 10000;
        uint256 lenderPayout = totalRentalFee -
            platformFee +
            COLLATERAL_AMOUNT;

        assertEq(
            lender.balance,
            lenderInitialBalance + lenderPayout,
            'Lender should receive collateral and rental fee'
        );
        assertEq(
            address(lendrRentalSystem).balance,
            factoryInitialBalance + platformFee,
            'Platform fee is incorrect'
        );
    }

    function test_reclaimFundsOnLenderTimeout_successfully() public {
        // Arrange
        _givenRentalInitiated(); // Ensure rental is initiated

        uint256 renterInitialBalance = renter.balance;
        uint256 totalPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(rentalId);

        // Warp time to after the lender deposit deadline
        (
            ,,,,,,,,,,,
            uint256 lenderDepositDeadline,,,,
        ) = collateralRegistry.s_agreements(rentalId);
        vm.warp(lenderDepositDeadline + 1);

        // Act
        vm.startPrank(renter);
        collateralRegistry.reclaimFundsOnLenderTimeout(rentalId);
        vm.stopPrank();

        // Assert
        (,,,,,,,,, CollateralRegistry.State rentalState,,,,,,) = collateralRegistry
            .s_agreements(rentalId);
        assertEq(
            uint(rentalState),
            uint(CollateralRegistry.State.CANCELLED),
            'Rental state should be CANCELLED'
        );
        assertEq(
            renter.balance,
            renterInitialBalance + totalPayment,
            'Renter should be refunded'
        );
    }

    function test_cancelRentalAfterClaimTimeout_successfully() public {
        // Arrange
        _givenNftDeposited(); // Ensure NFT is in escrow

        uint256 renterInitialBalance = renter.balance;
        uint256 totalPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(rentalId);

        // Warp time to after the renter claim deadline
        (,,,,,,,,,,,,, uint256 renterClaimDeadline,,) = collateralRegistry
            .s_agreements(rentalId);
        vm.warp(renterClaimDeadline + 1);

        // Act
        vm.startPrank(renter);
        collateralRegistry.cancelRentalAfterClaimTimeout(rentalId);
        vm.stopPrank();

        // Assert
        (,,,,,,,,, CollateralRegistry.State rentalState,,,,,,) = collateralRegistry
            .s_agreements(rentalId);
        assertEq(
            uint(rentalState),
            uint(CollateralRegistry.State.CANCELLED),
            'Rental state should be CANCELLED'
        );
        assertEq(
            mockERC721.ownerOf(TOKEN_ID),
            lender,
            'Lender should get the NFT back'
        );
        assertEq(
            renter.balance,
            renterInitialBalance + totalPayment,
            'Renter should be refunded'
        );
    }

    function test_claimNFTWhenRenterUnableToClaim_reverts_if_renter_has_time()
        public
    {
        // Arrange
        _givenNftDeposited();

        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__RenterStillHasTime.selector
        );
        collateralRegistry.claimNFTWhenRenterUnableToClaim(rentalId);
        vm.stopPrank();
    }

    function test_lender_can_reclaim_nft_if_renter_times_out() public {
        // Arrange
        _givenNftDeposited();
        (,,,,,,,,,,,,, uint256 renterClaimDeadline,,) = collateralRegistry
            .s_agreements(rentalId);
        vm.warp(renterClaimDeadline + 1);

        // Act
        vm.startPrank(lender);
        collateralRegistry.claimNFTWhenRenterUnableToClaim(rentalId);
        vm.stopPrank();

        // Assert
        (,,,,,,,,, CollateralRegistry.State rentalState,,,,,,) = collateralRegistry
            .s_agreements(rentalId);
        assertEq(
            uint(rentalState),
            uint(CollateralRegistry.State.CANCELLED),
            'Rental should be CANCELLED'
        );
        assertEq(
            mockERC721.ownerOf(TOKEN_ID),
            lender,
            'Lender should have the NFT back'
        );
    }

    function test_depositNFTByLender_reverts_if_deadline_passed() public {
        // Arrange
        _givenRentalInitiated();
        (,,,,,,,,,,, uint256 lenderDepositDeadline,,,,) = collateralRegistry
            .s_agreements(rentalId);
        vm.warp(lenderDepositDeadline + 1);

        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__DeadlinePassed.selector
        );
        collateralRegistry.depositNFTByLender(rentalId);
        vm.stopPrank();
    }

    function test_releaseNFTToRenter_reverts_if_deadline_passed() public {
        // Arrange
        _givenNftDeposited();
        (,,,,,,,,,,,,, uint256 renterClaimDeadline,,) = collateralRegistry
            .s_agreements(rentalId);
        vm.warp(renterClaimDeadline + 1);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__DeadlinePassed.selector
        );
        collateralRegistry.releaseNFTToRenter(rentalId);
        vm.stopPrank();
    }

    function test_returnNFTToLender_reverts_if_deadline_missed() public {
        // Arrange
        _givenNftReleasedToRenter();
        (,,,,,,,,,,,, uint256 returnDeadline,,,) = collateralRegistry
            .s_agreements(rentalId);
        vm.warp(returnDeadline + 1);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__ReturnDeadlineMissed.selector
        );
        collateralRegistry.returnNFTToLender(rentalId);
        vm.stopPrank();
    }

    function test_claimCollateralWhenDefaulted_reverts_if_not_ended() public {
        // Arrange
        _givenNftReleasedToRenter();

        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__RentalNotEnded.selector
        );
        collateralRegistry.claimCollateralWhenDefaulted(rentalId);
        vm.stopPrank();
    }

    function test_reclaimFundsOnLenderTimeout_reverts_if_lender_has_time()
        public
    {
        // Arrange
        _givenRentalInitiated();

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__LenderStillHasTime.selector
        );
        collateralRegistry.reclaimFundsOnLenderTimeout(rentalId);
        vm.stopPrank();
    }

    function test_cancelRentalAfterClaimTimeout_reverts_if_renter_has_time()
        public
    {
        // Arrange
        _givenNftDeposited();

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__RenterStillHasTime.selector
        );
        collateralRegistry.cancelRentalAfterClaimTimeout(rentalId);
        vm.stopPrank();
    }
}

/// @title SecurityTest
/// @notice Contains security-related tests, such as reentrancy and access control.
contract SecurityTest is CollateralRentalBaseTest {
    function test_reentrancy_attack_on_returnNFTToLender() public {
        // Arrange
        vm.startPrank(lender);
        lendrRentalSystem.createCollateralRentalAgreement(
            lender,
            address(mockERC721),
            TOKEN_ID + 1, // Use a new token ID
            HOURLY_RENTAL_FEE,
            COLLATERAL_AMOUNT,
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC721,
            RentalEnums.DealDuration.ONE_DAY
        );
        uint256 newRentalId = lendrRentalSystem.s_totalRentals();
        vm.stopPrank();

        Attacker attacker = new Attacker(address(collateralRegistry));
        address attackerAddress = address(attacker);
        attacker.setRentalId(newRentalId);

        mockERC721.mint(lender, TOKEN_ID + 1);
        vm.startPrank(lender);
        mockERC721.setApprovalForAll(address(collateralRegistry), true);
        vm.stopPrank();

        uint256 totalPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(newRentalId);
        vm.deal(attackerAddress, totalPayment);

        vm.startPrank(attackerAddress);
        collateralRegistry.initiateRental{value: totalPayment}(newRentalId);
        vm.stopPrank();

        vm.startPrank(lender);
        collateralRegistry.depositNFTByLender(newRentalId);
        vm.stopPrank();

        vm.startPrank(attackerAddress);
        collateralRegistry.releaseNFTToRenter(newRentalId);
        mockERC721.setApprovalForAll(address(collateralRegistry), true);
        vm.stopPrank();

        // Act & Assert
        vm.startPrank(attackerAddress);
        vm.expectRevert(); // Expect a revert due to reentrancy guard
        attacker.attack();
        vm.stopPrank();
    }

    function test_onlyLender_modifier_prevents_third_party_deposit() public {
        // Arrange
        _givenRentalInitiated();

        // Act & Assert
        vm.startPrank(thirdParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                CollateralRegistry.CollateralRegistry__InvalidUser.selector,
                lender,
                thirdParty
            )
        );
        collateralRegistry.depositNFTByLender(rentalId);
        vm.stopPrank();
    }

    function test_onlyRenter_modifier_prevents_third_party_return() public {
        // Arrange
        _givenNftReleasedToRenter();

        // Act & Assert
        vm.startPrank(thirdParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                CollateralRegistry.CollateralRegistry__InvalidUser.selector,
                renter,
                thirdParty
            )
        );
        collateralRegistry.returnNFTToLender(rentalId);
        vm.stopPrank();
    }
}

/// @title EdgeCasesTest
/// @notice Covers various edge cases, such as fee calculations with low values.
contract EdgeCasesTest is CollateralRentalBaseTest {
    /*//////////////////////////////////////////////////////////////
                            EDGE CASE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_platform_fee_with_low_rental_rates() public {
        _executeFeeTest(1, 2);
        _executeFeeTest(8, 3);
        _executeFeeTestWithDuration(1, 1, 4);
        _executeFeeTestWithDuration(20, 1, 5);
    }

    function _executeFeeTest(uint256 hourlyFee, uint256 tokenId) internal {
        _executeFeeTestWithDuration(
            hourlyFee,
            RENTAL_DURATION_IN_HOURS,
            tokenId
        );
    }

    function _executeFeeTestWithDuration(
        uint256 hourlyFee,
        uint256 duration,
        uint256 tokenId
    ) internal {
        // Arrange
        mockERC721.mint(lender, tokenId);

        vm.startPrank(lender);
        lendrRentalSystem.createCollateralRentalAgreement(
            lender,
            address(mockERC721),
            tokenId,
            hourlyFee,
            COLLATERAL_AMOUNT,
            duration,
            RentalEnums.NftStandard.ERC721,
            RentalEnums.DealDuration.ONE_DAY
        );
        uint256 newRentalId = lendrRentalSystem.s_totalRentals();
        vm.stopPrank();

        vm.startPrank(lender);
        mockERC721.setApprovalForAll(address(collateralRegistry), true);
        vm.stopPrank();

        uint256 totalPayment = collateralRegistry
            .getTotalRentalFeeWithCollateral(newRentalId);
        vm.deal(renter, totalPayment);

        vm.startPrank(renter);
        collateralRegistry.initiateRental{value: totalPayment}(newRentalId);
        vm.stopPrank();

        vm.startPrank(lender);
        collateralRegistry.depositNFTByLender(newRentalId);
        vm.stopPrank();

        vm.startPrank(renter);
        collateralRegistry.releaseNFTToRenter(newRentalId);
        vm.stopPrank();

        vm.startPrank(renter);
        mockERC721.setApprovalForAll(address(collateralRegistry), true);
        vm.stopPrank();

        uint256 lenderInitialBalance = lender.balance;
        uint256 factoryInitialBalance = address(lendrRentalSystem).balance;

        // Act
        vm.startPrank(renter);
        collateralRegistry.returnNFTToLender(newRentalId);
        vm.stopPrank();

        // Assert
        uint256 totalRentalFee = collateralRegistry.getTotalHourlyFee(
            newRentalId
        );
        uint256 platformFeeBasisPoints = lendrRentalSystem.s_feeBps();
        uint256 expectedPlatformFee = (totalRentalFee *
            platformFeeBasisPoints) / 10000;
        uint256 expectedLenderPayout = totalRentalFee - expectedPlatformFee;

        assertEq(
            lender.balance,
            lenderInitialBalance + expectedLenderPayout,
            'Lender payout is incorrect'
        );
        assertEq(
            address(lendrRentalSystem).balance,
            factoryInitialBalance + expectedPlatformFee,
            'Platform fee is incorrect'
        );
    }
}
