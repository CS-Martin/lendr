// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title RejectingReceiver
/// @notice A mock contract designed to always revert when it receives Ether.
/// @dev This is used in tests to simulate failed payment transfers.
contract RejectingReceiver {
    error RentalAgreement__PaymentFailed();
    /**
     * @dev This receive function is intentionally implemented to always revert.
     * It allows us to test the error handling of contracts that send Ether
     * to an external address, ensuring they behave correctly when a payment fails.
     */
    receive() external payable {
        revert RentalAgreement__PaymentFailed();
    }
}
