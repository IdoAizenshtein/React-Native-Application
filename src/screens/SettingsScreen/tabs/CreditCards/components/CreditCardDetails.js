import React, { PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { withTranslation } from 'react-i18next'
import { colors } from 'src/styles/vars'
import { combineStyles as cs, getCurrencyChar } from 'src/utils/func'
import styles from '../../../components/BaseTokenTab/BaseTokenTabStyles'
import tabStyles from '../CreditCardsTabStyles'
import commonStyles from 'src/styles/styles'
import { isToday, isYesterday } from 'src/utils/date'
import CustomIcon from 'src/components/Icons/Fontello'
import AppTimezone from '../../../../../utils/appTimezone'
import { isNull } from 'lodash'

const numberFormat = new Intl.NumberFormat('he')

@withTranslation()
export default class CreditCardDetails extends PureComponent {
  handleOpenRecoveryModal = () => {
    const { onOpenItemRecoveryModal, creditCard } = this.props
    return onOpenItemRecoveryModal(creditCard)
  }

  handleOpenUpdateModal = () => {
    const { onOpenItemUpdateModal, creditCard } = this.props
    return onOpenItemUpdateModal(creditCard)
  }

  handleOpenCreditLimitModal = () => {
    const { onOpenCreditLimitModal, creditCard, account } = this.props
    return onOpenCreditLimitModal(creditCard, account)
  }

  render () {
    const { t, creditCard, account } = this.props
    const isDeleted = creditCard.deleted

    return (
      <View style={styles.accountDetailsWrapper}>
        <View style={styles.accountDetailsFirstRow}>
          {isDeleted
            ? (
              <TouchableOpacity onPress={this.handleOpenRecoveryModal}>
                <Text style={styles.accountLinkText}>{t(
                  'settings:bankAccountsTab:cardRecovery')}</Text>
              </TouchableOpacity>
            )
            : (
              <TouchableOpacity onPress={this.handleOpenUpdateModal}>
                <Icon name="chevron-left" size={24} color={colors.blue34}/>
              </TouchableOpacity>
            )}

          <Text
            style={cs(isDeleted,
              [styles.accountTitleText, commonStyles.semiBoldFont],
              styles.accountPaleText)}>
            {creditCard.creditCardNickname}
          </Text>
        </View>

        <View style={[commonStyles.row, commonStyles.spaceBetween]}>
          <View>
            <Text>{' '}</Text>

            {isNull(creditCard.creditLimit)
              ? creditCard.deleted
                ? null
                : (
                  <TouchableOpacity onPress={this.handleOpenCreditLimitModal}>
                    <Text style={styles.accountLinkText}>
                      {t('settings:creditCardsTab:updateCreditLimitManually')}
                    </Text>
                  </TouchableOpacity>
                )
              : (
                <Text style={cs(isDeleted, tabStyles.creditLimitText,
                  styles.accountPaleText)}>
                  <Text style={cs(isDeleted, commonStyles.lightFont,
                    styles.accountPaleText)}>
                    {getCurrencyChar(account.currency)}
                  </Text>
                  {' '}
                  {numberFormat.format(creditCard.creditLimit)}
                </Text>
              )}
          </View>

          <View>
            <Text
              style={cs(isDeleted,
                [styles.accountRegularText, commonStyles.textRight],
                styles.accountPaleText)}>
              {account.accountNickname} {' | '} {`${creditCard.cycleDay} ${t(
              'creditCards:perMonth')}`}
            </Text>

            <View style={{
              flexDirection: 'row-reverse',
            }}>
              {(creditCard.isUpdate === false) && (
                <View style={{
                  flexDirection: 'row-reverse',
                }}>
                  <CustomIcon name="exclamation-triangle" size={16}
                              color={colors.red2}/>
                  <View style={commonStyles.spaceDivider}/>
                </View>
              )}

              {!creditCard.deleted && (
                <Text
                  style={cs(isDeleted,
                    [styles.accountRegularText, commonStyles.textRight],
                    styles.accountPaleText)}>
                  {t('settings:creditCardsTab:lastUpdate')}

                  {' '}

                  {(creditCard.isUpdate === false) && (
                    <Text
                      style={[commonStyles.textRight, { color: colors.red6 }]}>
                      {(AppTimezone.moment()
                        .diff(
                          AppTimezone.moment(creditCard.balanceLastUpdatedDate),
                          'days') > 0)
                        ? AppTimezone.moment(creditCard.balanceLastUpdatedDate)
                          .format('DD/MM/YY')
                        : (
                          t('calendar:yesterday')
                        )}
                    </Text>
                  )}

                  {creditCard.isUpdate && (
                    <Text
                      style={[
                        commonStyles.boldFont,
                        commonStyles.textRight,
                        { color: colors.green4 }]}>
                      {isToday(creditCard.balanceLastUpdatedDate) ? t(
                        'calendar:today') : (isYesterday(
                        creditCard.balanceLastUpdatedDate) ? t(
                        'calendar:yesterday') : t(
                        'settings:creditCardsTab:notUpdated'))}
                    </Text>
                  )}
                </Text>
              )}
            </View>

          </View>
        </View>
      </View>
    )
  }
}
