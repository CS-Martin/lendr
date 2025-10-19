// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import { ERC721URIStorage } from '../lib/openzeppelin-contracts/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import { ERC721 } from '../lib/openzeppelin-contracts/contracts/token/ERC721/ERC721.sol';
import { AccessControl } from '../lib/openzeppelin-contracts/contracts/access/AccessControl.sol';
import { ReentrancyGuard } from '../lib/openzeppelin-contracts/contracts/utils/ReentrancyGuard.sol';
import { Strings } from '../lib/openzeppelin-contracts/contracts/utils/Strings.sol';
import { Base64 } from '../lib/openzeppelin-contracts/contracts/utils/Base64.sol';
import { IERC165 } from '../lib/openzeppelin-contracts/contracts/interfaces/IERC165.sol';

import { IERC4907 } from './interfaces/IERC4907.sol';

/**
 * @title CustomNFTCollection
 * @notice ERC721 collection with ERC4907 rentals, whitelist minting, fixed/unlimited supply, and on-chain JSON metadata
 */
contract CustomNFTCollection is ERC721URIStorage, AccessControl, ReentrancyGuard, IERC4907 {
  using Strings for uint256;

  /*//////////////////////////////////////////////////////////////
                               CONSTANTS
  //////////////////////////////////////////////////////////////*/
  // Roles for access control within a collection
  bytes32 public constant COLLECTION_ADMIN_ROLE = keccak256('COLLECTION_ADMIN_ROLE');
  bytes32 public constant MINTER_ROLE = keccak256('MINTER_ROLE');

  /*//////////////////////////////////////////////////////////////
                           IMMUTABLE VARIABLES
  //////////////////////////////////////////////////////////////*/
  bool public immutable i_isFixedSupply; // Supply configuration
  uint256 public immutable i_maxSupply; // 0 when unlimited
  address public immutable i_creator; // Collection creation data for getter

  /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
  //////////////////////////////////////////////////////////////*/
  // Token id counter (sequential ids)
  uint256 private s_nextTokenId;

  // Collection-level metadata
  string public s_collectionDescription;
  string public s_defaultImageURI; // base image CID or default image

  // Rental (ERC4907) state
  struct UserInfo {
    address user;
    uint64 expires;
  }
  mapping(uint256 => UserInfo) private s_users;

  // Optional per-token attributes supplied at mint time (simple key->value map encoded as JSON pairs)
  struct AttributeKV {
    string key;
    string value;
  }

  /*//////////////////////////////////////////////////////////////
                                EVENTS
  //////////////////////////////////////////////////////////////*/
  event Minted(address indexed to, uint256 indexed tokenId, string tokenURI_);

  /*//////////////////////////////////////////////////////////////
                               CONSTRUCTOR
  //////////////////////////////////////////////////////////////*/
  /**
   * @notice Initializes an ERC721 collection with optional fixed supply and default metadata.
   * @param name_ ERC721 name.
   * @param symbol_ ERC721 symbol.
   * @param description_ Default description used when token description is empty.
   * @param defaultImageURI_ Default image used when token image is empty.
   * @param isFixedSupply_ Whether the collection has a capped supply.
   * @param maxSupply_ Maximum supply if capped; ignored when unlimited.
   * @param creator_ Creator address recorded immutably.
   * @param admin_ Admin granted roles on deployment.
   */
  constructor(
    string memory name_,
    string memory symbol_,
    string memory description_,
    string memory defaultImageURI_,
    bool isFixedSupply_,
    uint256 maxSupply_,
    address creator_,
    address admin_
  ) ERC721(name_, symbol_) {
    i_isFixedSupply = isFixedSupply_;
    i_maxSupply = isFixedSupply_ ? maxSupply_ : 0;
    i_creator = creator_;
    s_collectionDescription = description_;
    s_defaultImageURI = defaultImageURI_;

    // Set up roles
    // The factory sets itself as admin when deploying; creator gets admin + minter by default
    _grantRole(DEFAULT_ADMIN_ROLE, admin_);
    _grantRole(COLLECTION_ADMIN_ROLE, admin_);
    _grantRole(MINTER_ROLE, admin_);
    _grantRole(COLLECTION_ADMIN_ROLE, creator_);
    _grantRole(MINTER_ROLE, creator_);

    // start token ids at 1 for clarity
    s_nextTokenId = 1;
  }

  /*//////////////////////////////////////////////////////////////
                                 MINTING
  //////////////////////////////////////////////////////////////*/
  /**
   * @notice Mint a single NFT to `to` with provided metadata inputs.
   * @dev Stores token metadata as a base64-encoded on-chain JSON data URI.
   * @param to Recipient of the minted token.
   * @param name_ Token name/title.
   * @param description_ Token description override (falls back to collection when empty).
   * @param imageURI_ Image URI/CID for this token (falls back to collection when empty).
   * @param attributes Arbitrary key/value attributes encoded into metadata.
   * @return tokenId The newly minted token id.
   */
  function mint(
    address to,
    string memory name_,
    string memory description_,
    string memory imageURI_,
    AttributeKV[] memory attributes
  ) external nonReentrant onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
    if (i_isFixedSupply && totalMinted() >= i_maxSupply) {
      revert('Max supply reached');
    }

    tokenId = s_nextTokenId;
    s_nextTokenId = tokenId + 1;

    _safeMint(to, tokenId);

    // Assemble metadata JSON and store as data URI
    string memory json = _buildTokenJSON(tokenId, name_, description_, imageURI_, attributes);
    string memory tokenURI_ = string.concat('data:application/json;base64,', Base64.encode(bytes(json)));
    _setTokenURI(tokenId, tokenURI_);

    emit Minted(to, tokenId, tokenURI_);
  }

  /**
   * @notice Mint multiple NFTs to a single recipient, all sharing identical attributes and metadata inputs.
   * @dev Performs a single supply check up-front. Emits `Minted` for each token.
   * @param to Recipient of all minted tokens.
   * @param quantity Number of tokens to mint.
   * @param name_ Token name/title (applied to each).
   * @param description_ Token description override (applied to each).
   * @param imageURI_ Image URI/CID (applied to each).
   * @param attributes Key/value attributes shared by all tokens.
   * @return tokenIds The ids of the newly minted tokens.
   */
  function mintBatchSameAttributes(
    address to,
    uint256 quantity,
    string memory name_,
    string memory description_,
    string memory imageURI_,
    AttributeKV[] memory attributes
  ) external nonReentrant onlyRole(MINTER_ROLE) returns (uint256[] memory tokenIds) {
    require(quantity > 0, 'Quantity must be > 0');

    // Supply check (Checks)
    if (i_isFixedSupply) {
      uint256 current = totalMinted();
      require(current + quantity <= i_maxSupply, 'Max supply would be exceeded');
    }

    // Effects: reserve ids
    uint256 startId = s_nextTokenId;
    s_nextTokenId = startId + quantity;

    tokenIds = new uint256[](quantity);

    // Interactions: mint loop and set tokenURIs
    for (uint256 i = 0; i < quantity; i++) {
      uint256 tokenId = startId + i;
      _safeMint(to, tokenId);

      string memory json = _buildTokenJSON(tokenId, name_, description_, imageURI_, attributes);
      string memory tokenURI_ = string.concat('data:application/json;base64,', Base64.encode(bytes(json)));
      _setTokenURI(tokenId, tokenURI_);

      emit Minted(to, tokenId, tokenURI_);
      tokenIds[i] = tokenId;
    }
  }

  /**
   * @notice Mint one NFT per recipient, all sharing identical attributes and metadata inputs.
   * @dev Performs a single supply check up-front. Emits `Minted` for each token.
   * @param recipients Array of recipients (one token per address).
   * @param name_ Token name/title (applied to each).
   * @param description_ Token description override (applied to each).
   * @param imageURI_ Image URI/CID (applied to each).
   * @param attributes Key/value attributes shared by all tokens.
   * @return tokenIds The ids of the newly minted tokens.
   */
  function mintBatchSameAttributesToMany(
    address[] memory recipients,
    string memory name_,
    string memory description_,
    string memory imageURI_,
    AttributeKV[] memory attributes
  ) external nonReentrant onlyRole(MINTER_ROLE) returns (uint256[] memory tokenIds) {
    uint256 quantity = recipients.length;
    require(quantity > 0, 'No recipients');

    // Supply check (Checks)
    if (i_isFixedSupply) {
      uint256 current = totalMinted();
      require(current + quantity <= i_maxSupply, 'Max supply would be exceeded');
    }

    // Effects: reserve ids
    uint256 startId = s_nextTokenId;
    s_nextTokenId = startId + quantity;

    tokenIds = new uint256[](quantity);

    // Interactions: mint loop and set tokenURIs
    for (uint256 i = 0; i < quantity; i++) {
      address to = recipients[i];
      uint256 tokenId = startId + i;
      _safeMint(to, tokenId);

      string memory json = _buildTokenJSON(tokenId, name_, description_, imageURI_, attributes);
      string memory tokenURI_ = string.concat('data:application/json;base64,', Base64.encode(bytes(json)));
      _setTokenURI(tokenId, tokenURI_);

      emit Minted(to, tokenId, tokenURI_);
      tokenIds[i] = tokenId;
    }
  }

  /*//////////////////////////////////////////////////////////////
                             VIEW FUNCTIONS
  //////////////////////////////////////////////////////////////*/
  /**
   * @notice Returns total minted tokens so far.
   */
  function totalMinted() public view returns (uint256) {
    // With sequential ids starting at 1, total minted is s_nextTokenId - 1
    return s_nextTokenId == 0 ? 0 : s_nextTokenId - 1;
  }

  /*//////////////////////////////////////////////////////////////
                           ERC4907 (RENTALS)
  //////////////////////////////////////////////////////////////*/
  /**
   * @notice Sets the user and expiry for a token per ERC4907.
   * @dev Only callable by collection admins. Requires token to exist.
   * @param tokenId The token to update.
   * @param user The address granted user rights.
   * @param expires Unix timestamp (uint64) when user rights expire.
   */
  function setUser(uint256 tokenId, address user, uint64 expires) external onlyRole(COLLECTION_ADMIN_ROLE) {
    _requireOwned(tokenId);
    s_users[tokenId] = UserInfo({ user: user, expires: expires });
    emit UpdateUser(tokenId, user, expires);
  }

  /**
   * @notice Returns the active user of `tokenId` per ERC4907.
   * @param tokenId Token id to query.
   * @return user The current user address or zero when expired/not set.
   */
  function userOf(uint256 tokenId) external view returns (address user) {
    UserInfo memory info = s_users[tokenId];
    if (uint64(block.timestamp) <= info.expires) {
      return info.user;
    }
    return address(0);
  }

  /**
   * @notice Returns the expiry timestamp for the user of `tokenId`.
   * @param tokenId Token id to query.
   * @return expires Unix timestamp when the user rights expire.
   */
  function userExpires(uint256 tokenId) external view returns (uint64 expires) {
    return s_users[tokenId].expires;
  }

  /*//////////////////////////////////////////////////////////////
                       ADMIN: WHITELIST MANAGEMENT
  //////////////////////////////////////////////////////////////*/
  /**
   * @notice Grants MINTER role to an account.
   * @param account Address to grant.
   */
  function grantMinter(address account) external onlyRole(COLLECTION_ADMIN_ROLE) {
    _grantRole(MINTER_ROLE, account);
  }

  /**
   * @notice Revokes MINTER role from an account.
   * @param account Address to revoke.
   */
  function revokeMinter(address account) external onlyRole(COLLECTION_ADMIN_ROLE) {
    _revokeRole(MINTER_ROLE, account);
  }

  /*//////////////////////////////////////////////////////////////
                           METADATA HELPERS
  //////////////////////////////////////////////////////////////*/
  /**
   * @notice Builds standard ERC721 token metadata JSON string.
   * @dev Falls back to collection-level defaults when inputs are empty.
   */
  function _buildTokenJSON(
    uint256 tokenId,
    string memory name_,
    string memory description_,
    string memory imageURI_,
    AttributeKV[] memory attributes
  ) internal view returns (string memory) {
    // fallback values
    string memory finalName = bytes(name_).length == 0 ? string.concat(symbol(), ' #', tokenId.toString()) : name_;
    string memory finalDesc = bytes(description_).length == 0 ? s_collectionDescription : description_;
    string memory finalImage = bytes(imageURI_).length == 0 ? s_defaultImageURI : imageURI_;

    // attributes array assembly
    string memory attrs = _encodeAttributes(attributes);

    // Standard ERC721 metadata JSON
    return
      string.concat(
        '{',
        '"name":"',
        finalName,
        '",',
        '"description":"',
        finalDesc,
        '",',
        '"image":"',
        finalImage,
        '",',
        '"tokenId":"',
        tokenId.toString(),
        '",',
        '"attributes":',
        attrs,
        '}'
      );
  }

  /**
   * @notice Encodes key/value attributes array into JSON array string.
   */
  function _encodeAttributes(AttributeKV[] memory attributes) internal pure returns (string memory) {
    if (attributes.length == 0) {
      return '[]';
    }
    bytes memory out;
    out = abi.encodePacked('[');
    for (uint256 i = 0; i < attributes.length; i++) {
      AttributeKV memory kv = attributes[i];
      // each attribute as {"trait_type":"key","value":"value"}
      out = abi.encodePacked(
        out,
        '{',
        '"trait_type":"',
        _escapeJSON(kv.key),
        '",',
        '"value":"',
        _escapeJSON(kv.value),
        '"',
        '}'
      );
      if (i + 1 < attributes.length) {
        out = abi.encodePacked(out, ',');
      }
    }
    out = abi.encodePacked(out, ']');
    return string(out);
  }

  /**
   * @notice Minimal JSON string escaper for quotes and backslashes.
   */
  function _escapeJSON(string memory input) internal pure returns (string memory) {
    bytes memory b = bytes(input);
    bytes memory esc = new bytes(b.length * 2);
    uint256 j;
    for (uint256 i = 0; i < b.length; i++) {
      bytes1 c = b[i];
      if (c == '"' || c == '\\') {
        esc[j++] = '\\';
        esc[j++] = c;
      } else {
        esc[j++] = c;
      }
    }
    bytes memory out = new bytes(j);
    for (uint256 k = 0; k < j; k++) out[k] = esc[k];
    return string(out);
  }

  /*//////////////////////////////////////////////////////////////
                                 ERC165
  //////////////////////////////////////////////////////////////*/
  /**
   * @inheritdoc ERC721URIStorage
   */
  function supportsInterface(
    bytes4 interfaceId
  ) public view override(ERC721URIStorage, AccessControl, IERC165) returns (bool) {
    return interfaceId == type(IERC4907).interfaceId || super.supportsInterface(interfaceId);
  }
}
