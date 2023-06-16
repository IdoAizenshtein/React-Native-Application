import React, { Fragment, PureComponent } from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import CustomIcon from '../../../components/Icons/Fontello'
import BankTransAdditionalInfo from './BankTransAdditionalInfo'
import {
  combineStyles as cs,
  getBankTransIcon,
  getFormattedValueArray,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../BankAccountsStyles'
import { colors } from '../../../styles/vars'
import ControlledEditableTextInput
  from '../../../components/FormInput/ControlledEditableTextInput'

export default class RowInnerLevelTwo extends PureComponent {
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
        if (value && queryStatus && queryStatus.query !== null && queryStatus.query !== '') {
          let numTo = false
          if (isTotal && !isNaN(queryStatus.query)) {
            const numTotal = getFormattedValueArray(queryStatus.query)
            if (numTotal.length > 0) {
              numTo = value.toString().includes(numTotal[0])
            }
          }
          if (
            value.toString().toLowerCase().includes(queryStatus.query.toString().toLowerCase()) ||
                    (numTo)
          ) {
            const sections = this.sectionString(isTotal ? getFormattedValueArray(queryStatus.query.toString())[0] : queryStatus.query.toString(), value, false)
            let textIndex = 0
            const renderedText = sections.map((section) => {
              const style = (section.highlight === true ? {
                backgroundColor: 'yellow',
              } : null)
              let index = textIndex++
              return <Text key={'text-highlight-element-' + index} style={style}>{section.text}</Text>
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
    };

    render () {
      const {
        height,
        isOpen,
        mainDesc,
        bankTrans,
        isRtl,
        account,
        onEditCategory,
        onSetMinHeight,
        onSetMaxHeight,
        onToggle,
        onUpdate,
        onChangeMainDesc,
        isEditing,
        onStartEdit,
        onCancelChangeMainDesc,
        disabledEdit,
        queryStatus,
      } = this.props

      const mainDescs = mainDesc ? mainDesc.trim() : mainDesc

      const wrapperStyles = cs(
        isRtl,
        cs(isOpen, [styles.dataRow, styles.dataRowLevel2], styles.dataRowLevel2Active),
        commonStyles.rowReverse,
      )
      const total = getFormattedValueArray(bankTrans.total)
      const numberStyle = cs(bankTrans.hova, [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })

      return (
        <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
          <TouchableOpacity onPress={onToggle}>
            <View style={wrapperStyles} onLayout={onSetMinHeight}>
              <View style={cs(isRtl, styles.dataValueDescWrapperLevel2, commonStyles.rowReverse)}>
                <CustomIcon
                  name={getBankTransIcon(bankTrans.paymentDesc)}
                  size={18}
                  color={colors.blue8}
                />
                <View style={styles.dateDivider} />

                <ControlledEditableTextInput
                  isEditable={isOpen}
                  isEditing={isEditing}
                  onBlur={onCancelChangeMainDesc}
                  textInputStyle={styles.dataDescInput}
                  textStyle={cs(isOpen, [styles.dataValue, commonStyles.regularFont, { flex: 0 }], commonStyles.boldFont)}
                  value={(isEditing || !mainDescs.length) ? mainDescs : this.renderTextYellow(mainDescs)}
                  onChangeText={onChangeMainDesc}
                  onSubmit={onUpdate}
                />

                <View style={styles.dateDivider} />
              </View>

              <Text style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2]}>
                <Text
                  style={numberStyle}>{bankTrans.hova ? '-' : ''}{this.renderTextYellow(total[0], true)}</Text>
                <Text style={styles.fractionalPart}>.{this.renderTextYellow(total[1])}</Text>
              </Text>
            </View>
          </TouchableOpacity>

          <View onLayout={onSetMaxHeight}>
            <BankTransAdditionalInfo
              renderTextYellow={this.renderTextYellow}
              queryStatus={queryStatus}
              disabledEdit={disabledEdit}
              isRtl={isRtl}
              isEditing={isEditing}
              parentIsOpen={isOpen}
              account={account || {}}
              bankTrans={bankTrans}
              onEditCategory={onEditCategory}
              onStartEdit={onStartEdit}
              onSubmitEdit={onUpdate}
            />
          </View>
        </Animated.View>
      )
    }
}
