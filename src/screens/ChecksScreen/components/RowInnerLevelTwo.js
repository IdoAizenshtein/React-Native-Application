import React, { PureComponent } from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import CustomIcon from '../../../components/Icons/Fontello'
import BankTransAdditionalInfo from './BankTransAdditionalInfo'
import {
  combineStyles as cs,
  getBankTransIcon,
  getFormattedValueArray,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../ChecksStyles'
import { colors } from '../../../styles/vars'
import EditableTextInput from '../../../components/FormInput/EditableTextInput'

export default class RowInnerLevelTwo extends PureComponent {
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
    } = this.props
    const wrapperStyles = cs(
      isRtl,
      cs(isOpen, [styles.dataRow, styles.dataRowLevel2],
        styles.dataRowLevel2Active),
      commonStyles.rowReverse,
    )
    const total = getFormattedValueArray(bankTrans.total)
    const numberStyle = cs(bankTrans.hova,
      [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })

    return (
      <Animated.View style={[styles.dataRowAnimatedWrapper, { height }]}>
        <TouchableOpacity onPress={onToggle}>
          <View style={wrapperStyles} onLayout={onSetMinHeight}>
            <View style={cs(isRtl, styles.dataValueDescWrapperLevel2,
              commonStyles.rowReverse)}>
              <CustomIcon
                name={getBankTransIcon(bankTrans.paymentDesc)}
                size={18}
                color={colors.blue8}
              />
              <View style={styles.dateDivider}/>

              <EditableTextInput
                isEditable={isOpen}
                textInputStyle={styles.dataDescInput}
                textStyle={cs(isOpen,
                  [styles.dataValue, commonStyles.regularFont, { flex: 0 }],
                  commonStyles.boldFont)}
                value={mainDesc}
                onChangeText={onChangeMainDesc}
                onSubmit={onUpdate}
              />

              <View style={styles.dateDivider}/>
            </View>

            <Text
              style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2]}>
              <Text style={numberStyle}>{total[0]}</Text>
              <Text style={styles.fractionalPart}>.{total[1]}</Text>
            </Text>
          </View>
        </TouchableOpacity>

        <View onLayout={onSetMaxHeight}>
          <BankTransAdditionalInfo
            isRtl={isRtl}
            parentIsOpen={isOpen}
            account={account || {}}
            bankTrans={bankTrans}
            onEditCategory={onEditCategory}
          />
        </View>
      </Animated.View>
    )
  }
}
