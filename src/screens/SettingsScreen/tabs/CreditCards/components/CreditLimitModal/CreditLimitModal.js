import React, {PureComponent} from 'react'
import {Dimensions, InteractionManager, Keyboard, Modal, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import styles, {CREDIT_LIMIT_MODAL_HEIGHT} from './CreditLimitModalStyles'
import {getCurrencyChar} from 'src/utils/func'
import {IS_IOS} from '../../../../../../constants/common'

const winHeight = Dimensions.get('window').height
// const STATUS_BAR_HEIGHT = IS_IOS ? 20 : StatusBar.currentHeight
const inputWorkaround = (() => {
    let workaroundIncrement = 0
    const invisibleCharsArr = [
        String.fromCharCode(28),
        String.fromCharCode(29),
        String.fromCharCode(30),
        String.fromCharCode(31),
    ]
    return {
        getWorkaroundChar: () => {
            workaroundIncrement += 1
            const mod = workaroundIncrement % invisibleCharsArr.length
            return IS_IOS ? invisibleCharsArr[mod] : ''
        },
    }
})()
@withTranslation()
export default class CreditLimitModal extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            modalTop: -1000,
            value: props.total ? props.total.toString() : '',
        }
        this.inputRef = React.createRef();
    }

    handleClose = () => {
    }

    componentDidMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow)
        setTimeout(() => this.focusInputWithKeyboard(), 20)
    }

    focusInputWithKeyboard() {
        InteractionManager.runAfterInteractions(() => {
            this.inputRef.current.focus()
        });
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove()
    }

    keyboardDidShow = (e) => {
        this.setState({
            modalTop: winHeight - e.endCoordinates.height - CREDIT_LIMIT_MODAL_HEIGHT - 20,
        })
    }

    handleChangeValue = (value) => {
        const {currency} = this.props
        if (this.props.inProgress) {
            return
        }

        if (this.props.total) {
            if (this.props.allowPoint) {
                if (String(value).split('.').length > 2) {

                } else {
                    this.setState({value: value.toString().replace(/[^\d.]/g, '')})
                }
            } else {
                this.setState({value: value.toString().replace(/[^\d]/g, '')})
            }
        } else {
            const replace = getCurrencyChar(currency)
            const currencyConst = new RegExp(replace, 'g')
            this.setState({value: value.replace(currencyConst, '')})
        }
    }

    handleSubmit = () => {
        Keyboard.dismiss()
        return this.props.onSubmit(this.state.value)
    }

    render() {
        const {modalTop, value} = this.state
        const {t, onClose, inProgress, currency} = this.props

        return (
            <Modal
                transparent
                visible
                animationType="fade"
                onRequestClose={this.handleClose}
            >
                <View style={styles.creditLimitModalWrapper}>
                    <TouchableOpacity style={styles.hiddenArea} onPress={onClose}/>
                    <View style={[styles.creditLimitModalInner, {top: modalTop}]}>
                        <TextInput
                            style={styles.textInput}
                            ref={this.inputRef}
                            keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                            value={inputWorkaround.getWorkaroundChar() +
                            `${getCurrencyChar(currency)} ${value}`}
                            returnKeyType="done"
                            multiline={false}
                            autoCorrect={false}
                            underlineColorAndroid="transparent"
                            onChangeText={this.handleChangeValue}
                            onSubmitEditing={this.handleSubmit}
                            onEndEditing={(e) => {
                                if (this.props.allowPoint) {
                                    this.setState({
                                        value: e.nativeEvent.text.toString()
                                            .replace(/[^\d.]/g, ''),
                                    })
                                } else {
                                    this.setState({
                                        value: e.nativeEvent.text.toString()
                                            .replace(/[^\d]/g, ''),
                                    })
                                }
                            }}
                        />

                        <TouchableOpacity style={styles.saveBtnWrapper}
                                          onPress={this.handleSubmit}>
                            <Text style={styles.saveBtnText}>{inProgress
                                ? t('common:loading')
                                : t('common:update')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        )
    }
}
