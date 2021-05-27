const { Transaction } = require('@ethereumjs/tx');

class Account {
  constructor(web3, common, options) {
    this.web3 = web3
    this.common = common
    this.address = options.address
    this.private = Buffer.from(options.private, 'hex');
  }

  get balance() {
    return new Promise(async (resolve) => {
      const wei = await this.web3.eth.getBalance(this.address)
      resolve(this.web3.utils.fromWei(wei, 'ether'))
    })
  }

  transfer({ value }) {
    const web3 = this.web3;
    const utils = web3.utils;
    const common = this.common;
    const to = async (receipt) => {
      const txCount = await web3.eth.getTransactionCount(this.address);
      const tx = Transaction.fromTxData({
        nonce: utils.toHex(txCount),
        gasLimit: utils.toHex(21000),
        gasPrice: utils.toHex(utils.toWei('10', 'gwei')),
        to: receipt.address,
        value: utils.toHex(utils.toWei(value, 'ether'))
      }, { common });
      const signedTx = tx.sign(this.private)
      const serializedTx = signedTx.serialize()
      const raw = `0x${serializedTx.toString('hex')}`
      return web3.eth.sendSignedTransaction(raw)
    }
    return { to }
  }

  deployContract() {}

  async deploy({ object }) {
    const web3 = this.web3;
    const utils = web3.utils;
    const common = this.common;
    const txCount = await web3.eth.getTransactionCount(this.address);
    const tx = Transaction.fromTxData({
      nonce: utils.toHex(txCount),
      gasLimit: utils.toHex(1000000),
      gasPrice: utils.toHex(utils.toWei('10', 'gwei')),
      data: `0x${object}`
    }, { common });
    const signedTx = tx.sign(this.private)
    const serializedTx = signedTx.serialize()
    const raw = `0x${serializedTx.toString('hex')}`
    return web3.eth.sendSignedTransaction(raw)
  }
}

module.exports = function account(web3, common, ...args) {
  return new Account(web3, common, ...args);
};