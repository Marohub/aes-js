import React, { Component } from 'react'
import aesjs from 'aes-js'
import { key, iv } from './constants'
import File from './FilePicker'

class Method extends Component {
  constructor (props) {
    super(props)
    this.state = {
      selectedOption: 'ECB',
      encryptedBytes: 0,
      name: '',
      padding: [],
      aesMethod: 0,
      myFile: 0
    }
  }
    handleOptionChange = changeEvent => {
      this.setState({
        selectedOption: changeEvent.target.value
      })
    }
    getState = () => {
      return this.state
    }
    handleFormSubmit = formSubmitEvent => {
      formSubmitEvent.preventDefault()
      var file = this.file.getFile()
      var textBytes = aesjs.utils.utf8.toBytes(file.result)
      var aesMode
      var paddedData
      switch (this.state.selectedOption) {
        case 'ECB':
        {
          aesMode = new aesjs.ModeOfOperation.ecb(key) //eslint-disable-line
          paddedData = aesjs.padding.pkcs7.pad(textBytes)
          console.log('button with ECB was clicked')
          break
        } // TODO
        case 'CBC':
        {
          aesMode = new aesjs.ModeOfOperation.cbc(key, iv) //eslint-disable-line
          paddedData = aesjs.padding.pkcs7.pad(textBytes)
          console.log('button with CBC was clicked')
          break
        }
        case 'CFB':
        {
          // The segment size is optional, and defaults to 1
          var segmentSize = 1
          paddedData = textBytes
          aesMode = new aesjs.ModeOfOperation.cfb(key, iv, segmentSize) //eslint-disable-line
          console.log('button with CFB was clicked')
          break
        }
        case 'OFB':
        {
          aesMode = new aesjs.ModeOfOperation.ofb(key, iv) //eslint-disable-line
          paddedData = textBytes
          console.log(aesMode)
          break
        }
        default:
      }
      var encryptedBytes = aesMode.encrypt(paddedData)
      var hexEncryptedData = aesjs.utils.hex.fromBytes(encryptedBytes)
      // console.log(hexEncryptedData)
      this.setState({
        encryptedBytes: hexEncryptedData,
        name: this.file.state.value,
        padding: paddedData,
        myFile: this.file.state.myFile
      })
    }
    componentDidUpdate = () => {
    }
    render () {
      return (
        <form onSubmit={this.handleFormSubmit}>
          <div><File ref={file => { this.file = file }} /></div>
          <div className='form-check'>
            <label>
              <input
                type='radio'
                name='cipherMethod'
                value='ECB'
                checked={this.state.selectedOption === 'ECB'}
                onChange={this.handleOptionChange}
                className='form-check-input'
              />
          ECB
            </label>
          </div>
          <div className='form-check'>
            <label>
              <input
                type='radio'
                name='cipherMethod'
                value='CBC'
                checked={this.state.selectedOption === 'CBC'}
                onChange={this.handleOptionChange}
                className='form-check-input'
              />
          CBC
            </label>
          </div>
          <div className='form-check'>
            <label>
              <input
                type='radio'
                name='cipherMethod'
                value='CFB'
                checked={this.state.selectedOption === 'CFB'}
                onChange={this.handleOptionChange}
                className='form-check-input'
              />
          CFB
            </label>
          </div>
          <div className='form-check'>
            <label>
              <input
                type='radio'
                name='cipherMethod'
                value='OFB'
                checked={this.state.selectedOption === 'OFB'}
                onChange={this.handleOptionChange}
                className='form-check-input'
              />
          OFB
            </label>
          </div>
          <div className='form-group'>
            <button className='btn btn-primary mt-2' type='submit'>
          Save
            </button>
          </div>
        </form>
      )
    }
}
export default Method
