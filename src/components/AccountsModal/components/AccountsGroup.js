import React, {Fragment, PureComponent} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import {combineStyles as cs, getCurrencyChar} from '../../../utils/func'
import AccountItem from './AccountItem'
import styles from '../AccountsModalStyles'

@withTranslation()
export default class AccountsGroup extends PureComponent {
    get isGroupChecked() {
        const {accounts, selectedIds, onlyILS, withoutRules} = this.props
        return (onlyILS) ? (accounts.filter(a => a.currency === 'ILS').every(a => selectedIds.includes(a.companyAccountId))) : ((withoutRules) ? accounts.every(a => selectedIds.includes(a.companyAccountId)) : accounts.filter(a => a._isUpdated).every(a => selectedIds.includes(a.companyAccountId)))
    }

    get isGroupDisabled() {
        const {isDisabled, accounts, selectedIds, onlyILS, withoutRules} = this.props
        if (onlyILS || withoutRules) {return false}
        return isDisabled ||
            !accounts.some(a => a._isUpdated) ||
            selectedIds.some(id => accounts.find(a => a.companyAccountId === id && !a._isUpdated))
    }

    isAccountDisabled(account) {
        const {isDisabled, accounts, selectedIds, onlyILS, withoutRules} = this.props
        if (onlyILS || withoutRules) {return false}
        if (isDisabled) {return true}
        const isSelected = selectedIds.includes(account.companyAccountId)
        if (selectedIds.some(id => accounts.find(a => a.companyAccountId === id && !a._isUpdated)) && !isSelected) {return true}
        if (selectedIds.some(id => accounts.find(a => a.companyAccountId === id && a._isUpdated)) && !account._isUpdated) {return true}
        return false
    }

    handleSelectGroup = () => {
        const {currency, accounts, onSelectGroup, selectedIds, onlyILS, withoutRules} = this.props
        if (onlyILS || withoutRules) {
            const accountsToSelect = accounts.map(a => a.companyAccountId)
            if (selectedIds.length === accountsToSelect.length) {return onSelectGroup(null, [])}
            onSelectGroup(currency, accounts.map(a => a.companyAccountId))
            return
        }
        if (this.isGroupDisabled) {return}
        const accountsToSelect = accounts.filter(a => a._isUpdated).map(a => a.companyAccountId)
        if (selectedIds.length === accountsToSelect.length) {return onSelectGroup(null, [])}
        onSelectGroup(currency, accounts.filter(a => a._isUpdated).map(a => a.companyAccountId))
    };

    handleSelectAccount = (accountId) => {
        const {currency, onSelectAccount} = this.props
        onSelectAccount(currency, accountId)
    };

    render() {
        const {t, currency, accounts, selectedIds, isRtl} = this.props
        return (
            <Fragment>
                <TouchableOpacity
                    style={cs(isRtl, cs(this.isGroupChecked, [styles.item, styles.group], styles.itemChecked), styles.itemRtl)}
                    onPress={this.handleSelectGroup}
                >
                    <Text style={styles.groupTitle}>
                        {t('bankAccount:allAccounts')} {`(${getCurrencyChar(currency)})`}
                    </Text>
                </TouchableOpacity>

                <View style={cs(isRtl, styles.itemsWrapper, styles.itemsWrapperRtl)}>
                    {accounts.map(a => (
                        <AccountItem
                            key={a.companyAccountId}
                            isRtl={isRtl}
                            isDisabled={this.isAccountDisabled(a)}
                            isChecked={selectedIds.includes(a.companyAccountId)}
                            account={a}
                            onSelect={this.handleSelectAccount}
                        />
                    ))}
                </View>

            </Fragment>
        )
    }
}
