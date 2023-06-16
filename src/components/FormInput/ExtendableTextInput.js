import React, { Fragment, PureComponent } from 'react'
import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import CustomIcon from 'src/components/Icons/Fontello'
import { combineStyles as cs } from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles from './FormInputStyles'
import { colors } from 'src/styles/vars'
import AlertModal from '../Modal/AlertModal'

@withTranslation()
export default class ExtendableTextInput extends PureComponent {
  static defaultProps = {
      isInvalid: false,
      maxLength: 16,
    };

    constructor (props) {
      super(props)
      this.state = { isTooltipOpen: false }
    }

    handleToggleTooltip = () => this.setState({ isTooltipOpen: !this.state.isTooltipOpen });

    render () {
      const { isTooltipOpen } = this.state
      const {
        t,
        value,
        isInvalid,
        isChecked,
        isMarked,
        label,
        description,
        tooltip,
        maxLength,
        onCheck,
        ...textInputProps
      } = this.props

      if (!isChecked) {
        return (
          <TouchableOpacity style={styles.roundedInputWrapper} onPress={onCheck}>
            <Text style={styles.expandedInputLabelText}>{label}</Text>
          </TouchableOpacity>
        )
      }

      return (
        <View style={cs(isInvalid, styles.expandedInputWrapper, styles.invalid)}>
          <View style={styles.expandedInputFirstRow}>
            <CustomIcon name="ok" size={15} color={colors.blue8} />

            <View style={[commonStyles.row, commonStyles.alignItemsCenter]}>
              {tooltip && (
                <Fragment>
                  <TouchableOpacity
                    style={styles.tooltipWrapper}
                    onPress={this.handleToggleTooltip}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <Text style={styles.tooltipText}>i</Text>
                  </TouchableOpacity>
                  <View style={{ marginHorizontal: 5 }} />
                </Fragment>
              )}

              {isMarked && (
                <Fragment>
                  <View style={styles.expandedMarkWrapper}>
                    <Text style={styles.expandedMarkText}>{t('common:recommended')}</Text>
                  </View>
                  <View style={{ marginHorizontal: 5 }} />
                </Fragment>
              )}

              <Text style={[styles.expandedInputLabelText, commonStyles.semiBoldFont]}>{label}</Text>
            </View>
          </View>

          <View style={{ flex: 1, width: '100%' }}>
            <Text style={styles.expandedInputLabelText}>{description}</Text>

            <TextInput
              style={styles.expandedTextInput}
              value={value}
              autoCapitalize="none"
              multiline={false}
              autoCorrect={false}
              underlineColorAndroid="transparent"
              maxLength={maxLength}
              {...textInputProps}
            />

            <Text style={styles.expandedInputCountText}>{`${value ? value.length : 0}/${maxLength}`}</Text>
          </View>

          {isTooltipOpen && (
            <AlertModal
              isOpen
              onClose={this.handleToggleTooltip}
              text={tooltip}
            />
          )}
        </View>
      )
    }
}
