import React from 'react'
import { DATA_ROW_HEIGHT } from '../CashFlowStyles'
import AnimatedControlledRow
  from '../../../components/DataRow/AnimatedControlledRow'
import BankTransRow from './BankTransRow'
import { Animated, Easing } from 'react-native'

export default class SectionRowLevelOne extends AnimatedControlledRow {
  static defaultProps = {
    onEditCategory: () => () => null,
    onUpdateBankTrans: () => null,
  }

  constructor (props) {
    super(props)

    this.initialHeight = DATA_ROW_HEIGHT
    this.maxHeight = this.initialHeight
    this.state = this.initialState
  }

  get initialState () {
    return {
      ...super.initialState,
      isOpen: this.props.isOpen,
    }
  }

  fixRowHeightChild = (heightVal) => {
    const { height } = this.state

    const initialValue = height.__getValue()
    height.setValue(initialValue)
    Animated.timing(height, {
      toValue: heightVal,
      duration: 10,
      easing: Easing.bounce,
      useNativeDriver: false,
    }).start()
  }

  setMaxHeightAll = (e) => {
    this.setMaxHeight(e)
    const { isOpen } = this.state
    if (isOpen) {
      setTimeout(() => {
        this.fixRowHeightChild(this.maxHeight + 55)
      }, 20)
    } else {
      setTimeout(() => {
        this.fixRowHeightChild(55)
      }, 20)
    }
  }

  render () {
    const { isRtl, isOpen, onItemToggle, account, accounts, getAccountCflTransType, updateRow, removeItem, nigreret, handlePopRowEditsModal, cashFlowDetailsDataItem, companyId, queryStatus } = this.props
    const { height } = this.state
    return (
      <BankTransRow
        queryStatus={queryStatus}
        companyId={companyId}
        handlePopRowEditsModal={handlePopRowEditsModal}
        nigreret={nigreret}
        removeItem={removeItem}
        height={height}
        accounts={accounts}
        isOpen={isOpen}
        isRtl={isRtl}
        cashFlowDetailsDataItem={cashFlowDetailsDataItem}
        account={account}
        getAccountCflTransType={getAccountCflTransType}
        onSetMinHeight={this.setMinHeight}
        onSetMaxHeight={this.setMaxHeightAll}
        onToggle={onItemToggle}
        onUpdate={updateRow}
      />
    )
  }
}
