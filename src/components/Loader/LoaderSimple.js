import React, {PureComponent} from 'react'
import {Image, View} from 'react-native'
import loaderStyles from './LoaderStyles'

export default class LoaderSimple extends PureComponent {
  render () {
    const { containerStyle } = this.props

    return (
      <View style={[loaderStyles.simpleLoaderWrapper, containerStyle]}>
        <View style={loaderStyles.customLoaderWrapper}>
          <Image
            style={loaderStyles.biziboxAnimation}
            resizeMode="center"
            source={require('BiziboxUI/assets/animations/bizibox-loader.gif')}
          />
        </View>
      </View>
    )
  }
}
