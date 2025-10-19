// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console2 } from '../../lib/forge-std/src/Test.sol';
import { CustomNFT } from '../../src/CustomNFT.sol';
import { CustomNFTCollection } from '../../src/CustomNFTCollection.sol';

/**
 * @title CustomNFTFactoryTest
 * @notice Unit tests for CustomNFT factory contract
 */
contract CustomNFTFactoryTest is Test {
  CustomNFT public factory;
  address public admin = makeAddr('admin');
  address public creator = makeAddr('creator');
  address public unauthorizedUser = makeAddr('unauthorized');

  event CreatorAuthorized(address indexed account);
  event CreatorRevoked(address indexed account);
  event CollectionCreated(address indexed creator, address indexed collection, string name, string symbol);

  function setUp() public {
    factory = new CustomNFT(admin);
  }

  function test_Constructor() public {
    assertTrue(factory.hasRole(factory.DEFAULT_ADMIN_ROLE(), admin));
    assertEq(factory.getCollectionsCount(), 0);
  }

  function test_AuthorizeCreator() public {
    vm.startPrank(admin);

    assertFalse(factory.isAuthorizedCreator(creator));

    vm.expectEmit(true, false, false, false);
    emit CreatorAuthorized(creator);

    factory.authorizeCreator(creator);

    assertTrue(factory.isAuthorizedCreator(creator));
    assertTrue(factory.hasRole(factory.CREATOR_ROLE(), creator));

    vm.stopPrank();
  }

  function test_AuthorizeCreator_RevertWhenNotAdmin() public {
    vm.startPrank(unauthorizedUser);

    vm.expectRevert(); // AccessControl revert
    factory.authorizeCreator(creator);

    vm.stopPrank();
  }

  function test_RevokeCreator() public {
    vm.startPrank(admin);

    // First authorize
    factory.authorizeCreator(creator);
    assertTrue(factory.isAuthorizedCreator(creator));

    // Then revoke
    vm.expectEmit(true, false, false, false);
    emit CreatorRevoked(creator);

    factory.revokeCreator(creator);

    assertFalse(factory.isAuthorizedCreator(creator));
    assertFalse(factory.hasRole(factory.CREATOR_ROLE(), creator));

    vm.stopPrank();
  }

  function test_RevokeCreator_RevertWhenNotAdmin() public {
    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(unauthorizedUser);

    vm.expectRevert(); // AccessControl revert
    factory.revokeCreator(creator);

    vm.stopPrank();
  }

  function test_CreateCollection_FixedSupply() public {
    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(creator);

    string memory name = 'My Collection';
    string memory symbol = 'MYCOL';
    string memory description = 'A wonderful collection';
    string memory defaultImage = 'ipfs://QmDefaultImage';
    bool isFixedSupply = true;
    uint256 maxSupply = 1000;

    vm.expectEmit(true, false, false, true);
    emit CollectionCreated(creator, address(0), name, symbol); // address(0) placeholder, actual address unknown

    address collectionAddr = factory.createCollection(
      name,
      symbol,
      description,
      defaultImage,
      isFixedSupply,
      maxSupply
    );

    // Verify collection was created and registered
    assertEq(factory.getCollectionsCount(), 1);

    CustomNFT.CollectionInfo memory info = factory.getCollectionInfo(0);
    assertEq(info.collection, collectionAddr);
    assertEq(info.creator, creator);
    assertEq(info.name, name);
    assertEq(info.symbol, symbol);
    assertEq(info.isFixedSupply, isFixedSupply);
    assertEq(info.maxSupply, maxSupply);

    // Verify the deployed collection has correct properties
    CustomNFTCollection collection = CustomNFTCollection(collectionAddr);
    assertEq(collection.name(), name);
    assertEq(collection.symbol(), symbol);
    assertEq(collection.s_collectionDescription(), description);
    assertEq(collection.s_defaultImageURI(), defaultImage);
    assertEq(collection.i_isFixedSupply(), isFixedSupply);
    assertEq(collection.i_maxSupply(), maxSupply);
    assertEq(collection.i_creator(), creator);

    // Verify roles are set correctly
    assertTrue(collection.hasRole(collection.COLLECTION_ADMIN_ROLE(), creator));
    assertTrue(collection.hasRole(collection.MINTER_ROLE(), creator));

    vm.stopPrank();
  }

  function test_CreateCollection_UnlimitedSupply() public {
    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(creator);

    address collectionAddr = factory.createCollection(
      'Unlimited Collection',
      'UNLIM',
      'No limits here',
      'ipfs://QmUnlimited',
      false, // unlimited supply
      0 // maxSupply ignored
    );

    CustomNFT.CollectionInfo memory info = factory.getCollectionInfo(0);
    assertEq(info.isFixedSupply, false);
    assertEq(info.maxSupply, 0);

    CustomNFTCollection collection = CustomNFTCollection(collectionAddr);
    assertEq(collection.i_isFixedSupply(), false);
    assertEq(collection.i_maxSupply(), 0);

    vm.stopPrank();
  }

  function test_CreateCollection_RevertWhenNotAuthorized() public {
    vm.startPrank(unauthorizedUser);

    vm.expectRevert(); // AccessControl revert
    factory.createCollection('Test', 'TEST', 'Description', 'image', true, 100);

    vm.stopPrank();
  }

  function test_CreateCollection_RevertWhenInvalidMaxSupply() public {
    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(creator);

    vm.expectRevert('Invalid max supply');
    factory.createCollection('Test', 'TEST', 'Description', 'image', true, 0); // fixed supply but maxSupply = 0

    vm.stopPrank();
  }

  function test_CreateMultipleCollections() public {
    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(creator);

    // Create first collection
    address collection1 = factory.createCollection('Collection 1', 'COL1', 'First', 'img1', true, 100);

    // Create second collection
    address collection2 = factory.createCollection('Collection 2', 'COL2', 'Second', 'img2', false, 0);

    assertEq(factory.getCollectionsCount(), 2);

    CustomNFT.CollectionInfo memory info1 = factory.getCollectionInfo(0);
    CustomNFT.CollectionInfo memory info2 = factory.getCollectionInfo(1);

    assertEq(info1.collection, collection1);
    assertEq(info1.name, 'Collection 1');

    assertEq(info2.collection, collection2);
    assertEq(info2.name, 'Collection 2');

    vm.stopPrank();
  }

  function test_GetAllCollections() public {
    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(creator);

    // Create multiple collections
    factory.createCollection('Collection 1', 'COL1', 'First', 'img1', true, 100);
    factory.createCollection('Collection 2', 'COL2', 'Second', 'img2', false, 0);
    factory.createCollection('Collection 3', 'COL3', 'Third', 'img3', true, 50);

    CustomNFT.CollectionInfo[] memory allCollections = factory.getAllCollections();

    assertEq(allCollections.length, 3);
    assertEq(allCollections[0].name, 'Collection 1');
    assertEq(allCollections[1].name, 'Collection 2');
    assertEq(allCollections[2].name, 'Collection 3');

    vm.stopPrank();
  }

  function test_GetCollectionInfo_RevertWhenIndexOutOfBounds() public {
    vm.expectRevert('Index out of bounds');
    factory.getCollectionInfo(0);

    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(creator);
    factory.createCollection('Test', 'TEST', 'Description', 'image', true, 100);
    vm.stopPrank();

    vm.expectRevert('Index out of bounds');
    factory.getCollectionInfo(1); // Only index 0 exists
  }

  function test_MultipleCreators() public {
    address creator2 = makeAddr('creator2');

    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    factory.authorizeCreator(creator2);
    vm.stopPrank();

    // Creator 1 creates a collection
    vm.startPrank(creator);
    address collection1 = factory.createCollection('Creator1 Collection', 'C1', 'By creator 1', 'img1', true, 100);
    vm.stopPrank();

    // Creator 2 creates a collection
    vm.startPrank(creator2);
    address collection2 = factory.createCollection('Creator2 Collection', 'C2', 'By creator 2', 'img2', false, 0);
    vm.stopPrank();

    assertEq(factory.getCollectionsCount(), 2);

    CustomNFT.CollectionInfo memory info1 = factory.getCollectionInfo(0);
    CustomNFT.CollectionInfo memory info2 = factory.getCollectionInfo(1);

    assertEq(info1.creator, creator);
    assertEq(info2.creator, creator2);
  }
}
