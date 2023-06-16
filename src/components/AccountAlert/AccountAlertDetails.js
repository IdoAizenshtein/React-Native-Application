import React, { Fragment, PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import moment from 'moment'
import { withTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {
  combineStyles as cs,
  getCurrencyChar,
  getFormattedValueArray,
} from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles, { ALERT_HEIGHT } from './AccountAlertStyles'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class AccountAlertDetails extends PureComponent {
  handleSelectAccount = (id) => () => this.props.onSelectAccount(id)

  render () {
    const { t, isRtl, top, accounts, onClose, alertState } = this.props
    let isAccountNotUpdated = false
    if (alertState && alertState.isAccountNotUpdated) {
      isAccountNotUpdated = alertState.isAccountNotUpdated
    }

    return (
      <Fragment>
        <TouchableOpacity style={styles.alertDetailsBackgroundWrapper}
                          onPress={onClose}/>

        <ScrollView
          style={[styles.alertDetailsWrapper, { top: top + ALERT_HEIGHT }]}
          contentContainerStyle={styles.alertDetailsContainer}
        >
          {accounts.map((a, i) => {
            const isLast = i + 1 >= accounts.length
            const value = getFormattedValueArray(a.accountBalance)

            return (
              <TouchableOpacity
                key={a.companyAccountId}
                style={cs(isRtl,
                  cs(isLast, styles.alertDetailsRow, { borderBottomWidth: 0 }),
                  commonStyles.rowReverse)}
                onPress={this.handleSelectAccount(a.companyAccountId)}
              >
                <Text style={styles.alertDetailsText}
                      numberOfLines={1}>{a.accountNickname}</Text>
                {isAccountNotUpdated
                  ? (
                    <Text style={[
                      styles.alertAdditionalText,
                      { color: colors.red2 }]}>
                      {t(
                        'bankAccount:lastUpdatedXDaysAgo',
                        {
                          days: moment()
                            .diff(moment(a.balanceLastUpdatedDate), 'days'),
                        },
                      )}
                    </Text>
                  )
                  : <Text style={styles.alertValueText}
                          numberOfLines={1}>{getCurrencyChar(
                    a.currency)} {`${value[0]}.${value[1]}`}</Text>}
                <Icon name={isRtl ? 'chevron-left' : 'chevron-right'} size={18}
                      color={colors.blue8}/>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </Fragment>
    )
    }
}
