import React, {Fragment, PureComponent} from 'react'
import {
    Image,
    Keyboard,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView,
} from 'react-native'
// import {SafeAreaView} from 'react-native-safe-area-context';
import {WebView} from 'react-native-webview'
import {connect} from 'react-redux'
import LinearGradient from 'react-native-linear-gradient'
import commonStyles from '../../styles/styles'
import {colors, fonts} from '../../styles/vars'
import {withTranslation} from 'react-i18next'
import {
    accountCflApi,
    checkMailExistsApi,
    getAlertTokensApi,
    getStatusTokenTypeApi,
    sendActivationMailsApi,
    updateUserMailApi,
} from '../../api'
import {ALERTS_TRIAL} from 'src/constants/config'
import BankTokenService from '../../services/BankTokenService'
import {BANK_TOKEN_STATUS} from '../../constants/bank'
import styles from '../AccountAlert/AccountAlertStyles'
import CustomIcon from '../Icons/Fontello'
import {OVERVIEW} from '../../constants/navigation'
import {combineStyles as cs, getEmoji, goTo, sp} from '../../utils/func'
import {getAccounts} from '../../redux/actions/account'
import {selectCompany} from '../../redux/actions/company'
import {getAccount} from '../../redux/selectors/account'
import AddTokenModal
    from '../../screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/AddTokenModal'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {IS_IOS} from '../../constants/common'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import {Button, Icon} from 'react-native-elements'
import {
    BANK_ACCOUNTS_TAB,
    CLEARING_ACCOUNTS_TAB,
    CREDIT_CARDS_TAB,
    PAYMENTS_TO_BIZIBOX_TAB,
} from '../../constants/settings'
import {setGlobalParams} from 'src/redux/actions/user'
import {exampleCompany} from '../../redux/constants/account';

@connect(state => ({
    globalParams: state.globalParams,
    token: state.token,
    user: state.user,
    accounts: getAccount(state),
    isRtl: state.isRtl,
    getToken: state.getToken,
    companies: state.companies,
    currentCompanyId: state.currentCompanyId,
    openedBottomSheet: state.openedBottomSheet,
}))
@withTranslation()
export default class AlertsTrial extends PureComponent {
    intervalId = null
    intervalSwitch = null

    constructor(props) {
        super(props)

        this.state = {
            alertTokens: [],
            isValid: false,
            stepMail: 1,
            activated: false,
            addAccountModalIsOpen: false,
            timeoutBackRealData: 5,
            billingAccountId: '',
            mail: '',
            emailExists: false,
            mailIsHebrew: false,
            mailValid: true,
            showAlert: false,
            showPopUp: false,
            showWebView: false,
            getTokenShow: false,
            tokensForStatus: [],
            newTokenStatus: null,
            statusToken: null,
            statusTokenFinished: false,
            switchCompany: false,
            activatedModalIsOpen: false,
            secureTextEntry: false,
            password: '',
            passwordValid: true,
            inProgress: false,
            errPass: false,
            idCompany: false,
        }
    }

    get currentCompany() {
        const {companies, currentCompanyId} = this.props
        if (!companies || !companies.length) {
            return {}
        }
        return companies.find(c => c.companyId === currentCompanyId) || {}
    }

    get getStatusView() {
        const {
            statusToken,
            statusTokenFinished,
            isValid,
        } = this.state
        const {
            updateToken,
        } = this.props
        // console.log('statusToken====', statusToken)
        // console.log('statusTokenFinished====', statusTokenFinished)
        if (statusTokenFinished === true) {
            return (
                <View style={[
                    styles.alertWrapper, {
                        alignItems: 'center',
                        flexDirection: 'row-reverse',
                        justifyContent: 'center',
                        backgroundColor: 'transparent',
                    }]}>
                    <Text style={{
                        color: '#ffffff',
                        fontFamily: fonts.regular,
                        fontSize: sp(updateToken && isValid ? 18 : 13),
                        textAlign: 'center',
                    }}>
                        {updateToken && isValid
                            ? 'הטעינה בוצעה בהצלחה, '
                            : 'משיכת נתונים מהבנק הושלמה!'}
                    </Text>
                    <View style={commonStyles.spaceDivider}/>

                    <TouchableOpacity
                        onPress={isValid ? this.refresh : this.switchCompany}>
                        <Text style={{
                            color: '#ffffff',
                            fontFamily: fonts.semiBold,
                            fontSize: sp(updateToken && isValid ? 18 : 13),
                            textDecorationLine: 'underline',
                            textDecorationStyle: 'solid',
                            textDecorationColor: '#ffffff',
                        }}>{updateToken && isValid
                            ? 'רענון נתונים'
                            : 'החלף נתוני חברה לדוגמה לנתוני אמת'}</Text>
                    </TouchableOpacity>
                </View>
            )
        } else if ([
            BANK_TOKEN_STATUS.BANK_TRANS_LOAD,
            BANK_TOKEN_STATUS.CREDIT_CARD_LOAD,
            BANK_TOKEN_STATUS.CHECKS_LOAD,
            BANK_TOKEN_STATUS.DEPOSIT_LOAD,
            BANK_TOKEN_STATUS.LOAN_LOAD,
            BANK_TOKEN_STATUS.STANDING_ORDERS_LOAD,
            BANK_TOKEN_STATUS.FOREIGN_TRANS_LOAD,
            BANK_TOKEN_STATUS.NEW,
            BANK_TOKEN_STATUS.IN_PROGRESS,
            BANK_TOKEN_STATUS.ALMOST_DONE,
        ].includes(statusToken)) {
            let percentage = '0%'
            if (statusToken === BANK_TOKEN_STATUS.BANK_TRANS_LOAD) {
                percentage = '20%'
            } else if (statusToken === BANK_TOKEN_STATUS.CREDIT_CARD_LOAD) {
                percentage = '30%'
            } else if (statusToken === BANK_TOKEN_STATUS.CHECKS_LOAD) {
                percentage = '40%'
            } else if (statusToken === BANK_TOKEN_STATUS.DEPOSIT_LOAD) {
                percentage = '50%'
            } else if (statusToken === BANK_TOKEN_STATUS.LOAN_LOAD) {
                percentage = '60%'
            } else if (statusToken === BANK_TOKEN_STATUS.STANDING_ORDERS_LOAD) {
                percentage = '70%'
            } else if (statusToken === BANK_TOKEN_STATUS.FOREIGN_TRANS_LOAD) {
                percentage = '80%'
            } else if (statusToken === BANK_TOKEN_STATUS.ALMOST_DONE) {
                percentage = '100%'
            } else if (statusToken === BANK_TOKEN_STATUS.NEW || statusToken ===
                BANK_TOKEN_STATUS.IN_PROGRESS) {
                percentage = '10%'
            }
            return (
                <View style={{
                    backgroundColor: 'transparent',
                    paddingHorizontal: 11,
                    flexDirection: 'column',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    marginTop: 3,
                }}>
                    <Text style={{
                        color: '#0f3860',
                        fontFamily: fonts.regular,
                        fontSize: sp(12),
                        textAlign: 'center',
                    }}>
                        {(statusToken === BANK_TOKEN_STATUS.NEW || statusToken ===
                            BANK_TOKEN_STATUS.IN_PROGRESS)
                            ? 'מאמת פרטי זיהוי'
                            : 'מושך נתונים מהבנק'}
                    </Text>
                    <View style={{
                        width: 250,
                        height: 6,
                        backgroundColor: 'powderblue',
                        marginTop: 5,
                        marginBottom: 2,
                    }}>
                        <View style={{
                            width: percentage,
                            height: 6,
                            backgroundColor: 'steelblue',
                        }}/>
                    </View>
                    <Text style={{
                        color: '#0f3860',
                        fontFamily: fonts.regular,
                        fontSize: sp(12),
                        textAlign: 'center',
                    }}>
                        {percentage}
                    </Text>
                </View>
            )
        } else if (statusToken === BANK_TOKEN_STATUS.SUSPENDED) {
            return (
                <View style={[
                    styles.alertWrapper, {
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        flexDirection: 'row-reverse',
                        justifyContent: 'center',
                    }]}>
                    <Image
                        style={[
                            styles.imgIcon,
                            {
                                width: 16,
                                height: 16,
                                marginHorizontal: 10,
                            }]}
                        source={require('BiziboxUI/assets/frozen.png')}
                    />
                    <Text style={{
                        color: '#0f3860',
                        fontFamily: fonts.regular,
                        fontSize: sp(18),
                        textAlign: 'center',
                    }}>
                        {'החשבון מוקפא לבקשתכם'}
                    </Text>
                </View>
            )
        } else if (statusToken === BANK_TOKEN_STATUS.TECHNICAL_PROBLEM) {
            return (
                <View style={[
                    styles.alertWrapper, {
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        flexDirection: 'row-reverse',
                        justifyContent: 'center',
                    }]}>
                    <Image style={{
                        width: 18,
                        height: 18,
                        marginHorizontal: 10,
                    }}
                           source={require('BiziboxUI/assets/b.png')}/>
                    <Text style={{
                        color: '#0f3860',
                        fontFamily: fonts.regular,
                        fontSize: sp(16),
                        textAlign: 'center',
                    }}>
                        {'התעוררה תקלה טכנית. אנחנו עובדים על פיתרון'}
                    </Text>
                </View>
            )
        } else if ([
            BANK_TOKEN_STATUS.AGREEMENT_REQUIRED,
        ].includes(statusToken)) {
            return (
                <View style={[
                    styles.alertWrapper, {
                        alignItems: 'center',
                        backgroundColor: 'transparent',
                        flexDirection: 'row-reverse',
                        justifyContent: 'center',
                    }]}>
                    <Image
                        style={[
                            styles.imgIcon,
                            {
                                width: 16,
                                height: 22,
                                marginHorizontal: 10,
                            }]}
                        source={require('BiziboxUI/assets/paper.png')}
                    />
                    <Text style={{
                        color: '#0f3860',
                        fontFamily: fonts.regular,
                        fontSize: sp(18),
                        textAlign: 'center',
                    }}>
                        {'נדרש אישור הסכם שירות'}
                    </Text>
                </View>
            )
        } else if (statusToken ===
            BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS) {
            return (
                <View style={[
                    styles.alertWrapper, {
                        alignItems: 'center',
                        flexDirection: 'row-reverse',
                        backgroundColor: 'transparent',
                        justifyContent: 'center',
                    }]}>
                    <View style={{
                        marginHorizontal: 10,
                    }}>
                        <CustomIcon name="exclamation-triangle" size={18}
                                    color={colors.red2}/>
                    </View>
                    <Text style={{
                        color: '#0f3860',
                        fontFamily: fonts.regular,
                        fontSize: sp(18),
                        textAlign: 'center',
                    }}>
                        {'סיסמה שגויה אנא פנה למנהל המערכת'}
                    </Text>
                </View>
            )
        } else if ([
            BANK_TOKEN_STATUS.INVALID_PASSWORD,
            BANK_TOKEN_STATUS.BLOCKED,
            BANK_TOKEN_STATUS.PASSWORD_EXPIRED,
            BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED,
        ].includes(statusToken)) {
            this.setState({
                getTokenShow: false,
            })
            return null
        }
    }

    buyPack = () => {
        goTo(this.props.navigation, 'SETTINGS', {
            paramsLinkAddCard: {
                addCard: PAYMENTS_TO_BIZIBOX_TAB,
            },
        })
        // const currentCompany = this.currentCompany
        //
        // getUserBillingAccountsApi.get()
        //   .then((data) => {
        //     const param = {
        //       'billingAccountId': null,
        //       'companyIds': [],
        //     }
        //     data.forEach((item) => {
        //       const isSome = item.companies.some((element) => {
        //         return element.companyId === currentCompany.companyId
        //       })
        //       if (isSome) {
        //         param.billingAccountId = item.billingAccountId
        //         param.companyIds = item.companies.map((id) => id.companyId)
        //       }
        //     })
        //
        //     getBillingAccountDetailsApi.post({
        //       body: param,
        //     })
        //       .then((res) => {
        //         getCardcomClientApi.post({
        //           body: {
        //             'billingAccountAddress': res.billingAccountAddress,
        //             'billingAccountCityId': res.billingAccountCityId,
        //             'billingAccountCompanyName': res.billingAccountCompanyName,
        //             'billingAccountEmail': res.billingAccountEmail,
        //             'billingAccountHp': res.billingAccountHp,
        //             'billingAccountId': res.billingAccountId,
        //             'billingAccountName': res.billingAccountName,
        //             'billingAccountPhone': res.billingAccountPhone,
        //             'companyId': currentCompany.companyId,
        //             'leloMaam': res.leloMaam,
        //           },
        //         }).then((url) => {
        //           if (typeof url === 'string' && url.startsWith('http')) {
        //             this.setState({
        //               showWebView: url,
        //             })
        //           }
        //         })
        //       })
        //   })
    }

    handleCloseAlert = () => {
        ALERTS_TRIAL.showAlert = false
        this.setState({
            showAlert: false,
        })
    }

    handleClosePopUp = () => {
        ALERTS_TRIAL.showPopUp = false
        this.setState({
            showPopUp: false,
        })
    }

    handleCloseAlertToken = () => {
        ALERTS_TRIAL.showAlert = false
        this.setState({
            getTokenShow: false,
        })
    }

    handleCloseTokenAlert = () => {
        ALERTS_TRIAL.alertTokens = false
        this.setState({
            alertTokens: [],
        })
    }

    handleClosePopUpSwitchCompany = () => {
        clearInterval(this.intervalSwitch)
        this.setState({
            switchCompany: false,
            timeoutBackRealData: 5,
        })
    }

    handleCloseAlertActivated = () => {
        ALERTS_TRIAL.showAlertActivated = false
        this.setState({
            activated: false,
        })
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {getToken, updateToken} = this.props
        const getTokenNextProps = nextProps.getToken

        // const getUpdateToken = navigation.getParam('updateToken')
        if (nextProps.updateToken && updateToken !== nextProps.updateToken) {
            setTimeout(() => this.runCheckToken(), 500)
        } else {
            if (getTokenNextProps && getToken !== getTokenNextProps) {
                setTimeout(() => this.setData(), 500)
            }
        }
    }

    componentDidMount() {
        this.setData()
    }

    runCheckToken = () => {
        ALERTS_TRIAL.showAlert = true
        clearInterval(this.intervalId)
        const {token, companies, currentCompanyId, updateToken} = this.props
        if (token && companies && currentCompanyId && updateToken) {
            this.setState({
                tokensForStatus: [updateToken],
                getTokenShow: 'updateToken',
            })
            setTimeout(() => {
                this.getStatusToken(currentCompanyId, [updateToken])
            }, 20)
        }
    }

    setData = () => {
        clearInterval(this.intervalId)
        const {
            token,
            companies,
            currentCompanyId,
            onlyShowPopUp,
            getToken,
            isSettings,
            user,
            dontShowActivated,
        } = this.props
        this.getAlertTokens(currentCompanyId)
        if (token && companies && currentCompanyId) {
            const company = this.currentCompany

            const showAlert = company.daysLeftTillExpire !== null &&
                company.daysLeftTillExpire <= 14 && company.daysLeftTillExpire > 0
            const showPopUp = isSettings
                ? (company.daysLeftTillExpire !== null &&
                    company.daysLeftTillExpire <= 14 &&
                    !(company.daysLeftTillExpire === 0 &&
                        company.billingAccountId ===
                        '00000000-0000-0000-0000-000000000000'))
                : (company.daysLeftTillExpire !== null &&
                    company.daysLeftTillExpire <= 14)

            let isFromAccountFalseTokens = []
            if (getToken && getToken.length &&
                getToken.filter((item) => !item.isFromAccount).length) {
                isFromAccountFalseTokens = getToken.filter(
                    (item) => !item.isFromAccount).map((it) => it.token)
                if (isFromAccountFalseTokens.length) {
                    this.getStatus(currentCompanyId, isFromAccountFalseTokens)
                }
            }

            const showAlertState = !onlyShowPopUp && ALERTS_TRIAL.showAlert &&
                showAlert

            this.setState({
                stepMail: 1,
                tokensForStatus: isFromAccountFalseTokens,
                billingAccountId: company.billingAccountId,
                showAlert: showAlertState,
                showPopUp: ((company.daysLeftTillExpire > 0 &&
                            company.billingAccountId ===
                            '00000000-0000-0000-0000-000000000000') ||
                        company.daysLeftTillExpire === 0) && ALERTS_TRIAL.showPopUp &&
                    showPopUp &&
                    !(!onlyShowPopUp && showAlert && company.billingAccountId !==
                        '00000000-0000-0000-0000-000000000000'),
            })

            accountCflApi.post({body: {uuid: currentCompanyId}})
                .then(data => {
                    let getTokenShow = (!showPopUp && getToken &&
                        ALERTS_TRIAL.showAlert) ? ((!getToken.length ||
                        !getToken.filter((item) => !item.isFromAccount).length) && data.exampleCompany
                        ? 'example'
                        : 'temp') : null

                    // const {
                    //   statusToken,
                    //   statusTokenFinished,
                    // } = this.state
                    //
                    // if (statusTokenFinished !== true && [
                    //   BANK_TOKEN_STATUS.INVALID_PASSWORD,
                    //   BANK_TOKEN_STATUS.BLOCKED,
                    //   BANK_TOKEN_STATUS.PASSWORD_EXPIRED,
                    //   BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED,
                    // ].includes(statusToken)) {
                    //   getTokenShow = null
                    // }

                    this.setState({
                        getTokenShow: getTokenShow,
                        activated: !dontShowActivated &&
                            ALERTS_TRIAL.showAlertActivated && !showAlertState &&
                            !getTokenShow && user && user.activated === false,
                    })
                })


        }
    }

    showWebView = () => {
        this.setState({
            showWebView: false,
        })
    }

    getStatus = (companyId, tokens) => {
        if (companyId) {
            return getStatusTokenTypeApi.post({
                body: {
                    companyId,
                    tokens: tokens,
                },
            })
                .then(([newTokenStatus]) => {
                    const statusCode = BankTokenService.getTokenStatusCode(
                        newTokenStatus.tokenStatus)
                    this.setState({
                        newTokenStatus,
                        statusToken: statusCode,
                    })

                    if ([
                        BANK_TOKEN_STATUS.VALID,
                        BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED].includes(
                        statusCode)) {
                        accountCflApi.post({body: {uuid: companyId}})
                            .then(data => {
                                if ((data.exampleCompany === false) &&
                                    (this.state.statusToken ===
                                        BANK_TOKEN_STATUS.INVALID_PASSWORD || [
                                            BANK_TOKEN_STATUS.VALID,
                                            BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED].includes(
                                            this.state.statusToken))
                                ) {
                                    this.stopPullingTokenStatus(
                                        this.state.statusToken, false)
                                } else {
                                    this.startPullingTokenStatus()
                                }
                            })
                    } else {
                        this.startPullingTokenStatus()
                    }
                })
                .catch(() => this.setState({inProgress: false}))
        }
    }

    getStatusToken = (companyId, tokens) => {
        if (companyId) {
            return getStatusTokenTypeApi.post({
                body: {
                    companyId,
                    tokens: tokens,
                },
            })
                .then(([newTokenStatus]) => {
                    const statusCode = BankTokenService.getTokenStatusCode(
                        newTokenStatus.tokenStatus)
                    this.setState({
                        newTokenStatus,
                        statusToken: statusCode,
                    })
                    if (statusCode !== BANK_TOKEN_STATUS.VALID && statusCode !==
                        BANK_TOKEN_STATUS.VALIDPOALIMBAASAKIM) {
                        this.startPullingTokenStatusToken()
                    } else {
                        this.stopPullingTokenStatus(statusCode, true)
                    }
                })
                .catch(() => this.setState({inProgress: false}))
        }
    }

    getAlertTokens = (companyId) => {
        if (companyId) {
            ALERTS_TRIAL.alertTokens = true
            return getAlertTokensApi.post({body: {uuid: companyId}})
                .then((alertTokens) => {
                    this.setState({
                        alertTokens,
                    })
                })
                .catch(() => {
                })
        }
    }

    startPullingTokenStatusToken = () => {
        this.intervalId = setInterval(() => {
            const {currentCompanyId} = this.props
            const {tokensForStatus} = this.state
            if (currentCompanyId) {
                return getStatusTokenTypeApi.post({
                    body: {
                        companyId: currentCompanyId,
                        tokens: tokensForStatus,
                    },
                })
                    .then(([newTokenStatus]) => {
                        this.setState({newTokenStatus})
                        if (!newTokenStatus) {
                            return
                        }
                        const statusCode = BankTokenService.getTokenStatusCode(
                            newTokenStatus.tokenStatus)
                        this.setState({statusToken: statusCode})
                        if (BankTokenService.isTokenStatusProgressing(
                            newTokenStatus.tokenStatus)) {
                            return
                        }
                        setTimeout(() => {
                            if (statusCode ===
                                BANK_TOKEN_STATUS.INVALID_PASSWORD || [
                                    BANK_TOKEN_STATUS.VALID,
                                    BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED].includes(
                                    statusCode)) {
                                this.stopPullingTokenStatus(
                                    this.state.statusToken, true)
                            }
                        }, 20)
                    })
            }
        }, 5000)
    }

    startPullingTokenStatus = () => {
        this.intervalId = setInterval(() => {
            const {currentCompanyId} = this.props
            const {tokensForStatus} = this.state
            if (currentCompanyId) {
                return getStatusTokenTypeApi.post({
                    body: {
                        companyId: currentCompanyId,
                        tokens: tokensForStatus,
                    },
                })
                    .then(([newTokenStatus]) => {
                        this.setState({newTokenStatus})
                        if (!newTokenStatus) {
                            return
                        }

                        const statusCode = BankTokenService.getTokenStatusCode(
                            newTokenStatus.tokenStatus)
                        this.setState({statusToken: statusCode})

                        if (BankTokenService.isTokenStatusProgressing(
                            newTokenStatus.tokenStatus)) {
                            return
                        }

                        accountCflApi.post({body: {uuid: currentCompanyId}})
                            .then(data => {
                                if ((data.exampleCompany === false) &&
                                    (this.state.statusToken ===
                                        BANK_TOKEN_STATUS.INVALID_PASSWORD || [
                                            BANK_TOKEN_STATUS.VALID,
                                            BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED].includes(
                                            this.state.statusToken))
                                ) {
                                    this.stopPullingTokenStatus(
                                        this.state.statusToken, true)
                                }
                            })
                    })
            }
        }, 5000)
    }

    stopPullingTokenStatus = (statusTokenFinished, isValid) => {
        let valid = false
        if (isValid) {
            valid = statusTokenFinished === BANK_TOKEN_STATUS.VALID ||
                statusTokenFinished === BANK_TOKEN_STATUS.VALIDPOALIMBAASAKIM
        }
        this.setState({
            statusTokenFinished: statusTokenFinished ===
                BANK_TOKEN_STATUS.VALID || statusTokenFinished ===
                BANK_TOKEN_STATUS.VALIDPOALIMBAASAKIM,
            isValid: valid,
        })

        clearInterval(this.intervalId)
    }

    switchCompany = () => {
        this.setState({switchCompany: true})
        this.intervalSwitch = setInterval(() => {
            let timeoutBackRealData = this.state.timeoutBackRealData
            timeoutBackRealData = timeoutBackRealData - 1
            this.setState({
                switchCompany: true,
                timeoutBackRealData,
            })
            if (!this.state.switchCompany) {
                clearInterval(this.intervalSwitch)
            }
            if (timeoutBackRealData === 0 && this.state.switchCompany) {
                this.switchCompanyNow()
            }
        }, 1000)
    }

    switchCompanyNow = () => {
        const {dispatch, navigation, currentCompanyId} = this.props
        clearInterval(this.intervalSwitch)
        this.setState({
            switchCompany: false,
            timeoutBackRealData: 5,
        })
        dispatch(selectCompany(currentCompanyId))
            .then(() => {
                goTo(navigation, OVERVIEW, {
                    timeoutAcc: true,
                })
                return dispatch(getAccounts())
            })
    }

    setTokenBank = () => {
        this.setState({
            addAccountModalIsOpen: true,
            idCompany: true,
        })
    }

    handleToggleAddAccountModal = () => {
        this.setState({addAccountModalIsOpen: false})
    }

    refresh = () => {
        const {
            refresh,
            updateToken,
        } = this.props
        if (updateToken) {
            this.setState({
                getTokenShow: false,
            })
            this.props.dispatch(
                setGlobalParams(Object.assign(this.props.globalParams, {
                    updateToken: false,
                })))
            setTimeout(() => {
                refresh()
            }, 100)
        }
    }

    activated = () => {
        sendActivationMailsApi.post().then((mail) => {
            this.setState({
                secureTextEntry: false,
                mail: '',
                emailExists: false,
                mailIsHebrew: false,
                mailValid: true,
                stepMail: 1,
                activatedModalIsOpen: mail,
                password: '',
                passwordValid: true,
                inProgress: false,
                errPass: false,
            })
        })
    }
    handleUpdateField = name => val => {
        let value = val || ''
        value = value.toString().replace(getEmoji(), '').replace(/\s+/g, '')
        if (name === 'password') {
            this.setState({
                [name]: value.toString()
                    .replace(/([\u05D0-\u05FF/\s+]+)/g, ''),
            })
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
            if (mailValid) {
                setTimeout(() => this.handleUpdateFieldValidAsync({
                    nativeEvent: {
                        text: value,
                    },
                }), 300)
            }
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
                mailValid && passwordValid && !emailExists && password.length >
                0 && mail.length > 0
            )) {
                return
            }
        }

        Keyboard.dismiss()

        if (stepMail === 1) {
            this.setState({stepMail: 2})
        } else {
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
                .then(() => {
                    this.setState({
                        inProgress: false,
                        stepMail: 3,
                    })
                })
                .catch(() => {
                    this.setState({
                        inProgress: false,
                        errPass: true,
                    })
                })
        }
    }
    activatedModalClose = () => {
        if (this.state.stepMail === 3) {
            this.handleCloseAlertActivated()
        }
        this.setState({
            stepMail: 1,
            activatedModalIsOpen: false,
        })
    }

    goToSettings = (source) => () => {
        const {navigation} = this.props
        if (source === 'account') {
            goTo(navigation, 'SETTINGS', {
                paramsLinkAddCard: {
                    addCard: BANK_ACCOUNTS_TAB,
                },
            })
        } else if (source === 'card') {
            goTo(navigation, 'SETTINGS', {
                paramsLinkAddCard: {
                    addCard: CREDIT_CARDS_TAB,
                },
            })
        } else if (source === 'slika') {
            goTo(navigation, 'SETTINGS', {
                paramsLinkAddCard: {
                    addCard: CLEARING_ACCOUNTS_TAB,
                },
            })
        }
    }

    render() {
        const {token, t, currentCompanyId, accounts, user, isRtl, openedBottomSheet} = this.props
        const {
            isValid,
        } = this.state
        if (!token) {
            return null
        }
        // console.log('openedBottomSheet======', openedBottomSheet)
        const currentCompany = this.currentCompany
        const {
            showAlert,
            showPopUp,
            showWebView,
            billingAccountId,
            getTokenShow,
            statusToken,
            switchCompany,
            timeoutBackRealData,
            statusTokenFinished,
            addAccountModalIsOpen,
            activated,
            activatedModalIsOpen,
            mail,
            emailExists,
            mailValid,
            mailIsHebrew,
            passwordValid,
            password,
            secureTextEntry,
            inProgress,
            stepMail,
            errPass,
            alertTokens,
        } = this.state
        // //console.log('getTokenShow======', getTokenShow)
        // console.log('state======', showAlert, showPopUp, showWebView, billingAccountId, getTokenShow, statusToken, switchCompany, timeoutBackRealData, statusTokenFinished, addAccountModalIsOpen, activated, activatedModalIsOpen, mail, emailExists, mailValid, mailIsHebrew, passwordValid, password, secureTextEntry, inProgress, stepMail, errPass)

        return (
            <Fragment>
                {showWebView && (
                    <Modal
                        isOpen
                        title={'תהליך רכישה'}
                        onLeftPress={this.showWebView}
                        leftText={'יציאה'}
                    >
                        <WebView
                            source={{uri: showWebView}}
                            style={{
                                position: 'absolute',
                                height: '100%',
                                width: '100%',
                                bottom: 0,
                                top: 0,
                                left: 0,
                                right: 0,
                            }}
                        />
                    </Modal>
                )}

                {showAlert && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        left: 0,
                        height: 46.5,
                        width: '100%',
                        zIndex: !openedBottomSheet ? 999 : 1,
                        elevation: !openedBottomSheet ? 2 : 0,
                        shadowColor: '#eeeeee',
                        shadowOpacity: 0.8,
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                    }}>
                        {(billingAccountId ===
                            '00000000-0000-0000-0000-000000000000') && (
                            <LinearGradient
                                locations={[0, 0.2, 1]}
                                colors={['#e8e3c3', '#f9f3cf', '#f9f3cf']}
                                style={{
                                    height: 46.5,
                                    flexDirection: 'row-reverse',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    width: '100%',
                                }}>
                                <View style={{
                                    flexDirection: 'row-reverse',
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 10,
                                    flex: 1,
                                }}>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        alignItems: 'center',
                                    }}>
                                        <Text style={{
                                            color: '#000000',
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(16),
                                        }}>{'נותרו עוד'}</Text>
                                        <View style={commonStyles.spaceDivider}/>

                                        <Text style={{
                                            color: '#000000',
                                            fontFamily: fonts.bold,
                                            fontSize: sp(21),
                                        }}>{currentCompany.daysLeftTillExpire}</Text>
                                        <View style={commonStyles.spaceDivider}/>

                                        <Text style={{
                                            color: '#000000',
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(16),
                                        }}>{'ימים לתום תקופת הניסיון'}</Text>
                                        <View style={commonStyles.spaceDivider}/>

                                        <TouchableOpacity
                                            onPress={this.buyPack}>
                                            <Text style={{
                                                color: '#000000',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(16),
                                                textDecorationLine: 'underline',
                                                textDecorationStyle: 'solid',
                                                textDecorationColor: '#000000',
                                            }}>{'לרכישת חבילה'}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    <TouchableOpacity
                                        onPress={this.handleCloseAlert}>
                                        <Icon
                                            name="close"
                                            type="material-community"
                                            size={25}
                                            color={'#022258'}
                                        />
                                    </TouchableOpacity>
                                </View>

                            </LinearGradient>
                        )}
                        {(billingAccountId !==
                            '00000000-0000-0000-0000-000000000000') && (
                            <View
                                style={{
                                    height: 46.5,
                                    flexDirection: 'row-reverse',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    width: '100%',
                                    backgroundColor: colors.red7,
                                }}>
                                <View style={{
                                    flexDirection: 'row-reverse',
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 10,
                                    flex: 1,
                                }}>
                                    <View style={{
                                        paddingHorizontal: 30,
                                    }}>
                                        <Text style={{
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(16),
                                            textAlign: 'center',
                                        }}>
                                            {'החיוב החודשי נכשל. יש להסדיר את התשלום'}
                                        </Text>

                                        <View style={{
                                            flexDirection: 'row-reverse',
                                            alignItems: 'center',
                                        }}>
                                            <TouchableOpacity
                                                onPress={this.buyPack}>
                                                <Text style={{
                                                    color: '#ffffff',
                                                    fontFamily: fonts.semiBold,
                                                    fontSize: sp(16),
                                                    textAlign: 'center',
                                                    textDecorationLine: 'underline',
                                                    textDecorationStyle: 'solid',
                                                    textDecorationColor: '#ffffff',
                                                }}>{'במסך תשלומים'}</Text>
                                            </TouchableOpacity>
                                            <View style={commonStyles.spaceDivider}/>
                                            <Text style={{
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(16),
                                                textAlign: 'center',
                                            }}>{'או דרך מוקד השירות 2365*'}</Text>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={this.handleCloseAlert}>
                                        <Icon
                                            name="close"
                                            type="material-community"
                                            size={25}
                                            color={'#ffffff'}
                                        />
                                    </TouchableOpacity>
                                </View>

                            </View>
                        )}
                    </View>
                )}

                {showPopUp && (
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        left: 0,
                        top: 0,
                        zIndex: !openedBottomSheet ? 1001 : 1,
                        elevation: !openedBottomSheet ? 3 : 0,
                        height: '100%',
                        width: '100%',
                        flexDirection: 'row',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                    }}>

                        <View style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 1000,
                            opacity: 0.9,
                            backgroundColor: '#585858',
                            height: '100%',
                            width: '100%',
                            flex: 1,
                        }}/>

                        <View style={{
                            zIndex: 1001,
                            position: 'absolute',
                            right: 10,
                            left: 10,
                            top: 70,
                            height: 194,
                            backgroundColor: '#ffffff',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>

                            {currentCompany.daysLeftTillExpire > 0 &&
                                billingAccountId ===
                                '00000000-0000-0000-0000-000000000000' && (
                                    <TouchableOpacity
                                        style={{
                                            marginTop: 16,
                                            marginBottom: 27,
                                            marginLeft: 10,
                                            alignSelf: 'flex-start',
                                        }}
                                        onPress={this.handleClosePopUp}>
                                        <Icon
                                            name="close"
                                            type="material-community"
                                            size={25}
                                            color={'#022258'}
                                        />
                                    </TouchableOpacity>
                                )}

                            {currentCompany.daysLeftTillExpire > 0 &&
                                billingAccountId ===
                                '00000000-0000-0000-0000-000000000000' && (
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        height: 53,
                                        width: '100%',
                                        backgroundColor: '#dde7f1',
                                    }}>

                                        <Text style={{
                                            color: '#022258',
                                            fontFamily: fonts.bold,
                                            fontSize: sp(19.5),
                                        }}>{'נותרו עוד'}</Text>
                                        <View style={commonStyles.spaceDivider}/>

                                        <Text style={{
                                            color: '#022258',
                                            fontFamily: fonts.bold,
                                            fontSize: sp(25),
                                        }}>{currentCompany.daysLeftTillExpire}</Text>
                                        <View style={commonStyles.spaceDivider}/>

                                        <Text style={{
                                            color: '#022258',
                                            fontFamily: fonts.bold,
                                            fontSize: sp(19.5),
                                        }}>{'ימים לתום תקופת הניסיון'}</Text>
                                    </View>
                                )}

                            {currentCompany.daysLeftTillExpire > 0 &&
                                billingAccountId ===
                                '00000000-0000-0000-0000-000000000000' && (
                                    <TouchableOpacity style={[
                                        {
                                            backgroundColor: '#022258',
                                            borderRadius: 15,
                                            marginTop: 28,
                                            height: 30,
                                            width: 142.5,
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                        }]} onPress={this.buyPack}>
                                        <Text style={{
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(15),
                                        }}>{'לרכישת חבילה'}</Text>
                                    </TouchableOpacity>
                                )}

                            {currentCompany.daysLeftTillExpire === 0 && (
                                <View style={{
                                    flexDirection: 'row-reverse',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: 53,
                                    marginTop: 28,
                                    width: '100%',
                                    backgroundColor: '#dde7f1',
                                }}>

                                    <Text style={{
                                        color: '#022258',
                                        fontFamily: fonts.bold,
                                        fontSize: sp(15),
                                    }}>
                                        {(billingAccountId ===
                                            '00000000-0000-0000-0000-000000000000')
                                            ? 'לצערנו עדיין לא השלמת את תהליך הרכישה של bizibox'
                                            : 'המערכת נחסמה לשימוש. אנא הסדירו את התשלום'}
                                    </Text>
                                </View>
                            )}

                            {currentCompany.daysLeftTillExpire === 0 && (
                                <View style={{
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    marginTop: 28,
                                }}>
                                    <Text style={{
                                        color: '#022258',
                                        fontFamily: fonts.regular,
                                        fontSize: sp(16),
                                    }}>
                                        {'ניתן לפנות למוקד השירות שלנו:'}
                                    </Text>
                                    <Text style={{
                                        color: '#022258',
                                        fontFamily: fonts.regular,
                                        fontSize: sp(16),
                                    }}>
                                        {'03-5610382 או 2365*'}
                                    </Text>
                                    <TouchableOpacity
                                        onPress={this.buyPack}>
                                        <Text style={{
                                            color: '#038ed6',
                                            fontFamily: fonts.regular,
                                            fontSize: sp(16),
                                            textDecorationLine: 'underline',
                                            textDecorationStyle: 'solid',
                                            textDecorationColor: '#038ed6',
                                        }}>
                                            {(billingAccountId ===
                                                '00000000-0000-0000-0000-000000000000')
                                                ? 'למעבר לתהליך הרכישה'
                                                : 'הסדרת תשלום'}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                        </View>
                    </View>
                )}

                {getTokenShow && (
                    (getTokenShow === 'example') ||
                    (getTokenShow === 'temp' && statusToken !== null) ||
                    (getTokenShow === 'updateToken' && statusToken !== null)
                ) && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        left: 0,
                        height: 46.5,
                        width: '100%',
                        shadowColor: '#eeeeee',
                        shadowOpacity: 0.8,
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                        zIndex: !openedBottomSheet ? 9999 : 9999,
                        elevation: !openedBottomSheet ? 2 : 2,
                    }}>
                        {(getTokenShow === 'example') && (
                            <LinearGradient
                                locations={[0, 0.2, 1]}
                                colors={['#e8e3c3', '#f9f3cf', '#f9f3cf']}
                                style={{
                                    height: 46.5,
                                    flexDirection: 'row-reverse',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    width: '100%',
                                }}>
                                <View style={{
                                    flexDirection: 'row-reverse',
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    justifyContent: 'space-between',
                                    paddingHorizontal: 10,
                                    flex: 1,
                                }}>
                                    <View>
                                        <Text style={{
                                            color: '#000000',
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(12.5),
                                        }}>{'הפרטים המוצגים הם להדגמה בלבד, על מנת להציג את נתוני העסק'}
                                        </Text>
                                        <View style={{
                                            flexDirection: 'row-reverse',
                                            alignItems: 'center',
                                        }}>
                                            <Text style={{
                                                color: '#000000',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(IS_IOS ? 13.5 : 12.5),
                                            }}>{'האמיתיים של עסקך אנא'}</Text>
                                            <View style={commonStyles.spaceDivider}/>

                                            <TouchableOpacity
                                                onPress={this.setTokenBank}>
                                                <Text style={{
                                                    color: '#000000',
                                                    fontFamily: fonts.semiBold,
                                                    fontSize: sp(
                                                        IS_IOS ? 13.5 : 12.5),
                                                    textDecorationLine: 'underline',
                                                    textDecorationStyle: 'solid',
                                                    textDecorationColor: '#000000',
                                                }}>{'הגדירו את פרטי חשבון'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <TouchableOpacity
                                        onPress={this.handleCloseAlertToken}>
                                        <Icon
                                            name="close"
                                            type="material-community"
                                            size={25}
                                            color={'#022258'}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </LinearGradient>
                        )}

                        {((getTokenShow === 'temp' && statusToken !== null) &&
                                ((statusToken === 0 && statusTokenFinished) ||
                                    (statusToken !== 0 && !statusTokenFinished))) &&
                            (<View
                                    style={{
                                        height: 46.5,
                                        flexDirection: 'row-reverse',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        width: '100%',
                                        backgroundColor: '#73b573',
                                    }}>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        alignSelf: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        justifyContent: 'space-between',
                                        paddingHorizontal: 10,
                                        flex: 1,
                                    }}>
                                        <View>{this.getStatusView}</View>
                                        <TouchableOpacity
                                            onPress={this.handleCloseAlertToken}>
                                            <Icon name="close" type="material-community"
                                                  size={25} color={'#022258'}/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}

                        {(getTokenShow === 'updateToken' && statusToken !== null) &&
                            (
                                <View
                                    style={{
                                        height: 46.5,
                                        flexDirection: 'row-reverse',
                                        alignSelf: 'center',
                                        justifyContent: statusToken ===
                                        BANK_TOKEN_STATUS.TECHNICAL_PROBLEM ||
                                        statusToken ===
                                        BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS
                                            ? 'flex-start'
                                            : 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        width: '100%',
                                        backgroundColor: '#73b573',
                                        paddingHorizontal: 10,
                                    }}>
                                    <View>
                                        {this.getStatusView}
                                    </View>

                                    {(!isValid) && (
                                        <TouchableOpacity
                                            style={{
                                                position: 'absolute',
                                                right: 7,
                                                top: 10.75,
                                                zIndex: 9999,
                                            }}
                                            onPress={this.handleCloseAlertToken}>
                                            <Icon
                                                name="close"
                                                type="material-community"
                                                size={25}
                                                color={'#022258'}
                                            />
                                        </TouchableOpacity>
                                    )}

                                </View>
                            )}
                    </View>
                )}

                {switchCompany && (
                    <View style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        left: 0,
                        top: 0,
                        zIndex: !openedBottomSheet ? 9999 : 9999,
                        elevation: !openedBottomSheet ? 2 : 2,
                        height: '100%',
                        width: '100%',
                        flexDirection: 'row',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                    }}>

                        <View style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 99,
                            opacity: 0.9,
                            backgroundColor: '#585858',
                            height: '100%',
                            width: '100%',
                            flex: 1,
                        }}/>

                        <View style={{
                            zIndex: 999,
                            position: 'absolute',
                            right: 10,
                            left: 10,
                            top: 70,
                            height: 194,
                            backgroundColor: '#ffffff',
                        }}>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    right: 10,
                                    top: 10,
                                    zIndex: 9,
                                }}
                                onPress={this.handleClosePopUpSwitchCompany}>
                                <Icon
                                    name="close"
                                    type="material-community"
                                    size={25}
                                    color={'#022258'}
                                />
                            </TouchableOpacity>

                            <Text style={{
                                marginTop: 20,
                                color: '#59b1af',
                                fontFamily: fonts.regular,
                                fontSize: sp(25),
                                width: '100%',
                                textAlign: 'center',
                                paddingVertical: 10,
                            }}>{'החלפת נתונים לנתוני אמת'}</Text>

                            <Text style={{
                                color: '#0f3860',
                                fontFamily: fonts.regular,
                                fontSize: sp(15),
                                width: '100%',
                                textAlign: 'center',
                                paddingVertical: 2,
                            }}>{'בחרתם להחליף את נתוני החברה לדוגמה בנתוני הבנק שלכם.'}</Text>

                            <Text style={{
                                color: '#0f3860',
                                fontFamily: fonts.semiBold,
                                fontSize: sp(15),
                                width: '100%',
                                textAlign: 'center',
                                paddingVertical: 2,
                            }}>{'השינוי יחול בעוד -'}</Text>

                            <Text style={{
                                color: '#0f3860',
                                fontFamily: fonts.semiBold,
                                fontSize: sp(22.5),
                                width: '100%',
                                textAlign: 'center',
                                paddingVertical: 2,
                            }}>{timeoutBackRealData}</Text>

                            <View style={{
                                flexDirection: 'row-reverse',
                                alignItems: 'center',
                                marginTop: 10,
                                paddingHorizontal: 20,
                                justifyContent: 'space-between',
                            }}>
                                <TouchableOpacity
                                    onPress={this.handleClosePopUpSwitchCompany}>
                                    <Text style={{
                                        color: '#337dba',
                                        fontFamily: fonts.regular,
                                        fontSize: sp(13.5),
                                    }}>
                                        {'להישאר עם חברה לדוגמה'}
                                    </Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={[
                                    {
                                        backgroundColor: '#022258',
                                        borderRadius: 15,
                                        height: 29,
                                        width: 115,
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }]} onPress={this.switchCompanyNow}>
                                    <Text style={{
                                        color: '#ffffff',
                                        fontFamily: fonts.semiBold,
                                        fontSize: sp(15),
                                    }}>{'להחליף עכשיו'}</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </View>
                )}

                {(!showAlert && !(getTokenShow && (
                        (getTokenShow === 'example') ||
                        (getTokenShow === 'temp' && statusToken !== null) ||
                        (getTokenShow === 'updateToken' && statusToken !== null)
                    )) && !switchCompany) &&
                    (ALERTS_TRIAL.alertTokens && alertTokens && alertTokens.length >
                        0) && (
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            left: 0,
                            height: alertTokens.length === 1 ? 46.5 : 'auto',
                            minHeight: 46.5,
                            width: '100%',
                            shadowColor: '#eeeeee',
                            shadowOpacity: 0.8,
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            zIndex: !openedBottomSheet ? 9999 : 9999,
                            elevation: !openedBottomSheet ? 2 : 2,
                            flexDirection: 'row-reverse',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            backgroundColor: '#e52b2b',
                            paddingHorizontal: 10,
                        }}>
                            <View style={{
                                maxWidth: '85%',
                                flexDirection: 'row-reverse',
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                flexWrap: 'wrap',
                                paddingVertical: 10,
                            }}>
                                <Text style={{
                                    color: colors.white,
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(18),
                                }}>{'סיסמתך ל'}</Text>
                                {alertTokens.map((tokenAl, _id) => (
                                    <TouchableOpacity
                                        style={{
                                            flexDirection: 'row-reverse',
                                        }}
                                        key={tokenAl + _id}
                                        onPress={this.goToSettings(tokenAl.source)}>
                                        <Text style={{
                                            color: colors.white,
                                            fontFamily: fonts.bold,
                                            fontSize: sp(18),
                                            textDecorationLine: 'underline',
                                            textDecorationStyle: 'solid',
                                            textDecorationColor: colors.white,
                                        }}>
                                            {tokenAl.tokenNickname}
                                        </Text>
                                        {(alertTokens.length > 1 &&
                                            (_id + 1 !== alertTokens.length)) && (
                                            <Text style={{
                                                color: colors.white,
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(18),
                                            }}>{', '}</Text>
                                        )}
                                    </TouchableOpacity>
                                ))}
                                <Text style={{
                                    color: colors.white,
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(18),
                                }}>{' שגויה או פגה'}</Text>
                            </View>

                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    right: 7,
                                    top: 10.75,
                                    zIndex: 9999,
                                }}
                                onPress={this.handleCloseTokenAlert}>
                                <Icon
                                    name="close"
                                    type="material-community"
                                    size={25}
                                    color={'#ffffff'}
                                />
                            </TouchableOpacity>
                        </View>
                    )}

                {(activated && !(ALERTS_TRIAL.alertTokens && alertTokens &&
                    alertTokens.length > 0)) && (
                    <View style={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        left: 0,
                        height: 46.5,
                        width: '100%',
                        zIndex: !openedBottomSheet ? 9999 : 9999,
                        elevation: !openedBottomSheet ? 2 : 2,
                        shadowColor: '#eeeeee',
                        shadowOpacity: 0.8,
                        shadowOffset: {
                            width: 0,
                            height: 2,
                        },
                    }}>
                        <LinearGradient
                            locations={[0, 0.2, 1]}
                            colors={['#e8e3c3', '#f9f3cf', '#f9f3cf']}
                            style={{
                                height: 46.5,
                                flexDirection: 'row-reverse',
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                width: '100%',
                            }}>
                            <View style={{
                                flexDirection: 'row-reverse',
                                alignSelf: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'space-between',
                                paddingHorizontal: 10,
                                flex: 1,
                            }}>
                                <View style={{
                                    // flexDirection: 'row-reverse',
                                    alignItems: 'flex-end',
                                    flex: 80,
                                }}>
                                    <Text
                                        numberOfLines={2}
                                        style={{
                                            color: '#000000',
                                            fontFamily: IS_IOS
                                                ? fonts.semiBold
                                                : fonts.regular,
                                            fontSize: sp(12.5),
                                            textAlign: 'right',
                                        }}>
                                        <Text style={{
                                            color: '#000000',
                                            fontFamily: IS_IOS
                                                ? fonts.semiBold
                                                : fonts.regular,
                                            fontSize: sp(12.5),
                                            textAlign: 'right',
                                        }}>
                                            {`היי ${user.userName}, על מנת שנוכל לשלוח לכם בבטחה מידע פיננסי יש לאמת את כתובת המייל איתה נרשמתם למערכת. `}
                                        </Text>
                                        <Text>{' '}</Text>
                                        <Text onPress={this.activated}
                                              style={{
                                                  color: colors.blue41,
                                                  fontFamily: IS_IOS
                                                      ? fonts.semiBold
                                                      : fonts.regular,
                                                  fontSize: sp(12.5),
                                                  textDecorationLine: 'underline',
                                                  textDecorationStyle: 'solid',
                                                  textDecorationColor: colors.blue41,
                                              }}>{'שליחת מייל'}</Text>
                                    </Text>
                                </View>

                                <TouchableOpacity
                                    style={{
                                        flex: 5,
                                    }}
                                    onPress={this.handleCloseAlertActivated}>
                                    <Icon
                                        name="close"
                                        type="material-community"
                                        size={25}
                                        color={'#022258'}
                                    />
                                </TouchableOpacity>
                            </View>

                        </LinearGradient>
                    </View>
                )}

                {activatedModalIsOpen && (
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
                                {stepMail === 1 && (
                                    <View><Text>{'    '}</Text></View>
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
                                        {stepMail === 1
                                            ? 'מייל האימות נשלח בהצלחה'
                                            : 'החלפת מייל'}
                                    </Text>
                                </View>
                                {stepMail !== 3 && (
                                    <View>
                                        <TouchableOpacity
                                            activeOpacity={(stepMail === 2 &&
                                                (inProgress || !(
                                                    mailValid && passwordValid &&
                                                    !emailExists && password.length > 0 &&
                                                    mail.length > 0
                                                ))) ? 1 : 0.2}
                                            onPress={stepMail === 1
                                                ? this.activatedModalClose
                                                : this.handleUpdateMail}>
                                            <Text style={{
                                                opacity: (stepMail === 2 &&
                                                    (inProgress || !(
                                                        mailValid && passwordValid &&
                                                        !emailExists && password.length >
                                                        0 && mail.length > 0
                                                    ))) ? 0.5 : 1,
                                                fontSize: sp(16),
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                            }}>{stepMail === 1
                                                ? 'ביטול'
                                                : 'עדכון'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>

                            <KeyboardAwareScrollView
                                enableOnAndroid={true}
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
                                    paddingLeft: 5,
                                    paddingRight: 5,
                                    flex: 1,
                                }}>

                                {(stepMail === 1) && (
                                    <View>
                                        <Icon
                                            name="check"
                                            type="material-community"
                                            size={60}
                                            color={'#64b6e6'}
                                        />
                                        <Text style={[
                                            {
                                                color: '#123860',
                                                fontSize: sp(18.5),
                                                textAlign: 'center',
                                                fontFamily: fonts.semiBold,
                                            }]}>
                                            {'מייל אימות נשלחה לכתובת'} {activatedModalIsOpen}{'.'}
                                        </Text>
                                        <Text
                                            numberOfLines={2}
                                            style={[
                                                {
                                                    color: '#123860',
                                                    fontSize: sp(18.5),
                                                    textAlign: 'center',
                                                    fontFamily: fonts.semiBold,
                                                }]}>
                                            {'לחצו על הלינק המצורף על מנת לסיים'}
                                            {'\n'}
                                            {'את תהליך האימות.'}
                                        </Text>

                                        <View style={{
                                            flex: 1,
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                            alignContent: 'flex-end',
                                            justifyContent: 'center',
                                        }}>
                                            <Text
                                                numberOfLines={1}
                                                style={[
                                                    {
                                                        color: '#123860',
                                                        fontSize: sp(18),
                                                        textAlign: 'center',
                                                        fontFamily: fonts.regular,
                                                    }]}>
                                                {'במידה ונפלה טעות בכתובת המייל'}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={this.handleUpdateMail}>
                                                <Text style={{
                                                    color: colors.blue30,
                                                    fontSize: sp(18),
                                                    textAlign: 'center',
                                                    fontFamily: fonts.regular,
                                                }}>{'אנא עדכנו את כתובתכם'}</Text>
                                            </TouchableOpacity>

                                        </View>

                                    </View>
                                )}
                                {(stepMail === 2) && (
                                    <View>
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
                                        <View style={{
                                            width: '100%',
                                            marginVertical: 5,
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <TextInput
                                                onEndEditing={this.handleUpdateFieldValid(
                                                    'mailValid')}
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
                                                        width: 280,
                                                        borderBottomColor: (emailExists ||
                                                            !mailValid)
                                                            ? colors.red2
                                                            : colors.blue3,
                                                        borderBottomWidth: 2,
                                                        fontFamily: fonts.semiBold,
                                                        fontWeight: 'normal',
                                                        color: colors.blue29,
                                                        textAlign: (!mail ||
                                                            (mail && mail.length === 0))
                                                            ? 'right'
                                                            : 'left',
                                                        height: 50,
                                                        fontSize: sp(17),
                                                        backgroundColor: 'transparent',
                                                    },
                                                ]}
                                                onSubmitEditing={this.handleUpdateMail}
                                                onChangeText={this.handleUpdateField(
                                                    'mail')}
                                                value={mail}
                                            />
                                        </View>
                                        <View style={{
                                            width: '100%',
                                            marginVertical: 0,
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            {(emailExists === true) && (
                                                <Fragment>
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
                                                            {'כתובת מייל זו כבר משוייכת למשתמש קיים'}
                                                        </Text>
                                                    </View>
                                                    <TouchableOpacity>
                                                        <Text
                                                            style={[
                                                                {
                                                                    color: colors.blue30,
                                                                    fontSize: sp(14),
                                                                    textAlign: 'center',
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
                                            width: 280,
                                            marginVertical: 5,
                                            alignSelf: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                        }}>

                                            <TextInput
                                                placeholder={'סיסמה'}
                                                placeholderTextColor="#202020"
                                                underlineColorAndroid="transparent"
                                                secureTextEntry={!secureTextEntry}
                                                style={[
                                                    styles.input,
                                                    {
                                                        width: 280,
                                                        borderBottomColor: (!passwordValid ||
                                                            errPass)
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
                                                    this.handleUpdateFieldValid(
                                                        'passwordValid')(e)
                                                }}
                                                onBlur={this.handleUpdateFieldValid(
                                                    'passwordValid')}
                                                onChangeText={this.handleUpdateField(
                                                    'password')}
                                                value={password}
                                                onSubmitEditing={this.handleUpdateMail}
                                            />

                                            <TouchableOpacity style={{
                                                position: 'absolute',
                                                backgroundColor: 'transparent',
                                                height: '100%',
                                                left: 0,
                                                top: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                                              onPress={this.handleTogglePasswordVisibility}>
                                                {this.state.secureTextEntry
                                                    ? <Icons name="eye-outline"
                                                             size={19}
                                                             color={colors.blue29}/>
                                                    : <Icons name="eye-off-outline"
                                                             size={19}
                                                             color={colors.blue29}/>}
                                            </TouchableOpacity>
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
                )}

                {addAccountModalIsOpen && (
                    <AddTokenModal
                        navigation={this.props.navigation}
                        title={t('settings:bankAccountsTab:addBankAccount')}
                        tokenType={'ACCOUNT'}
                        accounts={accounts}
                        idCompany={this.state.idCompany}
                        companyId={currentCompanyId}
                        onClose={this.handleToggleAddAccountModal}
                    />
                )}
            </Fragment>
        )
    }
}
