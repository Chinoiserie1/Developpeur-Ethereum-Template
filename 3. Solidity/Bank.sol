// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.10;

contract Bank {
    mapping(address => uint256) private _ballances;

    function deposit(uint256 _amount) public payable {
        require(msg.value >= _amount);
        if (msg.value > 0) {
            _ballances[msg.sender] += _amount;
        }
    }
    function transfer(address _recipiant, uint256 _ammount) public {
        require(_ballances[msg.sender] >= _ammount);
        _ballances[_recipiant] += _ammount;
        _ballances[msg.sender] -= _ammount; 
    }
    function balanceOf(address _address) public view returns(uint256) {
        return(_ballances[_address]);
    }
}
// correction 
// contract Bank {
//    mapping (address => uint) private _balances;
 
//    function deposit(uint _amount) public{
//        require(msg.sender != address(0), "You cannot deposit for the address zero");
//        _balances[msg.sender] += _amount;
//    }
//    function transfer(address _recipient, uint _amount) public{
//        require(_recipient != address(0), "You cannot transfer to the address zero");
//        require(_balances[msg.sender] >= _amount, "You have not enough balance");
//        _balances[_recipient] += _amount;
//        _balances[msg.sender] -= _amount;
//    }
//    function balanceOf(address _address) public view returns (uint){
//        return _balances[_address];
//    }
// }