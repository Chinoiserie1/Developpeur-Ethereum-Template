// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.10;

contract Random {
    uint256 private nonce = 0;

    function random() public returns(uint){
        nonce++;
        return uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, nonce)));
    }
}