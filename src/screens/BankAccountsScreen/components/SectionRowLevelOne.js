import React from 'react'
import {DATA_ROW_HEIGHT} from '../BankAccountsStyles'
import AnimatedControlledRow from '../../../components/DataRow/AnimatedControlledRow'
import RowInnerLevelTwo from './RowInnerLevelTwo'
import {Animated, Easing} from 'react-native'

export default class SectionRowLevelOne extends AnimatedControlledRow {
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
        isOpen: this.props.isOpen,
        isEditing: false,
        mainDesc: this.props.bankTrans.mainDesc,
      }
    }

    handleStartEditing = () => this.setState({ isEditing: true });

    handleChangeMainDesc = (mainDesc) => this.setState({ mainDesc });

    handleCancelChangeMainDesc = () => {
      this.setState({
        mainDesc: this.props.bankTrans.mainDesc,
        isEditing: false,
      })
    };

    handleUpdate = () => {
      const { mainDesc } = this.state
      const { bankTrans, onUpdateBankTransText } = this.props

      this.setState({ isEditing: false })
      if (!mainDesc) {return this.handleChangeMainDesc(bankTrans.mainDesc)}
      onUpdateBankTransText({ ...bankTrans, mainDesc })
    };

    handleToggle () {
      this.props.onItemToggle()
      if (this.state.isEditing) {this.handleCancelChangeMainDesc()}
    }

    fixRowHeightChild = (heightVal) => {
        const {height} = this.state

        const initialValue = height.__getValue()
        height.setValue(initialValue)
        Animated.timing(height, {
            toValue: heightVal, duration: 10, easing: Easing.bounce, useNativeDriver: false,
        }).start()
    };

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
    };

    render () {
      const { bankTrans, isRtl, isOpen, account, onEditCategory, disabledEdit, queryStatus } = this.props
      const { height, mainDesc, isEditing } = this.state

      return (
        <RowInnerLevelTwo
          queryStatus={queryStatus}
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
          onSetMaxHeight={this.setMaxHeightAll}
          onToggle={this.handleToggle}
          onUpdate={this.handleUpdate}
          onStartEdit={this.handleStartEditing}
          onChangeMainDesc={this.handleChangeMainDesc}
          onCancelChangeMainDesc={this.handleCancelChangeMainDesc}
        />
      )
    }
}
