import React, { Fragment, PureComponent } from 'react'
import CheckRow from './CheckRow'

export default class SectionRowWrapper extends PureComponent {
  render () {
    const {
      isRtl,
      companyId,
      onRefresh,
      deleteOperationApi,
      isOpen,
      screenSwitchState,
      item,
      accounts,
      onItemToggle,
    } = this.props
    return (
      <Fragment>
        <CheckRow
          onRefresh={onRefresh}
          deleteOperationApi={deleteOperationApi}
          screenSwitchState={screenSwitchState}
          isRtl={isRtl}
          item={item}
          companyId={companyId}
          isOpen={isOpen}
          accounts={accounts}
          onItemToggle={onItemToggle}
        />
      </Fragment>
    )
  }
}
