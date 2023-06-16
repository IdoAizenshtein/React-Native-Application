import React, { PureComponent } from 'react'
import { ScrollView } from 'react-native'
import { withTranslation } from 'react-i18next'
import { Icon } from 'react-native-elements'
import Modal from 'src/components/Modal/Modal'
import CompanyItem from './CompanyItem'
import { combineStyles as cs } from 'src/utils/func'
import styles from './CompaniesModalStyles'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class CompaniesModal extends PureComponent {
  render () {
    const {
      t,
      isRtl,
      isOpen,
      onClose,
      onSelect,
      companies,
      currentCompany,
    } = this.props

    return (
      <Modal
        isOpen={isOpen}
        title={t('settings:bankAccountsTab:companies')}
        onRightPress={onClose}
        rightComponent={<Icon name="chevron-right" size={30}
                              color={colors.white}/>}
      >
        <ScrollView
          style={cs(isRtl, styles.modalBody, styles.modalBodyRtl)}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          {companies.map(c => (
            <CompanyItem
              key={c.companyId}
              isRtl={isRtl}
              isChecked={c.companyId === currentCompany.companyId}
              company={c}
              onSelect={onSelect}
            />
          ))}
        </ScrollView>
      </Modal>
    )
  }
}
