import React, { PureComponent } from 'react'
import { Text, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import { getCurrencyChar, getFormattedValueArray } from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles from '../CreditCardsStyles'

@withTranslation()
export default class CreditCardAggregatedDataHead extends PureComponent {
  render () {
    const { t, section, type } = this.props
    if (type === 'Card') {
      const totalSums = section.data.reduce((memo, card) => {
        memo[card.currency] = memo.hasOwnProperty(card.currency)
          ? memo[card.currency] + card.monthlyTotal
          : card.monthlyTotal
        return memo
      }, {})
      const totalSum = Object.keys(totalSums)

      return (
        <View style={styles.sectionTitleWrapper}>
          <View style={styles.sectionTitleInner}>
            <View style={{
              flexDirection: 'row-reverse',
            }}>
              <Text style={styles.sectionTitleText}> - {section.title}</Text>
              <Text style={[commonStyles.semiBoldFont, styles.sectionTitleText]}>
                {totalSum.map((currency, idx) => {
                  return `${getCurrencyChar(currency)}${getFormattedValueArray(totalSums[currency])[0]}${(totalSum.length !== idx + 1) ? ' ,' : ''}`
                })}
              </Text>
              {section.data.some(c => c.notFinal) &&
              <Text style={styles.sectionTitleText}>{` (${t('creditCards:notFinal')}) `}</Text>}
            </View>
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.sectionTitleWrapper}>
          <View style={styles.sectionTitleInner}>
            <View style={{
              flexDirection: 'row-reverse',
            }}>
              <Text style={styles.sectionTitleText}> - {section.title}</Text>
              <Text style={[commonStyles.semiBoldFont, styles.sectionTitleText]}>
                {getCurrencyChar('ILS')}{getFormattedValueArray(section.sumMonthlyTotal)[0]}
              </Text>
              {section.data.some(c => c.notFinal) &&
              <Text style={styles.sectionTitleText}>{` (${t('creditCards:notFinal')}) `}</Text>}
            </View>
          </View>
        </View>
      )
    }
  }
}
