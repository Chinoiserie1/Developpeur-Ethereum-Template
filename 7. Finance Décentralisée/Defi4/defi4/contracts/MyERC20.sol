// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../client/node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";

contract MyERC20 {
  using SafeMath for uint;

  string public name = "reward token";
  string public symbol = "RT";
  uint256 public decimals = 18;
  uint256 public totalSupply;
  address public authorizedContract;
  address public owner;

  mapping(address => uint256) public balanceOf;
  mapping(address => mapping(address => uint256)) public allowance;

  event Transfer(address indexed _from, address indexed _to, uint256 _value);
  event Approval(address indexed _owner, address indexed _spender, uint256 _value);

  constructor() {
    owner = msg.sender;
    totalSupply = 0;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "U are not the owner");
    _;
  }

  //primary function ERC20
  function transfer(address _to, uint256 _value) public returns (bool success) {
    _transfer(msg.sender, _to, _value);
    return true;
  }
  function _transfer(address _from, address _to, uint256 _value) internal {
    require(_to != address(0));
    require(balanceOf[_from] >= _value, "not enougth token to send");
    balanceOf[_from] = balanceOf[_from].sub(_value);
    balanceOf[_to] = balanceOf[_to].add(_value);
    emit Transfer(_from, _to, _value);
  }
  function approve(address _spender, uint256 _value) public returns (bool success) {
    require(_spender != address(0), "can not be address 0");
    allowance[msg.sender][_spender] = _value;
    emit Approval(msg.sender, _spender, _value);
    return true;
  }
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
    require(allowance[_from][msg.sender] >= _value, "not allowed or value too higth");
    _transfer(_from, _to, _value);
    allowance[_from][msg.sender] = allowance[_from][msg.sender].sub(_value);
    emit Approval(_from, msg.sender, allowance[_from][msg.sender]);
    return true;
  }
  // function for stacking
  function _mintReward(address _account, uint256 _amount) internal returns (bool succes) {
    require(_account != address(0) && _amount > 0, "address 0 or amount insifucient");
    totalSupply = totalSupply.add(_amount);
    balanceOf[_account] = balanceOf[_account].add(_amount);
    emit Transfer(address(0), _account, _amount);
    return true;
  }
  function sendReward(address _to, uint256 _amount) external returns (bool succes) {
    require(_to != address(0) && _amount > 0, "address 0 or amount insifucient");
    require(msg.sender == authorizedContract, "Contract not authorized");
    _mintReward(_to, _amount);
    return true;
  }
  //Only Owner
  function setAutorizedContract(address _contract) public onlyOwner() {
    authorizedContract = _contract;
  }
  function setOwner(address _newOwner) external onlyOwner() {
    owner = _newOwner;
  }
}