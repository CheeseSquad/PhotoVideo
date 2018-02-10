const fs = require('fs')
const http = require('http')
const https = require('https')
const privateKey  = fs.readFileSync('./ssl/server.key', 'utf8')
const certificate = fs.readFileSync('./ssl/server.crt', 'utf8')

const credentials = {key: privateKey, cert: certificate}

const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, '.')))

const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)


httpsServer.listen(3000, () => console.log('Magic happens on port ' + 3000))