import React, {Fragment, PureComponent} from 'react'
import {withTranslation} from 'react-i18next'
import {Image, Keyboard, Linking, Modal, RefreshControl, Text, TextInput, TouchableOpacity, View, SafeAreaView} from 'react-native'
// import {SafeAreaView} from 'react-native-safe-area-context';
import {colors, fonts} from '../../../../styles/vars'
import {
    checkMailExistsApi,
    getUserSettingsApi,
    sendSmsApi,
    turnOffTwoPhaseForUserApi,
    turnOnTwoPhaseForUseApi,
    updateUserApi,
    updateUserMailApi,
} from '../../../../api'
import styles from '../../../../components/EditRowModal/EditRowModalStyles'
import commonStyles from '../../../../styles/styles'
import {combineStyles as cs, getEmoji, sp} from '../../../../utils/func'
import {IS_IOS} from '../../../../constants/common'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {Button, Icon} from 'react-native-elements'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import {changePassword, logout} from '../../../../redux/actions/auth'
import {connect} from 'react-redux'
import jwtDecode from 'jwt-decode'

@connect(state => ({
    token: state.token,
}))
@withTranslation()
export default class MyAccountTab extends PureComponent {
    constructor(props) {
        super(props)
        let username
        try {
            const decodedToken = jwtDecode(this.props.token)
            username = decodedToken && decodedToken.sub
        } catch (e) {
            username = null
        }

        this.state = {
            username,
            userSettings: {},
            refreshing: false,
            inProgress: false,
            activatedModalIsOpen: false,
            stepMail: 2,
            activated: false,
            mail: '',
            emailExists: false,
            mailIsHebrew: false,
            mailValid: true,
            secureTextEntry: false,
            secureTextEntryRepeat: false,
            password: '',
            passwordValid: true,
            errPass: false,
            changePasswordModalIsOpen: false,
            confirmPassword: '',
            oldPassword: '',
            oldPasswordValid: true,
            authenticationTypeModalIsOpen: false,
            authenticationTypeStep: 1,
            smsInfo: {},
            code: '',
            codeValid: true,
            secureTextEntryCode: false,
            errTurn: false,
            successTurnTwoPhaseForUse: false,
        }
    }

    get currentCompany() {
        const {companies, currentCompanyId} = this.props
        if (!companies || !companies.length) {
            return {}
        }
        return companies.find(c => c.companyId === currentCompanyId) || {}
    }

    getUserSettings = () => {
        getUserSettingsApi.get()
            .then((userSettings) => {
                this.setState({
                    userSettings,
                    refreshing: false,
                })
            })
    }

    componentDidMount() {
        this.getUserSettings()
    }

    _onRefresh = (isRefresh) => {
        this.setState(
            {refreshing: (!(isRefresh !== undefined && isRefresh === false))})
        this.getUserSettings()
    }

    handleUpdateFieldFirstLast = name => val => {
        let value = val || ''
        value = value.toString().replace(getEmoji(), '')

        let userSettings = Object.assign({}, this.state.userSettings)
        userSettings[name] = value
        this.setState({userSettings})
    }

    handleUpdateUser = () => {
        const {
            inProgress,
            userSettings,
        } = this.state

        if (inProgress || !(
            String(userSettings.firstName).length > 0 &&
            String(userSettings.lastName).length > 0
        )) {
            return
        }

        Keyboard.dismiss()
        this.setState({inProgress: true})
        const obj = {
            'firstName': userSettings.firstName,
            'lastName': userSettings.lastName,
        }
        updateUserApi.post({
            body: obj,
        })
            .then(() => {
                this.setState({inProgress: false})
                this._onRefresh(false)
            })
            .catch(() => {
                this.setState({inProgress: false})
            })
    }

    handleUpdateField = name => val => {
        let value = val || ''
        value = value.toString().replace(getEmoji(), '').replace(/\s+/g, '')
        if (name === 'password' || name === 'code') {
            this.setState(
                {[name]: value.toString().replace(/([\u05D0-\u05FF/\s+]+)/g, '')})
            this.handleUpdateFieldValid(`${name}Valid`)({
                nativeEvent: {
                    text: value,
                },
            })
        } else {
            this.setState({[name]: value})
            this.handleUpdateFieldValid('mailValid')({
                nativeEvent: {
                    text: value,
                },
            })
        }
    }
    handleUpdateFieldValid = name => val => {
        let value = val.nativeEvent.text || ''

        if (name === 'passwordValid' || name === 'oldPasswordValid') {
            if (name === 'passwordValid' && value === this.state.username) {
                this.setState({[name]: true})
            } else {
                this.setState({
                    [name]: !(!value || value.length < 8 || value.length >= 12 ||
                        value.replace(/[^\d]/g, '').length === 0 ||
                        value.replace(/[^A-Za-z]/g, '').length === 0),
                })
            }
        } else if (name === 'mailValid') {
            const re = /\S+@\S+\.\S+/
            const isHebrew = (value && /[\u0590-\u05FF]/.test(value))
            const mailValid = (value && re.test(value) && value.length > 0)
            this.setState({
                [name]: mailValid,
                mailIsHebrew: isHebrew,
            })
            if (mailValid) {
                setTimeout(() => this.handleUpdateFieldValidAsync({
                    nativeEvent: {
                        text: value,
                    },
                }), 300)
            }
        } else if (name === 'codeValid') {
            this.setState({[name]: value && value.length > 0})
        }
    }
    handleTogglePasswordVisibility = () => {
        const {secureTextEntry} = this.state
        this.setState({secureTextEntry: !secureTextEntry})
    }
    handleUpdateFieldValidAsync = (e) => {
        const {mail} = this.state
        const re = /\S+@\S+\.\S+/

        let val = (IS_IOS ? e.nativeEvent.text : mail) || ''
        if (val && re.test(val) && val.length > 0) {
            checkMailExistsApi.post({
                body: val,
            }).then((data) => {
                this.setState({emailExists: data})
            }).catch(() => {

            })
        } else {
            const isHebrew = (val && /[\u0590-\u05FF]/.test(val))
            this.setState({
                'mailValid': false,
                mailIsHebrew: isHebrew,
                emailExists: false,
            })
        }
    }
    handleUpdateMail = () => {
        const {mail, mailValid, passwordValid, emailExists, inProgress, password, stepMail} = this.state

        if (stepMail === 2) {
            if (inProgress || !(
                mailValid && passwordValid && !emailExists && password.length > 0 &&
                mail.length > 0
            )) {
                return
            }
        }

        Keyboard.dismiss()

        this.setState({
            inProgress: true,
            errPass: false,
        })
        return updateUserMailApi.post({
            body: {
                mail: mail,
                password: password,
            },
        })
            .then((data) => {
                this.setState({
                    inProgress: false,
                    stepMail: 3,
                })
                this.getUserSettings()
            })
            .catch(() => {
                this.setState({
                    inProgress: false,
                    errPass: true,
                })
            })
    }
    activatedModalClose = () => {
        if (this.state.stepMail === 3) {
            this.handleCloseAlertActivated()
        }
        this.setState({
            stepMail: 2,
            activatedModalIsOpen: false,
        })
    }
    handleCloseAlertActivated = () => {
        this.setState({
            activated: false,
        })
    }

    changePasswordModalClose = () => {
        this.setState({
            changePasswordModalIsOpen: false,
        })
    }

    activated = () => {
        this.setState({
            secureTextEntry: false,
            mail: '',
            emailExists: false,
            mailIsHebrew: false,
            mailValid: true,
            stepMail: 2,
            activatedModalIsOpen: true,
            password: '',
            passwordValid: true,
            inProgress: false,
            errPass: false,
        })
    }

    handleChangePassword = () => {
        const {password, confirmPassword, inProgress, oldPassword, username} = this.state
        const {dispatch} = this.props
        if (username === password || !oldPassword || oldPassword.length === 0 ||
            !password || password !== confirmPassword || inProgress ||
            password.length < 8 || password.length >= 12 ||
            password.replace(/[^\d]/g, '').length === 0 ||
            password.replace(/[^A-Za-z]/g, '').length === 0) {
            return
        }
        Keyboard.dismiss()
        this.setState({
            inProgress: true,
            errPass: false,
        })

        return dispatch(changePassword(password, oldPassword))
            .then(() => {
                this.setState({
                    secureTextEntry: false,
                    secureTextEntryRepeat: false,
                    password: '',
                    passwordValid: true,
                    inProgress: false,
                    errPass: false,
                    confirmPassword: '',
                    changePasswordModalIsOpen: false,
                    oldPassword: '',
                    oldPasswordValid: true,
                })
            })
            .catch(err => {
                if (err.status === 401) {
                    this.props.dispatch(logout())
                    this.setScreen('LOGIN')
                }

                this.setState({
                    inProgress: false,
                    errPass: true,
                })
                // Toast.show(getErrText(err), Toast.LONG, Toast.BOTTOM)
            })
    }

    changePassword = () => {
        this.setState({
            secureTextEntry: false,
            secureTextEntryRepeat: false,
            password: '',
            passwordValid: true,
            inProgress: false,
            errPass: false,
            confirmPassword: '',
            changePasswordModalIsOpen: true,
            oldPassword: '',
            oldPasswordValid: true,
        })
    }
    handleTogglePasswordVisibilityDyna = () => {
        this.setState({secureTextEntryRepeat: !this.state.secureTextEntryRepeat})
    }

    authenticationTypeModalOpen = () => {
        this.setState({
            authenticationTypeModalIsOpen: true,
            authenticationTypeStep: 1,
            smsInfo: {},
            inProgress: false,
            errTurn: false,
            codeValid: true,
            successTurnTwoPhaseForUse: false,
        })
    }

    authenticationTypeModalClose = () => {
        this.setState({
            authenticationTypeModalIsOpen: false,
            authenticationTypeStep: 1,
            smsInfo: {},
            inProgress: false,
            errTurn: false,
            codeValid: true,
        })
    }

    handleSendSms = () => {
        sendSmsApi.post()
            .then((smsInfo) => {
                this.setState({
                    authenticationTypeStep: 2,
                    smsInfo,
                    inProgress: false,
                    errTurn: false,
                    codeValid: true,
                })
            })
    }

    handleToggleCodeVisibility = () => {
        const {secureTextEntryCode} = this.state
        this.setState({secureTextEntryCode: !secureTextEntryCode})
    }

    handleTurnTwoPhaseForUse = () => {
        const {code, inProgress, smsInfo, userSettings} = this.state
        if (!code || code.length === 0 || inProgress) {
            return
        }
        Keyboard.dismiss()
        this.setState({
            inProgress: true,
            errTurn: false,
            codeValid: true,
        })

        const turnTwoPhaseForUse = userSettings.authenticationType === 'REGULAR'
            ? turnOnTwoPhaseForUseApi
            : turnOffTwoPhaseForUserApi
        turnTwoPhaseForUse.post({
            headers: {
                otpToken: smsInfo.token,
                otpCode: code,
            },
        })
            .then(() => {
                this.setState({
                    inProgress: false,
                    errTurn: false,
                    codeValid: true,
                    successTurnTwoPhaseForUse: true,
                })
                this.authenticationTypeModalClose()
                this.getUserSettings()
                setTimeout(() => {
                    this.setState({successTurnTwoPhaseForUse: false})
                }, 2000)
            })
            .catch(() => {
                this.setState({
                    inProgress: false,
                    errTurn: true,
                    codeValid: false,
                })
            })
    }

    render() {
        const {isRtl, t} = this.props

        const {
            userSettings,
            refreshing,
            activatedModalIsOpen,
            inProgress,
            mail,
            emailExists,
            mailValid,
            mailIsHebrew,
            passwordValid,
            password,
            secureTextEntry,
            stepMail,
            errPass,
            changePasswordModalIsOpen,
            confirmPassword,
            secureTextEntryRepeat,
            oldPassword,
            oldPasswordValid,
            authenticationTypeModalIsOpen,
            authenticationTypeStep,
            smsInfo,
            code,
            codeValid,
            secureTextEntryCode,
            errTurn,
            successTurnTwoPhaseForUse,
            username,
        } = this.state

        return (
            <SafeAreaView style={[
                {
                    flex: 1,
                    height: '100%',
                    position: 'relative',
                    backgroundColor: colors.white,
                }]}>

                {successTurnTwoPhaseForUse && (
                    <View style={{
                        position: 'absolute',
                        backgroundColor: '#f9f3cf',
                        width: '100%',
                        left: 0,
                        right: 0,
                        top: 0,
                        height: 50,
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 999999,
                    }}>
                        <Text style={{
                            color: '#022258',
                            fontSize: sp(16),
                            textAlign: 'center',
                            fontFamily: fonts.regular,
                        }}>{'כניסה מחמירה '} {userSettings.authenticationType !== 'REGULAR'
                            ? 'הופעלה'
                            : 'בוטלה'}
                        </Text>
                    </View>
                )}
                <KeyboardAwareScrollView
                    keyboardShouldPersistTaps="handled"
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                    extraHeight={40}
                    enableOnAndroid
                    scrollEnabled
                    extraScrollHeight={40}
                    showsVerticalScrollIndicator={false}
                    style={{
                        backgroundColor: 'white',
                        flex: 1,
                        position: 'relative',
                        maxHeight: '100%',
                    }}
                    contentContainerStyle={[
                        {
                            flexGrow: 1,
                            paddingTop: 0,
                            overflow: 'hidden',
                            paddingBottom: 0,
                        }]}
                    scrollEventThrottle={16}>

                    <View style={{
                        paddingRight: 20,
                        marginTop: 20,
                    }}>
                        <View style={{
                            height: 50,
                        }}>
                            <Text style={{
                                color: '#022258',
                                fontSize: sp(18),
                                textAlign: 'right',
                                fontFamily: fonts.semiBold,
                            }}>{'פרטים אישיים'}</Text>
                        </View>

                        <View
                            style={[
                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                    height: 42,
                                    marginBottom: 8,
                                }]}>
                            <View style={{flex: 1.95}}>
                                <Text style={{
                                    textAlign: 'right',
                                    color: '#0f3860',
                                    fontSize: sp(14),
                                    fontFamily: fonts.regular,
                                    lineHeight: 42,
                                }}>שם פרטי</Text>
                            </View>
                            <View style={[
                                {
                                    flex: 5.73,
                                    backgroundColor: '#f5f5f5',
                                    paddingHorizontal: 21,
                                    borderBottomRightRadius: 20,
                                    borderTopRightRadius: 20,
                                    borderColor: colors.red,
                                    borderWidth: (userSettings &&
                                        String(userSettings.firstName).length > 0) ? 0 : 1,
                                }]}>
                                <TextInput
                                    editable
                                    onEndEditing={this.handleUpdateUser}
                                    onBlur={this.handleUpdateUser}
                                    autoCorrect={false}
                                    autoCapitalize="sentences"
                                    returnKeyType="done"
                                    keyboardType="default"
                                    underlineColorAndroid="transparent"
                                    style={[
                                        {
                                            textAlign: 'right',
                                            color: '#0f3860',
                                            height: 42,
                                            fontSize: sp(15),
                                            width: '100%',
                                        }, commonStyles.regularFont]}
                                    onSubmitEditing={this.handleUpdateUser}
                                    onChangeText={this.handleUpdateFieldFirstLast('firstName')}
                                    value={userSettings.firstName}
                                />
                            </View>
                        </View>

                        <View
                            style={[
                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                    height: 42,
                                    marginBottom: 8,
                                }]}>
                            <View style={{flex: 1.95}}>
                                <Text style={{
                                    textAlign: 'right',
                                    color: '#0f3860',
                                    fontSize: sp(14),
                                    lineHeight: 42,
                                    fontFamily: fonts.regular,
                                }}>שם משפחה</Text>
                            </View>
                            <View style={[
                                {
                                    flex: 5.73,
                                    backgroundColor: '#f5f5f5',
                                    paddingHorizontal: 21,
                                    borderBottomRightRadius: 20,
                                    borderTopRightRadius: 20,
                                    borderWidth: (userSettings &&
                                        String(userSettings.lastName).length > 0) ? 0 : 1,
                                    borderColor: colors.red,
                                }]}>
                                <TextInput
                                    editable
                                    onEndEditing={this.handleUpdateUser}
                                    onBlur={this.handleUpdateUser}
                                    autoCorrect={false}
                                    autoCapitalize="sentences"
                                    returnKeyType="done"
                                    keyboardType="default"
                                    underlineColorAndroid="transparent"
                                    style={[
                                        {
                                            textAlign: 'right',
                                            color: '#0f3860',
                                            height: 42,
                                            fontSize: sp(15),
                                            width: '100%',
                                        }, commonStyles.regularFont]}
                                    onSubmitEditing={this.handleUpdateUser}
                                    onChangeText={this.handleUpdateFieldFirstLast('lastName')}
                                    value={userSettings.lastName}
                                />
                            </View>
                        </View>

                        <View
                            style={[
                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                    height: 42,
                                    marginBottom: 8,
                                }]}>
                            <View style={{flex: 1.95}}>
                                <Text style={{
                                    textAlign: 'right',
                                    color: '#0f3860',
                                    fontSize: sp(14),
                                    lineHeight: 42,
                                    fontFamily: fonts.regular,
                                }}>טלפון נייד</Text>
                            </View>
                            <View style={[
                                {
                                    flex: 5.73,
                                    backgroundColor: '#f5f5f5',
                                    opacity: 0.6,
                                    paddingHorizontal: 21,
                                    borderBottomRightRadius: 20,
                                    borderTopRightRadius: 20,
                                }]}>
                                <TextInput
                                    editable={false}
                                    maxLength={11}
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                    keyboardType="numeric"
                                    underlineColorAndroid="transparent"
                                    style={[
                                        {
                                            color: '#0f3860',
                                            height: 42,
                                            fontSize: sp(15),
                                            textAlign: 'left',
                                            width: '100%',
                                        }, commonStyles.regularFont]}
                                    value={userSettings.cellPhone}
                                />
                            </View>
                        </View>

                        <View
                            style={[
                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                    height: 42,
                                    marginBottom: 8,
                                }]}>
                            <View style={{flex: 1.95}}>
                                <Text style={{
                                    textAlign: 'right',
                                    color: '#0f3860',
                                    fontSize: sp(14),
                                    lineHeight: 42,
                                    fontFamily: fonts.regular,
                                }}>מייל</Text>
                            </View>
                            <View style={[
                                {
                                    flex: 5.73,
                                    opacity: 0.6,
                                    backgroundColor: '#f5f5f5',
                                    paddingHorizontal: 21,
                                    borderBottomRightRadius: 20,
                                    borderTopRightRadius: 20,
                                }]}>
                                <TextInput
                                    editable={false}
                                    style={[
                                        {
                                            color: '#0f3860',
                                            height: 42,
                                            fontSize: sp(15),
                                            textAlign: 'left',
                                            width: '100%',
                                        }, commonStyles.regularFont]}
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                    keyboardType="email-address"
                                    underlineColorAndroid="transparent"
                                    value={userSettings.mail}
                                />
                            </View>
                        </View>

                        <TouchableOpacity onPress={this.activated}
                                          style={{
                                              height: 30,
                                              flexDirection: 'row-reverse',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              alignSelf: 'flex-start',
                                              paddingHorizontal: 21,
                                          }}>
                            <Image
                                resizeMode="contain"
                                style={{
                                    width: 10,
                                    height: 17,
                                    marginHorizontal: 5,
                                }}
                                source={require('BiziboxUI/assets/iconKey.png')}/>
                            <Text style={{
                                color: '#2aa1d9',
                                fontSize: sp(15),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                            }}>{'החלפת מייל'}</Text>
                        </TouchableOpacity>

                        <View style={{
                            marginVertical: 20,
                            backgroundColor: '#eaeaea',
                            flex: 1,
                            height: 1,
                        }}/>

                        <View style={{
                            height: 50,
                        }}>
                            <Text style={{
                                color: '#022258',
                                fontSize: sp(18),
                                textAlign: 'right',
                                fontFamily: fonts.semiBold,
                            }}>{'בינלאומי'}</Text>
                        </View>

                        <View style={{
                            flexDirection: 'row-reverse',
                            height: 42,
                            marginBottom: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Text style={{
                                flex: 1.95,
                                textAlign: 'right',
                                color: '#0f3860',
                                fontSize: sp(14),
                                lineHeight: 42,
                                height: 42,
                                fontFamily: fonts.regular,
                            }}>{'שפת הממשק'}</Text>

                            <View style={{
                                backgroundColor: '#f5f5f5',
                                borderTopRightRadius: 20,
                                borderBottomRightRadius: 20,
                                height: 42,
                                flex: 5.73,
                                opacity: 0.6,
                                justifyContent: 'center',
                            }}>
                                <Text style={{
                                    paddingHorizontal: 21,
                                    color: '#0f3860',
                                    height: 42,
                                    fontSize: sp(15),
                                    lineHeight: 42,
                                    textAlign: 'right',
                                    fontFamily: fonts.regular,
                                }}>{(userSettings.language && userSettings.language === 'HEB')
                                    ? 'עברית'
                                    : userSettings.language}</Text>
                            </View>
                        </View>
                        <View style={{
                            flexDirection: 'row-reverse',
                            height: 42,
                            marginBottom: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Text style={{
                                flex: 1.95,
                                textAlign: 'right',
                                color: '#0f3860',
                                fontSize: sp(14),
                                lineHeight: 42,
                                height: 42,
                                fontFamily: fonts.regular,
                            }}>{'אזור זמן'}</Text>

                            <View style={{
                                backgroundColor: '#f5f5f5',
                                borderTopRightRadius: 20,
                                borderBottomRightRadius: 20,
                                height: 42,
                                flex: 5.73,
                                opacity: 0.6,
                                justifyContent: 'center',
                            }}>
                                <Text style={{
                                    paddingHorizontal: 21,
                                    color: '#0f3860',
                                    height: 42,
                                    fontSize: sp(15),
                                    lineHeight: 42,
                                    textAlign: 'right',
                                    fontFamily: fonts.regular,
                                }}>{'UTC+02:00 Jerusalem'}</Text>
                            </View>
                        </View>
                        <View style={{
                            flexDirection: 'row-reverse',
                            height: 42,
                            marginBottom: 8,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Text style={{
                                flex: 1.95,
                                textAlign: 'right',
                                color: '#0f3860',
                                fontSize: sp(14),
                                lineHeight: 42,
                                fontFamily: fonts.regular,
                            }}>{'מטבע מוביל'}</Text>

                            <View style={{
                                backgroundColor: '#f5f5f5',
                                borderTopRightRadius: 20,
                                borderBottomRightRadius: 20,
                                height: 42,
                                opacity: 0.6,
                                flex: 5.73,
                                justifyContent: 'center',
                            }}>
                                <Text style={{
                                    paddingHorizontal: 21,
                                    color: '#0f3860',
                                    height: 42,
                                    fontSize: sp(15),
                                    lineHeight: 42,
                                    textAlign: 'right',
                                    fontFamily: fonts.regular,
                                }}>{'ש"ח (₪)'}</Text>
                            </View>
                        </View>

                        <View style={{
                            marginVertical: 20,
                            backgroundColor: '#eaeaea',
                            flex: 1,
                            height: 1,
                        }}/>

                        <View style={{
                            height: 50,
                        }}>
                            <Text style={{
                                color: '#022258',
                                fontSize: sp(18),
                                textAlign: 'right',
                                fontFamily: fonts.semiBold,
                            }}>{'כניסה למערכת'}</Text>
                        </View>

                        <View style={{
                            height: 48,
                            backgroundColor: '#e7f0f4',
                            width: '100%',
                            flexDirection: 'row-reverse',
                            marginBottom: 14,
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            paddingHorizontal: 12,
                        }}>
                            <Text style={{
                                color: '#022258',
                                fontSize: sp(14),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                            }}>{'סוג כניסה  - '}</Text>

                            <Text style={{
                                color: '#022258',
                                fontSize: sp(16),
                                textAlign: 'right',
                                fontFamily: fonts.bold,
                            }}>{userSettings.authenticationType === 'REGULAR'
                                ? 'רגילה'
                                : 'מחמירה'}</Text>
                        </View>

                        <TouchableOpacity
                            onPress={this.authenticationTypeModalOpen}
                            style={{
                                height: 32,
                                width: 175,
                                backgroundColor: '#022258',
                                borderRadius: 16,
                                flexDirection: 'row-reverse',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignSelf: 'flex-end',
                                marginBottom: 10,
                            }}>
                            <Image
                                resizeMode="contain"
                                style={{
                                    width: 11.5,
                                    height: 14,
                                    marginHorizontal: 5,
                                }}
                                source={require(
                                    'BiziboxUI/assets/iconAuthenticationType.png')}/>
                            <Text style={{
                                color: '#ffffff',
                                fontSize: sp(16),
                                textAlign: 'right',
                                fontFamily: fonts.semiBold,
                            }}>{userSettings.authenticationType === 'REGULAR'
                                ? 'הפעל '
                                : 'ביטול '}{'כניסה מחמירה'}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.changePassword}
                                          style={{
                                              height: 17,
                                              flexDirection: 'row-reverse',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              alignSelf: 'flex-end',
                                          }}>
                            <Image
                                resizeMode="contain"
                                style={{
                                    width: 10,
                                    height: 17,
                                    marginHorizontal: 5,
                                }}
                                source={require('BiziboxUI/assets/iconKey.png')}/>
                            <Text style={{
                                color: '#2aa1d9',
                                fontSize: sp(15),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                            }}>{'החלפת סיסמה'}</Text>
                        </TouchableOpacity>


                        <View style={{
                            marginVertical: 20,
                            backgroundColor: '#eaeaea',
                            flex: 1,
                            height: 1,
                        }}/>

                        <View style={{
                            height: 50,
                            flexDirection: 'row-reverse',
                        }}>
                            <Text
                                onPress={() => {
                                    Linking.canOpenURL('https://bizibox.biz/terms-of-use-portal-app/')
                                        .then(s => {
                                            if (s) {
                                                Linking.openURL('https://bizibox.biz/terms-of-use-portal-app/')
                                            }
                                        })
                                }}
                                style={{
                                    color: '#2aa1d9',
                                    fontSize: sp(15),
                                    textAlign: 'right',
                                    fontFamily: fonts.regular,
                                }}>{'תנאי שימוש'}</Text>
                            <Text style={{
                                color: '#2aa1d9',
                                fontSize: sp(15),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                                paddingHorizontal: 5,
                            }}>{'|'}</Text>
                            <Text
                                onPress={() => {
                                  Linking.canOpenURL('https://bizibox.biz/privacy-policy-portal-app/')
                                      .then(s => {
                                        if (s) {
                                          Linking.openURL('https://bizibox.biz/privacy-policy-portal-app/')
                                        }
                                      })
                                }}
                                style={{
                                color: '#2aa1d9',
                                fontSize: sp(15),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                            }}>{'מדיניות פרטיות'}</Text>
                        </View>

                    </View>

                </KeyboardAwareScrollView>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={activatedModalIsOpen}
                    onRequestClose={() => {
                        // console.log('Modal has been closed.')
                    }}>
                    <SafeAreaView style={{
                        flex: 1,
                        marginTop: 0,
                        paddingTop: 0,
                        position: 'relative',
                    }}>

                        <View style={[
                            {
                                height: 68,
                                backgroundColor: '#002059',
                                width: '100%',
                                paddingTop: 0,
                                paddingLeft: 10,
                                paddingRight: 10,
                                alignItems: 'center',
                                alignSelf: 'center',
                                alignContent: 'center',
                            }, cs(
                                !isRtl,
                                [
                                    {
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                    }],
                                commonStyles.rowReverse,
                            )]}>
                            {stepMail === 2 && (
                                <View>
                                    <TouchableOpacity
                                        onPress={this.activatedModalClose}>
                                        <Text style={{
                                            fontSize: sp(16),
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                        }}>ביטול</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            <View style={{
                                alignItems: 'center',
                                flex: 70,
                                alignSelf: 'center',
                            }}>
                                <Text
                                    style={{
                                        fontSize: sp(20),
                                        color: '#ffffff',
                                        fontFamily: fonts.semiBold,
                                        textAlign: 'center',
                                    }}>
                                    {'החלפת מייל'}
                                </Text>
                            </View>
                            {stepMail !== 3 && (
                                <View>
                                    <TouchableOpacity
                                        activeOpacity={(stepMail === 2 && (inProgress || !(
                                            mailValid && passwordValid && !emailExists &&
                                            password.length > 0 && mail.length > 0
                                        ))) ? 1 : 0.2}
                                        onPress={this.handleUpdateMail}>
                                        <Text style={{
                                            opacity: (stepMail === 2 && (inProgress || !(
                                                mailValid && passwordValid && !emailExists &&
                                                password.length > 0 && mail.length > 0
                                            ))) ? 0.5 : 1,
                                            fontSize: sp(16),
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                        }}>{'עדכון'}</Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>

                        <KeyboardAwareScrollView
                            enableOnAndroid
                            keyboardShouldPersistTaps="always"
                            contentContainerStyle={{
                                width: '100%',
                                height: '100%',
                                marginTop: 20,
                                marginBottom: 0,
                                flex: 1,
                                alignItems: 'center',
                                alignSelf: 'center',
                                alignContent: 'center',
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                marginTop: 0,
                                marginBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 10,
                                flex: 1,
                            }}>

                            {(stepMail === 2) && (
                                <View style={{
                                    marginBottom: 20,
                                    paddingLeft: 10,
                                }}>
                                    <Text style={[
                                        {
                                            color: '#123860',
                                            fontSize: sp(21),
                                            textAlign: 'center',
                                            fontFamily: fonts.bold,
                                        }]}>
                                        {'שימו לב,'}
                                    </Text>
                                    <Text
                                        numberOfLines={2}
                                        style={[
                                            {
                                                color: '#123860',
                                                fontSize: sp(16),
                                                textAlign: 'center',
                                                fontFamily: fonts.regular,
                                            }]}>
                                        {'עדכון כתובת המייל תשנה את פרטי הכניסה למערכת bizibox'}
                                        {'\n'}
                                        {'והכניסה תתבצע בעזרת המייל החדש והסיסמה.'}
                                    </Text>
                                    <Text
                                        numberOfLines={2}
                                        style={[
                                            {
                                                paddingTop: 20,
                                                color: '#123860',
                                                fontSize: sp(16),
                                                textAlign: 'center',
                                                fontFamily: fonts.regular,
                                            }]}>
                                        {'לאישור החלפת כתובת המייל אנא הזינו את הסיסמה'}
                                        {'\n'}
                                        {'למערכת ואת המייל החדש.'}
                                    </Text>
                                </View>
                            )}
                            {(stepMail === 3) && (
                                <View>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        alignSelf: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <View>
                                            <Icon
                                                name="check"
                                                type="material-community"
                                                size={40}
                                                color={'#64b6e6'}
                                            />
                                        </View>
                                        <View>
                                            <Text style={[
                                                {
                                                    color: '#123860',
                                                    fontSize: sp(21),
                                                    textAlign: 'center',
                                                    fontFamily: fonts.bold,
                                                }]}>
                                                {'מצויין!'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Text style={[
                                        {
                                            paddingTop: 20,
                                            color: '#123860',
                                            fontSize: sp(18.5),
                                            textAlign: 'center',
                                            fontFamily: fonts.regular,
                                        }]}>
                                        {'המייל הוחלף בהצלחה.'}
                                    </Text>
                                    <Text style={[
                                        {
                                            color: '#123860',
                                            fontSize: sp(18.5),
                                            textAlign: 'center',
                                            fontFamily: fonts.regular,
                                        }]}>
                                        {'מייל אימות נשלח לכתובת '}{mail}
                                    </Text>
                                </View>
                            )}

                            {(stepMail === 2) && (
                                <Fragment>
                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: (emailExists || !mailValid) ? 0 : 8,
                                            }]}>
                                        <View style={{flex: 1.95}}>
                                            <Text style={{
                                                textAlign: 'right',
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                                fontFamily: fonts.regular,
                                            }}>{t('common:label:email')}</Text>
                                        </View>
                                        <View style={[
                                            {
                                                flex: 5.73,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                                borderWidth: (emailExists || !mailValid || errPass)
                                                    ? 1
                                                    : 0,
                                                borderColor: colors.red,
                                            }]}>
                                            <TextInput
                                                onEndEditing={this.handleUpdateFieldValid('mailValid')}
                                                onBlur={this.handleUpdateFieldValidAsync}
                                                autoCorrect={false}
                                                autoCapitalize="none"
                                                returnKeyType="done"
                                                keyboardType="email-address"
                                                underlineColorAndroid="transparent"
                                                style={[
                                                    styles.input,
                                                    {
                                                        color: '#0f3860',
                                                        height: 42,
                                                        fontSize: sp(15),
                                                        width: '100%',
                                                        fontFamily: fonts.regular,
                                                        fontWeight: 'normal',
                                                        textAlign: (!mail || (mail && mail.length === 0))
                                                            ? 'right'
                                                            : 'left',
                                                        backgroundColor: 'transparent',
                                                    },
                                                ]}
                                                onSubmitEditing={this.handleUpdateMail}
                                                onChangeText={this.handleUpdateField('mail')}
                                                value={mail}
                                            />
                                        </View>
                                    </View>
                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                marginBottom: (emailExists || !mailValid ||
                                                    mailIsHebrew) ? 8 : 0,
                                            }]}>
                                        <View style={{flex: 1.95}}/>
                                        <View style={[
                                            {
                                                flex: 5.73,
                                                paddingHorizontal: 0,
                                            }]}>
                                            {(emailExists === true) && (
                                                <Fragment>
                                                    <View style={{
                                                        width: '100%',
                                                        marginVertical: 0,
                                                        flexDirection: 'row-reverse',
                                                        justifyContent: 'flex-start',
                                                    }}>
                                                        <Text
                                                            style={[
                                                                {
                                                                    color: colors.red7,
                                                                    fontSize: sp(14),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }]}>
                                                            {'כתובת מייל זו כבר משוייכת למשתמש קיים'}
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity>
                                                        <Text
                                                            style={[
                                                                {
                                                                    color: colors.blue30,
                                                                    fontSize: sp(14),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }]}>
                                                            {'זה המייל שלי! פתיחת קריאת שירות'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </Fragment>
                                            )}

                                            {(mailIsHebrew === true) && (
                                                <Text style={[
                                                    {
                                                        width: '100%',
                                                        marginVertical: 0,
                                                        color: colors.red7,
                                                        fontSize: sp(14),
                                                        textAlign: 'right',
                                                        fontFamily: fonts.regular,
                                                    }]}>
                                                    {'שימו לב - המקלדת בעברית'}
                                                </Text>
                                            )}

                                            {(mailValid === false) && (
                                                <Text style={[
                                                    {
                                                        width: '100%',
                                                        marginVertical: 0,
                                                        color: colors.red7,
                                                        fontSize: sp(14),
                                                        textAlign: 'right',
                                                        fontFamily: fonts.regular,
                                                    }]}>
                                                    {'נראה שנפלה טעות במייל, אנא בדקו שנית'}
                                                </Text>
                                            )}
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: (!passwordValid) ? 0 : 8,
                                            }]}>
                                        <View style={{flex: 1.95}}>
                                            <Text style={{
                                                textAlign: 'right',
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                                fontFamily: fonts.regular,
                                            }}>{'סיסמה'}</Text>
                                        </View>
                                        <View style={[
                                            {
                                                flex: 5.73,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                                borderWidth: (!passwordValid) ? 1 : 0,
                                                borderColor: colors.red,
                                            }]}>
                                            <TextInput
                                                underlineColorAndroid="transparent"
                                                secureTextEntry={!secureTextEntry}
                                                style={[
                                                    styles.input,
                                                    {
                                                        color: '#0f3860',
                                                        height: 42,
                                                        fontSize: sp(15),
                                                        width: '100%',
                                                        fontFamily: fonts.regular,
                                                        fontWeight: 'normal',
                                                        textAlign: 'right',
                                                        backgroundColor: 'transparent',
                                                    },
                                                ]}
                                                autoCorrect={false}
                                                autoCapitalize="none"
                                                returnKeyType="done"
                                                onEndEditing={(e) => {
                                                    this.setState({
                                                        password: e.nativeEvent.text.toString()
                                                            .replace(getEmoji(), '')
                                                            .replace(/\s+/g, ''),
                                                    })
                                                    this.handleUpdateFieldValid('passwordValid')(e)
                                                }}
                                                onBlur={this.handleUpdateFieldValid('passwordValid')}
                                                onChangeText={this.handleUpdateField('password')}
                                                value={password}
                                                onSubmitEditing={this.handleUpdateMail}
                                            />
                                            <TouchableOpacity style={{
                                                position: 'absolute',
                                                backgroundColor: 'transparent',
                                                height: '100%',
                                                left: 15,
                                                top: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }} onPress={this.handleTogglePasswordVisibility}>
                                                {this.state.secureTextEntry
                                                    ? <Icons name="eye-outline" size={19}
                                                             color={colors.blue29}/>
                                                    : <Icons name="eye-off-outline" size={19}
                                                             color={colors.blue29}/>}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 0,
                                    }}>
                                        {(errPass) && (
                                            <Text style={[
                                                {
                                                    width: '100%',
                                                    marginVertical: 0,
                                                    color: colors.red7,
                                                    fontSize: sp(14),
                                                    textAlign: 'center',
                                                    fontFamily: fonts.regular,
                                                }]}>
                                                {'הסיסמה שגויה'}
                                            </Text>
                                        )}
                                    </View>
                                </Fragment>
                            )}

                            {(stepMail === 3) && (
                                <Fragment>
                                    <Button
                                        buttonStyle={[
                                            {
                                                marginTop: 25,
                                                height: 52,
                                                borderRadius: 6,
                                                backgroundColor: '#022258',
                                                width: 260,
                                            }]}
                                        titleStyle={{
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(21),
                                            textAlign: 'center',
                                        }}
                                        onPress={this.activatedModalClose}
                                        title={'סגירה'}
                                    />
                                </Fragment>
                            )}
                        </KeyboardAwareScrollView>

                    </SafeAreaView>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={changePasswordModalIsOpen}
                    onRequestClose={() => {
                        // console.log('Modal has been closed.')
                    }}>
                    <SafeAreaView style={{
                        flex: 1,
                        marginTop: 0,
                        paddingTop: 0,
                        position: 'relative',
                    }}>

                        <View style={[
                            {
                                height: 68,
                                backgroundColor: '#002059',
                                width: '100%',
                                paddingTop: 0,
                                paddingLeft: 10,
                                paddingRight: 10,
                                // alignItems: 'center',
                                // alignSelf: 'center',
                                // alignContent: 'center',
                                justifyContent: 'center',
                            }, cs(
                                !isRtl,
                                [
                                    {
                                        flexDirection: 'row',
                                    }],
                                commonStyles.rowReverse,
                            )]}>

                            <View style={{
                                flex: 1,
                            }}/>
                            <View style={{
                                alignItems: 'center',
                                alignSelf: 'center',
                                flex: 1,
                            }}>
                                <Text
                                    style={{
                                        fontSize: sp(20),
                                        color: '#ffffff',
                                        fontFamily: fonts.semiBold,
                                        textAlign: 'center',
                                    }}>
                                    {'החלפת סיסמה'}
                                </Text>
                            </View>
                            <View style={{
                                flex: 1,
                                alignItems: 'flex-end',
                                alignSelf: 'center',
                            }}>
                                <TouchableOpacity
                                    onPress={this.changePasswordModalClose}>
                                    <Text style={{
                                        fontSize: sp(16),
                                        color: '#ffffff',
                                        fontFamily: fonts.semiBold,
                                    }}>ביטול</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <KeyboardAwareScrollView
                            enableOnAndroid
                            keyboardShouldPersistTaps="always"
                            contentContainerStyle={{
                                width: '100%',
                                height: '100%',
                                marginTop: 20,
                                marginBottom: 0,
                                flex: 1,
                                alignItems: 'center',
                                alignSelf: 'center',
                                alignContent: 'center',
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                marginTop: 0,
                                marginBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 10,
                                flex: 1,
                            }}>

                            <View
                                style={[
                                    cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                        height: 42,
                                        marginBottom: 8,
                                    }]}>
                                <View style={{flex: 3.5}}>
                                    <Text style={{
                                        textAlign: 'right',
                                        color: '#0f3860',
                                        fontSize: sp(14),
                                        lineHeight: 42,
                                        fontFamily: fonts.regular,
                                    }}>{'סיסמה נוכחית'}</Text>
                                </View>
                                <View style={[
                                    {
                                        flex: 5.73,
                                        backgroundColor: '#f5f5f5',
                                        paddingHorizontal: 21,
                                        borderBottomRightRadius: 20,
                                        borderTopRightRadius: 20,
                                        borderWidth: (!oldPasswordValid || errPass) ? 1 : 0,
                                        borderColor: colors.red,
                                    }]}>
                                    <TextInput
                                        underlineColorAndroid="transparent"
                                        style={[
                                            styles.input,
                                            {
                                                color: '#0f3860',
                                                height: 42,
                                                fontSize: sp(15),
                                                width: '100%',
                                                fontFamily: fonts.regular,
                                                fontWeight: 'normal',
                                                textAlign: 'right',
                                                backgroundColor: 'transparent',
                                            },
                                        ]}
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                        returnKeyType="done"
                                        onEndEditing={(e) => {
                                            this.setState({
                                                oldPassword: e.nativeEvent.text.toString()
                                                    .replace(getEmoji(), '')
                                                    .replace(/\s+/g, ''),
                                            })
                                            this.handleUpdateFieldValid('oldPasswordValid')(e)
                                        }}
                                        onBlur={this.handleUpdateFieldValid('oldPasswordValid')}
                                        onChangeText={this.handleUpdateField('oldPassword')}
                                        value={oldPassword}
                                    />
                                </View>
                            </View>
                            <View
                                style={[
                                    cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                        height: 42,
                                        marginBottom: (!passwordValid) ? 0 : 8,
                                    }]}>
                                <View style={{flex: 3.5}}>
                                    <Text style={{
                                        textAlign: 'right',
                                        color: '#0f3860',
                                        fontSize: sp(14),
                                        lineHeight: 42,
                                        fontFamily: fonts.regular,
                                    }}>{'סיסמה חדשה'}</Text>
                                </View>
                                <View style={[
                                    {
                                        flex: 5.73,
                                        backgroundColor: '#f5f5f5',
                                        paddingHorizontal: 21,
                                        borderBottomRightRadius: 20,
                                        borderTopRightRadius: 20,
                                        borderColor: colors.red,
                                        borderWidth: ((!passwordValid) ||
                                            (password.length > 0 && confirmPassword.length > 0 &&
                                                password !== confirmPassword)) ? 1 : 0,
                                    }]}>
                                    <TextInput
                                        underlineColorAndroid="transparent"
                                        secureTextEntry={!secureTextEntry}
                                        style={[
                                            styles.input,
                                            {
                                                color: '#0f3860',
                                                height: 42,
                                                fontSize: sp(15),
                                                width: '100%',
                                                fontFamily: fonts.regular,
                                                fontWeight: 'normal',
                                                textAlign: 'right',
                                                backgroundColor: 'transparent',
                                            },
                                        ]}
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                        returnKeyType="done"
                                        onEndEditing={(e) => {
                                            this.setState({
                                                password: e.nativeEvent.text.toString()
                                                    .replace(getEmoji(), '')
                                                    .replace(/\s+/g, ''),
                                            })
                                            this.handleUpdateFieldValid('passwordValid')(e)
                                        }}
                                        onBlur={this.handleUpdateFieldValid('passwordValid')}
                                        onChangeText={this.handleUpdateField('password')}
                                        value={password}
                                    />
                                    <TouchableOpacity style={{
                                        position: 'absolute',
                                        backgroundColor: 'transparent',
                                        height: '100%',
                                        left: 15,
                                        top: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }} onPress={this.handleTogglePasswordVisibility}>
                                        {this.state.secureTextEntry
                                            ? <Icons name="eye-outline" size={19}
                                                     color={colors.blue29}/>
                                            : <Icons name="eye-off-outline" size={19}
                                                     color={colors.blue29}/>}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View
                                style={[
                                    cs(isRtl, commonStyles.row, [commonStyles.rowReverse])]}>
                                <View style={{flex: 3.5}}/>
                                <View style={[
                                    {
                                        flex: 5.73,
                                        paddingHorizontal: 0,
                                    }]}>
                                    <View style={[
                                        {
                                            width: '100%',
                                            flexDirection: 'column',
                                            alignSelf: 'flex-end',
                                            justifyContent: 'flex-end',
                                            alignItems: 'flex-end',
                                            alignContent: 'flex-end',
                                            marginBottom: 20,
                                            marginTop: 10,
                                        }]}>
                                        {(username === password) && (
                                            <View style={{
                                                flexDirection: 'row-reverse',
                                                alignSelf: 'flex-end',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                            }}>
                                                <Icon
                                                    name={'block-helper'}
                                                    type="material-community"
                                                    size={12}
                                                    color={'#022258'}
                                                />
                                                <View style={commonStyles.spaceDivider}/>
                                                <Text style={{
                                                    fontSize: sp(16),
                                                    fontFamily: fonts.regular,
                                                    color: colors.blue29,
                                                }}>
                                                    {'בחרו סיסמה השונה משם המשתמש'}
                                                </Text>
                                            </View>
                                        )}
                                        <View style={{
                                            flexDirection: 'row-reverse',
                                            alignSelf: 'flex-end',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        }}>
                                            <Icon
                                                name={(password.length >= 8 && password.length < 12)
                                                    ? 'check'
                                                    : 'block-helper'}
                                                type="material-community"
                                                size={(password.length >= 8 && password.length < 12)
                                                    ? 16
                                                    : 12}
                                                color={'#022258'}
                                            />
                                            <View style={commonStyles.spaceDivider}/>
                                            <Text style={{
                                                fontSize: sp(16),
                                                fontFamily: fonts.regular,
                                                color: colors.blue29,
                                            }}>
                                                {'8-12 תווים'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flexDirection: 'row-reverse',
                                            alignSelf: 'flex-end',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        }}>
                                            <Icon
                                                name={(password.replace(/[^\d]/g, '').length > 0)
                                                    ? 'check'
                                                    : 'block-helper'}
                                                type="material-community"
                                                size={(password.replace(/[^\d]/g, '').length > 0)
                                                    ? 16
                                                    : 12}
                                                color={'#022258'}
                                            />
                                            <View style={commonStyles.spaceDivider}/>
                                            <Text style={{
                                                fontSize: sp(16),
                                                fontFamily: fonts.regular,
                                                color: colors.blue29,
                                            }}>
                                                {'לפחות ספרה אחת'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flexDirection: 'row-reverse',
                                            alignSelf: 'flex-end',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        }}>
                                            <Icon
                                                name={(password.replace(/[^A-Za-z]/g, '').length > 0)
                                                    ? 'check'
                                                    : 'block-helper'}
                                                type="material-community"
                                                size={(password.replace(/[^A-Za-z]/g, '').length > 0)
                                                    ? 16
                                                    : 12}
                                                color={'#022258'}
                                            />
                                            <View style={commonStyles.spaceDivider}/>
                                            <Text style={{
                                                fontSize: sp(16),
                                                fontFamily: fonts.regular,
                                                color: colors.blue29,
                                            }}>
                                                {'לפחות אות אחת באנגלית'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View
                                style={[
                                    cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                        height: 42,
                                        marginBottom: 8,
                                    }]}>
                                <View style={{flex: 3.5}}>
                                    <Text style={{
                                        textAlign: 'right',
                                        color: '#0f3860',
                                        fontSize: sp(14),
                                        lineHeight: 42,
                                        fontFamily: fonts.regular,
                                    }}>{'הקלידו סיסמה בשנית'}</Text>
                                </View>
                                <View style={[
                                    {
                                        flex: 5.73,
                                        backgroundColor: '#f5f5f5',
                                        paddingHorizontal: 21,
                                        borderBottomRightRadius: 20,
                                        borderTopRightRadius: 20,
                                        borderColor: colors.red,
                                        borderWidth: (password.length > 0 &&
                                            confirmPassword.length > 0 && password !==
                                            confirmPassword) ? 1 : 0,
                                    }]}>
                                    <TextInput
                                        underlineColorAndroid="transparent"
                                        secureTextEntry={!secureTextEntryRepeat}
                                        style={[
                                            styles.input,
                                            {
                                                color: '#0f3860',
                                                height: 42,
                                                fontSize: sp(15),
                                                width: '100%',
                                                fontFamily: fonts.regular,
                                                fontWeight: 'normal',
                                                textAlign: 'right',
                                                backgroundColor: 'transparent',
                                            },
                                        ]}
                                        autoCorrect={false}
                                        autoCapitalize="none"
                                        returnKeyType="done"
                                        onEndEditing={(e) => {
                                            this.setState({
                                                confirmPassword: e.nativeEvent.text.toString()
                                                    .replace(getEmoji(), '')
                                                    .replace(/\s+/g, ''),
                                            })
                                        }}
                                        onChangeText={this.handleUpdateField('confirmPassword')}
                                        value={confirmPassword}
                                    />
                                    <TouchableOpacity style={{
                                        position: 'absolute',
                                        backgroundColor: 'transparent',
                                        height: '100%',
                                        left: 15,
                                        top: 1,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }} onPress={this.handleTogglePasswordVisibilityDyna}>
                                        {this.state.secureTextEntryRepeat
                                            ? <Icons name="eye-outline" size={19}
                                                     color={colors.blue29}/>
                                            : <Icons name="eye-off-outline" size={19}
                                                     color={colors.blue29}/>}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{
                                marginVertical: 10,
                            }}>
                                {(errPass) && (
                                    <Text style={[
                                        {
                                            width: '100%',
                                            marginVertical: 0,
                                            color: colors.red7,
                                            fontSize: sp(14),
                                            textAlign: 'center',
                                            fontFamily: fonts.regular,
                                        }]}>
                                        {'הסיסמה הנוכחית שגויה'}
                                    </Text>
                                )}
                                {(password.length > 0 && confirmPassword.length > 0 &&
                                    password !== confirmPassword) && (
                                    <Text style={[
                                        {
                                            width: '100%',
                                            paddingHorizontal: 10,
                                            marginVertical: 0,
                                            height: 40,
                                            lineHeight: 38,
                                            borderWidth: 1,
                                            borderColor: colors.red7,
                                            color: colors.red7,
                                            fontSize: sp(14),
                                            textAlign: 'center',
                                            fontFamily: fonts.regular,
                                        }]}>
                                        {'הסיסמאות לא זהות, אנא בדקו שוב'}
                                    </Text>
                                )}
                            </View>

                            <Button
                                disabled={(username === password || !oldPassword ||
                                    oldPassword.length === 0 || !password || password !==
                                    confirmPassword || inProgress || password.length < 8 ||
                                    password.length >= 12 ||
                                    password.replace(/[^\d]/g, '').length === 0 ||
                                    password.replace(/[^A-Za-z]/g, '').length === 0)}
                                buttonStyle={[
                                    {
                                        marginTop: 25,
                                        height: 45,
                                        borderRadius: 6,
                                        backgroundColor: '#022258',
                                        width: 240,
                                    }]}
                                titleStyle={{
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(21),
                                    color: '#ffffff',
                                    textAlign: 'center',
                                }}
                                onPress={this.handleChangePassword}
                                title={'עדכון סיסמה'}
                            />
                        </KeyboardAwareScrollView>

                    </SafeAreaView>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={authenticationTypeModalIsOpen}
                    onRequestClose={() => {
                        // console.log('Modal has been closed.')
                    }}>
                    <SafeAreaView style={{
                        flex: 1,
                        marginTop: 0,
                        paddingTop: 0,
                        position: 'relative',
                    }}>
                        <View style={{
                            height: 60,
                            backgroundColor: '#002059',
                            width: '100%',
                            paddingTop: 0,
                            paddingLeft: 10,
                            paddingRight: 10,
                        }}>
                            <View style={cs(
                                !isRtl,
                                [
                                    styles.container, {
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }],
                                commonStyles.rowReverse,
                            )}>
                                <View/>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={{
                                        fontSize: sp(20),
                                        color: '#ffffff',
                                        fontFamily: fonts.semiBold,
                                    }}>
                                        {userSettings.authenticationType === 'REGULAR'
                                            ? 'הפעל '
                                            : 'ביטול '}{'כניסה מחמירה'}
                                    </Text>
                                </View>
                                <View>
                                    <TouchableOpacity
                                        style={{
                                            marginRight: 'auto',
                                        }}
                                        onPress={this.authenticationTypeModalClose}>
                                        <Text style={{
                                            fontSize: sp(16),
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                        }}>ביטול</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <KeyboardAwareScrollView
                            enableOnAndroid
                            keyboardShouldPersistTaps="always"
                            contentContainerStyle={{
                                width: '100%',
                                height: '100%',
                                marginTop: 20,
                                marginBottom: 0,
                                flex: 1,
                                alignItems: 'center',
                                alignSelf: 'center',
                                alignContent: 'center',
                            }}
                            style={{
                                width: '100%',
                                height: '100%',
                                marginTop: 0,
                                marginBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 0,
                                flex: 1,
                            }}>
                            <Image
                                resizeMode="contain"
                                style={{
                                    width: 42.5,
                                    height: 36.5,
                                    marginVertical: 30,
                                    paddingHorizontal: 10,
                                }}
                                source={require('BiziboxUI/assets/lockIcon.png')}/>

                            {(authenticationTypeStep === 1) && (
                                <View style={{
                                    marginBottom: 20,
                                    paddingHorizontal: 10,
                                }}>
                                    <Text style={[
                                        {
                                            color: '#022258',
                                            fontSize: sp(16),
                                            textAlign: 'center',
                                            fontFamily: fonts.semiBold,
                                        }]}>
                                        {'שימו לב,'}
                                    </Text>
                                    <View
                                        style={{
                                            paddingHorizontal: 20,
                                        }}>
                                        {userSettings.authenticationType === 'REGULAR' && (
                                            <Fragment>
                                                <Text
                                                    numberOfLines={3}
                                                    style={[
                                                        {
                                                            color: '#022258',
                                                            fontSize: sp(15),
                                                            textAlign: 'center',
                                                            fontFamily: fonts.regular,
                                                            marginBottom: 10,
                                                        }]}>
                                                    {'בכל כניסה לbizibox תתבקשו להזין קוד בן 4 ספרות שישלח לטלפון הנייד. להפעלה הזינו את הקוד שישלח לטלפון הנייד המקושר למערכת.'}
                                                </Text>
                                                <Text
                                                    numberOfLines={2}
                                                    style={[
                                                        {
                                                            color: '#022258',
                                                            fontSize: sp(15),
                                                            textAlign: 'center',
                                                            fontFamily: fonts.regular,
                                                        }]}>
                                                    {'ניתן לבטל את הכניסה המחמירה בכל זמן דרך מסך ההגדרות.'}
                                                </Text>
                                            </Fragment>
                                        )}
                                        {userSettings.authenticationType !== 'REGULAR' && (
                                            <Fragment>
                                                <Text
                                                    numberOfLines={2}
                                                    style={[
                                                        {
                                                            color: '#022258',
                                                            fontSize: sp(15),
                                                            textAlign: 'center',
                                                            fontFamily: fonts.regular,
                                                            marginBottom: 10,
                                                        }]}>
                                                    {'ביטול כניסה מחמירה יאפשר כניסה למערכת עם מייל וסיסמה בלבד.'}
                                                </Text>
                                                <Text
                                                    numberOfLines={3}
                                                    style={[
                                                        {
                                                            color: '#022258',
                                                            fontSize: sp(15),
                                                            textAlign: 'center',
                                                            fontFamily: fonts.regular,
                                                        }]}>
                                                    {'לביטול כניסה מחמירה לחשבון הזינו את הקוד שישלח לנייד. ניתן להפעיל כניסה מחמירהבכל זמן, דרך מסך הגדרות.'}
                                                </Text>
                                            </Fragment>
                                        )}
                                    </View>

                                    <Button
                                        buttonStyle={[
                                            {
                                                marginTop: 50,
                                                height: 42,
                                                borderRadius: 6,
                                                backgroundColor: '#022258',
                                                width: 223.5,
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                            }]}
                                        titleStyle={{
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(17),
                                            color: '#ffffff',
                                            textAlign: 'center',
                                        }}
                                        onPress={this.handleSendSms}
                                        title={'שליחת קוד אימות'}
                                    />
                                </View>
                            )}
                            {(authenticationTypeStep === 2) && (
                                <View style={{
                                    marginBottom: 20,
                                }}>
                                    <Text style={[
                                        {
                                            color: '#022258',
                                            fontSize: sp(16),
                                            textAlign: 'center',
                                            fontFamily: fonts.regular,
                                        }]}>
                                        {userSettings.authenticationType === 'REGULAR'
                                            ? 'להפעלה '
                                            : 'לביטול '} {'הזינו את הקוד שנשלח לנייד '}{smsInfo.maskedPhoneNumber}
                                    </Text>

                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginTop: 30,
                                                width: '100%',
                                            }]}>
                                        <View style={{flex: 1.7}}/>
                                        <View style={[
                                            {
                                                flex: 5.73,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                                borderColor: colors.red,
                                                borderWidth: (!codeValid) ? 1 : 0,
                                            }]}>
                                            <TextInput
                                                underlineColorAndroid="transparent"
                                                secureTextEntry={!secureTextEntryCode}
                                                style={[
                                                    styles.input,
                                                    {
                                                        color: '#0f3860',
                                                        height: 42,
                                                        fontSize: sp(15),
                                                        width: '100%',
                                                        fontFamily: fonts.regular,
                                                        fontWeight: 'normal',
                                                        textAlign: 'right',
                                                        backgroundColor: 'transparent',
                                                    },
                                                ]}
                                                autoCorrect={false}
                                                autoCapitalize="none"
                                                returnKeyType="done"
                                                onEndEditing={(e) => {
                                                    this.setState({
                                                        code: e.nativeEvent.text.toString()
                                                            .replace(getEmoji(), '')
                                                            .replace(/\s+/g, ''),
                                                    })
                                                }}
                                                onChangeText={this.handleUpdateField('code')}
                                                value={code}
                                            />
                                            <TouchableOpacity
                                                style={{
                                                    position: 'absolute',
                                                    backgroundColor: 'transparent',
                                                    height: '100%',
                                                    left: 15,
                                                    top: 1,
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }} onPress={this.handleToggleCodeVisibility}>
                                                {this.state.secureTextEntryCode
                                                    ? <Icons name="eye-outline" size={19}
                                                             color={colors.blue29}/>
                                                    : <Icons name="eye-off-outline" size={19}
                                                             color={colors.blue29}/>}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {(errTurn && !codeValid) && (
                                        <Text style={[
                                            {
                                                color: '#d40202',
                                                fontSize: sp(14),
                                                textAlign: 'center',
                                                fontFamily: fonts.regular,
                                                marginTop: 45,
                                            }]}>
                                            {'הקוד לא תואם לקוד שנשלח, אנא בדקו ונסו שוב'}
                                        </Text>
                                    )}

                                    <Button
                                        buttonStyle={[
                                            {
                                                marginTop: 50,
                                                height: 42,
                                                borderRadius: 6,
                                                backgroundColor: '#022258',
                                                width: 223.5,
                                                alignContent: 'center',
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                            }]}
                                        titleStyle={{
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(17),
                                            color: '#ffffff',
                                            textAlign: 'center',
                                        }}
                                        onPress={this.handleTurnTwoPhaseForUse}
                                        title={(userSettings.authenticationType === 'REGULAR'
                                            ? 'הפעלת '
                                            : 'ביטול ') + ' כניסה מחמירה'}
                                    />
                                </View>
                            )}
                        </KeyboardAwareScrollView>

                    </SafeAreaView>
                </Modal>

            </SafeAreaView>
        )
    }
}
