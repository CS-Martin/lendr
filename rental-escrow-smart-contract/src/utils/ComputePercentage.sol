// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {Math} from '@openzeppelin/contracts/utils/math/Math.sol';

/**
 * @title FeeCalculator Library
 * @notice A library to safely calculate fees using basis points.
 * This library uses OpenZeppelin's Math.mulDiv to prevent overflow
 * and provide more precise fee calculations.
 */
library FeeCalculator {
    // The basis for percentage calculations, equivalent to 100.00%.
    // 1 basis point (bps) = 0.01%.
    uint256 constant BASIS_POINTS = 10_000;

    /**
     * @notice Calculates the fee for a given amount.
     * @param _amount The base amount to calculate the fee from.
     * @param _feeBps The fee in basis points (e.g., 500 for 5%).
     * @return The calculated fee amount.
     */
    function calculateFee(
        uint256 _amount,
        uint256 _feeBps
    ) internal pure returns (uint256) {
        // Using Math.mulDiv for safe multiplication and division
        return Math.mulDiv(_amount, _feeBps, BASIS_POINTS);
    }

    /**
     * @notice Calculates the bounty amount and fee from a total amount.
     * @param _totalAmount The total amount including the fee.
     * @param _feeBps The fee in basis points.
     * @return bountyAmount The amount allocated for the bounty.
     * @return fee The calculated fee amount.
     */
    function calculateBountyAndFee(
        uint256 _totalAmount,
        uint256 _feeBps
    ) internal pure returns (uint256 bountyAmount, uint256 fee) {
        uint256 denominator = BASIS_POINTS + _feeBps;
        bountyAmount = Math.mulDiv(_totalAmount, BASIS_POINTS, denominator);
        fee = _totalAmount - bountyAmount;
    }
}
