import React, { PureComponent } from 'react'
import { Text, TextInput, View } from 'react-native'
import commonStyles from '../../styles/styles'

export default class ControlledEditableTextInput extends PureComponent {
  render () {
    const {
      isEditable,
      isEditing,
      textStyle,
      value,
      textInputStyle,
      onChangeText,
      onBlur,
      onSubmit,
    } = this.props

    if (isEditing) {
      return (
        <TextInput
          autoFocus
          style={[textInputStyle, {
            direction: 'ltr',
            textAlign: 'right',
          }]}
          value={value}
          multiline={false}
          onBlur={onBlur}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          underlineColorAndroid="rgba(0,0,0,0)"
        />
      )
    }

    if (isEditable) {
      return (
        <View style={[commonStyles.alignItemsCenter, commonStyles.row, commonStyles.justifyEnd, { flex: 1 }]}>
          <Text style={[textStyle, { textAlign: 'right' }]} numberOfLines={1}>{value}</Text>
        </View>
      )
    }

    return <Text style={[textStyle, { flex: 1 }]} numberOfLines={1}>{value}</Text>
  }
}
