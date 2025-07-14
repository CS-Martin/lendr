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
    error LendrRentalSystem__ZeroAddress();
    error LendrRentalSystem__FeeMustBeGreaterThanZero();
    error LendrRentalSystem__InvalidRentalType();
    error LendrRentalSystem__InvalidNftStandard();
    error LendrRentalSystem__InvalidDepositDeadline();

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

    /**
     * @notice Creates a new rental agreement contract.
     * @param _lender The address of the NFT owner (lender).
     * @param _nftContract The contract address of the NFT to be rented.
     * @param _tokenId The ID of the NFT to be rented.
     * @param _hourlyRentalFee The rental fee per hour in wei.
     * @param _collateral The collateral amount in wei (for collateral-based rentals).
     * @param _rentalDurationInHours The total duration of the rental in hours.
     * @param _rentalType The type of rental. See {RentalAgreement.RentalType}.
     * @param _nftStandard The NFT standard of the token. See {RentalAgreement.NftStandard}.
     * @param _depositDeadline The deadline for the lender to deposit the NFT. See {RentalAgreement.NFTDepositDuration}.
     * @return The address of the newly created rental agreement contract.
     */
    function createRentalAgreement(
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _collateral,
        uint256 _rentalDurationInHours,
        RentalAgreement.RentalType _rentalType,
        RentalAgreement.NftStandard _nftStandard,
        RentalAgreement.NFTDepositDuration _depositDeadline
    ) external returns (address) {
        if (_lender == address(0)) {
            revert LendrRentalSystem__ZeroAddress();
        }
        if (_nftContract == address(0)) {
            revert LendrRentalSystem__ZeroAddress();
        }
        if (_hourlyRentalFee == 0) {
            revert LendrRentalSystem__FeeMustBeGreaterThanZero();
        }
        if (uint8(_rentalType) > uint8(RentalAgreement.RentalType.DELEGATION)) {
            revert LendrRentalSystem__InvalidRentalType();
        }
        if (uint8(_nftStandard) > uint8(RentalAgreement.NftStandard.ERC4907)) {
            revert LendrRentalSystem__InvalidNftStandard();
        }
        if (uint8(_depositDeadline) > uint8(RentalAgreement.NFTDepositDuration.ONE_WEEK)) {
            revert LendrRentalSystem__InvalidDepositDeadline();
        }

        s_totalRentals++;
        uint256 rentalId = s_totalRentals;

        RentalAgreement rentalAgreement = new RentalAgreement(
            _lender,
            _nftContract,
            _tokenId,
            _hourlyRentalFee,
            _collateral,
            _rentalDurationInHours,
            _rentalType,
            _nftStandard,
            _depositDeadline
        );
        
        s_rentalAgreementById[rentalId] = address(rentalAgreement);

        emit RentalAgreementCreated(
            rentalId,
            address(rentalAgreement),
            _lender,
            _nftContract,
            _tokenId
        );

        return address(rentalAgreement);
    }
}
