import React, {Fragment, PureComponent} from 'react'
import {
    ActionSheetIOS,
    Alert,
    Animated,
    AppState,
    Dimensions,
    Image,
    Linking,
    Modal,
    ScrollView,
    StatusBar,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    SafeAreaView,

} from 'react-native';
// import {SafeAreaView} from 'react-native-safe-area-context';
import {Picker} from '@react-native-picker/picker';
import {connect} from 'react-redux'
import {DrawerActions} from '@react-navigation/native'
import 'react-native-gesture-handler'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import CustomIcon from 'src/components/Icons/Fontello'
import {Button, CheckBox, Divider, Icon} from 'react-native-elements'
import DropdownPanel from './DropdownPanel'
import {withTranslation} from 'react-i18next'
import {combineStyles as cs, goTo, sp} from 'src/utils/func'

import {
    ARCHIVES,
    BANK_ACCOUNTS,
    BANK_MATCH,
    BUDGET,
    CASH_FLOW,
    CHECKS,
    CREDIT_CARD,
    CYCLIC_TRANS,
    GOT_ABSORBED,
    HELP,
    LANDING,
    LOGIN,
    MUTAVIM,
    OVERVIEW,
    PACKAGES,
    SETTINGS,
    SIGNUP,
    SLIKA,
    UPLOADING_DOCUMENTS,
    WAITING_ABSORBED,
} from 'src/constants/navigation'
import {getCompanies, selectCompany} from 'src/redux/actions/company'
import {logout} from 'src/redux/actions/auth'
import styles from './DrawerStyles'
import commonStyles from 'src/styles/styles'
import {colors, fonts} from 'src/styles/vars'
import {IS_IOS, USER_SCREENS} from 'src/constants/common'
import {getAccounts} from '../../redux/actions/account'
// import VersionCheck from 'react-native-version-check'
import DeviceInfo from 'react-native-device-info'
import {ALERTS_TRIAL, COMPANY_INFO, IS_LIGHT, ReCaptchaV3Var} from '../../constants/config'
import {
    activateUserApi,
    approveUpgradeApi,
    createApiTokenApi,
    getVersionApi,
    hideTaryaPopupApi,
    oneAccountPopUpApi,
    updateAgreementCompaniesConfirmationApi,
    updateAgreementConfirmationApi,
    usersActivityApi,
} from '../../api'
import messaging from '@react-native-firebase/messaging'
import Toast from 'react-native-root-toast';
import AppTimezone from '../../utils/appTimezone'
import {setGlobalParams, setMutavimScreenBottomSheetTimes, setTaryePopupTimes} from '../../redux/actions/user'
import {BANK_ACCOUNTS_TAB, CREDIT_CARDS_TAB, PAYMENTS_TO_BIZIBOX_TAB} from '../../constants/settings'
import BottomSheetBudgetNav from '../BottomSheetMutavim/BottomSheetBudgetNav'
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RNLocalize from 'react-native-localize'
import ReCaptchaV3 from '@haskkor/react-native-recaptchav3'

export const BUNDLE_ID = DeviceInfo.getBundleId()
export const VERSION = DeviceInfo.getVersion()
export const IS_DEV = BUNDLE_ID.endsWith('dev')
const notificationsIfHasPermissionButtonAlert = () =>
    Alert.alert(
        'בקשת הרשאת גישה לשליחת התראות',
        'לצורך שליחת התראות אנו צריכים הרשאה, לאישור ההרשאה עברו למסך הגדרות',
        [
            {
                text: 'ביטול',
                onPress: () => console.log('Cancel Pressed'),
                style: 'cancel',
            },
            {
                text: 'עברו להגדרות',
                onPress: () => {
                    if (IS_IOS) {
                        Linking.openURL('app-settings://')
                    } else {
                        Linking.openSettings();
                    }
                },
            },
        ],
        {cancelable: false},
    );
@connect(state => ({
    token: state.token,
    user: state.user,
    isRtl: state.isRtl,
    companies: state.companies,
    currentCompanyId: state.currentCompanyId,
    taryePopupTimes: state.taryePopupTimes,
    mutavimPopupTimes: state.mutavimPopupTimes,
    globalParams: state.globalParams,
}))
@withTranslation()
export default class Drawer extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            showModalAgreementOcrPilot2: false,
            showModalAgreementMETZALEM2: false,
            showModalAgreement: 1,
            appAgreementConfirmation: false,
            sendMarketingInformation: false,
            changeCompany: false,
            companiesList: [],
            alertState: false,
            currentOpenMenuIndex: 0,
            openAccListAndroid: false,
            appState: AppState.currentState,
            appStateBgTime: null,
            companyIdSelected: null,
            dontShowAgain: false,
            fadeAnimBiziboxTrialExpired: new Animated.Value(1),
            showLastRowPopup: false,
            showtrialBlocked: false,
            badgetPopup: false,
            showOneAccount: null,
        }
    }

    get menu() {
        const {t} = this.props
        // const isAccountant = user.accountant

        console.log('this.props.globalParams.ocrPilot', this.props.globalParams.ocrPilot)
        const isOcrPilot = this.props.globalParams.ocrPilot !== undefined && (this.props.globalParams.ocrPilot === 1 || this.props.globalParams.ocrPilot === 3)
        if (isOcrPilot) {
            if (this.props.globalParams.ocrPilot === 1) {
                return [
                    {
                        title: t('mainMenu:documentManagement'),
                        icon: 'uploading-documents',
                        children: [
                            {
                                title: t('mainMenu:uploadingDocuments'),
                                name: UPLOADING_DOCUMENTS,
                            },
                            {
                                title: t('mainMenu:archives'),
                                name: ARCHIVES,
                            },
                            {
                                title: t('mainMenu:GOT_ABSORBED'),
                                name: GOT_ABSORBED,
                            },
                            {
                                title: t('mainMenu:WAITING_ABSORBED'),
                                name: WAITING_ABSORBED,
                            },
                        ],
                    },
                    {
                        title: t('mainMenu:budget'),
                        icon: 'bag',
                        name: LANDING,
                        notActive: true,
                    },
                    {
                        title: t('mainMenu:cashFlow'),
                        icon: 'cash',
                        name: LANDING,
                        notActive: true,
                    },
                ]
            }
            if (this.props.globalParams.ocrPilot === 3) {
                return [
                    {
                        title: t('mainMenu:documentManagement'),
                        icon: 'uploading-documents',
                        children: [
                            {
                                title: t('mainMenu:uploadingDocuments'),
                                name: UPLOADING_DOCUMENTS,
                            },
                            {
                                title: t('mainMenu:archives'),
                                name: ARCHIVES,
                            },
                            {
                                title: t('mainMenu:GOT_ABSORBED'),
                                name: GOT_ABSORBED,
                            },
                            {
                                title: t('mainMenu:WAITING_ABSORBED'),
                                name: WAITING_ABSORBED,
                            },
                        ],
                    },
                ]
            }
        }

        if (!IS_LIGHT.light) {
            return (IS_DEV)
                ? (this.props.globalParams.ocrPilot !== 2
                    ? [
                        {
                            title: t('mainMenu:overview'),
                            icon: 'desktop',
                            name: OVERVIEW,
                        },
                        {
                            title: t('mainMenu:financialManagement'),
                            icon: 'graph-up',
                            children: [
                                {
                                    title: t('mainMenu:bankAccount'),
                                    name: BANK_ACCOUNTS,
                                },
                                {
                                    title: t('mainMenu:creditCard'),
                                    name: CREDIT_CARD,
                                },
                                {
                                    title: t('mainMenu:checks'),
                                    name: CHECKS,
                                },
                                {
                                    title: t('mainMenu:slika'),
                                    name: SLIKA,
                                },
                                {
                                    title: t('mainMenu:mutavim'),
                                    name: MUTAVIM,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:cashFlow'),
                            icon: 'cash',
                            children: [
                                {
                                    title: t('mainMenu:daily'),
                                    name: CASH_FLOW,
                                },
                                {
                                    title: t('mainMenu:bankMatch'),
                                    name: BANK_MATCH,
                                },
                                {
                                    title: t('mainMenu:cyclicTrans'),
                                    name: CYCLIC_TRANS,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:budget'),
                            icon: 'bag',
                            name: BUDGET,
                            notActive: COMPANY_INFO.budgetPopUpType &&
                                (COMPANY_INFO.budgetPopUpType === 2 ||
                                    COMPANY_INFO.budgetPopUpType === 3),
                        },
                        {
                            title: t('common:recommendation'),
                            icon: 'RECOMMENDATION',
                            name: 'RECOMMENDATION',
                        },
                        {
                            title: t('mainMenu:help'),
                            icon: 'HELP',
                            name: HELP,
                        },
                        {
                            title: t('common:settings'),
                            icon: 'gear',
                            name: SETTINGS,
                        },
                    ] :
                    [
                        {
                            title: t('mainMenu:overview'),
                            icon: 'desktop',
                            name: OVERVIEW,
                        },
                        {
                            title: t('mainMenu:financialManagement'),
                            icon: 'graph-up',
                            children: [
                                {
                                    title: t('mainMenu:bankAccount'),
                                    name: BANK_ACCOUNTS,
                                },
                                {
                                    title: t('mainMenu:creditCard'),
                                    name: CREDIT_CARD,
                                },
                                {
                                    title: t('mainMenu:checks'),
                                    name: CHECKS,
                                },
                                {
                                    title: t('mainMenu:slika'),
                                    name: SLIKA,
                                },
                                {
                                    title: t('mainMenu:mutavim'),
                                    name: MUTAVIM,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:cashFlow'),
                            icon: 'cash',
                            children: [
                                {
                                    title: t('mainMenu:daily'),
                                    name: CASH_FLOW,
                                },
                                {
                                    title: t('mainMenu:bankMatch'),
                                    name: BANK_MATCH,
                                },
                                {
                                    title: t('mainMenu:cyclicTrans'),
                                    name: CYCLIC_TRANS,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:budget'),
                            icon: 'bag',
                            name: BUDGET,
                            notActive: COMPANY_INFO.budgetPopUpType &&
                                (COMPANY_INFO.budgetPopUpType === 2 ||
                                    COMPANY_INFO.budgetPopUpType === 3),
                        },
                        {
                            title: t('common:recommendation'),
                            icon: 'RECOMMENDATION',
                            name: 'RECOMMENDATION',
                        },
                        {
                            title: t('mainMenu:documentManagement'),
                            icon: 'uploading-documents',
                            children: [
                                {
                                    title: t('mainMenu:uploadingDocuments'),
                                    name: UPLOADING_DOCUMENTS,
                                },
                                {
                                    title: t('mainMenu:archives'),
                                    name: ARCHIVES,
                                },
                                {
                                    title: t('mainMenu:GOT_ABSORBED'),
                                    name: GOT_ABSORBED,
                                },
                                {
                                    title: t('mainMenu:WAITING_ABSORBED'),
                                    name: WAITING_ABSORBED,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:help'),
                            icon: 'HELP',
                            name: HELP,
                        },
                        {
                            title: t('common:settings'),
                            icon: 'gear',
                            name: SETTINGS,
                        },
                    ])
                : (this.props.globalParams.ocrPilot !== 2
                    ? [
                        {
                            title: t('mainMenu:overview'),
                            icon: 'desktop',
                            name: OVERVIEW,
                        },
                        {
                            title: t('mainMenu:financialManagement'),
                            icon: 'graph-up',
                            children: [
                                {
                                    title: t('mainMenu:bankAccount'),
                                    name: BANK_ACCOUNTS,
                                },
                                {
                                    title: t('mainMenu:creditCard'),
                                    name: CREDIT_CARD,
                                },
                                {
                                    title: t('mainMenu:checks'),
                                    name: CHECKS,
                                },
                                {
                                    title: t('mainMenu:slika'),
                                    name: SLIKA,
                                },
                                {
                                    title: t('mainMenu:mutavim'),
                                    name: MUTAVIM,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:cashFlow'),
                            icon: 'cash',
                            children: [
                                {
                                    title: t('mainMenu:daily'),
                                    name: CASH_FLOW,
                                },
                                {
                                    title: t('mainMenu:bankMatch'),
                                    name: BANK_MATCH,
                                },
                                {
                                    title: t('mainMenu:cyclicTrans'),
                                    name: CYCLIC_TRANS,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:budget'),
                            icon: 'bag',
                            name: BUDGET,
                            notActive: COMPANY_INFO.budgetPopUpType &&
                                (COMPANY_INFO.budgetPopUpType === 2 ||
                                    COMPANY_INFO.budgetPopUpType === 3),
                        },
                        {
                            title: t('common:recommendation'),
                            icon: 'RECOMMENDATION',
                            name: 'RECOMMENDATION',
                        },
                        {
                            title: t('mainMenu:help'),
                            icon: 'HELP',
                            name: HELP,
                        },
                        {
                            title: t('common:settings'),
                            icon: 'gear',
                            name: SETTINGS,
                        },
                    ]
                    : [
                        {
                            title: t('mainMenu:overview'),
                            icon: 'desktop',
                            name: OVERVIEW,
                        },
                        {
                            title: t('mainMenu:financialManagement'),
                            icon: 'graph-up',
                            children: [
                                {
                                    title: t('mainMenu:bankAccount'),
                                    name: BANK_ACCOUNTS,
                                },
                                {
                                    title: t('mainMenu:creditCard'),
                                    name: CREDIT_CARD,
                                },
                                {
                                    title: t('mainMenu:checks'),
                                    name: CHECKS,
                                },
                                {
                                    title: t('mainMenu:slika'),
                                    name: SLIKA,
                                },
                                {
                                    title: t('mainMenu:mutavim'),
                                    name: MUTAVIM,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:cashFlow'),
                            icon: 'cash',
                            children: [
                                {
                                    title: t('mainMenu:daily'),
                                    name: CASH_FLOW,
                                },
                                {
                                    title: t('mainMenu:bankMatch'),
                                    name: BANK_MATCH,
                                },
                                {
                                    title: t('mainMenu:cyclicTrans'),
                                    name: CYCLIC_TRANS,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:budget'),
                            icon: 'bag',
                            name: BUDGET,
                            notActive: COMPANY_INFO.budgetPopUpType &&
                                (COMPANY_INFO.budgetPopUpType === 2 ||
                                    COMPANY_INFO.budgetPopUpType === 3),
                        },
                        {
                            title: t('common:recommendation'),
                            icon: 'RECOMMENDATION',
                            name: 'RECOMMENDATION',
                        },
                        {
                            title: t('mainMenu:documentManagement'),
                            icon: 'uploading-documents',
                            children: [
                                {
                                    title: t('mainMenu:uploadingDocuments'),
                                    name: UPLOADING_DOCUMENTS,
                                },
                                {
                                    title: t('mainMenu:archives'),
                                    name: ARCHIVES,
                                },
                                {
                                    title: t('mainMenu:GOT_ABSORBED'),
                                    name: GOT_ABSORBED,
                                },
                                {
                                    title: t('mainMenu:WAITING_ABSORBED'),
                                    name: WAITING_ABSORBED,
                                },
                            ],
                        },
                        {
                            title: t('mainMenu:help'),
                            icon: 'HELP',
                            name: HELP,
                        },
                        {
                            title: t('common:settings'),
                            icon: 'gear',
                            name: SETTINGS,
                        },
                    ])
        } else {
            return (this.props.globalParams.ocrPilot !== 2
                ? [
                    {
                        title: t('mainMenu:overview'),
                        icon: 'desktop',
                        name: OVERVIEW,
                    },
                    {
                        icon: 'graph-up',
                        title: t('mainMenu:bankAccount'),
                        name: BANK_ACCOUNTS,
                    },
                    {
                        icon: 'credit-card-charge',
                        title: t('mainMenu:creditCard'),
                        name: CREDIT_CARD,
                    },
                    {
                        icon: 'check',
                        title: t('mainMenu:checks'),
                        name: CHECKS,
                    },
                    {
                        icon: 'enter-card-alt',
                        title: t('mainMenu:slika'),
                        name: SLIKA,
                    },
                    {
                        icon: 'mutavimMenu',
                        title: t('mainMenu:mutavim'),
                        name: MUTAVIM,
                    },
                    {
                        title: t('mainMenu:budget'),
                        icon: 'bag',
                        name: BUDGET,
                        notActive: COMPANY_INFO.budgetPopUpType &&
                            (COMPANY_INFO.budgetPopUpType === 2 ||
                                COMPANY_INFO.budgetPopUpType === 3),
                    },
                    {
                        title: t('mainMenu:cashFlow'),
                        icon: 'cash',
                        name: PACKAGES,
                        notActive: true,
                    },
                    {
                        title: t('common:recommendation'),
                        icon: 'RECOMMENDATION',
                        name: PACKAGES,
                        notActive: true,
                    },
                    {
                        title: t('mainMenu:help'),
                        icon: 'HELP',
                        name: HELP,
                    },
                    {
                        title: t('common:settings'),
                        icon: 'gear',
                        name: SETTINGS,
                    },
                ]
                : [
                    {
                        title: t('mainMenu:overview'),
                        icon: 'desktop',
                        name: OVERVIEW,
                    },
                    {
                        icon: 'graph-up',
                        title: t('mainMenu:bankAccount'),
                        name: BANK_ACCOUNTS,
                    },
                    {
                        icon: 'credit-card-charge',
                        title: t('mainMenu:creditCard'),
                        name: CREDIT_CARD,
                    },
                    {
                        icon: 'check',
                        title: t('mainMenu:checks'),
                        name: CHECKS,
                    },
                    {
                        icon: 'enter-card-alt',
                        title: t('mainMenu:slika'),
                        name: SLIKA,
                    },
                    {
                        icon: 'mutavimMenu',
                        title: t('mainMenu:mutavim'),
                        name: MUTAVIM,
                    },
                    {
                        title: t('mainMenu:budget'),
                        icon: 'bag',
                        name: BUDGET,
                        notActive: COMPANY_INFO.budgetPopUpType &&
                            (COMPANY_INFO.budgetPopUpType === 2 ||
                                COMPANY_INFO.budgetPopUpType === 3),
                    },
                    {
                        title: t('mainMenu:cashFlow'),
                        icon: 'cash',
                        name: PACKAGES,
                        notActive: true,
                    },
                    {
                        title: t('common:recommendation'),
                        icon: 'RECOMMENDATION',
                        name: PACKAGES,
                        notActive: true,
                    },
                    {
                        title: t('mainMenu:documentManagement'),
                        icon: 'uploading-documents',
                        children: [
                            {
                                title: t('mainMenu:uploadingDocuments'),
                                name: UPLOADING_DOCUMENTS,
                            },
                            {
                                title: t('mainMenu:archives'),
                                name: ARCHIVES,
                            },
                            {
                                title: t('mainMenu:GOT_ABSORBED'),
                                name: GOT_ABSORBED,
                            },
                            {
                                title: t('mainMenu:WAITING_ABSORBED'),
                                name: WAITING_ABSORBED,
                            },
                        ],
                    },
                    {
                        title: t('mainMenu:help'),
                        icon: 'HELP',
                        name: HELP,
                    },
                    {
                        title: t('common:settings'),
                        icon: 'gear',
                        name: SETTINGS,
                    },
                ])
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
    getActiveRouteParams = (state) => {
        const route = state.routes[state?.index || 0]

        if (route.state) {
            // Dive into nested navigators
            return this.getActiveRouteParams(route.state)
        }

        return route.params
    }

    get currentCompany() {
        const {companies, currentCompanyId, dispatch} = this.props
        if (!companies || !companies.length) {
            dispatch(setGlobalParams(Object.assign(this.props.globalParams, {
                currentCompanySelected: {},
            })))
            return {}
        }
        const currentCompany = companies.find(
            c => c.companyId === currentCompanyId) || {}
        dispatch(setGlobalParams(Object.assign(this.props.globalParams, {
            currentCompanySelected: currentCompany,
        })))

        const routeName = this.getActiveRouteName(this.props.state)
        if (routeName !== SIGNUP) {
            if (currentCompany) {
                if (currentCompany['privs']) {
                    const ocrPilot1 = currentCompany['privs'].includes('METZALEM') && !currentCompany['privs'].includes('KSAFIM');
                    const ocrPilot2 = currentCompany['privs'].includes('METZALEM') && currentCompany['privs'].includes('KSAFIM');
                    console.log('ocrPilot1', ocrPilot1)
                    console.log('ocrPilot2', ocrPilot2)
                    if (!this.props.globalParams.ocrPilot || this.props.globalParams.ocrPilot !== 3) {
                        dispatch(setGlobalParams(Object.assign(this.props.globalParams, {
                            ocrPilot: ocrPilot1 ? 1 : ((ocrPilot2) ? 2 : null),
                        })))
                    }
                    if (currentCompany.agreementPopup) {
                        currentCompany.METZALEM = ocrPilot1 ? 1 : ((ocrPilot2) ? 2 : null)
                    }
                }
                // COMPANY_INFO.ocrPilot = ocrPilot1 ? 1 : ((ocrPilot2) ? 2 : null);
                COMPANY_INFO.budgetExpiredDays = currentCompany.budgetExpiredDays
                COMPANY_INFO.budgetPopUpType = currentCompany.budgetPopUpType
                COMPANY_INFO.biziboxTrialExpired = currentCompany.biziboxTrialExpired !==
                undefined && currentCompany.biziboxTrialExpired !== null
                    ? currentCompany.biziboxTrialExpired
                    : false
                COMPANY_INFO.trialBlocked = !!currentCompany.trialBlocked
                COMPANY_INFO.biziboxDowngradeDate = currentCompany.biziboxDowngradeDate !==
                    null
                COMPANY_INFO.oneAccount = currentCompany.oneAccount
            } else {
                if (!this.props.globalParams.ocrPilot || this.props.globalParams.ocrPilot !== 3) {
                    dispatch(setGlobalParams(Object.assign(this.props.globalParams, {
                        ocrPilot: null,
                    })))
                }
                COMPANY_INFO.budgetExpiredDays = false
                COMPANY_INFO.budgetPopUpType = false
                COMPANY_INFO.biziboxDowngradeDate = false
                COMPANY_INFO.biziboxTrialExpired = false
                COMPANY_INFO.trialBlocked = false
                COMPANY_INFO.oneAccount = null
            }

            IS_LIGHT.light = currentCompany && currentCompany.biziboxType &&
                currentCompany.biziboxType === 'regular'
        }
        dispatch(setGlobalParams(Object.assign(this.props.globalParams, {
            currentCompanySelected: currentCompany,
        })))
        return currentCompany
    }

    handleChangeCompany = (companyId, moveToMessages) => {
        const {dispatch, navigation} = this.props
        this.setState({
            changeCompany: true,
            showOneAccount: null,
            currentOpenMenuIndex: 0,
        })
        AsyncStorage.removeItem('closeSlideBudget')
        dispatch(selectCompany(companyId))
            .then(() => {
                this.setState({
                    changeCompany: false,
                })
                navigation.dispatch(DrawerActions.closeDrawer())
                if (moveToMessages === true) {
                    goTo(navigation, 'MESSAGES')
                } else {
                    goTo(navigation, (this.props.globalParams.ocrPilot === 1 || this.props.globalParams.ocrPilot === 3) ? UPLOADING_DOCUMENTS : OVERVIEW, {
                        timeoutAcc: true,
                    })
                }
                return dispatch(getAccounts())
            })
            .then(() => {
            })
    }

    handleChangeCompanyIOS = (buttonIndex) => {
        const {companies} = this.props
        if (buttonIndex === 0) {
            return
        }
        this.handleChangeCompany(companies[buttonIndex - 1].companyId)
    }

    handleLogout = () => {
        const {dispatch, navigation} = this.props
        navigation.dispatch(DrawerActions.closeDrawer())
        dispatch(setGlobalParams(Object.assign(this.props.globalParams, {
            ocrPilot: null,
        })))
        dispatch(logout())
    }

    handleLinkPress = (screenName, idx) => {
        if (!screenName) {
            return
        }

        if (this.props.globalParams && this.props.globalParams.ocrPilot && this.props.globalParams.ocrPilot === 2) {
            if (
                screenName === 'UPLOADING_DOCUMENTS'
                ||
                screenName === 'ARCHIVES'
                ||
                screenName === 'GOT_ABSORBED'
                ||
                screenName === 'WAITING_ABSORBED'
            ) {
                this.setState({
                    showModalAgreementOcrPilot2: true,
                })
            }
        }
        if (this.props.globalParams && this.props.globalParams.currentCompanySelected && this.props.globalParams.currentCompanySelected.METZALEM && this.props.globalParams.currentCompanySelected.METZALEM === 2) {
            if (
                screenName === 'UPLOADING_DOCUMENTS'
                ||
                screenName === 'ARCHIVES'
                ||
                screenName === 'GOT_ABSORBED'
                ||
                screenName === 'WAITING_ABSORBED'
            ) {
                this.setState({
                    showModalAgreementMETZALEM2: true,
                })
            }
        }

        goTo(this.props.navigation, screenName)
        if (idx !== undefined) {
            this.handleToggleMenu(idx)()
        }
        this.props.navigation.dispatch(DrawerActions.closeDrawer())
    }

    handleToggleMenu = (index) => () => {
        const {currentOpenMenuIndex} = this.state
        this.setState({currentOpenMenuIndex: currentOpenMenuIndex === index ? null : index})
    }

    handleCloseDrawer = () => this.props.navigation.dispatch(DrawerActions.closeDrawer())

    handleOpenIOSActionSheet = () => {
        const {companies} = this.props
        if (!IS_IOS) {
            return
        }

        ActionSheetIOS.showActionSheetWithOptions({
            options: ['Cancel', ...companies.map(c => c.companyName)],
            cancelButtonIndex: 0,
        }, this.handleChangeCompanyIOS)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {navigation, token, user, companies, dispatch} = this.props
        if ((nextProps.user && Object.getOwnPropertyNames(nextProps.user).length &&
            (nextProps.user !== user) && this.props.token && nextProps.token) && nextProps.user.accountantJobTitle) {
            dispatch(setGlobalParams(Object.assign(this.props.globalParams, {
                ocrPilot: 3,
            })))
        }

        if (COMPANY_INFO.trialBlockedPopup) {
            this.setState({
                showtrialBlocked: true,
                showLastRowPopup: false,
            })
        }
        if (COMPANY_INFO.badgetPopup) {
            this.setState({
                badgetPopup: true,
            })
        }
        if (COMPANY_INFO.oneAccount !== undefined && COMPANY_INFO.oneAccount !==
            null && this.state.showOneAccount === null) {
            this.setState({
                showOneAccount: true,
            })
        }
        const params = this.getActiveRouteParams(this.props.state)
        if (nextProps && nextProps.companies && nextProps.companies.length &&
            params && params.openTarya) {
            const params_openTarya = params.openTarya
            const params_next = this.getActiveRouteParams(nextProps.state)
            const params2 = params_next.openTarya
            if (params_openTarya !== params2 && params2 !== undefined) {
                const companiesList = nextProps.companies.filter((company) => {
                    const isAdmin = company.privs.some(
                        (item) => item === 'COMPANYSUPERADMIN' || item === 'COMPANYADMIN')
                    if (isAdmin) {
                        return company
                    }
                })
                if (companiesList.length) {
                    this.setState({
                        companiesList,
                    })
                }
            }
        }

        if (token && !nextProps.token) {
            goTo(navigation, LOGIN)

            // goTo(navigation, 'CAMERA')
        }

        if (this.props.token && nextProps.token &&
            (this.props.currentCompanyId !== nextProps.currentCompanyId)) {
            ALERTS_TRIAL.showAlert = true
            ALERTS_TRIAL.showPopUp = true

            if (nextProps.companies && nextProps.companies.length) {
                const currentCompany = nextProps.companies.find(
                    c => c.companyId === nextProps.currentCompanyId) || {}
                if (currentCompany && currentCompany.popupAlert) {
                    ALERTS_TRIAL.showAlertPopupCompany = currentCompany.popupAlert
                }
            }
        }

        if (nextProps.user && Object.getOwnPropertyNames(nextProps.user).length &&
            (nextProps.user !== user) && this.props.token && nextProps.token &&
            nextProps.mutavimPopupTimes < 3) {
            ALERTS_TRIAL.showMutavimSheet = true
            nextProps.dispatch(
                setMutavimScreenBottomSheetTimes(nextProps.mutavimPopupTimes + 1))
        }

        if (nextProps.user && Object.getOwnPropertyNames(nextProps.user).length &&
            nextProps.companies.length &&
            (nextProps.user !== user || nextProps.companies !== companies)) {
            if (nextProps.user.taryePopup === true) {
                if (nextProps.taryePopupTimes < 3) {
                    nextProps.dispatch(setTaryePopupTimes(nextProps.taryePopupTimes + 1))
                    const companiesList = nextProps.companies.filter((company) => {
                        const isAdmin = company.privs.some(
                            (item) => item === 'COMPANYSUPERADMIN' || item === 'COMPANYADMIN')
                        if (isAdmin) {
                            return company
                        }
                    })
                    if (companiesList.length) {
                        this.setState({
                            companiesList,
                        })
                    }
                } else {
                    this.setState({
                        companiesList: [],
                    })
                    hideTaryaPopupApi.post({
                        body: {
                            'vanish': false,
                        },
                    })
                }
            } else {
                this.setState({
                    companiesList: [],
                })
            }
        }
    }

    _handleAppStateChange = (nextAppState) => {
        const {currentCompanyId, dispatch} = this.props

        console.log('shouldHandleBackground.current',
            USER_SCREENS.shouldHandleBackground)
        if (
            this.state.appState.match(/inactive|background/) &&
            nextAppState === 'active' &&
            USER_SCREENS.shouldHandleBackground
        ) {
            this.alertPresent = false
            this.getAppstoreAppVersionFun()
        }

        if (nextAppState === 'active' || nextAppState === 'background') {
            ALERTS_TRIAL.showAlertActivated = true
            ALERTS_TRIAL.showMutavimSheet = true
        }
        if (this.props.token && nextAppState === 'active') {
            usersActivityApi.post({
                body: {

                    'systemName': DeviceInfo.getSystemName(),

                    'systemVersion': DeviceInfo.getSystemVersion(),

                    'version': DeviceInfo.getVersion(),

                    'brand': DeviceInfo.getBrand(),

                    'model': DeviceInfo.getModel(),

                    'timezone': RNLocalize.getTimeZone(),
                },
            })
            if (this.props.mutavimPopupTimes < 3) {
                ALERTS_TRIAL.showMutavimSheet = true
                this.props.dispatch(
                    setMutavimScreenBottomSheetTimes(this.props.mutavimPopupTimes + 1))
            }
            Promise.all([
                dispatch(getCompanies()),
            ])
                .then(() => dispatch(selectCompany(currentCompanyId || null)))
                .then(() => dispatch(getAccounts()))
                .then(() => {
                    if (this.currentCompany && this.currentCompany.popupAlert) {
                        ALERTS_TRIAL.showAlertPopupCompany = this.currentCompany.popupAlert
                    }
                    if (this.props.user &&
                        Object.getOwnPropertyNames(this.props.user).length &&
                        this.props.companies.length) {
                        if (this.props.user.taryePopup === true) {
                            if (this.props.taryePopupTimes < 3) {
                                this.props.dispatch(
                                    setTaryePopupTimes(this.props.taryePopupTimes + 1))
                                const companiesList = this.props.companies.filter((company) => {
                                    const isAdmin = company.privs.some(
                                        (item) => item === 'COMPANYSUPERADMIN' || item ===
                                            'COMPANYADMIN')
                                    if (isAdmin) {
                                        return company
                                    }
                                })
                                if (companiesList.length) {
                                    this.setState({
                                        companiesList,
                                    })
                                }
                            } else {
                                this.setState({
                                    companiesList: [],
                                })
                                hideTaryaPopupApi.post({
                                    body: {
                                        'vanish': false,
                                    },
                                })
                            }
                        } else {
                            this.setState({
                                companiesList: [],
                            })
                        }
                    }
                })
                .catch(() => {

                })
        }

        this.setState({appState: nextAppState})

        if (nextAppState === 'active') {
            // //console.log('-----------   active')
            // //console.log(AppTimezone.moment().diff(this.state.appStateBgTime, 'minutes'))
            if (AppTimezone.moment().diff(this.state.appStateBgTime, 'minutes') >= 15) {
                this.setState({isReady: true})
                const routeName = this.getActiveRouteName(this.props.state)
                goTo(this.props.navigation, routeName)
            }
        }
        if (nextAppState === 'background') {
            // //console.log('-----------   background')
            this.setState({appStateBgTime: AppTimezone.moment().valueOf()})
            // //console.log(this.state.appStateBgTime)
        }
    }

    componentWillUnmount() {
        if(Linking && Linking.removeEventListener){
            Linking.removeEventListener('url', this.handleOpenURL)
        }
        if(AppState && AppState.removeEventListener){
            AppState.removeEventListener('change', this._handleAppStateChange)
        }
        // this.messageListener()
        // if(this.notificationListener){
        //   this.notificationListener()
        // }
        // if(this.notificationDisplayedListener){
        //   this.notificationDisplayedListener()
        // }
    }

    isNewerVersion(oldVer, newVer) {
        const oldParts = oldVer.split('.')
        const newParts = newVer.split('.')
        for (let i = 0; i < newParts.length; i++) {
            const a = parseInt(newParts[i], 10) || 0
            const b = parseInt(oldParts[i], 10) || 0
            if (a > b) {
                return true
            }
            if (a < b) {
                return false
            }
        }
        return false
    }

    getAppstoreAppVersionFun() {
        if (this.props.token && !this.alertPresent && !this.state.alertState && !IS_DEV) {
            this.alertPresent = true
            getVersionApi.get()
                .then(latestVersion => {
                    if (this.props.user.changePasswordRequired !== 1 &&
                        this.props.user.changePasswordRequired !== true &&
                        this.isNewerVersion(VERSION, latestVersion[IS_IOS ? 'buIosVerNum' : 'buAndroidVerNum'])) {
                        this.setState({alertState: true})
                    }
                    // console.log('latestVersion------', latestVersion)
                })
        }
    }

    openURL = () => {
        this.alertPresent = false
        if (IS_IOS) {
            Linking.openURL(
                'https://itunes.apple.com/us/app/bizibox-ui/id1448852782?l=iw&ls=1&mt=8')
        } else {
            Linking.openURL(
                'https://play.google.com/store/apps/details?id=com.biziboxapp')
        }
    }

    closeModalDownload = () => {
        this.setState({alertState: false})
    }

    handleCloseCompaniesList = () => {
        if (this.state.dontShowAgain) {
            hideTaryaPopupApi.post({
                body: {
                    'vanish': true,
                },
            })
        }
        setTimeout(() => {
            this.setState({
                companiesList: [],
                companyIdSelected: null,
            })
        }, 50)
    }

    componentDidMount() {
        ALERTS_TRIAL.showAlertPopupCompany = false
        ALERTS_TRIAL.showAlertActivated = true
        this.getAppstoreAppVersionFun()
        USER_SCREENS.shouldHandleBackground = true
        Linking.addEventListener('url', this.handleOpenURL)
        AppState.addEventListener('change', this._handleAppStateChange)
        messaging().hasPermission()
            .then(enabled => {
                console.log('hasPermission---------', enabled)
                if (enabled === messaging.AuthorizationStatus.AUTHORIZED) {
                    this.createNotificationListeners()
                } else {
                    if (this.props.token && !IS_DEV) {
                        notificationsIfHasPermissionButtonAlert()
                    }
                }
            })
        Linking.getInitialURL()
            .then((url) => {
                if (url) {
                    this.navigate(url)
                }
            })
            .catch(() => {

            })
    }


    createNotificationListeners() {
        const {navigation} = this.props

        this.notificationDisplayedListener = messaging()
            .onNotificationOpenedApp(remoteMessage => {
                console.log(
                    'Notification caused app to open from background state:',
                    remoteMessage.notification,
                )
                const {data} = remoteMessage.notification
                // showAlert(body, JSON.stringify(data))
                if (data && data.messageId) {
                    setTimeout(() => {
                        goTo(navigation, 'MESSAGES', {
                            messageId: data.messageId,
                        })
                    }, 4000)
                }
                if (data && data.companyId) {
                    setTimeout(() => {
                        this.handleChangeCompany(data.companyId, true)
                    }, 4000)
                }
            })

        /*
                * Triggered when a particular notification has been received in foreground
                * */
        this.notificationListener = messaging()
            .getInitialNotification()
            .then(remoteMessage => {
                if (remoteMessage) {
                    // App was opened by a notification
                    // Get the action triggered by the notification being opened
                    //   const action = notificationOpen.action
                    // Get information about the notification that was opened
                    const {data} = remoteMessage.notification
                    // showAlert(body, JSON.stringify(data))
                    if (data && data.messageId) {
                        setTimeout(() => {
                            goTo(navigation, 'MESSAGES', {
                                messageId: data.messageId,
                            })
                        }, 4000)
                    }
                    if (data && data.companyId) {
                        setTimeout(() => {
                            this.handleChangeCompany(data.companyId, true)
                        }, 4000)
                    }
                }
            })

        /*
                * Triggered for data only payload in foreground
                * */
        this.messageListener = messaging().onMessage(() => {
            // process data message
            // console.log('---message---', JSON.stringify(message))
        })
    }

    navigate = (url) => {
        const navigation = this.props.navigation
        let route = url.replace(/.*?:\/\//g, '')
        Linking.canOpenURL(url).then((supported) => {
            if (supported) {
                setTimeout(() => {
                    if (route.includes('activation')) {
                        const uuid = route.split('uuid=')[1]
                        if (uuid) {
                            activateUserApi.post({
                                body: {
                                    'uuid': uuid,
                                },
                            }).then(() => {
                                Toast.show('המייל אומת בהצלחה!', Toast.SHORT, Toast.TOP, {
                                    backgroundColor: colors.green15,
                                    width: 400,
                                    height: 50,
                                    fontSize: sp(14),
                                    lineHeight: 50,
                                    textAlign: 'center',
                                    color: '#ffffff',
                                    fontFamily: fonts.regular,
                                    borderRadius: 15,
                                    yOffset: 0,
                                    lines: 4,
                                })
                                // console.log('המייל אומת בהצלחה!')
                            })
                                .catch(() => {
                                    Toast.show('המייל לא אומת!', Toast.SHORT, Toast.TOP, {
                                        backgroundColor: colors.red7,
                                        width: 400,
                                        height: 50,
                                        fontSize: sp(14),
                                        lineHeight: 50,
                                        textAlign: 'center',
                                        fontFamily: fonts.regular,
                                        color: '#ffffff',
                                        borderRadius: 15,
                                        yOffset: 0,
                                        lines: 4,
                                    })
                                    // console.log('המייל לא אומת!')
                                })
                        }
                    }
                    if (route.includes('biziboxType')) {
                        const biziboxType = route.split('biziboxType=')[1]
                        if (biziboxType) {
                            IS_LIGHT.light = biziboxType === 'regular'
                            if (!IS_IOS) {
                                goTo(navigation, SIGNUP)
                            }
                        }
                    } else if (route.includes(
                        'financialManagement/bankAccount/details')) {
                        goTo(navigation, 'BANK_ACCOUNTS')
                    } else if (route.includes('cash-flow/daily/aggregate') ||
                        route.includes('cash-flow/daily/details/aggregate')) {
                        goTo(navigation, 'CASH_FLOW', {
                            moveToAggregate: true,
                        })
                    } else if (route.includes('cash-flow/daily/details')) {
                        goTo(navigation, 'CASH_FLOW')
                    } else if (route.includes('settings/bankAccounts')) {
                        goTo(navigation, 'SETTINGS', {
                            paramsLinkAddCard: {
                                addCard: BANK_ACCOUNTS_TAB,
                            },
                        })
                    } else if (route.includes('settings/creditCard')) {
                        goTo(navigation, 'SETTINGS', {
                            paramsLinkAddCard: {
                                addCard: CREDIT_CARDS_TAB,
                            },
                        })
                    }
                }, 2000)
                // console.log(route)
            }
        })
    }

    handleOpenURL = (event) => {
        this.navigate(event.url)
    }

    handleToggleStatus = (i) => () => {
        this.setState({
            companyIdSelected: i,
        })
    }
    dontShowAgain = () => {
        this.setState({
            dontShowAgain: !this.state.dontShowAgain,
        })
    }

    createApiToken = () => {
        if (this.state.companyIdSelected !== null) {
            createApiTokenApi.post({
                body: {
                    'companyAccountIds': null,
                    'companyId': this.state.companyIdSelected,
                    'targetUserId': '16f8acbf-c11d-045b-e053-650aa8c09c49',
                },
            })
                .then(res => {
                    try {
                        Linking.canOpenURL(res)
                            .then(s => {
                                if (s) {
                                    Linking.openURL(res)
                                }
                            })
                    } catch (e) {
                    }
                    hideTaryaPopupApi.post({
                        body: {
                            'vanish': this.state.dontShowAgain,
                        },
                    })
                    setTimeout(() => {
                        this.setState({
                            companiesList: [],
                            companyIdSelected: null,
                        })
                    }, 50)
                })
                .catch(() => {
                })
        }
    }
    animatedTimeBiziboxTrialExpired = () => {
        COMPANY_INFO.trialBlockedPopup = false
        this.setState({
            showLastRowPopup: false,
            showtrialBlocked: false,
        })
    }
    closeBadgetPopup = () => {
        COMPANY_INFO.badgetPopup = false
        this.setState({
            badgetPopup: false,
        })
    }

    approveUpgrade = () => {
        const {currentCompanyId, dispatch} = this.props
        const thisCompany = (!this.props.companies || !this.props.companies.length)
            ? {}
            : (this.props.companies.find(c => c.companyId === currentCompanyId)
                ? this.props.companies.find(c => c.companyId === currentCompanyId)
                : {})
        const showLastRowPopup = thisCompany.billingAccountId !==
            '00000000-0000-0000-0000-000000000000'
        if (this.state.showtrialBlocked && COMPANY_INFO.trialBlockedPopup &&
            thisCompany.billingAccountId === '00000000-0000-0000-0000-000000000000') {
            this.animatedTimeBiziboxTrialExpired()
            goTo(this.props.navigation, 'SETTINGS', {
                paramsLinkAddCard: {
                    addCard: PAYMENTS_TO_BIZIBOX_TAB,
                },
            })
        } else {
            this.setState({
                showLastRowPopup: true,
            })
            approveUpgradeApi.post({
                body: {
                    uuid: currentCompanyId,
                },
            })
                .then(() => {
                    if (showLastRowPopup) {
                        Promise.all([
                            dispatch(getCompanies()),
                        ])
                            .then(() => dispatch(selectCompany(currentCompanyId)))
                            .then(() => dispatch(getAccounts()))
                            .then(() => {
                                this.animatedTimeBiziboxTrialExpired()
                                const thisComp = (!this.props.companies ||
                                    !this.props.companies.length)
                                    ? {}
                                    : (this.props.companies.find(
                                        c => c.companyId === this.props.currentCompanyId)
                                        ? this.props.companies.find(
                                            c => c.companyId === this.props.currentCompanyId)
                                        : {})
                                const billingAccountId = thisComp.billingAccountId ===
                                    '00000000-0000-0000-0000-000000000000'
                                if (billingAccountId) {
                                    goTo(this.props.navigation, 'SETTINGS', {
                                        paramsLinkAddCard: {
                                            addCard: PAYMENTS_TO_BIZIBOX_TAB,
                                        },
                                    })
                                }
                            })
                            .catch(() => {

                            })
                    } else {
                        this.animatedTimeBiziboxTrialExpired()
                    }
                })
                .catch(() => {
                })
        }
    }

    animatedTimeOneAccount = () => {
        COMPANY_INFO.oneAccount = null
        this.setState({
            showOneAccount: false,
        })

        oneAccountPopUpApi.post({
            body: {
                'uuid': this.props.currentCompanyId,
            },
        })
    }
    closeModalAgreement = () => {
        this.setState({
            showModalAgreement: false,
        })
    }
    updateAgreementConfirmation = (appAgreementConfirmation, sendMarketingInformation, agreementClicked) => {
        updateAgreementConfirmationApi.post({
            body: {
                'appAgreementConfirmation': appAgreementConfirmation ? appAgreementConfirmation : null,
                'sendMarketingInformation': sendMarketingInformation ? sendMarketingInformation : null,
                'agreementClicked': agreementClicked,
            },
        })
            .then(() => {

            })
    }

    updateAgreementCompaniesConfirmation = (appAgreementConfirmation, sendMarketingInformation, agreementClicked) => {
        updateAgreementCompaniesConfirmationApi.post({
            body: {
                'appAgreementConfirmation': appAgreementConfirmation ? appAgreementConfirmation : null,
                'sendMarketingInformation': sendMarketingInformation ? sendMarketingInformation : null,
                'agreementClicked': agreementClicked,
            },
        })
            .then(() => {

            })
    }

    backToAgreement = () => {
        this.setState({
            backTo6: false,
            showModalAgreement: (this.state.showModalAgreement === 2 || this.state.showModalAgreement === 8) ? 1 : (this.state.backTo6 ? 6 : 2),
        })
    }

    render() {
        const {
            currentOpenMenuIndex,
            alertState,
            companiesList,
            companyIdSelected,
            dontShowAgain,
            showLastRowPopup,
            showtrialBlocked,
            changeCompany,
            badgetPopup,
            showOneAccount,
            showModalAgreement,
            showModalAgreementOcrPilot2,
            showModalAgreementMETZALEM2,
        } = this.state
        const {
            isRtl,
            token,
            user,
            companies,
            currentCompanyId,
            t,
            navigation,
            route,
            state,
            dispatch,
            globalParams,
        } = this.props
        if (!token) {
            return null
        }

        const currentCompany = this.currentCompany
        const menu = this.menu

        // console.log('globalParams.currentCompanySelected.METZALEM: ', globalParams.currentCompanySelected.METZALEM)

        return (
            <SafeAreaView style={styles.container}>

                <Image
                    style={{
                        position: 'absolute',
                        bottom: -100,
                    }}
                    source={require('BiziboxUI/assets/menu-bg.png')}
                />

                <StatusBar barStyle={(IS_IOS) ? 'dark-content' : 'light-content'}/>

                <TouchableOpacity
                    style={cs(isRtl, styles.closeDrawer, styles.closeDrawerRtl)}
                    hitSlop={{
                        top: 20,
                        bottom: 20,
                        left: 20,
                        right: 20,
                    }}
                    onPress={this.handleCloseDrawer}
                >
                    <CustomIcon name="times" size={14} color={colors.blue5}/>
                </TouchableOpacity>

                <View style={styles.headerWrapper}>
                    {(companies.length > 0) ? (
                        <View style={styles.pickerWrapper}>
                            {(companies.length === 1) && (
                                <View style={cs(isRtl, styles.pickerTitleWrapper,
                                    styles.pickerTitleWrapperRtl)}>
                                    <Text
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                        style={styles.pickerTitle}>{currentCompany.companyName}</Text>
                                </View>
                            )}
                            {(companies.length > 1) && (
                                <TouchableOpacity
                                    onPress={this.handleOpenIOSActionSheet}
                                    style={cs(isRtl, styles.pickerTitleWrapper,
                                        styles.pickerTitleWrapperRtl)}
                                >
                                    <Text
                                      numberOfLines={1}
                                      ellipsizeMode="tail"
                                        style={styles.pickerTitle}>{currentCompany.companyName}</Text>
                                    <Icons name="chevron-down" size={22} color={colors.blue3}/>
                                </TouchableOpacity>
                            )}
                            {!IS_IOS && (
                                <Picker
                                    selectedValue={currentCompanyId}
                                    style={styles.picker}
                                    onValueChange={this.handleChangeCompany}
                                >
                                    {companies.map(
                                        c => <Picker.Item key={c.companyId} label={c.companyName}
                                                          value={c.companyId}/>)}
                                </Picker>
                            )}
                        </View>
                    ) : null}
                </View>

                <ScrollView>
                    {menu.map((item, i) => (
                        <DropdownPanel
                            changeCompany={changeCompany}
                            navigation={navigation}
                            state={state}
                            route={route}
                            key={item.title}
                            isRtl={isRtl}
                            index={i}
                            isOpen={i === currentOpenMenuIndex}
                            isFirst={i === 0}
                            isLast={i >= menu.length - 1}
                            title={item.title}
                            icon={item.icon}
                            notActive={!!((item.notActive !== undefined &&
                                item.notActive === true))}
                            items={item.children}
                            name={item.name}
                            onMenuToggle={this.handleToggleMenu(i)}
                            onLinkPress={this.handleLinkPress}
                        />
                    ))}
                </ScrollView>
                <View
                    style={cs(isRtl, styles.footerWrapper, styles.footerWrapperRtl)}>
                    <Divider style={cs(isRtl, styles.divider, styles.dividerRtl)}/>

                    <View style={cs(isRtl, styles.footerInner, styles.footerInnerRtl)}>
                        <View style={cs(isRtl, styles.footerMenuWrapper,
                            styles.footerMenuWrapperRtl)}>
                            <TouchableOpacity
                                style={cs(isRtl,
                                    [styles.menuItemWrapper, styles.footerMenuItem],
                                    commonStyles.rowReverse)}
                                onPress={this.handleLogout}
                                hitSlop={{
                                    top: 20,
                                    bottom: 20,
                                    left: 20,
                                    right: 20,
                                }}
                            >
                                <CustomIcon name="power-off" size={18} color={colors.blue3}/>
                                <Text style={cs(isRtl, styles.logoutBtnText,
                                    styles.logoutBtnTextRtl)}>
                                    {t('common:label:logout')}
                                </Text>
                            </TouchableOpacity>

                            <Text style={cs(isRtl, styles.userName,
                                styles.userNameRtl)}>{user.userName}</Text>
                        </View>

                        {/* <Image style={styles.avatar} source={require('BiziboxUI/assets/avatar.png')} /> */}
                    </View>
                </View>

                {(companiesList && companiesList.length > 0) && (
                    <Modal
                        animationType="slide"
                        transparent
                        visible
                        onRequestClose={() => {
                            // //console.log('Modal has been closed.')
                        }}>
                        <View style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            left: 0,
                            zIndex: 999999,
                            height: '100%',
                            width: '100%',
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            alignContent: 'center',
                        }}>

                            <TouchableOpacity style={{
                                backgroundColor: 'black',
                                opacity: 0.7,
                                position: 'absolute',
                                top: 0,
                                right: 0,
                                bottom: 0,
                                left: 0,
                                zIndex: 999999,
                                height: '100%',
                                width: '100%',
                            }} onPress={this.handleCloseCompaniesList}/>

                            <View style={{
                                width: '100%',
                                zIndex: 9999999,
                                backgroundColor: 'white',
                                borderTopLeftRadius: 12,
                                borderTopRightRadius: 12,
                                height: 450,
                                position: 'absolute',
                                right: 0,
                                bottom: 0,
                                left: 0,
                            }}>
                                <View style={{}}>
                                    <Text style={{
                                        color: '#022258',
                                        fontSize: sp(22.5),
                                        fontFamily: fonts.bold,
                                        textAlign: 'center',
                                        marginBottom: 15,
                                        marginTop: 22.5,
                                    }}>
                                        {'במיוחד בשבילכם'}
                                    </Text>
                                    <Text style={{
                                        color: '#022258',
                                        fontSize: sp(17),
                                        fontFamily: fonts.semiBold,
                                        textAlign: 'center',
                                        marginBottom: 15,
                                    }}>
                                        {'האם אתם מעוניינים לקבל מסגרת אשראי חוץ בנקאית?'}
                                    </Text>
                                    <Text style={{
                                        marginRight: 20,
                                        color: '#022258',
                                        fontSize: sp(16),
                                        fontFamily: fonts.regular,
                                        textAlign: 'right',
                                    }}>
                                        {'בחרו את החברה עבורה תרצו לקבל מסגרת'}
                                    </Text>
                                </View>
                                <View style={{
                                    height: 160,
                                }}>
                                    <ScrollView
                                        keyboardShouldPersistTaps="always"
                                        style={{
                                            flex: 1,
                                            position: 'relative',
                                        }}
                                        contentContainerStyle={{
                                            marginHorizontal: 15,
                                            marginTop: 10,
                                        }}
                                    >
                                        {companiesList.length > 0 && companiesList.map((f, i) => {
                                            return (
                                                <View key={i.toString()}
                                                      style={{
                                                          height: 32,
                                                          width: '100%',
                                                      }}>

                                                    <CheckBox
                                                        containerStyle={{
                                                            backgroundColor: 'transparent',
                                                            // left: 0,
                                                            margin: 0,
                                                            padding: 0,
                                                            borderWidth: 0,
                                                            lineHeight: 22,
                                                            height: 22,
                                                            // right: 0,
                                                            // width: '100%',
                                                            // alignSelf: 'center',
                                                            // alignItems: 'center',
                                                            // alignContent: 'center',
                                                            // justifyContent: 'center',
                                                        }}
                                                        textStyle={{
                                                            fontSize: sp(16),
                                                            lineHeight: 22,
                                                            color: '#022258',
                                                            fontWeight: 'normal',
                                                            textAlign: 'right',
                                                            fontFamily: fonts.regular,
                                                            // right: 0,
                                                            // left: 0,
                                                            // justifyContent: 'space-between',
                                                            // width: '87%',
                                                            margin: 0,
                                                            padding: 0,
                                                        }}
                                                        fontFamily={fonts.regular}
                                                        size={22}
                                                        right
                                                        checkedColor="#022258"
                                                        uncheckedColor="#022258"
                                                        title={f.companyName}
                                                        iconRight
                                                        checked={companyIdSelected === f.companyId}
                                                        iconType="material-community"
                                                        checkedIcon="radiobox-marked"
                                                        uncheckedIcon="radiobox-blank"
                                                        onPress={this.handleToggleStatus(f.companyId)}
                                                    />
                                                </View>
                                            )
                                        })}
                                    </ScrollView>
                                </View>
                                <TouchableOpacity
                                    style={{
                                        marginBottom: 20,
                                        marginTop: 15,
                                    }}
                                    onPress={this.createApiToken}
                                    activeOpacity={(companyIdSelected !== null) ? 0.2 : 1}>
                                    <View style={{
                                        height: 32.5,
                                        width: 215,
                                        opacity: companyIdSelected === null ? 0.6 : 1,
                                        backgroundColor: '#022258',
                                        borderRadius: 5,
                                        flexDirection: 'row-reverse',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                    }}>
                                        <Text style={{
                                            color: '#ffffff',
                                            fontSize: sp(17),
                                            fontFamily: fonts.semiBold,
                                            textAlign: 'center',
                                            fontFamily: fonts.regular,
                                        }}>
                                            לפרטים נוספים
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{
                                        marginRight: 25,
                                    }}
                                    onPress={this.dontShowAgain}>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        alignSelf: 'flex-end',
                                        justifyContent: 'center',
                                    }}>
                                        <CustomIcon name={'ok'} size={16}
                                                    color={!dontShowAgain
                                                        ? '#dddddd'
                                                        : '#0addc1'}/>
                                        <View style={{
                                            paddingHorizontal: 2,
                                        }}/>
                                        <Text style={{
                                            color: '#022258',
                                            fontSize: sp(14),
                                            lineHeight: 20,
                                            fontFamily: fonts.regular,
                                            textAlign: 'right',
                                        }}>
                                            אל תציג שוב
                                        </Text>
                                    </View>
                                </TouchableOpacity>

                                <View style={{
                                    marginHorizontal: 15,
                                    marginVertical: 10,
                                }}>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                    }}>
                                        <View>
                                            <Text style={{
                                                color: '#022258',
                                                fontSize: sp(9.5),
                                                lineHeight: 14,
                                                fontFamily: fonts.semiBold,
                                            }}>{' bizibox'}</Text>
                                        </View>
                                        <View>
                                            <Text style={{
                                                color: '#022258',
                                                fontSize: sp(9.5),
                                                lineHeight: 14,
                                                fontFamily: fonts.semiBold,
                                            }}>
                                                אינה מערכת למתן אשראי, תיוך באשראי, השוואת עלויות
                                                פיננסיות או שירותי
                                                יעוץ פיננסי,
                                            </Text>
                                        </View>
                                    </View>
                                    <View>
                                        <Text style={{
                                            color: '#022258',
                                            fontSize: sp(9.5),
                                            lineHeight: 14,
                                            fontFamily: fonts.semiBold,
                                            textAlign: 'center',
                                        }}>
                                            ולא עוסקת בתחומים אלה. ל-bizibox אין כל שיקול דעת בנושא
                                            העמדת אשראי או
                                            פתרונות
                                            פיננסים אחרים, והעמדת אשראי, ככל שתיעשה, תיעשה לפי שיקול
                                            דעתו של נותן האשראי
                                            בלבד.
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </Modal>
                )}

                {alertState && (
                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={alertState}
                        onRequestClose={() => {
                            // //console.log('Modal has been closed.')
                        }}>
                        <SafeAreaView style={{
                            flex: 1,
                            marginTop: 0,
                            paddingTop: 0,
                            position: 'relative',
                            backgroundColor: '#ffffff',
                        }}>
                            <View style={{
                                width: '100%',
                                height: '100%',
                                marginTop: 0,
                                marginBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 0,
                                flex: 1,
                                zIndex: 2,
                                alignItems: 'center',
                                justifyContent: 'center',
                                alignContent: 'center',
                                alignSelf: 'center',
                            }}>
                                <Image
                                    style={{
                                        width: 204,
                                        height: 230,
                                    }}
                                    resizeMode="contain"
                                    source={require('BiziboxUI/assets/downloan.png')}
                                />
                                <Text style={{
                                    color: '#022258',
                                    fontSize: sp(25),
                                    fontFamily: fonts.bold,
                                    marginTop: 31,
                                    marginBottom: 10,
                                }}>חדשות טובות!</Text>

                                <View style={{
                                    flexDirection: 'row-reverse',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignSelf: 'center',
                                }}>
                                    <Text style={{
                                        color: '#022258',
                                        fontSize: sp(21.5),
                                        fontFamily: fonts.regular,
                                        marginLeft: 5,
                                    }}>
                                        קיימת גרסה חדשה יותר של
                                    </Text>

                                    <Image
                                        style={{
                                            width: 80.5,
                                            height: 19.5,
                                        }}
                                        resizeMode="contain"
                                        source={require('BiziboxUI/assets/logoForDownload.png')}
                                    />
                                </View>
                                <Text style={{
                                    color: '#022258',
                                    fontSize: sp(21.5),
                                    fontFamily: fonts.regular,
                                }}>מלאה בשיפורים ועדכונים.</Text>

                                <TouchableOpacity
                                    style={[
                                        {
                                            marginTop: 67,
                                            height: 64,
                                            backgroundColor: '#022052',
                                            borderRadius: 32,
                                            width: 245,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            alignContent: 'center',
                                            alignSelf: 'center',
                                            borderWidth: 3,
                                            borderColor: '#ffffff',
                                        }]}
                                    onPress={this.openURL}>
                                    <Text style={{
                                        color: colors.white,
                                        fontFamily: fonts.bold,
                                        fontSize: sp(24),
                                        textAlign: 'center',
                                        fontFamily: fonts.regular,
                                    }}>{'לחצו לעדכון'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[
                                        {
                                            marginTop: 10,
                                        }]}
                                    onPress={this.closeModalDownload}>
                                    <Text style={{
                                        textAlign: 'center',
                                        fontSize: sp(17),
                                        fontFamily: fonts.regular,
                                        color: '#007ebf',
                                        textDecorationLine: 'underline',
                                        textDecorationStyle: 'solid',
                                        textDecorationColor: '#007ebf',
                                    }}>{'הזכר לי מאוחר יותר'}</Text>
                                </TouchableOpacity>
                            </View>
                            <Image
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    left: 0,
                                    width: '100%',
                                    height: 381.5,
                                    zIndex: 1,
                                }}
                                resizeMode="cover"
                                source={require('BiziboxUI/assets/bgModalDownloadVer.png')}
                            />
                        </SafeAreaView>
                    </Modal>
                )}

                {showtrialBlocked && COMPANY_INFO.trialBlockedPopup && (
                    <Modal
                        animationType="fade"
                        transparent
                        visible={COMPANY_INFO.trialBlockedPopup}>
                        <Animated.View style={{
                            opacity: 1,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 9,
                            elevation: 9,
                            height: '100%',
                            width: '100%',
                            flexDirection: 'row',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            alignContent: 'center',
                        }}>
                            <TouchableOpacity
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    left: 0,
                                    top: 0,
                                    zIndex: 9,
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: '#cccccc',
                                    opacity: 0.7,
                                }}
                                onPress={this.animatedTimeBiziboxTrialExpired}/>

                            <View style={{
                                marginTop: 130,
                                width: 715 / 2,
                                height: 276 / 2,
                                backgroundColor: '#ffffff',
                                borderRadius: 5,
                                zIndex: 10,
                                shadowColor: '#a0a0a0',
                                shadowOffset: {
                                    width: 0,
                                    height: 0,
                                },
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                                elevation: 33,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                            }}>
                                {showLastRowPopup && (
                                    <View style={{
                                        borderWidth: 1,
                                        borderColor: '#f3ca35',
                                        marginHorizontal: 5,
                                        marginVertical: 5,
                                        flex: 1,
                                        width: '97%',
                                        borderRadius: 5,
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'flex-start',
                                    }}>
                                        <TouchableOpacity
                                            style={{
                                                height: 20,
                                                marginBottom: 5,
                                                marginTop: 5,
                                                alignSelf: 'flex-start',
                                                marginLeft: 10,
                                            }}
                                            onPress={this.animatedTimeBiziboxTrialExpired}>
                                            <Icons
                                                name="close"
                                                type="material-community"
                                                size={25}
                                                color={'#022258'}
                                            />
                                        </TouchableOpacity>
                                        <Image style={{
                                            width: 73 / 2,
                                            height: 74 / 2,
                                            alignSelf: 'center',
                                            marginBottom: 5,
                                        }} source={require('BiziboxUI/assets/logoB.png')}/>
                                        <Text
                                            style={{
                                                marginTop: 0,
                                                color: '#022258',
                                                fontSize: sp(17),
                                                lineHeight: 24,
                                                fontFamily: fonts.semiBold,
                                            }}>{'אנחנו שמחים שבחרת להצטרף ל- bizibox לעסקים'}</Text>

                                        <Text
                                            style={{
                                                color: '#022258',
                                                fontSize: sp(17),
                                                lineHeight: 24,
                                                fontFamily: fonts.regular,
                                            }}>{'אנו תמיד כאן לשרותך'}</Text>
                                    </View>
                                )}
                                {!showLastRowPopup && (
                                    <Fragment>
                                        <TouchableOpacity
                                            style={{
                                                height: 20,
                                                marginBottom: 10,
                                                marginTop: 5,
                                                alignSelf: 'flex-start',
                                                marginLeft: 10,
                                            }}
                                            onPress={this.animatedTimeBiziboxTrialExpired}>
                                            <Icons
                                                name="close"
                                                type="material-community"
                                                size={25}
                                                color={'#022258'}
                                            />
                                        </TouchableOpacity>
                                        <View style={{
                                            width: '100%',
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            alignContent: 'center',
                                            alignSelf: 'center',
                                            height: 34,
                                            backgroundColor: '#dde7f1',
                                        }}>
                                            <Text
                                                style={{
                                                    color: '#022258',
                                                    fontSize: sp(16),
                                                    lineHeight: 34,
                                                    fontFamily: fonts.semiBold,
                                                }}>{'למעבר ל- bizibox לעסקים - נא לאשר את התשלום'}</Text>
                                        </View>

                                        <TouchableOpacity
                                            onPress={this.approveUpgrade}
                                            style={{
                                                marginTop: 20,
                                                marginBottom: 7,
                                                width: 397 / 2,
                                                height: 69 / 2,
                                                backgroundColor: '#022258',
                                                alignSelf: 'center',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                                borderRadius: 6,
                                            }}>
                                            <Text style={{
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(18.5),
                                                textAlign: 'center',
                                            }}>{'אישור תשלום'}</Text>
                                        </TouchableOpacity>
                                    </Fragment>
                                )}
                            </View>
                        </Animated.View>
                    </Modal>
                )}

                {badgetPopup && COMPANY_INFO.badgetPopup && (
                    <BottomSheetBudgetNav navigation={navigation}
                                          dispatch={dispatch}
                                          company={this.currentCompany}
                                          close={this.closeBadgetPopup}/>
                )}

                {showOneAccount && COMPANY_INFO.oneAccount !== null && (
                    <Modal
                        animationType="fade"
                        transparent
                        visible={true}>
                        <Animated.View style={{
                            opacity: 1,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 9,
                            elevation: 9,
                            height: '100%',
                            width: '100%',
                            flexDirection: 'row',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            alignContent: 'center',
                        }}>
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    left: 0,
                                    top: 0,
                                    zIndex: 9,
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: '#cccccc',
                                    opacity: 0.7,
                                }}/>

                            <View style={{
                                marginTop: 130,
                                width: 715 / 2,
                                height: 276 / 2,
                                backgroundColor: '#ffffff',
                                borderRadius: 5,
                                zIndex: 10,
                                shadowColor: '#a0a0a0',
                                shadowOffset: {
                                    width: 0,
                                    height: 0,
                                },
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                                elevation: 33,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                            }}>
                                <View style={{
                                    borderWidth: 1,
                                    borderColor: '#f3ca35',
                                    marginHorizontal: 5,
                                    marginVertical: 5,
                                    flex: 1,
                                    width: '97%',
                                    borderRadius: 5,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start',
                                }}>
                                    <TouchableOpacity
                                        style={{
                                            height: 20,
                                            marginBottom: 5,
                                            marginTop: 5,
                                            alignSelf: 'flex-start',
                                            marginLeft: 10,
                                        }}
                                        onPress={this.animatedTimeOneAccount}>
                                        <Icons
                                            name="close"
                                            type="material-community"
                                            size={25}
                                            color={'#022258'}
                                        />
                                    </TouchableOpacity>
                                    <Image style={{
                                        width: 73 / 2,
                                        height: 74 / 2,
                                        alignSelf: 'center',
                                        marginBottom: 5,
                                    }} source={require('BiziboxUI/assets/logoB.png')}/>

                                    {COMPANY_INFO.oneAccount === false && (
                                        <Fragment>
                                            <Text
                                                style={{
                                                    marginTop: 0,
                                                    color: '#022258',
                                                    fontSize: sp(17),
                                                    lineHeight: 24,
                                                    fontFamily: fonts.semiBold,
                                                }}>{'אנחנו שמחים שבחרתם לצרף את חשבונותיכם'}</Text>

                                            <Text
                                                style={{
                                                    color: '#022258',
                                                    fontSize: sp(17),
                                                    lineHeight: 24,
                                                    fontFamily: fonts.regular,
                                                }}>{'התשלום עבור יותר מחשבון בנק אחד הוא 49 ₪'}</Text>
                                        </Fragment>
                                    )}

                                    {COMPANY_INFO.oneAccount === true && (
                                        <Fragment>
                                            <Text
                                                style={{
                                                    marginTop: 0,
                                                    color: '#022258',
                                                    fontSize: sp(17),
                                                    lineHeight: 24,
                                                    fontFamily: fonts.semiBold,
                                                }}>{'אחד או יותר מחשבונות הבנק שלך הוסרו בהצלחה'}</Text>

                                            <Text
                                                style={{
                                                    color: '#022258',
                                                    fontSize: sp(17),
                                                    lineHeight: 24,
                                                    fontFamily: fonts.regular,
                                                }}>{'התשלום חשבון בנק אחד הוא 19 ₪'}</Text>
                                        </Fragment>
                                    )}
                                </View>
                            </View>
                        </Animated.View>
                    </Modal>
                )}


                {(user && user.appAgreementPopup) && globalParams && globalParams.ocrPilot && (globalParams.ocrPilot === 1 || (globalParams.ocrPilot === 2 && showModalAgreementOcrPilot2 === true)) && (showModalAgreement !== false) && (
                    <Modal
                        animationType="fade"
                        transparent
                        visible={true}>
                        <Animated.View style={{
                            opacity: 1,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 9,
                            elevation: 9,
                            height: '100%',
                            width: '100%',
                            flexDirection: 'row',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            alignContent: 'center',
                        }}>
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    left: 0,
                                    top: 0,
                                    zIndex: 9,
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: '#cccccc',
                                    opacity: 0.7,
                                }}/>
                            <View style={{
                                marginTop: showModalAgreement === 1 ? 130 : 50,
                                width: 680 / 2,
                                height: showModalAgreement === 1 ? (630 / 2) : (Dimensions.get('window').height - 100),
                                backgroundColor: '#ffffff',
                                borderRadius: 5,
                                zIndex: 10,
                                shadowColor: '#a0a0a0',
                                shadowOffset: {
                                    width: 0,
                                    height: 0,
                                },
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                                elevation: 33,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                            }}>
                                <View style={{
                                    marginHorizontal: 5,
                                    marginVertical: 0,
                                    flex: 1,
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: (showModalAgreement !== 1 && (showModalAgreement === 2 || showModalAgreement === 8)) ? 'space-between' : 'flex-start',
                                }}>
                                    {showModalAgreement === 1 && (
                                        <Fragment>
                                            {globalParams.ocrPilot === 2 ? (
                                                <TouchableOpacity
                                                    style={{
                                                        height: 20,
                                                        marginBottom: 5,
                                                        marginTop: 5,
                                                        alignSelf: 'flex-start',
                                                        marginLeft: 5,
                                                    }}
                                                    onPress={this.closeModalAgreement}>
                                                    <Icons
                                                        name="close"
                                                        type="material-community"
                                                        size={25}
                                                        color={'#022258'}
                                                    />
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={{
                                                    height: 20,
                                                    marginBottom: 5,
                                                    marginTop: 0,
                                                    alignSelf: 'flex-start',
                                                    marginLeft: 5,
                                                }}/>
                                            )}
                                        </Fragment>
                                    )}

                                    {showModalAgreement !== 1 && (
                                        <Fragment>
                                            <View style={{
                                                height: 28,
                                                borderBottomColor: '#cbcccc',
                                                borderBottomWidth: 2,
                                                flexDirection: 'row-reverse',
                                                justifyContent: 'flex-start',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                                marginHorizontal: 10,
                                                marginTop: 0,
                                                width: '97%',
                                            }}>
                                                <TouchableOpacity
                                                    hitSlop={{
                                                        top: 10,
                                                        bottom: 10,
                                                        left: 10,
                                                        right: 10,
                                                    }}
                                                    onPress={this.backToAgreement}
                                                    style={{
                                                        marginRight: -6,
                                                        marginTop: -3,
                                                    }}>
                                                    <Icon
                                                        name="chevron-small-right"
                                                        type="entypo"
                                                        size={36}
                                                        color={'#022258'}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </Fragment>
                                    )}


                                    <Fragment>
                                        {showModalAgreement === 1 && (
                                            <Fragment>
                                                <Text
                                                    style={{
                                                        marginTop: 0,
                                                        color: '#022258',
                                                        fontSize: sp(17.5),
                                                        textAlign: 'center',
                                                        fontFamily: fonts.bold,
                                                    }}>{'אנו מברכים אותך לרגל הצטרפותך\n' +
                                                    'לשירות bizibox לרואה חשבון '}</Text>

                                                <Text
                                                    style={{
                                                        color: '#022258',
                                                        fontSize: sp(17),
                                                        lineHeight: 22.5,
                                                        textAlign: 'center',
                                                        marginBottom: 25,
                                                        fontFamily: fonts.semiBold,
                                                    }}>{'שיאפשר לך לשלוח צילומי מסמכים\n' +
                                                    'לתוכנת הנה"ח ישירות מהטלפון הנייד'}</Text>
                                            </Fragment>
                                        )}
                                        {showModalAgreement !== 1 && (
                                            <Fragment>
                                                <View style={{
                                                    height: (Dimensions.get('window').height - 100) - ((showModalAgreement === 2 || showModalAgreement === 8) ? 220 : 50),
                                                    width: '97%',
                                                }}>
                                                    <ScrollView
                                                        ref={ref => this.listView = ref}
                                                        onContentSizeChange={() => {
                                                            this.listView.scrollTo({y: 0})
                                                        }}
                                                        keyboardShouldPersistTaps="always"
                                                        style={{
                                                            flex: 1,
                                                            position: 'relative',
                                                        }}
                                                        contentContainerStyle={{
                                                            marginHorizontal: 15,
                                                            marginTop: 10,
                                                            paddingBottom: 10,
                                                        }}
                                                    >
                                                        {showModalAgreement === 2 && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>{'הסכם רישיון שימוש bizibox  לסריקת מסמכים  \n' +
                                                                    '[עודכן בתאריך: 8 מרס, 2021]\n'
                                                                }</Text>

                                                                <Text
                                                                    style={{fontFamily: fonts.bold}}>{'"הקדמה"'}</Text>{
                                                                '\n' +
                                                                'חברת איי-פקט בע"מ ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"החברה"'}</Text>{

                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אנחנו"'}</Text>{

                                                                '), מאפשרת למשתמש (כהגדרתו מטה) לסרוק מסמכים באמצעות "bizibox לסריקת מסמכים" אשר זמינה למשתמש הן בפורטל האינטרנטי של החברה  והן ביישומון (ביחד, יקראו הפורטל האינטרנטי והיישומון '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"האפליקציה"'}</Text>{

                                                                ').\n'}
                                                                <Text>{'השימוש באפליקציה והשירותים הניתנים ו/או שיינתנו בה ו/או באמצעותה כפופים גם '}
                                                                    <Text
                                                                        onPress={() => {
                                                                            this.setState({
                                                                                showModalAgreement: 3,
                                                                            })
                                                                        }}
                                                                        style={{
                                                                            color: '#038ed6',
                                                                        }}>{'למדיניות הפרטיות'}</Text>
                                                                    {', '}
                                                                    <Text
                                                                        onPress={() => {
                                                                            this.setState({
                                                                                showModalAgreement: 4,
                                                                            })
                                                                        }}
                                                                        style={{
                                                                            color: '#038ed6',
                                                                        }}>{'מדיניות האחריות הכללית'}</Text>
                                                                    {
                                                                        ' ו-'}
                                                                    <Text
                                                                        onPress={() => {
                                                                            this.setState({
                                                                                showModalAgreement: 5,
                                                                            })
                                                                        }}
                                                                        style={{
                                                                            color: '#038ed6',
                                                                        }}>{'מדיניות הקניין הרוחני והשימושים אסורים'}</Text>
                                                                    {
                                                                        ' של החברה ו'}

                                                                    <Text
                                                                        onPress={() => {
                                                                            this.setState({
                                                                                showModalAgreement: 6,
                                                                            })
                                                                        }}
                                                                        style={{
                                                                            color: '#038ed6',
                                                                        }}>{'הסכם רישיון השימוש בתוכנת bizibox לרו"ח ויועצי מס'}</Text>
                                                                    {' (ביחד יקראו תנאי הסכם רישיון זה, מסמכי המדיניות והסכם רישיון השימוש בתוכנת bizibox לרו"ח ויועצי מס '
                                                                    }<Text
                                                                        style={{fontFamily: fonts.bold}}>{'"תנאי הרישיון"'}</Text>{
                                                                        ' או '
                                                                    }<Text
                                                                        style={{fontFamily: fonts.bold}}>{'"ההסכם"'}</Text>{

                                                                        '). \n'}
                                                                </Text>

                                                                {'אישור תנאי הרישיון מהווים את הסכמתך ומודעותך לתוכנם וכן את והתחייבותך לפעול בהתאם ובכפוף להם. \n' +
                                                                    'הינך רשאי לסיים את ההסכם בכל רגע נתון וזאת באמצעות שליחת הודעה לחברה בכתובת service@bizibox.biz לאחר קבלת הודעתך, החברה תחסום את גישתך לאפליקציה באופן מידי. \n' +
                                                                    'עליך לדעת כי תנאי הרישיון עלולים להשתנות. אנו ניידע אותך ונבקש את הסכמתך לכך בעת שינויים מהותיים בהסכם ע"י "פופ-אפ" אשר יופיע בעת הכניסה לאפליקציה.\n' +
                                                                    'האמור בתנאים אלה מתייחס באופן שווה לנשים וגברים, והשימוש בלשון זכר נעשה מטעמי נוחות. כותרות הסעיפים בהסכם זה נועדו לנוחות בלבד, ואין להתחשב בהן בפרשנות תנאי הרישיון. \n'
                                                                }<Text
                                                                style={{fontFamily: fonts.bold}}>{'מי רשאי להשתמש באפליקציה'}</Text>{
                                                                '\n' +
                                                                'לתשומת ליבך כי השימוש באפליקציה מוגבל אך ורק למשתמש אשר נתן את הרשאתו המפורשת לרו"ח ו/או יועץ המס שלו ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"רו"ח"'}</Text>{

                                                                ') לעשות שימוש בתוכנת bizibox לרו"ח ויועצי מס לצורך מתן שירותי הנהלת חשבונות וייעוץ מס עבורו ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אתה"'}</Text>{

                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"המשתמש"'}</Text>{

                                                                '). בכך, המשתמש והשימוש בנתוניו כפוף לתנאי הסכם רישיון השימוש בתוכנת bizibox לרו"ח ויועצי מס ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"הסכם רו"ח"'}</Text>{

                                                                '). במידה ואינך מסכים לשימוש כאמור, נא הודע לנו מידית על כך באמצעות שליחת הודעה לחברה בכתובת service@bizibox.biz. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'רישיון השימוש באפליקציה'}</Text>{

                                                                ' \n' +
                                                                'במהלך תקופת ההסכם, בכפוף לכל דין, לנכונות הצהרותיך ומילוי כלל התחייבויותיך על פיו, החברה מעניקה לך בזאת רישיון שימוש מוגבל (כלומר, הרישיון ניתן לביטול, בלתי-ייחודי, בלתי ניתן להעברה, ולא ניתן להעניק בו רישיונות-משנה) באפליקציה ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"הרישיון"'}</Text>{
                                                                ' או '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"רישיון השימוש"'}</Text>{

                                                                ').\n' +
                                                                'מובהר בזאת כי החברה תהיה זכאית להעניק לכל צד שלישי אחר רישיון זהה או דומה לרישיון השימוש לפי שיקול דעתה הבלעדי. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'השימוש באפליקציה'}</Text>{

                                                                '\n' +
                                                                'באמצעות האפליקציה תוכל לסרוק מסמכים כגון קבלות, חשבוניות, צילומי צ\'קים וכד\' ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מסמכים פיננסיים"'}</Text>{

                                                                '), לרכז אותם בארכיון פיננסי ייעודי ולהעבירם באופן מקוון לרוה"ח או יועץ המס שלך.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'הצהרת המשתמש'}</Text>{

                                                                ' \n' +
                                                                'באישורך והסכמתך לתנאי הרישיון, יש בכדי להוות את הצהרתך להיבטים הבאים: \n' +
                                                                'קראת את הסכם המייצגים, אתה מודע לתנאיו ואתה מעניק בזאת הרשאת שימוש בנתוניך כמפורט בו וכנדרש כתנאי סף בהסכם זה.\n' +
                                                                'לא קיימת כל מניעה חוקית, חוזית או אחרת להתקשרותך בתנאי הרישיון ו/או בביצוע התחייבויותיך על פיהם ו/או ביחס לשימושך באפליקציה. \n' +
                                                                'שימושך באפליקציה יעשה בכפוף לאמור בתנאי הרישיון ובהתאם לכל דין (לרבות חוק הגנת הפרטיות והתקנות מכוחו).\n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'כללי'}</Text>{
                                                                ' \n' +
                                                                'מטעמי אבטחת מידע נדרש כי שימושך באפליקציה יעשה בשם משתמש וסיסמה אישיים. \n' +
                                                                'השימוש באפליקציה אינו תחליף להפעלת שיקול דעתך העצמאי. יובהר כי אין לראות בהענקת הרישיון בכדי לספק לך או לצד ג\' ייעוץ מכל סוג. \n' +
                                                                'תנאי השימוש אינם יוצרים ולא יתפרשו כאילו הם יוצרים יחסי שותפות, מיזם משותף, יחסי עובד-מעסיק, יחסי שליחות או יחסי נותן-מקבל זיכיון בין הצדדים. \n' +
                                                                'סמכות השיפוט הבלעדית לדון בכל מחלוקת ו/או סכסוך בקשר עם תנאי הרישיון תהא נתונה לבית המשפט המוסמך במחוז תל אביב. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'פניה לחברה'}</Text>{

                                                                ' \n' +
                                                                'במידה ויש לך שאלות נוספות או הערות בנוגע לתנאי השימוש, הינך מוזמן לפנות אלינו באמצעות דואר אלקטרוני בכתובת: service@bizibox.biz  או בצור קשר דרך אתר החברה https://www.bizibox.biz.'}
                                                            </Text>
                                                        )}

                                                        {(showModalAgreement === 3 || showModalAgreement === 8) && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>{'מדיניות הפרטיות - אפליקציה לסריקת מסמכים ("המדיניות")\n' +
                                                                    '[עודכן בתאריך: 8 מרס, 2021]\n'}
                                                                </Text>
                                                                {'כאמור בהסכם רישיון שימוש באפליקציה לסריקת מסמכים ('}
                                                                <Text
                                                                    style={{fontFamily: fonts.bold}}>{'"ההסכם"'}</Text>
                                                                {' ו'
                                                                }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"האפליקציה"'}</Text>{


                                                                ' בהתאמה), השימוש באפליקציה כפוף בין השאר למדיניות הפרטיות, אשר מהווה חלק בלתי נפרד מההסכם. ביטויים אשר לא הוגדרו במדיניות הפרטיות, תהא להם משמעות הזהה למשמעותם בהסכם, לרבות הסכם רישיון השימוש בתוכנת bizibox לרו"ח ויועצי מס (להלן יוגדר במדיניות פרטיות זו כ'

                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"הסכם רו"ח"'}</Text>{

                                                                ').\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'על מי חלה המדיניות?'}</Text>{


                                                                '\n' +
                                                                'מדיניות זו חלה  על משתמשים אשר נתנו הרשאתם המפורשת לרו"ח ו/או יועצי המס לעשות שימוש בתוכנת bizibox לרו"ח ויועצי מס (להלן תוגדר במדיניות פרטיות זו כ'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"תוכנת רו"ח"'}</Text>{


                                                                ') לצורך מתן שירותי הנהלת חשבונות וייעוץ מס להם (להלן: '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אתה"'}</Text>{


                                                                '). \n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'הסכמה'}</Text>{


                                                                ' \n' +
                                                                'מדיניות הפרטיות המפורטת במסמך זה מהווה הסכם משפטי מחייב ואכיף בינך לבין החברה. לפיכך, הנך מתבקש לקרוא אותה בקפידה רבה. \n' +
                                                                'בעצם השימוש המבוצע בנתוניך באפליקציה, בין אם על ידך ובין אם ע"י משתמש לו סיפקת את נתוניך לרבות רו"ח ו/או יועץ מס ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מורשה מטעמך"'}</Text>{


                                                                '), הינך מצהיר כי קראת והבנת את מדיניות הפרטיות, כי ניתנה לך האפשרות לעיין בה, וכי הינך מסכים לכל התנאים המפורטים בה. \n' +
                                                                'אם אינך מסכים לאי אילו מהתנאים המפורטים להלן, הנך מחויב, באופן מידי, להימנע מכניסה ו/או מכל שימוש באפליקציה בכל אופן ו/או להודיע זאת למורשה מטעמך. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'איזה מידע אנחנו רשאים לאסוף במסגרת המידע המוזן לאפליקציה?'}</Text>{


                                                                ' \n' +
                                                                'הסוג הראשון של מידע שהחברה אוספת הנו מידע אנונימי ואינו מזהה (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מידע לא אישי"'}</Text>{


                                                                '). \n' +
                                                                'מידע לא אישי הוא כל מידע גלוי אשר זמין לחברה בשעה שתשתמש באפליקציה, ואינו מאפשר את זיהויך. \n' +
                                                                'מידע לא אישי, כולל מידע אנונימי, טכני וכן מידע שנאסף אודות התנהגות המשתמש באפליקציה, ועשוי לכלול, בין היתר, את פעילותו באפליקציה, את זהות מערכת ההפעלה, זרם הקשות (click-stream), רזולוציית מסך המכשיר ממנו מתבצעת הגישה לאפליקציה וכיוצ"ב. \n' +
                                                                'הסוג השני של מידע שהחברה אוספת הנו מידע אישי מזהה. ככלל, בהסכמתך למדיניות זו, אתה מאשר לנו להשתמש בכל הנתונים והמידע אשר בהם אתה ו/או מורשה מטעמך ביצע/ת בהם שימוש מכל סוג (כהגדרתם בהסכם רו"ח), הן במסגרת ה"שימוש באפליקציה" ובפורטל (ר\' פירוט בהסכם) והן במסגרת "רישיון השימוש בתוכנה" ו"השימוש בתוכנה" (ר\' פירוט בהסכם רו"ח) (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מידע אישי"'}</Text>{


                                                                '). אינך מחויב למסור מידע אישי. \n' +
                                                                'המידע האישי, מאפשר לחברה לזהות באופן אישי את המשתמש ו/או את מושא הנתונים ובדרך כלל נושא אופי פרטי או רגיש. \n' +
                                                                'המשתמש מספק באופן אוטומטי בהתאם לרשת או למכשיר בהם מבוצע השימוש. מידע זה נאסף בין השאר על מנת לשפר את חוויית המשתמשים ולמטרות אבטחה. \n' +
                                                                'בנוסף, אנו אוספים מידע אישי הנמסר על-ידי המשתמש באופן מודע ומרצונו החופשי במהלך השימוש באפליקציה. מידע זה כולל בין היתר מידע המצוי ב"מסמכים פיננסיים" (כהגדרתם בהסכם), את ה"נתונים" (כהגדרתם בהסכם רו"ח), וכן כל מידע המתקבל עם ו/או עקב השימוש באפליקציה ו/או באמצעות תוכנת רו"ח ,וכן כל תוצר שהופק באמצעותן. \n' +
                                                                'כחלק מהשימוש באפליקציה, כל משתמש נדרש בפתיחת חשבון אישי. המידע להלן נאסף במסגרת פתיחת החשבון: (א) כתובת דואר-אלקטרוני; (ב) שם מלא; (ג) מספר ח.פ./ע.מ.(במידה ומדובר בעוסק מורשה); (ד) פרטי חשבון בנק ו/או כרטיסי אשראי; (ה) מספר טלפון סלולארי; (ו) שם משתמש וסיסמת כניסה לפורטל ו/או לאפליקציה; (ז) פרטי אמצעי תשלום (המידע נאסף על-ידי ספקי שירותי סליקה כמפורט להלן); ו- (ח) כל הפרמטרים הנדרשים להתחברות לכל מקורות המידע הפיננסי אשר ברשות המשתמש ו/או מורשה מטעמו אשר ברצונו לקשר לאפליקציה ו/או לתוכנה, לרבות שמות המשתמש והסיסמאות הרלוונטיות לכל אחד ממקורות המידע הפיננסי.\n' +
                                                                'המידע האישי שמסרת לחברה יישמר במאגר המידע המאובטח של החברה והגישה אליו תהיה מוגבלת בלבד. כמו כן, מידע אודות שימושים ספציפיים שביצעת באפליקציה, ייאסף אף הוא וייחשב כחלק מה-"מידע האישי" כאמור לעיל.\n' +
                                                                'כאמור בהסכם, באמצעות האפליקציה תוכל לסרוק מסמכים פיננסיים, לרכז אותם בארכיון פיננסי ייעודי ולהעבירם באופן מקוון לרוה"ח או יועץ המס שלך. ע"מ שתוכל לבצע את השימוש באפליקציה, עליך לתת לנו הרשאת גישה למכשיר בו מותקנת האפליקציה:\n' +
                                                                'הרשאה לקבלת Push Notifications  - הרשאה זאת מתבקשת על מנת שהמשתמש יוכל לקבל התראות "דחיפה", (ר\' פירוט מטה).\n' +
                                                                'הרשאת גישה למצלמת המכשיר וגישה לגלריית  התמונות, והתקני אחסון וזיכרון במכשיר - הרשאה זאת מתבקשת עבור אפליקציית סריקת המסמכים הפיננסיים ישירות ממכשירך.\n' +
                                                                '(להלן יחדיו: '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"המידע"'}</Text>{


                                                                ')\n' +
                                                                'הנך מסכים ומצהיר בזאת שהמידע האישי שהינך מספק לנו, בין אם ישירות ובין אם ע"י מורשה מטעמך, נמסר מרצונך החופשי, על מנת שנוכל לספק עבורך את שירותי האפליקציה וכן הינך מסכים כי נשמור את המידע שסיפקת לנו במאגר מידע (אשר יתכן ויירשם בהתאם לדרישות הדין). \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שימוש במידע'}</Text>{


                                                                '\n' +
                                                                'אנו נשתמש במידע האישי שמסרת ו/או במידע הסטטיסטי שנאסף אצלנו לצורך אספקת שירותים, לצורך שינוי ושיפור התכנים, כך שיתאימו לאופי המשתמש, לרבות להעדפותיך ממש, כפי שמשתקף מניתוח המידע הסטטיסטי שנאסף בחברה לגבי הרגלי השימוש באפליקציה.\n' +
                                                                'המידע שנאסוף, לרבות באמצעות השימוש בקבצי \'עוגיות\' (ראה בהמשך), עשוי לזהות אותך בכל פעם שתיכנס לאפליקציה וכך לייתר את הצורך בהזנת שם המשתמש והסיסמא בכניסותיך החוזרות לאפליקציה.\n' +
                                                                'אנו נשתמש במידע האישי שמסרת על מנת ליצור איתך קשר בעת הצורך, ו/או, במידה ונתת את הסכמתך לכך ע"י סימון V בתיבה המיועדת לכך, לשלוח אליך מדי פעם פרסומות ו/או הודעות באמצעות דואר אלקטרוני לפי הפרטים שמסרת בעת הרישום, ובהם עדכונים על מבצעים שונים באפליקציה, חידושים בשירותים הניתנים, שוברי הנחה, הודעות ו/או פרסומות שונות, בין מטעם החברה ובין מטעם צדדים שלישיים (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"דברי פרסומת"'}</Text>{


                                                                '). \n' +
                                                                'סימון ה-V בתיבה המיועדת לכך, כמו גם המשך השימוש שלך באפליקציה והסכמתך לכללי מדיניות זו מהווים הסכמה לקבלת דברי פרסומת בהתאם להוראות סעיף 30א לחוק התקשורת (בזק ושירותים), התשמ"ב–1982. לתשומת לבך כי, בכפוף להוראות הדין, בכל עת תוכל לבחור לחדול מלקבל הודעות דברי פרסומת כאמור על-ידי מחיקת פרטיך מרשימת הדיוור של האפליקציה. זאת, באמצעות משלוח בקשה להסרה מרשימת הדיוור ע"י לחיצה על "הסר" בגוף ההודעה מרגע בו הסכמה זו ניתנת, כל חומר שנשלח אליך מטעם החברה לא יחשב כספאם מכל סוג ומין אשר מהווה או יש בו כדי להוות הפרה של חוק הספאם. \n' +
                                                                '\n' +
                                                                'אנו נשתמש במידע הסטטיסטי שנאסף ו/או נאגר אצלנו לצרכינו הפנימיים, לרבות על מנת לדאוג לתפעול האפליקציה ופיתוחה, לשיפור המבנה שלה, השירותים הניתנים בה וכד\'. לשם כך, עשויים אנו להסתייע בצדדים שלישיים לצורך איסוף וניתוח המידע הסטטיסטי והאנונימי כדי ללמוד על הרגלי השימוש שלך ושל יתר משתמשי האפליקציה באופן שלא יזהה אותך ו/או את יתר המשתמשים באופן אישי. \n' +
                                                                'אנו נשתמש במידע שמסרת או במידע שנאסף אצלנו לכל מטרה אחרת בקשר עם אספקת השירותים המוצעים באפליקציה, לרבות כל מטרה המפורטת במדיניות זו ו/או בתנאי השימוש.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'איסוף מידע לצרכים סטטיסטיים'}</Text>{


                                                                '\n' +
                                                                'החברה נעזרת בחברות שונות המספקות לה ניתוחים סטטיסטיים אודות השימוש באפליקציה. החברות אוספות ומנתחות מידע על היקף השימוש באפליקציה, תדירות השימוש בהם, מקורות הגישה של המשתמשים אליהם וכיוצא בזה. המידע הנאסף הוא סטטיסטי במהותו, הוא איננו מזהה אותך אישית והוא נועד לצרכי ניתוח, מחקר ובקרה.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'מסירת מידע ואיסוף המידע'}</Text>{


                                                                '\n' +
                                                                'המידע שמסרת לחברה ישמר במאגר המידע של החברה (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מאגר המידע"'}</Text>{


                                                                '). \n' +
                                                                'בעת מסירת המידע האישי לחברה, עליך להקפיד למסור פרטים נכונים, מלאים ולא שגויים או מסולפים. ככל שיחולו שינויים במידע האישי אותו מסרת בעת הרישום, תתבקש לעדכן את הנתונים בחשבון המשתמש שלך באפליקציה. \n' +
                                                                'המידע הסטטיסטי הנאסף בעת השימוש באפליקציה על-ידינו מכיל רק את המידע הנחוץ לנו לצורך מתן השירותים ושיפורם. אנו נעשה במידע זה שימוש בכפוף למדיניות הפרטיות המפורטת להלן ובהתאם להוראות חוק הגנת הפרטיות, התשמ"א–1981 (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"חוק הגנת הפרטיות"'}</Text>{


                                                                '). \n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'מידע אישי'}</Text>{


                                                                ' – החברה לא תעביר לצדדים שלישיים את המידע האישי אלא באחד המקרים המפורטים להלן: \n' +
                                                                'במידה והחברה ביקשה את רשותך, ואת/ה נתת את הסכמתך המפורשת לכך;\n' +
                                                                'במקרה שתפר את ההסכם;\n' +
                                                                'במידה ויתקבל צו מבית משפט או מכל ערכאה מוסמכת אחרת, המורה לחברה למסור את פרטיך או המידע האישי אודותיך לידי בית המשפט או הערכאה האחרת או לידי צד שלישי כלשהו; \n' +
                                                                'במקרה של מחלוקת משפטית בינך לבין החברה שתחייב את חשיפת פרטיך;\n' +
                                                                'בכל מקרה שהחברה תסבור, כי מסירת המידע נחוצה כדי למנוע נזק חמור לגופך או לרכושך או לגופו או לרכושו של צד שלישי;\n' +
                                                                'החברה תהיה רשאית להעביר את פרטיך והמידע שנאסף בעקבות השימוש שעשית באפליקציה לחברות אחרות הקשורות לחברה, ובלבד שהן תשתמשנה במידע זה רק על-פי הוראות מדיניות פרטיות זו;\n' +
                                                                'במקרה שהחברה תתמזג עם גוף אחר או תמזג את פעילותיה עם פעילותו של צד שלישי - היא תהיה זכאית להעביר לתאגיד החדש העתק מן המידע שנאגר אודותיך או כל מידע סטטיסטי שבידיה, ובלבד שתאגיד זה יקבל על עצמו את הוראות מדיניות פרטיות זו.\n' +
                                                                'במידה ומסירת המידע האישי הינה לעובדים המוסמכים של החברה ו/או לשלוחים מטעמה ו/או לפועלים מטעמה, והיא במידה הנדרשת והחיונית לצורך אספקת השירותים ותפעול הפורטל ו/או האפליקציה; \n' +
                                                                'במידה ומסירת המידע נעשית עפ"י דין.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'מידע סטטיסטי'}</Text>{


                                                                ' – החברה עשויה להעביר מידע סטטיסטי, בתמורה או שלא בתמורה, לצדדים שלישיים המצויים איתם בקשרים עסקיים או אחרים, לרבות חברות העוסקות בניתוח מידע סטטיסטי אנונימי כאמור לצורך שיפור השירותים המוצעים באפליקציה, לפי שיקול דעתם הבלעדי של החברה.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"עוגיות" (Cookies) ואחסון מקומי'}</Text>{


                                                                '\n' +
                                                                'בשעת השימוש באפליקציה, החברה או צדדים שלישיים עשויים להשתמש בטכנולוגיה אשר מקובלת בתעשייה ומוכרת כ"עוגיות" ו-Flash (או טכנולוגיות דומות), המאחסנת מידע מסוים במכשיר של המשתמש, מאפשרת לחברה להפעיל מאפיינים מסוימים באופן אוטומטי, ומשפרת את חווית השימוש של המשתמש בשירותי החברה. \n' +
                                                                'העוגיות נדרשות בין השאר לצורך תפעול האפליקציה באופן שוטף, ובכלל זה, בכדי לאסוף נתונים אודות הרגלי השימוש באפליקציה ולזהות דפוסי משתמשים, לאימות פרטים, להתאמת להעדפותיך האישיות ולצרכי אבטחת מידע.\n' +
                                                                'עוגיות ניתנות למחיקה.  עם זאת, יש לשים לב כי אם המשתמש ימחק את העוגיות או לא יאפשר את אחסונן, או אם ישנה את המאפיינים של Flash, החוויה המקוונת של המשתמש עלולה להיות מוגבלת.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'זכות עיון במידע'}</Text>{


                                                                '\n' +
                                                                'על-פי חוק הגנת הפרטיות, כל אדם זכאי לעיין בעצמו, או על-ידי בא-כוחו שהרשהו בכתב או על-ידי אפוטרופוסו, במידע שעליו המוחזק במאגר מידע. אדם שעיין במידע שעליו ומצא כי אינו נכון, שלם, ברור או מעודכן, רשאי לפנות לבעל מאגר המידע בבקשה לתקן את המידע או למוחקו. אם בעל המאגר סירב למלא בקשה זו, עליו להודיע על כך למבקש באופן ובדרך שנקבעו בתקנות. על סירובו של בעל מאגר מידע לאפשר עיון ועל הודעת סירוב לתקן או למחוק מידע, רשאי מבקש המידע לערער לפני בית משפט השלום באופן ובדרך שנקבעו בתקנות.\n' +
                                                                'בנוסף, אם המידע שבמאגרי החברה משמש לצורך פניה אישית אליך, בהתבסס על השתייכותך לקבוצת אוכלוסין, שנקבעה על-פי איפיון אחד או יותר של בני אדם ששמותיהם כלולים במאגר (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"פניה בהצעה מסחרית"'}</Text>{


                                                                '), כי אז אתה זכאי על-פי חוק הגנת הפרטיות, לדרוש בכתב שהמידע המתייחס אליך יימחק ממאגר המידע. החברה תימחק במקרה זה מידע הדרוש לה רק כדי לפנות אליך בהצעות מסחריות כאמור לעיל. מידע הדרוש להחברה לשם ניהול עסקיה - לרבות תיעוד פעולות מסחריות ואחרות שביצעת באפליקציה - יוסיף להישמר בהחברה על-פי דין, אך לא ישמש עוד לצורך פניות אליך. אם בתוך 30 יום לא תקבל הודעה כי המידע שנתבקשה החברה למחוק אכן נמחק על-פי סעיף זה, תהיה זכאי לפנות לבית משפט השלום באופן הקבוע בתקנות שמכוח החוק, כדי שיורה להחברה לפעול כאמור.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"הודעות Push"'}</Text>{


                                                                '\n' +
                                                                'החברה מיישמת ו/או עלולה ליישם בעתיד, במסגרת השימוש באפליקציה, שירות הודעות בדחיפה (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"הודעות ה-Push"'}</Text>{


                                                                ') המאפשר לשלוח התראות וצלילים אף אם האפליקציה איננה פעילה, זאת, דרך שרתי מערכת ההפעלה של המחשב בו מבוצע השימוש באפליקציה. \n' +
                                                                'יתכן, כי במסגרת השימוש באפליקציה, תישלחנה, מעת לעת, למחשבך הודעות Push באמצעותן תוכל להתעדכן אודות מוצרים ושירותים נוספים שהחברה סבורה כי אתה עשוי למצוא בהם עניין, וכן לקבל מידע נוסף אודות החברה ושירותיה. הודעות ה-Push תישלחנה בזמנים ובתדירות כפי שייקבע על-ידי החברה. \n' +
                                                                'הינך מצהיר כי ידוע לך שהודעות ה-Push עשויות לכלול מסרים שעשויים להיחשב כ-"דבר פרסומת" כהגדרתו בסעיף 30א לחוק התקשורת (בזק ושידורים), התשס"ח–2008, והינך רשאי לבטל או לעדכן את האפשרות לקבל את הודעות ה-Push, כולן או מקצתן, בכל עת, באמצעות שינוי הגדרות האפליקציה במכשיר הנייד שברשותך.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שירותי צדדים שלישיים'}</Text>{


                                                                ' \n' +
                                                                'אנו רשאים להשתמש באפליקציה או בשירותי צד שלישי על מנת לאסוף, לאחסן ו/או לעבד את המידע שנאסף במסגרת הפורטל ו/או האפליקציה. אנו עושים מאמצים על מנת להתקשר עם צדדים שלישיים המפרסמים מדיניות פרטיות החלה על איסוף, אחסון, עיבוד ושימוש במידע אישי ובמידע לא אישי. שירותי צדדים שלישיים כוללים, בין היתר, Google Analytics, אשר מדיניות הפרטיות שלה מפורסמת בכתובות: https://www.google.com/policies/privacyוחברת קארדקום בע"מ, אשר פרטים בנוגע למדיניות הפרטיות שלה ניתן למצוא בכתובות: http://www.cardcom.co.il/MainPage.aspx. \n' +
                                                                'יחד עם זאת, לחברה אין כל שליטה על צדדים שלישיים אלה. אנו ממליצים לך לקרוא את תנאי השימוש ומדיניות הפרטיות של צדדים שלישיים אלה ו/או לפנות אליהם במישרין על מנת שתוכל לדעת אילו סוגי מידע נאספים לגביך.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שינויים במדיניות הפרטיות'}</Text>{


                                                                '\n' +
                                                                'החברה שומרת על זכותה לשנות מדיניות פרטיות זו בכל זמן, ומבקשת מכלל המשתמשים לשוב ולבקר בדף זה לעיתים קרובות ככל האפשר. \n' +
                                                                'אנו נודיע למשתמש על כל שינוי מהותי בתנאי מדיניות פרטיות זו, על-ידי פופ-אפ בכניסה למוצר המבקש אישור מחדש למדיניות הפרטיות\n' +
                                                                ' שינויים שאינם מהותיים יכנסו לתוקף תוך שבעה (7) ימים ממועד ההודעה כאמור. כל שאר השינויים במדיניות הפרטיות ייכנסו לתוקף באופן מידי והמשך השימוש שלך באפליקציה לאחר תאריך העדכון האחרון יהווה הסכמה שלך לכך שהשינויים יחייבו אותך. \n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'שאלות'}</Text>{


                                                                '\n' +
                                                                'במידה ויש לך שאלות נוספות או הערות בנוגע לתנאים, הינך מוזמן לפנות אלינו ב”צור קשר” דרך האתר https://www.bizibox.biz או באמצעות דואר אלקטרוני בכתובת: service@bizibox.biz. אנו נעשה את מירב המאמצים לחזור אליך תוך זמן סביר.\n'}
                                                            </Text>
                                                        )}
                                                        {showModalAgreement === 5 && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>{'מדיניות קניין רוחני ושימוש אסורים כלליים באפליקציית bizibox לסריקת מסמכים\n' +
                                                                    '[עודכן בתאריך: 30/11/20]\n' +
                                                                    '\n'}</Text>

                                                                {
                                                                    'כאמור בהסכם רישיון שימוש באפליקציית bizibox לסריקת מסמכים, השימוש באפליקציה כפוף בין השאר למדיניות הקניין הרוחני ושימוש אסורים כלליים אשר מהווה חלק בלתי נפרד מ"תנאי הרישיון". ביטויים אשר לא הוגדרו במדיניות זו, תהא להם משמעות הזהה למשמעותם בהסכם. אנא קרא בעיון את ההוראות הבאות:\n'
                                                                }<Text
                                                                style={{fontFamily: fonts.bold}}>{'קניין רוחני'}</Text>{


                                                                ' \n' +
                                                                'מלוא זכויות הקניין הרוחני באפליקציה הנם בבעלות קניינית מלאה ובלעדית של החברה ו/או בשימושה לפי רישיון שימוש שקיבלה. \n' +
                                                                'בין זכויות קניין רוחני אלו, אך לא רק ומבלי להגביל את כלליות האמור: שמות מתחם (בין אם רשומים או ניתנים לרישום ובין אם לאו), חוויית משתמש, תוכן (מילולי, חזותי, קולי, או כל שילוב שלהם או חלק מהם וכן עיצובו, עיבודו, עריכתו ודרך הצגתו), טקסט, מידע, גרפיקה, עיצובים, תמונות, צילומים, וידאו/סרטונים, לוגו, סמלים, ממשקים, הודעות, מוניטין, זכויות יוצרים, סימני מסחר (בין רשומים ובין אם לאו), פטנטים, רעיונות, פיתוחים, קוד מקור, שיטות, תהליכים, טכנולוגיות, כל זכויות דומות באשר הן.\n' +
                                                                'המשתמש לא יעתיק, ישכפל, יפיץ, יפרסם, ישדר, יציג, ישנה, יעבד או יעשה כל שימוש באפליקציה לכל מטרה, שלא הותרה במפורש לפי תנאי השימוש, ובכלל זה כל שימוש העשוי לפגוע בזכויות הקניין הרוחני של החברה ו/או של צד ג\' אחר כלשהו. \n' +
                                                                'המשתמש לא יעביר בכל דרך שהיא לצד ג\' כלשהו כל ו/או חלק מהקניין הרוחני של החברה ו/או מהאפליקציה ו/או מרישיון השימוש שלו, ללא קבלת הסכמה מפורשת מראש ובכתב מאיתנו ובכפוף לה.  \n' +
                                                                'אישור תנאי השימוש על ידך מהווה הסכמה לכך שנבצע שימוש מכל סוג וכפי שנמצא לנכון, בכל משוב, המלצה או רעיון מכל סוג שהוא, שתעביר לחברה. בכך מוענק לנו רישיון תמידי, הניתן להעברה ולרישוי משנה, גלובלי, בלתי חוזר, משולם במלואו וללא חיוב בתגמולים להשתמש בכל דרך שהיא באלו. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'זכויות ושימושים בתמונות המסמכים הפיננסיים'}</Text>{


                                                                '\n' +
                                                                'השימוש באפליקציה מותנה בכך שצילום המסמכים שתעשה במסגרת שימושך באפליקציה יהיה של המסמכים הפיננסיים האישיים שלך בלבד. \n' +
                                                                'הזכויות במסמכים הפיננסיים אותם תצלם שייכות לך, ואתה מעניק לחברה רישיון חינם, כלל-עולמי, לא בלעדי, בלתי ניתן לביטול וניתן להעברה להשתמש, להעתיק, להפיץ, להכין יצירות נגזרות, ולבצע כל פעולה אחרת הנדרשת עפ"י שיקול דעת החברה לצורך אספקת השירותים לפי תנאי הרישיון, והכול בהתאם למדיניות הפרטיות ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"רשות השימוש של החברה"'}</Text>{


                                                                ').\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שימושים אסורים'}</Text>{


                                                                '\n' +
                                                                'פעולות מסוימות אסורות בעת השימוש באפליקציה, אי עמידה בהוראות המצוינות להלן אף עשויה לחשוף את המשתמש לחבות אזרחית ו/או פלילית. אינך רשאי (ואינך רשאי להתיר לכל צד שלישי) לבצע שימוש ו/או פעולה מבין השימושים שיפורטו להלן, אלא אם הותר לך במפורש על-פי תנאי שימוש אלה: \n' +
                                                                'להשתמש באפליקציה לכל מטרה בלתי חוקית, בלתי מוסרית, בלתי-מורשית ו/או אסורה. \n' +
                                                                'להשתמש באפליקציה למטרות מסחריות או שאינן פרטיות, ללא הסכמה מפורשת של החברה בכתב ומראש. \n' +
                                                                'להסיר או להפריד מהאפליקציה הגבלות וסימנים המציינים זכויות קנייניות של החברה והנך מצהיר ומתחייב בזאת כי תציית לכל החוקים החלים בעניין זה. \n' +
                                                                'להפר ו/או לפגוע בזכויות המשתמשים לפרטיות וזכויות אחרות, או לאסוף מידע אישי מזהה אודות משתמשים ללא הסכמתם המפורשת, בין אם באופן ידני או באמצעות שימוש בכל רובוט, עכביש, זחלן, כל יישום חיפוש או אחזור, או שימוש באמצעי, בתהליך או בשיטה ידניים או אוטומטיים אחרים על מנת להיכנס לאתר ולאחזר, לאסוף ו/או לשאוב מידע. \n' +
                                                                'לפגוע או לשבש בפעולת האפליקציה ו/או האפליקציה או השרתים או הרשתות המאחסנות את האתר, או להפר כל חוק, תקנה, דרישה, נוהל או מדיניות של שרתים או רשתות כאמור. \n' +
                                                                'להצהיר הצהרות שקריות או להציג מצג שווא בנוגע לקשר שלך עם כל אדם או גוף, או לציין במפורש או במרומז כי החברה משויכת אליך בכל דרך שהיא, מעניקה חסות, תומכת בך, באתר שלך, בעסקך או בהצהרותיך, או להציג מידע שקרי או לא מדויק אודות החברה. \n' +
                                                                'לבצע כל פעולה היוצרת או העלולה ליצור עומס גדול ובלתי סביר על תשתית האפליקציה.\n' +
                                                                'לעקוף את כל האמצעים בהם החברה משתמשת על מנת למנוע או להגביל את הגישה לאפליקציה.\n' +
                                                                'להעתיק, לתקן, לשנות, להתאים, למסור, להנגיש, לתרגם, להפנות, לבצע הנדסה חוזרת, להמיר קוד בינארי לקוד פתוח, לעשות דה-קומפילציה, או להפריד כל חלק באפליקציה.\n' +
                                                                'להציג לציבור, ליצור יצירות נגזרות, לבצע, להפיץ, לתת רישיון משנה, לעשות כל שימוש מסחרי, למכור, להשכיר, להעביר, להלוות, לעבד, לאסוף, לשלב עם אפליקציה אחרת – של כל חומר הכפוף לזכויות קנייניות של החברה, לרבות קניין רוחני של החברה בכל אופן או בכל אמצעי, אלא אם הדבר הותר במפורש בתנאים ו/או על-פי כל דין החל, המתיר פעולות אלו במפורש. \n' +
                                                                'לעשות כל שימוש באפליקציה לכל מטרה שלא הורשתה במפורש, ללא הסכמה של החברה בכתב ומראש. \n' +
                                                                'למכור, לתת רישיון, או לנצל למטרה מסחרית כלשהי כל שימוש או גישה לאפליקציה. \n' +
                                                                'ליצור מאגר מידע על-ידי הורדה ואחסון שיטתיים של כל או חלק מהתוכן באפליקציה.\n' +
                                                                'להעביר או להנגיש בכל דרך אחרת, בקשר לאפליקציה כל וירוס, “תולעת”, סוס טרויאני, באג, רוגלה, נוזקה, או כל קוד מחשב, קובץ או אשר עשויים להזיק, או נועדו להזיק לפעילות של כל חומרה, אפליקציה, ציוד תקשורת, קוד או רכיב. \n' +
                                                                'להפר אי אלו מתנאי הרישיון.\n'}</Text>
                                                        )}
                                                        {showModalAgreement === 4 && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>
                                                                    {'מדיניות האחריות הכללית - bizibox לסריקת מסמכים\n' +
                                                                        '[עודכן בתאריך: 29/11/2020]\n' +
                                                                        '\n'
                                                                    }
                                                                </Text>


                                                                <Text
                                                                    style={{fontFamily: fonts.bold}}>{'כאמור בהסכם רישיון שימוש בתוכנת bizibox לסריקת מסמכים, השימוש באפליקציה כפוף בין השאר למדיניות האחריות הכללית של האפליקציה אשר מהווה חלק בלתי נפרד מ”תנאי הרישיון”. ביטויים אשר לא הוגדרו במדיניות זו, תהא להם משמעות הזהה למשמעותם בהסכם.אנא קרא בעיון את ההוראות הבאות:'}</Text>{


                                                                '\n' +
                                                                'אנו עושים מאמצים על מנת להבטיח שהאפליקציה תהייה זמינה עבורך באופן רציף וכי השימוש בה יהיה יעיל ומאובטח ככל הניתן. ככל שתתגלה תקלה הנובעת מהאפליקציה, נפעל לתקנה (יתכן כי באמצעות צד ג\'), בכפוף לקבלת הודעת קריאה בסמוך למועד גילוי התקלה ולשיתוף פעולתך בנושא.\n' +
                                                                'עם זאת, השימוש באפליקציה, תלוי בגורמים שאינם בשליטת החברה ולכן איננו מתחייבים שהשימוש בה יהיה ללא תקלות ו/או הפרעות ו/או נקי מפגמים ו/או הגבלות אחרות ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'“תקלה”'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'“תקלות”'}</Text>{


                                                                ') ולכן החברה אינה אחראית להיבטים אלו ולאחרים. אנא שים לב לתקלות אפשריות העלולות להתרחש במסגרת השימוש באפליקציה:\n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'זמינות'}</Text>{


                                                                ' \n' +
                                                                'יתכן ומעת לעת לא יתאפשר זמנית השימוש באפליקציה בשל תקלה, עדכון, תחזוקה, תיקון ו/או כל פעולה אחרת, שהחברה, לפי שיקול דעתה הבלעדי תנקוט.  \n' +
                                                                'החברה שומרת לעצמה את הזכות לתקן, להרחיב, לשפר, לעדכן, לשדרג, לאבטח, להוסיף תכונות חדשות, להסיר, ו/או לערוך כל התאמה ו/או שינוי אחר באפליקציה, בלא צורך להודיע על כך מראש. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'דיוק וטכנולוגיה'}</Text>{


                                                                '\n' +
                                                                'החברה משקיעה מאמצים רבים בהגנה מפני סיכונים הטמונים בטכנולוגיה ומבצעת מאמצים רבים לנאמנות המידע ביחס לנתוני המקור, אך עם זאת, יתכנו אי-דיוקים במידע לאור גורמים רבים הקשורים בכשלים טכנולוגיים פוטנציאליים הכרוכים בסריקת מסמכים לרבות איכות הצילום, רזולוציית המצלמה וכד\'.\n' +
                                                                'החברה אינה בודקת ואינה אחראית לדיוק ו/או לנכונות ו/או לשלמות התיעוד שתבצע והתוצרים שהיועץ הפיננסי שלך יפיק ממסמכים אלו. \n' +
                                                                'הנך מחויב לבדוק את דיוק תיעוד המסמכים הפיננסיים ביחס להשוואתם למסמכי המקור. \n' +
                                                                'החברה אינה מצהירה, בכל צורה כי המסמכים הפיננסיים המקוונים שיופקו באמצעות האפליקציה מדויקים, איכותיים, מקצועיים, נכונים.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'סיכוני אינטרנט'}</Text>{


                                                                ' \n' +
                                                                'אנו משקיעים מאמצים רבים בהגנה מפני סיכונים הטמונים באינטרנט לרבות סיכוני סייבר. \n' +
                                                                'עם זאת, אין ביכולתנו ו/או בשליטתנו למנוע לחלוטין את חדירתן ופעולתן של תוכנות מזיקות וגורמים עוינים כגון וירוסים, באגים, רוגלות, או כל קודי מחשב, קבצים או תוכנות אחרות אשר עשויים לבצע תרמיות והונאות מקוונות וכד\'.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'הגבלת אחריות'}</Text>{


                                                                '\n' +
                                                                'השירותים באפליקציה ניתנים לך “כמות שהם”(“as is”) , ללא כל התחייבות או אחריות מכל סוג שהוא, באופן מפורש או מכללא, לרבות בין השאר, אחריות בנוגע לסחירות, דיוק, אי הפרה של זכויות קניין רוחני, או להתאמה למטרה מסוימת.\n' +
                                                                'הסכמה לתנאי השימוש משמעה שבדקת את האפליקציה על כלל האמור בתנאי השימוש, ומצאת כי האפליקציה מתאימה לצרכיך ולמטרותיך.  \n' +
                                                                'כאמור ולמען הסר ספק, השימושים באפליקציה אינו מהווה ייעוץ כספי, פיננסי, חשבונאי, מיסויי, ייעוץ בהשקעות ו/או כל ייעוץ אחר, ואין בשימוש משום הצעה, שידול ו/או ייעוץ לביצוע כל עסקה, פעולה ו/או קבלת החלטה כלשהי.  \n' +
                                                                'החברה תהיה פטורה מכל אחריות לכל הוצאה, הפסד, נזק ישיר ו/או עקיף, הפסד הכנסה או עסקים, רווח מנוע, פגיעה במוניטין וכיו”ב, שנגרם ו/או אשר עלול להיגרם לך,  ו/או לכל צד ג\' אחר בקשר עם ו/או כתוצאה משימוש באפליקציה בעקיפין /או במישרין ו/או בקשר עם תנאי השימוש ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'“פטור מאחריות”'}</Text>{


                                                                '). \n' +
                                                                'פטור מאחריות זה, כולל, בין השאר, אך לא רק, נזק עקב טעות, תקלות ,תפעול שגוי של האפליקציה, תקלות ו/או נזקים הנובעים מצדדים שלישיים להסכם, זמינות ו/או זמני תגובה של המערכות הממוחשבות שלך ו/או של צדדים שלישיים, שיבושים במידע ו/או בנתונים ו/או בקבלתם ו/או באובדנם כתוצאה מתקלות אחרות שאינן בשליטת החברה, ובכלל זה תקלה ו/או חוסר התאמה ו/או דיוק בין הנתונים המקוריים לאלו אשר נקלטו באפליקציה. \n' +
                                                                'החברה מצהירה, כי לא תוכל לספק את רישיון השימוש ללא הגבלת האחריות כאמור לעיל.  \n' +
                                                                'בכל מקרה, שלטענתך, נגרם לך ו/או למי מטעמך נזק בקשר לאפליקציה ו/או למידע ו/או לתנאי השימוש, עליך למסור מיד הודעה בכתב לחברה בליווי כל המידע ו/או החומר הרלבנטיים, ולשתף עמנו פעולה בכל עניין בקשר לכך.\n' +
                                                                'הנך מתחייב/ת בזאת לשפות ולפצות את החברה או מי מטעמה, בגין כל נזק, הוצאה או הפסד, ישיר או עקיף, לרבות הוצאות משפט ושכ”ט עורכי דין, שיגרמו לה בקשר עם הפרת תנאי השימוש, או ביצוע כל פעולה אחרת בניגוד לדין בקשר האפליקציה. \n' +
                                                                '\n' +
                                                                ' \n' +
                                                                '\n'}</Text>
                                                        )}

                                                        {showModalAgreement === 6 && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>
                                                                    {'הסכם רישיון שימוש בתוכנת bizibox לרו"ח ויועצי מס\n' +
                                                                        '[עודכן בתאריך: 8 מרס, 2021]\n' +
                                                                        '\n'}
                                                                </Text>

                                                                <Text style={{fontFamily: fonts.bold}}>{'הקדמה'}</Text>{

                                                                '\n' +
                                                                'השימוש בתוכנת  bizibox ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"התוכנה"'}</Text>{


                                                                ') ע"י רו"ח ויועצי מס ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"המשתמש"'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אתה"'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"רו"ח"'}</Text>{


                                                                ') מבית חברת איי-פקט בע"מ ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"החברה"'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אנחנו"'}</Text>{


                                                                '), על השירותים הניתנים ו/או שיינתנו בה ו/או באמצעותה ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"השירותים"'}</Text>{


                                                                ') כפוף גם ל'}
                                                                <Text
                                                                    onPress={() => {
                                                                        this.setState({
                                                                            backTo6: true,
                                                                            showModalAgreement: 3,
                                                                        })
                                                                    }}
                                                                    style={{
                                                                        color: '#038ed6',
                                                                    }}>{'מדיניות הפרטיות'}</Text>
                                                                {', '}
                                                                <Text
                                                                    onPress={() => {
                                                                        this.setState({
                                                                            backTo6: true,
                                                                            showModalAgreement: 4,
                                                                        })
                                                                    }}
                                                                    style={{
                                                                        color: '#038ed6',
                                                                    }}>{'מדיניות האחריות הכללית'}</Text>
                                                                {' ו-'}
                                                                <Text
                                                                    onPress={() => {
                                                                        this.setState({
                                                                            backTo6: true,
                                                                            showModalAgreement: 5,
                                                                        })
                                                                    }}
                                                                    style={{
                                                                        color: '#038ed6',
                                                                    }}>{'מדיניות הקניין הרוחני והשימושים אסורים'}</Text>
                                                                {' של החברה (ביחד יקראו תנאי הסכם רישיון זה ומסמכי המדיניות '
                                                                }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"תנאי הרישיון"'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"ההסכם"'}</Text>{


                                                                '). \n' +
                                                                'אישור תנאי הרישיון מהווים את הסכמתך לתוכנם ואת והתחייבותך לפעול בהתאם להם. הינך רשאי לסיים את ההסכם והרישיון בכל רגע נתון באמצעות שליחת הודעה לחברה, זאת ע"י "קריאת שרות" הזמינה בתוכנה ו/או באמצעות משלוח מייל לכתובת service@bizibox.biz. לאחר קבלת הודעה כאמור, החברה תחסום את גישתך לתוכנה ותשמיד כל מידע שנאסף באמצעות התוכנה אודותיך ואודות לקוחותיך ונשמר במערכותיה בהתאם לתנאי ההסכם.  \n' +
                                                                'השימוש בשירותים שלנו כפוף לתנאי הרישיון העדכניים ביותר. עליך לדעת כי תנאי ההסכם ו/או תנאי השימוש עלולים להשתנות ולכן מומלץ לעיין בהם מפעם לפעם, אנו ניידע אותך ונבקש את הסכמתך לכך בעת שינויים מהותיים, ע"י "פופ-אפ" אשר יופיע בעת הכניסה לתוכנה.\n' +
                                                                'האמור בתנאים אלה מתייחס באופן שווה לנשים וגברים, והשימוש בלשון זכר נעשה מטעמי נוחות. כותרות הסעיפים בהסכם זה נועדו לנוחות בלבד, ואין להתחשב בהן בפרשנות תנאי הרישיון. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'רישיון השימוש בתוכנה'}</Text>{


                                                                ' \n' +
                                                                'במהלך תקופת ההסכם, בכפוף לכל דין, לנכונות הצהרותיך ומילוי כלל התחייבויותיך על פיו, ובכפוף לתשלום התמורה החודשית כפי שתסוכם בינך לבין החברה, החברה מעניקה לך בזאת רישיון שימוש מוגבל (כלומר, הרישיון ניתן לביטול, בלתי-ייחודי, בלתי ניתן להעברה, ולא ניתן להעניק בו רישיונות-משנה) בתוכנה, יצוין כי הרישיון מוענק למטרת ניהול נתוני רו"ח ו/או הנתונים הפיננסיים של לקוחותיך אשר בהם אתה מבצע שימוש במסגרת מתן השירות להם ובהתאם להרשאתם המפורשת לעשות זאת (להלן בהתאמה: "רישיון השימוש" וה- "נתונים"). \n' +
                                                                'מובהר בזאת כי החברה תהיה זכאית להעניק לכל צד שלישי אחר רישיון זהה או דומה לרישיון השימוש לפי שיקול דעתה הבלעדי. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שימוש בתוכנה'}</Text>{


                                                                '\n' +
                                                                'באמצעות טכנולוגיית ליקוט, יבוא, עיבוד וקריאה אוטומטית, התוכנה קולטת את הנתונים הפיננסיים של לקוחותיך (לרבות נתוני כרטיסי אשראי וסליקה, הלוואות, פיקדונות, מסגרות אשראי) (בהתאמה : "הטכנולוגיה" ו"הנתונים"), ובאמצעות רכיב תוכנה המתממשק לתוכנות הנהלת החשבונות ניתן להציג את הנתונים הפיננסיים ביחס ללקוח או לקבוצת לקוחות ב-Dashboard, ולבצע מגוון פעולות ביחס אליהם, בין השאר: איתור מגמות ושינויים בהשוואה לתקופות קודמות, העברת כלל הנתונים אל תוכנות הנהלת החשבונות באופן אוטומטי ומהיר, הצגת דו"חות חשבונאיים על פי נתוני תוכנות הנה"ח, ויצירת פקודות יומן אוטומטיות זמניות (לתוכנת הנה"ח, לחשבוניות ספקים/לקוחות, לתנועות בדפי הבנק). כן התוכנה מהווה ארכיון ממוחשב לכל המסמכים שהועלו אליה ומאפשרת שימושי BI שונים ( להלן, יחדיו: ה"תוצרי השימוש" או "שימושי התוכנה המותרים"). \n' +
                                                                'יובהר כי חלק מהשירותים יהיו זמינים בעתיד והחברה שומרת לעצמה את הזכות הבלעדית לשנות ו/או לעדכן ו/או להסיר חלק מהשירותים על פי שיקול דעתה הבלעדי. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'הרשאת שימוש'}</Text>{


                                                                '\n' +
                                                                'הזנת הנתונים של לקוחותיך בתוכנה והשימוש בהם מותנה בקבלת הרשאה מפורשת לכך. עליך לקבל הרשאה זו מכל לקוח,לפיה הוא מודע ומסכים כי תזין את נתוניו בתוכנה ובהם יעשה שימוש כמפורט במדיניות הפרטיות. על ההרשאה להתקבל בטרם הזנת הנתונים ולהתייחס לאורך כל תקופת שימושך בתוכנה. \n' +
                                                                'בכלל זה עליך להביא לידיעת הלקוח במסגרת קבלת ההרשאה את ההיבטים הבאים: (1) תידרש גישה לנתוני הנהלת החשבונות וכניסה לחשבונות במוסדות הפיננסים. (2) כחלק משימושך בתוכנה תבצע באמצעותה קריאה אוטומטית של הנתונים מהם תפיק תוצרי השימוש. (3) במהלך ו/או במסגרת שימושך בתוכנה יישמר ו/או יבוצע שימוש במידע ע”י החברה בכדי לאפשר למשתמשים את השימוש בתוכנה ואת קבלת השירות מאיתנו, לאפשר לנו לשפר את השירות, להציע שירותים נוספים, לברר ולפעול בכל עניין הנוגע לתנאי שימוש אלו ולמדיניות הפרטיות, לנתח, לחקור ולבקר עניינים נוספים בקשר לתוכנה ו/או לשירותי החברה ו/או ביחס אליך וללקוחותיך. (4) אנו רשאים להסתייע בשירותי צד ג\' בנוגע למידע (כגון גוגל ואמזון), והכול כמפורט בתנאי השימוש הכלליים ובמדיניות הפרטיות. (5) הוראות מדיניות הפרטיות חלות על הלקוח מרגע שנתוניו הוכנסו לתוכנה והלקוח מודע לתוכן מדיניות הפרטיות ומסכים לאמור בה. \n' +
                                                                '\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'הצהרת המשתמש'}</Text>{


                                                                ' \n' +
                                                                'באישורך והסכמתך לתנאי השימוש, יש בכדי להוות את הצהרתך להיבטים הבאים: \n' +
                                                                '\n' +
                                                                'אתה רשאי ומוסמך להתקשר בהסכם זה ולא קיימת כל מניעה חוקית, חוזית או אחרת להתקשרותך בו ו/או בביצוע התחייבויותיך על פיו ו/או ביחס לשימושך בתוכנה. \n' +
                                                                'לא תעשה כל שימוש בלתי מורשה עפ"י הסכם זה. שימושך בתוכנה יעשה רק לצרכי שימושי התוכנה המותרים כהגדרתם, בהתאם לכל דין לרבות חוק הגנת הפרטיות והתקנות מכוחו וכאמור, לאחר קבלת ההרשאה.\n' +
                                                                'אתה תהייה אחראי כלפי החברה ו/או מי מטעמה לכל נזק, הפסד ו/או הוצאה שיגרמו לחברה ו/או מי מטעמה כתוצאה מדרישה ו/או תביעה של צד ג\' כלשהו כתוצאה ממעשה ו/או מחדל שלך המהווה הפרה של הסכם זה, ותשפה את החברה ו/או מי מטעמה בגין כל נזק ו/או הוצאה שייגרמו לה. \n' +
                                                                'אתה מתחייב, לחדול מלהשתמש בתוכנה עבור כל לקוח, שחדל להיות לקוח שלך ו/או שביטל את הסכמתו לגבי המשך השימוש בתוכנה. עליך למסור לנו הודעה במקרה בו הלקוח הפסיק או הגביל את הרשאתו. \n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'כללי'}</Text>{


                                                                ' \n' +
                                                                'התוכנה מסופקת לך לצורך שיפור תהליכי הנהלת החשבונות וייעול תהליכי העבודה בניהול המשרד ושיפור השירות ללקוחותיך בלבד, ובכל מקרה אינה מיועדת לספק לך או ללקוחותיך שירותי ייעוץ מכל סוג. על כן, השימוש בתוכנה אינו תחליף להפעלת שיקול דעתך העצמאי וכל פעולה ו/או החלטה על בסיס התוכנה היא באחריותך בלבד. \n' +
                                                                'מטעמי אבטחת מידע יידרש שימוש בשם משתמש וסיסמה אישיים של המשתמשים במשרדך, ואתה תנקוט בכל האמצעים הנחוצים לשמירת סודיותם ולאי חשיפתם לצד ג\' כלשהו. \n' +
                                                                'תנאי שימוש אלה אינם יוצרים ולא יתפרשו כאילו הם יוצרים יחסי שותפות, מיזם משותף, יחסי עובד-מעסיק, יחסי שליחות או יחסי נותן-מקבל זיכיון בין הצדדים. \n' +
                                                                'סמכות השיפוט הבלעדית לדון בכל מחלוקת ו/או סכסוך בקשר עם תנאי הרישיון תהא נתונה לבית המשפט המוסמך במחוז תל אביב. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'פניה לחברה'}</Text>{


                                                                ' \n' +
                                                                'במידה ויש לך שאלות נוספות או הערות בנוגע לתנאים, הינך מוזמן לפנות אלינו ע"י קריאת שרות דרך התוכנה,ב"צור קשר" באתר החברה https://www.bizibox.biz ובאמצעות דואר אלקטרוני בכתובת: service@bizibox.biz, אנו נעשה את מירב המאמצים לחזור אליך תוך זמן סביר. \n' +
                                                                'קראתי והבנתי את תנאי ההסכם ואני מסכימ/ה לכל התנאים המפורטים בהם.\n'}
                                                            </Text>
                                                        )}

                                                    </ScrollView>
                                                </View>
                                            </Fragment>
                                        )}


                                        {(showModalAgreement === 1 || showModalAgreement === 2 || showModalAgreement === 8) && (
                                            <View style={{
                                                flexDirection: 'column',
                                                marginHorizontal: 20,
                                                marginBottom: 20,
                                            }}>
                                                <View style={{
                                                    marginBottom: 10,
                                                }}>
                                                    <CheckBox
                                                        activeOpacity={1}
                                                        Component={TouchableWithoutFeedback}
                                                        onPress={() => this.setState({appAgreementConfirmation: !this.state.appAgreementConfirmation ? new Date(Date.now()).toISOString() : false})}
                                                        containerStyle={{
                                                            backgroundColor: 'transparent',
                                                            left: 0,
                                                            top: 0,
                                                            margin: 0,
                                                            padding: 0,
                                                            borderWidth: 0,
                                                            right: 0,
                                                            width: '100%',
                                                            marginRight: -2,
                                                        }}
                                                        textStyle={{
                                                            fontSize: sp(15),
                                                            top: 0,
                                                            color: '#022258',
                                                            fontWeight: 'normal',
                                                            textAlign: 'right',
                                                            fontFamily: fonts.regular,
                                                            right: 0,
                                                            left: 0,
                                                            marginRight: 5,
                                                            margin: 0,
                                                            padding: 0,
                                                        }}
                                                        fontFamily={fonts.regular}
                                                        right
                                                        checkedColor="#022258"
                                                        uncheckedColor="#022258"
                                                        iconType="material-community"
                                                        checkedIcon="checkbox-marked"
                                                        uncheckedIcon="checkbox-blank-outline"
                                                        size={24}
                                                        iconRight
                                                        title={<View style={{
                                                            flexDirection: 'column',
                                                            paddingTop: 15,
                                                            paddingRight: 5,
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: sp(15),
                                                                    color: '#022258',
                                                                    fontFamily: fonts.regular,
                                                                }}>{'קראתי והבנתי את'}</Text>
                                                                <Text>{' '}</Text>
                                                                <Text
                                                                    onPress={() => {
                                                                        Linking.canOpenURL('https://bizibox.biz/terms-of-use-scanning-app/')
                                                                            .then(s => {
                                                                                if (s) {
                                                                                    Linking.openURL('https://bizibox.biz/terms-of-use-scanning-app/')
                                                                                }
                                                                            })

                                                                        // this.setState({
                                                                        //     showModalAgreement: 2,
                                                                        // })
                                                                        // this.updateAgreementConfirmation(null, null, true)
                                                                    }}
                                                                    style={{
                                                                        fontSize: sp(15),
                                                                        color: '#038ed6',
                                                                        fontFamily: fonts.regular,
                                                                    }}>{'הסכם שימוש'}</Text>
                                                                <Text>{' '}</Text>
                                                                <Text
                                                                    onPress={() => {
                                                                        Linking.canOpenURL('https://bizibox.biz/privacy-policy-scanning-app/')
                                                                            .then(s => {
                                                                                if (s) {
                                                                                    Linking.openURL('https://bizibox.biz/privacy-policy-scanning-app/')
                                                                                }
                                                                            })
                                                                        // this.setState({
                                                                        //     showModalAgreement: 8,
                                                                        // })
                                                                        // this.updateAgreementConfirmation(null, null, true)
                                                                    }}
                                                                    style={{
                                                                        fontSize: sp(15),
                                                                        color: '#038ed6',
                                                                        fontFamily: fonts.regular,
                                                                    }}>{'ומדיניות פרטיות'}</Text>
                                                            </View>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: sp(15),
                                                                    color: '#022258',
                                                                    fontFamily: fonts.regular,
                                                                }}>ואני מסכימ/ה לכל התנאים המפורטים בהם</Text>
                                                            </View>
                                                        </View>}
                                                        checked={this.state.appAgreementConfirmation !== false}
                                                    />
                                                </View>
                                                <View style={{
                                                    marginBottom: 22,
                                                }}>
                                                    <CheckBox
                                                        activeOpacity={1}
                                                        Component={TouchableWithoutFeedback}
                                                        onPress={() => this.setState({sendMarketingInformation: !this.state.sendMarketingInformation ? new Date(Date.now()).toISOString() : false})}
                                                        containerStyle={{
                                                            backgroundColor: 'transparent',
                                                            left: 0,
                                                            top: 0,
                                                            margin: 0,
                                                            padding: 0,
                                                            borderWidth: 0,
                                                            right: 0,
                                                            width: '100%',
                                                            marginRight: -2,
                                                        }}
                                                        textStyle={{
                                                            fontSize: sp(15),
                                                            top: 0,
                                                            color: '#022258',
                                                            fontWeight: 'normal',
                                                            textAlign: 'right',
                                                            fontFamily: fonts.regular,
                                                            right: 0,
                                                            left: 0,
                                                            marginRight: 5,
                                                            margin: 0,
                                                            padding: 0,
                                                        }}
                                                        fontFamily={fonts.regular}
                                                        right
                                                        checkedColor="#022258"
                                                        uncheckedColor="#022258"
                                                        iconType="material-community"
                                                        checkedIcon="checkbox-marked"
                                                        uncheckedIcon="checkbox-blank-outline"
                                                        size={24}
                                                        iconRight
                                                        title={<View style={{
                                                            flexDirection: 'column',
                                                            paddingTop: 0,
                                                            paddingRight: 5,
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: sp(15),
                                                                    color: '#022258',
                                                                    fontFamily: fonts.regular,
                                                                }}>אשמח לקבל עדכונים על המוצרים</Text>
                                                            </View>
                                                        </View>}
                                                        checked={this.state.sendMarketingInformation !== false}
                                                    />
                                                </View>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Button
                                                        onPress={() => {
                                                            this.setState({
                                                                showModalAgreement: false,
                                                            })
                                                            this.updateAgreementConfirmation(this.state.appAgreementConfirmation, this.state.sendMarketingInformation, false)
                                                        }}
                                                        disabled={this.state.appAgreementConfirmation === false}
                                                        buttonStyle={{
                                                            width: 201,
                                                            height: 36,
                                                            backgroundColor: '#022258',
                                                            borderRadius: 5,
                                                        }}
                                                        title={<View style={{
                                                            flexDirection: 'row',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            alignContent: 'center',
                                                        }}><Text style={{
                                                            color: '#ffffff',
                                                            fontSize: sp(18),
                                                            lineHeight: sp(18),
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'center',
                                                        }}>אישור</Text></View>}
                                                    />
                                                </View>
                                            </View>
                                        )}


                                    </Fragment>
                                </View>
                            </View>
                        </Animated.View>
                    </Modal>
                )}

                {(globalParams && globalParams.currentCompanySelected && globalParams.currentCompanySelected.METZALEM) && (globalParams.currentCompanySelected.METZALEM === 1 || (globalParams.currentCompanySelected.METZALEM === 2 && showModalAgreementMETZALEM2 === true)) && (showModalAgreement !== false) && (
                    <Modal
                        animationType="fade"
                        transparent
                        visible={true}>
                        <Animated.View style={{
                            opacity: 1,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 9,
                            elevation: 9,
                            height: '100%',
                            width: '100%',
                            flexDirection: 'row',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            alignContent: 'center',
                        }}>
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    left: 0,
                                    top: 0,
                                    zIndex: 9,
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: '#cccccc',
                                    opacity: 0.7,
                                }}/>
                            <View style={{
                                marginTop: showModalAgreement === 1 ? 130 : 50,
                                width: 680 / 2,
                                height: showModalAgreement === 1 ? (630 / 2) : (Dimensions.get('window').height - 100),
                                backgroundColor: '#ffffff',
                                borderRadius: 5,
                                zIndex: 10,
                                shadowColor: '#a0a0a0',
                                shadowOffset: {
                                    width: 0,
                                    height: 0,
                                },
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                                elevation: 33,
                                paddingHorizontal: 0,
                                paddingVertical: 0,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                            }}>
                                <View style={{
                                    marginHorizontal: 5,
                                    marginVertical: 0,
                                    flex: 1,
                                    width: '100%',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: (showModalAgreement !== 1 && (showModalAgreement === 2 || showModalAgreement === 8)) ? 'space-between' : 'flex-start',
                                }}>
                                    {showModalAgreement === 1 && (
                                        <Fragment>
                                            {globalParams.ocrPilot === 2 ? (
                                                <TouchableOpacity
                                                    style={{
                                                        height: 20,
                                                        marginBottom: 5,
                                                        marginTop: 5,
                                                        alignSelf: 'flex-start',
                                                        marginLeft: 5,
                                                    }}
                                                    onPress={this.closeModalAgreement}>
                                                    <Icons
                                                        name="close"
                                                        type="material-community"
                                                        size={25}
                                                        color={'#022258'}
                                                    />
                                                </TouchableOpacity>
                                            ) : (
                                                <View style={{
                                                    height: 20,
                                                    marginBottom: 5,
                                                    marginTop: 0,
                                                    alignSelf: 'flex-start',
                                                    marginLeft: 5,
                                                }}/>
                                            )}
                                        </Fragment>
                                    )}

                                    {showModalAgreement !== 1 && (
                                        <Fragment>
                                            <View style={{
                                                height: 28,
                                                borderBottomColor: '#cbcccc',
                                                borderBottomWidth: 2,
                                                flexDirection: 'row-reverse',
                                                justifyContent: 'flex-start',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                                marginHorizontal: 10,
                                                marginTop: 0,
                                                width: '97%',
                                            }}>
                                                <TouchableOpacity
                                                    hitSlop={{
                                                        top: 10,
                                                        bottom: 10,
                                                        left: 10,
                                                        right: 10,
                                                    }}
                                                    onPress={this.backToAgreement}
                                                    style={{
                                                        marginRight: -6,
                                                        marginTop: -3,
                                                    }}>
                                                    <Icon
                                                        name="chevron-small-right"
                                                        type="entypo"
                                                        size={36}
                                                        color={'#022258'}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                        </Fragment>
                                    )}


                                    <Fragment>
                                        {showModalAgreement === 1 && (
                                            <Fragment>
                                                <Text
                                                    style={{
                                                        marginTop: 0,
                                                        color: '#022258',
                                                        fontSize: sp(17.5),
                                                        textAlign: 'center',
                                                        fontFamily: fonts.bold,
                                                    }}>{'אנו מברכים אותך לרגל הצטרפותך\n' +
                                                    'לשירות bizibox לרואה חשבון '}</Text>

                                                <Text
                                                    style={{
                                                        color: '#022258',
                                                        fontSize: sp(17),
                                                        lineHeight: 22.5,
                                                        textAlign: 'center',
                                                        marginBottom: 25,
                                                        fontFamily: fonts.semiBold,
                                                    }}>{'שיאפשר לך לשלוח צילומי מסמכים\n' +
                                                    'לתוכנת הנה"ח ישירות מהטלפון הנייד'}</Text>
                                            </Fragment>
                                        )}
                                        {showModalAgreement !== 1 && (
                                            <Fragment>
                                                <View style={{
                                                    height: (Dimensions.get('window').height - 100) - ((showModalAgreement === 2 || showModalAgreement === 8) ? 220 : 50),
                                                    width: '97%',
                                                }}>
                                                    <ScrollView
                                                        ref={ref => this.listView = ref}
                                                        onContentSizeChange={() => {
                                                            this.listView.scrollTo({y: 0})
                                                        }}
                                                        keyboardShouldPersistTaps="always"
                                                        style={{
                                                            flex: 1,
                                                            position: 'relative',
                                                        }}
                                                        contentContainerStyle={{
                                                            marginHorizontal: 15,
                                                            marginTop: 10,
                                                            paddingBottom: 10,
                                                        }}
                                                    >
                                                        {showModalAgreement === 2 && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>{'הסכם רישיון שימוש bizibox  לסריקת מסמכים  \n' +
                                                                    '[עודכן בתאריך: 8 מרס, 2021]\n'
                                                                }</Text>

                                                                <Text
                                                                    style={{fontFamily: fonts.bold}}>{'"הקדמה"'}</Text>{
                                                                '\n' +
                                                                'חברת איי-פקט בע"מ ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"החברה"'}</Text>{

                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אנחנו"'}</Text>{

                                                                '), מאפשרת למשתמש (כהגדרתו מטה) לסרוק מסמכים באמצעות "bizibox לסריקת מסמכים" אשר זמינה למשתמש הן בפורטל האינטרנטי של החברה  והן ביישומון (ביחד, יקראו הפורטל האינטרנטי והיישומון '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"האפליקציה"'}</Text>{

                                                                ').\n'}
                                                                <Text>{'השימוש באפליקציה והשירותים הניתנים ו/או שיינתנו בה ו/או באמצעותה כפופים גם '}
                                                                    <Text
                                                                        onPress={() => {
                                                                            this.setState({
                                                                                showModalAgreement: 3,
                                                                            })
                                                                        }}
                                                                        style={{
                                                                            color: '#038ed6',
                                                                        }}>{'למדיניות הפרטיות'}</Text>
                                                                    {', '}
                                                                    <Text
                                                                        onPress={() => {
                                                                            this.setState({
                                                                                showModalAgreement: 4,
                                                                            })
                                                                        }}
                                                                        style={{
                                                                            color: '#038ed6',
                                                                        }}>{'מדיניות האחריות הכללית'}</Text>
                                                                    {
                                                                        ' ו-'}
                                                                    <Text
                                                                        onPress={() => {
                                                                            this.setState({
                                                                                showModalAgreement: 5,
                                                                            })
                                                                        }}
                                                                        style={{
                                                                            color: '#038ed6',
                                                                        }}>{'מדיניות הקניין הרוחני והשימושים אסורים'}</Text>
                                                                    {
                                                                        ' של החברה ו'}

                                                                    <Text
                                                                        onPress={() => {
                                                                            this.setState({
                                                                                showModalAgreement: 6,
                                                                            })
                                                                        }}
                                                                        style={{
                                                                            color: '#038ed6',
                                                                        }}>{'הסכם רישיון השימוש בתוכנת bizibox לרו"ח ויועצי מס'}</Text>
                                                                    {' (ביחד יקראו תנאי הסכם רישיון זה, מסמכי המדיניות והסכם רישיון השימוש בתוכנת bizibox לרו"ח ויועצי מס '
                                                                    }<Text
                                                                        style={{fontFamily: fonts.bold}}>{'"תנאי הרישיון"'}</Text>{
                                                                        ' או '
                                                                    }<Text
                                                                        style={{fontFamily: fonts.bold}}>{'"ההסכם"'}</Text>{

                                                                        '). \n'}
                                                                </Text>

                                                                {'אישור תנאי הרישיון מהווים את הסכמתך ומודעותך לתוכנם וכן את והתחייבותך לפעול בהתאם ובכפוף להם. \n' +
                                                                    'הינך רשאי לסיים את ההסכם בכל רגע נתון וזאת באמצעות שליחת הודעה לחברה בכתובת service@bizibox.biz לאחר קבלת הודעתך, החברה תחסום את גישתך לאפליקציה באופן מידי. \n' +
                                                                    'עליך לדעת כי תנאי הרישיון עלולים להשתנות. אנו ניידע אותך ונבקש את הסכמתך לכך בעת שינויים מהותיים בהסכם ע"י "פופ-אפ" אשר יופיע בעת הכניסה לאפליקציה.\n' +
                                                                    'האמור בתנאים אלה מתייחס באופן שווה לנשים וגברים, והשימוש בלשון זכר נעשה מטעמי נוחות. כותרות הסעיפים בהסכם זה נועדו לנוחות בלבד, ואין להתחשב בהן בפרשנות תנאי הרישיון. \n'
                                                                }<Text
                                                                style={{fontFamily: fonts.bold}}>{'מי רשאי להשתמש באפליקציה'}</Text>{
                                                                '\n' +
                                                                'לתשומת ליבך כי השימוש באפליקציה מוגבל אך ורק למשתמש אשר נתן את הרשאתו המפורשת לרו"ח ו/או יועץ המס שלו ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"רו"ח"'}</Text>{

                                                                ') לעשות שימוש בתוכנת bizibox לרו"ח ויועצי מס לצורך מתן שירותי הנהלת חשבונות וייעוץ מס עבורו ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אתה"'}</Text>{

                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"המשתמש"'}</Text>{

                                                                '). בכך, המשתמש והשימוש בנתוניו כפוף לתנאי הסכם רישיון השימוש בתוכנת bizibox לרו"ח ויועצי מס ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"הסכם רו"ח"'}</Text>{

                                                                '). במידה ואינך מסכים לשימוש כאמור, נא הודע לנו מידית על כך באמצעות שליחת הודעה לחברה בכתובת service@bizibox.biz. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'רישיון השימוש באפליקציה'}</Text>{

                                                                ' \n' +
                                                                'במהלך תקופת ההסכם, בכפוף לכל דין, לנכונות הצהרותיך ומילוי כלל התחייבויותיך על פיו, החברה מעניקה לך בזאת רישיון שימוש מוגבל (כלומר, הרישיון ניתן לביטול, בלתי-ייחודי, בלתי ניתן להעברה, ולא ניתן להעניק בו רישיונות-משנה) באפליקציה ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"הרישיון"'}</Text>{
                                                                ' או '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"רישיון השימוש"'}</Text>{

                                                                ').\n' +
                                                                'מובהר בזאת כי החברה תהיה זכאית להעניק לכל צד שלישי אחר רישיון זהה או דומה לרישיון השימוש לפי שיקול דעתה הבלעדי. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'השימוש באפליקציה'}</Text>{

                                                                '\n' +
                                                                'באמצעות האפליקציה תוכל לסרוק מסמכים כגון קבלות, חשבוניות, צילומי צ\'קים וכד\' ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מסמכים פיננסיים"'}</Text>{

                                                                '), לרכז אותם בארכיון פיננסי ייעודי ולהעבירם באופן מקוון לרוה"ח או יועץ המס שלך.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'הצהרת המשתמש'}</Text>{

                                                                ' \n' +
                                                                'באישורך והסכמתך לתנאי הרישיון, יש בכדי להוות את הצהרתך להיבטים הבאים: \n' +
                                                                'קראת את הסכם המייצגים, אתה מודע לתנאיו ואתה מעניק בזאת הרשאת שימוש בנתוניך כמפורט בו וכנדרש כתנאי סף בהסכם זה.\n' +
                                                                'לא קיימת כל מניעה חוקית, חוזית או אחרת להתקשרותך בתנאי הרישיון ו/או בביצוע התחייבויותיך על פיהם ו/או ביחס לשימושך באפליקציה. \n' +
                                                                'שימושך באפליקציה יעשה בכפוף לאמור בתנאי הרישיון ובהתאם לכל דין (לרבות חוק הגנת הפרטיות והתקנות מכוחו).\n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'כללי'}</Text>{
                                                                ' \n' +
                                                                'מטעמי אבטחת מידע נדרש כי שימושך באפליקציה יעשה בשם משתמש וסיסמה אישיים. \n' +
                                                                'השימוש באפליקציה אינו תחליף להפעלת שיקול דעתך העצמאי. יובהר כי אין לראות בהענקת הרישיון בכדי לספק לך או לצד ג\' ייעוץ מכל סוג. \n' +
                                                                'תנאי השימוש אינם יוצרים ולא יתפרשו כאילו הם יוצרים יחסי שותפות, מיזם משותף, יחסי עובד-מעסיק, יחסי שליחות או יחסי נותן-מקבל זיכיון בין הצדדים. \n' +
                                                                'סמכות השיפוט הבלעדית לדון בכל מחלוקת ו/או סכסוך בקשר עם תנאי הרישיון תהא נתונה לבית המשפט המוסמך במחוז תל אביב. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'פניה לחברה'}</Text>{

                                                                ' \n' +
                                                                'במידה ויש לך שאלות נוספות או הערות בנוגע לתנאי השימוש, הינך מוזמן לפנות אלינו באמצעות דואר אלקטרוני בכתובת: service@bizibox.biz  או בצור קשר דרך אתר החברה https://www.bizibox.biz.'}
                                                            </Text>
                                                        )}

                                                        {(showModalAgreement === 3 || showModalAgreement === 8) && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>{'מדיניות הפרטיות - אפליקציה לסריקת מסמכים ("המדיניות")\n' +
                                                                    '[עודכן בתאריך: 8 מרס, 2021]\n'}
                                                                </Text>
                                                                {'כאמור בהסכם רישיון שימוש באפליקציה לסריקת מסמכים ('}
                                                                <Text
                                                                    style={{fontFamily: fonts.bold}}>{'"ההסכם"'}</Text>
                                                                {' ו'
                                                                }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"האפליקציה"'}</Text>{


                                                                ' בהתאמה), השימוש באפליקציה כפוף בין השאר למדיניות הפרטיות, אשר מהווה חלק בלתי נפרד מההסכם. ביטויים אשר לא הוגדרו במדיניות הפרטיות, תהא להם משמעות הזהה למשמעותם בהסכם, לרבות הסכם רישיון השימוש בתוכנת bizibox לרו"ח ויועצי מס (להלן יוגדר במדיניות פרטיות זו כ'

                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"הסכם רו"ח"'}</Text>{

                                                                ').\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'על מי חלה המדיניות?'}</Text>{


                                                                '\n' +
                                                                'מדיניות זו חלה  על משתמשים אשר נתנו הרשאתם המפורשת לרו"ח ו/או יועצי המס לעשות שימוש בתוכנת bizibox לרו"ח ויועצי מס (להלן תוגדר במדיניות פרטיות זו כ'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"תוכנת רו"ח"'}</Text>{


                                                                ') לצורך מתן שירותי הנהלת חשבונות וייעוץ מס להם (להלן: '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אתה"'}</Text>{


                                                                '). \n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'הסכמה'}</Text>{


                                                                ' \n' +
                                                                'מדיניות הפרטיות המפורטת במסמך זה מהווה הסכם משפטי מחייב ואכיף בינך לבין החברה. לפיכך, הנך מתבקש לקרוא אותה בקפידה רבה. \n' +
                                                                'בעצם השימוש המבוצע בנתוניך באפליקציה, בין אם על ידך ובין אם ע"י משתמש לו סיפקת את נתוניך לרבות רו"ח ו/או יועץ מס ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מורשה מטעמך"'}</Text>{


                                                                '), הינך מצהיר כי קראת והבנת את מדיניות הפרטיות, כי ניתנה לך האפשרות לעיין בה, וכי הינך מסכים לכל התנאים המפורטים בה. \n' +
                                                                'אם אינך מסכים לאי אילו מהתנאים המפורטים להלן, הנך מחויב, באופן מידי, להימנע מכניסה ו/או מכל שימוש באפליקציה בכל אופן ו/או להודיע זאת למורשה מטעמך. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'איזה מידע אנחנו רשאים לאסוף במסגרת המידע המוזן לאפליקציה?'}</Text>{


                                                                ' \n' +
                                                                'הסוג הראשון של מידע שהחברה אוספת הנו מידע אנונימי ואינו מזהה (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מידע לא אישי"'}</Text>{


                                                                '). \n' +
                                                                'מידע לא אישי הוא כל מידע גלוי אשר זמין לחברה בשעה שתשתמש באפליקציה, ואינו מאפשר את זיהויך. \n' +
                                                                'מידע לא אישי, כולל מידע אנונימי, טכני וכן מידע שנאסף אודות התנהגות המשתמש באפליקציה, ועשוי לכלול, בין היתר, את פעילותו באפליקציה, את זהות מערכת ההפעלה, זרם הקשות (click-stream), רזולוציית מסך המכשיר ממנו מתבצעת הגישה לאפליקציה וכיוצ"ב. \n' +
                                                                'הסוג השני של מידע שהחברה אוספת הנו מידע אישי מזהה. ככלל, בהסכמתך למדיניות זו, אתה מאשר לנו להשתמש בכל הנתונים והמידע אשר בהם אתה ו/או מורשה מטעמך ביצע/ת בהם שימוש מכל סוג (כהגדרתם בהסכם רו"ח), הן במסגרת ה"שימוש באפליקציה" ובפורטל (ר\' פירוט בהסכם) והן במסגרת "רישיון השימוש בתוכנה" ו"השימוש בתוכנה" (ר\' פירוט בהסכם רו"ח) (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מידע אישי"'}</Text>{


                                                                '). אינך מחויב למסור מידע אישי. \n' +
                                                                'המידע האישי, מאפשר לחברה לזהות באופן אישי את המשתמש ו/או את מושא הנתונים ובדרך כלל נושא אופי פרטי או רגיש. \n' +
                                                                'המשתמש מספק באופן אוטומטי בהתאם לרשת או למכשיר בהם מבוצע השימוש. מידע זה נאסף בין השאר על מנת לשפר את חוויית המשתמשים ולמטרות אבטחה. \n' +
                                                                'בנוסף, אנו אוספים מידע אישי הנמסר על-ידי המשתמש באופן מודע ומרצונו החופשי במהלך השימוש באפליקציה. מידע זה כולל בין היתר מידע המצוי ב"מסמכים פיננסיים" (כהגדרתם בהסכם), את ה"נתונים" (כהגדרתם בהסכם רו"ח), וכן כל מידע המתקבל עם ו/או עקב השימוש באפליקציה ו/או באמצעות תוכנת רו"ח ,וכן כל תוצר שהופק באמצעותן. \n' +
                                                                'כחלק מהשימוש באפליקציה, כל משתמש נדרש בפתיחת חשבון אישי. המידע להלן נאסף במסגרת פתיחת החשבון: (א) כתובת דואר-אלקטרוני; (ב) שם מלא; (ג) מספר ח.פ./ע.מ.(במידה ומדובר בעוסק מורשה); (ד) פרטי חשבון בנק ו/או כרטיסי אשראי; (ה) מספר טלפון סלולארי; (ו) שם משתמש וסיסמת כניסה לפורטל ו/או לאפליקציה; (ז) פרטי אמצעי תשלום (המידע נאסף על-ידי ספקי שירותי סליקה כמפורט להלן); ו- (ח) כל הפרמטרים הנדרשים להתחברות לכל מקורות המידע הפיננסי אשר ברשות המשתמש ו/או מורשה מטעמו אשר ברצונו לקשר לאפליקציה ו/או לתוכנה, לרבות שמות המשתמש והסיסמאות הרלוונטיות לכל אחד ממקורות המידע הפיננסי.\n' +
                                                                'המידע האישי שמסרת לחברה יישמר במאגר המידע המאובטח של החברה והגישה אליו תהיה מוגבלת בלבד. כמו כן, מידע אודות שימושים ספציפיים שביצעת באפליקציה, ייאסף אף הוא וייחשב כחלק מה-"מידע האישי" כאמור לעיל.\n' +
                                                                'כאמור בהסכם, באמצעות האפליקציה תוכל לסרוק מסמכים פיננסיים, לרכז אותם בארכיון פיננסי ייעודי ולהעבירם באופן מקוון לרוה"ח או יועץ המס שלך. ע"מ שתוכל לבצע את השימוש באפליקציה, עליך לתת לנו הרשאת גישה למכשיר בו מותקנת האפליקציה:\n' +
                                                                'הרשאה לקבלת Push Notifications  - הרשאה זאת מתבקשת על מנת שהמשתמש יוכל לקבל התראות "דחיפה", (ר\' פירוט מטה).\n' +
                                                                'הרשאת גישה למצלמת המכשיר וגישה לגלריית  התמונות, והתקני אחסון וזיכרון במכשיר - הרשאה זאת מתבקשת עבור אפליקציית סריקת המסמכים הפיננסיים ישירות ממכשירך.\n' +
                                                                '(להלן יחדיו: '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"המידע"'}</Text>{


                                                                ')\n' +
                                                                'הנך מסכים ומצהיר בזאת שהמידע האישי שהינך מספק לנו, בין אם ישירות ובין אם ע"י מורשה מטעמך, נמסר מרצונך החופשי, על מנת שנוכל לספק עבורך את שירותי האפליקציה וכן הינך מסכים כי נשמור את המידע שסיפקת לנו במאגר מידע (אשר יתכן ויירשם בהתאם לדרישות הדין). \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שימוש במידע'}</Text>{


                                                                '\n' +
                                                                'אנו נשתמש במידע האישי שמסרת ו/או במידע הסטטיסטי שנאסף אצלנו לצורך אספקת שירותים, לצורך שינוי ושיפור התכנים, כך שיתאימו לאופי המשתמש, לרבות להעדפותיך ממש, כפי שמשתקף מניתוח המידע הסטטיסטי שנאסף בחברה לגבי הרגלי השימוש באפליקציה.\n' +
                                                                'המידע שנאסוף, לרבות באמצעות השימוש בקבצי \'עוגיות\' (ראה בהמשך), עשוי לזהות אותך בכל פעם שתיכנס לאפליקציה וכך לייתר את הצורך בהזנת שם המשתמש והסיסמא בכניסותיך החוזרות לאפליקציה.\n' +
                                                                'אנו נשתמש במידע האישי שמסרת על מנת ליצור איתך קשר בעת הצורך, ו/או, במידה ונתת את הסכמתך לכך ע"י סימון V בתיבה המיועדת לכך, לשלוח אליך מדי פעם פרסומות ו/או הודעות באמצעות דואר אלקטרוני לפי הפרטים שמסרת בעת הרישום, ובהם עדכונים על מבצעים שונים באפליקציה, חידושים בשירותים הניתנים, שוברי הנחה, הודעות ו/או פרסומות שונות, בין מטעם החברה ובין מטעם צדדים שלישיים (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"דברי פרסומת"'}</Text>{


                                                                '). \n' +
                                                                'סימון ה-V בתיבה המיועדת לכך, כמו גם המשך השימוש שלך באפליקציה והסכמתך לכללי מדיניות זו מהווים הסכמה לקבלת דברי פרסומת בהתאם להוראות סעיף 30א לחוק התקשורת (בזק ושירותים), התשמ"ב–1982. לתשומת לבך כי, בכפוף להוראות הדין, בכל עת תוכל לבחור לחדול מלקבל הודעות דברי פרסומת כאמור על-ידי מחיקת פרטיך מרשימת הדיוור של האפליקציה. זאת, באמצעות משלוח בקשה להסרה מרשימת הדיוור ע"י לחיצה על "הסר" בגוף ההודעה מרגע בו הסכמה זו ניתנת, כל חומר שנשלח אליך מטעם החברה לא יחשב כספאם מכל סוג ומין אשר מהווה או יש בו כדי להוות הפרה של חוק הספאם. \n' +
                                                                '\n' +
                                                                'אנו נשתמש במידע הסטטיסטי שנאסף ו/או נאגר אצלנו לצרכינו הפנימיים, לרבות על מנת לדאוג לתפעול האפליקציה ופיתוחה, לשיפור המבנה שלה, השירותים הניתנים בה וכד\'. לשם כך, עשויים אנו להסתייע בצדדים שלישיים לצורך איסוף וניתוח המידע הסטטיסטי והאנונימי כדי ללמוד על הרגלי השימוש שלך ושל יתר משתמשי האפליקציה באופן שלא יזהה אותך ו/או את יתר המשתמשים באופן אישי. \n' +
                                                                'אנו נשתמש במידע שמסרת או במידע שנאסף אצלנו לכל מטרה אחרת בקשר עם אספקת השירותים המוצעים באפליקציה, לרבות כל מטרה המפורטת במדיניות זו ו/או בתנאי השימוש.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'איסוף מידע לצרכים סטטיסטיים'}</Text>{


                                                                '\n' +
                                                                'החברה נעזרת בחברות שונות המספקות לה ניתוחים סטטיסטיים אודות השימוש באפליקציה. החברות אוספות ומנתחות מידע על היקף השימוש באפליקציה, תדירות השימוש בהם, מקורות הגישה של המשתמשים אליהם וכיוצא בזה. המידע הנאסף הוא סטטיסטי במהותו, הוא איננו מזהה אותך אישית והוא נועד לצרכי ניתוח, מחקר ובקרה.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'מסירת מידע ואיסוף המידע'}</Text>{


                                                                '\n' +
                                                                'המידע שמסרת לחברה ישמר במאגר המידע של החברה (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"מאגר המידע"'}</Text>{


                                                                '). \n' +
                                                                'בעת מסירת המידע האישי לחברה, עליך להקפיד למסור פרטים נכונים, מלאים ולא שגויים או מסולפים. ככל שיחולו שינויים במידע האישי אותו מסרת בעת הרישום, תתבקש לעדכן את הנתונים בחשבון המשתמש שלך באפליקציה. \n' +
                                                                'המידע הסטטיסטי הנאסף בעת השימוש באפליקציה על-ידינו מכיל רק את המידע הנחוץ לנו לצורך מתן השירותים ושיפורם. אנו נעשה במידע זה שימוש בכפוף למדיניות הפרטיות המפורטת להלן ובהתאם להוראות חוק הגנת הפרטיות, התשמ"א–1981 (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"חוק הגנת הפרטיות"'}</Text>{


                                                                '). \n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'מידע אישי'}</Text>{


                                                                ' – החברה לא תעביר לצדדים שלישיים את המידע האישי אלא באחד המקרים המפורטים להלן: \n' +
                                                                'במידה והחברה ביקשה את רשותך, ואת/ה נתת את הסכמתך המפורשת לכך;\n' +
                                                                'במקרה שתפר את ההסכם;\n' +
                                                                'במידה ויתקבל צו מבית משפט או מכל ערכאה מוסמכת אחרת, המורה לחברה למסור את פרטיך או המידע האישי אודותיך לידי בית המשפט או הערכאה האחרת או לידי צד שלישי כלשהו; \n' +
                                                                'במקרה של מחלוקת משפטית בינך לבין החברה שתחייב את חשיפת פרטיך;\n' +
                                                                'בכל מקרה שהחברה תסבור, כי מסירת המידע נחוצה כדי למנוע נזק חמור לגופך או לרכושך או לגופו או לרכושו של צד שלישי;\n' +
                                                                'החברה תהיה רשאית להעביר את פרטיך והמידע שנאסף בעקבות השימוש שעשית באפליקציה לחברות אחרות הקשורות לחברה, ובלבד שהן תשתמשנה במידע זה רק על-פי הוראות מדיניות פרטיות זו;\n' +
                                                                'במקרה שהחברה תתמזג עם גוף אחר או תמזג את פעילותיה עם פעילותו של צד שלישי - היא תהיה זכאית להעביר לתאגיד החדש העתק מן המידע שנאגר אודותיך או כל מידע סטטיסטי שבידיה, ובלבד שתאגיד זה יקבל על עצמו את הוראות מדיניות פרטיות זו.\n' +
                                                                'במידה ומסירת המידע האישי הינה לעובדים המוסמכים של החברה ו/או לשלוחים מטעמה ו/או לפועלים מטעמה, והיא במידה הנדרשת והחיונית לצורך אספקת השירותים ותפעול הפורטל ו/או האפליקציה; \n' +
                                                                'במידה ומסירת המידע נעשית עפ"י דין.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'מידע סטטיסטי'}</Text>{


                                                                ' – החברה עשויה להעביר מידע סטטיסטי, בתמורה או שלא בתמורה, לצדדים שלישיים המצויים איתם בקשרים עסקיים או אחרים, לרבות חברות העוסקות בניתוח מידע סטטיסטי אנונימי כאמור לצורך שיפור השירותים המוצעים באפליקציה, לפי שיקול דעתם הבלעדי של החברה.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"עוגיות" (Cookies) ואחסון מקומי'}</Text>{


                                                                '\n' +
                                                                'בשעת השימוש באפליקציה, החברה או צדדים שלישיים עשויים להשתמש בטכנולוגיה אשר מקובלת בתעשייה ומוכרת כ"עוגיות" ו-Flash (או טכנולוגיות דומות), המאחסנת מידע מסוים במכשיר של המשתמש, מאפשרת לחברה להפעיל מאפיינים מסוימים באופן אוטומטי, ומשפרת את חווית השימוש של המשתמש בשירותי החברה. \n' +
                                                                'העוגיות נדרשות בין השאר לצורך תפעול האפליקציה באופן שוטף, ובכלל זה, בכדי לאסוף נתונים אודות הרגלי השימוש באפליקציה ולזהות דפוסי משתמשים, לאימות פרטים, להתאמת להעדפותיך האישיות ולצרכי אבטחת מידע.\n' +
                                                                'עוגיות ניתנות למחיקה.  עם זאת, יש לשים לב כי אם המשתמש ימחק את העוגיות או לא יאפשר את אחסונן, או אם ישנה את המאפיינים של Flash, החוויה המקוונת של המשתמש עלולה להיות מוגבלת.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'זכות עיון במידע'}</Text>{


                                                                '\n' +
                                                                'על-פי חוק הגנת הפרטיות, כל אדם זכאי לעיין בעצמו, או על-ידי בא-כוחו שהרשהו בכתב או על-ידי אפוטרופוסו, במידע שעליו המוחזק במאגר מידע. אדם שעיין במידע שעליו ומצא כי אינו נכון, שלם, ברור או מעודכן, רשאי לפנות לבעל מאגר המידע בבקשה לתקן את המידע או למוחקו. אם בעל המאגר סירב למלא בקשה זו, עליו להודיע על כך למבקש באופן ובדרך שנקבעו בתקנות. על סירובו של בעל מאגר מידע לאפשר עיון ועל הודעת סירוב לתקן או למחוק מידע, רשאי מבקש המידע לערער לפני בית משפט השלום באופן ובדרך שנקבעו בתקנות.\n' +
                                                                'בנוסף, אם המידע שבמאגרי החברה משמש לצורך פניה אישית אליך, בהתבסס על השתייכותך לקבוצת אוכלוסין, שנקבעה על-פי איפיון אחד או יותר של בני אדם ששמותיהם כלולים במאגר (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"פניה בהצעה מסחרית"'}</Text>{


                                                                '), כי אז אתה זכאי על-פי חוק הגנת הפרטיות, לדרוש בכתב שהמידע המתייחס אליך יימחק ממאגר המידע. החברה תימחק במקרה זה מידע הדרוש לה רק כדי לפנות אליך בהצעות מסחריות כאמור לעיל. מידע הדרוש להחברה לשם ניהול עסקיה - לרבות תיעוד פעולות מסחריות ואחרות שביצעת באפליקציה - יוסיף להישמר בהחברה על-פי דין, אך לא ישמש עוד לצורך פניות אליך. אם בתוך 30 יום לא תקבל הודעה כי המידע שנתבקשה החברה למחוק אכן נמחק על-פי סעיף זה, תהיה זכאי לפנות לבית משפט השלום באופן הקבוע בתקנות שמכוח החוק, כדי שיורה להחברה לפעול כאמור.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"הודעות Push"'}</Text>{


                                                                '\n' +
                                                                'החברה מיישמת ו/או עלולה ליישם בעתיד, במסגרת השימוש באפליקציה, שירות הודעות בדחיפה (להלן: '
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"הודעות ה-Push"'}</Text>{


                                                                ') המאפשר לשלוח התראות וצלילים אף אם האפליקציה איננה פעילה, זאת, דרך שרתי מערכת ההפעלה של המחשב בו מבוצע השימוש באפליקציה. \n' +
                                                                'יתכן, כי במסגרת השימוש באפליקציה, תישלחנה, מעת לעת, למחשבך הודעות Push באמצעותן תוכל להתעדכן אודות מוצרים ושירותים נוספים שהחברה סבורה כי אתה עשוי למצוא בהם עניין, וכן לקבל מידע נוסף אודות החברה ושירותיה. הודעות ה-Push תישלחנה בזמנים ובתדירות כפי שייקבע על-ידי החברה. \n' +
                                                                'הינך מצהיר כי ידוע לך שהודעות ה-Push עשויות לכלול מסרים שעשויים להיחשב כ-"דבר פרסומת" כהגדרתו בסעיף 30א לחוק התקשורת (בזק ושידורים), התשס"ח–2008, והינך רשאי לבטל או לעדכן את האפשרות לקבל את הודעות ה-Push, כולן או מקצתן, בכל עת, באמצעות שינוי הגדרות האפליקציה במכשיר הנייד שברשותך.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שירותי צדדים שלישיים'}</Text>{


                                                                ' \n' +
                                                                'אנו רשאים להשתמש באפליקציה או בשירותי צד שלישי על מנת לאסוף, לאחסן ו/או לעבד את המידע שנאסף במסגרת הפורטל ו/או האפליקציה. אנו עושים מאמצים על מנת להתקשר עם צדדים שלישיים המפרסמים מדיניות פרטיות החלה על איסוף, אחסון, עיבוד ושימוש במידע אישי ובמידע לא אישי. שירותי צדדים שלישיים כוללים, בין היתר, Google Analytics, אשר מדיניות הפרטיות שלה מפורסמת בכתובות: https://www.google.com/policies/privacyוחברת קארדקום בע"מ, אשר פרטים בנוגע למדיניות הפרטיות שלה ניתן למצוא בכתובות: http://www.cardcom.co.il/MainPage.aspx. \n' +
                                                                'יחד עם זאת, לחברה אין כל שליטה על צדדים שלישיים אלה. אנו ממליצים לך לקרוא את תנאי השימוש ומדיניות הפרטיות של צדדים שלישיים אלה ו/או לפנות אליהם במישרין על מנת שתוכל לדעת אילו סוגי מידע נאספים לגביך.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שינויים במדיניות הפרטיות'}</Text>{


                                                                '\n' +
                                                                'החברה שומרת על זכותה לשנות מדיניות פרטיות זו בכל זמן, ומבקשת מכלל המשתמשים לשוב ולבקר בדף זה לעיתים קרובות ככל האפשר. \n' +
                                                                'אנו נודיע למשתמש על כל שינוי מהותי בתנאי מדיניות פרטיות זו, על-ידי פופ-אפ בכניסה למוצר המבקש אישור מחדש למדיניות הפרטיות\n' +
                                                                ' שינויים שאינם מהותיים יכנסו לתוקף תוך שבעה (7) ימים ממועד ההודעה כאמור. כל שאר השינויים במדיניות הפרטיות ייכנסו לתוקף באופן מידי והמשך השימוש שלך באפליקציה לאחר תאריך העדכון האחרון יהווה הסכמה שלך לכך שהשינויים יחייבו אותך. \n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'שאלות'}</Text>{


                                                                '\n' +
                                                                'במידה ויש לך שאלות נוספות או הערות בנוגע לתנאים, הינך מוזמן לפנות אלינו ב”צור קשר” דרך האתר https://www.bizibox.biz או באמצעות דואר אלקטרוני בכתובת: service@bizibox.biz. אנו נעשה את מירב המאמצים לחזור אליך תוך זמן סביר.\n'}
                                                            </Text>
                                                        )}
                                                        {showModalAgreement === 5 && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>{'מדיניות קניין רוחני ושימוש אסורים כלליים באפליקציית bizibox לסריקת מסמכים\n' +
                                                                    '[עודכן בתאריך: 30/11/20]\n' +
                                                                    '\n'}</Text>

                                                                {
                                                                    'כאמור בהסכם רישיון שימוש באפליקציית bizibox לסריקת מסמכים, השימוש באפליקציה כפוף בין השאר למדיניות הקניין הרוחני ושימוש אסורים כלליים אשר מהווה חלק בלתי נפרד מ"תנאי הרישיון". ביטויים אשר לא הוגדרו במדיניות זו, תהא להם משמעות הזהה למשמעותם בהסכם. אנא קרא בעיון את ההוראות הבאות:\n'
                                                                }<Text
                                                                style={{fontFamily: fonts.bold}}>{'קניין רוחני'}</Text>{


                                                                ' \n' +
                                                                'מלוא זכויות הקניין הרוחני באפליקציה הנם בבעלות קניינית מלאה ובלעדית של החברה ו/או בשימושה לפי רישיון שימוש שקיבלה. \n' +
                                                                'בין זכויות קניין רוחני אלו, אך לא רק ומבלי להגביל את כלליות האמור: שמות מתחם (בין אם רשומים או ניתנים לרישום ובין אם לאו), חוויית משתמש, תוכן (מילולי, חזותי, קולי, או כל שילוב שלהם או חלק מהם וכן עיצובו, עיבודו, עריכתו ודרך הצגתו), טקסט, מידע, גרפיקה, עיצובים, תמונות, צילומים, וידאו/סרטונים, לוגו, סמלים, ממשקים, הודעות, מוניטין, זכויות יוצרים, סימני מסחר (בין רשומים ובין אם לאו), פטנטים, רעיונות, פיתוחים, קוד מקור, שיטות, תהליכים, טכנולוגיות, כל זכויות דומות באשר הן.\n' +
                                                                'המשתמש לא יעתיק, ישכפל, יפיץ, יפרסם, ישדר, יציג, ישנה, יעבד או יעשה כל שימוש באפליקציה לכל מטרה, שלא הותרה במפורש לפי תנאי השימוש, ובכלל זה כל שימוש העשוי לפגוע בזכויות הקניין הרוחני של החברה ו/או של צד ג\' אחר כלשהו. \n' +
                                                                'המשתמש לא יעביר בכל דרך שהיא לצד ג\' כלשהו כל ו/או חלק מהקניין הרוחני של החברה ו/או מהאפליקציה ו/או מרישיון השימוש שלו, ללא קבלת הסכמה מפורשת מראש ובכתב מאיתנו ובכפוף לה.  \n' +
                                                                'אישור תנאי השימוש על ידך מהווה הסכמה לכך שנבצע שימוש מכל סוג וכפי שנמצא לנכון, בכל משוב, המלצה או רעיון מכל סוג שהוא, שתעביר לחברה. בכך מוענק לנו רישיון תמידי, הניתן להעברה ולרישוי משנה, גלובלי, בלתי חוזר, משולם במלואו וללא חיוב בתגמולים להשתמש בכל דרך שהיא באלו. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'זכויות ושימושים בתמונות המסמכים הפיננסיים'}</Text>{


                                                                '\n' +
                                                                'השימוש באפליקציה מותנה בכך שצילום המסמכים שתעשה במסגרת שימושך באפליקציה יהיה של המסמכים הפיננסיים האישיים שלך בלבד. \n' +
                                                                'הזכויות במסמכים הפיננסיים אותם תצלם שייכות לך, ואתה מעניק לחברה רישיון חינם, כלל-עולמי, לא בלעדי, בלתי ניתן לביטול וניתן להעברה להשתמש, להעתיק, להפיץ, להכין יצירות נגזרות, ולבצע כל פעולה אחרת הנדרשת עפ"י שיקול דעת החברה לצורך אספקת השירותים לפי תנאי הרישיון, והכול בהתאם למדיניות הפרטיות ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"רשות השימוש של החברה"'}</Text>{


                                                                ').\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שימושים אסורים'}</Text>{


                                                                '\n' +
                                                                'פעולות מסוימות אסורות בעת השימוש באפליקציה, אי עמידה בהוראות המצוינות להלן אף עשויה לחשוף את המשתמש לחבות אזרחית ו/או פלילית. אינך רשאי (ואינך רשאי להתיר לכל צד שלישי) לבצע שימוש ו/או פעולה מבין השימושים שיפורטו להלן, אלא אם הותר לך במפורש על-פי תנאי שימוש אלה: \n' +
                                                                'להשתמש באפליקציה לכל מטרה בלתי חוקית, בלתי מוסרית, בלתי-מורשית ו/או אסורה. \n' +
                                                                'להשתמש באפליקציה למטרות מסחריות או שאינן פרטיות, ללא הסכמה מפורשת של החברה בכתב ומראש. \n' +
                                                                'להסיר או להפריד מהאפליקציה הגבלות וסימנים המציינים זכויות קנייניות של החברה והנך מצהיר ומתחייב בזאת כי תציית לכל החוקים החלים בעניין זה. \n' +
                                                                'להפר ו/או לפגוע בזכויות המשתמשים לפרטיות וזכויות אחרות, או לאסוף מידע אישי מזהה אודות משתמשים ללא הסכמתם המפורשת, בין אם באופן ידני או באמצעות שימוש בכל רובוט, עכביש, זחלן, כל יישום חיפוש או אחזור, או שימוש באמצעי, בתהליך או בשיטה ידניים או אוטומטיים אחרים על מנת להיכנס לאתר ולאחזר, לאסוף ו/או לשאוב מידע. \n' +
                                                                'לפגוע או לשבש בפעולת האפליקציה ו/או האפליקציה או השרתים או הרשתות המאחסנות את האתר, או להפר כל חוק, תקנה, דרישה, נוהל או מדיניות של שרתים או רשתות כאמור. \n' +
                                                                'להצהיר הצהרות שקריות או להציג מצג שווא בנוגע לקשר שלך עם כל אדם או גוף, או לציין במפורש או במרומז כי החברה משויכת אליך בכל דרך שהיא, מעניקה חסות, תומכת בך, באתר שלך, בעסקך או בהצהרותיך, או להציג מידע שקרי או לא מדויק אודות החברה. \n' +
                                                                'לבצע כל פעולה היוצרת או העלולה ליצור עומס גדול ובלתי סביר על תשתית האפליקציה.\n' +
                                                                'לעקוף את כל האמצעים בהם החברה משתמשת על מנת למנוע או להגביל את הגישה לאפליקציה.\n' +
                                                                'להעתיק, לתקן, לשנות, להתאים, למסור, להנגיש, לתרגם, להפנות, לבצע הנדסה חוזרת, להמיר קוד בינארי לקוד פתוח, לעשות דה-קומפילציה, או להפריד כל חלק באפליקציה.\n' +
                                                                'להציג לציבור, ליצור יצירות נגזרות, לבצע, להפיץ, לתת רישיון משנה, לעשות כל שימוש מסחרי, למכור, להשכיר, להעביר, להלוות, לעבד, לאסוף, לשלב עם אפליקציה אחרת – של כל חומר הכפוף לזכויות קנייניות של החברה, לרבות קניין רוחני של החברה בכל אופן או בכל אמצעי, אלא אם הדבר הותר במפורש בתנאים ו/או על-פי כל דין החל, המתיר פעולות אלו במפורש. \n' +
                                                                'לעשות כל שימוש באפליקציה לכל מטרה שלא הורשתה במפורש, ללא הסכמה של החברה בכתב ומראש. \n' +
                                                                'למכור, לתת רישיון, או לנצל למטרה מסחרית כלשהי כל שימוש או גישה לאפליקציה. \n' +
                                                                'ליצור מאגר מידע על-ידי הורדה ואחסון שיטתיים של כל או חלק מהתוכן באפליקציה.\n' +
                                                                'להעביר או להנגיש בכל דרך אחרת, בקשר לאפליקציה כל וירוס, “תולעת”, סוס טרויאני, באג, רוגלה, נוזקה, או כל קוד מחשב, קובץ או אשר עשויים להזיק, או נועדו להזיק לפעילות של כל חומרה, אפליקציה, ציוד תקשורת, קוד או רכיב. \n' +
                                                                'להפר אי אלו מתנאי הרישיון.\n'}</Text>
                                                        )}
                                                        {showModalAgreement === 4 && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>
                                                                    {'מדיניות האחריות הכללית - bizibox לסריקת מסמכים\n' +
                                                                        '[עודכן בתאריך: 29/11/2020]\n' +
                                                                        '\n'
                                                                    }
                                                                </Text>


                                                                <Text
                                                                    style={{fontFamily: fonts.bold}}>{'כאמור בהסכם רישיון שימוש בתוכנת bizibox לסריקת מסמכים, השימוש באפליקציה כפוף בין השאר למדיניות האחריות הכללית של האפליקציה אשר מהווה חלק בלתי נפרד מ”תנאי הרישיון”. ביטויים אשר לא הוגדרו במדיניות זו, תהא להם משמעות הזהה למשמעותם בהסכם.אנא קרא בעיון את ההוראות הבאות:'}</Text>{


                                                                '\n' +
                                                                'אנו עושים מאמצים על מנת להבטיח שהאפליקציה תהייה זמינה עבורך באופן רציף וכי השימוש בה יהיה יעיל ומאובטח ככל הניתן. ככל שתתגלה תקלה הנובעת מהאפליקציה, נפעל לתקנה (יתכן כי באמצעות צד ג\'), בכפוף לקבלת הודעת קריאה בסמוך למועד גילוי התקלה ולשיתוף פעולתך בנושא.\n' +
                                                                'עם זאת, השימוש באפליקציה, תלוי בגורמים שאינם בשליטת החברה ולכן איננו מתחייבים שהשימוש בה יהיה ללא תקלות ו/או הפרעות ו/או נקי מפגמים ו/או הגבלות אחרות ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'“תקלה”'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'“תקלות”'}</Text>{


                                                                ') ולכן החברה אינה אחראית להיבטים אלו ולאחרים. אנא שים לב לתקלות אפשריות העלולות להתרחש במסגרת השימוש באפליקציה:\n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'זמינות'}</Text>{


                                                                ' \n' +
                                                                'יתכן ומעת לעת לא יתאפשר זמנית השימוש באפליקציה בשל תקלה, עדכון, תחזוקה, תיקון ו/או כל פעולה אחרת, שהחברה, לפי שיקול דעתה הבלעדי תנקוט.  \n' +
                                                                'החברה שומרת לעצמה את הזכות לתקן, להרחיב, לשפר, לעדכן, לשדרג, לאבטח, להוסיף תכונות חדשות, להסיר, ו/או לערוך כל התאמה ו/או שינוי אחר באפליקציה, בלא צורך להודיע על כך מראש. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'דיוק וטכנולוגיה'}</Text>{


                                                                '\n' +
                                                                'החברה משקיעה מאמצים רבים בהגנה מפני סיכונים הטמונים בטכנולוגיה ומבצעת מאמצים רבים לנאמנות המידע ביחס לנתוני המקור, אך עם זאת, יתכנו אי-דיוקים במידע לאור גורמים רבים הקשורים בכשלים טכנולוגיים פוטנציאליים הכרוכים בסריקת מסמכים לרבות איכות הצילום, רזולוציית המצלמה וכד\'.\n' +
                                                                'החברה אינה בודקת ואינה אחראית לדיוק ו/או לנכונות ו/או לשלמות התיעוד שתבצע והתוצרים שהיועץ הפיננסי שלך יפיק ממסמכים אלו. \n' +
                                                                'הנך מחויב לבדוק את דיוק תיעוד המסמכים הפיננסיים ביחס להשוואתם למסמכי המקור. \n' +
                                                                'החברה אינה מצהירה, בכל צורה כי המסמכים הפיננסיים המקוונים שיופקו באמצעות האפליקציה מדויקים, איכותיים, מקצועיים, נכונים.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'סיכוני אינטרנט'}</Text>{


                                                                ' \n' +
                                                                'אנו משקיעים מאמצים רבים בהגנה מפני סיכונים הטמונים באינטרנט לרבות סיכוני סייבר. \n' +
                                                                'עם זאת, אין ביכולתנו ו/או בשליטתנו למנוע לחלוטין את חדירתן ופעולתן של תוכנות מזיקות וגורמים עוינים כגון וירוסים, באגים, רוגלות, או כל קודי מחשב, קבצים או תוכנות אחרות אשר עשויים לבצע תרמיות והונאות מקוונות וכד\'.\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'הגבלת אחריות'}</Text>{


                                                                '\n' +
                                                                'השירותים באפליקציה ניתנים לך “כמות שהם”(“as is”) , ללא כל התחייבות או אחריות מכל סוג שהוא, באופן מפורש או מכללא, לרבות בין השאר, אחריות בנוגע לסחירות, דיוק, אי הפרה של זכויות קניין רוחני, או להתאמה למטרה מסוימת.\n' +
                                                                'הסכמה לתנאי השימוש משמעה שבדקת את האפליקציה על כלל האמור בתנאי השימוש, ומצאת כי האפליקציה מתאימה לצרכיך ולמטרותיך.  \n' +
                                                                'כאמור ולמען הסר ספק, השימושים באפליקציה אינו מהווה ייעוץ כספי, פיננסי, חשבונאי, מיסויי, ייעוץ בהשקעות ו/או כל ייעוץ אחר, ואין בשימוש משום הצעה, שידול ו/או ייעוץ לביצוע כל עסקה, פעולה ו/או קבלת החלטה כלשהי.  \n' +
                                                                'החברה תהיה פטורה מכל אחריות לכל הוצאה, הפסד, נזק ישיר ו/או עקיף, הפסד הכנסה או עסקים, רווח מנוע, פגיעה במוניטין וכיו”ב, שנגרם ו/או אשר עלול להיגרם לך,  ו/או לכל צד ג\' אחר בקשר עם ו/או כתוצאה משימוש באפליקציה בעקיפין /או במישרין ו/או בקשר עם תנאי השימוש ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'“פטור מאחריות”'}</Text>{


                                                                '). \n' +
                                                                'פטור מאחריות זה, כולל, בין השאר, אך לא רק, נזק עקב טעות, תקלות ,תפעול שגוי של האפליקציה, תקלות ו/או נזקים הנובעים מצדדים שלישיים להסכם, זמינות ו/או זמני תגובה של המערכות הממוחשבות שלך ו/או של צדדים שלישיים, שיבושים במידע ו/או בנתונים ו/או בקבלתם ו/או באובדנם כתוצאה מתקלות אחרות שאינן בשליטת החברה, ובכלל זה תקלה ו/או חוסר התאמה ו/או דיוק בין הנתונים המקוריים לאלו אשר נקלטו באפליקציה. \n' +
                                                                'החברה מצהירה, כי לא תוכל לספק את רישיון השימוש ללא הגבלת האחריות כאמור לעיל.  \n' +
                                                                'בכל מקרה, שלטענתך, נגרם לך ו/או למי מטעמך נזק בקשר לאפליקציה ו/או למידע ו/או לתנאי השימוש, עליך למסור מיד הודעה בכתב לחברה בליווי כל המידע ו/או החומר הרלבנטיים, ולשתף עמנו פעולה בכל עניין בקשר לכך.\n' +
                                                                'הנך מתחייב/ת בזאת לשפות ולפצות את החברה או מי מטעמה, בגין כל נזק, הוצאה או הפסד, ישיר או עקיף, לרבות הוצאות משפט ושכ”ט עורכי דין, שיגרמו לה בקשר עם הפרת תנאי השימוש, או ביצוע כל פעולה אחרת בניגוד לדין בקשר האפליקציה. \n' +
                                                                '\n' +
                                                                ' \n' +
                                                                '\n'}</Text>
                                                        )}

                                                        {showModalAgreement === 6 && (
                                                            <Text
                                                                style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(13.5),
                                                                    textAlign: 'right',
                                                                    fontFamily: fonts.regular,
                                                                }}>
                                                                <Text style={{
                                                                    fontFamily: fonts.bold,
                                                                    textAlign: 'center',
                                                                }}>
                                                                    {'הסכם רישיון שימוש בתוכנת bizibox לרו"ח ויועצי מס\n' +
                                                                        '[עודכן בתאריך: 8 מרס, 2021]\n' +
                                                                        '\n'}
                                                                </Text>

                                                                <Text style={{fontFamily: fonts.bold}}>{'הקדמה'}</Text>{

                                                                '\n' +
                                                                'השימוש בתוכנת  bizibox ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"התוכנה"'}</Text>{


                                                                ') ע"י רו"ח ויועצי מס ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"המשתמש"'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אתה"'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"רו"ח"'}</Text>{


                                                                ') מבית חברת איי-פקט בע"מ ('
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"החברה"'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"אנחנו"'}</Text>{


                                                                '), על השירותים הניתנים ו/או שיינתנו בה ו/או באמצעותה ('
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"השירותים"'}</Text>{


                                                                ') כפוף גם ל'}
                                                                <Text
                                                                    onPress={() => {
                                                                        this.setState({
                                                                            backTo6: true,
                                                                            showModalAgreement: 3,
                                                                        })
                                                                    }}
                                                                    style={{
                                                                        color: '#038ed6',
                                                                    }}>{'מדיניות הפרטיות'}</Text>
                                                                {', '}
                                                                <Text
                                                                    onPress={() => {
                                                                        this.setState({
                                                                            backTo6: true,
                                                                            showModalAgreement: 4,
                                                                        })
                                                                    }}
                                                                    style={{
                                                                        color: '#038ed6',
                                                                    }}>{'מדיניות האחריות הכללית'}</Text>
                                                                {' ו-'}
                                                                <Text
                                                                    onPress={() => {
                                                                        this.setState({
                                                                            backTo6: true,
                                                                            showModalAgreement: 5,
                                                                        })
                                                                    }}
                                                                    style={{
                                                                        color: '#038ed6',
                                                                    }}>{'מדיניות הקניין הרוחני והשימושים אסורים'}</Text>
                                                                {' של החברה (ביחד יקראו תנאי הסכם רישיון זה ומסמכי המדיניות '
                                                                }<Text
                                                                style={{fontFamily: fonts.bold}}>{'"תנאי הרישיון"'}</Text>{


                                                                ' או '
                                                            }<Text style={{fontFamily: fonts.bold}}>{'"ההסכם"'}</Text>{


                                                                '). \n' +
                                                                'אישור תנאי הרישיון מהווים את הסכמתך לתוכנם ואת והתחייבותך לפעול בהתאם להם. הינך רשאי לסיים את ההסכם והרישיון בכל רגע נתון באמצעות שליחת הודעה לחברה, זאת ע"י "קריאת שרות" הזמינה בתוכנה ו/או באמצעות משלוח מייל לכתובת service@bizibox.biz. לאחר קבלת הודעה כאמור, החברה תחסום את גישתך לתוכנה ותשמיד כל מידע שנאסף באמצעות התוכנה אודותיך ואודות לקוחותיך ונשמר במערכותיה בהתאם לתנאי ההסכם.  \n' +
                                                                'השימוש בשירותים שלנו כפוף לתנאי הרישיון העדכניים ביותר. עליך לדעת כי תנאי ההסכם ו/או תנאי השימוש עלולים להשתנות ולכן מומלץ לעיין בהם מפעם לפעם, אנו ניידע אותך ונבקש את הסכמתך לכך בעת שינויים מהותיים, ע"י "פופ-אפ" אשר יופיע בעת הכניסה לתוכנה.\n' +
                                                                'האמור בתנאים אלה מתייחס באופן שווה לנשים וגברים, והשימוש בלשון זכר נעשה מטעמי נוחות. כותרות הסעיפים בהסכם זה נועדו לנוחות בלבד, ואין להתחשב בהן בפרשנות תנאי הרישיון. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'רישיון השימוש בתוכנה'}</Text>{


                                                                ' \n' +
                                                                'במהלך תקופת ההסכם, בכפוף לכל דין, לנכונות הצהרותיך ומילוי כלל התחייבויותיך על פיו, ובכפוף לתשלום התמורה החודשית כפי שתסוכם בינך לבין החברה, החברה מעניקה לך בזאת רישיון שימוש מוגבל (כלומר, הרישיון ניתן לביטול, בלתי-ייחודי, בלתי ניתן להעברה, ולא ניתן להעניק בו רישיונות-משנה) בתוכנה, יצוין כי הרישיון מוענק למטרת ניהול נתוני רו"ח ו/או הנתונים הפיננסיים של לקוחותיך אשר בהם אתה מבצע שימוש במסגרת מתן השירות להם ובהתאם להרשאתם המפורשת לעשות זאת (להלן בהתאמה: "רישיון השימוש" וה- "נתונים"). \n' +
                                                                'מובהר בזאת כי החברה תהיה זכאית להעניק לכל צד שלישי אחר רישיון זהה או דומה לרישיון השימוש לפי שיקול דעתה הבלעדי. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'שימוש בתוכנה'}</Text>{


                                                                '\n' +
                                                                'באמצעות טכנולוגיית ליקוט, יבוא, עיבוד וקריאה אוטומטית, התוכנה קולטת את הנתונים הפיננסיים של לקוחותיך (לרבות נתוני כרטיסי אשראי וסליקה, הלוואות, פיקדונות, מסגרות אשראי) (בהתאמה : "הטכנולוגיה" ו"הנתונים"), ובאמצעות רכיב תוכנה המתממשק לתוכנות הנהלת החשבונות ניתן להציג את הנתונים הפיננסיים ביחס ללקוח או לקבוצת לקוחות ב-Dashboard, ולבצע מגוון פעולות ביחס אליהם, בין השאר: איתור מגמות ושינויים בהשוואה לתקופות קודמות, העברת כלל הנתונים אל תוכנות הנהלת החשבונות באופן אוטומטי ומהיר, הצגת דו"חות חשבונאיים על פי נתוני תוכנות הנה"ח, ויצירת פקודות יומן אוטומטיות זמניות (לתוכנת הנה"ח, לחשבוניות ספקים/לקוחות, לתנועות בדפי הבנק). כן התוכנה מהווה ארכיון ממוחשב לכל המסמכים שהועלו אליה ומאפשרת שימושי BI שונים ( להלן, יחדיו: ה"תוצרי השימוש" או "שימושי התוכנה המותרים"). \n' +
                                                                'יובהר כי חלק מהשירותים יהיו זמינים בעתיד והחברה שומרת לעצמה את הזכות הבלעדית לשנות ו/או לעדכן ו/או להסיר חלק מהשירותים על פי שיקול דעתה הבלעדי. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'הרשאת שימוש'}</Text>{


                                                                '\n' +
                                                                'הזנת הנתונים של לקוחותיך בתוכנה והשימוש בהם מותנה בקבלת הרשאה מפורשת לכך. עליך לקבל הרשאה זו מכל לקוח,לפיה הוא מודע ומסכים כי תזין את נתוניו בתוכנה ובהם יעשה שימוש כמפורט במדיניות הפרטיות. על ההרשאה להתקבל בטרם הזנת הנתונים ולהתייחס לאורך כל תקופת שימושך בתוכנה. \n' +
                                                                'בכלל זה עליך להביא לידיעת הלקוח במסגרת קבלת ההרשאה את ההיבטים הבאים: (1) תידרש גישה לנתוני הנהלת החשבונות וכניסה לחשבונות במוסדות הפיננסים. (2) כחלק משימושך בתוכנה תבצע באמצעותה קריאה אוטומטית של הנתונים מהם תפיק תוצרי השימוש. (3) במהלך ו/או במסגרת שימושך בתוכנה יישמר ו/או יבוצע שימוש במידע ע”י החברה בכדי לאפשר למשתמשים את השימוש בתוכנה ואת קבלת השירות מאיתנו, לאפשר לנו לשפר את השירות, להציע שירותים נוספים, לברר ולפעול בכל עניין הנוגע לתנאי שימוש אלו ולמדיניות הפרטיות, לנתח, לחקור ולבקר עניינים נוספים בקשר לתוכנה ו/או לשירותי החברה ו/או ביחס אליך וללקוחותיך. (4) אנו רשאים להסתייע בשירותי צד ג\' בנוגע למידע (כגון גוגל ואמזון), והכול כמפורט בתנאי השימוש הכלליים ובמדיניות הפרטיות. (5) הוראות מדיניות הפרטיות חלות על הלקוח מרגע שנתוניו הוכנסו לתוכנה והלקוח מודע לתוכן מדיניות הפרטיות ומסכים לאמור בה. \n' +
                                                                '\n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'הצהרת המשתמש'}</Text>{


                                                                ' \n' +
                                                                'באישורך והסכמתך לתנאי השימוש, יש בכדי להוות את הצהרתך להיבטים הבאים: \n' +
                                                                '\n' +
                                                                'אתה רשאי ומוסמך להתקשר בהסכם זה ולא קיימת כל מניעה חוקית, חוזית או אחרת להתקשרותך בו ו/או בביצוע התחייבויותיך על פיו ו/או ביחס לשימושך בתוכנה. \n' +
                                                                'לא תעשה כל שימוש בלתי מורשה עפ"י הסכם זה. שימושך בתוכנה יעשה רק לצרכי שימושי התוכנה המותרים כהגדרתם, בהתאם לכל דין לרבות חוק הגנת הפרטיות והתקנות מכוחו וכאמור, לאחר קבלת ההרשאה.\n' +
                                                                'אתה תהייה אחראי כלפי החברה ו/או מי מטעמה לכל נזק, הפסד ו/או הוצאה שיגרמו לחברה ו/או מי מטעמה כתוצאה מדרישה ו/או תביעה של צד ג\' כלשהו כתוצאה ממעשה ו/או מחדל שלך המהווה הפרה של הסכם זה, ותשפה את החברה ו/או מי מטעמה בגין כל נזק ו/או הוצאה שייגרמו לה. \n' +
                                                                'אתה מתחייב, לחדול מלהשתמש בתוכנה עבור כל לקוח, שחדל להיות לקוח שלך ו/או שביטל את הסכמתו לגבי המשך השימוש בתוכנה. עליך למסור לנו הודעה במקרה בו הלקוח הפסיק או הגביל את הרשאתו. \n'
                                                            }<Text style={{fontFamily: fonts.bold}}>{'כללי'}</Text>{


                                                                ' \n' +
                                                                'התוכנה מסופקת לך לצורך שיפור תהליכי הנהלת החשבונות וייעול תהליכי העבודה בניהול המשרד ושיפור השירות ללקוחותיך בלבד, ובכל מקרה אינה מיועדת לספק לך או ללקוחותיך שירותי ייעוץ מכל סוג. על כן, השימוש בתוכנה אינו תחליף להפעלת שיקול דעתך העצמאי וכל פעולה ו/או החלטה על בסיס התוכנה היא באחריותך בלבד. \n' +
                                                                'מטעמי אבטחת מידע יידרש שימוש בשם משתמש וסיסמה אישיים של המשתמשים במשרדך, ואתה תנקוט בכל האמצעים הנחוצים לשמירת סודיותם ולאי חשיפתם לצד ג\' כלשהו. \n' +
                                                                'תנאי שימוש אלה אינם יוצרים ולא יתפרשו כאילו הם יוצרים יחסי שותפות, מיזם משותף, יחסי עובד-מעסיק, יחסי שליחות או יחסי נותן-מקבל זיכיון בין הצדדים. \n' +
                                                                'סמכות השיפוט הבלעדית לדון בכל מחלוקת ו/או סכסוך בקשר עם תנאי הרישיון תהא נתונה לבית המשפט המוסמך במחוז תל אביב. \n'
                                                            }<Text
                                                                style={{fontFamily: fonts.bold}}>{'פניה לחברה'}</Text>{


                                                                ' \n' +
                                                                'במידה ויש לך שאלות נוספות או הערות בנוגע לתנאים, הינך מוזמן לפנות אלינו ע"י קריאת שרות דרך התוכנה,ב"צור קשר" באתר החברה https://www.bizibox.biz ובאמצעות דואר אלקטרוני בכתובת: service@bizibox.biz, אנו נעשה את מירב המאמצים לחזור אליך תוך זמן סביר. \n' +
                                                                'קראתי והבנתי את תנאי ההסכם ואני מסכימ/ה לכל התנאים המפורטים בהם.\n'}
                                                            </Text>
                                                        )}

                                                    </ScrollView>
                                                </View>
                                            </Fragment>
                                        )}


                                        {(showModalAgreement === 1 || showModalAgreement === 2 || showModalAgreement === 8) && (
                                            <View style={{
                                                flexDirection: 'column',
                                                marginHorizontal: 20,
                                                marginBottom: 20,
                                            }}>
                                                <View style={{
                                                    marginBottom: 10,
                                                }}>
                                                    <CheckBox
                                                        activeOpacity={1}
                                                        Component={TouchableWithoutFeedback}
                                                        onPress={() => this.setState({appAgreementConfirmation: !this.state.appAgreementConfirmation ? new Date(Date.now()).toISOString() : false})}
                                                        containerStyle={{
                                                            backgroundColor: 'transparent',
                                                            left: 0,
                                                            top: 0,
                                                            margin: 0,
                                                            padding: 0,
                                                            borderWidth: 0,
                                                            right: 0,
                                                            width: '100%',
                                                            marginRight: -2,
                                                        }}
                                                        textStyle={{
                                                            fontSize: sp(15),
                                                            top: 0,
                                                            color: '#022258',
                                                            fontWeight: 'normal',
                                                            textAlign: 'right',
                                                            fontFamily: fonts.regular,
                                                            right: 0,
                                                            left: 0,
                                                            marginRight: 5,
                                                            margin: 0,
                                                            padding: 0,
                                                        }}
                                                        fontFamily={fonts.regular}
                                                        right
                                                        checkedColor="#022258"
                                                        uncheckedColor="#022258"
                                                        iconType="material-community"
                                                        checkedIcon="checkbox-marked"
                                                        uncheckedIcon="checkbox-blank-outline"
                                                        size={24}
                                                        iconRight
                                                        title={<View style={{
                                                            flexDirection: 'column',
                                                            paddingTop: 15,
                                                            paddingRight: 5,
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: sp(15),
                                                                    color: '#022258',
                                                                    fontFamily: fonts.regular,
                                                                }}>{'קראתי והבנתי את'}</Text>
                                                                <Text>{' '}</Text>
                                                                <Text
                                                                    onPress={() => {
                                                                        Linking.canOpenURL('https://bizibox.biz/terms-of-use-scanning-app/')
                                                                            .then(s => {
                                                                                if (s) {
                                                                                    Linking.openURL('https://bizibox.biz/terms-of-use-scanning-app/')
                                                                                }
                                                                            })
                                                                        // this.setState({
                                                                        //     showModalAgreement: 2,
                                                                        // })
                                                                        // this.updateAgreementCompaniesConfirmation(null, null, true)
                                                                    }}
                                                                    style={{
                                                                        fontSize: sp(15),
                                                                        color: '#038ed6',
                                                                        fontFamily: fonts.regular,
                                                                    }}>{'הסכם שימוש'}</Text>
                                                                <Text>{' '}</Text>
                                                                <Text
                                                                    onPress={() => {
                                                                        Linking.canOpenURL('https://bizibox.biz/privacy-policy-scanning-app/')
                                                                            .then(s => {
                                                                                if (s) {
                                                                                    Linking.openURL('https://bizibox.biz/privacy-policy-scanning-app/')
                                                                                }
                                                                            })
                                                                        // this.setState({
                                                                        //     showModalAgreement: 8,
                                                                        // })
                                                                        // this.updateAgreementCompaniesConfirmation(null, null, true)
                                                                    }}
                                                                    style={{
                                                                        fontSize: sp(15),
                                                                        color: '#038ed6',
                                                                        fontFamily: fonts.regular,
                                                                    }}>{'ומדיניות פרטיות'}</Text>
                                                            </View>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: sp(15),
                                                                    color: '#022258',
                                                                    fontFamily: fonts.regular,
                                                                }}>ואני מסכימ/ה לכל התנאים המפורטים בהם</Text>
                                                            </View>
                                                        </View>}
                                                        checked={this.state.appAgreementConfirmation !== false}
                                                    />
                                                </View>
                                                <View style={{
                                                    marginBottom: 22,
                                                }}>
                                                    <CheckBox
                                                        activeOpacity={1}
                                                        Component={TouchableWithoutFeedback}
                                                        onPress={() => this.setState({sendMarketingInformation: !this.state.sendMarketingInformation ? new Date(Date.now()).toISOString() : false})}
                                                        containerStyle={{
                                                            backgroundColor: 'transparent',
                                                            left: 0,
                                                            top: 0,
                                                            margin: 0,
                                                            padding: 0,
                                                            borderWidth: 0,
                                                            right: 0,
                                                            width: '100%',
                                                            marginRight: -2,
                                                        }}
                                                        textStyle={{
                                                            fontSize: sp(15),
                                                            top: 0,
                                                            color: '#022258',
                                                            fontWeight: 'normal',
                                                            textAlign: 'right',
                                                            fontFamily: fonts.regular,
                                                            right: 0,
                                                            left: 0,
                                                            marginRight: 5,
                                                            margin: 0,
                                                            padding: 0,
                                                        }}
                                                        fontFamily={fonts.regular}
                                                        right
                                                        checkedColor="#022258"
                                                        uncheckedColor="#022258"
                                                        iconType="material-community"
                                                        checkedIcon="checkbox-marked"
                                                        uncheckedIcon="checkbox-blank-outline"
                                                        size={24}
                                                        iconRight
                                                        title={<View style={{
                                                            flexDirection: 'column',
                                                            paddingTop: 0,
                                                            paddingRight: 5,
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                            }}>
                                                                <Text style={{
                                                                    fontSize: sp(15),
                                                                    color: '#022258',
                                                                    fontFamily: fonts.regular,
                                                                }}>אשמח לקבל עדכונים על המוצרים</Text>
                                                            </View>
                                                        </View>}
                                                        checked={this.state.sendMarketingInformation !== false}
                                                    />
                                                </View>
                                                <View style={{
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                }}>
                                                    <Button
                                                        onPress={() => {
                                                            this.setState({
                                                                showModalAgreement: false,
                                                            })
                                                            this.updateAgreementCompaniesConfirmation(this.state.appAgreementConfirmation, this.state.sendMarketingInformation, false)
                                                        }}
                                                        disabled={this.state.appAgreementConfirmation === false}
                                                        buttonStyle={{
                                                            width: 201,
                                                            height: 36,
                                                            backgroundColor: '#022258',
                                                            borderRadius: 5,
                                                        }}
                                                        title={<View style={{
                                                            flexDirection: 'row',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            alignContent: 'center',
                                                        }}><Text style={{
                                                            color: '#ffffff',
                                                            fontSize: sp(18),
                                                            lineHeight: sp(18),
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'center',
                                                        }}>אישור</Text></View>}
                                                    />
                                                </View>
                                            </View>
                                        )}


                                    </Fragment>
                                </View>
                            </View>
                        </Animated.View>
                    </Modal>
                )}
            </SafeAreaView>
        )
    }
}
