// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.10;

//clone the repository of openzepplin and change the path 
import "../../openzeppelin-contracts/contracts/token/ERC20/ERC20.sol";

contract ERC20Token is ERC20 {
    constructor(uint256 initialSupply) ERC20("ALYRA", "ALY") {
        _mint(msg.sender, initialSupply);
    }
}