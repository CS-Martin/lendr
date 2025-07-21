// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {FeeSplitter} from "../../src/utils/FeeSplitter.sol";

// Wrapper contract to allow testing reverts on internal library functions.
contract FeeSplitterWrapper {
    function splitFee(uint256 totalAmount, uint256 platformFeeBps) public pure returns (uint256, uint256) {
        return FeeSplitter.splitFee(totalAmount, platformFeeBps);
    }
}

/**
 * @title FeeSplitterTest
 * @dev Unit tests for the FeeSplitter library.
 * This test suite verifies the fee splitting logic under various conditions.
 */
contract FeeSplitterTest is Test {
    FeeSplitterWrapper internal wrapper;

    function setUp() public {
        wrapper = new FeeSplitterWrapper();
    }

    /**
     * @notice Tests that if the platform fee is zero, the entire amount goes to the lender.
     */
    function test_splitFee_zeroFee() public pure {
        uint256 totalAmount = 100 ether;
        uint256 platformFeeBps = 0;
        (uint256 lenderPayout, uint256 platformFee) = FeeSplitter.splitFee(totalAmount, platformFeeBps);

        assertEq(lenderPayout, totalAmount, "Lender payout should be the total amount when fee is zero");
        assertEq(platformFee, 0, "Platform fee should be zero when fee is zero");
    }

    /**
     * @notice Tests fee splitting with a non-zero platform fee.
     */
    function test_splitFee_nonZeroFee() public pure {
        uint256 totalAmount = 100 ether;
        uint256 platformFeeBps = 500; // 5%
        (uint256 lenderPayout, uint256 platformFee) = FeeSplitter.splitFee(totalAmount, platformFeeBps);

        uint256 expectedPlatformFee = (totalAmount * platformFeeBps) / 10000;
        uint256 expectedLenderPayout = totalAmount - expectedPlatformFee;

        assertEq(lenderPayout, expectedLenderPayout, "Lender payout is incorrect");
        assertEq(platformFee, expectedPlatformFee, "Platform fee is incorrect");
    }

    /**
     * @notice Tests the rounding behavior of the fee calculation.
     * @dev The platform fee calculation uses integer division, which rounds down (truncates).
     */
    function test_splitFee_rounding() public pure {
        // With totalAmount = 9999 and platformFeeBps = 1 (0.01%), fee is 9999 / 10000 = 0.
        uint256 totalAmount1 = 9999;
        uint256 platformFeeBps = 1; // 0.01%
        (uint256 lenderPayout1, uint256 platformFee1) = FeeSplitter.splitFee(totalAmount1, platformFeeBps);

        assertEq(platformFee1, 0, "Platform fee should be 0 due to rounding down");
        assertEq(lenderPayout1, totalAmount1, "Lender payout should be total amount when fee rounds to 0");

        // With totalAmount = 10000 and platformFeeBps = 1 (0.01%), fee is 10000 / 10000 = 1.
        uint256 totalAmount2 = 10000;
        (uint256 lenderPayout2, uint256 platformFee2) = FeeSplitter.splitFee(totalAmount2, platformFeeBps);

        assertEq(platformFee2, 1, "Platform fee should be 1 after rounding");
        assertEq(lenderPayout2, 9999, "Lender payout should be correct after rounding");
    }

    /**
     * @notice Tests that splitting a zero total amount results in zero payout and zero fee.
     */
    function test_splitFee_zeroTotalAmount() public pure {
        uint256 totalAmount = 0;
        uint256 platformFeeBps = 500; // 5%
        (uint256 lenderPayout, uint256 platformFee) = FeeSplitter.splitFee(totalAmount, platformFeeBps);

        assertEq(lenderPayout, 0, "Lender payout should be 0 for zero total amount");
        assertEq(platformFee, 0, "Platform fee should be 0 for zero total amount");
    }

    /**
     * @notice Tests a 100% platform fee, where the entire amount goes to the platform.
     */
    function test_splitFee_fullFee() public pure {
        uint256 totalAmount = 100 ether;
        uint256 platformFeeBps = 10000; // 100%
        (uint256 lenderPayout, uint256 platformFee) = FeeSplitter.splitFee(totalAmount, platformFeeBps);

        assertEq(lenderPayout, 0, "Lender payout should be 0 for 100% fee");
        assertEq(platformFee, totalAmount, "Platform fee should be total amount for 100% fee");
    }

    /**
     * @notice Tests fee splitting with a large total amount to check for potential overflows.
     */
    function test_splitFee_largeAmount() public pure {
        // Use a large number that will not cause overflow with a 100% fee.
        uint256 totalAmount = type(uint256).max / 10000;
        uint256 platformFeeBps = 10000; // 100%

        (uint256 lenderPayout, uint256 platformFee) = FeeSplitter.splitFee(totalAmount, platformFeeBps);

        assertEq(lenderPayout, 0, "Lender payout should be 0 for large amount and 100% fee");
        assertEq(platformFee, totalAmount, "Platform fee should be total amount for large amount and 100% fee");
    }

    /**
     * @notice Tests that the function reverts if the platform fee basis points exceed 10000 (100%).
     * @dev This should cause an arithmetic underflow on Solidity >=0.8.0.
     */
    function test_revert_splitFee_feeGreaterThan100Percent() public {
        uint256 totalAmount = 100 ether;
        uint256 platformFeeBps = 10001; // > 100%

        // The subtraction `totalAmount - platformFee` will underflow, causing a revert.
        vm.expectRevert();
        wrapper.splitFee(totalAmount, platformFeeBps);
    }

    /**
     * @notice Tests that the function reverts on multiplication overflow with a large total amount.
     * @dev This should cause an arithmetic overflow on Solidity >=0.8.0.
     */
    function test_revert_splitFee_largeAmount_overflow() public {
        uint256 totalAmount = type(uint256).max;
        uint256 platformFeeBps = 2; // Any value > 1 will cause overflow

        vm.expectRevert();
        wrapper.splitFee(totalAmount, platformFeeBps);
    }
}
