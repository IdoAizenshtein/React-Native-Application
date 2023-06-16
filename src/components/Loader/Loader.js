import React, {PureComponent} from 'react'
import {ActivityIndicator, Image, View} from 'react-native'
import loaderStyles from './LoaderStyles'
import styles from '../../styles/styles'

export default class Loader extends PureComponent {
    static defaultProps = { size: 'large' };

    render () {
      const { isDefault, overlay, size, color, containerStyle } = this.props
      const style = overlay ? loaderStyles.overlay : styles.container

      return (
        <View style={[style, containerStyle]}>
          {isDefault ? (
            <ActivityIndicator
              style={loaderStyles.centerLoader}
              size={size}
              color={color}
            />
          ) : (
            <View style={loaderStyles.customLoaderWrapper}>
              <Image
                style={loaderStyles.biziboxAnimation}
                resizeMode="center"
                source={require('BiziboxUI/assets/animations/bizibox-loader.gif')}
              />
            </View>
          )}
        </View>
      )
    }
}
