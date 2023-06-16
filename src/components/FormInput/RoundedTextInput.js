import React, {PureComponent} from 'react'
import {TextInput, TouchableOpacity, View} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {combineStyles as cs} from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles from './FormInputStyles'
import {colors} from 'src/styles/vars'

export default class RoundedTextInput extends PureComponent {
    static defaultProps = {
      isPassword: false,
      isInvalid: false,
    };

    constructor (props) {
      super(props)
      this.state = { isHideValue: true }
    }

    handleTogglePasswordVisibility = () => {
      const { isHideValue } = this.state
      this.setState({ isHideValue: !isHideValue })
    };

    render () {
      const { isHideValue } = this.state
      const {
        isInvalid,
        isPassword,
        textInputStyle,
        ...textInputProps
      } = this.props
      return (
        <View style={cs(isInvalid, [styles.roundedInputWrapper, commonStyles.spaceBetween], styles.invalid)}>
          {isPassword ? (
            <TouchableOpacity onPress={this.handleTogglePasswordVisibility}>
              {isHideValue
                ? <Icon name="eye-off-outline" size={19} color={colors.blue8} />
                : <Icon name="eye-outline" size={19} color={colors.blue8} />}
            </TouchableOpacity>
          ) : null}

          <TextInput
            style={[textInputStyle, {
              flex: 1,
              direction: 'ltr',
              textAlign: 'right',
            }]}
            multiline={false}
            secureTextEntry={isHideValue && isPassword}
            underlineColorAndroid="rgba(0,0,0,0)"
            {...textInputProps}
          />
        </View>
      )
    }
}
