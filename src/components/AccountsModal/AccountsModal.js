import React, { Fragment, PureComponent } from 'react'
import { ScrollView } from 'react-native'
import { withTranslation } from 'react-i18next'
import { Divider } from 'react-native-elements'
import Modal from '../Modal/Modal'
import AccountsGroup from './components/AccountsGroup'
import { combineStyles as cs } from 'src/utils/func'
import styles from './AccountsModalStyles'
import AccountItem from './components/AccountItem'
import { CURRENCIES } from 'src/constants/common'
import { getAccountIdForSelection } from 'src/utils/account'

@withTranslation()
export default class AccountsModal extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      selectedGroup: props.selectedGroup,
      selectedAccountIds: props.selectedAccountIds,
    }
  }

  handleSelectAccountOfGroup = (currency, id) => {
    const { selectedAccountIds, selectedGroup } = this.state
    const selected = getAccountIdForSelection(currency, id, selectedAccountIds,
      selectedGroup)
    this.setState({ ...selected })
  }

    handleSelectGroup = (currency, accountIds) => {
      this.setState({
        selectedAccountIds: accountIds,
        selectedGroup: currency,
      })
    };

  handleApply = () => {
    const { onSubmit, onSelectAccounts } = this.props
    const { selectedGroup, selectedAccountIds } = this.state

    if (selectedAccountIds.length > 0) {
      onSelectAccounts(selectedGroup, selectedAccountIds, onSubmit)
    }
  }

  render () {
    const {
      t,
      isRtl,
      isOpen,
      accountGroups,
      onClose,
      onlyILS,
      withoutRules,
      notGrouped,
      accounts,
      onSelectAccounts,
    } = this.props
    const { selectedAccountIds, selectedGroup } = this.state

    const currencies = accountGroups
      ? onlyILS ? [CURRENCIES.ILS] : Object.keys(accountGroups)
      : []

    return (
      <Modal
        isOpen={isOpen}
        onLeftPress={onClose}
        activeOpacity={selectedAccountIds.length === 0}
        onRightPress={this.handleApply}
        leftText={t('common:cancel')}
        rightText={t('common:apply')}
        title={t('bankAccount:filterBankAccounts')}
      >
        <ScrollView
          style={cs(isRtl, styles.modalBody, styles.modalBodyRtl)}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          {!notGrouped && currencies.map((currency, i) => (
            <Fragment key={currency}>
              <AccountsGroup
                withoutRules={withoutRules}
                onlyILS={onlyILS}
                hasPadding={currencies.length > 1}
                isRtl={isRtl}
                isDisabled={selectedGroup && selectedGroup !== currency}
                currency={currency}
                accounts={accountGroups[currency]}
                selectedIds={selectedAccountIds}
                onSelectGroup={this.handleSelectGroup}
                onSelectAccount={this.handleSelectAccountOfGroup}
              />
              {i + 1 < currencies.length &&
              <Divider style={cs(isRtl, styles.accountGroupsDivider,
                styles.accountGroupsDividerRtl)}/>}
            </Fragment>
          ))}

          {notGrouped && accounts.map(a => (
            <AccountItem
              key={a.companyAccountId}
              isRtl={isRtl}
              isDisabled={false}
              isChecked={selectedAccountIds[0].companyAccountId ===
              a.companyAccountId}
              account={a}
              onSelect={onSelectAccounts}
            />
          ))}
        </ScrollView>
      </Modal>
    )
    }
}
