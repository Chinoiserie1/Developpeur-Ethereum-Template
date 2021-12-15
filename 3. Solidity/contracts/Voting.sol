// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../../../openzeppelin-contracts/contracts/access/Ownable.sol";

contract Voting is Ownable {
    uint256 public winningProposalId = 0;
    uint256 private id = 0;

    mapping(address => Voter) private _voter;

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }
    struct Proposal {
        string description;
        uint voteCount;
    }
    Proposal[] public proposal;

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }
    WorkflowStatus public Status;
    modifier inStatus(WorkflowStatus _status) {
        require(Status == _status, "Invalid Status");
        _;
    }
    function changeStatus(WorkflowStatus _newStatus) public onlyOwner() {
        emit WorkflowStatusChange(Status, _newStatus);
        Status = _newStatus;
    }
    function currentStatus() public view returns(WorkflowStatus) {
        return Status;
    }

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);   

    function getWhitelistVoters(address _address) public onlyOwner() inStatus(WorkflowStatus.RegisteringVoters) {
        require(!_voter[_address].isRegistered, "Already whitelisted");
        _voter[_address].isRegistered = true;
        id++;
        _voter[_address].votedProposalId = id;
        emit VoterRegistered(_address);
    }

    function addProposal(string memory _description) public inStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        require(_voter[msg.sender].isRegistered == true, "U are not whitelisted");
        uint256 _id = _voter[msg.sender].votedProposalId;
        proposal[id].description = _description;
        emit  ProposalRegistered(_id);
    }

    function addVote(uint256 _proposalId) public inStatus(WorkflowStatus.VotingSessionStarted) {
        require(_voter[msg.sender].isRegistered == true, "U are not whitelisted");
        require(!_voter[msg.sender].hasVoted, "U already submit a vote");
        proposal[_proposalId].voteCount += 1;
        _voter[msg.sender].hasVoted = true;
        emit Voted(msg.sender, _proposalId);
    }

    function searchWinner() public onlyOwner() inStatus(WorkflowStatus.VotingSessionEnded) {
        uint256 _id;
        uint256 _vote = 0;
        
        for (uint256 i; i < proposal.length; i++) {
            if (proposal[i].voteCount > _vote) {
                _id = i;
                _vote = proposal[i].voteCount;
            }
        }
        winningProposalId = _id;
    }

    function getWinner() public view inStatus(WorkflowStatus.VotesTallied) returns(uint) {
        return winningProposalId;
    }
}