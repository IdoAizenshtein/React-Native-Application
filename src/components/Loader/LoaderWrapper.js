import React, { PureComponent } from 'react'
import Loader from './Loader'

export default class LoaderWrapper extends PureComponent {
  render () {
    const { isLoading, isDefault, children } = this.props
    return isLoading ? <Loader isDefault={isDefault} /> : children
  }
}
