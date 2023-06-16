import React, { Fragment } from 'react'
import { ActivityIndicator, Animated, Text, TouchableOpacity, View } from 'react-native'
import { cloneDeep } from 'lodash'
import { withTranslation } from 'react-i18next'
import { combineStyles as cs, getCurrencyChar, getFormattedValueArray } from 'src/utils/func'
import AnimatedRow from 'src/components/DataRow/AnimatedRow'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import CreditCardDataDetails from './CreditCardDataDetails'
import commonStyles from 'src/styles/styles'
import styles, { DATA_ROW_HEIGHT } from '../CreditCardsStyles'
import { colors } from '../../../styles/vars'

@withTranslation()
export default class CreditCardAggregatedDataRow extends AnimatedRow {
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
      currentEditCardTrans: null,
    }
  }

  getExpandedData () {
    const { onGetDetails, data, section } = this.props
    const { inProgress } = this.state
    if (inProgress) {return}
    this.setState({ inProgress: true })

    onGetDetails([data.creditCardId], data.iskatHulNumber, section.month)
      .then((data) => {
        const dataAll = []
        data.forEach((item) => {
          item = this.reverseTransactions(item)
          item.transactions.forEach((item1) => {
            item1.cycleDateParent = item.cycleDate
            item1.cycleTotalParent = item.cycleTotal
            item1.iskatHulParent = item.iskatHul
            item1.iskatHulStrParent = item.iskatHulStr
            item1.notFinalParent = item.notFinal
            dataAll.push(item1)
          })
        })
        this.setState({
          inProgress: false,
          expandedData: dataAll || null,
        })
      })
      .catch(() => this.setState({ inProgress: false }))
  }

    reverseTransactions = (data) => {
      const newData = cloneDeep(data)
      newData.transactions.reverse()
      return newData
    };

    handleUpdateCardTrans = (newCardTrans) => {
      const { expandedData } = this.state
      const { onUpdateCardTrans } = this.props

      const oldIndex = expandedData.findIndex(t => t.ccardTransId === newCardTrans.ccardTransId)
      if (oldIndex < 0) {return}
      const newData = cloneDeep(expandedData)
      newData[oldIndex] = { ...newData[oldIndex], ...newCardTrans }

      onUpdateCardTrans(newCardTrans)

      this.setState({ expandedData: newData, currentEditCardTrans: { ...newCardTrans } })
      // setTimeout(() => this.setState({ categoriesModalIsOpen: false }), 800)
    };

    handleSelectCategory = (category) => {
      const { currentEditCardTrans } = this.state
      if (!currentEditCardTrans || currentEditCardTrans.transTypeId === category.transTypeId) {return}

      const newCardTrans = {
        ...currentEditCardTrans,
        iconType: category.iconType,
        transTypeId: category.transTypeId,
        transTypeName: category.transTypeName,
      }

      this.setState({ currentEditCardTrans: { ...newCardTrans } })
      return this.handleUpdateCardTrans(newCardTrans)
    };

    handleCloseCategoriesModal = () => {
      this.setState({ categoriesModalIsOpen: false, currentEditCardTrans: null })
    };

    handleOpenCategoriesModal = (newCardTrans) => () => {
      this.setState({ categoriesModalIsOpen: true, currentEditCardTrans: newCardTrans })
    };

    render () {
      const {
        data,
        t,
        isRtl,
        accounts,
        companyId,
        onCreateCardTransCategory,
        onRemoveCardTransCategory,
        onEdit,
      } = this.props
      const {
        isOpen,
        height,
        inProgress,
        expandedData,
        categoriesModalIsOpen,
        currentEditCardTrans,
      } = this.state

      const value = getFormattedValueArray(data.monthlyTotal)
      const dataWrapperStyle = cs(isOpen, styles.dataRowWrapper, { backgroundColor: colors.blue32 })

      return (
        <Fragment>
          <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
            <TouchableOpacity onPress={this.handleToggle}>
              <View style={dataWrapperStyle} onLayout={this.setMinHeight}>
                <Text style={[styles.dataRowValueText, {
                  flex: 32,
                  maxWidth: 110,
                }]}>
                  <Text
                    style={cs(isOpen, styles.dataValueText, commonStyles.textWhite)}>{getCurrencyChar(data.currency)}</Text>
                  <Text style={cs(isOpen, styles.dataValueText, commonStyles.textWhite)}>{value[0]}</Text>
                  <Text
                    style={cs(isOpen, styles.fractionalPart, commonStyles.textWhite)}>.{value[1]}</Text>
                </Text>
                <Text style={[cs(isOpen, styles.dataRowDateText, commonStyles.textWhite), {
                  flex: 65,
                }]}>
                  {data.creditCardNickname} {data.notFinal && `(${t('creditCards:notFinal')})`}
                </Text>
              </View>
            </TouchableOpacity>

            <View onLayout={this.setMaxHeight}>
              {inProgress
                ? <ActivityIndicator color="#999999" style={{ padding: 10 }} />
                : (
                  <CreditCardDataDetails
                    companyId={companyId}
                    onEdit={onEdit}
                    t={t}
                    isRtl={isRtl}
                    data={expandedData}
                    parentIsOpen={isOpen}
                    accounts={accounts}
                    onUpdateCardTrans={this.handleUpdateCardTrans}
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
              bankTrans={currentEditCardTrans}
              onClose={this.handleCloseCategoriesModal}
              onUpdateBankTrans={this.handleUpdateCardTrans}
              onSelectCategory={this.handleSelectCategory}
              onCreateCategory={onCreateCardTransCategory}
              onRemoveCategory={onRemoveCardTransCategory}
            />
          )}
        </Fragment>
      )
    }
}
