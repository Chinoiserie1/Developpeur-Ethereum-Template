const MyERC20 = artifacts.require("MyERC20");
const Stacking = artifacts.require("Stacking");

module.exports = async (deployer, accounts) => {
  await deployer.deploy(MyERC20);
  await deployer.deploy(Stacking);
  const token = await MyERC20.deployed();
  const tokenAddr = await token.address;
  const staking = await Stacking.deployed();
  const stakingAddr = await staking.address;

  let res = await token.setAutorizedContract(stakingAddr);
  console.log(res);
  let result = await staking.setMyToken(tokenAddr);
  console.log(result);
  let res2 = await staking.setPair("DAI/USD", "0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa", "0x2bA49Aaa16E6afD2a993473cfB70Fa8559B523cF", "8");
  console.log(res2);
}
