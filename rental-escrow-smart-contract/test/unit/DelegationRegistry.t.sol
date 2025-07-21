// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from 'forge-std/Test.sol';
import {DelegationRegistry} from '../../src/DelegationRegistry.sol';
import {RentalEnums} from '../../src/libraries/RentalEnums.sol';
import {ERC721Mock} from '../mocks/ERC721Mock.sol';
import {ERC1155Mock} from '../mocks/ERC1155Mock.sol';

contract DelegationRegistryUnitTest is Test {
    DelegationRegistry internal delegationRegistry;
    ERC721Mock internal erc721Mock;
    ERC1155Mock internal erc1155Mock;

    address internal factory;
    address internal authorizedContract;
    address internal unauthorizedContract;
    address internal owner;
    address internal user;

    uint256 internal constant TOKEN_ID = 1;
    uint64 internal EXPIRATION;

    function setUp() public {
        factory = makeAddr('factory');
        authorizedContract = makeAddr('authorized');
        unauthorizedContract = makeAddr('unauthorized');
        owner = makeAddr('owner');
        user = makeAddr('user');

        vm.prank(factory);
        delegationRegistry = new DelegationRegistry(factory);

        vm.prank(factory);
        delegationRegistry.addAuthorized(authorizedContract);

        erc721Mock = new ERC721Mock('ERC721', 'E721');
        erc1155Mock = new ERC1155Mock('ipfs://');

        erc721Mock.mint(owner, TOKEN_ID);
        erc1155Mock.mint(owner, TOKEN_ID, 1, '');
        
        EXPIRATION = uint64(block.timestamp + 1 hours);
    }

    /*//////////////////////////////////////////////////////////////
                        AUTHORIZATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Fail_AddAuthorized_FromNonFactory() public {
        vm.expectRevert(DelegationRegistry.DelegationRegistry__NotAuthorized.selector);
        delegationRegistry.addAuthorized(makeAddr('newUser'));
    }

    function test_Fail_RemoveAuthorized_FromNonFactory() public {
        vm.expectRevert(DelegationRegistry.DelegationRegistry__NotAuthorized.selector);
        delegationRegistry.removeAuthorized(authorizedContract);
    }

    function test_AddAndRemove_Authorization() public {
        address newAuthorized = makeAddr('newAuthorized');
        
        vm.prank(factory);
        delegationRegistry.addAuthorized(newAuthorized);
        assertTrue(delegationRegistry.isAuthorized(newAuthorized));

        vm.prank(factory);
        delegationRegistry.removeAuthorized(newAuthorized);
        assertFalse(delegationRegistry.isAuthorized(newAuthorized));
    }

    /*//////////////////////////////////////////////////////////////
                        DELEGATION TESTS
    //////////////////////////////////////////////////////////////*/

    function test_SetAndGet_Delegation() public {
        vm.prank(authorizedContract);
        delegationRegistry.setDelegation(address(erc721Mock), TOKEN_ID, user, EXPIRATION);

        DelegationRegistry.Delegation memory delegation = delegationRegistry.getDelegation(address(erc721Mock), TOKEN_ID);
        assertEq(delegation.user, user);
        assertEq(delegation.expires, EXPIRATION);

        assertEq(delegationRegistry.userOf(address(erc721Mock), TOKEN_ID), user);
        assertEq(delegationRegistry.userExpires(address(erc721Mock), TOKEN_ID), EXPIRATION);
    }

    function test_Fail_SetDelegation_FromUnauthorized() public {
        vm.prank(unauthorizedContract);
        vm.expectRevert(DelegationRegistry.DelegationRegistry__NotAuthorized.selector);
        delegationRegistry.setDelegation(address(erc721Mock), TOKEN_ID, user, EXPIRATION);
    }

    function test_Revoke_Delegation() public {
        vm.prank(authorizedContract);
        delegationRegistry.setDelegation(address(erc721Mock), TOKEN_ID, user, EXPIRATION);

        vm.prank(authorizedContract);
        delegationRegistry.revokeDelegation(address(erc721Mock), TOKEN_ID);

        DelegationRegistry.Delegation memory delegation = delegationRegistry.getDelegation(address(erc721Mock), TOKEN_ID);
        assertEq(delegation.user, address(0));
        assertEq(delegation.expires, 0);
        assertEq(delegationRegistry.userOf(address(erc721Mock), TOKEN_ID), address(0));
    }

    function test_Expired_Delegation() public {
        vm.prank(authorizedContract);
        delegationRegistry.setDelegation(address(erc721Mock), TOKEN_ID, user, EXPIRATION);

        vm.warp(EXPIRATION + 1);

        assertEq(delegationRegistry.userOf(address(erc721Mock), TOKEN_ID), address(0));
    }

    /*//////////////////////////////////////////////////////////////
                        NFT RECEIVER & WITHDRAWAL TESTS
    //////////////////////////////////////////////////////////////*/

    function test_Receive_ERC721() public {
        vm.prank(owner);
        erc721Mock.safeTransferFrom(owner, address(delegationRegistry), TOKEN_ID);

        assertEq(delegationRegistry.originalOwnerOf(address(erc721Mock), TOKEN_ID), owner);
        assertEq(uint8(delegationRegistry.nftStandard(address(erc721Mock))), uint8(RentalEnums.NftStandard.ERC721));
    }

    function test_Receive_ERC1155() public {
        vm.prank(owner);
        erc1155Mock.safeTransferFrom(owner, address(delegationRegistry), TOKEN_ID, 1, "");

        assertEq(delegationRegistry.originalOwnerOf(address(erc1155Mock), TOKEN_ID), owner);
        assertEq(uint8(delegationRegistry.nftStandard(address(erc1155Mock))), uint8(RentalEnums.NftStandard.ERC1155));
    }

    function test_Fail_Receive_ERC1155_InvalidAmount() public {
        // We need to mint enough tokens to the owner so the initial balance check
        // in the ERC1155 contract passes. This allows us to test our specific
        // revert condition in the onERC1155Received hook.
        erc1155Mock.mint(owner, TOKEN_ID, 1, ""); // Owner now has 2 tokens in total

        vm.prank(owner);
        vm.expectRevert(DelegationRegistry.DelegationRegistry__InvalidAmount.selector);
        erc1155Mock.safeTransferFrom(owner, address(delegationRegistry), TOKEN_ID, 2, "");
    }

    function test_Withdraw_ERC721() public {
        vm.prank(owner);
        erc721Mock.safeTransferFrom(owner, address(delegationRegistry), TOKEN_ID);

        vm.prank(owner);
        delegationRegistry.withdrawNft(address(erc721Mock), TOKEN_ID);

        assertEq(erc721Mock.ownerOf(TOKEN_ID), owner);
        assertEq(delegationRegistry.originalOwnerOf(address(erc721Mock), TOKEN_ID), address(0));
    }

    function test_Withdraw_ERC1155() public {
        vm.prank(owner);
        erc1155Mock.safeTransferFrom(owner, address(delegationRegistry), TOKEN_ID, 1, "");

        vm.prank(owner);
        delegationRegistry.withdrawNft(address(erc1155Mock), TOKEN_ID);

        assertEq(erc1155Mock.balanceOf(owner, TOKEN_ID), 1);
        assertEq(delegationRegistry.originalOwnerOf(address(erc1155Mock), TOKEN_ID), address(0));
    }

    function test_Fail_Withdraw_NotOwner() public {
        vm.prank(owner);
        erc721Mock.safeTransferFrom(owner, address(delegationRegistry), TOKEN_ID);

        vm.prank(makeAddr('notOwner'));
        vm.expectRevert(DelegationRegistry.DelegationRegistry__NotOriginalOwner.selector);
        delegationRegistry.withdrawNft(address(erc721Mock), TOKEN_ID);
    }

    function test_Fail_Withdraw_ActiveDelegation() public {
        vm.prank(owner);
        erc721Mock.safeTransferFrom(owner, address(delegationRegistry), TOKEN_ID);

        vm.prank(authorizedContract);
        delegationRegistry.setDelegation(address(erc721Mock), TOKEN_ID, user, EXPIRATION);

        vm.prank(owner);
        vm.expectRevert(DelegationRegistry.DelegationRegistry__ActiveDelegation.selector);
        delegationRegistry.withdrawNft(address(erc721Mock), TOKEN_ID);
    }
} 