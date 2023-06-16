import React, { PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import {
  combineStyles as cs,
  getFormattedValueArray,
  goTo,
  sp,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../SlikaStyles'
import { colors, fonts } from '../../../styles/vars'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import { IS_LIGHT } from '../../../constants/config'
import { PACKAGES } from '../../../constants/navigation'

@withTranslation()
export default class SlikaAdditionalInfo extends PureComponent {
  goToPack = () => {
    goTo(this.props.navigation, PACKAGES)
  }

  render () {
    const { isRtl, data, t, account } = this.props
    const rowStyles = cs(isRtl, [styles.dataRowWrapper, styles.dataRowLevel3],
      commonStyles.rowReverse)

    const regularPayments = getFormattedValueArray(data.regularPaymentsTotal)
    const paymentsTotal = getFormattedValueArray(data.paymentsTotal)

    // const originalTotal = getFormattedValueArray(data.originalTotal)
    return (
      <View style={styles.dataRowLevel3Wrapper}>

        <View style={[
          rowStyles, {
            alignItems: 'center',
            justifyContent: 'flex-end',
            alignSelf: 'center',
            alignContent: 'center',
          }]}>
          <View style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
          }}>
            <View
              style={cs(isRtl,
                [commonStyles.row, commonStyles.alignItemsCenter],
                [commonStyles.rowReverse])}>
              <Text
                style={{
                  fontSize: sp(16),
                  color: colors.blue7,
                  fontFamily: fonts.regular,
                }}
                numberOfLines={1}
                ellipsizeMode="tail">
                {account.accountNickname}
              </Text>
              <View style={commonStyles.spaceDivider}/>
              <AccountIcon account={account}/>
            </View>
          </View>
        </View>

        <View style={rowStyles}>
          <Text style={styles.dataRowLevel3Text}>
            {t('slika:regularPaymentsTotal')}
          </Text>
          <Text style={styles.dataRowLevel3Text} numberOfLines={1}>
            <Text
              style={[
                styles.dataValueText,
                regularPayments < 0
                  ? styles.dataValueNegativeText
                  : styles.dataValuePositiveText]}
              numberOfLines={1}
            >
              {regularPayments[0]}
            </Text>
            <Text style={styles.fractionalPart}
                  numberOfLines={1}> .{regularPayments[1]} </Text>
          </Text>
        </View>

        <View style={rowStyles}>
          <Text style={styles.dataRowLevel3Text}>
            {t('slika:paymentsTotal')}
          </Text>

          <Text style={styles.dataRowLevel3Text} numberOfLines={1}>
            <Text
              style={[
                styles.dataValueText,
                paymentsTotal < 0
                  ? styles.dataValueNegativeText
                  : styles.dataValuePositiveText]}
              numberOfLines={1}
            >
              {paymentsTotal[0]}
            </Text>
            <Text style={styles.fractionalPart}
                  numberOfLines={1}> .{paymentsTotal[1]} </Text>
          </Text>
        </View>

        {(!IS_LIGHT.light && data.expectedPercent !== null) && (
          <View style={rowStyles}>
            <Text style={styles.dataRowLevel3Text}>
              {t('slika:expectedPercent')}
            </Text>

            <Text
              style={[
                styles.dataValueText,
                data.expectedPercent < 0
                  ? styles.dataValueNegativeText
                  : styles.dataValuePositiveText]}
            >
              {`${data.expectedPercent || 0}%`}
            </Text>
          </View>
        )}
        {(IS_LIGHT.light) && (
          <TouchableOpacity style={rowStyles} onPress={this.goToPack}>
            <Image
              resizeMode="contain"
              style={[
                styles.imgIcon, {
                  width: 58 / 2.8,
                  height: 55 / 2.8,
                  position: 'absolute',
                  top: 0,
                  left: 3,
                }]}
              source={require('BiziboxUI/assets/diamond.png')}
            />
            <Text style={[
              styles.dataRowLevel3Text, {
                textAlign: 'right',
                color: '#f3c935',
                fontFamily: fonts.semiBold,
              }]}>
              {t('slika:expectedPercent')}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    )
  }
}
