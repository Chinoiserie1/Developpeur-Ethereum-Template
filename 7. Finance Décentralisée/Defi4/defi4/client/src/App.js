import React, { Component } from "react";
// import { useState } from "react";
import MyERC20 from "./contracts/MyERC20";
// import ERC20 from "./contracts/ERC20";
import Stacking from './contracts/Stacking';
import getWeb3 from "./getWeb3";
// import { Card, Button, Form, Navbar, Nav, Container, CardGroup, Spinner } from "react-bootstrap";
import NavBar from "./component/NavBar";
import Stake from "./component/Stake";
import 'bootstrap/dist/css/bootstrap.min.css';

import "./App.css";
import Unstake from "./component/Unstake";

class App extends Component {
  state = { web3: null, networkId: null, accounts: null, contract: null, stacking: null,
    isLoading: false, status: "" };

  ether = (n) => { return n * (10**18) }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      var accounts = await web3.eth.getAccounts();
      window.ethereum.on('accountsChanged', async () => {
        console.log("account changed");
        accounts = await web3.eth.getAccounts();
      });
      // Get the contract instance.
      var networkId = await web3.eth.net.getId();
      window.ethereum.on('chainChanged', async () => {
        console.log("network changed");
        networkId = await web3.eth.net.getId();
      });
      const deployedNetwork = MyERC20.networks[networkId];
      const instanceMyERC20 = new web3.eth.Contract(
        MyERC20.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const instanceStacking = new web3.eth.Contract(
        Stacking.abi,
        Stacking.networks[networkId] && Stacking.networks[networkId].address,
      )
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, networkId, accounts, contract: instanceMyERC20, stacking: instanceStacking }, this.runStep1);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };
  runStep1 = async () => {
    const { accounts, contract, stacking } = this.state;
    // console.log(accounts[0]);
    // console.log(contract);
    // console.log(stacking);
    // console.log("stacking address contract=" + stacking._address);
    try {
      // var stakeId = await stacking.methods.getStakeIdToWithdraw("0xC2D5806B6e481969FA52FF82Cf7aB3fE2fC06728")
      // .call({from: accounts[0]});
      // console.log(stakeId);
      // stacking.getPastEvents('NewStake', {fromBlock: 0, toBlock: 'latest'})
      // .then(results => console.log(results))
      // .catch(err => err);
      // var res = await stacking.methods.getAmountStaked(accounts[0], stakeId).call({from: accounts[0]});
      // console.log("Amount stacked = " + res);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Check console for details.`,
      );
      console.error(error);
    }
  }
  // addNewStake = async () => {
  //   const { web3, accounts, stacking } = this.state;
  //   const addressToken = this.addressTokenToStake.value;
  //   const contract = new web3.eth.Contract(
  //     ERC20.abi,
  //     addressToken
  //   )
  //   console.log(addressToken);
  //   const amount = this.amountToStake.value;
  //   console.log(amount);
  //   console.log(this.ether(amount));

  //   if (addressToken != '') {
  //     try {
  //       this.setState({isLoading: true});
  //       var result = await contract.methods.approve(stacking._address, this.ether(amount).toString()).send({ from: accounts[0]});
  //       console.log(result);
  //       var res = await stacking.methods.newStake(addressToken, this.ether(amount).toString()).send({from: accounts[0]});
  //       console.log(res);
  //       this.setState({isLoading: false});
  //       this.setState({status: "success"})
  //     } catch (error) {
  //       alert(`Check console for details.`);
  //       console.error(error);
  //       this.setState({isLoading: false});
  //       this.setState({status: "failed"})
  //     }
  //   } else {
  //     console.log("invalid address");
  //     this.setState({status: "failed"})
  //   }
  // }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <NavBar accounts={this.state.accounts} />
        {/* Stake && All Stake */}
        <Stake state={this.state} />
        {/* Unstake token and claim reward */}
        <Unstake state={this.state} />
        {/* <CardGroup style={{display: 'flex'}}>
          <div style={{display: 'flex', margin: '1%', width: '28%'}}>
            <Card bg="light" border="dark" style={{width: '100%'}}>
              <Card.Header>
                <Card.Title><strong>New Stake</strong></Card.Title>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className='stake-token'>
                    <Form.Control type="text" placeholder="Address token" 
                    ref={(input) => { this.addressTokenToStake = input }}
                    />
                    <br/>
                    <Form.Control type="number" placeholder="Amount to stake" 
                    ref={(res) => { this.amountToStake = res }}
                    />
                    <br/>
                    <Button onClick={ this.addNewStake }>
                      { this.state.isLoading == false ? <a>Stake</a> : <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                      />}
                    </Button>
                    <Form.Text style={{margin: '10%'}}><strong>{this.state.status}</strong></Form.Text>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>
          </div>
          <div style={{display: 'flex', margin: '1%', width: '68%'}}>
            <Card bg="ligth" border="dark" style={{width: '100%'}}>
              <Card.Header>
                <Card.Title><strong>All Stake</strong></Card.Title>
              </Card.Header>
            </Card>
          </div>
        </CardGroup> */}
      </div>
    );
  }
}

export default App;
