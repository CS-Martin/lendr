// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console2 } from '../../lib/forge-std/src/Test.sol';
import { CustomNFT } from '../../src/CustomNFT.sol';
import { CustomNFTCollection } from '../../src/CustomNFTCollection.sol';
import { TestHelpers } from '../helpers/TestHelpers.sol';

/**
 * @title ExampleMintFlowTest
 * @notice Example integration test showing complete mint flow with real-world scenarios
 */
contract ExampleMintFlowTest is Test {
  using TestHelpers for *;

  CustomNFT public factory;
  CustomNFTCollection public gameCollection;
  CustomNFTCollection public artCollection;

  // Actors
  address public admin = makeAddr('admin');
  address public gameStudio = makeAddr('gameStudio');
  address public artGallery = makeAddr('artGallery');
  address public player1 = makeAddr('player1');
  address public player2 = makeAddr('player2');
  address public collector = makeAddr('collector');
  address public curator = makeAddr('curator');

  function setUp() public {
    // Deploy factory
    factory = new CustomNFT(admin);

    // Setup authorized creators
    vm.startPrank(admin);
    factory.authorizeCreator(gameStudio);
    factory.authorizeCreator(artGallery);
    vm.stopPrank();

    // Create game collection
    vm.startPrank(gameStudio);
    address gameAddr = factory.createCollection(
      'Epic Warriors',
      'WARRIOR',
      'Collectible warrior NFTs with battle stats and special abilities',
      'ipfs://QmEpicWarriorsDefault',
      true, // fixed supply
      10000
    );
    gameCollection = CustomNFTCollection(gameAddr);
    vm.stopPrank();

    // Create art collection
    vm.startPrank(artGallery);
    address artAddr = factory.createCollection(
      'Digital Masterpieces',
      'DMART',
      'Curated collection of digital art from renowned artists',
      'ipfs://QmDigitalMasterpiecesDefault',
      true, // fixed supply
      500
    );
    artCollection = CustomNFTCollection(artAddr);
    vm.stopPrank();
  }

  function test_GameStudioMintFlow() public {
    console2.log('=== Game Studio Mint Flow ===');

    // Game studio whitelists themselves and a trusted partner
    vm.startPrank(gameStudio);
    gameCollection.grantMinter(curator);
    vm.stopPrank();

    // Mint legendary warrior
    vm.startPrank(gameStudio);

    CustomNFTCollection.AttributeKV[] memory legendaryWarrior = new CustomNFTCollection.AttributeKV[](8);
    legendaryWarrior[0] = CustomNFTCollection.AttributeKV({ key: 'Class', value: 'Paladin' });
    legendaryWarrior[1] = CustomNFTCollection.AttributeKV({ key: 'Rarity', value: 'Legendary' });
    legendaryWarrior[2] = CustomNFTCollection.AttributeKV({ key: 'Level', value: '100' });
    legendaryWarrior[3] = CustomNFTCollection.AttributeKV({ key: 'Health', value: '2500' });
    legendaryWarrior[4] = CustomNFTCollection.AttributeKV({ key: 'Attack', value: '450' });
    legendaryWarrior[5] = CustomNFTCollection.AttributeKV({ key: 'Defense', value: '380' });
    legendaryWarrior[6] = CustomNFTCollection.AttributeKV({ key: 'Special Ability', value: 'Divine Shield' });
    legendaryWarrior[7] = CustomNFTCollection.AttributeKV({ key: 'Element', value: 'Holy' });

    uint256 paladinTokenId = gameCollection.mint(
      player1,
      'Aurelius the Divine',
      'A legendary paladin blessed by the gods with unmatched defensive capabilities and holy magic',
      'ipfs://QmAureliusTheDivine',
      legendaryWarrior
    );

    console2.log('Minted Legendary Paladin with Token ID:', paladinTokenId);
    assertEq(paladinTokenId, 1);
    assertEq(gameCollection.ownerOf(paladinTokenId), player1);

    vm.stopPrank();

    // Curator mints common warrior
    vm.startPrank(curator);

    CustomNFTCollection.AttributeKV[] memory commonWarrior = new CustomNFTCollection.AttributeKV[](6);
    commonWarrior[0] = CustomNFTCollection.AttributeKV({ key: 'Class', value: 'Archer' });
    commonWarrior[1] = CustomNFTCollection.AttributeKV({ key: 'Rarity', value: 'Common' });
    commonWarrior[2] = CustomNFTCollection.AttributeKV({ key: 'Level', value: '15' });
    commonWarrior[3] = CustomNFTCollection.AttributeKV({ key: 'Health', value: '300' });
    commonWarrior[4] = CustomNFTCollection.AttributeKV({ key: 'Attack', value: '180' });
    commonWarrior[5] = CustomNFTCollection.AttributeKV({ key: 'Special Ability', value: 'Piercing Shot' });

    uint256 archerTokenId = gameCollection.mint(
      player2,
      'Swift Arrow',
      'A skilled archer with exceptional accuracy and speed',
      'ipfs://QmSwiftArrow',
      commonWarrior
    );

    console2.log('Minted Common Archer with Token ID:', archerTokenId);
    assertEq(archerTokenId, 2);

    vm.stopPrank();

    console2.log('Game Collection Total Minted:', gameCollection.totalMinted());
  }

  function test_ArtGalleryMintFlow() public {
    console2.log('=== Art Gallery Mint Flow ===');

    vm.startPrank(artGallery);

    // Mint abstract digital art
    CustomNFTCollection.AttributeKV[] memory abstractArt = new CustomNFTCollection.AttributeKV[](7);
    abstractArt[0] = CustomNFTCollection.AttributeKV({ key: 'Artist', value: 'Elena Vasquez' });
    abstractArt[1] = CustomNFTCollection.AttributeKV({ key: 'Medium', value: 'Digital Mixed Media' });
    abstractArt[2] = CustomNFTCollection.AttributeKV({ key: 'Style', value: 'Abstract Expressionism' });
    abstractArt[3] = CustomNFTCollection.AttributeKV({ key: 'Year Created', value: '2024' });
    abstractArt[4] = CustomNFTCollection.AttributeKV({ key: 'Color Palette', value: 'Warm Tones' });
    abstractArt[5] = CustomNFTCollection.AttributeKV({ key: 'Dimensions', value: '4000x4000px' });
    abstractArt[6] = CustomNFTCollection.AttributeKV({ key: 'Edition', value: '1 of 1' });

    uint256 abstractTokenId = artCollection.mint(
      collector,
      'Whispers of Dawn',
      'An abstract exploration of light and shadow, capturing the fleeting moments of sunrise through digital brushstrokes',
      'ipfs://QmWhispersOfDawn',
      abstractArt
    );

    console2.log('Minted Abstract Art with Token ID:', abstractTokenId);
    assertEq(abstractTokenId, 1);

    // Mint photorealistic digital art
    CustomNFTCollection.AttributeKV[] memory photoRealistic = new CustomNFTCollection.AttributeKV[](6);
    photoRealistic[0] = CustomNFTCollection.AttributeKV({ key: 'Artist', value: 'Marcus Chen' });
    photoRealistic[1] = CustomNFTCollection.AttributeKV({ key: 'Medium', value: '3D Digital Sculpture' });
    photoRealistic[2] = CustomNFTCollection.AttributeKV({ key: 'Style', value: 'Photorealism' });
    photoRealistic[3] = CustomNFTCollection.AttributeKV({ key: 'Render Engine', value: 'Blender Cycles' });
    photoRealistic[4] = CustomNFTCollection.AttributeKV({ key: 'Render Time', value: '72 hours' });
    photoRealistic[5] = CustomNFTCollection.AttributeKV({ key: 'Polygons', value: '2.5 million' });

    uint256 photoTokenId = artCollection.mint(
      collector,
      'The Last Library',
      'A hauntingly beautiful 3D render of an abandoned library, where books float in ethereal light',
      'ipfs://QmTheLastLibrary',
      photoRealistic
    );

    console2.log('Minted Photorealistic Art with Token ID:', photoTokenId);
    assertEq(photoTokenId, 2);

    vm.stopPrank();

    console2.log('Art Collection Total Minted:', artCollection.totalMinted());
  }

  function test_ComplexAttributeEncoding() public {
    console2.log('=== Complex Attribute Encoding Test ===');

    vm.startPrank(gameStudio);

    // Create attributes with various edge cases
    CustomNFTCollection.AttributeKV[] memory complexAttrs = new CustomNFTCollection.AttributeKV[](10);
    complexAttrs[0] = CustomNFTCollection.AttributeKV({
      key: 'Name with "Quotes"',
      value: 'Value with "Nested Quotes"'
    });
    complexAttrs[1] = CustomNFTCollection.AttributeKV({ key: 'Path\\Separators', value: 'C:\\Users\\Game\\Data' });
    complexAttrs[2] = CustomNFTCollection.AttributeKV({ key: 'Unicode Test', value: unicode'Héllo Wörld! 🎮⚔️🛡️' });
    complexAttrs[3] = CustomNFTCollection.AttributeKV({ key: 'Numbers', value: '42.195' });
    complexAttrs[4] = CustomNFTCollection.AttributeKV({ key: 'Boolean-like', value: 'true' });
    complexAttrs[5] = CustomNFTCollection.AttributeKV({ key: 'JSON-like', value: '{"nested": "value"}' });
    complexAttrs[6] = CustomNFTCollection.AttributeKV({ key: 'Array-like', value: '[1, 2, 3]' });
    complexAttrs[7] = CustomNFTCollection.AttributeKV({ key: 'Empty String', value: '' });
    complexAttrs[8] = CustomNFTCollection.AttributeKV({ key: 'Whitespace', value: '   spaces   ' });
    complexAttrs[9] = CustomNFTCollection.AttributeKV({
      key: 'Very Long Value',
      value: 'This is a very long attribute value that tests how the metadata encoding handles extended text without breaking the JSON structure or causing encoding issues in the base64 conversion process.'
    });

    uint256 complexTokenId = gameCollection.mint(
      player1,
      'Complex "Test" Token\\Special',
      'A token with complex attributes to test JSON encoding with special characters, unicode, and edge cases',
      'ipfs://QmComplexTestToken',
      complexAttrs
    );

    string memory tokenURI = gameCollection.tokenURI(complexTokenId);

    // Verify it's a proper data URI
    assertTrue(bytes(tokenURI).length > 100);
    assertTrue(_startsWith(tokenURI, 'data:application/json;base64,'));

    console2.log('Complex token URI length:', bytes(tokenURI).length);
    console2.log('Complex Token ID:', complexTokenId);

    vm.stopPrank();
  }

  function test_RentalFlowExample() public {
    console2.log('=== Rental Flow Example ===');

    // First mint a valuable gaming item
    vm.startPrank(gameStudio);

    uint256 tokenId = gameCollection.mint(
      player1,
      'Excalibur Replica',
      'A legendary sword replica with immense power',
      'ipfs://QmExcaliburReplica',
      TestHelpers.createGamingAttributes()
    );

    console2.log('Minted rental item with Token ID:', tokenId);
    vm.stopPrank();

    // Set up rental
    vm.startPrank(gameStudio);
    uint64 rentalExpires = uint64(block.timestamp + 7 days);

    gameCollection.setUser(tokenId, player2, rentalExpires);

    console2.log('Set rental user:', player2);
    console2.log('Rental expires at:', rentalExpires);

    // Verify rental state
    assertEq(gameCollection.ownerOf(tokenId), player1); // Owner unchanged
    assertEq(gameCollection.userOf(tokenId), player2); // Renter set
    assertEq(gameCollection.userExpires(tokenId), rentalExpires);

    vm.stopPrank();

    // Fast forward 3 days - should still be rented
    vm.warp(block.timestamp + 3 days);
    assertEq(gameCollection.userOf(tokenId), player2);
    console2.log('After 3 days, renter is still:', gameCollection.userOf(tokenId));

    // Fast forward past expiration
    vm.warp(block.timestamp + 5 days); // Total 8 days
    assertEq(gameCollection.userOf(tokenId), address(0));
    console2.log('After expiration, renter is:', gameCollection.userOf(tokenId));
  }

  function test_MultiCollectionRegistry() public {
    console2.log('=== Multi-Collection Registry Test ===');

    // Verify both collections are registered
    assertEq(factory.getCollectionsCount(), 2);

    CustomNFT.CollectionInfo memory gameInfo = factory.getCollectionInfo(0);
    CustomNFT.CollectionInfo memory artInfo = factory.getCollectionInfo(1);

    console2.log('Game Collection:', gameInfo.name);
    console2.log('Art Collection:', artInfo.name);

    assertEq(gameInfo.creator, gameStudio);
    assertEq(artInfo.creator, artGallery);
    assertEq(gameInfo.isFixedSupply, true);
    assertEq(artInfo.isFixedSupply, true);

    // Get all collections
    CustomNFT.CollectionInfo[] memory allCollections = factory.getAllCollections();
    assertEq(allCollections.length, 2);

    console2.log('Total collections registered:', allCollections.length);
  }

  function test_SupplyLimitEnforcement() public {
    console2.log('=== Supply Limit Enforcement Test ===');

    // Create small collection for testing
    vm.startPrank(gameStudio);
    address smallCollectionAddr = factory.createCollection(
      'Limited Edition',
      'LIMITED',
      'Very limited collection',
      'ipfs://QmLimited',
      true, // fixed supply
      3 // only 3 items
    );
    CustomNFTCollection smallCollection = CustomNFTCollection(smallCollectionAddr);

    // Mint to limit
    for (uint256 i = 1; i <= 3; i++) {
      uint256 tokenId = smallCollection.mint(
        player1,
        string.concat('Limited Item #', vm.toString(i)),
        '',
        '',
        TestHelpers.createEmptyAttributes()
      );
      console2.log('Minted limited item:', tokenId);
      assertEq(tokenId, i);
    }

    // Next mint should fail
    vm.expectRevert('Max supply reached');
    smallCollection.mint(player1, 'Should Fail', '', '', TestHelpers.createEmptyAttributes());

    console2.log('Successfully enforced max supply limit');

    vm.stopPrank();
  }

  // Helper function
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
