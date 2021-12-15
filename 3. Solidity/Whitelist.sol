// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

contract Whitelist {
    mapping(address=>bool) whitelist;

    struct Person {
        string name;
        uint256 age;
    }

    event Authorized(address _address);

    Person[] public poeple;

    function authorize(address _address) public {
        whitelist[_address] = true;
        emit Authorized(_address);
    }

    function addPerson(string memory _name, uint256 _age) public pure {
        //Person memory person = Person(_name, _age);
        Person memory person;
        person.name = _name;
        person.age = _age;
    }

    function add(string memory _name, uint256 _age) public {
        Person memory person;
        person.name = _name;
        person.age = _age;
        poeple.push(person);
    }

    function remove() public {
        poeple.pop();
    }
}