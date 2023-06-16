import React, { PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import styles from './DataListStyles'
import { colors, fonts } from '../../styles/vars'
import { getCurrencyChar, getFormattedValueArray, sp } from '../../utils/func'
import AppTimezone from '../../utils/appTimezone'

export default class DataListSectionHeader extends PureComponent {
  render () {
    const { account, section: { title, data, first, total }, screenSwitchState, cashFlow, showIconGraph, openGraph, showAlert, cashScreen, itra } = this.props
    const sum = (total === undefined)
      ? (itra
        ? ((data[0] && data[0].itra !== undefined) ? getFormattedValueArray(
          data[0].itra) : null)
        : (data[0] && data[0].uniItratSgira !== undefined)
          ? getFormattedValueArray(data[0].uniItratSgira)
          : null)
      : getFormattedValueArray(total)

    let cashFlowTextPast = false
    if (sum && (!first ||
      (title !== AppTimezone.moment().format('DD/MM/YY') && cashFlow))) {
      cashFlowTextPast = AppTimezone.moment(title, 'DD/MM/YY')
        .isBefore(AppTimezone.moment())
    }
    let isBetween = false
    if (cashFlow && account) {
      isBetween = title !== AppTimezone.moment().format('DD/MM/YY') && account && account.balanceLastUpdatedDate && AppTimezone.moment(title, 'DD/MM/YY').isSameOrAfter(AppTimezone.moment(account.balanceLastUpdatedDate)) && AppTimezone.moment(title, 'DD/MM/YY').isBefore(AppTimezone.moment())
    }

    return (
      <View style={styles.sectionTitleWrapper}>
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.blue32,
          height: 29,
          width: 'auto',
          borderRadius: 29 / 2,
          flexDirection: 'row-reverse',
          paddingHorizontal: 10,
        }}>

          <Text style={[styles.sectionTitleText, {
            textAlign: 'right',
            fontFamily: fonts.semiBold,
            color: isBetween ? colors.red2 : colors.blue32,
          }]}>{(title === AppTimezone.moment().format('DD/MM/YY')) ? (!screenSwitchState ? 'היום' : 'היום (לא סופי)') : title}</Text>

          {showAlert && title && title.includes('היום') && (
            <TouchableOpacity
              style={{
                paddingRight: 10,
              }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={showAlert}
            >
              <Image
                style={[{ width: 16, height: 15.5 }]}
                source={require('BiziboxUI/assets/iconAler.png')}
              />
            </TouchableOpacity>
          )}

          {account && first && (AppTimezone.moment(account.balanceLastUpdatedDate).format('DD/MM/YY') === title) && (
            <Text style={{
              paddingHorizontal: 5,
              color: colors.blue32,
              fontSize: sp(17),
              fontFamily: fonts.regular,
            }}>{'(נגררות)'}</Text>
          )}
          {cashScreen && sum && (!first && title !== AppTimezone.moment().format('DD/MM/YY')) && (
            <Text style={{
              paddingHorizontal: 5,
              color: colors.blue32,
              fontSize: sp(17),
              fontFamily: fonts.regular,
            }}>{(cashFlowTextPast) ? 'יתרה' : 'יתרה צפוייה'}</Text>
          )}

          {cashScreen && sum && (!first && title !== AppTimezone.moment().format('DD/MM/YY')) && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail">
              <Text style={{
                color: colors.blue32,
                fontSize: sp(17),
                fontFamily: fonts.regular,
              }}>{(account && account.currency) ? getCurrencyChar(account.currency) : ''} {sum[0]}</Text>
            </Text>
          )}

          {!cashScreen && sum && (!first || title !== AppTimezone.moment().format('DD/MM/YY')) && (
            <Text style={{
              paddingHorizontal: 5,
              color: colors.blue32,
              fontSize: sp(17),
              fontFamily: fonts.regular,
            }}>{(cashFlowTextPast) ? 'יתרה' : 'יתרה צפוייה'}</Text>
          )}

          {!cashScreen && sum && (!first || title !== AppTimezone.moment().format('DD/MM/YY')) && (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail">
              <Text style={{
                color: colors.blue32,
                fontSize: sp(17),
                fontFamily: fonts.regular,
              }}>{(account && account.currency) ? getCurrencyChar(account.currency) : ''} {sum[0]}</Text>
            </Text>
          )}
        </View>

        {showIconGraph && (
          <TouchableOpacity
            style={{
              position: 'absolute',
              left: 15,
              top: 3,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={openGraph}
          >
            <Image
              style={[styles.imgIcon, { resizeMode: 'contain', width: 30, height: 30 }]}
              source={require('BiziboxUI/assets/graphIcon.png')}
            />
          </TouchableOpacity>
        )}
      </View>
    )
  }
}
