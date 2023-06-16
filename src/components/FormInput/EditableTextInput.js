import React, {PureComponent} from 'react'
import {Text, TextInput, TouchableOpacity, View} from 'react-native'
import CustomIcon from '../Icons/Fontello'
import styles from 'src/screens/BankAccountsScreen/BankAccountsStyles'
import commonStyles from 'src/styles/styles'
import {colors} from 'src/styles/vars'

export default class EditableTextInput extends PureComponent {
    state = {
      isEdit: false,
    };

    handleToggle = () => {
      this.setState({ isEdit: !this.state.isEdit })
      if (this.props.handleToggleIsEdit) {
        this.props.handleToggleIsEdit(this.state.isEdit)
      }
    };

    handleSubmit = () => {
      const { onSubmit } = this.props
      this.setState({ isEdit: false })
      if (typeof onSubmit === 'function') {return onSubmit()}
    };

    UNSAFE_componentWillReceiveProps (nextProps) {
      if (nextProps.isEditProp !== this.props.isEditProp) {
        this.setState({ isEdit: nextProps.isEditProp })
      }
    }

    render () {
      const { isEditable, textStyle, value, textInputStyle, onChangeText, hideIcon, maxLength } = this.props
      const { isEdit } = this.state

      if (isEdit) {
        return (
          <TextInput
            maxLength={null || maxLength}
            autoFocus
            style={[textInputStyle, {
              direction: 'ltr',
              textAlign: 'right',
            }]}
            value={value}
            multiline={false}
            onChangeText={onChangeText}
            onBlur={this.handleSubmit}
            onSubmitEditing={this.handleSubmit}
            underlineColorAndroid="rgba(0,0,0,0)"
          />
        )
      }

      if (isEditable) {
        return (
          <TouchableOpacity
            onPress={this.handleToggle}
            style={[commonStyles.alignItemsCenter, commonStyles.row, commonStyles.justifyEnd, { flex: 1 }]}
          >
            {!hideIcon && (
              <View style={styles.categoryEditBtnWrapper}>
                <CustomIcon
                  name="pencil"
                  size={18}
                  color={colors.blue7}
                />
              </View>
            )}
            {!hideIcon && (
              <View style={commonStyles.spaceDividerDouble} />
            )}
            <Text style={[textStyle, { textAlign: 'right' }]} numberOfLines={1}>{value}</Text>
          </TouchableOpacity>
        )
      }

      return <Text style={[textStyle, { flex: 1 }]} numberOfLines={1}>{value}</Text>
    }
}
