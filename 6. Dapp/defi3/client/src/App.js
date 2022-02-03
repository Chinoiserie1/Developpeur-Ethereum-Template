import React, { Component } from "react";
import VotingContract from "./contracts/Voting.json";
import getWeb3 from "./getWeb3";
import 'bootstrap/dist/css/bootstrap.min.css';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Card from 'react-bootstrap/Card';
import ListGroup from 'react-bootstrap/ListGroup';
import Table from 'react-bootstrap/Table';
import "./App.css";

class App extends Component {
  state = { web3: null, accounts: null, contract: null, whitelistAddr: [],
    owner: null, id: null, proposal: null };
  status = null;
  showStatus = null;
  whitelist = null;
  winner = null;
  winnerId = null;

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();
      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();
      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = VotingContract.networks[networkId];
      const instance = new web3.eth.Contract(
        VotingContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const owner = await instance.methods.owner().call();
      this.status = await instance.methods.Status().call();
      this.showStatus = this.showStatus(this.status);
      var id = await instance.methods.id().call();
      id = parseInt(id, 10);
      id -= 1;
      if (this.status === "5") {
        this.winner = 1;
        this.winnerId = await instance.methods.getWinner().call();
        console.log("winner id = " + this.winnerId);
      }
      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance, owner, id }, this.runExample);
      this.proposal();
      this.showWhitelistAddr();
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, contract } = this.state;
    console.log(accounts);
    console.log(contract);
  };
  checkWhitelist = async () => {
    const { accounts, contract } = this.state;
    const result = await contract.methods._voter(accounts[0]).call();

    this.whitelist = result.isRegistered;
    if (this.whitelist === false ) {
      alert("U are not whitelist");
    } else {
      alert("U are whitelist");
    }
  }
  showWhitelistAddr = async () => {
    const { contract } = this.state;
    let result = await contract.methods.getWhitelistAddr().call();

    this.setState({ whitelistAddr: result });
    contract.events.VoterRegistered({})
      .on('data', () => {
        window.location.reload();
      })
      .on('error', console.error);
  }
  addWhitelist = async () => {
    const { accounts, contract, owner } = this.state;
    const address = this.address.value;

    if (accounts[0] !== owner) {
      alert("U are not the owner");
      console.log("U are not the owner");
    } else {
      if (address !== '') {
        await contract.methods.addWhitelistVoters(address).send({from: accounts[0]});
      } else {
        alert("Pls add an address");
        console.log("pls add an address");
      }
    }
  }
  showStatus = (status) => {
    switch (status) {
      case "0":
        status = "RegisteringVoters";
        return status;
        break;
      case "1":
        status = "ProposalsRegistrationStarted";
        return status;
        break;
      case "2":
        status = "ProposalsRegistrationEnded";
        return status;
        break;
      case "3":
        status = "VotingSessionStarted";
        return status;
        break;
      case "4":
        status = "VotingSessionEnded";
        return status;
        break;
      case "5":
        status = "VotesTallied";
        return status;
        break;
      default:
        status = "RegisteringVoters";
        return status;
        break;
    }
  }
  changeStatus = async () => {
    const { accounts, contract, owner } = this.state;
    var newStatus = parseInt(this.status, 10);
    newStatus += 1;

    if(accounts[0] === owner) {
      const res = await contract.methods.changeStatus(newStatus).send({ from: accounts[0] });
      console.log(res);
      window.location.reload();
    } else {
      alert("U are not the owner");
    }
  }
  addProposal = async () => {
    const { accounts, contract } = this.state;
    const message = this.message.value

    if (this.whitelist === false ) {
      alert("U are not whitelist");
    } else {
      const res = await contract.methods.addProposal(message).send({ from: accounts[0] });
      console.log(res);
      window.location.reload();
    }
  }
  proposal = async () => {
    const { contract, id } = this.state;
    let proposal = [];

    if (this.whitelist === false ) {
      alert("U are not whitelist");
    } else {
      for (var i = 0; i <= id; i++) {
        let res = await contract.methods.proposal(i).call();
        proposal.push(i + ') ' + res.description);
      }
      this.setState({ proposal });
    }
  }
  voting = async () => {
    const { contract, accounts } = this.state;
    let id = parseInt(this.id.value, 10);
    console.log("voting for = " + id);

    if (this.whitelist === false ) {
      alert("U are not whitelist");
    } else {
      const res = await contract.methods.addVote(id).send({ from: accounts[0] });
      console.log(res);
      window.location.reload();
    }
  }
  searchWinner = async () => {
    const { contract, accounts, owner } = this.state;

    if(accounts[0] === owner) {
      this.winner = 1;
      const res = await contract.methods.searchWinner().send({ from: accounts[0] });
      console.log(res);
      window.location.reload();
    } else {
      alert("U are not the owner");
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <br></br>
        <div>
          <h2 className="text-center">Voting</h2>
          <hr></hr>
        </div>
        <div>
          <h3 className="second-text-center"> Current status = {this.showStatus} </h3>
          <hr></hr>
          {/* <br></br> */}
        </div>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Nouvelle session</strong></Card.Header>
            <Card.Body>
              <Button onClick={ this.changeStatus } variant="dark" > Next session </Button>
            </Card.Body>
          </Card>
        </div>
        <br></br>
        {/* <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Est ce que je suis whitelist</strong></Card.Header>
            <Card.Body>
              <Button onClick={ this.checkWhitelist } variant="dark" > Check </Button>
            </Card.Body>
          </Card>
        </div>
        <br></br> */}
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Liste des comptes whitelisté</strong></Card.Header>
            <Card.Body>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>@</th>
                      </tr>
                    </thead>
                    <tbody>
                      {this.state.whitelistAddr !== null && 
                        this.state.whitelistAddr.map((a) => <tr><td>{a}</td></tr>)
                      }
                    </tbody>
                  </Table>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </div>
        <br></br>
          {console.log(this.status)}
        { this.status == 0 ? 
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Autoriser un nouveau compte</strong></Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Control type="text" id="address"
                  ref={(input) => { this.address = input }}
                  />
                </Form.Group>
                <Button onClick={ this.addWhitelist } variant="dark" > Autoriser </Button>
              </Card.Body>
            </Card>
          </div> : <div></div>
        }
        {/* <br></br>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <Card style={{ width: '50rem' }}>
            <Card.Header><strong>Nouvelle session</strong></Card.Header>
            <Card.Body>
              <Button onClick={ this.changeStatus } variant="dark" > Next session </Button>
            </Card.Body>
          </Card>
        </div> */}
        <br></br>
        { this.status == "1" ? 
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Ajout d'une proposition</strong></Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Control type="text" id="address"
                  ref={(input) => { this.message = input }}
                  />
                </Form.Group>
                <Button onClick={ this.addProposal } variant="dark" > Ajouter </Button>
              </Card.Body>
            </Card>
          </div> : <div></div>
        }
        <br></br>
        { this.status != "0" ? 
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Liste des propositions</strong></Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Table striped bordered hover>
                      <tbody>
                        {this.state.proposal !== null && 
                          this.state.proposal.map((a) => <tr><td>{a}</td></tr>)
                        }
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div> : <div></div>
        }
        <br></br>
        { this.status == "3" ? 
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Voter le numero de la proposition</strong></Card.Header>
              <Card.Body>
                <Form.Group>
                  <Form.Control type="text" id="address"
                  ref={(input) => { this.id = input }}
                  />
                </Form.Group>
                <Button onClick={ this.voting } variant="dark" > Submit vote </Button>
              </Card.Body>
            </Card>
          </div> : <div></div>
        }
        <br></br>
        { this.status == "4" ?
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Comptabilisation des voies</strong></Card.Header>
              <Card.Body>
                <Button onClick={ this.searchWinner } variant="dark" > Run </Button>
              </Card.Body>
            </Card>
          </div> : <div></div>
        }
        <br></br>
        { this.status == "5" ?
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <Card style={{ width: '50rem' }}>
              <Card.Header><strong>Propositions gagnante</strong></Card.Header>
              <Card.Body>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Table striped bordered hover>
                      <tbody>
                        {this.winner !== null && 
                          <tr><td>{this.winnerId}</td></tr>
                        }
                      </tbody>
                    </Table>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </div> : <div></div>
        }
      </div>
    );
  }
}

export default App;