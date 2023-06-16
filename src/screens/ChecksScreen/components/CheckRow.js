import React, { Fragment } from 'react'

import { Animated, Easing, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import {
  combineStyles as cs,
  getFormattedValueArray,
  sp,
} from '../../../utils/func'
import AnimatedControlledRow
  from '../../../components/DataRow/AnimatedControlledRow'
import commonStyles from '../../../styles/styles'
import styles, { DATA_ROW_HEIGHT } from '../ChecksStyles'
import { colors, fonts } from '../../../styles/vars'
import { dateToFromNowDaily } from '../../../utils/date'
import SecondLevelRow from './SecondLevelRow'

@withTranslation()
export default class CheckRow extends AnimatedControlledRow {
  constructor (props) {
    super(props)

    this.initialHeight = DATA_ROW_HEIGHT
    this.maxHeight = this.initialHeight
    this.state = this.initialState
  }

  get initialState () {
    return {
      ...super.initialState,
      chequeComment: null,
      isOpen: this.props.isOpen,
    }
  }

  getExpandedData () {
    const { inProgress } = this.state
    if (inProgress) {return}
    this.setState({ inProgress: true })
    setTimeout(() => {
      this.setState({ inProgress: false })
    }, 20)
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
    const { isOpen } = this.state
    if (isOpen) {
      setTimeout(() => {
        this.fixRowHeightChild(this.maxHeight + 55)
      }, 20)
    } else {
      setTimeout(() => {
        this.fixRowHeightChild(55)
      }, 20)
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

  render () {
    const {
      isOpen,
      isRtl,
      item,
      accounts,
      t,
      onItemToggle,
      screenSwitchState,
      account,
      deleteOperationApi,
      onRefresh,
      companyId,
      querySearch,
      selectedAccountIds,
    } = this.props
    const { height } = this.state
    const wrapperStyles = cs(isOpen, styles.dataRow, styles.dataRowActive)
    const withinRowStyles = cs(isRtl, commonStyles.row, commonStyles.rowReverse)

    const total = getFormattedValueArray(item.total)
    const numberStyle = cs(!screenSwitchState,
      [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })

    return (
      <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
        <TouchableOpacity onPress={onItemToggle}>
          <View style={wrapperStyles} onLayout={this.setMinHeight}>
            <View style={[
              withinRowStyles, {
                alignSelf: 'center',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }]}>
              <View style={{
                flex: 1,
              }}>
                <Text numberOfLines={1} ellipsizeMode="tail" style={[
                  {
                    textAlign: 'right',
                    color: colors.blue8,
                    fontSize: sp(18),
                  }, cs(isOpen, {
                    fontFamily: fonts.semiBold,
                  }, {
                    fontFamily: fonts.bold,
                  })]}>
                  {this.renderTextYellow(item.mainDescription)}
                </Text>
              </View>
              <View style={{
                alignSelf: 'flex-end',
              }}>
                <Text
                  style={{
                    flex: 1,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  <Text style={[
                    numberStyle, { fontSize: sp(18) }, cs(isOpen, {
                      fontFamily: fonts.semiBold,
                    }, {
                      fontFamily: fonts.bold,
                    })]}>{this.renderTextYellow(total[0], true)}</Text>
                  <Text
                    style={[
                      styles.fractionalPart,
                      { fontSize: sp(18) }]}>.{this.renderTextYellow(
                    total[1])}</Text>
                </Text>
              </View>
            </View>
            <View style={[withinRowStyles]}>
              <Text numberOfLines={1} ellipsizeMode="tail" style={{
                fontSize: sp(14),
                fontFamily: fonts.light,
                color: colors.gray6,
              }}>
                {dateToFromNowDaily(item.dueDate, t, 'DD/MM')}
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <View onLayout={this.setMaxHeightAll}>
          <SecondLevelRow
            renderTextYellow={this.renderTextYellow}
            querySearch={querySearch}
            companyId={companyId}
            screenSwitchState={screenSwitchState}
            onRefresh={onRefresh}
            accounts={accounts}
            account={account}
            deleteOperationApi={deleteOperationApi}
            isOpen={isOpen}
            isRtl={isRtl}
            item={item}
            selectedAccountIds={selectedAccountIds}
          />
        </View>
      </Animated.View>
    )
  }
}
