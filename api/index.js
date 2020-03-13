'use strict'
const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./openapi.yml')

const db = new sqlite3.Database('/data/wg.sqlite3')

// create tables
db.run('CREATE TABLE IF NOT EXISTS server (keypair TEXT, ip TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')
db.run('CREATE TABLE IF NOT EXISTS networks (ip TEXT KEY, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')
db.run('CREATE TABLE IF NOT EXISTS clients (hostname TEXT KEY, ip TEXT KEY, keypair TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)')

const app = express()

app.use(express.json())

// host swagger doc
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(9000, () => console.log('API listening on port 9000'))
