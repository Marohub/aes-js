const express = require("express")
const siofu = require("socketio-file-upload")
const path = require('path');
const http = require('http');
const fs = require('fs')
var aesjs = require('aes-js')
const app = express().use(siofu.router)
const port = process.env.PORT || 3001
const publicPath = path.join(__dirname, 'public');
let server = http.createServer(app)
let io = require("socket.io")(server)

// const Buffer = require('buffer')

app.use(express.static(publicPath));

io.on('connection', (socket) => {
    console.log('New user connected')
    console.log(__dirname)
    var uploader = new siofu()
    uploader.dir = "/Users/Maro/Documents/EyeEye/bsk-aes-js/upload"
    uploader.listen(socket)
    uploader.on('progress', function(event) {
        console.log(event.file.bytesLoaded / event.file.size)
        socket.emit('upload.progress', {
          percentage:(event.file.bytesLoaded / event.file.size) * 100
        })
    });
   
    uploader.on("saved", function(event){
      if(event.file.success){
        
        let data = '';
        console.log("File Sent")
        var readStream = fs.createReadStream(event.file.pathName);
        readStream.on('data', function(chunk) {
          data += chunk
       })
       
       readStream.on('end', function(){
        var key = [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16 ]
        var iv = [ 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34,35, 36 ]
        var encryptedBytes = aesjs.utils.hex.toBytes(data)
        var aesMethod = new aesjs.ModeOfOperation.ofb(key, iv)
        var decryptedBytes = aesMethod.decrypt(encryptedBytes)
        var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);

        fs.open("upload/Decrypted/"+event.file.base, 'w+', (err, fd) => {
          let buf = Buffer.from(decryptedText),
          pos = 0,offset = 0,
          len = buf.length
         
          fs.write(fd, buf, offset, len, pos,
          (err,bytes,buff) => {
            console.log(buff)
          });
         });

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
 
      }else{
        console.log("Something went wrong")
      }
    });

      // Error handler:
    //   uploader.on("error", function(event){
    //     console.log("Error from uploader", event);
    // });

    socket.on('change_username', (data) => {
        socket.username = data.username
    })


  socket.on('disconnect', () => {
    console.log('User disconnected')
  });
})


server.listen(port, ()=>{
    console.log(`Server is up on port ${port}`);
  })
  