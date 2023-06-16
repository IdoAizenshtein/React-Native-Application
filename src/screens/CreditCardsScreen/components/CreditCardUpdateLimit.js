import React, { Fragment, PureComponent } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import sliderStyles from './CreditCardSlider/CreditCardSliderStyles'
import commonStyles from '../../../styles/styles'
import { getCurrencyChar } from '../../../utils/func'
import { CURRENCIES } from '../../../constants/common'

export default class CreditCardUpdateLimit extends PureComponent {
  render () {
    const {
      t,
      creditLimit,
      onChange,
      onSubmit,
      onClose,
      creditLimitModalYPosition,
      currentScrollPosition,
    } = this.props

    return (
      <Fragment>
        <TouchableOpacity style={sliderStyles.creditLimitBackgroundWrapper} onPress={onClose} />
        <View
          style={[commonStyles.row, commonStyles.rowReverse, sliderStyles.itemCreditCardLimitModal, { top: (creditLimitModalYPosition - currentScrollPosition) + 65 + 74 }]}>
          <TouchableOpacity
            style={sliderStyles.submitCreditLimitBtn}
            onPress={onSubmit}
          >
            <Text
              style={sliderStyles.submitCreditLimitBtnText}>{t('creditCards:submitUpdateCreditLimit')}</Text>
          </TouchableOpacity>
          <View style={[commonStyles.row, sliderStyles.creditLimitInputWrapper]}>
            <Text style={sliderStyles.creditLimitInputCurrency}>{getCurrencyChar(CURRENCIES.ILS)}</Text>
            <TextInput
              style={sliderStyles.creditLimitInput}
              placeholder={t('creditCards:insertAmount')}
              keyboardType="numeric"
              underlineColorAndroid="rgba(0,0,0,0)"
              onSubmitEditing={onSubmit}
              onChangeText={onChange}
              value={creditLimit}
            />
          </View>
        </View>
      </Fragment>
    )
  }
}
