import React, {PureComponent} from 'react'
import 'react-native-gesture-handler';
import {Modal, Text, TouchableOpacity, View,   SafeAreaView, } from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import {withTranslation} from 'react-i18next'
import CustomIcon from 'src/components/Icons/Fontello'
import styles from './ModalStyles'
import {colors} from 'src/styles/vars'

@withTranslation()
export default class AlertModal extends PureComponent {
    handleClose = () => {
    };

    render() {
        const {isOpen, text, onClose} = this.props

        return (
            <Modal
                transparent
                animationType="fade"
                visible={isOpen}
                onRequestClose={this.handleClose}
            >
                <TouchableOpacity style={styles.alertModalWrapper} onPress={onClose}>
                        <SafeAreaView style={{flex: 1, justifyContent: 'center', alignItems: 'center', width: '100%'}}>
                            <View style={styles.alertModalInner}>
                                <View style={styles.alertModalCloseBtn}>
                                    <CustomIcon name="times" size={14} color={colors.blue8}/>
                                </View>
                                <Text style={styles.alertModalText}>{text}</Text>
                            </View>
                        </SafeAreaView>
                </TouchableOpacity>
        </Modal>
      )
    }
}
