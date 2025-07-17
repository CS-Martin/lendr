// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC721Receiver} from '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';
import {IERC1155Receiver} from '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';
import {IERC721} from '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import {IERC1155} from '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import {IERC165} from '@openzeppelin/contracts/utils/introspection/IERC165.sol';

/**
 * @title DelegationRegistry
 * @dev Manages NFT custody and delegation for non-ERC4907 assets.
 * This contract acts as a centralized escrow and registry for ERC721 and ERC1155 NFTs,
 * allowing rental agreements to manage usage rights without taking direct custody.
 */
contract DelegationRegistry is IERC721Receiver, IERC1155Receiver {
    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/
    error DelegationRegistry__NotAuthorized();
    error DelegationRegistry__NotOriginalOwner();
    error DelegationRegistry__ActiveDelegation();
    error DelegationRegistry__WithdrawalFailed();
    error DelegationRegistry__InvalidNftContract();

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/
    event NftDeposited(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed owner
    );
    event NftWithdrawn(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed owner
    );
    event DelegationSet(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed user,
        uint64 expires
    );
    event DelegationRevoked(
        address indexed nftContract,
        uint256 indexed tokenId
    );

    /*//////////////////////////////////////////////////////////////
                            TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/
    struct Delegation {
        address user;
        uint64 expires;
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/
    mapping(address => mapping(uint256 => Delegation)) private _delegations;
    mapping(address => mapping(uint256 => address)) public originalOwnerOf;
    address public immutable i_authorizedFactory;

    /*//////////////////////////////////////////////////////////////
                                MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier onlyAuthorized() {
        if (msg.sender != i_authorizedFactory) {
            revert DelegationRegistry__NotAuthorized();
        }
        _;
    }

    /*//////////////////////////////////////////////////////////////
                                CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/
    constructor(address authorizedFactory) {
        i_authorizedFactory = authorizedFactory;
    }

    /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Sets or updates the delegation for a given NFT.
     * @dev Can only be called by the authorized factory contract.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     * @param user The address of the user to delegate to.
     * @param expires The UNIX timestamp when the delegation expires.
     */
    function setDelegation(
        address nftContract,
        uint256 tokenId,
        address user,
        uint64 expires
    ) external onlyAuthorized {
        _delegations[nftContract][tokenId] = Delegation(user, expires);
        emit DelegationSet(nftContract, tokenId, user, expires);
    }

    /**
     * @notice Revokes the delegation for a given NFT.
     * @dev Can only be called by the authorized factory contract.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     */
    function revokeDelegation(
        address nftContract,
        uint256 tokenId
    ) external onlyAuthorized {
        delete _delegations[nftContract][tokenId];
        emit DelegationRevoked(nftContract, tokenId);
    }

    /**
     * @notice Allows the original owner to withdraw their NFT from the registry.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     */
    function withdrawNft(address nftContract, uint256 tokenId) external {
        address originalOwner = originalOwnerOf[nftContract][tokenId];
        if (msg.sender != originalOwner) {
            revert DelegationRegistry__NotOriginalOwner();
        }
        if (userOf(nftContract, tokenId) != address(0)) {
            revert DelegationRegistry__ActiveDelegation();
        }
        
        delete originalOwnerOf[nftContract][tokenId];
        emit NftWithdrawn(nftContract, tokenId, originalOwner);

        // This is a simplified check. A production implementation might need to distinguish standards.
        try IERC721(nftContract).safeTransferFrom(address(this), originalOwner, tokenId) {}
        catch {
            try IERC1155(nftContract).safeTransferFrom(address(this), originalOwner, tokenId, 1, "") {}
            catch {
                revert DelegationRegistry__WithdrawalFailed();
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Gets the user of an NFT if a valid delegation exists.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     * @return The address of the user if the delegation is active, otherwise address(0).
     */
    function userOf(
        address nftContract,
        uint256 tokenId
    ) public view returns (address) {
        Delegation storage delegation = _delegations[nftContract][tokenId];
        if (block.timestamp < delegation.expires) {
            return delegation.user;
        }
        return address(0);
    }

    /**
     * @notice Gets the expiration timestamp of a delegation.
     * @param nftContract The address of the NFT contract.
     * @param tokenId The ID of the token.
     * @return The expiration timestamp.
     */
    function userExpires(
        address nftContract,
        uint256 tokenId
    ) public view returns (uint256) {
        return _delegations[nftContract][tokenId].expires;
    }

    /*//////////////////////////////////////////////////////////////
                        ERC RECEIVER HOOKS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Handles the receipt of an ERC721 token.
     */
    function onERC721Received(
        address,
        address from,
        uint256 tokenId,
        bytes calldata
    ) external override returns (bytes4) {
        originalOwnerOf[msg.sender][tokenId] = from;
        emit NftDeposited(msg.sender, tokenId, from);
        return this.onERC721Received.selector;
    }

    /**
     * @notice Handles the receipt of an ERC1155 token.
     */
    function onERC1155Received(
        address,
        address from,
        uint256 id,
        uint256,
        bytes calldata
    ) external override returns (bytes4) {
        originalOwnerOf[msg.sender][id] = from;
        emit NftDeposited(msg.sender, id, from);
        return this.onERC1155Received.selector;
    }

    /**
     * @notice Handles the receipt of multiple ERC1155 tokens.
     * @dev Not supported for this rental system's logic.
     */
    function onERC1155BatchReceived(
        address,
        address,
        uint256[] calldata,
        uint256[] calldata,
        bytes calldata
    ) external pure override returns (bytes4) {
        revert("Batch deposit not supported");
    }

    /**
     * @notice Checks if the contract supports an interface.
     * @param interfaceId The interface identifier.
     * @return bool True if the interface is supported, false otherwise.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC721Receiver).interfaceId ||
            interfaceId == type(IERC1155Receiver).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }
} 