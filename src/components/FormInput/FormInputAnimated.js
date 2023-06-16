import React, {PureComponent} from 'react'
import {TouchableOpacity, View} from 'react-native'
import {Hoshi} from 'react-native-textinput-effects'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import styles from './FormInputStyles'
import {colors, fonts} from '../../styles/vars'

export default class FormInputAnimated extends PureComponent {
  constructor(props) {
    super(props)
    this.state = {secureTextEntry: !!props.secureTextEntry}
  }

    handleTogglePasswordVisibility = () => {
      const { secureTextEntry } = this.state
      this.setState({ secureTextEntry: !secureTextEntry })
    };

    render () {
      const { style, secureTextEntry, borderBottomColor, ...inputProps } = this.props

      const newStyles = [
        styles.inputContainer,
        style,
      ]

      let inputStyle = {
        fontFamily: fonts.semiBold,
        fontWeight: 'normal',
        color: colors.blue29,
      }

      if (secureTextEntry) {
        newStyles.push(styles.controlContainer)
        inputStyle = {
          ...inputStyle,
          paddingRight: 20,
          textAlign: 'right',
          direction: 'rtl',
        }
      }

      return (
        <View style={[
          newStyles,
          {
            justifyContent: 'space-between',
          },
        ]}>

          <Hoshi
            {...inputProps}
            inputStyle={inputStyle}
            inputContainerStyle={{
              padding: 0,
            }}
            style={[
              {
                direction: 'rtl',
                textAlign: 'right',
                padding: 0,
              },
              styles.hoshiInput,
              (!borderBottomColor) ? {
                borderBottomWidth: 1,
                borderBottomColor: colors.blue3,
              } : {
                borderBottomWidth: 1,
                borderBottomColor: borderBottomColor,
              },
            ]}
            labelStyle={[
              styles.hoshiLabel,
              {
                direction: 'rtl',
                textAlign: 'right',
              },
            ]}
            borderColor={'transparent'}
            underlineColorAndroid="transparent"
            secureTextEntry={this.state.secureTextEntry}
          />

          {secureTextEntry ? (
            <TouchableOpacity style={styles.rightControl} onPress={this.handleTogglePasswordVisibility}>
              {this.state.secureTextEntry
                ? <Icon name="eye-outline" size={19} color={colors.blue29} />
                : <Icon name="eye-off-outline" size={19} color={colors.blue29} />}
            </TouchableOpacity>
          ) : null}
        </View>
      )
    }
}
