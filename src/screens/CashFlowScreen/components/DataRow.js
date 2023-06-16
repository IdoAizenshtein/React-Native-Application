import React from 'react'
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { withTranslation } from 'react-i18next'
import BankTrans from './BankTrans'
import AnimatedRow from './AnimatedRow'
import {
  combineStyles as cs,
  getFormattedValueArray,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../CashFlowStyles'
import { colors } from '../../../styles/vars'
import { dateToFromNowDaily } from '../../../utils/date'

@withTranslation()
export default class DataRow extends AnimatedRow {
  getExpandedData = () => {
    const { OneAggregateDataPerDay, data, categories } = this.props
    const { inProgress } = this.state
    if (inProgress) {return}
    this.setState({ inProgress: true })

    OneAggregateDataPerDay(data.transDate, (data.hova !== 0) ? 1 : 0,
      (data.transDate === null))
      .then((cashFlowDetailsData) => {
        let expandedData
        if (data.transDate === null) {
          expandedData = cashFlowDetailsData.cashFlowDetails.filter(
            (item) => item.nigreret === true)
        } else if (data.isTodaySummary) {
          expandedData = cashFlowDetailsData.cashFlowDetails.filter(
            (item) => item.nigreret === false)
        } else {
          expandedData = cashFlowDetailsData.cashFlowDetails
        }
        expandedData.forEach((trns, idx) => {
          trns.transType = categories.find(
            ctt => ctt.transTypeId === trns.transTypeId)
          if (trns.transType === undefined) {
            trns.transType = categories[0]
          }
        })
        this.setState({
          inProgress: false,
          expandedData,
        })
      })
      .catch(() => this.setState({ inProgress: false }))
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { itemUpdate } = nextProps
    if (itemUpdate !== this.props.itemUpdate) {
      this.updateRow(false, itemUpdate)
    }
  }

  updateRow = (updateRow, data) => {
    let expandedData = JSON.parse(JSON.stringify(this.state.expandedData))
    const index = expandedData.findIndex(t => t.transId === data.transId)
    expandedData[index] = data
    this.setState({ expandedData })
    // if (updateRow) {
    //   const { reload } = this.props
    //   reload()
    // }
  }

  match = () => {
    const { goToMatch } = this.props
    goToMatch()
  }

  render () {
    const { isRtl, data, t, categories, accounts, removeItem, handlePopRowEditsModal, accountUuid, showBtnMatch, companyId, openBottomSheet } = this.props
    const { isOpen, height, inProgress, expandedData } = this.state
    const wrapperStyles = cs(isRtl,
      cs(isOpen, styles.dataRow, styles.dataRowActive), commonStyles.rowReverse)
    const itraStyles = cs(data.totalCredit < 0,
      cs(isOpen, styles.dataValue, { color: colors.white }),
      { color: colors.red2 },
    )
    const colorWhite = { color: colors.white }
    const colorGray6 = { color: colors.gray6 }

    const zhut = getFormattedValueArray(data.zhut)
    const hova = getFormattedValueArray(data.hova)
    const itra = getFormattedValueArray(data.itra)

    return (
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
              {data.transDate === null && (
                <Text style={cs(isOpen, styles.transData, colorGray6)}>
                  {(accountUuid === null)
                    ? t('calendar:today')
                    : accountUuid} {'(נגררות)'}
                </Text>
              )}
              {data.transDate !== null && (
                <Text style={cs(isOpen, styles.transData, colorGray6)}>
                  {(data.isTodaySummary)
                    ? t('calendar:today')
                    : dateToFromNowDaily(data.transDate, t)} {data.transDate ===
                null ? ('(נגררות)') : ''}
                </Text>
              )}
            </View>

            <Text style={styles.dataValueWrapper}>
              <Text style={cs(isOpen, [styles.dataValue, styles.hovaValue],
                colorWhite)}>{hova[0]}</Text>
              <Text style={cs(isOpen, styles.fractionalPart,
                colorWhite)}>.{hova[1]}</Text>
            </Text>

            {data.transDate === null && showBtnMatch && (
              <View style={{ maxWidth: 90 }}>
                <TouchableOpacity style={[
                  {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: '#0f3860',
                    borderRadius: 5,
                  }]} onPress={this.match}>
                  <Text style={styles.btnMatch}>{'להתאמה'}</Text>
                </TouchableOpacity>
              </View>
            )}
            {data.transDate === null && !showBtnMatch && (
              <View style={{ maxWidth: 90 }}/>
            )}
            {data.transDate !== null &&
            (<Text style={[styles.dataValueWrapper, { maxWidth: 90 }]}>
              <Text style={itraStyles}>{itra[0]}</Text>
              <Text style={cs(isOpen, styles.fractionalPart,
                { color: colors.white })}>.{itra[1]}</Text>
            </Text>)}

          </View>
        </TouchableOpacity>

        <View onLayout={this.setMaxHeight}>
          {inProgress
            ? <ActivityIndicator color="#999999" style={{ padding: 10 }}/>
            : <BankTrans isRtl={isRtl}
                         data={expandedData}
                         parentIsOpen={isOpen}
                         openBottomSheet={openBottomSheet}
                         companyId={companyId}
                         handlePopRowEditsModal={handlePopRowEditsModal}
                         updateRow={this.updateRow}
                         categories={categories} accounts={accounts}
                         removeItem={removeItem}
                         nigreret={data.transDate === null}/>}
        </View>
      </Animated.View>
    )
  }
}
