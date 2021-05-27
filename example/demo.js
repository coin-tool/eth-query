const Ethereum = require('../');
const { rinkebyRPC, account1Options, account2Options } = require('./config.json');
const contractOptions = require('./contract.json');
const { Account, Contract } = new Ethereum(rinkebyRPC, {
  chain: 'rinkeby'
});

const account1 = Account(account1Options);
const account2 = Account(account2Options);

async function runBalance() {
  const balance1 = await account1.balance;
  const balance2 = await account2.balance;
  console.log(`balance1: ${balance1}\nbalance2: ${balance2}`);
}

async function runTransaction() {
  const receipt = await account1.transfer({ value: '0.1' }).to(account2);
  console.log(receipt);
}

async function deployContract() {
  const res = await account1.deploy(contractOptions.byteCode);
  console.log(res);
}

async function runContract() {
  const contract = Contract(contractOptions.abi, contractOptions.address)
  const ownerAddress = await contract.ins.getOwner()
  console.log(ownerAddress)
  // const res = await contract.ins.changeOwner(account1.address).from(account2)
  // console.log(res)
  // const events = await contract.events.getPastEvents('OwnerSet', {
  //   fromBlock: 'genesis',
  //   toBlock: 'latest'
  // })
  // console.log(events)
}

function main() {
  // runBalance();
  // runTransaction();
  // deployContract();
  runContract();
}
main();
