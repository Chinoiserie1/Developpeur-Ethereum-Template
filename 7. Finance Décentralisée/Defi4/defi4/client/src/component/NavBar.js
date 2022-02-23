import React, { Component } from "react";
import { Navbar, Container } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

class NavBar extends Component {
  constructor(props) {
    super(props);
    this.accounts = this.props.accounts;
  }
  render() {
    return (
      <Navbar bg="dark" variant="dark">
        <Container>
          <Navbar.Brand href="#home">Dapp Stacking</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Navbar.Text>Signed in as:</Navbar.Text>
            <a href={"https://rinkeby.etherscan.io/address/" + this.accounts[0]} target="_blank">
              {this.accounts[0]}
            </a>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    );
  }
}

export default NavBar;