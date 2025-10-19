// SPDX-License-Identifier: MIT

pragma solidity 0.8.20;

import { Script } from '../lib/forge-std/src/Script.sol';
import { CustomNFT } from '../src/CustomNFT.sol';
import { console } from '../lib/forge-std/src/console.sol';

contract DeployCustomNFT is Script {
  function run() external returns (CustomNFT) {
    vm.startBroadcast();
    CustomNFT customNFT = new CustomNFT(msg.sender);
    vm.stopBroadcast();

    console.log('CustomNFT deployed at:', address(customNFT));

    return (customNFT);
  }
}
