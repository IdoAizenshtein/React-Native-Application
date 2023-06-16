import React, { PureComponent } from 'react'
import { isEmpty, uniqueId } from 'lodash'
import { Text } from 'react-native'
import SlikaCardDetails from './SlikaCardDetails'
import commonStyles from 'src/styles/styles'

export default class SlikaDetailsWrapper extends PureComponent {
  get slikaCards () {
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

  getAccounts = (slika) => {
    const accounts = this.props.accounts.find(
      a => a.companyAccountId === slika.companyAccountId)
    return accounts || {}
  }

  render () {
    const slikaCards = this.slikaCards
    const { onOpenItemUpdateModal, onOpenItemRecoveryModal } = this.props

    if (isEmpty(slikaCards)) {
      return (
        <Text style={[commonStyles.textCenter, { marginVertical: 10 }]}>Slika
          not found</Text>
      )
    }

    return slikaCards.map(s => (
      <SlikaCardDetails
        key={uniqueId('slika')}
        account={this.getAccounts(s)}
        slika={s}
        onOpenItemUpdateModal={onOpenItemUpdateModal}
        onOpenItemRecoveryModal={onOpenItemRecoveryModal}
      />
    ))
  }
}
