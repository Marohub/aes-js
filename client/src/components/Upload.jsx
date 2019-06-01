import React, { Component } from 'react'
import Aesjs from 'aes-js'

import MethodPicker from './MethodPicker'
import FilePicker from './FilePicker'
import Progress from './Progress'

import { Loader } from './Loader'
import io from 'socket.io-client'

import JSEncrypt from 'jsencrypt'

const promiseEvent = (instance, eventType) => new Promise(resolve => {
  instance.addEventListener(eventType, resolve)
})

const generateKeyIV = () => {
  const min = 1
  const max = 255
  const key = Array(16).fill(0).map(() => Math.floor(Math.random() * (max - min + 1)) + min)
  const iv = Array(16).fill(0).map(() => Math.floor(Math.random() * (max - min + 1)) + min)
  return { key, iv }
}

const CHUNK_SIZE = 500000

class Upload extends Component {
  constructor (props) {
    super(props)
    this.state = {
      method: 'ECB',
      file: null,
      fileName: '',
      fileExt: '',
      progress: 0,
      isLoading: false,
      pk: '',
      key: [],
      iv: []
    }
    this.socket = null
  }

  componentDidMount = () => {
    this.socket = io.connect('localhost:3001').on('keys', ({ pk }) => {
      const { key, iv } = generateKeyIV()
      this.setState({ pk, key, iv })
      const crypt = new JSEncrypt()
      crypt.setPublicKey(pk)
      const ckey = crypt.encrypt(key.join(','))
      const civ = crypt.encrypt(iv.join(','))
      this.socket.emit('session', { key: ckey, iv: civ })
    })
  }

  handleMethodPick = method => this.setState({ method })
  handleFileNameChange = fileName => this.setState({ fileName })
  handleFileExt = fileExt => this.setState({ fileExt })
  handleFileChange = file => this.setState({ file })

  transfer = async () => {
    const { file, method, fileName, fileExt, key, iv } = this.state
    this.setState({ isLoading: true })
    this.socket.emit('meta', { fileName, method, fileExt, type: file.type })

    const reader = new FileReader()
    reader.readAsArrayBuffer(file)

    await promiseEvent(reader, 'load')

    let textBytes = new Uint8Array(reader.result)

    const chunksCount = textBytes.length / CHUNK_SIZE
    this.socket.on('progress', ({ n: nChunk }) => {
      this.setState({ progress: nChunk / chunksCount * 100 })
    })
    let i = 0
    let n = 0
    while (i < textBytes.length) {
      const chunk = textBytes.slice(i, i + CHUNK_SIZE)
      let aesMode
      let paddedData
      // eslint-disable-next-line default-case
      switch (method) {
        case 'ECB': {
          aesMode = new Aesjs.ModeOfOperation.ecb(key) //eslint-disable-line
          paddedData = Aesjs.padding.pkcs7.pad(chunk)
          break
        }
        case 'CBC': {
          aesMode = new Aesjs.ModeOfOperation.cbc(key, iv) //eslint-disable-line
          paddedData = Aesjs.padding.pkcs7.pad(chunk)
          break
        }
        case 'CFB': {
          // The segment size is optional, and defaults to 1
          aesMode = new Aesjs.ModeOfOperation.cfb(key, iv, 1) //eslint-disable-line
          paddedData = chunk
          break
        }
        case 'OFB': {
          aesMode = new Aesjs.ModeOfOperation.ofb(key, iv) //eslint-disable-line
          paddedData = chunk
          break
        }
      }
      let encryptedBytes = aesMode.encrypt(paddedData)
      let arrayBuffer = encryptedBytes.buffer

      this.socket.emit('chunk', { buffer: arrayBuffer, n, size: chunk.length })
      n++
      i += CHUNK_SIZE
    }
    this.socket.emit('finished')
    //
    // const encryptedFile = new File([blob], `${fileName}.${method}.${fileExt}`, { type: file.type })
    // console.log(arrayBuffer.byteLength)
    // uploader.submitFiles([encryptedFile])

    this.socket.on('received', () => {
      console.log('received')
      this.setState({ isLoading: false })
    })
  }

  render () {
    const { fileName, progress, isLoading } = this.state
    return isLoading
      ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Loader />
          <Progress progress={progress} />
        </div>
      )
      : (
        <div>
          <FilePicker
            onFileExtSet={this.handleFileExt}
            onFileChange={this.handleFileChange}
            onFileNameChange={this.handleFileNameChange}
            fileName={fileName} />
          <MethodPicker onMethodPick={this.handleMethodPick} />

          <button onClick={this.transfer}>Upload File</button>
        </div>
      )
  }
}

export default Upload
