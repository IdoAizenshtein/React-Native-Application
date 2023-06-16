import React, { PureComponent } from 'react'
import { setOpenedBottomSheet } from 'src/redux/actions/user'
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import commonStyles from '../../styles/styles'
import { getErrText, goToBack, sp } from '../../utils/func'
import {
  banktransForMatch,
  cashflowMatch,
  getBankMatchAccount,
} from '../../redux/actions/bankMatch'
import { IS_IOS } from '../../constants/common'
import AccountsModal from '../../components/AccountsModal/AccountsModal'
import BankAccountsHeader from './components/BankAccountsHeader'
import RemoveRowModal from './components/RemoveRowModal'
import CashflowMatchPopup from './components/CashflowMatchPopup'
import RemoveRowFromListModal from './components/RemoveRowFromListModal'
import EditOptionModal from './components/EditOptionModal'
import EditRowModal from '../../components/EditRowModal/EditRowModal'
import CreatePayment from './components/CreatePayment'
import { selectAccounts } from '../../redux/actions/account'
import { values } from 'lodash'
import { isToday } from '../../utils/date'
import {
  approveRecommendationApi,
  bankMatchApi,
  bankMatchDeleteApi,
  getAccountCflTransTypeApi,
  matchRestartApi,
} from '../../api'
import styles from './BankMatchStyles'
import { Card } from './components/Card'
import Loader from '../../components/Loader/Loader'
import Api from '../../api/Api'
import { Icon } from 'react-native-elements'
import { colors, fonts } from '../../styles/vars'
import { CardMatch } from './components/CardMatch'
import AppTimezone from '../../utils/appTimezone'
import NumericInput from 'react-native-numeric-input'
import { CarouselComponent } from './components/CarouselComponent'
import AlertsTrial from 'src/components/AlertsTrial/AlertsTrial'

import Interactable from 'react-native-interactable'

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView)
const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
}
const winWidth = Dimensions.get('window').width

@connect(state => ({
  globalParams: state.globalParams,
  isRtl: state.isRtl,
  currentCompanyId: state.currentCompanyId,
  accounts: state.accounts,
  bankMatchAccounts: state.bankMatchAccountData,
  banktransForMatchData: state.banktransForMatchData,
  cashflowMatchData: state.cashflowMatchData,
}))
@withTranslation()
export default class BankMatchScreen extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      currentOpenItemIndex: null,
      matchPeulot: false,
      timesValue: 3,
      isShake: false,
      fadeAnim: new Animated.Value(0),
      showAlert: false,
      isReady: false,
      inProgress: true,
      isLayoutComplete: false,
      error: null,
      categories: [],
      selectedAccountIds: [],
      queryStatus: {
        expense: null,
        query: null,
      },
      currentSelectedAccountId: null,
      selectedGroup: null,
      accountsModalIsOpen: false,
      removeRowModalOpen: false,
      removeRowFromListModalOpen: false,
      calendarModalIsOpen: false,
      headerMaxHeight: 100,
      alertYPosition: 0,
      alertDetailsIsOpen: false,
      transactions: [],
      rowInfo: null,
      adjustableMovementsScreen: true,
      isDragMode: false,
      isScrolling: false,
      draggedCategoryId: null,
      dropZonePosition: null,
      canBeRemove: false,
      newCategoryName: null,
      scrollOffsetY: 200,
      scrollSize: { width: 0, height: 0 },
      category: null,
      adjustableMovementsWidth: ((winWidth / 2)),
      adjustedMovementsScreenWidth: 0,
      dropZoneValues: null,
      dropZoneValues1: null,
      showDraggable: false,
      pan: new Animated.ValueXY(),
      editPopModalOpen: false,
      editRowModalOpen: false,
      openModalCreatePayments: false,
      dataTypePayments: null,
      banktransForMatchDataState: [],
      cashflowMatchDataState: [],
      banktransForMatchForMatch: [],
      cashflowMatchForMatch: [],
      animatedValue: new Animated.Value(0),
      openModalCreateEditTransaction: false,
      dataTransaction: {},
      showAlertMoreThanFifty: false,
      scrollAnim: new Animated.Value(0),
      refreshing: false,
      cashflowMatchPopup: false,
    }
    this._deltaY = new Animated.Value(0)
    this.scrollY = new Animated.Value(IS_IOS ? -100 : 0)
  }

  get accountIdsForRequest () {
    const { selectedAccountIds } = this.state
    return selectedAccountIds
  }

  get isLoader () {
    const { isReady, inProgress } = this.state
    return !isReady || inProgress
  }

  get selectedDeviantAccounts () {
    return this.selectedAccounts.filter(a => a.balanceUse < 0)
  }

  get selectedAccounts () {
    const { accounts } = this.props
    const selectedAccountIds = this.accountIdsForRequest

    return accounts.filter(a => selectedAccountIds.includes(a.companyAccountId))
  }

  get selectedNotUpdatedAccounts () {
    return this.selectedAccounts.filter(a => !isToday(a.balanceLastUpdatedDate))
  }

  get hasData () {
    // const { accountAggregatedData, bankTrans } = this.props
    //
    // return this.screenSwitchState
    //   ? !!(accountAggregatedData && accountAggregatedData.accountTransactions.length)
    //   : !!(bankTrans && bankTrans.length)
  }

  get headerScrollDistance () {
    const { headerMaxHeight } = this.state
    const scrollDistance = headerMaxHeight - this.headerMinHeight
    return scrollDistance > 0 ? scrollDistance : 0
  }

  get headerMinHeight () {
    const minHeight = IS_IOS ? 35 : 35
    return minHeight
  }

  get headerMinHeightCalc () {
    const minHeight = 135 - 60
    return minHeight
  }

  get hasHeaderAlert () {
    if (!this.selectedAccounts.length || (!this.selectedDeviantAccounts.length && !this.selectedNotUpdatedAccounts.length)) {return false}
    return values(this.headerAlertState).some(v => v)
  }

  get headerAlertState () {
    const selectedAccounts = this.selectedAccounts
    const selectedDeviantAccounts = this.selectedDeviantAccounts
    const selectedNotUpdatedAccounts = this.selectedNotUpdatedAccounts

    return {
      isOneOfOne: selectedAccounts.length === 1 && selectedDeviantAccounts.length === 1,
      isOneOfMultiple: selectedAccounts.length > 1 && selectedDeviantAccounts.length === 1,
      isMoreThenOneOfMultiple: selectedAccounts.length > 1 && selectedDeviantAccounts.length > 1,
      isAccountNotUpdated: !!(selectedAccounts.length && selectedNotUpdatedAccounts.length),
    }
  }

  handleSelectAccount = (id) => {
    this.setState({ selectedAccountIds: [id] }, this.handleApplySelectedAccounts)
  }

  selectDefaultAccounts = (id) => {
    this.setState({
      selectedAccountIds: [id],
    })
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

  getBankMatchAccountReq = (accountsUuids) => {
    const { dispatch } = this.props
    return dispatch(getBankMatchAccount(accountsUuids))
  }

  handleShowAlertMoreThanFiftyModal = (state) => {
    if (state) {
      this.setState({ showAlertMoreThanFifty: state })
      Animated.timing(
        this.state.fadeAnim,
        {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        },
      ).start()
    } else {
      Animated.timing(
        this.state.fadeAnim,
        {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        },
      ).start(() => {
        this.setState({ showAlertMoreThanFifty: state })
      })
    }
  }

  getScreenData = (isLoader = true) => {
    const { dispatch } = this.props
    const { selectedAccountIds, adjustableMovementsScreen } = this.state
    this.setState({
      banktransForMatchForMatch: [],
      cashflowMatchForMatch: [],
    })
    if (isLoader) {this.setState({ inProgress: true, isLayoutComplete: false })}
    if (!isLoader) {this.setState({ inProgress: true, isLayoutComplete: true })}
    const accParam = { 'uuid': selectedAccountIds[0] }
    const thisAcc = this.props.bankMatchAccounts.find(a => a.companyAccountId === selectedAccountIds[0])
    if (thisAcc.countNigrarot && thisAcc.countNigrarot > 50) {
      this.handleShowAlertMoreThanFiftyModal(true)
    }
    let Ws
    if (adjustableMovementsScreen) {
      Ws = Promise.all([dispatch(banktransForMatch(accParam)), dispatch(cashflowMatch(accParam))])
    } else {
      Ws = Promise.all([dispatch(banktransForMatch(accParam)), dispatch(cashflowMatch(accParam))])
    }
    return Ws
      .then((data) => {
        try {
          data[0].forEach((trns, idx) => {
            trns.idx = idx
            trns.transType = this.state.categories.find(ctt => ctt.transTypeId === trns.transTypeId)
          })
          data[1].forEach((trns, idx) => {
            trns.idx = idx
            trns.transType = this.state.categories.find(ctt => ctt.transTypeId === trns.transTypeId)
          })
          const { banktransForMatchData, cashflowMatchData } = this.props

          this.setState({
            banktransForMatchDataState: JSON.parse(JSON.stringify(banktransForMatchData)),
            cashflowMatchDataState: JSON.parse(JSON.stringify(cashflowMatchData)),
            isLayoutComplete: true,
            inProgress: false,
          })
          this.filtersAll()
        } catch (e) {
          this.setState({
            banktransForMatchDataState: [],
            cashflowMatchDataState: [],
            isLayoutComplete: true,
            inProgress: false,
          })
        }
      })
      .catch((err) => {
        this.setState({
          inProgress: false,
          isLayoutComplete: true,
          error: getErrText(err),
        })
      })
  }

  scrollToEnd () {
    setTimeout(() => {
      if (this.scrollView && this.scrollView._component) {
        if (this.props.isRtl) {
          this.scrollView._component.scrollToEnd({ animated: true })
        } else {
          this.scrollView._component.scrollTo({ animated: true, x: 0 })
        }
      }
      if (this.scrollViewTop && this.scrollViewTop._component) {
        if (this.props.isRtl) {
          this.scrollViewTop._component.scrollTo({ animated: true, x: 0 })
        } else {
          this.scrollViewTop._component.scrollToEnd({ animated: true })
        }
      }
    }, 10)
    setTimeout(() => {
      if (this.scrollViewMain && this.scrollViewMain._component) {
        this.scrollViewMain._component.scrollTo({ animated: true, y: 0 })
      }
    }, 800)
  }

  getData = () => {
    const { currentCompanyId, accounts, dispatch } = this.props
    if (accounts && accounts.length && currentCompanyId) {
      const accountsUuids = accounts.map(acc => {
        return { 'uuid': acc.companyAccountId }
      })
      return Promise.all([getAccountCflTransTypeApi.post({ body: { uuid: currentCompanyId } }), dispatch(getBankMatchAccount(accountsUuids))])
    } else {
      this.setState({ inProgress: false, isLayoutComplete: true })
      return Promise.reject(new Error('fail'))
    }
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    this._deltaY = new Animated.Value(0)

    this.getData()
      .then(data => {
        try {
          const accountsList = data[1]
          if (accountsList.length) {
            accountsList.forEach((acc) => {
              acc = Object.assign(acc, this.props.accounts.find(a => a.companyAccountId === acc.companyAccountId))
            })
            const selectedAccountIds = this.props.route.params.selectedAccountIds
            this.setState({
              isReady: true,
              categories: data[0].filter(item => item.shonaScreen),
              selectedAccountIds: [(selectedAccountIds) || data[1][0].companyAccountId],
            })
            setTimeout(() => {
              if (this.props.route.params.selectedAccountIds) {
                delete this.props.route.params.selectedAccountIds
              }
              return this.getScreenData()
            }, 200)
          } else {
            this.setState({
              isReady: true,
              banktransForMatchDataState: [],
              cashflowMatchDataState: [],
              isLayoutComplete: true,
              inProgress: false,
            })
          }
        } catch (e) {
          this.setState({
            isReady: true,
            banktransForMatchDataState: [],
            cashflowMatchDataState: [],
            isLayoutComplete: true,
            inProgress: false,
          })
        }
      })
      .catch((err) => this.setState({ isReady: true, error: getErrText(err) }))
  }

  handleApplySelectedAccounts = () => {
    this.props.dispatch(selectAccounts(this.state.selectedAccountIds))
    this.handleCloseAccountsModal()
    this.getScreenData()
  }

  handleCloseSelectedAccounts = () => {
    this.setState({
      accountsModalIsOpen: false,
      selectedAccountIds: JSON.parse(JSON.stringify(this.state.selectedAccountIdsSave)),
      selectedGroup: JSON.parse(JSON.stringify(this.state.selectedGroupSave)),
    })
  }

  handleCloseAccountsModal = () => this.setState({ accountsModalIsOpen: false })

  handleOpenAccountsModal = () => this.setState({
    accountsModalIsOpen: true,
    selectedAccountIdsSave: JSON.parse(JSON.stringify(this.state.selectedAccountIds)),
    selectedGroupSave: JSON.parse(JSON.stringify(this.state.selectedGroup)),
  })

  handlePopRowEditsModal = (state) => {
    if (state) {
      this.handleEditOptionModal(false)
    }
    this.setState({ editRowModalOpen: state })
  }

  searchQuery = (query) => {
    let valuesSave = Object.assign({}, this.state.queryStatus)
    valuesSave.query = (query === '') ? null : query
    this.setState({ queryStatus: valuesSave })
    setTimeout(() => {
      this.filtersAll()
    }, 20)
  }

  filtersAll = (status) => {
    this.setState({
      inProgress: status !== undefined,
    })
    this.removeMatch()
    if (status !== undefined) {
      let valuesSave = Object.assign({}, this.state.queryStatus)
      valuesSave.expense = status
      this.setState({ queryStatus: valuesSave })
    }

    setTimeout(() => {
      const { queryStatus, cashflowMatchDataState, banktransForMatchDataState } = this.state
      if (cashflowMatchDataState.length || banktransForMatchDataState.length) {
        let cashflowMatchDataSave = JSON.parse(JSON.stringify(cashflowMatchDataState))
        let banktransForMatchDataSave = JSON.parse(JSON.stringify(banktransForMatchDataState))

        if (queryStatus) {
          if (queryStatus.query !== null && queryStatus.query !== '') {
            cashflowMatchDataSave = cashflowMatchDataSave.filter((item) => ((item.targetName && item.targetName.toString().toLowerCase().includes(queryStatus.query.toLowerCase())) || (item.targetOriginalTotal && item.targetOriginalTotal.toString().includes(queryStatus.query)) || (item.targetOriginalDate && AppTimezone.moment(item.targetOriginalDate).format('DD/MM/YY').toString().toLowerCase().includes(queryStatus.query.toLowerCase()))))
            banktransForMatchDataSave = banktransForMatchDataSave.filter((item) => ((item.transDescAzonly && item.transDescAzonly.toString().toLowerCase().includes(queryStatus.query.toLowerCase())) || (item.total && item.total.toString().includes(queryStatus.query)) || (item.transDate && AppTimezone.moment(item.transDate).format('DD/MM/YY').toString().toLowerCase().includes(queryStatus.query.toLowerCase()))))
          }
        }

        this.setState({
          cashflowMatchDataState: cashflowMatchDataSave,
          banktransForMatchDataState: banktransForMatchDataSave,
          inProgress: false,
        })

        this.scrollToEnd()
      } else {
        this.setState({
          inProgress: false,
        })
        this.scrollToEnd()
      }
    }, 100)
  }

  handleForceSelectAccount = (id) => {
    this.setState(
      { selectedAccountIds: [id], alertDetailsIsOpen: false },
      this.handleApplySelectedAccounts,
    )
  }

  handleSetHeaderHeight = (e) => {
    this.scrollY = new Animated.Value(IS_IOS ? -e.nativeEvent.layout.height : 0)
    this.setState({ headerMaxHeight: e.nativeEvent.layout.height, isLayoutComplete: true })
  }

  handleSetAlertPosition = (e) => this.setState({ alertYPosition: e.nativeEvent.layout.y })

  handleToggleAlertDetails = () => this.setState({ alertDetailsIsOpen: !this.state.alertDetailsIsOpen })

  setCheckTitleMarks = (state) => {
    this.setState({
      adjustableMovementsScreen: state,
      adjustableMovementsWidth: state ? ((winWidth / 2)) : 0,
      adjustedMovementsScreenWidth: !state ? ((winWidth / 2)) : 0,
    })
  }

  handleOpenCalendarModal = () => this.setState({ calendarModalIsOpen: true })

  handleCloseCalendarModal = () => this.setState({ calendarModalIsOpen: false })

  handleRemoveRowModal = (state) => this.setState({ removeRowModalOpen: state })

  handleRemoveRowModalCb = (item, state, closeEditPopModalOpen) => {
    if (closeEditPopModalOpen) {
      this.handleEditOptionModal(false)
    }
    if (state) {
      this.setState({ rowInfo: item })
      this.handleRemoveRowModal(state)
    } else {
      this.handleRemoveRowModal(state)
      setTimeout(() => {
        this.setState({ rowInfo: item })
      }, 200)
    }
  }

  handleRemoveRowFromListModal = (state) => this.setState({ removeRowFromListModalOpen: state })

  handleRemoveItemFromListModalCb = (item, state, closeEditPopModalOpen) => {
    if (closeEditPopModalOpen) {
      this.handleEditOptionModal(false)
    }
    if (state) {
      this.setState({ rowInfo: item })
      this.handleRemoveRowFromListModal(state)
    } else {
      this.handleRemoveRowFromListModal(state)
      setTimeout(() => {
        this.setState({ rowInfo: item })
      }, 20)
    }
  }

  removeItemFromList = (item, type) => {
    bankMatchDeleteApi.post({
      body: {
        companyAccountId: item.companyAccountId,
        bankTransIds: [item.bankTransId],
      },
    })
      .then(data => {
        this.handleRemoveRowFromListModal(false)
        setTimeout(() => {
          this.setState({ rowInfo: null })
          this.getScreenData()
        }, 20)
      })
      .catch(() => {
        this.handleRemoveRowFromListModal(false)
        setTimeout(() => {
          this.setState({ rowInfo: null })
        }, 20)
      })
  }

  removeItem = (item, type) => {
    const pathMain = (!type) ? 'payments' : 'cyclic-trans'
    new Api({ endpoint: `${pathMain}/cfl/${item.targetTypeName}/delete` }).post({
      body: {
        companyAccountId: item.companyAccountId,
        transId: item.kvuotUnionId ? item.kvuotUnionId : ((type) ? item.transId : item.targetId),
        dateFrom: item.dateFrom,
      },
    })
      .then(data => {
        this.handleRemoveRowModalCb(null, false)
        this.getScreenData()
      })
      .catch(() => this.handleRemoveRowModalCb(null, false))
  }

  matchRestart = () => {
    matchRestartApi.post({
      body: {
        companyAccountId: this.state.selectedAccountIds[0],
        restartDaysLeft: this.state.timesValue,
      },
    })
      .then(data => {
        this.handleShowAlertMoreThanFiftyModal(false)
        this.getScreenData()
      })
      .catch(() => this.handleShowAlertMoreThanFiftyModal(false))
  }

  handleEditOptionModal = (state) => this.setState({ editPopModalOpen: state })

  handleEditOptionModalCb = (item, state, banktransForMatchData) => {
    if (banktransForMatchData !== null) {
      item.banktransForMatchData = banktransForMatchData
    }
    if (state) {
      this.setState({ rowInfo: item })
      this.handleEditOptionModal(state)
    } else {
      this.handleEditOptionModal(state)
      setTimeout(() => {
        this.setState({ rowInfo: item })
      }, 20)
    }
  }

  updateFromBankmatch = (item, targetOriginalDate) => {
    new Api({ endpoint: `payments/cfl/${item.targetTypeName}/update-from-bankmatch` }).post({
      body: {
        companyAccountId: item.companyAccountId,
        dateFrom: item.dateFrom,
        dateTill: item.dateTill,
        expence: item.expence,
        hovAvar: item.hovAvar,
        isMatchable: item.isMatchable,
        paymentDesc: item.paymentDesc,
        snoozeDate: item.snoozeDate,
        targetAsmachta: item.targetAsmachta,
        targetId: item.targetId,
        targetName: item.targetName,
        targetOriginalDate: targetOriginalDate,
        targetOriginalTotal: item.targetOriginalTotal,
        targetTypeId: item.targetTypeId,
        targetTypeName: item.targetTypeName,
        transId: item.transId,
        transTypeId: item.transTypeId,
      },
    })
      .then(data => {
        this.handleEditOptionModalCb(null, false, null)
        this.getScreenData()
      })
      .catch(() => this.handleEditOptionModalCb(null, false, null))
  }

  updateRow = (reload, item) => {
    if (reload || !item) {
      this.setState({ editRowModalOpen: false })
      if (reload) {
        this.getScreenData()
      }
    } else {
      let cashflowMatchForMatchStateArr = JSON.parse(JSON.stringify(this.state.cashflowMatchDataState))
      const indexToEdit = cashflowMatchForMatchStateArr.findIndex(element => element.targetId === item.targetId)
      Object.assign(cashflowMatchForMatchStateArr[indexToEdit], item)
      this.setState({
        editRowModalOpen: false,
        cashflowMatchDataState: cashflowMatchForMatchStateArr,
      })
    }
  }

  createPaymentNew = (item) => {
    this.handleEditOptionModal(false)

    const {
      currentCompanyId,
    } = this.props

    this.setState({
      openModalCreateEditTransaction: true,
      dataTransaction: {
        mutavArray: item.mutavArray,
        targetType: 'CYCLIC_TRANS',
        timesValue: 0,
        bankTransIds: [item.bankTransId],
        endDate: 'none',
        type: 'createRecommendationApi',
        autoUpdateTypeName: 'AVG_3_MONTHS',
        companyAccountId: item.companyAccountId,
        companyId: currentCompanyId,
        expence: item.hova,
        expirationDate: AppTimezone.moment().valueOf(),
        paymentDesc: item.paymentDesc,
        total: item.total,
        asmachta: item.asmachta,
        transDate: item.transDate,
        transFrequencyName: 'MONTH',
        transName: item.transDescAzonly,
        transTypeId: {
          companyId: '00000000-0000-0000-0000-000000000000',
          createDefaultSupplier: true,
          iconType: 'No category',
          shonaScreen: true,
          transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
          transTypeName: 'ללא קטגוריה 1',
        },
      },
    })
  }

  removeFromMatches = (item, isBanktransForMatchData) => {
    const { banktransForMatchDataState, cashflowMatchDataState, banktransForMatchForMatch, cashflowMatchForMatch } = this.state
    const {
      cashflowMatchData,
    } = this.props
    if (isBanktransForMatchData) {
      let banktransForMatchForMatchArr = JSON.parse(JSON.stringify(banktransForMatchForMatch))
      const indexToDelete = banktransForMatchForMatchArr.findIndex(element => element.bankTransId === item.bankTransId)
      banktransForMatchForMatchArr.splice(indexToDelete, 1)

      let banktransForMatchDataStateArr = JSON.parse(JSON.stringify(banktransForMatchDataState))
      banktransForMatchDataStateArr.push(item)
      banktransForMatchDataStateArr.sort((a, b) => a.idx - b.idx)

      const objectTypePaymentDesc = {}
      banktransForMatchForMatchArr.forEach((thisItem) => {
        objectTypePaymentDesc[thisItem.paymentDesc] = thisItem.paymentDesc
      })
      const typePaymentDesc = Object.values(objectTypePaymentDesc)
      let arrContainer = []
      typePaymentDesc.forEach((type) => {
        arrContainer = arrContainer.concat(banktransForMatchDataStateArr.filter((items) => items.paymentDesc === type))
      })
      banktransForMatchDataStateArr = arrContainer.concat(banktransForMatchDataStateArr.filter((type) => typePaymentDesc.every((row) => row !== type.paymentDesc)))

      const objectTypeExpece = {}
      banktransForMatchForMatchArr.forEach((thisItem) => {
        objectTypeExpece[thisItem.hova] = thisItem.hova
      })
      const typeExpece = Object.values(objectTypeExpece)
      const objectIdsExist = {}
      let cashflowMatchForMatchTemp = cashflowMatchForMatch
      if (typeExpece.length) {
        cashflowMatchForMatchTemp = cashflowMatchForMatch.filter((it) => {
          return (typeExpece.some((row) => row === it.expence))
        })
      }
      cashflowMatchForMatchTemp.forEach((thisItem) => {
        objectIdsExist[thisItem.targetId] = thisItem.targetId
      })
      const typeIdsExist = Object.values(objectIdsExist)
      let cashflowMatchDataOrigin = JSON.parse(JSON.stringify(cashflowMatchData))
      if (typeExpece.length && typeIdsExist.length) {
        cashflowMatchDataOrigin = cashflowMatchDataOrigin.filter((it) => {
          return ((typeExpece.some((row) => row === it.expence)) && (typeIdsExist.every((row) => row !== row.targetId)))
        })
      }

      let arrContainerCash = []
      typePaymentDesc.forEach((type) => {
        arrContainerCash = arrContainerCash.concat(cashflowMatchDataOrigin.filter((items) => items.paymentDesc === type))
      })
      cashflowMatchDataOrigin = arrContainerCash.concat(cashflowMatchDataOrigin.filter((type) => typePaymentDesc.every((row) => row !== type.paymentDesc)))

      this.setState({
        banktransForMatchForMatch: banktransForMatchForMatchArr,
        banktransForMatchDataState: banktransForMatchDataStateArr,
        cashflowMatchDataState: cashflowMatchDataOrigin,
        cashflowMatchForMatch: cashflowMatchForMatchTemp,
      })
    } else {
      let cashflowMatchForMatchArr = JSON.parse(JSON.stringify(cashflowMatchForMatch))
      const indexToDelete = cashflowMatchForMatchArr.findIndex(element => element.targetId === item.targetId)
      cashflowMatchForMatchArr.splice(indexToDelete, 1)

      let cashflowMatchForMatchStateArr = JSON.parse(JSON.stringify(cashflowMatchDataState))
      cashflowMatchForMatchStateArr.push(item)
      cashflowMatchForMatchStateArr.sort((a, b) => a.idx - b.idx)

      this.setState({
        cashflowMatchForMatch: cashflowMatchForMatchArr,
        cashflowMatchDataState: cashflowMatchForMatchStateArr,
      })
    }

    if (this.props.isRtl) {
      setTimeout(() => {
        if (this.scrollView && this.scrollView._component) {
          this.scrollView._component.scrollToEnd({ animated: true })
        }
        if (this.scrollViewTop && this.scrollViewTop._component) {
          this.scrollViewTop._component.scrollTo({ animated: true, x: 0 })
        }
      }, 10)
    }
  }

  _renderItem = ({ item, index }) => {
    const {
      isRtl,
      t,
    } = this.props
    const { isShake } = this.state
    return (
      <CardMatch
        shakeAll={this.handleIsShake}
        isShake={isShake}
        removeFromMatches={this.removeFromMatches}
        isRtl={isRtl}
        t={t}
        index={index}
        banktransForMatchData
        item={item}
      />
    )
  }

  _renderItemCash = ({ item, index }) => {
    const {
      isRtl,
      t,
    } = this.props
    const { isShake } = this.state
    return (
      <CardMatch
        shakeAll={this.handleIsShake}
        isShake={isShake}
        removeFromMatches={this.removeFromMatches}
        isRtl={isRtl}
        t={t}
        index={index}
        banktransForMatchData={false}
        item={item}
      />
    )
  }

  removeMatch = () => {
    const {
      cashflowMatchData,
      banktransForMatchData,
    } = this.props

    this.setState({
      banktransForMatchForMatch: [],
      cashflowMatchForMatch: [],
      cashflowMatchDataState: JSON.parse(JSON.stringify(cashflowMatchData)),
      banktransForMatchDataState: JSON.parse(JSON.stringify(banktransForMatchData)),
    })
    if (this.props.isRtl) {
      setTimeout(() => {
        if (this.scrollView && this.scrollView._component) {
          this.scrollView._component.scrollToEnd({ animated: true })
        }
        if (this.scrollViewTop && this.scrollViewTop._component) {
          this.scrollViewTop._component.scrollTo({ animated: true, x: 0 })
        }
      }, 10)
    }
  }

  matchAll = () => {
    const { banktransForMatchForMatch, cashflowMatchForMatch } = this.state
    let matchList
    const { currentCompanyId } = this.props
    if (cashflowMatchForMatch.length === 1 && banktransForMatchForMatch.length === 1) {
      matchList = {
        'array': [{
          'targetOriginalTotal': cashflowMatchForMatch[0].targetOriginalTotal,
          'targetOriginalDate': cashflowMatchForMatch[0].targetOriginalDate,
          source: banktransForMatchForMatch[0].source ? banktransForMatchForMatch[0].source : null,
          biziboxMutavId: banktransForMatchForMatch[0].biziboxMutavId ? banktransForMatchForMatch[0].biziboxMutavId : (banktransForMatchForMatch[0].mutavArray && banktransForMatchForMatch[0].mutavArray[0].biziboxMutavId) ? banktransForMatchForMatch[0].mutavArray[0].biziboxMutavId : null,
          'bankTransId': banktransForMatchForMatch[0].bankTransId,
          'dateFrom': cashflowMatchForMatch[0].dateFrom,
          'dateTill': cashflowMatchForMatch[0].dateTill,
          'hovAvar': cashflowMatchForMatch[0].hovAvar,
          'targetId': cashflowMatchForMatch[0].targetId,
          'targetName': cashflowMatchForMatch[0].targetName,
          'targetPaymentTypeId': cashflowMatchForMatch[0].targetPaymentTypeId,
          'targetTypeId': cashflowMatchForMatch[0].targetTypeId,
          'transId': cashflowMatchForMatch[0].transId,
          'transTypeId': cashflowMatchForMatch[0].transTypeId,
          'searchkeyId': banktransForMatchForMatch[0].searchkeyId ? banktransForMatchForMatch[0].searchkeyId : null,
        }],
        'companyId': currentCompanyId,
      }
    } else if (cashflowMatchForMatch.length > 1 && banktransForMatchForMatch.length === 1) {
      matchList = {
        'array': cashflowMatchForMatch.map((rows) => {
          return {
            'targetOriginalTotal': rows.targetOriginalTotal,
            'targetOriginalDate': rows.targetOriginalDate,
            source: banktransForMatchForMatch[0].source ? banktransForMatchForMatch[0].source : null,
            biziboxMutavId: banktransForMatchForMatch[0].biziboxMutavId ? banktransForMatchForMatch[0].biziboxMutavId : (banktransForMatchForMatch[0].mutavArray && banktransForMatchForMatch[0].mutavArray[0].biziboxMutavId) ? banktransForMatchForMatch[0].mutavArray[0].biziboxMutavId : null,
            'bankTransId': banktransForMatchForMatch[0].bankTransId,
            'dateFrom': rows.dateFrom,
            'dateTill': rows.dateTill,
            'hovAvar': rows.hovAvar,
            'targetId': rows.targetId,
            'targetName': rows.targetName,
            'targetPaymentTypeId': rows.targetPaymentTypeId,
            'targetTypeId': rows.targetTypeId,
            'transId': rows.transId,
            'transTypeId': rows.transTypeId,
            'searchkeyId': banktransForMatchForMatch[0].searchkeyId ? banktransForMatchForMatch[0].searchkeyId : null,
          }
        }),
        'companyId': currentCompanyId,
      }
    } else if (cashflowMatchForMatch.length === 1 && banktransForMatchForMatch.length > 1) {
      matchList = {
        'array': banktransForMatchForMatch.map((rows) => {
          return {
            'searchkeyId': rows.searchkeyId ? rows.searchkeyId : null,
            'targetOriginalTotal': cashflowMatchForMatch[0].targetOriginalTotal,
            'targetOriginalDate': cashflowMatchForMatch[0].targetOriginalDate,
            source: rows.source ? rows.source : null,
            biziboxMutavId: rows.biziboxMutavId ? rows.biziboxMutavId : (rows.mutavArray && rows.mutavArray[0].biziboxMutavId) ? rows.mutavArray[0].biziboxMutavId : null,
            'bankTransId': rows.bankTransId,
            'dateFrom': cashflowMatchForMatch[0].dateFrom,
            'dateTill': cashflowMatchForMatch[0].dateTill,
            'hovAvar': cashflowMatchForMatch[0].hovAvar,
            'targetId': cashflowMatchForMatch[0].targetId,
            'targetName': cashflowMatchForMatch[0].targetName,
            'targetPaymentTypeId': cashflowMatchForMatch[0].targetPaymentTypeId,
            'targetTypeId': cashflowMatchForMatch[0].targetTypeId,
            'transId': cashflowMatchForMatch[0].transId,
            'transTypeId': cashflowMatchForMatch[0].transTypeId,
          }
        }),
        'companyId': currentCompanyId,
      }
    }
    if (matchList) {
      if (cashflowMatchForMatch.length > 1 && banktransForMatchForMatch.length === 1) {
        const periodicTypes = ['CYCLIC_TRANS', 'SOLEK_TAZRIM', 'CCARD_TAZRIM', 'LOAN_TAZRIM', 'DIRECTD', 'CASH']
        this.setState({
          cashflowMatchPopup: {
            matchList: matchList,
            banktransRow: banktransForMatchForMatch[0],
            table: matchList.array.map((it) => {
              const rowCash = cashflowMatchForMatch.find((item) => item.transId === it.transId)
              it.isPeriodicType = periodicTypes.includes(rowCash.targetTypeName)
              it.paymentDesc = rowCash.paymentDesc
              it.userMatchTotal = rowCash.targetOriginalTotal
              it.targetTypeName = rowCash.targetTypeName
              return it
            }),
          },
        }, () => {
          this.calcSumTotals()
        })
      } else {
        this.setState({
          matchPeulot: true,
        })
        setTimeout(() => {
          if (this.state.matchPeulot) {
            bankMatchApi.post({ body: matchList })
              .then(() => {
                this.cancelMatch()
                this.getScreenData()
              })
              .catch(() => {
                this.cancelMatch()
                this.getScreenData()
              })
          } else {
            this.cancelMatch()
          }
        }, 2500)
      }
    } else {
      this.cancelMatch()
    }
  }
  calcSumTotals = () => {
    const { cashflowMatchPopup } = this.state
    const cashflowMatchPopupSave = Object.assign({}, cashflowMatchPopup)
    cashflowMatchPopupSave.sumTotals = cashflowMatchPopupSave.table.reduce((total, item) => total + Number(item.userMatchTotal), 0)
    this.setState({
      cashflowMatchPopup: cashflowMatchPopupSave,
    })
  }
  closeCashflowMatchPopup = () => {
    this.setState({
      cashflowMatchPopup: false,
    })
    this.cancelMatch()
    this.removeMatch()
  }
  updateStateCashflowMatchPopup = (cashflowMatchPopup) => {
    this.setState({
      cashflowMatchPopup,
    }, () => {
      this.calcSumTotals()
    })
  }
  bankMatchSubmit = () => {
    const { cashflowMatchPopup } = this.state
    const cashflowMatchPopupSave = Object.assign({}, cashflowMatchPopup)
    if (cashflowMatchPopupSave.table.some(row => (row.userMatchTotal === null || row.userMatchTotal === ''))) {
      return
    }
    const cashData = JSON.parse(JSON.stringify(cashflowMatchPopupSave.table))
    cashData.forEach((it) => {
      delete it.isPeriodicType
      delete it.paymentDesc
      delete it.targetTypeName
      it.userMatchTotal = Number(it.userMatchTotal) === it.targetOriginalTotal ? it.targetOriginalTotal : Number(it.userMatchTotal)
    })
    cashflowMatchPopupSave.matchList.array = cashData
    this.setState({
      cashflowMatchPopup: false,
      matchPeulot: true,
    })
    setTimeout(() => {
      if (this.state.matchPeulot) {
        bankMatchApi.post({ body: cashflowMatchPopupSave.matchList })
          .then(() => {
            this.cancelMatch()
            this.getScreenData()
          })
          .catch(() => {
            this.cancelMatch()
            this.getScreenData()
          })
      } else {
        this.cancelMatch()
      }
    }, 2500)
  }

  cancelMatch = () => {
    this.setState({
      matchPeulot: false,
    })
  }
  handleSetRef = (ref) => {
    this.listRef = ref
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
        currentOpenItemIndex: null,
      })
    }
  }

  openBottomSheet = () => {
    this.listRef.snapTo({ index: 1 })
  }

  close = () => {
    this.listRef.snapTo({ index: 2 })
  }

  pressItem = (type, item) => {
    const { banktransForMatchDataState, cashflowMatchDataState, banktransForMatchForMatch, cashflowMatchForMatch } = this.state
    const {
      cashflowMatchData,
    } = this.props

    const setOfCashflowMatchMarked = [...cashflowMatchForMatch]
      .reduce((acmltr, tr) => {
        return [tr.biziboxMutavId, ...(tr.mutavArray ? tr.mutavArray.map(mt => mt.biziboxMutavId) : [])]
          .filter(mtvId => !!mtvId)
          .reduce((acmltr0, mtvId) => acmltr0.add(mtvId), acmltr)
      }, new Set())
    const setOfBanktransForMatchMarked = [...banktransForMatchForMatch]
      .reduce((acmltr, tr) => {
        return [tr.biziboxMutavId, ...(tr.mutavArray ? tr.mutavArray.map(mt => mt.biziboxMutavId) : [])]
          .filter(mtvId => !!mtvId)
          .reduce((acmltr0, mtvId) => acmltr0.add(mtvId), acmltr)
      }, new Set())
    if (setOfCashflowMatchMarked.size && setOfBanktransForMatchMarked.size) {
      const selectedUniqueBeneficiaryKeys =
        new Set(Array.from(setOfCashflowMatchMarked).concat(Array.from(setOfBanktransForMatchMarked)))
      if (selectedUniqueBeneficiaryKeys.size) {
        this.openBottomSheet()
        return
      }
    }

    // if (item.biziboxMutavId || (item.mutavArray && Array.isArray(item.mutavArray) && item.mutavArray.length && item.mutavArray[0].biziboxMutavId)) {
    //   if (item.biziboxMutavId) {
    //     const biziboxMutavId = item.biziboxMutavId
    //
    //     if (type) {
    //       const filterOfCashflowMutavDif = cashflowMatchForMatch.filter((it) => {
    //         if ((it.biziboxMutavId && it.biziboxMutavId !== biziboxMutavId) ||
    //           (it.mutavArray && Array.isArray(it.mutavArray) && it.mutavArray.length && it.mutavArray[0].biziboxMutavId !== biziboxMutavId)) {
    //           return it
    //         }
    //       })
    //       if (filterOfCashflowMutavDif.length) {
    //         this.openBottomSheet()
    //         return
    //       }
    //     } else {
    //       const filterOfBanktransflowMutavDif = banktransForMatchForMatch.filter((it) => {
    //         if ((it.biziboxMutavId && it.biziboxMutavId !== biziboxMutavId) ||
    //           (it.mutavArray && Array.isArray(it.mutavArray) && it.mutavArray.length && it.mutavArray[0].biziboxMutavId !== biziboxMutavId)) {
    //           return it
    //         }
    //       })
    //       if (filterOfBanktransflowMutavDif.length) {
    //         this.openBottomSheet()
    //         return
    //       }
    //     }
    //   } else {
    //     const biziboxMutavId = item.mutavArray[0].biziboxMutavId
    //     if (biziboxMutavId) {
    //       if (type) {
    //         const filterOfCashflowMutavDif = cashflowMatchForMatch.filter((it) => {
    //           if ((it.biziboxMutavId && it.biziboxMutavId !== biziboxMutavId) ||
    //             (it.mutavArray && Array.isArray(it.mutavArray) && it.mutavArray.length && it.mutavArray[0].biziboxMutavId !== biziboxMutavId)) {
    //             return it
    //           }
    //         })
    //         if (filterOfCashflowMutavDif.length) {
    //           this.openBottomSheet()
    //           return
    //         }
    //       } else {
    //         const filterOfBanktransflowMutavDif = banktransForMatchForMatch.filter((it) => {
    //           if ((it.biziboxMutavId && it.biziboxMutavId !== biziboxMutavId) ||
    //             (it.mutavArray && Array.isArray(it.mutavArray) && it.mutavArray.length && it.mutavArray[0].biziboxMutavId !== biziboxMutavId)) {
    //             return it
    //           }
    //         })
    //         if (filterOfBanktransflowMutavDif.length) {
    //           this.openBottomSheet()
    //           return
    //         }
    //       }
    //     }
    //   }
    // }

    if (type) {
      if (cashflowMatchForMatch.length < 2 || banktransForMatchForMatch.length === 0) {
        let banktransForMatchForMatchArr = JSON.parse(JSON.stringify(banktransForMatchForMatch))
        banktransForMatchForMatchArr.push(item)

        const objectTypePaymentDesc = {}
        banktransForMatchForMatchArr.forEach((thisItem) => {
          objectTypePaymentDesc[thisItem.paymentDesc] = thisItem.paymentDesc
        })
        const typePaymentDesc = Object.values(objectTypePaymentDesc)

        let banktransForMatchDataStateArr = JSON.parse(JSON.stringify(banktransForMatchDataState))
        const indexToDelete = banktransForMatchDataStateArr.findIndex(element => element.bankTransId === item.bankTransId)
        banktransForMatchDataStateArr.splice(indexToDelete, 1)

        let arrContainer = []
        typePaymentDesc.forEach((types) => {
          arrContainer = arrContainer.concat(banktransForMatchDataStateArr.filter((items) => items.paymentDesc === types))
        })
        banktransForMatchDataStateArr = arrContainer.concat(banktransForMatchDataStateArr.filter((types) => typePaymentDesc.every((row) => row !== types.paymentDesc)))

        const objectTypeExpece = {}
        banktransForMatchForMatchArr.forEach((thisItem) => {
          objectTypeExpece[thisItem.hova] = thisItem.hova
        })
        const typeExpece = Object.values(objectTypeExpece)
        const objectIdsExist = {}
        const cashflowMatchForMatchTemp = cashflowMatchForMatch.filter((it) => {
          return (typeExpece.some((row) => row === it.expence))
        })
        cashflowMatchForMatchTemp.forEach((thisItem) => {
          objectIdsExist[thisItem.targetId] = thisItem.targetId
        })
        const typeIdsExist = Object.values(objectIdsExist)
        const cashflowMatchDataOrigin = JSON.parse(JSON.stringify(cashflowMatchData))

        let cashflowMatchDataStateArr = cashflowMatchDataOrigin.filter((it) => {
          return (typeExpece.some((row) => row === it.expence) && typeIdsExist.every((row) => row !== row.targetId))
        })

        let arrContainerCash = []
        typePaymentDesc.forEach((types) => {
          arrContainerCash = arrContainerCash.concat(cashflowMatchDataStateArr.filter((items) => items.paymentDesc === types))
        })
        cashflowMatchDataStateArr = arrContainerCash.concat(cashflowMatchDataStateArr.filter((types) => typePaymentDesc.every((row) => row !== types.paymentDesc)))

        this.setState({
          banktransForMatchForMatch: banktransForMatchForMatchArr,
          banktransForMatchDataState: banktransForMatchDataStateArr,
          cashflowMatchDataState: cashflowMatchDataStateArr,
          cashflowMatchForMatch: cashflowMatchForMatchTemp,
        })
      }
    } else {
      if (banktransForMatchForMatch.length < 2 || cashflowMatchForMatch.length === 0) {
        let cashflowMatchForMatchArr = JSON.parse(JSON.stringify(cashflowMatchForMatch))
        cashflowMatchForMatchArr.push(item)

        let cashflowMatchForMatchStateArr = JSON.parse(JSON.stringify(cashflowMatchDataState))
        const indexToDelete = cashflowMatchForMatchStateArr.findIndex(element => element.targetId === item.targetId)
        cashflowMatchForMatchStateArr.splice(indexToDelete, 1)

        this.setState({
          cashflowMatchForMatch: cashflowMatchForMatchArr,
          cashflowMatchDataState: cashflowMatchForMatchStateArr,
        })
      }
    }

    setTimeout(() => {
      if (this.scrollView && this.scrollView._component) {
        if (this.props.isRtl) {
          this.scrollView._component.scrollToEnd({ animated: true })
        } else {
          this.scrollView._component.scrollTo({ animated: true, x: 0 })
        }
      }
      if (this.scrollViewTop && this.scrollViewTop._component) {
        if (this.props.isRtl) {
          this.scrollViewTop._component.scrollTo({ animated: true, x: 0 })
        } else {
          this.scrollViewTop._component.scrollToEnd({ animated: true })
        }
      }
    }, 10)
  }

  createEditTransaction = (data) => {
    let expirationDate = null
    if (data.endDate !== 'none') {
      if (data.endDate === 'times') {
        const cycle = Number(data.timesValue) - 1
        if (AppTimezone.moment(data.transDate).isSameOrAfter(AppTimezone.moment().valueOf())) {
          if (data.transFrequencyName === 'TWO_MONTHS') {
            expirationDate = AppTimezone.moment(data.transDate).add((Number(cycle + 1) * 2), 'month').valueOf()
          } else {
            let units = data.transFrequencyName.toLowerCase()
            expirationDate = AppTimezone.moment(data.transDate).add(Number(cycle), units).valueOf()
          }
        } else {
          let i = 0
          while (AppTimezone.moment(AppTimezone.moment(data.transDate).add((Number((data.transFrequencyName === 'TWO_MONTHS') ? i * 2 : i)), (data.transFrequencyName === 'TWO_MONTHS') ? 'month' : data.transFrequencyName.toLowerCase()).valueOf()).isSameOrBefore(AppTimezone.moment().valueOf())) {
            if (AppTimezone.moment(AppTimezone.moment(data.transDate).add((Number((data.transFrequencyName === 'TWO_MONTHS') ? i * 2 : i)), (data.transFrequencyName === 'TWO_MONTHS') ? 'month' : data.transFrequencyName.toLowerCase()).valueOf()).isSameOrBefore(AppTimezone.moment().valueOf())) {
              i++
              expirationDate = AppTimezone.moment(data.transDate).add((Number((data.transFrequencyName === 'TWO_MONTHS') ? (i * 2) + cycle : i + cycle)), (data.transFrequencyName === 'TWO_MONTHS') ? 'month' : data.transFrequencyName.toLowerCase()).valueOf()
            }
          }
        }
      } else if (data.endDate === 'on') {
        expirationDate = data.expirationDate
      }
    }

    // const params = {
    //   autoUpdateTypeName: data.autoUpdateTypeName,
    //   companyAccountId: data.companyAccountId,
    //   expence: data.expence,
    //   expirationDate: expirationDate,
    //   paymentDesc: data.paymentDesc,
    //   targetType: data.targetType,
    //   total: Math.abs(Number(data.total)),
    //   transDate: data.transDate,
    //   transFrequencyName: data.transFrequencyName,
    //   transName: data.transName,
    //   transTypeId: data.transTypeId.transTypeId,
    //   asmachta: data.asmachta,
    //   companyId: data.companyId,
    //   bankTransIds: data.bankTransIds,
    // }
    // // console.log(JSON.stringify(params))
    // approveRecommendationApi.post({
    //   body: params,
    // })
    //   .then(data => {
    //     this.setState({ openModalCreateEditTransaction: false, dataTransaction: {} })
    //     this.getScreenData()
    //   })
    //   .catch((aaa) => {
    //     this.setState({ openModalCreateEditTransaction: false, dataTransaction: {} })
    //   })
    //

    const mutavArray = (data.mutavArray.length === 1 && data.mutavArray[0].biziboxMutavId === null)
      ? []
      : data.mutavArray.map((item) => {
        return {
          accountMutavName: item.accountMutavName,
          biziboxMutavId: item.biziboxMutavId,
          // total: item.total,
          // transTypeId: item.transTypeId.transTypeId,
        }
      })
    const params = {
      bankTransIds: data.bankTransIds,
      autoUpdateTypeName: data.autoUpdateTypeName,
      companyAccountId: data.companyAccountId,
      companyId: data.companyId,
      expence: data.expence,
      expirationDate: expirationDate,
      mutavArray: mutavArray,
      paymentDesc: data.paymentDesc,
      total: Math.abs(Number(data.total)),
      transDate: data.transDate,
      transFrequencyName: data.transFrequencyName,
      transName: data.transName,
      transTypeId: data.transTypeId.transTypeId,
      frequencyDay: data.frequencyDay,
      lastBankDate: data.lastBankDate,
      lastBankTotal: data.lastBankTotal,
    }
    if (params.transFrequencyName === 'WEEK' && params.transDate) {
      params.frequencyDay = (AppTimezone.moment(params.transDate).format('dddd')).toUpperCase()
    }
    if (params.transFrequencyName === 'MONTH' && params.transDate) {
      params.frequencyDay = AppTimezone.moment(params.transDate).format('D')
    }
    // new Api({ endpoint: `cyclic-trans/cfl/create` }).post({
    approveRecommendationApi.post({
      body: params,
    })
      .then(() => {
        // if (mutavArray.length) {
        //   for (let i = 0; i < mutavArray.length; i++) {
        //     updateMutavCategoryApi.post({
        //       body: {
        //         biziboxMutavId: mutavArray[i].biziboxMutavId,
        //         companyId: data.companyId,
        //         transId: null,
        //         transTypeId: mutavArray[i].transTypeId,
        //         updateType: 'future',
        //       },
        //     })
        //   }
        // }

        this.setState({ openModalCreateEditTransaction: false, dataTransaction: {} })
        this.getScreenData()
      })
      .catch(() => {
        this.setState({ openModalCreateEditTransaction: false, dataTransaction: {} })
      })
  }

  closeModalCreateEditTransaction = () => {
    this.setState({ openModalCreateEditTransaction: false, dataTransaction: {} })
  }

  openAlert = () => {
    this.setState({ showAlert: true })

    Animated.timing(
      this.state.fadeAnim,
      {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      },
    ).start()
  }

  handleIsShake = (state) => this.setState({ isShake: state })

  _onPressNumber = (value) => {
    this.setState({ timesValue: value })
  }

  handleIsShakeMain = (state) => () => {
    const {
      isShake,
    } = this.state
    if (isShake) {
      this.handleIsShake(state)
    }
  }

  animatedTime = (type) => () => {
    const {
      fadeAnim,
    } = this.state
    Animated.timing(
      fadeAnim,
      {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      },
    ).start(() => {
      this.setState(type)
    })
  }

  componentWillUnmount () {
    if(BackHandler && BackHandler.removeEventListener){
      BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    }
  }

  handleBackPress = () => {
    this.props.dispatch(setOpenedBottomSheet(false))
    goToBack( this.props.navigation)
    return true
  }

  _onRefresh = () => {
    this.getScreenData()
  }

  render () {
    const {
      t,
      isRtl,
      accountGroups,
      accounts,
      currentCompanyId,
      bankMatchAccounts,
      banktransForMatchData,
      cashflowMatchData,
      navigation,
    } = this.props

    const {
      isReady,
      selectedAccountIds,
      selectedGroup,
      accountsModalIsOpen,
      alertYPosition,
      queryStatus,
      adjustableMovementsScreen,
      adjustableMovementsWidth,
      adjustedMovementsScreenWidth,
      inProgress,
      removeRowModalOpen,
      cashflowMatchPopup,
      removeRowFromListModalOpen,
      rowInfo,
      editPopModalOpen,
      editRowModalOpen,
      banktransForMatchDataState,
      cashflowMatchDataState,
      banktransForMatchForMatch,
      cashflowMatchForMatch,
      dataTransaction,
      openModalCreateEditTransaction,
      showAlert,
      fadeAnim,
      isShake,
      showAlertMoreThanFifty,
      matchPeulot,
      categories,
      currentOpenItemIndex,
    } = this.state

    if (!isReady || inProgress) {return <Loader />}

    return (
      <View style={commonStyles.mainContainer}>
        <AlertsTrial onlyShowPopUp navigation={navigation}
                     refresh={this._onRefresh}
                     updateToken={this.props.globalParams.updateToken}/>

        <Animated.ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          extraData={this.state.refreshing}
          nestedScrollEnabled
          scrollEnabled
          style={[styles.contentContainer, {
            flex: 1,
          }]}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[{
            backgroundColor: colors.white,
            width: '100%',
            marginTop: 0,
            paddingBottom: 0,
            flexGrow: 1,
          }]}
          onScroll={
            Animated.event([{ nativeEvent: { contentOffset: { y: this.state.scrollAnim } } }],
              {
                useNativeDriver: true,
              })}>
          {adjustableMovementsScreen && (banktransForMatchData || cashflowMatchData) && (
            <TouchableWithoutFeedback
              onPress={this.handleIsShakeMain(false)}
            >
              <View style={{
                flexGrow: 1,
                flex: 1,
              }}>
                <Animated.ScrollView
                  style={styles.accountsContainer}
                  contentContainerStyle={[styles.tableWrapper, {
                    flexGrow: 1,
                    marginTop: this.headerMinHeightCalc,
                    paddingBottom: 0,
                    overflow: 'hidden',
                  }]}
                  ref={scrollViewMain => (this.scrollViewMain = scrollViewMain)}
                  scrollEventThrottle={1}
                  onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { y: this.scrollY } } }],
                    { useNativeDriver: true },
                  )}>
                  <View style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    {showAlert && (
                      <Animated.View style={{
                        opacity: fadeAnim,
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        left: 0,
                        top: 0,
                        zIndex: 9,
                        height: '100%',
                        width: '100%',
                        flexDirection: 'row',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
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
                          onPress={this.animatedTime({ showAlert: false })} />
                        <View style={{
                          height: 98,
                          width: 348,
                          backgroundColor: '#ffffff',
                          borderRadius: 15,
                          zIndex: 10,
                          shadowColor: '#a0a0a0',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 2,
                          paddingHorizontal: 20,
                          paddingVertical: 8,
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <TouchableOpacity
                            style={{
                              alignSelf: 'flex-start',
                            }}
                            onPress={this.animatedTime({ showAlert: false })}>
                            <Icon
                              name="close"
                              type="material-community"
                              size={25}
                              color={'#022258'}
                            />
                          </TouchableOpacity>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(17),
                            lineHeight: 24,
                            fontFamily: fonts.regular,
                            textAlign: 'center',
                          }}>
                            תנועה זו תותאם באופן אוטומטי על ידי
                          </Text>
                          <View style={{
                            flexDirection: 'row-reverse',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            <Image style={{ width: 72.5, height: 17 }}
                              source={require('BiziboxUI/assets/logoBig.png')} />
                            <View style={{
                              paddingHorizontal: 2,
                            }} />
                            <Text style={{
                              color: '#0f3860',
                              fontSize: sp(17),
                              lineHeight: 24,
                              fontFamily: fonts.regular,
                            }}>{'כאשר תופיע בחשבון הבנק'}</Text>
                          </View>
                        </View>
                      </Animated.View>
                    )}

                    {showAlertMoreThanFifty && (
                      <Animated.View style={{
                        opacity: fadeAnim,
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        left: 0,
                        top: 0,
                        zIndex: 9,
                        height: '100%',
                        width: '100%',
                        flexDirection: 'row',
                        alignSelf: 'center',
                        justifyContent: 'center',
                        alignItems: 'center',
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
                          onPress={this.animatedTime({ showAlertMoreThanFifty: false })} />

                        <View style={{
                          height: 190,
                          width: 320,
                          backgroundColor: '#ffffff',
                          borderRadius: 15,
                          zIndex: 10,
                          shadowColor: '#a0a0a0',
                          shadowOffset: { width: 0, height: 0 },
                          shadowOpacity: 0.8,
                          shadowRadius: 4,
                          elevation: 2,
                          paddingHorizontal: 20,
                          paddingVertical: 8,
                          flexDirection: 'column',
                          alignItems: 'flex-end',
                          justifyContent: 'flex-start',
                        }}>

                          <TouchableOpacity
                            style={{
                              position: 'absolute',
                              left: 10,
                              zIndex: 9,
                              top: 10,
                            }}
                            onPress={this.animatedTime({ showAlertMoreThanFifty: false })}>
                            <Icon
                              name="close"
                              type="material-community"
                              size={25}
                              color={'#022258'}
                            />
                          </TouchableOpacity>

                          <Text style={{
                            color: '#229f88',
                            fontSize: sp(18.5),
                            lineHeight: 30,
                            fontFamily: fonts.semiBold,
                          }}>שימו לב</Text>

                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(14),
                            lineHeight: 20,
                            fontFamily: fonts.regular,
                            textAlign: 'right',
                          }}>
                            הצטברו
                            <Text style={{
                              color: '#0f3860',
                              fontSize: sp(14),
                              lineHeight: 20,
                              fontFamily: fonts.bold,
                            }}>
                              {' מעל 50 תנועות '}
                            </Text>
                            שהיו צפויות להתאמה
                            {'\n'}
                            לחשבון זה.
                          </Text>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(14),
                            lineHeight: 20,
                            fontFamily: fonts.regular,
                            textAlign: 'right',
                          }}>
                            תוכלו “לפתוח דף חדש” ולמחוק את הפריטים שלא
                            {'\n'}
                            הותאמו. המחיקה לא תשפיע על תנועות הבנק בפועל.
                          </Text>

                          <View style={{
                            width: '100%',
                            marginVertical: 5,
                            height: 1,
                            backgroundColor: '#dbdbdb',
                          }} />

                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(14),
                            lineHeight: 20,
                            fontFamily: fonts.regular,
                            textAlign: 'right',
                          }}>
                            מחיקת תנועות שלא הותאמו,
                          </Text>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignSelf: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'space-between',
                          }}>
                            <Text style={{
                              flex: 1,
                              color: '#0f3860',
                              fontSize: sp(14),
                              lineHeight: 20,
                              fontFamily: fonts.regular,
                              textAlign: 'right',
                            }}>
                              עד לפני
                            </Text>

                            <View style={{
                              paddingHorizontal: 12, flex: 1,
                            }}>
                              <NumericInput
                                value={this.state.timesValue}
                                onChange={this._onPressNumber}
                                totalWidth={90}
                                totalHeight={30}
                                iconSize={30}
                                step={1}
                                minValue={1}
                                valueType="real"
                                rounded
                                containerStyle={{
                                  borderWidth: 0,
                                  height: 30,
                                  backgroundColor: '#ffffff',
                                  borderRadius: 6,
                                  shadowColor: 'black',
                                  shadowOpacity: 0.1,
                                  shadowRadius: 0.5,
                                  shadowOffset: { width: 0, height: 1 },
                                  elevation: 4,
                                }}
                                inputStyle={{
                                  borderWidth: 0,
                                  height: 28,
                                  backgroundColor: '#ffffff',
                                }}
                                textColor="#0f3860"
                                iconStyle={{
                                  color: 'white',
                                  borderRadius: 40,
                                  fontSize: sp(20),
                                  lineHeight: 28,
                                }}
                                rightButtonBackgroundColor="#0addc1"
                                leftButtonBackgroundColor="#0addc1" /></View>

                            <Text style={{
                              flex: 1,
                              color: '#0f3860',
                              fontSize: sp(14),
                              lineHeight: 20,
                              fontFamily: fonts.regular,
                              textAlign: 'right',
                            }}>
                              ימים
                            </Text>

                            <TouchableOpacity
                              style={{
                                flex: 1,
                              }}
                              onPress={this.matchRestart}>
                              <View style={{
                                height: 30,
                                width: 70,
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
                                  fontSize: sp(16),
                                  fontFamily: fonts.semiBold,
                                  textAlign: 'center',
                                }}>
                                  מחיקה
                                </Text>
                              </View>
                            </TouchableOpacity>
                          </View>

                          <View style={{
                            width: '100%',
                            marginVertical: 5,
                            height: 1,
                          }} />

                        </View>
                      </Animated.View>
                    )}

                    <View style={{
                      paddingVertical: 10,
                      backgroundColor: '#d9e7ee',
                    }}>
                      <View style={{
                        flexDirection: 'row-reverse',
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                        height: 30,
                      }}>
                        <Image style={{ width: 20.5, height: 20.5 }}
                          source={require('BiziboxUI/assets/iconCircles.png')} />
                        <Text style={{
                          marginHorizontal: 5,
                          fontSize: sp(18),
                          color: '#021d4b',
                          fontFamily: fonts.semiBold,
                        }}>
                          {'תנועות בנק שלא צפיתי / לא הותאמו'}
                        </Text>
                      </View>
                      {(!banktransForMatchData || inProgress) && (
                        <View style={{ height: 106 }}><Loader
                          containerStyle={{ backgroundColor: '#d9e7ee' }}
                          isDefault /></View>)}
                      {banktransForMatchData && !banktransForMatchData.length && !inProgress && (
                        <View>
                          <Text style={{
                            color: '#022156',
                            fontFamily: fonts.regular,
                            fontSize: sp(14),
                            textAlign: 'center',
                            paddingVertical: 10,
                          }}>
                            {'■ לא קיימות תנועות בנק שלא צפיתי / לא הותאמו'}
                          </Text>
                        </View>
                      )}
                      {banktransForMatchData && banktransForMatchData.length > 0 && !inProgress && (
                        <Animated.ScrollView
                          ref={scrollViewTop => (this.scrollViewTop = scrollViewTop)}
                          showsHorizontalScrollIndicator={false}
                          horizontal
                          contentContainerStyle={{
                            flexDirection: (!isRtl) ? 'row-reverse' : 'row',
                            alignSelf: 'center',
                            zIndex: 999,
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            height: 91,
                            overflow: 'hidden',
                          }}>
                          {banktransForMatchDataState && banktransForMatchDataState.map((c, i) => {
                            return (
                              <Card
                                openAlert={this.openAlert}
                                isFirst={i === 0}
                                isLast={i + 1 === banktransForMatchDataState.length}
                                disabled={cashflowMatchForMatch.length > 1 && banktransForMatchForMatch.length > 0}
                                handleEditOptionModalCb={this.handleEditOptionModalCb}
                                handleRemoveRowModalCb={this.handleRemoveRowModalCb}
                                isRtl={isRtl}
                                t={t}
                                banktransForMatchData
                                key={i.toString()}
                                item={c}
                                pressItem={this.pressItem}
                              />
                            )
                          })}
                        </Animated.ScrollView>
                      )}
                    </View>

                    {!inProgress && !matchPeulot && (
                      <View
                        style={{
                          height: 206,
                          marginBottom: 4,
                          zIndex: 1,
                          backgroundColor: '#ffffff',
                          flexDirection: 'row-reverse',
                          justifyContent: 'center',
                        }}>
                        <View style={{
                          flex: 2.5,
                          flexDirection: 'row-reverse',
                          alignSelf: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'center',
                        }}>
                          {cashflowMatchForMatch.length > 0 && banktransForMatchForMatch.length > 0 && (
                            <TouchableOpacity
                              style={{}}
                              onPress={this.matchAll}>
                              <Icon
                                iconStyle={{
                                  shadowColor: '#dddddd',
                                  shadowOpacity: 0.2,
                                  shadowRadius: 0.6,
                                  shadowOffset: { width: 0.5, height: 0.3 },
                                  elevation: 4,
                                }}
                                name="check-circle"
                                type="material-community"
                                size={60}
                                color={'#0bddc1'}
                              />
                            </TouchableOpacity>
                          )}
                        </View>

                        <View style={{
                          flex: 7,
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignSelf: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#ffffff',
                            width: 203,
                            height: 100,
                          }}>
                            <View style={{
                              position: 'absolute',
                              left: 10,
                              top: 10,
                              zIndex: 1,
                              width: 188,
                              height: 86,
                              borderWidth: 1,
                              borderColor: '#0f3860',
                              borderRadius: 10,
                              borderStyle: IS_IOS ? 'dashed' : 'dotted',
                            }} />
                            {banktransForMatchForMatch.length > 0 && (
                              <View style={{
                                position: 'absolute',
                                right: 6,
                                top: 12,
                                zIndex: 999,
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: '#08d3b8',
                                flexDirection: 'row',
                                alignSelf: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'center',
                              }}>
                                <Text style={{
                                  color: '#ffffff',
                                  fontFamily: fonts.semiBold,
                                  fontSize: sp(12),
                                  textAlign: 'center',
                                }}>{banktransForMatchForMatch.length}</Text>
                              </View>
                            )}
                            <View style={{
                              zIndex: 5,
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              width: 203,
                              height: 100,
                              flexDirection: 'row-reverse',
                              alignSelf: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              justifyContent: 'center',
                              overflow: 'visible',
                            }}>
                              {!banktransForMatchForMatch.length && (
                                <Text style={{
                                  color: '#0f3860',
                                  fontFamily: fonts.regular,
                                  fontSize: sp(16),
                                  textAlign: 'center',
                                }}>{'בחרו תנועות בנק \n שלא צפיתי'}</Text>
                              )}
                              {banktransForMatchForMatch.length > 0 && (
                                <CarouselComponent
                                  isShake={isShake}
                                  handleIsShake={this.handleIsShake}
                                  isRtl={isRtl}
                                  t={t}
                                  data={banktransForMatchForMatch}
                                  banktransForMatchData
                                  removeFromMatches={this.removeFromMatches} />
                              )}
                            </View>
                            {/* <View style={{ */}
                            {/* bottom: 0, */}
                            {/* left: 0, */}
                            {/* width: 203, */}
                            {/* zIndex: 4, */}
                            {/* position: 'absolute', */}
                            {/* height: 10, */}
                            {/* flexDirection: 'row-reverse', */}
                            {/* alignSelf: 'center', */}
                            {/* alignItems: 'center', */}
                            {/* alignContent: 'center', */}
                            {/* justifyContent: 'center', */}
                            {/* }}> */}
                            {/* <View style={{ */}
                            {/* width: 1, */}
                            {/* borderWidth: 1, */}
                            {/* borderColor: '#0f3860', */}
                            {/* borderStyle: IS_IOS ? 'dashed' : 'dotted', */}
                            {/* height: 10, */}
                            {/* }} /> */}
                            {/* </View> */}
                          </View>

                          {/* <View style={{ */}
                          {/* flexDirection: 'column', */}
                          {/* alignSelf: 'center', */}
                          {/* alignItems: 'center', */}
                          {/* alignContent: 'center', */}
                          {/* justifyContent: 'center', */}
                          {/* backgroundColor: '#ffffff', */}
                          {/* width: 12, */}
                          {/* height: 46, */}
                          {/* marginVertical: 1, */}
                          {/* }}> */}
                          {/* <View style={{ */}
                          {/* width: 1, */}
                          {/* borderWidth: 1, */}
                          {/* borderColor: '#0f3860', */}
                          {/* borderStyle: IS_IOS ? 'dashed' : 'dotted', */}
                          {/* height: 13, */}
                          {/* }} /> */}
                          {/* <View style={{ */}
                          {/* width: 22, */}
                          {/* height: 22, */}
                          {/* flexDirection: 'row-reverse', */}
                          {/* alignSelf: 'center', */}
                          {/* alignItems: 'center', */}
                          {/* alignContent: 'center', */}
                          {/* justifyContent: 'center', */}
                          {/* }}> */}
                          {/* <Icon */}
                          {/* name={((banktransForMatchForMatch.length > 1 && cashflowMatchForMatch.length > 0) || (cashflowMatchForMatch.length > 1 && banktransForMatchForMatch.length > 0)) ? 'lock' : 'unlock'} */}
                          {/* type='evilicon' */}
                          {/* size={22} */}
                          {/* color={'#45b7ec'} */}
                          {/* /> */}
                          {/* </View> */}
                          {/* <View */}
                          {/* style={{ */}
                          {/* width: 1, */}
                          {/* borderWidth: 1, */}
                          {/* borderColor: '#0f3860', */}
                          {/* borderStyle: IS_IOS ? 'dashed' : 'dotted', */}
                          {/* height: 13, */}
                          {/* }} /> */}
                          {/* </View> */}
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignSelf: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#ffffff',
                            width: 203,
                            height: 100,
                          }}>
                            {/* <View style={{ */}
                            {/* top: 0, */}
                            {/* left: 0, */}
                            {/* width: 203, */}
                            {/* zIndex: 4, */}
                            {/* position: 'absolute', */}
                            {/* height: 10, */}
                            {/* flexDirection: 'row-reverse', */}
                            {/* alignSelf: 'center', */}
                            {/* alignItems: 'center', */}
                            {/* alignContent: 'center', */}
                            {/* justifyContent: 'center', */}
                            {/* }}> */}
                            {/* <View style={{ */}
                            {/* width: 1, */}
                            {/* borderWidth: 1, */}
                            {/* borderColor: '#0f3860', */}
                            {/* borderStyle: IS_IOS ? 'dashed' : 'dotted', */}
                            {/* height: 10, */}
                            {/* }} /> */}
                            {/* </View> */}
                            <View style={{
                              position: 'absolute',
                              left: 10,
                              top: 10,
                              zIndex: 1,
                              width: 188,
                              height: 86,
                              borderWidth: 1,
                              borderColor: '#0f3860',
                              borderRadius: 10,
                              borderStyle: IS_IOS ? 'dashed' : 'dotted',
                            }} />
                            {cashflowMatchForMatch.length > 0 && (
                              <View style={{
                                position: 'absolute',
                                right: 6,
                                top: 12,
                                zIndex: 999,
                                width: 22,
                                height: 22,
                                borderRadius: 11,
                                backgroundColor: '#08d3b8',
                                flexDirection: 'row',
                                alignSelf: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'center',
                              }}>
                                <Text style={{
                                  color: '#ffffff',
                                  fontFamily: fonts.semiBold,
                                  fontSize: sp(12),
                                  textAlign: 'center',
                                }}>{cashflowMatchForMatch.length}</Text>
                              </View>
                            )}
                            <View style={{
                              zIndex: 5,
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              width: 203,
                              height: 100,
                              flexDirection: 'row-reverse',
                              alignSelf: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                              justifyContent: 'center',
                              overflow: 'visible',
                            }}>
                              {!cashflowMatchForMatch.length && (
                                <Text style={{
                                  color: '#0f3860',
                                  fontFamily: fonts.regular,
                                  fontSize: sp(16),
                                  textAlign: 'center',
                                }}>{'בחרו תנועות צפויות \n שטרם קרו/ לא הותאמו'}</Text>
                              )}
                              {cashflowMatchForMatch.length > 0 && (
                                <CarouselComponent
                                  isShake={isShake}
                                  handleIsShake={this.handleIsShake}
                                  isRtl={isRtl}
                                  t={t}
                                  data={cashflowMatchForMatch}
                                  removeFromMatches={this.removeFromMatches} />
                              )}
                            </View>
                          </View>
                        </View>

                        <View style={{
                          flex: 2.5,
                          flexDirection: 'row-reverse',
                          alignSelf: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'center',
                        }}>
                          {cashflowMatchForMatch.length > 0 && banktransForMatchForMatch.length > 0 && (
                            <TouchableOpacity
                              onPress={this.removeMatch}>
                              <Icon
                                iconStyle={{
                                  shadowColor: '#dddddd',
                                  shadowOpacity: 0.2,
                                  shadowRadius: 0.6,
                                  shadowOffset: { width: 0.5, height: 0.3 },
                                  elevation: 4,
                                }}
                                name="close-circle"
                                type="material-community"
                                size={60}
                                color={'#ee3736'}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}

                    {matchPeulot && (
                      <View style={{
                        flexDirection: 'column',
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                      }}>
                        <View>
                          <Icon
                            name="check"
                            type="material-community"
                            size={60}
                            color={'#123860'}
                          />
                        </View>
                        <View style={{
                          marginBottom: 20,
                        }}>
                          <Text style={{
                            color: '#021d4b',
                            fontSize: sp(25),
                            fontFamily: fonts.semiBold,
                            textAlign: 'center',
                          }}>
                            התנועות הותאמו בהצלחה!
                          </Text>
                        </View>
                        <View>
                          <TouchableOpacity
                            style={{
                              backgroundColor: '#0f3860',
                              width: 98,
                              height: 35,
                              borderRadius: 18,
                            }}
                            onPress={this.cancelMatch}>
                            <Text style={{
                              color: '#ffffff',
                              fontSize: sp(16),
                              lineHeight: 35,
                              fontFamily: fonts.semiBold,
                              textAlign: 'center',
                            }}>
                              שיחזור
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {cashflowMatchForMatch.length > 0 && banktransForMatchForMatch.length > 0 &&
                    (
                      (cashflowMatchForMatch.length === 1 && banktransForMatchForMatch.filter((item) => item.transTypeId !== 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d').some((it) => it.transTypeId !== cashflowMatchForMatch[0].transTypeId) && cashflowMatchForMatch[0].transTypeId !== 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d') ||
                      (banktransForMatchForMatch.length === 1 && cashflowMatchForMatch.filter((item) => item.transTypeId !== 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d').some((it) => it.transTypeId !== banktransForMatchForMatch[0].transTypeId) && banktransForMatchForMatch[0].transTypeId !== 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d')
                    ) &&
                    (<View style={{
                      flexDirection: 'row-reverse',
                      alignSelf: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      justifyContent: 'center',
                      position: 'absolute',
                      bottom: 140,
                      right: 0,
                      left: 0,
                      zIndex: 9,
                    }}>
                      <Image
                        style={[styles.imgIcon, { width: 16, height: 13, marginHorizontal: 4 }]}
                        source={require('BiziboxUI/assets/alertIcon.png')}
                      />
                      <Text style={{
                        color: '#022156',
                        fontFamily: fonts.regular,
                        fontSize: sp(15),
                        textAlign: 'center',
                        paddingVertical: 10,
                      }}>{'שימו לב, התנועות שנבחרו הן בעלות קטגוריות שונות'}</Text>
                    </View>)}

                    <View style={{
                      backgroundColor: '#d9e7ee',
                      paddingVertical: 10,
                    }}>
                      <View style={{
                        flexDirection: 'row-reverse',
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                        height: 30,
                      }}>
                        <Image style={{ width: 20.5, height: 20.5 }}
                          source={require('BiziboxUI/assets/iconCircles.png')} />
                        <Text style={{
                          marginHorizontal: 5,
                          fontSize: sp(18),
                          color: '#021d4b',
                          fontFamily: fonts.semiBold,
                        }}>
                          {'תנועות צפויות שטרם קרו / לא הותאמו'}
                        </Text>
                      </View>
                      {(!cashflowMatchData || inProgress) && (
                        <View style={{ height: 106 }}><Loader
                          containerStyle={{ backgroundColor: '#d9e7ee' }}
                          isDefault /></View>)}
                      {cashflowMatchData && !cashflowMatchData.length && !inProgress && (
                        <View>
                          <Text style={{
                            color: '#022156',
                            fontFamily: fonts.regular,
                            fontSize: sp(14),
                            textAlign: 'right',
                            paddingVertical: 10,
                            paddingHorizontal: 20,
                          }}>
                            {'■ כל התנועות הצפויות הותאמו אך מופיעות בבנק תנועות\n' +
                            'נוספות שלא היו צפויות.\n' +
                            '■ אם אחת או יותר מתנועות הבנק שנותרו הן מחזוריות אנא\n' +
                            'הוסיפו אותן לתזרים.\n' +
                            '■ בידקו אם קיימות תנועות שמקורן בטעות מצד הבנק.\n' +
                            '■ שאר התנועות הן כנראה תנועות חד פעמיות לא צפויות.'}
                          </Text>
                        </View>
                      )}
                      {cashflowMatchData && cashflowMatchData.length > 0 && !inProgress && (
                        <AnimatedScrollView
                          ref={scrollView => (this.scrollView = scrollView)}
                          horizontal
                          scrollEventThrottle={16}
                          contentContainerStyle={{
                            flexGrow: 1,
                            flexDirection: (isRtl) ? 'row-reverse' : 'row',
                            alignSelf: 'center',
                            zIndex: 999,
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            height: 91,
                            overflow: 'hidden',
                          }}>
                          {cashflowMatchDataState && cashflowMatchDataState.map((c, i) => {
                            return (
                              <Card
                                openAlert={this.openAlert}
                                isFirst={i === 0}
                                isLast={i + 1 === cashflowMatchDataState.length}
                                disabled={banktransForMatchForMatch.length > 1 && cashflowMatchForMatch.length > 0}
                                handleEditOptionModalCb={this.handleEditOptionModalCb}
                                handleRemoveRowModalCb={this.handleRemoveRowModalCb}
                                isRtl={isRtl}
                                t={t}
                                banktransForMatchData={false}
                                key={i.toString()}
                                item={c}
                                pressItem={this.pressItem}
                              />
                            )
                          })}
                        </AnimatedScrollView>
                      )}
                    </View>

                  </View>
                </Animated.ScrollView>
              </View>
            </TouchableWithoutFeedback>
          )}

          <BankAccountsHeader
            onToggleCalendar={this.handleOpenCalendarModal}
            setCheckTitleMarks={this.setCheckTitleMarks}
            adjustableMovementsWidth={adjustableMovementsWidth}
            adjustedMovementsScreenWidth={adjustedMovementsScreenWidth}
            adjustableMovementsScreen={adjustableMovementsScreen}
            selectAccounts={this.selectDefaultAccounts}
            handleSelectAccount={this.handleSelectAccount}
            searchQuery={this.searchQuery}
            queryStatus={queryStatus}
            filtersAll={this.filtersAll}
            isRtl={isRtl}
            selectedAccounts={this.selectedAccounts}
            hasData={this.hasData}
            hasAlert={this.hasHeaderAlert}
            alertState={this.headerAlertState}
            scrollY={this.scrollY}
            alertYPosition={alertYPosition}
            headerMinHeight={this.headerMinHeight}
            accountGroups={accountGroups}
            accounts={bankMatchAccounts}
            selectedGroup={selectedGroup}
            selectedAccountIds={selectedAccountIds}
            headerScrollDistance={this.headerScrollDistance}
            onOpenAccountsModal={this.handleOpenAccountsModal}
            onSetAlertPosition={this.handleSetAlertPosition}
            onSelectAccount={this.handleForceSelectAccount}
            onToggleAlertDetails={this.handleToggleAlertDetails}
            onSetHeaderHeight={this.handleSetHeaderHeight}
          />
        </Animated.ScrollView>

        {accountsModalIsOpen && (accounts && accounts.length > 1) && (
          <AccountsModal
            isOpen
            notGrouped
            accounts={bankMatchAccounts}
            isRtl={isRtl}
            onClose={this.handleCloseSelectedAccounts}
            onSubmit={this.handleApplySelectedAccounts}
            onSelectAccount={this.handleSelectAccount}
            selectedAccountIds={selectedAccountIds}
          />
        )}

        {removeRowModalOpen && (
          <RemoveRowModal
            setModalVisible={this.handleRemoveRowModalCb}
            isRtl={isRtl}
            item={rowInfo}
            removeItem={this.removeItem}
          />
        )}
        {cashflowMatchPopup && (
          <CashflowMatchPopup
            isRtl={isRtl}
            selectedAccountIds={selectedAccountIds}
            updateStateCashflowMatchPopup={this.updateStateCashflowMatchPopup}
            cashflowMatchPopup={cashflowMatchPopup}
            bankMatchSubmit={this.bankMatchSubmit}
            closeModal={this.closeCashflowMatchPopup}
          />
        )}
        {removeRowFromListModalOpen && (
          <RemoveRowFromListModal
            setModalVisible={this.handleRemoveItemFromListModalCb}
            isRtl={isRtl}
            item={rowInfo}
            removeItem={this.removeItemFromList}
          />
        )}

        {editPopModalOpen && (
          <EditOptionModal
            createPaymentNew={this.createPaymentNew}
            updateFromBankmatch={this.updateFromBankmatch}
            setModalVisible={this.handleEditOptionModalCb}
            handlePopRowEditsModal={this.handlePopRowEditsModal}
            isRtl={isRtl}
            item={rowInfo}
            removeItemFromList={this.handleRemoveItemFromListModalCb}
            removeItem={this.handleRemoveRowModalCb}
          />
        )}

        {editRowModalOpen && (
          <EditRowModal
            categories={categories}
            screen={'BankMatchScreen'}
            currentCompanyId={currentCompanyId}
            accounts={accounts}
            dataOfRow={rowInfo}
            updateRow={this.updateRow}
          />
        )}

        {openModalCreateEditTransaction && (
          <CreatePayment
            categories={categories}
            update={this.createEditTransaction}
            accounts={accounts}
            selectedAccountIds={selectedAccountIds}
            closeModalCreateEditTransaction={this.closeModalCreateEditTransaction}
            currentCompanyId={currentCompanyId}
            dataTransaction={dataTransaction}
          />)}

        <View style={[styles.panelContainer]} pointerEvents={'box-none'}>
          <TouchableWithoutFeedback
            onPress={this.close}
            style={[{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9,
            }]}>
            <Animated.View
              pointerEvents={currentOpenItemIndex === null ? 'box-none' : 'auto'}
              style={[{
                backgroundColor: 'black',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9,
                opacity: this._deltaY.interpolate({
                  inputRange: [0, 1, Screen.height - 220, Screen.height + 30],
                  outputRange: [0, 0.8, 0.8, 0],
                  extrapolate: 'clamp',
                }),
              }]} />
          </TouchableWithoutFeedback>

          <Interactable.View
            style={{
              zIndex: 999,
            }}
            onSnapStart={this.onDrawerSnap}
            animatedValueX={new Animated.Value(0)}
            verticalOnly
            ref={this.handleSetRef}
            snapPoints={[{ y: 40 }, { y: Screen.height - 220 }, { y: Screen.height + 30 }]}
            boundaries={{ top: -220 }}
            initialPosition={{ y: Screen.height + 30 }}
            animatedValueY={this._deltaY}>
            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <View style={styles.panelHandle} />
              </View>

              <View style={{ left: 0, right: 0, height: Screen.height - 90 }}>
                <Image style={{
                  alignSelf: 'center',
                  resizeMode: 'contain',
                  width: 24,
                  height: 24,
                  marginVertical: 10,
                }} source={require('BiziboxUI/assets/iconCircles.png')} />
                <Text style={{
                  color: '#022156',
                  fontFamily: fonts.semiBold,
                  fontSize: sp(16.5),
                  textAlign: 'right',
                  paddingHorizontal: 15,
                  paddingBottom: 5,
                }}>{'לא ניתן לבצע התאמה בין תנועות עם מוטבים שונים'}</Text>
                <Text style={{
                  color: '#022156',
                  fontFamily: fonts.regular,
                  fontSize: sp(16.5),
                  textAlign: 'right',
                  paddingHorizontal: 15,
                }}>{'ניתן לשנות את המוטב על ידי עריכת התנועה'}</Text>
              </View>
            </View>
          </Interactable.View>
        </View>
      </View>
    )
  }
}
