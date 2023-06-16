import React from 'react'
import { DATA_ROW_HEIGHT } from '../BankAccountsStyles'
import AnimatedRow from '../../../components/DataRow/AnimatedRow'
import RowInnerLevelTwo from './RowInnerLevelTwo'

export default class BankTransRowLevelTwo extends AnimatedRow {
    static defaultProps = {
      onEditCategory: () => () => null,
      onUpdateBankTrans: () => null,
    };

    constructor (props) {
      super(props)

      this.initialHeight = DATA_ROW_HEIGHT
      this.maxHeight = this.initialHeight
      this.state = this.initialState
    }

    get initialState () {
      return {
        ...super.initialState,
        isEditing: false,
        mainDesc: this.props.bankTrans.mainDesc,
      }
    }

    handleStartEditing = () => this.setState({ isEditing: true });

    handleChangeMainDesc = mainDesc => this.setState({ mainDesc });

    handleCancelChangeMainDesc = () => {
      this.setState({
        mainDesc: this.props.bankTrans.mainDesc,
        isEditing: false,
      })
    };

    handleUpdate = () => {
      const { mainDesc } = this.state
      const { bankTrans, onUpdateBankTrans } = this.props
      this.setState({ isEditing: false })
      if (!mainDesc) {return this.handleChangeMainDesc(bankTrans.mainDesc)}
      onUpdateBankTrans({ ...bankTrans, mainDesc })
    };

    handleToggle () {
      super.handleToggle()
      if (this.state.isEditing) {this.handleCancelChangeMainDesc()}
    }

    UNSAFE_componentWillReceiveProps (nextProps) {
      const { parentIsOpen } = nextProps
      if (!parentIsOpen && this.state.isOpen) {this.handleToggle()}
    }

    render () {
      const { bankTrans, isRtl, account, onEditCategory, disabledEdit } = this.props
      const { height, isOpen, mainDesc, isEditing } = this.state

      return (
        <RowInnerLevelTwo
          disabledEdit={disabledEdit}
          height={height}
          isOpen={isOpen}
          isEditing={isEditing}
          mainDesc={mainDesc}
          bankTrans={bankTrans}
          isRtl={isRtl}
          account={account}
          onEditCategory={onEditCategory}
          onSetMinHeight={this.setMinHeight}
          onSetMaxHeight={this.setMaxHeight}
          onToggle={this.handleToggle}
          onUpdate={this.handleUpdate}
          onStartEdit={this.handleStartEditing}
          onChangeMainDesc={this.handleChangeMainDesc}
          onCancelChangeMainDesc={this.handleCancelChangeMainDesc}
        />
      )
    }
}
