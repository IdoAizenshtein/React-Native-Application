import React, { Fragment } from 'react'
import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native'
import AppTimezone from '../../../utils/appTimezone'
import { withTranslation } from 'react-i18next'
import BankTrans from './BankTrans'
import { combineStyles as cs, getFormattedValueArray } from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles, { DATA_ROW_HEIGHT } from '../BankAccountsStyles'
import { dateToFromNowDaily } from 'src/utils/date'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import AnimatedRow from 'src/components/DataRow/AnimatedRow'
import { colors } from 'src/styles/vars'

@withTranslation()
export default class BankTransRowToday extends AnimatedRow {
  static defaultProps = { onUpdateBankTrans: () => null }

  constructor (props) {
    super(props)
    this.initialHeight = DATA_ROW_HEIGHT
    this.maxHeight = this.initialHeight
    this.state = this.initialState
  }

  get initialState () {
    return {
      ...super.initialState,
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
      expandedData: this.props.data,
    }
  }

  handleUpdateBankTrans = (newBankTrans) => {
    const { expandedData } = this.state
    const { onUpdateBankTrans } = this.props
    const oldIndex = expandedData.findIndex(
      t => t.bankTransId === newBankTrans.bankTransId)
    if (oldIndex < 0) {return}
    const newData = [...expandedData]
    newData[oldIndex] = { ...newData[oldIndex], ...newBankTrans }

    onUpdateBankTrans(newBankTrans)
    this.setState({
      expandedData: newData,
      currentEditBankTrans: { ...newBankTrans },
      categoriesModalIsOpen: false,
    })
    // setTimeout(() => this.setState({ categoriesModalIsOpen: false }), 800)
  }

  handleSelectCategory = (category) => {
    const { currentEditBankTrans } = this.state
    if (!currentEditBankTrans || currentEditBankTrans.transTypeId ===
      category.transTypeId) {return}

    const newBankTrans = {
      ...currentEditBankTrans,
      iconType: category.iconType,
      transTypeId: category.transTypeId,
      transTypeName: category.transTypeName,
    }

    this.setState({ currentEditBankTrans: { ...newBankTrans } })
    return this.handleUpdateBankTrans(newBankTrans)
  }

  handleCloseCategoriesModal = () => {
    this.setState({
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
    })
  }

  handleOpenCategoriesModal = (bankTransId) => () => {
    this.setState({
      categoriesModalIsOpen: true,
      currentEditBankTrans: bankTransId,
    })
  }

  componentDidMount () {
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.data !== this.props.data) {
      const { isOpen } = this.state
      if (isOpen) {
        setTimeout(() => {
          this.fixRowHeightChild(this.maxHeight)
          this.setState({
            expandedData: nextProps.data,
            isOpen: false,
          })
        }, 20)
      }
    } else {
      this.setState({ expandedData: nextProps.data })
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
    // const { isOpen } = this.state
    // if (!isOpen) {
    //   setTimeout(() => {
    //     this.fixRowHeightChild(this.maxHeight)
    //   }, 20)
    // }
  }

  render () {
    const {
      t,
      isRtl,
      accounts,
      companyId,
      onRemoveBankTransCategory,
      onCreateBankTransCategory,
      accountAggregatedTodayTrans,
      currentOpenItemIndexInside,
      openBottomSheet,
    } = this.props
    const { height, expandedData, categoriesModalIsOpen, currentEditBankTrans, isOpen } = this.state

    const wrapperStyles = cs(isRtl,
      cs(isOpen, [styles.dataRow, commonStyles.bgWhite], styles.dataRowActive),
      commonStyles.rowReverse)
    const colorWhite = { color: colors.white }

    const zhut = getFormattedValueArray(accountAggregatedTodayTrans.zhutTotal)
    const hova = getFormattedValueArray(accountAggregatedTodayTrans.hovaTotal)
    const date = dateToFromNowDaily(accountAggregatedTodayTrans.transDate, t)
    const isTodayTrans = date && AppTimezone.moment()
      .diff(accountAggregatedTodayTrans.transDate, 'days') === 0

    return (
      <Fragment>
        <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
          <TouchableOpacity onPress={this.handleToggle}>
            <View style={wrapperStyles} onLayout={this.setMinHeight}>
              <View style={[{ flex: 1 }, commonStyles.column]}>
                <Text style={[styles.dataValueWrapper, { flex: 0 }]}>
                  <Text
                    style={cs(isOpen, [styles.dataValue, styles.zhutValue],
                      colorWhite)}>{zhut[0]}</Text>
                  <Text style={cs(isOpen, styles.fractionalPart,
                    colorWhite)}>.{zhut[1]}</Text>
                </Text>

                <Text
                  style={cs(isOpen, [styles.transData, commonStyles.boldFont],
                    colorWhite)}>
                  {date
                    ? `${date} ${isTodayTrans
                      ? `(${t('bankAccount:notFinal')})`
                      : ''}`
                    : `${t('calendar:today')} (${t('bankAccount:notFinal')})`}
                </Text>
              </View>

              <Text style={styles.dataValueWrapper}>
                <Text
                  style={cs(isOpen, [styles.dataValue, styles.hovaValue],
                    colorWhite)}>{hova[0]}</Text>
                <Text style={cs(isOpen, styles.fractionalPart,
                  colorWhite)}>.{hova[1]}</Text>
              </Text>

              <Text style={[
                styles.dataValueWrapper,
                {
                  flex: 1,
                  maxWidth: 90,
                }]}/>
            </View>
          </TouchableOpacity>

          <View onLayout={this.setMaxHeightAll}>
            <BankTrans
              currentOpenItemIndexInside={currentOpenItemIndexInside}
              openBottomSheet={openBottomSheet}
              disabledEdit
              isRtl={isRtl}
              data={expandedData}
              accounts={accounts}
              parentIsOpen={isOpen}
              onUpdateBankTrans={this.handleUpdateBankTrans}
              onEditCategory={this.handleOpenCategoriesModal}
            />
          </View>
        </Animated.View>

        {categoriesModalIsOpen && (
          <CategoriesModal
            isOpen
            isRtl={isRtl}
            companyId={companyId}
            bankTrans={currentEditBankTrans}
            onClose={this.handleCloseCategoriesModal}
            onUpdateBankTrans={this.handleUpdateBankTrans}
            onSelectCategory={this.handleSelectCategory}
            onCreateCategory={onCreateBankTransCategory}
            onRemoveCategory={onRemoveBankTransCategory}
          />
        )}
      </Fragment>
    )
  }
}
