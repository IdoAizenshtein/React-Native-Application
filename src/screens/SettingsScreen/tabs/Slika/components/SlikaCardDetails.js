import React, { PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { withTranslation } from 'react-i18next'
import { colors } from 'src/styles/vars'
import { combineStyles as cs } from 'src/utils/func'
import styles from '../../../components/BaseTokenTab/BaseTokenTabStyles'
import commonStyles from 'src/styles/styles'
import { isToday, isYesterday } from 'src/utils/date'

@withTranslation()
export default class SlikaCardDetails extends PureComponent {
  handleOpenRecoveryModal = () => {
    const { onOpenItemRecoveryModal, slika } = this.props

    return onOpenItemRecoveryModal(slika)
  }

  handleOpenUpdateModal = () => {
    const { onOpenItemUpdateModal, slika } = this.props
    return onOpenItemUpdateModal(slika)
  }

  render () {
    const { t, slika, account } = this.props
    const isDeleted = slika.deleted

    return (
      <View style={styles.accountDetailsWrapper}>
        <View style={styles.accountDetailsFirstRow}>
          {isDeleted
            ? (
              <TouchableOpacity onPress={this.handleOpenRecoveryModal}>
                <Text
                  style={styles.accountLinkText}>{t(
                  'settings:bankAccountsTab:solekRecovery')}</Text>
              </TouchableOpacity>
            )
            : (
              <TouchableOpacity onPress={this.handleOpenUpdateModal}>
                <Icon name="chevron-left" size={24} color={colors.blue34}/>
              </TouchableOpacity>
            )}

          <View style={{
            flexDirection: 'row-reverse',
            justifyContent: 'flex-end',
          }}>
            <Text
              style={[
                cs(isDeleted, styles.accountTitleText, styles.accountPaleText),
                commonStyles.semiBoldFont,
                {
                  // maxWidth: 140,
                }]}
              ellipsizeMode="tail"
              numberOfLines={1}
            >{slika.solekDesc}</Text>
            {/* <Text ellipsizeMode='tail' style={[cs(isDeleted, styles.accountTitleText, styles.accountPaleText), { */}
            {/* marginHorizontal: 5, */}
            {/* }]}>{'|'}</Text> */}
            {/* <Text ellipsizeMode='tail' */}
            {/* style={cs(isDeleted, styles.accountTitleText, styles.accountPaleText)}> */}
            {/* {`${slika.frequencyDay || 0} ${t('creditCards:perMonth')}`} */}
            {/* </Text> */}
          </View>

        </View>

        <View>
          <Text
            style={cs(isDeleted,
              [styles.accountRegularText, commonStyles.textRight],
              styles.accountPaleText)}>
            {account.accountNickname} {t(
            'settings:slikaTab:accountNumber')} {account.bankAccountId}
          </Text>

          {!slika.deleted && (
            <Text
              style={cs(isDeleted,
                [styles.accountRegularText, commonStyles.textRight],
                styles.accountPaleText)}>
              {t('settings:slikaTab:lastUpdate')}

              {' '}

              {isToday(slika.balanceLastUpdatedDate)
                ? (
                  <Text
                    style={[
                      commonStyles.boldFont,
                      commonStyles.textRight,
                      { color: colors.green4 }]}>
                    {t('calendar:today')}
                  </Text>
                )
                : isYesterday(slika.balanceLastUpdatedDate)
                  ? (
                    <Text
                      style={[
                        commonStyles.boldFont,
                        commonStyles.textRight,
                        { color: colors.green4 }]}>
                      {t('calendar:yesterday')}
                    </Text>
                  )
                  : (
                    <Text
                      style={[commonStyles.textRight, { color: colors.red6 }]}>
                      {t('settings:slikaTab:notUpdated')}
                    </Text>
                  )}
            </Text>
          )}
        </View>
      </View>
    )
  }
}
