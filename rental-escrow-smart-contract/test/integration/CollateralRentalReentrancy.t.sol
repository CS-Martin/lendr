// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from 'forge-std/Test.sol';
import {CollateralRentalAgreement} from '../../src/CollateralRentalAgreement.sol';
import {LendrRentalSystem} from '../../src/LendrRentalSystem.sol';
import {RentalEnums} from '../../src/libraries/RentalEnums.sol';
import {ERC721Mock} from '../mocks/ERC721Mock.sol';
import {Attacker} from '../mocks/Attacker.sol';

contract CollateralRentalReentrancyTest is Test {
    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    LendrRentalSystem internal lendrRentalSystem;
    CollateralRentalAgreement internal collateralRentalAgreement;
    ERC721Mock internal mockERC721;
    Attacker internal attacker;

    // Users
    address internal lender = makeAddr('lender');
    address internal renter; // The attacker contract will be the renter

    // NFT details
    uint256 internal constant TOKEN_ID = 1;

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
        vm.stopPrank();

        // Deploy and setup ERC721 mock
        mockERC721 = new ERC721Mock('MockERC721', 'M721');
        mockERC721.mint(lender, TOKEN_ID);

        // Create a collateral rental agreement for an ERC721 token
        vm.startPrank(lender);
        address agreementAddress =
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
        collateralRentalAgreement = CollateralRentalAgreement(agreementAddress);
        vm.stopPrank();

        // Deploy the attacker contract
        attacker = new Attacker(address(collateralRentalAgreement));
        renter = address(attacker);
    }

    function _initiateAndDeposit() internal {
        // 1. Renter (attacker) initiates the rental
        uint256 totalPayment =
            collateralRentalAgreement.getTotalRentalFeeWithCollateral();
        vm.deal(renter, totalPayment);
        vm.startPrank(renter);
        collateralRentalAgreement.initiateRental{value: totalPayment}();
        vm.stopPrank();

        // 2. Lender deposits the NFT
        vm.startPrank(lender);
        mockERC721.approve(address(collateralRentalAgreement), TOKEN_ID);
        collateralRentalAgreement.depositNFTByLender();
        vm.stopPrank();

        // 3. Renter (attacker) releases the NFT
        vm.startPrank(renter);
        collateralRentalAgreement.releaseNFTToRenter();
        vm.stopPrank();

        // 4. Renter (attacker) approves the rental contract to get the NFT back
        vm.startPrank(renter);
        mockERC721.approve(address(collateralRentalAgreement), TOKEN_ID);
        vm.stopPrank();
    }

    function test_reentrancy_attack_on_return() public {
        // Arrange
        _initiateAndDeposit();

        // Act & Assert
        // We expect the call to revert because of the ReentrancyGuard
        vm.startPrank(renter);
        vm.expectRevert(CollateralRentalAgreement.RentalAgreement__PaymentFailed.selector);
        attacker.attack();
        vm.stopPrank();
    }
} 