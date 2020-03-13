'use strict'
const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./openapi.yml')

const app = express()

app.use(express.json())

// host swagger doc
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(9000, () => console.log('API listening on port 9000'))
