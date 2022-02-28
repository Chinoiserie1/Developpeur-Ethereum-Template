import React, { Component } from "react";
import ERC20 from "../contracts/ERC20";
import { Card, Button, Form, CardGroup, Spinner, Pagination, Table, ListGroup } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

class Unstake extends Component {
  addressERC = [
    "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa",
    "0x01BE23585060835E02B77ef475b0Cc51aA1e0709"
  ]
  addressPair = [
    {
      pair: "DAI/USD",
      address: "0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF",
      decimal: '8'
    },
    {
      pair: "LINK/USD",
      address: "0xd8bD0a1cB028a31AA859A21A3758685a95dE4623",
      decimal: '8'
    }
  ];
  constructor (props) {
    super(props);
    this.state = this.props.state;
  }
  ether = (n) => { return n * (10**18) }
  unstake = async () => {
    const { stacking, accounts } = this.state;
    const tokenUnstake = this.addresTokenToUnstake.value;
    const amountToUnstake = this.amountToUnstake.value;
    try {
      this.setState({isLoading: true});
      let tokenId = await stacking.methods.getStakeIdToWithdraw(tokenUnstake).call({from: accounts[0]});
      if (tokenId) {
        let result = await stacking.methods.claimReward(tokenUnstake, tokenId).send({from: accounts[0]});
        console.log(result);
        let res = await stacking.methods.unstake(tokenUnstake, this.ether(amountToUnstake).toString(), tokenId).send({ from: accounts[0]});
        console.log(res);
        this.setState({isLoading: false});
        this.setState({status: "success"})
        // window.location.reload();
      }
    } catch(error) {
        alert(`Check console for details.`);
        console.error(error);
        this.setState({isLoading: false});
        this.setState({status: "failed"})
    }
  }
  render() {
    console.log(this.state.stacking);
    return (
      <CardGroup>
        <Card bg="light" border="dark">
          <Card.Header>
            <Card.Title><strong>Unstake</strong></Card.Title>
          </Card.Header>
          <Card.Body>
            <Form>
              <Form.Group className='stake-token'>
                <Form.Control type="text" placeholder="Address token" 
                  ref={(input) => { this.addresTokenToUnstake = input }}
                />
                <br/>
                <Form.Control type="number" placeholder="Amount to unstake" 
                  ref={(input) => { this.amountToUnstake = input }}
                />
                <br />
                <Button onClick={ this.unstake }>
                { this.state.isLoading === false ? <a>Unstake</a> : <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"/>
                }
                </Button>
                <Form.Text style={{margin: '10%'}}><strong>{this.state.status}</strong></Form.Text>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>
      </CardGroup>
    );
  }
}

export default Unstake;