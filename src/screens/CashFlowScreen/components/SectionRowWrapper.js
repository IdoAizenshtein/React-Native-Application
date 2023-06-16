import React, { Fragment, PureComponent } from 'react'
import SectionRowLevelOne from './SectionRowLevelOne'

export default class SectionRowWrapper extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
    }
  }

  render () {
    const {
      isRtl,
      getAccountCflTransType,
      account,
      accounts,
      isOpen,
      onItemToggle,
      updateRow,
      removeItem,
      nigreret,
      handlePopRowEditsModal,
      cashFlowDetailsDataItem,
      companyId,
      queryStatus,
    } = this.props

    return (
      <Fragment>
        <SectionRowLevelOne
          companyId={companyId}
          queryStatus={queryStatus}
          handlePopRowEditsModal={handlePopRowEditsModal}
          nigreret={nigreret}
          removeItem={removeItem}
          accounts={accounts}
          isOpen={isOpen}
          isRtl={isRtl}
          cashFlowDetailsDataItem={cashFlowDetailsDataItem}
          account={account}
          onItemToggle={onItemToggle}
          getAccountCflTransType={getAccountCflTransType}
          updateRow={updateRow}
        />
      </Fragment>
    )
  }
}
