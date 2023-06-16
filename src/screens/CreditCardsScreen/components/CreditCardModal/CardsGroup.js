import React, { Fragment, PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { combineStyles as cs } from '../../../../utils/func'
import accountModalStyles from '../../../../components/AccountsModal/AccountsModalStyles'
import styles from './CreditCardModalStyles'
import CardItem from './CardItem'

export default class CardsGroup extends PureComponent {
  get isGroupChecked () {
    const { creditCards, selectedCards } = this.props
    return creditCards.every(card => selectedCards.some(c => c.creditCardId === card.creditCardId))
  }

    isChecked = (creditCardId) => {
      return this.props.selectedCards.some(c => c.creditCardId === creditCardId)
    };

    handleSelectGroup = () => {
      const { creditCards, onSelectGroup } = this.props
      onSelectGroup(creditCards.map(c => c.creditCardId))
    };

    render () {
      const { account, creditCards, isRtl, onSelectItem } = this.props
      return (
        <Fragment>
          <TouchableOpacity
            style={cs(isRtl, cs(this.isGroupChecked, [styles.item, accountModalStyles.group], accountModalStyles.itemChecked), styles.itemRtl)}
            onPress={this.handleSelectGroup}
          >
            <Text style={accountModalStyles.groupTitle}>{account.accountNickname}</Text>
          </TouchableOpacity>

          {creditCards.length ? (
            <View style={cs(isRtl, accountModalStyles.itemsWrapper, accountModalStyles.itemsWrapperRtl)}>
              {creditCards.map(card => (
                <CardItem
                  key={card.creditCardId}
                  account={account}
                  card={card}
                  isRtl={isRtl}
                  isChecked={this.isChecked(card.creditCardId)}
                  onSelect={onSelectItem}
                />
              ))}
            </View>
          ) : null}
        </Fragment>
      )
    }
}
