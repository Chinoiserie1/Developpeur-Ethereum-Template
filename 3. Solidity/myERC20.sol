// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.10;

interface IERC20 {
    function totalSupply() external view returns(uint256);
    function balanceOf(address _owner) external view returns (uint256 balance);
    function transfer(address _to, uint256 _value) external returns (bool success);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success);
    function approve(address _spender, uint256 _value) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(address indexed _owner, address indexed _spender, uint256 _value);
}

contract myERC20 is IERC20 {
    // limited supply if u want to have unlimited supply just add a mint function
    string private _name;
    string private _symbol;
    uint256 private _totalSupply;

    mapping (address => uint256) private balance_;
    mapping (address => mapping(address => uint256)) private approve_;

    constructor (string memory _name_, string memory _symbol_, uint256 _totalSupply_) {
        _name = _name_;
        _symbol = _symbol_;
        _totalSupply = _totalSupply_;
    }

    function name() internal view returns (string memory) {
        return (_name);
    }
    function totalSupply() external view returns(uint256) {
        return (_totalSupply);
    }
    function balanceOf(address _owner) external view returns (uint256 balance) {
        return balance = balance_[_owner];
    }
    function transfer(address _to, uint256 _value) external returns (bool success) {
        require(balance_[msg.sender] >= _value, "not enougth amount in balance");
        balance_[_to] = balance_[_to] + _value;
        balance_[msg.sender] = balance_[msg.sender] - _value;
        emit Transfer(msg.sender, _to, _value);
        return success;
    }
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool success) {
        require(balance_[_from] >= _value, "not enougth amount in balance");
        require(approve_[_from][_to] <= _value, "not approved from this value");
        balance_[_from] -= _value;
        balance_[_to] += _value;
        approve_[_from][_to] -= _value;
        emit Transfer(_from, _to, _value);
        emit Approval(_from, _to, approve_[_from][_to]);
        return success;
    }
    function approve(address _spender, uint256 _value) external returns (bool success) {
        approve_[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return success;
    }
    function allowance(address _owner, address _spender) external view returns (uint256 remaining) {
        return (approve_[_owner][_spender]);
    }
}