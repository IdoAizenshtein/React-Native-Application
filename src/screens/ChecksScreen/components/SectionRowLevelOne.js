import React from 'react'
import { DATA_ROW_HEIGHT } from '../ChecksStyles'
import AnimatedControlledRow
  from '../../../components/DataRow/AnimatedControlledRow'
import RowInnerLevelTwo from './RowInnerLevelTwo'

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

  render () {
    const { bankTrans, isRtl, isOpen, onItemToggle, account, onEditCategory } = this.props
    const { height, mainDesc } = this.state

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
        onToggle={onItemToggle}
        onUpdate={this.handleUpdate}
        onChangeMainDesc={this.handleChangeMainDesc}
      />
    )
  }
}
