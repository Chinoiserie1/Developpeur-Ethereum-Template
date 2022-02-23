import React, { Component } from "react";
import ERC20 from "../contracts/ERC20";
import { Card, Button, Form, CardGroup, Spinner, Pagination, Table, ListGroup } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

const CardStake = (addr, amount) => {
  return (
    <Card bg="light" border="dark">
      <Card.Header>
        {addr}
      </Card.Header>
      <Card.Body>
        <Card>
        {amount} tokens staked
        </Card>
      </Card.Body>
    </Card>
  );
}

class Paginations extends Component {
  constructor(props) {
    super(props);
    this.state = this.props.state;
  }
  componentDidMount = async () => {
    let items;
    let nb = 0;
    items = await this.GettActiveStake();
    nb = items.length;
    this.setState({nb: nb});
    this.setState({items: items});
    this.showActiveStake();
  }
  GettActiveStake = async () => {
    const { stacking, accounts } = this.state;
    let res = await stacking.methods.getActiveStake(accounts[0]).call();
    console.log(res);
    return (res);
  }
  showActiveStake = () => {
    const { items, nb } = this.state;
    let ercAddr = [];
    let amount = [];
    let res = [];
    if (items) {
      for (let i = 0; i < nb; i++) {
        ercAddr.push(items[i][0]);
        amount.push(items[i][1] / 10**18);
      }
      for (let i = 0; i < nb; i++) {
        res.push(CardStake(ercAddr[i], amount[i]));
      } 
      return (
        <div>
          {res}
        </div>
      );
    }
  }
  render() {
    return (
      <div>
        {this.showActiveStake()}
      </div>
    );
  }
}

class Stake extends Component {
  constructor(props) {
    super(props);
    this.state = this.props.state;
  }
  ether = (n) => { return n * (10**18) }
  addNewStake = async () => {
    const { web3, accounts, stacking } = this.state;
    const addressToken = this.addressTokenToStake.value;
    const contract = new web3.eth.Contract(
      ERC20.abi,
      addressToken
    )
    const amount = this.amountToStake.value;

    if (addressToken !== '') {
      try {
        this.setState({isLoading: true});
        var result = await contract.methods.approve(stacking._address, this.ether(amount).toString()).send({ from: accounts[0]});
        console.log(result);
        var res = await stacking.methods.newStake(addressToken, this.ether(amount).toString()).send({from: accounts[0]});
        console.log(res);
        this.setState({isLoading: false});
        this.setState({status: "success"})
        window.location.reload();
      } catch (error) {
        alert(`Check console for details.`);
        console.error(error);
        this.setState({isLoading: false});
        this.setState({status: "failed"})
      }
    } else {
      console.log("invalid address");
      this.setState({status: "failed"})
    }
  }
  render() {
    return (
      <CardGroup style={{display: 'flex'}}>
          {/* New Stake */}
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
                      { this.state.isLoading === false ? <a>Stake</a> : <Spinner
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
          {/* All Stake */}
          <div style={{display: 'flex', margin: '1%', width: '68%'}}>
            <Card bg="ligth" border="dark" style={{width: '100%'}}>
              <Card.Header>
                <Card.Title><strong>All Stake</strong></Card.Title>
              </Card.Header>
              <Card.Body>
                <Paginations state={this.state} />
              </Card.Body>
            </Card>
          </div>
        </CardGroup>
    );
  }
}

export default Stake;