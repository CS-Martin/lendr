// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {LendrRentalSystem} from "../src/LendrRentalSystem.sol";
import {console} from "forge-std/console.sol";

contract DeployLendrRentalSystem is Script {
    function run() external {
        vm.startBroadcast();
        LendrRentalSystem lendrRentalSystem = new LendrRentalSystem(500);
        vm.stopBroadcast();

        console.log("Contract deployed at:", address(lendrRentalSystem));
    }
}
