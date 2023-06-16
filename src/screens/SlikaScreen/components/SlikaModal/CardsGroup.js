import React, { Fragment, PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { combineStyles as cs } from '../../../../utils/func'
import accountModalStyles
  from '../../../../components/AccountsModal/AccountsModalStyles'
import styles from './SlikaModalStyles'
import CardItem from './CardItem'

export default class CardsGroup extends PureComponent {
  get isGroupChecked () {
    const { cards, selectedCards } = this.props
    return cards.every(
      card => selectedCards.some(c => c.solekId === card.solekId))
  }

  isChecked = (cardId) => {
    return this.props.selectedCards.some(c => c.solekId === cardId)
  }

  handleSelectGroup = () => {
    const { cards, onSelectGroup } = this.props
    onSelectGroup(cards.map(c => c.solekId))
  }

  render () {
    const { account, cards, isRtl, onSelectItem } = this.props
    return (
      <Fragment>
        <TouchableOpacity
          style={cs(isRtl,
            cs(this.isGroupChecked, [styles.item, accountModalStyles.group],
              accountModalStyles.itemChecked), styles.itemRtl)}
          onPress={this.handleSelectGroup}
        >
          <Text
            style={accountModalStyles.groupTitle}>{account.accountNickname}</Text>
        </TouchableOpacity>

        {cards.length ? (
          <View style={cs(isRtl, accountModalStyles.itemsWrapper,
            accountModalStyles.itemsWrapperRtl)}>
            {cards.map(card => (
              <CardItem
                key={card.solekId}
                account={account}
                card={card}
                isRtl={isRtl}
                isChecked={this.isChecked(card.solekId)}
                onSelect={onSelectItem}
              />
            ))}
          </View>
        ) : null}
      </Fragment>
    )
  }
}
