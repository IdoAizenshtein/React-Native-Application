import React, { PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import Modal from 'src/components/Modal/Modal'
import Checker from 'src/components/Checker/Checker'
import accountModalStyles
  from 'src/components/AccountsModal/AccountsModalStyles'
import { colors } from 'src/styles/vars'
import { getCurrencyChar, sp } from 'src/utils/func'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'

export default class AccountModal extends PureComponent {
  handleChangeId = (accountId) => () => this.props.onChange(accountId)

  render () {
    const { onClose, selectedId, title, accounts } = this.props

    return (
      <Modal
        isOpen
        title={title}
        onRightPress={onClose}
        rightComponent={<Icon name="chevron-right" size={30}
                              color={colors.white}/>}
      >
        <ScrollView
          style={[
            accountModalStyles.modalBodyRtl,
            accountModalStyles.modalBodyRtl]}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          {accounts.map(account => {
            const wrapperStyle = [
              accountModalStyles.item,
              accountModalStyles.itemRtl]
            const isSelected = selectedId === account.companyAccountId
            if (isSelected) {wrapperStyle.push(accountModalStyles.itemChecked)}

            return (
              <View
                key={account.companyAccountId}
                style={[
                  accountModalStyles.itemsWrapper,
                  accountModalStyles.itemsWrapperRtl]}
              >
                <TouchableOpacity
                  style={wrapperStyle}
                  onPress={this.handleChangeId(account.companyAccountId)}
                >
                  <View style={accountModalStyles.checkerWrapper}>
                    <AccountIcon account={account}/>

                    {isSelected && (
                      <Checker
                        isChecked
                        hasBackground={false}
                        iconStyle={{ fontSize: sp(25) }}
                        isDisabled={false}
                      />
                    )}
                  </View>

                  <Text style={accountModalStyles.itemText}>
                    {`${account.accountNickname} (${getCurrencyChar(
                      account.currency)})`}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </ScrollView>
      </Modal>
    )
  }
}
