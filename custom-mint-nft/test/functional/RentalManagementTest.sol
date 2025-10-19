// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Test, console2 } from '../../lib/forge-std/src/Test.sol';
import { CustomNFT } from '../../src/CustomNFT.sol';
import { CustomNFTCollection } from '../../src/CustomNFTCollection.sol';
import { IERC4907 } from '../../src/interfaces/IERC4907.sol';

/**
 * @title RentalManagementTest
 * @notice Functional tests for ERC4907 rental functionality
 */
contract RentalManagementTest is Test {
  CustomNFT public factory;
  CustomNFTCollection public collection;

  address public admin = makeAddr('admin');
  address public creator = makeAddr('creator');
  address public owner = makeAddr('owner');
  address public renter1 = makeAddr('renter1');
  address public renter2 = makeAddr('renter2');

  event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

  function setUp() public {
    // Deploy factory and create collection
    factory = new CustomNFT(admin);

    vm.startPrank(admin);
    factory.authorizeCreator(creator);
    vm.stopPrank();

    vm.startPrank(creator);
    address collectionAddr = factory.createCollection(
      'Rental Gaming Assets',
      'RGAME',
      'Gaming assets available for rental',
      'ipfs://QmRentalDefault',
      true,
      1000
    );
    collection = CustomNFTCollection(collectionAddr);

    // Mint some tokens for rental testing
    CustomNFTCollection.AttributeKV[] memory gameAttributes = new CustomNFTCollection.AttributeKV[](2);
    gameAttributes[0] = CustomNFTCollection.AttributeKV({ key: 'Type', value: 'Weapon' });
    gameAttributes[1] = CustomNFTCollection.AttributeKV({ key: 'Power', value: '100' });

    collection.mint(owner, 'Legendary Sword', 'A powerful sword', 'ipfs://QmSword', gameAttributes);
    collection.mint(owner, 'Magic Shield', 'Protective shield', 'ipfs://QmShield', gameAttributes);
    collection.mint(owner, 'Speed Boots', 'Increases movement speed', 'ipfs://QmBoots', gameAttributes);

    vm.stopPrank();
  }

  function test_SetUserAndRentalFlow() public {
    uint256 tokenId = 1;
    uint64 rentalDuration = 7 days;
    uint64 expires = uint64(block.timestamp + rentalDuration);

    // Verify initial state
    assertEq(collection.ownerOf(tokenId), owner);
    assertEq(collection.userOf(tokenId), address(0));
    assertEq(collection.userExpires(tokenId), 0);

    // Creator sets rental user
    vm.startPrank(creator);

    vm.expectEmit(true, true, false, true);
    emit UpdateUser(tokenId, renter1, expires);

    collection.setUser(tokenId, renter1, expires);

    vm.stopPrank();

    // Verify rental state
    assertEq(collection.ownerOf(tokenId), owner); // Owner unchanged
    assertEq(collection.userOf(tokenId), renter1); // User set
    assertEq(collection.userExpires(tokenId), expires);

    // Fast forward to before expiration
    vm.warp(block.timestamp + 3 days);
    assertEq(collection.userOf(tokenId), renter1); // Still renter1

    // Fast forward past expiration
    vm.warp(block.timestamp + 5 days); // Total 8 days, past 7-day rental
    assertEq(collection.userOf(tokenId), address(0)); // Rental expired
  }

  function test_ChangeRentalUser() public {
    uint256 tokenId = 1;
    uint64 expires1 = uint64(block.timestamp + 5 days);
    uint64 expires2 = uint64(block.timestamp + 10 days);

    vm.startPrank(creator);

    // Set first rental
    collection.setUser(tokenId, renter1, expires1);
    assertEq(collection.userOf(tokenId), renter1);

    // Change to second renter before first expires
    vm.expectEmit(true, true, false, true);
    emit UpdateUser(tokenId, renter2, expires2);

    collection.setUser(tokenId, renter2, expires2);
    assertEq(collection.userOf(tokenId), renter2);
    assertEq(collection.userExpires(tokenId), expires2);

    vm.stopPrank();
  }

  function test_ClearRentalUser() public {
    uint256 tokenId = 1;
    uint64 expires = uint64(block.timestamp + 7 days);

    vm.startPrank(creator);

    // Set rental
    collection.setUser(tokenId, renter1, expires);
    assertEq(collection.userOf(tokenId), renter1);

    // Clear rental by setting user to zero address
    vm.expectEmit(true, true, false, true);
    emit UpdateUser(tokenId, address(0), 0);

    collection.setUser(tokenId, address(0), 0);
    assertEq(collection.userOf(tokenId), address(0));
    assertEq(collection.userExpires(tokenId), 0);

    vm.stopPrank();
  }

  function test_MultipleTokenRentals() public {
    uint64 expires = uint64(block.timestamp + 7 days);

    vm.startPrank(creator);

    // Rent different tokens to different users
    collection.setUser(1, renter1, expires);
    collection.setUser(2, renter2, expires);
    collection.setUser(3, renter1, expires + 3 days); // Different expiration

    // Verify each rental
    assertEq(collection.userOf(1), renter1);
    assertEq(collection.userOf(2), renter2);
    assertEq(collection.userOf(3), renter1);

    assertEq(collection.userExpires(1), expires);
    assertEq(collection.userExpires(2), expires);
    assertEq(collection.userExpires(3), expires + 3 days);

    vm.stopPrank();

    // Fast forward to when first two rentals expire but third doesn't
    vm.warp(block.timestamp + 8 days);

    assertEq(collection.userOf(1), address(0)); // Expired
    assertEq(collection.userOf(2), address(0)); // Expired
    assertEq(collection.userOf(3), renter1); // Still active

    // Fast forward to when all rentals expire
    vm.warp(block.timestamp + 3 days);

    assertEq(collection.userOf(1), address(0));
    assertEq(collection.userOf(2), address(0));
    assertEq(collection.userOf(3), address(0)); // Now expired
  }

  function test_RentalDuringOwnershipTransfer() public {
    uint256 tokenId = 1;
    uint64 expires = uint64(block.timestamp + 7 days);
    address newOwner = makeAddr('newOwner');

    vm.startPrank(creator);
    collection.setUser(tokenId, renter1, expires);
    vm.stopPrank();

    // Verify rental is active
    assertEq(collection.ownerOf(tokenId), owner);
    assertEq(collection.userOf(tokenId), renter1);

    // Owner transfers token to new owner
    vm.startPrank(owner);
    collection.transferFrom(owner, newOwner, tokenId);
    vm.stopPrank();

    // Verify ownership changed but rental remains
    assertEq(collection.ownerOf(tokenId), newOwner);
    assertEq(collection.userOf(tokenId), renter1); // Rental should persist
    assertEq(collection.userExpires(tokenId), expires);
  }

  function test_SetUser_RevertWhenNotAdmin() public {
    uint256 tokenId = 1;
    uint64 expires = uint64(block.timestamp + 7 days);

    // Owner tries to set user (should fail - only admin can)
    vm.startPrank(owner);
    vm.expectRevert(); // AccessControl revert
    collection.setUser(tokenId, renter1, expires);
    vm.stopPrank();

    // Renter tries to set user (should fail)
    vm.startPrank(renter1);
    vm.expectRevert(); // AccessControl revert
    collection.setUser(tokenId, renter2, expires);
    vm.stopPrank();

    // Random user tries to set user (should fail)
    vm.startPrank(makeAddr('random'));
    vm.expectRevert(); // AccessControl revert
    collection.setUser(tokenId, renter1, expires);
    vm.stopPrank();
  }

  function test_SetUser_RevertWhenTokenDoesntExist() public {
    uint256 nonExistentTokenId = 999;
    uint64 expires = uint64(block.timestamp + 7 days);

    vm.startPrank(creator);

    vm.expectRevert(); // _requireOwned revert
    collection.setUser(nonExistentTokenId, renter1, expires);

    vm.stopPrank();
  }

  function test_RentalWithZeroExpiration() public {
    uint256 tokenId = 1;

    vm.startPrank(creator);

    // Set user with zero expiration (immediate expiration)
    collection.setUser(tokenId, renter1, 0);

    // Should immediately return address(0) since expiration is in the past
    assertEq(collection.userOf(tokenId), address(0));
    assertEq(collection.userExpires(tokenId), 0);

    vm.stopPrank();
  }

  function test_RentalWithPastExpiration() public {
    uint256 tokenId = 1;

    // Ensure we have a reasonable timestamp to avoid underflow
    vm.warp(2 days);
    uint64 pastExpiration = uint64(block.timestamp - 1 days);

    vm.startPrank(creator);

    // Set user with past expiration
    collection.setUser(tokenId, renter1, pastExpiration);

    // Should return address(0) since expiration is in the past
    assertEq(collection.userOf(tokenId), address(0));
    assertEq(collection.userExpires(tokenId), pastExpiration); // Stored value unchanged

    vm.stopPrank();
  }

  function test_ExtendRental() public {
    uint256 tokenId = 1;
    uint64 initialExpires = uint64(block.timestamp + 3 days);
    uint64 extendedExpires = uint64(block.timestamp + 10 days);

    vm.startPrank(creator);

    // Set initial rental
    collection.setUser(tokenId, renter1, initialExpires);
    assertEq(collection.userOf(tokenId), renter1);
    assertEq(collection.userExpires(tokenId), initialExpires);

    // Extend rental
    collection.setUser(tokenId, renter1, extendedExpires);
    assertEq(collection.userOf(tokenId), renter1);
    assertEq(collection.userExpires(tokenId), extendedExpires);

    vm.stopPrank();

    // Fast forward past original expiration but before extended expiration
    vm.warp(block.timestamp + 5 days);
    assertEq(collection.userOf(tokenId), renter1); // Should still be active
  }

  function test_ERC4907InterfaceSupport() public {
    // Verify the contract supports ERC4907 interface
    assertTrue(collection.supportsInterface(type(IERC4907).interfaceId));

    // Also verify it still supports standard ERC721 interfaces
    assertTrue(collection.supportsInterface(0x80ac58cd)); // ERC721
    assertTrue(collection.supportsInterface(0x5b5e139f)); // ERC721Metadata
  }

  function test_RentalStateAfterBurn() public {
    uint256 tokenId = 1;
    uint64 expires = uint64(block.timestamp + 7 days);

    vm.startPrank(creator);
    collection.setUser(tokenId, renter1, expires);
    vm.stopPrank();

    // Verify rental is active
    assertEq(collection.userOf(tokenId), renter1);

    // Note: ERC721 doesn't have a public burn function by default
    // This test documents expected behavior if burn were implemented
    // The rental data would typically be cleared on burn
  }
}
