// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IERC165 } from '../../lib/openzeppelin-contracts/contracts/utils/introspection/IERC165.sol';

/**
 * @title IERC4907
 * @dev Interface for ERC-4907: Rental extension for ERC-721
 * See: https://eips.ethereum.org/EIPS/eip-4907
 */
interface IERC4907 is IERC165 {
  /**
   * @dev Emitted when the `user` of an NFT or the `expires` timestamp changes
   */
  event UpdateUser(uint256 indexed tokenId, address indexed user, uint64 expires);

  /**
   * @notice Set the user and expires of an NFT. The zero address unsets the user.
   * @param tokenId The NFT to set the user for
   * @param user The new user of the NFT
   * @param expires The UNIX timestamp when the user expiration takes effect
   */
  function setUser(uint256 tokenId, address user, uint64 expires) external;

  /**
   * @notice Get the user address of an NFT
   * @param tokenId The NFT to query
   * @return The current user address (zero address if none or expired)
   */
  function userOf(uint256 tokenId) external view returns (address);

  /**
   * @notice Get the user expiration timestamp of an NFT
   * @param tokenId The NFT to query
   * @return The UNIX timestamp when the user expires
   */
  function userExpires(uint256 tokenId) external view returns (uint64);
}
