import React, { PureComponent } from 'react'
import { isEmpty } from 'lodash'
import TokenDetails from './TokenDetails'

export default class TokenDetailsWrapper extends PureComponent {
  get accounts () {
    const { deletedItems, items, token, isShowRemovedItems } = this.props

    const filteredAccounts = isEmpty(items) ? [] : items.filter(
      a => a.token === token.token)
    const filteredDeletedAccounts = isEmpty(deletedItems)
      ? []
      : deletedItems.filter(a => a.token === token.token)
        .map(a => ({
          ...a,
          deleted: true,
        }))

    return isShowRemovedItems ? [
      ...filteredAccounts,
      ...filteredDeletedAccounts] : [...filteredAccounts]
  }

  render () {
    const accounts = this.accounts
    const { onOpenItemUpdateModal, onOpenItemRecoveryModal, handleSetTab, cards } = this.props

    if (isEmpty(accounts)) {
      return null
    }

    return accounts.map(a => (
      <TokenDetails
        cards={cards}
        handleSetTab={handleSetTab}
        key={a.companyAccountId}
        account={a}
        onOpenAccountUpdateModal={onOpenItemUpdateModal}
        onOpenAccountRecoveryModal={onOpenItemRecoveryModal}
      />
    ))
  }
}
