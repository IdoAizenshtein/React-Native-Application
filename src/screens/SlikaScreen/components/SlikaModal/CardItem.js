import React, { PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import Checker from '../../../../components/Checker/Checker'
import { combineStyles as cs, sp } from '../../../../utils/func'
import { colors } from '../../../../styles/vars'
import accountModalStyles
  from '../../../../components/AccountsModal/AccountsModalStyles'
import styles from './SlikaModalStyles'

@withTranslation()
export default class CardItem extends PureComponent {
  handleSelect = () => {
    const { card, onSelect } = this.props
    onSelect(card.solekId)
  }

  render () {
    const { isChecked, isRtl, card, t } = this.props
    const wrapperStyle = [cs(isRtl, styles.item, styles.itemRtl)]
    if (isChecked) {wrapperStyle.push(accountModalStyles.itemChecked)}

    const cardName = card.solekDesc

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
          {cardName}
          {(card.isUpdate === false) &&
          <Text style={{ color: colors.red6 }}>{` - ${t(
            'bankAccount:notUpdated')}`}</Text>}
        </Text>
      </TouchableOpacity>
    )
  }
}
