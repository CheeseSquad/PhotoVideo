const fs = require('fs')
const http = require('http')
const https = require('https')
const privateKey  = fs.readFileSync('./ssl/server.key', 'utf8')
const certificate = fs.readFileSync('./ssl/server.crt', 'utf8')

const credentials = {key: privateKey, cert: certificate}

const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, '../dist')))

const httpServer = http.createServer(app)
const httpsServer = https.createServer(credentials, app)

let multer = require('multer');
let upload = multer();

app.post('/video', upload.single('video'), (req, res, next) => {
  let video = req.file
  console.log(video)
  res.sendStatus(200)
});


httpServer.listen(3001, () => console.log('Magic happens on port ' + 3001))

httpsServer.listen(443, () => console.log('Magic happens on port ' + 443))