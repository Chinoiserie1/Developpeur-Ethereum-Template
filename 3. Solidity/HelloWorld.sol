// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.10;

contract HelloWorld {
    string myString = "Hello World";
    
    function Hello() public view returns(string memory){
        return (myString);
    }
}