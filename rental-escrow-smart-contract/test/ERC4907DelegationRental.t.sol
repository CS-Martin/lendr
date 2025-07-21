// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from 'forge-std/Test.sol';
import {DelegationRentalAgreement} from '../src/DelegationRentalAgreement.sol';
import {LendrRentalSystem} from '../src/LendrRentalSystem.sol';
import {RentalEnums} from '../src/libraries/RentalEnums.sol';
import {ERC4907Mock} from './mocks/ERC4907Mock.sol';
import {MaliciousAttacker} from './mocks/MaliciousAttacker.sol';
import {RejectingReceiver} from './mocks/RejectingReceiver.sol';
import {stdStorage, StdStorage} from 'forge-std/Test.sol';
import {DelegationRegistry} from '../src/DelegationRegistryERC1155ERC721.sol';

using stdStorage for StdStorage;

contract ERC4907DelegationRentalTest is Test {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    LendrRentalSystem internal lendrRentalSystem;
    DelegationRentalAgreement internal delegationRentalAgreement;
    ERC4907Mock internal mockERC4907;

    // Users
    address internal lender = makeAddr('lender');
    address internal renter = makeAddr('renter');
    address internal thirdParty = makeAddr('thirdParty');

    // NFT details
    uint256 internal constant TOKEN_ID = 1;

    // Rental terms
    uint256 internal constant HOURLY_RENTAL_FEE = 1 ether;
    uint256 internal constant RENTAL_DURATION_IN_HOURS = 24;

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/
    function setUp() public virtual {
        // Deploy LendrRentalSystem
        vm.startPrank(lender);
        lendrRentalSystem = new LendrRentalSystem(500); // 5% fee
        vm.stopPrank();

        // Deploy and setup ERC4907 mock
        mockERC4907 = new ERC4907Mock('MockERC4907', 'M4907');
        mockERC4907.mint(lender, TOKEN_ID);

        // Create a delegation rental agreement for an ERC4907 token
        vm.startPrank(lender);
        address agreementAddress =
            lendrRentalSystem.createDelegationRentalAgreement(
                lender,
                address(mockERC4907),
                TOKEN_ID,
                HOURLY_RENTAL_FEE,
                RENTAL_DURATION_IN_HOURS,
                RentalEnums.NftStandard.ERC4907,
                RentalEnums.DealDuration.ONE_DAY
            );
        delegationRentalAgreement = DelegationRentalAgreement(agreementAddress);
        vm.stopPrank();
    }

    function test_erc4907_listing_and_initiation() public {
        // Assert: Listing (Contract Creation)
        assertEq(
            uint(delegationRentalAgreement.s_rentalState()),
            uint(DelegationRentalAgreement.State.LISTED),
            'Initial state should be LISTED'
        );

        // Act: Rental Initiation
        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();
        vm.deal(renter, totalPayment);
        vm.startPrank(renter);
        delegationRentalAgreement.initiateDelegationRental{
            value: totalPayment
        }();
        vm.stopPrank();

        // Assert: Rental Initiated
        assertEq(
            uint(delegationRentalAgreement.s_rentalState()),
            uint(DelegationRentalAgreement.State.PENDING),
            'State should be PENDING after initiation'
        );
        assertEq(
            delegationRentalAgreement.s_renter(),
            renter,
            'Renter address should be set'
        );
    }

    function test_initiateDelegationRental_reverts_if_lender_is_renter()
        public
    {
        // Arrange
        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();
        vm.deal(lender, totalPayment);

        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            DelegationRentalAgreement.RentalAgreement__RenterMustNotBeLender.selector
        );
        delegationRentalAgreement.initiateDelegationRental{
            value: totalPayment
        }();
        vm.stopPrank();
    }

    function test_initiateDelegationRental_reverts_if_not_listed() public {
        // Arrange
        test_erc4907_listing_and_initiation(); // Puts state in PENDING
        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();
        vm.deal(renter, totalPayment);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidState.selector,
                DelegationRentalAgreement.State.LISTED,
                DelegationRentalAgreement.State.PENDING
            )
        );
        delegationRentalAgreement.initiateDelegationRental{
            value: totalPayment
        }();
        vm.stopPrank();
    }

    function test_initiateDelegationRental_reverts_if_payment_is_too_low()
        public
    {
        // Arrange
        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();
        // Give the renter just enough to make the call, to ensure the revert
        // is from the contract logic, not insufficient balance.
        vm.deal(renter, totalPayment - 1);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidPayment.selector,
                totalPayment - 1,
                totalPayment
            )
        );
        delegationRentalAgreement.initiateDelegationRental{
            value: totalPayment - 1
        }();
        vm.stopPrank();
    }

    function test_initiateDelegationRental_reverts_if_payment_is_too_high()
        public
    {
        // Arrange
        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();
        // Ensure the renter has enough funds for this specific transaction to
        // avoid a generic EVM revert.
        vm.deal(renter, totalPayment + 1);

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidPayment.selector,
                totalPayment + 1,
                totalPayment
            )
        );
        delegationRentalAgreement.initiateDelegationRental{
            value: totalPayment + 1
        }();
        vm.stopPrank();
    }

    function test_activateDelegation_reverts_if_not_pending() public {
        // Arrange - state is LISTED initially
        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidState.selector,
                DelegationRentalAgreement.State.PENDING,
                DelegationRentalAgreement.State.LISTED
            )
        );
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();
    }

    function test_activateDelegation_reverts_if_lender_is_not_owner() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        // Lender no longer owns the NFT
        vm.prank(lender);
        mockERC4907.transferFrom(lender, thirdParty, TOKEN_ID);

        // Act & Assert
        vm.startPrank(lender);
        // The check inside activateDelegation compares the original lender
        // with the current owner of the token. Since the lender transferred
        // the token away, the current owner is now the thirdParty.
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidUser.selector,
                lender, // The required user (the original lender)
                thirdParty // The actual user (the new owner)
            )
        );
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();
    }

    function test_activateDelegation_reverts_if_not_lender() public {
        // Arrange
        test_erc4907_listing_and_initiation();

        // Act & Assert
        vm.startPrank(thirdParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidUser.selector,
                lender,
                thirdParty
            )
        );
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();
    }

    function test_cancelDelegationRental_reverts_if_not_renter() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        vm.warp(delegationRentalAgreement.s_lenderDelegationDeadline() + 1);

        // Act & Assert
        vm.startPrank(thirdParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidUser.selector,
                renter,
                thirdParty
            )
        );
        delegationRentalAgreement.cancelDelegationRental();
        vm.stopPrank();
    }

    function test_completeDelegationRental_reverts_if_not_active() public {
        // Arrange - state is LISTED initially
        // Act & Assert
        vm.startPrank(lender);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidState.selector,
                DelegationRentalAgreement.State.ACTIVE_DELEGATION,
                DelegationRentalAgreement.State.LISTED
            )
        );
        delegationRentalAgreement.completeDelegationRental();
        vm.stopPrank();
    }

    function test_completeDelegationRental_reverts_if_rental_not_over() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();

        // Act & Assert
        vm.prank(lender);
        vm.expectRevert(
            DelegationRentalAgreement.RentalAgreement__RentalNotOver.selector
        );
        delegationRentalAgreement.completeDelegationRental();
    }

    function test_completeDelegationRental_callable_by_anyone() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();
        vm.warp(delegationRentalAgreement.s_rentalEndTime() + 1);

        // Act
        vm.prank(thirdParty); // Called by a third party
        delegationRentalAgreement.completeDelegationRental();

        // Assert
        assertEq(
            uint(delegationRentalAgreement.s_rentalState()),
            uint(DelegationRentalAgreement.State.COMPLETED),
            'State should be COMPLETED after completion'
        );
    }

    function test_cancelDelegationRental_reverts_if_deadline_not_passed()
        public
    {
        // Arrange
        test_erc4907_listing_and_initiation();

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            DelegationRentalAgreement
                .RentalAgreement__DelegationDeadlineNotPassed
                .selector
        );
        delegationRentalAgreement.cancelDelegationRental();
        vm.stopPrank();
    }

    function test_cancelDelegationRental_reverts_if_not_in_pending_state()
        public
    {
        // Arrange
        // 1. Initiate the rental to set the state to PENDING and assign a renter.
        test_erc4907_listing_and_initiation();
        // 2. Activate the rental to move the state to ACTIVE_DELEGATION.
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();
        // 3. Warp time past the delegation deadline to satisfy that condition.
        // Although the state check comes first, it's good practice to ensure
        // other conditions are met to truly isolate the check we are testing.
        vm.warp(block.timestamp + 2 days); // Go far into the future

        // Act & Assert
        // Now, when the renter calls cancel, the user check will pass,
        // but the state check will fail because the state is ACTIVE_DELEGATION, not PENDING.
        vm.startPrank(renter);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidState.selector,
                DelegationRentalAgreement.State.PENDING,
                DelegationRentalAgreement.State.ACTIVE_DELEGATION
            )
        );
        delegationRentalAgreement.cancelDelegationRental();
        vm.stopPrank();
    }

    function test_reportBreach_reverts_if_not_renter() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();

        // Act & Assert
        vm.startPrank(thirdParty);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidUser.selector,
                renter,
                thirdParty
            )
        );
        delegationRentalAgreement.reportBreach();
        vm.stopPrank();
    }

    function test_reportBreach_reverts_if_not_active() public {
        // Arrange - state is PENDING
        test_erc4907_listing_and_initiation();
        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__InvalidState.selector,
                DelegationRentalAgreement.State.ACTIVE_DELEGATION,
                DelegationRentalAgreement.State.PENDING
            )
        );
        delegationRentalAgreement.reportBreach();
        vm.stopPrank();
    }

    function test_reportBreach_reverts_if_rental_is_over() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();

        // Lender breaches, but after the rental is over
        vm.warp(delegationRentalAgreement.s_rentalEndTime() + 1);
        vm.startPrank(lender);
        mockERC4907.setUser(TOKEN_ID, address(0), 0);
        vm.stopPrank();

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            DelegationRentalAgreement.RentalAgreement__RentalIsOver.selector
        );
        delegationRentalAgreement.reportBreach();
        vm.stopPrank();
    }

    function test_reportBreach_reverts_if_no_breach() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();

        // Act & Assert
        vm.startPrank(renter);
        vm.expectRevert(
            DelegationRentalAgreement.RentalAgreement__NoBreachDetected.selector
        );
        delegationRentalAgreement.reportBreach();
        vm.stopPrank();
    }

    function test_erc4907_full_rental_cycle_happy_path() public {
        // Arrange
        test_erc4907_listing_and_initiation();

        // Act 1: Activation
        vm.expectEmit(true, true, true, true);
        emit DelegationRentalAgreement.RentalStarted(
            block.timestamp + RENTAL_DURATION_IN_HOURS * 3600
        );
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();

        // Assert 1: Activation
        assertEq(
            uint(delegationRentalAgreement.s_rentalState()),
            uint(DelegationRentalAgreement.State.ACTIVE_DELEGATION),
            'State should be ACTIVE_DELEGATION after activation'
        );
        assertEq(
            mockERC4907.userOf(TOKEN_ID),
            renter,
            'Renter should be the user of the NFT'
        );

        // Act 2: Completion
        uint256 lenderInitialBalance = lender.balance;
        uint256 factoryInitialBalance = address(lendrRentalSystem).balance;
        vm.warp(delegationRentalAgreement.s_rentalEndTime() + 1);
        vm.prank(lender); // Can be called by anyone, but we'll use lender
        uint256 totalRentalFee = delegationRentalAgreement.getTotalHourlyFee();
        uint256 platformFee = (totalRentalFee * 500) / 10000;
        uint256 lenderPayout = totalRentalFee - platformFee;

        vm.expectEmit(true, true, true, true);
        emit DelegationRentalAgreement.PayoutsDistributed(
            lender,
            address(lendrRentalSystem),
            lenderPayout,
            platformFee
        );
        delegationRentalAgreement.completeDelegationRental();

        // Assert 2: Completion
        assertEq(
            uint(delegationRentalAgreement.s_rentalState()),
            uint(DelegationRentalAgreement.State.COMPLETED),
            'State should be COMPLETED after completion'
        );
        assertEq(
            mockERC4907.userOf(TOKEN_ID),
            address(0),
            'User should be reset after rental completion'
        );

        // Check payouts
        assertEq(
            lender.balance,
            lenderInitialBalance + lenderPayout,
            'Lender payout is incorrect'
        );
        assertEq(
            address(lendrRentalSystem).balance,
            factoryInitialBalance + platformFee,
            'Platform fee is incorrect'
        );
    }

    function test_cancelDelegationRental_if_lender_fails_to_delegate() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        vm.warp(delegationRentalAgreement.s_lenderDelegationDeadline() + 1);
        uint256 renterInitialBalance = renter.balance;
        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();

        // Act
        vm.expectEmit(true, true, true, true);
        emit DelegationRentalAgreement.RentalCancelled();
        vm.startPrank(renter);
        delegationRentalAgreement.cancelDelegationRental();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(delegationRentalAgreement.s_rentalState()),
            uint(DelegationRentalAgreement.State.CANCELLED),
            'State should be CANCELLED'
        );
        assertEq(
            renter.balance,
            renterInitialBalance + totalPayment,
            'Renter should be refunded'
        );
    }

    function test_reportBreach_if_lender_revokes_delegation() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();

        // Lender breaches the agreement by revoking the delegation
        vm.startPrank(lender);
        mockERC4907.setUser(TOKEN_ID, address(0), 0);
        vm.stopPrank();

        uint256 renterInitialBalance = renter.balance;
        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();

        // Act
        vm.expectEmit(true, true, true, true);
        emit DelegationRentalAgreement.RentalCancelled();
        vm.startPrank(renter);
        delegationRentalAgreement.reportBreach();
        vm.stopPrank();

        // Assert
        assertEq(
            uint(delegationRentalAgreement.s_rentalState()),
            uint(DelegationRentalAgreement.State.CANCELLED),
            'State should be CANCELLED after breach'
        );
        assertEq(
            renter.balance,
            renterInitialBalance + totalPayment,
            'Renter should be refunded after breach'
        );
    }

    function test_reportBreach_reentrancy() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();

        // Setup malicious contract as renter
        MaliciousAttacker maliciousAttacker = new MaliciousAttacker(
            address(delegationRentalAgreement)
        );
        vm.deal(address(maliciousAttacker), 1 wei); // Give it some gas money

        // Manually set the renter to our malicious contract to test re-entrancy
        // This is a bit of a hack, but it's the only way to test this without
        // changing the entire flow of the contract.
        // Since s_rentalState (uint8) and s_renter (address) are packed into slot 1,
        // we read the current slot, preserve the high bits (state), and only replace
        // the low 160 bits (address). This avoids corrupting the packed data.
        bytes32 slot = bytes32(uint256(1)); // Slot 1
        bytes32 currentValue = vm.load(address(delegationRentalAgreement), slot);
        bytes32 mask = bytes32(uint256(0xff) << 160); // Mask for uint8 at bit 160-167
        bytes32 cleared = currentValue & mask; // Preserve state
        bytes32 newRenter = bytes32(uint256(uint160(address(maliciousAttacker)))); // New address in low 160 bits
        bytes32 newValue = cleared | newRenter;
        vm.store(address(delegationRentalAgreement), slot, newValue);

        assertEq(
            delegationRentalAgreement.s_renter(),
            address(maliciousAttacker)
        );

        // Lender breaches
        vm.startPrank(lender);
        mockERC4907.setUser(TOKEN_ID, address(0), 0);
        vm.stopPrank();

        // Act & Assert
        vm.startPrank(address(maliciousAttacker));
        vm.expectRevert(
            abi.encodeWithSelector(
                DelegationRentalAgreement.RentalAgreement__PaymentFailed.selector
            )
        );
        maliciousAttacker.attack();
        vm.stopPrank();
    }

    /*//////////////////////////////////////////////////////////////
                            EDGE CASE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_constructor_sets_initial_state_correctly() public view {
        // This test verifies that the constructor correctly initializes all state variables.
        // It's created via the factory, so we check the state of the created agreement.

        // Assert immutable variables
        assertEq(
            delegationRentalAgreement.i_lender(),
            lender,
            'Lender not set correctly'
        );
        assertEq(
            address(delegationRentalAgreement.i_nftContract()),
            address(mockERC4907),
            'NFT contract not set correctly'
        );
        assertEq(
            delegationRentalAgreement.i_tokenId(),
            TOKEN_ID,
            'Token ID not set correctly'
        );
        assertEq(
            delegationRentalAgreement.i_hourlyRentalFee(),
            HOURLY_RENTAL_FEE,
            'Hourly rental fee not set correctly'
        );
        assertEq(
            delegationRentalAgreement.i_rentalDurationInHours(),
            RENTAL_DURATION_IN_HOURS,
            'Rental duration not set correctly'
        );
        assertEq(
            uint(delegationRentalAgreement.i_nftStandard()),
            uint(RentalEnums.NftStandard.ERC4907),
            'NFT standard not set correctly'
        );
        assertEq(
            uint(delegationRentalAgreement.i_DealDuration()),
            uint(RentalEnums.DealDuration.ONE_DAY),
            'Deal duration not set correctly'
        );
        assertEq(
            address(delegationRentalAgreement.i_factoryContract()),
            address(lendrRentalSystem),
            'Factory contract not set correctly'
        );
        assertEq(
            address(delegationRentalAgreement.i_delegationRegistry()),
            address(0),
            'Delegation registry should be zero for ERC4907'
        );
        assertEq(
            delegationRentalAgreement.i_platformFeeBps(),
            500,
            'Platform fee bps not set correctly'
        );

        // Assert initial mutable state
        assertEq(
            uint(delegationRentalAgreement.s_rentalState()),
            uint(DelegationRentalAgreement.State.LISTED),
            'Initial state should be LISTED'
        );
        assertEq(
            delegationRentalAgreement.s_renter(),
            address(0),
            'Initial renter should be zero address'
        );
        assertEq(
            delegationRentalAgreement.s_rentalEndTime(),
            0,
            'Initial rental end time should be 0'
        );
        assertEq(
            delegationRentalAgreement.s_lenderDelegationDeadline(),
            0,
            'Initial delegation deadline should be 0'
        );
    }

    function test_constructor_reverts_if_duration_is_zero() public {
        vm.startPrank(lender);
        vm.expectRevert(
            LendrRentalSystem.LendrRentalSystem__RentalDurationMustBeGreaterThanZero
                .selector
        );
        lendrRentalSystem.createDelegationRentalAgreement(
            lender,
            address(mockERC4907),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            0, // Zero duration
            RentalEnums.NftStandard.ERC4907,
            RentalEnums.DealDuration.ONE_DAY
        );
        vm.stopPrank();
    }

    function test_constructor_reverts_if_dealDuration_is_invalid() public {
        vm.startPrank(lender);
        vm.expectRevert(
            LendrRentalSystem.LendrRentalSystem__InvalidDepositDeadline.selector
        );
        lendrRentalSystem.createDelegationRentalAgreement(
            lender,
            address(mockERC4907),
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            RENTAL_DURATION_IN_HOURS,
            RentalEnums.NftStandard.ERC4907,
            RentalEnums.DealDuration._MAX // Invalid duration
        );
        vm.stopPrank();
    }

    function test_initiateDelegationRental_sets_deadline_correctly() public {
        // Arrange
        // We know the deal duration is ONE_DAY from setUp, which corresponds to 24 hours.
        uint256 dealDurationInSeconds = 24 hours;
        uint256 expectedDeadline = block.timestamp + dealDurationInSeconds;
        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();
        vm.deal(renter, totalPayment);

        // Act
        vm.startPrank(renter);
        delegationRentalAgreement.initiateDelegationRental{
            value: totalPayment
        }();
        vm.stopPrank();

        // Assert
        assertEq(
            delegationRentalAgreement.s_lenderDelegationDeadline(),
            expectedDeadline,
            'Delegation deadline not set correctly'
        );
    }

    function test_activateDelegation_sets_rental_end_time_correctly() public {
        // Arrange
        test_erc4907_listing_and_initiation();
        uint256 expectedEndTime = block.timestamp +
            (RENTAL_DURATION_IN_HOURS * 3600);

        // Act
        vm.startPrank(lender);
        delegationRentalAgreement.activateDelegation();
        vm.stopPrank();

        // Assert
        assertEq(
            delegationRentalAgreement.s_rentalEndTime(),
            expectedEndTime,
            'Rental end time not set correctly'
        );
    }

    function test_completeDelegationRental_reverts_if_lender_payment_fails()
        public
    {
        // Arrange
        RejectingReceiver rejectingLender = new RejectingReceiver();
        vm.startPrank(address(rejectingLender));
        mockERC4907.mint(address(rejectingLender), TOKEN_ID + 1);
        address agreementAddress =
            lendrRentalSystem.createDelegationRentalAgreement(
                address(rejectingLender),
                address(mockERC4907),
                TOKEN_ID + 1,
                HOURLY_RENTAL_FEE,
                RENTAL_DURATION_IN_HOURS,
                RentalEnums.NftStandard.ERC4907,
                RentalEnums.DealDuration.ONE_DAY
            );
        delegationRentalAgreement = DelegationRentalAgreement(agreementAddress);
        vm.stopPrank();

        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();
        vm.deal(renter, totalPayment);
        vm.prank(renter);
        delegationRentalAgreement.initiateDelegationRental{
            value: totalPayment
        }();

        vm.prank(address(rejectingLender));
        delegationRentalAgreement.activateDelegation();
        vm.warp(delegationRentalAgreement.s_rentalEndTime() + 1);

        // Act & Assert
        vm.prank(lender);
        // We expect the raw error from the rejecting receiver to bubble up,
        // as the production contract does not use try/catch on the payment call.
        vm.expectRevert(
            RejectingReceiver.RentalAgreement__PaymentFailed.selector
        );
        delegationRentalAgreement.completeDelegationRental();
    }

    function test_payouts_with_zero_platform_fee() public {
        // Arrange
        // Deploy new system with 0 fee
        lendrRentalSystem = new LendrRentalSystem(0);
        // Create agreement
        vm.startPrank(lender);
        address agreementAddress =
            lendrRentalSystem.createDelegationRentalAgreement(
                lender,
                address(mockERC4907),
                TOKEN_ID,
                HOURLY_RENTAL_FEE,
                RENTAL_DURATION_IN_HOURS,
                RentalEnums.NftStandard.ERC4907,
                RentalEnums.DealDuration.ONE_DAY
            );
        delegationRentalAgreement = DelegationRentalAgreement(agreementAddress);
        vm.stopPrank();

        // Initiate and activate
        uint256 totalPayment = delegationRentalAgreement.getTotalHourlyFee();
        vm.deal(renter, totalPayment);
        vm.prank(renter);
        delegationRentalAgreement.initiateDelegationRental{
            value: totalPayment
        }();
        vm.prank(lender);
        delegationRentalAgreement.activateDelegation();

        // Act
        vm.warp(delegationRentalAgreement.s_rentalEndTime() + 1);
        uint256 lenderInitialBalance = lender.balance;
        uint256 factoryInitialBalance = address(lendrRentalSystem).balance;
        vm.prank(lender);
        delegationRentalAgreement.completeDelegationRental();

        // Assert
        uint256 totalRentalFee = delegationRentalAgreement.getTotalHourlyFee();
        assertEq(
            lender.balance,
            lenderInitialBalance + totalRentalFee,
            'Lender should receive full amount'
        );
        assertEq(
            address(lendrRentalSystem).balance,
            factoryInitialBalance,
            'Platform should receive nothing'
        );
    }
}
