import React, { PureComponent } from 'react'
import { isEmpty } from 'lodash'
import { Text } from 'react-native'
import CreditCardDetails from './CreditCardDetails'
import commonStyles from 'src/styles/styles'

export default class CreditCardDetailsWrapper extends PureComponent {
  get creditCards () {
    const { deletedItems, items, token, isShowRemovedItems } = this.props

    const filteredCards = isEmpty(items) ? [] : items.filter(
      c => c.token === token.token)
    const filteredDeletedCards = isEmpty(deletedItems)
      ? []
      : deletedItems.filter(c => c.token === token.token)
        .map(c => ({
          ...c,
          deleted: true,
        }))

    return isShowRemovedItems
      ? [...filteredCards, ...filteredDeletedCards]
      : [...filteredCards]
  }

  getAccount = (card) => {
    const account = this.props.accounts.find(
      a => a.companyAccountId === card.companyAccountId)
    return account || {}
  }

  render () {
    const creditCards = this.creditCards
    const { onOpenItemUpdateModal, onOpenItemRecoveryModal, onOpenCreditLimitModal } = this.props

    if (isEmpty(creditCards)) {
      return (
        <Text style={[commonStyles.textCenter, { marginVertical: 10 }]}>Credit
          cards not found</Text>
      )
    }

    return creditCards.map(c => (
      <CreditCardDetails
        key={c.creditCardId}
        account={this.getAccount(c)}
        creditCard={c}
        onOpenCreditLimitModal={onOpenCreditLimitModal}
        onOpenItemUpdateModal={onOpenItemUpdateModal}
        onOpenItemRecoveryModal={onOpenItemRecoveryModal}
      />
    ))
  }
}
