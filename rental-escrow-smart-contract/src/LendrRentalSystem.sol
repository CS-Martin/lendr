// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {RentalEnums} from './libraries/RentalEnums.sol';
import {DelegationRegistry} from './DelegationRegistry.sol';
import {CollateralRegistry} from './CollateralRegistry.sol';

/**
 * @title Lendr Rental System
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
    error LendrRentalSystem__InvalidNftStandard();
    error LendrRentalSystem__InvalidDepositDeadline();
    error LendrRentalSystem__RentalDurationMustBeGreaterThanZero();
    error LendrRentalSystem__NotLender();
    error LendrRentalSystem__CollateralMustBeGreaterThanZero();
    error LendrRentalSystem__WithdrawFailed();

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    address public immutable i_deployer;
    uint256 public s_feeBps; // base fee in basis points. 500 basis points = 5%.
    mapping(uint256 => address) public s_collateralRentalAgreementById;
    uint256 public s_totalRentals;
    DelegationRegistry public immutable i_delegationRegistry;
    CollateralRegistry public immutable i_collateralRegistry;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event CollateralRentalAgreementCreated(
        uint256 indexed rentalId,
        address indexed lender,
        address nftContract,
        uint256 tokenId,
        uint256 hourlyRentalFee,
        uint256 collateral,
        uint256 rentalDurationInHours,
        RentalEnums.NftStandard nftStandard,
        RentalEnums.DealDuration dealDuration
    );
    event DelegationRentalAgreementCreated(
        uint256 indexed rentalId,
        address lender,
        address nftContract,
        uint256 tokenId,
        uint256 hourlyRentalFee,
        uint256 rentalDurationInHours,
        RentalEnums.NftStandard nftStandard,
        RentalEnums.DealDuration dealDuration
    );
    event FeeUpdated(uint256 newFeePercent);
    event Withdrawn(address indexed recipient, uint256 amount);
    event RegistriesDeployed(address indexed delegationRegistry, address indexed collateralRegistry);

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
        i_delegationRegistry = new DelegationRegistry();
        i_collateralRegistry = new CollateralRegistry();
        i_delegationRegistry.addAuthorized(address(this));
        i_collateralRegistry.addAuthorized(address(this));
        emit RegistriesDeployed(address(i_delegationRegistry), address(i_collateralRegistry));
    }

    /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @notice Allows the contract to receive Ether.
     * @dev This is necessary for rental agreements to forward fees to this contract.
     */
    receive() external payable {}

    function withdraw() external onlyDeployer {
        uint256 amount = address(this).balance;
        (bool success, ) = payable(i_deployer).call{value: amount}("");
        if (!success) revert LendrRentalSystem__WithdrawFailed();
        emit Withdrawn(i_deployer, amount);
    }

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
    ) external returns (address) {
        _validateRentalParameters(
            _lender,
            _nftContract,
            _hourlyRentalFee,
            _rentalDurationInHours,
            uint8(_nftStandard),
            uint8(RentalEnums.NftStandard._MAX),
            uint8(_dealDuration),
            uint8(RentalEnums.DealDuration._MAX)
        );

        if (_collateral == 0) {
            revert LendrRentalSystem__CollateralMustBeGreaterThanZero();
        }

        s_totalRentals++;
        uint256 rentalId = s_totalRentals;

        i_collateralRegistry.createAgreement(
            rentalId,
            _lender,
            _nftContract,
            _tokenId,
            _hourlyRentalFee,
            _collateral,
            _rentalDurationInHours,
            _nftStandard,
            _dealDuration
        );

        address agreementAddress = address(i_collateralRegistry);
        s_collateralRentalAgreementById[rentalId] = agreementAddress;

        emit CollateralRentalAgreementCreated(
            rentalId,
            _lender,
            _nftContract,
            _tokenId,
            _hourlyRentalFee,
            _collateral,
            _rentalDurationInHours,
            _nftStandard,
            _dealDuration
        );

        return agreementAddress;
    }

    /**
     * @notice Creates a new delegation rental agreement contract.
     * @param _lender The address of the NFT owner (lender).
     * @param _nftContract The contract address of the NFT to be rented.
     * @param _tokenId The ID of the NFT to be rented.
     * @param _hourlyRentalFee The rental fee per hour in wei.
     * @param _rentalDurationInHours The total duration of the rental in hours.
     * @param _nftStandard The NFT standard of the token. See {RentalEnums.NftStandard}.
     * @param _dealDuration The deadline for the lender to deposit the NFT. See {RentalEnums.DealDuration}.
     * @return The address of the newly created delegation rental agreement contract.
     */
    function createDelegationRentalAgreement(
        address _lender,
        address _nftContract,
        uint256 _tokenId,
        uint256 _hourlyRentalFee,
        uint256 _rentalDurationInHours,
        RentalEnums.NftStandard _nftStandard,
        RentalEnums.DealDuration _dealDuration
    ) external returns (address) {
        _validateRentalParameters(
            _lender,
            _nftContract,
            _hourlyRentalFee,
            _rentalDurationInHours,
            uint8(_nftStandard),
            uint8(RentalEnums.NftStandard._MAX),
            uint8(_dealDuration),
            uint8(RentalEnums.DealDuration._MAX)
        );

        s_totalRentals++;
        uint256 rentalId = s_totalRentals;

        i_delegationRegistry.createRentalAgreement(
            rentalId,
            _lender,
            _nftContract,
            _tokenId,
            _hourlyRentalFee,
            _rentalDurationInHours,
            _nftStandard,
            _dealDuration
        );

        emit DelegationRentalAgreementCreated(
            rentalId,
            _lender,
            _nftContract,
            _tokenId,
            _hourlyRentalFee,
            _rentalDurationInHours,
            _nftStandard,
            _dealDuration
        );

        return address(i_delegationRegistry);
    }

    /*//////////////////////////////////////////////////////////////
                        INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _validateRentalParameters(
        address _lender,
        address _nftContract,
        uint256 _hourlyRentalFee,
        uint256 _rentalDurationInHours,
        uint8 _nftStandard,
        uint8 _nftStandardMax,
        uint8 _dealDuration,
        uint8 _dealDurationMax
    ) internal view {
        if (msg.sender != _lender) {
            revert LendrRentalSystem__NotLender();
        }
        if (_lender == address(0)) {
            revert LendrRentalSystem__ZeroAddress();
        }
        if (_nftContract == address(0)) {
            revert LendrRentalSystem__ZeroAddress();
        }
        if (_hourlyRentalFee == 0) {
            revert LendrRentalSystem__FeeMustBeGreaterThanZero();
        }
        if (_rentalDurationInHours == 0) {
            revert LendrRentalSystem__RentalDurationMustBeGreaterThanZero();
        }
        if (_nftStandard >= _nftStandardMax) {
            revert LendrRentalSystem__InvalidNftStandard();
        }
        if (_dealDuration >= _dealDurationMax) {
            revert LendrRentalSystem__InvalidDepositDeadline();
        }
    }
}