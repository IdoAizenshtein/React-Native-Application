import React, { Fragment, PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import {
  combineStyles as cs,
  getFormattedValueArray,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../MutavimStyles'
import { colors } from '../../../styles/vars'

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
      item,
      isRtl,
      onToggle,
    } = this.props

    const accountMutavName = item.accountMutavName
      ? item.accountMutavName.trim()
      : item.accountMutavName

    const wrapperStyles = cs(
      isRtl,
      cs(isOpen, [styles.dataRow, styles.dataRowLevel2],
        styles.dataRowLevel2Active),
      commonStyles.rowReverse,
    )
    const total = getFormattedValueArray(item.averageThreeMonths)
    const numberStyle = cs(item.averageThreeMonths.toString().includes('-'),
      [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })

    return (
      <TouchableOpacity style={styles.dataRowAnimatedWrapper}
                        onPress={onToggle}>
        <View style={wrapperStyles}>
          <View style={[
            cs(isRtl, styles.dataValueDescWrapperLevel2,
              commonStyles.rowReverse)]}>
            <Text
              style={[
                cs(isOpen,
                  [styles.dataValue, commonStyles.regularFont, { flex: 0 }],
                  commonStyles.boldFont)]}
              numberOfLines={1}>{this.renderTextYellow(accountMutavName)}</Text>

            <View style={styles.dateDivider}/>

            {(item.isCyclic) && (
              <View style={{
                height: 20,
                alignSelf: 'center',
                justifyContent: 'center',
                alignContent: 'center',
                alignItems: 'center',
              }}>
                <Image
                  style={styles.cyclicIcon}
                  source={require('BiziboxUI/assets/cyclic.png')}
                />
              </View>
            )}
          </View>

          <Text
            style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2]}>
            <Text style={numberStyle}>{item.hova
              ? '-'
              : ''}{this.renderTextYellow(total[0], true)}</Text>
            <Text style={styles.fractionalPart}>.{this.renderTextYellow(
              total[1])}</Text>
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}
