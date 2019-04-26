import React, { Component } from 'react'
import Method from './cipherMethod'
import Progress from './Progress'
import siofu from 'socketio-file-upload'
import { socket } from "../api";
// import {key, iv} from 'constants'
import ProgressBar from 'react-bootstrap/ProgressBar'
class Upload extends Component {
  constructor(props) {
    super(props)
    this.state = {progress: 0}
  }

  createFile = () => {

  }
  transfer =() => {
    var uploader = new siofu(socket,{
        useBuffer: true,
        maxFileSize: 838860800
    })
    console.log("transfer")
    var file = new File( [(this.method.state.encryptedBytes)],this.method.state.name+"."+this.method.state.selectedOption, {type: this.method.state.myFile.type})
    console.log(file)
    uploader.submitFiles([file])
  }
componentDidMount= () => {
  socket.on('upload.progress', function(progress){
    this.setState({progress: progress.percentage})
    console.log(this.state.progress)
}.bind(this))
}
  render() {
    return (
      <div>
          <Method ref={method => { this.method = method }}/>
          <Progress ref={per => { this.per = per }}/>
          <ProgressBar animated min={0} max={100} now={this.state.progress} />
          <p><button onClick={this.transfer} >Upload File</button></p>
          
      </div>
      
    )
  }
}

export default Upload