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
import Unstake from "./component/Unstake";
import TokenStake from "./component/TokenStake";

import "./App.css";

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
    try {
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Check console for details.`,
      );
      console.error(error);
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <NavBar accounts={this.state.accounts} />
        {/* Stake && All Stake */}
        {/* <Stake state={this.state} /> */}
        {/* Unstake token and claim reward */}
        {/* <Unstake state={this.state} /> */}
        <TokenStake state={this.state} />
      </div>
    );
  }
}

export default App;
