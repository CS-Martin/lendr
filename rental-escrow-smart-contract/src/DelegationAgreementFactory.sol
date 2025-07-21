// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {DelegationRentalAgreement} from './DelegationRentalAgreement.sol';
import {RentalEnums} from './libraries/RentalEnums.sol';
import {DelegationRegistry} from './DelegationRegistryERC1155ERC721.sol';

/**
 * @title Delegation Agreement Factory
 * @author Selwyn John G. Guiruela
 * @dev This contract is responsible for creating DelegationRentalAgreement instances.
 * It is owned by the LendrRentalSystem and is deployed by it.
 */
contract DelegationAgreementFactory {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error DelegationAgreementFactory__NotOwner();

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public immutable i_owner;

    /*//////////////////////////////////////////////////////////////
                              MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyOwner() {
        if (msg.sender != i_owner) {
            revert DelegationAgreementFactory__NotOwner();
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
     * @notice Creates a new delegation rental agreement contract.
     * @param _lender The address of the NFT owner (lender).
     * @param _nftContract The contract address of the NFT to be rented.
     * @param _tokenId The ID of the NFT to be rented.
     * @param _hourlyRentalFee The rental fee per hour in wei.
     * @param _rentalDurationInHours The total duration of the rental in hours.
     * @param _nftStandard The NFT standard of the token. See {RentalEnums.NftStandard}.
     * @param _dealDuration The deadline for the lender to deposit the NFT. See {RentalEnums.DealDuration}.
     * @param _registryToUse The address of the delegation registry to use.
     * @return The address of the newly created delegation rental agreement contract.
     */
    function createDelegationRentalAgreement(
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _rentalDurationInHours,
        RentalEnums.NftStandard _nftStandard,
        RentalEnums.DealDuration _dealDuration,
        DelegationRegistry _registryToUse
    ) external onlyOwner returns (address) {
        DelegationRentalAgreement rentalAgreement = new DelegationRentalAgreement(
            i_owner, 
            _lender,
            _nftContract,
            _tokenId,
            _hourlyRentalFee,
            _rentalDurationInHours,
            _nftStandard,
            _dealDuration,
            _registryToUse
        );
        return address(rentalAgreement);
    }
} 