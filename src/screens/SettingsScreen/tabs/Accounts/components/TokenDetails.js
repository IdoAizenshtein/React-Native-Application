import React, { PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import AppTimezone from '../../../../../utils/appTimezone'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { isEmpty } from 'lodash'
import { withTranslation } from 'react-i18next'
import { colors, fonts } from 'src/styles/vars'
import { combineStyles as cs, getCurrencyChar } from 'src/utils/func'
import { isToday, isYesterday } from 'src/utils/date'
import { DEFAULT_DATE_FORMAT } from 'src/constants/common'
import styles from '../../../components/BaseTokenTab/BaseTokenTabStyles'
import commonStyles from 'src/styles/styles'

@withTranslation()
export default class TokenDetails extends PureComponent {
  handleOpenAccountRecoveryModal = () => {
    const { onOpenAccountRecoveryModal, account } = this.props
    return onOpenAccountRecoveryModal(account)
  }

  handleOpenAccountUpdateModal = () => {
    const { onOpenAccountUpdateModal, account } = this.props
    return onOpenAccountUpdateModal(account)
  }

  handleGoToUsers = () => {
    const { handleSetTab } = this.props
    return handleSetTab('USERS_TAB')
  }

  handleGoToCards = () => {
    const { handleSetTab } = this.props
    return handleSetTab('CREDIT_CARDS_TAB')
  }

  render () {
    const { t, account, cards } = this.props
    const isDeleted = account.deleted
    const isPrimaryAccount = account.primaryAccount
    return (
      <View style={styles.accountDetailsWrapper}>
        <View style={styles.accountDetailsFirstRow}>
          {isDeleted
            ? (
              <TouchableOpacity onPress={this.handleOpenAccountRecoveryModal}>
                <Text
                  style={styles.accountLinkText}>{t(
                  'settings:bankAccountsTab:accountRecovery')}</Text>
              </TouchableOpacity>
            )
            : (
              <TouchableOpacity onPress={this.handleOpenAccountUpdateModal}>
                <Icon name="chevron-left" size={24} color={colors.blue34}/>
              </TouchableOpacity>
            )}

          <View style={{
            flexDirection: 'row',
          }}>
            <Text style={[
              cs(isDeleted, styles.accountTitleText, styles.accountPaleText)]}>
              {`(${getCurrencyChar(account.currency)})`}
            </Text>
            <Text style={[
              cs(isDeleted, styles.accountTitleText, styles.accountPaleText), {
                fontFamily: fonts.bold,
              }]}>
              {account.accountNickname}
            </Text>
            {isPrimaryAccount &&
            <Image style={{
              width: 20,
              height: 20,
              marginLeft: 3,
            }} source={require('BiziboxUI/assets/star-on.png')}/>}
          </View>
        </View>

        <View style={[commonStyles.row, commonStyles.spaceBetween]}>
          <View>
            <Text
              style={cs(isDeleted,
                [styles.accountRegularText, commonStyles.textCenter],
                styles.accountPaleText)}>
              {t('settings:bankAccountsTab:lastUpdate')}
            </Text>
            {isToday(account.balanceLastUpdatedDate)
              ? (
                <Text style={cs(isDeleted, styles.accountTodayText,
                  styles.accountPaleText)}>
                  {t('calendar:today')}
                </Text>
              )
              : isYesterday(account.balanceLastUpdatedDate)
                ? (
                  <Text
                    style={[
                      cs(isDeleted, styles.accountTodayText,
                        styles.accountPaleText), { color: colors.red2 }]}>
                    {t('calendar:yesterday')}
                  </Text>
                )
                : (
                  <Text style={cs(isDeleted, styles.accountDateText,
                    styles.accountPaleText)}>
                    {AppTimezone.moment(account.balanceLastUpdatedDate)
                      .format(DEFAULT_DATE_FORMAT)}
                  </Text>
                )}
          </View>

          <View>
            <Text
              style={cs(isDeleted,
                [styles.accountRegularText, commonStyles.textRight],
                styles.accountPaleText)}>
              {t('settings:bankAccountsTab:branchNumber',
                { number: account.bankSnifId })}
            </Text>

            <View style={[
              commonStyles.row,
              commonStyles.spaceBetween,
              commonStyles.alignItemsCenter]}>
              {(!isEmpty(account.privsList) &&
                !account.privsList.includes('Denied Access')) ? (
                <TouchableOpacity onPress={this.handleGoToUsers}>
                  <Text style={styles.accountLinkText}>
                    {(account.privsList.length > 1)
                      ? t('settings:bankAccountsTab:usersCount',
                        { count: account.privsList.length })
                      : account.privsList[0]}
                  </Text>
                </TouchableOpacity>
              ) : null}

              {(!isDeleted && account.creditCardNum !== 0) ? (
                <TouchableOpacity onPress={this.handleGoToCards}>
                  <Text style={[
                    styles.accountLinkText, {
                      paddingLeft: 5,
                    }]}>
                    {account.creditCardNum >= 2 &&
                    t('settings:bankAccountsTab:creditCardsNum',
                      { creditCardsNum: account.creditCardNum })}
                    {account.creditCardNum === 1 && cards && ('כרטיס ')}
                    {account.creditCardNum === 1 && cards && cards.find(
                      (card) => card.companyAccountId ===
                        account.companyAccountId) && (
                      cards.find((card) => card.companyAccountId ===
                        account.companyAccountId).creditCardNo
                    )}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    )
  }
}
