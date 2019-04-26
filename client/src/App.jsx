import React, { Component } from 'react'
// import socketIOClient from 'socket.io-client'
// import Method from './components/cipherMethod'
import Upload from './components/Upload'
// import siofu from 'socketio-file-upload'
// import {socket} from 'Header'
// import SocketIOFileUpload from 'socketio-file-upload'
import { BrowserRouter as Router } from 'react-router-dom';

import './App.css';

class App extends Component {
  constructor() {
    super()
    this.state = {
      color: 'white',

    }
    
    this.reader = new FileReader()
    // this.connecToServer = this.connecToServer.bind(this);
  }
  // connecToServer() {
  //   fetch('/');
  // }
  // componentDidMount() {
  //   this.connecToServer();
  // }
  listen = () => {
    var input = this.input
    input.onchange = function() {
      var file = this.files
      this.myfile = file[0]
      this.reader.readAsText(file[0])
      this.fileName.value = file[0].name
      this.fileName.size = file[0].name.length
      if (file.length > 0) {
        if (file[0].size >= 838860800 || file[0].size<8192) {
          this.btn_upload.disabled = true
          alert("file size limit")
        } else {
          this.btn_upload.disabled = false
        }
      }
    }
  }
  

  render() {
    
    this.reader.onload = function(e) {
      this.data = this.reader.result
      console.log(this.reader.result.length)
   }
    return (
      <Router>
      <div className="App">
        <header className="App-header">
        <Upload/>
      <div id="progress_bar"></div>



      </header>
      </div>
      </Router>
    )
  }
}

export default App;
