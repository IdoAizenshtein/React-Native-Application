import React, { PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { withTranslation } from 'react-i18next'
import Modal from 'src/components/Modal/Modal'
import CustomIcon from 'src/components/Icons/Fontello'
import tabStyles from '../../../BaseTokenTabStyles'
import styles from '../AddTokenModalStyles'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class WrongStatusModal extends PureComponent {
  render () {
    const { t, title, onSubmit, attemptsNumber } = this.props

    return (
      <Modal isOpen title={title}>
        <ScrollView
          style={styles.infoModalBody}
          contentContainerStyle={styles.infoModalContainer}
        >
          <CustomIcon
            name="exclamation-triangle"
            size={45}
            style={{
              marginBottom: 30,
              marginTop: 50,
            }}
            color={colors.yellow2}
          />

          <Text style={styles.infoModalTitle}>
            {t('settings:bankAccountsTab:failedToConnectToBank')}
          </Text>

          <Text style={styles.infoModalDesc}>
            {t('settings:bankAccountsTab:failedToConnectToBankDesc',
              { num: attemptsNumber })}
          </Text>

          <TouchableOpacity style={tabStyles.modalBtn} onPress={onSubmit}>
            <Text style={tabStyles.modalBtnText}>{t('common:tryAgain')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    )
  }
}
