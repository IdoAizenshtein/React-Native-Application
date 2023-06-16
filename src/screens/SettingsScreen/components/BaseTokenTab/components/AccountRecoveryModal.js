import React, { PureComponent } from 'react'
import { Image, ScrollView, Text, TouchableOpacity } from 'react-native'
import { withTranslation } from 'react-i18next'
import { Icon } from 'react-native-elements'
import Modal from 'src/components/Modal/Modal'
import styles from '../BaseTokenTabStyles'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class AccountRecoveryModal extends PureComponent {
  render () {
    const { t, onClose, account, onSubmit, tokenType } = this.props

    return (
      <Modal
        isOpen
        title={tokenType === 'SLIKA' ? t(
          'settings:bankAccountsTab:solekAccountRecovery') : t(
          'settings:bankAccountsTab:bankAccountRecovery')}
        onRightPress={onClose}
        rightComponent={<Icon name="chevron-right" size={30}
                              color={colors.white}/>}
      >
        <ScrollView
          style={styles.confirmModalBody}
          contentContainerStyle={styles.modalContainer1}
        >
          <Image style={styles.bucketIcon}
                 source={require('BiziboxUI/assets/bucket.png')}/>
          <Text style={styles.modalTitle1}>
            {
              (tokenType === 'ACCOUNT') ? t(
                'settings:bankAccountsTab:recoverAccountName',
                { accountName: account.accountNickname })
                : tokenType === 'SLIKA' ? t(
                'settings:bankAccountsTab:recoverSolekName',
                { accountName: account.solekDesc })
                : t('settings:bankAccountsTab:recoverCardName',
                  { accountName: account.creditCardNickname })
            }
          </Text>

          <Text style={styles.modalDesc1}>
            {(tokenType === 'ACCOUNT')
              ? t('settings:bankAccountsTab:recoverAccountDesc')
              : tokenType === 'SLIKA'
                ? t('settings:bankAccountsTab:recoverSolekDesc')
                : t('settings:bankAccountsTab:recoverCardDesc')
            }</Text>

          <TouchableOpacity style={styles.modalBtn} onPress={onSubmit}>
            <Text
              style={styles.modalBtnText}>{(tokenType === 'ACCOUNT' ||
              tokenType === 'SLIKA') ? t(
              'settings:bankAccountsTab:accountRecovery') : t(
              'settings:bankAccountsTab:cardRecovery')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalBtn} onPress={onClose}>
            <Text style={styles.modalBtnText}>{t('common:cancel')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    )
  }
}
