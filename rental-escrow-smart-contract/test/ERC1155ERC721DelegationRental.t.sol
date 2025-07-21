// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from 'forge-std/Test.sol';
import {DelegationRegistry} from '../src/DelegationRegistryERC1155ERC721.sol';
import {ERC721Mock} from './mocks/ERC721Mock.sol';
import {ERC1155Mock} from './mocks/ERC1155Mock.sol';
import {RentalEnums} from '../src/libraries/RentalEnums.sol';

contract DelegationRegistryTest is Test {
    DelegationRegistry internal registry;
    ERC721Mock internal mockERC721;
    ERC1155Mock internal mockERC1155;

    address internal constant FACTORY = address(1);
    address internal constant OWNER = address(2);
    address internal constant RENTER = address(3);
    address internal constant UNAUTHORIZED_CALLER = address(4);
    uint256 internal constant TOKEN_ID = 1;

    event NftDeposited(address indexed nft, uint256 indexed tokenId, address indexed owner);
    event NftWithdrawn(address indexed nft, uint256 indexed tokenId, address indexed owner);
    event DelegationSet(address indexed nft, uint256 indexed tokenId, address indexed user, uint64 expires);
    event DelegationRevoked(address indexed nft, uint256 indexed tokenId);

    function setUp() public {
        vm.warp(1 days);
        vm.startPrank(FACTORY);
        registry = new DelegationRegistry(FACTORY);
        vm.stopPrank();

        mockERC721 = new ERC721Mock('Mock NFT', 'MNFT');
        mockERC1155 = new ERC1155Mock('');

        mockERC721.mint(OWNER, TOKEN_ID);
        mockERC1155.mint(OWNER, TOKEN_ID, 1, '');
    }

    function test_constructor_setsFactoryAndAuthorizesIt() public view {
        assertEq(registry.i_factory(), FACTORY);
        assertTrue(registry.isAuthorized(FACTORY));
    }

    function test_revert_addAuthorized_whenNotCalledByFactory() public {
        vm.prank(UNAUTHORIZED_CALLER);
        vm.expectRevert(abi.encodeWithSelector(DelegationRegistry.DelegationRegistry__NotAuthorized.selector));
        registry.addAuthorized(address(5));
    }

    function test_addAuthorized_addsAddressToAuthorizedMapping() public {
        vm.prank(FACTORY);
        registry.addAuthorized(address(5));
        assertTrue(registry.isAuthorized(address(5)));
    }

    function test_revert_removeAuthorized_whenNotCalledByFactory() public {
        vm.prank(UNAUTHORIZED_CALLER);
        vm.expectRevert(abi.encodeWithSelector(DelegationRegistry.DelegationRegistry__NotAuthorized.selector));
        registry.removeAuthorized(FACTORY);
    }

    function test_removeAuthorized_removesAddressFromAuthorizedMapping() public {
        vm.prank(FACTORY);
        registry.addAuthorized(address(5));
        assertTrue(registry.isAuthorized(address(5)));

        vm.prank(FACTORY);
        registry.removeAuthorized(address(5));
        assertFalse(registry.isAuthorized(address(5)));
    }

    function test_depositERC721_storesNftAndOwner() public {
        vm.startPrank(OWNER);
        vm.expectEmit(true, true, true, true);
        emit NftDeposited(address(mockERC721), TOKEN_ID, OWNER);
        mockERC721.safeTransferFrom(OWNER, address(registry), TOKEN_ID);
        vm.stopPrank();

        assertEq(registry.originalOwnerOf(address(mockERC721), TOKEN_ID), OWNER);
        assertEq(uint(registry.nftStandard(address(mockERC721))), uint(RentalEnums.NftStandard.ERC721));
    }

    function test_depositERC1155_storesNftAndOwner() public {
        vm.startPrank(OWNER);
        vm.expectEmit(true, true, true, true);
        emit NftDeposited(address(mockERC1155), TOKEN_ID, OWNER);
        mockERC1155.safeTransferFrom(OWNER, address(registry), TOKEN_ID, 1, '');
        vm.stopPrank();

        assertEq(registry.originalOwnerOf(address(mockERC1155), TOKEN_ID), OWNER);
        assertEq(uint(registry.nftStandard(address(mockERC1155))), uint(RentalEnums.NftStandard.ERC1155));
    }

    function test_revert_depositERC1155_whenAmountIsNotOne() public {
        mockERC1155.mint(OWNER, 2, 5, '');
        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(DelegationRegistry.DelegationRegistry__InvalidAmount.selector));
        mockERC1155.safeTransferFrom(OWNER, address(registry), 2, 5, '');
    }

    function test_revert_onERC1155BatchReceived() public {
        mockERC1155.mint(OWNER, TOKEN_ID + 1, 1, '');

        uint256[] memory ids = new uint256[](2);
        ids[0] = TOKEN_ID;
        ids[1] = TOKEN_ID + 1;
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 1;
        amounts[1] = 1;
        vm.prank(OWNER);
        vm.expectRevert('Batch deposit not supported');
        mockERC1155.safeBatchTransferFrom(OWNER, address(registry), ids, amounts, '');
    }

    function test_revert_setDelegation_whenNotAuthorized() public {
        vm.prank(UNAUTHORIZED_CALLER);
        vm.expectRevert(abi.encodeWithSelector(DelegationRegistry.DelegationRegistry__NotAuthorized.selector));
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, uint64(block.timestamp + 1 days));
    }

    function test_setDelegation_setsDelegationCorrectly() public {
        uint64 expires = uint64(block.timestamp + 1 days);
        vm.prank(FACTORY);
        vm.expectEmit(true, true, true, true);
        emit DelegationSet(address(mockERC721), TOKEN_ID, RENTER, expires);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires);

        assertEq(registry.userOf(address(mockERC721), TOKEN_ID), RENTER);
        assertEq(registry.userExpires(address(mockERC721), TOKEN_ID), expires);
    }
    
    function test_revokeDelegation_revokesDelegation() public {
        uint64 expires = uint64(block.timestamp + 1 days);
        vm.prank(FACTORY);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires);

        vm.expectEmit(true, true, false, true);
        emit DelegationRevoked(address(mockERC721), TOKEN_ID);
        vm.prank(FACTORY);
        registry.revokeDelegation(address(mockERC721), TOKEN_ID);

        assertEq(registry.userOf(address(mockERC721), TOKEN_ID), address(0));
        assertEq(registry.userExpires(address(mockERC721), TOKEN_ID), 0);
    }

    function test_userOf_returnsUserForActiveDelegation() public {
        uint64 expires = uint64(block.timestamp + 1 days);
        vm.prank(FACTORY);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires);

        assertEq(registry.userOf(address(mockERC721), TOKEN_ID), RENTER);
    }

    function test_userOf_returnsZeroAddressForExpiredDelegation() public {
        uint64 expires = uint64(block.timestamp + 1 days);
        vm.prank(FACTORY);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires);

        vm.warp(expires);

        assertEq(registry.userOf(address(mockERC721), TOKEN_ID), address(0));
    }
    
    function test_userExpires_returnsCorrectExpiration() public {
        uint64 expires = uint64(block.timestamp + 1 days);
        vm.prank(FACTORY);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires);

        assertEq(registry.userExpires(address(mockERC721), TOKEN_ID), expires);
    }

    function test_revert_withdrawNft_whenNotOriginalOwner() public {
        vm.prank(OWNER);
        mockERC721.safeTransferFrom(OWNER, address(registry), TOKEN_ID);

        vm.prank(UNAUTHORIZED_CALLER);
        vm.expectRevert(abi.encodeWithSelector(DelegationRegistry.DelegationRegistry__NotOriginalOwner.selector));
        registry.withdrawNft(address(mockERC721), TOKEN_ID);
    }

    function test_revert_withdrawNft_whenDelegationIsActive() public {
        vm.prank(OWNER);
        mockERC721.safeTransferFrom(OWNER, address(registry), TOKEN_ID);

        vm.prank(FACTORY);
        uint64 expires = uint64(block.timestamp + 1 days);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires);

        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(DelegationRegistry.DelegationRegistry__ActiveDelegation.selector));
        registry.withdrawNft(address(mockERC721), TOKEN_ID);
    }

    function test_withdrawNft_transfersERC721BackToOwner() public {
        vm.prank(OWNER);
        mockERC721.safeTransferFrom(OWNER, address(registry), TOKEN_ID);

        vm.prank(OWNER);
        vm.expectEmit(true, true, true, true);
        emit NftWithdrawn(address(mockERC721), TOKEN_ID, OWNER);
        registry.withdrawNft(address(mockERC721), TOKEN_ID);

        assertEq(mockERC721.ownerOf(TOKEN_ID), OWNER);
        assertEq(registry.originalOwnerOf(address(mockERC721), TOKEN_ID), address(0));
    }

    function test_withdrawNft_transfersERC1155BackToOwner() public {
        vm.prank(OWNER);
        mockERC1155.safeTransferFrom(OWNER, address(registry), TOKEN_ID, 1, '');

        vm.prank(OWNER);
        vm.expectEmit(true, true, true, true);
        emit NftWithdrawn(address(mockERC1155), TOKEN_ID, OWNER);
        registry.withdrawNft(address(mockERC1155), TOKEN_ID);

        assertEq(mockERC1155.balanceOf(OWNER, TOKEN_ID), 1);
        assertEq(registry.originalOwnerOf(address(mockERC1155), TOKEN_ID), address(0));
    }

    function test_withdrawNft_afterDelegationExpires() public {
        vm.prank(OWNER);
        mockERC721.safeTransferFrom(OWNER, address(registry), TOKEN_ID);

        vm.prank(FACTORY);
        uint64 expires = uint64(block.timestamp + 1 days);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires);

        vm.warp(expires);

        vm.prank(OWNER);
        registry.withdrawNft(address(mockERC721), TOKEN_ID);

        assertEq(mockERC721.ownerOf(TOKEN_ID), OWNER);
    }

    function test_revert_revokeDelegation_whenNotAuthorized() public {
        vm.prank(UNAUTHORIZED_CALLER);
        vm.expectRevert(abi.encodeWithSelector(DelegationRegistry.DelegationRegistry__NotAuthorized.selector));
        registry.revokeDelegation(address(mockERC721), TOKEN_ID);
    }

    function test_setDelegation_overwritesExistingDelegation() public {
        uint64 expires1 = uint64(block.timestamp + 1 days);
        vm.prank(FACTORY);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires1);

        assertEq(registry.userOf(address(mockERC721), TOKEN_ID), RENTER);
        assertEq(registry.userExpires(address(mockERC721), TOKEN_ID), expires1);

        address anotherRenter = address(6);
        uint64 expires2 = uint64(block.timestamp + 2 days);
        vm.prank(FACTORY);
        vm.expectEmit(true, true, true, true);
        emit DelegationSet(address(mockERC721), TOKEN_ID, anotherRenter, expires2);
        registry.setDelegation(address(mockERC721), TOKEN_ID, anotherRenter, expires2);

        assertEq(registry.userOf(address(mockERC721), TOKEN_ID), anotherRenter);
        assertEq(registry.userExpires(address(mockERC721), TOKEN_ID), expires2);
    }

    function test_setDelegation_withPastExpiration() public {
        uint64 expires = uint64(block.timestamp + 1 days);
        vm.prank(FACTORY);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires);

        vm.warp(block.timestamp + 2 days);

        uint64 pastExpires = uint64(block.timestamp - 1 days);
        vm.prank(FACTORY);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, pastExpires);

        assertEq(registry.userOf(address(mockERC721), TOKEN_ID), address(0));
        assertEq(registry.userExpires(address(mockERC721), TOKEN_ID), pastExpires);
    }

    function test_revokeDelegation_onNonExistentDelegation() public {
        vm.prank(FACTORY);
        registry.revokeDelegation(address(mockERC721), TOKEN_ID);
        assertEq(registry.userOf(address(mockERC721), TOKEN_ID), address(0));
        assertEq(registry.userExpires(address(mockERC721), TOKEN_ID), 0);
    }

    function test_originalOwnerOf_forNonDepositedToken() public view {
        assertEq(registry.originalOwnerOf(address(mockERC721), TOKEN_ID + 5), address(0));
    }

    function test_withdrawNft_afterDelegationRevoked() public {
        vm.prank(OWNER);
        mockERC721.safeTransferFrom(OWNER, address(registry), TOKEN_ID);

        vm.prank(FACTORY);
        uint64 expires = uint64(block.timestamp + 1 days);
        registry.setDelegation(address(mockERC721), TOKEN_ID, RENTER, expires);

        vm.prank(FACTORY);
        registry.revokeDelegation(address(mockERC721), TOKEN_ID);

        vm.prank(OWNER);
        registry.withdrawNft(address(mockERC721), TOKEN_ID);

        assertEq(mockERC721.ownerOf(TOKEN_ID), OWNER);
    }

    function test_deposit_updatesOwnerOnReDeposit() public {
        vm.prank(OWNER);
        mockERC721.safeTransferFrom(OWNER, address(registry), TOKEN_ID);
        assertEq(registry.originalOwnerOf(address(mockERC721), TOKEN_ID), OWNER);

        vm.prank(OWNER);
        registry.withdrawNft(address(mockERC721), TOKEN_ID);
        assertEq(mockERC721.ownerOf(TOKEN_ID), OWNER);
        assertEq(registry.originalOwnerOf(address(mockERC721), TOKEN_ID), address(0));

        vm.startPrank(OWNER);
        mockERC721.transferFrom(OWNER, RENTER, TOKEN_ID);
        vm.stopPrank();

        vm.startPrank(RENTER);
        mockERC721.safeTransferFrom(RENTER, address(registry), TOKEN_ID);
        assertEq(registry.originalOwnerOf(address(mockERC721), TOKEN_ID), RENTER);
        vm.stopPrank();
    }

    function test_revert_withdrawNft_whenDelegationIsActiveERC1155() public {
        vm.prank(OWNER);
        mockERC1155.safeTransferFrom(OWNER, address(registry), TOKEN_ID, 1, "");

        vm.prank(FACTORY);
        uint64 expires = uint64(block.timestamp + 1 days);
        registry.setDelegation(address(mockERC1155), TOKEN_ID, RENTER, expires);

        vm.prank(OWNER);
        vm.expectRevert(abi.encodeWithSelector(DelegationRegistry.DelegationRegistry__ActiveDelegation.selector));
        registry.withdrawNft(address(mockERC1155), TOKEN_ID);
    }
}