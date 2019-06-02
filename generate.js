const crypto = require('crypto')
const JSEncrypt = require('node-jsencrypt')
const { saveKey, paths } = require('./pks')

const crypt = new JSEncrypt()
const privateKey = crypt.getPrivateKey()
const publicKey = crypt.getPublicKey()

const hash = crypto.createHmac('md5', process.argv[2]).digest()
console.log(privateKey)
saveKey(paths.PRIVATE_PATH, privateKey, hash)
saveKey(paths.PUBLIC_PATH, publicKey)
