// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "../client/node_modules/@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../client/node_modules/@openzeppelin/contracts/utils/math/SafeMath.sol";
import "./MyERC20.sol";
import "../client/node_modules/@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Stacking {
  using SafeMath for uint;
  address public owner;
  uint256 public interestPeriod = 1 days;
  uint256 public interest = 10; //10% par ans
  bool reantrancy = false;
  MyERC20 myToken;

  struct Stake {
    ERC20 token;
    uint256 depositAmount;
    uint256 timeStake; // when stake begin
    bool refund;
  }
  // pour securiser le smart contract
  struct Pair {
    string name;
    address addrERC;
    address pair;
    uint decimal;
  }
  Pair[] public pair;

  mapping(address => Stake[]) public stake;

  event NewStake(address _erc20, address _from, uint256 _amount);
  event Unstake(address _erc20, address _from, uint256 _amount);
  event ClaimReward(address _erc20, address _from, uint256 _reward);

  constructor() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    require(msg.sender == owner, "U are not the owner");
    _;
  }
  modifier reantrancyGuard() {
    require(reantrancy == false, "reantrancy");
    reantrancy = true;
    _;
    reantrancy = false;
  }
  //Only Owner
  function setOwner(address _new) external onlyOwner() {
    owner = _new;
  }
  function setMyToken(address _contract) external onlyOwner() {
    myToken = MyERC20(_contract);
  }
  function setPair(string memory _name, address _erc, address _pair, uint256 _decimal) external onlyOwner() {
    Pair memory _Pair;
    _Pair.name = _name;
    _Pair.addrERC = _erc;
    _Pair.pair = _pair;
    _Pair.decimal = _decimal;
    pair.push(_Pair);
  }
  function changePair(string memory _name, address _erc20, address _pair, uint256 _decimal) external onlyOwner() {
    for (uint i = 0; i < pair.length; i++) {
      if (pair[i].addrERC == _erc20) {
        pair[i].name = _name;
        pair[i].addrERC = _erc20;
        pair[i].pair = _pair;
        pair[i].decimal = _decimal;
      }
    }
  }
  //User
  // need to approve this contract first before transfer token
  function newStake(address _erc20, uint256 _amount) internal returns(bool success) {
    Stake memory _stake;
    address _pair = getPair(_erc20);
    require(_pair != address(0), "Can't stake this token");
    require(_amount > 0);
    _stake.token = ERC20(_erc20);
    _stake.depositAmount = _amount;
    _stake.timeStake = block.timestamp - 364 days;
    stake[msg.sender].push(_stake);
    require(_stake.token.transferFrom(msg.sender, address(this), _amount), "Revert: can't transfer funds");
    emit NewStake(_erc20, msg.sender, _amount);
    return true;
  }
  function getIfStake(address _erc20, address _user) public view returns(bool succ, uint256 res) {
    bool success;
    uint256 tokenId = 0;
    for(uint i = 0; i < stake[_user].length; i++) {
      if(stake[_user][i].token == ERC20(_erc20)) {
        success = true;
        tokenId = i;
        return (success, tokenId);
      }
    }
    return (false, 0);
  }
  // function for new stake & for add stake
  function stakeErc(address _erc20, uint256 _amount) public reantrancyGuard() {
    (bool success, uint tokenId) = getIfStake(_erc20, msg.sender);
    if (success == false) {
      require(newStake(_erc20, _amount), "failed to stake");
    } 
    else {
      require(addStake(_erc20, _amount, tokenId), "failed to add stake");
    }
  }
  function addStake(address _erc20, uint256 _amount, uint256 _tokenId) internal returns(bool success) {
    Stake memory _stake = stake[msg.sender][_tokenId];
    address _pair = getPair(_erc20);
    require(_pair != address(0), "Can't stake this token");
    require(_amount > 0);
    require(_stake.token == ERC20(_erc20));
    claimReward(_erc20, _tokenId);
    require(_stake.token.transferFrom(msg.sender, address(this), _amount), "Revert: can't transfer funds");
    _stake.depositAmount = _stake.depositAmount.add(_amount);
    _stake.timeStake = block.timestamp - 364 days;
    _stake.refund = false;
    stake[msg.sender][_tokenId] = _stake;
    emit NewStake(_erc20, msg.sender, _amount);
    return true;
  }

  // call getStakeIdToWithdraw to find the id
  function unstake(address _erc20, uint256 _amount, uint256 _tokenId) external reantrancyGuard() {
    Stake memory _stake = stake[msg.sender][_tokenId];
    require(_stake.token == ERC20(_erc20), "Invalid Token");
    require(_amount <= _stake.depositAmount, "Want to withdraw more than deposit");
    require(_amount > 0, "can not withdraw zero");
    require(_stake.token.transfer(msg.sender, _amount), "Failed to stake fund");
    require(_stake.refund == false, "Already refund");
    require(claimReward(_erc20, _tokenId), "Need to stake minimum 1 day");
    if (_amount >= _stake.depositAmount) {
      stake[msg.sender][_tokenId].refund = true;
    }
    stake[msg.sender][_tokenId].depositAmount = stake[msg.sender][_tokenId].depositAmount.sub(_amount);
    stake[msg.sender][_tokenId].timeStake = block.timestamp - 1 days;
    emit Unstake(_erc20, msg.sender, _amount);
  }
  //call this function before unstake
  function getStakeIdToWithdraw(address _erc20) external view returns (uint256 tokenId) {
    for (uint256 i = 0; i < stake[msg.sender].length; i++) {
      if (stake[msg.sender][i].token == ERC20(_erc20) && stake[msg.sender][i].refund == false) {
        return i;
      }
    }
  }
  // problem transaction fail
  function claimReward(address _erc20, uint256 _tokenId) internal returns(bool success) {
    Stake memory _stake = stake[msg.sender][_tokenId];
    address _pair = getPair(_erc20);
    require(_pair != address(0), "This token can't have reward");
    require(_stake.token == ERC20(_erc20), "Invalid Token");
    uint256 reward = calculReward(_tokenId, getPair(_erc20), getDecimal(_erc20));
    if(reward > 0) {
      require(myToken.sendReward(msg.sender, reward), "failed to claim reward");
      stake[msg.sender][_tokenId].timeStake = block.timestamp;
      emit ClaimReward(_erc20, msg.sender, reward);
      return true;
    }
    return false;
  }
  function calculReward(uint256 _tokenId, address _pair, uint256 _decimals) public view returns (uint256 reward) {
    uint256 resTime = block.timestamp.sub(stake[msg.sender][_tokenId].timeStake);
    uint256 period = resTime.div(interestPeriod);
    uint256 pairr = getPrice(_pair).div(10 ** _decimals);
    uint256 amount = stake[msg.sender][_tokenId].depositAmount.mul(pairr);
    uint256 res = amount.mul(interest).div(100).mul(period).div(364);
    return res;
  }
  // get price with chainlink oracle use doc to scop the pair address 
  // => https://docs.chain.link/docs/ethereum-addresses/
  function getPrice(address _pair) public view returns (uint res) {
    AggregatorV3Interface priceFeed;
    priceFeed = AggregatorV3Interface(_pair);
    ( , int price, , , ) = priceFeed.latestRoundData();
    return uint(price);
  }
  function getAmountStaked(address _user, uint256 _tokenId) public view returns (uint256 amount) {
    return stake[_user][_tokenId].depositAmount;
  }
  function getActiveStake(address _user) public view returns (Stake[] memory res) {
    uint256 nbActiveStake = 0;
    for (uint i = 0; i < stake[_user].length; i++) {
      if(stake[_user][i].refund == false)
        nbActiveStake++;
    }
    Stake[] memory _activeStake = new Stake[](nbActiveStake);
    uint256 counter = 0;
    for (uint i = 0; i < stake[_user].length; i++) {
      if(stake[_user][i].refund == false) {
        _activeStake[counter] = stake[_user][i];
        counter++;
      }
    }
    return _activeStake;
  }
  function getAllPair() public view returns(Pair[] memory) {
    return (pair);
  }
  function getPair(address _erc20) public view returns(address addr) {
    for (uint i = 0; i < pair.length; i++) {
      if (pair[i].addrERC == _erc20) {
        return pair[i].pair;
      }
    }
    return address(0);
  }
  function getDecimal(address _erc20) public view returns(uint decimal) {
    for (uint i = 0; i < pair.length; i++) {
      if (pair[i].addrERC == _erc20) {
        return pair[i].decimal;
      }
    }
  }
}