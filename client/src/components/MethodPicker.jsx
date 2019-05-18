import React, { Component } from 'react'
import PropTypes from 'prop-types'

const RadioButton = props => {
  const identifier = `cipher-method-${props.value}`
  return (
    <div className='radio-container'>
      <input
        type='radio'
        name={identifier}
        id={identifier}
        className='radio-input'
        {...props}
      />
      <label htmlFor={identifier}>
        {props.value}
      </label>
    </div>
  )
}

RadioButton.propTypes = {
  checked: PropTypes.bool.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
}

class MethodPicker extends Component {
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

  handleMethodPick = e => {
    const selectedOption = e.target.value
    this.setState({ selectedOption })
    this.props.onMethodPick(selectedOption)
  }

  render () {
    const { state, handleMethodPick } = this
    return (
      <>
        <RadioButton value='ECB' checked={state.selectedOption === 'ECB'} onChange={handleMethodPick} />
        <RadioButton value='CBC' checked={state.selectedOption === 'CBC'} onChange={handleMethodPick} />
        <RadioButton value='CFB' checked={state.selectedOption === 'CFB'} onChange={handleMethodPick} />
        <RadioButton value='OFB' checked={state.selectedOption === 'OFB'} onChange={handleMethodPick} />
      </>
    )
  }
}

MethodPicker.propTypes = {
  onMethodPick: PropTypes.func.isRequired
}

export default MethodPicker
