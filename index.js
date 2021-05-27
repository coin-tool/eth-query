const Web3 = require('web3');
const { default: Common } = require('@ethereumjs/common');
const account = require('./src/account');
const contract = require('./src/contract');

class Ethereum {
  constructor(rpc, options) {
    this.rpc = rpc || ''
    this.web3 = new Web3(this.rpc)
    this.common = new Common(options)
  }
  Account = (...args) => account(this.web3, this.common, ...args)
  Contract = (...args) => contract(this.web3, this.common, ...args)
}
module.exports = Ethereum;