import React from 'react'
import HeaderControlsFactory from './HeaderControlsFactory'

export default function HeaderLeft (props) {
  return <HeaderControlsFactory {...props} position="left" />
}
