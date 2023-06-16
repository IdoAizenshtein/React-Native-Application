import React, { PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { withTranslation } from 'react-i18next'
import { Icon } from 'react-native-elements'
import Modal from 'src/components/Modal/Modal'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import { BANK_CREDENTIALS_SCHEME } from 'src/constants/bank'
import styles from '../AddTokenModalStyles'
import { combineStyles as cs } from 'src/utils/func'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class BankModal extends PureComponent {
  handleChangeBankId = (bankId) => () => this.props.onChange(bankId)

  render () {
    const { t, onClose, selectedBankId } = this.props

    return (
      <Modal
        isOpen
        title={t('settings:bankAccountsTab:addBankAccount')}
        onRightPress={onClose}
        rightComponent={<Icon name="chevron-right" size={30}
                              color={colors.white}/>}
      >
        <ScrollView
          style={styles.banksModalBody}
          contentContainerStyle={styles.banksModalContainer}
        >
          {Object.keys(BANK_CREDENTIALS_SCHEME).map(bankId => {
            const isSelected = selectedBankId === bankId
            return (
              <TouchableOpacity
                key={bankId}
                style={cs(isSelected, styles.bankCardWrapper,
                  styles.bankCardSelected)}
                onPress={this.handleChangeBankId(bankId)}
              >
                <AccountIcon account={{ bankId }}/>
                <Text style={cs(isSelected, styles.bankNameText,
                  styles.bankNameTextSelected)}>
                  {t(`bankName:${bankId}`)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </Modal>
    )
  }
}
