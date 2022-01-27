const path = require("path");
const PrivateKeyProvider = require("truffle-privatekey-provider");
const infuraKeyRopsten = "https://ropsten.infura.io/v3/2a9a09c78015420f90045d8a7b76894f";

// const fs = require('fs');
// const mnemonic = fs.readFileSync(".secret").toString().trim();
// const privateKey = fs.readFileSync(".secret").toString();

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    develop: {
      port: 7545
    },
    ropsten: {
      provider: () => new PrivateKeyProvider(privateKey, infuraKeyRopsten),
      // gasPrice: 50000000000, // 50 gwei,
      network_id: 3
    }
  },
  compilers: {
    solc: {
      version: "0.8.9",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
       optimizer: {
         enabled: false,
         runs: 200
       },
       evmVersion: "byzantium"
      }
    }
  }
};
