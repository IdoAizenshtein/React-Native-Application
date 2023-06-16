import React, {PureComponent} from 'react'
import {withTranslation} from 'react-i18next'
import BaseTokenTab from '../../components/BaseTokenTab/BaseTokenTab'
import TokenDetailsWrapper from './components/TokenDetailsWrapper'
import {
    accountDeletedCflApi,
    accountSettingCflApi,
    creditCardCflApi,
    setAccountNameCflApi,
    setPrimaryAccountCflApi,
} from 'src/api'
import AccountEditModal from './components/AccountEditModal/AccountEditModal'

@withTranslation()
export default class AccountsTab extends PureComponent {
    getAccounts = () => {
        const {currentCompany} = this.props
        const {companyId} = currentCompany

        return accountSettingCflApi.post({body: {uuid: companyId}})
            .then((accounts) => accounts.accounts)
    }
    getCreditCards = () => {
        const {currentCompany} = this.props
        const {companyId} = currentCompany

        return accountSettingCflApi.post({body: {uuid: companyId}})
            .then((accounts) => {
                this.setState({accounts: accounts.accounts})
                return creditCardCflApi.post({
                    body: accounts.accounts.map(a => ({uuid: a.companyAccountId})),
                })
            })
    }
    getDeletedAccounts = (tokenIds) => {
        const {currentCompany} = this.props
        const {companyId} = currentCompany

        return accountDeletedCflApi.post({
            body: {
                companyId,
                tokenIds,
            },
        })
    }

    handleUpdateAccount = ({item, accountNickname, isPrimary}) => {
        const {currentCompany} = this.props

        const tasks = []

        if (accountNickname && item.accountNickname !== accountNickname) {
            tasks.push(setAccountNameCflApi.post({
                body: {
                    companyAccountId: item.companyAccountId,
                    nickName: accountNickname,
                },
            }))
        }

        if (item.primaryAccount !== isPrimary) {
            tasks.push(setPrimaryAccountCflApi.post({
                body: {
                    companyAccountId: item.companyAccountId,
                    companyId: currentCompany.companyId,
                },
            }))
        }

        return Promise.all(tasks).finally(this.getData)
    }

    render() {
        const {
            t,
            currentCompany,
            navigation,
            handleSetTab,
            paramsLinkAddCard,
            exampleCompany,
            deleteParamsLinkAddCard,
        } = this.props

        return (
            <BaseTokenTab
                deleteParamsLinkAddCard={deleteParamsLinkAddCard}
                exampleCompany={exampleCompany}
                paramsLinkAddCard={paramsLinkAddCard}
                handleSetTab={handleSetTab}
                navigation={navigation}
                tokenType="ACCOUNT"
                title={t('settings:bankAccountsTab:addBankAccount')}
                currentCompany={currentCompany}
                ItemDetailsComponent={TokenDetailsWrapper}
                ItemEditComponent={AccountEditModal}
                getItems={this.getAccounts}
                getCreditCards={this.getCreditCards}
                getDeletedItems={this.getDeletedAccounts}
                onUpdateItem={this.handleUpdateAccount}
            />
        )
    }
}
