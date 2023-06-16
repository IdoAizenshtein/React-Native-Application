import React from 'react'
import AppTimezone from '../../../utils/appTimezone'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import {
  combineStyles as cs,
  getFormattedValueArray,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles, { DATA_ROW_HEIGHT } from '../SlikaStyles'
import AnimatedRow from '../../../components/DataRow/AnimatedRow'
import SlikaAdditionalInfo from './SlikaAdditionalInfo'

export default class SlikaDetailsRow extends AnimatedRow {
  constructor (props) {
    super(props)

    this.initialHeight = DATA_ROW_HEIGHT
    this.maxHeight = this.initialHeight
    this.state = this.initialState
  }

  get initialState () {
    return {
      ...super.initialState,
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { parentIsOpen } = nextProps
    if (!parentIsOpen && this.state.isOpen) {this.handleToggle()}
  }

  render () {
    const { data, isRtl, account, navigation } = this.props
    const { height, isOpen } = this.state
    const wrapperStyles = cs(
      isRtl,
      cs(isOpen, [styles.dataRowWrapper, styles.dataRowLevel2],
        styles.dataRowLevel2Active),
      commonStyles.rowReverse,
    )
    const total = getFormattedValueArray(data.transTotal)

    return (
      <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
        <TouchableOpacity onPress={this.handleToggle}>
          <View style={wrapperStyles} onLayout={this.setMinHeight}>
            <Text
              style={cs(isOpen, [styles.dataValue, commonStyles.regularFont],
                commonStyles.boldFont)}
            >
              {AppTimezone.moment(data.date).format('DD/MM')}
            </Text>
            <View style={cs(isRtl, styles.dataValueWrapperLevel2)}>
              <View
                style={cs(isRtl, commonStyles.row, commonStyles.rowReverse)}>
                <Text style={styles.dataRowValueTextLevel2} numberOfLines={1}>
                  <Text
                    style={[
                      styles.dataValueText,
                      data.transTotal < 0
                        ? styles.dataValueNegativeText
                        : styles.dataValuePositiveText]}
                    numberOfLines={1}
                  >
                    {total[0]}
                  </Text>
                  <Text style={styles.fractionalPart}
                        numberOfLines={1}> .{total[1]} </Text>
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View onLayout={this.setMaxHeight}>
          <SlikaAdditionalInfo
            account={account}
            navigation={navigation}
            isRtl={isRtl}
            data={data}
          />
        </View>

        <View style={[styles.dataRowSeparator, { flex: 0 }]}/>
      </Animated.View>
    )
  }
}
