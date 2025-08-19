// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from 'forge-std/Test.sol';
import {CollateralRegistry} from '../../src/CollateralRegistry.sol';
import {LendrRentalSystem} from '../../src/LendrRentalSystem.sol';
import {RentalEnums} from '../../src/libraries/RentalEnums.sol';
import {ERC721Mock} from '../mocks/ERC721Mock.sol';
import {Attacker} from '../mocks/Attacker.sol';

contract CollateralRentalReentrancyTest is Test {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    LendrRentalSystem internal lendrRentalSystem;
    CollateralRegistry internal collateralRegistry;
    ERC721Mock internal mockERC721;
    Attacker internal attacker;

    // Users
    address internal lender = makeAddr('lender');
    address internal renter; // The attacker contract will be the renter

    // NFT details
    uint256 internal constant TOKEN_ID = 1;
    uint256 internal rentalId;

    // Rental terms
    uint256 internal constant HOURLY_RENTAL_FEE = 1 ether;
    uint256 internal constant COLLATERAL_AMOUNT = 5 ether;
    uint256 internal constant RENTAL_DURATION_IN_HOURS = 1;

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/
    function setUp() public virtual {
        // Deploy LendrRentalSystem
        vm.startPrank(lender);
        lendrRentalSystem = new LendrRentalSystem(500); // 5% fee
        collateralRegistry = lendrRentalSystem.i_collateralRegistry();
        vm.stopPrank();

        // Deploy and setup ERC721 mock
        mockERC721 = new ERC721Mock('MockERC721', 'M721');
        mockERC721.mint(lender, TOKEN_ID);

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

        // Deploy the attacker contract
        attacker = new Attacker(address(collateralRegistry));
        attacker.setRentalId(rentalId);
        renter = address(attacker);
    }

    function _initiateAndDeposit() internal {
        // 1. Renter (attacker) initiates the rental
        uint256 totalPayment =
            collateralRegistry.getTotalRentalFeeWithCollateral(rentalId);
        vm.deal(renter, totalPayment);
        vm.startPrank(renter);
        collateralRegistry.initiateRental{value: totalPayment}(rentalId);
        vm.stopPrank();

        // 2. Lender deposits the NFT
        vm.startPrank(lender);
        mockERC721.approve(address(collateralRegistry), TOKEN_ID);
        collateralRegistry.depositNFTByLender(rentalId);
        vm.stopPrank();

        // 3. Renter (attacker) releases the NFT
        vm.startPrank(renter);
        collateralRegistry.releaseNFTToRenter(rentalId);
        vm.stopPrank();

        // 4. Renter (attacker) approves the rental contract to get the NFT back
        vm.startPrank(renter);
        mockERC721.approve(address(collateralRegistry), TOKEN_ID);
        vm.stopPrank();
    }

    function test_reentrancy_attack_on_return() public {
        // Arrange
        _initiateAndDeposit();

        // Act & Assert
        // We expect the call to revert because of the ReentrancyGuard
        vm.startPrank(renter);
        vm.expectRevert(
            CollateralRegistry.CollateralRegistry__PaymentFailed.selector
        );
        attacker.attack();
        vm.stopPrank();
    }
} 