import React, { PureComponent } from 'react'
import { Text, View } from 'react-native'
import { fonts } from '../../styles/vars'
import { getFormattedValueArray, sp } from '../../utils/func'

export class TextPieCenter extends PureComponent {
  render () {
    const {
      selectedSlice,
    } = this.props
    const { label, value, income } = selectedSlice
    return (
      <View style={{
        position: 'absolute',
        width: 80,
        left: 70,
        zIndex: 9,
      }}>
        <Text
          style={{
            textAlign: 'center',
            color: '#0f3860',
            fontFamily: fonts.bold,
            fontSize: sp(16),
          }}>
          {`${label}`}
        </Text>
        <Text
          style={{
            textAlign: 'center',
            color: (income) ? '#278754' : '#ef3636',
            fontFamily: fonts.semiBold,
            fontSize: sp(18),
          }}>
          {(value) ? `${getFormattedValueArray(value)[0]}` : '-'}
        </Text>
      </View>
    )
  }
}
