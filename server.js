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

app.use(express.static(publicPath))

io.on('connection', socket => {
  console.log('New user connected')
  console.log(__dirname)
  var uploader = new Siofu()
  uploader.dir = './Upload'
  uploader.listen(socket)
  uploader.on('progress', event => {
    console.log(event.file.bytesLoaded / event.file.size)
    socket.emit('upload.progress', {
      percentage: (event.file.bytesLoaded / event.file.size) * 100
    })
  })
 
  uploader.on('saved', event => {
    if (event.file.success) {
      
      var data = new Buffer(0)
      var readStream = fs.createReadStream(event.file.pathName)
      readStream.on('data', chunk => {
        data = Buffer.concat([data,chunk])
      })
      
      let splitName = event.file.name.split('.')
      let cipherMethod = splitName[splitName.length-2]
      readStream.on('end', () => {
        var key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
        var iv = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
        let aesMode
        switch (cipherMethod) {
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
            //TextMustBeAMultipleOfSegmentSize change paddedData if u wish to use different segment
            aesMode = new aesjs.ModeOfOperation.cfb(key, iv, 1) //eslint-disable-line
            break
          }
          case 'OFB': {
            aesMode = new aesjs.ModeOfOperation.ofb(key, iv) //eslint-disable-line
            break
          }
        }
        var decryptedBytes = aesMode.decrypt(data)
        fs.open(`./Upload/${splitName[0]}.${splitName[splitName.length-1]}`, 'w+', (err, fd) => {
          if (err) {
            console.log('Error occured', err)
            return
          }
          let buf = Buffer.from(decryptedBytes)
          let pos = 0
          let offset = 0
          let len = buf.length

          fs.write(fd, buf, offset, len, pos, (_2, bytes, buff) => {
            console.log(buff)
          })
        })
      })
    } else {
      console.log('Something went wrong')
    }
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
