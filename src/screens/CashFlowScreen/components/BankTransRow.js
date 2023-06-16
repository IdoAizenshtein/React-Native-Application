import React, { Fragment, PureComponent } from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import BankTransAdditionalInfo from './BankTransAdditionalInfo'
import {
  combineStyles as cs,
  getBankTransIcon,
  getFormattedValueArray,
  sp,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../CashFlowStyles'
import { colors } from '../../../styles/vars'
import { getDaysBetweenTwoDates } from '../../../utils/date'
import CustomIcon from '../../../components/Icons/Fontello'
import ControlledEditableTextInput
  from '../../../components/FormInput/ControlledEditableTextInput'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import {
  accountCflDataUpdateApi,
  createAccountCflTransTypeApi,
  removeAccountCflTransTypeApi,
} from '../../../api'
import { exampleCompany } from '../../../redux/constants/account'

export default class BankTransRow extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      currentEditBankTrans: JSON.parse(
        JSON.stringify(this.props.cashFlowDetailsDataItem)).transType,
      categoriesModalIsOpen: false,
      isEditing: false,
      mainDesc: JSON.parse(
        JSON.stringify(this.props.cashFlowDetailsDataItem)).transName,
    }
  }

  UNSAFE_componentWillReceiveProps (props) {
    if (props.cashFlowDetailsDataItem.transType.transTypeId !==
      this.props.cashFlowDetailsDataItem.transType.transTypeId) {
      this.setState({
        currentEditBankTrans: JSON.parse(
          JSON.stringify(props.cashFlowDetailsDataItem)).transType,
      })
    }
  }

  sectionString (highlight, origStr, caseSensitive) {
    try {
      // Sanity check
      if (!highlight || !origStr) {
        return [{ text: origStr }]
      }

      origStr = origStr.toString()
      highlight = highlight.toString()

      var indices = []
      var startIndex = 0
      var searchStrLen = highlight.length
      var index
      var str = origStr
      if (!caseSensitive) {
        str = str.toString().toLowerCase()
        highlight = highlight.toString().toLowerCase()
      }
      while ((index = str.indexOf(highlight, startIndex)) > -1) {
        if (index > 0) {
          indices.push({
            text: origStr.substring(startIndex, index),
          })
        }
        startIndex = index + searchStrLen
        indices.push({
          highlight: true,
          text: origStr.substring(index, startIndex),
        })
      }
      if (startIndex < str.length) {
        indices.push({ text: origStr.substring(startIndex, str.length) })
      }
      return indices
    } catch (e) {
      // alert(e)
    }
  }

  renderTextYellow = (value, isTotal) => {
    const {
      queryStatus,
    } = this.props
    try {
      if (value && queryStatus && queryStatus.query !== null &&
        queryStatus.query !== '') {
        let numTo = false
        if (isTotal && !isNaN(queryStatus.query)) {
          const numTotal = getFormattedValueArray(queryStatus.query)
          if (numTotal.length > 0) {
            numTo = value.toString().includes(numTotal[0])
          }
        }
        if (
          value.toString()
            .toLowerCase()
            .includes(queryStatus.query.toString().toLowerCase()) ||
          (numTo)
        ) {
          const sections = this.sectionString(isTotal
            ? getFormattedValueArray(queryStatus.query.toString())[0]
            : queryStatus.query.toString(), value, false)
          let textIndex = 0
          const renderedText = sections.map((section) => {
            const style = (section.highlight === true ? {
              backgroundColor: 'yellow',
            } : null)
            let index = textIndex++
            return <Text key={'text-highlight-element-' + index}
                         style={style}>{section.text}</Text>
          })
          return (
            <Fragment>
              {renderedText}
            </Fragment>
          )
        } else {
          return value
        }
      } else {
        return value
      }
    } catch (e) {
      // alert(e)
    }
  }

  updateRow = (updateRow, data) => {
    // this.setState({
    //   cashFlowDetailsDataItem: data,
    // })

    const { onUpdate } = this.props
    onUpdate(updateRow, data)
  }

  getAccountCflTransType (transTypeId) {
    const { getAccountCflTransType } = this.props
    if (getAccountCflTransType && transTypeId) {
      const type = getAccountCflTransType.find(
        (item) => (item.transTypeId === transTypeId))
      if (type !== undefined) {
        return type
      } else {
        return getAccountCflTransType[0]
      }
    } else {
      return ''
    }
  }

  onStartEdit = () => {
    const dataOfRow = this.props.cashFlowDetailsDataItem

    this.setState({
      isEditing: !this.state.isEditing,
    })
    if (!this.state.mainDesc) {
      return this.handleChangeMainDesc(dataOfRow.transName)
    }
    if (this.state.isEditing && (dataOfRow.transName !== this.state.mainDesc)) {
      accountCflDataUpdateApi.post({
        body: {
          'asmachta': dataOfRow.asmachta,
          'bank': dataOfRow.bank,
          'chequeNo': dataOfRow.chequeNo,
          'companyAccountId': dataOfRow.companyAccountId,
          'companyId': exampleCompany.isExample
            ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
            : dataOfRow.companyId,
          'expence': dataOfRow.expence,
          'kvuaDateFrom': dataOfRow.kvuaDateFrom,
          'kvuaDateTill': dataOfRow.kvuaDateTill,
          'linkId': dataOfRow.linkId,
          'nigreret': dataOfRow.nigreret,
          'originalDate': dataOfRow.originalDate,
          'paymentDesc': dataOfRow.paymentDesc,
          'pictureLink': dataOfRow.pictureLink,
          'sourceProgramName': dataOfRow.sourceProgramName,
          'targetOriginalTotal': dataOfRow.targetOriginalTotal,
          'targetType': dataOfRow.targetType,
          'targetTypeId': dataOfRow.targetTypeId,
          'total': dataOfRow.total,
          'transDate': dataOfRow.nigreret
            ? dataOfRow.originalDate
            : dataOfRow.transDate,
          'transDesc': dataOfRow.transDesc,
          'transId': dataOfRow.transId,
          'transName': this.state.mainDesc,
          'transTypeId': dataOfRow.transType.transTypeId,
          'uniItra': dataOfRow.uniItra,
          'uniItraColor': dataOfRow.uniItraColor,
        },
      }).then(data => {
        dataOfRow.transName = this.state.mainDesc
        this.updateRow(false, dataOfRow)
      }).catch(() => {
        this.updateRow(false)
      })
    }
  }

  handleChangeMainDesc = mainDesc => this.setState({ mainDesc })

  handleCancelChangeMainDesc = () => {
    this.setState({
      mainDesc: this.props.cashFlowDetailsDataItem.transName,
      isEditing: false,
    })
  }

  handleToggle = () => {
    const {
      onToggle,
    } = this.props
    onToggle()
    if (this.state.isEditing) {this.handleCancelChangeMainDesc()}
  }

  handleUpdateBankTrans = (newBankTrans) => {
    const dataOfRow = this.props.cashFlowDetailsDataItem
    if (dataOfRow.transType.transTypeId !== newBankTrans.transTypeId) {
      accountCflDataUpdateApi.post({
        body: {
          'asmachta': dataOfRow.asmachta,
          'bank': dataOfRow.bank,
          'chequeNo': dataOfRow.chequeNo,
          'companyAccountId': dataOfRow.companyAccountId,
          'companyId': exampleCompany.isExample
            ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
            : dataOfRow.companyId,
          'expence': dataOfRow.expence,
          'kvuaDateFrom': dataOfRow.kvuaDateFrom,
          'kvuaDateTill': dataOfRow.kvuaDateTill,
          'linkId': dataOfRow.linkId,
          'nigreret': dataOfRow.nigreret,
          'originalDate': dataOfRow.originalDate,
          'paymentDesc': dataOfRow.paymentDesc,
          'pictureLink': dataOfRow.pictureLink,
          'sourceProgramName': dataOfRow.sourceProgramName,
          'targetOriginalTotal': dataOfRow.targetOriginalTotal,
          'targetType': dataOfRow.targetType,
          'targetTypeId': dataOfRow.targetTypeId,
          'total': dataOfRow.total,
          'transDate': dataOfRow.nigreret
            ? dataOfRow.originalDate
            : dataOfRow.transDate,
          'transDesc': dataOfRow.transDesc,
          'transId': dataOfRow.transId,
          'transName': dataOfRow.transName,
          'transTypeId': newBankTrans.transTypeId,
          'uniItra': dataOfRow.uniItra,
          'uniItraColor': dataOfRow.uniItraColor,
        },
      }).then(data => {
        this.setState({
          currentEditBankTrans: { ...newBankTrans },
          categoriesModalIsOpen: false,
        })
        dataOfRow.transType = newBankTrans
        this.updateRow(false, dataOfRow)
      }).catch(() => {
        this.updateRow(false)
        this.setState({
          currentEditBankTrans: { ...newBankTrans },
          categoriesModalIsOpen: false,
        })
      })
    } else {
      this.setState({
        currentEditBankTrans: { ...newBankTrans },
        categoriesModalIsOpen: false,
      })
    }
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
    this.setState({ categoriesModalIsOpen: false })
  }

  handleOpenCategoriesModal = (bankTransId) => () => {
    this.setState({
      categoriesModalIsOpen: true,
      currentEditBankTrans: bankTransId,
    })
  }

  handleRemoveBankTransCategory = (transTypeId) => {
    const { currentCompanyId } = this.props
    return removeAccountCflTransTypeApi.post({
      body: {
        transTypeId,
        companyId: currentCompanyId,
      },
    })
  }

  handleCreateBankTransCategory = (transTypeName) => {
    const { currentCompanyId } = this.props
    return createAccountCflTransTypeApi.post({
      body: {
        'transTypeId': null,
        transTypeName,
        companyId: currentCompanyId,
      },
    })
  }

  render () {
    const {
      height,
      accounts,
      isOpen,
      isRtl,
      account,
      onSetMinHeight,
      onSetMaxHeight,
      getAccountCflTransType,
      removeItem,
      nigreret,
      handlePopRowEditsModal,
      cashFlowDetailsDataItem,
      companyId,
      queryStatus,
    } = this.props
    const { isEditing, mainDesc, categoriesModalIsOpen, currentEditBankTrans } = this.state
    const wrapperStyles = cs(
      isRtl,
      cs(isOpen, [styles.dataRow, styles.dataRowLevel2],
        styles.dataRowLevel2Active),
      commonStyles.rowReverse,
    )

    const total = getFormattedValueArray(cashFlowDetailsDataItem.expence
      ? -Math.abs(cashFlowDetailsDataItem.total)
      : cashFlowDetailsDataItem.total)
    const numberStyle = cs(cashFlowDetailsDataItem.expence,
      [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })

    return (
      <Fragment>
        <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
          <TouchableOpacity onPress={this.handleToggle}>
            <View style={wrapperStyles} onLayout={onSetMinHeight}>
              <View style={{
                flex: 0.2,
                justifyContent: 'center',
                alignItems: 'center',
                alignSelf: 'center',
                alignContent: 'center',
                padding: 5,
                flexDirection: 'row',
              }}>
                <View style={commonStyles.spaceDividerDouble}/>
                <CustomIcon
                  name={getBankTransIcon(cashFlowDetailsDataItem.paymentDesc)}
                  size={18}
                  color={colors.blue8}
                />
              </View>
              <View style={[
                cs(isRtl, styles.dataValueDescWrapperLevel2,
                  commonStyles.rowReverse), {
                  alignSelf: 'center',
                  alignContent: 'center',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }]}>
                <View style={{
                  flexDirection: 'row',
                  alignItems: (cashFlowDetailsDataItem.nigreret)
                    ? 'flex-start'
                    : 'center',
                }}>
                  {cashFlowDetailsDataItem.targetType !== 'BANK_TRANS' && (
                    <Text
                      style={[
                        cs(isOpen, [styles.dataValue, commonStyles.regularFont],
                          commonStyles.boldFont)]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {this.renderTextYellow(cashFlowDetailsDataItem.transName)}
                    </Text>
                  )}
                  {cashFlowDetailsDataItem.targetType === 'BANK_TRANS' && (
                    <ControlledEditableTextInput
                      isEditable={isOpen}
                      isEditing={isEditing}
                      onBlur={this.handleCancelChangeMainDesc}
                      textInputStyle={styles.dataDescInput}
                      textStyle={cs(isOpen, [
                        styles.dataValue,
                        commonStyles.regularFont,
                        { flex: 0 }], commonStyles.boldFont)}
                      value={(isEditing || !mainDesc.length)
                        ? mainDesc
                        : this.renderTextYellow(mainDesc)}
                      onChangeText={this.handleChangeMainDesc}
                      onSubmit={this.onStartEdit}
                    />
                  )}
                </View>
                {(cashFlowDetailsDataItem.nigreret || nigreret) && (
                  <View style={{
                    marginTop: 2,
                    flexDirection: 'row',
                    alignItems: 'flex-end',
                  }}>
                    <Text
                      style={[
                        cs(isOpen, [styles.dataValue, commonStyles.regularFont],
                          commonStyles.boldFont), {
                          marginTop: 0,
                          textAlign: 'right',
                          fontSize: sp(14),
                          lineHeight: 14,
                          color: '#26496c',
                        }]}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {'נגרר'} {getDaysBetweenTwoDates(new Date(),
                      new Date(cashFlowDetailsDataItem.originalDate))} {'ימים'}
                    </Text>
                  </View>
                )}
              </View>
              <View style={{
                flex: 1,
                alignSelf: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}>
                <Text
                  style={[
                    styles.dataValueWrapper, styles.dataValueWrapperLevel2, {
                      textAlign: 'right',
                    }]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  <Text style={numberStyle}>{this.renderTextYellow(total[0],
                    true)}</Text>
                  <Text style={styles.fractionalPart}>.{this.renderTextYellow(
                    total[1])}</Text>
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View onLayout={onSetMaxHeight}>
            <BankTransAdditionalInfo
              renderTextYellow={this.renderTextYellow}
              queryStatus={queryStatus}
              onEditCategory={this.handleOpenCategoriesModal}
              onStartEdit={this.onStartEdit}
              isEditing={isEditing}
              handlePopRowEditsModal={handlePopRowEditsModal}
              removeItem={removeItem}
              updateRow={this.updateRow}
              accounts={accounts}
              isRtl={isRtl}
              getAccountCflTransType={getAccountCflTransType}
              transType={currentEditBankTrans}
              isOpen={isOpen}
              account={account || {}}
              cashFlowDetailsDataItem={cashFlowDetailsDataItem}
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
            onCreateCategory={this.handleCreateBankTransCategory}
            onRemoveCategory={this.handleRemoveBankTransCategory}
          />
        )}
      </Fragment>
    )
  }
}
