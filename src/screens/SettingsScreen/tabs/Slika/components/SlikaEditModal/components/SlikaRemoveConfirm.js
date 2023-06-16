import React, { PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { withTranslation } from 'react-i18next'
import { Icon } from 'react-native-elements'
import Modal from 'src/components/Modal/Modal'
import CustomIcon from 'src/components/Icons/Fontello'
import { colors } from 'src/styles/vars'
import styles from '../SlikaEditModalStyles'
import tabStyles
  from '../../../../../components/BaseTokenTab/BaseTokenTabStyles'

@withTranslation()
export default class SlikaRemoveConfirm extends PureComponent {
  render () {
    const { t, onClose, item, onSubmit } = this.props

    return (
      <Modal
        isOpen
        title={t('settings:bankAccountsTab:deletingSolekAccount')}
        onRightPress={onClose}
        rightComponent={<Icon name="chevron-right" size={30}
                              color={colors.white}/>}
      >
        <ScrollView
          style={styles.confirmRemoveModalBody}
          contentContainerStyle={styles.confirmRemoveContainer}
        >
          <CustomIcon
            name="exclamation-triangle"
            size={45}
            style={{ marginBottom: 20 }}
            color={colors.red2}
          />

          <Text style={styles.confirmRemoveTitle1}>
            {t('settings:slikaTab:deleteSlikaName',
              { tokenName: item.solekDesc.replace(/"/g, '') })}
          </Text>

          <Text style={styles.confirmRemoveDesc1}>{t(
            'settings:slikaTab:deleteSlikaDesc')}</Text>

          <TouchableOpacity style={tabStyles.modalBtn} onPress={onClose}>
            <Text style={tabStyles.modalBtnText}>{t('common:cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={onSubmit}>
            <Text style={tabStyles.modalLinkText}>{t(
              'settings:slikaTab:deleteSlika')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </Modal>
    )
  }
}
