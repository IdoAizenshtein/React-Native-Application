import React, {Fragment, PureComponent} from 'react'
import {Animated, Image, Text, TouchableOpacity, View} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import CustomIcon from '../../components/Icons/Fontello'
import {Divider} from 'react-native-elements'
import {combineStyles as cs, sp} from '../../utils/func'
import {colors, fonts} from '../../styles/vars'
import styles from './DropdownPanelStyles'
import commonStyles from '../../styles/styles'
import {DrawerActions} from '@react-navigation/native'
import {COMPANY_INFO} from '../../constants/config'

const AnimatedIcon = Animated.createAnimatedComponent(Icon)

export default class DropdownPanel extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            height: new Animated.Value(63),
            maxHeight: 0,
            minHeight: 0,
        }
    }

    // state = {
    //     height: new Animated.Value(63),
    //     maxHeight: 0,
    //     minHeight: 0,
    // }

    menuClose = () => {
        const {minHeight, maxHeight, height} = this.state
        const initialValue = maxHeight + minHeight
        const finalValue = minHeight
        // //console.log(initialValue)

        height.setValue(initialValue)
        Animated.timing(height, {
            toValue: finalValue,
            duration: 200,
            useNativeDriver: false,
        }).start()
    }

    menuOpen = () => {
        const {minHeight, maxHeight, height} = this.state
        const initialValue = minHeight
        const finalValue = maxHeight + minHeight
        // console.log(initialValue)

        height.setValue(initialValue)
        Animated.timing(height, {
            toValue: finalValue,
            duration: 200,
            useNativeDriver: false,
        }).start()
    }

    handleTitlePress = () => {
        const {items, name, onMenuToggle, index, notActive} = this.props
        if (items) {
            return onMenuToggle()
        }
        if (notActive && (COMPANY_INFO.trialBlocked || (COMPANY_INFO.budgetPopUpType && (COMPANY_INFO.budgetPopUpType === 2 || COMPANY_INFO.budgetPopUpType === 3)))) {
            if (name === 'BUDGET') {
                if (COMPANY_INFO.budgetExpiredDays === 0) {
                    COMPANY_INFO.badgetPopup = true
                    this.handleCloseDrawer()
                } else if (COMPANY_INFO.budgetExpiredDays > 0) {
                    this.props.onLinkPress(name, index)
                }
            } else if (COMPANY_INFO.trialBlocked) {
                COMPANY_INFO.trialBlockedPopup = true
                this.handleCloseDrawer()
            } else {
                if (name === 'PACKAGES') {
                    this.props.onLinkPress(name, index)
                } else {
                    this.handleCloseDrawer()
                }
            }
        } else {
            COMPANY_INFO.trialBlockedPopup = false
            this.props.onLinkPress(name, index)
        }
    }

    handleDiamondPress = () => {
        if (COMPANY_INFO.budgetPopUpType && (COMPANY_INFO.budgetPopUpType === 2 || COMPANY_INFO.budgetPopUpType === 3)) {
            COMPANY_INFO.badgetPopup = true
            this.handleCloseDrawer()
        }
    }

    setMinHeight = (e) => this.setState({minHeight: e.nativeEvent.layout.height})

    setMaxHeight = (e) => {
        this.setState({maxHeight: e.nativeEvent.layout.height}, () => {
            if (this.props.isOpen) {
                this.menuOpen()
            }
        })
    }

    handleLinkPress = (screenName) => () => this.props.onLinkPress(screenName)

    handleCloseDrawer = () => this.props.navigation.dispatch(DrawerActions.closeDrawer())

    UNSAFE_componentWillReceiveProps({isOpen, items}) {
        if (!items) {
            return
        }
        if (this.props.isOpen && !isOpen) {
            return this.menuClose()
        }
        if (!this.props.isOpen && isOpen) {
            return this.menuOpen()
        }
    }

    getActiveRouteName = (state) => {
        const route = state.routes[state?.index || 0]

        if (route.state) {
            // Dive into nested navigators
            return this.getActiveRouteName(route.state)
        }

        return route.name
    }

    render() {
        const {height} = this.state
        const {title, items, isRtl, icon, isFirst, isLast, isOpen, notActive, name, state} = this.props
        const navigationState = state
        const divider = <Divider style={[
            cs(isRtl, styles.divider, styles.dividerRtl), {
                backgroundColor: '#b9b9b9',
            }]}/>

        const routeName = this.getActiveRouteName(navigationState)

        return (
            <Fragment>
                {(!isFirst && !isOpen) && divider}

                <Animated.View style={cs(isRtl, [styles.container, {height}], styles.containerRtl)}>
                    <View style={cs(isRtl, cs(isOpen, styles.titleContainer, styles.active), styles.titleContainerRtl)}>
                        <View
                            style={cs(isRtl, styles.titleWrapper, styles.titleWrapperRtl)}
                            onLayout={this.setMinHeight}>
                            <TouchableOpacity
                                style={cs(isRtl, styles.titleItem, styles.titleItemRtl)}
                                onPress={this.handleTitlePress}>
                                {icon && icon !== 'RECOMMENDATION' && icon !== 'HELP' && icon !== 'mutavimMenu' &&
                                <CustomIcon name={icon} size={25}
                                            color={isOpen ? colors.white : (!notActive) ? (isOpen ? colors.white : colors.blue3) : '#f3c935'}/>}
                                {icon && icon === 'RECOMMENDATION' && !notActive && (
                                    <Image
                                        style={[styles.imgIcon, {width: 25, height: 25}]}
                                        source={require('BiziboxUI/assets/RECOMMENDATION.png')}
                                    />
                                )}
                                {icon && icon === 'RECOMMENDATION' && notActive && (
                                    <Image
                                        style={[styles.imgIcon, {width: 25.5, height: 25.5}]}
                                        source={require('BiziboxUI/assets/RECOMMENDATIONLight.png')}
                                    />
                                )}
                                {icon && icon === 'mutavimMenu' && (
                                    <Image
                                        style={[styles.imgIcon, {width: 26.5, height: 16.5}]}
                                        source={require('BiziboxUI/assets/mutavimMenu.png')}
                                    />
                                )}
                                {icon && icon === 'HELP' && (
                                    <View style={[{
                                        width: 25,
                                        height: 25,
                                        borderWidth: 1,
                                        borderColor: colors.blue3,
                                        borderRadius: 20,
                                    }]}>
                                        <Text style={{
                                            fontFamily: fonts.regular,
                                            color: colors.blue3,
                                            fontSize: sp(16),
                                            lineHeight: 25,
                                            textAlign: 'center',
                                        }}>
                                            {'?'}
                                        </Text>
                                    </View>
                                )}
                                <Text style={[cs(isOpen, styles.title, styles.titleActive), {
                                    color: isOpen ? colors.white : (!notActive) ? colors.blue4 : '#f3c935',
                                }]}>{title}</Text>

                                {(notActive && name && name === 'BUDGET') && (
                                    <TouchableOpacity
                                        style={{
                                            marginLeft: 'auto',
                                        }}
                                        onPress={this.handleDiamondPress}
                                    >
                                        {isOpen && (
                                            <Image
                                                style={[styles.imgIcon, {width: 29, height: 29, marginLeft: 'auto'}]}
                                                source={require('BiziboxUI/assets/diamondLightNavWhite.png')}
                                            />
                                        )}
                                        {!isOpen && (
                                            <Image
                                                style={[styles.imgIcon, {width: 29, height: 29, marginLeft: 'auto'}]}
                                                source={require('BiziboxUI/assets/diamondLightNav.png')}
                                            />
                                        )}
                                    </TouchableOpacity>
                                )}
                                {(notActive && name && name !== 'BUDGET' && isOpen) && (
                                    <Image
                                        style={[styles.imgIcon, {width: 29, height: 29, marginLeft: 'auto'}]}
                                        source={require('BiziboxUI/assets/diamondLightNavWhite.png')}
                                    />
                                )}
                                {(notActive && name && name !== 'BUDGET' && !isOpen) && (
                                    <Image
                                        style={[styles.imgIcon, {width: 29, height: 29, marginLeft: 'auto'}]}
                                        source={require('BiziboxUI/assets/diamondLightNav.png')}
                                    />
                                )}
                            </TouchableOpacity>

                            {items && (
                                <AnimatedIcon
                                    size={18}
                                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                                    color={isOpen ? colors.white : colors.blue4}
                                />
                            )}
                        </View>
                    </View>

                    {items && (
                        <View style={cs(isRtl, styles.body, styles.bodyRtl)} onLayout={this.setMaxHeight}>
                            {items.map(item => (
                                <TouchableOpacity
                                    key={`${item.title}_${item.name}`}
                                    style={cs(isRtl, styles.childWrapper, styles.childWrapperRtl)}
                                    onPress={routeName === item.name ? this.handleCloseDrawer : this.handleLinkPress(item.name)}
                                >
                                    {/* <Icon name='circle' size={8} color={colors.green3} /> */}
                                    <Text style={[cs(isRtl, styles.childTitle, commonStyles.textRight), {
                                        fontFamily: routeName === item.name ? fonts.bold : fonts.regular,
                                    }]}>{item.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                </Animated.View>

                {isLast && divider}
            </Fragment>
        )
    }
}
