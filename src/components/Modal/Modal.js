import React, {PureComponent} from 'react'
import 'react-native-gesture-handler';
import {Modal as RNModal, Text, TouchableOpacity, View,} from 'react-native'
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {withTranslation} from 'react-i18next'
import styles from './ModalStyles'

@withTranslation()
export default class Modal extends PureComponent {
    get headerLeft() {
        const {onLeftPress, leftComponent, leftText} = this.props

        return (
            onLeftPress && (
                <TouchableOpacity
                    onPress={onLeftPress}
                    hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                >
                    {leftComponent || <Text style={styles.headerBtnText}>{leftText || 'onLeftPress'}</Text>}
                </TouchableOpacity>
            )
        )
    }

    get headerRight() {
        const {onRightPress, rightComponent, rightText, activeOpacity} = this.props

        return (
            onRightPress && (
                <TouchableOpacity
                    activeOpacity={(!activeOpacity) ? 0.2 : 1}
                    onPress={onRightPress}
                    hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
                >
                    {rightComponent || <Text
                        style={[styles.headerBtnText, {opacity: (!activeOpacity) ? 1 : 0.5}]}>{rightText || 'onRightPress'}</Text>}
                </TouchableOpacity>
            )
        )
    }

    handleClose = () => {
    };

    render() {
        const {
            isOpen,
            title,
            children,
        } = this.props

        return (
            <RNModal
                transparent
                animationType="fade"
                visible={isOpen}
                onRequestClose={this.handleClose}
            >
                <View style={styles.modalWrapper}>
                    <View style={styles.modalInner}>
                        <SafeAreaProvider>

                        <SafeAreaView style={{flex: 1}}>
                            <View style={styles.modalHeader}>
                                <View style={styles.leftHeaderPart}>
                                    {this.headerLeft}
                                </View>

                                <View style={styles.centerHeaderPart}>
                                    {title && <Text style={styles.modalTitle}>{title}</Text>}
                                </View>

                                <View style={styles.rightHeaderPart}>
                                    {this.headerRight}
                                </View>
                            </View>

                            {children}

                        </SafeAreaView>
                        </SafeAreaProvider>
                    </View>
                </View>
            </RNModal>
        )
    }
}
