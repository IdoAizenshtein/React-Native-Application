import React, { PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import Modal from 'src/components/Modal/Modal'
import CustomIcon from 'src/components/Icons/Fontello'
import tabStyles from '../../../BaseTokenTabStyles'
import styles from '../AddTokenModalStyles'
import commonStyles from 'src/styles/styles'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class SuccessModal extends PureComponent {
  render () {
    const { t, title, onClose } = this.props

    return (
      <Modal isOpen title={title}>
        <ScrollView
          style={styles.infoModalBody}
          contentContainerStyle={styles.infoModalContainer}
        >
          <View
            style={[
              commonStyles, {
                marginTop: 50,
                flexDirection: 'row',
                alignSelf: 'center',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }]}>
            <Text style={[styles.infoModalTitle]}>
              {t('settings:bankAccountsTab:excellent')}
            </Text>
            <CustomIcon name="ok" size={16} color={colors.blue42}/>
          </View>

          <Text style={styles.infoModalDesc}>
            {t('settings:bankAccountsTab:excellentDesc')}
          </Text>

          <TouchableOpacity style={tabStyles.modalBtn} onPress={onClose}>
            <Text style={tabStyles.modalBtnText}>{t(
              'settings:bankAccountsTab:login')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    )
  }
}
