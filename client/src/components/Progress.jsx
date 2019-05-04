import React from 'react'
import './Progress.css'

const Progress = (props) => (
  <div className='ProgressBar'>
    <div
      className='Progress'
      style={{ width: props.progress + '%' }}
    />
  </div>
)

export default Progress
