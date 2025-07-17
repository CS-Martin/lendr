// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RentalEnums
 * @dev A shared library for enums used across the rental system.
 * This library centralizes common type definitions to ensure consistency
 * and improve maintainability.
 */
library RentalEnums {
    enum NftStandard {
        ERC721,
        ERC1155,
        ERC4907,
        _MAX // Used for validation to ensure the provided standard is valid.
    }

    enum DealDuration {
        SIX_HOURS,
        TWELVE_HOURS,
        ONE_DAY,
        THREE_DAYS,
        ONE_WEEK,
        _MAX // Used for validation to ensure the provided duration is valid.
    }
}