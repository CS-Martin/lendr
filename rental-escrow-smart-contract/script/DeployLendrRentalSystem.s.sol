// SPDX-License-Identifier: MIT

pragma solidity ^0.8.18;

import {Script} from "forge-std/Script.sol";
import {LendrRentalSystem} from "../src/LendrRentalSystem.sol";
import {DelegationRegistry} from "../src/DelegationRegistry.sol";
import {CollateralAgreementFactory} from "../src/CollateralAgreementFactory.sol";
import {console} from "forge-std/console.sol";

contract DeployLendrRentalSystem is Script {
    function run()
        external
        returns (
            LendrRentalSystem,
            DelegationRegistry,
            CollateralAgreementFactory
        )
    {
        vm.startBroadcast();
        LendrRentalSystem lendrRentalSystem = new LendrRentalSystem(500);
        vm.stopBroadcast();

        DelegationRegistry delegationRegistry = lendrRentalSystem.i_delegationRegistry();
        CollateralAgreementFactory collateralAgreementFactory = lendrRentalSystem.i_collateralAgreementFactory();

        console.log("LendrRentalSystem deployed at:", address(lendrRentalSystem));
        console.log("DelegationRegistry deployed at:", address(delegationRegistry));
        console.log("CollateralAgreementFactory deployed at:", address(collateralAgreementFactory));

        return (
            lendrRentalSystem,
            delegationRegistry,
            collateralAgreementFactory
        );
    }
}
