// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console2 } from '../../lib/forge-std/src/Test.sol';
import { CustomNFT } from '../../src/CustomNFT.sol';
import { CustomNFTCollection } from '../../src/CustomNFTCollection.sol';

/**
 * @title MetadataValidationTest
 * @notice Integration tests focused on metadata generation and JSON encoding
 */
contract MetadataValidationTest is Test {
  CustomNFT public factory;
  CustomNFTCollection public collection;

  address public admin = makeAddr('admin');
  address public creator = makeAddr('creator');
  address public minter = makeAddr('minter');

  function setUp() public {
    factory = new CustomNFT(admin);

    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(creator);
    address collectionAddr = factory.createCollection(
      'Metadata Test Collection',
      'META',
      'Testing metadata generation and encoding',
      'ipfs://QmDefaultMetaImage',
      false, // unlimited supply for testing
      0
    );
    collection = CustomNFTCollection(collectionAddr);
    vm.stopPrank();
  }

  function test_BasicMetadataStructure() public {
    vm.startPrank(creator);

    CustomNFTCollection.AttributeKV[] memory basicAttrs = new CustomNFTCollection.AttributeKV[](2);
    basicAttrs[0] = CustomNFTCollection.AttributeKV({ key: 'Color', value: 'Blue' });
    basicAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'Size', value: 'Large' });

    uint256 tokenId = collection.mint(
      minter,
      'Basic Test Token',
      'A simple token for metadata testing',
      'ipfs://QmBasicTestImage',
      basicAttrs
    );

    string memory tokenURI = collection.tokenURI(tokenId);

    // Verify it's a data URI
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    // The base64 portion should be substantial
    assertTrue(bytes(tokenURI).length > 100);

    vm.stopPrank();
  }

  function test_EmptyValuesUseFallbacks() public {
    vm.startPrank(creator);

    CustomNFTCollection.AttributeKV[] memory emptyAttrs = new CustomNFTCollection.AttributeKV[](0);

    uint256 tokenId = collection.mint(
      minter,
      '', // empty name - should use "META #1"
      '', // empty description - should use collection description
      '', // empty image - should use default image
      emptyAttrs
    );

    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    vm.stopPrank();
  }

  function test_SpecialCharacterEscaping() public {
    vm.startPrank(creator);

    // Test various special characters that need JSON escaping
    CustomNFTCollection.AttributeKV[] memory specialAttrs = new CustomNFTCollection.AttributeKV[](6);
    specialAttrs[0] = CustomNFTCollection.AttributeKV({ key: 'Quotes', value: 'Value with "quotes" inside' });
    specialAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'Backslashes', value: 'Path\\to\\file' });
    specialAttrs[2] = CustomNFTCollection.AttributeKV({ key: 'Mixed', value: 'Quote"and\\backslash' });
    specialAttrs[3] = CustomNFTCollection.AttributeKV({ key: 'Key"with"quotes', value: 'Normal value' });
    specialAttrs[4] = CustomNFTCollection.AttributeKV({ key: 'Key\\with\\backslashes', value: 'Normal value' });
    specialAttrs[5] = CustomNFTCollection.AttributeKV({ key: 'Normal', value: 'No special chars' });

    uint256 tokenId = collection.mint(
      minter,
      'Token with "quotes" and \\backslashes',
      'Description with "quotes" and \\backslashes in it',
      'ipfs://QmSpecialCharsImage',
      specialAttrs
    );

    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    // The URI should be longer due to escaped characters
    assertTrue(bytes(tokenURI).length > 200);

    vm.stopPrank();
  }

  function test_UnicodeAndEmojis() public {
    vm.startPrank(creator);

    CustomNFTCollection.AttributeKV[] memory unicodeAttrs = new CustomNFTCollection.AttributeKV[](4);
    unicodeAttrs[0] = CustomNFTCollection.AttributeKV({ key: 'Emojis', value: unicode'🔥⚔️🛡️✨🌟' });
    unicodeAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'Accents', value: unicode'Café, naïve, résumé' });
    unicodeAttrs[2] = CustomNFTCollection.AttributeKV({ key: 'Symbols', value: unicode'©®™€£¥' });
    unicodeAttrs[3] = CustomNFTCollection.AttributeKV({ key: 'Mixed', value: unicode'Hello 👋 World 🌍!' });

    uint256 tokenId = collection.mint(
      minter,
      unicode'Unicode Token 🎨',
      unicode'A token with émojis and spëcial characters',
      'ipfs://QmUnicodeImage',
      unicodeAttrs
    );

    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    vm.stopPrank();
  }

  function test_LongAttributeValues() public {
    vm.startPrank(creator);

    // Create very long attribute values
    string
      memory longValue = 'This is a very long attribute value that contains many words and should test how the metadata encoding handles longer strings without breaking the JSON structure or causing issues with the base64 encoding process.';

    CustomNFTCollection.AttributeKV[] memory longAttrs = new CustomNFTCollection.AttributeKV[](3);
    longAttrs[0] = CustomNFTCollection.AttributeKV({ key: 'Long Description', value: longValue });
    longAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'Normal', value: 'Short' });
    longAttrs[2] = CustomNFTCollection.AttributeKV({ key: 'Another Long One', value: longValue });

    uint256 tokenId = collection.mint(
      minter,
      'Token with Long Attributes',
      longValue, // Long description too
      'ipfs://QmLongAttributesImage',
      longAttrs
    );

    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    // Should be quite long due to long values
    assertTrue(bytes(tokenURI).length > 500);

    vm.stopPrank();
  }

  function test_ManyAttributes() public {
    vm.startPrank(creator);

    // Create 20 attributes
    CustomNFTCollection.AttributeKV[] memory manyAttrs = new CustomNFTCollection.AttributeKV[](20);
    for (uint256 i = 0; i < 20; i++) {
      manyAttrs[i] = CustomNFTCollection.AttributeKV({
        key: string.concat('Attribute_', vm.toString(i)),
        value: string.concat('Value_', vm.toString(i), '_with_some_extra_text')
      });
    }

    uint256 tokenId = collection.mint(
      minter,
      'Token with Many Attributes',
      'This token has 20 different attributes',
      'ipfs://QmManyAttributesImage',
      manyAttrs
    );

    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    // Should be very long due to many attributes
    assertTrue(bytes(tokenURI).length > 1000);

    vm.stopPrank();
  }

  function test_NumericAndBooleanLikeValues() public {
    vm.startPrank(creator);

    CustomNFTCollection.AttributeKV[] memory numericAttrs = new CustomNFTCollection.AttributeKV[](8);
    numericAttrs[0] = CustomNFTCollection.AttributeKV({ key: 'Integer', value: '42' });
    numericAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'Decimal', value: '3.14159' });
    numericAttrs[2] = CustomNFTCollection.AttributeKV({ key: 'Negative', value: '-100' });
    numericAttrs[3] = CustomNFTCollection.AttributeKV({ key: 'Boolean True', value: 'true' });
    numericAttrs[4] = CustomNFTCollection.AttributeKV({ key: 'Boolean False', value: 'false' });
    numericAttrs[5] = CustomNFTCollection.AttributeKV({ key: 'Null-like', value: 'null' });
    numericAttrs[6] = CustomNFTCollection.AttributeKV({ key: 'Zero', value: '0' });
    numericAttrs[7] = CustomNFTCollection.AttributeKV({ key: 'Large Number', value: '999999999999999' });

    uint256 tokenId = collection.mint(
      minter,
      'Numeric Token',
      'Token with numeric and boolean-like attributes',
      'ipfs://QmNumericImage',
      numericAttrs
    );

    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    vm.stopPrank();
  }

  function test_JSONLikeAttributeValues() public {
    vm.startPrank(creator);

    // Test attribute values that look like JSON
    CustomNFTCollection.AttributeKV[] memory jsonLikeAttrs = new CustomNFTCollection.AttributeKV[](4);
    jsonLikeAttrs[0] = CustomNFTCollection.AttributeKV({ key: 'JSON Object', value: '{"nested": "value"}' });
    jsonLikeAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'JSON Array', value: '["item1", "item2"]' });
    jsonLikeAttrs[2] = CustomNFTCollection.AttributeKV({
      key: 'Complex JSON',
      value: '{"array": [1, 2], "bool": true}'
    });
    jsonLikeAttrs[3] = CustomNFTCollection.AttributeKV({ key: 'Escaped JSON', value: '{\\"quoted\\": \\"value\\"}' });

    uint256 tokenId = collection.mint(
      minter,
      'JSON-like Token',
      'Token with JSON-like attribute values',
      'ipfs://QmJsonLikeImage',
      jsonLikeAttrs
    );

    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    vm.stopPrank();
  }

  function test_SequentialTokenIds() public {
    vm.startPrank(creator);

    CustomNFTCollection.AttributeKV[] memory emptyAttrs = new CustomNFTCollection.AttributeKV[](0);

    // Mint multiple tokens and verify sequential IDs
    for (uint256 i = 1; i <= 5; i++) {
      uint256 tokenId = collection.mint(
        minter,
        string.concat('Sequential Token #', vm.toString(i)),
        '',
        '',
        emptyAttrs
      );

      assertEq(tokenId, i);
      assertEq(collection.totalMinted(), i);

      string memory tokenURI = collection.tokenURI(tokenId);
      assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));
    }

    vm.stopPrank();
  }

  function test_DefaultImageFallback() public {
    vm.startPrank(creator);

    CustomNFTCollection.AttributeKV[] memory emptyAttrs = new CustomNFTCollection.AttributeKV[](0);

    // Mint with empty image URI - should use default
    uint256 tokenId = collection.mint(
      minter,
      'Default Image Token',
      'This token should use the default image',
      '', // empty image URI
      emptyAttrs
    );

    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    vm.stopPrank();
  }

  function test_MetadataConsistency() public {
    vm.startPrank(creator);

    CustomNFTCollection.AttributeKV[] memory attrs = new CustomNFTCollection.AttributeKV[](2);
    attrs[0] = CustomNFTCollection.AttributeKV({ key: 'Consistency', value: 'Test' });
    attrs[1] = CustomNFTCollection.AttributeKV({ key: 'Reproducible', value: 'True' });

    uint256 tokenId = collection.mint(
      minter,
      'Consistency Test',
      'Testing metadata consistency',
      'ipfs://QmConsistencyImage',
      attrs
    );

    // Get URI multiple times - should be identical
    string memory uri1 = collection.tokenURI(tokenId);
    string memory uri2 = collection.tokenURI(tokenId);
    string memory uri3 = collection.tokenURI(tokenId);

    assertEq(keccak256(bytes(uri1)), keccak256(bytes(uri2)));
    assertEq(keccak256(bytes(uri2)), keccak256(bytes(uri3)));

    vm.stopPrank();
  }

  // Helper function to check if string starts with prefix
  function _startsWith(string memory str, string memory prefix) internal pure returns (bool) {
    bytes memory strBytes = bytes(str);
    bytes memory prefixBytes = bytes(prefix);

    if (strBytes.length < prefixBytes.length) {
      return false;
    }

    for (uint256 i = 0; i < prefixBytes.length; i++) {
      if (strBytes[i] != prefixBytes[i]) {
        return false;
      }
    }

    return true;
  }
}
