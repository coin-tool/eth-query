const { Transaction } = require('@ethereumjs/tx');

class Events {
  constructor(contract) {
    this.contract = contract
  }
  getPastEvents(...args) {
    return this.contract.getPastEvents(...args)
  }
}

class Contract {
  constructor(web3, common, abi, address) {
    this.web3 = web3
    this.common = common
    this.abi = abi
    this.address = address
    this.contract = new web3.eth.Contract(abi, address)
    this.ins = {}
    this.events = new Events(this.contract)
    this.init()
  }

  init() {
    const { viewNames, otherNames } = this.getFunctionNames();
    this.bindFunction(this.ins, viewNames, async (name) => {
      return this.contract.methods[name]().call()
    })
    this.bindFunction(this.ins, otherNames, (name, ...args) => {
      const web3 = this.web3;
      const utils = web3.utils;
      const common = this.common;
      return {
        from: async (account) => {
          const txCount = await web3.eth.getTransactionCount(account.address);
          const tx = Transaction.fromTxData({
            nonce: utils.toHex(txCount),
            gasLimit: utils.toHex(8000000),
            gasPrice: utils.toHex(utils.toWei('10', 'gwei')),
            to: this.address,
            data: this.contract.methods[name](...args).encodeABI()
          }, { common });
          const signedTx = tx.sign(account.private)
          const serializedTx = signedTx.serialize()
          const raw = `0x${serializedTx.toString('hex')}`
          return web3.eth.sendSignedTransaction(raw)
        }
      }
    })
  }

  getFunctionNames() {
    return this.abi.reduce((total, item) => {
      if (item.type === 'function') {
        if (item.stateMutability === 'view') {
          total.viewNames.push(item.name)
        } else {
          total.otherNames.push(item.name)
        }
      }
      return total
    }, { viewNames: [], otherNames: [] })
  }

  bindFunction(ins, names, handle) {
    names.forEach((name) => {
      ins[name] = (...args) => handle(name, ...args)
    })
  }

}

module.exports = function contract(web3, common, ...args) {
  return new Contract(web3, common, ...args);
};