import React, { PureComponent } from 'react'
import { uniqueId } from 'lodash'
import { Text, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import styles from '../SlikaStyles'
import SlikaDetailsRow from './SlikaDetailsRow'

@withTranslation()
export default class SlikaDataDetails extends PureComponent {
  get data () {
    const { data } = this.props
    if (!data || !data.length) {return []}
    return data
      .map((item) => {
        return {
          ...item.total,
          date: item.date,
          total: item.total.transTotal,
          regularPaymentsTotal: item.total.regularPaymentsTotal,
          paymentsTotal: item.total.paymentsTotal,
          expectedPercent: item.total.expectedPercent,
          solekId: uniqueId('total_'),
        }
      })
  }

  render () {
    const { data, t, parentIsOpen, isRtl, account, navigation } = this.props
    if (!data || !data.length) {
      return (
        <View style={[styles.dataRowWrapper, styles.dataRowLevel2]}>
          <Text style={styles.noTransactions}>{t(
            'creditCards:noTransactions')}</Text>
        </View>
      )
    }

    return this.data.map(totals => (
      <SlikaDetailsRow
        navigation={navigation}
        account={account}
        isRtl={isRtl}
        key={totals.solekId}
        parentIsOpen={parentIsOpen}
        data={totals}
      />
    ))
  }
}
