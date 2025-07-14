// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TimeConverter
 * @dev A library for safe and clear time unit conversions.
 * This helps avoid magic numbers and ensures consistency when handling
 * time-based calculations.
 */
library TimeConverter {
    /**
     * @notice Converts a duration from hours to seconds.
     * @param _hours The number of hours to convert.
     * @return The equivalent duration in seconds.
     */
    function hoursToSeconds(uint256 _hours) internal pure returns (uint256) {
        // Use Solidity's `hours` keyword for clarity and safety.
        // 1 hours is a literal that evaluates to 3600.

        unchecked {
            return _hours * 1 hours;
        }
    }
} 