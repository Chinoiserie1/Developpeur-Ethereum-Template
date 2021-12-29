const Migrations = artifacts.require("erc20Token");

module.exports = function (deployer) {
  deployer.deploy(Migrations, 1000000);
};
