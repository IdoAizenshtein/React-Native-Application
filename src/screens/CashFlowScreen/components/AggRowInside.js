import React from 'react'
import { Animated, Text, View } from 'react-native'
import {
  combineStyles as cs,
  getFormattedValueArray,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../CashFlowStyles'
import { colors } from '../../../styles/vars'
import AnimatedRow from './AnimatedRow'

export default class AggRowInside extends AnimatedRow {
  UNSAFE_componentWillReceiveProps (nextProps) {
    const { parentIsOpen } = nextProps
    if (!parentIsOpen && this.state.isOpen) {this.handleToggle()}
  }

  render () {
    const { cashFlowDetailsData, isRtl } = this.props
    const { height, isOpen } = this.state
    const wrapperStyles = cs(
      isRtl,
      cs(isOpen, [styles.dataRow, styles.dataRowLevel2],
        styles.dataRowLevel2Active),
      commonStyles.rowReverse,
    )
    const total = getFormattedValueArray(cashFlowDetailsData.total)
    const numberStyle = cs(cashFlowDetailsData.expence,
      [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })

    return (
      <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
        <View style={wrapperStyles} onLayout={this.setMinHeight}>
          <View style={cs(isRtl, styles.dataValueDescWrapperLevel2,
            commonStyles.rowReverse)}>
            <Text
              style={cs(isOpen, [styles.dataValue, commonStyles.regularFont],
                commonStyles.boldFont)}
              numberOfLines={1}>
              {cashFlowDetailsData.transName}
            </Text>
            <View style={styles.dateDivider}/>
          </View>

          <Text
            style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2]}>
            <Text style={numberStyle}>{total[0]}</Text>
            <Text style={styles.fractionalPart}>.{total[1]}</Text>
          </Text>
        </View>
      </Animated.View>
    )
  }
}
