import React, {PureComponent} from 'react'
import {Text, TouchableOpacity, View} from 'react-native'
import {combineStyles as cs} from '../../utils/func'
import styles from './SwitchStyle'
import commonStyles from '../../styles/styles'

export default class Switch extends PureComponent {
    handlePress = (state) => () => {
        const {value, onPress} = this.props
        if (value === state) {return}
        onPress(state)
    };

    render() {
        const {value, firstBtnText, secondBtnText} = this.props

        return (
            <View style={styles.wrapper}>
                <TouchableOpacity style={commonStyles.justifyCenter} onPress={this.handlePress(false)}>
                    <Text style={cs(!value, [styles.text, commonStyles.textRight], commonStyles.semiBoldFont)}>
                        {firstBtnText}
                    </Text>
                </TouchableOpacity>

                <View style={styles.divider}/>

                <TouchableOpacity style={commonStyles.justifyCenter} onPress={this.handlePress(true)}>
                    <Text style={cs(value, [styles.text, commonStyles.textLeft], commonStyles.semiBoldFont)}>
                        {secondBtnText}
                    </Text>
                </TouchableOpacity>
            </View>
        )
    }
}
