import React, { Component } from 'react'
import Aesjs from 'aes-js'

import MethodPicker from './MethodPicker'
import FilePicker from './FilePicker'
import Progress from './Progress'

import { socket } from '../api'
import { key, iv } from './constants'
import { Loader } from './Loader'

const promiseEvent = (instance, eventType) => new Promise(resolve => {
  instance.addEventListener(eventType, resolve)
})

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
      isLoading: false
    }
  }

  componentDidMount = () => {
    socket.on('upload.progress', progress => {
      this.setState({ progress: progress.percentage })
      console.log('Progress', this.state.progress)
    })
  }

  handleMethodPick = method => this.setState({ method })
  handleFileNameChange = fileName => this.setState({ fileName })
  handleFileExt = fileExt => this.setState({ fileExt })
  handleFileChange = file => this.setState({ file })

  transfer = async () => {
    const { file, method, fileName, fileExt } = this.state
    this.setState({ isLoading: true })
    socket.emit('meta', { fileName, method, fileExt, type: file.type })

    const reader = new FileReader()
    reader.readAsArrayBuffer(file)

    await promiseEvent(reader, 'load')

    let textBytes = new Uint8Array(reader.result)

    const chunksCount = textBytes.length / CHUNK_SIZE
    socket.on('progress', ({ n: nChunk }) => {
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

      socket.emit('chunk', { buffer: arrayBuffer, n, size: chunk.length })
      n++
      i += CHUNK_SIZE
    }
    socket.emit('finished')
    //
    // const encryptedFile = new File([blob], `${fileName}.${method}.${fileExt}`, { type: file.type })
    // console.log(arrayBuffer.byteLength)
    // uploader.submitFiles([encryptedFile])

    socket.on('received', () => {
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
