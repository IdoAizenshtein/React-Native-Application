import React, { PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { withTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Modal from 'src/components/Modal/Modal'
import tabStyles from '../../../BaseTokenTabStyles'
import styles from '../AddTokenModalStyles'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class BlockedModal extends PureComponent {
  render () {
    const { t, title, onClose, onOpenBankSite } = this.props

    return (
      <Modal
        isOpen
        title={title}
        rightText={t('common:closing')}
        onRightPress={onClose}
      >
        <ScrollView
          style={styles.infoModalBody}
          contentContainerStyle={styles.infoModalContainer}
        >
          <Icon
            name={'lock'}
            size={40}
            style={{
              marginBottom: 30,
              marginTop: 10,
            }}
            color={colors.blue8}
          />

          <Text style={styles.infoModalTitle}>
            {t('settings:bankAccountsTab:accountHasBlocked')}
          </Text>

          <Text style={styles.infoModalDesc}>
            {t('settings:bankAccountsTab:accountHasBlockedDesc')}
          </Text>

          <TouchableOpacity style={tabStyles.modalBtn} onPress={onOpenBankSite}>
            <Text style={tabStyles.modalBtnText}>{t(
              'settings:bankAccountsTab:goToBankSite')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    )
  }
}
