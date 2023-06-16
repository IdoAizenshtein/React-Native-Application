import React from 'react'
import { DATA_ROW_HEIGHT } from '../ChecksStyles'
import AnimatedRow from '../../../components/DataRow/AnimatedRow'
import RowInnerLevelTwo from './RowInnerLevelTwo'

export default class BankTransRowLevelTwo extends AnimatedRow {
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
      mainDesc: this.props.bankTrans.mainDesc,
    }
  }

  handleChangeMainDesc = (mainDesc) => this.setState({ mainDesc })

  handleUpdate = () => {
    const { mainDesc } = this.state
    const { bankTrans, onUpdateBankTrans } = this.props

    if (!mainDesc) {return this.handleChangeMainDesc(bankTrans.mainDesc)}
    onUpdateBankTrans({
      ...bankTrans,
      mainDesc,
    })
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { parentIsOpen } = nextProps
    if (!parentIsOpen && this.state.isOpen) {this.handleToggle()}
  }

  render () {
    const { bankTrans, isRtl, account, onEditCategory } = this.props
    const { height, isOpen, mainDesc } = this.state

    return (
      <RowInnerLevelTwo
        height={height}
        isOpen={isOpen}
        mainDesc={mainDesc}
        bankTrans={bankTrans}
        isRtl={isRtl}
        account={account}
        onEditCategory={onEditCategory}
        onSetMinHeight={this.setMinHeight}
        onSetMaxHeight={this.setMaxHeight}
        onToggle={this.handleToggle}
        onUpdate={this.handleUpdate}
        onChangeMainDesc={this.handleChangeMainDesc}
      />
    )
  }
}
