// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {DelegationRentalAgreement} from '../../src/DelegationRentalAgreement.sol';

/// @title MaliciousAttacker
/// @notice A mock contract to test re-entrancy vulnerabilities in DelegationRentalAgreement.
/// @dev This contract attempts to re-enter the reportBreach function.
contract MaliciousAttacker {
    DelegationRentalAgreement public immutable rentalAgreement;

    constructor(address rentalAgreementAddress) {
        rentalAgreement = DelegationRentalAgreement(rentalAgreementAddress);
    }

    /// @notice The entry point for the attack. It calls the target contract's function.
    function attack() external {
        rentalAgreement.reportBreach();
    }

    /// @dev When this contract receives Ether from the refund in reportBreach,
    /// it tries to call reportBreach() again. The ReentrancyGuard in the
    //  target contract should prevent this.
    receive() external payable {
        rentalAgreement.reportBreach();
    }
}
