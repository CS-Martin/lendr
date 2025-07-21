// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from 'forge-std/Test.sol';
import {StdCheats} from 'forge-std/StdCheats.sol';
import {LendrRentalSystem} from '../../src/LendrRentalSystem.sol';
import {DelegationRegistry} from '../../src/DelegationRegistry.sol';
import {RentalEnums} from '../../src/libraries/RentalEnums.sol';
import {ERC4907Mock} from '../mocks/ERC4907Mock.sol';
import {ERC721Mock} from '../mocks/ERC721Mock.sol';
import {ERC1155Mock} from '../mocks/ERC1155Mock.sol';

contract DelegationRegistryLifecycleTest is Test {
    LendrRentalSystem internal lendrSystem;
    DelegationRegistry internal delegationRegistry;
    ERC4907Mock internal erc4907Mock;
    ERC721Mock internal erc721Mock;
    ERC1155Mock internal erc1155Mock;

    address internal lender = makeAddr('lender');
    address internal renter = makeAddr('renter');
    uint256 internal constant INITIAL_PLATFORM_FEE_BPS = 500; // 5%
    uint256 internal constant TOKEN_ID = 1;
    uint256 internal constant HOURLY_RENTAL_FEE = 1 ether;
    uint256 internal constant RENTAL_DURATION_IN_HOURS = 24;
    RentalEnums.DealDuration internal constant DEAL_DURATION = RentalEnums.DealDuration.ONE_DAY;

    event RentalInitiated(uint256 indexed rentalId, address indexed renter);
    event RentalStarted(uint256 indexed rentalId, uint256 endTime);
    event RentalCancelled(uint256 indexed rentalId);
    event PayoutsDistributed(
        uint256 indexed rentalId,
        address indexed lender,
        address indexed platform,
        uint256 lenderPayout,
        uint256 platformFee
    );

    function setUp() public {
        lendrSystem = new LendrRentalSystem(INITIAL_PLATFORM_FEE_BPS);
        delegationRegistry = lendrSystem.i_delegationRegistry();

        erc4907Mock = new ERC4907Mock("ERC4907", "E4907");
        erc721Mock = new ERC721Mock("ERC721", "E721");
        erc1155Mock = new ERC1155Mock("ipfs://");

        erc4907Mock.mint(lender, TOKEN_ID);
        erc721Mock.mint(lender, TOKEN_ID);
        erc1155Mock.mint(lender, TOKEN_ID, 1, '');

        vm.deal(renter, 100 ether);
    }

    /*//////////////////////////////////////////////////////////////
                        HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _createDelegationRental(
        address nftContract,
        RentalEnums.NftStandard nftStandard
    ) internal returns (uint256) {
        vm.prank(lender);
        address agreementAddress = lendrSystem.createDelegationRentalAgreement(
            lender,
            nftContract,
            TOKEN_ID,
            HOURLY_RENTAL_FEE,
            RENTAL_DURATION_IN_HOURS,
            nftStandard,
            DEAL_DURATION
        );
        assertEq(agreementAddress, address(delegationRegistry));
        return lendrSystem.s_totalRentals();
    }

    /*//////////////////////////////////////////////////////////////
                        ERC4907 LIFECYCLE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Erc4907_FullLifecycle() public {
        // 1. Create Rental
        uint256 rentalId = _createDelegationRental(
            address(erc4907Mock),
            RentalEnums.NftStandard.ERC4907
        );
        DelegationRegistry.RentalAgreement memory agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(agreement.lender, lender);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.LISTED));

        // 2. Initiate Rental
        uint256 totalFee = delegationRegistry.getTotalHourlyFee(rentalId);
        vm.prank(renter);
        vm.expectEmit(true, true, true, true);
        emit RentalInitiated(rentalId, renter);
        delegationRegistry.initiateDelegationRental{value: totalFee}(rentalId);
        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(agreement.renter, renter);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.PENDING));

        // 3. Activate Delegation
        vm.prank(lender);
        vm.expectEmit(true, true, true, true);
        uint256 expectedEndTime = block.timestamp + (RENTAL_DURATION_IN_HOURS * 1 hours);
        emit RentalStarted(rentalId, expectedEndTime);
        delegationRegistry.activateDelegation(rentalId);
        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(erc4907Mock.userOf(TOKEN_ID), renter);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.ACTIVE_DELEGATION));

        // 4. Complete Rental
        vm.warp(agreement.rentalEndTime + 1);
        uint256 platformFee = (totalFee * INITIAL_PLATFORM_FEE_BPS) / 10000;
        uint256 lenderPayout = totalFee - platformFee;
        uint256 lenderInitialBalance = lender.balance;
        uint256 platformInitialBalance = address(lendrSystem).balance;

        vm.expectEmit(true, true, true, true);
        emit PayoutsDistributed(rentalId, lender, address(lendrSystem), lenderPayout, platformFee);
        delegationRegistry.completeDelegationRental(rentalId);

        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.COMPLETED));
        assertEq(erc4907Mock.userOf(TOKEN_ID), address(0));
        assertEq(lender.balance, lenderInitialBalance + lenderPayout);
        assertEq(address(lendrSystem).balance, platformInitialBalance + platformFee);
    }

    /*//////////////////////////////////////////////////////////////
                        NON-ERC4907 (ERC721) LIFECYCLE TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Erc721_FullLifecycle() public {
        // 1. Create Rental
        uint256 rentalId = _createDelegationRental(
            address(erc721Mock),
            RentalEnums.NftStandard.ERC721
        );
        DelegationRegistry.RentalAgreement memory agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.LISTED));

        // 2. Lender deposits NFT
        vm.prank(lender);
        erc721Mock.safeTransferFrom(lender, address(delegationRegistry), TOKEN_ID);
        assertEq(delegationRegistry.originalOwnerOf(address(erc721Mock), TOKEN_ID), lender);
        assertEq(erc721Mock.ownerOf(TOKEN_ID), address(delegationRegistry));

        // 3. Initiate Rental
        uint256 totalFee = delegationRegistry.getTotalHourlyFee(rentalId);
        vm.prank(renter);
        delegationRegistry.initiateDelegationRental{value: totalFee}(rentalId);
        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.PENDING));

        // 4. Activate Delegation
        vm.prank(lender);
        delegationRegistry.activateDelegation(rentalId);
        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(delegationRegistry.userOf(address(erc721Mock), TOKEN_ID), renter);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.ACTIVE_DELEGATION));

        // 5. Complete Rental
        vm.warp(agreement.rentalEndTime + 1);
        delegationRegistry.completeDelegationRental(rentalId);
        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.COMPLETED));
        assertEq(delegationRegistry.userOf(address(erc721Mock), TOKEN_ID), address(0));

        // 6. Withdraw NFT
        vm.prank(lender);
        delegationRegistry.withdrawNft(address(erc721Mock), TOKEN_ID);
        assertEq(erc721Mock.ownerOf(TOKEN_ID), lender);
    }

    /*//////////////////////////////////////////////////////////////
                        NON-ERC4907 (ERC1155) LIFECYCLE TESTS
    //////////////////////////////////////////////////////////////*/
    
    function test_Erc1155_FullLifecycle() public {
        // 1. Create Rental
        uint256 rentalId = _createDelegationRental(
            address(erc1155Mock),
            RentalEnums.NftStandard.ERC1155
        );
        DelegationRegistry.RentalAgreement memory agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.LISTED));

        // 2. Lender deposits NFT
        vm.prank(lender);
        erc1155Mock.safeTransferFrom(lender, address(delegationRegistry), TOKEN_ID, 1, "");
        assertEq(delegationRegistry.originalOwnerOf(address(erc1155Mock), TOKEN_ID), lender);
        assertEq(erc1155Mock.balanceOf(address(delegationRegistry), TOKEN_ID), 1);

        // 3. Initiate Rental
        uint256 totalFee = delegationRegistry.getTotalHourlyFee(rentalId);
        vm.prank(renter);
        delegationRegistry.initiateDelegationRental{value: totalFee}(rentalId);
        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.PENDING));

        // 4. Activate Delegation
        vm.prank(lender);
        delegationRegistry.activateDelegation(rentalId);
        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(delegationRegistry.userOf(address(erc1155Mock), TOKEN_ID), renter);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.ACTIVE_DELEGATION));

        // 5. Complete Rental
        vm.warp(agreement.rentalEndTime + 1);
        delegationRegistry.completeDelegationRental(rentalId);
        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.COMPLETED));
        assertEq(delegationRegistry.userOf(address(erc1155Mock), TOKEN_ID), address(0));

        // 6. Withdraw NFT
        vm.prank(lender);
        delegationRegistry.withdrawNft(address(erc1155Mock), TOKEN_ID);
        assertEq(erc1155Mock.balanceOf(lender, TOKEN_ID), 1);
    }

    /*//////////////////////////////////////////////////////////////
                        CANCELLATION & BREACH TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Cancel_LenderFailsToDelegate() public {
        uint256 rentalId = _createDelegationRental(
            address(erc4907Mock),
            RentalEnums.NftStandard.ERC4907
        );
        uint256 totalFee = delegationRegistry.getTotalHourlyFee(rentalId);
        vm.prank(renter);
        delegationRegistry.initiateDelegationRental{value: totalFee}(rentalId);

        DelegationRegistry.RentalAgreement memory agreement = delegationRegistry.getRentalAgreement(rentalId);
        vm.warp(agreement.lenderDelegationDeadline + 1);

        uint256 renterInitialBalance = renter.balance;
        vm.prank(renter);
        vm.expectEmit(true, true, true, true);
        emit RentalCancelled(rentalId);
        delegationRegistry.cancelDelegationRental(rentalId);

        agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.CANCELLED));
        assertEq(renter.balance, renterInitialBalance + totalFee);
    }

    function test_ReportBreach_Erc4907() public {
        // Full lifecycle up to ACTIVE_DELEGATION
        uint256 rentalId = _createDelegationRental(
            address(erc4907Mock),
            RentalEnums.NftStandard.ERC4907
        );
        uint256 totalFee = delegationRegistry.getTotalHourlyFee(rentalId);
        vm.prank(renter);
        delegationRegistry.initiateDelegationRental{value: totalFee}(rentalId);
        vm.prank(lender);
        delegationRegistry.activateDelegation(rentalId);

        // Simulate breach: lender revokes delegation early
        vm.prank(lender);
        erc4907Mock.setUser(TOKEN_ID, address(0), 0);

        // Renter reports breach
        uint256 renterInitialBalance = renter.balance;
        vm.prank(renter);
        vm.expectEmit(true, true, true, true);
        emit RentalCancelled(rentalId);
        delegationRegistry.reportBreach(rentalId);

        DelegationRegistry.RentalAgreement memory agreement = delegationRegistry.getRentalAgreement(rentalId);
        assertEq(uint8(agreement.rentalState), uint8(DelegationRegistry.State.CANCELLED));
        assertEq(renter.balance, renterInitialBalance + totalFee);
    }

    function test_Fail_ActivateDelegation_When_NotDeposited_Erc721() public {
        uint256 rentalId = _createDelegationRental(
            address(erc721Mock),
            RentalEnums.NftStandard.ERC721
        );
        uint256 totalFee = delegationRegistry.getTotalHourlyFee(rentalId);
        vm.prank(renter);
        delegationRegistry.initiateDelegationRental{value: totalFee}(rentalId);

        // Lender tries to activate without depositing
        vm.prank(lender);
        vm.expectRevert(DelegationRegistry.DelegationRegistry__NftNotDeposited.selector);
        delegationRegistry.activateDelegation(rentalId);
    }
} 