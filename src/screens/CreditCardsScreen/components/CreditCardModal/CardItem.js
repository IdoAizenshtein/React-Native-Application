import React, {PureComponent} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import Checker from '../../../../components/Checker/Checker'
import {combineStyles as cs, sp} from '../../../../utils/func'
import {colors} from '../../../../styles/vars'
import {isCardUpdated} from '../../../../utils/date'
import accountModalStyles from '../../../../components/AccountsModal/AccountsModalStyles'
import styles from './CreditCardModalStyles'

@withTranslation()
export default class CardItem extends PureComponent {
    handleSelect = () => {
      const { card, onSelect } = this.props
      onSelect(card.creditCardId)
    };

    render () {
      const { isChecked, isRtl, card, t } = this.props
      const wrapperStyle = [cs(isRtl, styles.item, styles.itemRtl)]
      if (isChecked) {wrapperStyle.push(accountModalStyles.itemChecked)}

      return (
        <TouchableOpacity style={wrapperStyle} onPress={this.handleSelect}>

          {isChecked && (
            <View style={styles.checkerWrapper}>
              <Checker
                hasBackground={false}
                iconStyle={{ fontSize: sp(25) }}
                isChecked={isChecked}
              />
            </View>
          )}

          <Text style={accountModalStyles.itemText}>
            {card.creditCardNickname}
            {!isCardUpdated(card.balanceLastUpdatedDate) &&
              <Text style={{ color: colors.red6 }}>{` - ${t('bankAccount:notUpdated')}`}</Text>}
          </Text>
        </TouchableOpacity>
      )
    }
}
