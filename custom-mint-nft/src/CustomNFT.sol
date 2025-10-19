// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { AccessControl } from '../lib/openzeppelin-contracts/contracts/access/AccessControl.sol';
import { ReentrancyGuard } from '../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol';
import { CustomNFTCollection } from './CustomNFTCollection.sol';

/**
 * @title CustomNFT (Factory)
 * @notice Factory for creating ERC721 + ERC4907 collections with whitelist minting and supply controls
 */
contract CustomNFT is AccessControl, ReentrancyGuard {
  /*//////////////////////////////////////////////////////////////
                              CONSTANTS
  //////////////////////////////////////////////////////////////*/
  bytes32 public constant CREATOR_ROLE = keccak256('CREATOR_ROLE');

  /*//////////////////////////////////////////////////////////////
                          TYPE DECLARATIONS
  //////////////////////////////////////////////////////////////*/
  struct CollectionInfo {
    address collection;
    address creator;
    string name;
    string symbol;
    bool isFixedSupply;
    uint256 maxSupply;
  }

  /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
  //////////////////////////////////////////////////////////////*/
  // Registry of collections
  CollectionInfo[] private s_collections;

  /*//////////////////////////////////////////////////////////////
                                EVENTS
  //////////////////////////////////////////////////////////////*/
  event CreatorAuthorized(address indexed account);
  event CreatorRevoked(address indexed account);
  event CollectionCreated(address indexed creator, address indexed collection, string name, string symbol);

  /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
  //////////////////////////////////////////////////////////////*/
  /**
   * @notice Initializes the factory with an admin account.
   * @param admin The address to be granted `DEFAULT_ADMIN_ROLE`.
   */
  constructor(address admin) {
    _grantRole(DEFAULT_ADMIN_ROLE, admin);
  }

  /*//////////////////////////////////////////////////////////////
                        EXTERNAL FUNCTIONS
  //////////////////////////////////////////////////////////////*/
  /**
   * @notice Grants the `CREATOR_ROLE` to an account.
   * @dev Only callable by `DEFAULT_ADMIN_ROLE`.
   * @param account The address to authorize as a creator.
   */
  function authorizeCreator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _grantRole(CREATOR_ROLE, account);
    emit CreatorAuthorized(account);
  }

  /**
   * @notice Revokes the `CREATOR_ROLE` from an account.
   * @dev Only callable by `DEFAULT_ADMIN_ROLE`.
   * @param account The address to revoke from creator role.
   */
  function revokeCreator(address account) external onlyRole(DEFAULT_ADMIN_ROLE) {
    _revokeRole(CREATOR_ROLE, account);
    emit CreatorRevoked(account);
  }

  /**
   * @notice Checks whether an account currently holds `CREATOR_ROLE`.
   * @param account The address to check.
   * @return isCreator True if the account has the role.
   */
  function isAuthorizedCreator(address account) external view returns (bool isCreator) {
    return hasRole(CREATOR_ROLE, account);
  }

  /**
   * @notice Creates a new `CustomNFTCollection`.
   * @dev Enforces positive `maxSupply_` when `isFixedSupply_` is true.
   * @param name_ Collection name.
   * @param symbol_ Collection symbol.
   * @param collectionDescription_ Default description used in metadata.
   * @param defaultImageURI_ Default image URI/CID used in metadata.
   * @param isFixedSupply_ Whether the collection has a fixed maximum supply.
   * @param maxSupply_ Maximum supply if fixed; ignored when unlimited.
   * @return collectionAddr The deployed collection contract address.
   */
  function createCollection(
    string memory name_,
    string memory symbol_,
    string memory collectionDescription_,
    string memory defaultImageURI_,
    bool isFixedSupply_,
    uint256 maxSupply_
  ) external nonReentrant onlyRole(CREATOR_ROLE) returns (address collectionAddr) {
    if (isFixedSupply_) {
      require(maxSupply_ > 0, 'Invalid max supply');
    }

    CustomNFTCollection collection = new CustomNFTCollection(
      name_,
      symbol_,
      collectionDescription_,
      defaultImageURI_,
      isFixedSupply_,
      maxSupply_,
      msg.sender,
      msg.sender
    );

    collectionAddr = address(collection);

    s_collections.push(
      CollectionInfo({
        collection: collectionAddr,
        creator: msg.sender,
        name: name_,
        symbol: symbol_,
        isFixedSupply: isFixedSupply_,
        maxSupply: isFixedSupply_ ? maxSupply_ : 0
      })
    );

    emit CollectionCreated(msg.sender, collectionAddr, name_, symbol_);
  }

  /*//////////////////////////////////////////////////////////////
                             VIEW FUNCTIONS
  //////////////////////////////////////////////////////////////*/
  /**
   * @notice Returns the number of collections created by this factory.
   */
  function getCollectionsCount() external view returns (uint256) {
    return s_collections.length;
  }

  /**
   * @notice Returns info for a collection at an index.
   * @param index Index into the internal collections registry.
   * @return info The `CollectionInfo` struct for the given index.
   */
  function getCollectionInfo(uint256 index) external view returns (CollectionInfo memory info) {
    require(index < s_collections.length, 'Index out of bounds');
    return s_collections[index];
  }

  /**
   * @notice Returns all collections created by this factory.
   */
  function getAllCollections() external view returns (CollectionInfo[] memory) {
    return s_collections;
  }
}
