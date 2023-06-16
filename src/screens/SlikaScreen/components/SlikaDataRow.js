import React, { Fragment } from 'react'
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import AppTimezone from '../../../utils/appTimezone'
import { withTranslation } from 'react-i18next'
import {
  combineStyles as cs,
  getFormattedValueArray,
  sp,
} from '../../../utils/func'
import AnimatedControlledRow
  from '../../../components/DataRow/AnimatedControlledRow'
import commonStyles from '../../../styles/styles'
import styles, { DATA_ROW_HEIGHT } from '../SlikaStyles'

import SlikaDataDetails from './SlikaDataDetails'
import { colors } from '../../../styles/vars'

@withTranslation()
export default class SlikaDataRow extends AnimatedControlledRow {
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
    const isEmptyData = data.sumMonthlyTotal === null
    if (!isEmptyData) {
      const { inProgress } = this.state
      if (inProgress) {return}
      this.setState({ inProgress: true })

      const companyAccounts = data.soleksTotals.map(t => t.companyAccountIds)
      const solekNums = data.soleksTotals.map(t => t.solekNum)
      onGetDetails({
        companyAccounts,
        solekNums,
      }, data.month)
        .then((data) => this.setState({
          inProgress: false,
          expandedData: data ? data.cycleDetails : null,
        }))
        .catch(() => this.setState({ inProgress: false }))
    }
  }

  render () {
    const {
      isOpen,
      data,
      t,
      onItemToggle,
      isRtl,
      navigation,
    } = this.props
    const { height, inProgress, expandedData } = this.state
    const value = getFormattedValueArray(data.sumMonthlyTotal)
    const dataWrapperStyle = cs(isOpen, styles.dataRowWrapper,
      styles.dataRowActive)
    const isEmptyData = data.sumMonthlyTotal === null

    return (
      <Fragment>
        <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
          <TouchableOpacity onPress={onItemToggle}>
            <View style={dataWrapperStyle} onLayout={this.setMinHeight}>
              <Text style={[
                styles.dataRowValueText,
                {
                  flex: 0.95,
                  maxWidth: 95,
                }]}>
                {isEmptyData
                  ? <Text style={styles.fractionalPart}>-</Text>
                  : (
                    <Fragment>
                      <Text
                        style={cs(isOpen, styles.dataValueText,
                          commonStyles.textWhite)}>{value[0]}</Text>
                      <Text
                        style={cs(isOpen, styles.fractionalPart,
                          commonStyles.textWhite)}>.{value[1]}</Text>
                    </Fragment>
                  )}
              </Text>
              <Text style={cs(isOpen, styles.dataRowDateText,
                commonStyles.textWhite)}>
                {AppTimezone.moment(data.month).format('MM/YYYY')}
                {data.soleksTotals.some(c => c.notFinal) &&
                `(${t('creditCards:notFinal')})`}
              </Text>
            </View>
          </TouchableOpacity>

          {!isEmptyData ? (
            <View onLayout={this.setMaxHeight}>
              {inProgress
                ? <ActivityIndicator color="#999999" style={{ padding: 10 }}/>
                : (
                  <SlikaDataDetails
                    account={data.soleksTotals[0].account}
                    isRtl={isRtl}
                    navigation={navigation}
                    data={expandedData}
                    parentIsOpen={isOpen}
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
                }}>לא קיימות סליקות בחודש זה</Text>
              </View>
            </View>
          )}
        </Animated.View>
      </Fragment>
    )
  }
}
