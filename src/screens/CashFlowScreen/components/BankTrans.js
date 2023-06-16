import React, { Fragment, PureComponent } from 'react'
import { Text, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import styles from '../CashFlowStyles'
import Row from './Row'

@withTranslation()
export default class BankTrans extends PureComponent {
  // handleItemToggle = (index) => () => {
  //   const { currentOpenItemIndex } = this.state
  //   const { screenSwitchState } = this.props
  //
  //   this.setState({ currentOpenItemIndex: currentOpenItemIndex === index ? null : index })
  //
  //   if (currentOpenItemIndex === null || currentOpenItemIndex === index) return
  //   if (screenSwitchState) this.handleScrollTo(index)
  // }
  // handleScrollTo = (index) => {
  //   if (!this.listRef) return
  //
  //   if (this.listRef && this.listRef.props.scrollToPosition) {
  //     const offset = parseInt(index * (DATA_ROW_HEIGHT + 1) + this.props.headerMaxHeight - 20, 10)
  //     this.listRef.props.scrollToPosition(0, offset)
  //   }
  // }

  constructor (props) {
    super(props)

    this.state = {
      currentOpenItemIndex: null,
    }
  }

  UNSAFE_componentWillReceiveProps ({ screenSwitchState }) {
    if (this.props.screenSwitchState === screenSwitchState) {return}
    this.setState({ currentOpenItemIndex: null })
  }

  render () {
    const { isRtl, data, t, parentIsOpen, nigreret, openBottomSheet } = this.props
    const { currentOpenItemIndex } = this.state

    if (!data || !data.length) {
      return (
        <View style={[styles.dataRow, styles.dataRowLevel2]}>
          {parentIsOpen && (<Text style={styles.noTransactions}>{t(
            'bankAccount:noTransactions')}</Text>)}
        </View>
      )
    }
    return data.map(cashFlowDetailsData => (
      <Fragment key={cashFlowDetailsData.transId}>
        <Row
          queryStatus={null}
          isOpen={cashFlowDetailsData.transId === currentOpenItemIndex}
          isRtl={isRtl}
          nigreret={nigreret}
          cashFlowDetailsDataItem={cashFlowDetailsData}
          onToggle={openBottomSheet(cashFlowDetailsData)}
        />
        <View style={[styles.dataRowSeparator, { flex: 0 }]}/>
      </Fragment>),
    )

    // return data.map((cashFlowDetailsData, idx) => (
    //   <SectionRowWrapper
    //     companyId={companyId}
    //     handlePopRowEditsModal={handlePopRowEditsModal}
    //     nigreret={nigreret}
    //     key={cashFlowDetailsData.transId}
    //     removeItem={removeItem}
    //     accounts={accounts}
    //     getAccountCflTransType={categories}
    //     isOpen={cashFlowDetailsData.transId === currentOpenItemIndex}
    //     isRtl={isRtl}
    //     cashFlowDetailsDataItem={cashFlowDetailsData}
    //     account={accounts.find(a => a.companyAccountId === cashFlowDetailsData.companyAccountId)}
    //     onItemToggle={this.handleItemToggle(cashFlowDetailsData.transId)}
    //     updateRow={updateRow}
    //   />),
    // )
  }
}
