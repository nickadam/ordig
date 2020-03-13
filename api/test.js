'use strict'

const keypair = require('./generate_keypair')()
if(!(keypair.private_key.length === 44 && keypair.public_key.length === 44)){
  console.error('generate_keypair failed', keypair.private_key.length)
}else{
  console.log('generate_keypair passed')
}

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database(':memory:')
const init_server = require('./init_server')
init_server(db, (err, keypair) => {
  if(!(keypair.private_key.length === 44 && keypair.public_key.length === 44)){
    console.error('server_keypair failed', keypair.private_key.length)
  }else{
    console.log('server_keypair passed')
  }
  db.close()
})
