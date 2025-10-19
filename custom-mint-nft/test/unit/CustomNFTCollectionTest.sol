// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console2 } from '../../lib/forge-std/src/Test.sol';
import { CustomNFTCollection } from '../../src/CustomNFTCollection.sol';
import { TestHelpers } from '../helpers/TestHelpers.sol';
import { IERC4907 } from '../../src/interfaces/IERC4907.sol';

/**
 * @title CustomNFTCollectionTest
 * @notice Unit tests for CustomNFTCollection contract
 */
contract CustomNFTCollectionTest is Test {
  CustomNFTCollection public collection;
  address public creator = makeAddr('creator');
  address public admin = makeAddr('admin');
  address public minter = makeAddr('minter');
  address public user = makeAddr('user');

  string constant NAME = 'Test Collection';
  string constant SYMBOL = 'TEST';
  string constant DESCRIPTION = 'A test NFT collection';
  string constant DEFAULT_IMAGE = 'ipfs://QmTestDefaultImage';

  event Minted(address indexed to, uint256 indexed tokenId, string tokenURI_);
  event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

  function setUp() public {
    collection = new CustomNFTCollection(
      NAME,
      SYMBOL,
      DESCRIPTION,
      DEFAULT_IMAGE,
      true, // isFixedSupply
      100, // maxSupply
      creator,
      admin
    );
  }

  function test_Constructor() public {
    assertEq(collection.name(), NAME);
    assertEq(collection.symbol(), SYMBOL);
    assertEq(collection.s_collectionDescription(), DESCRIPTION);
    assertEq(collection.s_defaultImageURI(), DEFAULT_IMAGE);
    assertEq(collection.i_isFixedSupply(), true);
    assertEq(collection.i_maxSupply(), 100);
    assertEq(collection.i_creator(), creator);

    // Check roles
    assertTrue(collection.hasRole(collection.DEFAULT_ADMIN_ROLE(), admin));
    assertTrue(collection.hasRole(collection.COLLECTION_ADMIN_ROLE(), admin));
    assertTrue(collection.hasRole(collection.MINTER_ROLE(), admin));
    assertTrue(collection.hasRole(collection.COLLECTION_ADMIN_ROLE(), creator));
    assertTrue(collection.hasRole(collection.MINTER_ROLE(), creator));
  }

  function test_UnlimitedSupplyConstructor() public {
    CustomNFTCollection unlimitedCollection = new CustomNFTCollection(
      'Unlimited',
      'UNL',
      'Unlimited supply collection',
      DEFAULT_IMAGE,
      false, // isFixedSupply
      0, // maxSupply (ignored)
      creator,
      admin
    );

    assertEq(unlimitedCollection.i_isFixedSupply(), false);
    assertEq(unlimitedCollection.i_maxSupply(), 0);
  }

  function test_Mint_BasicFlow() public {
    vm.startPrank(admin);

    CustomNFTCollection.AttributeKV[] memory attributes = new CustomNFTCollection.AttributeKV[](2);
    attributes[0] = CustomNFTCollection.AttributeKV({ key: 'Color', value: 'Red' });
    attributes[1] = CustomNFTCollection.AttributeKV({ key: 'Rarity', value: 'Common' });

    // Note: We don't check tokenURI in the event as it's a complex data URI
    vm.expectEmit(true, true, false, false);
    emit Minted(user, 1, '');

    uint256 tokenId = collection.mint(
      user,
      'Test Token #1',
      'A beautiful test token',
      'ipfs://QmTestTokenImage',
      attributes
    );

    assertEq(tokenId, 1);
    assertEq(collection.ownerOf(tokenId), user);
    assertEq(collection.totalMinted(), 1);
    assertEq(collection.balanceOf(user), 1);

    // Check metadata URI is data URI
    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(bytes(tokenURI).length > 0);
    // Should start with data:application/json;base64,
    assertEq(keccak256(bytes(substring(tokenURI, 0, 29))), keccak256(bytes('data:application/json;base64,')));

    vm.stopPrank();
  }

  function test_Mint_WithDefaultValues() public {
    vm.startPrank(admin);

    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);

    uint256 tokenId = collection.mint(
      user,
      '', // empty name - should use default
      '', // empty description - should use collection description
      '', // empty image - should use default
      emptyAttributes
    );

    assertEq(tokenId, 1);
    assertEq(collection.ownerOf(tokenId), user);

    vm.stopPrank();
  }

  function test_Mint_RevertWhenMaxSupplyReached() public {
    // Create collection with max supply of 1
    CustomNFTCollection smallCollection = new CustomNFTCollection(
      'Small',
      'SML',
      'Small collection',
      DEFAULT_IMAGE,
      true,
      1, // maxSupply = 1
      creator,
      admin
    );

    vm.startPrank(admin);

    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);

    // First mint should succeed
    smallCollection.mint(user, 'Token 1', '', '', emptyAttributes);
    assertEq(smallCollection.totalMinted(), 1);

    // Second mint should revert
    vm.expectRevert('Max supply reached');
    smallCollection.mint(user, 'Token 2', '', '', emptyAttributes);

    vm.stopPrank();
  }

  function test_Mint_RevertWhenNotMinter() public {
    vm.startPrank(user); // user is not a minter

    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);

    vm.expectRevert(); // AccessControl revert
    collection.mint(user, 'Token 1', '', '', emptyAttributes);

    vm.stopPrank();
  }

  function test_GrantAndRevokeMinter() public {
    vm.startPrank(admin);

    // Grant minter role
    collection.grantMinter(minter);
    assertTrue(collection.hasRole(collection.MINTER_ROLE(), minter));

    // Revoke minter role
    collection.revokeMinter(minter);
    assertFalse(collection.hasRole(collection.MINTER_ROLE(), minter));

    vm.stopPrank();
  }

  function test_GrantMinter_RevertWhenNotAdmin() public {
    vm.startPrank(user); // user is not admin

    vm.expectRevert(); // AccessControl revert
    collection.grantMinter(minter);

    vm.stopPrank();
  }

  function test_ERC4907_SetUser() public {
    vm.startPrank(admin);

    // Mint a token first
    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);
    uint256 tokenId = collection.mint(user, 'Token 1', '', '', emptyAttributes);

    // Set user with expiration
    uint64 expires = uint64(block.timestamp + 1 days);
    address renter = makeAddr('renter');

    vm.expectEmit(true, true, false, true);
    emit UpdateUser(tokenId, renter, expires);

    collection.setUser(tokenId, renter, expires);

    assertEq(collection.userOf(tokenId), renter);
    assertEq(collection.userExpires(tokenId), expires);

    vm.stopPrank();
  }

  function test_ERC4907_UserExpiration() public {
    vm.startPrank(admin);

    // Mint a token
    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);
    uint256 tokenId = collection.mint(user, 'Token 1', '', '', emptyAttributes);

    // Set user with short expiration
    uint64 expires = uint64(block.timestamp + 1 hours);
    address renter = makeAddr('renter');
    collection.setUser(tokenId, renter, expires);

    // Before expiration
    assertEq(collection.userOf(tokenId), renter);

    // After expiration
    vm.warp(block.timestamp + 2 hours);
    assertEq(collection.userOf(tokenId), address(0));

    vm.stopPrank();
  }

  function test_ERC4907_SetUser_RevertWhenNotAdmin() public {
    vm.startPrank(admin);
    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);
    uint256 tokenId = collection.mint(user, 'Token 1', '', '', emptyAttributes);
    vm.stopPrank();

    vm.startPrank(user); // user is not admin
    vm.expectRevert(); // AccessControl revert
    collection.setUser(tokenId, makeAddr('renter'), uint64(block.timestamp + 1 days));
    vm.stopPrank();
  }

  function test_ERC4907_SetUser_RevertWhenTokenDoesntExist() public {
    vm.startPrank(admin);

    vm.expectRevert(); // _requireOwned revert
    collection.setUser(999, makeAddr('renter'), uint64(block.timestamp + 1 days));

    vm.stopPrank();
  }

  function test_SupportsInterface() public {
    // ERC721
    assertTrue(collection.supportsInterface(0x80ac58cd));
    // ERC721Metadata
    assertTrue(collection.supportsInterface(0x5b5e139f));
    // ERC4907
    assertTrue(collection.supportsInterface(type(IERC4907).interfaceId));
    // AccessControl
    assertTrue(collection.supportsInterface(0x7965db0b));
    // ERC165
    assertTrue(collection.supportsInterface(0x01ffc9a7));
  }

  function test_TotalMinted_SequentialIds() public {
    vm.startPrank(admin);

    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);

    assertEq(collection.totalMinted(), 0);

    uint256 tokenId1 = collection.mint(user, 'Token 1', '', '', emptyAttributes);
    assertEq(tokenId1, 1);
    assertEq(collection.totalMinted(), 1);

    uint256 tokenId2 = collection.mint(user, 'Token 2', '', '', emptyAttributes);
    assertEq(tokenId2, 2);
    assertEq(collection.totalMinted(), 2);

    uint256 tokenId3 = collection.mint(user, 'Token 3', '', '', emptyAttributes);
    assertEq(tokenId3, 3);
    assertEq(collection.totalMinted(), 3);

    vm.stopPrank();
  }

  // -----------------
  // Batch minting: mintBatchSameAttributes
  // -----------------
  function test_MintBatchSameAttributes_BasicFlow() public {
    vm.startPrank(admin);

    CustomNFTCollection.AttributeKV[] memory attributes = TestHelpers.createGamingAttributes();

    uint256[] memory tokenIds = collection.mintBatchSameAttributes(
      user,
      5,
      'Batch Token',
      'Shared attributes',
      'ipfs://QmSharedImage',
      attributes
    );

    assertEq(tokenIds.length, 5);
    // Should start at tokenId 1 and be sequential
    for (uint256 i = 0; i < tokenIds.length; i++) {
      assertEq(tokenIds[i], i + 1);
      assertEq(collection.ownerOf(tokenIds[i]), user);
    }
    assertEq(collection.totalMinted(), 5);
    assertEq(collection.balanceOf(user), 5);

    vm.stopPrank();
  }

  function test_MintBatchSameAttributes_RevertWhenExceedsMaxSupply() public {
    // Create small collection with max supply 3
    CustomNFTCollection small = new CustomNFTCollection(
      'Small',
      'SML',
      'Small collection',
      DEFAULT_IMAGE,
      true,
      3,
      creator,
      admin
    );

    vm.startPrank(admin);
    CustomNFTCollection.AttributeKV[] memory attributes = TestHelpers.createEmptyAttributes();

    // Mint 2 first
    uint256[] memory tokenIds = small.mintBatchSameAttributes(user, 2, 'A', '', '', attributes);
    assertEq(tokenIds.length, 2);
    assertEq(small.totalMinted(), 2);

    // Try minting 2 more (would exceed 3)
    vm.expectRevert('Max supply would be exceeded');
    small.mintBatchSameAttributes(user, 2, 'B', '', '', attributes);

    vm.stopPrank();
  }

  // -----------------
  // Batch minting: mintBatchSameAttributesToMany
  // -----------------
  function test_MintBatchSameAttributesToMany_BasicFlow() public {
    vm.startPrank(admin);

    address[] memory recipients = new address[](3);
    recipients[0] = makeAddr('r1');
    recipients[1] = makeAddr('r2');
    recipients[2] = makeAddr('r3');

    CustomNFTCollection.AttributeKV[] memory attributes = TestHelpers.createArtAttributes();

    uint256[] memory tokenIds = collection.mintBatchSameAttributesToMany(
      recipients,
      'Art Batch',
      'Same attributes for all',
      'ipfs://QmArt',
      attributes
    );

    assertEq(tokenIds.length, 3);
    // tokenIds should be [1,2,3] and owners set accordingly
    for (uint256 i = 0; i < recipients.length; i++) {
      assertEq(tokenIds[i], i + 1);
      assertEq(collection.ownerOf(tokenIds[i]), recipients[i]);
    }
    assertEq(collection.totalMinted(), 3);
    assertEq(collection.balanceOf(recipients[0]), 1);
    assertEq(collection.balanceOf(recipients[1]), 1);
    assertEq(collection.balanceOf(recipients[2]), 1);

    vm.stopPrank();
  }

  function test_MintBatchSameAttributesToMany_RevertWhenEmptyRecipients() public {
    vm.startPrank(admin);

    address[] memory recipients = new address[](0);
    CustomNFTCollection.AttributeKV[] memory attributes = TestHelpers.createEmptyAttributes();

    vm.expectRevert('No recipients');
    collection.mintBatchSameAttributesToMany(recipients, 'X', '', '', attributes);

    vm.stopPrank();
  }

  function test_MintBatch_RevertWhenNotMinter() public {
    vm.startPrank(user); // not a minter
    CustomNFTCollection.AttributeKV[] memory attributes = TestHelpers.createEmptyAttributes();

    vm.expectRevert();
    collection.mintBatchSameAttributes(user, 2, 'X', '', '', attributes);

    address[] memory recipients = new address[](2);
    recipients[0] = makeAddr('a');
    recipients[1] = makeAddr('b');

    vm.expectRevert();
    collection.mintBatchSameAttributesToMany(recipients, 'Y', '', '', attributes);

    vm.stopPrank();
  }

  // Helper function to extract substring
  function substring(string memory str, uint256 startIndex, uint256 endIndex) internal pure returns (string memory) {
    bytes memory strBytes = bytes(str);
    bytes memory result = new bytes(endIndex - startIndex);
    for (uint256 i = startIndex; i < endIndex; i++) {
      result[i - startIndex] = strBytes[i];
    }
    return string(result);
  }
}
