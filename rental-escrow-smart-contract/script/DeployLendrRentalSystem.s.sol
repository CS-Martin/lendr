// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {LendrRentalSystem} from "../src/LendrRentalSystem.sol";
import {DelegationRegistry} from "../src/DelegationRegistry.sol";
import {CollateralRegistry} from "../src/CollateralRegistry.sol";
import {console} from "forge-std/console.sol";

contract DeployLendrRentalSystem is Script {
    function run()
        external
        returns (
            LendrRentalSystem,
            DelegationRegistry,
            CollateralRegistry
        )
    {
        vm.startBroadcast();
        LendrRentalSystem lendrRentalSystem = new LendrRentalSystem(500);
        vm.stopBroadcast();

        DelegationRegistry delegationRegistry = lendrRentalSystem.i_delegationRegistry();
        CollateralRegistry collateralRegistry = lendrRentalSystem.i_collateralRegistry();

        console.log("LendrRentalSystem deployed at:", address(lendrRentalSystem));
        console.log("DelegationRegistry deployed at:", address(delegationRegistry));
        console.log("CollateralRegistry deployed at:", address(collateralRegistry));

        return (
            lendrRentalSystem,
            delegationRegistry,
            collateralRegistry
        );
    }
}
