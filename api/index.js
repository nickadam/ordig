'use strict'
const fs = require('fs')
const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const swaggerUi = require('swagger-ui-express')
const init_server = require('./init_server')
const get_device_config = require('./get_device_config')
const get_all_device_configs = require('./get_all_device_configs')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./openapi.yml')
const db = new sqlite3.Database('/data/wg.sqlite3')

const wg_name = process.env.WG_NAME || 'wg0'
const wg_pool = process.env.WG_POOL || '10.10.10.0/24'
const wg_ip = process.env.WG_IP || '10.10.10.1'
const wg_endpoint = process.env.WG_ENDPOINT || 'wg.example.com'
const wg_namespace = process.env.WG_NAMESPACE || 'example.com'
const wg_nameserver = process.env.WG_NAMESERVER || '10.10.10.10'
const wg_port = process.env.WG_PORT || '51280'
const wg_allowed = process.env.WG_ALLOWED || '10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/24'
const wg_api_key = fs.readFileSync('/run/secrets/wg_api_key')
const wg_client_api_key = fs.readFileSync('/run/secrets/wg_client_api_key')

const app = express()

app.use(express.json())

// host swagger doc
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// require API keys
const server_url_re = /^\/api\/v[0-9]\/server/
const client_url_re = /^\/api\/v[0-9]\/(client|devices)/
app.use((req, res, next) => {
  if(server_url_re.test(req.path)){
    if(req.get('Authorization')){
      const auth = req.get('Authorization').split(' ')
      if(auth[1]){
        const token = auth[1]
        if(token == wg_api_key){
          next()
        }else{
          res.status(401).send('invalid token')
        }
      }else{
        res.status(401).send('invalid token')
      }
    }else{
      res.status(401).send('invalid token')
    }
  }else if(client_url_re.test(req.path)){
    if(req.get('Authorization')){
      const auth = req.get('Authorization').split(' ')
      if(auth[1]){
        const token = auth[1]
        if(token == wg_client_api_key){
          next()
        }else{
          res.status(401).send('invalid token')
        }
      }else{
        res.status(401).send('invalid token')
      }
    }else{
      res.status(401).send('invalid token')
    }
  }else{
    res.status(400).send('bad request')
  }
})


// generate or get server keypair
init_server(db, (err, server_keypair) => {
  if(err){
    console.error('Error initializing server: ', err)
    process.exit(1)
  }

  // send server config
  app.get('/api/v1/server/config', (req, res) => {
    res.send({
      name: wg_name,
      ip: wg_ip + '/' + wg_pool.split('/')[1],
      port: wg_port,
      private_key: server_keypair.private_key
    })
  })

  // test client
  app.get('/api/v1/client', (req, res) => {
    res.send({
      wg_endpoint: wg_endpoint,
      wg_port: wg_port,
      wg_allowed: wg_allowed,
      public_key: server_keypair.public_key
    })
  })

  // generate and get device config
  app.post('/api/v1/devices/:hostname/config', (req, res) => {
    const hostname = req.params.hostname
    const key = req.body.key
    get_device_config(hostname, key, db, wg_pool, (err, config) => {
      if(err || !config){
        if(err){console.error(err)}
        res.status(500).send('Failed to get device config')
      }else{
        res.send({
          succeeded: true,
          name: wg_name,
          namespace: wg_namespace,
          nameserver: wg_nameserver,
          config: `[Interface]
Address = ${config.ip}/${wg_pool.split('/')[1]}
PrivateKey = ${JSON.parse(config.keypair).private_key}

[Peer]
PublicKey = ${server_keypair.public_key}
Endpoint = ${wg_endpoint}:${wg_port}
AllowedIPs = ${wg_allowed}
PersistentKeepalive = 25
`
        })
      }
    })
  })

  // get all device configs for server
  app.get('/api/v1/server/devices', (req, res) => {
    get_all_device_configs(db, (err, configs) => {
      if(err || !configs){
        if(err){console.error(err)}
        res.status(500).send('Failed to get device configs')
      }else{
        res.send(configs)
      }
    })
  })
})

app.listen(9000, () => console.log('API listening on port 9000'))
