import React from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import AnimatedRow from 'src/components/DataRow/AnimatedRow'
import styles, { TOKEN_ROW_MIN_HEIGHT } from '../BaseTokenTabStyles'
import TokenStatus from './TokenStatus/TokenStatus'
import commonStyles from 'src/styles/styles'
import { colors } from 'src/styles/vars'
import { isEmpty } from 'lodash'

export default class TokenItem extends AnimatedRow {
  get initialState () {
    return {
      isOpen: false,
      height: new Animated.Value(TOKEN_ROW_MIN_HEIGHT),
    }
  }

  get accountsShow () {
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

  handleToggle () {
    const accountsShow = this.accountsShow
    if (!isEmpty(accountsShow)) {
      const { isOpen, height } = this.state
      const initialValue = isOpen
        ? this.maxHeight + this.minHeight
        : this.minHeight
      const finalValue = isOpen ? this.minHeight : this.maxHeight +
        this.minHeight

      this.setState({ isOpen: !isOpen })
      height.setValue(initialValue)
      Animated.timing(height, {
        toValue: finalValue,
        duration: 200,
        useNativeDriver: false,
      }).start()
    }
  }

  render () {
    const {
      token,
      accounts,
      items,
      deletedItems,
      isShowRemovedItems,
      ItemDetailsComponent,
      onOpenItemUpdateModal,
      onOpenItemRecoveryModal,
      onOpenTokenUpdateModal,
      handleSetTab,
      cards,
      tokenType,
      currentCompany,
      openAddToken,
    } = this.props
    const { isOpen, height } = this.state
    const accountsShow = this.accountsShow
    return (
      <Animated.View style={[styles.tokenRowWrapper, { height }]}>
        <TouchableOpacity style={{ height: TOKEN_ROW_MIN_HEIGHT }}
                          onPress={this.handleToggle}
                          activeOpacity={(!isEmpty(accountsShow)) ? 0.2 : 1}>
          <View style={styles.tokenItemWrapper} onLayout={this.setMinHeight}>
            <TokenStatus token={token} openAddToken={openAddToken}
                         onOpenTokenUpdateModal={onOpenTokenUpdateModal}
                         currentCompany={currentCompany}/>

            <View style={[styles.tokenItemLeftPart]}>
              {!isEmpty(accountsShow) && (
                <Icon
                  size={24}
                  color={colors.blue39}
                  name={isOpen ? 'chevron-up' : 'chevron-down'}
                />
              )}
              <View style={commonStyles.spaceDivider}/>
              <Text style={styles.tokenTitle}>{(token.tokenNickname ||
                '')}</Text>
              <View style={commonStyles.spaceDivider}/>
              <AccountIcon tokenType={tokenType}
                           account={{ bankId: token.websiteTargetTypeId }}/>
            </View>
          </View>
        </TouchableOpacity>

        <View onLayout={this.setMaxHeight}>
          <ItemDetailsComponent
            cards={cards}
            handleSetTab={handleSetTab}
            token={token}
            accounts={accounts}
            items={items}
            deletedItems={deletedItems}
            isShowRemovedItems={isShowRemovedItems}
            onOpenItemUpdateModal={onOpenItemUpdateModal}
            onOpenItemRecoveryModal={onOpenItemRecoveryModal}
          />
        </View>
      </Animated.View>
    )
  }
}
