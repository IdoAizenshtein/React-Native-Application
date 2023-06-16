import React, { Fragment, PureComponent } from 'react'
import { Text, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import styles from '../ChecksStyles'
import BankTransRowLevelTwo from './BankTransRowLevelTwo'

@withTranslation()
export default class BankTrans extends PureComponent {
  static defaultProps = {
    onEditCategory: () => () => null,
    onUpdateBankTrans: () => null,
  }

  render () {
    const {
      isRtl,
      data,
      accounts,
      t,
      parentIsOpen,
      onEditCategory,
      onUpdateBankTrans,
    } = this.props

    if (!data || !data.length) {
      return (
        <View style={[styles.dataRow, styles.dataRowLevel2]}>
          <Text style={styles.noTransactions}>{t(
            'bankAccount:noTransactions')}</Text>
        </View>
      )
    }

    return data.map(bankTrans => (
      <Fragment key={bankTrans.bankTransId}>
        <BankTransRowLevelTwo
          isRtl={isRtl}
          parentIsOpen={parentIsOpen}
          bankTrans={bankTrans}
          account={accounts.find(
            a => a.companyAccountId === bankTrans.companyAccountId)}
          onEditCategory={onEditCategory}
          onUpdateBankTrans={onUpdateBankTrans}
        />

        <View style={[styles.dataRowSeparator, { flex: 0 }]}/>
      </Fragment>),
    )
  }
}
