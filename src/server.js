const fs = require('fs')
const http = require('http')
const https = require('https')
const privateKey = fs.readFileSync('./ssl/apache-selfsigned.key', 'utf8')
const certificate = fs.readFileSync('./ssl/apache-selfsigned.crt', 'utf8')

const credentials = {key: privateKey, cert: certificate}

const express = require('express')
const path = require('path')
const app = express()

app.use(express.static(path.join(__dirname, '../dist')))

const httpServer = http.createServer(express())
http.get('*', (req, res) => {  
  res.redirect('https://' + req.headers.host + req.url)
})

const httpsServer = https.createServer(credentials, app)

let multer = require('multer')
let upload = multer()

process.title = 'theThing'

app.post('/video', upload.single('video'), (req, res, next) => {
  let video = req.file
  console.log(video)
  res.sendStatus(200)
})

httpServer.listen(3000, () => console.log('HTTP listening on local port 3000'))
httpsServer.listen(3001, () => console.log('HTTPS listening on local port 3001'))
