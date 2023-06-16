import React, { PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import AccountIcon from '../../AccountIcon/AccountIcon'
import Checker from '../../Checker/Checker'
import { combineStyles as cs, getCurrencyChar, sp } from 'src/utils/func'
import styles from '../AccountsModalStyles'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class AccountItem extends PureComponent {
  handleSelect = () => {
    const { isDisabled, account, onSelect } = this.props
    if (isDisabled) {return}
    onSelect(account.companyAccountId)
  }

  render () {
    const { isDisabled, isChecked, isRtl, account, t } = this.props
    const wrapperStyle = [cs(isRtl, styles.item, styles.itemRtl)]
    if (isChecked) {wrapperStyle.push(styles.itemChecked)}

    return (
      <TouchableOpacity style={wrapperStyle} onPress={this.handleSelect}>

        <View style={styles.checkerWrapper}>
          <AccountIcon account={account}/>

          {isChecked && (
            <Checker
              hasBackground={false}
              iconStyle={{ fontSize: sp(25) }}
              isDisabled={isDisabled}
              isChecked={isChecked}
            />
          )}
        </View>

        <Text style={cs(isDisabled, styles.itemText, styles.itemTextDisabled)}>
          {account.accountNickname} {`(${getCurrencyChar(account.currency)})`}
          {!account._isUpdated &&
          <Text style={{ color: colors.red6 }}>{` - ${t(
            'bankAccount:notUpdated')}`}</Text>}
        </Text>
      </TouchableOpacity>
    )
    }
}
