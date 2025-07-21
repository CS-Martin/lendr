// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CollateralRentalAgreement} from './CollateralRentalAgreement.sol';
import {RentalEnums} from './libraries/RentalEnums.sol';

/**
 * @title Collateral Agreement Factory
 * @dev This contract is responsible for creating CollateralRentalAgreement instances.
 * It is owned by the LendrRentalSystem and is deployed by it.
 */
contract CollateralAgreementFactory {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error CollateralAgreementFactory__NotOwner();

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public immutable i_owner;

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert CollateralAgreementFactory__NotOwner();
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
     * @notice Creates a new collateral rental agreement contract.
     * @param _lender The address of the NFT owner (lender).
     * @param _nftContract The contract address of the NFT to be rented.
     * @param _tokenId The ID of the NFT to be rented.
     * @param _hourlyRentalFee The rental fee per hour in wei.
     * @param _collateral The collateral amount in wei (for collateral-based rentals).
     * @param _rentalDurationInHours The total duration of the rental in hours.
     * @param _nftStandard The NFT standard of the token. See {RentalEnums.NftStandard}.
     * @param _dealDuration The deadline for the lender to deposit the NFT. See {RentalEnums.DealDuration}.
     * @return The address of the newly created rental agreement contract.
     */
    function createCollateralRentalAgreement(
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _collateral,
        uint256 _rentalDurationInHours,
        RentalEnums.NftStandard _nftStandard,
        RentalEnums.DealDuration _dealDuration
    ) external onlyOwner returns (address) {
        CollateralRentalAgreement rentalAgreement = new CollateralRentalAgreement(
            _lender,
            _nftContract,
            _tokenId,
            _hourlyRentalFee,
            _collateral,
            _rentalDurationInHours,
            _nftStandard,
            _dealDuration
        );
        return address(rentalAgreement);
    }
} 