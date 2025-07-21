// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from 'forge-std/Test.sol';
import {CollateralRentalAgreement} from '../../src/CollateralRentalAgreement.sol';
import {LendrRentalSystem} from '../../src/LendrRentalSystem.sol';
import {RentalEnums} from '../../src/libraries/RentalEnums.sol';
import {ERC721Mock} from '../mocks/ERC721Mock.sol';
import {ERC1155Mock} from '../mocks/ERC1155Mock.sol';
import {Attacker} from '../mocks/Attacker.sol';

contract CollateralRentalTest is Test {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    LendrRentalSystem internal lendrRentalSystem;
    CollateralRentalAgreement internal collateralRentalAgreement;
    ERC721Mock internal mockERC721;
    ERC1155Mock internal mockERC1155;

    // Users
    address internal lender = makeAddr('lender');
    address internal renter = makeAddr('renter');
    address internal thirdParty = makeAddr('thirdParty');

    // NFT details
    uint256 internal constant TOKEN_ID = 1;

    // Rental terms
    uint256 internal constant HOURLY_RENTAL_FEE = 1 ether;
    uint256 internal constant RENTAL_DURATION_IN_HOURS = 24;
    uint256 internal constant COLLATERAL_AMOUNT = 5 ether;

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/
    function setUp() public virtual {
        // Deploy LendrRentalSystem
        vm.startPrank(lender);
        lendrRentalSystem = new LendrRentalSystem(500); // 1% fee
        vm.stopPrank();

        // Deploy and setup ERC721 mock
        mockERC721 = new ERC721Mock('MockNFT', 'MNFT');
        mockERC721.mint(lender, TOKEN_ID);

        // Deploy and setup ERC1155 mock
        mockERC1155 = new ERC1155Mock('');
        mockERC1155.mint(lender, TOKEN_ID, 1, '');

        // Create a collateral rental agreement for an ERC721 token
        vm.startPrank(address(lendrRentalSystem));
        collateralRentalAgreement = new CollateralRentalAgreement(
            lender,
            address(mockERC721),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            COLLATERAL_AMOUNT,
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC721,
            RentalEnums.DealDuration.ONE_DAY
        );
        vm.stopPrank();

        // Approve the rental contract to manage the lender's NFT
        vm.startPrank(lender);
        mockERC721.setApprovalForAll(address(collateralRentalAgreement), true);
        mockERC1155.setApprovalForAll(address(collateralRentalAgreement), true);
        vm.stopPrank();
    }

    function test_initiateRental_successfully() public {
        // Arrange
        uint256 totalPayment = collateralRentalAgreement
            .getTotalRentalFeeWithCollateral();
        vm.deal(renter, totalPayment);

        // Act
        vm.startPrank(renter);
        collateralRentalAgreement.initiateRental{value: totalPayment}();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(collateralRentalAgreement.s_rentalState()),
            uint(CollateralRentalAgreement.State.READY_TO_RELEASE),
            'Rental state should be READY_TO_RELEASE'
        );
        assertEq(
            collateralRentalAgreement.s_renter(),
            renter,
            'Renter address should be set'
        );
        assertEq(
            address(collateralRentalAgreement).balance,
            totalPayment,
            'Contract balance should match total payment'
        );
    }

    function test_initiateRental_reverts_if_payment_is_incorrect() public {
        // Arrange
        uint256 incorrectPayment = collateralRentalAgreement
            .getTotalRentalFeeWithCollateral() - 1;
        vm.deal(renter, incorrectPayment);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__InvalidPayment.selector
        );
        collateralRentalAgreement.initiateRental{value: incorrectPayment}();
        vm.stopPrank();
    }

    function test_initiateRental_reverts_if_renter_is_lender() public {
        // Arrange
        uint256 totalPayment = collateralRentalAgreement
            .getTotalRentalFeeWithCollateral();
        vm.deal(lender, totalPayment);

        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__RenterMustNotBeLender.selector
        );
        collateralRentalAgreement.initiateRental{value: totalPayment}();
        vm.stopPrank();
    }

    function test_initiateRental_reverts_if_already_initiated() public {
        // Arrange
        test_initiateRental_successfully(); // First initiation
        uint256 totalPayment = collateralRentalAgreement
            .getTotalRentalFeeWithCollateral();
        vm.deal(renter, totalPayment);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            abi.encodeWithSelector(
                CollateralRentalAgreement.RentalAgreement__InvalidState.selector,
                CollateralRentalAgreement.State.LISTED,
                CollateralRentalAgreement.State.READY_TO_RELEASE
            )
        );
        collateralRentalAgreement.initiateRental{value: totalPayment}();
        vm.stopPrank();
    }

    function test_depositNFTByLender_successfully() public {
        // Arrange
        test_initiateRental_successfully(); // Ensure rental is initiated

        // Act
        vm.startPrank(lender);
        collateralRentalAgreement.depositNFTByLender();
        vm.stopPrank();

        // Assert
        assertEq(
            mockERC721.ownerOf(TOKEN_ID),
            address(collateralRentalAgreement),
            'NFT should be in escrow'
        );
        assertTrue(
            collateralRentalAgreement.s_renterClaimDeadline() > 0,
            'Renter claim deadline should be set'
        );
    }

    function test_releaseNFTToRenter_successfully() public {
        // Arrange
        test_depositNFTByLender_successfully(); // Ensure NFT is in escrow

        // Act
        vm.startPrank(renter);
        collateralRentalAgreement.releaseNFTToRenter();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(collateralRentalAgreement.s_rentalState()),
            uint(CollateralRentalAgreement.State.ACTIVE_RENTAL),
            'Rental state should be ACTIVE_RENTAL'
        );
        assertEq(
            mockERC721.ownerOf(TOKEN_ID),
            renter,
            'Renter should own the NFT'
        );
        assertTrue(
            collateralRentalAgreement.s_rentalEndTime() > 0,
            'Rental end time should be set'
        );
        assertTrue(
            collateralRentalAgreement.s_returnDeadline() > 0,
            'Return deadline should be set'
        );
    }

    function test_returnNFTToLender_successfully() public {
        // Arrange
        test_releaseNFTToRenter_successfully(); // Ensure rental is active
        vm.startPrank(renter);
        mockERC721.setApprovalForAll(address(collateralRentalAgreement), true);
        vm.stopPrank();

        uint256 lenderInitialBalance = lender.balance;
        uint256 renterInitialBalance = renter.balance;
        uint256 factoryInitialBalance = address(lendrRentalSystem).balance;

        // Act
        vm.startPrank(renter);
        collateralRentalAgreement.returnNFTToLender();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(collateralRentalAgreement.s_rentalState()),
            uint(CollateralRentalAgreement.State.COMPLETED),
            'Rental state should be COMPLETED'
        );
        assertEq(
            mockERC721.ownerOf(TOKEN_ID),
            lender,
            'Lender should own the NFT again'
        );

        // Check payouts
        uint256 totalRentalFee = collateralRentalAgreement.getTotalHourlyFee();
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

    function test_claimCollateralWhenDefaulted_successfully() public {
        // Arrange
        test_releaseNFTToRenter_successfully(); // Ensure rental is active

        uint256 lenderInitialBalance = lender.balance;
        uint256 factoryInitialBalance = address(lendrRentalSystem).balance;

        // Warp time to after the return deadline
        vm.warp(collateralRentalAgreement.s_returnDeadline() + 1);

        // Act
        vm.startPrank(lender);
        collateralRentalAgreement.claimCollateralWhenDefaulted();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(collateralRentalAgreement.s_rentalState()),
            uint(CollateralRentalAgreement.State.DEFAULTED),
            'Rental state should be DEFAULTED'
        );

        // Check payouts
        uint256 totalRentalFee = collateralRentalAgreement.getTotalHourlyFee();
        uint256 platformFee = (totalRentalFee * 500) / 10000;
        uint256 lenderPayout = totalRentalFee - platformFee + COLLATERAL_AMOUNT;

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
        test_initiateRental_successfully(); // Ensure rental is initiated

        uint256 renterInitialBalance = renter.balance;
        uint256 totalPayment = collateralRentalAgreement
            .getTotalRentalFeeWithCollateral();

        // Warp time to after the lender deposit deadline
        vm.warp(collateralRentalAgreement.s_lenderDepositDeadline() + 1);

        // Act
        vm.startPrank(renter);
        collateralRentalAgreement.reclaimFundsOnLenderTimeout();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(collateralRentalAgreement.s_rentalState()),
            uint(CollateralRentalAgreement.State.CANCELLED),
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
        test_depositNFTByLender_successfully(); // Ensure NFT is in escrow

        uint256 renterInitialBalance = renter.balance;
        uint256 totalPayment = collateralRentalAgreement
            .getTotalRentalFeeWithCollateral();

        // Warp time to after the renter claim deadline
        vm.warp(collateralRentalAgreement.s_renterClaimDeadline() + 1);

        // Act
        vm.startPrank(renter);
        collateralRentalAgreement.cancelRentalAfterClaimTimeout();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(collateralRentalAgreement.s_rentalState()),
            uint(CollateralRentalAgreement.State.CANCELLED),
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
        test_depositNFTByLender_successfully();

        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__RenterStillHasTime.selector
        );
        collateralRentalAgreement.claimNFTWhenRenterUnableToClaim();
        vm.stopPrank();
    }

    function test_releaseNFTToRenter_reverts_if_not_in_escrow() public {
        // Arrange
        test_initiateRental_successfully(); // Rental initiated, but NFT not deposited

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__NftNotInEscrow.selector
        );
        collateralRentalAgreement.releaseNFTToRenter();
        vm.stopPrank();
    }

    function test_lender_can_reclaim_nft_if_renter_times_out() public {
        // Arrange
        test_depositNFTByLender_successfully();
        vm.warp(collateralRentalAgreement.s_renterClaimDeadline() + 1);

        // Act
        vm.startPrank(lender);
        collateralRentalAgreement.claimNFTWhenRenterUnableToClaim();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(collateralRentalAgreement.s_rentalState()),
            uint(CollateralRentalAgreement.State.CANCELLED),
            'Rental should be CANCELLED'
        );
        assertEq(
            mockERC721.ownerOf(TOKEN_ID),
            lender,
            'Lender should have the NFT back'
        );
    }

    function test_reentrancy_attack_on_returnNFTToLender() public {
        // Arrange
        CollateralRentalAgreement newRental;
        vm.startPrank(address(lendrRentalSystem));
        newRental = new CollateralRentalAgreement(
            lender,
            address(mockERC721),
            TOKEN_ID + 1, // Use a new token ID
            HOURLY_RENTAL_FEE,
            COLLATERAL_AMOUNT,
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC721,
            RentalEnums.DealDuration.ONE_DAY
        );
        vm.stopPrank();

        Attacker attacker = new Attacker(address(newRental));
        address attackerAddress = address(attacker);

        mockERC721.mint(lender, TOKEN_ID + 1);
        vm.startPrank(lender);
        mockERC721.setApprovalForAll(address(newRental), true);
        vm.stopPrank();

        uint256 totalPayment = newRental.getTotalRentalFeeWithCollateral();
        vm.deal(attackerAddress, totalPayment);

        vm.startPrank(attackerAddress);
        newRental.initiateRental{value: totalPayment}();
        vm.stopPrank();

        vm.startPrank(lender);
        newRental.depositNFTByLender();
        vm.stopPrank();

        vm.startPrank(attackerAddress);
        newRental.releaseNFTToRenter();
        mockERC721.setApprovalForAll(address(newRental), true);
        vm.stopPrank();

        // Act & Assert
        vm.startPrank(attackerAddress);
        vm.expectRevert(); // Expect a revert due to reentrancy guard
        attacker.attack();
        vm.stopPrank();
    }

    function test_onlyLender_modifier_prevents_third_party_deposit() public {
        // Arrange
        test_initiateRental_successfully();

        // Act & Assert
        vm.startPrank(thirdParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                CollateralRentalAgreement.RentalAgreement__InvalidUser.selector,
                lender,
                thirdParty
            )
        );
        collateralRentalAgreement.depositNFTByLender();
        vm.stopPrank();
    }

    function test_onlyRenter_modifier_prevents_third_party_return() public {
        // Arrange
        test_releaseNFTToRenter_successfully();

        // Act & Assert
        vm.startPrank(thirdParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                CollateralRentalAgreement.RentalAgreement__InvalidUser.selector,
                renter,
                thirdParty
            )
        );
        collateralRentalAgreement.returnNFTToLender();
        vm.stopPrank();
    }

    function test_erc1155_rental_happy_path() public {
        // Arrange
        CollateralRentalAgreement erc1155Rental;
        vm.startPrank(address(lendrRentalSystem));
        erc1155Rental = new CollateralRentalAgreement(
            lender,
            address(mockERC1155),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            COLLATERAL_AMOUNT,
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC1155,
            RentalEnums.DealDuration.ONE_DAY
        );
        vm.stopPrank();

        vm.startPrank(lender);
        mockERC1155.setApprovalForAll(address(erc1155Rental), true);
        vm.stopPrank();

        uint256 totalPayment = erc1155Rental.getTotalRentalFeeWithCollateral();
        vm.deal(renter, totalPayment);

        // Act 1: Initiate Rental
        vm.startPrank(renter);
        erc1155Rental.initiateRental{value: totalPayment}();
        vm.stopPrank();

        // Act 2: Deposit NFT
        vm.startPrank(lender);
        erc1155Rental.depositNFTByLender();
        vm.stopPrank();

        // Act 3: Release NFT
        vm.startPrank(renter);
        erc1155Rental.releaseNFTToRenter();
        vm.stopPrank();

        // Act 4: Return NFT
        vm.startPrank(renter);
        mockERC1155.setApprovalForAll(address(erc1155Rental), true);
        erc1155Rental.returnNFTToLender();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(erc1155Rental.s_rentalState()),
            uint(CollateralRentalAgreement.State.COMPLETED),
            'ERC1155 rental should be COMPLETED'
        );
        assertEq(
            mockERC1155.balanceOf(lender, TOKEN_ID),
            1,
            'Lender should have the ERC1155 token back'
        );
    }

    function test_depositNFTByLender_reverts_if_deadline_passed() public {
        // Arrange
        test_initiateRental_successfully();
        vm.warp(collateralRentalAgreement.s_lenderDepositDeadline() + 1);

        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__DeadlinePassed.selector
        );
        collateralRentalAgreement.depositNFTByLender();
        vm.stopPrank();
    }

    function test_releaseNFTToRenter_reverts_if_deadline_passed() public {
        // Arrange
        test_depositNFTByLender_successfully();
        vm.warp(collateralRentalAgreement.s_renterClaimDeadline() + 1);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__DeadlinePassed.selector
        );
        collateralRentalAgreement.releaseNFTToRenter();
        vm.stopPrank();
    }

    function test_returnNFTToLender_reverts_if_deadline_missed() public {
        // Arrange
        test_releaseNFTToRenter_successfully();
        vm.warp(collateralRentalAgreement.s_returnDeadline() + 1);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__ReturnDeadlineMissed.selector
        );
        collateralRentalAgreement.returnNFTToLender();
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                            EDGE CASE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_platform_fee_with_low_rental_rates() public {
        // This test checks the platform fee calculation for small rental amounts
        // to ensure the basis point calculation is correct and handles rounding as expected.

        // Scenario 1: Hourly rate of 1 wei.
        // Total rental fee = 1 wei/hr * 24 hrs = 24 wei
        // Platform fee = (24 * 500) / 10000 = 1.2 wei, which rounds down to 1 wei.
        _executeFeeTest(1, 2);

        // Scenario 2: Hourly rate of 8 wei.
        // Total rental fee = 8 wei/hr * 24 hrs = 192 wei
        // Platform fee = (192 * 500) / 10000 = 9.6 wei, which rounds down to 9 wei.
        _executeFeeTest(8, 3);

        // Scenario 3: Hourly rate where platform fee would round down to 0.
        // Total rental fee = 0.4 wei/hr * 24 hrs = 9.6 wei -> let's use 1 wei/hr * 1hr to make it simple.
        // Let's use a duration of 1 hour for a simple case.
        // Total rental fee = 1 wei/hr * 1 hr = 1 wei
        // Platform fee = (1 * 500) / 10000 = 0.05 wei -> 0 wei
        _executeFeeTestWithDuration(1, 1, 4);

        // Scenario 4: A rate just high enough to generate a 1 wei fee.
        // To get a 1 wei fee, (total fee * 500) / 10000 >= 1
        // total fee * 500 >= 10000 -> total fee >= 20
        // With a 1-hour duration, an hourly rate of 20 wei should result in a 1 wei fee.
        // Platform fee = (20 * 500) / 10000 = 1 wei.
        _executeFeeTestWithDuration(20, 1, 5);
    }

    function _executeFeeTest(uint256 hourlyFee, uint256 tokenId) internal {
        _executeFeeTestWithDuration(hourlyFee, RENTAL_DURATION_IN_HOURS, tokenId);
    }

    function _executeFeeTestWithDuration(
        uint256 hourlyFee,
        uint256 duration,
        uint256 tokenId
    ) internal {
        // Arrange
        mockERC721.mint(lender, tokenId);
        CollateralRentalAgreement newRental;
        vm.startPrank(address(lendrRentalSystem));
        newRental = new CollateralRentalAgreement(
            lender,
            address(mockERC721),
            tokenId,
            hourlyFee,
            COLLATERAL_AMOUNT,
            duration,
            RentalEnums.NftStandard.ERC721,
            RentalEnums.DealDuration.ONE_DAY
        );
        vm.stopPrank();

        vm.startPrank(lender);
        mockERC721.setApprovalForAll(address(newRental), true);
        vm.stopPrank();

        uint256 totalPayment = newRental.getTotalRentalFeeWithCollateral();
        vm.deal(renter, totalPayment);

        vm.startPrank(renter);
        newRental.initiateRental{value: totalPayment}();
        vm.stopPrank();

        vm.startPrank(lender);
        newRental.depositNFTByLender();
        vm.stopPrank();

        vm.startPrank(renter);
        newRental.releaseNFTToRenter();
        vm.stopPrank();

        vm.startPrank(renter);
        mockERC721.setApprovalForAll(address(newRental), true);
        vm.stopPrank();

        uint256 lenderInitialBalance = lender.balance;
        uint256 factoryInitialBalance = address(lendrRentalSystem).balance;

        // Act
        vm.startPrank(renter);
        newRental.returnNFTToLender();
        vm.stopPrank();

        // Assert
        uint256 totalRentalFee = newRental.getTotalHourlyFee();
        uint256 platformFeeBasisPoints = lendrRentalSystem.s_feeBps();
        uint256 expectedPlatformFee = (totalRentalFee * platformFeeBasisPoints) / 10000;
        uint256 expectedLenderPayout = totalRentalFee - expectedPlatformFee;

        assertEq(
            lender.balance,
            lenderInitialBalance + expectedLenderPayout,
            "Lender payout is incorrect"
        );
        assertEq(
            address(lendrRentalSystem).balance,
            factoryInitialBalance + expectedPlatformFee,
            "Platform fee is incorrect"
        );
    }

    function test_constructor_reverts_if_duration_is_zero() public {
        vm.startPrank(address(lendrRentalSystem));
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__DurationCannotBeZero.selector
        );
        new CollateralRentalAgreement(
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
        vm.startPrank(address(lendrRentalSystem));
        vm.expectRevert(
            CollateralRentalAgreement
                .RentalAgreement__CollateralCannotBeZeroForCollateralType
                .selector
        );
        new CollateralRentalAgreement(
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
        vm.startPrank(address(lendrRentalSystem));
        vm.expectRevert(
            CollateralRentalAgreement
                .RentalAgreement__CollateralRentalDoesNotSupportNFTType
                .selector
        );
        new CollateralRentalAgreement(
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
        vm.startPrank(address(lendrRentalSystem));
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__InvalidDealDuration.selector
        );
        new CollateralRentalAgreement(
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

    function test_claimCollateralWhenDefaulted_reverts_if_not_ended() public {
        // Arrange
        test_releaseNFTToRenter_successfully();

        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__RentalNotEnded.selector
        );
        collateralRentalAgreement.claimCollateralWhenDefaulted();
        vm.stopPrank();
    }

    function test_claimCollateralWhenDefaulted_reverts_if_invalid_state()
        public
    {
        // Arrange - rental is in LISTED state, not ACTIVE or DEFAULTED
        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__InvalidStateForDefault.selector
        );
        collateralRentalAgreement.claimCollateralWhenDefaulted();
        vm.stopPrank();
    }

    function test_reclaimFundsOnLenderTimeout_reverts_if_lender_has_time()
        public
    {
        // Arrange
        test_initiateRental_successfully();

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__LenderStillHasTime.selector
        );
        collateralRentalAgreement.reclaimFundsOnLenderTimeout();
        vm.stopPrank();
    }

    function test_cancelRentalAfterClaimTimeout_reverts_if_renter_has_time()
        public
    {
        // Arrange
        test_depositNFTByLender_successfully();

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRentalAgreement.RentalAgreement__RenterStillHasTime.selector
        );
        collateralRentalAgreement.cancelRentalAfterClaimTimeout();
        vm.stopPrank();
    }
}
