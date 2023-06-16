import React, { Fragment, PureComponent } from 'react'
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { connect } from 'react-redux'
import AppTimezone from '../../utils/appTimezone'
import { values } from 'lodash'
import { withTranslation } from 'react-i18next'
import {
  combineStyles as cs,
  getErrText,
  getTransCategoryIcon,
  goTo,
  goToBack,
  sp,
} from '../../utils/func'
import Loader from '../../components/Loader/Loader'
import { getAccountGroups } from '../../redux/selectors/account'
import { selectAccounts } from '../../redux/actions/account'
import { getChecks } from '../../redux/actions/checks'
import RemoveRowModal from './components/RemoveRowModal'
import {
  getDefaultUserScreen, setOpenedBottomSheet,
  updateDefaultUserScreen,
} from '../../redux/actions/user'
import commonStyles from '../../styles/styles'
import AccountsModal from '../../components/AccountsModal/AccountsModal'
import BankAccountsHeader from './components/BankAccountsHeader'
import AccountAlertDetails
  from '../../components/AccountAlert/AccountAlertDetails'
import CalendarModal from '../../components/CalendarModal/CalendarModal'
import { DEFAULT_PRIMARY_CURRENCY, SCREEN_MODES } from '../../constants/bank'
import {
  DEFAULT_DATE_FORMAT,
  IS_IOS,
  USER_SCREENS,
} from '../../constants/common'
import styles, { HEADER_ALERT_BORDER_HEIGHT } from './ChecksStyles'
import DataList from './components/DataList'
import { getAccountCflTransTypeApi } from '../../api'
import Api from '../../api/Api'
import { colors, fonts } from '../../styles/vars'
import ActionButton from 'react-native-action-button'
import CreatePayment from './components/CreatePayment'
import AlertsTrial from 'src/components/AlertsTrial/AlertsTrial'
import { LocaleConfig } from 'react-native-calendars'
import { isIphoneX } from 'react-native-iphone-x-helper'
import CustomIcon from 'src/components/Icons/Fontello'
import { Grid, LineChart, XAxis, YAxis } from 'react-native-svg-charts'
import { CheckBox } from 'react-native-elements'
import { IS_LIGHT } from '../../constants/config'
import { HeaderHeightContext, useHeaderHeight } from "@react-navigation/elements";

const winWidth = Dimensions.get('window').width
const win = Dimensions.get('window')

@connect(state => ({
  globalParams: state.globalParams,
  isRtl: state.isRtl,
  currentCompanyId: state.currentCompanyId,
  accounts: state.accounts,
  accountGroups: getAccountGroups(state),
  screenMode: state.bankAccountScreenMode,
  checksIncomeData: state.checksIncomeData,
  checksOutData: state.checksOutData,
}))
@withTranslation()
export default class ChecksScreen extends PureComponent {
  constructor (props) {
    super(props)
    this.headerHeight = 0;

    const paramsLink = props.route.params.paramsLink

    this.state = {
      isDefDates: true,
      currentIndex: (paramsLink && paramsLink.queryStatus)
        ? paramsLink.queryStatus
        : null,
      accountsILS: [],
      isReady: false,
      inProgress: false,
      isLayoutComplete: false,
      changeScreenModeInProgress: false,
      error: null,
      selectedAccountIds: (paramsLink && paramsLink.selectedAccountIds)
        ? paramsLink.selectedAccountIds
        : [],
      _widthIncome: 0,
      _widthOut: 0,
      sizeFontStatusTotals: 25,
      statusTotals: [],
      querySearch: null,
      queryStatus: (paramsLink && paramsLink.queryStatus)
        ? paramsLink.queryStatus
        : null,
      currentOpenItemIndex: null,
      // if null then it is aggregated request
      currentSelectedAccountId: null,
      selectedGroup: (paramsLink && paramsLink.selectedGroup)
        ? paramsLink.selectedGroup
        : null,
      accountsModalIsOpen: false,
      calendarModalIsOpen: false,
      dateFromTimestamp: null,
      dateTillTimestamp: null,
      headerMaxHeight: 0,
      alertYPosition: 0,
      alertDetailsIsOpen: false,
      isHeaderChartSliderPanEnable: true,
      categories: [],
      chequeDetails: null,
      isUpdate: false,
      openModalCreatePayments: false,
      dataTypePayments: null,
      currentScrollPosition: 0,
      removeRowModalOpen: false,
      rowInfo: null,
      refreshing: false,
      categoriesArr: [],
      statusList: [],
      statusListCopy: [],
      programNameList: [],
      programNameListCopy: [],
      categoriesMatch: [],
      categoriesMatchCopy: [],
      categoriesMatchModal: false,
      isSearchOpen: false,
      programNameListModal: false,
      statusListModal: false,
      showGraph: false,
      datesGraphList: [],
      bankTransGraphHova: [],
      bankTransGraphZchut: [],
      numberTickZchut: 2.5,
      numberTickHova: 2.5,
      yAxisSums: [],
      monthYear: [],
      scrollAnim: new Animated.Value(IS_IOS ? 0 : 0),
    }

    this.scrollY = new Animated.Value(IS_IOS ? -100 : 0)
    this.headerChartX = new Animated.ValueXY()
  }

  get headerScrollDistance () {
    const { headerMaxHeight } = this.state
    const scrollDistance = headerMaxHeight
    return scrollDistance >= 0 ? scrollDistance : 0
  }

  get headerMinHeight () {
    const minHeight = (IS_IOS ? 30 : 35) +
      (this.state.isSearchOpen ? (IS_IOS ? 85 : 90) : 0)
    return this.hasHeaderAlert
      ? minHeight + HEADER_ALERT_BORDER_HEIGHT
      : minHeight
  }

  get headerMinHeightCalc () {
    const minHeight = IS_IOS ? 250 : 252
    return this.hasHeaderAlert
      ? minHeight + HEADER_ALERT_BORDER_HEIGHT + 30
      : minHeight
  }

  get selectedAccounts () {
    const { accounts } = this.props
    const selectedAccountIds = this.accountIdsForRequest

    return accounts.filter(a => selectedAccountIds.includes(a.companyAccountId))
  }

  get selectedDeviantAccounts () {
    return []
  }

  get selectedNotUpdatedAccounts () {
    return this.selectedAccounts.filter(a => a.nonUpdateDays > 0)
  }

  get isLoader () {
    const { isReady, inProgress, changeScreenModeInProgress } = this.state
    return !isReady || inProgress || changeScreenModeInProgress
  }

  get screenSwitchState () {
    return this.props.screenMode === SCREEN_MODES.inChecks
  }

  get hasData () {
    // const { accountAggregatedData, bankTrans } = this.props
    //
    // return this.screenSwitchState
    //   ? !!(accountAggregatedData && accountAggregatedData.accountTransactions.length)
    //   : !!(bankTrans && bankTrans.length)

  }

  get hasHeaderAlert () {
    if (!this.selectedAccounts.length ||
      (!this.selectedNotUpdatedAccounts.length)) {return false}
    return values(this.headerAlertState).some(v => v)
  }

  get headerAlertState () {
    const selectedAccounts = this.selectedAccounts
    const selectedNotUpdatedAccounts = this.selectedNotUpdatedAccounts

    return {
      selectedAccounts: selectedAccounts,
      isOneOfOneNotUpdated: selectedAccounts.length === 1 &&
        selectedNotUpdatedAccounts.length === 1,
      isOneOfMultipleNotUpdated: selectedAccounts.length > 1 &&
        selectedNotUpdatedAccounts.length === 1,
      isMoreThenOneOfMultipleNotUpdated: selectedAccounts.length > 1 &&
        selectedNotUpdatedAccounts.length > 1,
      isAccountNotUpdated: !!(selectedAccounts.length &&
        selectedNotUpdatedAccounts.length),
    }
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

  getNameOfStatus = (sn) => {
    if (!sn) {return ''}
    sn = sn.toLowerCase()
    switch (sn) {
      case 'not_paid':
        return ('sumsTitles:notRepaid')

      case 'future_due_date':
        return ('sumsTitles:futureMaturityDate')

      case 'mechake_lehafkada':
        return this.screenSwitchState
          ? ('sumsTitles:notDeposited')
          : ('sumsTitles:notRepaid')

      case 'past_due_date':
        return ('sumsTitles:repaymentPassed')

      case 'mishmeret_babank':
        return ('sumsTitles:depositedSafekeeping')

      case 'ufkad_veshulam':
        return ('sumsTitles:repaid')

      case 'lenicaion':
        return ('sumsTitles:discount')

      case 'nimhak_aliadei_user':
        return ('sumsTitles:manuallyDeleted')

      case 'ufkad_vehazar':
        return ('sumsTitles:comeBack')

      case 'return_check':
        return ('sumsTitles:notHonored')
    }
  }

  selectDefaultAccounts = () => {
    const { accountGroups } = this.props
    if (!accountGroups || !Object.keys(accountGroups).length) {
      return this.setState({
        inProgress: false,
        isReady: true,
        isLayoutComplete: true,
      })
    }
    const findIdsToSelect = (currency) => {
      currency = currency && currency.toLowerCase()
      const selectedIds = accountGroups[currency].map(a => a.companyAccountId)
      return this.handleSelectAccounts(currency, selectedIds,
        this.getScreenData)
    }

    if (accountGroups.hasOwnProperty(DEFAULT_PRIMARY_CURRENCY)) {
      return findIdsToSelect(DEFAULT_PRIMARY_CURRENCY)
    }
    return findIdsToSelect(Object.keys(accountGroups)[0])
  }

  getStatus (statusKey, dueDate) {
    const status = statusKey.toLowerCase()
    if (this.screenSwitchState && status === 'not_paid') {
      return 'notRepaid'
    } else if (this.screenSwitchState && status === 'mechake_lehafkada') {
      return 'notDeposited'
    } else if (this.screenSwitchState && status === 'mishmeret_babank') {
      return 'depositedSafekeeping'
    } else if (!this.screenSwitchState && status === 'mechake_lehafkada') {
      if (dueDate >= AppTimezone.moment().valueOf()) {
        return 'futureMaturityDate'
      } else {
        return 'repaymentPassed'
      }
    } else if (status === 'future_due_date') {
      return 'futureMaturityDate'
    } else if (status === 'mishmeret_babank') {
      return 'depositedSafekeeping'
    } else if (status === 'past_due_date') {
      return 'repaymentPassed'
    } else if (status === 'ufkad_veshulam') {
      return 'repaid'
    } else if (status === 'lenicaion') {
      return 'discount'
    } else if (status === 'nimhak_aliadei_user') {
      return 'manuallyDeleted'
    } else if (status === 'ufkad_vehazar' || status ===
      'huavar_lesapak_vehazar') {
      return 'comeBack'
    } else if (status === 'return_check') {
      return 'notHonored'
    } else {
      return 'none'
    }
  }

  isRemovable (statusKey, dueDate) {
    const status = statusKey.toLowerCase()
    if (this.screenSwitchState && status === 'mechake_lehafkada') {
      return true
    } else if (this.screenSwitchState && status === 'mishmeret_babank') {
      return true
    } else if (!this.screenSwitchState && status === 'mechake_lehafkada') {
      if (dueDate >= AppTimezone.moment().valueOf()) {
        return true
      } else {
        return true
      }
    } else if (status === 'ufkad_veshulam') {
      return false
    } else if (status === 'lenicaion') {
      return true
    } else if (status === 'nimhak_aliadei_user') {
      return false
    } else if (status === 'ufkad_vehazar' || status ===
      'huavar_lesapak_vehazar') {
      return true
    } else {return status === 'return_check'}
  }

  deleteOperationApi = (item) => {
    new Api({ endpoint: `payments/cfl/${item.targetType}/delete` }).post({
      body: {
        'companyAccountId': item.companyAccountId,
        'transId': item.chequePaymentId,
      },
    }).then(() => {
      this.handleRemoveRowModalCb(null, false)
      this._onRefresh()
    })
      .catch(() => this.handleRemoveRowModalCb(null, false))
  }

  setStatusDef () {
    console.log('setStatusDef start')
    const { statusTotals, queryStatus } = this.state
    if (!queryStatus || !statusTotals.some(
      status => status.status.toLowerCase() === queryStatus)) {
      if ((this.screenSwitchState && statusTotals.some(
        status => status.status.toLowerCase() === 'not_paid')) ||
        (!this.screenSwitchState && statusTotals.some(
          status => status.status.toLowerCase() === 'mechake_lehafkada'))) {
        this.setState({
          queryStatus: (this.screenSwitchState)
            ? 'not_paid'
            : 'mechake_lehafkada',
        })
      } else if ((this.screenSwitchState && statusTotals.some(
        status => status.status.toLowerCase() === 'mechake_lehafkada')) ||
        (!this.screenSwitchState && statusTotals.some(
          status => status.status.toLowerCase() === 'future_due_date'))) {
        this.setState({
          queryStatus: (this.screenSwitchState)
            ? 'mechake_lehafkada'
            : 'future_due_date',
        })
      } else if ((this.screenSwitchState && statusTotals.some(
        status => status.status.toLowerCase() === 'mishmeret_babank')) ||
        (!this.screenSwitchState && statusTotals.some(
          status => status.status.toLowerCase() === 'past_due_date'))) {
        this.setState({
          queryStatus: (this.screenSwitchState)
            ? 'mishmeret_babank'
            : 'past_due_date',
        })
      } else if (statusTotals.some(
        status => status.status.toLowerCase() === 'ufkad_veshulam')) {
        this.setState({
          queryStatus: 'ufkad_veshulam',
        })
      } else if ((this.screenSwitchState && statusTotals.some(
        status => status.status.toLowerCase() === 'lenicaion'))) {
        this.setState({
          queryStatus: 'lenicaion',
        })
      } else if (statusTotals.some(
        status => status.status.toLowerCase() === 'nimhak_aliadei_user')) {
        this.setState({
          queryStatus: 'nimhak_aliadei_user',
        })
      } else if ((this.screenSwitchState && statusTotals.some(
        status => status.status.toLowerCase() === 'ufkad_vehazar') &&
        statusTotals.some(status => status.status.toLowerCase() ===
          'huavar_lesapak_vehazar')) || (!this.screenSwitchState &&
        statusTotals.some(
          status => status.status.toLowerCase() === 'return_check'))) {
        this.setState({
          queryStatus: (this.screenSwitchState)
            ? 'ufkad_vehazar'
            : 'return_check',
        })
      }
    }
    console.log('setStatusDef end')

    this.filtersAll()
  }

  getAccountCflTransType (transTypeId) {
    const { categories } = this.state
    if (categories && transTypeId) {
      const type = categories.find((item) => (item.transTypeId === transTypeId))
      if (type !== undefined) {
        return type
      } else {
        return categories[0]
      }
    } else {
      return ''
    }
  }

  getScreenData = (isLoader = true) => {
    if (this.props.route.params.paramsLink) {
      delete this.props.route.params.paramsLink
    }
    const objParamas = this.props.route.params.objParamas
    if (isLoader) {
      this.setState({
        inProgress: true,
        isLayoutComplete: false,
        currentOpenItemIndex: null,
      })
    }
    if (!isLoader) {
      this.setState({
        inProgress: true,
        isLayoutComplete: true,
        currentOpenItemIndex: null,
      })
    }
    this.setDefaultScrollPosition()
    console.log('getScreenData start')

    return this.getChecksData()
      .then((data) => {
        this.headerChartX = new Animated.ValueXY()
        console.log('-------------getChecksData---------', data)
        let sizeFontStatusTotals = 25
        if (data.statusTotals && data.statusTotals.length) {
          sizeFontStatusTotals = (data.statusTotals.find(
            (item) => item.total.toString().length > 5)) ? 20 : 25
          data.statusTotals.reverse()
        }
        let categoriesMatch = []
        let programNameList = []
        let statusList = []

        if (data.chequeDetails && data.chequeDetails.length) {
          data.chequeDetails.sort((a, b) => a.dueDate - b.dueDate)

          let chequeDetails = JSON.parse(
            JSON.stringify(data.chequeDetails))

          const { t } = this.props
          programNameList = Array.from(
            new Set(chequeDetails.map(s => s.programName))).map(id => {
            return {
              id: id,
              press: false,
            }
          })
          const map = new Map()
          for (const item of chequeDetails) {
            if (!map.has(item.status)) {
              map.set(item.status, true)
              statusList.push({
                press: false,
                id: item.status,
                text: t(
                  `sumsTitles:${this.getStatus(item.status, item.dueDate)}`),
              })
            }
          }
          categoriesMatch = Array.from(
            new Set(chequeDetails.map(s => s.transTypeId))).map(id => {
            let obj = this.state.categoriesArr.find(
              (cat) => cat.transTypeId === id)
            if (!obj) {
              const row = chequeDetails.find((it) => it.transTypeId === id)
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

        if (objParamas && data.statusTotals.length &&
          data.chequeDetails.length) {
          this.setState({
            sizeFontStatusTotals: sizeFontStatusTotals,
            accountsILS: this.props.accounts.filter(
              (a) => a.currency === 'ILS'),
            error: null,
            inProgress: false,
            isLayoutComplete: true,
            isHeaderChartSliderPanEnable: true,
            statusTotals: data.statusTotals,
            openModalCreatePayments: true,
            dataTypePayments: objParamas.receiptTypeId,
            categoriesMatch,
            statusList,
            programNameList,
            categoriesMatchCopy: categoriesMatch,
            statusListCopy: statusList,
            programNameListCopy: programNameList,
          })
        } else {
          this.setState({
            sizeFontStatusTotals: sizeFontStatusTotals,
            accountsILS: this.props.accounts.filter(
              (a) => a.currency === 'ILS'),
            error: null,
            inProgress: true,
            isLayoutComplete: true,
            isHeaderChartSliderPanEnable: true,
            statusTotals: data.statusTotals,
            categoriesMatch,
            statusList,
            programNameList,
            categoriesMatchCopy: categoriesMatch,
            statusListCopy: statusList,
            programNameListCopy: programNameList,
          })
        }
        console.log('getScreenData end')
        this.setStatusDef()
      })
      .catch(() => {
        this.headerChartX = new Animated.ValueXY()
        this.setState({
          accountsILS: [],
          inProgress: false,
          isLayoutComplete: true,
          isHeaderChartSliderPanEnable: true,
          error: true,
          chequeDetails: [],
        })
      })
  }

  setDefaultScrollPosition = () => {
    // const { scrollAnim } = this.state
    // Animated.spring(
    //   scrollAnim,
    //   {
    //     toValue: 0,
    //     duration: 300,
    //   }).start()
    this.setState({
      scrollAnim: new Animated.Value(IS_IOS ? 0 : 0),
    })
  }

  filtersAll = (status, changeTypes) => {
    console.log('filtersAll start')

    this.setState({
      chequeDetails: null,
      inProgress: true,
    })
    this.setDefaultScrollPosition()
    if (status) {
      status = status.toLowerCase()
      if (this.screenSwitchState && status === 'huavar_lesapak_vehazar') {
        status = 'ufkad_vehazar'
      }
      this.setState({
        currentOpenItemIndex: null,
        queryStatus: status,
      })
    }

    setTimeout(() => {
      const { queryStatus, querySearch, categoriesMatch, statusList, programNameList, isSearchOpen } = this.state

      const { checksIncomeData, checksOutData, accounts, t } = this.props
      const data = (this.screenSwitchState) ? checksIncomeData : checksOutData
      let dataGraph = []
      if (data.chequeDetails && data.chequeDetails.length) {
        let chequeDetails = JSON.parse(JSON.stringify(data.chequeDetails))
        if (queryStatus && !isSearchOpen) {
          if (queryStatus === 'ufkad_vehazar') {
            chequeDetails = chequeDetails.filter(
              (item) => (item.status === queryStatus.toUpperCase() ||
                item.status === 'huavar_lesapak_vehazar'.toUpperCase()))
          } else if (queryStatus === 'return_check') {
            chequeDetails = chequeDetails.filter(
              (item) => (item.status === queryStatus.toUpperCase() ||
                item.status === 'huavar_lesapak_vehazar'.toUpperCase() ||
                item.status === 'ufkad_vehazar'.toUpperCase()))
          } else if (queryStatus === 'not_paid') {
            chequeDetails = chequeDetails.filter(
              (item) => (item.status === queryStatus.toUpperCase() ||
                item.status === 'mechake_lehafkada'.toUpperCase() ||
                item.status === 'mishmeret_babank'.toUpperCase()))
          } else if (queryStatus === 'future_due_date') {
            chequeDetails = chequeDetails.filter(
              (item) => (item.status === 'MECHAKE_LEHAFKADA' && item.dueDate >=
                AppTimezone.moment().valueOf()))
          } else if (queryStatus === 'past_due_date') {
            chequeDetails = chequeDetails.filter(
              (item) => (item.status === 'MECHAKE_LEHAFKADA' && item.dueDate <
                AppTimezone.moment().valueOf()))
          } else {
            chequeDetails = chequeDetails.filter(
              (item) => (item.status === queryStatus.toUpperCase()))
          }
        }

        if ((querySearch !== null && querySearch !== '') || changeTypes) {
          const categoriesMatchPressFilter = categoriesMatch.filter(
            a => a.press === true)
          const statusListPressFilter = statusList.filter(a => a.press === true)
          const programNameListPressFilter = programNameList.filter(
            a => a.press === true)

          try {
            chequeDetails = chequeDetails.filter((item) => {
              // console.log('item.transTypeId', item.transTypeId)
              // console.log('item.paymentDesc', item.paymentDesc)
              const categoriesMatchPress = categoriesMatch.find(
                a => a.transTypeId === item.transTypeId).press
              const statusListPress = statusList.find(
                a => a.id === item.status).press
              const programNamePress = programNameList.find(
                a => a.id === item.programName).press

              item.chequeComment = (item.chequeComment)
                ? item.chequeComment
                : (item.deleteAlYadei)
                  ? `נמחק על ידי ${item.deleteAlYadei} בתאריך ${AppTimezone.moment(
                    item.deleteDate).format(DEFAULT_DATE_FORMAT)}`
                  : ''

              if (querySearch !== null && querySearch !== '') {
                return (
                  (categoriesMatchPressFilter.length
                    ? categoriesMatchPress
                    : !categoriesMatchPress) &&
                  (statusListPressFilter.length
                    ? statusListPress
                    : !statusListPress) &&
                  (programNameListPressFilter.length
                    ? programNamePress
                    : !programNamePress) &&
                  (
                    (item.mainDescription && item.mainDescription.toString()
                      .toLowerCase()
                      .includes(querySearch.toLowerCase())) ||
                    (item.chequeComment && item.chequeComment.toString()
                      .toLowerCase()
                      .includes(querySearch.toLowerCase())) ||
                    (item.chequeNo && item.chequeNo.toString()
                      .toLowerCase()
                      .includes(querySearch.toLowerCase())) ||
                    (item.total &&
                      item.total.toString().includes(querySearch)) ||
                    (item.dueDate &&
                      (querySearch.toLowerCase() ===
                        AppTimezone.moment(item.dueDate).format('DD/MM') ||
                        querySearch.toLowerCase() ===
                        AppTimezone.moment(item.dueDate).format('MM/YY') ||
                        querySearch.toLowerCase() ===
                        AppTimezone.moment(item.dueDate).format('DD/MM/YY')
                      )
                    )
                  )
                )
              } else {
                return (
                  (categoriesMatchPressFilter.length
                    ? categoriesMatchPress
                    : !categoriesMatchPress) &&
                  (statusListPressFilter.length
                    ? statusListPress
                    : !statusListPress) &&
                  (programNameListPressFilter.length
                    ? programNamePress
                    : !programNamePress)
                )
              }
            })
          } catch (e) {

          }
        }

        dataGraph = JSON.parse(JSON.stringify(chequeDetails))
        if (chequeDetails.length) {
          chequeDetails = chequeDetails.reduce((memo, item) => {
            item.transType = this.getAccountCflTransType(item.transTypeId)
            item.account = accounts.find(
              a => a.companyAccountId === item.companyAccountId)
            item.statusText = t(
              `sumsTitles:${this.getStatus(item.status, item.dueDate)}`)
            item.isRemovable = this.isRemovable(item.status, item.dueDate)
            item.isEditable = {
              dueDateAsDate: item.isRemovable,
              account: item.isRemovable &&
                ['CHEQUE', 'ERP_CHEQUE'].includes(item.targetType),
              mainDescription: true,
              transType: true,
              chequeNo: item.isRemovable &&
                ['CHEQUE'].includes(item.targetType),
              chequeComment: true,
              total: item.isRemovable && ['CHEQUE'].includes(item.targetType),
            }
            item.chequeComment = (item.chequeComment)
              ? item.chequeComment
              : (item.deleteAlYadei)
                ? `נמחק על ידי ${item.deleteAlYadei} בתאריך ${AppTimezone.moment(
                  item.deleteDate).format(DEFAULT_DATE_FORMAT)}`
                : ''
            const title = AppTimezone.moment(item.dueDate).format('YYYY')
            const oldIndex = memo.findIndex(items => items.title === title)
            if (oldIndex > -1) {
              memo[oldIndex].data.push(item)
            } else {
              memo.push({
                title,
                data: [item],
              })
            }
            return memo
          }, [])
        }

        if (dataGraph.length) {
          dataGraph.sort((a, b) => a.dueDate - b.dueDate)
          // const listDays = getListOfDatesInterval(
          //   AppTimezone.moment(dataGraph[0].dueDate),
          //   AppTimezone.moment(dataGraph[dataGraph.length - 1].dueDate),
          //   'days',
          //   'DD/MM/YY',
          // )
          // const zchutArr = []
          // listDays.forEach((it) => {
          //   const reducer = (accumulator, currentValue) => accumulator +
          //     currentValue
          //   const zchut = dataGraph.filter((item) => it ===
          //     AppTimezone.moment(item.dueDate).format('DD/MM/YY'))
          //
          //   if (zchut.length) {
          //     zchutArr.push(zchut.map((it) => it.total).reduce(reducer))
          //   } else {
          //     zchutArr.push(0)
          //   }
          // })

          // const datesGraphList = Array.from(new Set(listDays.map(s => {
          //   const day = s.split('/')[1] + '/' + s.split('/')[2]
          //   return day
          // }))).map(da => {
          //   return da
          // })
          //
          // const pushIdx = []
          // let lenGlob = 0
          // datesGraphList.forEach((dateMonth) => {
          //   const lenOfDays = listDays.filter(
          //     (it) => (it.split('/')[1] + '/' + it.split('/')[2]) ===
          //       dateMonth).length
          //   lenGlob += lenOfDays
          //   pushIdx.push({
          //     date: dateMonth,
          //     idx: (lenGlob - Math.floor(lenOfDays / 2)) - 1,
          //   })
          // })
          // const monthYear = listDays.map((s, i) => {
          //   const getIdx = pushIdx.find((it) => {
          //     const isSameDate = (s.split('/')[1] + '/' + s.split('/')[2]) ===
          //       it.date
          //     const isSameIdx = (it.idx === i)
          //     return isSameDate && isSameIdx
          //   })
          //   return getIdx ? getIdx.date : ''
          // })
          // let numberTickZchut = 5
          // const max = Math.max(...zchutArr)
          // const yAxisSums = Array.from(new Array(numberTickZchut))
          //   .map((it, i) => {
          //     return max - ((max / 5) * i)
          //   })

          this.setState({
            inProgress: false,
            isUpdate: (!status),
            chequeDetails: chequeDetails,
            datesGraphList: [], //listDays,
            bankTransGraphZchut: [], //zchutArr,
            isLayoutComplete: true,
            numberTickZchut: 5, //numberTickZchut
            yAxisSums: [], //yAxisSums
            monthYear: [], //monthYear
          })
        } else {
          this.setState({
            inProgress: false,
            isUpdate: (!status),
            chequeDetails: chequeDetails,
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
          inProgress: false,
          isUpdate: (!status),
          chequeDetails: [],
          datesGraphList: [],
          bankTransGraphHova: [],
          bankTransGraphZchut: [],
          numberTickZchut: 2.5,
          numberTickHova: 2.5,
          yAxisSums: [],
          monthYear: [],
        })
      }

      console.log('filtersAll end')
    }, 10)
  }

  getChecksData = () => {
    const { dateFromTimestamp, dateTillTimestamp } = this.state
    const { dispatch } = this.props
    // console.log('this.screenSwitchState', this.screenSwitchState)
    return dispatch(getChecks({
      income: this.screenSwitchState,
      companyAccountIds: this.accountIdsForRequest,
      dateFrom: (dateFromTimestamp) ? AppTimezone.moment(dateFromTimestamp)
        .toISOString() : dateFromTimestamp,
      dateTill: (dateTillTimestamp) ? AppTimezone.moment(dateTillTimestamp)
        .toISOString() : dateTillTimestamp,
    }))
  }

  handleSelectAccounts = (selectedGroup, selectedAccountIds = [], fn) => {
    this.setState({
      selectedAccountIds,
      selectedGroup,
      currentSelectedAccountId: null,
    }, () => {
      if (typeof fn === 'function') {return fn()}
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

  handleSelectGroup = (currency, accountIds) => {
    this.setState({
      selectedAccountIds: accountIds,
      selectedGroup: currency,
    })
  }

  handleCloseAccountsModal = () => this.setState(
    { accountsModalIsOpen: false })

  handleOpenAccountsModal = () => this.setState({
    accountsModalIsOpen: true,
    selectedAccountIdsSave: JSON.parse(
      JSON.stringify(this.state.selectedAccountIds)),
    selectedGroupSave: JSON.parse(JSON.stringify(this.state.selectedGroup)),
  })

  handleOpenCalendarModal = () => this.setState({ calendarModalIsOpen: true })

  handleCloseCalendarModal = () => this.setState(
    { calendarModalIsOpen: false })

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

  handleSetHeaderHeight = (e) => {
    this.scrollY = new Animated.Value(IS_IOS ? -100 : 0)
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
    this.setState({
      dateFromTimestamp,
      dateTillTimestamp,
      calendarModalIsOpen: false,
      isDefDates: false,
    }, this.getScreenData)
  }

  handleChangeScreenMode = (state) => {
    const { screenMode, dispatch } = this.props
    const newScreenMode = state ? SCREEN_MODES.inChecks : SCREEN_MODES.outChecks
    if (screenMode === newScreenMode) {return}

    this.setState({
      changeScreenModeInProgress: true,
      currentOpenItemIndex: null,
    })
    this.setDefaultScrollPosition()

    return dispatch(
      updateDefaultUserScreen(USER_SCREENS.checksMobile, newScreenMode))
      .then(() => this.getScreenData(false))
      .then(() => this.setState({ changeScreenModeInProgress: false }))
      .catch((err) => this.setState({
        changeScreenModeInProgress: false,
        error: getErrText(err),
      }))
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)

    const { dispatch, currentCompanyId, route } = this.props
    const paramsLink = route.params.paramsLink
    if (currentCompanyId) {
      getAccountCflTransTypeApi.post({ body: { uuid: currentCompanyId } })
        .then(data => {
          this.setState({
            categories: data.filter(item => item.shonaScreen),
            categoriesArr: data,
          })
          if (paramsLink && paramsLink.checksMobileState) {
            return dispatch(updateDefaultUserScreen(USER_SCREENS.checksMobile,
              paramsLink.checksMobileState))
          } else {
            return dispatch(getDefaultUserScreen(USER_SCREENS.checksMobile))
          }
        })
        .then(() => {
          const width = (winWidth / 2) - 10
          return this.setState({
            _widthIncome: (this.screenSwitchState) ? width : 0,
            _widthOut: (this.screenSwitchState) ? 0 : width,
            isReady: true,
          }, (paramsLink && paramsLink.checksMobileState)
            ? this.getScreenData
            : this.selectDefaultAccounts)
        })
        .catch((err) => this.setState({
          isReady: true,
          error: getErrText(err),
        }))
    }
  }

  setCheckTitleMarks = (widthIncome, widthOut, state) => {
    if (this.state._widthIncome !== widthIncome) {
      this.setState({
        _widthIncome: widthIncome,
        _widthOut: widthOut,
      })
      setTimeout(() => {
        this.setState({
          chequeDetails: null,
        })
        this.handleChangeScreenMode(state)
      }, IS_IOS ? 200 : 200)
    }
  }

  _onRefresh = () => {
    this.getScreenData(false)
  }

  closeModalCreatePayments = () => {
    this.setState({ openModalCreatePayments: false })
  }

  searchQuery = (query) => {
    let querySearch = (query === '') ? null : query
    this.setState({ querySearch: querySearch })
    setTimeout(() => {
      // console.log(this.state.querySearch)
      this.filtersAll()
    }, 20)
  }
  handleRemoveRowModal = (state) => this.setState(
    { removeRowModalOpen: state })
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

  addMovement = (type) => () => {
    if (this.props.route.params.objParamas) {
      delete this.props.route.params.objParamas
    }

    this.setState({
      openModalCreatePayments: true,
      dataTypePayments: type,
    })
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  handleBackPress = () => {
    this.props.dispatch(setOpenedBottomSheet(false))
    goToBack(this.props.navigation)
    return true
  }
  goToRECOMMENDATION = () => {
    goTo(this.props.navigation, 'RECOMMENDATION')
  }

  isSearchOpen = (isSearchOpen, filter) => {
    if (isSearchOpen) {
      this.setState({
        isSearchOpen: !isSearchOpen,
        querySearch: null,
      })
      if (filter) {
        setTimeout(() => {
          // console.log(this.state.querySearch)

          this.handleSetDates({
            dateFromTimestamp: null,
            dateTillTimestamp: null,
          })
          // this.setStatusDef()
          // this.filtersAll()
        }, 20)
      }
    } else {
      this.setState({ isSearchOpen: !isSearchOpen })
      this.filtersAll()
    }
  }

  handleDeleteStatus = (i) => () => {
    const {
      statusListCopy,
    } = this.state
    let statusList = JSON.parse(JSON.stringify(statusListCopy))
    const index = statusList.findIndex((it) => it.id === i.id)
    statusList[index].press = false
    this.setState({
      statusListCopy: statusList,
      statusList: statusList,
    })
    this.filtersAll(false, true)
  }
  handleDeleteProgramName = (i) => () => {
    const {
      programNameListCopy,
    } = this.state
    let programNameList = JSON.parse(JSON.stringify(programNameListCopy))
    const index = programNameList.findIndex((it) => it.id === i.id)
    programNameList[index].press = false
    this.setState({
      programNameListCopy: programNameList,
      programNameList: programNameList,
    })
    this.filtersAll(false, true)
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
    this.filtersAll(false, true)
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
    this.filtersAll(false, true)
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

  handleToggleStatus = (i) => () => {
    const {
      statusListCopy,
    } = this.state
    let statusList = JSON.parse(JSON.stringify(statusListCopy))
    const index = statusList.findIndex((it) => it.id === i.id)
    statusList[index].press = !statusList[index].press
    this.setState({
      statusListCopy: statusList,
    })
  }
  handleCancelSaveStatus = () => {
    const {
      statusList,
    } = this.state

    this.setState({
      statusListCopy: statusList,
      statusListModal: false,
    })
  }
  handleSaveStatus = () => {
    const {
      statusListCopy,
    } = this.state
    this.setState({
      statusList: statusListCopy,
      statusListModal: false,
    })
    this.filtersAll(false, true)
  }
  handleRemoveAllStatus = () => {
    const {
      statusListCopy,
    } = this.state
    let statusList = JSON.parse(JSON.stringify(statusListCopy))
    statusList.forEach(it => {
      it.press = false
    })
    this.setState({
      statusListCopy: statusList,
    })
  }

  handleToggleProgramName = (i) => () => {
    const {
      programNameListCopy,
    } = this.state
    let programNameList = JSON.parse(JSON.stringify(programNameListCopy))
    const index = programNameList.findIndex((it) => it.id === i.id)
    programNameList[index].press = !programNameList[index].press
    this.setState({
      programNameListCopy: programNameList,
    })
  }
  handleCancelSaveProgramName = () => {
    const {
      programNameList,
    } = this.state

    this.setState({
      programNameListCopy: programNameList,
      programNameListModal: false,
    })
  }
  handleSaveProgramName = () => {
    const {
      programNameListCopy,
    } = this.state
    this.setState({
      programNameList: programNameListCopy,
      programNameListModal: false,
    })
    this.filtersAll(false, true)
  }
  handleRemoveAllProgramName = () => {
    const {
      programNameListCopy,
    } = this.state
    let programNameList = JSON.parse(JSON.stringify(programNameListCopy))
    programNameList.forEach(it => {
      it.press = false
    })
    this.setState({
      programNameListCopy: programNameList,
    })
  }

  handleModalTypes = (type) => () => {
    if (type === 'categoriesMatchModal') {
      this.setState({
        categoriesMatchModal: true,
      })
    } else if (type === 'statusListModal') {
      this.setState({
        statusListModal: true,
      })
    } else if (type === 'programNameListModal') {
      this.setState({
        programNameListModal: true,
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

  // get hasDataFilter () {
  //   const { bankTrans } = this.state
  //   return (!bankTrans || (bankTrans && bankTrans.length === 0))
  // }
  handleSetScrollPosition = (y) => this.setState({ currentScrollPosition: y })

  render () {
    const {
      t,
      isRtl,
      accounts,
      accountGroups,
      currentCompanyId,
      navigation,
      route,
    } = this.props

    const {
      changeScreenModeInProgress,
      selectedAccountIds,
      selectedGroup,
      accountsModalIsOpen,
      dateTillTimestamp,
      dateFromTimestamp,
      alertYPosition,
      alertDetailsIsOpen,
      calendarModalIsOpen,
      isLayoutComplete,
      _widthIncome,
      _widthOut,
      statusTotals,
      chequeDetails,
      isUpdate,
      openModalCreatePayments,
      dataTypePayments,
      currentScrollPosition,
      removeRowModalOpen,
      rowInfo,
      error,
      sizeFontStatusTotals,
      currentIndex,
      queryStatus,
      querySearch,
      categoriesMatchCopy,
      categoriesMatchModal,
      isSearchOpen,
      showGraph,
      bankTransGraphZchut,
      datesGraphList,
      numberTickZchut,
      monthYear,
      statusListCopy,
      programNameListCopy,
      programNameListModal,
      statusListModal,
      scrollAnim,
      accountsILS,
      statusList,
      programNameList,
      categoriesMatch,
      isDefDates,
    } = this.state
    if (!isLayoutComplete) {return <Loader/>}

    let lenStatusListCopy = statusListCopy.filter(
      (it) => it.press === true).length
    let lenProgramNameCopy = programNameListCopy.filter(
      (it) => it.press === true).length
    let lenCategoriesMatchCopy = categoriesMatchCopy.filter(
      (it) => it.press === true).length

    const statusListArr = statusList.filter((it) => it.press === true)
    const programNameListArr = programNameList.filter((it) => it.press === true)
    const categoriesMatchArr = categoriesMatch.filter((it) => it.press === true)

    const axesSvg = {
      fontSize: sp(10),
      fill: colors.blue32,
    }
    // const verticalContentInset = { top: 0, bottom: 0 }
    const xAxisHeight = 30
    const ratio = (win.height - this.headerHeight) / win.width

    const verticalContentInset = {
      top: 10,
      bottom: 10,
    }
    const alertState = this.headerAlertState
    const hasData = chequeDetails && chequeDetails.length > 0 && !error
    return (
      <Fragment>
        <AlertsTrial navigation={navigation} refresh={this._onRefresh}
                     updateToken={this.props.globalParams.updateToken}/>

        <Fragment>
          <HeaderHeightContext.Consumer>
            {headerHeight => {
              this.headerHeight = headerHeight;
            }}
          </HeaderHeightContext.Consumer>
          <View style={[
            styles.fill, {
              flex: 1,
              backgroundColor: '#ffffff',
            }]}>
            {(this.isLoader) && (<Loader overlay
                                         containerStyle={{ backgroundColor: colors.white }}/>)}

            <DataList
              navigation={this.props.navigation}
              openGraph={this.openGraph}
              isLoader={this.isLoader}
              accountsILS={accountsILS}
              scrollAnim={scrollAnim}
              onSetScrollPosition={this.handleSetScrollPosition}
              hasData={hasData}
              t={t}
              chequeDetails={hasData ? chequeDetails : []}
              isSearchOpen={isSearchOpen}
              handleDeleteStatus={this.handleDeleteStatus}
              handleDeleteProgramName={this.handleDeleteProgramName}
              handleDeleteCategory={this.handleDeleteCategory}
              handleModalTypes={this.handleModalTypes}
              searchQuery={this.searchQuery}
              queryStatus={queryStatus}
              querySearch={querySearch}
              currentIndex={currentIndex}
              currentCompanyId={currentCompanyId}
              isUpdate={isUpdate}
              filtersAll={this.filtersAll}
              getNameOfStatus={this.getNameOfStatus}
              sizeFontStatusTotals={sizeFontStatusTotals}
              statusTotals={statusTotals}
              winWidth={winWidth}
              widthIncome={_widthIncome}
              widthOut={_widthOut}
              setCheckTitleMarks={this.setCheckTitleMarks}
              isRtl={isRtl}
              changeScreenModeInProgress={changeScreenModeInProgress}
              dateFromTimestamp={dateFromTimestamp}
              dateTillTimestamp={dateTillTimestamp}
              screenSwitchState={this.screenSwitchState}
              selectedAccounts={this.selectedAccounts}
              selectedDeviantAccounts={this.selectedDeviantAccounts}
              selectedNotUpdatedAccounts={this.selectedNotUpdatedAccounts}
              hasAlert={this.hasHeaderAlert}
              alertState={this.headerAlertState}
              scrollY={this.scrollY}
              headerChartX={this.headerChartX}
              alertYPosition={alertYPosition}
              refresh={this._onRefresh}
              deleteOperationApi={this.handleRemoveRowModalCb}
              headerMinHeight={this.headerMinHeight}
              accountGroups={accountGroups}
              selectedGroup={selectedGroup}
              selectedAccountIds={selectedAccountIds}
              currentAccountIndex={this.currentAccountIndex}
              hasNextAccount={this.hasNextAccount}
              hasPreviousAccount={this.hasPreviousAccount}
              headerScrollDistance={this.headerScrollDistance}
              onOpenAccountsModal={this.handleOpenAccountsModal}
              onSetAlertPosition={this.handleSetAlertPosition}
              onSelectAccount={this.handleForceSelectAccount}
              onToggleAlertDetails={this.handleToggleAlertDetails}
              onToggleCalendar={this.handleOpenCalendarModal}
              onChangeScreenMode={this.handleChangeScreenMode}
              onSetHeaderHeight={this.handleSetHeaderHeight}
              error={error}
            />

            <BankAccountsHeader
              isDefDates={isDefDates}
              t={t}
              categoriesMatchCopy={categoriesMatchCopy}
              programNameListCopy={programNameListCopy}
              statusListCopy={statusListCopy}
              handleDeleteStatus={this.handleDeleteStatus}
              handleDeleteProgramName={this.handleDeleteProgramName}
              isSearchOpenState={isSearchOpen}
              handleDeleteCategory={this.handleDeleteCategory}
              handleModalTypes={this.handleModalTypes}
              isSearchOpen={this.isSearchOpen}
              searchQuery={this.searchQuery}
              queryStatus={queryStatus}
              querySearch={querySearch}
              currentIndex={currentIndex}
              currentCompanyId={currentCompanyId}
              isUpdate={isUpdate}
              filtersAll={this.filtersAll}
              getNameOfStatus={this.getNameOfStatus}
              sizeFontStatusTotals={sizeFontStatusTotals}
              statusTotals={statusTotals}
              winWidth={winWidth}
              widthIncome={_widthIncome}
              widthOut={_widthOut}
              setCheckTitleMarks={this.setCheckTitleMarks}
              isRtl={isRtl}
              changeScreenModeInProgress={changeScreenModeInProgress}
              dateFromTimestamp={dateFromTimestamp}
              dateTillTimestamp={dateTillTimestamp}
              screenSwitchState={this.screenSwitchState}
              selectedAccounts={this.selectedAccounts}
              selectedDeviantAccounts={this.selectedDeviantAccounts}
              selectedNotUpdatedAccounts={this.selectedNotUpdatedAccounts}
              hasData={this.hasData}
              hasAlert={this.hasHeaderAlert}
              alertState={this.headerAlertState}
              scrollAnim={scrollAnim}
              headerChartX={this.headerChartX}
              alertYPosition={alertYPosition}
              headerMinHeight={this.headerMinHeight}
              accountGroups={accountGroups}
              selectedGroup={selectedGroup}
              selectedAccountIds={selectedAccountIds}
              currentAccountIndex={this.currentAccountIndex}
              hasNextAccount={this.hasNextAccount}
              hasPreviousAccount={this.hasPreviousAccount}
              headerScrollDistance={this.headerScrollDistance}
              onOpenAccountsModal={this.handleOpenAccountsModal}
              onSetAlertPosition={this.handleSetAlertPosition}
              onSelectAccount={this.handleForceSelectAccount}
              onToggleAlertDetails={this.handleToggleAlertDetails}
              onToggleCalendar={this.handleOpenCalendarModal}
              onChangeScreenMode={this.handleChangeScreenMode}
              onSetHeaderHeight={this.handleSetHeaderHeight}
              statusListArr={statusListArr}
              programNameListArr={programNameListArr}
              categoriesMatchArr={categoriesMatchArr}
            />

            {alertDetailsIsOpen && (
              <AccountAlertDetails
                isRtl={isRtl}
                alertState={alertState}
                top={alertYPosition - currentScrollPosition}
                accounts={this.selectedNotUpdatedAccounts}
                onSelectAccount={this.handleForceSelectAccount}
                onClose={this.handleToggleAlertDetails}
              />
            )}

            {accountsModalIsOpen && (accounts && accounts.length > 1) && (
              <AccountsModal
                onlyILS
                isOpen
                isRtl={isRtl}
                onClose={this.handleCloseSelectedAccounts}
                onSubmit={this.handleApplySelectedAccounts}
                accountGroups={accountGroups}
                onSelectGroup={this.handleSelectGroup}
                onSelectAccounts={this.handleSelectAccounts}
                selectedAccountIds={selectedAccountIds}
                selectedGroup={selectedGroup}
              />
            )}

            {calendarModalIsOpen && (
              <CalendarModal
                minDate={this.minOldestTransDateInSelectedAccounts()}
                isOpen
                isChecks
                t={t}
                isRtl={isRtl}
                onClose={this.handleCloseCalendarModal}
                dateFromTimestamp={dateFromTimestamp}
                dateTillTimestamp={dateTillTimestamp}
                onSetDates={this.handleSetDates}
              />
            )}

            {removeRowModalOpen && (
              <RemoveRowModal
                setModalVisible={this.handleRemoveRowModalCb}
                isRtl={isRtl}
                item={rowInfo}
                removeItem={this.deleteOperationApi}
              />
            )}
            {openModalCreatePayments && (
              <CreatePayment
                route={route}
                updateRow={this.getScreenData}
                navigation={navigation}
                accounts={accounts.filter((a) => a.currency === 'ILS').length ? accounts.filter((a) => a.currency === 'ILS') : accounts}
                accountsAll={accounts}
                selectedAccountIds={selectedAccountIds}
                closeModalCreatePayments={this.closeModalCreatePayments}
                currentCompanyId={currentCompanyId}
                dataTypePayments={dataTypePayments}/>)}

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

            {(programNameListModal) && (
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
                }} onPress={this.handleCancelSaveProgramName}/>

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
                        onPress={this.handleSaveProgramName}>
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
                        {'סינון לפי מקור הצ׳ק'}
                      </Text>
                    </View>
                    <View style={{
                      marginTop: 30,
                    }}>
                      <TouchableOpacity
                        activeOpacity={(lenProgramNameCopy > 0) ? 0.2 : 1}
                        hitSlop={{
                          top: 20,
                          bottom: 20,
                          left: 20,
                          right: 20,
                        }}
                        onPress={this.handleRemoveAllProgramName}>
                        <Text style={{
                          color: lenProgramNameCopy > 0 ? '#2aa1d9' : '#c2c3c3',
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
                    {programNameListCopy.length > 0 &&
                    programNameListCopy.map((f, i) => {
                      return (
                        <View key={i.toString()}
                              style={{
                                height: 50,
                                width: '100%',
                              }}>

                          <View style={{
                            height: 50,
                            alignSelf: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
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
                                alignSelf: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'center',
                              }}
                              textStyle={{
                                fontSize: sp(20),
                                color: colors.blue32,
                                fontWeight: 'normal',
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                                right: 0,
                                left: 0,
                                justifyContent: 'space-between',
                                width: '87%',
                                margin: 0,
                                padding: 0,
                              }}
                              size={30}
                              left
                              title={f.id}
                              iconLeft
                              iconType="material-community"
                              checkedIcon="radiobox-marked"
                              uncheckedIcon="radiobox-blank"
                              checked={f.press}
                              onPress={this.handleToggleProgramName(f)}
                            />
                          </View>

                          <View style={{
                            height: 1,
                            width: '100%',
                            backgroundColor: colors.gray30,
                          }}/>
                        </View>
                      )
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            {(statusListModal) && (
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
                }} onPress={this.handleCancelSaveStatus}/>

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
                        onPress={this.handleSaveStatus}>
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
                        {'סינון לפי סטטוס הצ׳ק'}
                      </Text>
                    </View>
                    <View style={{
                      marginTop: 30,
                    }}>
                      <TouchableOpacity
                        activeOpacity={(lenStatusListCopy > 0) ? 0.2 : 1}
                        hitSlop={{
                          top: 20,
                          bottom: 20,
                          left: 20,
                          right: 20,
                        }}
                        onPress={this.handleRemoveAllStatus}>
                        <Text style={{
                          color: lenStatusListCopy > 0 ? '#2aa1d9' : '#c2c3c3',
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
                    {statusListCopy.length > 0 && statusListCopy.map((f, i) => {
                      return (
                        <View key={i.toString()}
                              style={{
                                height: 50,
                                width: '100%',
                              }}>

                          <View style={{
                            height: 50,
                            alignSelf: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
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
                                alignSelf: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'center',
                              }}
                              textStyle={{
                                fontSize: sp(20),
                                color: colors.blue32,
                                fontWeight: 'normal',
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                                right: 0,
                                left: 0,
                                justifyContent: 'space-between',
                                width: '87%',
                                margin: 0,
                                padding: 0,
                              }}
                              size={30}
                              left
                              title={f.text}
                              iconLeft
                              iconType="material-community"
                              checkedIcon="radiobox-marked"
                              uncheckedIcon="radiobox-blank"
                              checked={f.press}
                              onPress={this.handleToggleStatus(f)}
                            />
                          </View>

                          <View style={{
                            height: 1,
                            width: '100%',
                            backgroundColor: colors.gray30,
                          }}/>
                        </View>
                      )
                    })}
                  </ScrollView>
                </View>
              </View>
            )}

            {showGraph && (
              <Modal
                animationType="slide"
                transparent={false}
                visible={showGraph}
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
                          shadow={false}
                          numberOfTicks={numberTickZchut}
                          data={bankTransGraphZchut}
                          style={{
                            marginBottom: (monthYear &&
                              monthYear.filter(item => item !== '').length ===
                              1)
                              ? 60
                              : 35,
                            width: 30,
                            fontFamily: fonts.regular,
                          }}
                          contentInset={verticalContentInset}
                          svg={axesSvg}
                          formatLabel={(value) => {
                            if (value === 0) {
                              return value
                            } else {
                              return this.checkIfK(value)
                            }
                          }}
                        />

                        <View style={{
                          flex: 1,
                          marginLeft: 10,
                        }}>
                          <LineChart
                            numberOfTicks={numberTickZchut}
                            style={{ flex: 1 }}
                            data={bankTransGraphZchut}
                            contentInset={verticalContentInset}
                            svg={{ stroke: 'blue' }}
                          >
                            <Grid/>
                          </LineChart>
                          {(datesGraphList && datesGraphList.length > 0 &&
                            monthYear && monthYear.length > 0 &&
                            monthYear.filter(item => item !== '').length ===
                            1) &&
                          (<XAxis
                              data={datesGraphList}
                              svg={{
                                rotation: 0,
                                originY: 0,
                                y: 5,
                                fontSize: sp(10),
                                fill: colors.blue32,
                                fontFamily: fonts.regular,
                              }}
                              xAccessor={({ index }) => index}
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
                          {monthYear && monthYear.length > 0 && (
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
                              xAccessor={({ index }) => index}
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
                          )}
                        </View>
                      </View>
                    </View>
                  </View>
                </SafeAreaView>
              </Modal>
            )}

            {!IS_LIGHT.light && (
              <ActionButton
                bgColor="#ffffffbf"
                buttonColor="#0addc1" size={54}
                spacing={0}
                buttonTextStyle={{
                  fontSize: 54,
                  lineHeight:54,
                  textAlign: 'center',
                  marginTop: (IS_IOS ? -6 : 3),
                }}
              >
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
                  title="צ׳ק נכנס"
                  onPress={this.addMovement(400)}>
                  <Image
                    style={[
                      styles.actionButtonIcon, {
                        height: 15.5,
                        width: 27,
                      }]}
                    source={require('BiziboxUI/assets/checkIncIcon.png')}/>
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
                  title="צ׳ק יוצא"
                  onPress={this.addMovement(44)}
                >
                  <Image
                    style={[
                      styles.actionButtonIcon, {
                        height: 25.5,
                        width: 27,
                      }]}
                    source={require('BiziboxUI/assets/checkExIcon.png')}/>
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
            )}
          </View>

        </Fragment>

      </Fragment>
    )
  }
}
