import React, { PureComponent } from 'react'
import { Text, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import styles from '../CreditCardsStyles'
import CreditCardDetailsRow from './CreditCardDetailsRow'

@withTranslation()
export default class CreditCardDataDetails extends PureComponent {
  render () {
    const { data, t, parentIsOpen, isRtl, account, accounts, onUpdateCardTrans, onEditCategory, onEdit, companyId } = this.props
    if (!data || !data.length) {
      return (
        <View style={[styles.dataRowWrapper, styles.dataRowLevel2]}>
          <Text style={styles.noTransactions}>{t('creditCards:noTransactions')}</Text>
        </View>
      )
    }
    return data.map(trans => (
      <CreditCardDetailsRow
        onEdit={onEdit}
        companyId={companyId}
        t={t}
        isRtl={isRtl}
        key={trans.ccardTransId}
        parentIsOpen={parentIsOpen}
        cycleDate={trans.cycleDateParent}
        data={trans}
        account={account || accounts.find(a => a.companyAccountId === trans.companyAccountId)}
        onUpdateCardTrans={onUpdateCardTrans}
        onEditCategory={onEditCategory}
      />
    ))
  }
}
