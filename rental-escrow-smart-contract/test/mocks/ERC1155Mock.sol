// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract ERC1155Mock is ERC1155 {
    constructor(string memory uri) ERC1155(uri) {}

    function mint(address to, uint256 id, uint256 amount, bytes memory data) public {
        _mint(to, id, amount, data);
    }
} 