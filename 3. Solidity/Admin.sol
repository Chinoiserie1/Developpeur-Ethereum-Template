// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.10;

import "../../openzeppelin-contracts/contracts/access/Ownable.sol";

contract Admin is Ownable {
    mapping(address => bool) _whitelist;
    mapping(address => bool) _blacklist;
    event Whitelisted(address _address);
    event Blacklisted(address _address);

    function whitelisted(address _address) public onlyOwner() {
        require(!_whitelist[_address], "already whitlisted");
        require(!_blacklist[_address], "already blacklisted");
        _whitelist[_address] = true;
        emit Whitelisted(_address);
    }
    function blacklisted(address _address) public onlyOwner() {
        require(!_whitelist[_address], "already whitlisted");
        require(!_blacklist[_address], "already blacklisted");
        _blacklist[_address] = true;
        emit Blacklisted(_address);
    }
    function isBlacklisted(address _address) public view returns(bool) {
        return _blacklist[_address];
    }
    function isWhitelisted(address _address) public view returns(bool) {
        return _whitelist[_address];
    }
}