const express = require('express')
const Siofu = require('socketio-file-upload')
const path = require('path')
const http = require('http')
const fs = require('fs')
var aesjs = require('aes-js')

const app = express().use(Siofu.router)
const port = process.env.PORT || 3001
const publicPath = path.join(__dirname, 'public')
let server = http.createServer(app)
let io = require('socket.io')(server)

var key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
var iv = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]

app.use(express.static(publicPath))

io.on('connection', socket => {
  console.log('New user connected')
  console.log(__dirname)
  let fileMeta // { fileName, method, fileExt, fileType }
  let fileBytes = new Uint8Array()
  socket.on('meta', meta => { fileMeta = meta })

  socket.on('chunk', ({ buffer, n, size }) => {
    let aesMode
    switch (fileMeta.method) {
      case 'ECB': {
        aesMode = new aesjs.ModeOfOperation.ecb(key) //eslint-disable-line
        break
      }
      case 'CBC': {
        aesMode = new aesjs.ModeOfOperation.cbc(key, iv) //eslint-disable-line
        break
      }
      case 'CFB': {
        // The segment size is optional, and defaults to 1
        // TextMustBeAMultipleOfSegmentSize change paddedData if u wish to use different segment
        aesMode = new aesjs.ModeOfOperation.cfb(key, iv, 1) //eslint-disable-line
        break
      }
      case 'OFB': {
        aesMode = new aesjs.ModeOfOperation.ofb(key, iv) //eslint-disable-line
        break
      }
    }
    const decryptedBytes = aesMode.decrypt(buffer)
    const slicedBytes = decryptedBytes.slice(0, size)
    let newArr = new Uint8Array(fileBytes.length + slicedBytes.length)
    newArr.set(fileBytes)
    newArr.set(slicedBytes, fileBytes.length)
    fileBytes = newArr
    socket.emit('progress', { n })
  })

  socket.on('finished', () => {
    fs.open(`./Upload/${fileMeta.fileName}.${fileMeta.method}.${fileMeta.fileExt}`, 'w+', (err, fd) => {
      if (err) {
        console.log('Error occured', err)
        return
      }
      let buf = Buffer.from(fileBytes)

      fs.write(fd, buf, 0, buf.length, 0, () => {
        socket.emit('received')
        fileBytes = new Uint8Array()
      })
    })
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
