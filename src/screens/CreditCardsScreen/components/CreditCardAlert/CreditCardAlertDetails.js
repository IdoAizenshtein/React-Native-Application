import React, { Fragment, PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import AppTimezone from 'src/utils/appTimezone'
import { withTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { combineStyles as cs, getFormattedValueArray } from 'src/utils/func'
import styles, { ALERT_HEIGHT } from './CreditCardAlertStyles'
import commonStyles from 'src/styles/styles'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class CreditCardAlertDetails extends PureComponent {
  get cards () {
    const {
      alertState: { isMoreThenOneOfMultiple, isLowCreditLimitIsMoreThenOneOfMultiple, isNoCreditLimitIsMoreThenOneOfMultiple },
      selectedNotUpdatedCards,
      selectedLowCreditLimitCards,
      selectedNoCreditLimitCards,
    } = this.props

    if (isMoreThenOneOfMultiple) {return selectedNotUpdatedCards}
    if (isLowCreditLimitIsMoreThenOneOfMultiple) {return selectedLowCreditLimitCards}
    if (isNoCreditLimitIsMoreThenOneOfMultiple) {return selectedNoCreditLimitCards}
    return []
  }

  getMiddlePart (card) {
    const {
      t,
      alertState: {
        isMoreThenOneOfMultiple,
        isLowCreditLimitIsMoreThenOneOfMultiple,
        isNoCreditLimitIsMoreThenOneOfMultiple,
      },
    } = this.props

    if (isMoreThenOneOfMultiple) {
      return (
        <Text style={[styles.alertAdditionalText, { color: colors.red2 }]}>
          {t(
            'creditCards:lastUpdatedXDaysAgo',
            { days: AppTimezone.moment().diff(AppTimezone.moment(card.balanceLastUpdatedDate), 'days') },
          )}
        </Text>
      )
    }

    if (isLowCreditLimitIsMoreThenOneOfMultiple) {
      const value = getFormattedValueArray(card.availableCredit)
      return (
        <Text style={[styles.alertAdditionalText]}>
          {'מסגרת פנויה '} {value[0]}.{value[1]}
        </Text>
      )
    }

    if (isNoCreditLimitIsMoreThenOneOfMultiple) {
      const value = getFormattedValueArray(card.availableCredit)
      return (
        <Text style={[styles.alertAdditionalText, { color: colors.red2 }]}>
          {'מסגרת פנויה '} {value[0]}.{value[1]}
        </Text>
      )
    }
  }

    handleSelectCard = (id) => () => {
      this.props.onSelectCard(id)
    };

    render () {
      const {
        isRtl,
        top,
        onClose,
      } = this.props
      const cards = this.cards

      return (
        <Fragment>
          <TouchableOpacity style={styles.alertDetailsBackgroundWrapper} onPress={onClose} />

          <ScrollView
            style={[styles.alertDetailsWrapper, { top: top + ALERT_HEIGHT }]}
            contentContainerStyle={styles.alertDetailsContainer}
          >
            {cards.map((c, i) => {
              const isLast = i + 1 >= cards.length

              return (
                <TouchableOpacity
                  key={c.creditCardId}
                  style={[cs(isRtl, cs(isLast, styles.alertDetailsRow, { borderBottomWidth: 0 }), commonStyles.rowReverse), {}]}
                  onPress={this.handleSelectCard(c.creditCardId)}
                >
                  <View style={{
                    justifyContent: 'center',
                  }}>
                    <Text style={[styles.alertDetailsText]}
                      numberOfLines={1}>{c.creditCardNickname}</Text>
                    {this.getMiddlePart(c)}
                  </View>
                  <Icon name={isRtl ? 'chevron-left' : 'chevron-right'} size={18} color={colors.blue8} />
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </Fragment>
      )
    }
}
