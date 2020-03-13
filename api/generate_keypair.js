'use strict'
const child_process = require('child_process')

module.exports = () => {
  const private_key = child_process.execSync('wg genkey').toString().trim()
  const public_key = child_process.execSync('echo -n ' + private_key + '|wg pubkey').toString().trim()
  return {
    private_key: private_key,
    public_key: public_key
  }
}
