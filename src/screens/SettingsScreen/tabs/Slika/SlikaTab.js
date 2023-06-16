import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import BaseTokenTab from '../../components/BaseTokenTab/BaseTokenTab'
import {
  accountSettingCflApi,
  getDeletedSolekSlikaApi,
  setSlikaDescApi,
  slikaCflApi,
  updateSolekAccountApi,
} from 'src/api'
import SlikaDetailsWrapper from './components/SlikaDetailsWrapper'
import SlikaEditModal from './components/SlikaEditModal/SlikaEditModal'

@withTranslation()
export default class SlikaTab extends PureComponent {
  state = { accounts: [] }

  getSlika = () => {
    const { currentCompany } = this.props
    const { companyId } = currentCompany

    return accountSettingCflApi.post({ body: { uuid: companyId } })
      .then((accounts) => {
        this.setState({ accounts: accounts.accounts })
        return slikaCflApi.post({
          body: accounts.accounts.map(a => ({ uuid: a.companyAccountId })),
        })
      })
      .then((data) => data.solekDetails)
  }

  getDeletedSlika = (tokenIds) => {
    const { currentCompany } = this.props
    const { companyId } = currentCompany

    return getDeletedSolekSlikaApi.post({
      body: {
        companyId,
        tokens: tokenIds,
      },
    })
  }

  handleUpdateSlika = ({ item, solekDesc, companyAccountId }) => {
    // const { currentCompany } = this.props
    return setSlikaDescApi.post({
      body: {
        companyAccountId: companyAccountId,
        solekDesc: solekDesc,
        solekNum: item.solekNum,
      },
    }).then(() => {
      if (item.companyAccountId !== companyAccountId) {
        updateSolekAccountApi.post({
          body: {
            'newCompanyAccountId': companyAccountId,
            'oldCompanyAccountId': item.companyAccountId,
            'solekNum': item.solekNum,
          },
        })
      }
    })
  }

  render () {
    const { t, currentCompany, navigation, paramsLinkAddCard, closeParent, isRtl, exampleCompany, deleteParamsLinkAddCard } = this.props
    const { accounts } = this.state

    return (
      <BaseTokenTab
        exampleCompany={exampleCompany}
        isRtl={isRtl}
        closeParent={closeParent}
        paramsLinkAddCard={paramsLinkAddCard}
        deleteParamsLinkAddCard={deleteParamsLinkAddCard}
        navigation={navigation}
        tokenType="SLIKA"
        title={t('settings:slikaTab:clearingAccounts')}
        accounts={accounts}
        currentCompany={currentCompany}
        ItemDetailsComponent={SlikaDetailsWrapper}
        ItemEditComponent={SlikaEditModal}
        getItems={this.getSlika}
        getDeletedItems={this.getDeletedSlika}
        onUpdateItem={this.handleUpdateSlika}
      />
    )
  }
}
