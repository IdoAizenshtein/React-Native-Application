import React, {PureComponent} from 'react'
import {TextInput, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import {Button} from 'react-native-elements'
import {combineStyles as cs} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from './CategoriesStyles'

@withTranslation()
export default class Input extends PureComponent {
    render() {
        const {t, isRtl, onSubmit, onChange, value, inProgress} = this.props
        return (
            <View style={cs(isRtl, styles.inputWrapper, commonStyles.rowReverse)}>
                <TextInput
          style={styles.input}
          editable={!inProgress}
          selectTextOnFocus={!inProgress}
          placeholder={t('bankAccount:categoryName')}
          underlineColorAndroid="rgba(0,0,0,0)"
          onSubmitEditing={onSubmit}
          onChangeText={onChange}
          value={value}
        />
        <Button
          loading={inProgress}
          disabled={inProgress}
          onPress={onSubmit}
          buttonStyle={[commonStyles.blueBtn, styles.submitBtn]}
          containerViewStyle={{ marginLeft: 0, marginRight: 0 }}
          title={t('common:add')}
        />
      </View>
    )
  }
}
