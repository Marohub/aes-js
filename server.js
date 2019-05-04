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

// const Buffer = require('buffer')

app.use(express.static(publicPath))

io.on('connection', socket => {
  console.log('New user connected')
  console.log(__dirname)
  var uploader = new Siofu()
  uploader.dir = '.'
  uploader.listen(socket)
  uploader.on('progress', event => {
    console.log(event.file.bytesLoaded / event.file.size)
    socket.emit('upload.progress', {
      percentage: (event.file.bytesLoaded / event.file.size) * 100
    })
  })

  uploader.on('saved', event => {
    if (event.file.success) {
      let data = ''
      console.log('File Sent')
      var readStream = fs.createReadStream(event.file.pathName)
      readStream.on('data', chunk => {
        data += chunk
      })
      readStream.on('end', () => {
        var key = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
        var iv = [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36]
        var encryptedBytes = aesjs.utils.hex.toBytes(data)
        var aesMethod = new aesjs.ModeOfOperation.ofb(key, iv) // eslint-disable-line
        var decryptedBytes = aesMethod.decrypt(encryptedBytes)
        // var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes)

        fs.open(`./${event.file.base}`, 'w+', (err, fd) => {
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

        // fs.writeFile("upload/Decrypted/"+event.file.base, arraybuffer);
        // console.log(event)

        // var fdata = decryptedText.replace(/^data:image\/\w+;base64,/, "");
        //   fs.writeFile("upload/Decrypted/"+event.file.base,new Buffer(fdata, 'base64') , function(err) {
        //     if(err) {
        //         return console.log(err);
        //     }
        //     console.log("The file was saved!");
        // })
      })
    } else {
      console.log('Something went wrong')
    }
  })

  // Error handler:
  //   uploader.on("error", function(event){
  //     console.log("Error from uploader", event);
  // });

  socket.on('change_username', data => {
    socket.username = data.username
  })

  socket.on('disconnect', () => {
    console.log('User disconnected')
  })
})

server.listen(port, () => {
  console.log(`Server is up on port ${port}`)
})
