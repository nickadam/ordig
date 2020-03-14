'use strict'
const http = require('http')
const fs = require('fs')

// test keypair generator
const keypair = require('./generate_keypair')()
if(!(keypair.private_key.length === 44 && keypair.public_key.length === 44)){
  console.error('generate_keypair failed', keypair.private_key.length)
}else{
  console.log('generate_keypair passed')
}

// test database server init
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

// test client api key
const wg_client_api_key = fs.readFileSync('/run/secrets/wg_client_api_key')
const options = {
  headers: {
    Authorization: 'Bearer ' + wg_client_api_key
  }
}
http.get('http://127.0.0.1:9000/api/v1/client', options, res => {
  res.on('data', d => {
    if(JSON.parse(d.toString()).public_key.length === 44){
      console.log('client api key permit passed')
    }else{
      console.error('client api key permit failed')
    }
  })
})
options.headers.Authorization = 'Bearer 12345'
http.get('http://127.0.0.1:9000/api/v1/client', options, res => {
  res.on('data', d => {
    if(d.toString() === 'invalid token'){
      console.log('client api key reject passed')
    }else{
      console.error('client api key reject failed')
    }
  })
})


//test server api key
const wg_api_key = fs.readFileSync('/run/secrets/wg_api_key')
options.headers.Authorization = 'Bearer ' + wg_api_key
http.get('http://127.0.0.1:9000/api/v1/server/config', options, res => {
  res.on('data', d => {
    if(JSON.parse(d.toString()).private_key.length === 44){
      console.log('server api key permit passed')
    }else{
      console.error('server api key permit failed')
    }
  })
})
options.headers.Authorization = 'Bearer 12345'
http.get('http://127.0.0.1:9000/api/v1/server/config', options, res => {
  res.on('data', d => {
    if(d.toString() === 'invalid token'){
      console.log('server api key reject passed')
    }else{
      console.error('server api key reject failed')
    }
  })
})
