// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console2 } from '../../lib/forge-std/src/Test.sol';
import { CustomNFT } from '../../src/CustomNFT.sol';
import { CustomNFTCollection } from '../../src/CustomNFTCollection.sol';
import { IERC4907 } from '../../src/interfaces/IERC4907.sol';

/**
 * @title EndToEndWorkflowTest
 * @notice Integration tests covering complete user workflows from factory deployment to NFT rental
 */
contract EndToEndWorkflowTest is Test {
  CustomNFT public factory;

  // Actors in our workflow
  address public admin = makeAddr('admin');
  address public artCreator = makeAddr('artCreator');
  address public gameCreator = makeAddr('gameCreator');
  address public gallery = makeAddr('gallery');
  address public gamer = makeAddr('gamer');
  address public collector1 = makeAddr('collector1');
  address public collector2 = makeAddr('collector2');
  address public renter = makeAddr('renter');

  event CollectionCreated(address indexed creator, address indexed collection, string name, string symbol);
  event Minted(address indexed to, uint256 indexed tokenId, string tokenURI_);
  event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

  function setUp() public {
    // Deploy the factory as admin
    factory = new CustomNFT(admin);
  }

  function test_CompleteArtGalleryWorkflow() public {
    // === PHASE 1: Setup ===
    // Admin authorizes art creator
    vm.startPrank(admin);
    factory.authorizeCreator(artCreator);
    assertTrue(factory.isAuthorizedCreator(artCreator));
    vm.stopPrank();

    // === PHASE 2: Collection Creation ===
    // Art creator creates a limited edition art collection
    vm.startPrank(artCreator);

    vm.expectEmit(true, false, false, true);
    emit CollectionCreated(artCreator, address(0), 'Digital Renaissance', 'DART');

    address artCollectionAddr = factory.createCollection(
      'Digital Renaissance',
      'DART',
      'A curated collection of digital renaissance art pieces',
      'ipfs://QmRenaissanceDefault',
      true, // fixed supply
      50 // limited to 50 pieces
    );

    CustomNFTCollection artCollection = CustomNFTCollection(artCollectionAddr);

    // Verify collection properties
    assertEq(artCollection.name(), 'Digital Renaissance');
    assertEq(artCollection.symbol(), 'DART');
    assertEq(artCollection.i_isFixedSupply(), true);
    assertEq(artCollection.i_maxSupply(), 50);
    assertEq(artCollection.i_creator(), artCreator);

    vm.stopPrank();

    // === PHASE 3: Whitelist Management ===
    // Art creator authorizes gallery to mint pieces
    vm.startPrank(artCreator);
    artCollection.grantMinter(gallery);
    assertTrue(artCollection.hasRole(artCollection.MINTER_ROLE(), gallery));
    vm.stopPrank();

    // === PHASE 4: Minting with Complex Attributes ===
    vm.startPrank(gallery);

    // Mint "The Digital Mona Lisa" with detailed attributes
    CustomNFTCollection.AttributeKV[] memory monaLisaAttrs = new CustomNFTCollection.AttributeKV[](6);
    monaLisaAttrs[0] = CustomNFTCollection.AttributeKV({ key: 'Artist', value: 'Leonardo da Vinci (AI)' });
    monaLisaAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'Era', value: 'Digital Renaissance' });
    monaLisaAttrs[2] = CustomNFTCollection.AttributeKV({ key: 'Rarity', value: 'Legendary' });
    monaLisaAttrs[3] = CustomNFTCollection.AttributeKV({ key: 'Medium', value: 'Digital Oil' });
    monaLisaAttrs[4] = CustomNFTCollection.AttributeKV({ key: 'Year', value: '2024' });
    monaLisaAttrs[5] = CustomNFTCollection.AttributeKV({ key: 'Authenticity Score', value: '98.5' });

    vm.expectEmit(true, true, false, false);
    emit Minted(collector1, 1, '');

    uint256 monaLisaTokenId = artCollection.mint(
      collector1,
      'The Digital Mona Lisa',
      'A stunning AI recreation of the famous Mona Lisa, enhanced with digital renaissance techniques',
      'ipfs://QmDigitalMonaLisa',
      monaLisaAttrs
    );

    assertEq(monaLisaTokenId, 1);
    assertEq(artCollection.ownerOf(monaLisaTokenId), collector1);

    // Mint "Starry Night 2.0" with special characters in attributes
    CustomNFTCollection.AttributeKV[] memory starryAttrs = new CustomNFTCollection.AttributeKV[](4);
    starryAttrs[0] = CustomNFTCollection.AttributeKV({ key: 'Title with "Quotes"', value: 'Starry Night "2.0"' });
    starryAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'Special\\Characters', value: 'Test\\Value\\Here' });
    starryAttrs[2] = CustomNFTCollection.AttributeKV({ key: 'Unicode', value: unicode'🌟🌙✨ Starry Night' });
    starryAttrs[3] = CustomNFTCollection.AttributeKV({ key: 'JSON Test', value: '{"nested": "value"}' });

    uint256 starryTokenId = artCollection.mint(
      collector2,
      'Starry Night 2.0',
      "Van Gogh's masterpiece reimagined for the digital age",
      'ipfs://QmStarryNight2',
      starryAttrs
    );

    assertEq(starryTokenId, 2);
    assertEq(artCollection.totalMinted(), 2);

    vm.stopPrank();

    // === PHASE 5: Verify Metadata Encoding ===
    // Check that tokenURI contains properly encoded JSON
    string memory monaLisaURI = artCollection.tokenURI(monaLisaTokenId);
    string memory starryURI = artCollection.tokenURI(starryTokenId);

    // Both should be data URIs
    assertTrue(bytes(monaLisaURI).length > 29); // Longer than prefix
    assertTrue(bytes(starryURI).length > 29);

    // Should start with data:application/json;base64,
    bytes memory expectedPrefix = bytes('data:application/json;base64,');
    bytes memory monaBytes = bytes(monaLisaURI);
    bytes memory starryBytes = bytes(starryURI);

    for (uint256 i = 0; i < expectedPrefix.length; i++) {
      assertEq(monaBytes[i], expectedPrefix[i]);
      assertEq(starryBytes[i], expectedPrefix[i]);
    }

    // === PHASE 6: ERC4907 Rental Flow ===
    // Art creator sets up rental for The Digital Mona Lisa
    vm.startPrank(artCreator);

    uint64 rentalExpires = uint64(block.timestamp + 30 days); // 30-day rental

    vm.expectEmit(true, true, false, true);
    emit UpdateUser(monaLisaTokenId, renter, rentalExpires);

    artCollection.setUser(monaLisaTokenId, renter, rentalExpires);

    // Verify rental state
    assertEq(artCollection.ownerOf(monaLisaTokenId), collector1); // Owner unchanged
    assertEq(artCollection.userOf(monaLisaTokenId), renter); // Renter set
    assertEq(artCollection.userExpires(monaLisaTokenId), rentalExpires);

    vm.stopPrank();

    // === PHASE 7: Time-based Rental Verification ===
    // Fast forward 15 days - rental should still be active
    vm.warp(block.timestamp + 15 days);
    assertEq(artCollection.userOf(monaLisaTokenId), renter);

    // Fast forward past expiration
    vm.warp(block.timestamp + 20 days); // Total 35 days, past 30-day rental
    assertEq(artCollection.userOf(monaLisaTokenId), address(0)); // Rental expired

    // === PHASE 8: Multiple Collections ===
    // Admin authorizes game creator
    vm.startPrank(admin);
    factory.authorizeCreator(gameCreator);
    vm.stopPrank();

    // Game creator creates unlimited supply gaming collection
    vm.startPrank(gameCreator);

    address gameCollectionAddr = factory.createCollection(
      'Epic Game Items',
      'EPIC',
      'Collectible items from the Epic universe',
      'ipfs://QmEpicDefault',
      false, // unlimited supply
      0
    );

    CustomNFTCollection gameCollection = CustomNFTCollection(gameCollectionAddr);

    // Mint a gaming item
    CustomNFTCollection.AttributeKV[] memory weaponAttrs = new CustomNFTCollection.AttributeKV[](5);
    weaponAttrs[0] = CustomNFTCollection.AttributeKV({ key: 'Type', value: 'Weapon' });
    weaponAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'Rarity', value: 'Mythic' });
    weaponAttrs[2] = CustomNFTCollection.AttributeKV({ key: 'Attack Power', value: '9999' });
    weaponAttrs[3] = CustomNFTCollection.AttributeKV({ key: 'Element', value: 'Lightning' });
    weaponAttrs[4] = CustomNFTCollection.AttributeKV({ key: 'Durability', value: 'Indestructible' });

    uint256 weaponTokenId = gameCollection.mint(
      gamer,
      'Thunderstrike Blade',
      'A legendary weapon forged from pure lightning energy',
      'ipfs://QmThunderBlade',
      weaponAttrs
    );

    assertEq(weaponTokenId, 1);
    assertEq(gameCollection.ownerOf(weaponTokenId), gamer);

    vm.stopPrank();

    // === PHASE 9: Factory Registry Verification ===
    // Verify both collections are registered in factory
    assertEq(factory.getCollectionsCount(), 2);

    CustomNFT.CollectionInfo memory artInfo = factory.getCollectionInfo(0);
    CustomNFT.CollectionInfo memory gameInfo = factory.getCollectionInfo(1);

    assertEq(artInfo.collection, artCollectionAddr);
    assertEq(artInfo.creator, artCreator);
    assertEq(artInfo.name, 'Digital Renaissance');
    assertEq(artInfo.isFixedSupply, true);
    assertEq(artInfo.maxSupply, 50);

    assertEq(gameInfo.collection, gameCollectionAddr);
    assertEq(gameInfo.creator, gameCreator);
    assertEq(gameInfo.name, 'Epic Game Items');
    assertEq(gameInfo.isFixedSupply, false);
    assertEq(gameInfo.maxSupply, 0);

    // Get all collections
    CustomNFT.CollectionInfo[] memory allCollections = factory.getAllCollections();
    assertEq(allCollections.length, 2);
    assertEq(allCollections[0].name, 'Digital Renaissance');
    assertEq(allCollections[1].name, 'Epic Game Items');

    // === PHASE 10: Interface Support Verification ===
    assertTrue(artCollection.supportsInterface(type(IERC4907).interfaceId));
    assertTrue(gameCollection.supportsInterface(type(IERC4907).interfaceId));
    assertTrue(artCollection.supportsInterface(0x80ac58cd)); // ERC721
    assertTrue(gameCollection.supportsInterface(0x80ac58cd)); // ERC721

    // === PHASE 11: Access Control Edge Cases ===
    // Verify unauthorized actions fail
    vm.startPrank(collector1);

    // Collector cannot create collections (not authorized)
    vm.expectRevert();
    factory.createCollection('Unauthorized', 'UNAUTH', 'Should fail', 'img', true, 100);

    // Collector cannot mint in art collection (not whitelisted)
    CustomNFTCollection.AttributeKV[] memory emptyAttrs = new CustomNFTCollection.AttributeKV[](0);
    vm.expectRevert();
    artCollection.mint(collector1, 'Unauthorized Mint', '', '', emptyAttrs);

    // Collector cannot set rental user (not admin)
    vm.expectRevert();
    artCollection.setUser(monaLisaTokenId, collector1, uint64(block.timestamp + 1 days));

    vm.stopPrank();

    // === FINAL VERIFICATION ===
    // Verify final state
    assertEq(artCollection.totalMinted(), 2);
    assertEq(gameCollection.totalMinted(), 1);
    assertEq(artCollection.balanceOf(collector1), 1);
    assertEq(artCollection.balanceOf(collector2), 1);
    assertEq(gameCollection.balanceOf(gamer), 1);

    console2.log('End-to-end workflow completed successfully!');
    console2.log('Art collection minted:', artCollection.totalMinted());
    console2.log('Game collection minted:', gameCollection.totalMinted());
    console2.log('Total collections created:', factory.getCollectionsCount());
  }

  function test_AttributeEncodingEdgeCases() public {
    // Setup basic collection
    vm.startPrank(admin);
    factory.authorizeCreator(artCreator);
    vm.stopPrank();

    vm.startPrank(artCreator);
    address collectionAddr = factory.createCollection('Test', 'TEST', 'Test collection', 'img', true, 100);
    CustomNFTCollection collection = CustomNFTCollection(collectionAddr);

    // Test empty attributes
    CustomNFTCollection.AttributeKV[] memory emptyAttrs = new CustomNFTCollection.AttributeKV[](0);
    uint256 token1 = collection.mint(collector1, 'Empty Attrs', '', '', emptyAttrs);

    string memory uri1 = collection.tokenURI(token1);
    assertTrue(bytes(uri1).length > 0);

    // Test single attribute
    CustomNFTCollection.AttributeKV[] memory singleAttr = new CustomNFTCollection.AttributeKV[](1);
    singleAttr[0] = CustomNFTCollection.AttributeKV({ key: 'Single', value: 'Value' });
    uint256 token2 = collection.mint(collector1, 'Single Attr', '', '', singleAttr);

    string memory uri2 = collection.tokenURI(token2);
    assertTrue(bytes(uri2).length > 0);

    // Test many attributes
    CustomNFTCollection.AttributeKV[] memory manyAttrs = new CustomNFTCollection.AttributeKV[](10);
    for (uint256 i = 0; i < 10; i++) {
      manyAttrs[i] = CustomNFTCollection.AttributeKV({
        key: string.concat('Key', vm.toString(i)),
        value: string.concat('Value', vm.toString(i))
      });
    }
    uint256 token3 = collection.mint(collector1, 'Many Attrs', '', '', manyAttrs);

    string memory uri3 = collection.tokenURI(token3);
    assertTrue(bytes(uri3).length > 0);

    vm.stopPrank();
  }

  function test_MaxSupplyStressTest() public {
    // Create collection with small max supply
    vm.startPrank(admin);
    factory.authorizeCreator(artCreator);
    vm.stopPrank();

    vm.startPrank(artCreator);
    address collectionAddr = factory.createCollection('Stress Test', 'STRESS', 'Stress test', 'img', true, 5);
    CustomNFTCollection collection = CustomNFTCollection(collectionAddr);

    CustomNFTCollection.AttributeKV[] memory emptyAttrs = new CustomNFTCollection.AttributeKV[](0);

    // Mint to max supply
    for (uint256 i = 1; i <= 5; i++) {
      uint256 tokenId = collection.mint(collector1, string.concat('Token ', vm.toString(i)), '', '', emptyAttrs);
      assertEq(tokenId, i);
      assertEq(collection.totalMinted(), i);
    }

    // Next mint should fail
    vm.expectRevert('Max supply reached');
    collection.mint(collector1, 'Should Fail', '', '', emptyAttrs);

    vm.stopPrank();
  }
}
