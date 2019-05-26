import React, { Component } from 'react'
import Aesjs from 'aes-js'
import Siofu from 'socketio-file-upload'

import MethodPicker from './MethodPicker'
import FilePicker from './FilePicker'
import Progress from './Progress'

import { socket } from '../api'
import { key, iv } from './constants'

const promiseEvent = (instance, eventType) => new Promise(resolve => {
  instance.addEventListener(eventType, resolve)
})

class Upload extends Component {
  constructor (props) {
    super(props)
    this.state = {
      method: 'ECB',
      file: null,
      fileName: '',
      fileExt: '',
      progress: 0
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
    const uploader = new Siofu(socket, {
      useBuffer: true,
      maxFileSize: 838860800
    })
    const { file, method, fileName, fileExt } = this.state
    const reader = new FileReader()
    reader.readAsArrayBuffer(file)
   
    await promiseEvent(reader, 'load')

    var textBytes = new Uint8Array(reader.result);
    let aesMode
    let paddedData
    // eslint-disable-next-line default-case
    switch (method) {
      case 'ECB': {
        aesMode = new Aesjs.ModeOfOperation.ecb(key) //eslint-disable-line
        paddedData = Aesjs.padding.pkcs7.pad(textBytes)
        break
      }
      case 'CBC': {
        aesMode = new Aesjs.ModeOfOperation.cbc(key, iv) //eslint-disable-line
        paddedData = Aesjs.padding.pkcs7.pad(textBytes)
        break
      }
      case 'CFB': {
        // The segment size is optional, and defaults to 1
        aesMode = new Aesjs.ModeOfOperation.cfb(key, iv, 1) //eslint-disable-line
        paddedData = textBytes
        break
      }
      case 'OFB': {
        aesMode = new Aesjs.ModeOfOperation.ofb(key, iv) //eslint-disable-line
        paddedData = textBytes
        break
      }
    }
    let encryptedBytes = aesMode.encrypt(paddedData)
    let arrayBuffer = encryptedBytes.buffer;
    let blob  = new Blob([arrayBuffer], { type: file.type });
    const encryptedFile = new File([blob], `${fileName}.${method}.${fileExt}`, { type: file.type })

    uploader.submitFiles([encryptedFile])
   
  }

  render () {
    const { fileName, progress } = this.state
    return (
      <div>
        <FilePicker
          onFileExtSet={this.handleFileExt}
          onFileChange={this.handleFileChange}
          onFileNameChange={this.handleFileNameChange}
          fileName={fileName} />
        <MethodPicker onMethodPick={this.handleMethodPick} />
        <Progress progress={progress} />
        <button onClick={this.transfer}>Upload File</button>
      </div>
    )
  }
}

export default Upload
