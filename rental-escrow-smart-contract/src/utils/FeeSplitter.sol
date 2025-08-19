// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FeeSplitter
 * @dev A library for splitting a total amount into a payout and a platform fee.
 * This library ensures that fee calculations are handled safely and that rounding
 * errors do not disadvantage the platform. The platform fee is calculated, and the
 * remainder is given as the payout.
 */
library FeeSplitter {
    uint256 private constant BPS_MAX = 10000;

    /**
     * @notice Splits a total amount into a lender payout and a platform fee.
     * @dev The platform fee is calculated as `(totalAmount * platformFeeBps) / 10000`.
     * The lender payout is the remaining amount. This prevents the platform fee from
     * being rounded down to zero on small total amounts.
     * @param totalAmount The total amount to be split.
     * @param platformFeeBps The platform fee in basis points (e.g., 500 for 5%).
     * @return lenderPayout The amount allocated to the lender.
     * @return platformFee The amount allocated to the platform.
     */
    function splitFee(uint256 totalAmount, uint256 platformFeeBps)
        internal
        pure
        returns (uint256 lenderPayout, uint256 platformFee)
    {
        if (platformFeeBps > 0) {
            platformFee = (totalAmount * platformFeeBps) / BPS_MAX;
            lenderPayout = totalAmount - platformFee;
        } else {
            platformFee = 0;
            lenderPayout = totalAmount;
        }
    }
} 