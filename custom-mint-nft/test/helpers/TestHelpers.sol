// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { CustomNFTCollection } from '../../src/CustomNFTCollection.sol';

/**
 * @title TestHelpers
 * @notice Helper functions and utilities for testing
 */
library TestHelpers {
  /**
   * @dev Create sample gaming attributes for testing
   */
  function createGamingAttributes() internal pure returns (CustomNFTCollection.AttributeKV[] memory) {
    CustomNFTCollection.AttributeKV[] memory attrs = new CustomNFTCollection.AttributeKV[](5);
    attrs[0] = CustomNFTCollection.AttributeKV({ key: 'Type', value: 'Weapon' });
    attrs[1] = CustomNFTCollection.AttributeKV({ key: 'Rarity', value: 'Legendary' });
    attrs[2] = CustomNFTCollection.AttributeKV({ key: 'Attack', value: '150' });
    attrs[3] = CustomNFTCollection.AttributeKV({ key: 'Element', value: 'Fire' });
    attrs[4] = CustomNFTCollection.AttributeKV({ key: 'Durability', value: '100' });
    return attrs;
  }

  /**
   * @dev Create sample art attributes for testing
   */
  function createArtAttributes() internal pure returns (CustomNFTCollection.AttributeKV[] memory) {
    CustomNFTCollection.AttributeKV[] memory attrs = new CustomNFTCollection.AttributeKV[](4);
    attrs[0] = CustomNFTCollection.AttributeKV({ key: 'Artist', value: 'Digital Picasso' });
    attrs[1] = CustomNFTCollection.AttributeKV({ key: 'Medium', value: 'Digital Oil' });
    attrs[2] = CustomNFTCollection.AttributeKV({ key: 'Year', value: '2024' });
    attrs[3] = CustomNFTCollection.AttributeKV({ key: 'Style', value: 'Abstract' });
    return attrs;
  }

  /**
   * @dev Create attributes with special characters for testing JSON encoding
   */
  function createSpecialCharAttributes() internal pure returns (CustomNFTCollection.AttributeKV[] memory) {
    CustomNFTCollection.AttributeKV[] memory attrs = new CustomNFTCollection.AttributeKV[](3);
    attrs[0] = CustomNFTCollection.AttributeKV({ key: 'Quotes', value: 'Value with "quotes"' });
    attrs[1] = CustomNFTCollection.AttributeKV({ key: 'Backslashes', value: 'Path\\to\\file' });
    attrs[2] = CustomNFTCollection.AttributeKV({ key: 'Unicode', value: unicode'Café ☕ 🎨' });
    return attrs;
  }

  /**
   * @dev Create empty attributes array
   */
  function createEmptyAttributes() internal pure returns (CustomNFTCollection.AttributeKV[] memory) {
    return new CustomNFTCollection.AttributeKV[](0);
  }

  /**
   * @dev Create many attributes for stress testing
   */
  function createManyAttributes(uint256 count) internal pure returns (CustomNFTCollection.AttributeKV[] memory) {
    CustomNFTCollection.AttributeKV[] memory attrs = new CustomNFTCollection.AttributeKV[](count);
    for (uint256 i = 0; i < count; i++) {
      attrs[i] = CustomNFTCollection.AttributeKV({
        key: string.concat('Key_', _toString(i)),
        value: string.concat('Value_', _toString(i))
      });
    }
    return attrs;
  }

  /**
   * @dev Convert uint256 to string (simple implementation for testing)
   */
  function _toString(uint256 value) internal pure returns (string memory) {
    if (value == 0) {
      return '0';
    }
    uint256 temp = value;
    uint256 digits;
    while (temp != 0) {
      digits++;
      temp /= 10;
    }
    bytes memory buffer = new bytes(digits);
    while (value != 0) {
      digits -= 1;
      buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
      value /= 10;
    }
    return string(buffer);
  }
}

/**
 * @title MockNFTReceiver
 * @notice Mock contract for testing ERC721 transfers
 */
contract MockNFTReceiver {
  function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
    return this.onERC721Received.selector;
  }
}

/**
 * @title MockFailingReceiver
 * @notice Mock contract that fails to receive NFTs (for testing)
 */
contract MockFailingReceiver {
  function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
    return 0x00000000; // Wrong selector
  }
}
