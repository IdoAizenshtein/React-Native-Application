import React, {Fragment, PureComponent} from 'react'
import {setGlobalParams} from 'src/redux/actions/user'
import {
    Image,
    Keyboard,
    Linking,
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableHighlight,
    TouchableOpacity,
    View,
    SafeAreaView,
} from 'react-native'
// import {SafeAreaView} from 'react-native-safe-area-context';
import {connect} from 'react-redux'
import {withTranslation} from 'react-i18next'
import {Button, CheckBox, Icon} from 'react-native-elements'
import Loader from '../../components/Loader/Loader'
import {setLangDirection} from '../../redux/actions/lang'
import {combineStyles as cs, getDeviceLang, getEmoji, goTo, isRtl as checkRtl, sp} from 'src/utils/func'
import {colors, fonts} from 'src/styles/vars'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import {
    companiesApi,
    createTokenTypeApi,
    getStatusTokenTypeApi,
    isEmailExists,
    skipToDemoCompany,
    updateLeadInfo,
    updateTokenTypeApi,
} from '../../api'
import Api from '../../api/Api'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import CustomIcon from 'src/components/Icons/Fontello'

import {
    ALL_BANK_CREDENTIALS_SCHEME,
    BANK_CREDENTIALS_CONTROL_TYPES,
    BANK_CREDENTIALS_SCHEME,
    BANK_TOKEN_STATUS,
    PASSWORD_RECOVERY_LINKS,
} from 'src/constants/bank'
import {isEmpty} from 'lodash'

import validate from 'validate.js'
import ModalRen from 'src/components/Modal/Modal'
import RoundedTextInput from 'src/components/FormInput/RoundedTextInput'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import ExtendableTextInput from 'src/components/FormInput/ExtendableTextInput'
import textInputStyles from 'src/components/FormInput/FormInputStyles'
import commonStyles from 'src/styles/styles'

import he from 'src/locales/he'

import BankTokenService from 'src/services/BankTokenService'
import BankModal from 'src/screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/components/BankModal'
import WrongStatusModal
    from 'src/screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/components/WrongStatusModal'
import BlockedModal
    from 'src/screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/components/BlockedModal'
import SuccessModal
    from 'src/screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/components/SuccessModal'
import styles, {FORM_WIDTH} from './SignupScreenStyles'
import {signupCreate} from '../../redux/actions/auth'
import {IS_IOS} from '../../constants/common'
import {LOGIN} from '../../constants/navigation'
import {IS_LIGHT} from '../../constants/config'

import DeviceInfo from 'react-native-device-info'

export const BUNDLE_ID = DeviceInfo.getBundleId()

export const IS_DEV = BUNDLE_ID.endsWith('dev')
const SCREEN = {
    Preview: 'Preview',
    PersonalData: 'PersonalData',
    BusinessData: 'BusinessData',
    AccountData: 'AccountData',
    TokenTrack: 'TokenTrack',
}
const locale = getDeviceLang();

@connect(state => ({
    isRtl: state.isRtl,
    globalParams: state.globalParams,
}))
@withTranslation()
export default class SignupScreen extends PureComponent {
    constructor(props) {
        super(props)
        const {isRtl, dispatch} = props
        if (isRtl || checkRtl(locale)) {
            dispatch(setLangDirection(true))
        }

        IS_LIGHT.light = false

        this.state = {
            isReady: true,
            termsOpen: false,
            privacyPolicyOpen: false,
            screen: SCREEN.PersonalData,
            inProgress: false,
            errMail: false,
            firstName: '',
            lastName: '',
            mail: '',
            cell: '',
            password: '',
            agreementConfirm: false,
            marketingMessagesAgreed: true,
            secureTextEntry: false,
            firstNameValid: true,
            lastNameValid: true,
            cellValid: true,
            mailValid: true,
            passwordValid: true,
            emailExists: false,
            mailIsHebrew: false,
            businessCategory: '',
            companyName: '',
            companyHp: '',
            companyNameValid: true,
            companyHpValid: true,
            idExists: false,
            companyId: null,
            bankId: Object.keys(BANK_CREDENTIALS_SCHEME)[0],
            accountId: null,
            formData: {},
            formErrors: {},
            bankModalIsOpen: false,
            accountModalIsOpen: false,
            newTokenStatus: null,
            newTokenId: null,
            otpFormModalIsOpen: false,
            currentOtpField: null,
            invalidPasswordModalIsOpen: false,
            lockedModalIsOpen: false,
            successModalIsOpen: false,
            is409Error: false,
            business: true,
        }
    }

    // get screenTitle () {
    //   const { screen, status401 } = this.state
    //   const { t } = this.props
    //
    //   switch (screen) {
    //     case SCREEN.LOGIN:
    //       return t('login:loginTitle')
    //     case SCREEN.CHANGE_PASSWORD:
    //       return t('login:forgotPassword')
    //     case SCREEN.CAN_NOT_BE_CHANGED:
    //     case SCREEN.OTP_RESET_PASSWORD:
    //     case SCREEN.RESET_PASSWORD:
    //     case SCREEN.ERROR_401 && status401:
    //       return 'שחזור סיסמה'
    //     case SCREEN.OTP_LOGIN:
    //     case SCREEN.ERROR_401 && !status401:
    //       return 'עוד צעד קטן...'
    //     default:
    //       return ''
    //   }
    // }

    // componentWillUnmount () {
    //   // this.removeSmsListener()

    get screenPasswordUpdateCount() {
        const {newTokenStatus} = this.state

        if (!newTokenStatus || !newTokenStatus.screenPasswordUpdateCount) {
            return 1
        }
        if (newTokenStatus.screenPasswordUpdateCount) {
            return newTokenStatus.screenPasswordUpdateCount
        }
    }

    // }
    handleUpdateField = name => val => {
        let value = val || ''
        if (name === 'firstName' ||
            name === 'lastName' ||
            name === 'companyName' ||
            name === 'businessCategory'
        ) {
            value = value.toString().replace(getEmoji(), '')
        } else {
            value = value.toString().replace(getEmoji(), '').replace(/\s+/g, '')
        }

        if (name === 'password') {
            this.setState(
                {[name]: value.toString().replace(/([\u05D0-\u05FF/\s+]+)/g, '')})
            this.handleUpdateFieldValid(`${name}Valid`)({
                nativeEvent: {
                    text: value,
                },
            })
        } else if (name === 'cell') {
            const values = value.toString().replace(/[^\d-]/g, '')
            this.setState({[name]: values})
            this.handleUpdateFieldValid('cellValid')({
                nativeEvent: {
                    text: values,
                },
            })
        } else if (name === 'mail') {
            this.setState({[name]: value})
            this.handleUpdateFieldValid('mailValid')({
                nativeEvent: {
                    text: value,
                },
            })
        } else if (name === 'businessCategory') {
            this.setState({[name]: value})
        } else if (name === 'companyHp') {
            const values = value && value.toString().replace(/[^\d]/g, '')
            this.setState({[name]: values})
            this.handleUpdateFieldValid('companyHpValid')({
                nativeEvent: {
                    text: values,
                },
            })
        } else {
            this.setState({[name]: value})
            this.handleUpdateFieldValid(`${name}Valid`)({
                nativeEvent: {
                    text: value,
                },
            })
        }
    }

    handleUpdateFieldValid = name => val => {
        let value = val.nativeEvent.text || ''

        if (name === 'passwordValid') {
            this.setState({
                [name]: !(!value || value.length < 8 || value.length >= 12 ||
                    value.replace(/[^\d]/g, '').length === 0 ||
                    value.replace(/[^A-Za-z]/g, '').length === 0),
            })
        } else if (name === 'mailValid') {
            const re = /\S+@\S+\.\S+/
            const isHebrew = (value && /[\u0590-\u05FF]/.test(value))
            const mailValid = (value && re.test(value) && value.length > 0)
            this.setState({
                [name]: mailValid,
                mailIsHebrew: isHebrew,
            })
        } else if (name === 'cellValid') {
            this.setState({
                [name]: value && (value.length === 10 || value.length === 11) &&
                new RegExp(
                    '(050|052|053|054|055|057|058|02|03|04|08|09|072|073|076|077|078)-?\\d{7,7}').test(
                    value),
            })
        } else if (name === 'companyNameValid') {
            this.setState(
                {[name]: value && (value.length !== 0 && value.length < 40)})
        } else if (name === 'companyHpValid') {
            let result = false
            const c = {
                value: Number(value),
            }
            if (c.value) {
                const digits = Array.from(
                    String(c.value).replace(/\D/g, '').padStart(9, '0'))
                    .map(ch => +ch)

                if (digits.length === 9) {
                    let sum = 0
                    let multiplyDigit = 0

                    for (let idx = 0; idx < digits.length; idx++) {
                        const dig = digits[idx]
                        if (idx % 2 === 1) {
                            multiplyDigit = dig * 2
                            sum += (multiplyDigit > 9) ? multiplyDigit - 9 : multiplyDigit
                        } else {
                            sum += dig
                        }
                    }

                    result = sum % 10 === 0
                }
            }
            this.setState({[name]: value && (value.length === 9 && result)})
            if (value && value.length === 9 && result) {
                const {mail} = this.state
                new Api({
                    endpoint: 'companies/hp-exists',
                    secure: mail === null,
                }).post({
                    body: {
                        companyHp: value,
                        username: mail,
                    },
                })
                    .then((data) => {
                        this.setState({idExists: data.exists !== false})
                    })
                    .catch(() => {

                    })
            }
        } else {
            this.setState(
                {[name]: value && (value.length !== 0 && value.length < 30)})
        }
    }

    handleUpdateFieldValidAsync = (e) => {
        const {firstName, lastName, cell, mail} = this.state
        const re = /\S+@\S+\.\S+/
        let val = (IS_IOS ? e.nativeEvent.text : mail) || ''
        if (val && re.test(val) && val.length > 0) {
            isEmailExists.post({
                body: {
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: cell,
                    username: val,
                    hesderId: null,
                },
            })
                .then((data) => {
                    this.setState({emailExists: data.exists !== false})
                })
                .catch(() => {

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

    handleUpdateLeadInfo = () => {
        const {
            firstName,
            lastName,
            cell,
            mail,
            firstNameValid,
            lastNameValid,
            cellValid,
            mailValid,
            passwordValid,
            agreementConfirm,
            emailExists,
            inProgress,
            password,
            business,
        } = this.state

        if (inProgress || !(
            firstNameValid && lastNameValid && cellValid && mailValid &&
            passwordValid && agreementConfirm && !emailExists &&
            firstName.length > 0 && lastName.length > 0 && password.length > 0 &&
            mail.length > 0 && cell.length > 0
        )) {
            return
        }
        Keyboard.dismiss()
        this.setState({inProgress: true})

        return updateLeadInfo.post({
            body: {
                biziboxType: !business ? 'regular' : 'biziboxType',
                firstName: firstName,
                lastName: lastName,
                phoneNumber: cell,
                username: mail,
                hesderId: null,
            },
        })
            .then(() => {
                this.setState({
                    inProgress: false,
                    screen: SCREEN.BusinessData,
                })
            })
            .catch(() => {

            })
    }

    handleSignupCreate = () => {
        const {dispatch} = this.props

        const {
            firstName, lastName, cell, mail, inProgress, password,
            businessCategory,
            companyName,
            companyHp,
            companyNameValid,
            companyHpValid,
            idExists,
            business,
        } = this.state

        if (inProgress || !(
            companyNameValid && companyHpValid && !idExists &&
            companyHp.length > 0 && companyName.length > 0
        )) {
            return
        }
        Keyboard.dismiss()
        this.setState({inProgress: true})
        return dispatch(signupCreate({
            body: {
                companyInfo: {
                    biziboxType: !business ? 'regular' : 'business',
                    businessCategory: businessCategory,
                    companyHp: companyHp,
                    companyName: companyName,
                    hesderId: null,
                },
                userInfo: {
                    firstName: firstName,
                    lastName: lastName,
                    cellPhone: cell,
                    username: mail,
                    password: password,
                },
            },
        }))
            .then(() => {
                companiesApi.get()
                    .then((data) => {
                        const companyId = Array.isArray(data) && data.length > 0
                            ? data[0].companyId
                            : null
                        if (companyId) {
                            this.setState({
                                inProgress: false,
                                screen: SCREEN.AccountData,
                                companyId,
                            })
                        }
                    })
                    .catch(() => {

                    })
            })
            .catch(() => {

            })
    }

    componentDidMount() {

    }

    handleTogglePasswordVisibility = () => {
        const {secureTextEntry} = this.state
        this.setState({secureTextEntry: !secureTextEntry})
    }

    handleGoToLogin = () => {
        const {navigation} = this.props
        goTo(navigation, 'LOGIN')
    }

    handleGoToPersonalData = () => this.setState({
        inProgress: false,
        screen: SCREEN.PersonalData,
    })

    handleToggleOtpFormModal = () => this.setState(
        {otpFormModalIsOpen: !this.state.otpFormModalIsOpen})

    handleUpdateFormField = (name) => (value) => {
        this.setState({
            formData: {
                ...this.state.formData,
                [name]: value.toString().replace(/([\u05D0-\u05FF/\s+]+)/g, ''),
            },
        })
        setTimeout(() => this.validateForm(), 200)
    }

    handleChangeBankId = (bankId) => this.setState({
        bankId,
        formData: {},
        formErrors: {},
        currentOtpField: null,
    })

    handleToggleBankModal = () => this.setState(
        {bankModalIsOpen: !this.state.bankModalIsOpen})

    handleSetOtpField = (currentOtpField) => () => this.setState(
        {currentOtpField: currentOtpField})

    handleCreateBankToken = () => {
        this.validateForm()

        setTimeout(() => {
            const {
                inProgress,
                bankId,
                formData,
                formErrors,
                currentOtpField,
                accountId,
                newTokenId,
                companyId,
            } = this.state
            const scheme = ALL_BANK_CREDENTIALS_SCHEME[bankId]
            if (!scheme || inProgress || !isEmpty(formErrors)) {
                return this.setState({inProgress: false})
            }

            this.setState({inProgress: true})

            const keyCode = scheme.otp
                ? `__otp__${currentOtpField}`
                : scheme.fields[1].controlType ===
                BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD
                    ? scheme.fields[2] ? scheme.fields[2].key : null
                    : scheme.fields[1] ? scheme.fields[1].key : null

            if (!newTokenId) {
                const body = {
                    bankId,
                    companyId,
                    bankAuto: formData[keyCode] || 1,
                    bankPass: formData[scheme.fields.find(f => f.controlType ===
                        BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD).key],
                    bankUserName: formData[scheme.fields[0].key],
                    companyAccountId: accountId,
                }

                return createTokenTypeApi.post({body})
                    .then((token) => {
                        this.props.dispatch(
                            setGlobalParams(Object.assign(this.props.globalParams, {
                                updateToken: token,
                            })))
                        this.setState({
                            newTokenId: token,
                            is409Error: false,
                        })
                        if (companyId) {
                            return getStatusTokenTypeApi.post({
                                body: {
                                    companyId,
                                    tokens: [token],
                                },
                            })
                        } else {
                            return false
                        }
                    })
                    .then(([newTokenStatus]) => {
                        this.setState({newTokenStatus})
                        this.startPullingTokenStatus()
                    })
                    .catch((err) => {
                        if (err.status === 409) {
                            this.setState({
                                inProgress: false,
                                is409Error: true,
                            })
                        } else {
                            this.setState({inProgress: false})
                        }
                    })
            } else {
                const body = {
                    bankId,
                    companyId,
                    tokenId: newTokenId,
                    bankAuto: formData[keyCode] || null,
                    bankPass: formData[scheme.fields.find(f => f.controlType ===
                        BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD).key],
                    bankUserName: formData[scheme.fields[0].key],
                    companyAccountId: accountId,
                }
                return updateTokenTypeApi.post({body})
                    .then(() => {
                        this.props.dispatch(
                            setGlobalParams(Object.assign(this.props.globalParams, {
                                updateToken: newTokenId,
                            })))
                        if (companyId) {
                            return getStatusTokenTypeApi.post({
                                body: {
                                    companyId,
                                    tokens: [newTokenId],
                                },
                            })
                        } else {
                            return false
                        }
                    })
                    .then(([newTokenStatus]) => {
                        this.setState({newTokenStatus})
                        this.startPullingTokenStatus()
                    })
                    .catch(() => this.setState({inProgress: false}))
            }
        }, 200)
    }

    handleOpenBankSite = () => {
        this.clearForm()
        setTimeout(() => {
            this.props.onClose()
            const link = PASSWORD_RECOVERY_LINKS[this.state.bankId]
            Linking.canOpenURL(link)
                .then(s => {
                    if (s) {
                        Linking.openURL(PASSWORD_RECOVERY_LINKS[this.state.bankId])
                    }
                })
        }, 100)
    }

    startPullingTokenStatus = () => {
        this.intervalId = setInterval(() => {
            const {newTokenId, companyId} = this.state
            if (companyId) {
                return getStatusTokenTypeApi.post({
                    body: {
                        companyId,
                        tokens: [newTokenId],
                    },
                })
                    .then(([newTokenStatus]) => {
                        this.setState({newTokenStatus})
                        if (!newTokenStatus) {
                            return
                        }
                        const statusCode = BankTokenService.getTokenStatusCode(
                            newTokenStatus.tokenStatus)

                        if (BankTokenService.isTokenStatusProgressing(
                            newTokenStatus.tokenStatus)) {
                            return
                        }

                        if (statusCode === BANK_TOKEN_STATUS.INVALID_PASSWORD) {
                            this.setState({
                                inProgress: false,
                                invalidPasswordModalIsOpen: newTokenStatus.screenPasswordUpdateCount <
                                    3,
                                lockedModalIsOpen: newTokenStatus.screenPasswordUpdateCount >=
                                    3,
                            })
                            this.stopPullingTokenStatus()
                        }

                        if ([
                            BANK_TOKEN_STATUS.VALID,
                            BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED].includes(
                            statusCode)) {
                            this.setState({
                                inProgress: false,
                                successModalIsOpen: true,
                            })
                            this.stopPullingTokenStatus()
                        }
                    })
            }
        }, 5000)
    }

    stopPullingTokenStatus = () => {
        clearInterval(this.intervalId)
    }

    clearForm = () => {
        this.setState({
            formData: {},
            formErrors: {},
            bankModalIsOpen: false,
            creditCardModalIsOpen: false,
            slikaModalIsOpen: false,
            inProgress: false,
            otpFormModalIsOpen: false,
            currentOtpField: null,
            invalidPasswordModalIsOpen: false,
            lockedModalIsOpen: false,
            successModalIsOpen: false,
        })
    }

    renderForm = () => {
        const {bankId, formData, formErrors, currentOtpField} = this.state
        const {t} = this.props

        const schemeId = bankId

        const scheme = ALL_BANK_CREDENTIALS_SCHEME[schemeId]
        if (!scheme || isEmpty(scheme.fields)) {
            return null
        }

        return (
            <Fragment>

                {scheme.fields.map(f => {
                    if (f.key === 'userCode' && scheme.otp) {
                        return null
                    }

                    let placeHolder = t(
                        `foreignCredentials:${schemeId}:${f.key}:placeHolder`)
                    if (placeHolder.includes('.placeHolder')) {
                        placeHolder = ''
                    }
                    return (
                        <View style={styles.formRow} key={f.key}>
                            <View style={styles.formRowLeftPart}>
                                <RoundedTextInput
                                    placeholder={placeHolder}
                                    placeholderTextColor={colors.gray34}
                                    onEndEditing={(e) => {
                                        this.handleUpdateFormField(f.key)(
                                            e.nativeEvent.text.toString()
                                                .replace(/([\u05D0-\u05FF/\s+]+)/g, ''))
                                    }}
                                    isInvalid={formErrors[f.key]}
                                    isPassword={f.controlType ===
                                        BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD}
                                    onChangeText={this.handleUpdateFormField(f.key)}
                                    onSubmitEditing={this.validateForm}
                                    onBlur={this.validateForm}
                                    value={formData[f.key]}
                                    keyboardType={f.validation.numericality
                                        ? 'numeric'
                                        : 'default'}
                                />
                            </View>

                            <View style={styles.formRowRightPart}>
                                <Text style={[styles.formRowRightText, {}]}>
                                    {t(`foreignCredentials:${schemeId}:${f.key}:label`)}
                                </Text>
                            </View>
                        </View>
                    )
                })}

                {(scheme.otp && scheme.otpTypes) ? (
                    <TouchableOpacity style={styles.formRow}
                                      onPress={this.handleToggleOtpFormModal}>
                        <View
                            style={cs(
                                Object.keys(formErrors).some(k => k.includes('__otp__')),
                                styles.bankTypeBtn, [
                                    textInputStyles.invalid, {
                                        borderTopWidth: 1,
                                        borderBottomWidth: 1,
                                        borderRightWidth: 1,
                                    }])}>
                            <Icon name="chevron-left" size={22} color={colors.blue8}/>
                            {currentOtpField && (
                                <Text
                                    style={styles.bankName}>{formData[`__otp__${currentOtpField}`]}</Text>
                            )}
                        </View>

                        <View style={styles.formRowRightPart}>
                            <Text style={styles.formRowRightText}>
                                {t(`foreignCredentials:${bankId}:description`)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                ) : null}
            </Fragment>
        )
    }

    renderHeaderForm = () => {
        const {bankId} = this.state
        const {t} = this.props

        return (
            <Fragment>
                <View style={styles.formRow}>
                    <View style={styles.formRowLeftPart}>
                        <TouchableOpacity style={styles.bankTypeBtn}
                                          onPress={this.handleToggleBankModal}>
                            <Icon name="chevron-left" size={22} color={colors.blue8}/>

                            <View style={[commonStyles.row, commonStyles.alignItemsCenter]}>
                                <Text style={styles.bankName}>{t(`bankName:${bankId}`)}</Text>
                                <AccountIcon account={{bankId}}/>
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.formRowRightPart}>
                        <Text style={styles.formRowRightText}>
                            {t('settings:bankAccountsTab:bankName')}
                        </Text>
                    </View>
                </View>
            </Fragment>
        )
    }

    renderOtpForm = () => {
        const {bankId, formData, formErrors, currentOtpField} = this.state
        const {t} = this.props

        const scheme = ALL_BANK_CREDENTIALS_SCHEME[bankId]
        if (!scheme || isEmpty(scheme.otpTypes)) {
            return null
        }
        return (
            <ModalRen
                isOpen
                title={t(`foreignCredentials:${bankId}:description`)}
                onRightPress={this.handleToggleOtpFormModal}
                rightComponent={<Icon name="chevron-right" size={30}
                                      color={colors.white}/>}
            >
                <ScrollView
                    style={styles.addModalBody}
                    contentContainerStyle={styles.otpFormModalContainer}
                >
                    {scheme.otpTypes.map((f, i) => {
                        return (
                            <View style={styles.formRow} key={f.key}>
                                <ExtendableTextInput
                                    isInvalid={formErrors[`__otp__${f.key}`]}
                                    isChecked={currentOtpField === f.key}
                                    isMarked={i === 0}
                                    keyboardType="numeric"
                                    maxLength={f.validation.length.maximum}
                                    onChangeText={this.handleUpdateFormField(`__otp__${f.key}`)}
                                    onSubmitEditing={this.validateForm}
                                    onBlur={this.validateForm}
                                    value={formData[`__otp__${f.key}`]}
                                    onCheck={this.handleSetOtpField(f.key)}
                                    placeholder={t(
                                        `foreignCredentials:${bankId}:otpTypes:${f.key}:rule`)}
                                    placeholderTextColor={colors.gray34}
                                    label={t(
                                        `foreignCredentials:${bankId}:otpTypes:${f.key}:label`)}
                                    description={t(
                                        `foreignCredentials:${bankId}:otpTypes:${f.key}:description`)}
                                    tooltip={t(
                                        `foreignCredentials:${bankId}:otpTypes:${f.key}:info`)}
                                />
                            </View>
                        )
                    })}
                </ScrollView>
            </ModalRen>
        )
    }

    validateForm = () => {
        const {bankId, formData, currentOtpField} = this.state

        const schemeId = bankId

        const scheme = ALL_BANK_CREDENTIALS_SCHEME[schemeId]
        if (!scheme || isEmpty(scheme.fields)) {
            return null
        }

        const formErrors = scheme.fields.reduce((memo, field) => {
            if (!field.validation ||
                (field.key === 'userCode' && scheme.otp)) {
                return memo
            }
            const error = validate.single(formData[field.key], field.validation)

            if (error) {
                memo[field.key] = true
            }

            return memo
        }, {})

        if (scheme.otp) {
            if (currentOtpField) {
                const otpField = scheme.otpTypes.find(f => f.key === currentOtpField)
                const error = validate.single(formData[`__otp__${currentOtpField}`],
                    otpField.validation)
                if (error) {
                    formErrors[`__otp__${currentOtpField}`] = true
                }
            } else {
                formErrors.__otp__ = false
            }
        }

        this.setState({formErrors})
    }

    componentWillUnmount() {
        this.stopPullingTokenStatus()
    }

    handleGoToExample = () => {
        const {navigation} = this.props
        Keyboard.dismiss()
        this.setState({inProgress: true})

        return skipToDemoCompany.post({
            body: {},
        })
            .then(() => {
                this.setState({inProgress: false})
                return goTo(navigation, 'LOGIN')
            })
            .catch(() => {

            })
    }

    termsToggle = () => {
        const {termsOpen} = this.state
        this.setState({termsOpen: !termsOpen})
    }
    privacyPolicyToggle = () => {
        const {privacyPolicyOpen} = this.state
        this.setState({privacyPolicyOpen: !privacyPolicyOpen})
    }
    handleLink = () => {
        IS_LIGHT.light = null
        this.setState({
            business: null,
            screen: SCREEN.Preview,
        })
        const {navigation} = this.props
        goTo(navigation, LOGIN)
    }
    handleLinkTermsPrivacyPolicy = () => {
        this.privacyPolicyToggle()
        this.termsToggle()
    }

    handleLinkAppStore = () => {
        const link = 'https://www.apple.com/legal/internet-services/itunes/'
        Linking.canOpenURL(link)
            .then(s => {
                if (s) {
                    Linking.openURL(link).then(r => {
                    })
                }
            })
    }
    handleLinkGoogle = () => {
        const link = 'https://play.google.com/intl/en/about/play-terms.html'
        Linking.canOpenURL(link)
            .then(s => {
                if (s) {
                    Linking.openURL(link).then(r => {
                    })
                }
            })
    }
    handleLinkTermsPrivacyPolicyGoogle = () => {
        const link = 'https://www.google.com/policies/privacy'
        Linking.canOpenURL(link)
            .then(s => {
                if (s) {
                    Linking.openURL(link).then(r => {
                    })
                }
            })
    }
    handleLinkSignBizibox = () => {
        const link = 'https://bizibox.biz/contact-us/'
        Linking.canOpenURL(link)
            .then(s => {
                if (s) {
                    Linking.openURL(link).then(r => {
                    })
                }
            })
    }
    getSwitchIcon = () => {
        return (
            <CustomIcon
                name={this.state.business ? 'ok' : 'times'}
                size={7}
                color={this.state.business ? colors.blue32 : colors.gray29}
            />
        )
    }
    handleChangeLight = (state) => () => {
        IS_LIGHT.light = state
        this.setState({
            business: !state,
            screen: SCREEN.PersonalData,
        })
    }

    render() {
        const {
            inProgress,
            screen,
            agreementConfirm,
            firstName,
            lastName,
            password,
            mail,
            cell,
            isReady,
            secureTextEntry,
            emailExists,
            firstNameValid,
            lastNameValid,
            cellValid,
            mailValid,
            passwordValid,
            mailIsHebrew,
            businessCategory,
            companyName,
            companyHp,
            companyNameValid,
            companyHpValid,
            idExists,
            bankId,
            bankModalIsOpen,
            formErrors,
            otpFormModalIsOpen,
            currentOtpField,
            lockedModalIsOpen,
            invalidPasswordModalIsOpen,
            successModalIsOpen,
            is409Error,
            termsOpen,
            privacyPolicyOpen,
            business,
        } = this.state
        const {t, isRtl} = this.props
        const schemeId = bankId
        if (!isReady) {
            return <Loader/>
        }

        return (
            <Fragment>
                <SafeAreaView style={{
                    backgroundColor: '#fafafa',
                    flex: 1,
                    marginTop: 0,
                    paddingTop: 0,
                    position: 'relative',
                }}>
                    <KeyboardAwareScrollView
                        enableOnAndroid
                        keyboardShouldPersistTaps="always"
                        contentContainerStyle={{}}
                        style={{}}>
                        <View style={[
                            styles.titleWrapper, {
                                marginTop: 25,
                                marginBottom: screen === SCREEN.Preview ? 0 : 25,
                            }]}>
                            <Image
                                style={styles.logoImg}
                                resizeMode="contain"
                                source={require('BiziboxUI/assets/logoBig.png')}
                            />
                            <Text
                                style={styles.titleText}>{screen === SCREEN.Preview
                                ? 'בחרו את המוצר שאליו תרצו להירשם'
                                : (
                                    business === false
                                        ? 'הרשמה ל-bizibox'
                                        : 'הרשמה ל-bizibox עסקים'
                                )}</Text>
                        </View>

                        {screen === SCREEN.Preview && (
                            <View style={{
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                flexDirection: 'column',
                                flex: 1,
                                width: '100%',
                                paddingHorizontal: 30,
                            }}>
                                <TouchableHighlight
                                    onPress={this.handleChangeLight(true)}
                                    underlayColor={'#0bc8b0'}
                                    style={{
                                        marginVertical: 58.5,
                                        paddingBottom: 4,
                                        height: 58,
                                        width: '100%',
                                        borderBottomWidth: 1.5,
                                        borderBottomColor: '#0bc8b0',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        flexDirection: 'column',
                                        backgroundColor: business === false
                                            ? '#0bc8b0'
                                            : 'transparent',
                                    }}>
                                    <View>
                                        <View style={{
                                            flexDirection: 'row-reverse',
                                        }}>
                                            <View>
                                                <Text style={[
                                                    {
                                                        fontFamily: fonts.regular,
                                                        color: business === false ? '#ffffff' : '#022258',
                                                        fontSize: sp(26),
                                                        alignSelf: 'center',
                                                    }]}>{' bizibox'}</Text>
                                            </View>
                                            <View>
                                                <Text style={[
                                                    {
                                                        fontFamily: fonts.regular,
                                                        color: business === false ? '#ffffff' : '#022258',
                                                        fontSize: sp(26),
                                                        alignSelf: 'center',
                                                    }]}>{'ניהול תקציב'}</Text>
                                            </View>
                                        </View>
                                        <Text style={[
                                            {
                                                fontFamily: fonts.light,
                                                color: business === false ? '#ffffff' : '#022258',
                                                fontSize: sp(17),
                                                alignSelf: 'center',
                                            }]}>{'החל מ- 19 ש”ח כולל מע”מ'}</Text>
                                    </View>
                                </TouchableHighlight>

                                <TouchableHighlight
                                    onPress={this.handleChangeLight(false)}
                                    underlayColor={'#0bc8b0'}
                                    style={{
                                        marginBottom: 58.5,
                                        height: 58,
                                        borderBottomWidth: 1.5,
                                        borderBottomColor: '#0bc8b0',
                                        width: '100%',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        flexDirection: 'column',
                                        backgroundColor: business === true
                                            ? '#0bc8b0'
                                            : 'transparent',
                                    }}>
                                    <View>
                                        <View style={{
                                            flexDirection: 'row-reverse',
                                            alignSelf: 'center',
                                        }}>
                                            <View>
                                                <Text style={[
                                                    {
                                                        fontFamily: fonts.regular,
                                                        color: business === true ? '#ffffff' : '#022258',
                                                        fontSize: sp(26),
                                                        alignSelf: 'center',
                                                    }]}>{' bizibox'}</Text>
                                            </View>
                                            <View>
                                                <Text style={[
                                                    {
                                                        fontFamily: fonts.regular,
                                                        color: business === true ? '#ffffff' : '#022258',
                                                        fontSize: sp(26),
                                                        alignSelf: 'center',
                                                    }]}>{'עסקים'}</Text>
                                            </View>
                                        </View>
                                        <Text style={[
                                            {
                                                fontFamily: fonts.light,
                                                color: business === true ? '#ffffff' : '#022258',
                                                fontSize: sp(17),
                                                alignSelf: 'center',
                                            }]}>{'החל מ- 179 ש”ח מע”מ כולל מע”מ'}</Text>
                                    </View>
                                </TouchableHighlight>
                                <View style={{
                                    flex: 1,
                                    width: '100%',
                                    backgroundColor: '#ced7e0',
                                    height: 1,
                                }}/>
                            </View>
                        )}

                        {screen !== SCREEN.Preview && (
                            <View style={{
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                marginBottom: 15,
                            }}>
                                <View style={{
                                    flexDirection: 'row-reverse',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                }}>
                                    <View style={{
                                        height: 10,
                                        flex: 2,
                                    }}/>
                                    <View style={{
                                        flex: 1,
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                    }}>
                                        <Image
                                            style={{
                                                width: 35,
                                                height: 35,
                                            }}
                                            source={require('BiziboxUI/assets/user.png')}
                                        />
                                    </View>
                                    <View style={{
                                        height: 1,
                                        flex: 3,
                                        borderTopColor: '#0bc7af',
                                        borderTopWidth: 0.5,
                                        borderTopStyle: 'dashed',
                                        borderRadius: 0.5,
                                        marginHorizontal: 2,
                                    }}/>
                                    <View style={{
                                        flex: 1.2,
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        opacity: screen !== SCREEN.PersonalData ? 1 : 0.5,
                                    }}>
                                        <Image
                                            style={{
                                                width: 40,
                                                height: 35,
                                            }}
                                            source={require('BiziboxUI/assets/diploma.png')}
                                        />
                                    </View>
                                    <View style={{
                                        height: 1,
                                        flex: 3,
                                        borderTopColor: '#0bc7af',
                                        borderTopWidth: 0.5,
                                        borderTopStyle: 'dashed',
                                        borderRadius: 0.5,
                                        marginHorizontal: 2,
                                    }}/>
                                    <View style={{
                                        flex: 1,
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        opacity: (screen !== SCREEN.PersonalData && screen !==
                                            SCREEN.BusinessData) ? 1 : 0.5,
                                    }}>
                                        <Image
                                            resizeMode="contain"
                                            style={{
                                                width: 34,
                                                height: 34,
                                            }}
                                            source={require('BiziboxUI/assets/connect.png')}
                                        />
                                    </View>
                                    <View style={{
                                        height: 10,
                                        flex: 2,
                                    }}/>
                                </View>

                                <View style={{
                                    flexDirection: 'row-reverse',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                }}>
                                    <View style={{
                                        height: 10,
                                        flex: 0.5,
                                    }}/>
                                    <View style={{
                                        flex: 2.5,
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                    }}>
                                        <Text style={{
                                            fontFamily: fonts.semiBold,
                                            color: '#0f3860',
                                            textAlign: 'center',
                                            fontSize: sp(14.5),
                                        }}>{'פרטים אישיים'}</Text>
                                    </View>
                                    <View style={{
                                        height: 10,
                                        flex: 0.5,
                                    }}/>
                                    <View style={{
                                        flex: 2.5,
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        opacity: screen !== SCREEN.PersonalData ? 1 : 0.5,
                                    }}>
                                        <Text style={{
                                            fontFamily: screen !== SCREEN.PersonalData
                                                ? fonts.semiBold
                                                : fonts.regular,
                                            color: '#0f3860',
                                            textAlign: 'center',
                                            fontSize: sp(14.5),
                                        }}>{!business ? 'פרטים נוספים' : 'פרטי העסק'}</Text>
                                    </View>
                                    <View style={{
                                        height: 10,
                                        flex: 0.5,
                                    }}/>
                                    <View style={{
                                        flex: 2.5,
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        opacity: (screen !== SCREEN.PersonalData && screen !==
                                            SCREEN.BusinessData) ? 1 : 0.5,
                                    }}>
                                        <Text style={{
                                            fontFamily: (screen !== SCREEN.PersonalData && screen !==
                                                SCREEN.BusinessData) ? fonts.semiBold : fonts.regular,
                                            color: '#0f3860',
                                            textAlign: 'center',
                                            fontSize: sp(14.5),
                                        }}>{'קישור לחשבון בנק'}</Text>
                                    </View>
                                    <View style={{
                                        height: 10,
                                        flex: 0.5,
                                    }}/>
                                </View>

                            </View>
                        )}

                        <View style={[
                            styles.container,
                            {
                                width: screen !== SCREEN.AccountData ? FORM_WIDTH : '100%',
                            },
                        ]}>
                            {screen === SCREEN.PersonalData && (
                                <Fragment>

                                    <Text style={{
                                        fontFamily: fonts.regular,
                                        color: colors.blue29,
                                        textAlign: 'center',
                                        fontSize: sp(14),
                                        marginBottom: 5,
                                    }}>{'*בהמשך תוכלו להוסיף משתמשים נוספים'}</Text>

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 5,
                                    }}>
                                        <TextInput
                                            maxLength={30}
                                            onEndEditing={this.handleUpdateFieldValid(
                                                'firstNameValid')}
                                            onBlur={this.handleUpdateFieldValid('firstNameValid')}
                                            placeholder={'שם פרטי'}
                                            placeholderTextColor="#202020"
                                            autoCorrect={false}
                                            autoCapitalize="sentences"
                                            returnKeyType="done"
                                            keyboardType="visible-password"
                                            underlineColorAndroid="transparent"
                                            style={[
                                                styles.input,
                                                {
                                                    borderBottomColor: !firstNameValid
                                                        ? colors.red2
                                                        : colors.blue3,
                                                    borderBottomWidth: 2,
                                                    fontFamily: fonts.semiBold,
                                                    fontWeight: 'normal',
                                                    color: colors.blue29,
                                                    textAlign: 'right',
                                                    height: 50,
                                                    fontSize: sp(17),
                                                    backgroundColor: 'transparent',
                                                },
                                            ]}
                                            onSubmitEditing={this.handleUpdateLeadInfo}
                                            onChangeText={this.handleUpdateField('firstName')}
                                            value={firstName}
                                        />
                                    </View>

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 5,
                                    }}>
                                        <TextInput
                                            maxLength={30}
                                            onEndEditing={this.handleUpdateFieldValid(
                                                'lastNameValid')}
                                            onBlur={this.handleUpdateFieldValid('lastNameValid')}
                                            placeholder={'שם משפחה'}
                                            placeholderTextColor="#202020"
                                            autoCorrect={false}
                                            autoCapitalize="sentences"
                                            returnKeyType="done"
                                            keyboardType="visible-password"
                                            underlineColorAndroid="transparent"
                                            style={[
                                                styles.input,
                                                {
                                                    borderBottomColor: !lastNameValid
                                                        ? colors.red2
                                                        : colors.blue3,
                                                    borderBottomWidth: 2,
                                                    fontFamily: fonts.semiBold,
                                                    fontWeight: 'normal',
                                                    color: colors.blue29,
                                                    textAlign: 'right',
                                                    height: 50,
                                                    fontSize: sp(17),
                                                    backgroundColor: 'transparent',
                                                },
                                            ]}
                                            onSubmitEditing={this.handleUpdateLeadInfo}
                                            onChangeText={this.handleUpdateField('lastName')}
                                            value={lastName}
                                        />
                                    </View>

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 5,
                                    }}>
                                        <TextInput
                                            maxLength={11}
                                            placeholder={'טלפון נייד (לצורך שחזור סיסמה בלבד)'}
                                            placeholderTextColor="#202020"
                                            autoCorrect={false}
                                            autoCapitalize="none"
                                            returnKeyType="done"
                                            keyboardType="numeric"
                                            underlineColorAndroid="transparent"
                                            style={[
                                                styles.input,
                                                {
                                                    borderBottomColor: !cellValid
                                                        ? colors.red2
                                                        : colors.blue3,
                                                    borderBottomWidth: 2,
                                                    fontFamily: fonts.semiBold,
                                                    fontWeight: 'normal',
                                                    color: colors.blue29,
                                                    textAlign: (!cell || (cell && cell.length === 0))
                                                        ? 'right'
                                                        : 'left',
                                                    height: 50,
                                                    fontSize: sp(17),
                                                    backgroundColor: 'transparent',
                                                },
                                            ]}
                                            onEndEditing={(e) => {
                                                this.setState({
                                                    cell: e.nativeEvent.text.toString()
                                                        .replace(/[^\d-]/g, ''),
                                                })
                                                this.handleUpdateFieldValid('cellValid')(e)
                                            }}
                                            onBlur={this.handleUpdateFieldValid('cellValid')}
                                            onChangeText={this.handleUpdateField('cell')}
                                            onSubmitEditing={this.handleUpdateLeadInfo}
                                            value={cell}
                                        />
                                    </View>

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 5,
                                    }}>
                                        <TextInput
                                            onEndEditing={this.handleUpdateFieldValid('mailValid')}
                                            onBlur={this.handleUpdateFieldValidAsync}
                                            placeholder={t('common:label:email')}
                                            placeholderTextColor="#202020"
                                            autoCorrect={false}
                                            autoCapitalize="none"
                                            returnKeyType="done"
                                            keyboardType="email-address"
                                            underlineColorAndroid="transparent"
                                            style={[
                                                styles.input,
                                                {
                                                    borderBottomColor: (emailExists || !mailValid)
                                                        ? colors.red2
                                                        : colors.blue3,
                                                    borderBottomWidth: 2,
                                                    fontFamily: fonts.semiBold,
                                                    fontWeight: 'normal',
                                                    color: colors.blue29,
                                                    textAlign: (!mail || (mail && mail.length === 0))
                                                        ? 'right'
                                                        : 'left',
                                                    height: 50,
                                                    fontSize: sp(17),
                                                    backgroundColor: 'transparent',
                                                },
                                            ]}
                                            onSubmitEditing={this.handleUpdateLeadInfo}
                                            onChangeText={this.handleUpdateField('mail')}
                                            value={mail}
                                        />
                                    </View>

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 0,
                                    }}>
                                        {(emailExists === true) && (
                                            <View style={{
                                                width: '100%',
                                                marginVertical: 0,
                                                flexDirection: 'row-reverse',
                                                justifyContent: 'center',
                                            }}>

                                                <Text
                                                    style={[
                                                        {
                                                            color: colors.red7,
                                                            fontSize: sp(14),
                                                            textAlign: 'center',
                                                            fontFamily: fonts.regular,
                                                        }]}>
                                                    {'מייל זה קיים במערכת, עבור ל-'}
                                                </Text>

                                                <TouchableOpacity onPress={this.handleGoToLogin}>
                                                    <Text
                                                        style={[
                                                            {
                                                                color: colors.blue30,
                                                                fontSize: sp(14),
                                                                textAlign: 'center',
                                                                fontFamily: fonts.regular,
                                                            }]}>
                                                        {'מסך כניסה'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {(mailIsHebrew === true) && (
                                            <Text style={[
                                                {
                                                    width: '100%',
                                                    marginVertical: 0,
                                                    color: colors.red7,
                                                    fontSize: sp(14),
                                                    textAlign: 'center',
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
                                                    textAlign: 'center',
                                                    fontFamily: fonts.regular,
                                                }]}>
                                                {'נראה שנפלה טעות במייל, אנא בדקו שנית'}
                                            </Text>
                                        )}
                                    </View>

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 5,
                                    }}>

                                        <TextInput
                                            placeholder={'סיסמה'}
                                            placeholderTextColor="#202020"
                                            underlineColorAndroid="transparent"
                                            secureTextEntry={!secureTextEntry}
                                            style={[
                                                styles.input,
                                                {
                                                    borderBottomColor: !passwordValid
                                                        ? colors.red2
                                                        : colors.blue3,
                                                    borderBottomWidth: 2,
                                                    fontFamily: fonts.semiBold,
                                                    fontWeight: 'normal',
                                                    color: colors.blue29,
                                                    textAlign: 'right',
                                                    height: 50,
                                                    fontSize: sp(17),
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
                                            onSubmitEditing={this.handleUpdateLeadInfo}
                                        />

                                        <TouchableOpacity style={{
                                            position: 'absolute',
                                            backgroundColor: 'transparent',
                                            height: '100%',
                                            left: 0,
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
                                    <View style={{
                                        width: '100%',
                                        maxHeight: 80,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <View style={{
                                            flexDirection: 'row-reverse',
                                            alignItems: 'center',
                                            width: '100%',
                                            flexGrow: 1,
                                        }}>
                                            <View>
                                                <CheckBox
                                                    containerStyle={{
                                                        backgroundColor: 'transparent',
                                                        right: -10,
                                                        width: 107,
                                                        margin: 0,
                                                        padding: 0,
                                                        borderWidth: 0,
                                                    }}
                                                    textStyle={{
                                                        fontSize: sp(13),
                                                        color: !agreementConfirm
                                                            ? colors.red2
                                                            : colors.blue30,
                                                        fontWeight: 'normal',
                                                        textAlign: 'right',
                                                        fontFamily: fonts.regular,
                                                        right: -2,
                                                        margin: 0,
                                                        padding: 0,
                                                    }}
                                                    size={30}
                                                    right
                                                    title="קראתי ואני מסכים"
                                                    iconRight
                                                    checkedIcon={<Image
                                                        style={{
                                                            width: 19.5,
                                                            height: 19.5,
                                                            marginTop: 0,
                                                        }}
                                                        source={require(
                                                            'BiziboxUI/assets/boxChecked.png')}/>}
                                                    uncheckedIcon={<Image
                                                        style={{
                                                            width: 19.5,
                                                            height: 19.5,
                                                            marginTop: 0,
                                                        }}
                                                        source={require(
                                                            'BiziboxUI/assets/boxUnChecked.png')}/>}
                                                    checked={agreementConfirm}
                                                    onPress={() => this.setState(
                                                        {agreementConfirm: !agreementConfirm})}
                                                />
                                            </View>
                                            <Text
                                                onPress={this.termsToggle}
                                                style={{
                                                    marginRight: -10,
                                                    fontSize: sp(13),
                                                    fontFamily: fonts.regular,
                                                    color: '#007ebf',
                                                    textDecorationLine: 'underline',
                                                    textDecorationStyle: 'solid',
                                                    textDecorationColor: '#007ebf',
                                                }}>
                                                {'לתנאי שימוש'}
                                            </Text>
                                            <Text>{'  '}</Text>
                                            <Text
                                                onPress={this.privacyPolicyToggle}
                                                style={{
                                                    fontSize: sp(13),
                                                    fontFamily: fonts.regular,
                                                    color: '#007ebf',
                                                    textDecorationLine: 'underline',
                                                    textDecorationStyle: 'solid',
                                                    textDecorationColor: '#007ebf',
                                                }}>
                                                {'ומדיניות הפרטיות'}
                                            </Text>
                                        </View>
                                    </View>

                                    <Button
                                        disabled={!(
                                            firstNameValid && lastNameValid && cellValid &&
                                            mailValid && passwordValid && agreementConfirm &&
                                            !emailExists &&
                                            (firstName && firstName.length > 0) &&
                                            (lastName && lastName.length > 0) &&
                                            (password && password.length > 0) &&
                                            (mail && mail.length > 0) && (cell && cell.length > 0)
                                        )}
                                        disabledTitleStyle={{
                                            color: '#ffffff',
                                            opacity: 0.8,
                                        }}
                                        disabledStyle={{
                                            backgroundColor: colors.green12,
                                            opacity: 0.8,
                                        }}
                                        loading={inProgress}
                                        buttonStyle={[
                                            styles.btn, {
                                                marginTop: 10,
                                            }]}
                                        titleStyle={styles.btnText}
                                        onPress={this.handleUpdateLeadInfo}
                                        title={'המשך'}
                                    />
                                </Fragment>
                            )}

                            {screen === SCREEN.BusinessData && (
                                <Fragment>
                                    <Text style={{
                                        fontFamily: fonts.regular,
                                        color: colors.blue29,
                                        textAlign: 'center',
                                        fontSize: sp(14),
                                        marginBottom: 5,
                                    }}>{'*בהמשך תוכלו להוסיף משתמשים נוספים'}</Text>

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 5,
                                    }}>
                                        <TextInput
                                            maxLength={40}
                                            onEndEditing={this.handleUpdateFieldValid(
                                                'companyNameValid')}
                                            onBlur={this.handleUpdateFieldValid('companyNameValid')}
                                            placeholder={!business ? 'שם העסק/אחר' : 'שם העסק'}
                                            placeholderTextColor="#202020"
                                            autoCorrect={false}
                                            autoCapitalize="sentences"
                                            returnKeyType="done"
                                            keyboardType="default"
                                            underlineColorAndroid="transparent"
                                            style={[
                                                styles.input,
                                                {
                                                    borderBottomColor: !companyNameValid
                                                        ? colors.red2
                                                        : colors.blue3,
                                                    borderBottomWidth: 2,
                                                    fontFamily: fonts.semiBold,
                                                    fontWeight: 'normal',
                                                    color: colors.blue29,
                                                    textAlign: 'right',
                                                    height: 50,
                                                    fontSize: sp(17),
                                                    backgroundColor: 'transparent',
                                                },
                                            ]}
                                            onSubmitEditing={this.handleSignupCreate}
                                            onChangeText={this.handleUpdateField('companyName')}
                                            value={companyName}
                                        />
                                    </View>

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 5,
                                    }}>
                                        <TextInput
                                            maxLength={9}
                                            placeholder={'מס\' ח.פ או ת.ז'}
                                            placeholderTextColor="#202020"
                                            autoCorrect={false}
                                            autoCapitalize="none"
                                            returnKeyType="done"
                                            keyboardType="numeric"
                                            underlineColorAndroid="transparent"
                                            style={[
                                                styles.input,
                                                {
                                                    borderBottomColor: (!companyHpValid || idExists)
                                                        ? colors.red2
                                                        : colors.blue3,
                                                    borderBottomWidth: 2,
                                                    fontFamily: fonts.semiBold,
                                                    fontWeight: 'normal',
                                                    color: colors.blue29,
                                                    textAlign: (!companyHp ||
                                                        (companyHp && companyHp.length === 0))
                                                        ? 'right'
                                                        : 'left',
                                                    height: 50,
                                                    fontSize: sp(17),
                                                    backgroundColor: 'transparent',
                                                },
                                            ]}
                                            onEndEditing={(e) => {
                                                this.setState({
                                                    companyHp: e.nativeEvent.text.toString()
                                                        .replace(/[^\d]/g, ''),
                                                })
                                                this.handleUpdateFieldValid('companyHpValid')(e)
                                            }}
                                            onBlur={this.handleUpdateFieldValid('companyHpValid')}
                                            onChangeText={this.handleUpdateField('companyHp')}
                                            onSubmitEditing={this.handleSignupCreate}
                                            value={companyHp}
                                        />
                                    </View>

                                    {idExists && (
                                        <View style={{
                                            width: '100%',
                                            marginVertical: 0,
                                        }}>
                                            <Text style={[
                                                {
                                                    color: colors.red7,
                                                    fontSize: sp(14),
                                                    textAlign: 'center',
                                                    fontFamily: fonts.regular,
                                                }]}>
                                                {'מספר זה קיים במערכת. חייגו 03-5610382 ונשמח לעזור'}
                                            </Text>
                                        </View>
                                    )}

                                    <View style={{
                                        width: '100%',
                                        marginVertical: 5,
                                    }}>
                                        <TextInput
                                            maxLength={30}
                                            placeholder={'תחום עיסוק (לדוגמה: בית קפה, סוכנות ביטוח)'}
                                            placeholderTextColor="#202020"
                                            autoCorrect={false}
                                            autoCapitalize="sentences"
                                            returnKeyType="done"
                                            keyboardType="default"
                                            underlineColorAndroid="transparent"
                                            style={[
                                                styles.input,
                                                {
                                                    borderBottomColor: colors.blue3,
                                                    borderBottomWidth: 2,
                                                    fontFamily: fonts.semiBold,
                                                    fontWeight: 'normal',
                                                    color: colors.blue29,
                                                    textAlign: 'right',
                                                    height: 50,
                                                    fontSize: sp(17),
                                                    backgroundColor: 'transparent',
                                                },
                                            ]}
                                            onSubmitEditing={this.handleSignupCreate}
                                            onChangeText={this.handleUpdateField('businessCategory')}
                                            value={businessCategory}
                                        />
                                    </View>

                                    <Button
                                        disabled={!(
                                            companyHpValid && companyNameValid && !idExists &&
                                            (companyHp && companyHp.length > 0) &&
                                            (companyName && companyName.length > 0)
                                        )}
                                        disabledTitleStyle={{
                                            color: '#ffffff',
                                            opacity: 0.8,
                                        }}
                                        disabledStyle={{
                                            backgroundColor: colors.green12,
                                            opacity: 0.8,
                                        }}
                                        loading={inProgress}
                                        buttonStyle={[
                                            styles.btn, {
                                                marginTop: 10,
                                            }]}
                                        titleStyle={styles.btnText}
                                        onPress={this.handleSignupCreate}
                                        title={'המשך'}
                                    />

                                    <TouchableOpacity
                                        style={{
                                            marginTop: 10,
                                        }}
                                        onPress={this.handleGoToPersonalData}>
                                        <Text
                                            style={[
                                                {
                                                    color: colors.blue30,
                                                    fontSize: sp(17),
                                                    textAlign: 'center',
                                                    fontFamily: fonts.semiBold,
                                                }]}>
                                            {'< חזור'}
                                        </Text>
                                    </TouchableOpacity>
                                </Fragment>
                            )}
                            {screen === SCREEN.AccountData && (
                                <Fragment>
                                    <Text style={styles.addAccountTitle}>
                                        {t('settings:bankAccountsTab:enterLogin')}
                                    </Text>
                                    <Text style={styles.addAccountSubTitle}>
                                        {t('settings:bankAccountsTab:pleaseEnterDataFromBank')}
                                    </Text>
                                    <View style={styles.formWrapper}>
                                        {this.renderHeaderForm()}
                                        {this.renderForm()}
                                    </View>
                                    <View style={styles.validationContainer}>
                                        {Object.keys(formErrors).map(key => {
                                            if (key.includes('__otp__')) {
                                                if (!currentOtpField) {
                                                    return null
                                                }
                                                return (
                                                    <Text style={styles.errMessageText} key={key}>
                                                        {t(
                                                            `foreignCredentials:${bankId}:otpTypes:${currentOtpField}:label`)}: {t(
                                                        `foreignCredentials:${bankId}:otpTypes:${currentOtpField}:rule`)}
                                                    </Text>
                                                )
                                            }

                                            return (
                                                <Text style={styles.errMessageText} key={key}>
                                                    {t(
                                                        `foreignCredentials:${schemeId}:${key}:label`)}: {t(
                                                    `foreignCredentials:${schemeId}:${key}:rule`)}
                                                </Text>
                                            )
                                        })}

                                        {'message' in he.foreignCredentials[schemeId] && (
                                            <Text
                                                style={styles.infoMessageText}>{t(
                                                `foreignCredentials:${schemeId}:message`)}</Text>
                                        )}

                                        {is409Error && (
                                            <Text
                                                style={styles.errMessageText}>{'פרטי הכניסה קיימים במערכת'}</Text>
                                        )}
                                    </View>
                                    {bankId === '122' ? (
                                        <Button
                                            disabled={(!ALL_BANK_CREDENTIALS_SCHEME[bankId] ||
                                                inProgress || !isEmpty(formErrors))}
                                            disabledTitleStyle={{
                                                color: '#ffffff',
                                                opacity: 0.8,
                                            }}
                                            disabledStyle={{
                                                backgroundColor: colors.green12,
                                                opacity: 0.8,
                                            }}
                                            loading={inProgress}
                                            buttonStyle={[
                                                styles.btn, {
                                                    marginTop: 10,
                                                }]}
                                            titleStyle={styles.btnText}
                                            onPress={this.handleGoToExample}
                                            title={'לחודש התנסות בחינם'}
                                        />
                                    ) : (
                                        <Button
                                            disabled={(!ALL_BANK_CREDENTIALS_SCHEME[bankId] ||
                                                inProgress || !isEmpty(formErrors))}
                                            disabledTitleStyle={{
                                                color: '#ffffff',
                                                opacity: 0.8,
                                            }}
                                            disabledStyle={{
                                                backgroundColor: colors.green12,
                                                opacity: 0.8,
                                            }}
                                            loading={inProgress}
                                            buttonStyle={[
                                                styles.btn, {
                                                    marginTop: 10,
                                                }]}
                                            titleStyle={styles.btnText}
                                            onPress={this.handleCreateBankToken}
                                            title={'המשך'}
                                        />
                                    )}

                                    <TouchableOpacity
                                        style={{
                                            marginTop: 10,
                                        }}
                                        onPress={this.handleGoToExample}>
                                        <Text
                                            style={[
                                                {
                                                    color: colors.blue30,
                                                    fontSize: sp(17),
                                                    textAlign: 'center',
                                                    fontFamily: fonts.semiBold,
                                                }]}>
                                            {'דלג לחברה לדוגמה'}
                                        </Text>
                                    </TouchableOpacity>
                                </Fragment>
                            )}
                        </View>
                        <View style={{
                            flexDirection: 'column',
                            alignSelf: 'center',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            alignContent: 'center',
                            marginBottom: 5,
                            marginTop: 30,
                        }}>
                            <View>
                                <Text style={{
                                    fontFamily: fonts.semiBold,
                                    color: '#0f3860',
                                    textAlign: 'center',
                                    fontSize: sp(14.5),
                                }}>
                                    ההרשמה היא להתנסות חינם וניתן לבטלה בכל עת
                                </Text>
                                <Text style={{
                                    fontFamily: fonts.semiBold,
                                    color: '#0f3860',
                                    textAlign: 'center',
                                    fontSize: sp(14.5),
                                }}>
                                    המערכת מאובטחת בסטנדרטים בנקאיים
                                </Text>
                            </View>

                            <Image
                                style={[
                                    {
                                        width: 188,
                                        height: 23,
                                        marginVertical: 15,
                                    }]}
                                source={require('BiziboxUI/assets/securityIcons.png')}
                            />

                            <View
                                style={{
                                    borderTopWidth: 1,
                                    borderTopColor: '#cacaca',
                                    flexDirection: 'row-reverse',
                                    height: 20,
                                    paddingTop: 10,
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                }}>
                                {!business && (
                                    <Fragment>
                                        <Text
                                            style={{
                                                fontSize: sp(14),
                                                height: 20,
                                                textAlign: 'center',
                                                alignSelf: 'center',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                            }}>
                                            {'נתקלתם בבעיה? '}</Text>
                                        <TouchableOpacity
                                            onPress={this.handleLinkSignBizibox}>
                                            <Text
                                                style={{
                                                    fontSize: sp(14),
                                                    height: 20,
                                                    textAlign: 'center',
                                                    alignSelf: 'center',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    alignContent: 'center',
                                                    color: colors.blue30,
                                                }}>
                                                {'צרו קשר'}</Text>
                                        </TouchableOpacity>
                                    </Fragment>
                                )}
                                {business && (
                                    <Text
                                        style={{
                                            fontSize: sp(14),
                                            height: 20,
                                            textAlign: 'center',
                                            alignSelf: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        }}>
                                        {'נתקלתם בבעיה? חייגו 2365* ונשמח לעזור'}</Text>
                                )}
                            </View>

                            <TouchableOpacity
                                onPress={this.handleLink}
                                style={{
                                    flexDirection: 'row-reverse',
                                    height: 20,
                                    paddingTop: 10,
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                }}>
                                <Text style={{
                                    fontSize: sp(14),
                                    height: 20,
                                    textAlign: 'center',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    color: colors.blue30,
                                }}>
                                    {'חזרה למסך כניסה'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>

                    {bankModalIsOpen && (
                        <BankModal
                            selectedBankId={bankId}
                            onClose={this.handleToggleBankModal}
                            onChange={this.handleChangeBankId}
                        />
                    )}

                    {otpFormModalIsOpen && this.renderOtpForm()}

                    {invalidPasswordModalIsOpen && (
                        <WrongStatusModal
                            title={t('settings:bankAccountsTab:addBankAccount')}
                            attemptsNumber={3 - this.screenPasswordUpdateCount}
                            onSubmit={this.clearForm}
                        />
                    )}

                    {lockedModalIsOpen && (
                        <BlockedModal
                            title={t('settings:bankAccountsTab:addBankAccount')}
                            onClose={this.handleGoToLogin}
                            onOpenBankSite={this.handleOpenBankSite}
                        />
                    )}

                    {successModalIsOpen && (
                        <SuccessModal
                            title={t('settings:bankAccountsTab:addBankAccount')}
                            onClose={this.handleGoToLogin}
                            onOpenBankSite={this.handleOpenBankSite}
                        />
                    )}
                </SafeAreaView>

                {termsOpen && (
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible
                        onRequestClose={() => {
                            // //console.log('Modal has been closed.')
                        }}>
                        <SafeAreaView style={{
                            flex: 1,
                            marginTop: 0,
                            paddingTop: 0,
                            position: 'relative',
                        }}>
                            <View style={{
                                flex: 1,
                                alignItems: 'center',
                            }}>
                                <View style={{
                                    height: 68,
                                    backgroundColor: '#002059',
                                    width: '100%',
                                    paddingTop: 0,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                }}>
                                    <View style={cs(
                                        !isRtl,
                                        [
                                            {
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
                                                {'תנאי שימוש'}
                                            </Text>
                                        </View>
                                        <View>
                                            <TouchableOpacity onPress={this.termsToggle}>
                                                <View style={{
                                                    marginRight: 'auto',
                                                }}>
                                                    <Icon name="chevron-right" size={24}
                                                          color={colors.white}/>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View style={{
                                    width: '100%',
                                    height: '100%',
                                    marginTop: 10,
                                    marginBottom: 10,
                                    paddingLeft: 0,
                                    paddingRight: 10,
                                    flex: 1,
                                }}>
                                    <ScrollView
                                        style={[
                                            styles.accountsContainer, {
                                                flex: 1,
                                                position: 'relative',
                                            }]}
                                        contentContainerStyle={[
                                            styles.tableWrapper, {
                                                backgroundColor: '#ffffff',
                                                flexGrow: 1,
                                                paddingTop: 0,
                                                marginTop: 0,
                                                paddingBottom: 0,
                                            }]}>
                                        <View
                                            style={{
                                                marginHorizontal: 15,
                                            }}>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'חברת איי פקט בע”מ ('}

                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{' '}{'“אנחנו”'}{' '}</Text>
                                                {'או'}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{' '}{'“החברה“'}{' '}</Text>

                                                {') מברכת אותך ('}

                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{' '}{'“המשתמש”'}{' '}</Text>
                                                {'או'}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{' '}{'“אתה“'}{' '}</Text>

                                                {') על השימוש באפליקציית ביזיבוקס ('}

                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{' '}{'“האפליקציה“'}</Text>

                                                {') ו/או בממשק האינטרנטי שלה בפורטל האינטרנט '}
                                                <Text
                                                    onPress={this.handleLink}
                                                    style={{
                                                        color: '#007ebf',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#007ebf',
                                                    }}>{'bsecure.bizibox.biz '}</Text>
                                                {' ('}

                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{' '}{'“הפורטל“'}</Text>
                                                {'), אשר מתבססים על התוכנה של החברה בתחום הניהול, הבקרה והתכנון הפיננסי עסקי, המאפשרת ניהול מידע פיננסי, באופן העשוי לייעל ולתרום להתנהלות המשתמש ('}

                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{' '}{'“השירותים“'}</Text>
                                                {').  תנאי השימוש אשר המפורטים להלן ('}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{' '}{'“תנאי שימוש“'}</Text>
                                                {') חלים על השימוש שלך בפורטל, באפליקציה ובשירותים של החברה (אשר יסופקו לך באמצעות הפורטל ו/או האפליקציה).  כל משתמש בפורטל ובאפליקציה רשאי להשתמש בפורטל ובאפליקציה בהתאם לתנאים ולהוראות המצוינים במסמך זה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'מדיניות הפרטיות מנוסחת בלשון זכר לצרכי נוחות בלבד, והיא מתייחסת, כמובן, גם לנשים.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'1. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'הסכמה לתנאי השימוש'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'אנא קרא בעיון: '}</Text>
                                                {'בעצם הכניסה לפורטל והשימוש בו ו/או התקנת האפליקציה ו/או בעצם השימוש באפליקציה ו/או בשירותים ו/או בעצם רישומך ופתיחת החשבון ו/או באמצעות סימון “'}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'✓'}</Text>
                                                {'” בתיבה המיועדת לכך בתחתית הסכם רישיון השימוש באפליקציה (“'}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'ההסכם'}</Text>
                                                {'“), הינך נותן את הסכמתך ואישורך כי קראת והבנת תנאי שימוש אלה (לרבות התנאים המפורטים במדיניות הפרטיות של הפורטל והאפליקציה המוגדרת בהרחבה בסעיף ‏13 להלן), אתה מסכים כי התנאים יחייבו אותך וכי תפעל בהתאם לכל הדינים והתקנות החלים בקשר לשימוש בשירותים ואתה מאשר כי תנאים אלה מהווים הסכם משפטי מחייב וניתן לאכיפה בין החברה לבינך.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'אם אינך מסכים לאי אילו מתנאי השימוש, הנך מחויב, באופן מיידי, להימנע מכניסה או מהתחברות או משימוש בפורטל ו/או להסיר ולמחוק את האפליקציה מהמכשיר הנייד שלך ואינך רשאי לעשות כל שימוש שהוא באפליקציה ו/או בשירותים, בכל אופן שהוא.'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'שים לב: '}</Text>
                                                {'השימוש בפורטל ובשירותים נועד למשתמשים מעל גיל 18 בלבד.  אם אינך מעל גיל 18 – אינך רשאי להשתמש בפורטל ובשירותים.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'2. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'הפורטל, האפליקציה והשירותים'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'פרטים בעניין המידע הנאסף עקב השימוש של משתמשים בפורטל ובאפליקציה מצוי במדיניות הפרטיות של הפורטל והאפליקציה המופיעה בלינק הבא: '}
                                                <Text
                                                    onPress={this.handleLinkTermsPrivacyPolicy}
                                                    style={{
                                                        color: '#007ebf',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#007ebf',
                                                    }}>{'https://bizibox.biz/privacy-policy-potal-app.'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'יתכן כי האפליקציה תהיה זמינה רק למערכות הפעלה מסוימות (למשל iOS ואנדרואיד). המשתמש רשאי להוריד ולהשתמש באפליקציה רק במכשיר אשר מותקנת בו גרסה מקורית של מערכת ההפעלה, עליה נועדה האפליקציה לפעול.  על מנת לפתוח או להשתמש באפליקציה, או כל חלק הימנה, על המשתמש להשיג את כל התוכנות, האמצעים והציוד הדרושים, על חשבונו ובאחריותו הבלעדית.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'שים לב: '}</Text>
                                                {'יתכן כי חלק מהשירותים הזמינים בפורטל לא יהיו זמינים באפליקציה או שצורת הופעתם באפליקציה תהיה שונה מהצורה בה הם מופיעים בפורטל.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'השימוש בשירותים באמצעות הפורטל ו/או האפליקציה כרוך בתשלום דמי שימוש כמפורט בהרחבה בסעיף ‏6 להלן.  בנוסף, הנך מסכים ומאשר כי אתה עשוי להיות מחויב על-ידי צדדים שלישיים עבור שימוש באינטרנט, חיבור לרשת ושימוש בחבילת Data.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה שומרת לעצמה את הזכות להוסיף שירותים חדשים לשירותים, להסיר, לתקן ו/או לשנות כל חלק מהם ו/או לבצע בהם עדכונים, תיקונים, פעולות תחזוקה ו/או כל פעולה אחרת, שהחברה, לפי שיקול דעתה הבלעדי, תמצא לנכון לנקוט.  השימוש בפורטל ובאפליקציה מתבצע באמצעות תקשורת מאובטחת (SSL), באמצעות הצפנת שדות רגישים ואמצעי הגנה נוספים.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'מובהר כי איכות מסכי התצוגה (dashboards) של השירותים, אשר תתקבל במסכי הלקוח ובמחשביו, תלויה ברזולוציה של מסכיו ומחשביו, ולחברה אין כל אחריות בעניין זה.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'עוד מובהר, כי החברה אינה אחראית, במישרין ו/או בעקיפין, למחשבים ו/או לציוד כלשהו של הלקוח בכל צורה ואופן, וכי האחריות המלאה עליהם הינה של הלקוח.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'שים לב: '}</Text>
                                                {'השירות ו/או תוצריו אינם מהווים ייעוץ למשתמשים, לרבות אך מבלי להגביל את כלליות האמור, ייעוץ משפטי, כספי, פיננסי, חשבונאי, מיסוי ו/או בהשקעות, ואין בשירות ו/או בתוצריו משום הצעה, שידול או ייעוץ לביצוע עסקאות ו/או פעולות כספיות כלשהן, לרבות נטילת אשראי ו/או ביצוע השקעות.  מכיוון שמצבו העסקי של כל אדם ו/או תאגיד הוא ייחודי, לפני קבלת החלטה ו/או יישום אסטרטגיה כלשהי, על המשתמשים לשקול קבלת ייעוץ מבעלי המקצוע הרלבנטיים, ובכלל זה מרואה החשבון ו/או מיועצים כלכליים אחרים של המשתמשים, המודעים באופן מלא למכלול נסיבותיו וצרכיו האישיים, וכן לשקול לבחון מקורות מידע נוספים בנוגע למצבו הפיננסי.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'האחריות בגין כל פעולה ו/או תוצאה עסקית של המשתמשים ו/או בגין קבלת החלטה עסקית של המשתמשים, בין אם הן מתבססות על שימוש בתוכנה ו/או בשירות ובין אם לאו, הינה של המשתמשים באופן מלא ובלעדי, והמשתמשים מוותר בזאת על כל טענה, דרישה ו/או תביעה כנגד החברה ו/או מי מטעמה בקשר לכך.  ככל שמידע שנמסר למשתמשים במסגרת השירות מתבסס על ההנחה, כי יתקיימו תנאים מוקדמים מסוימים, הרי שנכונות המידע מותנית בכך שכל אותם תנאים מוקדמים יתקיימו בפועל.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'המידע והנתונים הנכללים בפורטל, הינם על בסיס המידע שהועבר לחברה על-ידי המשתמשים וממקורות חיצוניים לחברה ואין לחברה כל אחריות לנכונותם, שלמותם ו/או אמיתותם.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'3. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'רישום לשירות והחשבון שלך'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'על מנת להשתמש בשירותים דרך הפורטל ו/או האפליקציה עליך ליצור חשבון משתמש הכולל שם משתמש וסיסמה אישיים ('}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'“שם המשתמש והסיסמה“'}</Text>
                                                {').  במסגרת הרישום המקוון/אלקטרוני תתבקש לספק את הפרטים הבאים: (א) שם פרטי, שם משפחה ומספר תעודת זהות, ככל שהינך יחיד; (ב) שם תאגיד ומספר תאגיד, ככל שהינך תאגיד; (ג) כתובת דוא”ל; (ד) מספר טלפון סלולרי; ו- (ה) מספר בנק.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'פתיחת פרופיל כרוכה בתשלום כמפורט בהרחבה בסעיף ‏6 להלן.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'עליך לספק מידע מלא, מדויק ונכון על מנת ליצור חשבון והנך מסכים בזאת כי לא תציג שלא כהלכה את זהותך או כל פרט אחר בחשבונך.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'המשתמש רשאי לשנות את שם משתמש וסיסמה בכל עת.  המשתמש מתחייב לנקוט בכל האמצעים הנדרשים לשמירת סודיות שם המשתמש והסיסמה ולא לחשוף אותם לצד שלישי כלשהו.  כמו כן, מתחייב המשתמש ליידע את החברה באופן מיידי על כל שימוש בלתי מורשה בשירות, לרבות בשם המשתמש והסיסמה, ולשתף פעולה עם החברה, ככל הנדרש, בקשר לטיפול במקרה כאמור.  בעקבות השימוש בתוכנה יישמרו נתוני המשתמש (כהגדרתם להלן), בין היתר, באופן מוצפן במכשיריו (לרבות מחשביו, טלפון סלולרי וכיו”ב), ולכן המשתמש מתחייב לנקוט במלוא אמצעי הזהירות כדי להבטיח את מכשיריו, ובכלל זה מפני סכנת גניבה.  השימוש בשירות מחייב חיבור רצוף של מכשירי המשתמש לרשת האינטרנט.  מובהר, כי שימוש ברשת אינטרנט אלחוטית ציבורית “פתוחה” חושף את המשתמש ו/או את נתוני המשתמש (כהגדרתם להלן) לסיכוני אבטחת מידע ופגיעה בפרטיות, ולכן מומלץ להשתמש בשירות רק באמצעות חיבור מאובטח לרשת האינטרנט.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'אתה אחראי באופן בלעדי ומלא, לשמור על סודיות הסיסמה, שם המשתמש והחשבון שלך ועל כל פעילות אשר תתבצע תחת הסיסמה שלך או במסגרת החשבון שלך. '}</Text>
                                                {'היה וסברנו, בתום לב, כי הקמת חשבון באמצעות פרטי זיהוי של אדם אחר, הרי שבכך הנך חושף את עצמך לאחריות פלילית ו/או אזרחית.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'אינך רשאי להעביר או להמחות את זכויותיך או להאציל את חובותיך על-פי החשבון, ללא הסכמה מוקדמת בכתב מהחברה'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה לא תהא אחראית לכל אבדן או נזק שנגרמו כתוצאה מחוסר יכולתך לעמוד בתנאים אלה או משימוש בלתי מורשה בסיסמתך או בחשבונך, או עקב פריצת אבטחה.  במקרים האמורים, יתכן כי תחוב בנזקים שנגרמו לחברה או לאחרים.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'4. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'נתוני המשתמש'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'לצורך שימוש בשירות על המשתמש להזין ו/או לאפשר גישה אל כל נתוניו בהתאם לנדרש על-פי ממשקי התוכנה ('}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>
                                                    {'נתוני המשתמש'}
                                                </Text>
                                                {').  אי העברת ו/או אספקת הגישה למלוא נתוני המשתמש תפגע באיכות וביעילות השירות, שכן השימוש בשירות מתבסס על זמינות, עדכניות, דיוק, נכונות, אמינות ושלמות נתוני המשתמש.  החברה אינה אחראית לנתוני המשתמש, כולם או חלקם, ובכלל זה לזמינות, דיוק, נכונות, שלמות ו/או חוקיות נתוני המשתמש ו/או לכל שגיאה ו/או תקלה בנתוני המשתמש (לרבות עקב שינוי ו/או שגיאה ו/או תקלה בתצוגות מסך ו/או בפורטל האינטרנט של נותן שירות, כהגדרתו להלן), ולמשתמש לא תהיה כל דרישה, טענה ו/או תביעה כלפי החברה בקשר לכך.  תוצרי השירות מופקים בהסתמך על נתוני המשתמש, כפי שהם (as is), על פי זמינותם (as available), ונכון למועד קבלתם, ואין בהם כדי לרפא כל טעות שנפלה בנתוני המשתמש במקור ו/או להציג נתונים שלא היו זמינים ו/או להתייחס לכל שינוי שחל בנתוני המשתמש לאחר מכן.  באחריות המשתמש לעדכן את החברה בנוגע לכל שינוי אשר עלול לפגוע בנגישות של החברה לנתוני המשתמש.  משתמש המעוניין שנתוני המשתמש שלו יכללו נתונים המנוהלים או מתוחזקים עבורו על-ידי צד שלישי, שהינו תאגיד הרשום בישראל, המספק שירות למשתמש ('}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>
                                                    {'נותן שירות'}
                                                </Text>
                                                {'), יזין את כל ההרשאות של המשתמש (לקריאת נתונים בלבד), הנדרשות להתחברות, ליקוט ויבוא נתוני המשתמש מנותן השירות ('}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>
                                                    {'ההרשאות'}
                                                </Text>
                                                {').  מובהר, כי קבלת השירות באמצעות חיבור של יותר מחמש (5) הרשאות (בין אם אלו הרשאות של נותן שירות אחד ובין אם אלו הרשאות של מספר נותני שירות) כרוכה בתוספת תשלום, כמפורט במחירון של החברה.  המשתמש מצהיר, כי הנו רשאי להשתמש בהרשאות, ולמסור ו/או להעביר ו/או לספק גישה לנתוני המשתמשים בכל הנוגע לקבלת השירות.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'5. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'הרישיון'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה מעניקה לך בזאת, ואתה מקבל, רישיון מוגבל, '}
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                    textDecorationLine: 'underline',
                                                    textDecorationStyle: 'solid',
                                                    textDecorationColor: '#0f3861',
                                                }}>
                                                    {'לשימוש אישי בלבד'}
                                                </Text>
                                                {', שאינו בלעדי, ללא זכות להמחאה, בלתי-מסחרי, שאין להעניק על בסיסו רישיונות משנה, ואשר ניתן לביטול באופן מלא, להשתמש בפורטל ו/או באפליקציה על גבי מחשב ו/או מכשיר נייד שבבעלותך או בשליטתך, כל זאת בהתאם לתנאים ולהוראות הנכללים בהסכם זה.  אין בתנאים אלה בכדי להעביר אליך כל זכות בפורטל, באפליקציה ו/או בקשר אליהם, אלא רק זכות מוגבלת להשתמש בהם בהתאם לתנאים אלה.  כל אדם ו/או גוף אחר, המעוניין בשימוש בפורטל ו/או באפליקציה ו/או בקבלת השירות מהחברה, גם אם הוא קשור במישרין ו/או בעקיפין למשתמש (למשל ומבלי להגביל את כלליות האמור במקרה של תאגיד – חברה בת ו/או חברה אחות של המשתמש), יהיה מחויב להתקשר במישרין עם החברה בהסכם נפרד, ולא יוכל לקבל את השירות מהחברה במסגרת התקשרות זו בין החברה למשתמש.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'השימוש באפליקציה, בתוכן ו/או בשירותים כפוף גם לעמידתך בתנאי השימוש הרלוונטיים למכשיר הנייד שברשותך (למכשיר תוצרת Apple: '}
                                                <Text
                                                    onPress={this.handleLinkAppStore}
                                                    style={{
                                                        color: '#007ebf',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#007ebf',
                                                    }}>{'App Store Terms of Service'}</Text>
                                                {', ולמכשיר הנתמך במערכת הפעלה מסוג אנדרואיד:'}
                                                <Text
                                                    onPress={this.handleLinkGoogle}
                                                    style={{
                                                        color: '#007ebf',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#007ebf',
                                                    }}>{' Google Play Terms of Service'}</Text>
                                                {'\').\''}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'6. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'דמי השימוש בשירותים'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'המשתמש מתחייב לשלם לחברה את מלוא דמי השימוש עבור השירות; שיעור דמי השימוש יקבע בהתאם לשימושים, אליהם נרשם המשתמש בפורטל ובאפליקציה, ומחיריהם כאמור במחירון החברה, כפי שיהיה מעת לעת (“דמי השימוש“).  דמי השימוש ישולמו על-ידי המשתמש לחברה מראש עבור כל חודש, החל מהמועד בו נרשם המשתמש לשירות בפורטל ובאפליקציה, וזאת עד לסיום ההתקשרות בין הצדדים.  המשתמש ישלם את דמי השימוש באמצעות כרטיס אשראי בתוקף, וימסור לחברה את כל הפרטים הנדרשים לשם חיובו כאמור.  בכל מקרה של שינוי בפרטי כרטיס האשראי של המשתמש, ימסור המשתמש הודעת עדכון בכתב לחברה עם מלוא הפרטים הנדרשים לחיוב וזאת תוך שבעה (7) ימי עסקים מיום השינוי.  מבלי לגרוע מכל זכות ו/או סעד העומדים לחברה לפי הסכם זה ו/או לפי כל דין, במקרה שהמשתמש לא ישלם לחברה במועד את מלוא דמי השימוש ו/או יפר את ההסכם בכל דרך אחרת, תהיה החברה רשאית לסיים את מתן השירות ואת ההתקשרות עימו, בהודעה בכתב אשר תיכנס לתוקף באופן מיידי (או במועד שצוין בה), ולא תהיה למשתמש כל טענה ו/או דרישה בקשר לכך.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'למרות האמור לעיל בנוגע לתשלום דמי השימוש מראש עבור כל חודש שירות, כדי לאפשר למשתמש חדש של החברה (דהיינו למשתמש שהוא ו/או מי מטעמו, לרבות מנהלו ו/או תאגיד קשור אליו מעולם לא התקשר, במישרין או בעקיפין, עם החברה בהסכם לקבלת השירות ו/או שלא ניסה בעבר את התוכנה ו/או השירות), לבחון את התאמת התוכנה, הפורטל, האפליקציה והשירותים לצרכיו, מוסכם, כי החודש הראשון בתקופת ההתקשרות של המשתמש עם החברה יהיה “חודש ניסיון” בגינו לא תגבה החברה מהמשתמש את דמי השימוש.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'שים לב: '}</Text>
                                                {'החברה שומרת לעצמה את הזכות לשנות, על-פי שיקול דעתה הבלעדי, את גובה דמי השימוש בעתיד.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'7. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'סודיות'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'כל צד מתחייב בזאת, כי ככל שהוא ו/או גורם מורשה מטעמו, ייחשף למידע סודי של הצד השני, ישמור עליו בסודיות, ולא יעבירו ו/או יאפשר את חשיפתו לצד שלישי כלשהו ו/או לא יעשה בו שימוש כלשהו, אלא לצורך מתן ו/או קבלת השירות על-פי הסכם זה, לפי העניין.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'ההתחייבות לשמירת סודיות כאמור לא תחול במקרה של חובת העברת מידע על-פי כל דין ו/או לגבי מידע שהפך להיות נחלת הכלל שלא בשל מעשה ו/או מחדל של המשתמש (במקרה שמדובר במידע סודי של החברה) או של החברה (במקרה שמדובר במידע סודי של המשתמש).'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'כמו כן מוסכם, כי החברה תהיה רשאית להעביר מידע בקשר להתקשרותה בהסכם זה עם המשתמש לצד שלישי כלשהו בקשר עם עסקת מכירה, רכישה, מיזוג, ארגון מחדש, העברת כל או חלק מעסקי החברה או כל שינוי שליטה אחר בחברה, בכפוף לכך שאותו צד שלישי, שיקבל את המידע יהיה כפוף לחובת הסודיות של החברה על-פי הסכם זה, ושככל שניתן יימסר רק מידע על עצם קיום  ההתקשרות של המשתמש עם החברה בהסכם זה, ויועבר לאנשי מקצוע (רו”ח ועו”ד) של הצד השלישי מקבל המידע.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'8. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'התחייבות המשתמש'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'כתנאי לשימושך בפורטל ו/או באפליקציה ו/או בשירותים הנך מציג ומתחייב כלפי החברה כי:'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'✓ - לא תפר את התנאים בהסכם זה, כפי שהם עשויים להתעדכן, מעת לעת; ו-'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'✓ - ככל שהנך יחיד – הנך בעל הכשירות המשפטית להיכנס להסכם זה ולקיים התחייבויותיך לפי הסכם זה כמיטב יכולתך; ככל שהנך תאגיד – הנך תאגיד קיים ורשום בישראל, שתקבלו בו כל ההחלטות הנדרשות לשם התקשרותך בהסכם זה וביצעו, והנך רשאי להתקשר בהסכם זה והאדם המאשר הסכם זה באופן מקוון/אלקטרוני מטעמו מוסמך לחייבו בהסכם זה; ו-'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'✓ - אין מניעה על-פי כל דין ו/או הסכם להתקשרותך בהסכם זה ולביצוע התחייבויותיך לפיו; ו-'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'✓ - אתה מסכים כי החברה תשתמש, תאסוף, תאחסן ותשמור מידע בקשר לשירות הניתן לך לשם הבטחת איכות ו/או שיפור השירות, לרבות לשם עריכת השוואות סטטיסטיות וענפיות; ו-'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'✓ - אתה מסכים כי במהלך מתן השירות, לרבות במסגרת מתן מידע, הנחיות שימוש למשתמש, טיפול בתקלות וכיו”ב, החברה ו/או מי מטעמה, ובכלל זה נציגיה ו/או עובדיה, עשויים להיחשף למידע שלך, לרבות מידע סודי, ובעניין זה יחולו הוראות הסודיות שבהסכם זה.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'9. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'שימושים אסורים'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'ישנן התנהגויות מסוימות אשר אסורות לחלוטין במסגרת השימוש בפורטל ו/או באפליקציה ו/או בשירותים.  אנא קרא בקפדנות את האיסורים המופיעים להלן.  אי מילוי על-ידך אחר ההוראות אשר מפורטות להלן עלול (לפי שיקול דעתה הבלעדי של החברה) לגרום להפסקת הגישה שלך לפורטל ו/או לאפליקציה ו/או לשירותים ובנוסף עלול לחשוף אותך לאחריות אזרחית ו/או פלילית.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                }}>{'אינך רשאי (בין בעצמך ובין על-ידי מי מטעמך: '}</Text>
                                                {'(א) להעתיק, לשנות, להתאים, לתרגם, לעשות פעולות של הנדסה הפוכה, לעשות פעולות של הידור הפוך, לפרק, להציג בפומבי, להפיץ או לשדר, בכל דרך, את הפורטל ו/או האפליקציה ו/או התכנים המופיעים בהם; (ב) לעשות כל שימוש בתכנים המופיעים בפורטל ובאפליקציה לכל מטרה, או לשכפל או להעתיק את התכנים האמורים מבלי לקבל הרשאה מראש בכתב מהחברה; (ג) ליצור סביבת דפדפן או תיחום אחר של המידע סביב התכנים של החברה (חל איסור על הצגת המידע במסגרת framing); (ד) לפגוע או להפר את הזכות לפרטיות או כל זכות אחרת של משתמש אחר, או לאסוף מידע מזהה ואישי על משתמשים ללא קבלת הסכמה מפורשת שלהם, לרבות על-ידי שימוש ב”רובוט”, “עכביש” (“spider”) יישום לעריכת חיפושים בפורטל ובאפליקציה או בחלקים מהם לרבות מאגרי המידע שלהם או לאחזור מידע מהפורטל ומהאפליקציה או מחלקים מהם לרבות מאגרי המידע או באמצעות התקן ידני או אוטומטי או באמצעות תהליך אשר מאפשר לאחזר, ליצור מפתח (אינדקס) או כריית נתונים (data mine); (ה) להוציא לשון הרע, להשמיץ, להתעלל, לעקוב, להטריד, לאיים, או לפגוע בכל דרך אחרת בזכויות חוקיות של אחרים, לרבות משתמשים אחרים; (ו) להעביר או ליצור בכל דרך אחרת, בקשר לפורטל ולאפליקציה, כל וירוס, “תולעת”, סוס טרויאני, באג, רוגלה, נוזקה, או כל קוד מחשב, קובץ או תוכנית אחרים אשר עשויים להזיק, או נועדו להזיק לפעילות של כל חומרה, תוכנה או ציוד תקשורת, או קוד או רכיב, שהם מזיקים, שיש בהם פוטנציאל לגרום נזק, שהם מפריעים או פולשניים; (ז) לפגוע בפעולת הפורטל ו/או השירותים, לעכבם או להפריע להם; לעכב או לפגוע בפעולה או להפריע לפעולה של שרתים או רשתות אשר מארחים את הפורטל והאפליקציה או מאפשרים את זמינותם, או לא לציית לכל דרישה, נוהל, מדיניות או תקנה של שרתים או רשתות אלה; (ח) למכור, לתת רישיון, או לנצל למטרה מסחרית כלשהי כל שימוש או גישה לשירותים ו/או לפורטל ללא הסכמתה המפורשת של החברה, לרבות שימוש בתכנים המופיעים בהם; (ט) לתחם (frame) או ליצור העתק (mirror) של כל חלק של הפורטל ללא הרשאה מראש מפורשת בכתב מהחברה; (י) ליצור מאגר מידע על-ידי הורדה ואחסון שיטתיים של כל או חלק מהתכנים אשר מופיעים בפורטל ובאפליקציה; (יא) להעביר כל מידע אשר הופק מהפורטל ו/או מהאפליקציה ללא קבלת הרשאה מראש בכתב מהחברה; (יב) להעביר או להמחות את הסיסמה לחשבון המשתמש, אפילו באופן זמני, לצד שלישי; (יד) להשתמש בפורטל ו/או באפליקציה ו/או בתכנים לכל מטרה שאינה חוקית, בלתי מוסרית או בלתי מורשית; (טו) לעשות שימוש בשירותים, בתכנים המוצגים בפורטל ובאפליקציה למטרות מסחריות או שאינן פרטיות ללא קבלת הרשאה מפורשת ובכתב מהחברה מראש; ו/או (טז) להפר אי-אילו מתנאים אלה.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'10. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'זכויות קניין רוחני'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'הפורטל, האפליקציה, השירותים, וכל זכויות הקניין הרוחני הנלוות והקשורות אליהם, לרבות המצאות, פטנטים ובקשות לפטנטים, סימני מסחר ובקשות לסימני מסחר, שמות מסחר, לוגו, מוניטין, חומרים המוגנים בזכויות יוצרים, גרפיקות, טקסטים, תמונות, עיצובים (כולל ה-look and feel של הפורטל ו/או השירותים), מפרטים, שיטות, תהליכים, אלגוריתמים, נתונים, מידע טכני, טכנולוגיה, מאפיינים אינטראקטיביים, קוד מקור , קוד מכונה, קבצים, ממשקים, ממשק גרפיים וסודות מסחר, בין אם רשומים או ניתנים לרישום ובין אם לאו (“הקניין הרוחני“) שייכים ו/או ניתנים ברישיון לחברה ומוגנים בזכויות יוצרים וזכויות קניין רוחני אחרות תחת דיני מדינת ישראל ודינים אחרים.  אלא אם כן הותר במפורש בתנאים אלה, אינך רשאי להעתיק, להפיץ, להציג, לבצע בפומבי, להעמיד לרשות הציבור, לפרק, להפריד, להתאים, לתת רישיון משנה, לעשות שימוש מסחרי, למכור, להשכיר, להשאיל, לעבד, לחבר, לבצע “הנדסה הפוכה”, לשלב עם תוכנות אחרות, לתרגם, לשנות או ליצור יצירות נגזרות של הקניין הרוחני, בעצמך או על-ידי מישהו מטעמך בכל אופן שהוא.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'כל זכות שלא הוקנתה לך במפורש על-פי תנאי השימוש תישמר בידי החברה ונותני הרישיון שלו.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'הינך מנוע מלהסיר, להפריד, למחוק או לנתק מהתכנים שבפורטל ובאפליקציה הודעות בדבר זכויות יוצרים, הגבלות למיניהן ו/או סימנים המורים על קיומן של זכויות קניין כלשהן של החברה או של מעניקי הרישיון לחברה, לרבות הסימנים הבאים אשר עשויים להופיע בפלט או בתכנים ©, ®, ™.  הינך מתחייב לציית לחוקים החלים בהקשרים אלה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'במידה ותספק לחברה משוב, פידבק, הערה או הצעה כלשהי לגבי הפורטל ו/או האפליקציה ו/או השירותים (“פידבק“), החברה תהיה זכאית לקבל רישיון בלעדי, ללא תמלוגים, תמידי, כלל עולמי ובלתי הדיר לשלב את הפידבק בכל המוצרים והשירותים הנוכחיים או העתידיים של החברה, והחברה תהיה זכאית להשתמש, ללא קבלת אישורך, בפידבק לכל מטרה שהיא וכל זאת מבלי להעניק לך כל תמורה שהיא.  אתה מאשר כי פידבק כאמור יחשב כלא סודי.  כמו כן, הנך מצהירה כי הפידבק אינו כפוף לתנאי רישיון כאלה ואחרים אשר יש בהם כדי לחייב את החברה לעמוד בחובות נוספות בקשר למוצריה ו/או לשירותיה הכוללים או המשלבים את הפידבק.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'אף הוראה בתנאי השימוש לא מהווה ויתור על קניינו הרוחני של החברה על-פי כל דין.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'11. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'סימני מסחר ושמות מסחר'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'הסמלים המסחריים ושאר המזהים הקניינים בהם משתמשת החברה בקשר עם הפורטל ו/או האפליקציה ו/או השירותים (“סימני מסחר של החברה“) הם כולם סימני מסחר ו/או שמות מסחר של החברה, בין אם רשומים ובין אם לאו.  כל שאר סימני המסחר, שמות המסחר, סימנים מזהים אחרים וסמלים מסחריים אחרים (לרבות סוגים שונים של לוגו) שיכולים להופיע בפורטל ו/או האפליקציה ו/או בשירותים שייכים לבעליהם (“סימני מסחר של צדדים שלישיים“).  כל סימני המסחר של צדדים שלישיים מופיעים בפורטל ובאפליקציה למטרות הצגה, תיאור וזיהוי בלבד והינם שייכים לבעליהם.  לא ניתנת בזאת כל זכות, רישיון או קניין בסימני המסחר של החברה או בסימני המסחר של צדדים שלישיים ולכן עלייך להימנע משימוש כלשהו בסימנים אלו אלא אם כן שימוש כזה אושר באופן מפורש בתנאים.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'12. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'זמינות הפורטל, האפליקציה והשירותים'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'הזמינות של הפורטל, האפליקציה והשירותים וכן פעילותם התקינה תלויות בגורמים רבים, אשר אינם מצויים בשליטתה של החברה, לרבות תוכנה, חומרה, רשתות תקשורת, ספקי שירותים או קבלני משנה של החברה או צדדים שלישיים אחרים (לרבות אלה המספקים שירותי אחסון ענן).'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה איננה מבטיחה כי הפורטל, האפליקציה והשירותים יהיו זמינים תמיד ו/או יפעלו בצורה תקינה בכל זמן ללא הפרעה, או שפעילותם תהיה חופשיה מתקלות, אך אנו נעשה מאמצים סבירים על מנת להבטיח שהפורטל והאפליקציה יהיו זמינים באופן רציף לאורך כל השנה.  יחד עם זאת, החברה אינה מבטיחה או מתחייבת כי הפורטל והאפליקציה יפעלו ו/או יהיו זמינים בכל עת ללא הפרעות או תקלות, וכי יהיו ללא פגם.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'הנך מסכים בזאת כי החברה לא תהיה אחראית לאי היכולת של הפורטל והאפליקציה לפעול או להיות נגישים, מכל סיבה שהיא; לרבות הפסקות בפעילות האינטרנט או רשתות, הפסקות בפעילות החומרה או התכנה במהלכן בשל בעיות טכניות או אחרות שאינן בשליטתנו (למשל סיכול, כח עליון, רשלנות של צדדים שלישיים) ועוד.  כמו כן, הנך מסכים בזאת כי החברה לא תהא אחראית לנזקים שנגרמו כתוצאה משיבוש או תקלה אשר אינם בשליטתה, ככל שעשתה מאמץ סביר למנוע אותם.'}</Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'במידה ונדרשת תחזוקה בפורטל ו/או באפליקציה, ולכן לא יהיו זמינים לתקופה כזו או אחרת, אנו נשתדל ליידע את המשתמשים על כך מבעוד מועד, ובמידת האפשר.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'13. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'מדיניות פרטיות'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה מכבדת את הפרטיות שלך ומחויבת להגן על המידע האישי שאתה משתף עם החברה.  אנחנו מאמינים כי למשתמשים שלנו יש את הזכות המלאה להכיר את המדיניות ואת הנהלים שלנו בנוגע לאיסוף ושימוש במידע המתקבל על-ידינו בשעה שהמשתמשים שלנו משתמשים בפורטל ו/או באפליקציה ו/או בשירותים.  מדיניות הפרטיות של החברה, הנהלים וסוגי המידע אשר נאספים על-ידי החברה מתוארים במדיניות הפרטיות של הפורטל המופיעה בלינק הבא:'}
                                                <Text
                                                    onPress={this.handleLinkTermsPrivacyPolicy}
                                                    style={{
                                                        color: '#007ebf',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#007ebf',
                                                    }}>{' https://bizibox.biz/privacy-policy-potal-app.'}</Text>
                                                {'  הנך מסכים ומאשר כי החברה תעשה שימוש במידע אישי אשר העברת ו/או הנגשת לחברה בהתאם למדיניות הפרטיות.  אם בכוונתך להיכנס ו/או להתחבר ו/או להשתמש בפורטל ו/או באפליקציה, עליך לקרוא תחילה ולהסכים למדיניות הפרטיות.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'14. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'הסרת אחריות'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'במידה המקסימאלית האפשרית על פי דין, הפורטל, האפליקציה והשירותים ניתנים למשתמשים “כמות שהם” (“AS IS”), ללא כל התחייבות או אחריות מכל סוג שהוא, באופן מפורש או מכללא, לרבות בין השאר, אחריות לזכות בעלות או לאי-הפרה או אחריות מכללא לאיכות מסחרית או להתאמה למטרה מסוימת.  החברה אינה אחראית ואינה מעניקה מצגים לגבי היכולת או העדר היכולת להשתמש בפורטל ו/או בשירותים, או לגבי התוצאה של השימוש בהם וכן לא תישא בכל אחריות לגבי נכונות, איכות, זמינות, אמינות, שלמות, התאמה, תועלתיות ויעילות של התכנים אשר נכללים בהם.  יתכן כי הדינים החלים עליך מעניקים לך זכויות צרכניות אשר הסכם זה אינו יכול לשנותן.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה אינה מתחייבת (א) כי הפורטל ו/או האפליקציה יהיו בטוחים לשימוש, מדויקים, מלאים, ללא תקלות או הפרעות, או חפים מכל וירוסים , פגמים, תולעים, רכיבים מזיקים אחרים או הגבלות תוכנה אחרות; וכן (ב) כי היא תתקן כל תקלה או פגם בפורטל ו/או באפליקציה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.bold,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה איננה, במפורש או משתמע, ממליצה, תומכת או נושאת בכל אחריות שהיא לנזק והוצאה הנובעים משימוש בפורטל ו/או האפליקציה ו/או בשירותים.  החברה לא תישא באחריות לכל נזק כלשהו, לרבות נזק עקיף, מיוחד, אגבי או ארעי, בין אם נגרם כתוצאה או בקשר לשימוש בפורטל ו/או האפליקציה ו/או בשירותים, בין אם החברה הודיעה למשתמש על אפשרות לנזק כזה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.bold,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה אינה מתחייבת לכך שהשימוש בפורטל ו/או באפליקציה יהיה מאובטח, מדויק, שלם, נטול הפרעות, נטול תקלות או חופשי מווירוסים או רכיבים מזיקים או מגבלות אחרות בתפקוד.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'לחברה אין כל אחריות לכל שירות שניתן על-ידי אדם או גוף שאינו החברה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה לא תהא אחראית לכל תוצאה הנובעת מתקלות טכניות (לרבות, אך לא רק, בקשר לקישוריות האינטרנט, עומס קו או שרתים, ועיכובים והפרעות קשורים) והנובעות מספקי אינטרנט וטלקומוניקציה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה לא תהיה אחראית ולא תתקן תקלות בקשר לשירותים הנובעות ממחשבי הלקוח/ה ו/או מאמצעים טכנולוגיים ו/או אחרים שבשימושו, לרבות עקב וירוס, תולעת, סוס טרויאני או כל רכיב פוגעני אחר ו/או רכיב העלול להפריע לעבודת השירותים, והלקוח/ה יהיה/תהיה אחראי/ת באופן מלא ובלעדי לבטיחות מכשיריו/ה האלקטרוניים.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                    textDecorationLine: 'underline',
                                                    textDecorationStyle: 'solid',
                                                    textDecorationColor: '#0f3861',
                                                }}>{'שים לב: '}</Text>
                                                {'הינך מודע/ת ומסכים/ה לכך שאת/ה האחראי/ת הבלעדי/ת לכל החלטות או פעולות שהתקבלו על-ידך כתוצאה או בקשר לשימוש כלשהו בפורטל ו/או באפליקציה ו/או בשירותים.  השימוש בפורטל ו/או באפליקציה ו/או בשירותים הינם באחריותך הבלעדית.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.bold,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה אינה אחראית לטיב או איכות תוכן המשתמשים המוצע בפורטל ובאפליקציה וכי הינו מדויק ונקי מטעויות.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.bold,
                                                    textDecorationLine: 'underline',
                                                    textDecorationStyle: 'solid',
                                                    textDecorationColor: '#0f3861',
                                                }}>{'שים לב: '}</Text>
                                                {'המשתמש מודע ומסכים לכך שהנו האחראי הבלעדי לכל החלטות או פעולות שהתקבלו או נעשו על-ידו כתוצאה ו/או בקשר לשימוש כלשהו בפורטל ו/או באפליקציה ו/או בשירותים.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.bold,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'המשתמש מודע ומסכים לכך שהנו האחראי הבלעדי לכל החלטות או פעולות שהתקבלו או נעשו על-ידו כתוצאה ו/או בקשר לשימוש כלשהו בפורטל ו/או באפליקציה ו/או בשירותים.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'15. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'הגבלת אחריות'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'במידה המקסימאלית האפשרית על-פי דין, החברה (לרבות בעלי מניותיה, הדירקטורים שלה, עובדיה, יועציה וסוכניה) לא תהיה אחראית לכל נזקים, מכל סוג שהוא, לרבות, נזקים עקיפים, מיוחדים, אגביים או תוצאתיים, בין במסגרת תביעה על-פי חוזה, בתביעת נזיקין או בכל תביעה אחרת בגין מעשה עוולה אשר ינבע מהשימוש שלך בפורטל ו/או באפליקציה ו/או בשירותים, לרבות בקשר להחלטה שהתקבלה או לא התקבלה או לכל פעולה שננקטה או שלא ננקטה בהסתמך על הפורטל ו/או האפליקציה ו/או השירותים או על כל מידע אחר הנובע משימוש בהם, או על כל נזק אחר הנובע משימוש בהם, מחוסר האפשרות להשתמש בהם, חוסר היכולת של הפורטל ו/או האפליקציה ו/או השירותים לפעול כפי שהוצג לך, פגיעה במוניטין או ברווחים, חוסר היכולת של החברה לפעול בהתאם לתנאים אלה, כל מעשה או מחדל אחר של החברה המבוסס על הפרה של מצגים או התחייבויות של החברה על-פי חוזה, רשלנות, אחריות קפידה או תחת עוולה אחרת, בין אם החברה הודיעה לך על אפשרות שנזק כזה עלול להיגרם ובין אם לאו.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'מבלי לגרוע מכלליות האמור, ובמידה המקסימאלית האפשרית על פי דין, החבות המצטברת של החברה עבור כל הנזקים וההפסדים הנובעים מהתנאים או הקשורים בשימושך (או באי-שימושך) בפורטל ו/או האפליקציה לא תעלה על הסכום ששולם בפועל על-ידך לחברה עבור השימוש בשירותים בגין חודש שירות אחד בלבד, ככל שרלוונטי.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.bold,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'במידה וסמכויות שיפוט מסוימות אינן מתירות החרגות או הגבלות כאמור, לא תהא תחולה להחרגות או הגבלות כאמור במקומות שיפוט אלו.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'16. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'שיפוי'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'הינך מסכים להגן ולשפות את החברה מפני ונגד כל תביעות, הפסדים, עלויות, נזקים, התחייבויות והוצאות (לרבות בין השאר, שכר טרחת עורכי דין) אשר נובעים מ: (א) השימוש שלך בפורטל ו/או באפליקציה ו/או בשירותים; (ב) כל הפרה מצידך של התנאים האלה; (ג) כל נזק מכל סוג שהוא, בין אם נזק ישיר, עקיף, מיוחד או תוצאתי, שגרמת לצד שלישי אשר קשור לשימוש שלך בפורטל ו/או באפליקציה ו/או בשירותים (כולל הפרה מצידך של זכויות צדדים שלישיים לרבות זכויות קניין רוחני והזכות לפרטיות); וכן (ד) כל טענה לפיצויים כספיים או אחרים הנובעים מנזק שנגרם למשתמש אחר בעקבות השימוש שלך בפורטל ו/או באפליקציה ו/או בשירותים.  מובהר בזאת כי חובת השיפוי האמורה תחול אף לאחר סיום התקשרותך עם החברה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'מבלי לגרוע מכלליות האמור, אנו שומרים את הזכות הבלעדית לנהל (ולשאת בהוצאות) כל עניין הקשור בשיפוי מצדך, באופן שאינו גורע מחובתך זו, והמחייב אותך לשתף פעולה מלאה איתנו בניהול הליך הגנה.  הנך מסכים שלא תסכים לפשרה בכל עניין הכפוף לשיפוי על-ידך מבלי לקבל לכתחילה את הסכמתנו בכתב לכך.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'17. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'שינויים לפורטל ו/או לשירותים'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה שומרת לעצמה את הזכות לבצע תיקונים, הרחבות, שיפורים, התאמות וכל שינוי אחר, או להפסיק, זמנית או לצמיתות, את פעילות הפורטל ו/או האפליקציה ו/או השירותים ללא הודעה מוקדמת ובכל זמן שתראה לנכון לפי שיקול דעתה הבלעדי.  אתה מסכים כי החברה אינה אחראית כלפיך או כלפי כל צד שלישי בשל כל שינוי, השעיה, או הפסקה של פעילות הפורטל ו/או האפליקציה ו/או השירותים אשר נכללים בפורטל זה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'18. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'תנאים מיוחדים הנוגעים לרכיבי צד שלישי'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.bold,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'הפורטל עשויי להשתמש או לכלול תוכנות, קבצים ו/או רכיבים הכפופים לתנאי רישיונות לרבות רישיונות קוד פתוח של צדדים שלישיים (“רכיבי צד שלישי“).  הינך רשאי להשתמש ברכיבי צד שלישי כחלק מ-, או בהקשר עם, הפורטל אך ורק בכפוף לעמידתך בתנאי הרישיון החלים ו/או הנלווים לרכיבי צד שלישי הרלוונטיים.  אם יש סתירה בין תנאי הרישיון של רכיב צד שלישי ותנאים אלו, תנאי הרישיון של רכיב הצד השלישי הרלוונטי יגברו וזאת רק בהקשר לרכיבי צד שלישי.  תנאים אלה אינם חלים על כל רכיבי צד שלישי הנלווים ו/או הכלולים בפורטל והחברה מסירה כל אחריות הקשורה בכך.  אתה מכיר בכך שהחברה אינה היוצרת, הבעלים או מעניקת הרישיון של רכיבי צד שלישי, והחברה אינה מעניקה כל מצג או התחייבות מכל סוג שהוא, באופן מפורש או מכללא, בדבר איכות, יכולות, תפעול, ביצוע או התאמתו של רכיב צד שלישי זה או אחר.  אין לראות את הפורטל ו/או האפליקציה או כל חלק מהם (פרט לרכיבי צד שלישי הכלולים בהם) כתוכנת “קוד פתוח”.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'19. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'סיכונים הקשורים לרשת האינטרנט ולרשת הסלולר'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה משקיעה מאמצים רבים בהגנה מפני סיכונים הטמונים ברשת האינטרנט, ברשת הסלולר ובמערכות מחשוב בכלל, ככל שההגנה מפניהם נתונה בידיו.  עם זאת, אין ביכולתו ו/או בשליטתו של החברה למנוע לחלוטין את חדירתן ופעולתן של תוכנות מזיקות וגורמים עוינים כגון וירוסים, “תולעים” (worms), סוסים טרויאניים, באגים, רוגלות (spywares), נוזקות (malwares), או כל קודי מחשב, קבצים או תוכנות אחרות אשר עשויים לפגוע בפרטיותך, לצותת לתעבורת הרשת, לפרוץ למאגרי המידע של החברה, לשרתים או למחשבים, להתחזות ליישום או לחברה, לבצע תרמיות והונאות מקוונות, להזיק או לחבל בפעילות הפורטל ו/או השירותים.  אנו מפצירים בך לקרוא בעיון את דף ההמלצות וההנחיות בנוגע לאבטח מידע בפורטל ולפעול לפי ההנחיות המפורטות בו.  אין באמור לעיל כדי לגרוע מאחריותו של מי מהצדדים.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'20. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'הודעות והתראות'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'השירותים עשויים לכלול קבלת הודעות PUSH, מסרונים, הודעות דואר אלקטרוני או התראות אחרות מהחברה, והנך מסכים בזאת לקבלת כל אלה (הודעות PUSH ישלחו למשתמש לאחר שהמשתמש הסכים באופן אקטיבי לקבל הודעות אלה).  המשתמש רשאי לבטל את האפשרות לקבל הודעות PUSH מהחברה על-ידי שינוי ההגדרות במכשיר הנייד שלו.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה אינה מתחייבת לגבי עצם ו/או עיתוי מסירתן של הודעות מסוג זה ו/או מידת הדיוק בתוכנן, ומוסכם כי החברה לא תישא באחריות בגין כל עיכוב, אי מסירה או מסירה מוטעית של הודעה מסוג זה, טעות בתוכן ההודעה, או כל פעולה שתינקט או שלא תינקט על-ידי המשתמש ו/או על-ידי צד שלישי כלשהו תוך הסתמכות על מנגנון התראות זה.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'21. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'שינויים בתנאי השימוש'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה שומרת על זכותה לשנות את תנאי השימוש בכל זמן על-פי שיקול דעתה הבלעדי של החברה, ומבקשת מכלל המשתמשים לשוב ולבקר בדף זה לעיתים קרובות ככל האפשר.  אנחנו נודיע לך על כל שינוי מהותי בתנאי השימוש, על-ידי החלפת הקישור ל”תנאי השימוש” בעמוד הבית של הפורטל בקישור ששמו “תנאי השימוש מעודכנים ליום ____” ו/או על-ידי משלוח דואר אלקטרוני לכתובת אותה יתכן והעברת לחברה במסגרת השימוש בפורטל.  שינויים מהותיים אלה יכנסו לתוקף תוך שבעה (7) ימים ממועד ההודעה כאמור.  כל שאר השינויים בתנאי השימוש ייכנסו לתוקף בתאריך הנקוב בלינק “עודכן לאחרונה”, והמשך השימוש שלך בפורטל ו/או באפליקציה לאחר תאריך העדכון האחרון הנקוב יהווה הסכמה שלך לכך שהשינויים יחייבו אותך.  במידה ונצטרך לשנות את התנאים על מנת לעמוד בדרישות הדין, שינויים אלה יכנסו לתוקף באופן מידי או כנדרש על פי דין, וזאת ללא מתן הודעה מוקדמת.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'22. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'תקופת ההסכם וסיום ההתקשרות'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'הסכם זה ייכנס לתוקף לאחר שישלים המשתמש את הרישום בפורטל ו/או באפליקציה, ויוותר בתוקף עד לביטולו ו/או לסיומו בהתאם לתנאי הסכם זה (“תקופת השימוש בשירותים“).  מבלי לגרוע מהאמור בהסכם זה לגבי זכות החברה לבטל את ההסכם במקרה של הפרתו על-ידי המשתמש, כל צד להסכם זה יהיה רשאי לסיים את ההתקשרות לפיו על-ידי מסירת הודעה בכתב לצד השני; סיום ההסכם ייכנס לתוקף בתום החודש שבו נמסרה הודעת הביטול ושעבורו שולמו דמי השימוש, ככל ולא נקבע אחרת בין הצדדים בכתב.  מובהר, כי אין בסיום ההסכם מכל סיבה שהיא כדי לגרוע מחובת המשתמש לקיים את כל התחייבויותיו על-פי הסכם זה, ובכלל זה התחייבותו לתשלום דמי השימוש בגין תקופת ההתקשרות, קרי עד למועד סיום קבלת השירות.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'ידוע למשתמש, כי לאחר סיום ההתקשרות: (א) אין החברה מחויבת לשמור על נתוני המשתמש, ו- (ב) לבקשת המשתמש תמחק החברה את נתוני המשתמש.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'23. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'הפסקת פעילות הפורטל ו/או השירותים וסיום התנאים'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'החברה תהא רשאית, בכל זמן, לחסום את גישתך לפורטל ו/או לאפליקציה ו/או לשירותים, כולם או חלקם, באופן זמני או לצמיתות, להשהות, או להסיר את חשבון המשתמש שלך, בהתאם לשיקול דעתה הבלעדי של החברה, אם החברה סבורה כי אחד או יותר מהמקרים הבאים נתקיימו: (א) קיים סיכון לאבטחה או לאמינות של הרשת או השרתים של החברה; (ב) השהייה או ביטול נחוצים כדי להגן על זכויות, קניין או האבטחה של החברה, משתמשיה או הציבור; (ג) קיים בסיס לביטול חשבונך; (ד) הפרת את התנאים; ו/או (ה) אנו נדרשים לכך על-פי דין.  במהלך ההשהיה לא תהיה לך האפשרות להיכנס או להשתמש בחשבונך.  היה ונקבע, במסגרת שיקול דעתנו הבלעדי, כי הסיבה להשהייה באה על תיקונה, נשיב לך את הגישה לחשבונך.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'לחברה אף תעמוד כל תרופה אחרת מכוח הדין, במידה והחברה זיהתה כי פעילותך או השימוש שלך בפורטל ו/או באפליקציה ו/או בשירותים מהווה הפרה של התנאים באופן כלשהו.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'במידה ואינך מסכים לתנאים (כפי שהם מתעדכנים מעת לעת), או אינך שבע רצון עם הפורטל ו/או השירותים, באפשרותך לחסום את השימוש בשירותים בכל עת באמצעות פניה לחברה במספר טלפון: 03-5610382, מספר פקס:\n' +
                                                    '03-6844889 ודוא”ל: service@bizibox.biz.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'כמו כן, החברה רשאית בכל זמן שהוא ובהתאם לשיקול דעתה הבלעדי, להפסיק את פעילות הפורטל ו/או באפליקציה ו/או השירותים, באופן זמני או לצמיתות, ללא הודעה מוקדמת.  הינך מאשר ומסכים כי החברה לא תהא אחראית לאובדן מידע ו/או נזקים כלשהם הנובעים או קשורים בהחלטתה להפסיק או להשהות את פעילות הפורטל ו/או האפליקציה ו/או השירותים.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'במקרה של סיום התנאים על-ידך או על-ידי החברה: (א) הרישיון וכל הזכויות שהוענקו לך במסגרת התנאים נפסקים וחדלים להתקיים, באופן אוטומטי; (ב) עליך להפסיק מיידית את השימוש בפורטל, וככל שתידרש לכך, להצהיר על כך בפני החברה; וכן (ג) הסעיפים אשר מטיבם ומטבעם שורדים את סיום התנאים על מנת להשיג את מטרות התנאים יישארו בתוקף.  מבלי לגרוע מכלליות האמור לעיל, תנאי השימוש בנוגע לסעיפים הבאים: זכויות קניין רוחני, הסרת אחריות, הגבלת אחריות, שיפוי וההוראות המופיעות בסעיף “כללי”, יישארו בתוקפם גם לאחר סיום התנאים.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'24. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'מדיניות השימוש בעוגיות (“Cookies“) וטכנולוגיות אחרות'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'בעת השימוש בפורטל ו/או כחלק מהליך הגעתך לפורטל, לרבות באמצעות קמפיינים שיווקיים שלנו ברשתות החברתיות, אנו עשויים להשתמש בטכנולוגיות מקובלות ומוכרות בתעשייה כגון “עוגיות” (cookies) (“עוגיות“).'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'העוגיות נשמרות על גבי מכשירך ומאפשרות לנו להפעיל מאפיינים מסוימים באופן אוטומטי, וכן להקל ולפשט את חוויית השימוש בפורטל.  ניתן לנטרל את העוגיות.  למשל, מרבית דפדפני האינטרנט מאפשרים למשתמשים למחוק עוגיות ממכשירי המשתמשים, לחסום קבלה של עוגיות או לקבל התראות לפני אחסונן של עוגיות.  עם זאת, יש לשים לב כי במידה והמשתמש ימחק את העוגיות או לא יאפשר את אחסונן, החוויה המקוונת של המשתמש דרך הפורטל עשויה להיפגע. אנא עיין בהוראות אשר מצויות בדפדפן שלך או במסך ה”עזרה” על מנת ללמוד עוד על פונקציות אלה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'השימוש בטכנולוגיות אחרות מאפשר לנו למדוד את התגובות לפעילויות שאנו מציעים על דפי הפורטל ולשפר את דפי הפורטל ומאמצי השיווק שלנו, באמצעות פילוח וניתוח של מידע לא אישי המסופק לנו באמצעותן.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'25. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'הודעות וכתובות'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'תובת הדוא”ל ומספר הטלפון הסלולרי, שהמשתמש מסר לחברה, ישמשו אותה ככתובת למסור לו הודעות לפי הסכם זה וכן לצורך העברת חומר פרסומי ושיווקי.  המשתמש מתחייב לעדכן את החברה בכל שינוי בכתובת הדוא”ל ו/או מספר הטלפון הסלולרי שלו לשם המשך קבלת הודעות מהחברה.  המשתמש רשאי להודיע לחברה בכל עת על רצונו להפסיק לקבל חומר פרסומי ושיווקי מהחברה באמצעות דואר אלקטרוני בכתובת: service@bizibox.biz, או למספר הטלפון הבא: 03-5610382 או באמצעות שליחת דואר לכתובת הבאה: איי פקט בע”מ, רחוב מוזס יהודה ונוח 13, תל אביב 6744252.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'26. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'קטינים'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'על מנת להשתמש בפורטל ו/או באפליקציה עליך להיות מעל גיל שמונה עשרה (18). אנו שומרים על זכותנו לבקש הוכחת גיל בכל שלב, באופן שנוכל לוודא שמשתמשים מתחת לגיל שמונה עשרה (18) אינם משתמשים בפורטל ו/או באפליקציה. במקרה שיובא לידיעתנו כי אדם מתחת לגיל שמונה עשרה (18) משתמש בפורטל ו/או באפליקציה, אנו נחסום משתמש זה מלהיכנס לפורטל ו/או לאפליקציה. אנא פנה אלינו לכתובת service@bizibox.biz, אם הינך סבור כי ממשתמש מתחת לגיל שמונה עשרה (18) עושה שימוש בפורטל ו/או באפליקציה.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'27. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'כללי'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'(א) אין בתנאי שימוש אלה כדי לגרוע מכל הסכמה אחרת בין החברה לבינך ו/או כדי לשנותה; (ב) תנאים אלה אינם יוצרים ולא יתפרשו כאילו הם יוצרים שותפות, מיזם משותף, יחסי עובד-מעביד, יחסי שליחות או יחסים בין מעניק זיכיון לבין מקבל זיכיון בין הצדדים לתנאים אלה; (ג) כל תביעה או הליך משפטי בקשר לפורטל, לאפליקציה ולשירותים ו/או לשימוש בו יהיו כפופים לחוקי מדינת ישראל ויובאו לדיון בבתי המשפט המוסמכים במחוז תל אביב, ישראל, ואתה מסכים בזאת לסמכות השיפוט הייחודית והמקומית של בתי משפט אלה; (ד) במקרה שייקבע כי הוראה כלשהי מתנאים אלה אינה חוקית, בטלה או שמכל סיבה אין אפשרות לאכוף אותה, אזי יראו הוראה זו כהוראה שניתן להפרידה מתנאים אלה, וההוראה האמורה לא תשפיע על התוקף ועל האפשרות לאכוף הוראה כלשהי מבין ההוראות הנותרות של תנאים אלה; (ה) אינך רשאי להמחות, להעניק רישיון משנה או להעביר באופן אחר את זכויותיך או את התחייבויותיך, כולן או מקצתן על-פי תנאים אלה ללא הסכמה מפורשת מוקדמת בכתב מהחברה; החברה רשאית לעשות פעולות אלה ללא כל הגבלה או חובת יידוע; (ו) שום ויתור של מי מהצדדים על כל הפרה או מחדל על-פי תנאים אלה לא ייחשב כוויתור על כל הפרה או מחדל, קודמים או מאוחרים יותר; (ז) כל כותרת של סעיף או כל כותרת אחרת אשר נכללת בתנאים אלה שולבה בהם לצורך נוחות ההתייחסות בלבד, וכותרת כאמור אינה מגדירה או מסבירה, בכל דרך, כל סעיף או הוראה אשר נכללו בתנאים אלה; (ח) ניתן יהיה להמציא לך הודעות בדואר אלקטרוני או בדואר רגיל. החברה רשאית גם להמציא הודעות על שינוי בתנאים אלה או בעניינים אחרים על-ידי הצגת הודעות אלה או על-ידי מתן קישור להודעות אלה; (ט) אתה מסכים, מבלי להגביל, כי גרסה מודפסת של תנאים אלה ושל כל הודעה אשר ניתנה באופן אלקטרוני תהיה ראיה קבילה בהליכים שיפוטיים או מנהליים אשר יתבססו על תנאים אלה, או בקשר אליהם, באותה מידה ובכפוף לאותם תנאים כמו מסמכים ורשומות עסקיים אחרים אשר הופקו במקור ונשמרו בגרסה מודפסת.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.bold,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'הנך מסכים ומאשר כי כל עילת תביעה העשויה להיות לך, הנובעת מ/או הקשורה בשירותים תעמוד לך במשך שנה מיום קרות האירוע.  לאחר תקופה זו, מוסכם בזאת בין הצדדים כי עילת תביעה זו תתיישן.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'28. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'שאלות'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'במידה ויש לך שאלות נוספות או הערות בנוגע לתנאים, הינך מוזמן לפנות אלינו באמצעות דואר אלקטרוני בכתובת: service@bizibox.biz, או למספר הטלפון הבא: 03-5610382 או באמצעות שליחת דואר לכתובת הבאה: איי פקט בע”מ, רחוב מוזס יהודה ונוח 13, תל אביב 6744252.  אנו נעשה את מירב המאמצים לחזור אליך תוך זמן סביר.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'קראתי והבנתי את תנאי ההסכם ואני מסכים לכל התנאים המפורטים בהם.'}
                                            </Text>
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>
                )}

                {privacyPolicyOpen && (
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible
                        onRequestClose={() => {
                            // //console.log('Modal has been closed.')
                        }}>
                        <SafeAreaView style={{
                            flex: 1,
                            marginTop: 0,
                            paddingTop: 0,
                            position: 'relative',
                        }}>
                            <View style={{
                                flex: 1,
                                alignItems: 'center',
                            }}>
                                <View style={{
                                    height: 68,
                                    backgroundColor: '#002059',
                                    width: '100%',
                                    paddingTop: 0,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                }}>
                                    <View style={cs(
                                        !isRtl,
                                        [
                                            {
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
                                                {'מדיניות פרטיות'}
                                            </Text>
                                        </View>
                                        <View>
                                            <TouchableOpacity onPress={this.privacyPolicyToggle}>
                                                <View style={{
                                                    marginRight: 'auto',
                                                }}>
                                                    <Icon name="chevron-right" size={24}
                                                          color={colors.white}/>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                                <View style={{
                                    width: '100%',
                                    height: '100%',
                                    marginTop: 10,
                                    marginBottom: 10,
                                    paddingLeft: 0,
                                    paddingRight: 10,
                                    flex: 1,
                                }}>
                                    <ScrollView
                                        style={[
                                            styles.accountsContainer, {
                                                flex: 1,
                                                position: 'relative',
                                            }]}
                                        contentContainerStyle={[
                                            styles.tableWrapper, {
                                                backgroundColor: '#ffffff',
                                                flexGrow: 1,
                                                paddingTop: 0,
                                                marginTop: 0,
                                                paddingBottom: 0,
                                            }]}>
                                        <View
                                            style={{
                                                marginHorizontal: 15,
                                            }}>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'חברת איי פקט בע”מ (להלן: “החברה” או “אנחנו“) מברכת אותך (להלן: “המשתמש” או “אתה“) על שימושך באפליקציית ביזיבוקס באמצעות מכשיר נייד הנתמך במערכות הפעלה של Apple (iOS) או של אנדרואיד (להלן: “המכשיר הנייד” ו”האפליקציה“, בהתאמה) ו/או בממשק האינטרנטי שלה בכתובת '}

                                                <Text
                                                    onPress={this.handleLink}
                                                    style={{
                                                        color: '#007ebf',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#007ebf',
                                                    }}>{'bsecure.bizibox.biz '}</Text>

                                                {'(להלן: “הפורטל“). החברה מתייחסת בכבוד לפרטיות המשתמשים בפורטל ובאפליקציה. תנאים אלה ילמדו אותך מהי מדיניות הפרטיות הנוהגת הן בפורטל והן באפליקציה. הם סוקרים, בין השאר, את האופן שבו משתמשת החברה במידע, הנמסר לה על-ידי המשתמשים או נאסף על-ידה בעת השימוש בפורטל ובאפליקציה.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'מסמך זה מתאר את מדיניות הפרטיות בפורטל ובאפליקציה של החברה והינו חלק בלתי נפרד מתנאי השימוש בהם.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'ביטויים אשר לא הוגדרו במדיניות הפרטיות, תהא להם משמעות זהה למשמעותם בתנאי השימוש באתר ו/או בתנאי השימוש בפורטל ובאפליקציה '}
                                                <Text
                                                    onPress={this.handleLinkTermsPrivacyPolicy}
                                                    style={{
                                                        color: '#007ebf',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#007ebf',
                                                    }}>{'https://bizibox.biz/terms-of-use-potal-app'}</Text>

                                                {', לפי העניין (להלן, ביחד: “תנאי השימוש“).'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'מדיניות הפרטיות מנוסחת בלשון זכר לצרכי נוחות בלבד, והיא מתייחסת, כמובן, גם לנשים.'}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'1. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'הסכמה'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'אנא קרא בעיון: מדיניות הפרטיות המפורטת במסמך זה מהווה הסכם משפטי מחייב ואכיף בינך לבין החברה, לפיכך, הנך מתבקש לקרוא את מדיניות הפרטיות בקפידה רבה.\n' +
                                                    '\n' +
                                                    'בעצם השימוש בפורטל, באפליקציה ובשירותים הניתנים בהם, הינך מצהיר כי קראת והבנת את מדיניות הפרטיות, כי ניתנה לך האפשרות לעיין בהם, וכי הינך מסכים לכל התנאים המפורטים בהם.\n' +
                                                    '\n' +
                                                    'אם אינך מסכים לאי אילו מהתנאים המפורטים להלן, הנך מחויב, באופן מיידי, להימנע מכניסה ו/או משימוש בפורטל ו/או באפליקציה, בכל אופן.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'2. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'קטינים'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'הפורטל והאפליקציה מיועדים למשתמשים מעל גיל שמונה עשרה (18) ולכן אנו לא אוספים (אין בכוונתנו לאסוף) מידע אישי מקטינים מתחת לגיל זה. אנו שומרים את הזכות לבקש הוכחת גיל בכל שלב.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'3. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'איזה מידע אנחנו רשאים לאסוף אודות המשתמשים שלנו?'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'אנו אוספים שני סוגים של מידע מהמשתמשים בפורטל ובאפליקציה:\n' +
                                                    '\n' +
                                                    'הסוג הראשון של מידע שהחברה אוספת הנו מידע אנונימי ואינו מזהה (להלן: “מידע לא אישי“). מידע לא אישי הוא כל מידע גלוי אשר זמין לחברה בשעה שהמשתמש משתמש בפורטל ו/או באפליקציה, ואינו מאפשר את זיהויו של אותו משתמש. מידע לא אישי כולל מידע אנונימי, טכני וכן מידע שנאסף אודות התנהגות המשתמשים, ועשוי לכלול, בין היתר, את פעילותו של המשתמש בפורטל ו/או באפליקציה, את זהות מערכת ההפעלה וסוג מערכת הדפדפן של המשתמש, זרם הקשות (click-stream), פעילות המשתמש בפורטל ו/או באפליקציה, דף ההפניה (referral URL), שפת המקלדת, רזולוציית מסך המכשיר ממנו מתבצעת הגישה לפורטל ו/או לאפליקציה וכיו”ב.\n' +
                                                    'הסוג השני של מידע שהחברה אוספת הנו מידע אישי מזהה (להלן: “מידע אישי“). המידע האישי מאפשר לחברה לזהות באופן אישי את המשתמש ובדרך כלל נושא אופי פרטי או רגיש.\n' +
                                                    'המשתמשים מספקים באופן אוטומטי את ה- IP address או כתובת ה-Mac שלהם בהתאם לרשת או למכשיר בהם הם משתמשים. מידע זה נאסף על מנת לשפר את חוויית המשתמשים ולמטרות אבטחה.\n'}

                                                <Text
                                                    onPress={this.privacyPolicyToggle}
                                                    style={{
                                                        color: '#007ebf',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#007ebf',
                                                    }}>{'https://bsecure.bizibox.biz/signup.'}</Text>

                                                {'בנוסף, אנו אוספים מידע אישי הנמסר על-ידי משתמשים באופן מודע ומרצונם החופשי במהלך השימוש בפורטל ובאפליקציה. למשל, מידע האישי ייאסף מתוך הפרטים שנמסרו במסגרת טופס הרישום לפורטל ו/או לאפליקציה שכתובתו: \n' +
                                                    'המידע להלן נאסף במסגרת הרישום:(א) כתובת דואר-אלקטרוני; (ב) שם מלאׁ; (ג) מספר ח.פ. (במידה ומדובר בעוסק מורשה); (ד) פרטי חשבון בנק ו/או כרטיסי אשראי; (ה) מספר טלפון סלולארי; (ו) שם משתמש וסיסמת כניסה לפורטל ו/או לאפליקציה; (ז) פרטי אמצעי תשלום (המידע נאסף על-ידי ספקי שירותי סליקה כמפורט להלן); ו- (ח) כל הפרמטרים הנדרשים להתחברות לכל מקורות המידע הפיננסי אשר ברשות המשתמש אשר ברצונו לקשר לפורטל ו/או לאפליקציה, לרבות שמות המשתמש והסיסמאות הרלוונטיות לכל אחד ממקורות המידע הפיננסי האמורים.\n' +
                                                    '\n' +
                                                    'במסגרת טופס יצירת קשר בפורטל ו/או באפליקציה, משתמשים נדרשים למסור שם מלא, טלפון וכתובת דוא”ל. יתכן כי משתמשים ידרשו בעתיד למסור מידע נוסף.\n' +
                                                    'המידע האישי שמסרת לחברה (מלבד נתונים הקשורים להליך עיבוד התשלומים, כפי שמפורט בתנאי השימוש) יישמר במאגר המידע המאובטח של החברה והגישה אליו תהיה מוגבלת בלבד. כמו כן, מידע אודות שימושים ספציפיים שביצעת באמצעות הפורטל ו/או האפליקציה, ייאסף אף הוא באמצעות הפורטל ו/או האפליקציה וייחשב כחלק מה-“מידע האישי” כאמור לעיל.\n' +
                                                    '\n' +
                                                    ' \n' +
                                                    '\n' +
                                                    'למען הסר ספק, כל מידע לא אישי אשר קשור או מקושר למידע אישי ייחשב למידע אישי, כל עוד זיקה זו מתקיימת.\n' +
                                                    '\n' +
                                                    'שים לב: אנו לא נאסוף עליך מידע אישי ללא קבלת הסכמתך, אשר ניתנת, בין היתר, במסגרת קבלתך את תנאי השימוש ואת מדיניות הפרטיות ובעצם שימושך בפורטל ו/או באפקליציה.\n' +
                                                    '\n' +
                                                    'אינך מחויב למסור מידע אישי על-פי חוק. הנך מסכים ומצהיר בזאת שהמידע האישי שהינך מספק לנו נמסר מרצונך החופשי, על מנת שנוכל לספק עבורך את שירותי הפורטל והאפליקציה וכן הינך מסכים כי נשמור את המידע שסיפקת לנו במאגר מידע (אשר יתכן ויירשם בהתאם לדרישות הדין).  '}
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'4. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'מסירת מידע ואיסוף המידע'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'המידע האישי שמסרת לחברה מיוזמתך, בשלב הרישום לפורטל ו/או לאפליקציה, ובעת השימוש בפורטל ו/או באפליקציה, ישמר כאמור במאגר המידע של החברה (להלן: “מאגר המידע“).\n' +
                                                '\n' +
                                                'בעת מסירת המידע האישי לחברה, עליך להקפיד למסור פרטים נכונים, מלאים ולא שגויים או מסולפים. ככל שיחולו שינויים במידע האישי אותו מסרת בעת הרישום, תתבקש לעדכן את הנתונים בחשבון המשתמש שלך בפורטל ו/או באפליקציה.\n' +
                                                '\n' +
                                                'המידע הסטטיסטי הנאסף בעת השימוש בפורטל ו/או באפליקציה על-ידינו מכיל רק את המידע הנחוץ לנו לצורך מתן השירותים בפורטל ו/או באפליקציה ושיפורם. אנו נעשה במידע זה שימוש בכפוף למדיניות הפרטיות המפורטת להלן ובהתאם להוראות חוק הגנת הפרטיות, התשמ”א–1981 (להלן: “חוק הגנת הפרטיות“).'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'5. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'שימוש במידע'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'בעת השימוש בפורטל ו/או באפליקציה יכול שיצטבר מידע על נוהגיך, מקום המחשב שבאמצעותו ניגשת לפורטל ו/או לאפליקציה ועוד. החברה רשאית לשמור את המידע במאגריה. השימוש בנתונים אלה ייעשה רק על-פי מדיניות פרטיות זו או על-פי הוראות כל דין – וזאת למטרות המפורטות להלן:\n' +
                                                '\n' +
                                                'אנו נשתמש במידע האישי שמסרת ו/או במידע הסטטיסטי שנאסף אצלנו לצורך אספקת השירותים השונים בפורטל ו/או באפליקציה, ולצורך שינוי ושיפור התכנים, השירותים בהם כך שיתאימו לאופי המשתמשים, לרבות להעדפותיך ממש, כפי שמשתקף מניתוח המידע הסטטיסטי שנאסף בחברה לגבי הרגלי השימוש של המשתמשים בפורטל ו/או באפליקציה.\n' +
                                                'המידע שנאסוף, לרבות באמצעות השימוש בקבצי ‘עוגיות’ (ראה בהמשך), עשוי לזהות אותך בכל פעם שתיכנס לפורטל ו/או לאפליקציה ממחשבך הקבוע ו/או ממכשירך הנייד, ו/או שתפעיל את האפליקציה באמצעות מחשבך הקבוע ו/או מכשירך הנייד, וכך לייתר את הצורך בהזנת שם המשתמש והסיסמא בכניסותיך החוזרות לפורטל ו/או לאפליקציה.\n' +
                                                'אנו נשתמש במידע האישי שמסרת על מנת ליצור איתך קשר בעת הצורך, ו/או, במידה ונתת את הסכמתך לכך ע”י סימון V בתיבה המיועדת לכך, לשלוח אליך מדי פעם פרסומות ו/או הודעות באמצעות דואר אלקטרוני לפי הפרטים שמסרת בעת הרישום, ובהם עדכונים על מבצעים שונים בפורטל ו/או באפליקציה, חידושים בשירותים הניתנים, שוברי הנחה, הודעות ו/או פרסומות שונות, בין מטעם החברה ובין מטעם צדדים שלישיים (להלן: “דברי פרסומת“).\n' +
                                                'סימון ה-V בתיבה המיועדת לכך, כמו גם המשך השימוש שלך בפורטל ו/או באפליקציה והסכמתך לכללי מדיניות זו מהווים הסכמה לקבלת דברי פרסומת בהתאם להוראות סעיף 30א לחוק התקשורת (בזק ושירותים), התשמ”ב–1982. לתשומת לבך כי, בכפוף להוראות הדין, בכל עת תוכל לבחור לחדול מלקבל הודעות דברי פרסומת כאמור על-ידי מחיקת פרטיך מרשימת הדיוור של הפורטל ו/או האפליקציה. זאת באמצעות משלוח בקשה להסרה מרשימת הדיוור באמצעות הודעת דואר אלקטרוני לחברה בכתובת service@bizibox.biz.\n' +
                                                '\n' +
                                                'אנו נשתמש במידע הסטטיסטי שנאסף ונאגר אצלנו לצרכינו הפנימיים, לרבות על מנת לדאוג לתפעול הפורטל ו/או האפליקציה ופיתוחם, לשיפור המבנה שלהם, השירותים הניתנים בהם וכד’. לשם כך, עשויים אנו להסתייע בצדדים שלישיים לצורך איסוף וניתוח המידע הסטטיסטי והאנונימי כדי ללמוד על הרגלי השימוש שלך ושל יתר משתמשי הפורטל ו/או האפליקציה באופן שלא יזהה אותך ו/או את יתר המשתמשים באופן אישי.\n' +
                                                'אנו נשתמש במידע שמסרת או במידע שנאסף אצלנו לכל מטרה אחרת בקשר עם אספקת השירותים המוצעים בפורטל ו/או באפליקציה, לרבות כל מטרה המפורטת במדיניות זו ו/או בתנאי השימוש.'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'6. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'מסירת מידע לצד שלישי'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'מידע אישי – החברה לא תעביר לצדדים שלישיים את המידע האישי אלא באחד המקרים המפורטים להלן:\n' +
                                                'במידה והחברה ביקשה את רשותך, ואת/ה נתת את הסכמתך המפורשת לכך;\n' +
                                                'במקרה שתפר את תנאי השימוש, או ניסיון לבצע פעולות כאלה במקרים אלה, תהיה החברה רשאית למסור את המידע לפי הנדרש;\n' +
                                                'במידה ויתקבל צו מבית משפט או מכל ערכאה מוסמכת אחרת, המורה לחברה למסור את פרטיך או המידע האישי אודותיך לידי בית המשפט או הערכאה האחרת או לידי צד שלישי כלשהו;\n' +
                                                'במקרה של מחלוקת משפטית בינך לבין החברה שתחייב את חשיפת פרטיך;\n' +
                                                'בכל מקרה שהחברה תסבור, כי מסירת המידע נחוצה כדי למנוע נזק חמור לגופך או לרכושך או לגופו או לרכושו של צד שלישי;\n' +
                                                'החברה תהיה רשאית להעביר את פרטיך והמידע שנאסף בעקבות השימוש שעשית בפורטל ו/או באפליקציה לחברות אחרות הקשורות לחברה, ובלבד שהן תשתמשנה במידע זה רק על-פי הוראות מדיניות פרטיות זו;\n' +
                                                'במקרה שהחברה תתמזג עם גוף אחר או תמזג את פעילותיה עם פעילותו של צד שלישי – היא תהיה זכאית להעביר לתאגיד החדש העתק מן המידע שנאגר אודותיך או כל מידע סטטיסטי שבידיה, ובלבד שתאגיד זה יקבל על עצמו את הוראות מדיניות פרטיות זו.\n' +
                                                'במידה ומסירת המידע האישי הינה לעובדים המוסמכים של החברה ו/או לשלוחים מטעמה ו/או לפועלים מטעמה, והיא במידה הנדרשת והחיונית לצורך אספקת השירותים ותפעול הפורטל ו/או האפליקציה;\n' +
                                                'מידע סטטיסטי – החברה עשויה להעביר מידע סטטיסטי, בתמורה או שלא בתמורה, לצדדים שלישיים המצויים איתם בקשרים עסקיים או אחרים, לרבות חברות העוסקות בניתוח מידע סטטיסטי אנונימי כאמור לצורך שיפור השירותים המוצעים בפורטל ו/או באפליקציה, לפי שיקול דעתם הבלעדי של החברה.'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'7. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'“עוגיות” (Cookies) ואחסון מקומי'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'בשעת השימוש בפורטל ו/או באפליקציה, החברה או צדדים שלישיים עשויים להשתמש בטכנולוגיה אשר מקובלת בתעשייה ומוכרת כ”עוגיות” ו-Flash (או טכנולוגיות דומות), המאחסנת מידע מסוים במכשיר הנייד ו/או במחשב של המשתמש, מאפשרת לחברה להפעיל מאפיינים מסוימים באופן אוטומטי, ומשפרת את חווית השימוש של המשתמש בשירותי החברה. העוגיות נדרשות לצורך תפעולם השוטף והתקין של הפורטל והאפליקציה, ובכלל זה כדי לאסוף נתונים אודות הרגלי השימוש בפורטל ו/או באפליקציה ולזהות דפוסי תעבורת משתמשים, לאימות פרטים, להתאמת הפורטל והאפליקציה להעדפותיך האישיות ולצרכי אבטחת מידע.\n' +
                                                '\n' +
                                                'מרבית דפדפני האינטרנט מאפשרים למשתמשים למחוק עוגיות ממכשיר המשתמש, לחסום קבלה של עוגיות או לקבל התראות לפני אחסונן של עוגיות. עם זאת, יש לשים לב כי אם המשתמש ימחק את העוגיות או לא יאפשר את אחסונן, או אם ישנה את המאפיינים של Flash, החוויה המקוונת של המשתמש דרך הפורטל ו/או האפליקציה תהיה מוגבלת.'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'8. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'איסוף מידע לצרכים סטטיסטיים'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'החברה נעזרת בחברות שונות המספקות לה ניתוחים סטטיסטיים אודות השימוש בפורטל ו/או באפליקציה. החברות אוספות ומנתחות מידע על היקף השימוש בפורטל ו/או באפליקציה, תדירות השימוש בהם, מקורות הגישה של המשתמשים אליהם וכיוצא בזה. המידע הנאסף הוא סטטיסטי במהותו, הוא איננו מזהה אותך אישית והוא נועד לצרכי ניתוח, מחקר ובקרה.'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'9. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'אבטחת מידע'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'על מנת לשמור על סודיות המידע מפני צד שלישי נוקטת החברה באמצעים שנועדו להבטיח את זיהוי המשתמש ולהגן על מידע שמועבר וזאת באמצעי אבטחת מידע התואמים את הסטנדרטים המקובלים ביחס לכל סוג של אמצעי תקשורת, כגון הצפנה של שדות רגישים ותקני הצפנה מתקדמים מסוג SSL 256 ביט. למרות זאת, אין החברה יכולה לבטל כליל סיכון של חדירה למאגרי הנתונים של החברה או לתעבורת הנתונים בין המחשב בו הינך עושה שימוש לבין החברה – ולהיפך. בנוסף, ישנם ערוצי תקשורת בהם אין החברה יכולה להגן ולשמור על אבטחת המידע בעת העברתו אליהם באמצעותם, על ידך. לכן, מוסכם עליך כי החברה לא תהא אחראית לנזק שיגרם לך, אם ייגרם, כתוצאה מכך, לרבות בשל העברת מידע אודותיך או מידע שנמסר על ידך לצד ג’ כלשהו, וזאת ככל שהחברה נקטה בצעדים סבירים ומקובלים למניעת פעולות שכאלה. כמו כן, עליך לשמור על שם המשתמש וסיסמת הגישה לפורטל ו/או לאפליקציה, ולהימנע מלחשוף אותם לכל אדם אחר וכדאי שתתמיד להחליף את הסיסמא שלך מידי כמה חודשים.'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'10. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'זכות עיון במידע'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'על-פי חוק הגנת הפרטיות, כל אדם זכאי לעיין בעצמו, או על-ידי בא-כוחו שהרשהו בכתב או על-ידי אפוטרופוסו, במידע שעליו המוחזק במאגר מידע. אדם שעיין במידע שעליו ומצא כי אינו נכון, שלם, ברור או מעודכן, רשאי לפנות לבעל מאגר המידע בבקשה לתקן את המידע או למוחקו. אם בעל המאגר סירב למלא בקשה זו, עליו להודיע על כך למבקש באופן ובדרך שנקבעו בתקנות. על סירובו של בעל מאגר מידע לאפשר עיון ועל הודעת סירוב לתקן או למחוק מידע, רשאי מבקש המידע לערער לפני בית משפט השלום באופן ובדרך שנקבעו בתקנות.\n' +
                                                '\n' +
                                                'בנוסף, אם המידע שבמאגרי החברה משמש לצורך פניה אישית אליך, בהתבסס על השתייכותך לקבוצת אוכלוסין, שנקבעה על-פי איפיון אחד או יותר של בני אדם ששמותיהם כלולים במאגר (להלן: “פניה בהצעה מסחרית“), כי אז אתה זכאי על-פי חוק הגנת הפרטיות, לדרוש בכתב שהמידע המתייחס אליך יימחק ממאגר המידע. החברה תימחק במקרה זה מידע הדרוש לה רק כדי לפנות אליך בהצעות מסחריות כאמור לעיל. מידע הדרוש להחברה לשם ניהול עסקיה – לרבות תיעוד פעולות מסחריות ואחרות שביצעת בפורטל ו/או באפליקציה – יוסיף להישמר בהחברה על-פי דין, אך לא ישמש עוד לצורך פניות אליך. אם בתוך 30 יום לא תקבל הודעה כי המידע שנתבקשה החברה למחוק אכן נמחק על-פי סעיף זה, תהיה זכאי לפנות לבית משפט השלום באופן הקבוע בתקנות שמכוח החוק, כדי שיורה להחברה לפעול כאמור.'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'11. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'“הודעות Push“'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'החברה מיישמת באפליקציה שירות הודעות בדחיפה (להלן: “הודעות ה-Push“) המאפשרת לשלוח התראות וצלילים כאשר הן אינן פועלות באותו רגע, דרך שרתי מערכת ההפעלה של המכשיר עליו מותקנת האפליקציה, iOS או אנדרואיד, לפי העניין). במסגרת השימוש באפליקציה, תישלחנה, מעת לעת, למכשיר הנייד שברשותך (שעל גביו מותקנות האפליקציה ובו ביקשת לקבל את השירותים), הודעות Push באמצעותן תוכל להתעדכן אודות מוצרים ושירותים נוספים שהחברה סבורה כי אתה עשוי למצוא בהם עניין, וכן לקבל מידע נוסף אודות החברה והאפליקציה. הודעות ה-Push תישלחנה בזמנים ובתדירות כפי שייקבע על-ידי החברה. הינך מצהיר כי ידוע לך שהודעות ה-Push עשויות לכלול מסרים שעשויים להיחשב כ-“דבר פרסומת” כהגדרתו בסעיף 30א לחוק התקשורת (בזק ושידורים), התשס”ח–2008, והינך רשאי לבטל או לעדכן את האפשרות לקבל את הודעות ה-Push, כולן או מקצתן, בכל עת, באמצעות שינוי הגדרות האפליקציה במכשיר הנייד שברשותך.\n' +
                                                '\n'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'12. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'חוק הספאם'}</Text>
                                            </Text>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'בהתאם להוראות סעיף 30א לחוק התקשורת (בזק ושידורים), התשמ”ב–1982 (להלן: “חוק הספאם“), החברה מתחייבת לא לשלוח אליך כל דבר פרסומת מבלי להשיג את אישורך לכך קודם לכן (להלן: “ספאם“). במידה ונתת את הסכמתך לכך על-ידי סימון V בתיבה המיועדת לכך במסגרת ההרשמה לשימוש בפורטל ו/או באפליקציה, אנו נשלח אליך דברי פרסומת (כהגדרתם בחוק הספאם) בדואר אלקטרוני ו/או לכתובת מגורייך ו/או לטלפון הנייד שלך. מרגע בו הסכמה זו ניתנת, כל חומר שנשלח אליך מטעם החברה לא יחשב כספאם מכל סוג ומין אשר מהווה או יש בו כדי להוות הפרה של חוק הספאם. בכל רגע נתון, תוכל לבטל את הסכמתך זו ו/או לעדכן את החברה בדבר רצונך לקבל רק סוגים ספציפיים של מידע על-ידי יידוע החברה על סירובך לקבל מידע מהחברה בעתיד, על-ידי שליחת דואר אלקטרוני לכתובת service@bizibox.biz ו/או באותה דרך שהפרסום האמור נשלח אליך.'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'13. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'שירותי צדדים שלישיים'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>
                                                {'אנו רשאים להשתמש בתוכנה או בשירותי צד שלישי על מנת לאסוף, לאחסן ו/או לעבד את המידע שנאסף במסגרת הפורטל ו/או האפליקציה. אנו עושים מאמצים על מנת להתקשר עם צדדים שלישיים המפרסמים מדיניות פרטיות החלה על איסוף, אחסון, עיבוד ושימוש במידע אישי ובמידע לא אישי. שירותי צדדים שלישיים כוללים, בין היתר, את Zoho CRM, אשר מדיניות הפרטיות שלה מפורסמת בכתובת: https://www.zoho.com/privacy.html; Google Analytics, אשר מדיניות הפרטיות שלה מפורסמת בכתובות: '}
                                                <Text
                                                    onPress={this.handleLinkTermsPrivacyPolicyGoogle}
                                                    style={{
                                                        color: '#007ebf',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#007ebf',
                                                    }}>{'https://www.google.com/policies/privacy'}</Text>
                                                {' וחברת קארדקום בע”מ, אשר פרטים בנוגע למדיניות הפרטיות שלה ניתן למצוא בכתובות: http://www.cardcom.co.il/MainPage.aspx. יחד עם זאת, לחברה אין כל שליטה על צדדים שלישיים אלה. אנו ממליצים לך לקרוא את תנאי השימוש ומדיניות הפרטיות של צדדים שלישיים אלה ו/או לפנות אליהם במישרין על מנת שתוכל לדעת אילו סוגי מידע נאספים לגביך.'}
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'14. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'שינויים במדיניות הפרטיות'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'החברה שומרת על זכותה לשנות מדיניות פרטיות זו בכל זמן, ומבקשת מכלל המשתמשים לשוב ולבקר בדף זה לעיתים קרובות ככל האפשר. אנו נודיע למשתמש על כל שינוי מהותי בתנאי מדיניות פרטיות זו, על-ידי החלפת הקישור ל”מדיניות הפרטיות” בעמוד הבית של הפורטל בקישור ששמו “תנאי השימוש מעודכנים ליום 07/01/19”. שינויים שאינם מהותיים יכנסו לתוקף תוך שבעה (7) ימים ממועד ההודעה כאמור. כל שאר השינויים במדיניות הפרטיות ייכנסו לתוקף באופן מיידי והמשך השימוש שלך בפורטל לאחר תאריך העדכון האחרון יהווה הסכמה שלך לכך שהשינויים יחייבו אותך. המשך השימוש שלך בפורטל, באפליקציה ובשירותים יעידו על הסכמתך לכללי המדיניות החדשים.'}</Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 5,
                                            }}>
                                                {'15. '}
                                                <Text
                                                    style={{
                                                        fontFamily: fonts.bold,
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#0f3861',
                                                    }}>{'שאלות'}</Text>
                                            </Text>

                                            <Text style={{
                                                color: '#0f3861',
                                                fontSize: sp(16),
                                                lineHeight: 20,
                                                fontFamily: fonts.regular,
                                                textAlign: 'right',
                                                marginBottom: 20,
                                            }}>{'במידה ויש לך שאלות נוספות או הערות בנוגע לתנאים, הינך מוזמן לפנות אלינו באמצעות דואר אלקטרוני בכתובת: service@bizibox.biz. אנו נעשה את מירב המאמצים לחזור אליך תוך זמן סביר.'}</Text>

                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modal>
                )}

            </Fragment>

        )
    }
}
