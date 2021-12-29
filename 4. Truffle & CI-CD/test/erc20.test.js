// erc20.test.js 
const { BN, ether } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');
const ERC20 = artifacts.require('ERC20Token');

require('chai').should();

contract('ERC20', function (accounts) {
    const _name = 'ALYRA';
    const _symbol = 'ALY';
    const _initialsupply = new BN(1000);
    const _decimals = new BN(18);
    const owner = accounts[0];
    const recipient = accounts[1];
    const spender = accounts[2];
    let ERC20Instance;

    beforeEach(async function () {
        ERC20Instance = await ERC20.new(_initialsupply,{from: owner});
    });
    it('a un nom', async function () {
        expect(await ERC20Instance.name()).to.equal(_name);
    });
    it('a un symbole', async function () {
        expect(await ERC20Instance.symbol()).to.equal(_symbol);
    });
    it('a une valeur décimal', async function () {
        expect(await ERC20Instance.decimals()).to.be.bignumber.equal(_decimals);
    });
    it('vérifie la balance du propriétaire du contrat', async function (){
        let balanceOwner = await ERC20Instance.balanceOf(owner);
        let totalSupply = await ERC20Instance.totalSupply();
        expect(balanceOwner).to.be.bignumber.equal(totalSupply);
    });
    it('vérifie si un transfer est bien effectué', async function (){
        let balanceOwnerBeforeTransfer = await ERC20Instance.balanceOf(owner);
        let balanceRecipientBeforeTransfer = await ERC20Instance.balanceOf(recipient);
        let amount = new BN(10);
    
        await ERC20Instance.transfer(recipient, amount, {from: owner});
        let balanceOwnerAfterTransfer = await ERC20Instance.balanceOf(owner);
        let balanceRecipientAfterTransfer = await ERC20Instance.balanceOf(recipient);
    
        expect(balanceOwnerAfterTransfer).to.be.bignumber.equal(balanceOwnerBeforeTransfer.sub(amount));
        expect(balanceRecipientAfterTransfer).to.be.bignumber.equal(balanceRecipientBeforeTransfer.add(amount));
    });
    describe('verifie si approve est bien effectuer', () => {
        it('success', async () => {
            const amount = new BN(10);
            let allowanceBeforeApprove = await ERC20Instance.allowance(owner, recipient);
            allowanceBeforeApprove.toString().should.equal('0');
            const approve = await ERC20Instance.approve(recipient, amount, { from: owner });
            const allowanceAfterApprove = await ERC20Instance.allowance(owner, recipient);
            allowanceAfterApprove.toString().should.equal(amount.toString());
        })
        it('check Approve event', async () => {
            const amount = new BN(10);
            let allowanceBeforeApprove = await ERC20Instance.allowance(owner, recipient);
            allowanceBeforeApprove.toString().should.equal('0');
            const approve = await ERC20Instance.approve(recipient, amount, { from: owner });
            const event = approve.logs[0];
            event.event.should.equal('Approval', 'check Event name');
            const res = event.args;
            res.owner.should.equal(owner, 'check owner address');
            res.spender.should.equal(recipient, 'check spender address');
            res.value.toString().should.equal(amount.toString());
        })
    })
    describe('verifie si transferFrom est bien effectuer', () => {
        let result;
        let amount;
        let amountBeforeTransfer;
        beforeEach(async () => {
            amount = new BN(10);
            amountBeforeTransfer = await ERC20Instance.balanceOf(owner);
            result = await ERC20Instance.approve(spender, amount, { from: owner });
            result = await ERC20Instance.transferFrom(owner, recipient, amount, { from: spender });
        })
        it('success', async () => {
            let amountAfterTransfer = await ERC20Instance.balanceOf(recipient);
            amountAfterTransfer.toString().should.equal(amount.toString());
            amountAfterTransfer = await ERC20Instance.balanceOf(owner);
            amountAfterTransfer.toString().should.equal((amountBeforeTransfer.sub(amount)).toString());
        })
    })
});
