import React, { Fragment, PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import BaseTokenTab from '../../components/BaseTokenTab/BaseTokenTab'
import CreditCardDetailsWrapper from './components/CreditCardDetailsWrapper'
import {
  accountSettingCflApi,
  creditCardCflApi,
  creditCardCflUpdateApi,
  getDeletedCreditCardsApi,
  updateCreditAccountApi,
} from 'src/api'
import CreditLimitModal from './components/CreditLimitModal/CreditLimitModal'
import CreditCardEditModal
  from './components/CreditCardEditModal/CreditCardEditModal'

@withTranslation()
export default class CreditCardsTab extends PureComponent {
  state = {
    accounts: [],
    setCreditLimitInProgress: false,
    creditLimitModalIsOpen: false,
    selectedCard: null,
    selectedAccount: null,
    isUpdate: false,
  }

  getCreditCards = () => {
    const { currentCompany } = this.props
    const { companyId } = currentCompany

    return accountSettingCflApi.post({ body: { uuid: companyId } })
      .then((accounts) => {
        this.setState({ accounts: accounts.accounts })
        return creditCardCflApi.post({
          body: accounts.accounts.map(a => ({ uuid: a.companyAccountId })),
        })
      })
  }

  getDeletedCreditCards = (tokenIds) => {
    const { currentCompany } = this.props
    const { companyId } = currentCompany

    return getDeletedCreditCardsApi.post({
      body: {
        companyId,
        tokens: tokenIds,
      },
    })
  }

  handleOpenCreditLimitModal = (creditCard, account) => {
    this.setState({
      creditLimitModalIsOpen: true,
      selectedCard: creditCard,
      selectedAccount: account,
    })
  }

  handleCloseCreditLimitModal = (update) => {
    if (update) {
      this.setState({
        selectedCard: null,
        selectedAccount: null,
        creditLimitModalIsOpen: false,
        setCreditLimitInProgress: false,
        isUpdate: true,
      })
      setTimeout(() => {
        this.setState({
          isUpdate: false,
        })
      }, 2000)
    } else {
      this.setState({
        selectedCard: null,
        selectedAccount: null,
        creditLimitModalIsOpen: false,
        setCreditLimitInProgress: false,
        isUpdate: false,
      })
    }
  }

  handleUpdateCreditLimit = (creditLimit) => {
    const { selectedCard, setCreditLimitInProgress } = this.state
    if (!selectedCard || setCreditLimitInProgress) {return}

    this.setState({
      setCreditLimitInProgress: true,
      isUpdate: false,
    })

    return creditCardCflUpdateApi.post({
      body: {
        companyAccountId: selectedCard.companyAccountId,
        creditCardId: selectedCard.creditCardId,
        creditLimit: Number(creditLimit),
      },
    })
      .then(() => this.handleCloseCreditLimitModal(true))
      .catch(() => this.setState({ setCreditLimitInProgress: false }))
  }

  renderCreditCardDetailsWrapper = ({ ...props }) => {
    return (
      <CreditCardDetailsWrapper
        onOpenCreditLimitModal={this.handleOpenCreditLimitModal}
        {...props}
      />
    )
  }

  handleUpdateCreditCard = ({ item, name, companyAccountId, creditLimit }) => {
    // const { currentCompany } = this.props

    return creditCardCflUpdateApi.post({
      body: {
        alertStatus: item.alertStatus,
        availableCredit: item.availableCredit,
        balanceLastUpdatedDate: item.balanceLastUpdatedDate,
        bankLoaded: item.bankLoaded,
        companyAccountId: companyAccountId,
        creditCardId: item.creditCardId,
        creditCardNickname: name,
        creditCardNo: item.creditCardNo,
        creditCardTypeId: item.creditCardTypeId,
        creditLimit: creditLimit ? Number(creditLimit) : creditLimit,
        cycleDay: item.cycleDay,
        dateCreated: item.dateCreated,
        isUpdate: item.isUpdate,
        oldestCycleDate: item.oldestCycleDate,
        primaryAccount: item.primaryAccount,
        token: item.token,
        usedCredit: item.usedCredit,
      },
    }).then(() => {
      if (item.companyAccountId !== companyAccountId) {
        updateCreditAccountApi.post({
          body: {
            companyAccountId: companyAccountId,
            creditCardId: item.creditCardId,
          },
        })
      }
    })
  }

  render () {
    const { t, currentCompany, navigation, paramsLinkAddCard, closeParent, isRtl, exampleCompany, deleteParamsLinkAddCard } = this.props
    const { accounts, creditLimitModalIsOpen, setCreditLimitInProgress, selectedAccount, isUpdate } = this.state

    return (
      <Fragment>
        <BaseTokenTab
            deleteParamsLinkAddCard={deleteParamsLinkAddCard}
          exampleCompany={exampleCompany}
          isRtl={isRtl}
          isUpdate={isUpdate}
          closeParent={closeParent}
          paramsLinkAddCard={paramsLinkAddCard}
          navigation={navigation}
          tokenType="CREDITCARD"
          title={t('settings:creditCardsTab:creditCards')}
          accounts={accounts}
          currentCompany={currentCompany}
          ItemDetailsComponent={this.renderCreditCardDetailsWrapper}
          ItemEditComponent={CreditCardEditModal}
          getItems={this.getCreditCards}
          getDeletedItems={this.getDeletedCreditCards}
          onUpdateItem={this.handleUpdateCreditCard}
        />

        {creditLimitModalIsOpen && (
          <CreditLimitModal
            currency={selectedAccount.currency}
            inProgress={setCreditLimitInProgress}
            onSubmit={this.handleUpdateCreditLimit}
            onClose={this.handleCloseCreditLimitModal}
          />
        )}
      </Fragment>
    )
  }
}
