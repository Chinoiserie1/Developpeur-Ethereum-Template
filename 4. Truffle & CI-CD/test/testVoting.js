const Voting = artifacts.require('Voting');
require('chai').use(require('chai-as-promised')).should();

contract('Voting', ([owner, user1, user2, user3]) => {
    let voting;
    beforeEach(async () => {
        voting = await Voting.new();
    })
    describe('Check Status', () => {
        it('check Status when changeStatus', async () => {
            let status = await voting.currentStatus();
            status.toString().should.equal('0');
            await voting.changeStatus(1, { from: owner });
            status = await voting.currentStatus();
            status.toString().should.equal('1');
            await voting.changeStatus(2, { from: owner });
            status = await voting.currentStatus();
            status.toString().should.equal('2');
            await voting.changeStatus(3, { from: owner });
            status = await voting.currentStatus();
            status.toString().should.equal('3');
            await voting.changeStatus(4, { from: owner });
            status = await voting.currentStatus();
            status.toString().should.equal('4');
            await voting.changeStatus(5, { from: owner });
            status = await voting.currentStatus();
            status.toString().should.equal('5');
        })
        it('check event WorkflowStatusChange', async () => {
            let status = await voting.changeStatus(1, { from: owner });
            let res = status.logs[0];
            res.event.should.equal('WorkflowStatusChange');
            res = res.args;
            res.previousStatus.toString().should.equal('0');
            res.newStatus.toString().should.equal('1');
        })
        it('failed when someone else call changeStatus', async () => {
            await voting.changeStatus(1, { from: user1 }).should.be.rejectedWith('Ownable: caller is not the owner');
        })
    })
    describe('failure', () => {
        describe('fail when status not correct', () => {
            it('call addWhitelistVoters when status not correct', async () => {
                await voting.changeStatus(1, { from: owner });
                await voting.addWhitelistVoters(user1, { from: owner }).should.be.rejectedWith('Invalid Status');
            })
            it('call addProposal when status not correct', async () => {
                await voting.addProposal('proposal', { from: user1 }).should.be.rejectedWith('Invalid Status');
            })
            it('call addVote when status not correct', async () => {
                await voting.addVote(0, { from: user1 }).should.be.rejectedWith('Invalid Status');
            })
            it('call searchWinner when status not correct', async () => {
                await voting.searchWinner({ from: owner }).should.be.rejectedWith('Invalid Status');
            })
            it('call getWinner when status not correct', async () => {
                await voting.getWinner({ from: owner }).should.be.rejectedWith('Invalid Status');
            })
        })
        describe('fail when its not the owner', () => {
            it('call addWhitelistVoters from user1', async () => {
                await voting.addWhitelistVoters(user1, { from: user1 }).should.be.rejectedWith('Ownable: caller is not the owner');
            })
            it('call searchWinner from user1', async () => {
                await voting.searchWinner({ from: user1 }).should.be.rejectedWith('Ownable: caller is not the owner');
            })
        })
    })
    describe('first step', () => {
        let result;
        beforeEach(async () => {
            result = await voting.addWhitelistVoters(user1, { from: owner });
        })
        it('success', () => {
            result.receipt.status.should.equal(true);
        })
        it('check event VoterRegistered', async () => {
            result = result.logs[0];
            result.event.should.equal('VoterRegistered');
            result = result.args;
            result.voterAddress.should.equal(user1);
        })
        it('fail when add user1 2 times', async () => {
            await voting.addWhitelistVoters(user1, { from: owner }).should.be.rejectedWith('Already whitelisted');
        })
    })
    describe('seconde step', () => {
        let result;
        beforeEach(async () => {
            await voting.addWhitelistVoters(user1, { from: owner });
            await voting.changeStatus(1, { from: owner });
            result = await voting.addProposal('Proposal', { from: user1 });
        })
        it('success', async () => {
            let res = await voting.proposal(0);
            res.description.should.equal('Proposal');
            res.voteCount.toString().should.equal('0');
        })
        it('check event ProposalRegistered', async () => {
            result = result.logs[0];
            result.event.should.equal('ProposalRegistered');
            result = result.args;
            result.proposalId.toString().should.equal('0');
        })
        it('fail when not whitelist', async () => {
            result = await voting.addProposal('Proposal', { from: user2 }).should.be.rejectedWith('U are not whitelisted');
        })
    })
    describe('third step', () => {
        let result;
        beforeEach(async () => {
            await voting.addWhitelistVoters(user1, { from: owner });
            await voting.addWhitelistVoters(user2, { from: owner });
            await voting.changeStatus(1, { from: owner });
            await voting.addProposal('Proposal', { from: user1 });
            await voting.changeStatus(3, { from: owner });
            result = await voting.addVote(0, { from: user2 });
        })
        it('success', async () => {
            let res = await voting.proposal(0);
            res.voteCount.toString().should.equal('1');
        })
        it('check event ', async () => {
            result = result.logs[0];
            result.event.should.equal('Voted');
            result = result.args;
            result.voter.should.equal(user2);
            result.proposalId.toString().should.equal('0');
        })
        describe('failure', () => {
            it('fail when vote 2 times', async () => {
                await voting.addVote(0, { from: user2 }).should.be.rejectedWith('U already submit a vote');
            })
            it('fail when not whitlist', async () => {
                await voting.addVote(0, { from: user3 }).should.be.rejectedWith('U are not whitelisted');
            })
            it('fail when id not exist', async () => {
                await voting.addVote(2, { from: user1}).should.be.rejectedWith('VM Exception while processing transaction: revert');
            })
        })
    })
    describe('final step', () => {
        let result;
        beforeEach(async () => {
            await voting.addWhitelistVoters(user1, { from: owner });
            await voting.addWhitelistVoters(user2, { from: owner });
            await voting.changeStatus(1, { from: owner });
            await voting.addProposal('Proposal', { from: user1 });
            await voting.addProposal('Proposal2', { from: user2 });
            await voting.changeStatus(3, { from: owner });
            await voting.addVote(1, { from: user2 });
            await voting.changeStatus(4, { from: owner });
            await voting.searchWinner({ from: owner });
        })
        it('sucess', async () => {
            result = await voting.winningProposalId();
            result.toString().should.equal('1');
        })
        it('call getWinner', async () => {
            await voting.changeStatus(5, { from: owner });
            result = await voting.getWinner();
            result.toString().should.equal('1');
        })
    })
})