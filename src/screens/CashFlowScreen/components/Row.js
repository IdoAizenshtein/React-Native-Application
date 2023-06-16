import React, { Fragment, PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import CustomIcon from '../../../components/Icons/Fontello'
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

export default class Row extends PureComponent {
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
      cashFlowDetailsDataItem,
      isRtl,
      onToggle,
      nigreret,
    } = this.props

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
    const transName = cashFlowDetailsDataItem.transName
      ? cashFlowDetailsDataItem.transName.trim()
      : cashFlowDetailsDataItem.transName

    return (
      <TouchableOpacity style={styles.dataRowAnimatedWrapper}
                        onPress={onToggle}>
        <View style={wrapperStyles}>
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
              <Text
                style={[
                  cs(isOpen, [styles.dataValue, commonStyles.regularFont],
                    commonStyles.boldFont)]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {this.renderTextYellow(transName)}

                {!cashFlowDetailsDataItem.canChangeZefi && (
                  <Text>{' - סכום סופי'}</Text>
                )}
              </Text>
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
    )
  }
}
