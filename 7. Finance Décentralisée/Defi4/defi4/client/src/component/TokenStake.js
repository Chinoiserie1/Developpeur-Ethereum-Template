import React, { Component } from "react";
import { Button, Card, CardGroup, Form, Spinner } from "react-bootstrap";
import CardHeader from "react-bootstrap/esm/CardHeader";
import ERC20 from "../contracts/ERC20";

class CardTokenBody extends Component {
  constructor(props) {
    super(props);
    this.state = this.props.state;
    this.pair = this.props.pair;
    this.amount = this.props.amount;
  }
  async componentDidMount() {
    const { stacking, accounts } = this.state;
    const { addrERC, decimal, pair } = this.pair;
    let tokenId = await stacking.methods.getStakeIdToWithdraw(addrERC).call({from: accounts[0]});
    let res = await stacking.methods.calculReward(tokenId, pair, decimal).call({from: accounts[0]});
    this.setState({reward: res / 10 ** 18});
  }
  render() {
    return (
      <div>
        <Card>
          {this.amount / 10 ** 18} token staked
        </Card>
        <br/>
        <Card>
          {this.state.reward ? 
          <div> {this.state.reward} reward token </div> : <div></div>}
        </Card>
      </div>
    );
  }
}

class CardToken extends Component {
  constructor(props) {
    super(props);
    this.state = this.props.state;
    this.pair = this.props.pair;
  }
  async componentDidMount() {
    const { stacking, accounts } = this.state;
    let res = await stacking.methods.getActiveStake(accounts[0]).call();
    this.setState({activeStake: res});
  }
  ether = (n) => { return n * (10**18) }
  addNewStake = async () => {
    const { web3, accounts, stacking } = this.state;
    const contract = new web3.eth.Contract(
      ERC20.abi,
      this.pair.addrERC
    )
    const amount = this.amountToStake.value;
    if (this.pair.addrERC !== '') {
      try {
        this.setState({isLoading: true});
        var result = await contract.methods.approve(stacking._address, this.ether(amount).toString()).send({ from: accounts[0]});
        console.log(result);
        var res = await stacking.methods.stakeErc(this.pair.addrERC, this.ether(amount).toString()).send({from: accounts[0]});
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
  unstake = async () => {
    const { stacking, accounts } = this.state;
    const tokenUnstake = this.pair.addrERC;
    const amountToUnstake = this.amountToStake.value;
    try {
      this.setState({isLoading: true});
      let tokenId = await stacking.methods.getStakeIdToWithdraw(tokenUnstake).call({from: accounts[0]});
      if (tokenId) {
        let res = await stacking.methods.unstake(tokenUnstake, this.ether(amountToUnstake).toString(), tokenId).send({ from: accounts[0]});
        console.log(res);
        this.setState({isLoading: false});
        this.setState({status: "success"})
        window.location.reload();
      }
    } catch(error) {
        alert(`Check console for details.`);
        console.error(error);
        this.setState({isLoading: false});
        this.setState({status: "failed"})
    }
  }
  render() {
    return(
      <div>
        <Card bg="light" border="dark">
          <CardHeader>
            {this.pair.name}
          </CardHeader>
          <Card.Body>
            {this.state.activeStake ? this.state.activeStake.map((item) => {
              if(item.token == this.pair.addrERC) {
                return (<CardTokenBody state={this.state} pair={this.pair} amount={item.depositAmount} />);
              }
              // return (<div></div>);
            }) : <div></div>}
          </Card.Body>
          <Card.Footer>
            <Form>
              <Form.Group className='stake-token'>
                <Form.Control type="number" placeholder="Amount to stake or untsake" 
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
          </Card.Footer>
        </Card>
        <br/>
      </div>
    );
  }
}

class TokenStake extends Component {
  constructor(props) {
    super(props);
    this.state = this.props.state;
    this.state.pairs = [];
  }
  async componentDidMount() {
    const {stacking} = this.state;
    let pairs = await stacking.methods.getAllPair().call();
    this.setState({pairs});
  }

  render() {
    return (
      <CardGroup>
        <Card bg="light" border="dark">
          <Card.Header>
            <Card.Title><strong>Stake</strong></Card.Title>
          </Card.Header>
          <Card.Body>
            {this.state.pairs.map((p) => {
              return (<CardToken state={this.state} pair={p} key={p + this.state.pairs} />);
            })}
          </Card.Body>
        </Card>
      </CardGroup>
    );
  }
}

export default TokenStake;