import React, { Fragment } from 'react'
import {
  ActivityIndicator,
  Animated,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { withTranslation } from 'react-i18next'
import {
  combineStyles as cs,
  getFormattedValueArray,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles, { DATA_ROW_HEIGHT } from '../SlikaStyles'
import AnimatedRow from '../../../components/DataRow/AnimatedRow'
import SlikaDataDetails from './SlikaDataDetails'

@withTranslation()
export default class SlikaAggregatedDataRow extends AnimatedRow {
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

    onGetDetails({
      companyAccounts: data.companyAccountIds,
      solekNums: data.solekNum,
    }, section.month)
      .then((data) => this.setState({
        inProgress: false,
        expandedData: data ? data.cycleDetails : null,
      }))
      .catch(() => this.setState({ inProgress: false }))
  }

  render () {
    const {
      data,
      t,
      isRtl,
      navigation,
    } = this.props
    const {
      isOpen,
      height,
      inProgress,
      expandedData,
    } = this.state

    const value = getFormattedValueArray(data.monthlyTotal)
    const dataWrapperStyle = cs(isOpen,
      [styles.dataRowWrapper, styles.dataRowAggregatedWrapper],
      styles.dataRowActive)

    return (
      <Fragment>
        <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
          <TouchableOpacity onPress={this.handleToggle}>
            <View style={dataWrapperStyle} onLayout={this.setMinHeight}>
              <Text style={[
                styles.dataRowValueText,
                {
                  flex: 0.95,
                  maxWidth: 95,
                }]}>
                <Text style={cs(isOpen, styles.dataValueText,
                  commonStyles.textWhite)}>{value[0]}</Text>
                <Text
                  style={cs(isOpen, styles.fractionalPart,
                    commonStyles.textWhite)}>.{value[1]}</Text>
              </Text>
              <Text style={cs(isOpen, styles.dataRowDateText,
                commonStyles.textWhite)}>
                {t(
                  `clearingAgenciesName:${data.solekBankId}`)} {data.solekNum}{' '}{data.notFinal &&
              `(${t('creditCards:notFinal')})`}
              </Text>
            </View>
          </TouchableOpacity>

          <View onLayout={this.setMaxHeight}>
            {inProgress
              ? <ActivityIndicator color="#999999" style={{ padding: 10 }}/>
              : (
                <SlikaDataDetails
                  navigation={navigation}
                  account={data.account}
                  isRtl={isRtl}
                  data={expandedData}
                  parentIsOpen={isOpen}
                />
              )}
          </View>
        </Animated.View>
      </Fragment>
    )
  }
}
