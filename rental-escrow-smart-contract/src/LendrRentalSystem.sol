// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RentalAgreement} from './RentalAgreement.sol';
import {FeeCalculator} from './utils/ComputePercentage.sol';

/**
 * @title Rental System
 * @author Selwyn John G. Guiruela
 * @dev This is the main factory contract for the rental platform.
 * It allows lenders to create new rental agreements and allows the platform
 * owner to manage system-wide parameters like fees.
 */

contract LendrRentalSystem {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error LendrRentalSystem__NotDeployer(address sender);

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public immutable i_deployer;
    uint256 public s_feeBps; // base fee in basis points. 500 basis points = 5%.
    mapping(uint256 => address) public s_rentalAgreementById;
    uint256 public s_totalRentals;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event RentalAgreementCreated(
        uint256 indexed rentalId,
        address indexed agreementAddress,
        address indexed lender,
        address nftContract,
        uint256 tokenId
    );
    event FeeUpdated(uint256 newFeePercent);

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/
    /**
     * @notice Restricts a function to be callable only by the contract owner.
     */
    modifier onlyDeployer() {
        if (msg.sender != i_deployer) {
            revert LendrRentalSystem__NotDeployer(msg.sender);
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    /**
     * @notice Initializes the contract with the deployer as the owner.
     * @dev The initial platform fee is based on a basis fee where 500 = 5%.
     */
    constructor(uint256 initialPlatformFeePercentInBps) {
        i_deployer = msg.sender;
        s_feeBps = initialPlatformFeePercentInBps;
    }

    /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @notice Sets the platform fee in basis points.
     * @dev 500 bps = 5%
     * @param newFeeBps The new fee in basis points.
     */
    function setFeeBps(uint256 newFeeBps) external onlyDeployer {
        s_feeBps = newFeeBps;
        emit FeeUpdated(newFeeBps);
    }

    function createRentalAgreement(
        address _nftContract,
        uint256 _tokenId,
        uint256 _rentalFee,
        uint256 _collateral,
        uint256 _rentalDuration
    ) external returns (address) {
        s_totalRentals++;
        // deploy a new RentalAgreement contract
    }
}
