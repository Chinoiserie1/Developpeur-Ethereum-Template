// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../client/node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Voting is Ownable {
    uint256 public winningProposalId = 0;
    uint256 public id = 0;

    mapping(address => Voter) public _voter;

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

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    modifier inStatus(WorkflowStatus _status) {
        require(Status == _status, "Invalid Status");
        _;
    }
    function changeStatus(WorkflowStatus _newStatus) public onlyOwner() {
        emit WorkflowStatusChange(Status, _newStatus);
        Status = _newStatus;
    }

    function addWhitelistVoters(address _address) public onlyOwner() inStatus(WorkflowStatus.RegisteringVoters) {
        require(!_voter[_address].isRegistered, "Already whitelisted");
        _voter[_address].isRegistered = true;
        emit VoterRegistered(_address);
    }

    function addProposal(string memory _description) public inStatus(WorkflowStatus.ProposalsRegistrationStarted) {
        require(_voter[msg.sender].isRegistered == true, "U are not whitelisted");
        proposal.push(Proposal({description: _description, voteCount: 0}));
        emit ProposalRegistered(id);
        id++;
    }

    function addVote(uint256 _proposalId) public inStatus(WorkflowStatus.VotingSessionStarted) {
        require(_voter[msg.sender].isRegistered == true, "U are not whitelisted");
        require(!_voter[msg.sender].hasVoted, "U already submit a vote");
        proposal[_proposalId].voteCount += 1;
        _voter[msg.sender].votedProposalId = _proposalId;
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