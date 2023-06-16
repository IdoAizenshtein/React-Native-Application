import React, {Fragment, PureComponent} from 'react'
import {setOpenedBottomSheet} from 'src/redux/actions/user'
import {
    ActivityIndicator,
    Animated,
    BackHandler,
    Dimensions,
    FlatList,
    Image,
    Keyboard,
    Modal,
    RefreshControl,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
    SafeAreaView,
} from 'react-native'
import {connect} from 'react-redux'
import {withTranslation} from 'react-i18next'
import {
    combineStyles as cs,
    getBankTransIcon,
    getCurrencyChar,
    getErrText,
    getFormattedValueArray,
    getTransCategoryIcon,
    goToBack,
    sp,
} from '../../utils/func'
import {isToday} from '../../utils/date'
import {
    createAccountCflTransTypeApi,
    createBudgetApi,
    createBudgetTransApi,
    deleteBudgetTransApi,
    deletedBudgetApi,
    getAccountCflTransTypeApi,
    getBudgetApi,
    getCategoriesApi,
    keyHistoryApi,
    removeAccountCflTransTypeApi,
    updateBudgetApi,
    updateBudgetDetailsApi,
    updateBudgetPrcApi,
    updateBudgetTransApi,
    updateTransTypeApi,
} from '../../api'
import Api from '../../api/Api'
import AsyncStorage from '@react-native-async-storage/async-storage';
import {IS_IOS} from '../../constants/common'
import Loader from '../../components/Loader/Loader'
import BudgetWrap from './components/BudgetWrap'
import {colors, fonts} from '../../styles/vars'
import AppTimezone from '../../utils/appTimezone'
import CustomIcon from '../../components/Icons/Fontello'
import {ActionSheet, ActionSheetItem} from 'react-native-action-sheet-component'
import styles from './BudgetStyles'

import Interactable from 'react-native-interactable'

import Slider from '@react-native-community/slider'
import commonStyles from '../../styles/styles'
import {CheckBox, Icon} from 'react-native-elements'
import Graph from '../MutavimScreen/components/Graph'
import CreditLimitModal from '../SettingsScreen/tabs/CreditCards/components/CreditLimitModal/CreditLimitModal'
import ActionButton from 'react-native-action-button'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import AccountIcon from '../../components/AccountIcon/AccountIcon'
import AccountsModal from '../../components/AccountsModal/AccountsModal'
import {getAccountGroups} from '../../redux/selectors/account'
import CheckList from '../../components/EditRowModal/CheckList'
import {Calendar} from 'react-native-calendars'
import Carousel, {Pagination} from 'react-native-snap-carousel'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import CategoriesModal from '../../components/CategoriesModal/CategoriesModal'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
const win = Dimensions.get('window')
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
const Screen = {
    width: win.width,
    height: win.height - 75,
}

@connect(state => ({
    currentCompanyId: state.currentCompanyId,
    isRtl: state.isRtl,
    accounts: state.accounts,
    searchkey: state.searchkey,
    accountGroups: getAccountGroups(state),
}))
@withTranslation()
export default class BudgetScreen extends PureComponent {
    today = AppTimezone.moment().valueOf()
    numLengOrgHistory = false

    constructor(props) {
        super(props)

        this.state = {
            withDetailsProgress: true,
            categoriesMatch: [],
            categoriesMatchCopy: [],
            categoriesMatchModal: false,
            lengthSlides: [],
            ddCategoriesSource: [],
            ddCategories: [],
            activeSlide: 0,
            ddFrequencyDesc: [],
            ddCreditCardCalcTypeDesc: [],
            dataPopUpAddEditDuplication: {},
            hasError: false,
            setTotalCategoryInProgress: false,
            totalCategoryModalIsOpen: false,
            categoryHistory: null,
            deleteBudgetDialog: false,
            itemPanelOfCategories: null,
            currentOpenItemIndex: null,
            isReady: false,
            accountsNotUpdates: [],
            accountsNotUpdatesOldestTransDate: [],
            dataBudgets: [],
            privScreenEmpty: false,
            inProgress: true,
            loaderPrivScreen: false,
            budgetIdActive: null,
            budgetActive: null,
            totals: null,
            isLayoutComplete: false,
            bounceValue: new Animated.Value(100),
            isHidden: false,
            actionSheetTooltip: false,
            actionSheetTooltipCopy: false,
            actionSheetItemList: [{}],
            inProgressSnap: false,
            currentOpenItemIndexSlideInside: null,
            alertsItem: false,
            alertsItemType: false,
            prcAlertSetVal: 0,
            alertDetailsIsOpen: false,
            typeOfPopup: null,
            categoriesBudget: [],
            categoriesBudgetSrc: [],
            accountsModalIsOpen: false,
            selectedAccountIds: [],
            selectedGroup: null,
            editModalInsideIsOpen: false,
            titleModalInside: '',
            dataList: [],
            typeEditModal: null,
            disabledValuesPopUp: {},
            editSumIn: false,
            editSumEx: false,
            editSumCreateBudget: false,
            popUpCreateBudgetTrans: false,
            totalNoValid: false,
            editCalendar: false,
            hasErrorCreateBudgetTrans: false,
            itemTransFromHistory: {},
            categoriesModalIsOpen: false,
            updateTypePopup: false,
            updateType: 'only',
            popUpCreateBudgetTransEdit: false,
        }
        this.props.dispatch(setOpenedBottomSheet(false))
        this._deltaY = new Animated.Value(0)
    }

    get selectedAccounts() {
        const {accounts} = this.props
        const {selectedAccountIds} = this.state
        return accounts.filter(a => selectedAccountIds.includes(a.companyAccountId))
    }

    get accountTitle() {
        const {
            selectedGroup,
        } = this.state
        const {
            isRtl, t,
            accountGroups,
        } = this.props
        const trimTitle = (title, currency) => {
            const newTitle = `${title} ${currency}`
            if (newTitle.length > 20) {
                return `${title.slice(0, 18)}... ${currency}`
            }
            return newTitle
        }

        if (!this.selectedAccounts.length) {
            return (
                <View/>
            )
        }

        const account = this.selectedAccounts[0]
        const currencySign = selectedGroup
            ? `(${getCurrencyChar(selectedGroup)})`
            : ''

        if (this.selectedAccounts.length === 1) {
            return (
                <View
                    style={cs(this.props.isRtl,
                        [commonStyles.row, commonStyles.alignItemsCenter],
                        commonStyles.rowReverse)}
                >
                    <AccountIcon account={account}/>
                    <Text
                        style={[styles.bankAccountHeaderText]}>{trimTitle(
                        account.accountNickname, currencySign)}</Text>
                </View>
            )
        }

        const title = this.selectedAccounts.length ===
        accountGroups[selectedGroup].length
            ? t('bankAccount:allAccounts')
            : t('bankAccount:multiSelection')

        return (
            <View
                style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter],
                    commonStyles.rowReverse)}
            >
                <Text style={[styles.bankAccountHeaderText]}>{trimTitle(title,
                    currencySign)}</Text>
            </View>
        )
    }

    getData = async (name) => {
        const value = await AsyncStorage.getItem(name)
        if (value !== null) {
            return JSON.parse(value)
        } else {
            return null
        }
    }

    storeData = async (name, value) => {
        await AsyncStorage.setItem(name, JSON.stringify(value))
    }

    handleBackPress = () => {
        this.props.dispatch(setOpenedBottomSheet(false))
        goToBack(this.props.navigation)
        return true
    }

    componentWillUnmount() {
        if(BackHandler && BackHandler.removeEventListener){
            BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
        }
    }

    componentDidMount() {
        this._deltaY = new Animated.Value(0)
        this._deltaY = new Animated.Value(0)
        const {currentCompanyId, accounts} = this.props
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
        if (currentCompanyId) {
            if (!this.state.categoriesBudget.length) {
                getCategoriesApi.post({
                    body: {
                        companyId: currentCompanyId,
                    },
                })
                    .then(categoriesBudget => {
                        this.setState({
                            categoriesBudgetSrc: categoriesBudget,
                            categoriesBudget,
                        })
                    })
                    .catch(() => {
                    })
            }
            getAccountCflTransTypeApi.post({body: {uuid: currentCompanyId}})
                .then(categories => {
                    const accountsNotUpdates = accounts.filter((it, idx) => {
                        return !isToday(it.balanceLastUpdatedDate)
                    })
                    const accountsNotUpdatesOldestTransDate = JSON.parse(
                        JSON.stringify(accountsNotUpdates))
                    if (accountsNotUpdatesOldestTransDate.length) {
                        accountsNotUpdatesOldestTransDate.sort(function (a, b) {
                            return a.oldestTransDate - b.oldestTransDate
                        })
                    }
                    this.setState({
                        categories,
                        isReady: true,
                        accountsNotUpdates: accountsNotUpdates,
                        accountsNotUpdatesOldestTransDate: accountsNotUpdatesOldestTransDate,
                    }, () => {
                        setTimeout(() => {
                            return this.getBudget()
                        }, 200)
                    })
                })
                .catch((err) => this.setState({
                    isReady: true,
                    error: getErrText(err),
                }))
        }
    }

    getBudget = (isPriv) => {
        const {currentCompanyId} = this.props
        this.setState({
            dataBudgets: [],
            privScreenEmpty: false,
            inProgress: true,
        })
        getBudgetApi.post({
            body: Object.assign({
                companyId: currentCompanyId,
            }, isPriv ? {createDefault: true} : {}),
        })
            .then(async response => {
                this.setState({
                    isLayoutComplete: true,
                    loaderPrivScreen: false,
                })
                const dataBudgets = response

                if (dataBudgets.length === 0) {
                    this.setState({
                        dataBudgets,
                        privScreenEmpty: true,
                    })
                } else {
                    if (dataBudgets.length && dataBudgets[0].budgetId) {
                        dataBudgets.forEach((budget) => {
                            budget.dates = {
                                dateFrom: budget.dateFrom,
                                dateTill: budget.dateTill,
                            }
                            if (this.props.accounts.find(
                                a => a.companyAccountId === budget.budgetAccounts[0])) {
                                budget.currency = getCurrencyChar(this.props.accounts.find(
                                    a => a.companyAccountId ===
                                        budget.budgetAccounts[0]).currency)
                            } else {
                                budget.currency = getCurrencyChar('ILS')
                            }
                        })

                        this.setState({
                            dataBudgets,
                        })
                        const isSaveBudgetId = await this.getData('budgetId')
                        if (isSaveBudgetId &&
                            dataBudgets.find((it) => it.budgetId === isSaveBudgetId)) {
                            this.budgetActive(
                                dataBudgets.find((it) => it.budgetId === isSaveBudgetId), true)
                        } else {
                            this.budgetActive(dataBudgets[0], true)
                        }
                    } else if (dataBudgets.length && dataBudgets[0].privs) {
                        this.setState({
                            dataBudgets,
                            loaderPrivScreen: true,
                        })
                        this.getBudget(true)
                    } else {
                        this.setState({
                            dataBudgets,
                        })
                    }
                }
            })
            .catch(() => {
            })
    }

    budgetActive = async (
        budget, isActive, isOpenPopupCreate, isOpenPopupEdit) => {
        let dataBudgets = JSON.parse(JSON.stringify(this.state.dataBudgets))
        if (isActive) {
            this.setState({
                budgetIdActive: budget.budgetId,
                budgetActive: budget,
                currentOpenItemIndexSlideInside: budget.budgetId,
            })
            await this.storeData('budgetId', budget.budgetId)
            dataBudgets.forEach((bud) => {
                if (budget.budgetId === bud.budgetId) {
                    budget.showPanelDD = true
                    bud.showPanelDD = true
                } else {
                    bud.showPanelDD = false
                }
            })
        }

        if (((!isActive && budget.showPanelDD) || isActive || isOpenPopupCreate) &&
            !budget.budgetsDetails) {
            const {currentCompanyId} = this.props
            const response = await new Api(
                {endpoint: `budget/cfl/${budget.budgetType}/get-budget-details`}).post(
                {
                    body: {
                        'budgetId': budget.budgetId,
                        'companyAccountIds': budget.budgetAccounts,
                        'companyId': currentCompanyId,
                        'creditCardCalcTypeDesc': budget.creditCardCalcTypeDesc,
                        'dateFrom': budget.dateFrom,
                        'dateTill': budget.dateTill,
                    },
                })
            dataBudgets.find(
                (bud) => budget.budgetId === bud.budgetId).budgetsDetails = response
            this.setState({
                dataBudgets,
                actionSheetTooltipCopy: dataBudgets.find(
                    (bud) => budget.budgetId === bud.budgetId),
            }, () => {
                // console.log(dataBudgets)
                if (!isOpenPopupCreate) {
                    if (response.details && response.details.length) {
                        const totals = response.details.reduce((a, it) => {
                            if (it.deleted) {
                                return [a[0], a[1]]
                            } else {
                                if (it.expence) {
                                    return [it.total + a[0], a[1]]
                                } else {
                                    return [a[0], it.total + a[1]]
                                }
                            }
                        }, [0, 0])
                        this.setState({
                            totals,
                        })
                    }
                } else {
                    this.openPopUpAddEditDuplication(
                        isOpenPopupEdit ? 'edit' : 'duplication')
                }
            })
        } else if (budget.budgetsDetails && isOpenPopupCreate) {
            this.setState({
                dataBudgets,
                actionSheetTooltipCopy: dataBudgets.find(
                    (bud) => budget.budgetId === bud.budgetId),
            }, () => {
                this.openPopUpAddEditDuplication(
                    isOpenPopupEdit ? 'edit' : 'duplication')
            })
        } else {
            this.setState({
                dataBudgets,
            })
        }
    }

    _onRefresh = () => {
        this.getBudget()
    }

    _onRefreshTable = () => {
        this.setState({refreshing: true})
        this._onRefresh()
        setTimeout(() => {
            this.setState({refreshing: false})
        }, 1000)
    }

    handleScrollEnd = (e) => {
        this.handleSetScrollPosition(e.nativeEvent.contentOffset.y)
    }

    handleSetScrollPosition = (y) => {
        this.setState({currentScrollPosition: y})
        Keyboard.dismiss()
    }

    disabledNavDate = (type, item) => () => {
        if (this.state.accountsNotUpdatesOldestTransDate) {
            if (item.frequencyDesc === 'MONTH') {
                const monthDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'months')
                let monthDiffOldestTransDate = 11
                if (this.state.accountsNotUpdatesOldestTransDate.length) {
                    monthDiffOldestTransDate = AppTimezone.moment(item.dates.dateFrom)
                        .diff(
                            AppTimezone.moment(
                                this.state.accountsNotUpdatesOldestTransDate[0].oldestTransDate),
                            'months')
                }
                if (type === 'prev') {
                    return !((monthDiff <= 11) && (monthDiff <= monthDiffOldestTransDate))
                } else {
                    return !(monthDiff > 0)
                }
            } else {
                const yearsDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'years')
                let yearsDiffOldestTransDate = 3
                if (this.state.accountsNotUpdatesOldestTransDate.length) {
                    yearsDiffOldestTransDate = AppTimezone.moment(item.dates.dateFrom)
                        .diff(
                            AppTimezone.moment(
                                this.state.accountsNotUpdatesOldestTransDate[0].oldestTransDate),
                            'years')
                }
                if (type === 'prev') {
                    return !((yearsDiff <= 3) && (yearsDiff <= yearsDiffOldestTransDate))
                } else {
                    return !(yearsDiff > 0)
                }
            }
        } else {
            return true
        }
    }

    prevDate = (item) => () => {
        const {currentOpenItemIndexSlideInside} = this.state

        if (currentOpenItemIndexSlideInside !== item.budgetId) {
            this.setState({currentOpenItemIndexSlideInside: item.budgetId})
            item.showPanelDD = true
            console.log(item.showPanelDD)
        }
        if (!item.budgetsDetails) {
            if (item.frequencyDesc === 'MONTH') {
                const monthDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'months')
                let monthDiffOldestTransDate = 11
                if (this.state.accountsNotUpdatesOldestTransDate.length) {
                    monthDiffOldestTransDate = AppTimezone.moment(item.dates.dateFrom)
                        .diff(
                            AppTimezone.moment(
                                this.state.accountsNotUpdatesOldestTransDate[0].oldestTransDate),
                            'months')
                }
                // console.log(monthDiffOldestTransDate);
                if ((monthDiff <= 11) && (monthDiff <= monthDiffOldestTransDate)) {
                    item.dateFrom = AppTimezone.moment(item.dateFrom)
                        .subtract(1, 'months')
                        .startOf('month')
                        .valueOf()
                    item.dateTill = AppTimezone.moment(item.dateTill)
                        .subtract(1, 'months')
                        .endOf('month')
                        .valueOf()
                } else {
                    this.budgetActive(item, true)
                    return
                }
            } else {
                const yearsDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'years')
                let yearsDiffOldestTransDate = 3
                if (this.state.accountsNotUpdatesOldestTransDate.length) {
                    yearsDiffOldestTransDate = AppTimezone.moment(item.dates.dateFrom)
                        .diff(
                            AppTimezone.moment(
                                this.state.accountsNotUpdatesOldestTransDate[0].oldestTransDate),
                            'years')
                }
                console.log(yearsDiffOldestTransDate)
                if ((yearsDiff <= 3) && (yearsDiff <= yearsDiffOldestTransDate)) {
                    item.dateFrom = AppTimezone.moment(item.dateFrom)
                        .subtract(1, 'years')
                        .startOf('month')
                        .valueOf()
                    item.dateTill = AppTimezone.moment(item.dateTill)
                        .subtract(1, 'years')
                        .endOf('month')
                        .valueOf()
                } else {
                    this.budgetActive(item, true)
                    return
                }
            }

            this.budgetActive(item, true)
        } else {
            if (item.frequencyDesc === 'MONTH') {
                const monthDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'months')
                let monthDiffOldestTransDate = 11
                if (this.state.accountsNotUpdatesOldestTransDate.length) {
                    monthDiffOldestTransDate = AppTimezone.moment(item.dates.dateFrom)
                        .diff(
                            AppTimezone.moment(
                                this.state.accountsNotUpdatesOldestTransDate[0].oldestTransDate),
                            'months')
                }
                // console.log(monthDiffOldestTransDate);
                if ((monthDiff <= 11) && (monthDiff <= monthDiffOldestTransDate)) {
                    item.dateFrom = AppTimezone.moment(item.dateFrom)
                        .subtract(1, 'months')
                        .startOf('month')
                        .valueOf()
                    item.dateTill = AppTimezone.moment(item.dateTill)
                        .subtract(1, 'months')
                        .endOf('month')
                        .valueOf()
                } else {
                    return
                }
            } else {
                const yearsDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'years')
                let yearsDiffOldestTransDate = 3
                if (this.state.accountsNotUpdatesOldestTransDate.length) {
                    yearsDiffOldestTransDate = AppTimezone.moment(item.dates.dateFrom)
                        .diff(
                            AppTimezone.moment(
                                this.state.accountsNotUpdatesOldestTransDate[0].oldestTransDate),
                            'years')
                }
                console.log(yearsDiffOldestTransDate)
                if ((yearsDiff <= 3) && (yearsDiff <= yearsDiffOldestTransDate)) {
                    item.dateFrom = AppTimezone.moment(item.dateFrom)
                        .subtract(1, 'years')
                        .startOf('month')
                        .valueOf()
                    item.dateTill = AppTimezone.moment(item.dateTill)
                        .subtract(1, 'years')
                        .endOf('month')
                        .valueOf()
                } else {
                    return
                }
            }

            item.budgetsDetails = null
            this.budgetActive(item, true)
        }
    }

    nextDate = (item) => () => {
        const {currentOpenItemIndexSlideInside} = this.state
        if (currentOpenItemIndexSlideInside !== item.budgetId) {
            this.setState({currentOpenItemIndexSlideInside: item.budgetId})
            item.showPanelDD = true
            console.log(item.showPanelDD)
        }
        if (!item.budgetsDetails) {
            if (item.frequencyDesc === 'MONTH') {
                const monthDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'months')
                if (monthDiff > 0) {
                    item.dateFrom =
                        AppTimezone.moment(item.dateFrom)
                            .add(1, 'months')
                            .startOf('month')
                            .valueOf()
                    item.dateTill =
                        AppTimezone.moment(item.dateTill)
                            .add(1, 'months')
                            .endOf('month')
                            .valueOf()
                } else {
                    this.budgetActive(item, true)
                    return
                }
            } else {
                const yearsDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'years')
                if (yearsDiff > 0) {
                    item.dateFrom =
                        AppTimezone.moment(item.dateFrom)
                            .add(1, 'years')
                            .startOf('month')
                            .valueOf()
                    item.dateTill =
                        AppTimezone.moment(item.dateTill)
                            .add(1, 'years')
                            .endOf('month')
                            .valueOf()
                } else {
                    this.budgetActive(item, true)
                    return
                }
            }

            this.budgetActive(item, true)
        } else {
            if (item.frequencyDesc === 'MONTH') {
                const monthDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'months')
                if (monthDiff > 0) {
                    item.dateFrom =
                        AppTimezone.moment(item.dateFrom)
                            .add(1, 'months')
                            .startOf('month')
                            .valueOf()
                    item.dateTill =
                        AppTimezone.moment(item.dateTill)
                            .add(1, 'months')
                            .endOf('month')
                            .valueOf()
                } else {
                    return
                }
            } else {
                const yearsDiff = AppTimezone.moment(item.dates.dateFrom).diff(
                    AppTimezone.moment(item.dateFrom),
                    'years')
                if (yearsDiff > 0) {
                    item.dateFrom =
                        AppTimezone.moment(item.dateFrom)
                            .add(1, 'years')
                            .startOf('month')
                            .valueOf()
                    item.dateTill =
                        AppTimezone.moment(item.dateTill)
                            .add(1, 'years')
                            .endOf('month')
                            .valueOf()
                } else {
                    return
                }
            }
            item.budgetsDetails = null
            this.budgetActive(item, true)
        }
    }

    renderFooter = () => {
        return (<View style={{
            backgroundColor: 'white',
        }}>
            <View style={{
                height: 6,
                width: '100%',
            }}>
                <View style={{
                    backgroundColor: 'white',
                    shadowColor: '#f2f2f2',
                    shadowOpacity: 1,
                    shadowOffset: {
                        width: 0,
                        height: -6,
                    },
                    elevation: 6,
                    height: 6,
                    width: '100%',
                }}/>
            </View>
        </View>)
    }

    renderHeader = () => {
        return (<View style={{
            backgroundColor: 'white',
        }}>
            <View style={{
                height: 56.5,
                flexDirection: 'row',
                justifyContent: 'center',
                borderBottomColor: '#f0f1f2',
                borderBottomWidth: 1,
                marginHorizontal: 22.5,
            }}>
                <Text style={{
                    textAlign: 'center',
                    alignSelf: 'center',
                    color: '#022258',
                    fontSize: sp(24),
                    fontFamily: fonts.semiBold,
                }}>תקציב</Text>
            </View>
        </View>)
    }

    renderItemSeparator = () => {
        return (<View style={{
            height: 6,
            width: '100%',
        }}>
            <View style={{
                backgroundColor: 'white',
                shadowColor: '#f2f2f2',
                shadowOpacity: 1,
                shadowOffset: {
                    width: 0,
                    height: -6,
                },
                elevation: 6,
                height: 6,
                width: '100%',
            }}/>
        </View>)
    }

    renderItem = ({item, index}) => {
        const {currentOpenItemIndexSlideInside} = this.state
        return (
            <BudgetWrap
                openActionSheet={this.openActionSheet}
                disabledNavDatePrev={this.disabledNavDate('prev', item)}
                disabledNavDateNext={this.disabledNavDate('next', item)}
                nextDate={this.nextDate(item)}
                prevDate={this.prevDate(item)}
                accounts={this.props.accounts}
                showPanelOfCategories={this.showPanelOfCategories(item)}
                item={item}
                isOpen={currentOpenItemIndexSlideInside === item.budgetId}
                onItemToggle={this.handleItemToggle(item)}
            />
        )
    }

    handleItemToggle = (budgetSrc) => () => {
        const {currentOpenItemIndexSlideInside} = this.state
        this.setState({
            currentOpenItemIndexSlideInside: currentOpenItemIndexSlideInside ===
            budgetSrc.budgetId ? null : budgetSrc.budgetId,
        })
        let budget = JSON.parse(JSON.stringify(budgetSrc))
        budget.showPanelDD = !budget.showPanelDD
        console.log(budget.showPanelDD)
        if (budget.showPanelDD) {
            this.budgetActive(budget, true)
        } else {
            const dataBudgets = JSON.parse(JSON.stringify(this.state.dataBudgets))
            dataBudgets.forEach((bud) => {
                if (budget.budgetId === bud.budgetId) {
                    bud.showPanelDD = budget.showPanelDD
                }
            })
            this.setState({
                dataBudgets,
            })
        }
    }

    openActionSheet = (type, item) => {
        if (type && (type === 'incomeAlert' || type === 'outcomeAlert')) {
            this.setState({
                actionSheetTooltip: type === 'incomeAlert'
                    ? 'קבלת התראות עבור תקציב הכנסות לאחר'
                    : 'קבלת התראות עבור תקציב הוצאות לאחר',
                actionSheetItemList: [{}],
                alertsItem: Object.assign({}, item),
                alertsItemType: type,
                prcAlertSetVal: type === 'incomeAlert'
                    ? item.prcIncome
                    : item.prcOutcome,
            }, () => {
                setTimeout(() => {
                    this.bottomActionSheet.show(() => {
                        console.log('callback - show')
                    })
                }, IS_IOS ? 500 : 300)
            })
        } else {
            let actionSheetItemList = []
            if (type && (type === 'refresh' || type === 'restore')) {
                actionSheetItemList = [
                    {
                        text: type === 'refresh' ? 'רענון' : 'שיחזור',
                        value: type,
                        icon: {
                            name: 'restore',
                            size: 18,
                            style: {
                                position: 'absolute',
                                top: 5,
                                right: -23,
                                width: 35 / 2,
                                height: 30 / 2,
                            },
                        },
                    },
                    {
                        text: 'ביטול',
                        value: 'cancel',
                        icon: {
                            name: 'times',
                            size: 12,
                            style: {
                                position: 'absolute',
                                top: 6,
                                right: -21,
                            },
                        },
                    },
                ]
            } else {
                if (item) {
                    actionSheetItemList = [
                        {
                            text: 'עריכה',
                            value: 'edit',
                            icon: {
                                name: 'pencil',
                                size: 18,
                                style: {
                                    position: 'absolute',
                                    top: 2,
                                    right: -25,
                                },
                            },
                        },
                        {
                            text: 'שיכפול תקציב',
                            value: 'duplication',
                            icon: {
                                name: 'duplication',
                                size: 18,
                                style: {
                                    position: 'absolute',
                                    top: 2,
                                    right: -22,
                                    width: 29 / 2,
                                    height: 35 / 2,
                                },
                            },
                        },
                    ]
                    if (item.indDefault !== 1 && item.indDefault !== 2) {
                        actionSheetItemList.push({
                            text: 'מחיקה',
                            value: 'deleteOnly',
                            icon: {
                                name: 'trash',
                                size: 18,
                                style: {
                                    position: 'absolute',
                                    top: 3,
                                    right: -21,
                                },
                            },
                        })
                    }
                    actionSheetItemList.push({
                        text: 'ביטול',
                        value: 'cancel',
                        icon: {
                            name: 'times',
                            size: 12,
                            style: {
                                position: 'absolute',
                                top: 6,
                                right: -21,
                            },
                        },
                    })
                }
            }

            this.setState({
                actionSheetTooltip: type || item,
                actionSheetItemList: actionSheetItemList.length
                    ? actionSheetItemList
                    : [{}],
                alertsItem: false,
                alertsItemType: false,
                prcAlertSetVal: 0,
            }, () => {
                setTimeout(() => {
                    this.bottomActionSheet.show(() => {
                        console.log('callback - show')
                    })
                }, IS_IOS ? 500 : 300)
            })
        }
    }

    openActionSheetHistory = (item) => () => {
        let actionSheetItemListHistory
        if (item.paymentDesc === 'Budget') {
            actionSheetItemListHistory = [
                {
                    text: 'עריכה',
                    value: 'editHistory',
                    icon: {
                        name: 'pencil',
                        size: 18,
                        style: {
                            position: 'absolute',
                            top: 2,
                            right: -25,
                        },
                    },
                },
                {
                    text: 'שינוי קטגוריה',
                    value: 'changeCategoryHistory',
                    icon: {
                        name: 'change-category',
                        size: 18,
                        style: {
                            position: 'absolute',
                            top: 3,
                            right: -25,
                        },
                    },
                },
                {
                    text: 'מחיקה',
                    value: 'removeHistory',
                    icon: {
                        name: 'trash',
                        size: 18,
                        style: {
                            position: 'absolute',
                            top: 3,
                            right: -21,
                        },
                    },
                },
                {
                    text: 'ביטול',
                    value: 'cancel',
                    icon: {
                        name: 'times',
                        size: 12,
                        style: {
                            position: 'absolute',
                            top: 6,
                            right: -21,
                        },
                    },
                },
            ]
        } else {
            actionSheetItemListHistory = [
                {
                    text: 'שינוי קטגוריה',
                    value: 'changeCategoryHistory',
                    icon: {
                        name: 'change-category',
                        size: 18,
                        style: {
                            position: 'absolute',
                            top: 3,
                            right: -25,
                        },
                    },
                },
                {
                    text: 'ביטול',
                    value: 'cancel',
                    icon: {
                        name: 'times',
                        size: 12,
                        style: {
                            position: 'absolute',
                            top: 6,
                            right: -21,
                        },
                    },
                },
            ]
        }
        item.transTypeId = item.keyId
        this.setState({
            actionSheetTooltip: false,
            actionSheetItemList: actionSheetItemListHistory,
            alertsItem: false,
            alertsItemType: false,
            prcAlertSetVal: 0,
            itemTransFromHistory: item,
        }, () => {
            setTimeout(() => {
                this.bottomActionSheet.show(() => {
                    console.log('callback - show')
                })
            }, IS_IOS ? 200 : 300)
        })
    }

    openActionSheetInside = () => {
        setTimeout(() => {
            this.bottomActionSheet1.show(() => {
                console.log('callback - show')
            })
        }, IS_IOS ? 200 : 300)
    }

    openActionSheetPrc = (item) => () => {
        if (item.expence) {
            item.prcOutcome = item.alertPrc
            item.outcomeAlert = item.alert
        } else {
            item.prcIncome = item.alertPrc
            item.incomeAlert = item.alert
        }

        this.openActionSheet(!item.expence ? 'incomeAlert' : 'outcomeAlert', item)
    }

    onChange = (value, index, values) => {

    }

    onHideInside = () => {
        console.log('onHide')
        if (this.bottomActionSheet2) {
            this.bottomActionSheet2.hide(() => {
                console.log('callback - hide')
            })
        }
    }

    onHide = () => {
        console.log('onHide')
        if (this.bottomActionSheet) {
            this.bottomActionSheet.hide(() => {
                console.log('callback - hide')
            })
            this.setState({
                actionSheetTooltip: false,
                actionSheetItemList: [{}],
                alertsItem: false,
                alertsItemType: false,
                prcAlertSetVal: 0,
            })
        } else {
            this.setState({
                actionSheetTooltip: false,
                actionSheetItemList: [{}],
                alertsItem: false,
                alertsItemType: false,
                prcAlertSetVal: 0,
            })
        }
    }

    onItemPress = (value) => {
        if (value === 'refresh' || value === 'restore') {
            this.close()
            this.setState({
                loaderPrivScreen: true,
            })
            this.getBudget(true)
        } else if (value === 'deleteOnly') {
            this.setState({
                deleteBudgetDialog: true,
            })
        } else if (value === 'duplication') {
            this.setState({
                actionSheetTooltipCopy: this.state.actionSheetTooltip,
            }, () => {
                this.close()
                this.budgetActive(this.state.actionSheetTooltipCopy, false, true)
            })
        } else if (value === 'edit') {
            this.setState({
                actionSheetTooltipCopy: this.state.actionSheetTooltip,
            }, () => {
                this.close()
                this.budgetActive(this.state.actionSheetTooltipCopy, false, true, true)
            })
        } else if (value === 'editHistory') {
            this.openPopUpCreateBudgetTrans(true)
        } else if (value === 'removeHistory') {
            this.deleteBudgetTrans()
        } else if (value === 'changeCategoryHistory') {
            this.handleOpenCategoriesModal()
        }
    }

    deleteBudgetTrans = () => {
        const {itemTransFromHistory} = this.state
        return deleteBudgetTransApi.post({
            body: {
                'uuid': itemTransFromHistory.transId,
            },
        }).then(() => {
            this.numLengOrgHistory = true
            const categoryHistory = Object.assign({}, this.state.categoryHistory)
            const val = itemTransFromHistory
            const monthDefThisMonth =
                AppTimezone.moment().isSame(AppTimezone.moment(val.transDate), 'month')
            if (monthDefThisMonth) {
                // this.budgetHistoryPrompt.transCalc -= Number(val.total);
            }
            categoryHistory.history.transes = categoryHistory.history.transes.filter(
                (it) => it.transId !== val.transId)
            categoryHistory.history.transesTotal = categoryHistory.history.transes.reduce(
                (a, b) => a + b.total, 0)
            categoryHistory.history.monthsTotal.forEach((it) => {
                const monthDiff = AppTimezone.moment(it.month)
                    .isSame(AppTimezone.moment(val.transDate), 'month')
                if (monthDiff) {
                    it.total = it.total - Number(val.total)
                }
            })
            categoryHistory.history.currentMonth.forEach((it) => {
                if (AppTimezone.moment().isSame(val.transDate, 'month')) {
                    const monthDiff = AppTimezone.moment(val.transDate).format('D') ===
                        ((it.transDay).toString())
                    if (monthDiff) {
                        it.dayTotal = it.dayTotal - Number(val.total)
                    }
                }
            })
            const idxSlices = categoryHistory.history.monthsTotal.findIndex((v) => {
                return AppTimezone.moment(v.month)
                    .isBefore(AppTimezone.moment(), 'month') && v.total !== 0
            })
            const arrOldMonths = categoryHistory.history.monthsTotal.slice(idxSlices,
                categoryHistory.history.monthsTotal.length - 1)
            if (arrOldMonths.length) {
                const averageTotal = arrOldMonths.reduce((a, b) => a + b.total, 0)
                categoryHistory.history.average = (averageTotal /
                    arrOldMonths.length).toFixed(1)
            }
            this.setState({
                categoryHistory,
                categoriesModalIsOpen: false,
                itemTransFromHistory: {},
            }, () => {

            })
        })
    }

    handleSetRef = (ref) => {
        this.listRef = ref
    }

    close = () => {
        this.setState({
            categoryHistory: null,
        })
        this.listRef.snapTo({index: 2})
    }

    onDrawerSnap = (states) => {
        const index = states.nativeEvent.index
        // console.log('index---', index)
        if (index === 0) {
            this.props.dispatch(setOpenedBottomSheet(true))
            // console.log('Top')
            this.setState({
                currentOpenItemIndex: 'Top',
            })
        } else if (index === 1) {
            // console.log('Middle')
            this.props.dispatch(setOpenedBottomSheet(true))
            this.setState({
                currentOpenItemIndex: 'Middle',
            })
        } else if (index === 2) {
            // console.log('Close')
            this.props.dispatch(setOpenedBottomSheet(false))
            this.setState({
                categoryHistory: null,
                currentOpenItemIndex: null,
            })

            if (this.numLengOrgHistory) {
                const itemPanelOfCategories = Object.assign({},
                    this.state.itemPanelOfCategories)
                itemPanelOfCategories.budgetsDetails = null
                this.budgetActive(itemPanelOfCategories, false)
            }
        }
    }

    showPanelOfCategories = (itemPanelOfCategories) => () => {
        this.numLengOrgHistory = false

        if (itemPanelOfCategories && itemPanelOfCategories.budgetsDetails &&
            itemPanelOfCategories.budgetsDetails.details.length > 0) {
            const expences = itemPanelOfCategories.budgetsDetails.details.filter(
                (it) => {
                    const nameIcon = this.state.categories.find(
                        (item) => item.transTypeId === it.keyId)
                    if (nameIcon) {
                        it.nameIcon = getTransCategoryIcon(nameIcon.iconType)
                    }
                    if (it.expence) {
                        if ((it.total === 0 && it.totalKeyUse !== 0) ||
                            (Math.round(it.totalKeyUse / (it.total / 100)) <= 33.999999)) {
                            it.bgColor = styles.red1
                        } else if (!(it.total === 0 && it.totalKeyUse !== 0) &&
                            Math.round(it.totalKeyUse / (it.total / 100)) >= 34 &&
                            Math.round(it.totalKeyUse / (it.total / 100)) <= 66.999999) {
                            it.bgColor = styles.red2
                        } else if (!(it.total === 0 && it.totalKeyUse !== 0) &&
                            Math.round(it.totalKeyUse / (it.total / 100)) >= 67 &&
                            Math.round(it.totalKeyUse / (it.total / 100)) <= 99.999999) {
                            it.bgColor = styles.red3
                        } else if (!(it.total === 0 && it.totalKeyUse !== 0) &&
                            Math.round(it.totalKeyUse / (it.total / 100)) >= 100) {
                            it.bgColor = styles.red4
                        }
                    }

                    return it.expence && !it.deleted
                })
            const incomes = itemPanelOfCategories.budgetsDetails.details.filter(
                (it) => {
                    const nameIcon = this.state.categories.find(
                        (item) => item.transTypeId === it.keyId)
                    if (nameIcon) {
                        it.nameIcon = getTransCategoryIcon(nameIcon.iconType)
                    }
                    if (!it.expence) {
                        if ((it.total === 0 && it.totalKeyUse !== 0) ||
                            (Math.round(it.totalKeyUse / (it.total / 100)) <= 33.999999)) {
                            it.bgColor = styles.green1
                        } else if (!(it.total === 0 && it.totalKeyUse !== 0) &&
                            Math.round(it.totalKeyUse / (it.total / 100)) >= 34 &&
                            Math.round(it.totalKeyUse / (it.total / 100)) <= 66.999999) {
                            it.bgColor = styles.green2
                        } else if (!(it.total === 0 && it.totalKeyUse !== 0) &&
                            Math.round(it.totalKeyUse / (it.total / 100)) >= 67 &&
                            Math.round(it.totalKeyUse / (it.total / 100)) <= 99.999999) {
                            it.bgColor = styles.green3
                        } else if (!(it.total === 0 && it.totalKeyUse !== 0) &&
                            Math.round(it.totalKeyUse / (it.total / 100)) >= 100) {
                            it.bgColor = styles.green4
                        }
                    }
                    return !it.expence && !it.deleted
                })
            const totals = itemPanelOfCategories.budgetsDetails.details.reduce(
                (a, it) => {
                    if (it.deleted) {
                        return [a[0], a[1]]
                    } else {
                        if (it.expence) {
                            return [it.total + a[0], a[1]]
                        } else {
                            return [a[0], it.total + a[1]]
                        }
                    }
                }, [0, 0])

            itemPanelOfCategories.totals = totals
            itemPanelOfCategories.expences = expences
            itemPanelOfCategories.incomes = incomes
        }

        this.setState({
            itemPanelOfCategories,
        })
        this.listRef.snapTo({index: 0})
    }

    changeFavorite = () => {
        const categoryHistory = Object.assign({}, this.state.categoryHistory)
        categoryHistory.favorite = !categoryHistory.favorite
        this.setState({
            categoryHistory,
        })
        this.updateBudgetDetails(categoryHistory, false, true)
    }

    changeTotalCategory = () => {
        this.setState({
            totalCategoryModalIsOpen: true,
        })
    }

    updateBudgetDetails = (categoryHistory, isAlert, isFavorite) => {
        updateBudgetDetailsApi.post({
            body: {
                'alert': categoryHistory.alert,
                'alertPrc': Number(categoryHistory.alertPrc),
                'budgetId': this.state.budgetActive.budgetId,
                'expence': categoryHistory.expence,
                'favorite': categoryHistory.favorite,
                'indDefault': this.state.budgetActive.indDefault,
                'keyId': categoryHistory.keyId,
                'total': Number(categoryHistory.total),
            },
        })
            .then(() => {
                const dataBudgets = JSON.parse(JSON.stringify(this.state.dataBudgets))
                dataBudgets.forEach((bud) => {
                    if (this.state.budgetActive.budgetId === bud.budgetId) {
                        if (isAlert) {
                            bud.budgetsDetails.details.forEach((it) => {
                                if (it.expence === categoryHistory.expence && it.keyId ===
                                    categoryHistory.keyId) {
                                    it.alertPrc = categoryHistory.alertPrc
                                    it.alert = categoryHistory.alert
                                }
                            })
                        } else if (isFavorite) {
                            bud.budgetsDetails.details.forEach((it) => {
                                if (it.expence === categoryHistory.expence && it.keyId ===
                                    categoryHistory.keyId) {
                                    it.favorite = categoryHistory.favorite
                                } else if (it.expence === categoryHistory.expence) {
                                    it.favorite = false
                                }
                            })
                        } else {
                            bud.budgetsDetails.details.forEach((it) => {
                                if (it.expence === categoryHistory.expence && it.keyId ===
                                    categoryHistory.keyId) {
                                    it.total = categoryHistory.total
                                }
                            })
                            const totals = bud.budgetsDetails.details.reduce((a, it) => {
                                if (it.deleted) {
                                    return [a[0], a[1]]
                                } else {
                                    if (it.expence) {
                                        return [it.total + a[0], a[1]]
                                    } else {
                                        return [a[0], it.total + a[1]]
                                    }
                                }
                            }, [0, 0])
                            this.setState({
                                totals,
                                totalCategoryModalIsOpen: false,
                                setTotalCategoryInProgress: false,
                            })
                        }
                    }
                })
                this.setState({
                    dataBudgets,
                })
            })
            .catch(() => {
            })
    }

    onValueCompleteChange = (val) => {
        console.log('onValueCompleteChange', val)
        const alertsItem = Object.assign({}, this.state.alertsItem)
        alertsItem[this.state.alertsItemType === 'incomeAlert'
            ? 'prcIncome'
            : 'prcOutcome'] = Math.round(val)
        alertsItem[this.state.alertsItemType] = Math.round(val) > 0
        this.setState({
            alertsItem: alertsItem,
        }, () => {
            if (this.state.categoryHistory) {
                const categoryHistory = Object.assign({}, this.state.categoryHistory)
                categoryHistory.alertPrc = Math.round(val)
                categoryHistory.alert = Math.round(val) > 0
                this.setState({
                    categoryHistory,
                }, () => {
                    const categoryHistorys = Object.assign({}, this.state.categoryHistory)
                    if (!categoryHistorys.alertPrc) {
                        categoryHistorys.alertPrc = 0
                    }
                    this.updateBudgetDetails(categoryHistorys, true)
                })
            } else {
                const alertsItems = Object.assign({}, this.state.alertsItem)

                console.log({
                    'budgetId': alertsItems.budgetId,
                    'indDefault': alertsItems.indDefault,
                    'incomeAlert': this.state.alertsItemType === 'incomeAlert' ? Number(
                        alertsItems.prcIncome) > 0 : alertsItems.incomeAlert,
                    'outcomeAlert': this.state.alertsItemType === 'outcomeAlert' ? Number(
                        alertsItems.prcOutcome) > 0 : alertsItems.outcomeAlert,
                    'prcIncome': Number(alertsItems.prcIncome),
                    'prcOutcome': Number(alertsItems.prcOutcome),
                })

                updateBudgetPrcApi.post({
                    body: {
                        'budgetId': alertsItems.budgetId,
                        'indDefault': alertsItems.indDefault,
                        'incomeAlert': this.state.alertsItemType === 'incomeAlert' ? Number(
                            alertsItems.prcIncome) > 0 : alertsItems.incomeAlert,
                        'outcomeAlert': this.state.alertsItemType === 'outcomeAlert'
                            ? Number(alertsItems.prcOutcome) > 0
                            : alertsItems.outcomeAlert,
                        'prcIncome': Number(alertsItems.prcIncome),
                        'prcOutcome': Number(alertsItems.prcOutcome),
                    },
                })
                    .then(() => {
                        const dataBudgets = JSON.parse(
                            JSON.stringify(this.state.dataBudgets))
                        dataBudgets.forEach((bud) => {
                            if (alertsItems.budgetId === bud.budgetId) {
                                if (this.state.alertsItemType === 'incomeAlert') {
                                    bud.prcIncome = Number(alertsItems.prcIncome)
                                    bud.incomeAlert = bud.prcIncome > 0
                                    if (!bud.incomeAlert) {
                                        bud.budgetsDetails.details.forEach((it) => {
                                            if (!it.expence) {
                                                it.alert = false
                                            }
                                        })
                                    }
                                } else {
                                    bud.prcOutcome = Number(alertsItems.prcOutcome)
                                    bud.outcomeAlert = bud.prcOutcome > 0
                                    if (!bud.outcomeAlert) {
                                        bud.budgetsDetails.details.forEach((it) => {
                                            if (it.expence) {
                                                it.alert = false
                                            }
                                        })
                                    }
                                }
                            }
                        })
                        this.setState({
                            dataBudgets,
                        })
                        // this.onHide()
                    })
                    .catch(() => {
                    })
            }
        })
    }

    onValueChange = (val) => {
        console.log(val)
    }

    _onScroll(e) {
        const offset = e.nativeEvent.contentOffset.y
        if (offset < 0) {
            this.setState({
                inProgressSnap: true,
            })
            if (this.scrollViewTop && this.scrollViewTop._component) {
                this.scrollViewTop._component.scrollTo({
                    animated: false,
                    y: 0,
                    x: 0,
                })
            }
            this.listRef.snapTo({index: 1})
            setTimeout(() => {
                this.setState({
                    inProgressSnap: false,
                })
            }, 30)
        }
    }

    restore = (type, item) => () => {
        this.openActionSheet(type, item)
    }

    hideDeleteBudgetDialog = () => {
        this.setState({
            deleteBudgetDialog: false,
        })
    }

    onRemoveClick = () => {
        this.hideDeleteBudgetDialog()
        deletedBudgetApi.post({
            body: {
                uuid: this.state.actionSheetTooltipCopy.budgetId,
            },
        })
            .then(response => {
                this.getBudget()
            })
            .catch(() => {
            })
    }

    handleToggleAlertDetails = () => {
        this.setState({alertDetailsIsOpen: !this.state.alertDetailsIsOpen})
    }

    budgetHistoryPrompt = (item, withDetails) => () => {
        item.withDetails = withDetails !== undefined ? withDetails : false
        this.setState({
            categoryHistory: item,
            withDetailsProgress: true,
        }, () => {
            keyHistoryApi.post({
                body: {
                    budgetId: this.state.budgetActive.budgetId,
                    keyId: item.keyId,
                    expence: item.expence,
                    creditCardCalcTypeDesc: this.state.budgetActive.creditCardCalcTypeDesc,
                    companyAccountIds: this.state.budgetActive.budgetAccounts,
                    withDetails: item.withDetails,
                },
            })
                .then(response => {
                    console.log(response)
                    const categoryHistory = Object.assign({}, this.state.categoryHistory)
                    categoryHistory.history = response
                    console.log(response)
                    categoryHistory.history.monthsTotal = categoryHistory.history.monthsTotal.reverse()
                        .map((it, idx) => {
                            const d = new Date()
                            d.setMonth(
                                (categoryHistory.history.monthsTotal[0].monthNumber) - 1)
                            return {
                                month: AppTimezone.moment(d)
                                    .subtract((idx), 'months')
                                    .startOf('month')
                                    .valueOf(),
                                total: it.monthTotal,
                            }
                        })
                    this.setState({
                        categoryHistory,
                        withDetailsProgress: false,
                    })
                })
                .catch(() => {
                })
        })
    }

    handleUpdateTotalCategory = (total) => {
        const {setTotalCategoryInProgress} = this.state
        if (setTotalCategoryInProgress) {
            return
        }
        const categoryHistory = Object.assign({}, this.state.categoryHistory)
        categoryHistory.total = Number(total.replace(/\D/g, ''))

        this.setState({
            categoryHistory,
            setTotalCategoryInProgress: true,
        }, () => {
            this.updateBudgetDetails(categoryHistory)
        })
    }

    handleCloseTotalCategoryModal = () => {
        this.setState({
            totalCategoryModalIsOpen: false,
            setTotalCategoryInProgress: false,
        })
    }

    openPopUpAddEditDuplication = (type) => {
        this.setState({
            lengthSlides: [],
            ddCategoriesSource: [],
            ddCategories: [],
            activeSlide: 0,
            ddFrequencyDesc: [],
            ddCreditCardCalcTypeDesc: [],
            dataPopUpAddEditDuplication: {},
            disabledValuesPopUp: {},
            isKeyDetailsNotEqual: false,
            categoriesBudget: this.state.categoriesBudgetSrc,
        }, () => {
            const {
                currentCompanyId,
                accounts,
            } = this.props
            if (!accounts.length) {
                return
            }
            const {actionSheetTooltipCopy, categoriesBudget} = this.state
            let accountSelect
            if (type !== 'add' && actionSheetTooltipCopy) {
                accountSelect = actionSheetTooltipCopy.budgetAccounts.map((ids) => {
                    const accData = accounts.find(acc => acc.companyAccountId === ids)
                    if (accData) {
                        return accData
                    }
                }).filter((acc) => acc)
            } else {
                accountSelect =
                    accounts.filter((acc) => acc.currency === "ils")
            }

            const dataPopUpAddEditDuplication = {
                'budgetName': type !== 'edit' ? '' : actionSheetTooltipCopy.budgetName,
                'budgetTotalType': type === 'add'
                    ? 'outcome'
                    : actionSheetTooltipCopy.budgetTotalType,
                'budgetType': 'CATEGORY',
                'companyAccountIds': accountSelect.map((acc) => acc.companyAccountId),
                'companyId': currentCompanyId,
                'creditCardCalcTypeDesc': type === 'add'
                    ? 'CALC'
                    : actionSheetTooltipCopy
                        ? actionSheetTooltipCopy.creditCardCalcTypeDesc
                        : 'CALC',
                'dateFrom': type === 'add'
                    ? AppTimezone.moment().toDate()
                    : (actionSheetTooltipCopy ? AppTimezone.moment(
                        actionSheetTooltipCopy.dateFrom) : AppTimezone.moment().toDate()),
                'dateTill': type === 'add'
                    ? AppTimezone.moment().toDate()
                    : (actionSheetTooltipCopy ? AppTimezone.moment(
                        actionSheetTooltipCopy.dateTill) : AppTimezone.moment().toDate()),
                'frequencyDesc': type === 'add' ? 'MONTH' : actionSheetTooltipCopy
                    ? actionSheetTooltipCopy.frequencyDesc
                    : 'MONTH',
                'totalIncome': type === 'add' ? '' : actionSheetTooltipCopy
                    ? actionSheetTooltipCopy.totalIncome
                    : '',
                'totalOutcome': type === 'add' ? '' : actionSheetTooltipCopy
                    ? actionSheetTooltipCopy.totalOutcome
                    : '',
                'keyDetails': type === 'add' ? [] : actionSheetTooltipCopy
                    ? actionSheetTooltipCopy.budgetsDetails.details.map((it) => {
                        return {
                            'expence': it.expence,
                            'keyId': it.keyId,
                            'keyName': it.keyName,
                        }
                    })
                    : [],
            }
            let disableEditPopPast = false
            if (type === 'edit' && actionSheetTooltipCopy) {
                disableEditPopPast = (actionSheetTooltipCopy.frequencyDesc ===
                    'MONTH' || actionSheetTooltipCopy.frequencyDesc === 'YEAR')
                // ((actionSheetTooltipCopy.frequencyDesc === 'MONTH' && AppTimezone.moment(actionSheetTooltipCopy.dates.dateFrom).diff(AppTimezone.moment(actionSheetTooltipCopy.dateFrom), 'months') > 0) ||
                // (actionSheetTooltipCopy.frequencyDesc === 'YEAR' && AppTimezone.moment(actionSheetTooltipCopy.dates.dateFrom).diff(AppTimezone.moment(actionSheetTooltipCopy.dateFrom), 'years') > 0))
            }
            this.setState({
                typeOfPopup: type,
                selectedAccountIdsSave: JSON.parse(
                    JSON.stringify(accountSelect.map((acc) => acc.companyAccountId))),
                selectedGroupSave: accountSelect[0].currency ? accountSelect[0].currency.toLowerCase() : 'ils',
                selectedAccountIds: JSON.parse(
                    JSON.stringify(accountSelect.map((acc) => acc.companyAccountId))),
                selectedGroup: accountSelect[0].currency ? accountSelect[0].currency.toLowerCase() : 'ils',
                disabledValuesPopUp: {
                    budgetTotalType: (disableEditPopPast ||
                        (type === 'edit' && !actionSheetTooltipCopy) ||
                        (type === 'duplication' && actionSheetTooltipCopy &&
                            actionSheetTooltipCopy.frequencyDesc !== 'ONE_TIME')),
                    budgetType: true,
                },
                dataPopUpAddEditDuplication: dataPopUpAddEditDuplication,
                ddBudgetType: [
                    {
                        label: 'קטגוריות',
                        value: 'CATEGORY',
                    },
                ],
                ddBudgetTotalType: [
                    {
                        label: 'הוצאות',
                        value: 'outcome',
                    },
                    {
                        label: 'הכנסות',
                        value: 'income',
                    },
                    {
                        label: 'הכנסות והוצאות',
                        value: 'both',
                    },
                ],
                ddCreditCardCalcTypeDesc: [
                    {
                        label: 'לפי הסכום של התשלום החודשי',
                        value: 'CALC',
                    },
                    {
                        label: 'לפי הסכום הכולל של העסקה',
                        value: 'ORIGINAL',
                    },
                ],
                ddFrequencyDesc: [
                    {
                        label: 'חודשי',
                        value: 'MONTH',
                    },
                    {
                        label: 'שנתי',
                        value: 'YEAR',
                    },
                    {
                        label: 'חד פעמי',
                        value: 'ONE_TIME',
                    },
                ],
                ddCategories: [],
                copySourceKeyDetails: (actionSheetTooltipCopy && type === 'edit')
                    ? actionSheetTooltipCopy.budgetsDetails.details.map((it) => {
                        return {
                            'expence': it.expence,
                            'keyId': it.keyId,
                            'keyName': it.keyName,
                        }
                    })
                    : [],
                isKeyDetailsNotEqual: false,
            }, () => {
                if (!categoriesBudget.length) {
                    getCategoriesApi.post({
                        body: {
                            companyId: currentCompanyId,
                        },
                    })
                        .then(categoriesBudgets => {
                            this.setState({
                                categoriesBudgetSrc: categoriesBudget,
                                categoriesBudget: categoriesBudgets,
                            }, () => {
                                this.calculateCategories()
                            })
                        })
                        .catch(() => {
                        })
                } else {
                    this.calculateCategories()
                }
            })
        })
    }

    calculateCategories = (isAddCateg) => {
        const dataPopUpAddEditDuplication = this.state.dataPopUpAddEditDuplication
        const companyTransTypes = JSON.parse(JSON.stringify(this.state.categories))
        const keyDetails = dataPopUpAddEditDuplication.keyDetails
        const budgetTotalType = dataPopUpAddEditDuplication.budgetTotalType
        const ddCategories = JSON.parse(JSON.stringify(this.state.categoriesBudget))

        if (keyDetails) {
            ddCategories.push(...keyDetails
                .filter(det => !ddCategories.some(
                    cat => cat.transTypeId === det.keyId && cat.hova === det.expence))
                .map(det => {
                    return {
                        hova: det.expence,
                        add: false,
                        transTypeId: det.keyId,
                        transTypeName: det.keyName,
                    }
                }))

            ddCategories.forEach((it) => {
                if (keyDetails.find(
                    (id) => id.keyId === it.transTypeId && it.hova === id.expence)) {
                    it.press = true

                    if (budgetTotalType === 'both') {
                        const theOtherTypeTrans = ddCategories.find(
                            (item) => item.transTypeId === it.transTypeId && item.hova ===
                                !it.hova)
                        if (theOtherTypeTrans) {
                            theOtherTypeTrans.disabled = true
                        }
                    }
                }
            })
        }

        const incomes = ddCategories.filter((cat) => !cat.hova)
        const outcome = ddCategories.filter((cat) => cat.hova)
        if (budgetTotalType !== 'both') {
            this.setState({
                copyTransTypesIncome: companyTransTypes.filter((cat) => {
                    return !incomes.find((ddCat) => cat.transTypeId === ddCat.transTypeId)
                }),
                copyTransTypesExpence: companyTransTypes.filter((cat) => {
                    return !outcome.find((ddCat) => cat.transTypeId === ddCat.transTypeId)
                }),
            })
        }

        if (budgetTotalType === 'both') {
            this.setState({
                copyTransTypesIncome: companyTransTypes.filter((cat) => {
                    return !incomes.find(
                        (ddCat) => cat.transTypeId === ddCat.transTypeId) && !outcome.find(
                        (ddCat) => (cat.transTypeId === ddCat.transTypeId) && ddCat.press)
                }),
                copyTransTypesExpence: companyTransTypes.filter((cat) => {
                    return !outcome.find(
                        (ddCat) => cat.transTypeId === ddCat.transTypeId) && !incomes.find(
                        (ddCat) => (cat.transTypeId === ddCat.transTypeId) && ddCat.press)
                }),
            })
            incomes.sort((a, b) => {
                const lblA = a.transTypeName
                const lblB = b.transTypeName
                return (lblA || lblB) ? (!lblA ? 1 : !lblB ? -1 : lblA.localeCompare(
                    lblB)) : 0
            })
            incomes.push({
                hova: false,
                add: true,
                transTypeId: null,
                transTypeName: 'הוספת קטגוריה',
            })
            outcome.sort((a, b) => {
                const lblA = a.transTypeName
                const lblB = b.transTypeName
                return (lblA || lblB) ? (!lblA ? 1 : !lblB ? -1 : lblA.localeCompare(
                    lblB)) : 0
            })
            outcome.push({
                hova: true,
                add: true,
                transTypeId: null,
                transTypeName: 'הוספת קטגוריה',
            })

            this.setState({
                lengthSlides: [],
                ddCategories: incomes.concat(outcome),
                categoriesMatch: [],
                categoriesMatchCopy: [],
                categoriesMatchModal: false,
            }, () => {
                const lengthSlides = Array.from(
                    {length: Math.ceil(this.state.ddCategories.length / 6)},
                    (v, i) => i)
                // debugger
                // console.log('this.state.ddCategories', this.state.ddCategories, lengthSlides, isAddCateg)

                this.setState({
                    ddCategoriesSource: JSON.parse(
                        JSON.stringify(this.state.ddCategories)),
                    lengthSlides: lengthSlides,
                    activeSlide: isAddCateg
                        ? this.state.activeSlide
                        : (lengthSlides.length - 1),
                })
            })
        } else if (budgetTotalType === 'income') {
            incomes.sort((a, b) => {
                const lblA = a.transTypeName
                const lblB = b.transTypeName
                return (lblA || lblB) ? (!lblA ? 1 : !lblB ? -1 : lblA.localeCompare(
                    lblB)) : 0
            })
            incomes.push({
                hova: false,
                add: true,
                transTypeId: null,
                transTypeName: 'הוספת קטגוריה',
            })
            this.setState({
                lengthSlides: [],
                ddCategories: incomes,
                categoriesMatch: [],
                categoriesMatchCopy: [],
                categoriesMatchModal: false,
            }, () => {
                const lengthSlides = Array.from(
                    {length: Math.ceil(this.state.ddCategories.length / 6)},
                    (v, i) => i)
                // debugger
                // console.log('this.state.ddCategories', this.state.ddCategories, lengthSlides, isAddCateg)
                this.setState({
                    ddCategoriesSource: JSON.parse(
                        JSON.stringify(this.state.ddCategories)),
                    lengthSlides: lengthSlides,
                    activeSlide: isAddCateg
                        ? this.state.activeSlide
                        : (lengthSlides.length - 1),
                })
            })
        } else if (budgetTotalType === 'outcome') {
            outcome.sort((a, b) => {
                const lblA = a.transTypeName
                const lblB = b.transTypeName
                return (lblA || lblB) ? (!lblA ? 1 : !lblB ? -1 : lblA.localeCompare(
                    lblB)) : 0
            })
            outcome.push({
                hova: true,
                add: true,
                transTypeId: null,
                transTypeName: 'הוספת קטגוריה',
            })
            this.setState({
                lengthSlides: [],
                ddCategories: outcome,
                categoriesMatch: [],
                categoriesMatchCopy: [],
                categoriesMatchModal: false,
            }, () => {
                const lengthSlides = Array.from(
                    {length: Math.ceil(this.state.ddCategories.length / 6)},
                    (v, i) => i)
                // debugger
                // console.log('this.state.ddCategories', this.state.ddCategories, lengthSlides, isAddCateg)
                this.setState({
                    ddCategoriesSource: JSON.parse(
                        JSON.stringify(this.state.ddCategories)),
                    lengthSlides: lengthSlides,
                    activeSlide: isAddCateg
                        ? this.state.activeSlide
                        : (lengthSlides.length - 1),
                })
            })
        }
    }

    pressCategory = (category) => () => {
        if (!category.add) {
            const ddCategories = JSON.parse(JSON.stringify(this.state.ddCategories))
            ddCategories.find((a) => a.hova === category.hova && a.transTypeId ===
                category.transTypeId).press = !category.press

            let dataPopUpAddEditDuplication = Object.assign({},
                this.state.dataPopUpAddEditDuplication)
            if (dataPopUpAddEditDuplication.budgetTotalType === 'both') {
                const theOtherTypeTrans = ddCategories.find(
                    (it) => it.transTypeId === category.transTypeId && it.hova ===
                        !category.hova)
                if (theOtherTypeTrans) {
                    theOtherTypeTrans.disabled = !category.press
                }

                const categoriesMatch = category.hova ? JSON.parse(
                    JSON.stringify(this.state.copyTransTypesIncome)) : JSON.parse(
                    JSON.stringify(this.state.copyTransTypesExpence))
                const copyTransTypes = categoriesMatch.find(
                    (it) => it.transTypeId === category.transTypeId)
                if (copyTransTypes) {
                    copyTransTypes.hide = !category.press
                    this.setState(
                        !category.hova ? {
                            copyTransTypesExpence: categoriesMatch,
                        } : {
                            copyTransTypesIncome: categoriesMatch,
                        },
                    )
                }
            }

            dataPopUpAddEditDuplication.keyDetails = ddCategories.filter(
                (cate) => (!cate.add && cate.press))
                .map((it) => {
                    return {
                        'expence': it.hova,
                        'keyId': it.transTypeId,
                        'keyName': it.transTypeName,
                    }
                })
            this.setState({
                ddCategories,
                dataPopUpAddEditDuplication: dataPopUpAddEditDuplication,
            })
            if (this.state.typeOfPopup === 'edit') {
                const isEqual = this.state.copySourceKeyDetails.filter(o =>
                    dataPopUpAddEditDuplication.keyDetails.some(
                        v => v.keyId === o.keyId && v.expence === o.expence))
                this.setState({
                    isKeyDetailsNotEqual: (isEqual.length !==
                        this.state.copySourceKeyDetails.length),
                })
            }
        } else {
            const categoriesMatch = category.hova
                ? this.state.copyTransTypesExpence.filter((it) => !it.hide)
                : this.state.copyTransTypesIncome.filter((it) => !it.hide)
            this.setState({
                categoriesMatchModal: category.hova ? '#cd1010' : '#229f88',
                categoriesMatch: categoriesMatch,
                categoriesMatchCopy: categoriesMatch,
            })
        }
    }

    divideList(list) {
        const arr = []
        list.forEach((item, i) => {
            if (i % 4 === 0) {
                arr.push([item])
            } else {
                arr[arr.length - 1].push(item)
            }
        })
        if (arr[arr.length - 1].length < 4) {
            for (let x = 0; x < 5 - arr[arr.length - 1].length; x++) {
                arr[arr.length - 1].push({
                    press: null,
                })
            }
        }
        return arr
    }

    handleToggleCategory = (i) => () => {
        const {
            categoriesMatchCopy,
        } = this.state
        let categoriesMatch = JSON.parse(JSON.stringify(categoriesMatchCopy))
        const index = categoriesMatch.findIndex(
            (it) => it.transTypeId === i.transTypeId)
        categoriesMatch[index].press = !categoriesMatch[index].press
        this.setState({
            categoriesMatchCopy: categoriesMatch,
        })
    }

    handleCancelSaveCategories = () => {
        const {
            categoriesMatch,
        } = this.state

        this.setState({
            categoriesMatchCopy: categoriesMatch,
            categoriesMatchModal: false,
        })
    }

    handleSaveCategories = () => {
        const {
            categoriesMatchCopy,
            categoriesMatchModal,
        } = this.state
        const ddCategories = JSON.parse(JSON.stringify(this.state.categoriesBudget))
        let dataPopUpAddEditDuplication = Object.assign({},
            this.state.dataPopUpAddEditDuplication)
        const addCat = categoriesMatchCopy.filter((it) => it.press).map((item) => {
            const hova = categoriesMatchModal === '#cd1010'
            if (dataPopUpAddEditDuplication.budgetTotalType === 'both') {
                const theOtherTypeTrans = ddCategories.find(
                    (it) => it.transTypeId === item.transTypeId && it.hova === !hova)
                if (theOtherTypeTrans) {
                    theOtherTypeTrans.disabled = true
                }

                // const categoriesMatch = hova ? JSON.parse(JSON.stringify(this.state.copyTransTypesIncome)) : JSON.parse(JSON.stringify(this.state.copyTransTypesExpence))
                // const copyTransTypes = categoriesMatch.find((it) => it.transTypeId === item.transTypeId)
                // debugger
                // if (copyTransTypes) {
                //   copyTransTypes.hide = true
                //   this.setState(
                //     !hova ? {
                //       copyTransTypesExpence: categoriesMatch,
                //     } : {
                //       copyTransTypesIncome: categoriesMatch,
                //     }
                //   )
                // }
            }

            return {
                press: true,
                hova: hova,
                transTypeId: item.transTypeId,
                transTypeName: item.transTypeName,
            }
        })
        dataPopUpAddEditDuplication.keyDetails = dataPopUpAddEditDuplication.keyDetails.concat(
            addCat
                .map((it) => {
                    return {
                        'expence': it.hova,
                        'keyId': it.transTypeId,
                        'keyName': it.transTypeName,
                    }
                }))

        this.setState({
            ddCategories,
            categoriesBudget: ddCategories.concat(addCat),
            dataPopUpAddEditDuplication: dataPopUpAddEditDuplication,
        }, () => {
            this.calculateCategories(true)
        })
    }

    handleRemoveAllCategories = () => {
        const {
            categoriesMatchCopy,
        } = this.state
        let categoriesMatch = JSON.parse(JSON.stringify(categoriesMatchCopy))
        categoriesMatch.forEach(it => {
            it.press = false
        })
        this.setState({
            categoriesMatchCopy: categoriesMatch,
        })
    }

    renderItemCategory = ({item, index}) => {
        const idxReverse = (this.state.lengthSlides.length - 1) - index
        const ddCategories = JSON.parse(JSON.stringify(this.state.ddCategories))
        const slice = this.state.lengthSlides.length > 1 ? ddCategories.slice(
            (idxReverse * 6),
            ((idxReverse * 6) + 6),
        ) : ddCategories
        // console.log(slice)
        return (
            <View style={{
                flexDirection: 'row-reverse',
                alignItems: 'stretch',
                flexWrap: 'wrap',
                alignContent: 'stretch',
                justifyContent: 'space-between',
                paddingTop: 7,
            }}>
                {slice.map((a, i) => {
                    return (
                        <Fragment key={a.transTypeId + a.hova.toString()}>
                            {i === 3 && (
                                <View style={{
                                    flexBasis: '100%',
                                    height: 0,
                                }}/>
                            )}

                            {!a.disabled && (
                                <TouchableOpacity
                                    onPress={this.pressCategory(a)}
                                    style={[
                                        {
                                            height: 26.5,
                                            flex: a.transTypeName && a.transTypeName.length ? (a.add
                                                ? (a.transTypeName.length + 0.2)
                                                : a.transTypeName.length) : 0,
                                            borderWidth: a.add ? 2 : 1,
                                            borderColor: a.hova ? '#cd1010' : '#229f88',
                                            marginBottom: 7,
                                            backgroundColor: a.press ? (a.hova
                                                ? '#cd1010'
                                                : '#229f88') : '#ffffff',
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        }]}
                                >
                                    {a.add && (
                                        <View style={{
                                            paddingHorizontal: 2,
                                        }}>
                                            <Icons
                                                name="plus-circle"
                                                type="material-community"
                                                size={21}
                                                color={a.hova ? '#cd1010' : '#229f88'}
                                            /></View>
                                    )}

                                    <Text style={{
                                        alignSelf: 'center',
                                        textAlign: 'center',
                                        lineHeight: 17,
                                        fontSize: sp(17),
                                        color: a.press ? '#ffffff' : (a.add ? (a.hova
                                            ? '#cd1010'
                                            : '#229f88') : '#022258'),
                                        fontFamily: a.add ? fonts.semiBold : fonts.regular,
                                    }}>{a.transTypeName}</Text>
                                </TouchableOpacity>
                            )}
                            {a.disabled && (
                                <TouchableOpacity
                                    onPress={null}
                                    style={[
                                        {
                                            height: 26.5,
                                            flex: a.transTypeName && a.transTypeName.length ? (a.add
                                                ? (a.transTypeName.length + 0.2)
                                                : a.transTypeName.length) : 0,
                                            borderWidth: a.add ? 2 : 1,
                                            borderColor: a.hova ? '#cd1010' : '#229f88',
                                            marginBottom: 7,
                                            backgroundColor: a.press ? (a.hova
                                                ? '#cd1010'
                                                : '#229f88') : '#ffffff',
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                            opacity: 0.4,
                                        }]}
                                >
                                    {a.add && (
                                        <View style={{
                                            paddingHorizontal: 2,
                                        }}>
                                            <Icons
                                                name="plus-circle"
                                                type="material-community"
                                                size={21}
                                                color={a.hova ? '#cd1010' : '#229f88'}
                                            /></View>
                                    )}

                                    <Text style={{
                                        alignSelf: 'center',
                                        textAlign: 'center',
                                        lineHeight: 17,
                                        fontSize: sp(17),
                                        color: a.press ? '#ffffff' : (a.add ? (a.hova
                                            ? '#cd1010'
                                            : '#229f88') : '#022258'),
                                        fontFamily: a.add ? fonts.semiBold : fonts.regular,
                                    }}>{a.transTypeName}</Text>
                                </TouchableOpacity>
                            )}

                            {(i !== 2 && i !== 5) && (slice[i + 1] !== undefined) && (
                                <View style={{
                                    flex: 0.4,
                                }}/>
                            )}

                        </Fragment>
                    )
                })}
            </View>
        )
    }

    closePopUpEditAdd = () => {
        this.setState({typeOfPopup: null}, () => {

        })
    }

    savePopUp = () => {
        let dataPopUpAddEditDuplication = Object.assign({},
            this.state.dataPopUpAddEditDuplication)
        if (dataPopUpAddEditDuplication.budgetTotalType === 'income') {
            dataPopUpAddEditDuplication.totalOutcome = null
            dataPopUpAddEditDuplication.totalIncome = Number(
                dataPopUpAddEditDuplication.totalIncome)
            dataPopUpAddEditDuplication.keyDetails = dataPopUpAddEditDuplication.keyDetails
                .filter(kd => kd.expence !== true)
        } else if (dataPopUpAddEditDuplication.budgetTotalType === 'outcome') {
            dataPopUpAddEditDuplication.totalIncome = null
            dataPopUpAddEditDuplication.totalOutcome = Number(
                dataPopUpAddEditDuplication.totalOutcome)
            dataPopUpAddEditDuplication.keyDetails = dataPopUpAddEditDuplication.keyDetails
                .filter(kd => kd.expence === true)
        } else {
            dataPopUpAddEditDuplication.totalOutcome = Number(
                dataPopUpAddEditDuplication.totalOutcome)
            dataPopUpAddEditDuplication.totalIncome = Number(
                dataPopUpAddEditDuplication.totalIncome)
        }
        try {
            if (
                (dataPopUpAddEditDuplication.budgetTotalType === 'both' &&
                    ((!dataPopUpAddEditDuplication.totalIncome ||
                            (dataPopUpAddEditDuplication.totalIncome &&
                                !dataPopUpAddEditDuplication.totalIncome.toString().length)) ||
                        (!dataPopUpAddEditDuplication.totalOutcome ||
                            (dataPopUpAddEditDuplication.totalOutcome &&
                                !dataPopUpAddEditDuplication.totalOutcome.toString().length)))) ||
                (dataPopUpAddEditDuplication.budgetTotalType === 'income' &&
                    (!dataPopUpAddEditDuplication.totalIncome ||
                        (dataPopUpAddEditDuplication.totalIncome &&
                            !dataPopUpAddEditDuplication.totalIncome.toString().length))
                ) ||
                (dataPopUpAddEditDuplication.budgetTotalType === 'outcome' &&
                    (!dataPopUpAddEditDuplication.totalOutcome ||
                        (dataPopUpAddEditDuplication.totalOutcome &&
                            !dataPopUpAddEditDuplication.totalOutcome.toString().length))
                ) ||
                (!dataPopUpAddEditDuplication.budgetName ||
                    (dataPopUpAddEditDuplication.budgetName &&
                        !dataPopUpAddEditDuplication.budgetName.length)) ||
                !dataPopUpAddEditDuplication.keyDetails.length ||
                !dataPopUpAddEditDuplication.companyAccountIds.length
            ) {
                return this.setState({
                    dataPopUpAddEditDuplication,
                    hasError: true,
                })
            }
        } catch (e) {
        }
        this.setState({
            hasError: false,
            dataPopUpAddEditDuplication: dataPopUpAddEditDuplication,
        }, () => {
            console.log(this.state.dataPopUpAddEditDuplication)

            if (this.state.typeOfPopup === 'edit') {
                updateBudgetApi.post({
                    body: Object.assign({
                        budgetId: this.state.actionSheetTooltipCopy.budgetId,
                    }, this.state.dataPopUpAddEditDuplication),
                })
                    .then(response => {
                        this.setState({typeOfPopup: null})
                        this.getBudget()
                    })
                    .catch(() => {
                    })
            } else {
                createBudgetApi.post({
                    body: this.state.dataPopUpAddEditDuplication,
                })
                    .then(response => {
                        this.setState({typeOfPopup: null})
                        this.getBudget()
                    })
                    .catch(() => {
                    })
            }
        })
    }

    handleCloseSelectedAccounts = () => {
        this.setState({
            accountsModalIsOpen: false,
            selectedAccountIds: JSON.parse(
                JSON.stringify(this.state.selectedAccountIdsSave)),
            selectedGroup: JSON.parse(JSON.stringify(this.state.selectedGroupSave)),
        })
    }

    handleApplySelectedAccounts = () => {
        // selectedAccountIds
        this.handleCloseAccountsModal()
    }

    handleCloseAccountsModal = () => this.setState({accountsModalIsOpen: false})

    handleOpenAccountsModal = () => this.setState({
        accountsModalIsOpen: true,
    })

    handleSelectGroup = (currency, accountIds) => {
        this.setState({
            currentSelectedAccountId: null,
            selectedAccountIds: accountIds,
            selectedGroup: currency,
        })
    }

    handleSelectAccount = (selectedGroup, selectedAccountIds = [], fn) => {
        this.setState({
            accountsModalIsOpen: false,
            selectedAccountIds,
            selectedGroup,
            currentSelectedAccountId: null,
        }, () => {
            let dataPopUpAddEditDuplication = Object.assign({},
                this.state.dataPopUpAddEditDuplication)
            dataPopUpAddEditDuplication.companyAccountIds = selectedAccountIds
            this.setState(
                {dataPopUpAddEditDuplication: dataPopUpAddEditDuplication})
        })
    }

    editInput = (param) => () => {
        if (param === 'budgetTotalType') {
            const types = this.state.ddBudgetTotalType.map((item) => {
                return {
                    text: item.label,
                    id: item.value,
                    selected: (item.value ===
                        this.state.dataPopUpAddEditDuplication.budgetTotalType),
                }
            })
            this.setState({
                typeEditModal: 'budgetTotalType',
                titleModalInside: 'סוג התקציב',
                dataList: types,
            })
            this.setModalInsideVisible(true)()
        } else if (param === 'budgetType') {
            const types = this.state.ddBudgetType.map((item) => {
                return {
                    text: item.label,
                    id: item.value,
                    selected: (item.value ===
                        this.state.dataPopUpAddEditDuplication.budgetType),
                }
            })
            this.setState({
                typeEditModal: 'budgetType',
                titleModalInside: 'תקציב לפי',
                dataList: types,
            })
            this.setModalInsideVisible(true)()
        } else if (param === 'frequencyDesc') {
            const types = this.state.ddFrequencyDesc.map((item) => {
                return {
                    text: item.label,
                    id: item.value,
                    selected: (item.value ===
                        this.state.dataPopUpAddEditDuplication.frequencyDesc),
                }
            })
            this.setState({
                typeEditModal: 'frequencyDesc',
                titleModalInside: 'תקופת התקציב',
                dataList: types,
            })
            this.setModalInsideVisible(true)()
        } else if (param === 'dateFrom') {
            this.setState({
                typeEditModal: 'dateFrom',
                titleModalInside: 'החל מתאריך',
            })
            this.setModalInsideVisible(true)()
        } else if (param === 'dateTill') {
            this.setState({
                typeEditModal: 'dateTill',
                titleModalInside: 'תאריך סיום',
            })
            this.setModalInsideVisible(true)()
        }
    }

    setModalInsideVisible = (visible) => () => {
        this.setState({editModalInsideIsOpen: visible})
    }
    handleCloseCheckListModal = () => {
        this.setModalInsideVisible(!this.state.editModalInsideIsOpen)()
    }
    setDataState = (data) => {
        this.setState({
            dataPopUpAddEditDuplication: data,
        }, () => {
            if (this.state.typeEditModal === 'budgetTotalType') {
                this.calculateCategories()
            }
        })
    }
    handleToggleCheckBox = (type) => () => {
        let dataPopUpAddEditDuplication = Object.assign({},
            this.state.dataPopUpAddEditDuplication)
        dataPopUpAddEditDuplication.creditCardCalcTypeDesc = this.state.dataPopUpAddEditDuplication.creditCardCalcTypeDesc ===
        this.state.ddCreditCardCalcTypeDesc[0].value
            ? this.state.ddCreditCardCalcTypeDesc[1].value
            : this.state.ddCreditCardCalcTypeDesc[0].value
        this.setState({dataPopUpAddEditDuplication: dataPopUpAddEditDuplication})
    }
    handleSnapToItem = (index) => this.setState({activeSlide: index})
    setStates = (params) => () => {
        this.setState(params)
    }
    closeHistoryModal = () => {
        const {
            categoryHistory,
        } = this.state
        if (categoryHistory && categoryHistory.withDetails) {
            const obj = Object.assign({}, categoryHistory)
            obj.withDetails = false
            this.setState({
                categoryHistory: obj,
            })
        } else {
            this.setState({
                categoryHistory: null,
            })
        }
    }

    openPopUpCreateBudgetTrans = (isEdit) => {
        const {
            categoryHistory,
            itemTransFromHistory,
        } = this.state
        const {
            currentCompanyId,
        } = this.props
        this.setState({
            popUpCreateBudgetTransEdit: isEdit !== undefined,
            popUpCreateBudgetTrans: {
                'companyId': currentCompanyId,
                'transDate': isEdit
                    ? itemTransFromHistory.transDate
                    : AppTimezone.moment().startOf('day').valueOf(),
                'expence': categoryHistory.expence,
                'transName': isEdit
                    ? itemTransFromHistory.transName
                    : (categoryHistory.expence ? 'הוצאה' : 'הכנסה'),
                'transTotal': isEdit ? itemTransFromHistory.total : null,
                'transTypeId': categoryHistory.keyId,
            },
        })
    }
    editInputCalendar = () => {
        this.setState({
            editCalendar: true,
        })
    }
    hideCalendar = () => {
        this.setState({
            editCalendar: false,
        })
    }

    savePopUpCreateBudgetTrans = () => {
        const {
            popUpCreateBudgetTrans,
            popUpCreateBudgetTransEdit,
            itemTransFromHistory,
        } = this.state

        if (popUpCreateBudgetTrans.transTotal === null ||
            popUpCreateBudgetTrans.transTotal === '' ||
            popUpCreateBudgetTrans.transTotal === 0 ||
            popUpCreateBudgetTrans.transName === '') {
            return this.setState({
                totalNoValid: (popUpCreateBudgetTrans.transTotal === null ||
                    popUpCreateBudgetTrans.transTotal === '' ||
                    popUpCreateBudgetTrans.transTotal === 0),
                hasErrorCreateBudgetTrans: true,
            })
        }

        const copyPopUpCreateBudgetTrans = Object.assign({}, popUpCreateBudgetTrans)
        copyPopUpCreateBudgetTrans.transTotal = Number(
            copyPopUpCreateBudgetTrans.transTotal)
        const categoryHistory = Object.assign({}, this.state.categoryHistory)
        console.log(copyPopUpCreateBudgetTrans, categoryHistory)
        const sender = popUpCreateBudgetTransEdit
            ? updateBudgetTransApi
            : createBudgetTransApi
        sender.post({
            body: popUpCreateBudgetTransEdit ? {
                'transId': itemTransFromHistory.transId,
                'transName': copyPopUpCreateBudgetTrans.transName,
                'transDate': copyPopUpCreateBudgetTrans.transDate,
                'transTotal': copyPopUpCreateBudgetTrans.transTotal,
                'transTypeId': copyPopUpCreateBudgetTrans.transTypeId,
                'expence': copyPopUpCreateBudgetTrans.expence,
            } : copyPopUpCreateBudgetTrans,
        })
            .then(response => {
                try {
                    this.numLengOrgHistory = true

                    if (!popUpCreateBudgetTransEdit) {
                        categoryHistory.history.transes.unshift({
                            asmachta: null,
                            biziboxMutavId: null,
                            companyAccountId: null,
                            creditCardId: null,
                            hova: categoryHistory.expence,
                            keyId: categoryHistory.keyId,
                            kvua: false,
                            mutavName: null,
                            paymentDesc: 'Budget',
                            searchkeyId: null,
                            total: copyPopUpCreateBudgetTrans.transTotal,
                            transDate: copyPopUpCreateBudgetTrans.transDate,
                            transId: response,
                            transName: copyPopUpCreateBudgetTrans.transName,
                            transSource: 'BudgetTrans',
                            transTypePopup: false,
                        })
                        const monthDiffThisMonth = AppTimezone.moment()
                            .isSame(popUpCreateBudgetTrans.transDate, 'month')
                        if (monthDiffThisMonth) {
                            // this.transCalc += copyPopUpCreateBudgetTrans.transTotal
                        }
                        categoryHistory.history.monthsTotal.forEach((it1) => {
                            const monthDiff = AppTimezone.moment(it1.month)
                                .isSame(popUpCreateBudgetTrans.transDate, 'month')
                            if (monthDiff) {
                                it1.total = it1.total + copyPopUpCreateBudgetTrans.transTotal
                            }
                        })
                        if (categoryHistory.history.currentMonth) {
                            categoryHistory.history.currentMonth.forEach((it1) => {
                                if (AppTimezone.moment()
                                    .isSame(popUpCreateBudgetTrans.transDate, 'month')) {
                                    const monthDiff = AppTimezone.moment(
                                            popUpCreateBudgetTrans.transDate).format('D') ===
                                        ((it1.transDay).toString())
                                    if (monthDiff) {
                                        it1.dayTotal = it1.dayTotal +
                                            copyPopUpCreateBudgetTrans.transTotal
                                    }
                                }
                            })
                        }

                        categoryHistory.history.transes = categoryHistory.history.transes.filter(
                            (ite) => ite.keyId === categoryHistory.keyId)
                        categoryHistory.history.transesTotal = categoryHistory.history.transes.reduce(
                            (a, b) => a + b.total, 0)
                        const idxSlices = categoryHistory.history.monthsTotal.findIndex(
                            (v) => {
                                return AppTimezone.moment(v.month)
                                    .isBefore(AppTimezone.moment(), 'month') && v.total !== 0
                            })
                        const arrOldMonths = categoryHistory.history.monthsTotal.slice(
                            idxSlices, categoryHistory.history.monthsTotal.length - 1)
                        if (arrOldMonths.length) {
                            const averageTotal = arrOldMonths.reduce((a, b) => a + b.total, 0)
                            categoryHistory.history.average = Number(
                                (averageTotal / arrOldMonths.length).toFixed(1))
                        }
                    } else {
                        let totalDefDaily
                        let totalMinusDate = null
                        let totalDef
                        if (Number(itemTransFromHistory.total) !==
                            Number(copyPopUpCreateBudgetTrans.transTotal)) {
                            if (AppTimezone.moment()
                                .isSame(AppTimezone.moment(copyPopUpCreateBudgetTrans.transDate),
                                    'month')) {
                                totalDefDaily = Number(copyPopUpCreateBudgetTrans.transTotal) -
                                    Number(itemTransFromHistory.total)
                            }
                        } else {
                            if (!AppTimezone.moment()
                                .isSame(AppTimezone.moment(copyPopUpCreateBudgetTrans.transDate),
                                    'month')) {
                                totalDefDaily = -Number(copyPopUpCreateBudgetTrans.transTotal)
                            } else {
                                if (AppTimezone.moment(copyPopUpCreateBudgetTrans.transDate)
                                    .isSame(AppTimezone.moment(itemTransFromHistory.transDate),
                                        'month')) {
                                    if (!AppTimezone.moment(copyPopUpCreateBudgetTrans.transDate)
                                        .isSame(AppTimezone.moment(itemTransFromHistory.transDate),
                                            'day')) {
                                        totalDefDaily = itemTransFromHistory.transDate.toString()
                                    }
                                } else {
                                    totalDefDaily = Number(copyPopUpCreateBudgetTrans.transTotal)
                                }
                            }

                            if (!AppTimezone.moment(copyPopUpCreateBudgetTrans.transDate)
                                .isSame(AppTimezone.moment(itemTransFromHistory.transDate),
                                    'month')) {
                                totalMinusDate = itemTransFromHistory.transDate.toString()
                            }
                        }

                        const monthDefMonths =
                            AppTimezone.moment(copyPopUpCreateBudgetTrans.transDate)
                                .isSame(AppTimezone.moment(itemTransFromHistory.transDate),
                                    'month')
                        if (monthDefMonths) {
                            totalDef = Number(copyPopUpCreateBudgetTrans.transTotal) -
                                Number(itemTransFromHistory.total)
                            if (AppTimezone.moment()
                                .isSame(AppTimezone.moment(copyPopUpCreateBudgetTrans.transDate),
                                    'month')) {
                                // this.budgetHistoryPrompt.transCalc += Number(item.totalDef);
                            }
                        } else {
                            totalDef = Number(copyPopUpCreateBudgetTrans.transTotal)

                            const monthDefThisMonth =
                                AppTimezone.moment()
                                    .isSame(AppTimezone.moment(itemTransFromHistory.transDate),
                                        'month')
                            if (monthDefThisMonth) {
                                // this.budgetHistoryPrompt.transCalc -= Number(copyPopUpCreateBudgetTrans.transTotal);
                            } else {
                                const isThisMonth =
                                    AppTimezone.moment()
                                        .isSame(
                                            AppTimezone.moment(copyPopUpCreateBudgetTrans.transDate),
                                            'month')
                                if (isThisMonth) {
                                    // this.budgetHistoryPrompt.transCalc += Number(copyPopUpCreateBudgetTrans.transTotal);
                                }
                            }
                        }

                        copyPopUpCreateBudgetTrans.transTotal = Number(
                            copyPopUpCreateBudgetTrans.transTotal)
                        const idxTransEdit = categoryHistory.history.transes.findIndex(
                            it => it.transId === itemTransFromHistory.transId)
                        categoryHistory.history.transes[idxTransEdit].total = copyPopUpCreateBudgetTrans.transTotal
                        categoryHistory.history.transes[idxTransEdit].transDate = copyPopUpCreateBudgetTrans.transDate
                        categoryHistory.history.transes[idxTransEdit].transName = copyPopUpCreateBudgetTrans.transName

                        const val = categoryHistory.history.transes[idxTransEdit]
                        categoryHistory.history.monthsTotal.forEach((it1) => {
                            const monthDiff = AppTimezone.moment(it1.month)
                                .isSame(AppTimezone.moment(val.transDate), 'month')
                            if (monthDiff) {
                                it1.total = it1.total + totalDef
                            }
                            if (totalMinusDate) {
                                if (AppTimezone.moment(it1.month)
                                    .isSame(Number(totalMinusDate), 'month')) {
                                    it1.total = it1.total - copyPopUpCreateBudgetTrans.transTotal
                                }
                            }
                        })

                        categoryHistory.history.currentMonth.forEach((it1) => {
                            if (typeof totalDefDaily === 'number') {
                                if (AppTimezone.moment().isSame(val.transDate, 'month')) {
                                    const monthDiff = AppTimezone.moment(val.transDate)
                                        .format('D') === ((it1.transDay).toString())
                                    if (monthDiff) {
                                        it1.dayTotal = it1.dayTotal + totalDefDaily
                                    }
                                }
                            } else {
                                if (AppTimezone.moment().isSame(val.transDate, 'month')) {
                                    if (AppTimezone.moment(val.transDate).format('D') ===
                                        ((it1.transDay).toString())) {
                                        it1.dayTotal = it1.dayTotal + val.total
                                    }
                                }

                                if (AppTimezone.moment().isSame(Number(totalDefDaily), 'month')) {
                                    if (AppTimezone.moment(Number(totalDefDaily)).format('D') ===
                                        ((it1.transDay).toString())) {
                                        it1.dayTotal = it1.dayTotal - val.total
                                    }
                                }
                            }
                        })
                        categoryHistory.history.transesTotal = categoryHistory.history.transes.reduce(
                            (a, b) => a + b.total, 0)
                        const idxSlices = categoryHistory.history.monthsTotal.findIndex(
                            (v) => {
                                return AppTimezone.moment(v.month)
                                    .isBefore(AppTimezone.moment(), 'month') && v.total !== 0
                            })
                        const arrOldMonths = categoryHistory.history.monthsTotal.slice(
                            idxSlices, categoryHistory.history.monthsTotal.length - 1)
                        if (arrOldMonths.length) {
                            const averageTotal = arrOldMonths.reduce((a, b) => a + b.total, 0)
                            categoryHistory.history.average = (averageTotal /
                                arrOldMonths.length).toFixed(1)
                        }
                    }
                } catch (e) {
                    console.log(e)
                }

                this.setState({
                    categoryHistory,
                    popUpCreateBudgetTransEdit: false,
                    popUpCreateBudgetTrans: false,
                })
            })
            .catch((aaaa) => {
                debugger
            })
    }
    closePopUpCreateBudgetTrans = () => {
        this.setState({
            popUpCreateBudgetTransEdit: false,
            popUpCreateBudgetTrans: false,
        })
    }

    handleOpenCategoriesModal = () => {
        this.setState({categoriesModalIsOpen: true})
    }

    handleCloseCategoriesModal = () => {
        this.setState({
            categoriesModalIsOpen: false,
            categoryItem: null,
            idxCategory: 0,
        })
    }
    handleSelectCategory = (category) => {
        const {itemTransFromHistory} = this.state
        if (!itemTransFromHistory || itemTransFromHistory.transTypeId ===
            category.transTypeId) {
            return
        }

        const newBankTrans = {
            ...itemTransFromHistory,
            iconType: category.iconType,
            transTypeId: category.transTypeId,
            transTypeName: category.transTypeName,
        }
        return this.handleUpdateBankTrans(newBankTrans)
    }

    handleUpdateBankTrans = (newBankTrans) => {
        const {currentCompanyId} = this.props
        if (newBankTrans.transTypePopup) {
            this.setState({
                categoriesModalIsOpen: false,
                updateTypePopup: newBankTrans,
            })
        } else {
            newBankTrans.keyId = newBankTrans.transTypeId
            const params = {
                'transTypeId': newBankTrans.keyId,
                'companyAccountId': newBankTrans.paymentDesc !== 'Budget'
                    ? newBankTrans.companyAccountId
                    : null,
                'transId': newBankTrans.transId,
                'biziboxMutavId': newBankTrans.paymentDesc !== 'Budget'
                    ? newBankTrans.biziboxMutavId
                    : null,
                'companyId': currentCompanyId,
                'updateType': 'row update',
                'transSource': newBankTrans.paymentDesc !== 'Budget'
                    ? newBankTrans.transSource
                    : 'BudgetTrans',
                'paymentDesc': newBankTrans.paymentDesc,
                'searchkeyId': newBankTrans.paymentDesc !== 'Budget'
                    ? newBankTrans.searchkeyId
                    : null,
                'kvua': newBankTrans.paymentDesc !== 'Budget'
                    ? newBankTrans.kvua
                    : false,
            }
            return updateTransTypeApi.post({
                body: params,
            }).then(() => {
                this.numLengOrgHistory = true

                const categoryHistory = Object.assign({}, this.state.categoryHistory)
                const val = newBankTrans
                const monthDefThisMonth =
                    AppTimezone.moment()
                        .isSame(AppTimezone.moment(val.transDate), 'month')
                if (monthDefThisMonth) {
                    // this.budgetHistoryPrompt.transCalc -= Number(val.total);
                }
                categoryHistory.history.transes = categoryHistory.history.transes.filter(
                    (it) => it.transId !== val.transId)
                categoryHistory.history.transesTotal = categoryHistory.history.transes.reduce(
                    (a, b) => a + b.total, 0)
                categoryHistory.history.monthsTotal.forEach((it) => {
                    const monthDiff = AppTimezone.moment(it.month)
                        .isSame(AppTimezone.moment(val.transDate), 'month')
                    if (monthDiff) {
                        it.total = it.total - Number(val.total)
                    }
                })

                categoryHistory.history.currentMonth.forEach((it) => {
                    if (AppTimezone.moment().isSame(val.transDate, 'month')) {
                        const monthDiff = AppTimezone.moment(val.transDate).format('D') ===
                            ((it.transDay).toString())
                        if (monthDiff) {
                            it.dayTotal = it.dayTotal - Number(val.total)
                        }
                    }
                })

                const idxSlices = categoryHistory.history.monthsTotal.findIndex((v) => {
                    return AppTimezone.moment(v.month)
                        .isBefore(AppTimezone.moment(), 'month') && v.total !== 0
                })
                const arrOldMonths = categoryHistory.history.monthsTotal.slice(
                    idxSlices, categoryHistory.history.monthsTotal.length - 1)
                if (arrOldMonths.length) {
                    const averageTotal = arrOldMonths.reduce((a, b) => a + b.total, 0)
                    categoryHistory.history.average = (averageTotal /
                        arrOldMonths.length).toFixed(1)
                }
                this.setState({
                    categoryHistory,
                    categoriesModalIsOpen: false,
                    itemTransFromHistory: {},
                }, () => {

                })
            })
        }
    }

    handleCreateBankTransCategory = (transTypeName) => {
        const {currentCompanyId} = this.props
        return createAccountCflTransTypeApi.post({
            body: {
                'transTypeId': null,
                transTypeName,
                companyId: currentCompanyId,
            },
        })
    }

    handleRemoveBankTransCategory = (transTypeId) => {
        const {currentCompanyId} = this.props
        return removeAccountCflTransTypeApi.post({
            body: {
                transTypeId,
                companyId: currentCompanyId,
            },
        })
    }

    handleTransCategory = (transType) => () => {
        this.setState({
            updateType: transType,
        })
    }

    closeUpdateTypePopup = () => {
        this.setState({
            updateType: 'only',
            updateTypePopup: false,
        })
    }

    updateTypeOfTrans = () => {
        const {updateTypePopup, updateType} = this.state
        const {currentCompanyId} = this.props
        updateTypePopup.keyId = updateTypePopup.transTypeId
        const params = {
            'transTypeId': updateTypePopup.keyId,
            'companyAccountId': updateTypePopup.paymentDesc !== 'Budget'
                ? updateTypePopup.companyAccountId
                : null,
            'transId': updateTypePopup.transId,
            'biziboxMutavId': updateTypePopup.paymentDesc !== 'Budget'
                ? updateTypePopup.biziboxMutavId
                : null,
            'companyId': currentCompanyId,
            'updateType': 'row update',
            'transSource': updateTypePopup.paymentDesc !== 'Budget'
                ? updateTypePopup.transSource
                : 'BudgetTrans',
            'paymentDesc': updateTypePopup.paymentDesc,
            'searchkeyId': updateTypePopup.paymentDesc !== 'Budget'
                ? updateTypePopup.searchkeyId
                : null,
            'kvua': updateTypePopup.paymentDesc !== 'Budget'
                ? updateTypePopup.kvua
                : false,
        }

        switch (updateType) {
            case 'only':
                params.updateType = 'row update'
                break
            case 'both':
                params.updateType = 'future+past'
                break
            case 'past':
                params.updateType = 'past'
                break
            case 'future':
                params.updateType = 'future'
                break
        }
        return updateTransTypeApi.post({
            body: params,
        }).then(() => {
            this.numLengOrgHistory = true
            if (updateType === 'both' || updateType === 'past') {
                this.setState({
                    categoriesModalIsOpen: false,
                    itemTransFromHistory: {},
                    updateType: 'only',
                    updateTypePopup: false,
                }, () => {
                    this.budgetHistoryPrompt(this.state.categoryHistory, true)()
                })
            } else {
                const categoryHistory = Object.assign({}, this.state.categoryHistory)
                const val = updateTypePopup
                const monthDefThisMonth =
                    AppTimezone.moment()
                        .isSame(AppTimezone.moment(val.transDate), 'month')
                if (monthDefThisMonth) {
                    // this.budgetHistoryPrompt.transCalc -= Number(val.total);
                }
                categoryHistory.history.transes = categoryHistory.history.transes.filter(
                    (it) => it.transId !== val.transId)
                categoryHistory.history.transesTotal = categoryHistory.history.transes.reduce(
                    (a, b) => a + b.total, 0)
                categoryHistory.history.monthsTotal.forEach((it) => {
                    const monthDiff = AppTimezone.moment(it.month)
                        .isSame(AppTimezone.moment(val.transDate), 'month')
                    if (monthDiff) {
                        it.total = it.total - Number(val.total)
                    }
                })
                categoryHistory.history.currentMonth.forEach((it) => {
                    if (AppTimezone.moment().isSame(val.transDate, 'month')) {
                        const monthDiff = AppTimezone.moment(val.transDate).format('D') ===
                            ((it.transDay).toString())
                        if (monthDiff) {
                            it.dayTotal = it.dayTotal - Number(val.total)
                        }
                    }
                })
                const idxSlices = categoryHistory.history.monthsTotal.findIndex((v) => {
                    return AppTimezone.moment(v.month)
                        .isBefore(AppTimezone.moment(), 'month') && v.total !== 0
                })
                const arrOldMonths = categoryHistory.history.monthsTotal.slice(
                    idxSlices, categoryHistory.history.monthsTotal.length - 1)
                if (arrOldMonths.length) {
                    const averageTotal = arrOldMonths.reduce((a, b) => a + b.total, 0)
                    categoryHistory.history.average = (averageTotal /
                        arrOldMonths.length).toFixed(1)
                }
                this.setState({
                    categoryHistory,
                    categoriesModalIsOpen: false,
                    itemTransFromHistory: {},
                    updateType: 'only',
                    updateTypePopup: false,
                }, () => {

                })
            }
        })
    }

    render() {
        const {
            isRtl, t,
            accountGroups,
            accounts,
            currentCompanyId,
        } = this.props
        const {
            isLayoutComplete,
            dataBudgets,
            loaderPrivScreen,
            privScreenEmpty,
            actionSheetTooltip,
            actionSheetItemList,
            currentOpenItemIndex,
            inProgressSnap,
            alertsItem,
            alertsItemType,
            prcAlertSetVal,
            itemPanelOfCategories,
            deleteBudgetDialog,
            accountsNotUpdates,
            alertDetailsIsOpen,
            isReady,
            categoryHistory,
            totalCategoryModalIsOpen,
            setTotalCategoryInProgress,
            typeOfPopup,
            hasError,
            selectedAccountIds,
            selectedGroup,
            accountsModalIsOpen,
            editModalInsideIsOpen,
            activeSlide,
            lengthSlides,
            categoriesMatchCopy,
            categoriesMatchModal,
            budgetActive,
            isKeyDetailsNotEqual,
            withDetailsProgress,
            popUpCreateBudgetTrans,
            editCalendar,
            hasErrorCreateBudgetTrans,
            categoriesModalIsOpen,
            updateTypePopup,
            updateType,
            itemTransFromHistory,
            popUpCreateBudgetTransEdit,
        } = this.state
        if (!isLayoutComplete) {
            return (<Loader overlay containerStyle={{backgroundColor: 'white'}}/>)
        }

        StatusBar.setBarStyle((IS_IOS || currentOpenItemIndex !== null)
            ? 'dark-content'
            : 'light-content', true)
        const rowStyle = isRtl ? 'row-reverse' : 'row'

        let disableEditPopPast = false
        if (categoryHistory !== null && budgetActive) {
            disableEditPopPast = ((budgetActive.frequencyDesc === 'MONTH' &&
                    AppTimezone.moment(budgetActive.dates.dateFrom)
                        .diff(AppTimezone.moment(budgetActive.dateFrom), 'months') > 0) ||
                (budgetActive.frequencyDesc === 'YEAR' &&
                    AppTimezone.moment(budgetActive.dates.dateFrom)
                        .diff(AppTimezone.moment(budgetActive.dateFrom), 'years') > 0))
        }

        // console.log('lengthSlides.length', lengthSlides)
        // console.log('----dataBudgets----', dataBudgets)

        return (
            <Fragment>
                <View style={{
                    backgroundColor: 'white',
                    flexGrow: 1,
                    flex: 1,
                }}>
                    <View style={{
                        position: 'absolute',
                        top: 4,
                        right: 0,
                        left: 0,
                        height: 6,
                        width: '100%',
                        zIndex: 9,
                    }}>
                        <View style={{
                            backgroundColor: 'white',
                            shadowColor: '#f2f2f2',
                            shadowOpacity: 1,
                            shadowOffset: {
                                width: 0,
                                height: -6,
                            },
                            elevation: 6,
                            height: 6,
                            width: '100%',
                        }}/>
                    </View>

                    {((!loaderPrivScreen && !privScreenEmpty)) && (
                        <View style={{
                            backgroundColor: 'white',
                            zIndex: 9999,
                        }}>
                            <View style={{
                                height: 56.5,
                                flexDirection: 'row',
                                justifyContent: 'center',
                                borderBottomColor: '#f0f1f2',
                                borderBottomWidth: 1,
                                marginHorizontal: 22.5,
                            }}>
                                <Text style={{
                                    textAlign: 'center',
                                    alignSelf: 'center',
                                    color: '#022258',
                                    fontSize: sp(24),
                                    fontFamily: fonts.semiBold,
                                }}>תקציב</Text>
                            </View>

                            {(accountsNotUpdates && accountsNotUpdates.length === 1) && (
                                <View style={{
                                    height: 47.5,
                                    backgroundColor: '#feecec',
                                    borderTopColor: 'red',
                                    borderTopWidth: 3,
                                    alignItems: 'center',
                                    flexDirection: 'row-reverse',
                                    justifyContent: 'center',
                                }}>
                                    <Text style={{
                                        color: '#ef3636',
                                        fontFamily: fonts.semiBold,
                                        fontSize: sp(17.5),
                                        textAlign: 'center',
                                    }}>
                                        {'הנתונים לא מעודכנים לחשבון'} {t(
                                        `bankName:${accountsNotUpdates[0].bankId}`)} {accountsNotUpdates[0].bankAccountId} {getCurrencyChar(
                                        accountsNotUpdates[0].currency)}

                                        {' '}
                                        <Text style={{
                                            color: '#022258',
                                            fontFamily: fonts.regular,
                                            fontSize: sp(16),
                                        }}>
                                            {t(
                                                'bankAccount:lastUpdatedXDaysAgo',
                                                {
                                                    days: AppTimezone.moment()
                                                        .diff(accountsNotUpdates[0].balanceLastUpdatedDate,
                                                            'days'),
                                                },
                                            )}
                                        </Text>
                                    </Text>
                                </View>
                            )}

                            {(accountsNotUpdates && accountsNotUpdates.length > 1) && (
                                <TouchableOpacity
                                    onPress={this.handleToggleAlertDetails}
                                    style={{
                                        height: 47.5,
                                        backgroundColor: '#feecec',
                                        borderTopColor: 'red',
                                        borderTopWidth: 3,
                                        alignItems: 'center',
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'center',
                                    }}>
                                    <View style={{
                                        marginHorizontal: 5,
                                    }}>
                                        <CustomIcon name="exclamation-triangle" size={18}
                                                    color={colors.red2}/>
                                    </View>
                                    <Text style={{
                                        color: '#ef3636',
                                        fontFamily: fonts.semiBold,
                                        fontSize: sp(17.5),
                                        textAlign: 'center',
                                        textDecorationLine: 'underline',
                                        textDecorationStyle: 'solid',
                                        textDecorationColor: '#ef3636',
                                    }}>
                                        {t('bankAccount:accountsNotUpdates',
                                            {count: accountsNotUpdates.length})}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                    {(alertDetailsIsOpen) && (
                        <Fragment>
                            <TouchableOpacity style={styles.alertDetailsBackgroundWrapper}
                                              onPress={this.handleToggleAlertDetails}/>

                            <ScrollView
                                style={[styles.alertDetailsWrapper, {top: 105}]}
                                contentContainerStyle={styles.alertDetailsContainer}
                            >
                                {accountsNotUpdates && accountsNotUpdates.map((a, i) => {
                                    const isLast = i + 1 >= accountsNotUpdates.length

                                    return (
                                        <TouchableOpacity
                                            key={a.companyAccountId}
                                            style={cs(isRtl, cs(isLast, styles.alertDetailsRow,
                                                {borderBottomWidth: 0}), commonStyles.rowReverse)}
                                            onPress={null}>
                                            <Text style={styles.alertDetailsText} numberOfLines={1}>
                                                {t(
                                                    `bankName:${a.bankId}`)} {a.bankAccountId} {getCurrencyChar(
                                                a.currency)}
                                            </Text>

                                            <Text style={[
                                                styles.alertAdditionalText,
                                                {color: colors.red2, fontFamily: fonts.regular}]}>
                                                {t(
                                                    'bankAccount:lastUpdatedXDaysAgo',
                                                    {
                                                        days: AppTimezone.moment()
                                                            .diff(a.balanceLastUpdatedDate, 'days'),
                                                    },
                                                )}
                                            </Text>
                                        </TouchableOpacity>
                                    )
                                })}
                            </ScrollView>
                        </Fragment>
                    )}
                    {loaderPrivScreen && (
                        <View style={{
                            flexDirection: 'column',
                            alignSelf: 'center',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            alignContent: 'center',
                            flex: 1,
                            marginTop: 110,
                            paddingHorizontal: 20,
                        }}>
                            <CustomIcon name="bag" size={50} color={colors.blue32}/>
                            <Text style={{
                                textAlign: 'center',
                                alignSelf: 'center',
                                color: '#022258',
                                fontSize: sp(20),
                                fontFamily: fonts.regular,
                                marginTop: 18,
                            }}>
                                {'אנחנו מכינים עבורך את התקציב\nהתהליך יכול לקחת מספר שניות'}
                            </Text>
                        </View>
                    )}

                    {privScreenEmpty && (
                        <View style={{
                            flexDirection: 'column',
                            alignSelf: 'center',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            alignContent: 'center',
                            flex: 1,
                            marginTop: 110,
                            paddingHorizontal: 20,
                        }}>
                            <CustomIcon name="bag" size={50} color={colors.blue32}/>
                            <Text style={{
                                textAlign: 'center',
                                alignSelf: 'center',
                                color: '#022258',
                                fontSize: sp(21),
                                fontFamily: fonts.semiBold,
                                marginTop: 18,
                            }}>
                                {'ברוכים הבאים למסך תקציב'}
                            </Text>
                            <Text style={{
                                textAlign: 'center',
                                alignSelf: 'center',
                                color: '#022258',
                                fontSize: sp(18),
                                fontFamily: fonts.regular,
                            }}>
                                {'מומלץ להתחיל עם תקציב חודשי אשר מורכב מקטגוריות שתרצו לעקוב אחריהן'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    this.openPopUpAddEditDuplication('add')
                                }}
                                style={{
                                    marginTop: 35,
                                    width: 223,
                                    height: 42,
                                    borderRadius: 6,
                                    backgroundColor: '#022258',
                                    flexDirection: 'row',
                                    justifyContent: 'center',
                                }}>
                                <Text style={{
                                    textAlign: 'center',
                                    alignSelf: 'center',
                                    color: '#ffffff',
                                    fontSize: sp(17),
                                    fontFamily: fonts.semiBold,
                                }}>
                                    {'הוספת תקציב'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {(dataBudgets && dataBudgets.length > 0 && dataBudgets[0].budgetId &&
                        (!loaderPrivScreen && !privScreenEmpty)) && (
                        <Fragment>
                            <AnimatedFlatList
                                refreshControl={
                                    <RefreshControl
                                        refreshing={this.state.refreshing}
                                        onRefresh={this._onRefreshTable}
                                    />
                                }
                                extraData={this.state}
                                bounces
                                bouncesZoom
                                enableOnAndroid={false}
                                removeClippedSubviews
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                                scrollEnabled
                                onScrollEndDrag={this.handleScrollEnd}
                                onMomentumScrollEnd={this.handleScrollEnd}
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
                                        paddingTop: 3,
                                        zIndex: 9,
                                        paddingBottom: 12,
                                        width: '100%',
                                    }]}
                                scrollEventThrottle={IS_IOS ? 16 : 1}
                                data={dataBudgets}
                                renderItem={this.renderItem}
                                ItemSeparatorComponent={this.renderItemSeparator}
                                keyExtractor={(item, index) => item.budgetId}
                                initialNumToRender={55}
                                windowSize={5}
                            />

                            <ActionButton
                                onPress={() => {
                                    this.openPopUpAddEditDuplication('add')
                                }}
                                bgColor="#ffffffbf"
                                buttonColor="#0addc1"
                                size={54}
                                spacing={0}
                                buttonTextStyle={{
                                    fontSize: 54,
                                    lineHeight:54,
                                    textAlign: 'center',
                                    marginTop: (IS_IOS ? -6 : 3),
                                }}
                            />
                        </Fragment>
                    )}

                    <View style={[styles.panelContainer]} pointerEvents={'box-none'}>
                        <TouchableWithoutFeedback
                            onPress={this.close}
                            style={[
                                {
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 9,
                                }]}>
                            <Animated.View
                                pointerEvents={currentOpenItemIndex === null
                                    ? 'box-none'
                                    : 'auto'}
                                style={[
                                    {
                                        backgroundColor: 'black',
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        zIndex: 9,
                                        opacity: this._deltaY.interpolate({
                                            inputRange: [
                                                0,
                                                1,
                                                Screen.height - 360,
                                                Screen.height + 30],
                                            outputRange: [0, 0.8, 0.8, 0],
                                            extrapolate: 'clamp',
                                        }),
                                    }]}/>
                        </TouchableWithoutFeedback>

                        <Interactable.View
                            style={{
                                zIndex: 999,
                            }}
                            onSnapStart={this.onDrawerSnap}
                            verticalOnly
                            animatedValueX={new Animated.Value(0)}
                            ref={this.handleSetRef}
                            snapPoints={[
                                {y: 40},
                                {y: Screen.height - 360},
                                {y: Screen.height + 30}]}
                            boundaries={{top: -360}}
                            initialPosition={{y: Screen.height + 30}}
                            animatedValueY={this._deltaY}>
                            <View style={styles.panel}>
                                <View style={styles.panelHeader}>
                                    <View style={styles.panelHandle}/>
                                </View>

                                <View style={{
                                    left: 0,
                                    right: 0,
                                    height: Screen.height - 90,
                                }}>
                                    {categoryHistory === null &&
                                        (itemPanelOfCategories && itemPanelOfCategories.indDefault !==
                                            null && (itemPanelOfCategories.indDefault === 1 ||
                                                itemPanelOfCategories.indDefault === 2)) && (
                                            <View style={{
                                                height: 45,
                                                borderBottomColor: '#f0f1f2',
                                                borderBottomWidth: 1,
                                                flexDirection: 'row-reverse',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <TouchableOpacity
                                                    style={{
                                                        paddingHorizontal: 20,
                                                        flexDirection: 'row-reverse',
                                                        alignItems: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                    onPress={this.restore(
                                                        itemPanelOfCategories.indDefault === 1
                                                            ? 'refresh'
                                                            : 'restore', itemPanelOfCategories)}>
                                                    <Text style={{
                                                        color: '#037dba',
                                                        fontFamily: fonts.regular,
                                                        fontSize: sp(18),
                                                    }}>{(itemPanelOfCategories.indDefault === 1)
                                                        ? 'רענון נתונים'
                                                        : 'שיחזור תקציב bizibox'}</Text>

                                                    <Icon name="chevron-left" size={24} color={'#037dba'}/>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                    {categoryHistory !== null && (
                                        <View>
                                            <View style={{
                                                paddingHorizontal: 15,
                                                flexDirection: 'row-reverse',
                                            }}>
                                                <TouchableOpacity
                                                    style={{
                                                        flex: 10,
                                                        alignSelf: 'center',
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                    }}
                                                    onPress={this.closeHistoryModal}>
                                                    <Icon
                                                        name="chevron-thin-right"
                                                        type="entypo"
                                                        size={26}
                                                        color={'#022258'}
                                                    />
                                                </TouchableOpacity>
                                                <View style={{
                                                    flexDirection: 'row-reverse',
                                                    justifyContent: 'center',
                                                    alertsItem: 'center',
                                                    alignContent: 'center',
                                                    height: 47,
                                                    flex: 80,
                                                }}>
                                                    {!categoryHistory.withDetails && (
                                                        <Fragment>
                                                            <CustomIcon
                                                                style={{
                                                                    alignSelf: 'center',
                                                                    marginTop: 2,
                                                                }}
                                                                name={categoryHistory.nameIcon}
                                                                size={20}
                                                                color={'#022258'}/>
                                                            <View style={commonStyles.spaceDividerDouble}/>
                                                        </Fragment>
                                                    )}
                                                    {categoryHistory.withDetails && (
                                                        <Text
                                                            style={styles.panelTitle}>{'פירוט תנועות - '}</Text>
                                                    )}
                                                    <Text
                                                        style={styles.panelTitle}>{categoryHistory.keyName}</Text>
                                                </View>

                                                <View
                                                    style={{
                                                        flex: 10,
                                                    }}/>
                                            </View>
                                            <View style={{
                                                height: 1,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                alignSelf: 'center',
                                                width: '100%',
                                                backgroundColor: colors.gray30,
                                            }}/>
                                        </View>
                                    )}
                                    <Animated.ScrollView
                                        ref={scrollViewTop => (this.scrollViewTop = scrollViewTop)}
                                        maximumZoomScale={0}
                                        decelerationRate={'fast'}
                                        disableIntervalMomentum
                                        disableScrollViewPanResponder
                                        directionalLockEnabled
                                        automaticallyAdjustContentInsets={false}
                                        scrollEnabled={currentOpenItemIndex === 'Top' ||
                                            (currentOpenItemIndex === 'Middle' && inProgressSnap)}
                                        showsVerticalScrollIndicator={false}
                                        scrollEventThrottle={1}
                                        onScroll={(e) => this._onScroll(e)}>

                                        {categoryHistory === null &&
                                            (itemPanelOfCategories && itemPanelOfCategories.incomes &&
                                                itemPanelOfCategories.incomes.length > 0) && (
                                                <View style={{
                                                    height: 53,
                                                    flexDirection: 'row-reverse',
                                                    alignItems: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'center',
                                                    borderBottomColor: '#f0f1f2',
                                                    borderBottomWidth: 1,
                                                }}>
                                                    <Text style={{
                                                        color: '#229f88',
                                                        fontFamily: fonts.semiBold,
                                                        fontSize: sp(19),
                                                    }}>{'הכנסה'}</Text>
                                                    <Text>{' '}</Text>
                                                    <Text style={{
                                                        color: '#022258',
                                                        fontFamily: fonts.semiBold,
                                                        fontSize: sp(19),
                                                    }}>{itemPanelOfCategories.currency} {getFormattedValueArray(
                                                        itemPanelOfCategories.totals[1])[0]}</Text>
                                                </View>
                                            )}

                                        {categoryHistory === null &&
                                            (itemPanelOfCategories && itemPanelOfCategories.incomes &&
                                                itemPanelOfCategories.incomes.length > 0) &&
                                            itemPanelOfCategories.incomes.map((item, i) => {
                                                return (<View
                                                    style={{
                                                        paddingRight: 10,
                                                        paddingLeft: 20,
                                                        flexDirection: 'row-reverse',
                                                        alignItems: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'space-between',
                                                        paddingVertical: 13,
                                                        borderBottomColor: '#f0f1f2',
                                                        borderBottomWidth: 1,
                                                    }}
                                                    key={item.keyId}>
                                                    <View style={{
                                                        flex: 605,
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row-reverse',
                                                            alignItems: 'center',
                                                            alignContent: 'center',
                                                            justifyContent: 'space-between',
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                justifyContent: 'center',
                                                                alertsItem: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                <CustomIcon
                                                                    style={{
                                                                        alignSelf: 'center',
                                                                    }}
                                                                    name={item.nameIcon}
                                                                    size={22}
                                                                    color={'#022258'}/>
                                                                <Text style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(18),
                                                                    fontFamily: fonts.regular,
                                                                    paddingHorizontal: 5,
                                                                }}>{item.keyName}</Text>
                                                                <Text style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(18),
                                                                    fontFamily: fonts.regular,
                                                                }}> {itemPanelOfCategories.currency} {getFormattedValueArray(
                                                                    item.total)[0]}</Text>
                                                            </View>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                justifyContent: 'center',
                                                                alertsItem: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                {(item.alert)
                                                                    ? (<Fragment>
                                                                        <CustomIcon name="bell-enable" size={18}
                                                                                    color={'#022258'}/>
                                                                        <Text style={{
                                                                            color: '#022258',
                                                                            fontSize: sp(17),
                                                                            fontFamily: fonts.light,
                                                                            marginHorizontal: 3,
                                                                        }}>{item.alertPrc}%</Text>
                                                                    </Fragment>)
                                                                    : (<Fragment>
                                                                        <CustomIcon name="bell-disable" size={18}
                                                                                    color={'#9e9e9e'}/>
                                                                        <Text style={{
                                                                            color: '#022258',
                                                                            fontSize: sp(17),
                                                                            marginHorizontal: 3,
                                                                            fontFamily: fonts.light,
                                                                        }}>{item.alertPrc}%</Text>
                                                                    </Fragment>)
                                                                }
                                                            </View>
                                                        </View>

                                                        <View style={{
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alertsItem: 'center',
                                                            alignContent: 'center',
                                                            marginTop: 10,
                                                            marginBottom: 2,
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                justifyContent: 'flex-end',
                                                                alertsItem: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                <Text style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(18),
                                                                    fontFamily: fonts.regular,
                                                                }}>נצברו</Text>
                                                                <Text style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(18),
                                                                    fontFamily: fonts.regular,
                                                                }}>{itemPanelOfCategories.currency} {item.totalKeyUse <
                                                                0 ? '' : getFormattedValueArray(
                                                                    item.totalKeyUse)[0]}{' '}</Text>
                                                            </View>

                                                            {item.favorite && (
                                                                <View>
                                                                    <Image style={{
                                                                        width: 20,
                                                                        height: 20,
                                                                    }} source={require(
                                                                        'BiziboxUI/assets/star-on.png')}/>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <View>
                                                            <View style={styles.bar}>
                                                                <View style={[
                                                                    styles.fillBar, item.bgColor, {
                                                                        borderBottomRightRadius: (!(item.total ===
                                                                                0 && item.totalKeyUse !== 0) &&
                                                                            (item.totalKeyUse / (item.total / 100)) >=
                                                                            100) ? 4 : 0,
                                                                        borderTopRightRadius: (!(item.total === 0 &&
                                                                                item.totalKeyUse !== 0) &&
                                                                            (item.totalKeyUse / (item.total / 100)) >=
                                                                            100) ? 4 : 0,
                                                                        width: (item.totalKeyUse < 0) ? '0%'
                                                                            : ((item.total === 0 && item.totalKeyUse !==
                                                                                0)
                                                                                ? ('20%')
                                                                                : (((item.totalKeyUse /
                                                                                    (item.total / 100)) > 100
                                                                                    ? 100
                                                                                    : (item.totalKeyUse /
                                                                                        (item.total / 100))) + '%')),
                                                                    }]}/>
                                                            </View>
                                                        </View>
                                                    </View>

                                                    <View style={{
                                                        flex: 80,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-start',
                                                    }}>
                                                        <TouchableOpacity
                                                            onPress={this.budgetHistoryPrompt(item)}
                                                            style={{
                                                                alignSelf: 'center',
                                                            }}
                                                        >
                                                            <Icon
                                                                name="chevron-thin-left"
                                                                type="entypo"
                                                                size={26}
                                                                color={'#022258'}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>)
                                            })}

                                        {categoryHistory === null &&
                                            (itemPanelOfCategories && itemPanelOfCategories.expences &&
                                                itemPanelOfCategories.expences.length > 0) && (
                                                <View style={{
                                                    height: 53,
                                                    flexDirection: 'row-reverse',
                                                    alignItems: 'center',
                                                    alignContent: 'center',
                                                    justifyContent: 'center',
                                                    borderBottomColor: '#f0f1f2',
                                                    borderBottomWidth: 1,
                                                }}>
                                                    <Text style={{
                                                        color: '#ef3636',
                                                        fontFamily: fonts.semiBold,
                                                        fontSize: sp(19),
                                                    }}>{'הוצאה'}</Text>
                                                    <Text>{' '}</Text>
                                                    <Text style={{
                                                        color: '#022258',
                                                        fontFamily: fonts.semiBold,
                                                        fontSize: sp(19),
                                                    }}>{itemPanelOfCategories.currency} {getFormattedValueArray(
                                                        itemPanelOfCategories.totals[0])[0]}</Text>
                                                </View>
                                            )}

                                        {categoryHistory === null &&
                                            (itemPanelOfCategories && itemPanelOfCategories.expences &&
                                                itemPanelOfCategories.expences.length > 0) &&
                                            itemPanelOfCategories.expences.map((item, i) => {
                                                return (<View
                                                    style={{
                                                        paddingRight: 10,
                                                        paddingLeft: 20,
                                                        flexDirection: 'row-reverse',
                                                        alignItems: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'space-between',
                                                        paddingVertical: 13,
                                                        borderBottomColor: '#f0f1f2',
                                                        borderBottomWidth: 1,
                                                    }}
                                                    key={item.keyId}>
                                                    <View style={{
                                                        flex: 605,
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row-reverse',
                                                            alignItems: 'center',
                                                            alignContent: 'center',
                                                            justifyContent: 'space-between',
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                justifyContent: 'center',
                                                                alertsItem: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                <CustomIcon
                                                                    style={{
                                                                        alignSelf: 'center',
                                                                    }}
                                                                    name={item.nameIcon}
                                                                    size={22}
                                                                    color={'#022258'}/>
                                                                <Text style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(18),
                                                                    fontFamily: fonts.regular,
                                                                    paddingHorizontal: 5,
                                                                }}>{item.keyName}</Text>
                                                                <Text style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(18),
                                                                    fontFamily: fonts.regular,
                                                                }}> {itemPanelOfCategories.currency} {getFormattedValueArray(
                                                                    item.total)[0]}</Text>
                                                            </View>
                                                            <View style={{
                                                                flexDirection: 'row',
                                                                justifyContent: 'center',
                                                                alertsItem: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                {(item.alert)
                                                                    ? (<Fragment>
                                                                        <CustomIcon name="bell-enable" size={18}
                                                                                    color={'#022258'}/>
                                                                        <Text style={{
                                                                            color: '#022258',
                                                                            fontSize: sp(17),
                                                                            fontFamily: fonts.light,
                                                                            marginHorizontal: 3,
                                                                        }}>{item.alertPrc}%</Text>
                                                                    </Fragment>)
                                                                    : (<Fragment>
                                                                        <CustomIcon name="bell-disable" size={18}
                                                                                    color={'#9e9e9e'}/>
                                                                        <Text style={{
                                                                            color: '#022258',
                                                                            fontSize: sp(17),
                                                                            marginHorizontal: 3,
                                                                            fontFamily: fonts.light,
                                                                        }}>{item.alertPrc}%</Text>
                                                                    </Fragment>)
                                                                }
                                                            </View>
                                                        </View>

                                                        <View style={{
                                                            flexDirection: 'row',
                                                            justifyContent: 'space-between',
                                                            alertsItem: 'center',
                                                            alignContent: 'center',
                                                            marginTop: 10,
                                                            marginBottom: 2,
                                                        }}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                justifyContent: 'flex-end',
                                                                alertsItem: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                <Text style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(18),
                                                                    fontFamily: fonts.regular,
                                                                }}>נוצלו</Text>
                                                                <Text style={{
                                                                    color: '#022258',
                                                                    fontSize: sp(18),
                                                                    fontFamily: fonts.regular,
                                                                }}>{itemPanelOfCategories.currency} {item.totalKeyUse <
                                                                0 ? '' : getFormattedValueArray(
                                                                    item.totalKeyUse)[0]}{' '}</Text>
                                                            </View>

                                                            {item.favorite && (
                                                                <View>
                                                                    <Image style={{
                                                                        width: 20,
                                                                        height: 20,
                                                                    }} source={require(
                                                                        'BiziboxUI/assets/star-on.png')}/>
                                                                </View>
                                                            )}
                                                        </View>
                                                        <View>
                                                            <View style={styles.bar}>
                                                                <View style={[
                                                                    styles.fillBar, item.bgColor, {
                                                                        borderBottomRightRadius: (!(item.total ===
                                                                                0 && item.totalKeyUse !== 0) &&
                                                                            (item.totalKeyUse / (item.total / 100)) >=
                                                                            100) ? 4 : 0,
                                                                        borderTopRightRadius: (!(item.total === 0 &&
                                                                                item.totalKeyUse !== 0) &&
                                                                            (item.totalKeyUse / (item.total / 100)) >=
                                                                            100) ? 4 : 0,
                                                                        width: (item.totalKeyUse < 0) ? '0%'
                                                                            : ((item.total === 0 && item.totalKeyUse !==
                                                                                0)
                                                                                ? ('20%')
                                                                                : (((item.totalKeyUse /
                                                                                    (item.total / 100)) > 100
                                                                                    ? 100
                                                                                    : (item.totalKeyUse /
                                                                                        (item.total / 100))) + '%')),
                                                                    }]}/>
                                                            </View>
                                                        </View>
                                                    </View>

                                                    <View style={{
                                                        flex: 80,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-start',
                                                    }}>
                                                        <TouchableOpacity
                                                            onPress={this.budgetHistoryPrompt(item)}
                                                            style={{
                                                                alignSelf: 'center',
                                                            }}
                                                        >
                                                            <Icon
                                                                name="chevron-thin-left"
                                                                type="entypo"
                                                                size={26}
                                                                color={'#022258'}
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>)
                                            })}

                                        {categoryHistory !== null && (
                                            (!categoryHistory.withDetails) ? (
                                                <View>
                                                    <View style={{
                                                        paddingHorizontal: 20,
                                                    }}>
                                                        <TouchableOpacity
                                                            style={{
                                                                flexDirection: 'row-reverse',
                                                                marginVertical: 15,
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                                justifyContent: 'space-between',
                                                                opacity: disableEditPopPast ? 0.4 : 1,
                                                            }}
                                                            activeOpacity={disableEditPopPast ? 0.4 : 0.6}
                                                            onPress={
                                                                disableEditPopPast
                                                                    ? null
                                                                    : this.changeTotalCategory}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                <View style={{
                                                                    width: 34,
                                                                }}>
                                                                    <Image
                                                                        style={[
                                                                            {
                                                                                alignSelf: 'flex-end',
                                                                                resizeMode: 'contain',
                                                                                width: 44 / 2,
                                                                                height: 39 / 2,
                                                                            }]}
                                                                        source={require(
                                                                            'BiziboxUI/assets/money.png')}
                                                                    />
                                                                </View>
                                                                <Text
                                                                    style={styles.dataRowLevel3Text}>{'סכום'}</Text>
                                                            </View>

                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                                justifyContent: 'center',
                                                            }}>
                                                                <Text
                                                                    style={styles.dataRowLevel3Text}>{itemPanelOfCategories.currency} {getFormattedValueArray(
                                                                    categoryHistory.total)[0]}</Text>
                                                                <View style={commonStyles.spaceDividerDouble}/>
                                                                {!disableEditPopPast && (
                                                                    <Icon
                                                                        name="chevron-left"
                                                                        size={26}
                                                                        color={colors.blue32}
                                                                        style={{
                                                                            alignSelf: 'center',
                                                                        }}
                                                                    />
                                                                )}
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{
                                                        height: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        alignSelf: 'center',
                                                        flex: 1,
                                                        width: '100%',
                                                        backgroundColor: colors.gray30,
                                                    }}/>
                                                    <View style={{
                                                        paddingHorizontal: 20,
                                                    }}>
                                                        <TouchableOpacity
                                                            style={{
                                                                flexDirection: 'row-reverse',
                                                                marginVertical: 15,
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                                justifyContent: 'space-between',
                                                                opacity: disableEditPopPast ? 0.4 : 1,
                                                            }}
                                                            activeOpacity={disableEditPopPast ? 0.4 : 0.6}
                                                            onPress={
                                                                disableEditPopPast
                                                                    ? null
                                                                    : this.openActionSheetPrc(categoryHistory)}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                <View style={{
                                                                    width: 34,
                                                                }}>
                                                                    <CustomIcon name="bell" size={22}
                                                                                color={'#022258'}
                                                                                style={{
                                                                                    alignSelf: 'flex-end',
                                                                                }}/>
                                                                </View>
                                                                <Text
                                                                    style={styles.dataRowLevel3Text}>{'קבלת התראות לאחר'}</Text>
                                                            </View>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                                justifyContent: 'center',
                                                            }}>
                                                                <Text
                                                                    style={styles.dataRowLevel3Text}>{categoryHistory.alertPrc}%</Text>
                                                                <View style={commonStyles.spaceDividerDouble}/>
                                                                {!disableEditPopPast && (
                                                                    <Icon
                                                                        name="chevron-left"
                                                                        size={26}
                                                                        color={colors.blue32}
                                                                        style={{
                                                                            alignSelf: 'center',
                                                                        }}
                                                                    />
                                                                )}
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <View style={{
                                                        height: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        alignSelf: 'center',
                                                        flex: 1,
                                                        width: '100%',
                                                        backgroundColor: colors.gray30,
                                                    }}/>
                                                    <View style={{
                                                        paddingHorizontal: 20,
                                                    }}>
                                                        <TouchableOpacity
                                                            style={{
                                                                flexDirection: 'row-reverse',
                                                                marginVertical: 15,
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                                justifyContent: 'space-between',
                                                                opacity: 1,
                                                            }}
                                                            activeOpacity={0.6}
                                                            onPress={this.budgetHistoryPrompt(categoryHistory,
                                                                true)}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                <View style={{
                                                                    width: 34,
                                                                }}>
                                                                    <Image
                                                                        style={{
                                                                            height: 42 / 2,
                                                                            width: 32 / 2,
                                                                            alignSelf: 'flex-end',
                                                                            marginRight: 2,
                                                                        }}
                                                                        resizeMode="contain"
                                                                        source={require(
                                                                            'BiziboxUI/assets/getCategoryHistoryWithDetails.png')}
                                                                    />
                                                                </View>
                                                                <Text
                                                                    style={styles.dataRowLevel3Text}>{'לפירוט תנועות'}</Text>
                                                            </View>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                                justifyContent: 'center',
                                                            }}>
                                                                <Icon
                                                                    name="chevron-left"
                                                                    size={26}
                                                                    color={colors.blue32}
                                                                    style={{
                                                                        alignSelf: 'center',
                                                                    }}
                                                                />
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>

                                                    <View style={{
                                                        height: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        alignSelf: 'center',
                                                        width: '100%',
                                                        flex: 1,
                                                        backgroundColor: colors.gray30,
                                                    }}/>
                                                    <View style={{
                                                        paddingHorizontal: 20,
                                                    }}>
                                                        <TouchableOpacity
                                                            style={{
                                                                flexDirection: 'row-reverse',
                                                                marginVertical: 15,
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                                justifyContent: 'space-between',
                                                                opacity: disableEditPopPast ? 0.4 : 1,
                                                            }}
                                                            activeOpacity={disableEditPopPast ? 0.4 : 0.6}
                                                            onPress={
                                                                disableEditPopPast
                                                                    ? null
                                                                    : this.changeFavorite}>
                                                            <View style={{
                                                                flexDirection: 'row-reverse',
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                            }}>
                                                                <Text
                                                                    style={styles.dataRowLevel3Text}>{'קטגוריה מעודפת'}</Text>
                                                            </View>

                                                            <View style={{
                                                                alignSelf: 'flex-start',
                                                            }}>
                                                                {categoryHistory.favorite
                                                                    ? <Image
                                                                        style={[
                                                                            {
                                                                                alignSelf: 'center',
                                                                                resizeMode: 'contain',
                                                                                width: 52 / 2,
                                                                                height: 47 / 2,
                                                                            }]}
                                                                        source={require(
                                                                            'BiziboxUI/assets/starActive.png')}
                                                                    />
                                                                    : <Image
                                                                        style={[
                                                                            {
                                                                                alignSelf: 'center',
                                                                                resizeMode: 'contain',
                                                                                width: 52 / 2,
                                                                                height: 47 / 2,
                                                                            }]}
                                                                        source={require(
                                                                            'BiziboxUI/assets/starBase.png')}
                                                                    />
                                                                }
                                                            </View>
                                                        </TouchableOpacity>
                                                    </View>
                                                    <View style={{
                                                        height: 1,
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        alignSelf: 'center',
                                                        flex: 1,
                                                        width: '100%',
                                                        backgroundColor: colors.gray30,
                                                    }}/>

                                                    <View
                                                        style={[
                                                            cs(isRtl, commonStyles.row,
                                                                [commonStyles.rowReverse]), {
                                                                height: 42,
                                                                marginBottom: 10,
                                                                marginTop: 10,
                                                                alignSelf: 'center',
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                                justifyContent: 'center',
                                                            }]}>
                                                        <Text style={{
                                                            textAlign: 'center',
                                                            fontFamily: fonts.regular,
                                                            color: '#022258',
                                                            fontSize: sp(26),
                                                            paddingHorizontal: 5,
                                                        }}>היסטוריה</Text>
                                                        <CustomIcon
                                                            name={'graph-alt'}
                                                            size={18}
                                                            color={colors.blue7}
                                                        />
                                                    </View>
                                                    <View style={[
                                                        commonStyles.row, {
                                                            height: 317,
                                                            width: '100%',
                                                            backgroundColor: '#ffffff',
                                                        }]}>
                                                        <View style={{
                                                            flex: 1,
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 5,
                                                            zIndex: 2,
                                                        }}>
                                                            <View style={{
                                                                width: '98%',
                                                                flexDirection: 'row-reverse',
                                                                flex: 1,
                                                                alignSelf: 'center',
                                                                alignItems: 'center',
                                                                alignContent: 'center',
                                                                justifyContent: 'center',
                                                            }}>
                                                                {!categoryHistory.history
                                                                    ? <ActivityIndicator color="#999999"/>
                                                                    : (<Graph dataGraph={categoryHistory.history}
                                                                              dontSort
                                                                              isOpen={categoryHistory.history}/>)}
                                                            </View>
                                                        </View>
                                                        <View style={{
                                                            flex: 1,
                                                            position: 'absolute',
                                                            top: 0,
                                                            left: 0,
                                                            right: 0,
                                                            bottom: 0,
                                                            zIndex: 1,
                                                        }}>
                                                            {[
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1,
                                                                1].map((gr, i) => {
                                                                return (
                                                                    <View
                                                                        key={i}
                                                                        style={{
                                                                            flexDirection: 'column',
                                                                            flex: 1,
                                                                            justifyContent: 'center',
                                                                        }}>
                                                                        <View style={{
                                                                            flexDirection: 'row',
                                                                            flex: 1,
                                                                            justifyContent: 'center',
                                                                            borderBottomWidth: 1,
                                                                            borderBottomColor: '#f7f8fa',
                                                                            borderTopWidth: i === 0 ? 1 : 0,
                                                                            borderTopColor: '#f7f8fa',
                                                                        }}>
                                                                            {
                                                                                [
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1,
                                                                                    1].map((c, i1) => {
                                                                                    return (
                                                                                        <View key={i1} style={{
                                                                                            flex: 1,
                                                                                            borderRightWidth: 0.5,
                                                                                            borderRightColor: '#f7f8fa',
                                                                                            borderLeftWidth: 0.5,
                                                                                            borderLeftColor: '#f7f8fa',
                                                                                        }}/>
                                                                                    )
                                                                                })
                                                                            }
                                                                        </View>
                                                                    </View>
                                                                )
                                                            })}
                                                        </View>
                                                    </View>
                                                </View>
                                            ) : (withDetailsProgress ? (<View style={{
                                                flex: 1,
                                                height: Screen.height - 150,
                                                width: '98%',
                                                flexDirection: 'row-reverse',
                                                alignSelf: 'center',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                            }}><ActivityIndicator color="#999999"/></View>) : (
                                                <View>
                                                    <View style={{
                                                        height: 65,
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        alignContent: 'center',
                                                        justifyContent: 'center',
                                                        borderBottomColor: '#f0f1f2',
                                                        borderBottomWidth: 1,
                                                    }}>
                                                        <View style={{
                                                            flexDirection: 'row-reverse',
                                                            alignItems: 'center',
                                                            alignContent: 'center',
                                                            justifyContent: 'center',
                                                        }}>
                                                            <Image
                                                                style={{
                                                                    height: 37 / 2,
                                                                    width: 57 / 2,
                                                                    marginLeft: 10,
                                                                }}
                                                                resizeMode="contain"
                                                                source={require('BiziboxUI/assets/coins.png')}
                                                            />
                                                            <Text style={{
                                                                color: '#022258',
                                                                fontFamily: fonts.regular,
                                                                fontSize: sp(21),
                                                            }}>{'סה״כ'}</Text>
                                                        </View>

                                                        <Text style={{
                                                            color: '#022258',
                                                            fontFamily: fonts.semiBold,
                                                            fontSize: sp(25),
                                                        }}>
                                                            {getFormattedValueArray(
                                                                categoryHistory.history.transesTotal)[0]}{'.'}{getFormattedValueArray(
                                                            categoryHistory.history.transesTotal)[1]}
                                                        </Text>
                                                    </View>
                                                    {categoryHistory.history.transes &&
                                                        categoryHistory.history.transes.length > 0 &&
                                                        categoryHistory.history.transes.map((item, i) => {
                                                            return (<View
                                                                style={{
                                                                    paddingHorizontal: 11,
                                                                    flexDirection: 'row-reverse',
                                                                    alignItems: 'center',
                                                                    alignContent: 'center',
                                                                    justifyContent: 'space-between',
                                                                    borderBottomColor: '#f0f1f2',
                                                                    borderBottomWidth: 1,
                                                                    height: 65,
                                                                }}
                                                                key={item.transId}>

                                                                <View style={{
                                                                    flex: 85,
                                                                    flexDirection: 'column',
                                                                    alignItems: 'flex-end',
                                                                    justifyContent: 'center',
                                                                }}>
                                                                    <CustomIcon
                                                                        iconStyle={{
                                                                            alignSelf: 'flex-end',
                                                                        }}
                                                                        name={getBankTransIcon(item.paymentDesc)}
                                                                        size={30}
                                                                        color={'#022258'}
                                                                    />
                                                                </View>

                                                                <View style={{
                                                                    flex: 445,
                                                                    flexDirection: 'column',
                                                                    alignItems: 'flex-end',
                                                                    justifyContent: 'center',
                                                                }}>
                                                                    <Text
                                                                        numberOfLines={1}
                                                                        ellipsizeMode="tail"
                                                                        style={{
                                                                            color: '#022258',
                                                                            fontSize: sp(18),
                                                                            fontFamily: fonts.semiBold,
                                                                            paddingLeft: 6,
                                                                        }}>{item.transName}</Text>
                                                                    <Text style={{
                                                                        color: '#5d5d5d',
                                                                        fontSize: sp(14),
                                                                        fontFamily: fonts.regular,
                                                                    }}>{AppTimezone.moment(item.transDate)
                                                                        .format('DD/MM/YY')}</Text>
                                                                    {item.paymentDesc === 'Budget' && (
                                                                        <Text style={{
                                                                            color: '#b4b4b4',
                                                                            fontSize: sp(14),
                                                                            fontFamily: fonts.light,
                                                                        }}>{'הוזן ידנית'}</Text>
                                                                    )}
                                                                    {item.paymentDesc !== 'Budget' &&
                                                                        item.paymentMessage && (
                                                                            <Text style={{
                                                                                color: '#b4b4b4',
                                                                                fontSize: sp(14),
                                                                                fontFamily: fonts.light,
                                                                            }}>{item.paymentMessage}</Text>
                                                                        )}
                                                                </View>

                                                                <View style={{
                                                                    flex: 185,
                                                                    flexDirection: 'column',
                                                                    alignItems: 'flex-end',
                                                                    justifyContent: 'center',
                                                                }}>
                                                                    <Text style={{
                                                                        color: '#022258',
                                                                        fontFamily: fonts.semiBold,
                                                                        fontSize: sp(18),
                                                                    }}>
                                                                        <Text style={{
                                                                            fontFamily: fonts.semiBold,
                                                                            color: ((categoryHistory.expence &&
                                                                                    !item.hova) ||
                                                                                (!categoryHistory.expence && !item.hova))
                                                                                ? colors.green4
                                                                                : colors.red2,
                                                                        }}>{((categoryHistory.expence &&
                                                                                !item.hova) ||
                                                                            (!categoryHistory.expence && item.hova))
                                                                            ? '-'
                                                                            : ''}{getFormattedValueArray(
                                                                            Math.abs(item.total))[0]}</Text>
                                                                        <Text style={[
                                                                            {
                                                                                color: colors.gray7,
                                                                                fontFamily: fonts.light,
                                                                            }]}>.{getFormattedValueArray(
                                                                            item.total)[1]}</Text>
                                                                    </Text>
                                                                </View>
                                                                <View style={{
                                                                    flex: 40,
                                                                    flexDirection: 'column',
                                                                    alignItems: 'flex-start',
                                                                    justifyContent: 'center',
                                                                    position: 'relative',
                                                                }}>
                                                                    <TouchableOpacity
                                                                        hitSlop={{
                                                                            top: 10,
                                                                            bottom: 10,
                                                                            left: 10,
                                                                            right: 10,
                                                                        }}
                                                                        onPress={this.openActionSheetHistory(item)}>
                                                                        <Icon
                                                                            iconStyle={{
                                                                                position: 'absolute',
                                                                                left: -8,
                                                                            }}
                                                                            name="dots-vertical"
                                                                            type="material-community"
                                                                            size={40}
                                                                            color="#022258"
                                                                        />
                                                                    </TouchableOpacity>
                                                                </View>
                                                            </View>)
                                                        })}
                                                </View>
                                            ))
                                        )}

                                    </Animated.ScrollView>

                                    {categoryHistory !== null && categoryHistory.withDetails && (
                                        <ActionButton
                                            position={'left'}
                                            offsetY={20}
                                            onPress={this.openPopUpCreateBudgetTrans}
                                            bgColor="#ffffffbf"
                                            buttonColor="#0addc1"
                                            size={54}
                                            spacing={0}
                                            buttonTextStyle={{
                                                fontSize: 54,
                                                lineHeight:54,
                                                textAlign: 'center',
                                                marginTop: (IS_IOS ? -6 : 3),
                                            }}
                                        />
                                    )}
                                </View>
                            </View>
                        </Interactable.View>
                    </View>

                </View>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={deleteBudgetDialog !== false}
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
                            // alignItems: 'center',
                        }}>

                            <View style={{
                                height: 60,
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
                                        // flex: 15,
                                        alignSelf: 'center',
                                    }}>
                                        <TouchableOpacity onPress={this.hideDeleteBudgetDialog}>
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
                                            {'מחיקת תקציב'}
                                        </Text>
                                    </View>
                                    <View style={{
                                        // flex: 15,
                                        alignSelf: 'center',
                                    }}>
                                        <TouchableOpacity onPress={this.onRemoveClick}>
                                            <Text style={{
                                                fontSize: sp(16),
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                            }}>{'מחיקה'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={{
                                width: '100%',
                                backgroundColor: '#ffffff',
                                marginTop: 38,
                                marginBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 10,
                            }}/>

                            <View style={{
                                flexDirection: 'column',
                                alignItems: 'flex-end',
                                justifyContent: 'flex-start',
                                alignSelf: 'center',
                                alignContent: 'center',
                                flex: 1,
                            }}>
                                <View style={{
                                    justifyContent: 'center',
                                    alignSelf: 'center',
                                    alignContent: 'center',
                                    marginBottom: 10,
                                }}>
                                    <CustomIcon
                                        name="exclamation-triangle"
                                        size={20}
                                        color={colors.red2}
                                    />
                                </View>
                                <Text style={{
                                    textAlign: 'right',
                                    fontSize: sp(18),
                                    color: colors.blue7,
                                    lineHeight: 28,
                                    fontFamily: fonts.semiBold,
                                }}>
                                    {'שימו לב: '}
                                </Text>
                                <Text style={{
                                    textAlign: 'right',
                                    fontSize: sp(18),
                                    color: colors.blue7,
                                    lineHeight: 28,
                                    fontFamily: fonts.regular,
                                }}>
                                    {'התקציב יימחק ללא אפשרות שיחזור, האם להמשיך?'}
                                </Text>
                            </View>

                        </View>
                    </SafeAreaView>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={typeOfPopup !== null}>

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
                                    <View>
                                        <TouchableOpacity onPress={this.closePopUpEditAdd}>
                                            <Text style={{
                                                fontSize: sp(16),
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                            }}>ביטול</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={{
                                            fontSize: sp(20),
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                        }}>
                                            {this.state.typeOfPopup === 'edit'
                                                ? 'עריכת תקציב'
                                                : 'הוספת תקציב'}
                                        </Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity
                                            onPress={this.savePopUp}>
                                            <Text style={{
                                                fontSize: sp(16),
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                            }}>שמירה</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={{
                                width: '100%',
                                height: '100%',
                                marginTop: 32,
                                marginBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 10,
                                flex: 1,
                            }}>
                                <KeyboardAwareScrollView enableOnAndroid>
                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                        <View style={{
                                            flex: 2,
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                            }}>שם התקציב</Text>
                                        </View>
                                        <View style={[
                                            {
                                                flex: 5.73,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                                alignItems: 'flex-end',
                                            },
                                            cs(hasError &&
                                                !this.state.dataPopUpAddEditDuplication.budgetName.length,
                                                {}, {
                                                    borderWidth: 1,
                                                    borderColor: colors.red,
                                                }),
                                        ]}>
                                            <TextInput
                                                autoCorrect={false}
                                                editable
                                                keyboardType="default"
                                                style={[
                                                    {
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                        height: 42,
                                                        fontSize: sp(15),
                                                        width: '100%',
                                                    }, commonStyles.regularFont]}
                                                onEndEditing={(e) => {
                                                    let dataPopUpAddEditDuplication = Object.assign({},
                                                        this.state.dataPopUpAddEditDuplication)
                                                    dataPopUpAddEditDuplication.budgetName = e.nativeEvent.text
                                                    this.setState(
                                                        {dataPopUpAddEditDuplication: dataPopUpAddEditDuplication})
                                                }}
                                                onChangeText={(budgetName) => {
                                                    let dataPopUpAddEditDuplication = Object.assign({},
                                                        this.state.dataPopUpAddEditDuplication)
                                                    dataPopUpAddEditDuplication.budgetName = budgetName
                                                    this.setState(
                                                        {dataPopUpAddEditDuplication: dataPopUpAddEditDuplication})
                                                }}
                                                value={this.state.dataPopUpAddEditDuplication.budgetName}
                                                underlineColorAndroid="transparent"
                                            />
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                                opacity: this.state.typeOfPopup === 'edit' &&
                                                this.state.dataPopUpAddEditDuplication.frequencyDesc !==
                                                'ONE_TIME' ? 0.3 : 1,
                                            }]}>
                                        <View style={{
                                            flex: 2,
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                            }}>בנקים</Text>
                                        </View>
                                        <View style={{
                                            flex: 5.73,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                onPress={(this.state.typeOfPopup === 'edit' &&
                                                    this.state.dataPopUpAddEditDuplication.frequencyDesc !==
                                                    'ONE_TIME') ? null : this.handleOpenAccountsModal}
                                            >
                                                <View style={{
                                                    marginRight: 'auto',
                                                }}>
                                                    <Icon name="chevron-left" size={24}
                                                          color={colors.blue34}/>
                                                </View>
                                                {this.accountTitle}
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                                opacity: this.state.disabledValuesPopUp.budgetTotalType
                                                    ? 0.3
                                                    : 1,
                                            }]}>
                                        <View style={{
                                            flex: 2,
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                            }}>סוג התקציב</Text>
                                        </View>
                                        <View style={{
                                            flex: 5.73,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                onPress={this.state.disabledValuesPopUp.budgetTotalType
                                                    ? null
                                                    : this.editInput('budgetTotalType')}
                                            >
                                                <View style={{
                                                    marginRight: 'auto',
                                                }}>
                                                    <Icon name="chevron-left" size={24}
                                                          color={colors.blue34}/>
                                                </View>
                                                <Text style={[
                                                    {
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                        lineHeight: 42,
                                                        fontSize: sp(15),
                                                        width: '100%',
                                                    }, commonStyles.regularFont]}>
                                                    {this.state.dataPopUpAddEditDuplication.budgetTotalType
                                                        ? this.state.ddBudgetTotalType.find(
                                                            it => it.value ===
                                                                this.state.dataPopUpAddEditDuplication.budgetTotalType).label
                                                        : ''}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                                opacity: this.state.disabledValuesPopUp.budgetType
                                                    ? 0.3
                                                    : 1,
                                            }]}>
                                        <View style={{
                                            flex: 2,
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                            }}>תקציב לפי</Text>
                                        </View>
                                        <View style={{
                                            flex: 5.73,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                onPress={this.state.disabledValuesPopUp.budgetType
                                                    ? null
                                                    : this.editInput('budgetType')}>
                                                <View style={{
                                                    marginRight: 'auto',
                                                }}>
                                                    <Icon name="chevron-left" size={24}
                                                          color={colors.blue34}/>
                                                </View>
                                                <Text style={[
                                                    {
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                        lineHeight: 42,
                                                        fontSize: sp(15),
                                                        width: '100%',
                                                    }, commonStyles.regularFont]}>
                                                    {this.state.dataPopUpAddEditDuplication.budgetType
                                                        ? this.state.ddBudgetType.find(it => it.value ===
                                                            this.state.dataPopUpAddEditDuplication.budgetType).label
                                                        : ''}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {(lengthSlides === null || !lengthSlides ||
                                        (lengthSlides.length === 0)) ? (
                                        <View
                                            style={[{width: Screen.width - 22}]}
                                        >
                                            <Loader
                                                isDefault
                                                containerStyle={{backgroundColor: 'transparent'}}
                                                size="small"
                                                color={'#022258'}
                                            />
                                        </View>
                                    ) : (
                                        <Fragment>
                                            {hasError &&
                                                !this.state.dataPopUpAddEditDuplication.keyDetails.length &&
                                                (
                                                    <Text style={{
                                                        fontSize: sp(13),
                                                        color: '#cd1010',
                                                        textAlign: 'right',
                                                        fontFamily: fonts.light,
                                                    }}>
                                                        יש לבחור לפחות קטגוריה אחת
                                                    </Text>
                                                )}

                                            {(lengthSlides && lengthSlides.length > 0) && (
                                                <Carousel
                                                    slideHeight={60}
                                                    ref={(c) => {
                                                        this._carousel = c
                                                    }}
                                                    extraData={this.state}
                                                    data={lengthSlides}
                                                    renderItem={this.renderItemCategory}
                                                    firstItem={activeSlide}
                                                    inactiveSlideScale={1}
                                                    inactiveSlideShift={0}
                                                    inactiveSlideOpacity={0}
                                                    containerCustomStyle={styles.slider}
                                                    contentContainerCustomStyle={styles.sliderContentContainer}
                                                    loop={false}
                                                    layout={'default'}
                                                    autoplay={false}
                                                    onSnapToItem={this.handleSnapToItem}
                                                    sliderWidth={Screen.width}
                                                    itemWidth={Screen.width - 22}
                                                />
                                            )}

                                            {/* {data.length === 0 && ( */}
                                            {/*    <Text style={{ */}
                                            {/*        fontSize: sp(16), */}
                                            {/*        color: colors.blue7, */}
                                            {/*        paddingTop: 15, */}
                                            {/*    }}>{'לא נמצא פירוט עבור צ\'ק זה'}</Text> */}
                                            {/* )} */}

                                            {(lengthSlides.length > 1) && (
                                                <Pagination
                                                    dotsLength={lengthSlides.length}
                                                    activeDotIndex={activeSlide}
                                                    containerStyle={styles.sliderPaginationContainer}
                                                    dotStyle={styles.sliderDot}
                                                    inactiveDotStyle={styles.sliderInactiveDot}
                                                    dotContainerStyle={styles.sliderDotContainer}
                                                    inactiveDotOpacity={1}
                                                    inactiveDotScale={1}
                                                />
                                            )}
                                        </Fragment>
                                    )}

                                    {this.state.ddCreditCardCalcTypeDesc.length > 0 && (
                                        <Fragment>
                                            <View style={{
                                                flexDirection: 'row-reverse',
                                                marginBottom: 15,
                                                marginTop: 10,
                                            }}>
                                                <Text style={{
                                                    fontSize: sp(15),
                                                    color: '#022258',
                                                    textAlign: 'right',
                                                    fontFamily: fonts.regular,
                                                }}>
                                                    כאשר מתבצעת עסקה בתשלומים, איך תרצו שנחשב אותה?
                                                </Text>
                                                <TouchableOpacity
                                                    style={{
                                                        paddingRight: 10,
                                                    }}
                                                    hitSlop={{
                                                        top: 10,
                                                        bottom: 10,
                                                        left: 10,
                                                        right: 10,
                                                    }}
                                                    onPress={this.openActionSheetInside}
                                                >
                                                    <Image
                                                        style={[
                                                            {
                                                                width: 16,
                                                                height: 15.5,
                                                            }]}
                                                        source={require('BiziboxUI/assets/iconAler.png')}
                                                    />
                                                </TouchableOpacity>
                                            </View>
                                            <View
                                                style={[
                                                    cs(!isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 30,
                                                    }]}>
                                                <View style={{
                                                    flex: 0.05,
                                                    alignItems: 'flex-end',
                                                }}/>
                                                <View style={{
                                                    flex: 5.73,
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <CheckBox
                                                        containerStyle={{
                                                            backgroundColor: 'transparent',
                                                            left: 0,
                                                            margin: 0,
                                                            padding: 0,
                                                            borderWidth: 0,
                                                            right: 0,
                                                            width: '100%',
                                                            marginRight: -2,
                                                        }}
                                                        textStyle={{
                                                            fontSize: sp(15),
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
                                                        size={18}
                                                        right
                                                        checkedColor="#0addc1"
                                                        uncheckedColor="#dddddd"
                                                        title={this.state.ddCreditCardCalcTypeDesc[0].label}
                                                        iconRight
                                                        iconType="material-community"
                                                        checkedIcon="check"
                                                        uncheckedIcon="check"
                                                        checked={this.state.dataPopUpAddEditDuplication.creditCardCalcTypeDesc ===
                                                            this.state.ddCreditCardCalcTypeDesc[0].value}
                                                        onPress={this.state.dataPopUpAddEditDuplication.creditCardCalcTypeDesc ===
                                                        this.state.ddCreditCardCalcTypeDesc[0].value
                                                            ? null
                                                            : this.handleToggleCheckBox(
                                                                this.state.ddCreditCardCalcTypeDesc[0].value)}
                                                    />
                                                </View>
                                            </View>
                                            <View
                                                style={[
                                                    cs(!isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 30,
                                                    }]}>
                                                <View style={{
                                                    flex: 0.05,
                                                    alignItems: 'flex-end',
                                                }}/>
                                                <View style={{
                                                    flex: 5.73,
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <CheckBox
                                                        containerStyle={{
                                                            backgroundColor: 'transparent',
                                                            left: 0,
                                                            margin: 0,
                                                            padding: 0,
                                                            borderWidth: 0,
                                                            right: 0,
                                                            width: '100%',
                                                            marginRight: -2,
                                                        }}
                                                        textStyle={{
                                                            fontSize: sp(15),
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
                                                        size={18}
                                                        right
                                                        checkedColor="#0addc1"
                                                        uncheckedColor="#dddddd"
                                                        title={this.state.ddCreditCardCalcTypeDesc[1].label}
                                                        iconRight
                                                        iconType="material-community"
                                                        checkedIcon="check"
                                                        uncheckedIcon="check"
                                                        checked={this.state.dataPopUpAddEditDuplication.creditCardCalcTypeDesc ===
                                                            this.state.ddCreditCardCalcTypeDesc[1].value}
                                                        onPress={this.state.dataPopUpAddEditDuplication.creditCardCalcTypeDesc ===
                                                        this.state.ddCreditCardCalcTypeDesc[1].value
                                                            ? null
                                                            : this.handleToggleCheckBox(
                                                                this.state.ddCreditCardCalcTypeDesc[1].value)}
                                                    />
                                                </View>
                                            </View>

                                        </Fragment>
                                    )}
                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                                opacity: this.state.typeOfPopup === 'edit' ? 0.3 : 1,
                                            }]}>
                                        <View style={{
                                            flex: 2,
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                            }}>תקופת התקציב</Text>
                                        </View>
                                        <View style={{
                                            flex: 5.73,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                onPress={this.state.typeOfPopup === 'edit'
                                                    ? null
                                                    : this.editInput('frequencyDesc')}
                                            >
                                                <View style={{
                                                    marginRight: 'auto',
                                                }}>
                                                    <Icon name="chevron-left" size={24}
                                                          color={colors.blue34}/>
                                                </View>
                                                <Text style={[
                                                    {
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                        lineHeight: 42,
                                                        fontSize: sp(15),
                                                        width: '100%',
                                                    }, commonStyles.regularFont]}>
                                                    {this.state.dataPopUpAddEditDuplication.frequencyDesc
                                                        ? this.state.ddFrequencyDesc.find(it => it.value ===
                                                            this.state.dataPopUpAddEditDuplication.frequencyDesc).label
                                                        : ''}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {(this.state.dataPopUpAddEditDuplication.frequencyDesc &&
                                        this.state.dataPopUpAddEditDuplication.frequencyDesc ===
                                        'ONE_TIME') && (
                                        <Fragment>
                                            <View
                                                style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 42,
                                                        marginBottom: 8,
                                                    }]}>
                                                <View style={{
                                                    flex: 2,
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <Text style={{
                                                        color: '#0f3860',
                                                        fontSize: sp(14),
                                                        lineHeight: 42,
                                                    }}>החל מתאריך</Text>
                                                </View>
                                                <View style={{
                                                    flex: 5.73,
                                                    backgroundColor: '#f5f5f5',
                                                    paddingHorizontal: 21,
                                                    borderBottomRightRadius: 20,
                                                    borderTopRightRadius: 20,
                                                }}>
                                                    <TouchableOpacity
                                                        style={[
                                                            cs(isRtl, commonStyles.row,
                                                                [commonStyles.rowReverse]), {
                                                                flex: 1,
                                                                flexDirection: 'row',
                                                                justifyContent: 'flex-end',
                                                                alignItems: 'center',
                                                            }]}
                                                        onPress={this.editInput('dateFrom')}>

                                                        <View style={{
                                                            marginRight: 'auto',
                                                        }}>
                                                            <CustomIcon name={'calendar'} size={22}
                                                                        color={'#022258'}/>
                                                        </View>
                                                        <Text style={[
                                                            {
                                                                textAlign: 'right',
                                                                color: '#0f3860',
                                                                fontSize: sp(15),
                                                                lineHeight: 42,
                                                            }, commonStyles.regularFont]}>{AppTimezone.moment(
                                                            this.state.dataPopUpAddEditDuplication.dateFrom)
                                                            .format('DD/MM/YY')}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>

                                            <View
                                                style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        height: 42,
                                                        marginBottom: 8,
                                                    }]}>
                                                <View style={{
                                                    flex: 2,
                                                    alignItems: 'flex-end',
                                                }}>
                                                    <Text style={{
                                                        color: '#0f3860',
                                                        fontSize: sp(14),
                                                        lineHeight: 42,
                                                    }}>תאריך סיום</Text>
                                                </View>
                                                <View style={{
                                                    flex: 5.73,
                                                    backgroundColor: '#f5f5f5',
                                                    paddingHorizontal: 21,
                                                    borderBottomRightRadius: 20,
                                                    borderTopRightRadius: 20,
                                                }}>
                                                    <TouchableOpacity
                                                        style={[
                                                            cs(isRtl, commonStyles.row,
                                                                [commonStyles.rowReverse]), {
                                                                flex: 1,
                                                                flexDirection: 'row',
                                                                justifyContent: 'flex-end',
                                                                alignItems: 'center',
                                                            }]}
                                                        onPress={this.editInput('dateTill')}>

                                                        <View style={{
                                                            marginRight: 'auto',
                                                        }}>
                                                            <CustomIcon name={'calendar'} size={22}
                                                                        color={'#022258'}/>
                                                        </View>
                                                        <Text style={[
                                                            {
                                                                textAlign: 'right',
                                                                color: '#0f3860',
                                                                fontSize: sp(15),
                                                                lineHeight: 42,
                                                            }, commonStyles.regularFont]}>{AppTimezone.moment(
                                                            this.state.dataPopUpAddEditDuplication.dateTill)
                                                            .format('DD/MM/YY')}</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </Fragment>
                                    )}

                                    {(this.state.dataPopUpAddEditDuplication.frequencyDesc &&
                                        this.state.dataPopUpAddEditDuplication.frequencyDesc !==
                                        'ONE_TIME') && (
                                        <View style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                marginBottom: 8,
                                            }]}>
                                            <View style={{
                                                flex: 2,
                                                alignItems: 'flex-end',
                                            }}/>
                                            <View style={{
                                                flex: 5.73,
                                                paddingHorizontal: 21,
                                            }}>
                                                <Text style={{
                                                    fontSize: sp(15),
                                                    color: '#022258',
                                                    textAlign: 'right',
                                                    fontFamily: fonts.light,
                                                }}>
                                                    {this.state.dataPopUpAddEditDuplication.frequencyDesc ===
                                                    'MONTH'
                                                        ? 'התקציב יתחדש אוטומטית כאשר \nהחודש הקלנדרי יתחיל'
                                                        : 'התקציב יתחדש אוטומטית כאשר \nהשנה הקלנדרית תתחיל'}
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {(this.state.dataPopUpAddEditDuplication.budgetTotalType ===
                                        'both' ||
                                        this.state.dataPopUpAddEditDuplication.budgetTotalType ===
                                        'income') && (
                                        <View
                                            style={[
                                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),
                                                {
                                                    height: 42,
                                                    marginBottom: 8,
                                                }]}>
                                            <View style={{
                                                flex: 2,
                                                alignItems: 'flex-end',
                                            }}>
                                                <Text style={{
                                                    color: '#0f3860',
                                                    fontSize: sp(14),
                                                    lineHeight: 42,
                                                }}>סכום הכנסות</Text>
                                            </View>
                                            <View style={[
                                                {
                                                    flex: 5.73,
                                                    backgroundColor: '#f5f5f5',
                                                    paddingHorizontal: 21,
                                                    borderBottomRightRadius: 20,
                                                    borderTopRightRadius: 20,
                                                },
                                                cs(hasError &&
                                                    (!this.state.dataPopUpAddEditDuplication.totalIncome ||
                                                        (this.state.dataPopUpAddEditDuplication.totalIncome &&
                                                            !this.state.dataPopUpAddEditDuplication.totalIncome.toString().length)),
                                                    {}, {
                                                        borderWidth: 1,
                                                        borderColor: colors.red,
                                                    })]}>
                                                {this.state.editSumIn && (
                                                    <TextInput
                                                        autoCorrect={false}
                                                        multiline={false}
                                                        autoFocus
                                                        editable={this.state.editSumIn}
                                                        keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                                                        style={[
                                                            {
                                                                direction: 'ltr',
                                                                textAlign: 'right',
                                                                color: '#0f3860',
                                                                height: 42,
                                                                fontSize: sp(15),
                                                                width: '100%',
                                                            }, commonStyles.regularFont]}
                                                        onEndEditing={(e) => {
                                                            let dataPopUpAddEditDuplication = Object.assign(
                                                                {}, this.state.dataPopUpAddEditDuplication)
                                                            dataPopUpAddEditDuplication.totalIncome = e.nativeEvent.text.toString()
                                                                .replace(/[^\d]/g, '')
                                                            this.setState({
                                                                dataPopUpAddEditDuplication: dataPopUpAddEditDuplication,
                                                                editSumIn: false,
                                                            })
                                                        }}
                                                        onChangeText={(totals) => {
                                                            let dataPopUpAddEditDuplication = Object.assign(
                                                                {}, this.state.dataPopUpAddEditDuplication)
                                                            dataPopUpAddEditDuplication.totalIncome = totals.toString()
                                                                .replace(/[^\d]/g, '')
                                                            this.setState(
                                                                {dataPopUpAddEditDuplication: dataPopUpAddEditDuplication})
                                                        }}
                                                        value={this.state.dataPopUpAddEditDuplication.totalIncome
                                                            ? inputWorkaround.getWorkaroundChar() + String(
                                                            this.state.dataPopUpAddEditDuplication.totalIncome)
                                                            : null}
                                                        underlineColorAndroid="transparent"
                                                    />
                                                )}

                                                {!this.state.editSumIn && (
                                                    <TouchableOpacity
                                                        style={[
                                                            cs(isRtl, commonStyles.row,
                                                                [commonStyles.rowReverse]), {
                                                                flex: 1,
                                                                flexDirection: 'row',
                                                                justifyContent: 'flex-end',
                                                                alignItems: 'center',
                                                            }]}
                                                        onPress={() => {
                                                            this.setState({editSumIn: true})
                                                        }}>
                                                        {this.state.dataPopUpAddEditDuplication.totalIncome !==
                                                            null &&
                                                            this.state.dataPopUpAddEditDuplication.totalIncome !==
                                                            '' && (
                                                                <Text
                                                                    style={[
                                                                        styles.dataValueWrapper,
                                                                        styles.dataValueWrapperLevel2,
                                                                        {
                                                                            fontSize: sp(15),
                                                                            direction: 'ltr',
                                                                            textAlign: 'right',
                                                                            lineHeight: 42,
                                                                            color: '#0f3860',
                                                                        },
                                                                        commonStyles.regularFont]} numberOfLines={1}
                                                                    ellipsizeMode="tail">
                                                                    <Text style={[
                                                                        {
                                                                            fontSize: sp(15),
                                                                            lineHeight: 42,
                                                                            color: '#0f3860',
                                                                        },
                                                                        commonStyles.regularFont]}>{getFormattedValueArray(
                                                                        this.state.dataPopUpAddEditDuplication.totalIncome)[0]}</Text>
                                                                </Text>
                                                            )}
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    {(this.state.dataPopUpAddEditDuplication.budgetTotalType ===
                                        'both' ||
                                        this.state.dataPopUpAddEditDuplication.budgetTotalType ===
                                        'outcome') && (
                                        <View
                                            style={[
                                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),
                                                {
                                                    height: 42,
                                                    marginBottom: 20,
                                                }]}>
                                            <View style={{
                                                flex: 2,
                                                alignItems: 'flex-end',
                                            }}>
                                                <Text style={{
                                                    color: '#0f3860',
                                                    fontSize: sp(14),
                                                    lineHeight: 42,
                                                }}>סכום הוצאות</Text>
                                            </View>
                                            <View style={[
                                                {
                                                    flex: 5.73,
                                                    backgroundColor: '#f5f5f5',
                                                    paddingHorizontal: 21,
                                                    borderBottomRightRadius: 20,
                                                    borderTopRightRadius: 20,
                                                },
                                                cs(hasError &&
                                                    (!this.state.dataPopUpAddEditDuplication.totalOutcome ||
                                                        (this.state.dataPopUpAddEditDuplication.totalOutcome &&
                                                            !this.state.dataPopUpAddEditDuplication.totalOutcome.toString().length)),
                                                    {}, {
                                                        borderWidth: 1,
                                                        borderColor: colors.red,
                                                    })]}>
                                                {this.state.editSumEx && (
                                                    <TextInput
                                                        autoCorrect={false}
                                                        multiline={false}
                                                        autoFocus
                                                        editable={this.state.editSumEx}
                                                        keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                                                        style={[
                                                            {
                                                                direction: 'ltr',
                                                                textAlign: 'right',
                                                                color: '#0f3860',
                                                                height: 42,
                                                                fontSize: sp(15),
                                                                width: '100%',
                                                            }, commonStyles.regularFont]}
                                                        onEndEditing={(e) => {
                                                            let dataPopUpAddEditDuplication = Object.assign(
                                                                {}, this.state.dataPopUpAddEditDuplication)
                                                            dataPopUpAddEditDuplication.totalOutcome = e.nativeEvent.text.toString()
                                                                .replace(/[^\d]/g, '')
                                                            this.setState({
                                                                dataPopUpAddEditDuplication: dataPopUpAddEditDuplication,
                                                                editSumEx: false,
                                                            })
                                                        }}
                                                        onChangeText={(totals) => {
                                                            let dataPopUpAddEditDuplication = Object.assign(
                                                                {}, this.state.dataPopUpAddEditDuplication)
                                                            dataPopUpAddEditDuplication.totalOutcome = totals.toString()
                                                                .replace(/[^\d]/g, '')
                                                            this.setState(
                                                                {dataPopUpAddEditDuplication: dataPopUpAddEditDuplication})
                                                        }}
                                                        value={this.state.dataPopUpAddEditDuplication.totalOutcome
                                                            ? inputWorkaround.getWorkaroundChar() + String(
                                                            this.state.dataPopUpAddEditDuplication.totalOutcome)
                                                            : null}
                                                        underlineColorAndroid="transparent"
                                                    />
                                                )}

                                                {!this.state.editSumEx && (
                                                    <TouchableOpacity
                                                        style={[
                                                            cs(isRtl, commonStyles.row,
                                                                [commonStyles.rowReverse]), {
                                                                flex: 1,
                                                                flexDirection: 'row',
                                                                justifyContent: 'flex-end',
                                                                alignItems: 'center',
                                                            }]}
                                                        onPress={() => {
                                                            this.setState({editSumEx: true})
                                                        }}>
                                                        {this.state.dataPopUpAddEditDuplication.totalOutcome !==
                                                            null &&
                                                            this.state.dataPopUpAddEditDuplication.totalOutcome !==
                                                            '' && (
                                                                <Text
                                                                    style={[
                                                                        styles.dataValueWrapper,
                                                                        styles.dataValueWrapperLevel2,
                                                                        {
                                                                            fontSize: sp(15),
                                                                            direction: 'ltr',
                                                                            textAlign: 'right',
                                                                            lineHeight: 42,
                                                                            color: '#0f3860',
                                                                        },
                                                                        commonStyles.regularFont]} numberOfLines={1}
                                                                    ellipsizeMode="tail">
                                                                    <Text style={[
                                                                        {
                                                                            fontSize: sp(15),
                                                                            lineHeight: 42,
                                                                            color: '#0f3860',
                                                                        },
                                                                        commonStyles.regularFont]}>{getFormattedValueArray(
                                                                        this.state.dataPopUpAddEditDuplication.totalOutcome)[0]}</Text>
                                                                </Text>
                                                            )}
                                                    </TouchableOpacity>
                                                )}
                                            </View>
                                        </View>
                                    )}

                                    {isKeyDetailsNotEqual && (
                                        <TouchableOpacity
                                            style={[
                                                {
                                                    flexDirection: 'row-reverse',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'flex-start',
                                                    alignContent: 'flex-start',
                                                    marginRight: 10,
                                                    paddingRight: 10,
                                                    marginBottom: 20,
                                                }]}
                                            onPress={() => {
                                                this.budgetActive(this.state.actionSheetTooltipCopy,
                                                    false, true)
                                            }}>
                                            <Image
                                                style={[
                                                    {
                                                        width: 16,
                                                        height: 15.5,
                                                        marginLeft: 5,
                                                    }]}
                                                source={require('BiziboxUI/assets/iconAler.png')}
                                            />
                                            <Text
                                                style={[
                                                    {
                                                        fontSize: sp(15),
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                    }, commonStyles.regularFont]}>
                                                {'הקטגוריות שהוסרו לא יוצגו בהיסטורית התקציב. ניתן'}
                                                <Text style={[
                                                    {
                                                        fontSize: sp(15),
                                                        textAlign: 'right',
                                                        color: '#037dba',
                                                    },
                                                    commonStyles.regularFont]}>{' לשכפל את התקציב '}</Text>
                                                {'ולבצע בו את השינויים הרצויים ובכך לשמור על התקציב המקורי'}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </KeyboardAwareScrollView>
                            </View>

                            {(categoriesMatchModal) && (
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
                                    <TouchableOpacity
                                        style={{
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
                                        }}
                                        onPress={this.handleCancelSaveCategories}/>

                                    <View style={{
                                        height: 400,
                                        width: '100%',
                                        zIndex: 9999999,
                                        backgroundColor: 'white',
                                        borderTopLeftRadius: 12,
                                        borderTopRightRadius: 12,
                                    }}>
                                        <View style={{
                                            flexDirection: 'row-reverse',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: 8,
                                            paddingHorizontal: 15,
                                            paddingBottom: 5,
                                            backgroundColor: 'white',
                                            borderTopLeftRadius: 12,
                                            borderTopRightRadius: 12,
                                            // shadowColor: '#000000',
                                            // shadowOpacity: 0.1,
                                            // shadowOffset: { width: 0, height: 4 },
                                            // elevation: 4,
                                        }}>
                                            <View>
                                                <TouchableOpacity
                                                    hitSlop={{
                                                        top: 20,
                                                        bottom: 20,
                                                        left: 20,
                                                        right: 20,
                                                    }}
                                                    onPress={this.handleSaveCategories}>
                                                    <Text style={{
                                                        color: '#2aa1d9',
                                                        fontSize: sp(15),
                                                        fontFamily: fonts.regular,
                                                    }}>
                                                        {'שמירה'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                            <View>
                                                <Text style={{
                                                    color: '#022258',
                                                    fontSize: sp(16),
                                                    fontFamily: fonts.regular,
                                                }}>
                                                    {'הוספת קטגוריה'}
                                                </Text>
                                            </View>
                                            <View style={{
                                                marginTop: 30,
                                            }}>
                                                <TouchableOpacity
                                                    activeOpacity={(categoriesMatchCopy.filter(
                                                        (it) => it.press === true).length > 0) ? 0.2 : 1}
                                                    hitSlop={{
                                                        top: 20,
                                                        bottom: 20,
                                                        left: 20,
                                                        right: 20,
                                                    }}
                                                    onPress={this.handleRemoveAllCategories}>
                                                    <Text style={{
                                                        color: categoriesMatchCopy.filter(
                                                            (it) => it.press === true).length > 0
                                                            ? '#2aa1d9'
                                                            : '#c2c3c3',
                                                        fontSize: sp(15),
                                                        fontFamily: fonts.regular,
                                                    }}>
                                                        {'הסר הכל'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <ScrollView
                                            style={{
                                                flex: 1,
                                                position: 'relative',
                                            }}
                                            contentContainerStyle={{
                                                marginHorizontal: 15,
                                            }}>
                                            {categoriesMatchCopy.length > 0 &&
                                                this.divideList(categoriesMatchCopy).map((gr, i) => {
                                                    return (
                                                        <View key={i.toString()}
                                                              style={{
                                                                  height: 77,
                                                                  marginBottom: 15,
                                                                  flex: 1,
                                                                  width: '100%',
                                                                  alignSelf: 'center',
                                                                  alignItems: 'center',
                                                                  alignContent: 'center',
                                                                  justifyContent: 'space-between',
                                                                  flexDirection: (isRtl)
                                                                      ? 'row-reverse'
                                                                      : 'row',
                                                              }}>
                                                            {
                                                                gr.map((f, i1) => {
                                                                    if (f.press !== null) {
                                                                        return (
                                                                            <TouchableOpacity key={i1.toString()}
                                                                                              onPress={this.handleToggleCategory(
                                                                                                  f)}
                                                                                              style={{
                                                                                                  flexDirection: 'column',
                                                                                                  alignSelf: 'center',
                                                                                                  justifyContent: 'center',
                                                                                                  alignItems: 'center',
                                                                                                  alignContent: 'center',
                                                                                                  height: 77,
                                                                                                  width: 82,
                                                                                                  borderWidth: 1,
                                                                                                  borderColor: f.press
                                                                                                      ? categoriesMatchModal
                                                                                                      : '#0c2b5f',
                                                                                                  borderRadius: 5,
                                                                                                  backgroundColor: f.press
                                                                                                      ? categoriesMatchModal
                                                                                                      : 'white',
                                                                                              }}>
                                                                                <View style={{}}>
                                                                                    <CustomIcon
                                                                                        name={getTransCategoryIcon(
                                                                                            f.iconType)}
                                                                                        size={30}
                                                                                        color={f.press
                                                                                            ? 'white'
                                                                                            : '#022258'}/>
                                                                                </View>
                                                                                <Text
                                                                                    style={{
                                                                                        paddingTop: 8,
                                                                                        fontSize: sp(14),
                                                                                        fontFamily: fonts.regular,
                                                                                        color: f.press ? 'white' : '#022258',
                                                                                    }}
                                                                                    numberOfLines={1}
                                                                                    ellipsizeMode="tail">
                                                                                    {f.transTypeName}
                                                                                </Text>
                                                                            </TouchableOpacity>
                                                                        )
                                                                    } else {
                                                                        return (
                                                                            <View key={i1.toString()}
                                                                                  style={{
                                                                                      height: 77,
                                                                                      width: 82,
                                                                                  }}/>
                                                                        )
                                                                    }
                                                                })
                                                            }
                                                        </View>
                                                    )
                                                })}
                                        </ScrollView>
                                    </View>
                                </View>
                            )}

                            {accountsModalIsOpen && (accounts && accounts.length > 1) && (
                                <AccountsModal
                                    isOpen
                                    withoutRules
                                    isRtl={isRtl}
                                    onClose={this.handleCloseSelectedAccounts}
                                    onSubmit={this.handleApplySelectedAccounts}
                                    accountGroups={accountGroups}
                                    onSelectGroup={this.handleSelectGroup}
                                    onSelectAccounts={this.handleSelectAccount}
                                    selectedAccountIds={selectedAccountIds}
                                    selectedGroup={selectedGroup}
                                />
                            )}

                            <Modal
                                animationType="slide"
                                transparent={false}
                                visible={editModalInsideIsOpen}
                            >
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
                                                <View/>
                                                <View style={{alignItems: 'center'}}>
                                                    <Text style={{
                                                        fontSize: sp(20),
                                                        color: '#ffffff',
                                                        fontFamily: fonts.semiBold,
                                                    }}>
                                                        {this.state.titleModalInside}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <TouchableOpacity
                                                        onPress={this.setModalInsideVisible(
                                                            !this.state.editModalInsideIsOpen)}>
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
                                            marginTop: 32,
                                            marginBottom: 10,
                                            paddingLeft: 0,
                                            paddingRight: 10,
                                            flex: 1,
                                        }}>
                                            <KeyboardAwareScrollView enableOnAndroid>
                                                {(this.state.typeEditModal !== 'dateFrom' &&
                                                    this.state.typeEditModal !== 'dateTill') && (
                                                    <CheckList
                                                        close={this.handleCloseCheckListModal}
                                                        setDataState={this.setDataState}
                                                        data={this.state.dataList}
                                                        value={this.state.dataPopUpAddEditDuplication}
                                                        type={this.state.typeEditModal}/>)}

                                                {(this.state.typeEditModal === 'dateFrom' ||
                                                    this.state.typeEditModal === 'dateTill') && (
                                                    <Calendar
                                                        current={AppTimezone.moment(
                                                            this.state.dataPopUpAddEditDuplication[this.state.typeEditModal])
                                                            .format('YYYY-MM-DD')}
                                                        markedDates={{
                                                            [AppTimezone.moment(
                                                                this.state.dataPopUpAddEditDuplication[this.state.typeEditModal])
                                                                .format('YYYY-MM-DD')]: {
                                                                startingDay: true,
                                                                selected: true,
                                                                color: '#022258',
                                                            },
                                                        }}
                                                        renderArrow={direction => (
                                                            <Icon
                                                                color={'#022258'}
                                                                name={direction === 'left'
                                                                    ? (!isRtl ? 'chevron-left' : 'chevron-right')
                                                                    : (!isRtl ? 'chevron-right' : 'chevron-left')}
                                                            />
                                                        )}
                                                        onDayPress={(day) => {
                                                            day.timestamp = AppTimezone.moment(day.dateString)
                                                                .valueOf()
                                                            let dataPopUpAddEditDuplication = Object.assign(
                                                                {}, this.state.dataPopUpAddEditDuplication)
                                                            dataPopUpAddEditDuplication[this.state.typeEditModal] = day.timestamp

                                                            const dateFrom = dataPopUpAddEditDuplication.dateFrom
                                                            const dateTill = dataPopUpAddEditDuplication.dateTill
                                                            if (this.state.typeEditModal === 'dateFrom') {
                                                                if (dateFrom > dateTill) {
                                                                    dataPopUpAddEditDuplication.dateTill = dateFrom
                                                                }
                                                            } else if (this.state.typeEditModal ===
                                                                'dateTill') {
                                                                if (dateFrom > dateTill) {
                                                                    dataPopUpAddEditDuplication.dateFrom = dateTill
                                                                }
                                                            }
                                                            this.setState(
                                                                {dataPopUpAddEditDuplication: dataPopUpAddEditDuplication})
                                                            this.setModalInsideVisible(
                                                                !this.state.editModalInsideIsOpen)()
                                                        }}
                                                        theme={{
                                                            'stylesheet.calendar.main': {
                                                                calendar: {
                                                                    paddingLeft: 0,
                                                                    paddingRight: 0,
                                                                },
                                                                week: {
                                                                    marginTop: 2,
                                                                    marginBottom: 2,
                                                                    flexDirection: rowStyle,
                                                                    justifyContent: 'space-around',
                                                                },
                                                            },
                                                            'stylesheet.calendar.header': {
                                                                header: {
                                                                    flexDirection: rowStyle,
                                                                    justifyContent: 'space-between',
                                                                    paddingLeft: 2,
                                                                    paddingRight: 2,
                                                                    alignItems: 'center',
                                                                },
                                                                week: {
                                                                    marginTop: 7,
                                                                    flexDirection: rowStyle,
                                                                    justifyContent: 'space-around',
                                                                },
                                                                dayHeader: {
                                                                    fontSize: sp(15),
                                                                    fontFamily: fonts.semiBold,
                                                                    color: colors.red4,
                                                                },
                                                                monthText: {
                                                                    fontSize: sp(20),
                                                                    color: '#022258',
                                                                    fontFamily: fonts.regular,
                                                                    margin: 10,
                                                                },
                                                            },
                                                        }}
                                                    />)}
                                            </KeyboardAwareScrollView>
                                        </View>

                                    </View>
                                </SafeAreaView>
                            </Modal>

                            <ActionSheet
                                showSeparator={false}
                                showSparator={false}
                                style={{
                                    paddingHorizontal: 20,
                                    flex: 1,
                                    zIndex: 999999,
                                    elevation: 999,
                                    position: 'absolute',
                                }}
                                ref={(actionSheet) => {
                                    this.bottomActionSheet1 = actionSheet
                                }}
                                position="bottom"
                                onChange={this.onChange}
                                onHide={this.onHideInside}
                                multiple
                                showSelectedIcon={false}
                            >
                                <View style={{
                                    height: 130,
                                    marginBottom: 20,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    alignSelf: 'center',
                                }}>

                                    <View style={{}}>
                                        <Text
                                            style={{
                                                textAlign: 'center',
                                                color: '#022258',
                                                fontSize: sp(18),
                                                lineHeight: 44,
                                                fontFamily: fonts.semiBold,
                                            }}>{'לדוגמה'}</Text>
                                    </View>
                                    <View
                                        style={{}}>
                                        <Text style={{
                                            fontFamily: fonts.regular,
                                            fontSize: sp(18),
                                            textAlign: 'right',
                                            color: '#022258',
                                        }}>{'רכשתם מחשב ב ₪10,000 ב 10 תשלומים.'}</Text>
                                    </View>
                                    <View
                                        style={{}}>
                                        <Text style={{
                                            fontFamily: fonts.regular,
                                            fontSize: sp(18),
                                            textAlign: 'right',
                                            color: '#022258',
                                        }}>{'תרצו שהקטגוריה מיחשוב תציג ₪1,000'}</Text>
                                    </View>
                                    <View
                                        style={{}}>
                                        <Text style={{
                                            fontFamily: fonts.regular,
                                            fontSize: sp(18),
                                            textAlign: 'right',
                                            color: '#022258',
                                        }}>{'(התשלום החודשי) או ₪10,000 (כל העסקה)?'}</Text>
                                    </View>

                                </View>
                            </ActionSheet>
                        </View>
                    </SafeAreaView>
                </Modal>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={popUpCreateBudgetTrans !== false}>

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
                                    <View>
                                        <TouchableOpacity
                                            onPress={this.closePopUpCreateBudgetTrans}>
                                            <Text style={{
                                                fontSize: sp(16),
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                            }}>ביטול</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={{
                                            fontSize: sp(20),
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                        }}>
                                            {popUpCreateBudgetTransEdit
                                                ? 'עריכת'
                                                : 'הוספת'}{' תנועה ידנית'}
                                        </Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity
                                            onPress={this.savePopUpCreateBudgetTrans}>
                                            <Text style={{
                                                fontSize: sp(16),
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                            }}>שמירה</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={{
                                width: '100%',
                                height: '100%',
                                marginTop: 32,
                                marginBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 10,
                                flex: 1,
                            }}>
                                <KeyboardAwareScrollView enableOnAndroid>
                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                        <View style={{
                                            flex: 2,
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                            }}>תאריך</Text>
                                        </View>
                                        <View style={{
                                            flex: 5.73,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                onPress={this.editInputCalendar}>
                                                <View style={{
                                                    marginRight: 'auto',
                                                }}>
                                                    <CustomIcon name={'calendar'} size={22}
                                                                color={'#022258'}/>
                                                </View>
                                                <Text style={[
                                                    {
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                        fontSize: sp(15),
                                                        lineHeight: 42,
                                                    }, commonStyles.regularFont]}>{AppTimezone.moment(
                                                    popUpCreateBudgetTrans.transDate)
                                                    .format('DD/MM/YY')}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                        <View style={{
                                            flex: 2,
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                            }}>תיאור</Text>
                                        </View>
                                        <View style={[
                                            {
                                                flex: 5.73,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                                alignItems: 'flex-end',
                                            },
                                            cs(hasErrorCreateBudgetTrans &&
                                                !popUpCreateBudgetTrans.transName.length, {}, {
                                                borderWidth: 1,
                                                borderColor: colors.red,
                                            }),
                                        ]}>
                                            <TextInput
                                                autoCorrect={false}
                                                editable
                                                keyboardType="default"
                                                style={[
                                                    {
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                        height: 42,
                                                        fontSize: sp(15),
                                                        width: '100%',
                                                    }, commonStyles.regularFont]}
                                                onEndEditing={(e) => {
                                                    let datapopUpCreateBudgetTrans = Object.assign({},
                                                        popUpCreateBudgetTrans)
                                                    datapopUpCreateBudgetTrans.transName = e.nativeEvent.text
                                                    this.setState(
                                                        {popUpCreateBudgetTrans: datapopUpCreateBudgetTrans})
                                                }}
                                                onChangeText={(transName) => {
                                                    let datapopUpCreateBudgetTrans = Object.assign({},
                                                        popUpCreateBudgetTrans)
                                                    datapopUpCreateBudgetTrans.transName = transName
                                                    this.setState(
                                                        {popUpCreateBudgetTrans: datapopUpCreateBudgetTrans})
                                                }}
                                                value={popUpCreateBudgetTrans.transName}
                                                underlineColorAndroid="transparent"
                                            />
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                        <View style={{
                                            flex: 2,
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                            }}>סוג תשלום</Text>
                                        </View>
                                        <View style={{
                                            flex: 5.73,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <View
                                                style={[
                                                    cs(isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                        opacity: 0.4,
                                                    }]}>
                                                <Text style={[
                                                    {
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                        lineHeight: 42,
                                                        fontSize: sp(15),
                                                        width: '100%',
                                                    }, commonStyles.regularFont]}>
                                                    {'הוזן ידנית'}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View
                                        style={[
                                            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                        <View style={{
                                            flex: 2,
                                            alignItems: 'flex-end',
                                        }}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(14),
                                                lineHeight: 42,
                                            }}>סכום</Text>
                                        </View>
                                        <View style={[
                                            {
                                                flex: 5.73,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                            }, cs(this.state.totalNoValid, {}, {
                                                borderWidth: 1,
                                                borderColor: colors.red,
                                            })]}>
                                            {this.state.editSumCreateBudget && (
                                                <TextInput
                                                    autoCorrect={false}
                                                    autoFocus
                                                    editable={this.state.editSumCreateBudget}
                                                    keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                                                    style={[
                                                        {
                                                            direction: 'ltr',
                                                            textAlign: 'right',
                                                            color: '#0f3860',
                                                            height: 42,
                                                            fontSize: sp(15),
                                                            width: '100%',
                                                        }, commonStyles.regularFont]}
                                                    onEndEditing={(e) => {
                                                        let popUpCreateBudgetTransSave = Object.assign({},
                                                            popUpCreateBudgetTrans)
                                                        popUpCreateBudgetTransSave.transTotal = e.nativeEvent.text
                                                        this.setState({
                                                            popUpCreateBudgetTrans: popUpCreateBudgetTransSave,
                                                            editSumCreateBudget: false,
                                                            totalNoValid: popUpCreateBudgetTransSave.transTotal ===
                                                                '',
                                                        })
                                                    }}
                                                    onChangeText={(total) => {
                                                        let popUpCreateBudgetTransSave = Object.assign({},
                                                            popUpCreateBudgetTrans)
                                                        popUpCreateBudgetTransSave.transTotal = total

                                                        this.setState({
                                                            popUpCreateBudgetTrans: popUpCreateBudgetTransSave,
                                                            totalNoValid: popUpCreateBudgetTransSave.transTotal ===
                                                                '',
                                                        })
                                                    }}
                                                    value={popUpCreateBudgetTrans.transTotal !== null
                                                        ? String(popUpCreateBudgetTrans.transTotal)
                                                        : ''}
                                                    underlineColorAndroid="transparent"
                                                />
                                            )}

                                            {!this.state.editSumCreateBudget && (
                                                <TouchableOpacity
                                                    style={[
                                                        cs(isRtl, commonStyles.row,
                                                            [commonStyles.rowReverse]), {
                                                            flex: 1,
                                                            flexDirection: 'row',
                                                            justifyContent: 'flex-end',
                                                            alignItems: 'center',
                                                        }]}
                                                    onPress={this.setStates(
                                                        {editSumCreateBudget: true})}>
                                                    {(popUpCreateBudgetTrans.transTotal !== null &&
                                                        popUpCreateBudgetTrans.transTotal !== '') && (
                                                        <Text
                                                            style={[
                                                                styles.dataValueWrapper,
                                                                styles.dataValueWrapperLevel2,
                                                                {
                                                                    fontSize: sp(15),
                                                                    lineHeight: 42,
                                                                    color: '#0f3860',
                                                                },
                                                                commonStyles.regularFont]}
                                                            numberOfLines={1}
                                                            ellipsizeMode="tail"
                                                        >
                                                            <Text style={[
                                                                {
                                                                    fontSize: sp(15),
                                                                    lineHeight: 42,
                                                                    color: '#0f3860',
                                                                },
                                                                commonStyles.regularFont]}>{getFormattedValueArray(
                                                                popUpCreateBudgetTrans.transTotal)[0]}</Text>
                                                            <Text style={[
                                                                styles.fractionalPart,
                                                                {
                                                                    fontSize: sp(15),
                                                                    lineHeight: 42,
                                                                    color: '#0f3860',
                                                                },
                                                                commonStyles.regularFont]}>.{getFormattedValueArray(
                                                                popUpCreateBudgetTrans.transTotal)[1]}</Text>
                                                        </Text>
                                                    )}
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </View>
                                </KeyboardAwareScrollView>
                            </View>

                            <Modal
                                animationType="slide"
                                transparent={false}
                                visible={editCalendar}
                            >
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
                                                <View/>
                                                <View style={{alignItems: 'center'}}>
                                                    <Text style={{
                                                        fontSize: sp(20),
                                                        color: '#ffffff',
                                                        fontFamily: fonts.semiBold,
                                                    }}>
                                                        {'תאריך'}
                                                    </Text>
                                                </View>
                                                <View>
                                                    <TouchableOpacity
                                                        onPress={this.hideCalendar}>
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
                                            marginTop: 32,
                                            marginBottom: 10,
                                            paddingLeft: 0,
                                            paddingRight: 10,
                                            flex: 1,
                                        }}>
                                            <KeyboardAwareScrollView enableOnAndroid>
                                                <Calendar
                                                    minDate={AppTimezone.moment()
                                                        .subtract(11, 'month')
                                                        .startOf('month')
                                                        .format('YYYY-MM-DD')}
                                                    maxDate={AppTimezone.moment().format('YYYY-MM-DD')}
                                                    current={AppTimezone.moment(
                                                        popUpCreateBudgetTrans.transDate)
                                                        .isBefore(AppTimezone.moment().valueOf())
                                                        ? AppTimezone.moment(
                                                            popUpCreateBudgetTrans.transDate)
                                                            .format('YYYY-MM-DD')
                                                        : AppTimezone.moment().format('YYYY-MM-DD')}
                                                    markedDates={{
                                                        [AppTimezone.moment(
                                                            popUpCreateBudgetTrans.transDate)
                                                            .isBefore(AppTimezone.moment().valueOf())
                                                            ? AppTimezone.moment(
                                                                popUpCreateBudgetTrans.transDate)
                                                                .format('YYYY-MM-DD')
                                                            : AppTimezone.moment().format('YYYY-MM-DD')]: {
                                                            startingDay: true,
                                                            selected: true,
                                                            color: '#022258',
                                                        },
                                                    }}
                                                    renderArrow={direction => (
                                                        <Icon
                                                            color={'#022258'}
                                                            name={direction === 'left'
                                                                ? (!isRtl ? 'chevron-left' : 'chevron-right')
                                                                : (!isRtl ? 'chevron-right' : 'chevron-left')}
                                                        />
                                                    )}
                                                    onDayPress={(day) => {
                                                        day.timestamp = AppTimezone.moment(day.dateString)
                                                            .startOf('day')
                                                            .valueOf()
                                                        let datapopUpCreateBudgetTrans = Object.assign({},
                                                            popUpCreateBudgetTrans)
                                                        datapopUpCreateBudgetTrans.transDate = day.timestamp
                                                        this.setState(
                                                            {popUpCreateBudgetTrans: datapopUpCreateBudgetTrans})
                                                        this.hideCalendar()
                                                    }}
                                                    theme={{
                                                        'stylesheet.calendar.main': {
                                                            calendar: {
                                                                paddingLeft: 0,
                                                                paddingRight: 0,
                                                            },
                                                            week: {
                                                                marginTop: 2,
                                                                marginBottom: 2,
                                                                flexDirection: rowStyle,
                                                                justifyContent: 'space-around',
                                                            },
                                                        },
                                                        'stylesheet.calendar.header': {
                                                            header: {
                                                                flexDirection: rowStyle,
                                                                justifyContent: 'space-between',
                                                                paddingLeft: 2,
                                                                paddingRight: 2,
                                                                alignItems: 'center',
                                                            },
                                                            week: {
                                                                marginTop: 7,
                                                                flexDirection: rowStyle,
                                                                justifyContent: 'space-around',
                                                            },
                                                            dayHeader: {
                                                                fontSize: sp(15),
                                                                fontFamily: fonts.semiBold,
                                                                color: colors.red4,
                                                            },
                                                            monthText: {
                                                                fontSize: sp(20),
                                                                color: '#022258',
                                                                fontFamily: fonts.regular,
                                                                margin: 10,
                                                            },
                                                        },
                                                    }}
                                                />
                                            </KeyboardAwareScrollView>
                                        </View>

                                    </View>
                                </SafeAreaView>
                            </Modal>

                        </View>
                    </SafeAreaView>
                </Modal>

                {isReady && (
                    <ActionSheet
                        showSeparator={false}
                        showSparator={false}
                        style={{
                            paddingHorizontal: 20,
                            flex: 1,
                            zIndex: 999999,
                            elevation: 999,
                            position: 'absolute',
                            borderTopLeftRadius: alertsItem ? 20 : 0,
                            borderTopRightRadius: alertsItem ? 20 : 0,
                        }}
                        ref={(actionSheet) => {
                            this.bottomActionSheet = actionSheet
                        }}
                        position="bottom"
                        onChange={this.onChange}
                        onHide={this.onHide}
                        multiple
                        showSelectedIcon={false}
                    >
                        <View style={{
                            height: (actionSheetTooltip === 'tooltipB' ||
                                actionSheetTooltip === 'tooltipExam') ? 192 : (alertsItem
                                ? 115
                                : ((actionSheetTooltip === 'refresh' || actionSheetTooltip ===
                                    'restore') ? 138 : 0)),
                            marginBottom: 20,
                        }}>

                            {(actionSheetTooltip !== null &&
                                (actionSheetTooltip === 'refresh' || actionSheetTooltip ===
                                    'restore')) && (
                                <Fragment>
                                    <View style={{
                                        flexDirection: 'column',
                                        borderBottomWidth: 1,
                                        borderBottomColor: '#dbdbdb',
                                        // marginHorizontal: 20,
                                    }}>
                                        <Text style={{
                                            paddingTop: 20,
                                            paddingBottom: 25,
                                            fontFamily: fonts.regular,
                                            fontSize: sp(17),
                                            textAlign: 'right',
                                            color: '#022258',
                                        }}>
                                            {'הסכומים של כל הקטגוריות יתעדכנו לפי הממוצע ב12 החודשים האחרונים.'}
                                        </Text>
                                        <Text style={{
                                            fontFamily: fonts.regular,
                                            fontSize: sp(17),
                                            textAlign: 'right',
                                            color: '#022258',
                                            paddingBottom: 17,
                                        }}>
                                            {'אם נוספו או הוסרו קטגוריות או חשבונות בנק מהמערכת התקציב יתעדכן בהתאם ופעמוני ההתראות יכבו.'}
                                        </Text>
                                    </View>
                                </Fragment>
                            )}

                            {(actionSheetTooltip !== null && actionSheetTooltip ===
                                'tooltipB') && (
                                <Fragment>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'center',
                                        alignItems: 'flex-end',
                                        alignContent: 'center',
                                        alignSelf: 'flex-end',
                                        marginHorizontal: 30,
                                    }}>
                                        <Text
                                            style={{
                                                color: '#022258',
                                                fontSize: sp(18),
                                                lineHeight: 44,
                                                fontFamily: fonts.semiBold,
                                            }}>{'התקציב של'}</Text>
                                        <Image
                                            style={[
                                                {
                                                    alignSelf: 'center',
                                                    resizeMode: 'contain',
                                                    width: 80,
                                                    marginRight: 5,
                                                }]}
                                            source={require('BiziboxUI/assets/logoUpgrade.png')}
                                        />
                                    </View>
                                    <View style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        alignContent: 'center',
                                        alignSelf: 'flex-end',
                                        marginBottom: 3,
                                        flexDirection: (isRtl) ? 'row-reverse' : 'row',
                                    }}>
                                        <View
                                            style={{
                                                flex: 50,
                                                marginTop: 3,
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                            }}>
                                            <Image
                                                style={[
                                                    {
                                                        alignSelf: 'flex-end',
                                                        resizeMode: 'contain',
                                                        width: 39 / 2,
                                                        height: 29 / 2,
                                                        marginRight: 5,
                                                    }]}
                                                source={require('BiziboxUI/assets/checkTootlip.png')}
                                            />
                                        </View>
                                        <View
                                            style={{
                                                flex: 477,
                                                justifyContent: 'center',
                                            }}>
                                            <Text style={{
                                                fontFamily: fonts.regular,
                                                fontSize: sp(18),
                                                textAlign: 'right',
                                                color: '#022258',
                                            }}>{'מכיל את כל הקטגוריות שהיו בשימוש ב 12\n' +
                                                'החודשים האחרונים'}</Text>
                                        </View>
                                    </View>
                                    <View style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        alignContent: 'center',
                                        alignSelf: 'flex-end',
                                        marginBottom: 3,
                                        flexDirection: (isRtl) ? 'row-reverse' : 'row',
                                    }}>
                                        <View
                                            style={{
                                                flex: 50,
                                                marginTop: 3,
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                            }}>
                                            <Image
                                                style={[
                                                    {
                                                        alignSelf: 'flex-end',
                                                        resizeMode: 'contain',
                                                        width: 39 / 2,
                                                        height: 29 / 2,
                                                        marginRight: 5,
                                                    }]}
                                                source={require('BiziboxUI/assets/checkTootlip.png')}
                                            />
                                        </View>
                                        <View
                                            style={{
                                                flex: 477,
                                                justifyContent: 'center',
                                            }}>
                                            <Text style={{
                                                fontFamily: fonts.regular,
                                                fontSize: sp(18),
                                                textAlign: 'right',
                                                color: '#022258',
                                            }}>{'מכיל את כל חשבונות הבנק שלך'}</Text>
                                        </View>
                                    </View>
                                    <View style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        alignContent: 'center',
                                        alignSelf: 'flex-end',
                                        marginBottom: 3,
                                        flexDirection: (isRtl) ? 'row-reverse' : 'row',
                                    }}>
                                        <View
                                            style={{
                                                flex: 50,
                                                marginTop: 3,
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                            }}>
                                            <Image
                                                style={[
                                                    {
                                                        alignSelf: 'flex-end',
                                                        resizeMode: 'contain',
                                                        width: 39 / 2,
                                                        height: 29 / 2,
                                                        marginRight: 5,
                                                    }]}
                                                source={require('BiziboxUI/assets/checkTootlip.png')}
                                            />
                                        </View>
                                        <View
                                            style={{
                                                flex: 477,
                                                justifyContent: 'center',
                                            }}>
                                            <Text style={{
                                                fontFamily: fonts.regular,
                                                fontSize: sp(18),
                                                textAlign: 'right',
                                                color: '#022258',
                                            }}>{'הסכומים של הקטגוריות מעודכנים לפי ממוצע 12 החודשים האחרונים'}</Text>
                                        </View>
                                    </View>
                                </Fragment>
                            )}

                            {(actionSheetTooltip !== null && actionSheetTooltip ===
                                'tooltipExam') && (
                                <Fragment>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                        justifyContent: 'center',
                                        alignItems: 'flex-end',
                                        alignContent: 'center',
                                        alignSelf: 'flex-end',
                                        marginHorizontal: 30,
                                    }}>
                                        <Text
                                            style={{
                                                color: '#022258',
                                                fontSize: sp(18),
                                                lineHeight: 44,
                                                fontFamily: fonts.semiBold,
                                            }}>{'tooltipExam של'}</Text>
                                        <Image
                                            style={[
                                                {
                                                    alignSelf: 'center',
                                                    resizeMode: 'contain',
                                                    width: 80,
                                                    marginRight: 5,
                                                }]}
                                            source={require('BiziboxUI/assets/logoUpgrade.png')}
                                        />
                                    </View>
                                    <View style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        alignContent: 'center',
                                        alignSelf: 'flex-end',
                                        marginBottom: 3,
                                        flexDirection: (isRtl) ? 'row-reverse' : 'row',
                                    }}>
                                        <View
                                            style={{
                                                flex: 50,
                                                marginTop: 3,
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                            }}>
                                            <Image
                                                style={[
                                                    {
                                                        alignSelf: 'flex-end',
                                                        resizeMode: 'contain',
                                                        width: 39 / 2,
                                                        height: 29 / 2,
                                                        marginRight: 5,
                                                    }]}
                                                source={require('BiziboxUI/assets/checkTootlip.png')}
                                            />
                                        </View>
                                        <View
                                            style={{
                                                flex: 477,
                                                justifyContent: 'center',
                                            }}>
                                            <Text style={{
                                                fontFamily: fonts.regular,
                                                fontSize: sp(18),
                                                textAlign: 'right',
                                                color: '#022258',
                                            }}>{'מכיל את כל הקטגוריות שהיו בשימוש ב 12\n' +
                                                'החודשים האחרונים'}</Text>
                                        </View>
                                    </View>
                                    <View style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        alignContent: 'center',
                                        alignSelf: 'flex-end',
                                        marginBottom: 3,
                                        flexDirection: (isRtl) ? 'row-reverse' : 'row',
                                    }}>
                                        <View
                                            style={{
                                                flex: 50,
                                                marginTop: 3,
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                            }}>
                                            <Image
                                                style={[
                                                    {
                                                        alignSelf: 'flex-end',
                                                        resizeMode: 'contain',
                                                        width: 39 / 2,
                                                        height: 29 / 2,
                                                        marginRight: 5,
                                                    }]}
                                                source={require('BiziboxUI/assets/checkTootlip.png')}
                                            />
                                        </View>
                                        <View
                                            style={{
                                                flex: 477,
                                                justifyContent: 'center',
                                            }}>
                                            <Text style={{
                                                fontFamily: fonts.regular,
                                                fontSize: sp(18),
                                                textAlign: 'right',
                                                color: '#022258',
                                            }}>{'מכיל את כל חשבונות הבנק שלך'}</Text>
                                        </View>
                                    </View>
                                    <View style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        alignItems: 'flex-start',
                                        alignContent: 'center',
                                        alignSelf: 'flex-end',
                                        marginBottom: 3,
                                        flexDirection: (isRtl) ? 'row-reverse' : 'row',
                                    }}>
                                        <View
                                            style={{
                                                flex: 50,
                                                marginTop: 3,
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                            }}>
                                            <Image
                                                style={[
                                                    {
                                                        alignSelf: 'flex-end',
                                                        resizeMode: 'contain',
                                                        width: 39 / 2,
                                                        height: 29 / 2,
                                                        marginRight: 5,
                                                    }]}
                                                source={require('BiziboxUI/assets/checkTootlip.png')}
                                            />
                                        </View>
                                        <View
                                            style={{
                                                flex: 477,
                                                justifyContent: 'center',
                                            }}>
                                            <Text style={{
                                                fontFamily: fonts.regular,
                                                fontSize: sp(18),
                                                textAlign: 'right',
                                                color: '#022258',
                                            }}>{'הסכומים של הקטגוריות מעודכנים לפי ממוצע 12 החודשים האחרונים'}</Text>
                                        </View>
                                    </View>
                                </Fragment>
                            )}

                            {alertsItem && (
                                <Fragment>
                                    <Text style={{
                                        paddingTop: 12,
                                        color: '#022258',
                                        textAlign: 'center',
                                        fontSize: sp(19),
                                        fontFamily: fonts.regular,
                                    }}>{alertsItemType === 'incomeAlert'
                                        ? 'קבלת התראות עבור תקציב הכנסות לאחר'
                                        : 'קבלת התראות עבור תקציב הוצאות לאחר'}</Text>

                                    <View style={{
                                        paddingTop: 6,
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        alignSelf: 'center',
                                        flexDirection: 'row-reverse',
                                    }}>
                                        <Text style={{
                                            color: (alertsItem[alertsItemType === 'incomeAlert'
                                                ? 'prcIncome'
                                                : 'prcOutcome'] > 0 && alertsItem[alertsItemType])
                                                ? '#022258'
                                                : '#9e9e9e',
                                            fontSize: sp(19),
                                            fontFamily: fonts.regular,
                                        }}>{alertsItem[alertsItemType === 'incomeAlert'
                                            ? 'prcIncome'
                                            : 'prcOutcome']}%</Text>

                                        {(alertsItem[alertsItemType === 'incomeAlert'
                                            ? 'prcIncome'
                                            : 'prcOutcome'] > 0 && alertsItem[alertsItemType]) && (
                                            <CustomIcon name="bell-enable" size={22} color={'#022258'}
                                                        style={{marginHorizontal: 8}}/>
                                        )}
                                        {(alertsItem[alertsItemType === 'incomeAlert'
                                            ? 'prcIncome'
                                            : 'prcOutcome'] === 0 || !alertsItem[alertsItemType]) && (
                                            <CustomIcon name="bell-disable" size={22}
                                                        color={'#9e9e9e'}
                                                        style={{marginHorizontal: 8}}/>
                                        )}
                                    </View>

                                    <Slider
                                        style={{
                                            flex: 1,
                                            height: 40,
                                            marginHorizontal: 20,
                                        }}
                                        minimumValue={0}
                                        maximumValue={100}
                                        value={prcAlertSetVal}
                                        onSlidingComplete={this.onValueCompleteChange}
                                        onValueChange={this.onValueChange}
                                        minimumTrackTintColor="#022258"
                                        maximumTrackTintColor="#bdbdbe"
                                        thumbTintColor={'#022258'}
                                    />
                                </Fragment>
                            )}
                        </View>

                        {(actionSheetItemList && actionSheetItemList.length > 0) &&
                            actionSheetItemList.map((item, i) => {
                                if (item.value) {
                                    return (<ActionSheetItem
                                        key={item.value}
                                        style={{
                                            alignItems: 'flex-end',
                                            alignSelf: 'flex-end',
                                            alignContent: 'flex-end',
                                            justifyContent: 'flex-end',
                                            fontFamily: fonts.regular,
                                            flex: 1,
                                        }}
                                        textStyle={{
                                            color: '#022258',
                                            textAlign: 'right',
                                            fontSize: sp(18),
                                            fontFamily: fonts.regular,
                                        }}
                                        showSelectedIcon={false}
                                        text={item.text}
                                        value={item.value}
                                        icon={
                                            item.icon.name === 'duplication'
                                                ? <Image style={item.icon.style}
                                                         source={require(
                                                             'BiziboxUI/assets/duplication.png')}/>
                                                : (item.icon.name === 'restore'
                                                        ? <Image style={item.icon.style}
                                                                 source={require(
                                                                     'BiziboxUI/assets/restore.png')}/>
                                                        : <CustomIcon
                                                            name={item.icon.name}
                                                            size={item.icon.size}
                                                            style={item.icon.style}
                                                            color={'#022258'}
                                                        />
                                                )
                                        }
                                        onPress={this.onItemPress}
                                    />)
                                } else {
                                    return <View key={i.toString()}/>
                                }
                            })}
                    </ActionSheet>
                )}

                {totalCategoryModalIsOpen && (
                    <CreditLimitModal
                        total={categoryHistory.total}
                        currency={itemPanelOfCategories.currency}
                        inProgress={setTotalCategoryInProgress}
                        onSubmit={this.handleUpdateTotalCategory}
                        onClose={this.handleCloseTotalCategoryModal}
                    />
                )}

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={updateTypePopup !== false}>
                    <SafeAreaView style={{
                        flex: 1,
                        marginTop: 0,
                        paddingTop: 0,
                        position: 'relative',
                    }}>
                        <View style={{
                            flex: 1,
                            // alignItems: 'center',
                        }}>

                            <View style={{
                                height: 60,
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
                                    !isRtl,
                                    [
                                        {
                                            flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }],
                                    commonStyles.rowReverse,
                                )}>
                                    <View style={{
                                        // flex: 15,
                                        alignSelf: 'center',
                                    }}>
                                        <TouchableOpacity onPress={this.closeUpdateTypePopup}>
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
                                            {'קטגוריה'}
                                        </Text>
                                    </View>
                                    <View style={{
                                        // flex: 15,
                                        alignSelf: 'center',
                                    }}>
                                        <TouchableOpacity onPress={this.updateTypeOfTrans}>
                                            <Text style={{
                                                fontSize: sp(16),
                                                color: '#ffffff',
                                                fontFamily: fonts.semiBold,
                                            }}>{'אישור'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={{
                                width: '100%',
                                height: '100%',
                                marginTop: 15,
                                marginBottom: 10,
                                paddingLeft: 0,
                                paddingRight: 0,
                                flex: 1,
                            }}>
                                <ScrollView
                                    style={[
                                        {
                                            flex: 1,
                                            position: 'relative',
                                        }]}
                                    contentContainerStyle={[
                                        {
                                            backgroundColor: '#ffffff',
                                            flexGrow: 1,
                                            paddingTop: 0,
                                            marginTop: 0,
                                            paddingBottom: 0,
                                        }]}>

                                    <View style={{
                                        marginBottom: 15,
                                    }}>
                                        <Text style={{
                                            fontSize: sp(22),
                                            color: colors.blue32,
                                            fontFamily: fonts.regular,
                                            textAlign: 'center',
                                        }}>
                                            {'האם ברצונך לקטלג את '}
                                            <Text style={{
                                                fontFamily: fonts.semiBold,
                                            }}>{updateTypePopup.transName}</Text></Text>
                                        <Text style={{
                                            fontSize: sp(22),
                                            color: colors.blue32,
                                            fontFamily: fonts.regular,
                                            textAlign: 'center',
                                        }}>
                                            {'כ'}
                                            <Text style={{
                                                fontFamily: fonts.semiBold,
                                            }}>{updateTypePopup.transTypeName}</Text>
                                            {' גם עבור'}
                                        </Text>
                                    </View>

                                    <View
                                        style={[
                                            cs(this.props.isRtl, commonStyles.row,
                                                [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                        <View style={{
                                            flex: 0.46,
                                            alignItems: 'flex-end',
                                        }}/>
                                        <View style={{
                                            flex: 7.3,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[
                                                    cs(this.props.isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                onPress={this.handleTransCategory('only')}>
                                                <View style={{
                                                    marginRight: 'auto',
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center',
                                                }}>
                                                    {updateType === 'only' &&
                                                        (<CustomIcon name="ok" size={16}
                                                                     color={colors.blue34}/>)}
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.dataRowLevel3Text, {
                                                            fontSize: sp(15),
                                                            lineHeight: 42,
                                                        }, commonStyles.regularFont]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail">
                                                    {'תנועה זו בלבד'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View
                                        style={[
                                            cs(this.props.isRtl, commonStyles.row,
                                                [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                        <View style={{
                                            flex: 0.46,
                                            alignItems: 'flex-end',
                                        }}/>
                                        <View style={{
                                            flex: 7.3,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[
                                                    cs(this.props.isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                onPress={this.handleTransCategory('both')}>
                                                <View style={{
                                                    marginRight: 'auto',
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center',
                                                }}>
                                                    {updateType === 'both' &&
                                                        (<CustomIcon name="ok" size={16}
                                                                     color={colors.blue34}/>)}
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.dataRowLevel3Text, {
                                                            fontSize: sp(15),
                                                            lineHeight: 42,
                                                        }, commonStyles.regularFont]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail">
                                                    {'כל התנועות'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View
                                        style={[
                                            cs(this.props.isRtl, commonStyles.row,
                                                [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                        <View style={{
                                            flex: 0.46,
                                            alignItems: 'flex-end',
                                        }}/>
                                        <View style={{
                                            flex: 7.3,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[
                                                    cs(this.props.isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                onPress={this.handleTransCategory('past')}>
                                                <View style={{
                                                    marginRight: 'auto',
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center',
                                                }}>
                                                    {updateType === 'past' &&
                                                        (<CustomIcon name="ok" size={16}
                                                                     color={colors.blue34}/>)}
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.dataRowLevel3Text, {
                                                            fontSize: sp(15),
                                                            lineHeight: 42,
                                                        }, commonStyles.regularFont]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail">
                                                    {'תנועות עבר'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View
                                        style={[
                                            cs(this.props.isRtl, commonStyles.row,
                                                [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                        <View style={{
                                            flex: 0.46,
                                            alignItems: 'flex-end',
                                        }}/>
                                        <View style={{
                                            flex: 7.3,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[
                                                    cs(this.props.isRtl, commonStyles.row,
                                                        [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                onPress={this.handleTransCategory('future')}>
                                                <View style={{
                                                    marginRight: 'auto',
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-start',
                                                    alignItems: 'center',
                                                }}>
                                                    {updateType === 'future' &&
                                                        (<CustomIcon name="ok" size={16}
                                                                     color={colors.blue34}/>)}
                                                </View>
                                                <Text
                                                    style={[
                                                        styles.dataRowLevel3Text, {
                                                            fontSize: sp(15),
                                                            lineHeight: 42,
                                                        }, commonStyles.regularFont]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail">
                                                    {'תנועות עתיד'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ScrollView>
                            </View>
                        </View>
                    </SafeAreaView>
                </Modal>

                {categoriesModalIsOpen && (
                    <CategoriesModal
                        isOpen
                        isRtl={isRtl}
                        companyId={currentCompanyId}
                        bankTrans={itemTransFromHistory}
                        onClose={this.handleCloseCategoriesModal}
                        onUpdateBankTrans={this.handleUpdateBankTrans}
                        onSelectCategory={this.handleSelectCategory}
                        onCreateCategory={this.handleCreateBankTransCategory}
                        onRemoveCategory={this.handleRemoveBankTransCategory}
                    />
                )}
            </Fragment>
        )
    }
}
