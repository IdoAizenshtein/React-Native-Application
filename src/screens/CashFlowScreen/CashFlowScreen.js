import React, { Fragment, PureComponent } from 'react'
import { setOpenedBottomSheet } from 'src/redux/actions/user'
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Keyboard,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { isEmpty, last } from 'lodash'
import AppTimezone from 'src/utils/appTimezone'
import { withTranslation } from 'react-i18next'
import Loader from 'src/components/Loader/Loader'
import AccountsModal from 'src/components/AccountsModal/AccountsModal'
import CashFlowHeader from './components/CashFlowHeader'
import AccountAlertDetails
  from 'src/components/AccountAlert/AccountAlertDetails'
import CashFlowCalendarModal from './components/CashFlowCalendarModal'
import DataList from './components/DataList'
import {
  combineStyles as cs,
  getBankTransIcon,
  getEmoji,
  getErrText,
  getFormattedValueArray,
  getTransCategoryIcon,
  goTo,
  goToBack,
  sp,
} from 'src/utils/func'
import { getAccount, getAccountGroups } from 'src/redux/selectors/account'
import { selectAccounts } from 'src/redux/actions/account'
import EditRowModal from 'src/components/EditRowModal/EditRowModal'
import {
  getCashFlowAggregateData,
  getCashFlowBalanceChartData,
  getCashFlowDetailsData,
  setCashFlowData,
} from 'src/redux/actions/cashFlow'
import CheckTransSlider from './components/CheckTransSlider'
import {
  cashFlowAggregatedCalculateNigrarot,
  getCashFlowDetailsDataBySections,
} from 'src/redux/selectors/cashFlow'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import { DEFAULT_PRIMARY_CURRENCY, SCREEN_MODES } from 'src/constants/bank'
import { IS_IOS } from 'src/constants/common'
import {
  accountCflCheckDetailsApi,
  accountCflDataUpdateApi,
  cashFlowDetailsDataApi,
  cashFlowUnionBankDetApi,
  createAccountCflTransTypeApi,
  getAccountCflTransTypeApi,
  getUnionDetApi,
  mutavCategoryUpdateApi,
  removeAccountCflTransTypeApi,
} from 'src/api'
import { colors, fonts } from 'src/styles/vars'
import ActionButton from 'react-native-action-button'
import styles from './CashFlowStyles'
import CreatePayment from './components/CreatePayment'
import Api from 'src/api/Api'
import RemoveRowModal from './components/RemoveRowModal'
import { getAccountIdForSelection } from 'src/utils/account'
import AlertsTrial from 'src/components/AlertsTrial/AlertsTrial'
import commonStyles from 'src/styles/styles'
import {
  getDaysBetweenTwoDates,
  getListOfDatesInterval,
} from '../../utils/date'
import CustomIcon from 'src/components/Icons/Fontello'
import { Grid, LineChart, XAxis, YAxis } from 'react-native-svg-charts'
import { LocaleConfig } from 'react-native-calendars'
import { isIphoneX } from 'react-native-iphone-x-helper'
import { Icon } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
  ActionSheet,
  ActionSheetItem,
} from 'react-native-action-sheet-component'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'

import Interactable from 'react-native-interactable'
import { exampleCompany } from '../../redux/constants/account'

import { HeaderHeightContext, useHeaderHeight } from "@react-navigation/elements";

const winWidth = Dimensions.get('window').width
const win = Dimensions.get('window')

const Screen = {
  width: win.width,
  height: win.height - 75,
}
@connect(state => ({
  globalParams: state.globalParams,
  isRtl: state.isRtl,
  currentCompanyId: state.currentCompanyId,
  accounts: getAccount(state),
  accountGroups: getAccountGroups(state),
  cashFlowAggregatedData: cashFlowAggregatedCalculateNigrarot(state),
  cashFlowDetailsData: getCashFlowDetailsDataBySections(state),
  accountBalanceChartData: state.cashFlowBalanceChartData,
  searchkey: state.searchkey,
}))
@withTranslation()
export default class CashFlowScreen extends PureComponent {
  constructor (props) {
    super(props)
    const moveToAggregate = props.route.params.moveToAggregate
    const messageLink = props.route.params.messageLink
    this.headerHeight = 0;

    this.state = {
      categoriesModalIsOpen: false,
      modalGetUnionDet: false,
      inProgressSnap: false,
      currentOpenItemIndex: null,
      screenMode: moveToAggregate ? 'aggregate' : 'details',
      isDefDates: !messageLink,
      cashFlowAggregatedDataStateArr: null,
      selectedIndex: 0,
      changeScreenModeInProgress: false,
      cashFlowAggregatedDataState: null,
      itemUpdate: null,
      isReady: false,
      inProgress: false,
      isLayoutComplete: false,
      categoryItem: null,
      idxCategory: 0,
      inProgressDetails: false,
      details: null,
      updateTypePopup: false,
      error: null,
      // cashFlowDetailsData: props.cashFlowDetailsData,
      // if null then it is aggregated request
      currentSelectedAccountId: null,
      selectedAccountIds: [],
      selectedGroup: null,
      accountsModalIsOpen: false,
      calendarModalIsOpen: false,
      dateFromTimestamp: AppTimezone.moment().valueOf(),
      dateTillTimestamp: AppTimezone.moment().add(1, 'month').valueOf(),
      accountBalanceChartDataState: [],
      headerMaxHeight: 100,
      alertYPosition: 0,
      alertDetailsIsOpen: false,
      categories: [],
      categoriesArr: [],
      openModalCreatePayments: false,
      dataTypePayments: null,
      isHeaderChartSliderPanEnable: true,
      removeRowModalOpen: false,
      rowInfo: null,
      editRowModalOpen: false,
      refresh: false,
      scrollAnim: new Animated.Value(IS_IOS ? 0 : 0),
      bankTrans: {},
      queryStatus: {
        query: null,
      },
      payList: [],
      payListCopy: [],
      categoriesMatch: [],
      categoriesMatchCopy: [],
      categoriesMatchModal: false,
      isSearchOpen: !!messageLink,
      payListModal: false,
      showGraph: false,
      datesGraphList: [],
      bankTransGraphHova: [],
      bankTransGraphZchut: [],
      numberTickZchut: 2.5,
      numberTickHova: 2.5,
      yAxisSums: [],
      monthYear: [],
      isScreenSwitchState: false,
      dataRow: null,
      editDescModal: false,
      copyMainDesc: '',
      copyMainDescValid: true,
    }
    this.scrollY = new Animated.Value(IS_IOS ? -100 : 0)
    this.headerChartX = new Animated.ValueXY()
    this._deltaY = new Animated.Value(0)
    this.props.dispatch(setOpenedBottomSheet(false))
  }

  get headerScrollDistance () {
    const { headerMaxHeight } = this.state
    const scrollDistance = headerMaxHeight
    return scrollDistance >= 0 ? scrollDistance : 0
  }

  get selectedAccounts () {
    const { accounts } = this.props
    const selectedAccountIds = this.accountIdsForRequest

    return accounts.filter(a => selectedAccountIds.includes(a.companyAccountId))
  }

  get selectedHarigaDatetAccounts () {
    const {
      cashFlowDetailsData,
    } = this.props
    const { cashFlowAggregatedDataState } = this.state
    return this.screenSwitchState
      ? ((cashFlowAggregatedDataState && cashFlowAggregatedDataState.length)
        ? cashFlowAggregatedDataState.filter(d => d.harigaDate !== null)
        : []) : ((cashFlowDetailsData && cashFlowDetailsData.harigaArray &&
        cashFlowDetailsData.harigaArray.length)
        ? cashFlowDetailsData.harigaArray.filter(d => d.harigaDate !== null)
        : [])
  }

  get selectedHarigaDatetAccountsAll () {
    const { accounts } = this.props
    const arrUuid = this.screenSwitchState
      ? this.selectedHarigaDatetAccounts.map(a => a.accountUuid)
      : this.selectedHarigaDatetAccounts.map(a => a.companyAccountId)
    return accounts.filter(a => arrUuid.includes(a.companyAccountId))
  }

  get selectedDeviantAccounts () {
    return this.selectedAccounts.filter(a => a.balanceUse < 0)
  }

  get selectedNotUpdatedAccounts () {
    return this.selectedAccounts.filter(a => a.nonUpdateDays > 0)
  }

  get isLoader () {
    const { isReady, inProgress } = this.state
    return !isReady || inProgress
  }

  get screenSwitchState () {
    return this.state.screenMode === SCREEN_MODES.aggregate
  }

  get hasHeaderAlert () {
    return this.selectedAccounts.length > 0

    // if (this.selectedAccounts.length === 1) {
    //   const harigaDate = this.screenSwitchState
    //     ? this.selectedHarigaDatetAccounts.find(d => d.accountUuid === this.selectedAccounts[0].companyAccountId)
    //     : this.selectedHarigaDatetAccounts.find(d => d.companyAccountId === this.selectedAccounts[0].companyAccountId)
    //   return !(!this.selectedNotUpdatedAccounts.length && !this.selectedDeviantAccounts.length && !harigaDate) || harigaDate === undefined
    // } else {
    //   return (this.selectedDeviantAccounts.length || this.selectedHarigaDatetAccounts.length || )
    // }
  }

  get headerAlertState () {
    const selectedAccounts = this.selectedAccounts
    const selectedDeviantAccounts = this.selectedDeviantAccounts
    const selectedNotUpdatedAccounts = this.selectedNotUpdatedAccounts

    return {
      selectedNotUpdatedAccounts: selectedNotUpdatedAccounts,
      screenSwitchState: this.screenSwitchState,
      selectedHarigaDatetAccounts: this.selectedHarigaDatetAccounts,
      selectedAccounts: selectedAccounts,
      isOneOfOne: selectedAccounts.length === 1 &&
        selectedDeviantAccounts.length === 1,
      isOneOfMultiple: selectedAccounts.length > 1 &&
        selectedDeviantAccounts.length === 1,
      isMoreThenOneOfMultiple: selectedAccounts.length > 1 &&
        selectedDeviantAccounts.length > 1,
      isOneOfOneNotUpdated: selectedAccounts.length === 1 &&
        selectedNotUpdatedAccounts.length === 1,
      isAccountNotUpdated: !!(selectedAccounts.length &&
        selectedNotUpdatedAccounts.length),
    }
  }

  get headerMinHeight () {
    const minHeight = this.screenSwitchState ? 75 : 35
    return minHeight
  }

  get accountIdsForRequest () {
    const { selectedAccountIds, currentSelectedAccountId } = this.state
    return currentSelectedAccountId
      ? [currentSelectedAccountId]
      : selectedAccountIds
  }

  get canChangeAccountsBySlider () {
    const { selectedAccountIds } = this.state
    return selectedAccountIds && selectedAccountIds.length > 1
  }

  get nextAccountIndex () {
    const { selectedAccountIds, currentSelectedAccountId } = this.state
    if (!this.canChangeAccountsBySlider) {return null}
    if (!currentSelectedAccountId) {return 1}

    const oldIndex = selectedAccountIds.findIndex(
      id => id === currentSelectedAccountId)
    const newIndex = oldIndex + 2
    const lastIndex = selectedAccountIds.length
    return newIndex <= lastIndex ? newIndex : 0
  }

  get previousAccountIndex () {
    const { selectedAccountIds, currentSelectedAccountId } = this.state
    if (!this.canChangeAccountsBySlider) {return null}
    if (!currentSelectedAccountId) {return selectedAccountIds.length}

    const newIndex = selectedAccountIds.findIndex(
      id => id === currentSelectedAccountId)
    const lastIndex = selectedAccountIds.length
    return newIndex >= 0 ? newIndex : lastIndex
  }

  get currentAccountIndex () {
    const { selectedAccountIds, currentSelectedAccountId } = this.state
    if (!this.canChangeAccountsBySlider || !currentSelectedAccountId) {return 0}
    return selectedAccountIds.findIndex(id => id === currentSelectedAccountId) +
      1
  }

  get hasNextAccount () {
    return this.nextAccountIndex !== null
  }

  get hasPreviousAccount () {
    return this.previousAccountIndex !== null
  }

  get hasDataFilter () {
    const { bankTrans } = this.state
    return !this.screenSwitchState &&
      (!bankTrans || (bankTrans && bankTrans.length === 0))
  }

  setDefaultScrollPosition = () => {
    const { scrollAnim } = this.state
    Animated.spring(
      scrollAnim,
      {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start()
  }

  handleGetOneAggregateDataPerDay = (date, expence, nigreret) => {
    const { currentCompanyId } = this.props

    return cashFlowDetailsDataApi.post({
      body: {
        companyAccountIds: this.accountIdsForRequest,
        companyId: currentCompanyId,
        dateFrom: (date === null) ? AppTimezone.moment().valueOf() : date,
        dateTill: (date === null) ? AppTimezone.moment().valueOf() : date,
        expence: -1,
      },
    })
  }

  selectDefaultAccounts = () => {
    const { selectedAccountIds, selectedGroup } = this.state
    const { accountGroups } = this.props

    if (!accountGroups || !Object.keys(accountGroups).length) {
      return this.setState({
        inProgress: false,
        isReady: true,
        isLayoutComplete: true,
      })
    }

    const findIdsToSelect = (currency) => {
      const hasUpdatedAccount = accountGroups[currency].some(a => a._isUpdated)

      if (hasUpdatedAccount) {
        const selectedIds = accountGroups[currency].filter(a => a._isUpdated)
          .map(a => a.companyAccountId)
        this.handleSelectAccounts(currency, selectedIds)
      } else {
        const accountId = accountGroups[currency][0].companyAccountId
        this.setState({
          ...getAccountIdForSelection(currency, accountId, selectedAccountIds,
            selectedGroup),
        }, () => {
          let accountBalanceChartDataState = JSON.parse(
            JSON.stringify(this.state.selectedAccountIds))
          if (accountBalanceChartDataState.length > 1) {
            accountBalanceChartDataState.unshift(null)
          }
          accountBalanceChartDataState = accountBalanceChartDataState.map(
            (id) => {
              let creditLimit
              if (id === null) {
                creditLimit = this.props.accounts.filter(
                  a => this.state.selectedAccountIds.includes(
                    a.companyAccountId)).reduce((memo, account) => {
                  return memo + account.creditLimit
                }, 0)
              } else {
                creditLimit = this.props.accounts.filter(
                  a => this.state.selectedAccountIds.includes(
                    a.companyAccountId))
                  .find(a => a.companyAccountId === id).creditLimit
              }

              return {
                creditLimit: creditLimit,
                companyAccountId: id,
                accountBalanceChartData: null,
              }
            })

          this.setState({
            accountBalanceChartDataState,
            currentSelectedAccountId: this.state.selectedAccountIds.length > 1
              ? null
              : this.state.selectedAccountIds[0],
          })
        })
      }

      this.setState({
        dateFromTimestamp: this.selectedAccounts.length > 0
          ? AppTimezone.moment(this.selectedAccounts[0].balanceLastUpdatedDate)
            .valueOf()
          : AppTimezone.moment().valueOf(),
        dateTillTimestamp: this.selectedAccounts.length > 0
          ? AppTimezone.moment(this.selectedAccounts[0].balanceLastUpdatedDate)
            .add(30, 'day')
            .valueOf()
          : AppTimezone.moment().add(1, 'month').valueOf(),
      })
      return this.getScreenData()
    }

    if (accountGroups.hasOwnProperty(DEFAULT_PRIMARY_CURRENCY)) {
      return findIdsToSelect(DEFAULT_PRIMARY_CURRENCY)
    }
    return findIdsToSelect(Object.keys(accountGroups)[0])
  }

  getScreenData = (
    isLoader = true, isSwitchAccount = false, isReload = false) => {
    const { currentSelectedAccountId, categoriesArr } = this.state
    const objParamas = this.props.route.params.objParamas
    const messageLink = this.props.route.params.messageLink

    this.setState({ inProgress: true })

    if (isSwitchAccount) {this.setState({ switchAccountInProgress: true })}
    this.setDefaultScrollPosition()
    // const currentSelectedAccountIdThis = this.state.accountBalanceChartDataState.find(a => a.companyAccountId === currentSelectedAccountId)

    // let tasks
    // if (!isSwitchAccount) {
    //   const getScreenDataReq = this.props.screenMode !== SCREEN_MODES.details ? this.getDetailsData() : this.getAggregateData()
    //   tasks = [getScreenDataReq]
    //
    //   if (!currentSelectedAccountIdThis || (currentSelectedAccountIdThis && !currentSelectedAccountIdThis.accountBalanceChartData)) {
    //     tasks.push(this.getChartData())
    //   }
    // } else if (!currentSelectedAccountIdThis || (currentSelectedAccountIdThis && currentSelectedAccountIdThis.accountBalanceChartData === null)) {
    //   tasks = [this.getChartData()]
    // }
    //
    // if (tasks === undefined) tasks = []
    const getScreenDataReq = this.state.screenMode === SCREEN_MODES.details
      ? this.getDetailsData()
      : this.getAggregateData()
    // //console.log(this.state.currentSelectedAccountId)
    return Promise.all([getScreenDataReq, this.getChartData()])
      .then((data) => {
        const { accountBalanceChartData } = this.props
        let accountBalanceChartDataCopy = Object.assign({},
          accountBalanceChartData)
        const accountBalanceChartDataCopyState = JSON.parse(
          JSON.stringify(this.state.accountBalanceChartDataState))
        if (accountBalanceChartDataCopy && accountBalanceChartDataCopy.data ===
          null) {
          accountBalanceChartDataCopy = {}
        }

        let obj = {}
        if (this.state.accountBalanceChartDataState.find(
          a => a.companyAccountId === currentSelectedAccountId) &&
          this.state.accountBalanceChartDataState.find(
            a => a.companyAccountId ===
              currentSelectedAccountId).accountBalanceChartData === null) {
          if (accountBalanceChartDataCopyState) {
            const idxAccountBalanceChartData = accountBalanceChartDataCopyState.findIndex(
              a => a.companyAccountId === currentSelectedAccountId)
            accountBalanceChartDataCopyState[idxAccountBalanceChartData].accountBalanceChartData = accountBalanceChartDataCopy
            obj.accountBalanceChartDataState = accountBalanceChartDataCopyState
          }
        }

        let cashFlowAggregatedDataState = null
        let cashFlowAggregatedDataStateArr = null
        if (this.state.screenMode !== SCREEN_MODES.details) {
          cashFlowAggregatedDataState = data[0].filter(
            d => (this.selectedAccounts.length > 1
              ? (d.accountUuid === null)
              : (d.accountUuid !== null)))
          if (cashFlowAggregatedDataState.length) {
            const balanceLastUpdatedDate = this.selectedAccounts[0].balanceLastUpdatedDate
            cashFlowAggregatedDataStateArr = []
            const past = cashFlowAggregatedDataState[0].accountTransactions.filter(
              (item) => item.transDate !== null && item.transDate <
                balanceLastUpdatedDate)
            if (past.length) {
              cashFlowAggregatedDataStateArr.push({
                title: 'תנועות עבר',
                data: past,
              })
            }
            const nigreret = cashFlowAggregatedDataState[0].accountTransactions.filter(
              (item) => item.transDate === null)
            if (nigreret.length) {
              cashFlowAggregatedDataStateArr.push({
                title: 'תנועות נגררות',
                data: nigreret,
              })
            }
            const future = cashFlowAggregatedDataState[0].accountTransactions.filter(
              (item) => item.transDate !== null && item.transDate >=
                balanceLastUpdatedDate)
            if (future.length) {
              cashFlowAggregatedDataStateArr.push({
                title: 'תנועות עתידיות (צפויות)',
                data: future,
              })
            }
          }
        }
        this.headerChartX = new Animated.ValueXY()
        let categoriesMatch = []
        let payList = []
        if (this.state.screenMode === SCREEN_MODES.details) {
          if (data && data[0] && data[0].cashFlowDetails) {
            data[0].cashFlowDetails.forEach((trns, idx) => {
              trns.data.forEach((trns1, idx1) => {
                trns1.transType = this.state.categories.find(
                  ctt => ctt.transTypeId === trns1.transTypeId)
                if (trns1.transType === undefined) {
                  trns1.transType = this.state.categories[0]
                }
              })
            })
          }
          if (this.selectedAccounts.length > 0) {
            const balanceLastUpdatedDate = AppTimezone.moment(
              this.selectedAccounts[0].balanceLastUpdatedDate)
              .format('DD/MM/YY')
            if (balanceLastUpdatedDate) {
              if (data[0].cashFlowDetails) {
                const balanceLastUpdatedDateIdx = data[0].cashFlowDetails.findIndex(
                  (item) => item.title === balanceLastUpdatedDate)
                const balanceLastUpdatedDateArr = data[0].cashFlowDetails.filter(
                  (item) => item.title === balanceLastUpdatedDate)
                if (balanceLastUpdatedDateArr.length > 0) {
                  const nigreretFalse = balanceLastUpdatedDateArr[0].data.filter(
                    (item) => item.nigreret === false)
                  const nigreretTrue = balanceLastUpdatedDateArr[0].data.filter(
                    (item) => item.nigreret === true)
                  if (nigreretTrue.length > 0 && nigreretFalse.length > 0) {
                    data[0].cashFlowDetails[balanceLastUpdatedDateIdx].data = nigreretTrue
                    if (nigreretFalse.length > 0) {
                      data[0].cashFlowDetails.splice(
                        balanceLastUpdatedDateIdx + 1, 0, {
                          data: nigreretFalse,
                          first: false,
                          title: balanceLastUpdatedDateArr[0].title,
                        })
                    }
                  }
                }
              }
            }
          }
          let allRows = []
          if (data && data[0] && data[0].cashFlowDetails) {
            data[0].cashFlowDetails.forEach((section, idx) => {
              allRows = allRows.concat(section.data)
            })
          }
          payList = Array.from(new Set(allRows.map(s => s.paymentDesc)))
            .map(id => {
              return {
                id: id,
                press: !!(messageLink && id === 'Checks'),
              }
            })
          if (messageLink) {
            delete this.props.route.params.messageLink
          }
          categoriesMatch = Array.from(new Set(allRows.map(s => s.transTypeId)))
            .map(id => {
              let obj = categoriesArr.find((cat) => cat.transTypeId === id)
              if (!obj) {
                const row = allRows.find((it) => it.transTypeId === id)
                obj = {
                  iconType: row.iconType,
                  transTypeId: id,
                  transTypeName: row.transTypeName,
                }
              }
              return Object.assign(obj, {
                press: false,
              })
            })
        }

        if (objParamas) {
          this.setState(Object.assign(obj, {
            openModalCreatePayments: true,
            dataTypePayments: objParamas.receiptTypeId,
            cashFlowAggregatedDataStateArr,
            cashFlowAggregatedDataState,
            inProgress: !this.screenSwitchState,
            isLayoutComplete: this.screenSwitchState
              ? true
              : this.state.isLayoutComplete,
            isHeaderChartSliderPanEnable: true,
            switchAccountInProgress: false,
            categoriesMatch,
            payList,
            categoriesMatchCopy: categoriesMatch,
            payListCopy: payList,
          }), () => {
            if (!this.screenSwitchState) {
              this.filtersAll(messageLink)
            }
          })
        } else {
          this.setState(Object.assign(obj, {
            categoriesMatch,
            payList,
            categoriesMatchCopy: categoriesMatch,
            payListCopy: payList,
            cashFlowAggregatedDataStateArr,
            inProgress: !this.screenSwitchState,
            isLayoutComplete: this.screenSwitchState
              ? true
              : this.state.isLayoutComplete,
            isHeaderChartSliderPanEnable: true,
            cashFlowAggregatedDataState,
            switchAccountInProgress: false,
          }), () => {
            if (!this.screenSwitchState) {
              this.filtersAll(messageLink)
            }
          })
        }
      })
      .catch((err) => {
        setTimeout(() => {
          const { accountBalanceChartData, cashFlowAggregatedData, cashFlowDetailsData } = this.props
          let obj = {}
          const accountBalanceChartDataCopy = Object.assign({},
            accountBalanceChartData)
          const accountBalanceChartDataCopyState = JSON.parse(
            JSON.stringify(this.state.accountBalanceChartDataState))
          if (accountBalanceChartDataCopyState) {
            const idxAccountBalanceChartData = accountBalanceChartDataCopyState.findIndex(
              a => a.companyAccountId === currentSelectedAccountId)
            accountBalanceChartDataCopyState[idxAccountBalanceChartData].accountBalanceChartData = accountBalanceChartDataCopy
          }

          this.headerChartX = new Animated.ValueXY()
          if (err.path && (err.path.includes('ballance-chart') ||
            err.path.includes('balance-chart'))) {
            // this.setState({
            //   isLayoutComplete: true,
            //   cashFlowAggregatedDataStateArr: null,
            //   accountBalanceChartDataState: accountBalanceChartDataCopyState,
            //   cashFlowAggregatedDataState: null,
            //   inProgress: false,
            //   isHeaderChartSliderPanEnable: true,
            //   error: getErrText(err),
            //   switchAccountInProgress: false,
            // })

            let cashFlowAggregatedDataState = null
            let cashFlowAggregatedDataStateArr = null
            if (this.state.screenMode !== SCREEN_MODES.details &&
              cashFlowAggregatedData) {
              cashFlowAggregatedDataState = cashFlowAggregatedData.filter(
                d => d.accountUuid !== null)

              if (cashFlowAggregatedDataState.length) {
                const balanceLastUpdatedDate = this.selectedAccounts[0].balanceLastUpdatedDate
                cashFlowAggregatedDataStateArr = []
                const past = cashFlowAggregatedDataState[0].accountTransactions.filter(
                  (item) => item.transDate !== null && item.transDate <
                    balanceLastUpdatedDate)
                if (past.length) {
                  cashFlowAggregatedDataStateArr.push({
                    title: 'תנועות עבר',
                    data: past,
                  })
                }
                const nigreret = cashFlowAggregatedDataState[0].accountTransactions.filter(
                  (item) => item.transDate === null)
                if (nigreret.length) {
                  cashFlowAggregatedDataStateArr.push({
                    title: 'תנועות נגררות',
                    data: nigreret,
                  })
                }
                const future = cashFlowAggregatedDataState[0].accountTransactions.filter(
                  (item) => item.transDate !== null && item.transDate >=
                    balanceLastUpdatedDate)
                if (future.length) {
                  cashFlowAggregatedDataStateArr.push({
                    title: 'תנועות עתידיות (צפויות)',
                    data: future,
                  })
                }
              }
            }
            this.headerChartX = new Animated.ValueXY()
            let categoriesMatch = []
            let payList = []
            if (this.state.screenMode === SCREEN_MODES.details) {
              if (cashFlowDetailsData && cashFlowDetailsData.cashFlowDetails) {
                cashFlowDetailsData.cashFlowDetails.forEach((trns, idx) => {
                  trns.data.forEach((trns1, idx1) => {
                    cashFlowDetailsData.cashFlowDetails[idx].data[idx1].transType = this.state.categories.find(
                      ctt => ctt.transTypeId === trns1.transTypeId)
                    if (cashFlowDetailsData.cashFlowDetails[idx].data[idx1].transType ===
                      undefined) {
                      cashFlowDetailsData.cashFlowDetails[idx].data[idx1].transType = this.state.categories[0]
                    }
                  })
                })
              }
              if (this.selectedAccounts.length > 0) {
                const balanceLastUpdatedDate = AppTimezone.moment(
                  this.selectedAccounts[0].balanceLastUpdatedDate)
                  .format('DD/MM/YY')
                if (balanceLastUpdatedDate &&
                  cashFlowDetailsData.cashFlowDetails) {
                  const balanceLastUpdatedDateIdx = cashFlowDetailsData.cashFlowDetails.findIndex(
                    (item) => item.title === balanceLastUpdatedDate)
                  const balanceLastUpdatedDateArr = cashFlowDetailsData.cashFlowDetails.filter(
                    (item) => item.title === balanceLastUpdatedDate)
                  if (balanceLastUpdatedDateArr.length > 0) {
                    const nigreretFalse = balanceLastUpdatedDateArr[0].data.filter(
                      (item) => item.nigreret === false)
                    const nigreretTrue = balanceLastUpdatedDateArr[0].data.filter(
                      (item) => item.nigreret === true)
                    if (nigreretTrue.length > 0 && nigreretFalse.length > 0) {
                      cashFlowDetailsData.cashFlowDetails[balanceLastUpdatedDateIdx].data = nigreretTrue
                      if (nigreretFalse.length > 0) {
                        cashFlowDetailsData.cashFlowDetails.splice(
                          balanceLastUpdatedDateIdx + 1, 0, {
                            data: nigreretFalse,
                            first: false,
                            title: balanceLastUpdatedDateArr[0].title,
                          })
                      }
                    }
                  }
                }
              }

              let allRows = []
              if (cashFlowDetailsData && cashFlowDetailsData.cashFlowDetails) {
                cashFlowDetailsData.cashFlowDetails.forEach((section, idx) => {
                  allRows = allRows.concat(section.data)
                })
              }
              payList = Array.from(new Set(allRows.map(s => s.paymentDesc)))
                .map(id => {
                  return {
                    id: id,
                    press: !!(messageLink && id === 'Checks'),
                  }
                })
              if (messageLink) {
                delete this.props.route.params.messageLink
              }
              categoriesMatch = Array.from(
                new Set(allRows.map(s => s.transTypeId))).map(id => {
                let obj = categoriesArr.find((cat) => cat.transTypeId === id)
                if (!obj) {
                  const row = allRows.find((it) => it.transTypeId === id)
                  obj = {
                    iconType: row.iconType,
                    transTypeId: id,
                    transTypeName: row.transTypeName,
                  }
                }
                return Object.assign(obj, {
                  press: false,
                })
              })
            }

            setCashFlowData(cashFlowDetailsData)

            if (objParamas) {
              this.setState(Object.assign(obj, {
                cashFlowAggregatedDataStateArr,
                cashFlowAggregatedDataState,
                inProgress: !this.screenSwitchState,
                isLayoutComplete: this.screenSwitchState
                  ? true
                  : this.state.isLayoutComplete,
                openModalCreatePayments: true,
                isHeaderChartSliderPanEnable: true,
                dataTypePayments: objParamas.receiptTypeId,
                switchAccountInProgress: false,
                categoriesMatch,
                payList,
                categoriesMatchCopy: categoriesMatch,
                payListCopy: payList,
                accountBalanceChartDataState: accountBalanceChartDataCopyState,
              }), () => {
                if (!this.screenSwitchState) {
                  this.filtersAll(messageLink)
                }
              })
            } else {
              this.setState(Object.assign(obj, {
                categoriesMatch,
                payList,
                categoriesMatchCopy: categoriesMatch,
                payListCopy: payList,
                cashFlowAggregatedDataStateArr,
                isLayoutComplete: this.screenSwitchState
                  ? true
                  : this.state.isLayoutComplete,
                isHeaderChartSliderPanEnable: true,
                cashFlowAggregatedDataState,
                accountBalanceChartDataState: accountBalanceChartDataCopyState,
                inProgress: false,
                error: getErrText(err),
                switchAccountInProgress: false,
              }), () => {
                if (!this.screenSwitchState) {
                  this.filtersAll(messageLink)
                }
              })
            }

          } else {
            this.setState({
              cashFlowAggregatedDataStateArr: null,
              accountBalanceChartDataState: accountBalanceChartDataCopyState,
              isLayoutComplete: true,
              inProgress: false,
              isHeaderChartSliderPanEnable: true,
              switchAccountInProgress: false,
              error: getErrText(err),
            })
          }
        }, 500)
      })
  }

  filtersAll = (changeTypes) => {
    this.setState({
      inProgress: true,
    })
    setTimeout(() => {
      const { queryStatus, categoriesMatch, payList } = this.state
      const { cashFlowDetailsData } = this.props
      let cashFlowDetailsList = cashFlowDetailsData
      if (cashFlowDetailsData && cashFlowDetailsData.cashFlowDetails &&
        cashFlowDetailsData.cashFlowDetails.length) {
        cashFlowDetailsList = cashFlowDetailsData.cashFlowDetails
      } else {
        cashFlowDetailsList = []
      }

      let dataGraph = []
      let bankTrans = JSON.parse(JSON.stringify(cashFlowDetailsList))
      if (bankTrans.length) {
        if (queryStatus) {
          try {
            if ((queryStatus.query !== null && queryStatus.query !== '') ||
              changeTypes) {
              const categoriesMatchPressFilter = categoriesMatch.filter(
                a => a.press === true)
              const payListPressFilter = payList.filter(a => a.press === true)
              const idxEmpty = []
              if (bankTrans) {
                bankTrans.forEach((section, idx) => {
                  section.data = section.data.filter((item, index) => {
                    // //console.log('item.transTypeId', item.transTypeId)
                    // //console.log('item.paymentDesc', item.paymentDesc)
                    const categoriesMatchPress = categoriesMatch.find(
                      a => a.transTypeId === item.transTypeId).press
                    const payListPress = payList.find(
                      a => a.id === item.paymentDesc).press

                    if (queryStatus.query !== null && queryStatus.query !==
                      '') {
                      return (
                        (categoriesMatchPressFilter.length
                          ? categoriesMatchPress
                          : !categoriesMatchPress) &&
                        (payListPressFilter.length
                          ? payListPress
                          : !payListPress) &&
                        (
                          (item.transName && item.transName.toString()
                            .toLowerCase()
                            .includes(queryStatus.query.toLowerCase())) ||
                          (item.total && item.total.toString()
                            .includes(queryStatus.query)) ||
                          (item.asmachta && item.asmachta.toString()
                            .toLowerCase()
                            .includes(queryStatus.query.toLowerCase())) ||
                          (item.transDate &&
                            (queryStatus.query.toLowerCase() ===
                              AppTimezone.moment(item.transDate)
                                .format('DD/MM') ||
                              queryStatus.query.toLowerCase() ===
                              AppTimezone.moment(item.transDate)
                                .format('MM/YY') ||
                              queryStatus.query.toLowerCase() ===
                              AppTimezone.moment(item.transDate)
                                .format('DD/MM/YY')
                            )
                          )
                        )
                      )
                    } else {
                      return (
                        (categoriesMatchPressFilter.length
                          ? categoriesMatchPress
                          : !categoriesMatchPress) &&
                        (payListPressFilter.length
                          ? payListPress
                          : !payListPress)
                      )
                    }
                  })
                  // console.log('section---', section.data)
                  dataGraph = dataGraph.concat(section.data)
                  if (!section.data.length) {
                    idxEmpty.push(idx)
                  }
                })
              }
              if (idxEmpty.length) {
                bankTrans = bankTrans.filter((item) => item.data.length)
              }
            } else {
              if (bankTrans) {
                bankTrans.forEach((section, idx) => {
                  dataGraph = dataGraph.concat(section.data)
                })
              }
            }
          } catch (e) {
          }
        } else {
          if (bankTrans) {
            bankTrans.forEach((section, idx) => {
              dataGraph = dataGraph.concat(section.data)
            })
          }
        }
        if (dataGraph.length) {
          dataGraph.sort((a, b) => a.transDate - b.transDate)
          const listDays = getListOfDatesInterval(
            AppTimezone.moment(dataGraph[0].transDate),
            AppTimezone.moment(dataGraph[dataGraph.length - 1].transDate),
            'days',
            'DD/MM/YY',
          )
          const hovaArr = []
          const zchutArr = []
          if (listDays) {
            listDays.forEach((it) => {
              const reducer = (accumulator, currentValue) => accumulator +
                currentValue
              const hova = dataGraph.filter(
                (item) => item.expence === true && it ===
                  AppTimezone.moment(item.transDate).format('DD/MM/YY'))
              const zchut = dataGraph.filter(
                (item) => item.expence === false && it ===
                  AppTimezone.moment(item.transDate).format('DD/MM/YY'))

              if (hova.length) {
                hovaArr.push(hova.map((it) => it.total * -1).reduce(reducer))
              } else {
                hovaArr.push(0)
              }
              if (zchut.length) {
                zchutArr.push(zchut.map((it) => it.total).reduce(reducer))
              } else {
                zchutArr.push(0)
              }
            })
          }
          const datesGraphList = Array.from(new Set(listDays.map(s => {
            const day = s.split('/')[1] + '/' + s.split('/')[2]
            return day
          }))).map(da => {
            return da
          })

          const pushIdx = []
          let lenGlob = 0
          if (datesGraphList) {
            datesGraphList.forEach((dateMonth) => {
              const lenOfDays = listDays.filter(
                (it) => (it.split('/')[1] + '/' + it.split('/')[2]) ===
                  dateMonth).length
              lenGlob += lenOfDays
              pushIdx.push({
                date: dateMonth,
                idx: (lenGlob - Math.floor(lenOfDays / 2)) - 1,
              })
            })
          }
          const monthYear = listDays.map((s, i) => {
            const getIdx = pushIdx.find((it) => {
              const isSameDate = (s.split('/')[1] + '/' + s.split('/')[2]) ===
                it.date
              const isSameIdx = (it.idx === i)
              return isSameDate && isSameIdx
            })
            return getIdx ? getIdx.date : ''
          })

          let numberTickZchut = Math.round(Math.max(...zchutArr) /
            ((Math.max(...zchutArr) - (Math.min(...hovaArr))) / 5))
          numberTickZchut = numberTickZchut === 0 ? 1 : numberTickZchut
          let numberTickHova = Math.round(Math.abs(Math.min(...hovaArr)) /
            ((Math.max(...zchutArr) - (Math.min(...hovaArr))) / 5))
          numberTickHova = numberTickHova === 0 ? 1 : numberTickHova
          const part = ((Math.max(...zchutArr) - (Math.min(...hovaArr))) / 5)
          const max = Math.max(...zchutArr) === 0 ? part : Math.max(...zchutArr)
          const yAxisSums = Array.from(
            new Array(numberTickZchut + numberTickHova + 1)).map((it, i) => {
            return max - (part * i)
          })
          this.setState({
            inProgress: false,
            bankTrans: bankTrans,
            datesGraphList: listDays,
            bankTransGraphHova: hovaArr,
            bankTransGraphZchut: zchutArr,
            isLayoutComplete: true,
            numberTickZchut,
            numberTickHova,
            yAxisSums,
            monthYear,
          })
        } else {
          this.setState({
            inProgress: false,
            bankTrans: bankTrans,
            datesGraphList: [],
            bankTransGraphHova: [],
            bankTransGraphZchut: [],
            numberTickZchut: 2.5,
            numberTickHova: 2.5,
            yAxisSums: [],
            monthYear: [],
          })
        }
      } else {
        this.setState({
          isReady: true,
          isLayoutComplete: true,
          inProgress: false,
          bankTrans: bankTrans,
          datesGraphList: [],
          bankTransGraphHova: [],
          bankTransGraphZchut: [],
          numberTickZchut: 2.5,
          numberTickHova: 2.5,
          yAxisSums: [],
          monthYear: [],
        })
      }

      if (this.state.bankTransIdOpened) {
        const lastRowOpened = bankTrans.find((item) => item.data.find(
          (row) => row.transId === this.state.bankTransIdOpened))
        if (lastRowOpened) {
          const lastRow = lastRowOpened.data.find(
            (item) => item.transId === this.state.bankTransIdOpened)
          if (lastRow) {
            this.openBottomSheet(lastRow, true)
          }
        }
      }
    }, 100)
  }

  searchQuery = (query) => {
    let valuesSave = Object.assign({}, this.state.queryStatus)
    valuesSave.query = (query === '') ? null : query
    this.setState({ queryStatus: valuesSave })
    setTimeout(() => {
      // console.log(this.state.queryStatus)
      this.filtersAll()
    }, 20)
  }

  isSearchOpen = (isSearchOpen) => {
    if (isSearchOpen) {
      // if (this.state.isScreenSwitchState) {
      //   this.handleChangeScreenMode(true, false, true)
      // } else {
      let queryStatus = Object.assign({}, this.state.queryStatus)
      queryStatus.query = null

      this.setState({
        isSearchOpen: !isSearchOpen,
        queryStatus,
      })
      setTimeout(() => {
        // //console.log(this.state.queryStatus)
        // this.filtersAll()
        this.handleSetDates({
          dateFromTimestamp: AppTimezone.moment().valueOf(),
          dateTillTimestamp: AppTimezone.moment().add(1, 'month').valueOf(),
        })
      }, 20)
      // }
    } else {
      this.setState({
        isSearchOpen: !isSearchOpen,
        isScreenSwitchState: this.screenSwitchState,
      })
      if (this.screenSwitchState) {
        setTimeout(() => {
          this.handleChangeScreenMode(false, true)
        }, 20)
      }
    }
  }

  handleDeletePays = (i) => () => {
    const {
      payListCopy,
    } = this.state
    let payList = JSON.parse(JSON.stringify(payListCopy))
    const index = payList.findIndex((it) => it.id === i.id)
    payList[index].press = false
    this.setState({
      payListCopy: payList,
      payList: payList,
    })
    this.filtersAll(true)
  }

  handleDeleteCategory = (i) => () => {
    const {
      categoriesMatchCopy,
    } = this.state
    let categoriesMatch = JSON.parse(JSON.stringify(categoriesMatchCopy))
    const index = categoriesMatch.findIndex(
      (it) => it.transTypeId === i.transTypeId)
    categoriesMatch[index].press = false
    this.setState({
      categoriesMatchCopy: categoriesMatch,
      categoriesMatch: categoriesMatch,
    })
    this.filtersAll(true)
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
    } = this.state
    this.setState({
      categoriesMatch: categoriesMatchCopy,
      categoriesMatchModal: false,
    })
    this.filtersAll(true)
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

  handleTogglePays = (i) => () => {
    const {
      payListCopy,
    } = this.state
    let payList = JSON.parse(JSON.stringify(payListCopy))
    const index = payList.findIndex((it) => it.id === i.id)
    payList[index].press = !payList[index].press
    this.setState({
      payListCopy: payList,
    })
  }

  handleCancelSavePays = () => {
    const {
      payList,
    } = this.state

    this.setState({
      payListCopy: payList,
      payListModal: false,
    })
  }

  handleSavePays = () => {
    const {
      payListCopy,
    } = this.state
    this.setState({
      payList: payListCopy,
      payListModal: false,
    })
    this.filtersAll(true)
  }

  handleRemoveAllPays = () => {
    const {
      payListCopy,
    } = this.state
    let payList = JSON.parse(JSON.stringify(payListCopy))
    payList.forEach(it => {
      it.press = false
    })
    this.setState({
      payListCopy: payList,
    })
  }

  handleModalTypes = (type) => () => {
    if (type === 'categoriesMatchModal') {
      this.setState({
        categoriesMatchModal: true,
      })
    } else if (type === 'payListModal') {
      this.setState({
        payListModal: true,
      })
    }
  }

  divideList (list) {
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

  openGraph = () => {
    this.setState({
      showGraph: true,
    })
  }

  closeGraph = () => {
    this.setState({
      showGraph: false,
    })
  }

  toFixedNum (num) {
    const numSplit = num.toString().split('.')
    if (numSplit.length > 1) {
      const first = numSplit[0]
      const point = numSplit[1].substring(0, 1)
      if (point === '0' || (first.replace(/-/g, '').length >= 2)) {
        return Number(first)
      } else {
        return Number(first + '.' + point)
      }
    } else {
      return Number(num)
    }
  }

  checkIfK (num) {
    num = Number(num.toString().split('.')[0])
    if (num.toString().replace(/-/g, '').length >= 7) {
      return this.toFixedNum(num / 1000000) + 'm'
    } else if (num.toString().replace(/-/g, '').length >= 4) {
      return this.toFixedNum(num / 1000) + 'k'
    } else {
      return this.toFixedNum(num)
    }
  }

  getAggregateData = () => {
    const { dispatch, currentCompanyId } = this.props
    const { dateFromTimestamp, dateTillTimestamp } = this.state

    return dispatch(getCashFlowAggregateData({
      companyAccountIds: this.accountIdsForRequest,
      companyId: currentCompanyId,
      dateFrom: AppTimezone.moment(dateFromTimestamp).toISOString(),
      dateTill: AppTimezone.moment(dateTillTimestamp).toISOString(),
      expence: -1,
    }, true))
  }

  getDetailsData = () => {
    const { currentCompanyId, dispatch } = this.props
    const { dateFromTimestamp, dateTillTimestamp } = this.state

    return dispatch(getCashFlowDetailsData({
      companyAccountIds: this.accountIdsForRequest,
      companyId: currentCompanyId,
      dateFrom: AppTimezone.moment(dateFromTimestamp).toISOString(),
      dateTill: AppTimezone.moment(dateTillTimestamp).toISOString(),
      expence: -1,
    }))
  }

  getChartData = () => {
    const { dispatch, currentCompanyId } = this.props
    const { dateFromTimestamp, dateTillTimestamp } = this.state

    return dispatch(getCashFlowBalanceChartData({
      companyAccountIds: this.accountIdsForRequest,
      companyId: currentCompanyId,
      dateFrom: AppTimezone.moment(dateFromTimestamp).toISOString(),
      dateTill: AppTimezone.moment(dateTillTimestamp).toISOString(),
    }))
  }

  handleSelectAccounts = (selectedGroup, selectedAccountIds = [], fn) => {
    let accountBalanceChartDataState = JSON.parse(
      JSON.stringify(selectedAccountIds))

    if (accountBalanceChartDataState.length > 1) {
      accountBalanceChartDataState.unshift(null)
    }
    accountBalanceChartDataState = accountBalanceChartDataState.map((id) => {
      let creditLimit
      if (id === null) {
        creditLimit = this.props.accounts.filter(
          a => selectedAccountIds.includes(a.companyAccountId))
          .reduce((memo, account) => {
            return memo + account.creditLimit
          }, 0)
      } else {
        creditLimit = this.props.accounts.filter(
          a => selectedAccountIds.includes(a.companyAccountId))
          .find(a => a.companyAccountId === id).creditLimit
      }

      return {
        creditLimit: creditLimit,
        companyAccountId: id,
        accountBalanceChartData: null,
      }
    })
    this.setState({
      selectedAccountIds,
      selectedGroup,
      currentSelectedAccountId: selectedAccountIds.length > 1
        ? null
        : selectedAccountIds[0],
      accountBalanceChartDataState,
    }, () => {
      if (typeof fn === 'function') {return fn()}
    })
  }

  handleForceSelectAccount = (id) => {
    let creditLimit
    if (id === null) {
      creditLimit = this.props.accounts.filter(a => id === a.companyAccountId)
        .reduce((memo, account) => {
          return memo + account.creditLimit
        }, 0)
    } else {
      creditLimit = this.props.accounts.find(
        a => a.companyAccountId === id).creditLimit
    }
    this.setState(
      {
        currentSelectedAccountId: id,
        selectedAccountIds: [id],
        accountBalanceChartDataState: [
          {
            companyAccountId: id,
            accountBalanceChartData: null,
            creditLimit: creditLimit,
          }],
        alertDetailsIsOpen: false,
      },
      this.handleApplySelectedAccounts,
    )
  }

  handleCloseAccountsModal = () => this.setState({ accountsModalIsOpen: false })

  handleOpenAccountsModal = () => this.setState({
    accountsModalIsOpen: true,
    selectedAccountIdsSave: JSON.parse(
      JSON.stringify(this.state.selectedAccountIds)),
    selectedGroupSave: JSON.parse(JSON.stringify(this.state.selectedGroup)),
  })

  handleOpenCalendarModal = () => this.setState({ calendarModalIsOpen: true })

  handleCloseCalendarModal = () => this.setState({ calendarModalIsOpen: false })

  handleApplySelectedAccounts = () => {
    this.props.dispatch(selectAccounts(this.state.selectedAccountIds))
    this.handleCloseAccountsModal()
    this.getScreenData()
  }

  handleCloseSelectedAccounts = () => {
    this.setState({
      accountsModalIsOpen: false,
      selectedAccountIds: JSON.parse(
        JSON.stringify(this.state.selectedAccountIdsSave)),
      selectedGroup: JSON.parse(JSON.stringify(this.state.selectedGroupSave)),
    })
  }

  removeItem = (item, type) => {
    this.handleRemoveRowModal(false)
    if ((item.targetType === 'CCARD_TAZRIM' ||
      item.targetType === 'LOAN_TAZRIM' ||
      item.targetType === 'SOLEK_TAZRIM') && (type)
    ) {
      new Api({ endpoint: 'cyclic-trans/cfl/single' }).post({
        body: item,
      })
        .then(data => {
          let transId, dateFrom
          if (data && Array.isArray(data.transes) && data.transes.length > 0) {
            transId = data.transes[0].transId
            dateFrom = data.transes[0].kvuaDateFrom
          } else {
            transId = data.transId
            dateFrom = data.kvuaDateFrom
          }
          const pathMain = (!type) ? 'payments' : 'cyclic-trans'
          new Api(
            { endpoint: `${pathMain}/cfl/${item.targetType}/delete` }).post({
            body: {
              companyAccountId: item.companyAccountId,
              transId: transId,
              dateFrom: item.kvuaDateFrom ? item.kvuaDateFrom : dateFrom,
            },
          })
            .then(() => {
              this.close()
              this.getScreenData()
            })
            .catch(() => this.close())
        })
        .catch(() => {
        })
    } else {
      const pathMain = (!type) ? 'payments' : 'cyclic-trans'
      new Api({ endpoint: `${pathMain}/cfl/${item.targetType}/delete` }).post({
        body: {
          companyAccountId: item.companyAccountId,
          transId: item.transId,
          dateFrom: item.kvuaDateFrom,
        },
      })
        .then(() => {
          this.close()
          this.getScreenData()
        })
        .catch(() => this.close())
    }
  }

  handleSetHeaderHeight = (e) => {
    this.scrollY = new Animated.Value(IS_IOS ? -e.nativeEvent.layout.height : 0)
    this.setState({
      headerMaxHeight: e.nativeEvent.layout.height,
      isLayoutComplete: true,
      scrollAnim: new Animated.Value(IS_IOS ? -e.nativeEvent.layout.height : 0),
    })
  }

  handleSetAlertPosition = (e) => this.setState(
    { alertYPosition: e.nativeEvent.layout.y })

  handleToggleAlertDetails = () => this.setState(
    { alertDetailsIsOpen: !this.state.alertDetailsIsOpen })

  handleSetDates = ({ dateFromTimestamp, dateTillTimestamp }) => {
    const { selectedAccountIds } = this.state
    let accountBalanceChartDataState = JSON.parse(
      JSON.stringify(selectedAccountIds))

    if (accountBalanceChartDataState.length > 1) {
      accountBalanceChartDataState.unshift(null)
    }
    accountBalanceChartDataState = accountBalanceChartDataState.map((id) => {
      let creditLimit
      if (id === null) {
        creditLimit = this.props.accounts.filter(
          a => selectedAccountIds.includes(a.companyAccountId))
          .reduce((memo, account) => {
            return memo + account.creditLimit
          }, 0)
      } else {
        creditLimit = this.props.accounts.filter(
          a => selectedAccountIds.includes(a.companyAccountId))
          .find(a => a.companyAccountId === id).creditLimit
      }

      return {
        creditLimit: creditLimit,
        companyAccountId: id,
        accountBalanceChartData: null,
      }
    })
    this.setState({
      dateFromTimestamp,
      dateTillTimestamp,
      isDefDates: false,
      calendarModalIsOpen: false,
      accountBalanceChartDataState,
    }, this.getScreenData)
  }

  handleChangeScreenMode = (state, isOpen, closeState) => {
    const { screenMode } = this.state

    const newScreenMode = state ? SCREEN_MODES.aggregate : SCREEN_MODES.details
    if (screenMode === newScreenMode) {return}
    let queryStatus = Object.assign({}, this.state.queryStatus)
    queryStatus.query = null
    this.setState({
      queryStatus,
      isScreenSwitchState: closeState ? false : this.state.isScreenSwitchState,
      changeScreenModeInProgress: true,
      inProgress: true,
      isLayoutComplete: isOpen || false,
      isSearchOpen: isOpen || false,
      screenMode: newScreenMode,
    })
    if (!isOpen) {
      this.setState({
        dateFromTimestamp: (screenMode === SCREEN_MODES.details)
          ? AppTimezone.moment().valueOf()
          : this.selectedAccounts.length > 0
            ? AppTimezone.moment(
              this.selectedAccounts[0].balanceLastUpdatedDate).valueOf()
            : AppTimezone.moment().valueOf(),
        dateTillTimestamp: (screenMode === SCREEN_MODES.details)
          ? AppTimezone.moment().add(1, 'month').valueOf()
          : this.selectedAccounts.length > 0 ? AppTimezone.moment(
            this.selectedAccounts[0].balanceLastUpdatedDate)
            .add(30, 'day')
            .valueOf() : AppTimezone.moment().add(1, 'month').valueOf(),
      })
    }
    setTimeout(() => {
      return this.getScreenData()
        .then(() => this.setState({
          inProgress: false,
          changeScreenModeInProgress: false,
        }))
        .catch((err) => this.setState({
          inProgress: false,
          changeScreenModeInProgress: false,
          error: getErrText(err),
        }))
    }, 100)
  }

  closeModalCreatePayments = () => {
    this.setState({ openModalCreatePayments: false })
  }

  handleMoveHeaderSlider = (e, gesture) => {
    const { isHeaderChartSliderPanEnable } = this.state
    if (!gesture || !isHeaderChartSliderPanEnable) {return}

    const { dx } = gesture
    const finishPoint = winWidth / 2 - 50

    if (dx >= finishPoint && this.hasNextAccount) {
      this.setState({ isHeaderChartSliderPanEnable: false })
      return Animated.timing(this.headerChartX, {
        toValue: {
          x: winWidth,
          y: 0,
        },
        duration: 500,
        useNativeDriver: true,
      }).start(this.selectPreviousAccount)
    }

    if (dx < 0 && dx <= -(finishPoint) && this.hasPreviousAccount) {
      this.setState({ isHeaderChartSliderPanEnable: false })
      Animated.timing(this.headerChartX, {
        toValue: {
          x: -winWidth,
          y: 0,
        },
        duration: 500,
        useNativeDriver: true,
      }).start(this.selectNextAccount)
    }
  }

  selectNextAccount = () => {
    const { selectedAccountIds, currentSelectedAccountId } = this.state
    if (!this.canChangeAccountsBySlider) {return}

    if (!currentSelectedAccountId) {
      return this.setState({ currentSelectedAccountId: selectedAccountIds[0] },
        this.getScreenData)
    }

    const index = this.nextAccountIndex
    this.setState({
      currentSelectedAccountId: index === 0 ? null : selectedAccountIds[index -
      1],
    }, this.getScreenData)
  }

  selectPreviousAccount = () => {
    const { selectedAccountIds, currentSelectedAccountId } = this.state
    if (!this.canChangeAccountsBySlider) {return}

    if (!currentSelectedAccountId) {
      return this.setState(
        { currentSelectedAccountId: last(selectedAccountIds) },
        this.getScreenData)
    }

    const index = this.previousAccountIndex
    this.setState({
      currentSelectedAccountId: index === 0 ? null : selectedAccountIds[index -
      1],
    }, this.getScreenData)
  }

  componentDidMount () {
    this._deltaY = new Animated.Value(0)
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    const { currentCompanyId, accountGroups } = this.props
    if (currentCompanyId) {
      getAccountCflTransTypeApi.post({ body: { uuid: currentCompanyId } })
        .then(data => {
          this.setState({
            categories: data.filter(item => item.shonaScreen),
            categoriesArr: data,
          })
          const selectedAccountIds = this.props.route.params.selectedAccountIds
          const messageLink = this.props.route.params.messageLink
          if (selectedAccountIds) {
            let currency
            if (accountGroups.hasOwnProperty(DEFAULT_PRIMARY_CURRENCY)) {
              currency = DEFAULT_PRIMARY_CURRENCY
            } else {
              currency = Object.keys(accountGroups)[0]
            }
            this.handleSelectAccounts(currency, selectedAccountIds, () => {
              this.setState({
                isReady: true,
              })

              setTimeout(() => {
                const balanceLastUpdatedDate = this.selectedAccounts.length > 0
                  ? this.selectedAccounts[0].balanceLastUpdatedDate
                  : AppTimezone.moment().valueOf()
                this.setState({
                  dateFromTimestamp: messageLink ? AppTimezone.moment()
                    .valueOf() : AppTimezone.moment(balanceLastUpdatedDate)
                    .valueOf(),
                  dateTillTimestamp: messageLink ? AppTimezone.moment()
                    .valueOf() : AppTimezone.moment(balanceLastUpdatedDate)
                    .add(30, 'day')
                    .valueOf(),
                })

                if (this.props.route.params.selectedAccountIds) {
                  delete this.props.route.params.selectedAccountIds
                }
                return this.getScreenData()
              }, 200)
            })
          } else {
            this.setState({ isReady: true })
            this.selectDefaultAccounts()
          }
        })
        .catch((err) => this.setState({
          isReady: true,
          error: getErrText(err),
        }))
    }
  }

  handleRemoveRowModal = (state) => this.setState({ removeRowModalOpen: state })

  handleRemoveRowModalCb = (item, state) => {
    if (state) {
      this.setState({ rowInfo: item })
      this.handleRemoveRowModal(state)
    } else {
      this.handleRemoveRowModal(state)
      setTimeout(() => {
        this.setState({ rowInfo: item })
      }, 20)
    }
  }

  minOldestTransDateInSelectedAccounts = () => {
    if (!this.selectedAccounts || !this.selectedAccounts.length) {
      return null
    }

    return this.selectedAccounts.reduce((accmltr, acc) => {
      return Number.isFinite(acc.oldestTransDate) &&
      (accmltr === null || acc.oldestTransDate < accmltr)
        ? acc.oldestTransDate : accmltr
    }, null)
  }

  handlePopRowEditsModal = (item) => {
    this.setState({
      rowInfo: item,
      editRowModalOpen: true,
    })
  }

  updateRow = (reload, data) => {
    this.setState({
      editRowModalOpen: false,
    })
    this.getScreenData()

    // if (reload) {
    //   this.getScreenData()
    // } else {
    //   if (data) {
    //     if (this.state.screenMode === SCREEN_MODES.details) {
    //       const { cashFlowDetailsData } = this.props
    //       let dataArr = Object.assign({}, cashFlowDetailsData)
    //       dataArr.cashFlowDetails.forEach((parent, idx) => {
    //         parent.data.forEach((item, idx1) => {
    //           if (item.transId === data.transId) {
    //             cashFlowDetailsData.cashFlowDetails[idx].data[idx1] = data
    //           }
    //         })
    //       })
    //       this.props.dispatch(dispatch => {
    //         return dispatch({ type: GET_CASHFLOW_DATA_DETAILS, payload: dataArr })
    //       })
    //     } else {
    //       this.setState({
    //         itemUpdate: data,
    //       })
    //     }
    //     if (!this.screenSwitchState) {
    //       this.filtersAll()
    //     } else {
    //       setTimeout(() => {
    //         this.setState({
    //           refresh: !this.state.refresh,
    //         })
    //       }, 200)
    //     }
    //   }
    // }
  }

  addMovement = (type) => () => {
    if (this.props.route.params.objParamas) {
      delete this.props.route.params.objParamas
    }

    this.setState({
      openModalCreatePayments: true,
      dataTypePayments: type,
    })
  }

  goToMatch = () => {
    const selectedAccounts = JSON.parse(JSON.stringify(this.selectedAccounts))
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

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  refresh = () => {
    return this.getScreenData()
  }

  handleBackPress = () => {
    this.props.dispatch(setOpenedBottomSheet(false))
    goToBack(this.props.navigation)
    return true
  }

  onIndexChanged = (index) => {
    const {
      selectedAccountIds,
    } = this.state

    // //console.log(index === 0 ? null : selectedAccountIds[index - 1])

    this.setState({
      selectedIndex: index,
      currentSelectedAccountId: index === 0 && selectedAccountIds.length > 1
        ? null
        : selectedAccountIds[index - 1],
    }, () => this.getScreenData(false, true))
  }

  handleSetScrollPosition = (y) => {
    this.setState({ currentScrollPosition: y })
    Keyboard.dismiss()
  }

  goToRECOMMENDATION = () => {
    goTo(this.props.navigation, 'RECOMMENDATION')
  }

  handleSetRef = (ref) => {
    this.listRef = ref
  }

  openBottomSheet = (dataRow, notChange) => {
    this.setState({
      dataRow,
      bankTransIdOpened: null,
      categoryItem: null,
    })
    if ((dataRow.targetType === 'CYCLIC_TRANS' && dataRow.unionId !== null) ||
      dataRow.pictureLink) {
      setTimeout(() => {
        this.getDetails()
      }, 50)
    }
    if (!notChange) {
      this.listRef.snapTo({ index: 1 })
    }
  }

  close = () => {
    this.setState({
      dataRow: null,
      details: null,
    })
    this.listRef.snapTo({ index: 2 })
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
        dataRow: null,
        details: null,
        currentOpenItemIndex: null,
      })
    }
  }
  handleToggleEditDesc = () => {
    const { dataRow } = this.state
    this.setState({
      editDescModal: !this.state.editDescModal,
      copyMainDesc: dataRow.transName.replace(/\n/g, ''),
    })
  }

  handleUpdateFieldValid = name => val => {
    let value = val.nativeEvent.text || ''
    this.setState({ [name]: !!(value && (value.length !== 0)) })
  }

  handleUpdateFields = name => val => {
    let value = val || ''
    value = value.toString().replace(getEmoji(), '').replace(/\n/g, '')

    this.setState({ [name]: value })
    this.handleUpdateFieldValid(`${name}Valid`)({
      nativeEvent: {
        text: value,
      },
    })
  }
  handleOpenCategoriesModal = () => {
    this.setState({ categoriesModalIsOpen: true })
  }

  handleOpenCategoriesInsideModal = (
    category, idxCategory, bankTrans) => () => {
    this.setState({
      categoriesModalIsOpen: true,
      categoryItem: Object.assign(bankTrans, category),
      idxCategory: idxCategory,
    })
  }

  handleSelectCategory = (category) => {
    const { dataRow, categoryItem } = this.state
    if (categoryItem) {
      if (!categoryItem || categoryItem.transTypeId ===
        category.transTypeId) {return}

      const newBankTrans = {
        ...categoryItem,
        iconType: category.iconType,
        transTypeId: category.transTypeId,
        transTypeName: category.transTypeName,
      }
      return this.handleUpdateBankTrans(newBankTrans)
    } else {
      if (!dataRow || dataRow.transType.transTypeId ===
        category.transTypeId) {return}
      let dataRows = JSON.parse(JSON.stringify(dataRow))
      dataRows.transType = Object.assign(dataRows.transType, {
        iconType: category.iconType,
        transTypeId: category.transTypeId,
        transTypeName: category.transTypeName,
      })
      const newBankTrans = {
        ...dataRows,
      }
      return this.handleUpdateBankTrans(newBankTrans)
    }
  }

  handleUpdateBankTrans = (newBankTrans) => {
    if (this.state.categoryItem) {
      const details = JSON.parse(JSON.stringify(this.state.details))
      details[this.state.idxCategory] = newBankTrans
      this.setState({
        details,
        categoriesModalIsOpen: false,
        updateTypePopup: Object.assign(newBankTrans, {
          updateType: 'future',
        }),
      })
    } else {
      const dataOfRow = this.state.dataRow
      if (dataOfRow.transType.transTypeId !==
        newBankTrans.transType.transTypeId) {
        this.setState({
          dataRow: { ...newBankTrans },
          categoriesModalIsOpen: false,
        })
        setTimeout(() => {
          this.handleUpdateTrans({ ...newBankTrans })
        }, 20)
      } else {
        this.setState({
          dataRow: { ...newBankTrans },
          categoriesModalIsOpen: false,
        })
      }
    }
  }

  handleUpdateTrans = (dataOfRow) => {
    if (dataOfRow.targetType === 'BANK_TRANS') {
      accountCflDataUpdateApi.post({
        body: {
          'asmachta': dataOfRow.asmachta,
          'bank': dataOfRow.bank,
          'chequeNo': dataOfRow.chequeNo,
          'companyAccountId': dataOfRow.companyAccountId,
          'companyId': exampleCompany.isExample
            ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
            : dataOfRow.companyId,
          'expence': dataOfRow.expence,
          'kvuaDateFrom': dataOfRow.kvuaDateFrom,
          'kvuaDateTill': dataOfRow.kvuaDateTill,
          'linkId': dataOfRow.linkId,
          'nigreret': dataOfRow.nigreret,
          'originalDate': dataOfRow.originalDate,
          'paymentDesc': dataOfRow.paymentDesc,
          'pictureLink': dataOfRow.pictureLink,
          'sourceProgramName': dataOfRow.sourceProgramName,
          'targetOriginalTotal': dataOfRow.targetOriginalTotal,
          'targetType': dataOfRow.targetType,
          'targetTypeId': dataOfRow.targetTypeId,
          'total': dataOfRow.total,
          'transDate': dataOfRow.nigreret
            ? dataOfRow.originalDate
            : dataOfRow.transDate,
          'transDesc': dataOfRow.transDesc,
          'transId': dataOfRow.transId,
          'transName': dataOfRow.transName,
          'transTypeId': dataOfRow.transType.transTypeId,
          'uniItra': dataOfRow.uniItra,
          'uniItraColor': dataOfRow.uniItraColor,
        },
      }).then(() => {
        this.updateRow(false, dataOfRow)
      }).catch(() => {
        this.updateRow(false)
      })
    } else if (dataOfRow.targetType === 'LOAN_TAZRIM' ||
      dataOfRow.targetType === 'CCARD_TAZRIM' || dataOfRow.targetType ===
      'SOLEK_TAZRIM') {
      const body = Object.assign({}, dataOfRow)
      if (body.mutavArray && !Array.isArray(body.mutavArray)) {
        body.mutavArray = []
      }
      new Api({ endpoint: 'cyclic-trans/cfl/single' }).post({
        body: body,
      })
        .then(data => {
          let dataRow
          if (data && Array.isArray(data.transes) && data.transes.length > 0) {
            if ('asmachta' in data.transes[0] && data.transes[0].asmachta ===
              '') {
              data.transes[0].asmachta = null
            }
            dataRow = Object.assign(JSON.parse(JSON.stringify(dataOfRow)),
              data.transes[0])
            if (!dataRow.autoUpdateTypeName ||
              (dataRow.autoUpdateTypeName && dataRow.autoUpdateTypeName !==
                'USER_DEFINED_TOTAL' && dataRow.autoUpdateTypeName !==
                'USER_CURRENT_TOTAL')) {
              dataRow.autoUpdateTypeName = 'AVG_3_MONTHS'
            }

            if (!dataRow.transFrequencyName || dataRow.transFrequencyName ===
              '') {
              dataRow.transFrequencyName = 'NONE'
            }
            if (!dataRow.expirationDate) {
              dataRow.expirationDate = AppTimezone.moment().valueOf()
              dataRow.endDate = 'none'
            } else {
              dataRow.endDate = 'on'
            }
            dataRow.timesValue = 0
          } else {
            dataRow = JSON.parse(JSON.stringify(dataOfRow))
            if (!dataRow.autoUpdateTypeName ||
              (dataRow.autoUpdateTypeName && dataRow.autoUpdateTypeName !==
                'USER_DEFINED_TOTAL' && dataRow.autoUpdateTypeName !==
                'USER_CURRENT_TOTAL')) {
              dataRow.autoUpdateTypeName = 'AVG_3_MONTHS'
            }
            if (!dataRow.transFrequencyName || dataRow.transFrequencyName ===
              '') {
              dataRow.transFrequencyName = 'NONE'
            }
            if (!dataRow.expirationDate) {
              dataRow.expirationDate = AppTimezone.moment().valueOf()
              dataRow.endDate = 'none'
            } else {
              dataRow.endDate = 'on'
            }
            dataRow.timesValue = 0
            let targetType = dataRow.targetType
            if (targetType === 'CYCLIC_TRANS') {
              let mutavArray = dataRow.mutavArray
              if (mutavArray && Array.isArray(mutavArray)) {
                mutavArray = mutavArray.filter(
                  (item) => item.biziboxMutavId && item.total !== null &&
                    item.total !== '')
              }
              if (
                !(mutavArray && Array.isArray(mutavArray) &&
                  mutavArray.length === 1 && mutavArray[0].biziboxMutavId !==
                  null) &&
                !(mutavArray && Array.isArray(mutavArray) && mutavArray.length >
                  1)
              ) {
                if (mutavArray !== null && !Array.isArray(mutavArray)) {
                  dataRow.mutavArray = null
                }
              }

              if (targetType === 'CYCLIC_TRANS' &&
                ['MONTH', 'WEEK'].includes(dataRow.transFrequencyName) &&
                dataRow.transDate) {
                if (dataRow.transFrequencyName === 'WEEK') {
                  dataRow.frequencyDay = (AppTimezone.moment(dataRow.transDate)
                    .format('dddd')).toUpperCase()
                }
                if (dataRow.transFrequencyName === 'MONTH') {
                  dataRow.frequencyDay = AppTimezone.moment(dataRow.transDate)
                    .format('D')
                }
              }
              if (dataRow.transFrequencyName === 'WEEK' && dataRow.transDate) {
                dataRow.frequencyDay = (AppTimezone.moment(dataRow.transDate)
                  .format('dddd')).toUpperCase()
              }
              if (dataRow.transFrequencyName === 'MONTH' && dataRow.transDate) {
                dataRow.frequencyDay = AppTimezone.moment(dataRow.transDate)
                  .format('D')
              }
            } else {

            }
          }
          new Api(
            { endpoint: `cyclic-trans/cfl/${dataOfRow.targetType}/update` }).post(
            {
              body: {
                'frequencyAutoUpdateTypeName': dataRow.frequencyAutoUpdateTypeName,
                'companyAccountId': dataRow.companyAccountId,
                'expence': dataRow.expence,
                'paymentDesc': dataRow.paymentDesc,
                'targetType': dataRow.targetType,
                'total': dataRow.total,
                'transDate': dataRow.transDate,
                'transId': dataRow.transId,
                'transName': dataRow.transName,
                'transTypeId': dataOfRow.transType.transTypeId,
                'autoUpdateTypeName': dataRow.autoUpdateTypeName,
                'expirationDate': dataRow.expirationDate,
                'frequencyDay': dataRow.frequencyDay,
                'lastBankDate': dataRow.lastBankDate,
                'lastBankDateColor': dataRow.lastBankDateColor,
                'lastBankTotal': dataRow.lastBankTotal,
                'notExpence': dataRow.notExpence,
                'transFrequencyName': dataRow.transFrequencyName,
                'updatedBy': dataRow.updatedBy,
                'mutavArray': dataRow.mutavArray,
                'isUnion': dataRow.isUnion,
              },
            }).then(() => {
            this.updateRow(false, dataOfRow)
          }).catch(() => {
            this.updateRow(false)
          })
        })
        .catch(() => {
        })
    } else {
      new Api({ endpoint: `payments/cfl/${dataOfRow.targetType}/update` }).post(
        {
          body: {
            'asmachta': dataOfRow.asmachta,
            'bank': dataOfRow.bank,
            'chequeNo': dataOfRow.chequeNo,
            'companyAccountId': dataOfRow.companyAccountId,
            'companyId': dataOfRow.companyId,
            'expence': dataOfRow.expence,
            'kvuaDateFrom': dataOfRow.kvuaDateFrom,
            'kvuaDateTill': dataOfRow.kvuaDateTill,
            'linkId': dataOfRow.linkId,
            'nigreret': dataOfRow.nigreret,
            'originalDate': dataOfRow.originalDate,
            'paymentDesc': dataOfRow.paymentDesc,
            'pictureLink': dataOfRow.pictureLink,
            'sourceProgramName': dataOfRow.sourceProgramName,
            'targetOriginalTotal': dataOfRow.targetOriginalTotal,
            'targetType': dataOfRow.targetType,
            'targetTypeId': dataOfRow.targetTypeId,
            'total': dataOfRow.total,
            'transDate': dataOfRow.nigreret
              ? dataOfRow.originalDate
              : dataOfRow.transDate,
            'transDesc': dataOfRow.transDesc,
            'transId': dataOfRow.transId,
            'transName': dataOfRow.transName,
            'transTypeId': dataOfRow.transType.transTypeId,
            'uniItra': dataOfRow.uniItra,
            'uniItraColor': dataOfRow.uniItraColor,
          },
        }).then(() => {
        this.updateRow(false, dataOfRow)
      }).catch(() => {
        this.updateRow(false)
      })
    }
  }

  handleCloseCategoriesModal = () => {
    this.setState({
      categoriesModalIsOpen: false,
      categoryItem: null,
      idxCategory: 0,
    })
  }

  handleUpdateTransText = () => {
    let dataOfRow = Object.assign({}, this.state.dataRow)
    if (dataOfRow.transName !== this.state.copyMainDesc) {
      dataOfRow.transName = this.state.copyMainDesc
      this.setState({
        dataRow: dataOfRow,
        editDescModal: false,
      })

      setTimeout(() => {
        if (dataOfRow.targetType === 'BANK_TRANS') {
          accountCflDataUpdateApi.post({
            body: {
              'asmachta': dataOfRow.asmachta,
              'bank': dataOfRow.bank,
              'chequeNo': dataOfRow.chequeNo,
              'companyAccountId': dataOfRow.companyAccountId,
              'companyId': exampleCompany.isExample
                ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
                : dataOfRow.companyId,
              'expence': dataOfRow.expence,
              'kvuaDateFrom': dataOfRow.kvuaDateFrom,
              'kvuaDateTill': dataOfRow.kvuaDateTill,
              'linkId': dataOfRow.linkId,
              'nigreret': dataOfRow.nigreret,
              'originalDate': dataOfRow.originalDate,
              'paymentDesc': dataOfRow.paymentDesc,
              'pictureLink': dataOfRow.pictureLink,
              'sourceProgramName': dataOfRow.sourceProgramName,
              'targetOriginalTotal': dataOfRow.targetOriginalTotal,
              'targetType': dataOfRow.targetType,
              'targetTypeId': dataOfRow.targetTypeId,
              'total': dataOfRow.total,
              'transDate': dataOfRow.nigreret
                ? dataOfRow.originalDate
                : dataOfRow.transDate,
              'transDesc': dataOfRow.transDesc,
              'transId': dataOfRow.transId,
              'transName': dataOfRow.transName,
              'transTypeId': dataOfRow.transType.transTypeId,
              'uniItra': dataOfRow.uniItra,
              'uniItraColor': dataOfRow.uniItraColor,
            },
          }).then(() => {
            this.updateRow(false, dataOfRow)
          }).catch(() => {
            this.updateRow(false)
          })
        } else if (dataOfRow.targetType === 'LOAN_TAZRIM' ||
          dataOfRow.targetType === 'CCARD_TAZRIM' || dataOfRow.targetType ===
          'SOLEK_TAZRIM') {
          const body = Object.assign({}, dataOfRow)
          if (body.mutavArray && !Array.isArray(body.mutavArray)) {
            body.mutavArray = []
          }
          new Api({ endpoint: 'cyclic-trans/cfl/single' }).post({
            body: body,
          })
            .then(data => {
              let dataRow
              if (data && Array.isArray(data.transes) && data.transes.length >
                0) {
                if ('asmachta' in data.transes[0] &&
                  data.transes[0].asmachta === '') {
                  data.transes[0].asmachta = null
                }
                dataRow = Object.assign(JSON.parse(JSON.stringify(dataOfRow)),
                  data.transes[0])
                if (!dataRow.autoUpdateTypeName ||
                  (dataRow.autoUpdateTypeName && dataRow.autoUpdateTypeName !==
                    'USER_DEFINED_TOTAL' && dataRow.autoUpdateTypeName !==
                    'USER_CURRENT_TOTAL')) {
                  dataRow.autoUpdateTypeName = 'AVG_3_MONTHS'
                }

                if (!dataRow.transFrequencyName ||
                  dataRow.transFrequencyName === '') {
                  dataRow.transFrequencyName = 'NONE'
                }
                if (!dataRow.expirationDate) {
                  dataRow.expirationDate = AppTimezone.moment().valueOf()
                  dataRow.endDate = 'none'
                } else {
                  dataRow.endDate = 'on'
                }
                dataRow.timesValue = 0
              } else {
                dataRow = JSON.parse(JSON.stringify(dataOfRow))
                if (!dataRow.autoUpdateTypeName ||
                  (dataRow.autoUpdateTypeName && dataRow.autoUpdateTypeName !==
                    'USER_DEFINED_TOTAL' && dataRow.autoUpdateTypeName !==
                    'USER_CURRENT_TOTAL')) {
                  dataRow.autoUpdateTypeName = 'AVG_3_MONTHS'
                }
                if (!dataRow.transFrequencyName ||
                  dataRow.transFrequencyName === '') {
                  dataRow.transFrequencyName = 'NONE'
                }
                if (!dataRow.expirationDate) {
                  dataRow.expirationDate = AppTimezone.moment().valueOf()
                  dataRow.endDate = 'none'
                } else {
                  dataRow.endDate = 'on'
                }
                dataRow.timesValue = 0
                let targetType = dataRow.targetType
                if (targetType === 'CYCLIC_TRANS') {
                  let mutavArray = dataRow.mutavArray
                  if (mutavArray && Array.isArray(mutavArray)) {
                    mutavArray = mutavArray.filter(
                      (item) => item.biziboxMutavId && item.total !== null &&
                        item.total !== '')
                  }
                  if (
                    !(mutavArray && Array.isArray(mutavArray) &&
                      mutavArray.length === 1 &&
                      mutavArray[0].biziboxMutavId !== null) &&
                    !(mutavArray && Array.isArray(mutavArray) &&
                      mutavArray.length > 1)
                  ) {
                    if (mutavArray !== null && !Array.isArray(mutavArray)) {
                      dataRow.mutavArray = null
                    }
                  }

                  if (targetType === 'CYCLIC_TRANS' &&
                    ['MONTH', 'WEEK'].includes(dataRow.transFrequencyName) &&
                    dataRow.transDate) {
                    if (dataRow.transFrequencyName === 'WEEK') {
                      dataRow.frequencyDay = (AppTimezone.moment(
                        dataRow.transDate).format('dddd')).toUpperCase()
                    }
                    if (dataRow.transFrequencyName === 'MONTH') {
                      dataRow.frequencyDay = AppTimezone.moment(
                        dataRow.transDate).format('D')
                    }
                  }
                  if (dataRow.transFrequencyName === 'WEEK' &&
                    dataRow.transDate) {
                    dataRow.frequencyDay = (AppTimezone.moment(
                      dataRow.transDate).format('dddd')).toUpperCase()
                  }
                  if (dataRow.transFrequencyName === 'MONTH' &&
                    dataRow.transDate) {
                    dataRow.frequencyDay = AppTimezone.moment(dataRow.transDate)
                      .format('D')
                  }
                } else {

                }
              }
              new Api(
                { endpoint: `cyclic-trans/cfl/${dataOfRow.targetType}/update` }).post(
                {
                  body: {
                    'frequencyAutoUpdateTypeName': dataRow.frequencyAutoUpdateTypeName,
                    'companyAccountId': dataRow.companyAccountId,
                    'expence': dataRow.expence,
                    'paymentDesc': dataRow.paymentDesc,
                    'targetType': dataRow.targetType,
                    'total': dataRow.total,
                    'transDate': dataRow.transDate,
                    'transId': dataRow.transId,
                    'transName': dataOfRow.transName,
                    'transTypeId': dataOfRow.transType.transTypeId,
                    'autoUpdateTypeName': dataRow.autoUpdateTypeName,
                    'expirationDate': dataRow.expirationDate,
                    'frequencyDay': dataRow.frequencyDay,
                    'lastBankDate': dataRow.lastBankDate,
                    'lastBankDateColor': dataRow.lastBankDateColor,
                    'lastBankTotal': dataRow.lastBankTotal,
                    'notExpence': dataRow.notExpence,
                    'transFrequencyName': dataRow.transFrequencyName,
                    'updatedBy': dataRow.updatedBy,
                    'mutavArray': dataRow.mutavArray,
                    'isUnion': dataRow.isUnion,
                  },
                }).then(() => {
                this.updateRow(false, dataOfRow)
              }).catch(() => {
                this.updateRow(false)
              })
            })
            .catch(() => {
            })
        } else {
          const balanceLastUpdatedDateAcc = this.selectedAccounts.find(
            (acc) => acc.companyAccountId === dataOfRow.companyAccountId)
          if (balanceLastUpdatedDateAcc && dataOfRow.transDate >=
            balanceLastUpdatedDateAcc.balanceLastUpdatedDate) {
            new Api(
              { endpoint: `payments/cfl/${dataOfRow.targetType}/update` }).post(
              {
                body: {
                  'asmachta': dataOfRow.asmachta,
                  'bank': dataOfRow.bank,
                  'chequeNo': dataOfRow.chequeNo,
                  'companyAccountId': dataOfRow.companyAccountId,
                  'companyId': dataOfRow.companyId,
                  'expence': dataOfRow.expence,
                  'kvuaDateFrom': dataOfRow.kvuaDateFrom,
                  'kvuaDateTill': dataOfRow.kvuaDateTill,
                  'linkId': dataOfRow.linkId,
                  'nigreret': dataOfRow.nigreret,
                  'originalDate': dataOfRow.originalDate,
                  'paymentDesc': dataOfRow.paymentDesc,
                  'pictureLink': dataOfRow.pictureLink,
                  'sourceProgramName': dataOfRow.sourceProgramName,
                  'targetOriginalTotal': dataOfRow.targetOriginalTotal,
                  'targetType': dataOfRow.targetType,
                  'targetTypeId': dataOfRow.targetTypeId,
                  'total': dataOfRow.total,
                  'transDate': dataOfRow.nigreret
                    ? dataOfRow.originalDate
                    : dataOfRow.transDate,
                  'transDesc': dataOfRow.transDesc,
                  'transId': dataOfRow.transId,
                  'transName': dataOfRow.transName,
                  'transTypeId': dataOfRow.transType.transTypeId,
                  'uniItra': dataOfRow.uniItra,
                  'uniItraColor': dataOfRow.uniItraColor,
                },
              }).then(() => {
              this.updateRow(false, dataOfRow)
            }).catch(() => {
              this.updateRow(false)
            })
          } else {
            accountCflDataUpdateApi.post({
              body: {
                'asmachta': dataOfRow.asmachta,
                'bank': dataOfRow.bank,
                'chequeNo': dataOfRow.chequeNo,
                'companyAccountId': dataOfRow.companyAccountId,
                'companyId': exampleCompany.isExample
                  ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
                  : dataOfRow.companyId,
                'expence': dataOfRow.expence,
                'kvuaDateFrom': dataOfRow.kvuaDateFrom,
                'kvuaDateTill': dataOfRow.kvuaDateTill,
                'linkId': dataOfRow.linkId,
                'nigreret': dataOfRow.nigreret,
                'originalDate': dataOfRow.originalDate,
                'paymentDesc': dataOfRow.paymentDesc,
                'pictureLink': dataOfRow.pictureLink,
                'sourceProgramName': dataOfRow.sourceProgramName,
                'targetOriginalTotal': dataOfRow.targetOriginalTotal,
                'targetType': dataOfRow.targetType,
                'targetTypeId': dataOfRow.targetTypeId,
                'total': dataOfRow.total,
                'transDate': dataOfRow.nigreret
                  ? dataOfRow.originalDate
                  : dataOfRow.transDate,
                'transDesc': dataOfRow.transDesc,
                'transId': dataOfRow.transId,
                'transName': dataOfRow.transName,
                'transTypeId': dataOfRow.transType.transTypeId,
                'uniItra': dataOfRow.uniItra,
                'uniItraColor': dataOfRow.uniItraColor,
              },
            }).then(() => {
              this.updateRow(false, dataOfRow)
            }).catch(() => {
              this.updateRow(false)
            })
          }
        }
      }, 10)
    } else {
      this.setState({ editDescModal: false })
    }
  }

  openActionSheet = () => {
    this.bottomActionSheet.show(() => {
      // console.log('callback - show')
    })
  }

  onChange = (value, index, values) => {
    // console.log(values)
    this.setState({ selectedItems: values })
  }

  onItemPress = (value) => {
    let dataRow = Object.assign({}, this.state.dataRow)
    if (value === 'edit') {
      if (dataRow.targetType === 'SOLEK_TAZRIM') {
        this.getUnionDet()
      } else {
        this.handlePopRowEditsModal(dataRow)
      }
    } else if (value === 'delete') {
      if (dataRow.targetType === 'SOLEK_TAZRIM') {
        this.getUnionDet()
      } else {
        this.removeItem(this.state.dataRow, false)
      }
    } else if (value === 'deleteAll') {
      if (dataRow.targetType === 'SOLEK_TAZRIM') {
        this.getUnionDet()
      } else {
        this.removeItem(this.state.dataRow, true)
      }
    } else if (value === 'deleteOnly') {
      if (dataRow.targetType === 'SOLEK_TAZRIM') {
        this.getUnionDet()
      } else {
        this.removeItem(this.state.dataRow, false)
      }
    }
  }

  getUnionDet = () => {
    this.setState({
      modalGetUnionDet: true,
    })
    let dataRow = Object.assign({}, this.state.dataRow)
    const param = {
      companyAccountId: dataRow.companyAccountId,
      transDate: dataRow.transDate,
      unionId: dataRow.unionId,
    }
    getUnionDetApi.post({
      body: param,
    }).then((modalGetUnionDet) => {
      this.setState({
        modalGetUnionDet,
      })
    })
  }
  hideModalGetUnionDet = () => {
    this.setState({
      modalGetUnionDet: false,
    })
  }

  handlePopRowEditsFromModal = (params) => () => {
    this.hideModalGetUnionDet()
    this.handlePopRowEditsModal(params)
  }

  removeItemFromModal = (...params) => () => {
    this.hideModalGetUnionDet()
    this.handleRemoveRowModalCb(params[0], params[1])
  }

  showIconRef (type) {
    if (type === 'CYCLIC_TRANS' ||
      type === 'DIRECTD' ||
      type === 'CCARD_TAZRIM' ||
      type === 'SOLEK_TAZRIM' ||
      type === 'CASH' ||
      type === 'LOAN_TAZRIM'
    ) {
      return true
    }
    return false
  }

  handleCreateBankTransCategory = (transTypeName) => {
    const { currentCompanyId } = this.props
    return createAccountCflTransTypeApi.post({
      body: {
        'transTypeId': null,
        transTypeName,
        companyId: currentCompanyId,
      },
    })
  }
  handleRemoveBankTransCategory = (transTypeId) => {
    const { currentCompanyId } = this.props
    return removeAccountCflTransTypeApi.post({
      body: {
        transTypeId,
        companyId: currentCompanyId,
      },
    })
  }
  getDetails = () => {
    const { currentCompanyId, accounts } = this.props
    const { dataRow } = this.state
    this.setState({ inProgressDetails: true })

    if (dataRow.pictureLink) {
      const account = dataRow ? accounts.find(
        a => a.companyAccountId === dataRow.companyAccountId) : null
      return accountCflCheckDetailsApi.post({
        body: {
          companyAccountId: dataRow.companyAccountId,
          folderName: `${account.bankId}${account.bankSnifId}${account.bankAccountId}`,
          pictureLink: dataRow.pictureLink,
          bankTransId: dataRow.transId,
        },
      })
        .then(details => {
          this.setState({
            details,
            inProgressDetails: false,
          })
        })
        .catch(() => this.setState({ inProgressDetails: false }))
    } else if (dataRow.targetType === 'CYCLIC_TRANS' && dataRow.unionId !==
      null) {
      return cashFlowUnionBankDetApi.post({
        body: {
          'companyId': currentCompanyId,
          'dateFrom': dataRow.kvuaDateFrom,
          'transId': dataRow.transId,
        },
      })
        .then(res => {
          let mutavArray = res
          if (mutavArray && Array.isArray(mutavArray)) {
            mutavArray = mutavArray.filter(
              (item) => item.biziboxMutavId && item.total !== null &&
                item.total !== '')
          }
          this.setState({
            details: mutavArray,
            inProgressDetails: false,
          })
        })
        .catch(() => this.setState({ inProgressDetails: false }))
    }
  }

  closeUpdateTypePopup = () => {
    this.setState({
      updateTypePopup: false,
    })
  }

  handleTransCategory = (transType) => () => {
    let updateTypePopup = Object.assign({}, this.state.updateTypePopup)
    updateTypePopup.updateType = transType
    this.setState({
      updateTypePopup,
    })
  }
  updateTypeOfTrans = () => {
    const { updateTypePopup } = this.state
    return mutavCategoryUpdateApi.post({
      body: {
        'companyId': exampleCompany.isExample
          ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
          : this.props.currentCompanyId,
        'biziboxMutavId': updateTypePopup.biziboxMutavId,
        'transTypeId': updateTypePopup.transTypeId,
        'updateType': updateTypePopup.updateType,
      },
    }).then(() => {
      this.setState({
        categoryItem: null,
        bankTransIdOpened: updateTypePopup.transId,
        updateTypePopup: false,
      })
      setTimeout(() => {
        this.getScreenData()
      }, 50)
    })
  }

  render () {
    const {
      cashFlowDetailsData,
      cashFlowAggregatedData,
      t,
      accounts,
      isRtl,
      accountGroups,
      currentCompanyId,
      navigation,
      route,
    } = this.props
    const {
      categories,
      selectedAccountIds,
      selectedGroup,
      accountsModalIsOpen,
      dateTillTimestamp,
      dateFromTimestamp,
      headerMaxHeight,
      alertYPosition,
      alertDetailsIsOpen,
      calendarModalIsOpen,
      isLayoutComplete,
      openModalCreatePayments,
      dataTypePayments,
      currentSelectedAccountId,
      isHeaderChartSliderPanEnable,
      removeRowModalOpen,
      rowInfo,
      editRowModalOpen,
      itemUpdate,
      scrollAnim,
      changeScreenModeInProgress,
      selectedIndex,
      accountBalanceChartDataState,
      cashFlowAggregatedDataStateArr,
      bankTrans,
      queryStatus,
      categoriesMatchCopy,
      payListCopy,
      categoriesMatchModal,
      payListModal,
      isSearchOpen,
      payList,
      categoriesMatch,
      showGraph,
      bankTransGraphHova,
      bankTransGraphZchut,
      datesGraphList,
      numberTickZchut,
      numberTickHova,
      yAxisSums,
      monthYear,
      isDefDates,
      currentOpenItemIndex,
      dataRow,
      inProgressSnap,
      editDescModal,
      copyMainDescValid,
      copyMainDesc,
      modalGetUnionDet,
      categoriesModalIsOpen,
      categoryItem,
      idxCategory,
      inProgressDetails,
      details,
      updateTypePopup,
    } = this.state

    if (!isLayoutComplete) {return <Loader/>}
    let payListArr = []
    let categoriesMatchArr = []
    let lenCategoriesMatchCopy = 0
    let lenPayListCopy = 0
    if (!this.screenSwitchState) {
      payListArr = payList.filter((it) => it.press === true)
      categoriesMatchArr = categoriesMatch.filter((it) => it.press === true)
      lenPayListCopy = payListCopy.filter((it) => it.press === true).length
      lenCategoriesMatchCopy = categoriesMatchCopy.filter(
        (it) => it.press === true).length
    }
    const axesSvg = {
      fontSize: sp(10),
      fill: colors.blue32,
    }
    const verticalContentInset = {
      top: 0,
      bottom: 0,
    }
    const xAxisHeight = 35
    const ratio = (win.height - this.headerHeight) / win.width

    // //console.log(cashFlowDetailsData,
    //   cashFlowAggregatedData)
    const alertState = this.headerAlertState
    const hasData = this.screenSwitchState
      ? ((cashFlowAggregatedData &&
        !isEmpty(cashFlowAggregatedData.accountTransactions)))
      : ((cashFlowDetailsData && cashFlowDetailsData.cashFlowDetails &&
        cashFlowDetailsData.cashFlowDetails.length > 0))

    let cashFlowDetailsList = cashFlowDetailsData
    if (cashFlowDetailsData && cashFlowDetailsData.cashFlowDetails &&
      cashFlowDetailsData.cashFlowDetails.length) {
      cashFlowDetailsList = cashFlowDetailsData.cashFlowDetails
    } else {
      cashFlowDetailsList = []
    }
    const total = dataRow ? getFormattedValueArray(dataRow.total) : null
    const numberStyle = dataRow ? cs(dataRow.expence, [
      {
        fontFamily: fonts.semiBold,
      }, { color: colors.green4 }], { color: colors.red2 }) : {}
    let totalModal = [0, 0]
    if (modalGetUnionDet && modalGetUnionDet.length) {
      totalModal = getFormattedValueArray(
        modalGetUnionDet.reduce((memo, val) => {
          return memo + val.total
        }, 0))
    }
    const account = dataRow ? accounts.find(
      a => a.companyAccountId === dataRow.companyAccountId) : null
    let textCategory = false
    if (details && details.length > 0) {
      const transTypeIdCategory = [...new Set(details.map(x => x.transTypeId))]
      if (transTypeIdCategory.length > 1) {
        textCategory = 'קטגוריות שונות'
      }
    }
    let deletedItems = false
    let editDesc = false
    let editBtn = false
    let editCategory = false

    if (dataRow) {
      if (dataRow.targetType === 'CYCLIC_TRANS' ||
        dataRow.targetType === 'DIRECTD' ||
        dataRow.targetType === 'CCARD_TAZRIM' ||
        dataRow.targetType === 'SOLEK_TAZRIM' ||
        dataRow.targetType === 'CASH' ||
        dataRow.targetType === 'LOAN_TAZRIM'
      ) {
        deletedItems = true
      }

      if (dataRow.targetType === 'CHEQUE' ||
        dataRow.targetType === 'BANK_CHEQUE' ||
        dataRow.targetType === 'ERP_CHEQUE' ||
        dataRow.targetType === 'OTHER' ||
        dataRow.targetType === 'WIRE_TRANSFER' ||
        dataRow.targetType === 'BANK_TRANS' ||
        // (dataRow.targetType === 'CYCLIC_TRANS' && !dataRow.unionId) ||
        dataRow.targetType === 'DIRECTD' ||
        dataRow.targetType === 'CASH' ||
        dataRow.targetType === 'LOAN_TAZRIM' ||
        dataRow.targetType === 'CCARD_TAZRIM'
      ) {
        editDesc = true
      }

      if (dataRow.targetType !== 'BANK_TRANS'

      ) {
        editBtn = true
      }

      if (dataRow.targetType === 'CHEQUE' ||
        dataRow.targetType === 'BANK_CHEQUE' ||
        dataRow.targetType === 'ERP_CHEQUE' ||
        dataRow.targetType === 'OTHER' ||
        dataRow.targetType === 'WIRE_TRANSFER' ||
        dataRow.targetType === 'BANK_TRANS' ||
        dataRow.targetType === 'LOAN_TAZRIM' ||
        dataRow.targetType === 'CCARD_TAZRIM' ||
        dataRow.targetType === 'SOLEK_TAZRIM'
      ) {
        editCategory = true
      }

      if (dataRow && dataRow.paymentDesc === 'Checks' && dataRow.pictureLink &&
        dataRow.pictureLink !== '00000000-0000-0000-0000-000000000000' &&
        dataRow.pictureLink !== null) {
        editCategory = false
      }
    }
    StatusBar.setBarStyle((IS_IOS || currentOpenItemIndex !== null)
      ? 'dark-content'
      : 'light-content', true)

    return (
      <Fragment>
        <HeaderHeightContext.Consumer>
          {headerHeight => {
            this.headerHeight = headerHeight;
          }}
        </HeaderHeightContext.Consumer>
        <View style={[
          styles.fill, {
            flex: 1,
            backgroundColor: (changeScreenModeInProgress ||
              (isSearchOpen && !this.screenSwitchState))
              ? '#ffffff'
              : colors.blue32,
          }]}>
          <AlertsTrial navigation={navigation} refresh={this.refresh}
                       updateToken={this.props.globalParams.updateToken}/>

          {(this.isLoader) && (<Loader overlay
                                       containerStyle={{ backgroundColor: colors.white }}/>)}

          <Fragment>
            <DataList
              navigation={this.props.navigation}
              currentOpenItemIndex={currentOpenItemIndex}
              openBottomSheet={this.openBottomSheet}
              loaderProgress={this.isLoader}
              cashFlowAggregatedDataStateArr={cashFlowAggregatedDataStateArr ||
              []}
              scrollAnim={scrollAnim}
              goToMatch={this.goToMatch}
              reload={this.getScreenData}
              selectedAccountIds={selectedAccountIds}
              removeItem={this.handleRemoveRowModalCb}
              handleGetOneAggregateDataPerDay={this.handleGetOneAggregateDataPerDay}
              isRtl={isRtl}
              handlePopRowEditsModal={this.handlePopRowEditsModal}
              itemUpdate={itemUpdate}
              updateRow={this.updateRow}
              hasData={hasData}
              currentCompanyId={currentCompanyId}
              accounts={accounts}
              categories={categories}
              scrollEnabled={!alertDetailsIsOpen}
              cashFlowDetailsData={cashFlowDetailsList}
              headerMaxHeight={headerMaxHeight}
              cashFlowAggregatedData={cashFlowAggregatedData}
              companyId={currentCompanyId}
              isHeaderChartSliderPanEnable={isHeaderChartSliderPanEnable}
              onMoveHeaderSlider={this.handleMoveHeaderSlider}
              onNextAccount={this.selectNextAccount}
              onPreviousAccount={this.selectPreviousAccount}
              refresh={this.refresh}
              inProgress={changeScreenModeInProgress}
              onIndexChanged={this.onIndexChanged}
              dateFromTimestamp={dateFromTimestamp}
              dateTillTimestamp={dateTillTimestamp}
              selectedIndex={selectedIndex}
              selectedGroup={selectedGroup}
              dataAlertHeader={this.screenSwitchState
                ? cashFlowAggregatedData
                : cashFlowDetailsData}
              headerScrollDistance={this.handleSetHeaderHeight}
              alertState={this.headerAlertState}
              onSetScrollPosition={this.handleSetScrollPosition}
              accountBalanceChartDataState={accountBalanceChartDataState}
              hasAlert={this.hasHeaderAlert}
              screenSwitchState={this.screenSwitchState}
              selectedAccounts={this.selectedAccounts}
              selectedDeviantAccounts={this.selectedDeviantAccounts}
              selectedNotUpdatedAccounts={this.selectedNotUpdatedAccounts}
              scrollY={this.scrollY}
              alertYPosition={alertYPosition}
              accountGroups={accountGroups}
              currentSelectedAccountId={currentSelectedAccountId}
              currentAccountIndex={this.currentAccountIndex}
              hasNextAccount={this.hasNextAccount}
              hasPreviousAccount={this.hasPreviousAccount}
              onOpenAccountsModal={this.handleOpenAccountsModal}
              onSelectAccount={this.handleForceSelectAccount}
              onToggleAlertDetails={this.handleToggleAlertDetails}
              onToggleCalendar={this.handleOpenCalendarModal}
              onChangeScreenMode={this.handleChangeScreenMode}
              onSetHeaderHeight={this.handleSetHeaderHeight}
              onSetAlertPosition={this.handleSetAlertPosition}
              headerMinHeight={this.headerMinHeight}
              headerChartX={this.headerChartX}
              bankTransNotExist={this.hasDataFilter}
              openGraph={this.openGraph}
              isSearchOpen={isSearchOpen}
              queryStatus={queryStatus}
              bankTrans={bankTrans}
            />
            <CashFlowHeader
              isDefDates={isDefDates}
              isSearchOpenState={isSearchOpen}
              handleDeletePays={this.handleDeletePays}
              handleDeleteCategory={this.handleDeleteCategory}
              payListCopy={payListArr}
              categoriesMatchCopy={categoriesMatchArr}
              handleModalTypes={this.handleModalTypes}
              isSearchOpen={this.isSearchOpen}
              searchQuery={this.searchQuery}
              queryStatus={queryStatus}
              scrollAnim={scrollAnim}
              isRtl={isRtl}
              dateFromTimestamp={dateFromTimestamp}
              dateTillTimestamp={dateTillTimestamp}
              screenSwitchState={this.screenSwitchState}
              selectedAccounts={this.selectedAccounts}
              selectedDeviantAccounts={this.selectedDeviantAccounts}
              selectedNotUpdatedAccounts={this.selectedNotUpdatedAccounts}
              hasData={hasData}
              hasAlert={this.hasHeaderAlert}
              accountGroups={accountGroups}
              selectedGroup={selectedGroup}
              headerScrollDistance={this.headerScrollDistance}
              onOpenAccountsModal={this.handleOpenAccountsModal}
              onToggleCalendar={this.handleOpenCalendarModal}
              onSetHeaderHeight={this.handleSetHeaderHeight}
            />

            {alertDetailsIsOpen && (
              <AccountAlertDetails
                alertState={alertState}
                isRtl={isRtl}
                top={alertYPosition + 75}
                accounts={this.selectedDeviantAccounts &&
                this.selectedDeviantAccounts.length
                  ? this.selectedDeviantAccounts
                  : this.selectedHarigaDatetAccountsAll}
                onSelectAccount={this.handleForceSelectAccount}
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
              <CashFlowCalendarModal
                minDate={this.minOldestTransDateInSelectedAccounts()}
                isOpen
                t={t}
                isRtl={isRtl}
                onClose={this.handleCloseCalendarModal}
                balanceLastUpdatedDate={this.selectedAccounts.length > 0
                  ? this.selectedAccounts[0].balanceLastUpdatedDate
                  : AppTimezone.moment().valueOf()}
                dateFromTimestamp={dateFromTimestamp}
                dateTillTimestamp={dateTillTimestamp}
                onSetDates={this.handleSetDates}
              />
            )}

            {openModalCreatePayments && (
              <CreatePayment
                route={route}
                categories={categories}
                updateRow={this.getScreenData}
                navigation={navigation}
                accounts={accounts}
                selectedAccountIds={selectedAccountIds}
                currentCompanyId={currentCompanyId}
                closeModalCreatePayments={this.closeModalCreatePayments}
                dataTypePayments={dataTypePayments}/>)}

            {removeRowModalOpen && (
              <RemoveRowModal
                setModalVisible={this.handleRemoveRowModalCb}
                isRtl={isRtl}
                item={rowInfo}
                removeItem={this.removeItem}
              />
            )}

            {editRowModalOpen && (
              <EditRowModal
                categories={categories}
                screen={'CashFlowScreen'}
                currentCompanyId={currentCompanyId}
                accounts={accounts}
                dataOfRow={rowInfo}
                updateRow={this.updateRow}
              />
            )}

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
                }} onPress={this.handleCancelSaveCategories}/>

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
                        {'סינון לפי קטגוריה'}
                      </Text>
                    </View>
                    <View style={{
                      marginTop: 30,
                    }}>
                      <TouchableOpacity
                        activeOpacity={(lenCategoriesMatchCopy > 0) ? 0.2 : 1}
                        hitSlop={{
                          top: 20,
                          bottom: 20,
                          left: 20,
                          right: 20,
                        }}
                        onPress={this.handleRemoveAllCategories}>
                        <Text style={{
                          color: lenCategoriesMatchCopy > 0
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
                    }}
                  >
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
                                flexDirection: (isRtl) ? 'row-reverse' : 'row',
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
                                                        ? '#11cab1'
                                                        : '#0c2b5f',
                                                      borderRadius: 5,
                                                      backgroundColor: f.press
                                                        ? '#11cab1'
                                                        : 'white',
                                                    }}>
                                    <View style={{}}>
                                      <CustomIcon
                                        name={getTransCategoryIcon(f.iconType)}
                                        size={30}
                                        color={f.press ? 'white' : '#022258'}/>
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

            {(payListModal) && (
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
                }} onPress={this.handleCancelSavePays}/>

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
                        onPress={this.handleSavePays}>
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
                        {'סינון לפי סוג תשלום'}
                      </Text>
                    </View>
                    <View style={{
                      marginTop: 30,
                    }}>
                      <TouchableOpacity
                        activeOpacity={(lenPayListCopy > 0) ? 0.2 : 1}
                        hitSlop={{
                          top: 20,
                          bottom: 20,
                          left: 20,
                          right: 20,
                        }}
                        onPress={this.handleRemoveAllPays}>
                        <Text style={{
                          color: lenPayListCopy > 0 ? '#2aa1d9' : '#c2c3c3',
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
                    }}
                  >
                    {payListCopy.length > 0 &&
                    this.divideList(payListCopy).map((gr, i) => {
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
                                flexDirection: (isRtl) ? 'row-reverse' : 'row',
                              }}>
                          {
                            gr.map((f, i1) => {
                              if (f.press !== null) {
                                return (
                                  <TouchableOpacity key={i1.toString()}
                                                    onPress={this.handleTogglePays(
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
                                                        ? '#11cab1'
                                                        : '#0c2b5f',
                                                      borderRadius: 5,
                                                      backgroundColor: f.press
                                                        ? '#11cab1'
                                                        : 'white',
                                                    }}>
                                    <View style={{}}>
                                      <CustomIcon
                                        name={getBankTransIcon(f.id)}
                                        size={30}
                                        color={f.press ? 'white' : '#022258'}/>
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
                                      {(this.props.searchkey &&
                                      this.props.searchkey.length > 0 &&
                                      this.props.searchkey.find(
                                        (it) => it.paymentDescription === f.id)
                                        ? this.props.searchkey.find(
                                          (it) => it.paymentDescription ===
                                            f.id).name
                                        : '')}
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

            <Modal
              animationType="slide"
              transparent={false}
              visible={showGraph}
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
                        <TouchableOpacity onPress={this.closeGraph}>
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
                          {'תצוגת גרף'}
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
                    marginTop: 15,
                    marginBottom: 10,
                    paddingLeft: 0,
                    paddingRight: 10,
                    flex: 1,
                    alignItems: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                  }}>
                    <View
                      style={{
                        marginTop: 0,
                        width: win.height - 93 * ratio,
                        height: win.width - (isIphoneX() ? 25 : 0),
                        flexDirection: 'row',
                        transform: [{ rotate: '90deg' }],
                      }}>

                      <YAxis
                        numberOfTicks={numberTickZchut + numberTickHova}
                        data={yAxisSums}
                        formatLabel={(value, idx) => {
                          if (value === 0) {
                            return value
                          } else {
                            const val = yAxisSums[idx]
                            return val !== undefined
                              ? this.checkIfK(val)
                              : Math.max(...bankTransGraphZchut) !== 0
                                ? this.checkIfK(
                                  Math.max(...bankTransGraphZchut))
                                : this.checkIfK(
                                  Math.abs(Math.min(...bankTransGraphHova)) / 5)
                          }
                        }}
                        style={{
                          marginBottom: (monthYear &&
                            monthYear.filter(item => item !== '').length === 1)
                            ? 60
                            : 35,
                          width: 30,
                          fontFamily: fonts.regular,
                        }}
                        contentInset={verticalContentInset}
                        svg={axesSvg}
                      />

                      <View style={{
                        flex: 1,
                        marginLeft: 10,
                      }}>
                        <LineChart
                          numberOfTicks={numberTickZchut}
                          style={{
                            flex: Math.max(...bankTransGraphZchut) !== 0
                              ? Math.max(...bankTransGraphZchut)
                              : Math.abs(Math.min(...bankTransGraphHova)) / 5,
                          }}
                          data={bankTransGraphZchut}
                          contentInset={verticalContentInset}
                          svg={{ stroke: 'blue' }}
                        >
                          <Grid/>
                        </LineChart>
                        <LineChart
                          numberOfTicks={numberTickHova}
                          style={{
                            flex: Math.abs(Math.min(...bankTransGraphHova)) !==
                            0
                              ? Math.abs(Math.min(...bankTransGraphHova))
                              : Math.max(...bankTransGraphZchut) / 5,
                          }}
                          data={bankTransGraphHova}
                          contentInset={verticalContentInset}
                          svg={{ stroke: 'red' }}
                        >
                          <Grid/>
                        </LineChart>
                        {monthYear &&
                        monthYear.filter(item => item !== '').length === 1 && (
                          <XAxis
                            data={datesGraphList}
                            svg={{
                              rotation: 0,
                              originY: 0,
                              y: 5,
                              fontSize: sp(10),
                              fill: colors.blue32,
                              fontFamily: fonts.regular,
                            }}
                            xAccessor={({ item, index }) => index}
                            style={{
                              marginHorizontal: -10,
                              height: xAxisHeight - 10,
                              fontFamily: fonts.regular,
                            }}
                            contentInset={{
                              left: 10,
                              right: 10,
                            }}
                            formatLabel={(value) => Number(
                              datesGraphList[value].split('/')[0])}
                          />
                        )}
                        <XAxis
                          data={monthYear}
                          svg={{
                            rotation: 0,
                            originY: 0,
                            y: 5,
                            fontSize: sp(12),
                            fill: colors.blue32,
                            fontFamily: fonts.regular,
                          }}
                          xAccessor={({ item, index }) => index}
                          style={{
                            marginHorizontal: -10,
                            height: xAxisHeight,
                            fontFamily: fonts.regular,
                          }}
                          contentInset={{
                            left: 10,
                            right: 10,
                          }}
                          formatLabel={(value) => {
                            const val = monthYear[value]
                            if (val.toString().length === 0) {
                              return val
                            } else {
                              const vals = monthYear[value].split('/')
                              if (IS_IOS) {
                                return (LocaleConfig.locales.he.monthNamesShort[Number(
                                  vals[0]) - 1] + ' ' + vals[1])
                              } else {
                                const mon = Number(vals[0]) - 1
                                const monHeb = LocaleConfig.locales.he.monthNamesShort[mon]
                                return (vals[1] + ' ' +
                                  Array.from(monHeb).reverse().join(''))
                              }
                            }
                          }}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </SafeAreaView>
            </Modal>

            <Modal
              animationType="slide"
              transparent={false}
              visible={editDescModal}>
              <SafeAreaView style={{
                flex: 1,
                marginTop: 0,
                paddingTop: 0,
                position: 'relative',
              }}>
                <View style={{
                  flex: 1,
                }}>
                  <View style={{
                    height: 50,
                    width: '100%',
                    paddingTop: 0,
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}>
                    <View style={cs(
                      !isRtl,
                      [
                        {
                          height: 50,
                          flexDirection: 'row',
                          alignContent: 'center',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }],
                      commonStyles.rowReverse,
                    )}>
                      <View style={{
                        alignSelf: 'center',
                      }}>
                        <TouchableOpacity onPress={this.handleToggleEditDesc}>
                          <Icon
                            name="close"
                            type="material-community"
                            size={20}
                            color={'#022258'}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={{
                        alignSelf: 'center',
                        opacity: (copyMainDescValid === true &&
                          copyMainDesc.length > 0) ? 1 : 0.3,
                      }}>
                        <TouchableOpacity
                          activeOpacity={(copyMainDescValid === true &&
                            copyMainDesc.length > 0) ? 0.2 : 1}
                          onPress={(copyMainDescValid === true &&
                            copyMainDesc.length > 0)
                            ? this.handleUpdateTransText
                            : null}>
                          <Text style={{
                            fontSize: sp(16),
                            color: '#022258',
                            fontFamily: fonts.semiBold,
                          }}>{'אישור'}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <KeyboardAwareScrollView
                    enableOnAndroid
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={{
                      width: '100%',
                      marginTop: 0,
                      marginBottom: 0,
                      flexGrow: 1,
                      alignItems: 'center',
                      alignSelf: 'center',
                      alignContent: 'center',
                    }}
                    style={{
                      height: '100%',
                      width: '100%',
                      marginTop: 0,
                      marginBottom: 0,
                      paddingLeft: 0,
                      paddingRight: 0,
                      flex: 1,
                    }}>
                    <View>
                      <View style={[
                        commonStyles.row, {
                          flex: 1,
                          width: '100%',
                          marginBottom: 8,
                          backgroundColor: '#ffffff',
                          borderColor: colors.red,
                          borderWidth: (copyMainDescValid) ? 0 : 1,
                          paddingHorizontal: 10,
                        }]}>
                        <TextInput
                          autoFocus
                          editable
                          autoCorrect={false}
                          autoCapitalize="sentences"
                          returnKeyType="done"
                          keyboardType="default"
                          multiline
                          placeholder={'תיאור התנועה'}
                          placeholderTextColor="#a7a3a3"
                          numberOfLines={12}
                          underlineColorAndroid="transparent"
                          style={[
                            {
                              textAlign: 'right',
                              color: '#022258',
                              fontSize: sp(20),
                              width: '100%',
                              height: 300,
                              textAlignVertical: 'top',
                            }, commonStyles.regularFont]}
                          onChangeText={this.handleUpdateFields('copyMainDesc')}
                          onEndEditing={(e) => {
                            this.setState({
                              copyMainDesc: e.nativeEvent.text.toString()
                                .replace(getEmoji(), '')
                                .replace(/\n/g, ''),
                            })
                            this.handleUpdateFieldValid('copyMainDescValid')(e)
                          }}
                          onBlur={this.handleUpdateFieldValid(
                            'copyMainDescValid')}
                          value={copyMainDesc}
                        />
                      </View>
                    </View>
                  </KeyboardAwareScrollView>
                </View>
              </SafeAreaView>
            </Modal>

            <Modal
              animationType="slide"
              transparent={false}
              visible={modalGetUnionDet !== false}
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
                      <View style={{ alignItems: 'center' }}>
                        <Text
                          style={{
                            fontSize: sp(20),
                            color: '#ffffff',
                            fontFamily: fonts.semiBold,
                          }}>
                          {'פירוט תנועות סליקה'}
                        </Text>
                      </View>
                      <View>
                        <TouchableOpacity onPress={this.hideModalGetUnionDet}>
                          <View style={{
                            marginRight: 'auto',
                          }}>
                            <Icon name="chevron-right" size={30}
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
                    <ScrollView>
                      <Text style={{
                        marginTop: 10,
                        fontSize: sp(16),
                        color: '#022258',
                        fontFamily: fonts.bold,
                        textAlign: 'center',
                      }}>{'הסליקה הצפוייה מורכבת מסכום המותגים הבאים.'}</Text>

                      {dataRow && dataRow.canChangeZefi && (
                        <Fragment>
                          <Text style={{
                            fontSize: sp(16),
                            color: '#022258',
                            fontFamily: fonts.semiBold,
                            textAlign: 'center',
                          }}>{'על מנת לדייק בסכום לתזרים ניתן לערוך'}</Text>
                          <Text style={{
                            fontSize: sp(16),
                            color: '#022258',
                            fontFamily: fonts.semiBold,
                            textAlign: 'center',
                            marginBottom: 10,
                          }}>{'או למחוק כל מותג בנפרד'}</Text>
                        </Fragment>
                      )}

                      <View style={{
                        height: 38,
                        flex: 1,
                        backgroundColor: '#dde7f1',
                        flexDirection: 'row-reverse',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10,
                      }}>
                        <View style={{
                          flex: 68,
                        }}/>
                        <View style={{
                          flex: 330,
                        }}>
                          <Text style={{
                            fontSize: sp(16.5),
                            color: '#022258',
                            fontFamily: fonts.bold,
                            textAlign: 'right',
                          }}>{'מותג'}</Text>
                        </View>
                        <View style={{
                          flex: 284,
                        }}>
                          <Text style={{
                            fontSize: sp(16.5),
                            color: '#022258',
                            fontFamily: fonts.bold,
                            textAlign: 'right',
                          }}>{'סכום'}</Text>
                        </View>
                        <View style={{
                          flex: 20,
                        }}/>
                      </View>

                      {modalGetUnionDet && modalGetUnionDet.length ===
                      undefined && (
                        <View style={[
                          styles.sliderItemGradientNotCard,
                          { width: '100%' }]}>
                          <Loader
                            isDefault
                            containerStyle={{ backgroundColor: 'transparent' }}
                            size="small"
                            color={'#022258'}
                          />
                        </View>
                      )}
                      {modalGetUnionDet && modalGetUnionDet.length > 0 &&
                      modalGetUnionDet.map((c, i) => {
                        const numberStyle = cs(c.expence,
                          [styles.dataValue, { color: colors.green4 }],
                          { color: colors.red2 })
                        const total = getFormattedValueArray(
                          c.expence ? -Math.abs(c.total) : c.total)

                        return (
                          <View key={i.toString()}>
                            <View
                              style={{
                                height: 63,
                                flex: 1,
                                backgroundColor: '#ffffff',
                                flexDirection: 'row-reverse',
                                alignContent: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                marginRight: 10,
                              }}>
                              <View style={{
                                flex: 68,
                              }}/>

                              <View style={{
                                flex: 330,
                                flexDirection: 'column',
                                height: 55,
                                justifyContent: 'flex-end',
                              }}>
                                <Text style={{
                                  fontSize: sp(16),
                                  color: '#022258',
                                  fontFamily: fonts.semiBold,
                                  textAlign: 'right',
                                }}>{c.transName}</Text>
                                {dataRow && dataRow.canChangeZefi && (
                                  <TouchableOpacity
                                    style={{
                                      alignSelf: 'flex-end',
                                      alignContent: 'flex-end',
                                      justifyContent: 'flex-end',
                                      alignItems: 'flex-end',
                                    }}
                                    onPress={this.removeItemFromModal(c, true)}>
                                    <Text style={{
                                      fontSize: sp(15),
                                      color: '#ef3636',
                                      fontFamily: fonts.regular,
                                      textAlign: 'right',
                                      textDecorationLine: 'underline',
                                      textDecorationStyle: 'solid',
                                      textDecorationColor: '#ef3636',
                                    }}>{'מחיקה'}</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                              <View style={{
                                flex: 284,
                                flexDirection: 'row-reverse',
                                alignContent: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                              }}>
                                <Text
                                  style={[
                                    styles.dataValueWrapper,
                                    styles.dataValueWrapperLevel2,
                                    {
                                      textAlign: 'right',
                                    }]}
                                  numberOfLines={1}
                                  ellipsizeMode="tail">
                                  <Text style={numberStyle}>{total[0]}</Text>
                                  <Text
                                    style={styles.fractionalPart}>.{total[1]}</Text>
                                </Text>
                                {dataRow && dataRow.canChangeZefi && (
                                  <TouchableOpacity
                                    onPress={this.handlePopRowEditsFromModal(
                                      c)}>
                                    <View style={{
                                      marginRight: 'auto',
                                    }}>
                                      <Icon name="chevron-left" size={30}
                                            color={'#022258'}/>
                                    </View>
                                  </TouchableOpacity>
                                )}
                              </View>
                              <View style={{
                                flex: 20,
                              }}/>
                            </View>
                            <View style={styles.dataRowSeparator}/>
                          </View>
                        )
                      })}

                      <View style={{
                        height: 38,
                        flex: 1,
                        marginTop: 10,
                        backgroundColor: '#ffffff',
                        flexDirection: 'row-reverse',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10,
                      }}>
                        <View style={{
                          flex: 68,
                        }}/>

                        <View style={{
                          flex: 330,
                        }}>
                          {modalGetUnionDet.length === 1 && (
                            <Text style={{
                              fontSize: sp(16.5),
                              color: '#022258',
                              fontFamily: fonts.bold,
                              textAlign: 'right',
                            }}>{'סה״כ מותג אחד'}</Text>
                          )}
                          {modalGetUnionDet.length > 1 && (
                            <Text style={{
                              fontSize: sp(16.5),
                              color: '#022258',
                              fontFamily: fonts.bold,
                              textAlign: 'right',
                            }}>{'סה״כ '}
                              {modalGetUnionDet.length}
                              {' מותגים'}
                            </Text>
                          )}
                        </View>
                        <View style={{
                          flex: 284,
                        }}>
                          <Text
                            style={[
                              {
                                fontSize: sp(18),
                                color: '#022258',
                                textAlign: 'right',
                                flexDirection: 'row-reverse',
                              }]}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            <Text style={{
                              fontFamily: fonts.semiBold,
                            }}>{totalModal[0]}</Text>
                            <Text
                              style={styles.fractionalPart}>.{totalModal[1]}</Text>
                          </Text>
                        </View>
                        <View style={{
                          flex: 20,
                        }}/>
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </SafeAreaView>
            </Modal>

            <Modal
              animationType="slide"
              transparent={false}
              visible={updateTypePopup !== false}
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
                          {'כל תנועות העתיד השייכות למוטב '}
                          <Text style={{
                            fontFamily: fonts.semiBold,
                          }}>{updateTypePopup.accountMutavName}</Text>
                        </Text>
                        <Text style={{
                          fontSize: sp(22),
                          color: colors.blue32,
                          fontFamily: fonts.regular,
                          textAlign: 'center',
                        }}>
                          {'יקוטלגו כ'}
                          <Text style={{
                            fontFamily: fonts.semiBold,
                          }}>{updateTypePopup.transTypeName}</Text>
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
                            onPress={this.handleTransCategory(
                              updateTypePopup.updateType === 'future+past'
                                ? 'future'
                                : 'future+past')}>
                            <View style={{
                              marginRight: 'auto',
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-start',
                              alignItems: 'center',
                            }}>
                              {updateTypePopup.updateType === 'future+past' && (
                                <CustomIcon name="ok" size={16}
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
                              {'עדכנו את הקטגוריה גם עבור תנועות עבר'}
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
                bankTrans={categoryItem || dataRow.transType}
                onClose={this.handleCloseCategoriesModal}
                onUpdateBankTrans={this.handleUpdateBankTrans}
                onSelectCategory={this.handleSelectCategory}
                onCreateCategory={this.handleCreateBankTransCategory}
                onRemoveCategory={this.handleRemoveBankTransCategory}
              />
            )}

          </Fragment>

          <ActionButton
            bgColor="#ffffffbf"
            buttonColor="#0addc1"
            size={54}
            spacing={0}
            buttonTextStyle={{
              fontSize: 54,
              lineHeight:54,
              textAlign: 'center',
              marginTop: (IS_IOS ? -6 : 3),
            }}>
            <ActionButton.Item
              size={48.5}
              hideLabelShadow
              textContainerStyle={{
                borderWidth: 0,
                height: 48.5,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              }}
              textStyle={{
                fontSize: sp(18),
                color: '#000000',
                fontFamily: fonts.semiBold,
                borderWidth: 0,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              }}
              spaceBetween={5}
              buttonColor="#ffffff"
              title="הכנסה צפויה"
              onPress={this.addMovement(400)}>
              <Image
                style={[
                  styles.actionButtonIcon, {
                    height: 31.5,
                    width: 21,
                  }]}
                source={require('BiziboxUI/assets/incomeCash.png')}/>
            </ActionButton.Item>
            <ActionButton.Item
              size={48.5}
              hideLabelShadow
              textContainerStyle={{
                height: 48.5,
                borderWidth: 0,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              }}
              textStyle={{
                fontSize: sp(18),
                color: '#000000',
                fontFamily: fonts.semiBold,
                borderWidth: 0,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              }}
              spaceBetween={5}
              buttonColor="#ffffff"
              title="הוצאה צפויה"
              onPress={this.addMovement(44)}
            >
              <Image
                style={[
                  styles.actionButtonIcon, {
                    height: 31.5,
                    width: 21,
                  }]}
                source={require('BiziboxUI/assets/expCash.png')}/>
            </ActionButton.Item>
            <ActionButton.Item
              size={48.5}
              hideLabelShadow
              textContainerStyle={{
                height: 48.5,
                borderWidth: 0,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              }}
              textStyle={{
                fontSize: sp(18),
                color: '#000000',
                fontFamily: fonts.semiBold,
                borderWidth: 0,
                borderColor: 'transparent',
                backgroundColor: 'transparent',
              }}
              spaceBetween={5}
              buttonColor="#ffffff"
              title="המלצה לתשלום"
              onPress={this.goToRECOMMENDATION}
            >
              <Image
                style={[
                  styles.actionButtonIcon, {
                    height: 25.5,
                    width: 25.5,
                  }]}
                source={require('BiziboxUI/assets/recoIcon.png')}/>
            </ActionButton.Item>
          </ActionButton>

          <View style={[styles.panelContainer]} pointerEvents={'box-none'}>
            {/* {currentOpenItemIndex !== null && ( */}
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
            {/* // )} */}

            <Interactable.View
              style={{
                zIndex: 999,
              }}
              // animatedNativeDriver
              onSnapStart={this.onDrawerSnap}
              verticalOnly
              ref={this.handleSetRef}
              animatedValueX={new Animated.Value(0)}
              snapPoints={[
                { y: 40 },
                { y: Screen.height - 360 },
                { y: Screen.height + 30 }]}
              boundaries={{ top: -360 }}
              initialPosition={{ y: Screen.height + 30 }}
              animatedValueY={this._deltaY}>
              <View style={styles.panel}>
                <View style={styles.panelHeader}>
                  <View style={styles.panelHandle}/>
                </View>

                {dataRow && dataRow.canChangeZefi &&
                !(dataRow.sourceProgramName === 'BANK' &&
                  AppTimezone.moment(dataRow.transDate)
                    .isBefore(AppTimezone.moment()
                      .subtract(1, 'days')
                      .startOf('day'))) && (
                  <TouchableOpacity
                    onPress={this.openActionSheet}
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 20,
                    }}>
                    <Icon
                      iconStyle={{}}
                      name="dots-three-horizontal"
                      type="entypo"
                      size={22}
                      color={'#022258'}
                    />
                  </TouchableOpacity>
                )}

                <View style={{
                  left: 0,
                  right: 0,
                  height: Screen.height - 90,
                }}>
                  {dataRow && (
                    <View>
                      <View style={{
                        paddingHorizontal: 10,
                      }}>
                        <TouchableOpacity
                          style={{
                            flexDirection: 'row-reverse',
                            justifyContent: 'center',
                          }}
                          activeOpacity={(editDesc) ? 0.3 : 1}
                          onPress={editDesc ? this.handleToggleEditDesc : null}>
                          <Text
                            style={styles.panelTitle}>{dataRow.transName.replace(
                            /\n/g, '')}</Text>

                          {!dataRow.canChangeZefi && (
                            <Text
                              style={styles.panelTitle}>{' - סכום סופי'}</Text>
                          )}
                        </TouchableOpacity>
                        <Text style={styles.panelSubtitle}>
                          <Text style={numberStyle}>{total[0]}</Text>
                          <Text style={[
                            {
                              color: colors.gray7,
                              fontFamily: fonts.light,
                            }]}>.{total[1]}</Text>
                        </Text>

                        <View style={{
                          height: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          width: '100%',
                          backgroundColor: colors.gray30,
                        }}/>
                      </View>
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
                    onScroll={
                      Animated.event([{ nativeEvent: { contentOffset: {} } }],
                        {
                          useNativeDriver: false,
                          isInteraction: false,
                          listener: e => {
                            const offset = e.nativeEvent.contentOffset.y
                            if (offset < 0) {
                              this.setState({
                                inProgressSnap: true,
                              })
                              if (this.scrollViewTop &&
                                this.scrollViewTop._component) {
                                this.scrollViewTop._component.scrollTo({
                                  animated: false,
                                  y: 0,
                                  x: 0,
                                })
                              }
                              this.listRef.snapTo({ index: 1 })
                              setTimeout(() => {
                                // this.props.dispatch(setOpenedBottomSheet(false))
                                this.setState({
                                  inProgressSnap: false,
                                })
                              }, 30)
                            }
                          },
                        })
                    }>

                    {dataRow && (
                      <View>
                        <View style={{
                          paddingHorizontal: 10,
                        }}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'space-between',
                            marginVertical: 8,
                            marginHorizontal: 15,
                          }}>
                            <View style={{
                              flex: 1,
                              flexDirection: 'row-reverse',
                              alignSelf: 'center',
                              justifyContent: 'center',
                            }}>
                              <View style={{
                                paddingLeft: 5,
                                alignSelf: 'flex-start',
                              }}>
                                <AccountIcon account={account}/>
                              </View>
                              <View>
                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{account.accountNickname}</Text>
                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{'ח-ן'}</Text>
                              </View>
                            </View>

                            {dataRow.asmachta !== null && (
                              <View style={{
                                flex: 1,
                                alignSelf: 'center',
                                justifyContent: 'center',
                              }}>
                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{dataRow.asmachta}</Text>
                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{'אסמכתא'}</Text>
                              </View>
                            )}

                            {this.showIconRef(dataRow.targetType) && (
                              <View style={{
                                flex: 1,
                                alignItems: 'center',
                                alignSelf: 'center',
                                justifyContent: 'center',
                              }}>
                                <View style={{
                                  height: 20,
                                  alignSelf: 'center',
                                  justifyContent: 'center',
                                  alignContent: 'center',
                                  alignItems: 'center',
                                }}>
                                  <Image
                                    style={styles.cyclicIcon}
                                    source={require(
                                      'BiziboxUI/assets/cyclic.png')}
                                  />
                                </View>

                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{'תנועה קבועה'}</Text>
                              </View>
                            )}
                          </View>

                          <View style={{
                            height: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            width: '100%',
                            backgroundColor: colors.gray30,
                          }}/>

                          {(dataRow.nigreret) && (
                            <View
                              style={{
                                flexDirection: 'row-reverse',
                                marginVertical: 15,
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'space-between',
                              }}>

                              <View style={{
                                flexDirection: 'row-reverse',
                                alignItems: 'center',
                                alignContent: 'center',
                              }}>
                                <Image
                                  style={[
                                    {
                                      resizeMode: 'contain',
                                      height: 18,
                                      width: 18,
                                    }]}
                                  source={require(
                                    'BiziboxUI/assets/bankmatch.png')}
                                />
                                <View style={commonStyles.spaceDividerDouble}/>
                                <Text
                                  style={[
                                    styles.dataRowLevel3Text,
                                    { color: colors.red2 }]}>
                                  {'נגרר'} {getDaysBetweenTwoDates(new Date(),
                                  new Date(dataRow.originalDate))} {'ימים'}
                                </Text>
                              </View>
                            </View>
                          )}

                          {(!dataRow.nigreret) && (
                            <View style={{
                              height: 1,
                              alignItems: 'center',
                              justifyContent: 'center',
                              alignSelf: 'center',
                              width: '100%',
                              backgroundColor: colors.gray30,
                            }}/>
                          )}

                          <TouchableOpacity
                            activeOpacity={(dataRow.unionId &&
                              dataRow.targetType === 'SOLEK_TAZRIM') ? 0.2 : 1}
                            onPress={dataRow.unionId && dataRow.targetType ===
                            'SOLEK_TAZRIM' ? this.getUnionDet : null}
                            style={{
                              flexDirection: 'row-reverse',
                              marginVertical: 15,
                              alignItems: 'center',
                              alignContent: 'center',
                              justifyContent: 'space-between',
                            }}>
                            <View style={{
                              flexDirection: 'row-reverse',
                              alignItems: 'center',
                              alignContent: 'center',
                            }}>
                              <CustomIcon
                                name={getBankTransIcon(dataRow.paymentDesc)}
                                size={16}
                                color={'#022258'}
                              />
                              <View style={commonStyles.spaceDividerDouble}/>
                              <Text
                                style={styles.dataRowLevel3Text}>{this.props.searchkey &&
                              this.props.searchkey.length > 0 &&
                              this.props.searchkey.find(
                                (it) => it.paymentDescription ===
                                  dataRow.paymentDesc)
                                ? this.props.searchkey.find(
                                  (it) => it.paymentDescription ===
                                    dataRow.paymentDesc).name
                                : ''}</Text>
                            </View>

                            {dataRow.unionId && dataRow.targetType ===
                            'SOLEK_TAZRIM' && (
                              <Icon name="chevron-left" size={24}
                                    color={colors.blue32}
                                    style={{
                                      alignSelf: 'flex-start',
                                    }}/>
                            )}
                          </TouchableOpacity>

                          <View style={{
                            height: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            width: '100%',
                            backgroundColor: colors.gray30,
                          }}/>

                          {!editCategory ? (
                            <View
                              style={{
                                opacity: 0.3,
                                flexDirection: 'row-reverse',
                                marginVertical: 15,
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'space-between',
                              }}>
                              <View style={{
                                flexDirection: 'row-reverse',
                                alignItems: 'center',
                                alignContent: 'center',
                              }}>
                                <CustomIcon
                                  name={getTransCategoryIcon(
                                    dataRow.transType.iconType)}
                                  size={16}
                                  color={'#022258'}
                                />
                                <View style={commonStyles.spaceDividerDouble}/>
                                <Text
                                  style={styles.dataRowLevel3Text}>{(!textCategory)
                                  ? dataRow.transType.transTypeName
                                  : textCategory}</Text>
                              </View>
                            </View>
                          ) : (
                            <TouchableOpacity
                              activeOpacity={(!textCategory) ? 1 : 0.3}
                              style={{
                                opacity: (textCategory) ? 0.3 : 1,
                                flexDirection: 'row-reverse',
                                marginVertical: 15,
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'space-between',
                              }}
                              onPress={(!textCategory)
                                ? this.handleOpenCategoriesModal
                                : null}>

                              <View style={{
                                flexDirection: 'row-reverse',
                                alignItems: 'center',
                                alignContent: 'center',
                              }}>
                                <CustomIcon
                                  name={getTransCategoryIcon(
                                    dataRow.transType.iconType)}
                                  size={16}
                                  color={'#022258'}
                                />
                                <View style={commonStyles.spaceDividerDouble}/>
                                <Text
                                  style={styles.dataRowLevel3Text}>{(!textCategory)
                                  ? dataRow.transType.transTypeName
                                  : textCategory}</Text>
                              </View>

                              {(!textCategory) && (
                                <Icon name="chevron-left" size={24}
                                      color={colors.blue32}
                                      style={{
                                        alignSelf: 'flex-start',
                                      }}/>
                              )}
                            </TouchableOpacity>
                          )}

                          <View style={{
                            height: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            width: '100%',
                            backgroundColor: colors.gray30,
                          }}/>
                        </View>

                        {((dataRow.targetType === 'CYCLIC_TRANS' &&
                          dataRow.unionId !== null) || dataRow.pictureLink) &&
                        (<View style={{
                            marginTop: 18,
                            alignSelf: 'center',
                            flex: 1,
                            marginBottom: 20,
                          }}>
                            <CheckTransSlider
                              idxCategory={idxCategory}
                              handleOpenCategoriesModal={this.handleOpenCategoriesInsideModal}
                              enabledEditCategory
                              categories={categories}
                              isRtl={isRtl}
                              account={account}
                              parentIsOpen
                              inProgress={inProgressDetails}
                              details={details}
                              bankTrans={dataRow}
                            />
                          </View>
                        )}

                      </View>
                    )}
                  </Animated.ScrollView>
                </View>
              </View>
            </Interactable.View>
          </View>
        </View>

        {dataRow && deletedItems && (
          <ActionSheet
            showSeparator={false}
            showSparator={false}
            style={{
              paddingHorizontal: 20,
              flex: 1,
              zIndex: 99999,
              elevation: 999,
            }}
            ref={(actionSheet) => {
              this.bottomActionSheet = actionSheet
            }}
            position="bottom"
            onChange={this.onChange}
            multiple
            showSelectedIcon={false}
          >
            <ActionSheetItem
              style={{
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                alignContent: 'flex-end',
                justifyContent: 'flex-end',
                flex: 1,
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              textStyle={{
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              showSelectedIcon={false}
              text="עריכה"
              value="edit"
              icon={
                <CustomIcon
                  name="pencil"
                  size={18}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: -25,
                  }}
                  color={'#022258'}
                />
              }
              onPress={this.onItemPress}
            />

            <ActionSheetItem
              style={{
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                alignContent: 'flex-end',
                justifyContent: 'flex-end',
                flex: 1,
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              textStyle={{
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              showSelectedIcon={false}
              text={'מחיקת תנועה זו בלבד'}
              value="deleteOnly"
              icon={
                <CustomIcon name="trash"
                            size={18}
                            style={{
                              position: 'absolute',
                              top: 3,
                              right: -21,
                            }}
                            color={'#022258'}/>
              }
              onPress={this.onItemPress}
            />

            <ActionSheetItem
              style={{
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                alignContent: 'flex-end',
                justifyContent: 'flex-end',
                flex: 1,
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              textStyle={{
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              showSelectedIcon={false}
              text="מחיקת התנועה הקבועה כולה"
              value="deleteAll"
              icon={
                <CustomIcon name="trash"
                            size={18}
                            style={{
                              position: 'absolute',
                              top: 3,
                              right: -21,
                            }}
                            color={'#022258'}/>
              }
              onPress={this.onItemPress}
            />

            <ActionSheetItem
              style={{
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                alignContent: 'flex-end',
                justifyContent: 'flex-end',
                flex: 1,
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              textStyle={{
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              showSelectedIcon={false}
              text="ביטול"
              value="cancel"
              icon={
                <CustomIcon name="times"
                            size={12}
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: -21,
                            }}
                            color={'#022258'}/>
              }
              onPress={this.onItemPress}
            />
          </ActionSheet>
        )}

        {dataRow && !deletedItems && editBtn && (
          <ActionSheet
            showSeparator={false}
            showSparator={false}
            style={{
              paddingHorizontal: 20,
              flex: 1,
              zIndex: 99999,
              elevation: 999,
            }}
            ref={(actionSheet) => {
              this.bottomActionSheet = actionSheet
            }}
            position="bottom"
            onChange={this.onChange}
            multiple
            showSelectedIcon={false}
          >
            <ActionSheetItem
              style={{
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                alignContent: 'flex-end',
                justifyContent: 'flex-end',
                flex: 1,
              }}
              textStyle={{
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              showSelectedIcon={false}
              text="עריכה"
              value="edit"
              icon={
                <CustomIcon
                  name="pencil"
                  size={18}
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: -25,
                  }}
                  color={'#022258'}
                />
              }
              onPress={this.onItemPress}
            />

            <ActionSheetItem
              style={{
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                alignContent: 'flex-end',
                justifyContent: 'flex-end',
                flex: 1,
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              textStyle={{
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              showSelectedIcon={false}
              text={'מחיקה'}
              value="deleteOnly"
              icon={
                <CustomIcon name="trash"
                            size={18}
                            style={{
                              position: 'absolute',
                              top: 3,
                              right: -21,
                            }}
                            color={'#022258'}/>
              }
              onPress={this.onItemPress}
            />

            <ActionSheetItem
              style={{
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                alignContent: 'flex-end',
                justifyContent: 'flex-end',
                flex: 1,
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              textStyle={{
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              showSelectedIcon={false}
              text="ביטול"
              value="cancel"
              icon={
                <CustomIcon name="times"
                            size={12}
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: -21,
                            }}
                            color={'#022258'}/>
              }
              onPress={this.onItemPress}
            />
          </ActionSheet>
        )}

        {dataRow && !deletedItems && !editBtn && (
          <ActionSheet
            showSeparator={false}
            showSparator={false}
            style={{
              paddingHorizontal: 20,
              flex: 1,
              zIndex: 99999,
              elevation: 999,
            }}
            ref={(actionSheet) => {
              this.bottomActionSheet = actionSheet
            }}
            position="bottom"
            onChange={this.onChange}
            multiple
            showSelectedIcon={false}
          >
            <ActionSheetItem
              style={{
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                alignContent: 'flex-end',
                justifyContent: 'flex-end',
                flex: 1,
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              textStyle={{
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              showSelectedIcon={false}
              text={'מחיקה'}
              value="deleteOnly"
              icon={
                <CustomIcon name="trash"
                            size={18}
                            style={{
                              position: 'absolute',
                              top: 3,
                              right: -21,
                            }}
                            color={'#022258'}/>
              }
              onPress={this.onItemPress}
            />

            <ActionSheetItem
              style={{
                alignItems: 'flex-end',
                alignSelf: 'flex-end',
                alignContent: 'flex-end',
                justifyContent: 'flex-end',
                flex: 1,
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              textStyle={{
                color: '#022258',
                textAlign: 'right',
                fontSize: sp(18),
                fontFamily: fonts.regular,
              }}
              showSelectedIcon={false}
              text="ביטול"
              value="cancel"
              icon={
                <CustomIcon name="times"
                            size={12}
                            style={{
                              position: 'absolute',
                              top: 6,
                              right: -21,
                            }}
                            color={'#022258'}/>
              }
              onPress={this.onItemPress}
            />
          </ActionSheet>
        )}
      </Fragment>
    )
  }
}
