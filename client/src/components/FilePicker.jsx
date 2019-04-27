import React, { Component } from 'react'
import './FilePicker.css'

class FilePicker extends Component {
  constructor (props) {
    super(props)
    this.state = {
      value: '',
      size: 0,
      uploadEnable: false,
      myFile: 0
    }
    this.file = new FileReader()
  }

    getFile = () => { return this.file }

    handleChange = (selectorFiles) => {
      if (selectorFiles.length > 0) {
        if (selectorFiles[0].size < 8192) {
          this.setState({ uploadEnable: false })
          alert('file size is lower than 1kB')
          this.fileInput.value = ''
          return
        } else if (selectorFiles[0].size >= 838860800) {
          this.setState({ uploadEnable: false })
          alert('file size is higher than 100 MB')
          this.fileInput.value = ''
          return
        } else {
          this.setState({ uploadEnable: true })
        }
        this.setState({ value: selectorFiles[0].name, size: selectorFiles[0].size, myFile: selectorFiles[0] })
        console.log(selectorFiles[0])
        this.file.readAsText(selectorFiles[0])
        console.log(this.file)
      }
    }
    // todo File name change
    handleInputChange = (event) => {
      this.setState({ value: event.target.value })
    }

    render () {
      return (
        <div>
          <input
            type='file'
            id='siofu_input'
            onChange={(e) => this.handleChange(e.target.files)} ref={ref => this.fileInput = ref} //eslint-disable-line
          />
          <br />
                Name: <input type='text' value={this.state.value} onChange={this.handleInputChange} />
          <br />
        </div>
      )
    }
}
export default FilePicker
