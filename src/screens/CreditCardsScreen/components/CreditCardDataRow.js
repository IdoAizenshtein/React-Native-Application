import React, {Fragment} from 'react'
import {ActivityIndicator, Animated, Text, TouchableOpacity, View} from 'react-native'
import AppTimezone from '../../../utils/appTimezone'
import {cloneDeep} from 'lodash'
import {withTranslation} from 'react-i18next'
import {combineStyles as cs, getCurrencyChar, getFormattedValueArray, sp} from 'src/utils/func'
import AnimatedControlledRow from 'src/components/DataRow/AnimatedControlledRow'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import commonStyles from 'src/styles/styles'
import styles, {DATA_ROW_HEIGHT} from '../CreditCardsStyles'
import CreditCardDataDetails from './CreditCardDataDetails'
import {colors} from '../../../styles/vars'

@withTranslation()
export default class CreditCardDataRow extends AnimatedControlledRow {
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
    const { onGetDetails, data } = this.props
    const isEmptyData = data.sumMonthlyTotal === null || data.sumMonthlyTotal === 0
    if (!isEmptyData) {
      const { inProgress } = this.state
      if (inProgress) {return}
      this.setState({ inProgress: true })
      onGetDetails(data.cardDetails.map(c => c.creditCardId), data.cardDetails[0].monthlyTotal.iskatHulNumber, data.month)
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
        .catch(() => {
          this.setState({ inProgress: false })
        })
    }
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
        isOpen,
        data,
        t,
        onItemToggle,
        isRtl,
        account,
        companyId,
        onCreateCardTransCategory,
        onRemoveCardTransCategory,
        categoriesModalIsOpen,
        onEdit,
      } = this.props
      const { height, inProgress, expandedData, currentEditCardTrans } = this.state

      // const value = getFormattedValueArray(data.sumMonthlyTotal)
      const dataWrapperStyle = cs(isOpen, styles.dataRowWrapper, { backgroundColor: colors.blue32 })
      const isEmptyData = data.sumMonthlyTotal === null || data.sumMonthlyTotal === 0
      const iskatHul = isEmptyData ? null : data.cardDetails[0].monthlyTotal ? data.cardDetails[0].monthlyTotal.iskatHul : null
      const value = isEmptyData ? null : data.cardDetails[0].monthlyTotal ? getFormattedValueArray(data.cardDetails[0].monthlyTotal.total) : null

      return (
        <Fragment>
          <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
            <TouchableOpacity onPress={onItemToggle}>
              <View style={dataWrapperStyle} onLayout={this.setMinHeight}>
                <Text style={[styles.dataRowValueText, {
                  flex: 32,
                  maxWidth: 110,
                }]}>
                  {isEmptyData
                    ? <Text style={styles.fractionalPart}>-</Text>
                    : (
                      <Fragment>
                        <Text
                          style={cs(isOpen, styles.dataValueText, commonStyles.textWhite)}>{getCurrencyChar(iskatHul)}</Text>
                        <Text
                          style={cs(isOpen, styles.dataValueText, commonStyles.textWhite)}>{value[0]}</Text>
                        <Text
                          style={cs(isOpen, styles.fractionalPart, commonStyles.textWhite)}>.{value[1]}</Text>
                      </Fragment>
                    )}
                </Text>
                <Text style={[cs(isOpen, styles.dataRowDateText, commonStyles.textWhite), {
                  flex: 65,
                }]}>
                  {AppTimezone.moment(data.month).format('MM/YYYY')}
                  {data.cardDetails.some(c => c.notFinal) && `(${t('creditCards:notFinal')})`}
                </Text>
              </View>
            </TouchableOpacity>

            {!isEmptyData ? (
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
                      account={account}
                      onUpdateCardTrans={this.handleUpdateCardTrans}
                      onEditCategory={this.handleOpenCategoriesModal}
                    />
                  )}
              </View>
            ) : (
              <View onLayout={this.setMaxHeight}>
                <View style={{
                  height: 55,
                  flexDirection: 'row',
                  alignContent: 'center',
                  justifyContent: 'center',
                  alignSelf: 'center',
                  alignItems: 'center',
                }}>
                  <Text style={{
                    fontSize: sp(16),
                    color: colors.blue7,
                  }}>לא קיימים חיובים בחודש זה</Text>
                </View>
              </View>
            )}
          </Animated.View>

          {categoriesModalIsOpen && (
            <CategoriesModal
              isOpen
              isRtl={isRtl}
              companyId={companyId}
              bankTrans={currentEditCardTrans}
              onClose={this.handleCloseCategoriesModal}
              onUpdateBankTrans={this.handleUpdateBankTrans}
              onSelectCategory={this.handleSelectCategory}
              onCreateCategory={onCreateCardTransCategory}
              onRemoveCategory={onRemoveCardTransCategory}
            />
          )}
        </Fragment>
      )
    }
}
