// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console2 } from '../../lib/forge-std/src/Test.sol';
import { CustomNFT } from '../../src/CustomNFT.sol';
import { CustomNFTCollection } from '../../src/CustomNFTCollection.sol';

/**
 * @title MintingWorkflowTest
 * @notice Functional tests for the complete minting workflow
 */
contract MintingWorkflowTest is Test {
  CustomNFT public factory;
  CustomNFTCollection public collection;

  address public admin = makeAddr('admin');
  address public creator = makeAddr('creator');
  address public minter1 = makeAddr('minter1');
  address public minter2 = makeAddr('minter2');
  address public recipient = makeAddr('recipient');

  function setUp() public {
    // Deploy factory
    factory = new CustomNFT(admin);

    // Authorize creator and create collection
    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(creator);
    address collectionAddr = factory.createCollection(
      'Gaming Assets',
      'GAME',
      'Collectible gaming assets with various rarities',
      'ipfs://QmDefaultGameAsset',
      true, // fixed supply
      10000
    );
    collection = CustomNFTCollection(collectionAddr);
    vm.stopPrank();
  }

  function test_CompleteWhitelistMintingWorkflow() public {
    // Step 1: Creator adds minters to whitelist
    vm.startPrank(creator);
    collection.grantMinter(minter1);
    collection.grantMinter(minter2);
    vm.stopPrank();

    // Verify minters are whitelisted
    assertTrue(collection.hasRole(collection.MINTER_ROLE(), minter1));
    assertTrue(collection.hasRole(collection.MINTER_ROLE(), minter2));

    // Step 2: First minter mints a rare sword
    vm.startPrank(minter1);

    CustomNFTCollection.AttributeKV[] memory swordAttributes = new CustomNFTCollection.AttributeKV[](4);
    swordAttributes[0] = CustomNFTCollection.AttributeKV({ key: 'Type', value: 'Weapon' });
    swordAttributes[1] = CustomNFTCollection.AttributeKV({ key: 'Rarity', value: 'Legendary' });
    swordAttributes[2] = CustomNFTCollection.AttributeKV({ key: 'Attack', value: '150' });
    swordAttributes[3] = CustomNFTCollection.AttributeKV({ key: 'Element', value: 'Fire' });

    uint256 swordTokenId = collection.mint(
      recipient,
      'Flamebrand Sword',
      'A legendary sword forged in dragon fire, dealing massive fire damage',
      'ipfs://QmFireSwordImage',
      swordAttributes
    );

    assertEq(swordTokenId, 1);
    assertEq(collection.ownerOf(swordTokenId), recipient);

    vm.stopPrank();

    // Step 3: Second minter mints a common shield
    vm.startPrank(minter2);

    CustomNFTCollection.AttributeKV[] memory shieldAttributes = new CustomNFTCollection.AttributeKV[](3);
    shieldAttributes[0] = CustomNFTCollection.AttributeKV({ key: 'Type', value: 'Armor' });
    shieldAttributes[1] = CustomNFTCollection.AttributeKV({ key: 'Rarity', value: 'Common' });
    shieldAttributes[2] = CustomNFTCollection.AttributeKV({ key: 'Defense', value: '25' });

    uint256 shieldTokenId = collection.mint(
      recipient,
      'Iron Shield',
      'A basic iron shield providing modest protection',
      'ipfs://QmIronShieldImage',
      shieldAttributes
    );

    assertEq(shieldTokenId, 2);
    assertEq(collection.ownerOf(shieldTokenId), recipient);

    vm.stopPrank();

    // Step 4: Verify total supply and recipient balance
    assertEq(collection.totalMinted(), 2);
    assertEq(collection.balanceOf(recipient), 2);

    // Step 5: Creator removes minter1 from whitelist
    vm.startPrank(creator);
    collection.revokeMinter(minter1);
    vm.stopPrank();

    // Step 6: Verify minter1 can no longer mint
    vm.startPrank(minter1);

    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);

    vm.expectRevert(); // AccessControl revert
    collection.mint(recipient, 'Should Fail', '', '', emptyAttributes);

    vm.stopPrank();

    // Step 7: Verify minter2 can still mint
    vm.startPrank(minter2);

    uint256 potionTokenId = collection.mint(
      recipient,
      'Health Potion',
      'Restores 50 HP when consumed',
      'ipfs://QmHealthPotionImage',
      emptyAttributes
    );

    assertEq(potionTokenId, 3);
    assertEq(collection.totalMinted(), 3);

    vm.stopPrank();
  }

  function test_AttributeEncodingInMetadata() public {
    vm.startPrank(creator);

    // Create complex attributes with special characters
    CustomNFTCollection.AttributeKV[] memory complexAttributes = new CustomNFTCollection.AttributeKV[](5);
    complexAttributes[0] = CustomNFTCollection.AttributeKV({ key: 'Name with "Quotes"', value: 'Value with "Quotes"' });
    complexAttributes[1] = CustomNFTCollection.AttributeKV({
      key: 'Backslash\\Test',
      value: 'Value\\With\\Backslashes'
    });
    complexAttributes[2] = CustomNFTCollection.AttributeKV({ key: 'Unicode', value: unicode'Émojis 🔥⚔️🛡️' });
    complexAttributes[3] = CustomNFTCollection.AttributeKV({ key: 'Numbers', value: '12345' });
    complexAttributes[4] = CustomNFTCollection.AttributeKV({ key: 'Boolean-like', value: 'true' });

    uint256 tokenId = collection.mint(
      recipient,
      'Complex Token',
      'A token with complex attribute encoding',
      'ipfs://QmComplexImage',
      complexAttributes
    );

    // Get the token URI and verify it's a data URI
    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(bytes(tokenURI).length > 0);

    // The tokenURI should be a base64-encoded JSON data URI
    // We can't easily decode it in Solidity, but we can verify the format
    bytes memory uriBytes = bytes(tokenURI);
    bytes memory expectedPrefix = bytes('data:application/json;base64,');

    // Check prefix
    for (uint256 i = 0; i < expectedPrefix.length; i++) {
      assertEq(uriBytes[i], expectedPrefix[i]);
    }

    vm.stopPrank();
  }

  function test_DefaultValueFallbacks() public {
    vm.startPrank(creator);

    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);

    // Mint with empty values to test fallbacks
    uint256 tokenId = collection.mint(
      recipient,
      '', // empty name - should fallback to "GAME #1"
      '', // empty description - should use collection description
      '', // empty image - should use default image
      emptyAttributes
    );

    string memory tokenURI = collection.tokenURI(tokenId);
    assertTrue(bytes(tokenURI).length > 0);

    // Verify token exists and is owned correctly
    assertEq(collection.ownerOf(tokenId), recipient);

    vm.stopPrank();
  }

  function test_MaxSupplyEnforcement() public {
    // Create a collection with max supply of 2
    vm.startPrank(creator);
    address smallCollectionAddr = factory.createCollection(
      'Small Collection',
      'SMALL',
      'Limited edition',
      'ipfs://QmSmallDefault',
      true,
      2 // max supply = 2
    );
    CustomNFTCollection smallCollection = CustomNFTCollection(smallCollectionAddr);
    vm.stopPrank();

    vm.startPrank(creator); // creator is automatically a minter

    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);

    // Mint first token
    uint256 token1 = smallCollection.mint(recipient, 'Token 1', '', '', emptyAttributes);
    assertEq(token1, 1);
    assertEq(smallCollection.totalMinted(), 1);

    // Mint second token
    uint256 token2 = smallCollection.mint(recipient, 'Token 2', '', '', emptyAttributes);
    assertEq(token2, 2);
    assertEq(smallCollection.totalMinted(), 2);

    // Third mint should fail
    vm.expectRevert('Max supply reached');
    smallCollection.mint(recipient, 'Token 3', '', '', emptyAttributes);

    vm.stopPrank();
  }

  function test_UnlimitedSupplyMinting() public {
    // Create unlimited supply collection
    vm.startPrank(creator);
    address unlimitedAddr = factory.createCollection(
      'Unlimited Collection',
      'UNLIM',
      'No limits',
      'ipfs://QmUnlimited',
      false, // unlimited supply
      0
    );
    CustomNFTCollection unlimitedCollection = CustomNFTCollection(unlimitedAddr);
    vm.stopPrank();

    vm.startPrank(creator);

    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);

    // Mint many tokens without hitting limit
    for (uint256 i = 1; i <= 100; i++) {
      uint256 tokenId = unlimitedCollection.mint(
        recipient,
        string.concat(unicode'Token ', vm.toString(i)),
        '',
        '',
        emptyAttributes
      );
      assertEq(tokenId, i);
    }

    assertEq(unlimitedCollection.totalMinted(), 100);
    assertEq(unlimitedCollection.balanceOf(recipient), 100);

    vm.stopPrank();
  }

  function test_MultipleRecipientsAndMinters() public {
    address recipient1 = makeAddr('recipient1');
    address recipient2 = makeAddr('recipient2');
    address recipient3 = makeAddr('recipient3');

    vm.startPrank(creator);
    collection.grantMinter(minter1);
    collection.grantMinter(minter2);
    vm.stopPrank();

    CustomNFTCollection.AttributeKV[] memory emptyAttributes = new CustomNFTCollection.AttributeKV[](0);

    // Minter1 mints to recipient1
    vm.startPrank(minter1);
    uint256 token1 = collection.mint(recipient1, 'Token for Recipient 1', '', '', emptyAttributes);
    assertEq(collection.ownerOf(token1), recipient1);
    vm.stopPrank();

    // Minter2 mints to recipient2
    vm.startPrank(minter2);
    uint256 token2 = collection.mint(recipient2, 'Token for Recipient 2', '', '', emptyAttributes);
    assertEq(collection.ownerOf(token2), recipient2);
    vm.stopPrank();

    // Creator mints to recipient3
    vm.startPrank(creator);
    uint256 token3 = collection.mint(recipient3, 'Token for Recipient 3', '', '', emptyAttributes);
    assertEq(collection.ownerOf(token3), recipient3);
    vm.stopPrank();

    // Verify balances
    assertEq(collection.balanceOf(recipient1), 1);
    assertEq(collection.balanceOf(recipient2), 1);
    assertEq(collection.balanceOf(recipient3), 1);
    assertEq(collection.totalMinted(), 3);
  }
}
