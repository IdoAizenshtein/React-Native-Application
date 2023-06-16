import React, { PureComponent } from 'react'
import { View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { combineStyles as cs } from '../../utils/func'
import styles from './CheckerStyles'

export default class Checker extends PureComponent {
  static defaultProps = {
    hasBackground: true,
    isChecked: false,
    isDisabled: false,
    iconStyle: {},
  }

    render () {
      const { isDisabled, isChecked, isRtl, hasBackground, iconStyle } = this.props
      const wrapperStyle = [cs(isRtl, styles.checkbox, styles.checkboxRtl)]
      const newIconStyle = [cs(isRtl, [styles.checkboxIcon, iconStyle], styles.checkboxIconRtl)]

      if (isDisabled) {
        newIconStyle.push(styles.iconDisabled)
      } else if (isChecked) {
        wrapperStyle.push(styles.checkboxChecked)
        newIconStyle.push(cs(hasBackground, styles.checkboxIconNoBgChecked, styles.checkboxIconChecked))
      }

      return hasBackground
        ? <View style={wrapperStyle}><Icon name="check" style={newIconStyle} /></View>
        : <Icon name="check" style={newIconStyle} />
    }
}
