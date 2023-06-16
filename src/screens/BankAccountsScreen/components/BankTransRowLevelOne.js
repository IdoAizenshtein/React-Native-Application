import React, {Fragment} from 'react'
import {ActivityIndicator, Animated, Text, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import AppTimezone from 'src/utils/appTimezone'
import BankTrans from './BankTrans'
import {combineStyles as cs, getFormattedValueArray} from 'src/utils/func'
import AnimatedControlledRow from 'src/components/DataRow/AnimatedControlledRow'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import {DEFAULT_DATE_FORMAT} from 'src/constants/common'
import commonStyles from 'src/styles/styles'
import {colors} from 'src/styles/vars'
import styles, {DATA_ROW_HEIGHT} from '../BankAccountsStyles'
import {dateToFromNowDaily} from 'src/utils/date'

@withTranslation()
export default class BankTransRowLevelOne extends AnimatedControlledRow {
    static defaultProps = {onUpdateBankTrans: () => null};

    constructor(props) {
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
      }
    }

    getExpandedData () {
      const { onGetBankTrans, data } = this.props
      const { inProgress } = this.state
      if (inProgress) {return}
      this.setState({ inProgress: true })

      onGetBankTrans(data.transDate)
        .then(({ bankTransList }) => this.setState({ inProgress: false, expandedData: bankTransList }))
        .catch(() => this.setState({ inProgress: false }))
    }

    getDate = (timestamp) => {
      const { t } = this.props
      const dateFormat = AppTimezone.moment(timestamp).isSame(AppTimezone.moment(), 'year')
        ? 'DD/MM'
        : DEFAULT_DATE_FORMAT
      return dateToFromNowDaily(timestamp, t, dateFormat)
    };

    handleUpdateBankTrans = (newBankTrans) => {
      const { expandedData } = this.state
      const { onUpdateBankTrans } = this.props
      const oldIndex = expandedData.findIndex(t => t.bankTransId === newBankTrans.bankTransId)
      if (oldIndex < 0) {return}
      const newData = [...expandedData]
      newData[oldIndex] = { ...newData[oldIndex], ...newBankTrans }

      onUpdateBankTrans(newBankTrans)
      this.setState({ expandedData: newData, currentEditBankTrans: { ...newBankTrans }, categoriesModalIsOpen: false })

      // setTimeout(() => this.setState({ categoriesModalIsOpen: false }), 800)
    };

    handleSelectCategory = (category) => {
      const { currentEditBankTrans } = this.state
      if (!currentEditBankTrans || currentEditBankTrans.transTypeId === category.transTypeId) {return}

      const newBankTrans = {
        ...currentEditBankTrans,
        iconType: category.iconType,
        transTypeId: category.transTypeId,
        transTypeName: category.transTypeName,
      }

      this.setState({ currentEditBankTrans: { ...newBankTrans } })
      return this.handleUpdateBankTrans(newBankTrans)
    };

    handleCloseCategoriesModal = () => {
      this.setState({ categoriesModalIsOpen: false, currentEditBankTrans: null })
    };

    handleOpenCategoriesModal = (bankTransId) => () => {
      this.setState({ categoriesModalIsOpen: true, currentEditBankTrans: bankTransId })
    };

    render () {
      const {
        isOpen,
        isRtl,
        data,
        accounts,
        onItemToggle,
        companyId,
        onRemoveBankTransCategory,
        onCreateBankTransCategory,
        itraRed,
        currentOpenItemIndexInside,
        openBottomSheet,
      } = this.props
      const { height, inProgress, expandedData, categoriesModalIsOpen, currentEditBankTrans } = this.state
      const wrapperStyles = cs(isRtl, cs(isOpen, styles.dataRow, styles.dataRowActive), commonStyles.rowReverse)
      const itraStyles = cs((data.totalCredit < 0 || itraRed),
        cs(isOpen, styles.dataValue, { color: colors.white }),
        { color: colors.red2 },
      )
      const colorWhite = { color: colors.white }
      const zhut = getFormattedValueArray(data.zhut)
      const hova = getFormattedValueArray(-data.hova)
      const itra = getFormattedValueArray(data.itra)

      return (
        <Fragment>
          <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
            <TouchableOpacity onPress={onItemToggle}>
              <View style={wrapperStyles} onLayout={this.setMinHeight}>
                <View style={[{ flex: 1 }, commonStyles.column]}>
                  <Text style={[styles.dataValueWrapper, { flex: 0 }]}>
                    <Text
                      style={cs(isOpen, [styles.dataValue, styles.zhutValue], colorWhite)}>{zhut[0]}</Text>
                    <Text style={cs(isOpen, styles.fractionalPart, colorWhite)}>.{zhut[1]}</Text>
                  </Text>
                  <Text style={cs(isOpen, styles.transData, colorWhite)}>
                    {this.getDate(data.transDate)}
                  </Text>
                </View>

                <Text style={styles.dataValueWrapper}>
                  <Text
                    style={cs(isOpen, [styles.dataValue, styles.hovaValue], colorWhite)}>{hova[0]}</Text>
                  <Text style={cs(isOpen, styles.fractionalPart, colorWhite)}>.{hova[1]}</Text>
                </Text>

                <Text style={[styles.dataValueWrapper, { flex: 1, maxWidth: 90 }]}>
                  <Text style={itraStyles}>{itra[0]}</Text>
                  <Text style={cs(isOpen, styles.fractionalPart, { color: colors.white })}>.{itra[1]}</Text>
                </Text>
              </View>
            </TouchableOpacity>

            <View onLayout={this.setMaxHeight}>
              {inProgress
                ? <ActivityIndicator color="#999999" style={{ padding: 10 }} />
                : (
                  <BankTrans
                    currentOpenItemIndexInside={currentOpenItemIndexInside}
                    openBottomSheet={openBottomSheet}
                    isRtl={isRtl}
                    data={expandedData}
                    accounts={accounts}
                    parentIsOpen={isOpen}
                    onUpdateBankTrans={this.handleUpdateBankTrans}
                    onEditCategory={this.handleOpenCategoriesModal}
                  />
                )}
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
