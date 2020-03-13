'use strict'

const keypair = require('./generate_keypair')()
if(!(keypair.private_key.length === 44 && keypair.public_key.length === 44)){
  console.error('generate_keypair failed', keypair.private_key.length)
}else{
  console.log('generate_keypair passed')
}
