const fs = require('fs')
const aesjs = require('aes-js')

const paths = {
  PUBLIC_PATH: './public/rsa.pubk',
  PRIVATE_PATH: './private/rsa.pk'
}

const toByteArray = str => {
  var myBuffer = []
  var buffer = Buffer.from(str, 'utf8')
  for (var i = 0; i < buffer.length; i++) {
    myBuffer.push(buffer[i])
  }
  return myBuffer
}

const saveKey = (path, key, hash) => {
  let buffer = toByteArray(key)
  if (hash) {
    const aesMode = new aesjs.ModeOfOperation.cbc(hash, hash) //eslint-disable-line
    const data = aesjs.padding.pkcs7.pad(buffer)
    let encryptedBytes = aesMode.encrypt(data)
    buffer = encryptedBytes.buffer
  }
  fs.open(path, 'w+', (err, fd) => {
    if (err) {
      console.log('Error occured', err)
      return
    }
    let buf = Buffer.from(buffer)
    fs.write(fd, buf, 0, buf.length, 0, () => { })
  })
}

const openKey = (path, hash) => new Promise(resolve =>
  fs.readFile(path, (err, data) => {
    if (err) {
      console.log('Error occured', err)
      return
    }
    let bytes = data
    if (hash) {
      const aesMode = new aesjs.ModeOfOperation.cbc(hash, hash) //eslint-disable-line
      bytes = aesMode.decrypt(data)
    }
    resolve(Buffer.from(bytes).toString('utf8'))
  })
)

module.exports = { saveKey, openKey, paths }
