import React, { PureComponent } from 'react'
import { Image, Text, View } from 'react-native'
import styles from './HeaderStyles'
import { withTranslation } from 'react-i18next'
import { fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'
import { connect } from 'react-redux'

@connect(state => ({
  openedBottomSheet: state.openedBottomSheet,
}))
@withTranslation()
export default class HeaderTitle extends PureComponent {
  render () {
    const { t, openedBottomSheet } = this.props

    return (
      <View style={{
        alignSelf: 'center',
        flex: 1,
        opacity: openedBottomSheet ? 0.2 : 1,
      }}>
        {!this.props.showTitle && (<Image
          style={styles.logo}
          source={require('BiziboxUI/assets/logo.png')}
        />)}
        {this.props.showTitle && (<Text style={{
          textAlign: 'center',
          fontSize: sp(20),
          color: '#ffffff',
          fontFamily: fonts.semiBold,
        }}>{t('common:recommendation')}</Text>)}
      </View>
    )
  }
}
