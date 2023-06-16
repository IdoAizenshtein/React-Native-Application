import React, {Fragment, PureComponent} from 'react'
import {
    ActivityIndicator,
    Animated,
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    Linking,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    SectionList,
    StatusBar,
    Text,
    TouchableHighlight,
    TouchableOpacity,
    View,
    SafeAreaView,
} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import {connect} from 'react-redux'
import {withTranslation} from 'react-i18next'
import styles from './OverviewScreenStyles'
import {getAccount, getAccountBankTransBySections, getAccountGroups} from '../../redux/selectors/account'
import {IS_IOS} from '../../constants/common'
import {colors, fonts} from '../../styles/vars'
import commonStyles from '../../styles/styles'
import CustomIcon from '../../components/Icons/Fontello'
import AccountIcon from '../../components/AccountIcon/AccountIcon'
import TextIcon from '../../components/Icons/TextIcon'
import {
    combineStyles as cs,
    getBankTransIcon,
    getCurrencyChar,
    getErrText,
    getFormattedValueArray,
    getTransCategoryIcon,
    goTo,
    goToBack,
    sp,
} from '../../utils/func'
import {BANK_TOKEN_STATUS, DEFAULT_PRIMARY_CURRENCY, PASSWORD_RECOVERY_LINKS} from '../../constants/bank'
import {getAccountIdForSelection} from '../../utils/account'
import AccountsModal from '../../components/AccountsModal/AccountsModal'
import {getAccounts, selectAccounts} from '../../redux/actions/account'
import {Pie} from '../../components/Chart/Pie'
import UncontrolledChartSlider from '../../components/Chart/UncontrolledChartSlider'
import {values} from 'lodash'
import {getCashFlowBalanceChartData} from '../../redux/actions/cashFlow'
import {AccountAlertOverview} from '../../components/AccountAlert/AccountAlertOverview'
import AccountAlertDetails from '../../components/AccountAlert/AccountAlertDetails'
import {BANK_ACCOUNTS, CASH_FLOW, CHECKS, CREDIT_CARD, PACKAGES, SLIKA} from '../../constants/navigation'
import {Icon} from 'react-native-elements'
import AggregateDataTypeRow from './AggregateDataTypeRow'
import Api from '../../api/Api'
import DataListSectionHeader from '../../components/DataList/DataListSectionHeader'
import {dateToFromNowDaily, isToday} from '../../utils/date'
import {
    approveDowngradeApi,
    approveUpgradeApi,
    cashFlowAggregateDataApi,
    deleteRowDepositApi,
    deleteRowLoanApi,
    denyUpgradeApi,
    getAccountCflTransTypeApi,
    getDepositDetailsApi,
    getLoanDetailsApi,
    getStatusTokenTypeApi,
} from '../../api'
import AppTimezone from '../../utils/appTimezone'
import CalendarModal from './CalendarModal'
import {LocaleConfig} from 'react-native-calendars'
import AlertsTrial from 'src/components/AlertsTrial/AlertsTrial'
import {PieChart} from 'react-native-svg-charts'
import {ALERTS_TRIAL, COMPANY_INFO, IS_LIGHT} from '../../constants/config'
import BankTokenService from '../../services/BankTokenService'
import UpdateTokenModal
    from 'src/screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/UpdateTokenModal'
import BlockedModal
    from 'src/screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/components/BlockedModal'
import {getCompanies, selectCompany} from '../../redux/actions/company'
import {PAYMENTS_TO_BIZIBOX_TAB} from '../../constants/settings'
import BottomSheetMutavim from '../../components/BottomSheetMutavim/BottomSheetMutavim'
import {setOpenedBottomSheet} from '../../redux/actions/user'
import loaderStyles from "../../components/Loader/LoaderStyles";

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)

const NAVBAR_HEIGHT = 225
const STATUS_BAR_HEIGHT = Platform.select({
    ios: 95,
    android: 95,
    default: 95,
})
const winWidth = Dimensions.get('window').width
const numberFormat = new Intl.NumberFormat('he')
// const DELAY = IS_IOS ? 150 : 200

@connect(state => ({
    globalParams: state.globalParams,
    user: state.user,
    companies: state.companies,
    isRtl: state.isRtl,
    currentCompanyId: state.currentCompanyId,
    accounts: getAccount(state),
    accountGroups: getAccountGroups(state),
    accountTodayTrans: state.accountTodayTrans,
    bankTrans: getAccountBankTransBySections(state),
    accountBalanceChartData: state.cashFlowBalanceChartData,
    screenMode: state.bankAccountScreenMode,
    searchkey: state.searchkey,
    openedBottomSheet: state.openedBottomSheet,
}))
@withTranslation()
export default class OverviewScreen extends PureComponent {
    height = null

    constructor(props) {
        super(props)
        const openPopupAfterUpgrade = props.route.params.openPopupAfterUpgrade

        this.state = {
            isReady: true,
            inProgress: false,
            isLayoutComplete: false,
            isLayoutCompleted: false,
            progressModalDetails: false,
            progressPies: true,
            showtrialBlocked: false,
            lockedModalIsOpen: false,
            currentToken: null,
            updateTokenModalIsOpen: false,
            newTokenStatus: null,
            statusToken: null,
            openPopupAfterUpgrade: !!openPopupAfterUpgrade,
            fadeAnimUpgrade: new Animated.Value(1),
            refreshing: false,
            accountBalanceChartData: null,
            calendarModalIsOpen: false,
            cashFlowAggregatedData: null,
            headerMaxHeight: 0,
            alertDetailsIsOpen: false,
            selectedAccountIds: [],
            currentSelectedAccountId: null,
            selectedGroup: null,
            accountsModalIsOpen: false,
            pointerEvents: 'none',
            dataPopUpDetails: false,
            scrollAnim: new Animated.Value(0),
            dateFromTimestamp: AppTimezone.moment().valueOf(),
            dateTillTimestamp: AppTimezone.moment().add(1, 'month').valueOf(),
            transTypeWidth: 0,
            paymentDescWidth: ((winWidth / 2)),
            typePie: 'PAYMENT_DESC',
            aggregateDataType: {
                expenses: [],
                incomes: [],
                totalExpenses: null,
                totalIncomes: null,
            },
            categoriesArr: [],
            typePieChooseExpense: false,
            currentOpenItemIndex: null,
            financialData: {
                creditCard: 0,
                deopsit: 0,
                inChecks: 0,
                lenicaion: 0,
                loans: 0,
                mishmeretBabank: 0,
                outChecks: 0,
                slika: 0,
            },
            bankTrans: null,
            enabledScroll: true,
            stateTextMonth: '',
            loanModalIsOpen: false,
            dateFrom: AppTimezone.moment()
                .startOf('month')
                .format('YYYY-MM-DD'),
            dateTill: AppTimezone.moment().format('YYYY-MM-DD'),
            loans: [],
            deleteLoanModal: false,
            showLoanRowModal: false,
            loanRow: {},
            deposit: [],
            deleteDepositModal: false,
            showDepositRowModal: false,
            depositRow: {},
            depositModalIsOpen: false,
            fadeAnim: new Animated.Value(1),
            minHeight: 0,
            fadeAnimBiziboxTrialExpired: new Animated.Value(1),
            fadeAnimApproveDowngrade: new Animated.Value(1),
            showLastRowPopup: false,
            showApproveDowngrade: false,
            statusNotValid: false,
        }
        // //console.log(Platform)
        this.scrollX = new Animated.Value(0)
        this.headerChartX = new Animated.ValueXY()

        if (this.props.route.params.openPopupAfterUpgrade) {
            delete this.props.route.params.openPopupAfterUpgrade
        }
    }

    get isLoader() {
        const {isReady, inProgress} = this.state
        return !isReady || inProgress
    }

    get accountIdsForRequest() {
        const {selectedAccountIds, currentSelectedAccountId} = this.state
        return currentSelectedAccountId
            ? [currentSelectedAccountId]
            : selectedAccountIds
    }

    get selectedAccounts() {
        const {accounts} = this.props
        const selectedAccountIds = this.accountIdsForRequest

        return accounts.filter(
            a => selectedAccountIds.includes(a.companyAccountId))
    }

    get selectedDeviantAccounts() {
        if (IS_LIGHT.light) {
            return this.selectedAccounts.filter(
                a => a.accountBalance < a.creditLimit)
        } else {
            return this.selectedAccounts.filter(a => a.balanceUse < 0)
        }
    }

    get selectedHarigaDatetAccounts() {
        const {cashFlowAggregatedData} = this.state
        if (cashFlowAggregatedData) {
            return cashFlowAggregatedData.filter(
                d => d.accountUuid !== null && d.harigaDate !== null)
        } else {
            return []
        }
    }

    get hasHeaderAlert() {
        const {cashFlowAggregatedData} = this.state
        if (!cashFlowAggregatedData) {
            return false
        }

        if ((!this.selectedAccounts.length ||
            (!this.selectedHarigaDatetAccounts.length &&
                !this.selectedDeviantAccounts.length)) &&
            !this.selectedNotUpdatedAccounts.length) {
            return false
        }

        return values(this.headerAlertState).some(v => v)
    }

    get headerAlertState() {
        const selectedAccounts = this.selectedAccounts
        const selectedDeviantAccounts = this.selectedDeviantAccounts
        const selectedHarigaDatetAccounts = this.selectedHarigaDatetAccounts

        const accountExceeded = selectedAccounts.length === 1 &&
            !selectedDeviantAccounts.length && selectedHarigaDatetAccounts.length

        const accountExceptionExpected = selectedAccounts.length === 1 &&
            selectedDeviantAccounts.length === 1

        const accountNicknameAccountException = selectedAccounts.length > 1 &&
            selectedDeviantAccounts.length === 1

        const xAccountsExceeded = selectedAccounts.length > 1 &&
            selectedDeviantAccounts.length > 1

        const expectedDateExceeded = selectedAccounts.length > 1 &&
            selectedHarigaDatetAccounts.length === 1 &&
            !selectedDeviantAccounts.length

        const expectedXExceeded = selectedAccounts.length > 1 &&
            selectedHarigaDatetAccounts.length > 1 &&
            !selectedDeviantAccounts.length

        return {
            accountExceeded: accountExceeded,
            accountExceptionExpected: accountExceptionExpected,
            accountNicknameAccountException: accountNicknameAccountException,
            xAccountsExceeded: xAccountsExceeded,
            expectedDateExceeded: expectedDateExceeded,
            expectedXExceeded: expectedXExceeded,
            isAccountNotUpdated: false,
            isSelectedNotUpdatedAccounts: this.selectedNotUpdatedAccounts.length >
                0,
        }
    }

    get selectedNotUpdatedAccounts() {
        return this.selectedAccounts.filter(
            a => !isToday(a.balanceLastUpdatedDate))
    }

    get xAccountsExceeded() {
        const selectedAccounts = this.selectedAccounts
        const selectedDeviantAccounts = this.selectedDeviantAccounts
        return selectedAccounts.length > 1 && selectedDeviantAccounts.length > 1
    }

    get accountTitle() {
        const {accountGroups, t, isRtl} = this.props
        const {selectedGroup} = this.state

        if (!this.selectedAccounts.length) {
            return (
                <TouchableOpacity
                    style={cs(isRtl,
                        [commonStyles.row, commonStyles.alignItemsCenter],
                        commonStyles.rowReverse)}
                    onPress={this.handleOpenAccountsModal}
                >
                    <CustomIcon
                        name="plus"
                        size={10}
                        color={colors.blue7}
                    />
                    <View style={commonStyles.spaceDividerDouble}/>
                    <Text style={styles.bankAccountHeaderText}>{t(
                        'bankAccount:selectAccount')}</Text>
                </TouchableOpacity>
            )
        }

        const account = this.selectedAccounts[0]
        const currencySign = selectedGroup ? `(${getCurrencyChar(
            selectedGroup)})` : ''

        if (this.selectedAccounts.length === 1) {
            return (
                <TouchableOpacity
                    style={cs(isRtl,
                        [commonStyles.row, commonStyles.alignItemsCenter],
                        commonStyles.rowReverse)}
                    onPress={this.handleOpenAccountsModal}>
                    <AccountIcon account={account}/>
                    <Text
                        style={styles.bankAccountHeaderText}>{account.accountNickname} {currencySign}</Text>
                </TouchableOpacity>
            )
        }

        const title = this.selectedAccounts.every(a => a._isUpdated) &&
        this.selectedAccounts.length ===
        accountGroups[selectedGroup].filter(a => a._isUpdated).length
            ? t('bankAccount:allAccounts')
            : t('bankAccount:multiSelection')

        return (
            <TouchableOpacity
                style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter],
                    commonStyles.rowReverse)}
                onPress={this.handleOpenAccountsModal}
            >
                <TextIcon
                    isRtl={isRtl}
                    text={`${title} ${currencySign}`}
                    textStyle={styles.bankAccountHeaderText}
                    iconName="wallet"
                    iconSize={14}
                    iconColor={colors.white}
                />
            </TouchableOpacity>
        )
    }

    get accountsCreditLimit() {
        return this.selectedAccounts.reduce((memo, account) => {
            return memo + account.creditLimit
        }, 0)
    }

    get accountsBalanceTotal() {
        if (!this.selectedAccounts.length) {
            return 'false'
        }

        const total = this.selectedAccounts.reduce((memo, account) => {
            return memo + account.accountBalance
        }, 0)

        return total
    }

    get accountsBalance() {
        if (this.accountsBalanceTotal === 'false') {
            return 'false'
        } else {
            return `${numberFormat.format(
                Math.round(this.accountsBalanceTotal))}`
        }
    }

    get isLightNotUpdatedAccounts() {
        const {
            t,
        } = this.props
        const {
            statusToken,
            newTokenStatus,
        } = this.state

        if (newTokenStatus && statusToken ===
            BANK_TOKEN_STATUS.INVALID_PASSWORD) {
            return (
                <TouchableOpacity
                    onPress={this.handleOpenUpdateTokenModal(
                        this.selectedNotUpdatedAccounts[0])}
                    style={{
                        alignItems: 'center',
                        flexDirection: 'row-reverse',
                    }}>
                    <Text style={{
                        color: '#ef3636',
                        fontFamily: fonts.bold,
                        fontSize: sp(17),
                        textAlign: 'right',
                    }}>
                        {'סיסמתך לבנק'} {t(
                        `bankName:${newTokenStatus.websiteTargetTypeId}`)} {'שגויה'}
                    </Text>
                    <Icon name="chevron-left" size={22} color={colors.blue32}/>
                </TouchableOpacity>
            )
        } else if (newTokenStatus && statusToken ===
            BANK_TOKEN_STATUS.PASSWORD_EXPIRED) {
            return (
                <TouchableOpacity
                    onPress={this.handleOpenUpdateTokenModal(
                        this.selectedNotUpdatedAccounts[0])}
                    style={{
                        alignItems: 'center',
                        flexDirection: 'row-reverse',
                    }}>
                    <Text style={{
                        color: '#ef3636',
                        fontFamily: fonts.bold,
                        fontSize: sp(17),
                        textAlign: 'right',
                    }}>
                        {'סיסמתך לבנק'} {t(
                        `bankName:${newTokenStatus.websiteTargetTypeId}`)} {'פגה'}
                    </Text>
                    <Icon name="chevron-left" size={22} color={colors.blue32}/>
                </TouchableOpacity>
            )
        } else if (newTokenStatus && statusToken ===
            BANK_TOKEN_STATUS.BLOCKED) {
            return (
                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                }}>
                    <Text style={{
                        color: '#ef3636',
                        fontFamily: fonts.bold,
                        fontSize: sp(19),
                        textAlign: 'right',
                    }}>
                        {'החשבון חסום'}
                    </Text>
                    <TouchableOpacity onPress={this.lockedModalIsOpenShow}>
                        <Text style={{
                            color: '#007ebf',
                            fontFamily: fonts.regular,
                            fontSize: sp(15),
                            textAlign: 'left',
                            textDecorationLine: 'underline',
                            textDecorationStyle: 'solid',
                            textDecorationColor: '#007ebf',
                        }}>
                            {'שחרור חסימה'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        } else if (newTokenStatus && statusToken ===
            BANK_TOKEN_STATUS.AGREEMENT_REQUIRED) {
            return (
                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                }}>
                    <Text style={{
                        color: '#ef3636',
                        fontFamily: fonts.bold,
                        fontSize: sp(16),
                        textAlign: 'right',
                    }}>
                        {'נדרש אישור הסכם שירות'}
                    </Text>
                    <TouchableOpacity onPress={this.handleOpenBankSite}>
                        <Text style={{
                            color: '#007ebf',
                            fontFamily: fonts.regular,
                            fontSize: sp(15),
                            textAlign: 'left',
                            textDecorationLine: 'underline',
                            textDecorationStyle: 'solid',
                            textDecorationColor: '#007ebf',
                        }}>
                            {'לאתר הבנק'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )
        } else if (newTokenStatus && statusToken ===
            BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS) {
            return (
                <View style={{
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                }}>
                    <Text style={{
                        color: '#ef3636',
                        fontFamily: fonts.bold,
                        fontSize: sp(15),
                        textAlign: 'right',
                    }}>
                        {'סיסמה שגויה. אנא פנו למנהל המערכת'}
                    </Text>
                </View>
            )
        } else {
            return (<Text style={{
                color: '#229f88',
                fontFamily: fonts.bold,
                fontSize: sp(18),
                textAlign: 'left',
            }}>
                הסיסמאות תקינות
            </Text>)
        }
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
        this._mounted = true
        this.onSetDates(this.state.dateFrom, this.state.dateTill, true)
        const timeoutAcc = this.props.route.params.timeoutAcc
        let time = 0
        if (timeoutAcc) {
            time = IS_IOS ? 1500 : 2000
            if (this.props.route.params.timeoutAcc) {
                delete this.props.route.params.timeoutAcc
            }
        }
        setTimeout(() => {
            this.selectDefaultAccounts()
        }, time)
        setTimeout(() => {
            this.setState({
                isLayoutCompleted: true,
            })
        }, 20)
    }

    handleBackPress = () => {
        this.props.dispatch(setOpenedBottomSheet(false))

        goToBack(this.props.navigation)
        return true
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress',
            this.handleBackPress)
        this._mounted = false
    }

    handleSetHeaderHeight = (e) => {
        this.setState({
            headerMaxHeight: e.nativeEvent.layout.height,
            isLayoutComplete: true,
            scrollAnim: new Animated.Value(
                IS_IOS ? -e.nativeEvent.layout.height : 0),
        })
    }

    setStatusToken = (status) => {
        this.setState({
            statusNotValid: status,
        })
    }

    selectDefaultAccounts = () => {
        const {selectedAccountIds, selectedGroup} = this.state
        const {accountGroups} = this.props
        if (!accountGroups || !Object.keys(accountGroups).length) {
            return
        }

        const findIdsToSelect = (currency) => {
            currency = currency && currency.toLowerCase()
            const hasUpdatedAccount = accountGroups[currency].some(
                a => a._isUpdated)

            if (hasUpdatedAccount) {
                const selectedIds = accountGroups[currency].filter(
                    a => a._isUpdated).map(a => a.companyAccountId)
                this.handleSelectAccounts(currency, selectedIds)
            } else {
                const accountId = accountGroups[currency][0].companyAccountId
                this.setState({
                    ...getAccountIdForSelection(currency, accountId,
                        selectedAccountIds, selectedGroup),
                })
            }
            setTimeout(() => {
                return this.getScreenData()
            }, 1000)
        }

        if (accountGroups.hasOwnProperty(
            DEFAULT_PRIMARY_CURRENCY)) {
            return findIdsToSelect(
                DEFAULT_PRIMARY_CURRENCY)
        }
        return findIdsToSelect(Object.keys(accountGroups)[0])
    }

    handleSelectAccounts = (selectedGroup, selectedAccountIds = [], fn) => {
        this.setState({
            selectedAccountIds,
            selectedGroup,
            currentSelectedAccountId: null,
        }, () => {
            if (typeof fn === 'function') {
                return fn()
            }
        })
    }

    handleForceSelectAccount = (id) => {
        this.setState(
            {
                selectedAccountIds: [id],
                alertDetailsIsOpen: false,
            },
            this.handleApplySelectedAccounts,
        )
    }

    handleCloseAccountsModal = () => this.setState(
        {accountsModalIsOpen: false})

    handleOpenAccountsModal = () => this.setState({
        accountsModalIsOpen: true,
        selectedAccountIdsSave: JSON.parse(
            JSON.stringify(this.state.selectedAccountIds)),
        selectedGroupSave: JSON.parse(JSON.stringify(this.state.selectedGroup)),
    })

    handleCloseSelectedAccounts = () => {
        this.setState({
            accountsModalIsOpen: false,
            selectedAccountIds: JSON.parse(
                JSON.stringify(this.state.selectedAccountIdsSave)),
            selectedGroup: JSON.parse(
                JSON.stringify(this.state.selectedGroupSave)),
        })
    }

    handleApplySelectedAccounts = () => {
        this.props.dispatch(selectAccounts(this.state.selectedAccountIds))
        this.handleCloseAccountsModal()
        this.getScreenData()
    }

    getAggregateData = () => {
        const {currentCompanyId, accounts} = this.props
        const balanceLastUpdatedDate = accounts.find(
            (element) => element.companyAccountId ===
                this.accountIdsForRequest[0]).balanceLastUpdatedDate

        return cashFlowAggregateDataApi.post({
            body: {
                companyAccountIds: this.accountIdsForRequest,
                companyId: currentCompanyId,
                dateFrom: AppTimezone.moment(balanceLastUpdatedDate)
                    .subtract(2, 'day')
                    .toISOString(),
                dateTill: AppTimezone.moment(balanceLastUpdatedDate)
                    .add(5, 'day')
                    .toISOString(),
                expence: -1,
            },
        })
    }

    setStates = (params) => () => {
        this.setState(params)
    }

    getAggregateDataType = (dateFrom, dateTill) => {
        const {typePie} = this.state

        return new Api({endpoint: `account/${typePie}/aggregate`}).post({
            body: {
                companyAccountIds: this.accountIdsForRequest,
                dateFrom: dateFrom,
                dateTill: dateTill,
            },
        })
    }

    getFinancialData = () => {
        return new Api({endpoint: 'over-view/cfl/financial-data'}).post({
            body: {
                companyAccountIds: this.accountIdsForRequest,
                dateFrom: null,
                dateTill: null,
            },
        })
    }

    getBankTrans = () => {
        const {currentCompanyId} = this.props
        return new Api({endpoint: 'account/cfl/bank-trans'}).post({
            body: {
                companyAccountIds: this.accountIdsForRequest,
                companyId: currentCompanyId,
                dateFrom: AppTimezone.moment()
                    .subtract(30, 'day')
                    .toISOString(),
                dateTill: AppTimezone.moment().toISOString(),
            },
        })
    }

    getBankTransPeulotToday = () => {
        const {currentCompanyId} = this.props
        return new Api(
            {endpoint: 'account/cfl/bank-trans-peulot-today'}).post({
            body: {
                companyAccountIds: this.accountIdsForRequest,
                companyId: currentCompanyId,
                dateTill: null,
            },
        })
    }

    getChartData = () => {
        const {dispatch, currentCompanyId, accounts} = this.props
        const balanceLastUpdatedDate = accounts.find(
            (element) => element.companyAccountId ===
                this.accountIdsForRequest[0])
        if (IS_LIGHT.light) {
            return dispatch(getCashFlowBalanceChartData({
                companyAccountIds: this.accountIdsForRequest,
                companyId: currentCompanyId,
                dateFrom: AppTimezone.moment()
                    .subtract(30, 'day')
                    .toISOString(),
                dateTill: AppTimezone.moment().toISOString(),
            }))
        } else {
            return dispatch(getCashFlowBalanceChartData({
                companyAccountIds: this.accountIdsForRequest,
                companyId: currentCompanyId,
                dateFrom: AppTimezone.moment(balanceLastUpdatedDate)
                    .subtract(2, 'day')
                    .toISOString(),
                dateTill: AppTimezone.moment(balanceLastUpdatedDate)
                    .add(5, 'day')
                    .toISOString(),
            }))
        }
    }

    getData = (ws) => {
        return new Promise((resolve, reject) => {
            ws
                .then((data) => {
                    resolve(data)
                })
                .catch(() => {
                    resolve(null)
                })
        })
    }

    getScreenData = (isLoader = true) => {
        const {t, accounts, currentCompanyId} = this.props

        if (isLoader) {
            this.setState({
                inProgress: true,
                isLayoutComplete: false,
                progressPies: true,
            })
        } else {
            this.setState({
                inProgress: true,
                progressPies: true,
            })
        }

        if (this.selectedNotUpdatedAccounts.length) {
            getStatusTokenTypeApi.post({
                body: {
                    companyId: currentCompanyId,
                    tokens: [this.selectedNotUpdatedAccounts[0].token],
                },
            })
                .then(([newTokenStatus]) => {
                    const statusCode = BankTokenService.getTokenStatusCode(
                        newTokenStatus.tokenStatus)
                    this.setState({
                        newTokenStatus,
                        statusToken: statusCode,
                    })
                })
                .catch(() => this.setState({inProgress: false}))
        }
        const tasks = this.getChartData()
        return this.getData(tasks)
            .then((data) => {
                // //console.log(data)
                if (this._mounted) {
                    this.setState({
                        accountBalanceChartData: data,
                    })
                    const tasksAggregateData = this.getAggregateData()
                    return this.getData(tasksAggregateData)
                }
            })
            .then((data) => {
                if (this._mounted) {
                    this.setState({
                        cashFlowAggregatedData: data,
                    })
                    const tasksAggregateDataType = this.getAggregateDataType(
                        this.state.dateFrom, this.state.dateTill)
                    return this.getData(tasksAggregateDataType)
                }
            })
            .then((data) => {
                if (this._mounted) {
                    if (data) {
                        if (!data.expenses && !data.incomes &&
                            !data.totalExpenses && !data.totalIncomes) {
                            this.setState({
                                aggregateDataType: {
                                    expenses: [],
                                    incomes: [],
                                    totalExpenses: null,
                                    totalIncomes: null,
                                },
                                progressPies: false,
                            })
                        } else {
                            if (data.incomes && data.incomes.length) {
                                data.incomes.forEach((item) => {
                                    item.pressed = true
                                    item.prc = item.dateTotals[0].prc
                                })
                            }
                            if (data.expenses && data.expenses.length) {
                                data.expenses.forEach((item) => {
                                    item.pressed = true
                                    item.prc = item.dateTotals[0].prc
                                })
                            }
                            this.setState({
                                aggregateDataType: data,
                                progressPies: false,
                            })
                        }
                    } else {
                        this.setState({
                            aggregateDataType: {
                                expenses: [],
                                incomes: [],
                                totalExpenses: null,
                                totalIncomes: null,
                            },
                            progressPies: false,
                        })
                    }
                    setTimeout(() => {
                        if (this.scrollView && this.scrollView._component) {
                            if (this.props.isRtl) {
                                this.scrollView._component.scrollToEnd(
                                    {animated: true})
                            } else {
                                this.scrollView._component.scrollTo({
                                    animated: true,
                                    x: 0,
                                })
                            }
                        }
                    }, 10)
                    const tasksFinancialData = this.getFinancialData()
                    return this.getData(tasksFinancialData)
                }
            })
            .then((data) => {
                if (this._mounted) {
                    if (data) {
                        this.setState({
                            financialData: data,
                        })
                    } else {
                        this.setState({
                            financialData: {},
                        })
                    }
                    const tasksLast = [
                        this.getBankTrans(),
                        this.getBankTransPeulotToday()]
                    return Promise.all(tasksLast)
                }
            })
            .then((data) => {
                if (this._mounted) {
                    let getBankTrans = data[0]
                    let getBankTransPeulotToday = data[1]
                    getBankTransPeulotToday.sort((a, b) => a.rowNum - b.rowNum)
                    getBankTrans.bankTransList.sort((a, b) => a.rowNum - b.rowNum)

                    if (getBankTransPeulotToday.length) {
                        getBankTransPeulotToday = [
                            {
                                title: 'היום (לא סופי)',
                                data: getBankTransPeulotToday.map((trans) => {
                                    return Object.assign(trans, {
                                        account: accounts.find(
                                            a => a.companyAccountId ===
                                                trans.companyAccountId),
                                    })
                                }),
                            }]
                    }
                    if (getBankTrans.bankTransList &&
                        getBankTrans.bankTransList.length) {
                        getBankTrans.bankTransList = getBankTrans.bankTransList.reduce(
                            (memo, trans) => {
                                const title = dateToFromNowDaily(trans.transDate, t,
                                    'DD/MM')
                                trans.account = accounts.find(
                                    a => a.companyAccountId ===
                                        trans.companyAccountId)
                                const oldIndex = memo.findIndex(
                                    item => item.title === title)
                                if (oldIndex > -1) {
                                    memo[oldIndex].data.push(trans)
                                } else {
                                    memo.push({
                                        title,
                                        data: [trans],
                                    })
                                }
                                return memo
                            }, [])
                    }

                    let bankTrans = getBankTransPeulotToday.concat(
                        getBankTrans.bankTransList)
                    this.headerChartX = new Animated.ValueXY()
                    this.setState({
                        bankTrans: bankTrans,
                        inProgress: false,
                    })

                    getAccountCflTransTypeApi.post(
                        {body: {uuid: currentCompanyId}})
                        .then(da => {
                            this.setState({categoriesArr: da})
                        })
                }
            })
            .catch((err) => {
                this.headerChartX = new Animated.ValueXY()
                if (this._mounted) {
                    this.setState({
                        bankTrans: [],
                        inProgress: false,
                        error: getErrText(err),
                    })
                }
            })
    }

    handleToggleAlertDetails = () => {
        this.setState({alertDetailsIsOpen: !this.state.alertDetailsIsOpen})
    }

    linkToPage = (page) => () => {
        const {navigation} = this.props
        if (page === CASH_FLOW || page === BANK_ACCOUNTS) {
            const selectedAccounts = this.selectedAccounts.map(
                a => a.companyAccountId)
            goTo(navigation, page, {
                selectedAccountIds: selectedAccounts,
            })
        } else {
            goTo(navigation, page)
        }
    }

    linkToPageCASHFLOW = (id) => {
        const {navigation} = this.props
        if (IS_LIGHT.light) {
            this.handleForceSelectAccount(id)
        } else {
            const selectedAccounts = [id]
            goTo(navigation, 'CASH_FLOW', {
                selectedAccountIds: selectedAccounts,
            })
        }
    }

    linkToPageCASHFLOWAlerts = (id) => {
        const {navigation} = this.props
        const selectedAccounts = [id]
        goTo(navigation, 'CASH_FLOW', {
            selectedAccountIds: selectedAccounts,
        })
    }

    setCheckTitleMarks = (state) => () => {
        this.setState({
            aggregateDataType: {
                expenses: [],
                incomes: [],
                totalExpenses: null,
                totalIncomes: null,
            },
            currentOpenItemIndex: null,
            typePie: (state) ? 'PAYMENT_DESC' : 'TRANS_TYPE',
            transTypeWidth: !state ? ((winWidth / 2)) : 0,
            paymentDescWidth: state ? ((winWidth / 2)) : 0,
            progressPies: true,
        }, () => {
            setTimeout(() => {
                this.getAggregateDataType(this.state.dateFrom,
                    this.state.dateTill)
                    .then((data) => {
                        if (data) {
                            if (!data.expenses && !data.incomes &&
                                !data.totalExpenses && !data.totalIncomes) {
                                this.setState({
                                    aggregateDataType: {
                                        expenses: [],
                                        incomes: [],
                                        totalExpenses: null,
                                        totalIncomes: null,
                                    },
                                    progressPies: false,
                                })
                            } else {
                                if (data.incomes && data.incomes.length) {
                                    data.incomes.forEach((item) => {
                                        item.pressed = true
                                        item.prc = item.dateTotals[0].prc
                                    })
                                }
                                if (data.expenses && data.expenses.length) {
                                    data.expenses.forEach((item) => {
                                        item.pressed = true
                                        item.prc = item.dateTotals[0].prc
                                    })
                                }
                                this.setState({
                                    aggregateDataType: data,
                                    progressPies: false,
                                })
                            }
                        } else {
                            this.setState({
                                aggregateDataType: {
                                    expenses: [],
                                    incomes: [],
                                    totalExpenses: null,
                                    totalIncomes: null,
                                },
                                progressPies: false,
                            })
                        }
                        setTimeout(() => {
                            if (this.scrollView && this.scrollView._component) {
                                if (this.props.isRtl) {
                                    this.scrollView._component.scrollToEnd(
                                        {animated: true})
                                } else {
                                    this.scrollView._component.scrollTo({
                                        animated: true,
                                        x: 0,
                                    })
                                }
                            }
                        }, 10)
                    })
                    .catch(() => {
                        this.setState({
                            aggregateDataType: {
                                expenses: [],
                                incomes: [],
                                totalExpenses: null,
                                totalIncomes: null,
                            },
                        })
                        setTimeout(() => {
                            if (this.scrollView && this.scrollView._component) {
                                if (this.props.isRtl) {
                                    this.scrollView._component.scrollToEnd(
                                        {animated: true})
                                } else {
                                    this.scrollView._component.scrollTo({
                                        animated: true,
                                        x: 0,
                                    })
                                }
                            }
                        }, 10)
                    }, 100)
            }, 10)
        })
    }

    handleItemToggle = (index) => () => {
        const {currentOpenItemIndex} = this.state
        this.setState({
            currentOpenItemIndex: currentOpenItemIndex === index
                ? null
                : index,
        })
    }

    pressItemPie = (income, index) => {
        const {currentOpenItemIndex, typePieChooseExpense} = this.state
        if ((income && !typePieChooseExpense) ||
            (!income && typePieChooseExpense)) {
            this.setState({
                currentOpenItemIndex: currentOpenItemIndex === index
                    ? null
                    : index,
            })
        }
    }

    _renderItem = ({item, index}) => {
        const {
            isRtl,
        } = this.props

        const total = (!item.hova)
            ? getFormattedValueArray(item.total)
            : getFormattedValueArray(item.total * (-1))
        const numberStyle = !item.hova
            ? {color: colors.green4}
            : {color: colors.red2}
        const withinRowStyles = cs(isRtl, commonStyles.row,
            commonStyles.rowReverse)

        return (
            <View style={[
                styles.dataRow, {
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                }]}>
                <View style={[withinRowStyles]}>
                    <View style={cs(!isRtl, commonStyles.row,
                        [commonStyles.rowReverse], {
                            flex: 1,
                            flexDirection: 'row',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'flex-end',
                        })}>
                        <Text
                            style={{
                                fontSize: sp(16),
                                color: colors.blue7,
                                fontFamily: fonts.semiBold,
                            }}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {item.account.bankAccountId}
                        </Text>
                        <View style={commonStyles.spaceDivider}/>
                        <AccountIcon account={item.account}/>
                    </View>
                    <View style={{
                        width: 20,
                    }}/>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                            flex: 1,
                            fontSize: sp(16),
                            color: '#0f3860',
                            textAlign: 'right',
                            fontFamily: fonts.semiBold,
                        }}>
                        {item.mainDesc}
                    </Text>
                    <View style={{
                        width: 20,
                    }}/>
                    <Text
                        style={[
                            numberStyle, {
                                flex: 1,
                                fontSize: sp(16),
                                fontFamily: fonts.semiBold,
                                textAlign: 'left',
                            }]}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        {total[0]}.{total[1]}</Text>
                </View>
            </View>
        )
    }

    renderItemSeparator = () => <View style={styles.dataRowSeparator}/>

    handleSetRef = (ref) => {
        this.listRef = ref
    }

    renderDetailsDataSectionHeader = ({section}) => {
        return <DataListSectionHeader section={section}/>
    }

    renderFakeHeader = () => {
        return <Animated.View
            style={{
                flex: 1,
                height: 0,
                backgroundColor: 'transparent',
            }}
        />
    }

    navigationInChecks = () => {
        const {
            financialData,
        } = this.state
        if (IS_LIGHT.light) {
            if (COMPANY_INFO.trialBlocked) {
                this.setState({
                    showLastRowPopup: false,
                    showtrialBlocked: true,
                })
                COMPANY_INFO.trialBlockedPopup = true
            } else {
                COMPANY_INFO.trialBlockedPopup = false
                this.setState({
                    showLastRowPopup: false,
                    showtrialBlocked: false,
                })
                goTo(this.props.navigation, PACKAGES)
            }
        } else {
            if (financialData.inChecks !== 0) {
                goTo(this.props.navigation, CHECKS, {
                    paramsLink: {
                        checksMobileState: 'in-checks',
                        selectedGroup: this.state.selectedGroup,
                        selectedAccountIds: this.state.selectedAccountIds,
                    },
                })
            }
        }
    }

    navigationOutChecks = () => {
        const {
            financialData,
        } = this.state
        if (IS_LIGHT.light) {
            if (COMPANY_INFO.trialBlocked) {
                this.setState({
                    showLastRowPopup: false,
                    showtrialBlocked: true,
                })
                COMPANY_INFO.trialBlockedPopup = true
            } else {
                this.setState({
                    showLastRowPopup: false,
                    showtrialBlocked: false,
                })
                COMPANY_INFO.trialBlockedPopup = false
                goTo(this.props.navigation, PACKAGES)
            }
        } else {
            if (financialData.outChecks !== 0) {
                goTo(this.props.navigation, CHECKS, {
                    paramsLink: {
                        checksMobileState: 'out-checks',
                        selectedGroup: this.state.selectedGroup,
                        selectedAccountIds: this.state.selectedAccountIds,
                    },
                })
            }
        }
    }

    navigationMishmeretBabank = () => {
        const {
            financialData,
        } = this.state
        if (financialData.mishmeretBabank !== 0) {
            goTo(this.props.navigation, CHECKS, {
                paramsLink: {
                    queryStatus: 'mishmeret_babank',
                    checksMobileState: 'in-checks',
                    selectedGroup: this.state.selectedGroup,
                    selectedAccountIds: this.state.selectedAccountIds,
                },
            })
        }
    }

    navigationLenicaion = () => {
        const {
            financialData,
        } = this.state
        if (financialData.lenicaion !== 0) {
            goTo(this.props.navigation, CHECKS, {
                paramsLink: {
                    queryStatus: 'lenicaion',
                    checksMobileState: 'in-checks',
                    selectedGroup: this.state.selectedGroup,
                    selectedAccountIds: this.state.selectedAccountIds,
                },
            })
        }
    }

    navigationCreditCard = () => {
        const {
            financialData,
        } = this.state
        if (financialData.creditCard !== 0) {
            goTo(this.props.navigation, CREDIT_CARD, {
                paramsLink: {
                    selectedAccountIds: this.state.selectedAccountIds,
                },
            })
        }
    }

    navigationSlika = () => {
        const {
            financialData,
        } = this.state
        if (financialData.slika !== 0) {
            goTo(this.props.navigation, SLIKA)
        }
    }

    goToMatch = () => {
        const selectedAccounts = JSON.parse(
            JSON.stringify(this.selectedAccounts))
        let id
        if (selectedAccounts.length > 1) {
            const primaryAccount = selectedAccounts.filter(
                a => a.primaryAccount === true)
            if (primaryAccount.length) {
                id = primaryAccount[0].companyAccountId
            } else {
                selectedAccounts.sort((a, b) => {
                    return a.dateCreated - b.dateCreated
                })
                id = selectedAccounts[0].companyAccountId
            }
        } else {
            id = selectedAccounts[0].companyAccountId
        }
        goTo(this.props.navigation, 'BANK_MATCH', {
            selectedAccountIds: id,
        })
    }

    setDatesCalendarOpen = () => {
        this.setState({calendarModalIsOpen: true})
    }

    setDatesCalendarClose = () => this.setState({calendarModalIsOpen: false})

    onSetDates = (dateFrom, dateTill, isDef) => {
        const isStartMonth = (AppTimezone.moment(dateFrom)
                .isSame(AppTimezone.moment().startOf('month').format('YYYY-MM-DD'),
                    'year') && AppTimezone.moment(dateFrom)
                .isSame(AppTimezone.moment().startOf('month').format('YYYY-MM-DD'),
                    'month') && AppTimezone.moment(dateTill)
                .isSame(AppTimezone.moment().format('YYYY-MM-DD'), 'year') &&
            AppTimezone.moment(dateTill)
                .isSame(AppTimezone.moment().format('YYYY-MM-DD'), 'month'))
        const isLastMonth = (AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment()
                .subtract(1, 'month')
                .startOf('month')
                .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment()
                .subtract(1, 'month')
                .startOf('month')
                .format('YYYY-MM-DD'), 'month') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment()
                .subtract(1, 'month')
                .endOf('month')
                .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment()
                .subtract(1, 'month')
                .endOf('month')
                .format('YYYY-MM-DD'), 'month'))
        const isFromStartYear = (AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment().startOf('year').format('YYYY-MM-DD'),
                'year') && AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment().startOf('year').format('YYYY-MM-DD'),
                'month') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
                'year') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
                'month'))
        const isLastYear = (AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment()
                .subtract(1, 'year')
                .startOf('year')
                .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment()
                .subtract(1, 'year')
                .startOf('year')
                .format('YYYY-MM-DD'), 'month') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment()
                .subtract(1, 'year')
                .endOf('year')
                .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment()
                .subtract(1, 'year')
                .endOf('year')
                .format('YYYY-MM-DD'), 'month'))
        let stateTextMonth = ''
        if (isStartMonth) {
            stateTextMonth = 'מתחילת החודש'
        } else if (isLastMonth) {
            stateTextMonth = 'חודש קודם'
        } else if (isFromStartYear) {
            stateTextMonth = 'מתחילת השנה'
        } else if (isLastYear) {
            stateTextMonth = 'שנה שעברה'
        } else {
            stateTextMonth = LocaleConfig.locales.he.monthNames[parseFloat(
                AppTimezone.moment(dateFrom).format('MM')) - 1] + ' ' +
                AppTimezone.moment(dateFrom).format('YYYY') +
                ' - ' + LocaleConfig.locales.he.monthNames[parseFloat(
                    AppTimezone.moment(dateTill).format('MM')) - 1] + ' ' +
                AppTimezone.moment(dateTill).format('YYYY')
        }
        if (isDef) {
            stateTextMonth = 'בחרו טווח תאריכים'
        }
        this.setState({
            dateFrom: dateFrom,
            dateTill: dateTill,
            stateTextMonth: stateTextMonth,
        })
        if (this.state.calendarModalIsOpen) {
            this.setDatesCalendarClose()
            const tasksAggregateDataType = this.getAggregateDataType(
                AppTimezone.moment(dateFrom).valueOf(),
                AppTimezone.moment(dateTill).valueOf())
            this.getData(tasksAggregateDataType)
                .then((data) => {
                    if (this._mounted) {
                        if (data) {
                            if (!data.expenses && !data.incomes &&
                                !data.totalExpenses && !data.totalIncomes) {
                                this.setState({
                                    aggregateDataType: {
                                        expenses: [],
                                        incomes: [],
                                        totalExpenses: null,
                                        totalIncomes: null,
                                    },
                                })
                            } else {
                                if (data.incomes && data.incomes.length) {
                                    data.incomes.forEach((item) => {
                                        item.pressed = true
                                        item.prc = item.dateTotals[0].prc
                                    })
                                }
                                if (data.expenses && data.expenses.length) {
                                    data.expenses.forEach((item) => {
                                        item.pressed = true
                                        item.prc = item.dateTotals[0].prc
                                    })
                                }
                                this.setState({
                                    aggregateDataType: data,
                                })
                            }
                        } else {
                            this.setState({
                                aggregateDataType: {
                                    expenses: [],
                                    incomes: [],
                                    totalExpenses: null,
                                    totalIncomes: null,
                                },
                            })
                        }
                        setTimeout(() => {
                            if (this.scrollView && this.scrollView._component) {
                                if (this.props.isRtl) {
                                    this.scrollView._component.scrollToEnd(
                                        {animated: true})
                                } else {
                                    this.scrollView._component.scrollTo({
                                        animated: true,
                                        x: 0,
                                    })
                                }
                            }
                        }, 10)
                    }
                })
        }
    }

    openLoans = () => {
        this.setState({loanModalIsOpen: true})
        this.getData(getLoanDetailsApi.post({
            body: {
                companyAccountIds: this.accountIdsForRequest,
                dateFrom: null,
                dateTill: null,
            },
        }))
            .then((data) => {
                // console.log(data)
                this.setState({
                    loans: data,
                })
            })
    }

    deleteRowLoan = () => {
        this.setState({
            deleteLoanModal: false,
        })
        setTimeout(() => {
            this.setState({
                showLoanRowModal: false,
            })
        }, 200)
        this.getData(deleteRowLoanApi.post({
            body: {
                companyAccountId: this.state.loanRow.companyAccountId,
                id: this.state.loanRow.loanId,
            },
        }))
            .then(() => {
                this.setState({
                    loanRow: {},
                }, this.openLoans())
                const tasksFinancialData = this.getFinancialData()
                return this.getData(tasksFinancialData)
                    .then((da) => {
                        if (da) {
                            this.setState({
                                financialData: da,
                            })
                        } else {
                            this.setState({
                                financialData: {},
                            })
                        }
                    })
            })
    }

    openDeposit = () => {
        this.setState({depositModalIsOpen: true})
        this.getData(getDepositDetailsApi.post({
            body: this.accountIdsForRequest.map((item) => {
                return {
                    'uuid': item,
                }
            }),
        }))
            .then((data) => {
                // console.log(data)
                this.setState({
                    deposit: data,
                })
            })
    }

    deleteRowDeposit = () => {
        this.setState({
            deleteDepositModal: false,
        })
        setTimeout(() => {
            this.setState({
                showDepositRowModal: false,
            })
        }, 200)
        this.getData(deleteRowDepositApi.post({
            body: {
                companyAccountId: this.state.depositRow.companyAccountId,
                id: this.state.depositRow.depositId,
            },
        }))
            .then(() => {
                this.setState({
                    depositRow: {},
                }, this.openDeposit())

                const tasksFinancialData = this.getFinancialData()
                return this.getData(tasksFinancialData)
                    .then((data) => {
                        if (data) {
                            this.setState({
                                financialData: data,
                            })
                        } else {
                            this.setState({
                                financialData: {},
                            })
                        }
                    })
            })
    }

    _onRefresh = () => {
        this.setState({refreshing: true})
        this.getScreenData()
        setTimeout(() => {
            this.setState({refreshing: false})
        }, 1000)
    }

    animatedTime = () => {
        const {
            fadeAnim,
        } = this.state
        Animated.timing(
            fadeAnim,
            {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            },
        ).start(() => {
            ALERTS_TRIAL.showAlertPopupCompany = false
        })
    }

    animatedTimeSuc = () => {
        const {
            fadeAnimUpgrade,
        } = this.state
        Animated.timing(
            fadeAnimUpgrade,
            {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            },
        ).start(() => {
            this.setState({openPopupAfterUpgrade: false})
        })
    }

    animatedTimeBiziboxTrialExpired = () => {
        if (COMPANY_INFO.trialBlockedPopup) {
            COMPANY_INFO.trialBlockedPopup = false
            this.setState({
                showLastRowPopup: false,
                showtrialBlocked: false,
            })
        } else {
            const {
                fadeAnimBiziboxTrialExpired,
            } = this.state
            Animated.timing(
                fadeAnimBiziboxTrialExpired,
                {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                },
            ).start(() => {
                COMPANY_INFO.biziboxTrialExpired = false
                this.setState({
                    showLastRowPopup: false,
                })
            })
        }
    }

    handleOpenUpdateTokenModal = (token) => () => {
        token.tokenNickname = token.accountNickname
        token.tokenStatus = this.state.statusToken
        token.websiteTargetTypeId = token.bankId
        token.screenPasswordUpdateCount = 0
        token.tokenTargetType = 'ACCOUNT'
        this.setState({
            currentToken: token,
            updateTokenModalIsOpen: true,
        })
    }

    handleCloseUpdateTokenModal = () => this.setState({
        currentToken: null,
        updateTokenModalIsOpen: false,
    })

    handleOpenBankSite = () => {
        const link = PASSWORD_RECOVERY_LINKS[this.state.newTokenStatus.websiteTargetTypeId]
        Linking.canOpenURL(link)
            .then(s => {
                if (s) {
                    Linking.openURL(
                        PASSWORD_RECOVERY_LINKS[this.state.newTokenStatus.websiteTargetTypeId])
                }
            })
    }

    lockedModalIsOpenShow = () => {
        this.setState({
            lockedModalIsOpen: true,
        })
    }
    lockedModalIsOpenClose = () => {
        this.setState({
            lockedModalIsOpen: false,
        })
    }

    approveUpgrade = () => {
        const {currentCompanyId, dispatch} = this.props
        const thisCompany = (!this.props.companies ||
            !this.props.companies.length) ? {} : (this.props.companies.find(
            c => c.companyId === currentCompanyId) ? this.props.companies.find(
            c => c.companyId === currentCompanyId) : {})
        const showLastRowPopup = thisCompany.billingAccountId !==
            '00000000-0000-0000-0000-000000000000'
        if (this.state.showtrialBlocked && COMPANY_INFO.trialBlockedPopup &&
            thisCompany.billingAccountId ===
            '00000000-0000-0000-0000-000000000000') {
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
                                    : (this.props.companies.find(c => c.companyId ===
                                        this.props.currentCompanyId)
                                        ? this.props.companies.find(c => c.companyId ===
                                            this.props.currentCompanyId)
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
                        goTo(this.props.navigation, 'SETTINGS', {
                            paramsLinkAddCard: {
                                addCard: PAYMENTS_TO_BIZIBOX_TAB,
                            },
                        })
                    }
                })
                .catch(() => {
                })
        }
    }

    denyUpgrade = () => {
        const {currentCompanyId, dispatch} = this.props

        denyUpgradeApi.post({
            body: {
                uuid: currentCompanyId,
            },
        })
            .then(() => {
                Promise.all([
                    dispatch(getCompanies()),
                ])
                    .then(() => dispatch(selectCompany(currentCompanyId)))
                    .then(() => dispatch(getAccounts()))
                    .catch(() => {
                        this.animatedTimeBiziboxTrialExpired()
                    })
            })
            .catch(() => {

            })
    }

    approveDowngrade = () => {
        const {currentCompanyId} = this.props

        approveDowngradeApi.post({
            body: {
                uuid: currentCompanyId,
            },
        })
            .then(() => {
                const {
                    fadeAnimApproveDowngrade,
                } = this.state
                Animated.timing(
                    fadeAnimApproveDowngrade,
                    {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    },
                ).start(() => {
                    this.setState({
                        showApproveDowngrade: false,
                    })
                    COMPANY_INFO.biziboxDowngradeDate = false
                })
            })
            .catch(() => {
                const {
                    fadeAnimApproveDowngrade,
                } = this.state
                Animated.timing(
                    fadeAnimApproveDowngrade,
                    {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    },
                ).start(() => {
                    this.setState({
                        showApproveDowngrade: false,
                    })
                    COMPANY_INFO.biziboxDowngradeDate = false
                })
            })
    }

    markRow = (item, index, isExpense) => () => {
        const {aggregateDataType} = this.state
        const aggregateDataTypeCopy = Object.assign({}, aggregateDataType)
        if (isExpense) {
            aggregateDataTypeCopy.expenses[index].pressed = !aggregateDataTypeCopy.expenses[index].pressed
            const arrFiltered = aggregateDataTypeCopy.expenses.filter(
                it => it.pressed)
            const isChanged = arrFiltered.length !==
                aggregateDataType.expenses.length
            const totalSums = arrFiltered.reduce(
                (sum, it) => sum + it.dateTotals[0].total, 0)
            aggregateDataTypeCopy.expenses.forEach((it) => {
                it.prc = !isChanged ? it.dateTotals[0].prc : Math.round(
                    it.dateTotals[0].total / (totalSums / 100))
            })
        } else {
            aggregateDataTypeCopy.incomes[index].pressed = !aggregateDataTypeCopy.incomes[index].pressed
            const arrFiltered = aggregateDataTypeCopy.incomes.filter(
                it => it.pressed)
            const isChanged = arrFiltered.length !==
                aggregateDataType.incomes.length
            const totalSums = arrFiltered.reduce(
                (sum, it) => sum + it.dateTotals[0].total, 0)
            aggregateDataTypeCopy.incomes.forEach((it) => {
                it.prc = !isChanged ? it.dateTotals[0].prc : Math.round(
                    it.dateTotals[0].total / (totalSums / 100))
            })
        }
        this.setState({
            currentOpenItemIndex: null,
            aggregateDataType: aggregateDataTypeCopy,
        })
    }

    openPopUp = (item, index, isExpense) => () => {
        console.log('openPopUp')
        const {typePie, dateFrom, dateTill} = this.state

        this.setState({
            progressModalDetails: true,
            dataPopUpDetails: Object.assign({
                hova: isExpense,
            }, item),
        })
        new Api({endpoint: `account/${typePie}/details`}).post({
            body: {
                companyAccountIds: this.accountIdsForRequest,
                dateFrom: dateFrom,
                dateTill: dateTill,
                'description': item.description,
                'hova': isExpense,
                'total': item.dateTotals[0].total,
                'transTypeId': item.transTypeId,
            },
        })
            .then((data) => {
                data.hova = isExpense
                this.setState({
                    progressModalDetails: false,
                    dataPopUpDetails: Object.assign(data, item),
                }, () => {
                    console.log(this.state.dataPopUpDetails)
                })
            })
            .catch(() => this.setState({progressModalDetails: false}))
    }

    hideModalDetails = () => {
        this.setState({
            dataPopUpDetails: false,
        })
    }
    renderHeaderModalDetails = () => {
        const {dataPopUpDetails, dateFrom, dateTill} = this.state
        const total = getFormattedValueArray(dataPopUpDetails.transesTotal)
        const numberStyle = cs(dataPopUpDetails.hova,
            [styles.dataValue, {color: colors.green4}], {color: colors.red2})

        const isStartMonth = (AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment().startOf('month').format('YYYY-MM-DD'),
                'year') && AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment().startOf('month').format('YYYY-MM-DD'),
                'month') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
                'year') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
                'month'))
        const isLastMonth = (AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment()
                .subtract(1, 'month')
                .startOf('month')
                .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment()
                .subtract(1, 'month')
                .startOf('month')
                .format('YYYY-MM-DD'), 'month') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment()
                .subtract(1, 'month')
                .endOf('month')
                .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment()
                .subtract(1, 'month')
                .endOf('month')
                .format('YYYY-MM-DD'), 'month'))
        const isFromStartYear = (AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment().startOf('year').format('YYYY-MM-DD'),
                'year') && AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment().startOf('year').format('YYYY-MM-DD'),
                'month') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
                'year') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
                'month'))
        const isLastYear = (AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment()
                .subtract(1, 'year')
                .startOf('year')
                .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateFrom)
            .isSame(AppTimezone.moment()
                .subtract(1, 'year')
                .startOf('year')
                .format('YYYY-MM-DD'), 'month') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment()
                .subtract(1, 'year')
                .endOf('year')
                .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateTill)
            .isSame(AppTimezone.moment()
                .subtract(1, 'year')
                .endOf('year')
                .format('YYYY-MM-DD'), 'month'))
        let stateTextMonth = ''
        if (isStartMonth) {
            stateTextMonth = 'מתחילת החודש'
        } else if (isLastMonth) {
            stateTextMonth = 'חודש קודם'
        } else if (isFromStartYear) {
            stateTextMonth = 'מתחילת השנה'
        } else if (isLastYear) {
            stateTextMonth = 'שנה שעברה'
        } else {
            stateTextMonth = LocaleConfig.locales.he.monthNames[parseFloat(
                AppTimezone.moment(dateFrom).format('MM')) - 1] + ' ' +
                AppTimezone.moment(dateFrom).format('YYYY') +
                ' - ' + LocaleConfig.locales.he.monthNames[parseFloat(
                    AppTimezone.moment(dateTill).format('MM')) - 1] + ' ' +
                AppTimezone.moment(dateTill).format('YYYY')
        }

        return (
            <View style={{
                flex: 1,
                height: 87,
                flexDirection: 'row-reverse',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
                paddingHorizontal: 10,
            }}>
                <View style={{
                    flex: 1,
                }}>
                    <Text style={{
                        textAlign: 'center',
                        color: '#022258',
                        fontSize: sp(18),
                        fontFamily: fonts.semiBold,
                    }}>
                        {stateTextMonth}
                    </Text>
                    <Text style={{
                        textAlign: 'center',
                        color: '#022258',
                        fontSize: sp(15),
                        fontFamily: fonts.regular,
                    }}>
                        תקופה
                    </Text>
                </View>
                <View style={{
                    flex: 1,
                }}>
                    <Text style={{
                        textAlign: 'center',
                        color: '#022258',
                        fontSize: sp(18),
                        fontFamily: fonts.semiBold,
                    }}>
                        {dataPopUpDetails.prc}{'%'}
                    </Text>
                    <Text style={{
                        textAlign: 'center',
                        color: '#022258',
                        fontSize: sp(15),
                        fontFamily: fonts.regular,
                    }}>
                        אחוז מהמשיכות
                    </Text>
                </View>
                <View style={{
                    flex: 1,
                }}>
                    <Text numberOfLines={1}
                          style={{
                              textAlign: 'center',
                              alignSelf: 'center',
                          }}
                          ellipsizeMode="tail">
                        <Text style={[
                            numberStyle,
                            {
                                fontSize: sp(18),
                                fontFamily: fonts.semiBold,
                            }]}>{total[0]}</Text>
                        <Text style={[
                            styles.fractionalPart,
                            {fontSize: sp(18)}]}>.{total[1]}</Text>
                    </Text>
                    <Text style={{
                        textAlign: 'center',
                        color: '#022258',
                        fontSize: sp(15),
                        fontFamily: fonts.regular,
                    }}>
                        {'סה”כ '}{dataPopUpDetails && dataPopUpDetails.transes
                        ? dataPopUpDetails.transes.length
                        : ''}{' תנועות'}
                    </Text>
                </View>

            </View>
        )
    }
    renderItemSeparatorModalDetails = () => <View style={{
        height: 9.5,
        width: '100%',
        backgroundColor: '#ffffff',
    }}/>
    renderItemModalDetails = ({item, index}) => {
        const {dataPopUpDetails, typePie, categoriesArr} = this.state
        const {searchkey} = this.props

        const total = getFormattedValueArray(item.total)
        const numberStyle = cs((
            (item.transId === '00000000-0000-0000-0000-000000000000' &&
                item.total < 0)
                ? !dataPopUpDetails.hova
                : dataPopUpDetails.hova
        ), [styles.dataValue, {color: colors.green4}], {color: colors.red2})

        let transTypeName
        let iconName
        if (typePie === 'PAYMENT_DESC') {
            const isExist = categoriesArr.find(
                (cat) => cat.transTypeId === item.transTypeId)
            transTypeName = isExist ? isExist.transTypeName : ''
            iconName = isExist ? getTransCategoryIcon(isExist.iconType) : null
        } else {
            transTypeName = searchkey && searchkey.length > 0 &&
            searchkey.find((it) => it.paymentDescription === item.paymentDesc)
                ? searchkey.find(
                    (it) => it.paymentDescription === item.paymentDesc).name
                : ''
            iconName = item.paymentDesc
                ? getBankTransIcon(item.paymentDesc)
                : getBankTransIcon(null)
        }

        return (
            <View style={{
                height: 64.5,
                flex: 1,
                flexDirection: 'row-reverse',
                justifyContent: 'center',
            }}>
                <View style={{
                    flex: 153,
                    backgroundColor: '#f3f6fa',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignContent: 'center',
                    alignItems: 'center',
                }}>
                    <View>
                        <CustomIcon
                            name={iconName}
                            size={20}
                            color={'#022258'}
                        />
                    </View>
                    <View>
                        <Text style={{
                            textAlign: 'center',
                            color: '#022258',
                            fontSize: sp(12.5),
                            fontFamily: fonts.regular,
                        }}>
                            {transTypeName}
                        </Text>
                    </View>
                </View>
                <View style={{
                    flex: 597,
                    borderTopColor: '#e7e8e8',
                    borderTopWidth: 1,
                    borderBottomColor: '#e7e8e8',
                    borderBottomWidth: 1,
                    flexDirection: 'row-reverse',
                    paddingHorizontal: 7.5,
                }}>

                    <View style={{
                        flex: 400,
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        paddingLeft: 7.5,
                    }}>
                        <View>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{
                                    color: '#022258',
                                    fontSize: sp(16),
                                    fontFamily: fonts.semiBold,
                                }}>
                                {item.transName}
                            </Text>
                        </View>
                        <View>
                            <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                style={{
                                    color: '#022258',
                                    fontSize: sp(15),
                                    fontFamily: fonts.regular,
                                }}>
                                {item.generalName}
                            </Text>
                        </View>
                        <View>
                            <Text style={{
                                color: '#022258',
                                fontSize: sp(15),
                                fontFamily: fonts.light,
                            }}>
                                {AppTimezone.moment(item.transDate)
                                    .format('DD/MM/YY')}
                            </Text>
                        </View>
                    </View>
                    <View style={{
                        flex: 200,
                        alignItems: 'flex-end',
                        justifyContent: 'center',
                        alignContent: 'center',
                    }}>
                        <Text numberOfLines={1} ellipsizeMode="tail">
                            <Text
                                style={[
                                    numberStyle,
                                    {
                                        fontSize: sp(17),
                                        fontFamily: fonts.semiBold,
                                    }]}>{total[0]}</Text>
                            <Text style={[
                                styles.fractionalPart,
                                {fontSize: sp(17)}]}>.{total[1]}</Text>
                        </Text>
                    </View>
                </View>
            </View>
        )
    }

    linkToUpload = (action) => () => {
        goTo(this.props.navigation, 'UPLOADING_DOCUMENTS', {
            objParamas: {
                action: action,
                companyId: this.props.currentCompanyId,
            },
        })
    }

    render() {
        const {
            t,
            isRtl,
            accountGroups,
            accounts,
            currentCompanyId,
            navigation,
            user,
            openedBottomSheet,
        } = this.props
        StatusBar.setBarStyle(
            (IS_IOS || openedBottomSheet) ? 'dark-content' : 'light-content',
            true)
        const ocrPilot2 = this.props.globalParams.ocrPilot !== undefined && this.props.globalParams.ocrPilot === 2;
        const {
            selectedAccountIds,
            selectedGroup,
            accountsModalIsOpen,
            dateTillTimestamp,
            headerMaxHeight,
            alertDetailsIsOpen,
            scrollAnim,
            aggregateDataType,
            typePieChooseExpense,
            currentOpenItemIndex,
            typePie,
            financialData,
            bankTrans,
            enabledScroll,
            cashFlowAggregatedData,
            pointerEvents,
            calendarModalIsOpen,
            stateTextMonth,
            dateFrom,
            dateTill,
            loanModalIsOpen,
            loans,
            deleteLoanModal,
            showLoanRowModal,
            loanRow,
            deposit,
            deleteDepositModal,
            showDepositRowModal,
            depositRow,
            depositModalIsOpen,
            accountBalanceChartData,
            inProgress,
            refreshing,
            fadeAnim,
            openPopupAfterUpgrade,
            fadeAnimUpgrade,
            updateTokenModalIsOpen,
            currentToken,
            newTokenStatus,
            lockedModalIsOpen,
            fadeAnimBiziboxTrialExpired,
            showLastRowPopup,
            showtrialBlocked,
            fadeAnimApproveDowngrade,
            progressPies,
            dataPopUpDetails,
            progressModalDetails,
            statusNotValid,
        } = this.state
console.log('selectedAccountIds-------', selectedAccountIds)
        console.log('financialData:', financialData)
        const cashFlowAggregatedDataAll = cashFlowAggregatedData
            ? cashFlowAggregatedData.find(d => d.accountUuid === null)
            : null
        // const deviceWidth = Dimensions.get('window').width
        // const navbarTranslate = scrollAnim.interpolate({
        //   inputRange: [0, NAVBAR_HEIGHT - STATUS_BAR_HEIGHT],
        //   outputRange: [0, -(NAVBAR_HEIGHT - STATUS_BAR_HEIGHT)],
        //   extrapolate: 'clamp',
        // })
        // const navbarOpacity = scrollAnim.interpolate({
        //   inputRange: [0, NAVBAR_HEIGHT - STATUS_BAR_HEIGHT],
        //   outputRange: [1, 0],
        //   extrapolate: 'clamp',
        // })
        // const headerTranslate = scrollAnim.interpolate({
        //   inputRange: [0, 1, 130],
        //   outputRange: [0, 0, 130],
        //   extrapolate: 'clamp',
        // })
        const currencySign = selectedGroup
            ? getCurrencyChar(selectedGroup)
            : (this.selectedAccounts.length ? getCurrencyChar(
                this.selectedAccounts[0].currency) : '')

        let accChoose = accounts.find((element) => element.companyAccountId ===
            this.accountIdsForRequest[0])
        if (!accChoose) {
            accChoose = accounts[0]
        }
        const balanceLastUpdatedDateClose = (selectedAccountIds.length === 1 &&
            accChoose &&
            AppTimezone.moment().diff(accChoose.balanceLastUpdatedDate, 'days') <=
            7)
        const balanceLastUpdatedDateFar = selectedAccountIds.length === 1 &&
            accChoose &&
            AppTimezone.moment().diff(accChoose.balanceLastUpdatedDate, 'days') >
            7

        const alertState = this.headerAlertState

        return (
            <Fragment>
                <AlertsTrial navigation={navigation} refresh={this._onRefresh}
                             updateToken={this.props.globalParams.updateToken}/>
                {/* {(refreshing) && (<Loader overlay containerStyle={{ backgroundColor: colors.white }} />)} */}

                <View style={[
                    styles.fill, {
                        zIndex: 1,
                        flex: 1,
                        backgroundColor: 'white',
                    }]}>
                    <Animated.ScrollView
                        automaticallyAdjustContentInsets={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}
                            />
                        }
                        extraData={this.state.refreshing}
                        nestedScrollEnabled
                        scrollEnabled={enabledScroll}
                        scrollEventThrottle={16}
                        showsVerticalScrollIndicator={false}
                        style={[styles.contentContainer, {}]}
                        contentContainerStyle={[
                            styles.tableWrapper, {
                                marginTop: headerMaxHeight,
                                paddingBottom: headerMaxHeight,
                                flexGrow: 1,
                            }]}
                        onScroll={
                            Animated.event(
                                [{nativeEvent: {contentOffset: {y: this.state.scrollAnim}}}],
                                {
                                    useNativeDriver: true,
                                    listener: e => {
                                        let windowHeight = Dimensions.get(
                                            'window').height
                                        let height = e.nativeEvent.contentSize.height
                                        let offset = e.nativeEvent.contentOffset.y
                                        if (windowHeight + offset >= height + 50) {
                                            // //console.log('end')
                                            this.setState({pointerEvents: 'auto'})
                                        } else {
                                            // //console.log('not end')
                                            this.setState({pointerEvents: 'none'})
                                        }
                                    },
                                })}>
                        {refreshing && (
                            <View style={{flex: 1}}>
                                <ActivityIndicator color="#999999"/>
                            </View>
                        )}

                        <View style={[
                            {
                                opacity: 1,
                                width: '100%',
                                zIndex: 9,
                                overflow: 'visible',
                                shadowColor: '#f2f2f2',
                                shadowOpacity: 1,
                                shadowOffset: {
                                    width: 0,
                                    height: 3,
                                },
                                elevation: 3,
                                backgroundColor: 'white',
                            }]}>
                            <View style={{
                                height: 79.5,
                                flexDirection: 'column',
                                justifyContent: 'center',
                                // alignItems: 'center',
                                width: '100%',
                            }}>
                                {cashFlowAggregatedData &&
                                this.selectedAccounts && (
                                    <Fragment>
                                        <AccountAlertOverview
                                            navigation={this.props.navigation}
                                            currentCompanyId={currentCompanyId}
                                            hasHeaderAlert={this.hasHeaderAlert}
                                            setStatusToken={this.setStatusToken}
                                            accounts={accounts}
                                            t={t}
                                            isRtl={isRtl}
                                            cashFlowAggregatedData={cashFlowAggregatedData}
                                            selectedHarigaDatetAccounts={this.selectedHarigaDatetAccounts}
                                            selectedAccounts={this.selectedAccounts}
                                            selectedDeviantAccounts={this.selectedDeviantAccounts}
                                            onSelectAccount={this.linkToPageCASHFLOWAlerts}
                                            onToggleAlertDetails={this.handleToggleAlertDetails}
                                            selectedNotUpdatedAccounts={this.selectedNotUpdatedAccounts}
                                            {...this.headerAlertState}
                                        />
                                    </Fragment>
                                )}
                                {(!cashFlowAggregatedData ||
                                    !this.selectedAccounts) && (
                                    <Fragment>
                                        <ActivityIndicator color="#999999"/>
                                    </Fragment>
                                )}

                                {(alertDetailsIsOpen && IS_IOS) && (
                                    <AccountAlertDetails
                                        alertState={alertState}
                                        isRtl={isRtl}
                                        top={100}
                                        accounts={(this.xAccountsExceeded)
                                            ? this.selectedDeviantAccounts
                                            : ((cashFlowAggregatedData && accounts)
                                                ? accounts.filter(acc => cashFlowAggregatedData.filter(
                                                    a => a.accountUuid !== null && a.harigaDate !== null)
                                                    .map((b) => b.accountUuid)
                                                    .includes(acc.companyAccountId))
                                                : [])}
                                        onSelectAccount={this.linkToPageCASHFLOW}
                                        onClose={this.handleToggleAlertDetails}
                                    />
                                )}
                            </View>
                            <View style={{
                                height: 1,
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'flex-end',
                            }}>
                                <View style={{
                                    height: 1,
                                    width: '80%',
                                    backgroundColor: '#0f3860',
                                }}/>
                            </View>
                            {IS_LIGHT.light && (
                                <View style={{
                                    flexDirection: 'row-reverse',
                                    // justifyContent: 'space-between',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    marginHorizontal: 18,
                                }}>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        flex: 35,
                                    }}>
                                        {(newTokenStatus &&
                                            this.selectedAccounts.length > 0 &&
                                            this.selectedNotUpdatedAccounts.length !==
                                            0) &&
                                        (this.state.statusToken ===
                                            BANK_TOKEN_STATUS.AGREEMENT_REQUIRED ||
                                            this.state.statusToken ===
                                            BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS ||
                                            this.state.statusToken ===
                                            BANK_TOKEN_STATUS.INVALID_PASSWORD ||
                                            this.state.statusToken ===
                                            BANK_TOKEN_STATUS.PASSWORD_EXPIRED ||
                                            this.state.statusToken ===
                                            BANK_TOKEN_STATUS.BLOCKED
                                        ) && (<Image style={[
                                                styles.imgIcon,
                                                {
                                                    width: 42.5,
                                                    height: 42.5,
                                                }]}
                                                     source={require(
                                                         'BiziboxUI/assets/passIconRed.png')}/>
                                        )}
                                        {((this.selectedAccounts.length > 0 &&
                                            this.selectedNotUpdatedAccounts.length ===
                                            0) ||
                                            !(this.state.statusToken ===
                                                BANK_TOKEN_STATUS.AGREEMENT_REQUIRED ||
                                                this.state.statusToken ===
                                                BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS ||
                                                this.state.statusToken ===
                                                BANK_TOKEN_STATUS.INVALID_PASSWORD ||
                                                this.state.statusToken ===
                                                BANK_TOKEN_STATUS.PASSWORD_EXPIRED ||
                                                this.state.statusToken ===
                                                BANK_TOKEN_STATUS.BLOCKED
                                            )) && (<Image style={[
                                            styles.imgIcon,
                                            {
                                                width: 42.5,
                                                height: 42.5,
                                            }]}
                                                          source={require(
                                                              'BiziboxUI/assets/passIcon.png')}/>)}
                                        <Text style={{
                                            color: '#022258',
                                            fontFamily: fonts.regular,
                                            fontSize: sp(19),
                                            textAlign: 'right',
                                        }}>
                                            סיסמאות
                                        </Text>
                                    </View>

                                    <View style={{
                                        marginLeft: 'auto',
                                        flex: (newTokenStatus &&
                                            this.selectedAccounts.length > 0 &&
                                            this.selectedNotUpdatedAccounts.length !==
                                            0 && (this.state.statusToken ===
                                                BANK_TOKEN_STATUS.AGREEMENT_REQUIRED ||
                                                this.state.statusToken ===
                                                BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS))
                                            ? 70
                                            : 50,
                                    }}>
                                        {(this.selectedAccounts.length === 0 ||
                                            (!newTokenStatus &&
                                                this.selectedNotUpdatedAccounts.length >
                                                0)) && (
                                            <Fragment>
                                                <ActivityIndicator color="#999999"/>
                                            </Fragment>
                                        )}
                                        {(this.selectedAccounts.length > 0 &&
                                            this.selectedNotUpdatedAccounts.length ===
                                            0) && (
                                            <Text style={{
                                                color: '#229f88',
                                                fontFamily: fonts.bold,
                                                fontSize: sp(18),
                                                textAlign: 'left',
                                            }}>
                                                הסיסמאות תקינות
                                            </Text>
                                        )}
                                        {newTokenStatus &&
                                        this.selectedAccounts.length > 0 &&
                                        this.selectedNotUpdatedAccounts.length !==
                                        0 && (
                                            <Fragment>
                                                {this.isLightNotUpdatedAccounts}
                                            </Fragment>
                                        )}
                                    </View>
                                </View>
                            )}
                            {!IS_LIGHT.light && (
                                <View style={{
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    height: 49.5,
                                }}>
                                    {inProgress && (
                                        <ActivityIndicator color="#999999"/>
                                    )}
                                    {!inProgress && cashFlowAggregatedDataAll &&
                                    (cashFlowAggregatedDataAll.hovaNigrarot ===
                                        null ||
                                        cashFlowAggregatedDataAll.hovaNigrarot ===
                                        0) &&
                                    (cashFlowAggregatedDataAll.zhutNigrarot ===
                                        null ||
                                        cashFlowAggregatedDataAll.zhutNigrarot ===
                                        0) && ((selectedAccountIds.length !== 1) ||
                                        balanceLastUpdatedDateClose) && (
                                        <Text style={{
                                            color: '#0f3860',
                                            fontFamily: fonts.regular,
                                            fontSize: sp(16.5),
                                            textAlign: 'center',
                                        }}>לא קיימות תנועות שטרם נפרעו/ לא
                                            הותאמו</Text>
                                    )}
                                    {!balanceLastUpdatedDateFar && !inProgress &&
                                    cashFlowAggregatedDataAll &&
                                    ((cashFlowAggregatedDataAll.hovaNigrarot !==
                                        null &&
                                        cashFlowAggregatedDataAll.hovaNigrarot > 0) ||
                                        (cashFlowAggregatedDataAll.zhutNigrarot !==
                                            null &&
                                            cashFlowAggregatedDataAll.zhutNigrarot >
                                            0)) && (
                                        <View style={{
                                            flexDirection: 'column',
                                            alignSelf: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        }}>
                                            <View style={{
                                                flexDirection: 'row-reverse',
                                                alignSelf: 'center',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                            }}>
                                                <Text style={{
                                                    color: '#0f3860',
                                                    fontFamily: fonts.regular,
                                                    fontSize: sp(16.5),
                                                    textAlign: 'center',
                                                    paddingLeft: 5,
                                                }}>{'טרם נפרעו/ לא הותאמו'}</Text>
                                                <Text numberOfLines={1}
                                                      ellipsizeMode="tail">
                                                    <Text style={[
                                                        {
                                                            fontSize: sp(16.5),
                                                            color: colors.green4,
                                                        },
                                                        commonStyles.regularFont]}>{'₪'}{getFormattedValueArray(
                                                        cashFlowAggregatedDataAll.zhutNigrarot)[0]}</Text>
                                                </Text>
                                                <Text style={{
                                                    color: '#0f3860',
                                                    fontFamily: fonts.regular,
                                                    fontSize: sp(16.5),
                                                    textAlign: 'center',
                                                    paddingHorizontal: 2,
                                                }}>{'+'}</Text>
                                                <Text numberOfLines={1}
                                                      ellipsizeMode="tail">
                                                    <Text style={[
                                                        {
                                                            fontSize: sp(16.5),
                                                            color: colors.red2,
                                                        },
                                                        commonStyles.regularFont]}>{'₪'}{getFormattedValueArray(
                                                        cashFlowAggregatedDataAll.hovaNigrarot *
                                                        (-1))[0]}</Text>
                                                </Text>
                                            </View>
                                            <View>
                                                {((selectedAccountIds.length !== 1) ||
                                                    (balanceLastUpdatedDateClose)) && (
                                                    <TouchableOpacity
                                                        onPress={this.goToMatch}>
                                                        <View style={{
                                                            flexDirection: 'row-reverse',
                                                            alignSelf: 'center',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                        }}>
                                                            <Text
                                                                style={styles.link}>להתאמה</Text>
                                                            <Icon
                                                                iconStyle={{
                                                                    alignSelf: 'center',
                                                                    justifyContent: 'center',
                                                                    alignItems: 'center',
                                                                    alignContent: 'center',
                                                                    width: 13,
                                                                    marginTop: 3,
                                                                }}
                                                                name="chevron-small-left"
                                                                type="entypo"
                                                                size={18}
                                                                color={'#007ebf'}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                )}
                                                {(balanceLastUpdatedDateFar) && (
                                                    <View style={{
                                                        flexDirection: 'row-reverse',
                                                        alignSelf: 'center',
                                                        justifyContent: 'center',
                                                        alignItems: 'center',
                                                    }}>
                                                        <Text style={{
                                                            fontSize: sp(13),
                                                            fontFamily: fonts.regular,
                                                            color: '#0f3860',
                                                            textAlign: 'center',
                                                        }}>קיימות תנועות שטרם נפרעו/לא
                                                            תואמו, עדכנו את החשבון על
                                                            מנת
                                                            לבצע התאמה</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    )}
                                    {(!inProgress && balanceLastUpdatedDateFar) && (
                                        <View style={{
                                            flexDirection: 'column',
                                            alignSelf: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        }}>
                                            <View>
                                                <View style={{
                                                    flexDirection: 'row-reverse',
                                                    alignSelf: 'center',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    <Text style={{
                                                        fontSize: sp(13),
                                                        fontFamily: fonts.regular,
                                                        color: '#0f3860',
                                                        textAlign: 'center',
                                                    }}>קיימות תנועות שטרם נפרעו/לא
                                                        תואמו, עדכנו את החשבון על מנת
                                                        לבצע
                                                        התאמה</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </View>
                            )}
                        </View>


                        {(ocrPilot2) && (
                            <Fragment>
                                <View style={{
                                    flexDirection: 'row-reverse',
                                    justifyContent: 'space-around',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                    height: 90,
                                    shadowColor: '#f2f2f2',
                                    shadowOpacity: 1,
                                    shadowOffset: {
                                        width: 0,
                                        height: 3,
                                    },
                                    elevation: 3,
                                    backgroundColor: 'white',
                                    paddingHorizontal: 35,
                                }}>
                                    <TouchableOpacity
                                        style={{
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                            alignSelf: 'center',
                                            flexDirection: 'column',
                                        }}
                                        onPress={this.linkToUpload('openCameraAndCameraRollTrue')}>
                                        <View style={{
                                            width: 50,
                                            height: 50,
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                            alignSelf: 'center',
                                            flexDirection: 'column',
                                            borderRadius: 25,
                                            backgroundColor: '#cd1010',
                                        }}>
                                            <CustomIcon
                                                style={{
                                                    marginRight: -8,
                                                }}
                                                name={'expense-press'}
                                                size={26}
                                                color={'#ffffff'}/>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                            alignSelf: 'center',
                                            flexDirection: 'column',
                                        }}
                                        onPress={this.linkToUpload('openCameraAndCameraRollFalse')}>
                                        <View style={{
                                            width: 50,
                                            height: 50,
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                            alignSelf: 'center',
                                            flexDirection: 'column',
                                            borderRadius: 25,
                                            backgroundColor: '#229f88',
                                        }}>
                                            <CustomIcon
                                                style={{
                                                    marginRight: -8,
                                                }}
                                                name={'income-press'}
                                                size={26}
                                                color={'#ffffff'}/>
                                        </View>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={{
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                            alignSelf: 'center',
                                            flexDirection: 'column',
                                        }}
                                        onPress={this.linkToUpload('getFolders')}>
                                        <View style={{
                                            width: 50,
                                            height: 50,
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                            alignSelf: 'center',
                                            flexDirection: 'column',
                                            borderRadius: 25,
                                            backgroundColor: '#818080',
                                        }}>
                                            <CustomIcon
                                                name={'other-press'}
                                                size={26}
                                                color={'#ffffff'}/>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </Fragment>
                        )}


                        <View style={{
                            width: '100%',
                            height: 282,
                            paddingHorizontal: 5,
                            overflow: 'visible',
                        }}>
                            <View style={{
                                paddingTop: 10,
                            }}>
                                <Text style={{
                                    color: '#0f3860',
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(26),
                                    textAlign: 'center',
                                    lineHeight: 28.5,
                                }}>{'ריכוז יתרות'}</Text>
                                {(this.accountsBalanceTotal !== 'false') && (
                                    <Text style={{
                                        color: (this.accountsBalanceTotal > 0)
                                            ? '#229f88'
                                            : '#ef3636',
                                        fontFamily: fonts.regular,
                                        fontSize: sp(27),
                                        textAlign: 'center',
                                        lineHeight: 26,
                                    }}>{`${currencySign} ${this.accountsBalance}`}</Text>
                                )}
                            </View>
                            <View style={{
                                height: 178,
                                width: '100%',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <UncontrolledChartSlider
                                    colorsReverse
                                    isLight={IS_LIGHT.light}
                                    translateX={this.headerChartX.x}
                                    data={accountBalanceChartData}
                                    accountsCreditLimit={this.accountsCreditLimit}
                                    dateTillTimestamp={IS_LIGHT.light
                                        ? AppTimezone.moment().valueOf()
                                        : dateTillTimestamp}
                                />
                            </View>
                            <View style={{
                                flexDirection: 'row-reverse',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 38,
                            }}>
                                <TouchableOpacity
                                    style={{
                                        paddingHorizontal: 23.5,
                                    }}
                                    onPress={this.linkToPage(BANK_ACCOUNTS)}>
                                    <Text
                                        style={styles.link}>{'למסך חשבונות בנק'}</Text>
                                </TouchableOpacity>
                                {!IS_LIGHT.light && (
                                    <TouchableOpacity
                                        style={{
                                            paddingHorizontal: 23.5,
                                        }}
                                        onPress={this.linkToPage(CASH_FLOW)}>
                                        <Text
                                            style={styles.link}>{'למסך תזרים יומי'}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        <View style={{
                            height: 4,
                            width: '100%',
                        }}>
                            <View style={{
                                backgroundColor: 'white',
                                shadowColor: '#f2f2f2',
                                shadowOpacity: 1,
                                shadowOffset: {
                                    width: 0,
                                    height: -4,
                                },
                                elevation: 4,
                                height: 4,
                                width: '100%',
                            }}/>
                        </View>
                        <View style={{
                            backgroundColor: 'white',
                            paddingVertical: 10,
                        }}>
                            <Text style={{
                                color: '#0f3860',
                                fontFamily: fonts.semiBold,
                                fontSize: sp(26),
                                textAlign: 'center',
                                lineHeight: 28.5,
                            }}>{'הפקדות ומשיכות'}</Text>
                            <TouchableOpacity onPress={this.setDatesCalendarOpen}>
                                <View style={{
                                    flexDirection: 'row-reverse',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Text
                                        style={styles.link}>{stateTextMonth}</Text>
                                    <Icon
                                        iconStyle={{
                                            alignSelf: 'center',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            width: 13,
                                            marginTop: 3,
                                        }}
                                        name="chevron-small-left"
                                        type="entypo"
                                        size={18}
                                        color={'#007ebf'}
                                    />
                                </View>
                            </TouchableOpacity>
                            <Animated.ScrollView
                                ref={scrollView => (this.scrollView = scrollView)}
                                showsHorizontalScrollIndicator={false}
                                horizontal
                                scrollEventThrottle={16}
                                onScrollEndDrag={() => {
                                    // if (this.scrollView && this.scrollView._component) {
                                    //   if (e.nativeEvent.contentOffset.x < 110) {
                                    //     this.scrollView._component.scrollToEnd({ animated: true })
                                    //   } else {
                                    //     this.scrollView._component.scrollTo({ animated: true, x: 0 })
                                    //   }
                                    // }
                                }}
                                onScroll={(e) => {
                                    this.setState({
                                        currentOpenItemIndex: null,
                                        typePieChooseExpense: e.nativeEvent.contentOffset.x >
                                            110,
                                    })
                                }}
                                contentContainerStyle={{
                                    flexDirection: (!isRtl) ? 'row-reverse' : 'row',
                                    alignSelf: 'center',
                                    zIndex: 996,
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                    width: 600,
                                }}>
                                <View style={{
                                    marginLeft: winWidth / 2 - 110,
                                    height: 220,
                                    width: 220,
                                    flexDirection: 'column',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                }}>
                                    {aggregateDataType &&
                                    aggregateDataType.incomes && (
                                        <Pie
                                            currentOpenItemIndex={!typePieChooseExpense
                                                ? currentOpenItemIndex
                                                : null}
                                            press={this.pressItemPie}
                                            title={{
                                                label: 'הפקדות',
                                                value: aggregateDataType.incomes.filter(
                                                    it => it.pressed).length > 0
                                                    ? ((aggregateDataType.incomes.filter(
                                                        it => it.pressed).length ===
                                                        aggregateDataType.incomes.length)
                                                        ? aggregateDataType.totalIncomes
                                                        : aggregateDataType.incomes.filter(
                                                            it => it.pressed)
                                                            .reduce((sum, item) => sum +
                                                                item.dateTotals[0].total, 0))
                                                    : null,
                                                income: true,
                                            }}
                                            keys={aggregateDataType.incomes.filter(
                                                it => it.pressed).length > 0
                                                ? aggregateDataType.incomes.filter(
                                                    it => it.pressed)
                                                    .map((item, index) => {
                                                        return {
                                                            val: item.description,
                                                            idx: index,
                                                            prc: item.prc,
                                                        }
                                                    })
                                                : [
                                                    {
                                                        val: '-',
                                                        idx: 0,
                                                        prc: 0,
                                                    }]}
                                            colors={[
                                                '#02622f',
                                                '#11713e',
                                                '#46a673',
                                                '#58b885',
                                                '#68c895',
                                                '#85e5b2']}
                                            prc={aggregateDataType.incomes.filter(
                                                it => it.pressed).length > 0
                                                ? ((aggregateDataType.incomes.filter(
                                                    it => it.pressed)
                                                    .map((item) => item.prc))) : [0]}
                                            values={aggregateDataType.incomes.filter(
                                                it => it.pressed).length > 0
                                                ? aggregateDataType.incomes.filter(
                                                    it => it.pressed)
                                                    .map(
                                                        (item) => item.dateTotals[0].total)
                                                : [100]}
                                        />
                                    )}
                                </View>
                                <View style={{
                                    marginRight: winWidth / 2 - 110,
                                    height: 220,
                                    width: 220,
                                    flexDirection: 'column',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                }}>
                                    {aggregateDataType &&
                                    aggregateDataType.expenses && (
                                        <Pie
                                            currentOpenItemIndex={typePieChooseExpense
                                                ? currentOpenItemIndex
                                                : null}
                                            press={this.pressItemPie}
                                            title={{
                                                label: 'משיכות',
                                                value: aggregateDataType.expenses.filter(
                                                    it => it.pressed).length > 0
                                                    ? ((aggregateDataType.expenses.filter(
                                                        it => it.pressed).length ===
                                                        aggregateDataType.expenses.length)
                                                        ? aggregateDataType.totalExpenses
                                                        : aggregateDataType.expenses.filter(
                                                            it => it.pressed)
                                                            .reduce((sum, item) => sum +
                                                                item.dateTotals[0].total, 0))
                                                    : null,
                                                income: false,
                                            }}
                                            keys={
                                                aggregateDataType.expenses.filter(
                                                    it => it.pressed).length > 0
                                                    ? aggregateDataType.expenses.filter(
                                                    it => it.pressed)
                                                        .map((item, index) => {
                                                            return {
                                                                val: item.description,
                                                                idx: index,
                                                                prc: item.prc,
                                                            }
                                                        })
                                                    : [
                                                        {
                                                            val: '-',
                                                            idx: 0,
                                                            prc: 0,
                                                        },
                                                    ]}
                                            colors={[
                                                '#d70000',
                                                '#ee0000',
                                                '#fb4f56',
                                                '#fa696e',
                                                '#f88387',
                                                '#ffaaac']}
                                            prc={aggregateDataType.expenses.filter(
                                                it => it.pressed).length > 0
                                                ? ((aggregateDataType.expenses.filter(
                                                    it => it.pressed)
                                                    .map((item) => item.prc))) : [0]}
                                            values={aggregateDataType.expenses.filter(
                                                it => it.pressed).length > 0
                                                ? aggregateDataType.expenses.filter(
                                                    it => it.pressed)
                                                    .map(
                                                        (item) => item.dateTotals[0].total)
                                                : [100]}
                                        />
                                    )}
                                </View>
                            </Animated.ScrollView>
                            <View
                                style={{
                                    flex: 1,
                                    flexGrow: 1,
                                    flexDirection: 'row',
                                    marginBottom: 10,
                                }}>
                                <View style={{flex: 1}}>
                                    <TouchableOpacity
                                        onPress={this.setCheckTitleMarks(true)}>
                                        <View style={{
                                            backgroundColor: this.state.typePie ===
                                            'PAYMENT_DESC'
                                                ? '#08d3b8'
                                                : '#ffffff',
                                            height: 33,
                                            flex: 1,
                                            width: '100%',
                                            borderTopRightRadius: 12,
                                            borderBottomRightRadius: 12,
                                        }}>
                                            <Text style={[
                                                {
                                                    fontFamily: this.state.typePie !==
                                                    'PAYMENT_DESC'
                                                        ? fonts.regular
                                                        : fonts.semiBold,
                                                    textAlign: 'center',
                                                    width: '100%',
                                                    color: this.state.typePie !==
                                                    'PAYMENT_DESC'
                                                        ? '#022258'
                                                        : '#ffffff',
                                                    fontSize: sp(24),
                                                }]}
                                            >{'לפי סוג תשלום'}</Text>
                                        </View>
                                        {/* <CheckTitleMarks text={'לפי סוג תשלום'} value={paymentDescWidth} delay={DELAY} /> */}
                                    </TouchableOpacity>
                                </View>
                                <View style={{flex: 1}}>
                                    <TouchableOpacity
                                        onPress={this.setCheckTitleMarks(false)}>
                                        <View style={{
                                            backgroundColor: this.state.typePie ===
                                            'TRANS_TYPE' ? '#08d3b8' : '#ffffff',
                                            height: 33,
                                            flex: 1,
                                            width: '100%',
                                            borderTopLeftRadius: 12,
                                            borderBottomLeftRadius: 12,
                                        }}>
                                            <Text style={[
                                                {
                                                    fontFamily: this.state.typePie !==
                                                    'TRANS_TYPE'
                                                        ? fonts.regular
                                                        : fonts.semiBold,
                                                    textAlign: 'center',
                                                    width: '100%',
                                                    color: this.state.typePie !==
                                                    'TRANS_TYPE'
                                                        ? '#022258'
                                                        : '#ffffff',
                                                    fontSize: sp(24),
                                                }]}
                                            >{'לפי קטגוריות'}</Text>
                                        </View>
                                        {/* <CheckTitleMarks text={'לפי קטגוריות'} value={transTypeWidth} delay={DELAY} scaleX /> */}
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {aggregateDataType && typePieChooseExpense &&
                            aggregateDataType.expenses &&
                            aggregateDataType.expenses.map((item, index) => {
                                return (
                                    <AggregateDataTypeRow
                                        translates={typePie === 'PAYMENT_DESC'}
                                        expenses
                                        isRtl={isRtl}
                                        item={item}
                                        t={t}
                                        markRow={this.markRow(item, index, true)}
                                        key={index.toString()}
                                        openPopUp={this.openPopUp(item, index, true)}
                                        companyId={currentCompanyId}
                                        isOpen={index === currentOpenItemIndex}
                                        accounts={accounts}
                                        onItemToggle={this.handleItemToggle(index)}
                                    />
                                )
                            })}

                            {!progressPies && aggregateDataType &&
                            typePieChooseExpense && aggregateDataType.expenses &&
                            aggregateDataType.expenses.length === 0 && (
                                <View style={styles.errorWrapper}>
                                    <View
                                        style={[
                                            styles.errorDivider,
                                            {backgroundColor: colors.blue32}]}/>
                                    <Text
                                        style={[
                                            styles.errorText,
                                            {color: colors.blue32}]}>{'לא נמצאו נתוני הוצאות'}</Text>
                                    <View
                                        style={[
                                            styles.errorDivider,
                                            {backgroundColor: colors.blue32}]}/>
                                </View>
                            )}

                            {progressPies && aggregateDataType &&
                            typePieChooseExpense && (
                                <Fragment>
                                    <ActivityIndicator color="#999999"/>
                                </Fragment>
                            )}

                            {aggregateDataType && !typePieChooseExpense &&
                            aggregateDataType.incomes &&
                            aggregateDataType.incomes.map((item, index) => {
                                return (
                                    <AggregateDataTypeRow
                                        translates={typePie === 'PAYMENT_DESC'}
                                        expenses={false}
                                        isRtl={isRtl}
                                        item={item}
                                        t={t}
                                        openPopUp={this.openPopUp(item, index, false)}
                                        markRow={this.markRow(item, index, false)}
                                        key={index.toString()}
                                        companyId={currentCompanyId}
                                        isOpen={index === currentOpenItemIndex}
                                        accounts={accounts}
                                        onItemToggle={this.handleItemToggle(index)}
                                    />
                                )
                            })}

                            {!progressPies && aggregateDataType &&
                            !typePieChooseExpense && aggregateDataType.incomes &&
                            aggregateDataType.incomes.length === 0 && (
                                <View style={styles.errorWrapper}>
                                    <View
                                        style={[
                                            styles.errorDivider,
                                            {backgroundColor: colors.blue32}]}/>
                                    <Text
                                        style={[
                                            styles.errorText,
                                            {color: colors.blue32}]}>{'לא נמצאו נתוני הכנסות'}</Text>
                                    <View
                                        style={[
                                            styles.errorDivider,
                                            {backgroundColor: colors.blue32}]}/>
                                </View>
                            )}

                            {progressPies && aggregateDataType &&
                            !typePieChooseExpense && (
                                <Fragment>
                                    <ActivityIndicator color="#999999"/>
                                </Fragment>
                            )}
                        </View>
                        <View style={{
                            height: 4,
                            width: '100%',
                        }}>
                            <View style={{
                                backgroundColor: 'white',
                                shadowColor: '#f2f2f2',
                                shadowOpacity: 1,
                                shadowOffset: {
                                    width: 0,
                                    height: -4,
                                },
                                elevation: 4,
                                height: 4,
                                width: '100%',
                            }}/>
                        </View>
                        <View style={{
                            backgroundColor: 'white',
                        }}>
                            <Text style={{
                                paddingVertical: 10,
                                color: '#0f3860',
                                fontFamily: fonts.semiBold,
                                fontSize: sp(26),
                                textAlign: 'center',
                                lineHeight: 28.5,
                            }}>{'נתונים פיננסיים'}</Text>

                            <View style={{
                                flexDirection: 'row-reverse',
                                marginBottom: 10,
                            }}>
                                <TouchableHighlight
                                    onPress={this.navigationInChecks}
                                    style={[
                                        {
                                            flex: 1,
                                            shadowColor: '#d0d0d0',
                                            shadowOffset: {
                                                width: 0,
                                                height: 3,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 4,
                                            elevation: 2,
                                            height: 75,
                                            borderTopLeftRadius: 10,
                                            borderBottomLeftRadius: 10,
                                        },
                                        cs((IS_LIGHT.light ||
                                            financialData.inChecks !== 0), {
                                            shadowOpacity: 0,
                                            elevation: 0,
                                        }, {
                                            shadowOpacity: 1,
                                            elevation: 2,
                                        }),
                                        cs(this.state.pressed,
                                            {},
                                            {
                                                elevation: 0,
                                                shadowOpacity: 0,
                                            }),
                                    ]}
                                    onHideUnderlay={() => {
                                        this.setState({pressed: false})
                                    }}
                                    onShowUnderlay={() => {
                                        this.setState({pressed: true})
                                    }}>
                                    <View style={[
                                        {
                                            height: 75,
                                            flex: 1,
                                            borderTopLeftRadius: 10,
                                            borderBottomLeftRadius: 10,
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        },
                                        cs((financialData.inChecks !== 0),
                                            {opacity: 0.8}, {opacity: 1}),
                                        cs(this.state.pressed &&
                                            (financialData.inChecks !== 0),
                                            {
                                                backgroundColor: '#ffffff',
                                            },
                                            {
                                                backgroundColor: '#d7e5ed',
                                            }),
                                    ]}>
                                        <Image style={{
                                            width: 79 / 2,
                                            height: 72 / 2,
                                        }}
                                               source={require(
                                                   'BiziboxUI/assets/inChecks.png')}/>
                                        <View style={{
                                            width: 7.5,
                                        }}/>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            alignContent: 'center',
                                            width: 100,
                                        }}>
                                            {IS_LIGHT.light && (
                                                <Image
                                                    style={[
                                                        styles.imgIcon, {
                                                            width: 58 / 2,
                                                            height: 55 / 2,
                                                            marginRight: 10,
                                                            opacity: 0.7,
                                                        }]}
                                                    source={require(
                                                        'BiziboxUI/assets/diamond.png')}
                                                />)}
                                            <Text style={{
                                                color: IS_LIGHT.light
                                                    ? '#aeaeae'
                                                    : '#0f3860',
                                                fontFamily: fonts.regular,
                                                fontSize: sp(16),
                                            }}>
                                                צ׳קים לפירעון
                                            </Text>
                                            {!IS_LIGHT.light && (
                                                <Text style={{
                                                    color: (financialData.inChecks !==
                                                        0) ? '#1d8a50' : '#0f3860',
                                                    fontFamily: fonts.semiBold,
                                                    fontSize: sp(20),
                                                }}>
                                                    {(financialData.inChecks !== 0)
                                                        ? getFormattedValueArray(
                                                            Math.round(
                                                                financialData.inChecks))[0]
                                                        : '-'}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                <View style={{
                                    width: 9,
                                }}/>
                                <TouchableHighlight
                                    onPress={this.navigationOutChecks}
                                    style={[
                                        {
                                            flex: 1,
                                            shadowColor: '#d0d0d0',
                                            shadowOffset: {
                                                width: 0,
                                                height: 3,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 4,
                                            elevation: 2,
                                            height: 75,
                                            borderTopRightRadius: 10,
                                            borderBottomRightRadius: 10,
                                        },
                                        cs((IS_LIGHT.light ||
                                            financialData.outChecks !== 0), {
                                            shadowOpacity: 0,
                                            elevation: 0,
                                        }, {
                                            shadowOpacity: 1,
                                            elevation: 2,
                                        }),
                                        cs(this.state.pressed1,
                                            {},
                                            {
                                                elevation: 0,
                                                shadowOpacity: 0,
                                            }),
                                    ]}
                                    onHideUnderlay={() => {
                                        this.setState({pressed1: false})
                                    }}
                                    onShowUnderlay={() => {
                                        this.setState({pressed1: true})
                                    }}>
                                    <View style={[
                                        {
                                            height: 75,
                                            flex: 1,
                                            borderTopRightRadius: 10,
                                            borderBottomRightRadius: 10,
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        },
                                        cs((financialData.outChecks !== 0),
                                            {opacity: 0.8}, {opacity: 1}),
                                        cs(this.state.pressed1 &&
                                            (financialData.outChecks !== 0),
                                            {
                                                backgroundColor: '#ffffff',
                                            },
                                            {
                                                backgroundColor: '#d7e5ed',
                                            }),
                                    ]}>
                                        <Image style={{
                                            width: 79 / 2,
                                            height: 80 / 2,
                                        }}
                                               source={require(
                                                   'BiziboxUI/assets/outChecks.png')}/>
                                        <View style={{
                                            width: 7.5,
                                        }}/>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            alignContent: 'center',
                                            width: 100,
                                        }}>
                                            {IS_LIGHT.light && (
                                                <Image
                                                    style={[
                                                        styles.imgIcon, {
                                                            width: 58 / 2,
                                                            height: 55 / 2,
                                                            marginRight: 10,
                                                            opacity: 0.7,
                                                        }]}
                                                    source={require(
                                                        'BiziboxUI/assets/diamond.png')}
                                                />)}
                                            <Text style={{
                                                color: IS_LIGHT.light
                                                    ? '#aeaeae'
                                                    : '#0f3860',
                                                fontFamily: fonts.regular,
                                                fontSize: sp(16),
                                            }}>
                                                צ׳קים לתשלום
                                            </Text>
                                            {!IS_LIGHT.light && (
                                                <Text style={{
                                                    color: (financialData.outChecks !==
                                                        0) ? '#ef3636' : '#0f3860',
                                                    fontFamily: fonts.semiBold,
                                                    fontSize: sp(20),
                                                }}>
                                                    {(financialData.outChecks !== 0)
                                                        ? getFormattedValueArray(
                                                            Math.round(
                                                                financialData.outChecks))[0]
                                                        : '-'}
                                                </Text>
                                            )}
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </View>

                            <View style={{
                                flexDirection: 'row-reverse',
                                marginBottom: 10,
                            }}>
                                <TouchableHighlight
                                    onPress={this.navigationMishmeretBabank}
                                    style={[
                                        {
                                            flex: 1,
                                            shadowColor: '#d0d0d0',
                                            shadowOffset: {
                                                width: 0,
                                                height: 3,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 4,
                                            elevation: 2,
                                            height: 75,
                                            borderTopLeftRadius: 10,
                                            borderBottomLeftRadius: 10,
                                        },
                                        cs((financialData.mishmeretBabank !== 0), {
                                            shadowOpacity: 0,
                                            elevation: 0,
                                        }, {
                                            shadowOpacity: 1,
                                            elevation: 2,
                                        }),
                                        cs(this.state.pressed2,
                                            {},
                                            {
                                                elevation: 0,
                                                shadowOpacity: 0,
                                            }),
                                    ]}
                                    onHideUnderlay={() => {
                                        this.setState({pressed2: false})
                                    }}
                                    onShowUnderlay={() => {
                                        this.setState({pressed2: true})
                                    }}>
                                    <View style={[
                                        {
                                            height: 75,
                                            flex: 1,
                                            borderTopLeftRadius: 10,
                                            borderBottomLeftRadius: 10,
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        },
                                        cs((financialData.mishmeretBabank !== 0),
                                            {opacity: 0.8}, {opacity: 1}),
                                        cs(this.state.pressed2 &&
                                            (financialData.mishmeretBabank !== 0),
                                            {
                                                backgroundColor: '#ffffff',
                                            },
                                            {
                                                backgroundColor: '#d7e5ed',
                                            }),
                                    ]}>
                                        <Image style={{
                                            width: 73 / 2,
                                            height: 80 / 2,
                                        }}
                                               source={require(
                                                   'BiziboxUI/assets/mishmeretBabank.png')}/>
                                        <View style={{
                                            width: 7.5,
                                        }}/>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            alignContent: 'center',
                                            width: 100,
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontFamily: fonts.regular,
                                                fontSize: sp(16),
                                            }}>
                                                צ׳קים למשמרת
                                            </Text>
                                            <Text style={{
                                                color: (financialData.mishmeretBabank !==
                                                    0) ? '#1d8a50' : '#0f3860',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(20),
                                            }}>
                                                {(financialData.mishmeretBabank !==
                                                    0)
                                                    ? getFormattedValueArray(
                                                        Math.round(
                                                            financialData.mishmeretBabank))[0]
                                                    : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                <View style={{
                                    width: 9,
                                }}/>
                                <TouchableHighlight
                                    onPress={this.navigationLenicaion}
                                    style={[
                                        {
                                            flex: 1,
                                            shadowColor: '#d0d0d0',
                                            shadowOffset: {
                                                width: 0,
                                                height: 3,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 4,
                                            elevation: 2,
                                            height: 75,
                                            borderTopRightRadius: 10,
                                            borderBottomRightRadius: 10,
                                        },
                                        cs((financialData.lenicaion !== 0), {
                                            shadowOpacity: 0,
                                            elevation: 0,
                                        }, {
                                            shadowOpacity: 1,
                                            elevation: 2,
                                        }),
                                        cs(this.state.pressed3,
                                            {},
                                            {
                                                elevation: 0,
                                                shadowOpacity: 0,
                                            }),
                                    ]}
                                    onHideUnderlay={() => {
                                        this.setState({pressed3: false})
                                    }}
                                    onShowUnderlay={() => {
                                        this.setState({pressed3: true})
                                    }}>
                                    <View style={[
                                        {
                                            height: 75,
                                            flex: 1,
                                            borderTopRightRadius: 10,
                                            borderBottomRightRadius: 10,
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        },
                                        cs((financialData.lenicaion !== 0),
                                            {opacity: 0.8}, {opacity: 1}),
                                        cs(this.state.pressed3 &&
                                            (financialData.lenicaion !== 0),
                                            {
                                                backgroundColor: '#ffffff',
                                            },
                                            {
                                                backgroundColor: '#d7e5ed',
                                            }),
                                    ]}>
                                        <Image style={{
                                            width: 73 / 2,
                                            height: 80 / 2,
                                        }}
                                               source={require(
                                                   'BiziboxUI/assets/lenicaion.png')}/>
                                        <View style={{
                                            width: 7.5,
                                        }}/>
                                        <View style={{
                                            width: 100,
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            alignContent: 'center',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontFamily: fonts.regular,
                                                fontSize: sp(16),
                                            }}>
                                                צ׳קים בניכיון
                                            </Text>
                                            <Text style={{
                                                color: (financialData.lenicaion !==
                                                    0) ? '#1d8a50' : '#0f3860',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(20),
                                            }}>
                                                {(financialData.lenicaion !== 0)
                                                    ? getFormattedValueArray(
                                                        Math.round(
                                                            financialData.lenicaion))[0]
                                                    : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </View>

                            <View style={{
                                flexDirection: 'row-reverse',
                                marginBottom: 10,
                            }}>
                                <TouchableHighlight
                                    onPress={this.openLoans}
                                    style={[
                                        {
                                            flex: 1,
                                            shadowColor: '#d0d0d0',
                                            shadowOffset: {
                                                width: 0,
                                                height: 3,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 4,
                                            elevation: 2,
                                            height: 75,
                                            borderTopLeftRadius: 10,
                                            borderBottomLeftRadius: 10,
                                        },
                                        cs((financialData.loans !== 0), {
                                            shadowOpacity: 0,
                                            elevation: 0,
                                        }, {
                                            shadowOpacity: 1,
                                            elevation: 2,
                                        }),
                                        cs(this.state.pressed4,
                                            {},
                                            {
                                                elevation: 0,
                                                shadowOpacity: 0,
                                            }),
                                    ]}
                                    onHideUnderlay={() => {
                                        this.setState({pressed4: false})
                                    }}
                                    onShowUnderlay={() => {
                                        this.setState({pressed4: true})
                                    }}>
                                    <View style={[
                                        {
                                            height: 75,
                                            flex: 1,
                                            borderTopLeftRadius: 10,
                                            borderBottomLeftRadius: 10,
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        },
                                        cs((financialData.loans !== 0),
                                            {opacity: 0.8}, {opacity: 1}),
                                        cs(this.state.pressed4 &&
                                            (financialData.loans !== 0),
                                            {
                                                backgroundColor: '#ffffff',
                                            },
                                            {
                                                backgroundColor: '#d7e5ed',
                                            }),
                                    ]}>
                                        <Image style={{
                                            width: 59 / 2,
                                            height: 57 / 2,
                                        }}
                                               source={require(
                                                   'BiziboxUI/assets/loans.png')}/>
                                        <View style={{
                                            width: 7.5,
                                        }}/>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            alignContent: 'center',
                                            width: 100,
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontFamily: fonts.regular,
                                                fontSize: sp(16),
                                            }}>
                                                הלוואות
                                            </Text>
                                            <Text style={{
                                                color: (financialData.loans !== 0)
                                                    ? '#ef3636'
                                                    : '#0f3860',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(20),
                                            }}>
                                                {(financialData.loans !== 0)
                                                    ? getFormattedValueArray(
                                                        Math.round(
                                                            financialData.loans))[0]
                                                    : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                <View style={{
                                    width: 9,
                                }}/>
                                <TouchableHighlight
                                    onPress={this.openDeposit}
                                    style={[
                                        {
                                            flex: 1,
                                            shadowColor: '#d0d0d0',
                                            shadowOffset: {
                                                width: 0,
                                                height: 3,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 4,
                                            elevation: 2,
                                            height: 75,
                                            borderTopRightRadius: 10,
                                            borderBottomRightRadius: 10,
                                        },
                                        cs((financialData.deopsit !== 0), {
                                            shadowOpacity: 0,
                                            elevation: 0,
                                        }, {
                                            shadowOpacity: 1,
                                            elevation: 2,
                                        }),
                                        cs(this.state.pressed5,
                                            {},
                                            {
                                                elevation: 0,
                                                shadowOpacity: 0,
                                            }),
                                    ]}
                                    onHideUnderlay={() => {
                                        this.setState({pressed5: false})
                                    }}
                                    onShowUnderlay={() => {
                                        this.setState({pressed5: true})
                                    }}>
                                    <View style={[
                                        {
                                            height: 75,
                                            flex: 1,
                                            borderTopRightRadius: 10,
                                            borderBottomRightRadius: 10,
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        },
                                        cs((financialData.deopsit !== 0),
                                            {opacity: 0.8}, {opacity: 1}),
                                        cs(this.state.pressed5 &&
                                            (financialData.deopsit !== 0),
                                            {
                                                backgroundColor: '#ffffff',
                                            },
                                            {
                                                backgroundColor: '#d7e5ed',
                                            }),
                                    ]}>
                                        <Image style={{
                                            width: 58 / 2,
                                            height: 58 / 2,
                                        }}
                                               source={require(
                                                   'BiziboxUI/assets/deopsit.png')}/>
                                        <View style={{
                                            width: 7.5,
                                        }}/>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            alignContent: 'center',
                                            width: 100,
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontFamily: fonts.regular,
                                                fontSize: sp(16),
                                            }}>
                                                פקדונות
                                            </Text>
                                            <Text style={{
                                                color: (financialData.deopsit !==
                                                    0) ? '#1d8a50' : '#0f3860',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(20),
                                            }}>
                                                {(financialData.deopsit !== 0)
                                                    ? getFormattedValueArray(
                                                        Math.round(
                                                            financialData.deopsit))[0]
                                                    : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </View>

                            <View style={{
                                flexDirection: 'row-reverse',
                                marginBottom: 10,
                            }}>
                                <TouchableHighlight
                                    onPress={this.navigationCreditCard}
                                    style={[
                                        {
                                            flex: 1,
                                            shadowColor: '#d0d0d0',
                                            shadowOffset: {
                                                width: 0,
                                                height: 3,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 4,
                                            elevation: 2,
                                            height: 75,
                                            borderTopLeftRadius: 10,
                                            borderBottomLeftRadius: 10,
                                        },
                                        cs((financialData.creditCard !== 0), {
                                            shadowOpacity: 0,
                                            elevation: 0,
                                        }, {
                                            shadowOpacity: 1,
                                            elevation: 2,
                                        }),
                                        cs(this.state.pressed6,
                                            {},
                                            {
                                                elevation: 0,
                                                shadowOpacity: 0,
                                            }),
                                    ]}
                                    onHideUnderlay={() => {
                                        this.setState({pressed6: false})
                                    }}
                                    onShowUnderlay={() => {
                                        this.setState({pressed6: true})
                                    }}>
                                    <View style={[
                                        {
                                            height: 75,
                                            flex: 1,
                                            borderTopLeftRadius: 10,
                                            borderBottomLeftRadius: 10,
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        },
                                        cs((financialData.creditCard !== 0),
                                            {opacity: 0.8}, {opacity: 1}),
                                        cs(this.state.pressed6 &&
                                            (financialData.creditCard !== 0),
                                            {
                                                backgroundColor: '#ffffff',
                                            },
                                            {
                                                backgroundColor: '#d7e5ed',
                                            }),
                                    ]}>
                                        <Image style={{
                                            width: 63 / 2,
                                            height: 58 / 2,
                                        }}
                                               source={require(
                                                   'BiziboxUI/assets/creditCard.png')}/>
                                        <View style={{
                                            width: 7.5,
                                        }}/>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            alignContent: 'center',
                                            width: 100,
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontFamily: fonts.regular,
                                                fontSize: sp(16),
                                            }}>
                                                כרטיסי אשראי
                                            </Text>
                                            <Text style={{
                                                color: (financialData.creditCard !==
                                                    0) ? '#ef3636' : '#0f3860',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(20),
                                            }}>
                                                {(financialData.creditCard !== 0)
                                                    ? getFormattedValueArray(
                                                        Math.round(
                                                            financialData.creditCard))[0]
                                                    : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                                <View style={{
                                    width: 9,
                                }}/>
                                <TouchableHighlight
                                    onPress={this.navigationSlika}
                                    style={[
                                        {
                                            flex: 1,
                                            shadowColor: '#d0d0d0',
                                            shadowOffset: {
                                                width: 0,
                                                height: 3,
                                            },
                                            shadowOpacity: 1,
                                            shadowRadius: 4,
                                            elevation: 2,
                                            height: 75,
                                            borderTopRightRadius: 10,
                                            borderBottomRightRadius: 10,
                                        },
                                        cs((financialData.slika !== 0), {
                                            shadowOpacity: 0,
                                            elevation: 0,
                                        }, {
                                            shadowOpacity: 1,
                                            elevation: 2,
                                        }),
                                        cs(this.state.pressed7,
                                            {},
                                            {
                                                elevation: 0,
                                                shadowOpacity: 0,
                                            }),
                                    ]}
                                    onHideUnderlay={() => {
                                        this.setState({pressed7: false})
                                    }}
                                    onShowUnderlay={() => {
                                        this.setState({pressed7: true})
                                    }}>
                                    <View style={[
                                        {
                                            height: 75,
                                            flex: 1,
                                            borderTopRightRadius: 10,
                                            borderBottomRightRadius: 10,
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        },
                                        cs((financialData.slika !== 0),
                                            {opacity: 0.8}, {opacity: 1}),
                                        cs(this.state.pressed7 &&
                                            (financialData.slika !== 0),
                                            {
                                                backgroundColor: '#ffffff',
                                            },
                                            {
                                                backgroundColor: '#d7e5ed',
                                            }),
                                    ]}>
                                        <Image style={{
                                            width: 57 / 2,
                                            height: 63 / 2,
                                        }}
                                               source={require(
                                                   'BiziboxUI/assets/slika.png')}/>
                                        <View style={{
                                            width: 7.5,
                                        }}/>
                                        <View style={{
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'flex-end',
                                            alignContent: 'center',
                                            width: 100,
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontFamily: fonts.regular,
                                                fontSize: sp(16),
                                            }}>
                                                סליקת אשראי
                                            </Text>
                                            <Text style={{
                                                color: (financialData.slika !== 0)
                                                    ? '#1d8a50'
                                                    : '#0f3860',
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(20),
                                            }}>
                                                {(financialData.slika !== 0)
                                                    ? getFormattedValueArray(
                                                        Math.round(
                                                            financialData.slika))[0]
                                                    : '-'}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableHighlight>
                            </View>
                        </View>
                        <View style={{
                            height: 4,
                            width: '100%',
                        }}>
                            <View style={{
                                backgroundColor: 'white',
                                shadowColor: '#f2f2f2',
                                shadowOpacity: 1,
                                shadowOffset: {
                                    width: 0,
                                    height: -4,
                                },
                                elevation: 4,
                                height: 4,
                                width: '100%',
                            }}/>
                        </View>
                        <View style={{
                            backgroundColor: 'white',
                            flex: 1,
                        }}>
                            <Text style={{
                                color: '#0f3860',
                                fontFamily: fonts.semiBold,
                                fontSize: sp(26),
                                textAlign: 'center',
                                lineHeight: 28.5,
                            }}>{'תנועות אחרונות'}</Text>
                            {(bankTrans && bankTrans.length > 0) && (
                                <TouchableOpacity
                                    onPress={this.linkToPage(BANK_ACCOUNTS)}>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        alignSelf: 'center',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}>
                                        <Text
                                            style={styles.link}>{'לכל התנועות'}</Text>
                                        <Icon
                                            iconStyle={{
                                                alignSelf: 'center',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                                width: 13,
                                                marginTop: 3,
                                            }}
                                            name="chevron-small-left"
                                            type="entypo"
                                            size={18}
                                            color={'#007ebf'}
                                        />
                                    </View>
                                </TouchableOpacity>
                            )}

                            {(bankTrans && bankTrans.length > 0) && (
                                <AnimatedSectionList
                                    scrollEnabled={false}
                                    onScroll={() => {
                                        // const offset = e.nativeEvent.contentOffset.y
                                        // if (offset <= 10) {
                                        //   this.setState({ pointerEvents: 'none' })
                                        // } else {
                                        //   this.setState({ pointerEvents: 'auto' })
                                        // }
                                    }}
                                    pointerEvents={pointerEvents}
                                    onTouchStart={() => {
                                        // this.setState({ enabledScroll: false })
                                    }}
                                    onMomentumScrollEnd={() => {
                                        // this.setState({ enabledScroll: true })
                                    }}
                                    onScrollEndDrag={() => {
                                        // this.setState({ enabledScroll: true })
                                    }}
                                    ref={this.handleSetRef}
                                    nestedScrollEnabled
                                    enableOnAndroid
                                    removeClippedSubviews
                                    stickySectionHeadersEnabled
                                    showsVerticalScrollIndicator={false}
                                    keyboardShouldPersistTaps="handled"
                                    style={{
                                        backgroundColor: 'white',
                                        flex: 1,
                                        position: 'relative',
                                        // maxHeight: Dimensions.get('window').height - STATUS_BAR_HEIGHT - (IS_IOS ? 120 : 130),
                                    }}
                                    contentContainerStyle={[
                                        {
                                            flexGrow: 1,
                                            paddingTop: 0,
                                            paddingBottom: 0,
                                        }]}
                                    sections={bankTrans}
                                    ListHeaderComponent={this.renderFakeHeader}
                                    renderItem={this._renderItem}
                                    renderSectionHeader={this.renderDetailsDataSectionHeader}
                                    ItemSeparatorComponent={this.renderItemSeparator}
                                    keyExtractor={(item) => item.bankTransId}
                                    scrollEventThrottle={16}
                                    initialNumToRender={100}
                                    windowSize={20}
                                />
                            )}

                            {(bankTrans && bankTrans.length === 0) && (
                                <View style={{
                                    marginVertical: 10,
                                }}>
                                    <View style={{
                                        alignSelf: 'center',
                                    }}>
                                        <CustomIcon
                                            name={'bank-alt'}
                                            size={60}
                                            color={colors.blue8}
                                        />
                                    </View>
                                    <View style={[
                                        styles.errorWrapper, {
                                            marginVertical: 10,
                                        }]}>
                                        <View style={[
                                            styles.errorDivider,
                                            {backgroundColor: colors.blue32}]}/>
                                        <Text
                                            style={[
                                                styles.errorText,
                                                {color: colors.blue32}]}>{'לא נמצאו תנועות'}</Text>
                                        <View style={[
                                            styles.errorDivider,
                                            {backgroundColor: colors.blue32}]}/>
                                    </View>
                                </View>
                            )}
                        </View>
                    </Animated.ScrollView>

                    <Animated.View
                        onLayout={this.handleSetHeaderHeight}
                        style={[styles.navbar]}>
                        <View style={{
                            elevation: 5,
                            zIndex: 5,
                            width: '100%',
                        }}>
                            <Text style={styles.bankAccountTitle}>{t(
                                'mainMenu:overview')}</Text>
                            <View style={{
                                backgroundColor: '#022258',
                                height: 48,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                {this.accountTitle}
                            </View>
                        </View>
                    </Animated.View>

                    {(alertDetailsIsOpen && !IS_IOS) && (
                        <AccountAlertDetails
                            alertState={alertState}
                            isRtl={isRtl}
                            top={180}
                            accounts={(this.xAccountsExceeded)
                                ? this.selectedDeviantAccounts
                                : ((cashFlowAggregatedData && accounts)
                                    ? accounts.filter(a => cashFlowAggregatedData.filter(
                                        a => a.accountUuid !== null && a.harigaDate !==
                                            null)
                                        .map((b) => b.accountUuid)
                                        .includes(a.companyAccountId))
                                    : [])}
                            onSelectAccount={this.linkToPageCASHFLOW}
                            onClose={this.handleToggleAlertDetails}
                        />
                    )}

                    {accountsModalIsOpen && (accounts && accounts.length > 1) && (
                        <AccountsModal
                            isOpen
                            isRtl={isRtl}
                            accountGroups={accountGroups}
                            onClose={this.handleCloseSelectedAccounts}
                            onSubmit={this.handleApplySelectedAccounts}
                            onSelectAccounts={this.handleSelectAccounts}
                            selectedAccountIds={selectedAccountIds}
                            selectedGroup={selectedGroup}
                        />
                    )}

                    {calendarModalIsOpen && (
                        <CalendarModal
                            t={t}
                            dateFrom={dateFrom}
                            dateTill={dateTill}
                            onClose={this.setDatesCalendarClose}
                            onSetDates={this.onSetDates}
                            isRtl={isRtl}
                        />
                    )}

                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={dataPopUpDetails !== false}>
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
                                            {
                                                flex: 1,
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                            }],
                                        commonStyles.rowReverse,
                                    )}>
                                        <View style={{
                                            flex: 15,
                                        }}/>
                                        <View style={{
                                            alignItems: 'center',
                                            flex: 70,
                                            alignSelf: 'center',
                                        }}>
                                            <Text style={{
                                                fontSize: sp(20),
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                            }}>
                                                {typePie === 'PAYMENT_DESC'
                                                    ? (this.props.searchkey &&
                                                    this.props.searchkey.length >
                                                    0 &&
                                                    this.props.searchkey.length >
                                                    0 && this.props.searchkey.find(
                                                        (it) => it.paymentDescription ===
                                                            dataPopUpDetails.description)
                                                        ? this.props.searchkey.find(
                                                            (it) => it.paymentDescription ===
                                                                dataPopUpDetails.description).name
                                                        : '')
                                                    : dataPopUpDetails.description}
                                            </Text>
                                        </View>
                                        <View style={{
                                            flex: 15,
                                            alignSelf: 'center',
                                        }}>
                                            <TouchableOpacity
                                                onPress={this.hideModalDetails}>
                                                <View style={{
                                                    alignSelf: 'flex-end',
                                                    alignContent: 'flex-end',
                                                    alignItems: 'flex-end',
                                                    justifyContent: 'flex-end',
                                                }}>
                                                    <Icon name="chevron-right"
                                                          size={24}
                                                          color={colors.white}/>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <View style={{
                                    width: '100%',
                                    height: '100%',
                                    marginTop: 0,
                                    marginBottom: 0,
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                    flex: 1,
                                }}>
                                    <FlatList
                                        ListEmptyComponent={progressModalDetails ?
                                            <ActivityIndicator color="#999999"/> :
                                            <View/>}
                                        ListHeaderComponent={this.renderHeaderModalDetails}
                                        // extraData={this.state}
                                        bounces
                                        bouncesZoom
                                        enableOnAndroid
                                        removeClippedSubviews
                                        showsVerticalScrollIndicator={false}
                                        keyboardShouldPersistTaps="handled"
                                        scrollEnabled
                                        style={[
                                            {
                                                backgroundColor: 'white',
                                                flex: 1,
                                                position: 'relative',
                                            }]}
                                        contentContainerStyle={[
                                            {
                                                backgroundColor: 'white',
                                                flexGrow: 1,
                                                zIndex: 9,
                                                width: '100%',
                                                paddingBottom: 12,
                                            }]}
                                        scrollEventThrottle={IS_IOS ? 16 : 1}
                                        data={dataPopUpDetails.transes}
                                        renderItem={this.renderItemModalDetails}
                                        ItemSeparatorComponent={this.renderItemSeparatorModalDetails}
                                        keyExtractor={(item, index) => item.transId}
                                        initialNumToRender={55}
                                        windowSize={5}
                                    /></View>
                            </View>
                        </SafeAreaView>
                    </Modal>

                    {loanModalIsOpen && (
                        <Modal
                            animationType="slide"
                            transparent={false}
                            visible
                            onRequestClose={() => {
                                // //console.log('Modal has been closed.')
                            }}>

                            <Modal
                                animationType="slide"
                                transparent={false}
                                visible={showLoanRowModal}
                                onRequestClose={() => {
                                    // //console.log('Modal has been closed.')
                                }}>

                                <Modal
                                    animationType="slide"
                                    transparent={false}
                                    visible={deleteLoanModal}
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
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <View style={cs(
                                                    isRtl,
                                                    [
                                                        {
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                        }],
                                                    commonStyles.rowReverse,
                                                )}>
                                                    <View style={{
                                                        flex: 15,
                                                        alignSelf: 'center',
                                                    }}>
                                                        <TouchableOpacity
                                                            onPress={this.setStates(
                                                                {deleteLoanModal: false})}>
                                                            <Text style={{
                                                                fontSize: sp(16),
                                                                color: '#ffffff',
                                                                fontFamily: fonts.semiBold,
                                                            }}>{'ביטול'}</Text>
                                                        </TouchableOpacity>
                                                    </View>
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
                                                            {'הסרת הלוואה'}
                                                        </Text>
                                                    </View>
                                                    <View style={{
                                                        flex: 15,
                                                    }}/>
                                                </View>
                                            </View>

                                            <View style={{
                                                width: '80%',
                                                height: '100%',
                                                marginTop: 44,
                                                marginBottom: 10,
                                                paddingLeft: 0,
                                                paddingRight: 10,
                                                flex: 1,
                                            }}>
                                                <View style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        marginBottom: 10,
                                                        marginTop: 10,
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'center',
                                                    }]}>
                                                    <Image
                                                        style={[
                                                            styles.imgIcon, {
                                                                width: 44,
                                                                height: 38.5,
                                                                marginHorizontal: 10,
                                                            }]}
                                                        source={require(
                                                            'BiziboxUI/assets/alertIcon.png')}
                                                    />
                                                </View>
                                                <View>
                                                    <Text style={{
                                                        color: '#0f3861',
                                                        fontSize: sp(18),
                                                        lineHeight: 42,
                                                        fontFamily: fonts.bold,
                                                        textAlign: 'center',
                                                    }}>
                                                        שימו לב!
                                                    </Text>
                                                </View>

                                                <View>
                                                    <Text style={{
                                                        color: '#063c63',
                                                        fontSize: sp(16),
                                                        lineHeight: 26,
                                                        fontFamily: fonts.regular,
                                                        textAlign: 'center',
                                                    }}>
                                                        {'ההלוואה'} {loanRow.loanName} {'תוסר מהמערכת ללא אפשרות שיחזור, האם להמשיך?'}
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'center',
                                                    marginVertical: 35,
                                                }}>
                                                    <TouchableOpacity style={[
                                                        {
                                                            alignItems: 'center',
                                                            alignSelf: 'center',
                                                            alignContent: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: '#0f3860',
                                                            borderRadius: 5,
                                                            width: 223,
                                                            height: 40,
                                                        }]} onPress={this.setStates(
                                                        {deleteLoanModal: false})}>
                                                        <Text style={{
                                                            color: '#ffffff',
                                                            fontSize: sp(17),
                                                            fontFamily: fonts.semiBold,
                                                            textAlign: 'center',
                                                        }}>{'ביטול'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View>
                                                    <TouchableOpacity
                                                        onPress={this.deleteRowLoan}>
                                                        <Text style={[
                                                            styles.link, {
                                                                color: '#2aa1d9',
                                                                fontSize: sp(16),
                                                                fontFamily: fonts.regular,
                                                                textAlign: 'center',
                                                            }]}>
                                                            {'הסרת הלוואה'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </SafeAreaView>

                                </Modal>

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
                                            alignItems: 'center',
                                            alignSelf: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <View style={cs(
                                                isRtl,
                                                [
                                                    {
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                    }],
                                                commonStyles.rowReverse,
                                            )}>
                                                <View style={{
                                                    flex: 15,
                                                    alignItems: 'flex-end',
                                                    alignSelf: 'flex-end',
                                                    alignContent: 'flex-end',
                                                    justifyContent: 'flex-end',
                                                }}>
                                                    <TouchableOpacity
                                                        onPress={this.setStates(
                                                            {showLoanRowModal: false})}>
                                                        <View>
                                                            <Icon
                                                                name="chevron-right"
                                                                size={24}
                                                                color={colors.white}/>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{
                                                    alignItems: 'center',
                                                    flex: 70,
                                                    alignSelf: 'center',
                                                }}>
                                                    <Text style={{
                                                        fontSize: sp(20),
                                                        color: '#ffffff',
                                                        fontFamily: fonts.semiBold,
                                                    }}>
                                                        {loanRow.loanName}
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    flex: 15,
                                                }}/>
                                            </View>
                                        </View>

                                        <View style={{
                                            width: '100%',
                                            height: '100%',
                                            marginTop: 44,
                                            marginBottom: 10,
                                            paddingLeft: 0,
                                            paddingRight: 0,
                                        }}>

                                            <View style={[
                                                cs(isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    width: '90%',
                                                    marginTop: 0,
                                                    marginBottom: 5,
                                                    paddingBottom: 5,
                                                    paddingLeft: 0,
                                                    paddingRight: 0,
                                                    borderBottomColor: '#ddd',
                                                    borderBottomWidth: 1,
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'space-between',
                                                }]}>
                                                <View style={{flex: 4.5}}>
                                                    <View
                                                        style={[
                                                            cs(isRtl,
                                                                commonStyles.row,
                                                                [commonStyles.rowReverse]),
                                                            {
                                                                height: 30,
                                                                marginBottom: 3,
                                                                // alignItems: 'center',
                                                                // alignSelf: 'center',
                                                                // alignContent: 'center',
                                                                justifyContent: 'space-between',
                                                            }]}>
                                                        <View style={{}}>
                                                            <Text style={{
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 30,
                                                                fontFamily: fonts.regular,
                                                                textAlign: 'right',
                                                            }}>מספר חשבון</Text>
                                                        </View>
                                                        <View style={{}}>
                                                            {loanRow.companyAccountId &&
                                                            (
                                                                <View
                                                                    style={[
                                                                        cs(!isRtl,
                                                                            commonStyles.row,
                                                                            [commonStyles.rowReverse]),
                                                                        {
                                                                            flexDirection: 'row-reverse',
                                                                            justifyContent: 'flex-end',
                                                                            alignItems: 'center',
                                                                        }]}>
                                                                    <AccountIcon
                                                                        account={accounts.find(
                                                                            a => a.companyAccountId ===
                                                                                loanRow.companyAccountId)}/>
                                                                    <View
                                                                        style={commonStyles.spaceDivider}/>
                                                                    <Text style={{
                                                                        fontFamily: fonts.regular,
                                                                        textAlign: 'left',
                                                                        color: '#063c63',
                                                                        fontSize: sp(
                                                                            15),
                                                                        lineHeight: 30,
                                                                    }}>{loanRow.bankAccountId}</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={[
                                                            cs(isRtl,
                                                                commonStyles.row,
                                                                [commonStyles.rowReverse]),
                                                            {
                                                                height: 30,
                                                                marginBottom: 3,
                                                                // alignItems: 'center',
                                                                // alignSelf: 'center',
                                                                // alignContent: 'center',
                                                                justifyContent: 'space-between',
                                                            }]}>
                                                        <View style={{}}>
                                                            <Text style={{
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 30,
                                                                fontFamily: fonts.regular,
                                                                textAlign: 'right',
                                                            }}>תאריך התחלה</Text>
                                                        </View>
                                                        <View style={{}}>
                                                            <Text style={{
                                                                fontFamily: fonts.regular,
                                                                textAlign: 'left',
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 30,
                                                            }}>{AppTimezone.moment(
                                                                loanRow.loanDate)
                                                                .format(
                                                                    'DD/MM/YY')}</Text>
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={[
                                                            cs(isRtl,
                                                                commonStyles.row,
                                                                [commonStyles.rowReverse]),
                                                            {
                                                                height: 30,
                                                                marginBottom: 3,
                                                                // alignItems: 'center',
                                                                // alignSelf: 'center',
                                                                // alignContent: 'center',
                                                                justifyContent: 'space-between',
                                                            }]}>
                                                        <View style={{}}>
                                                            <Text style={{
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 30,
                                                                fontFamily: fonts.regular,
                                                                textAlign: 'right',
                                                            }}>תאריך סיום</Text>
                                                        </View>
                                                        <View style={{}}>
                                                            <Text style={{
                                                                fontFamily: fonts.regular,
                                                                textAlign: 'left',
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 30,
                                                            }}>{AppTimezone.moment(
                                                                loanRow.loanFinish)
                                                                .format(
                                                                    'DD/MM/YY')}</Text>
                                                        </View>
                                                    </View>
                                                    <View
                                                        style={[
                                                            cs(isRtl,
                                                                commonStyles.row,
                                                                [commonStyles.rowReverse]),
                                                            {
                                                                height: 30,
                                                                marginBottom: 3,
                                                                // alignItems: 'center',
                                                                // alignSelf: 'center',
                                                                // alignContent: 'center',
                                                                justifyContent: 'space-between',
                                                            }]}>
                                                        <View style={{}}>
                                                            <Text style={{
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 30,
                                                                fontFamily: fonts.regular,
                                                                textAlign: 'right',
                                                            }}>ריבית שנתית</Text>
                                                        </View>
                                                        <View style={{}}>
                                                            <Text style={{
                                                                fontFamily: fonts.regular,
                                                                textAlign: 'left',
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 30,
                                                            }}>{loanRow.loanIntrest}{'%'}</Text>
                                                        </View>
                                                    </View>

                                                </View>

                                                <View style={{
                                                    flex: 3,
                                                    alignItems: 'flex-end',
                                                    alignContent: 'center',
                                                    alignSelf: 'center',
                                                    justifyContent: 'center',
                                                }}>
                                                    <View style={{
                                                        flexDirection: 'row',
                                                        alignSelf: 'flex-start',
                                                        flex: 1,
                                                        height: 120,
                                                        width: 120,
                                                        alignItems: 'center',
                                                        marginTop: 5,
                                                    }}>
                                                        <PieChart
                                                            spacing={0}
                                                            style={{
                                                                zIndex: 2,
                                                                top: 0,
                                                                height: 120,
                                                                width: 120,
                                                                position: 'absolute',
                                                                left: 0,
                                                            }}
                                                            outerRadius={'90%'}
                                                            innerRadius={'70%'}
                                                            data={[
                                                                {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 1,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 2,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 3,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 4,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 5,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 6,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 7,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 8,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 9,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 10,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 11,
                                                                }, {
                                                                    prc: 1,
                                                                    active: ((loanRow.loanPayments -
                                                                        loanRow.paymentsNumberLeft) /
                                                                        (loanRow.loanPayments /
                                                                            12)) >= 12,
                                                                }].map(
                                                                (key, index) => {
                                                                    return {
                                                                        value: key.prc,
                                                                        key: `pie-${index}`,
                                                                        prc: key.prc,
                                                                        svg: {
                                                                            fill: !key.active
                                                                                ? '#cee8e9'
                                                                                : '#29c2c7',
                                                                        },
                                                                        arc: {
                                                                            outerRadius: 100 +
                                                                                '%',
                                                                            padAngle: 0.01,
                                                                        },
                                                                    }
                                                                })}/>
                                                        <View style={{
                                                            position: 'absolute',
                                                            width: 120,
                                                            left: 0,
                                                            top: 51,
                                                            zIndex: 9,
                                                        }}>
                                                            <Text
                                                                style={{
                                                                    textAlign: 'center',
                                                                    color: '#29c2c7',
                                                                    fontFamily: fonts.bold,
                                                                    fontSize: sp(16),
                                                                }}>
                                                                {`${loanRow.loanPayments -
                                                                loanRow.paymentsNumberLeft}/${loanRow.loanPayments}`}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            </View>

                                            <View style={{
                                                width: '70%',
                                                marginTop: 5,
                                                marginBottom: 5,
                                                paddingLeft: 0,
                                                paddingRight: 0,
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <View style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 42,
                                                        marginBottom: 3,
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'space-between',
                                                    }]}>
                                                    <View style={{
                                                        flex: 2.5,
                                                        alignItems: 'flex-end',
                                                    }}>
                                                        <Text style={{
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'right',
                                                        }}>סכום הלוואה</Text>
                                                    </View>
                                                    <View style={{
                                                        flex: 2,
                                                    }}>
                                                        <Text style={{
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'left',
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                        }}>{getFormattedValueArray(
                                                            loanRow.loanOriginalTotal)[0]}</Text>
                                                    </View>
                                                </View>
                                                <View style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 42,
                                                        marginBottom: 3,
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'space-between',
                                                    }]}>
                                                    <View style={{
                                                        flex: 2.5,
                                                        alignItems: 'flex-end',
                                                    }}>
                                                        <Text style={{
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                            fontFamily: fonts.bold,
                                                            textAlign: 'right',
                                                        }}>יתרה לסיום</Text>
                                                    </View>
                                                    <View style={{
                                                        flex: 2,
                                                    }}>
                                                        <Text style={{
                                                            fontFamily: fonts.bold,
                                                            textAlign: 'left',
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                        }}>{getFormattedValueArray(
                                                            loanRow.loanTotalLeft)[0]}</Text>
                                                    </View>
                                                </View>
                                                <View style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 42,
                                                        marginBottom: 3,
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'space-between',
                                                    }]}>
                                                    <View style={{
                                                        flex: 2.5,
                                                        alignItems: 'flex-end',
                                                    }}>
                                                        <Text style={{
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'right',
                                                        }}>תשלומים</Text>
                                                    </View>
                                                    <View style={{
                                                        flex: 2,
                                                    }}>
                                                        <Text style={{
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'left',
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                        }}>{loanRow.loanPayments}</Text>
                                                    </View>
                                                </View>
                                                <View style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 42,
                                                        marginBottom: 3,
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'space-between',
                                                    }]}>
                                                    <View style={{
                                                        flex: 2.5,
                                                        alignItems: 'flex-end',
                                                    }}>
                                                        <Text style={{
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                            fontFamily: fonts.bold,
                                                            textAlign: 'right',
                                                        }}>תשלומים שנותרו</Text>
                                                    </View>
                                                    <View style={{
                                                        flex: 2,
                                                    }}>
                                                        <Text style={{
                                                            fontFamily: fonts.bold,
                                                            textAlign: 'left',
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                        }}>{loanRow.paymentsNumberLeft}</Text>
                                                    </View>
                                                </View>
                                                <View style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 42,
                                                        marginBottom: 3,
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'space-between',
                                                    }]}>
                                                    <View style={{
                                                        flex: 2.5,
                                                        alignItems: 'flex-end',
                                                    }}>
                                                        <Text style={{
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'right',
                                                        }}>סכום התשלום הבא</Text>
                                                    </View>
                                                    <View style={{
                                                        flex: 2,
                                                    }}>
                                                        <Text style={{
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'left',
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                        }}>{getFormattedValueArray(
                                                            loanRow.nextPaymentTotal)[0]}</Text>
                                                    </View>
                                                </View>
                                                <View style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 42,
                                                        marginBottom: 3,
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'space-between',
                                                    }]}>
                                                    <View style={{
                                                        flex: 2.5,
                                                        alignItems: 'flex-end',
                                                    }}>
                                                        <Text style={{
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'right',
                                                        }}>תאריך התשלום הבא</Text>
                                                    </View>
                                                    <View style={{
                                                        flex: 2,
                                                    }}>
                                                        <Text style={{
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'left',
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                        }}>{AppTimezone.moment(
                                                            loanRow.loanNextPaymentDate)
                                                            .format(
                                                                'DD/MM/YY')}</Text>
                                                    </View>
                                                </View>

                                                <View style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 42,
                                                        marginTop: 20,
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'center',
                                                    }]}>
                                                    <Text style={{
                                                        color: '#063c63',
                                                        fontSize: sp(15),
                                                        lineHeight: 42,
                                                        fontFamily: fonts.regular,
                                                    }}>
                                                        ההלוואה נפדתה?
                                                    </Text>
                                                    <Text>{' '}</Text>
                                                    <TouchableOpacity
                                                        onPress={this.setStates(
                                                            {deleteLoanModal: true})}>
                                                        <Text style={{
                                                            color: '#2aa1d9',
                                                            fontSize: sp(15),
                                                            lineHeight: 42,
                                                            fontFamily: fonts.regular,
                                                        }}>
                                                            הסרה מהמערכת
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>

                                    </View>
                                </SafeAreaView>
                            </Modal>

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
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <View style={cs(
                                            isRtl,
                                            [
                                                {
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                }],
                                            commonStyles.rowReverse,
                                        )}>
                                            <View style={{
                                                flex: 15,
                                            }}/>
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
                                                    {'פרטי הלוואות'}
                                                </Text>
                                            </View>
                                            <View style={{
                                                flex: 15,
                                                alignSelf: 'center',
                                            }}>
                                                <TouchableOpacity
                                                    onPress={this.setStates({
                                                        loanRow: {},
                                                        loanModalIsOpen: false,
                                                    })}>
                                                    <Text style={{
                                                        fontSize: sp(16),
                                                        color: '#ffffff',
                                                        fontFamily: fonts.semiBold,
                                                    }}>סגירה</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{
                                        width: '95%',
                                        height: '100%',
                                        marginTop: 0,
                                        marginBottom: 0,
                                        paddingLeft: 5,
                                        paddingRight: 5,
                                        flex: 1,
                                    }}>
                                        <View>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontFamily: fonts.bold,
                                                fontSize: sp(18),
                                                lineHeight: 40,
                                                textAlign: 'right',
                                            }}>
                                                {'נמצאו'} {loans.length} {'הלוואות'}
                                            </Text>
                                        </View>
                                        <ScrollView>
                                            {loans && loans.length > 0 &&
                                            loans.map((item, index) => {
                                                return (
                                                    <TouchableOpacity
                                                        key={index.toString()}
                                                        style={[
                                                            cs(!isRtl, commonStyles.row,
                                                                [commonStyles.rowReverse]),
                                                            {
                                                                flex: 1,
                                                                flexDirection: 'row-reverse',
                                                                justifyContent: 'flex-end',
                                                                alignItems: 'center',
                                                            }]}
                                                        onPress={this.setStates({
                                                            loanRow: item,
                                                            showLoanRowModal: true,
                                                        })}>
                                                        <View style={{
                                                            flex: 16,
                                                            alignItems: 'flex-end',
                                                        }}>
                                                            <Text style={{
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 50,
                                                            }}>{item.loanName}</Text>
                                                        </View>
                                                        <View style={{
                                                            flex: 4,
                                                            alignItems: 'flex-end',
                                                        }}>
                                                            <Text style={{
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 50,
                                                            }}>{item.loanIntrest}{'%'}</Text>
                                                        </View>
                                                        <View style={{
                                                            marginRight: 'auto',
                                                        }}>
                                                            <Icon name="chevron-left"
                                                                  size={24}
                                                                  color={colors.blue34}/>
                                                        </View>

                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </ScrollView>
                                    </View>
                                </View>
                            </SafeAreaView>
                        </Modal>
                    )}

                    {depositModalIsOpen && (
                        <Modal
                            animationType="slide"
                            transparent={false}
                            visible
                            onRequestClose={() => {
                                // //console.log('Modal has been closed.')
                            }}>

                            <Modal
                                animationType="slide"
                                transparent={false}
                                visible={showDepositRowModal}
                                onRequestClose={() => {
                                    // //console.log('Modal has been closed.')
                                }}>
                                <Modal
                                    animationType="slide"
                                    transparent={false}
                                    visible={deleteDepositModal}
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
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <View style={cs(
                                                    isRtl,
                                                    [
                                                        {
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                        }],
                                                    commonStyles.rowReverse,
                                                )}>
                                                    <View style={{
                                                        flex: 15,
                                                        alignSelf: 'center',
                                                    }}>
                                                        <TouchableOpacity
                                                            onPress={this.setStates(
                                                                {deleteDepositModal: false})}>
                                                            <Text style={{
                                                                fontSize: sp(16),
                                                                color: '#ffffff',
                                                                fontFamily: fonts.semiBold,
                                                            }}>{'ביטול'}</Text>
                                                        </TouchableOpacity>
                                                    </View>
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
                                                            {'הסרת פיקדון'}
                                                        </Text>
                                                    </View>
                                                    <View style={{
                                                        flex: 15,
                                                    }}/>
                                                </View>
                                            </View>

                                            <View style={{
                                                width: '80%',
                                                height: '100%',
                                                marginTop: 44,
                                                marginBottom: 10,
                                                paddingLeft: 0,
                                                paddingRight: 10,
                                                flex: 1,
                                            }}>
                                                <View style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        marginBottom: 10,
                                                        marginTop: 10,
                                                        alignItems: 'center',
                                                        alignSelf: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'center',
                                                    }]}>
                                                    <Image
                                                        style={[
                                                            styles.imgIcon, {
                                                                width: 44,
                                                                height: 38.5,
                                                                marginHorizontal: 10,
                                                            }]}
                                                        source={require(
                                                            'BiziboxUI/assets/alertIcon.png')}
                                                    />
                                                </View>
                                                <View>
                                                    <Text style={{
                                                        color: '#0f3861',
                                                        fontSize: sp(18),
                                                        lineHeight: 42,
                                                        fontFamily: fonts.bold,
                                                        textAlign: 'center',
                                                    }}>
                                                        שימו לב!
                                                    </Text>
                                                </View>

                                                <View>
                                                    <Text style={{
                                                        color: '#063c63',
                                                        fontSize: sp(16),
                                                        lineHeight: 26,
                                                        fontFamily: fonts.regular,
                                                        textAlign: 'center',
                                                    }}>
                                                        {'הפיקדון'} {depositRow.typeName} {'יוסר מהמערכת ללא אפשרות שיחזור, האם להמשיך?'}
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'center',
                                                    marginVertical: 35,
                                                }}>
                                                    <TouchableOpacity style={[
                                                        {
                                                            alignItems: 'center',
                                                            alignSelf: 'center',
                                                            alignContent: 'center',
                                                            justifyContent: 'center',
                                                            backgroundColor: '#0f3860',
                                                            borderRadius: 5,
                                                            width: 223,
                                                            height: 40,
                                                        }]} onPress={this.setStates(
                                                        {deleteDepositModal: false})}>
                                                        <Text style={{
                                                            color: '#ffffff',
                                                            fontSize: sp(17),
                                                            fontFamily: fonts.semiBold,
                                                            textAlign: 'center',
                                                        }}>{'ביטול'}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                <View>
                                                    <TouchableOpacity
                                                        onPress={this.deleteRowDeposit}>
                                                        <Text style={[
                                                            styles.link, {
                                                                color: '#2aa1d9',
                                                                fontSize: sp(16),
                                                                fontFamily: fonts.regular,
                                                                textAlign: 'center',
                                                            }]}>
                                                            {'הסרת פיקדון'}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </View>
                                    </SafeAreaView>
                                </Modal>

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
                                            alignItems: 'center',
                                            alignSelf: 'center',
                                            alignContent: 'center',
                                            justifyContent: 'center',
                                        }}>
                                            <View style={cs(
                                                isRtl,
                                                [
                                                    {
                                                        flexDirection: 'row',
                                                        justifyContent: 'space-between',
                                                    }],
                                                commonStyles.rowReverse,
                                            )}>
                                                <View style={{
                                                    flex: 15,
                                                    alignItems: 'flex-end',
                                                    alignSelf: 'flex-end',
                                                    alignContent: 'flex-end',
                                                    justifyContent: 'flex-end',
                                                }}>
                                                    <TouchableOpacity
                                                        onPress={this.setStates(
                                                            {showDepositRowModal: false})}>
                                                        <View>
                                                            <Icon
                                                                name="chevron-right"
                                                                size={24}
                                                                color={colors.white}/>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                                <View style={{
                                                    alignItems: 'center',
                                                    flex: 70,
                                                    alignSelf: 'center',
                                                }}>
                                                    <Text style={{
                                                        fontSize: sp(20),
                                                        color: '#ffffff',
                                                        fontFamily: fonts.semiBold,
                                                    }}>
                                                        {depositRow.typeName}
                                                    </Text>
                                                </View>
                                                <View style={{
                                                    flex: 15,
                                                }}/>
                                            </View>
                                        </View>

                                        <View style={{
                                            width: '70%',
                                            height: '100%',
                                            marginTop: 44,
                                            marginBottom: 10,
                                            paddingLeft: 0,
                                            paddingRight: 0,
                                            flex: 1,
                                        }}>
                                            <View style={[
                                                cs(isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    marginBottom: 10,
                                                    marginTop: 10,
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'center',
                                                }]}>
                                                <CustomIcon
                                                    name={'deposits'}
                                                    size={80}
                                                    color={colors.blue8}
                                                />
                                            </View>
                                            <View style={[
                                                cs(isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginBottom: 3,
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'space-between',
                                                }]}>
                                                <View style={{
                                                    flex: 2.5,
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <Text style={{
                                                        color: '#063c63',
                                                        fontSize: sp(17),
                                                        lineHeight: 42,
                                                        fontFamily: fonts.regular,
                                                        textAlign: 'right',
                                                    }}>מספר חשבון</Text>
                                                </View>
                                                <View style={{
                                                    flex: 2,
                                                }}>
                                                    {depositRow.companyAccountId &&
                                                    (
                                                        <Text style={{
                                                            fontFamily: fonts.regular,
                                                            textAlign: 'left',
                                                            color: '#063c63',
                                                            fontSize: sp(17),
                                                            lineHeight: 42,
                                                        }}>{t(
                                                            `bankName:${accounts.find(
                                                                a => a.companyAccountId ===
                                                                    depositRow.companyAccountId).bankId}`)} {depositRow.bankAccountId}</Text>)}
                                                </View>
                                            </View>
                                            <View style={[
                                                cs(isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginBottom: 3,
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'space-between',
                                                }]}>
                                                <View style={{
                                                    flex: 2.5,
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <Text style={{
                                                        color: '#063c63',
                                                        fontSize: sp(17),
                                                        lineHeight: 42,
                                                        fontFamily: fonts.semiBold,
                                                        textAlign: 'right',
                                                    }}>סכום הפיקדון</Text>
                                                </View>
                                                <View style={{
                                                    flex: 2,
                                                }}>
                                                    <Text style={{
                                                        fontFamily: fonts.semiBold,
                                                        textAlign: 'left',
                                                        color: '#063c63',
                                                        fontSize: sp(17),
                                                    }}>{getFormattedValueArray(
                                                        depositRow.depositAsTotal)[0]}</Text>
                                                </View>
                                            </View>
                                            <View style={[
                                                cs(isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginBottom: 3,
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'space-between',
                                                }]}>
                                                <View style={{
                                                    flex: 2.5,
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <Text style={{
                                                        color: '#063c63',
                                                        fontSize: sp(17),
                                                        lineHeight: 42,
                                                        fontFamily: fonts.regular,
                                                        textAlign: 'right',
                                                    }}>תאריך הפקדה</Text>
                                                </View>
                                                <View style={{
                                                    flex: 2,
                                                }}>
                                                    <Text style={{
                                                        fontFamily: fonts.regular,
                                                        textAlign: 'left',
                                                        color: '#063c63',
                                                        fontSize: sp(17),
                                                    }}>{AppTimezone.moment(
                                                        depositRow.depositDate)
                                                        .format('DD/MM/YY')}</Text>
                                                </View>
                                            </View>
                                            <View style={[
                                                cs(isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginBottom: 3,
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'space-between',

                                                }]}>
                                                <View style={{
                                                    flex: 2.5,
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <Text style={{
                                                        color: '#063c63',
                                                        fontSize: sp(17),
                                                        lineHeight: 42,
                                                        fontFamily: fonts.regular,
                                                        textAlign: 'right',
                                                    }}>תאריך פרעון</Text>
                                                </View>
                                                <View style={{
                                                    flex: 2,
                                                }}>
                                                    <Text style={{
                                                        fontFamily: fonts.regular,
                                                        textAlign: 'left',
                                                        color: '#063c63',
                                                        fontSize: sp(17),
                                                    }}>{AppTimezone.moment(
                                                        depositRow.dueDate)
                                                        .format('DD/MM/YY')}</Text>
                                                </View>
                                            </View>

                                            <View style={[
                                                cs(isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginBottom: 3,
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'space-between',

                                                }]}>
                                                <View style={{
                                                    flex: 2.5,
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <Text style={{
                                                        color: '#063c63',
                                                        fontSize: sp(17),
                                                        lineHeight: 42,
                                                        fontFamily: fonts.regular,
                                                        textAlign: 'right',
                                                    }}>תאריך יציאה קרוב</Text>
                                                </View>
                                                <View style={{
                                                    flex: 2,
                                                }}>
                                                    <Text style={{
                                                        fontFamily: fonts.regular,
                                                        textAlign: 'left',
                                                        color: '#063c63',
                                                        fontSize: sp(17),
                                                    }}>{AppTimezone.moment(
                                                        depositRow.depositExistStation)
                                                        .format('DD/MM/YY')}</Text>
                                                </View>
                                            </View>

                                            <View style={[
                                                cs(isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginTop: 40,
                                                    alignItems: 'center',
                                                    alignSelf: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'center',
                                                }]}>
                                                <Text style={{
                                                    color: '#063c63',
                                                    fontSize: sp(15),
                                                    lineHeight: 42,
                                                    fontFamily: fonts.regular,
                                                }}>
                                                    הפיקדון נפרע?
                                                </Text>
                                                <Text>{' '}</Text>
                                                <TouchableOpacity
                                                    onPress={this.setStates(
                                                        {deleteDepositModal: true})}>
                                                    <Text style={{
                                                        color: '#2aa1d9',
                                                        fontSize: sp(15),
                                                        lineHeight: 42,
                                                        fontFamily: fonts.regular,
                                                    }}>
                                                        הסרה מהמערכת
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    </View>
                                </SafeAreaView>
                            </Modal>

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
                                        alignItems: 'center',
                                        alignSelf: 'center',
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                    }}>
                                        <View style={cs(
                                            isRtl,
                                            [
                                                {
                                                    flexDirection: 'row',
                                                    justifyContent: 'space-between',
                                                }],
                                            commonStyles.rowReverse,
                                        )}>
                                            <View style={{
                                                flex: 15,
                                            }}/>
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
                                                    {'פרטי פיקדונות'}
                                                </Text>
                                            </View>
                                            <View style={{
                                                flex: 15,
                                                alignSelf: 'center',
                                            }}>
                                                <TouchableOpacity
                                                    onPress={this.setStates({
                                                        depositRow: {},
                                                        depositModalIsOpen: false,
                                                    })}>
                                                    <Text style={{
                                                        fontSize: sp(16),
                                                        color: '#ffffff',
                                                        fontFamily: fonts.semiBold,
                                                    }}>סגירה</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </View>

                                    <View style={{
                                        width: '95%',
                                        height: '100%',
                                        marginTop: 0,
                                        marginBottom: 0,
                                        paddingLeft: 5,
                                        paddingRight: 5,
                                        flex: 1,
                                    }}>
                                        <View style={{
                                            paddingTop: 10,
                                        }}>
                                            <Text style={{
                                                color: '#0f3861',
                                                fontFamily: fonts.bold,
                                                fontSize: sp(18),
                                                lineHeight: 40,
                                                textAlign: 'right',
                                            }}>
                                                {'נמצאו'} {deposit.length} {'פיקדונות'}
                                            </Text>
                                        </View>
                                        <ScrollView>
                                            {deposit && deposit.length > 0 &&
                                            deposit.map((item, index) => {
                                                return (
                                                    <TouchableOpacity
                                                        key={index.toString()}
                                                        style={[
                                                            cs(!isRtl, commonStyles.row,
                                                                [commonStyles.rowReverse]),
                                                            {
                                                                flex: 1,
                                                                flexDirection: 'row-reverse',
                                                                justifyContent: 'flex-end',
                                                                alignItems: 'center',
                                                            }]}
                                                        onPress={this.setStates({
                                                            depositRow: item,
                                                            showDepositRowModal: true,
                                                        })}>
                                                        <View style={{
                                                            flex: 8,
                                                            alignItems: 'flex-end',
                                                        }}>
                                                            <Text style={{
                                                                color: '#063c63',
                                                                fontSize: sp(15),
                                                                lineHeight: 50,
                                                            }}>{item.typeName}</Text>
                                                        </View>
                                                        <View style={{
                                                            marginRight: 'auto',
                                                        }}>
                                                            <Icon name="chevron-left"
                                                                  size={24}
                                                                  color={'#063c63'}/>
                                                        </View>

                                                    </TouchableOpacity>
                                                )
                                            })}
                                        </ScrollView>
                                    </View>
                                </View>
                            </SafeAreaView>
                        </Modal>
                    )}

                    {updateTokenModalIsOpen && (
                        <UpdateTokenModal
                            navigation={this.props.navigation}
                            tokenType={'ACCOUNT'}
                            title={t('settings:bankAccountsTab:addBankAccount')}
                            token={currentToken}
                            companyId={currentCompanyId}
                            onClose={this.handleCloseUpdateTokenModal}
                        />
                    )}
                    {lockedModalIsOpen && (
                        <BlockedModal
                            title={'שחרור חסימה'}
                            onClose={this.lockedModalIsOpenClose}
                            onOpenBankSite={this.handleOpenBankSite}
                        />
                    )}
                    <View style={{
                        flexDirection: 'column',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        height: 33.5,
                        width: 33.5,
                        backgroundColor: statusNotValid || this.hasHeaderAlert
                            ? '#ef3636'
                            : '#0addc1',
                        borderRadius: 16.75,
                        position: 'absolute',
                        elevation: 6,
                        zIndex: 60,
                        top: 79,
                        right: 22.5,
                    }}>
                        <Icon
                            name={statusNotValid || this.hasHeaderAlert
                                ? 'exclamation'
                                : 'check'}
                            type={statusNotValid || this.hasHeaderAlert
                                ? 'material-community'
                                : 'feather'}
                            size={20}
                            color={'#ffffff'}
                        />
                    </View>

                    {ALERTS_TRIAL.showAlertPopupCompany && (
                        <Animated.View style={{
                            opacity: fadeAnim,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 999,
                            elevation: 999,
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
                                onPress={this.animatedTime}/>
                            <View style={{
                                marginTop: 55,
                                maxHeight: (Dimensions.get('window').height - 160),
                                height: this.height,
                                width: 348,
                                backgroundColor: '#ffffff',
                                borderRadius: 15,
                                zIndex: 10,
                                shadowColor: '#a0a0a0',
                                shadowOffset: {
                                    width: 0,
                                    height: 0,
                                },
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                                elevation: 2,
                                paddingHorizontal: 10,
                                paddingVertical: 8,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                            }}>
                                <TouchableOpacity
                                    style={{
                                        height: 20,
                                        alignSelf: 'flex-start',
                                    }}
                                    onPress={this.animatedTime}>
                                    <Icon
                                        name="close"
                                        type="material-community"
                                        size={25}
                                        color={'#022258'}
                                    />
                                </TouchableOpacity>

                                <ScrollView
                                    style={{
                                        width: '95%',
                                        height: '100%',
                                        marginTop: 0,
                                        marginBottom: 0,
                                        paddingLeft: 5,
                                        paddingRight: 5,
                                        flex: 1,
                                    }}>
                                    <Text style={{
                                        color: '#0f3860',
                                        fontSize: sp(24),
                                        lineHeight: 26,
                                        fontFamily: fonts.bold,
                                        textAlign: 'center',
                                        marginBottom: 10,
                                    }}>
                                        שימו לב
                                    </Text>
                                    <Text onLayout={(e) => {
                                        const {height} = e.nativeEvent.layout
                                        this.height = height + 100
                                    }} style={{
                                        color: '#0f3860',
                                        fontSize: sp(18),
                                        lineHeight: 20,
                                        fontFamily: fonts.regular,
                                        textAlign: 'center',
                                    }}>
                                        {ALERTS_TRIAL.showAlertPopupCompany}
                                    </Text>
                                </ScrollView>
                            </View>
                        </Animated.View>
                    )}

                    {openPopupAfterUpgrade && (
                        <Animated.View style={{
                            opacity: fadeAnimUpgrade,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 999,
                            elevation: 999,
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
                                onPress={this.animatedTimeSuc}/>
                            <View style={{
                                marginTop: 55,
                                width: 357.5,
                                height: 228,
                                backgroundColor: '#ffffff',
                                borderRadius: 15,
                                zIndex: 10,
                                shadowColor: '#a0a0a0',
                                shadowOffset: {
                                    width: 0,
                                    height: 0,
                                },
                                shadowOpacity: 0.8,
                                shadowRadius: 4,
                                elevation: 2,
                                paddingHorizontal: 0,
                                paddingVertical: 10,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                            }}>

                                <Image
                                    style={[
                                        styles.imgIcon, {
                                            width: 357.5,
                                            height: 228,
                                            position: 'absolute',
                                            bottom: 0,
                                            right: 0,
                                            left: 0,
                                            top: 0,
                                        }]}
                                    source={require(
                                        'BiziboxUI/assets/bgPopUpgrade.png')}
                                />

                                <TouchableOpacity
                                    style={{
                                        height: 20,
                                        alignSelf: 'flex-end',
                                        marginRight: 13,
                                    }}
                                    onPress={this.animatedTimeSuc}>
                                    <Icon
                                        name="close"
                                        type="material-community"
                                        size={25}
                                        color={'#022258'}
                                    />
                                </TouchableOpacity>

                                <View style={{
                                    flexDirection: 'row-reverse',
                                    justifyContent: 'center',
                                    alignItems: 'flex-end',
                                    alignContent: 'center',
                                    alignSelf: 'center',
                                }}>
                                    <Text
                                        style={{
                                            color: '#022258',
                                            fontSize: sp(20),
                                            lineHeight: 42,
                                            fontFamily: fonts.semiBold,
                                        }}>{'ברוכים הבאים ל'}</Text>
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 100.5,
                                                marginRight: 5,
                                            }]}
                                        source={require(
                                            'BiziboxUI/assets/logoUpgrade.png')}
                                    />
                                    <Text style={{
                                        color: '#022258',
                                        fontSize: sp(20),
                                        lineHeight: 42,
                                        fontFamily: fonts.semiBold,
                                    }}>{' לעסקים'}</Text>
                                </View>

                                <Text style={{
                                    color: '#022258',
                                    fontSize: sp(17.5),
                                    fontFamily: fonts.regular,
                                    textAlign: 'center',
                                    marginBottom: 20,
                                    marginTop: 0,
                                }}>
                                    {'הינך צופה במערכת המשודרגת שלך לניהול\n' +
                                    'תזרים מזומנים, נציגנו יצרו איתך קשר להדרכה\n' +
                                    'אישית על המוצר'}
                                </Text>

                                <View style={{
                                    width: 289.5,
                                    height: 1,
                                    backgroundColor: '#022258',
                                    marginBottom: 20,
                                }}/>
                                <View style={{
                                    flexDirection: 'row-reverse',
                                    justifyContent: 'center',
                                    alignItems: 'flex-end',
                                    alignContent: 'center',
                                    alignSelf: 'center',
                                }}>
                                    <Text
                                        style={{
                                            color: '#022258',
                                            fontSize: sp(13.5),
                                            fontFamily: fonts.light,
                                        }}>{'אנחנו מזמינים אותך למרכז העזרה שלנו המופיע תחת'}</Text>
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 8.5,
                                                marginRight: 5,
                                            }]}
                                        source={require(
                                            'BiziboxUI/assets/quPopupUpgrade.png')}
                                    />
                                    <Text style={{
                                        color: '#022258',
                                        fontSize: sp(13.5),
                                        fontFamily: fonts.light,
                                    }}>{' בתפריט'}</Text>
                                </View>
                                <Text style={{
                                    color: '#022258',
                                    textAlign: 'center',
                                    fontSize: sp(13.5),
                                    fontFamily: fonts.light,
                                }}>{'הראשי הכולל סרטונים, שאלות נפוצות, קריאת שירות ומילון מונחים'}</Text>
                            </View>
                        </Animated.View>
                    )}

                    {COMPANY_INFO.biziboxTrialExpired !== false && (
                        <Animated.View style={{
                            opacity: fadeAnimBiziboxTrialExpired,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 999,
                            elevation: 999,
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
                                    zIndex: 999,
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: '#cccccc',
                                    opacity: 0.7,
                                }}
                                onPress={this.animatedTimeBiziboxTrialExpired}/>

                            <View style={{
                                marginTop: 55,
                                width: 715 / 2,
                                height: 342 / 2,
                                backgroundColor: '#ffffff',
                                borderRadius: 5,
                                zIndex: 999,
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
                                                marginBottom: 10,
                                                marginTop: 5,
                                                alignSelf: 'flex-start',
                                                marginLeft: 10,
                                            }}
                                            onPress={this.animatedTimeBiziboxTrialExpired}>
                                            <Icon
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
                                        }}
                                               source={require(
                                                   'BiziboxUI/assets/logoB.png')}/>
                                        <Text
                                            style={{
                                                marginTop: 15,
                                                color: '#022258',
                                                fontSize: sp(17),
                                                lineHeight: 30,
                                                fontFamily: fonts.semiBold,
                                            }}>{'אנחנו שמחים שבחרת להצטרף ל- bizibox לעסקים'}</Text>

                                        <Text
                                            style={{
                                                color: '#022258',
                                                fontSize: sp(17),
                                                lineHeight: 30,
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
                                            <Icon
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
                                                }}>{'נותרו עוד'}</Text>
                                            <Text
                                                style={{
                                                    color: '#022258',
                                                    fontSize: sp(16),
                                                    paddingHorizontal: 3,
                                                    lineHeight: 34,
                                                    fontFamily: fonts.semiBold,
                                                }}>{COMPANY_INFO.biziboxTrialExpired}</Text>
                                            <Text style={{
                                                color: '#022258',
                                                fontSize: sp(16),
                                                lineHeight: 34,
                                                fontFamily: fonts.semiBold,
                                            }}>{'ימים לתום תקופת הניסיון ב- bizibox לעסקים'}</Text>
                                        </View>

                                        <Text style={{
                                            color: '#022258',
                                            fontSize: sp(15),
                                            fontFamily: fonts.regular,
                                            textAlign: 'center',
                                            marginTop: 7,
                                        }}>
                                            {'לידיעתך בסיום חודש הניסיון תועבר חזרה ל- bizibox'}
                                        </Text>

                                        <TouchableOpacity
                                            onPress={this.denyUpgrade}>
                                            <Text style={{
                                                color: '#038ed6',
                                                fontFamily: fonts.regular,
                                                fontSize: sp(14),
                                                textAlign: 'center',
                                                marginTop: 13.5,
                                                marginBottom: 7,
                                            }}>{'אני רוצה לחזור עכשיו'}</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            onPress={this.approveUpgrade}
                                            style={{
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
                                            }}>{'לאישור תשלום'}</Text>
                                        </TouchableOpacity>
                                    </Fragment>
                                )}

                            </View>
                        </Animated.View>
                    )}

                    {showtrialBlocked && COMPANY_INFO.trialBlockedPopup && (
                        <Modal
                            animationType="slide"
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
                                                <Icon
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
                                            }} source={require(
                                                'BiziboxUI/assets/logoB.png')}/>
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
                                                <Icon
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

                    {COMPANY_INFO.biziboxDowngradeDate !== false && (
                        <Animated.View style={{
                            opacity: fadeAnimApproveDowngrade,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 999,
                            elevation: 999,
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
                                    zIndex: 999,
                                    height: '100%',
                                    width: '100%',
                                    backgroundColor: '#cccccc',
                                    opacity: 0.7,
                                }}
                                onPress={this.approveDowngrade}/>

                            <View style={{
                                marginTop: 55,
                                width: 715 / 2,
                                height: 310 / 2,
                                backgroundColor: '#ffffff',
                                borderRadius: 5,
                                zIndex: 999,
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
                                            marginBottom: 0,
                                            marginTop: 5,
                                            alignSelf: 'flex-start',
                                            marginLeft: 10,
                                        }}
                                        onPress={this.approveDowngrade}>
                                        <Icon
                                            name="close"
                                            type="material-community"
                                            size={25}
                                            color={'#022258'}
                                        />
                                    </TouchableOpacity>

                                    <Text
                                        style={{
                                            color: '#022258',
                                            fontSize: sp(18),
                                            paddingHorizontal: 3,
                                            fontFamily: fonts.regular,
                                        }}>{user.userName},</Text>

                                    <Text style={{
                                        color: '#022258',
                                        fontSize: sp(16),
                                        paddingHorizontal: 3,
                                        fontFamily: fonts.regular,
                                        textAlign: 'center',
                                        marginTop: 7,
                                    }}>
                                        {'בהמשך לבקשתכם הנכם מועברים למוצר bizibox'}
                                    </Text>

                                    <TouchableOpacity
                                        onPress={this.approveDowngrade}
                                        style={{
                                            marginTop: 22,
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
                                        }}>{'אישור'}</Text>
                                    </TouchableOpacity>

                                </View>
                            </View>
                        </Animated.View>
                    )}
                    <BottomSheetMutavim navigation={navigation}
                                        dispatch={this.props.dispatch}
                                        company={this.props.companies.find(
                                            acc => acc.companyId ===
                                                this.props.currentCompanyId)}/>
                </View>
            </Fragment>
        )
    }
}
