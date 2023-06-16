import React, {PureComponent} from 'react'
import {Animated, BackHandler, FlatList, Image, RefreshControl, Text, TouchableOpacity, View} from 'react-native'
import {connect} from 'react-redux'
import {withTranslation} from 'react-i18next'
import commonStyles from '../../styles/styles'
import {getAccountGroups} from '../../redux/selectors/account'
import {DEFAULT_PRIMARY_CURRENCY} from '../../constants/bank'
import {getErrText, goTo, goToBack, sp} from '../../utils/func'
import {getCyclicTrans, getCyclicTransRecommendations} from '../../redux/actions/cyclicTrans'
import {IS_IOS} from '../../constants/common'
import Loader from '../../components/Loader/Loader'
import AccountsModal from '../../components/AccountsModal/AccountsModal'
import BankAccountsHeader from './components/BankAccountsHeader'
import AccountAlertDetails from '../../components/AccountAlert/AccountAlertDetails'
import {selectAccounts} from '../../redux/actions/account'
import {values} from 'lodash'
import {
    approveRecommendationApi,
    createRecommendationApi,
    getAccountCflTransTypeApi,
    removeRecommendationApi,
    restoreCyclicTransApi,
} from '../../api'
import styles, {HEADER_ALERT_BORDER_HEIGHT} from './CyclicTransStyles'
import RowWrapper from './components/RowWrapper'
import {colors, fonts} from '../../styles/vars'
import ActionButton from 'react-native-action-button'
import RemoveRowModal from './components/RemoveRowModal'
import RestoreRowModal from './components/RestoreRowModal'
import CreateEditTransaction from './components/CreateEditTransaction'
import EditRowModal from '../../components/EditRowModal/EditRowModal'

import Api from '../../api/Api'
import AppTimezone from '../../utils/appTimezone'
import AlertsTrial from 'src/components/AlertsTrial/AlertsTrial'

import DeviceInfo from 'react-native-device-info'
import {Icon} from 'react-native-elements'
import {exampleCompany} from '../../redux/constants/account'
import {setOpenedBottomSheet} from '../../redux/actions/user'

export const BUNDLE_ID = DeviceInfo.getBundleId()

export const IS_DEV = BUNDLE_ID.endsWith('dev')

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)

@connect(state => ({
    globalParams: state.globalParams,
    isRtl: state.isRtl,
    currentCompanyId: state.currentCompanyId,
    accounts: state.accounts,
    accountGroups: getAccountGroups(state),
    screenMode: state.bankAccountScreenMode,
    cyclicTransData: state.cyclicTransData,
    cyclicTransRecommendationsData: state.cyclicTransRecommendationsData,
    searchkey: state.searchkey,
}))
@withTranslation()
export default class CyclicTransScreen extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            showAlert: false,
            fadeAnim: new Animated.Value(0),
            navigationState: null,
            isReady: false,
            inProgress: false,
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
            restoreRowModalOpen: false,
            calendarModalIsOpen: false,
            headerMaxHeight: 100,
            alertYPosition: 0,
            alertDetailsIsOpen: false,
            transactions: [],
            rowInfo: {
                isRecommendation: null,
                item: null,
            },
            openModalCreateEditTransaction: false,
            dataTransaction: {},
            currentScrollPosition: 0,
            editRowModalOpen: false,
            refreshing: false,
        }

        this.scrollY = new Animated.Value(IS_IOS ? -100 : 0)
        this.transactionsSrc = []
        this.summary = {
            avgExpense: 0,
            avgIncome: 0,
        }
        this.groups = {}

        this.paymentTypesInOrder = [
            'RECOMMENDATION',
            'BankTransfer',
            'DirectDebit',
            'credit',
            'Slika',
            'cash',
            'Loans',
            'Deposits',
            'Checks',
            'Other',
            'Bankfees',
            'mortgage',
        ]
    }

    get accountIdsForRequest() {
        const {selectedAccountIds} = this.state
        return selectedAccountIds
    }

    get isLoader() {
        const {isReady, inProgress} = this.state
        return !isReady || inProgress
    }

    get selectedDeviantAccounts() {
        return this.selectedAccounts.filter(a => a.balanceUse < 0)
    }

    get selectedAccounts() {
        const {accounts} = this.props
        const selectedAccountIds = this.accountIdsForRequest

        return accounts.filter(a => selectedAccountIds.includes(a.companyAccountId))
    }

    get selectedNotUpdatedAccounts() {
        return this.selectedAccounts.filter(a => a.nonUpdateDays > 0)
    }

    get hasData() {
        // const { accountAggregatedData, bankTrans } = this.props
        //
        // return this.screenSwitchState
        //   ? !!(accountAggregatedData && accountAggregatedData.accountTransactions.length)
        //   : !!(bankTrans && bankTrans.length)

    }

    get headerScrollDistance() {
        const {headerMaxHeight} = this.state
        const scrollDistance = headerMaxHeight - this.headerMinHeight
        return scrollDistance > 0 ? scrollDistance : 0
    }

    get headerMinHeight() {
        const minHeight = IS_IOS ? 35 : 33
        return this.hasHeaderAlert ? minHeight + HEADER_ALERT_BORDER_HEIGHT : minHeight
    }

    get headerMinHeightCalc() {
        const minHeight = IS_IOS ? 250 : 262
        return this.hasHeaderAlert ? minHeight + HEADER_ALERT_BORDER_HEIGHT : minHeight
    }

    get hasHeaderAlert() {
        if (!this.selectedAccounts.length || !this.selectedNotUpdatedAccounts.length) {
            return false
        }
        return values(this.headerAlertState).some(v => v)
    }

    get headerAlertState() {
        const selectedAccounts = this.selectedAccounts
        // const selectedDeviantAccounts = this.selectedDeviantAccounts
        const selectedNotUpdatedAccounts = this.selectedNotUpdatedAccounts

        return {
            selectedAccounts: selectedAccounts,
            isOneOfOne: false,
            isOneOfMultiple: false,
            isMoreThenOneOfMultiple: false,
            isAccountNotUpdated: true,
            isOneOfOneNotUpdated: selectedAccounts.length === 1 && selectedNotUpdatedAccounts.length === 1,
            isOneOfMultipleNotUpdated: selectedAccounts.length > 1 && selectedNotUpdatedAccounts.length === 1,
            isMoreThenOneOfMultipleNotUpdated: selectedAccounts.length > 1 && selectedNotUpdatedAccounts.length > 1,
        }
    }

    handleSelectGroup = (currency, accountIds) => {
        this.transactionsSrc = []
        this.setState({
            inProgress: true,
            currentSelectedAccountId: null,
            transactions: [],
            queryStatus: {
                expense: null,
                query: null,
            },
            selectedAccountIds: accountIds,
            selectedGroup: currency,
        })
    }

    handleSelectAccount = (selectedGroup, selectedAccountIds = [], fn) => {
        this.transactionsSrc = []

        this.setState({
            accountsModalIsOpen: false,
            selectedAccountIds,
            selectedGroup,
            currentSelectedAccountId: null,
        }, () => {
            setTimeout(() => {
                this.setState({
                    inProgress: true,
                    transactions: [],
                    queryStatus: {
                        expense: null,
                        query: null,
                    },
                }, () => {
                    if (typeof fn === 'function') {
                        return fn()
                    }
                })
            }, 0)
        })
    }

    selectDefaultAccounts = () => {
        const {accountGroups} = this.props
        if (!accountGroups || !Object.keys(accountGroups).length) {
            return this.setState({
                inProgress: false,
                isReady: true,
                isLayoutComplete: true,
            })
        }
        const findIdsToSelect = (currency) => {
            currency = currency && currency.toLowerCase()
            if (currency) {
                const selectedIds = accountGroups[currency].map(a => a.companyAccountId)
                this.handleSelectGroup(currency, selectedIds)
            } else {
                const accountId = accountGroups[currency][0].companyAccountId
                this.handleSelectAccount(currency, accountId)
            }
            return this.getScreenData()
        }

        if (accountGroups.hasOwnProperty(DEFAULT_PRIMARY_CURRENCY)) {
            const currency = DEFAULT_PRIMARY_CURRENCY && DEFAULT_PRIMARY_CURRENCY.toLowerCase()
            const accountId = accountGroups[currency].map(a => a.companyAccountId)
            this.handleSelectGroup(currency, accountId)
            setTimeout(() => {
                return this.getScreenData()
            }, 20)
        } else {
            return findIdsToSelect(Object.keys(accountGroups)[0])
        }
    }

    getAccountCflTransType(transTypeId) {
        const {categories} = this.state
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
        const {accounts} = this.props

        if (isLoader) {
            this.setState({inProgress: true, isLayoutComplete: false})
        }
        if (!isLoader) {
            this.setState({inProgress: true, isLayoutComplete: true})
        }

        return this.getData()
            .then((data) => {
                const responses = data
                try {
                    const recommendations = (responses[1] || []).filter((accWithRecomendations) => accWithRecomendations.recommendations && accWithRecomendations.recommendations.length)
                        .reduce((collector, accWithRecomendations) => {
                            return [...collector, ...accWithRecomendations.recommendations
                                .map(rcmndtn => {
                                    rcmndtn.transType = this.getAccountCflTransType(rcmndtn.transTypeId)
                                    rcmndtn.companyAccountId = accWithRecomendations.companyAccountId
                                    rcmndtn.account = accounts.find(a => a.companyAccountId === accWithRecomendations.companyAccountId)
                                    rcmndtn.paymentDesc = 'RECOMMENDATION'
                                    rcmndtn.autoUpdateTypeName = rcmndtn.autoUpdateTypeName
                                        ? rcmndtn.autoUpdateTypeName.toUpperCase()
                                        : rcmndtn.autoUpdateTypeName
                                    switch (rcmndtn.transFrequencyName) {
                                        case 'WEEKLY':
                                            rcmndtn.transFrequencyName = 'WEEK'
                                            break
                                        case 'MONTHLY':
                                            rcmndtn.transFrequencyName = 'MONTH'
                                            break
                                        case 'TWO_MONTH':
                                            rcmndtn.transFrequencyName = 'TWO_MONTHS'
                                            break
                                    }
                                    rcmndtn.updatedBy = 'SYSTEM'
                                    return rcmndtn
                                })]
                        }, [])

                    const existing = (responses[0] && responses[0].transes) ? responses[0].transes : []
                    if (existing) {
                        existing
                            .forEach(trns => {
                                trns.transType = this.getAccountCflTransType(trns.transTypeId)
                                trns.account = accounts.find(a => a.companyAccountId === trns.companyAccountId)
                            })
                        existing
                            .filter(trns => trns.expence === true && (trns.total > 0 || trns.lastBankTotal > 0))
                            .forEach(trns => {
                                trns.total = trns.total > 0 ? trns.total * -1 : trns.total
                                trns.lastBankTotal = trns.lastBankTotal > 0 ? trns.lastBankTotal * -1 : trns.lastBankTotal
                            })
                    }

                    this.summary = (responses[0] && responses[0].monthly) ? responses[0].monthly : {}

                    const transactions = [...recommendations, ...existing]
                    if (transactions) {
                        transactions.forEach(trns => {
                            let categoryItem
                            if (trns.transTypeId && (categoryItem = this.state.categories.find(ctt => ctt.transTypeId === trns.transTypeId))) {
                                trns.transTypeName = categoryItem.transTypeName
                            }
                        })
                        // transactions.filter(tr => tr.paymentDesc !== 'RECOMMENDATION').reduce((smry, tr) => {
                        //   if (tr.expence === true) {
                        //     smry.avgExpense += tr.total
                        //   } else {
                        //     smry.avgIncome += tr.total
                        //   }
                        //   return smry
                        // }, this.summary)
                    }

                    this.transactionsSrc = transactions
                    this.setState({
                        isLayoutComplete: true,
                    })
                    this.filtersAll()
                } catch (e) {

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

    getData = () => {
        if (IS_DEV) {
            return Promise.all([this.getCyclicTransDataReq(), this.getCyclicTransRecommendationsDataReq()])
        } else {
            return Promise.all([this.getCyclicTransDataReq()])
        }
    }

    getCyclicTransDataReq = () => {
        const {dispatch, currentCompanyId} = this.props
        return dispatch(getCyclicTrans({
            companyId: exampleCompany.isExample
                ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
                : currentCompanyId,
            companyAccountIds: this.accountIdsForRequest,
        }))
    }

    getCyclicTransRecommendationsDataReq = () => {
        const {dispatch} = this.props
        return dispatch(getCyclicTransRecommendations({
            accountIds: this.accountIdsForRequest,
        }))
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)

        const {currentCompanyId} = this.props

        if (currentCompanyId) {
            getAccountCflTransTypeApi.post({body: {uuid: currentCompanyId}})
                .then(data => {
                    this.setState({isReady: true, categories: data.filter(item => item.shonaScreen)})
                    const selectedAccountIds = this.props.route.params.selectedAccountIds
                    if (selectedAccountIds) {
                        const {accountGroups} = this.props

                        let currency
                        if (accountGroups.hasOwnProperty(DEFAULT_PRIMARY_CURRENCY)) {
                            currency = DEFAULT_PRIMARY_CURRENCY
                        } else {
                            currency = Object.keys(accountGroups)[0]
                        }

                        this.setState({
                            navigationState: this.props.route.params,
                            isReady: true,
                            queryStatus: {
                                expense: null,
                                query: this.props.route.params.filterText ? this.props.route.params.filterText : null,
                            },
                            selectedAccountIds,
                            selectedGroup: currency.toLowerCase(),
                            currentSelectedAccountId: selectedAccountIds.length > 1 ? null : selectedAccountIds[0],
                        }, () => {
                            setTimeout(() => {
                                if (this.props.route.params.selectedAccountIds) {
                                    delete this.props.route.params.selectedAccountIds
                                }
                                if (this.props.route.params.filterText) {
                                    delete this.props.route.params.filterText
                                }
                                return this.getScreenData()
                            }, 200)
                        })
                    } else {
                        this.setState({isReady: true})
                        this.selectDefaultAccounts()
                    }
                })
                .catch((err) => this.setState({isReady: true, error: getErrText(err)}))
        }
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

    handleCloseAccountsModal = () => this.setState({accountsModalIsOpen: false})

    handleOpenAccountsModal = () => this.setState({
        accountsModalIsOpen: true,
        selectedAccountIdsSave: JSON.parse(JSON.stringify(this.state.selectedAccountIds)),
        selectedGroupSave: JSON.parse(JSON.stringify(this.state.selectedGroup)),
    })

    handleRemoveRowModal = (state) => this.setState({removeRowModalOpen: state})
    handleRestoreRowModal = (state) => this.setState({restoreRowModalOpen: state})


    handleRemoveRowModalCb = (isRecommendation, item, state) => {
        if (state) {
            let valuesSave = Object.assign({}, this.state.rowInfo)
            valuesSave.isRecommendation = isRecommendation
            valuesSave.item = item
            this.setState({rowInfo: valuesSave})
            if (item.delete) {
                this.handleRestoreRowModal(state)
            } else {
                this.handleRemoveRowModal(state)
            }
        } else {
            this.handleRemoveRowModal(state)
            setTimeout(() => {
                let valuesSave = Object.assign({}, this.state.rowInfo)
                valuesSave.isRecommendation = isRecommendation
                valuesSave.item = item
                this.setState({rowInfo: valuesSave})
            }, 20)
        }
    }

    handleRestoreRowModalCb = (isRecommendation, item, state) => {
        this.handleRestoreRowModal(state)
        setTimeout(() => {
            let valuesSave = Object.assign({}, this.state.rowInfo)
            valuesSave.isRecommendation = isRecommendation
            valuesSave.item = item
            this.setState({rowInfo: valuesSave})
        }, 20)
    }

    searchQuery = (query) => {
        let valuesSave = Object.assign({}, this.state.queryStatus)
        valuesSave.query = (query === '') ? null : query
        this.setState({queryStatus: valuesSave})
        setTimeout(() => {
            // console.log(this.state.queryStatus)
            this.filtersAll()
        }, 20)
    }

    filtersAllNull = () => {
        this.filtersAll(null)
    }

    filtersAll = (status) => {
        this.setState({
            inProgress: true,
        })
        if (status !== undefined) {
            let valuesSave = Object.assign({}, this.state.queryStatus)
            valuesSave.expense = status
            this.setState({queryStatus: valuesSave})
        }

        setTimeout(() => {
            const {queryStatus, navigationState} = this.state
            const data = this.transactionsSrc
            if (data.length) {
                let transactions = JSON.parse(JSON.stringify(data))
                if (queryStatus) {
                    if (queryStatus.expense !== null) {
                        transactions = transactions.filter(tr => tr.expence === queryStatus.expense)
                    }
                    if (queryStatus.query !== null && queryStatus.query !== '') {
                        transactions = transactions.filter((item) => ((item.transName && item.transName.toString().toLowerCase().includes(queryStatus.query.toLowerCase())) || (item.total && item.total.toString().includes(queryStatus.query)) || (item.transTypeName && item.transTypeName.toString().toLowerCase().includes(queryStatus.query.toLowerCase())) || (item.lastBankTotal && item.lastBankTotal.toString().toLowerCase().includes(queryStatus.query.toLowerCase()))))
                    }
                }

                if (this.groups) {
                    Object.values(this.groups).forEach((gr) => {
                        gr.data.length = 0
                        gr.sum = null
                    })
                }

                if (transactions) {
                    transactions.filter(it => !it.delete)
                        .reduce((acmltr, tr) => {
                            if (!acmltr[tr.paymentDesc]) {
                                acmltr[tr.paymentDesc] = {
                                    data: [],
                                    expanded: tr.paymentDesc === 'RECOMMENDATION',
                                    sum: 0,
                                    title: tr.paymentDesc,
                                }
                            } else {
                                acmltr[tr.paymentDesc].expanded = false
                            }

                            acmltr[tr.paymentDesc].data.push(tr)
                            acmltr[tr.paymentDesc].sum += tr.targetType === 'SOLEK_TAZRIM' ? tr.monthlyAverageTotal : tr.total


                            return acmltr
                        }, this.groups)
                    transactions.filter(it => it.delete)
                        .reduce((acmltr, tr) => {
                            if (!acmltr['deleted']) {
                                acmltr['deleted'] = {
                                    data: [],
                                    expanded: false,
                                    sum: 0,
                                    title: 'deleted',
                                }
                            } else {
                                acmltr['deleted'].expanded = false
                            }

                            acmltr['deleted'].data.push(tr)
                            acmltr['deleted'].sum += tr.targetType === 'SOLEK_TAZRIM' ? tr.monthlyAverageTotal : tr.total

                            return acmltr
                        }, this.groups)
                }

                let groupsToShow = Object.values(this.groups).filter(gr => gr.data.length > 0)
                groupsToShow.forEach(g => g.data.sort((t1, t2) => t2.total - t1.total))
                groupsToShow.filter(it => it.title !== 'deleted').sort((g1, g2) => {
                    return this.paymentTypesInOrder.indexOf(g1.data[0].paymentDesc) - this.paymentTypesInOrder.indexOf(g2.data[0].paymentDesc)
                })

                if (groupsToShow.length && (queryStatus.query !== null && queryStatus.query !== '')) {
                    groupsToShow.forEach(g => (g.expanded = true))
                }
                if (navigationState && (navigationState.transIdOpened || navigationState.transIdRemove)) {
                    const transId = navigationState.transIdOpened || navigationState.transIdRemove
                    let item
                    groupsToShow.forEach(g => {
                        const isSame = g.data.filter(it => it.transId === transId)
                        g.expanded = (isSame.length > 0)
                        if (g.expanded) {
                            item = isSame[0]
                        }
                    })
                    if (navigationState.transIdRemove) {
                        if (item) {
                            this.handleRemoveRowModalCb(false, item, true)
                        }
                    }
                }

                this.setState({
                    inProgress: false,
                    isUpdate: (!status),
                    transactions: groupsToShow,
                })
            } else {
                this.setState({
                    inProgress: false,
                    isUpdate: (!status),
                    transactions: [],
                })
            }
        }, 100)
    }

    handleForceSelectAccount = (id) => {
        this.setState(
            {selectedAccountIds: [id], alertDetailsIsOpen: false},
            this.handleApplySelectedAccounts,
        )
    }

    handleItemToggle = (index) => () => {
        let valuesSave = [].concat(this.state.transactions)
        valuesSave[index].expanded = !valuesSave[index].expanded
        this.setState({transactions: valuesSave})
    }

    handleScrollTo = (index) => {
        // if (!this.listRef) return
        //
        // const list = this.listRef.getNode()
        // if (list && list.scrollToOffset) {
        //   const offset = parseInt(index * (DATA_ROW_HEIGHT + 1), 10) + this.headerMinHeightCalc - 20
        //   list.scrollToOffset({ offset, animated: true })
        // }
    }

    handleSetRef = (ref) => {
        this.listRef = ref
    }

    _keyExtractor = (item, index) => index.toString()

    loaded = () => {
        // //console.log('loaded')
    }

    deleteParamNav = () => {
        if (this.props.route.params.transIdOpened) {
            delete this.props.route.params.transIdOpened
        }
        if (this.props.route.params.transIdRemove) {
            delete this.props.route.params.transIdRemove
        }
        this.setState({
            navigationState: null,
        })
    }
    openAlert = (text) => () => {
        this.setState({showAlert: text})

        Animated.timing(
            this.state.fadeAnim,
            {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            },
        ).start()
    }
    animatedTime = () => {
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
            this.setState({showAlert: false})
        })
    }
    _renderItem = ({item, index}) => {
        const {
            isRtl,
            currentCompanyId,
            accounts,
        } = this.props
        const {
            navigationState,
        } = this.state

        return (
            <RowWrapper
                showAlert={this.openAlert}
                deleteParamNav={this.deleteParamNav}
                isTransIdRemove={navigationState && navigationState.transIdRemove}
                transIdOpened={navigationState ? (navigationState.transIdOpened || navigationState.transIdRemove) : navigationState}
                approveRecommendationCb={this.approveRecommendation}
                handleRemoveRowModalCb={this.handleRemoveRowModalCb}
                updateTransactionCb={this.updateTransaction}
                loaded={this.loaded}
                index={index}
                isOpen={item.expanded}
                onRefresh={this._onRefresh}
                isRtl={isRtl}
                item={item}
                accounts={accounts}
                companyId={currentCompanyId}
            />
        )
    }

    _onRefresh = () => {
        this.getScreenData()
    }

    renderItemSeparator = () => <View style={styles.dataRowSeparator}/>

    handleSetHeaderHeight = (e) => {
        this.scrollY = new Animated.Value(IS_IOS ? -e.nativeEvent.layout.height : 0)
        this.setState({headerMaxHeight: e.nativeEvent.layout.height, isLayoutComplete: true})
    }
    handleSetAlertPosition = (e) => this.setState({alertYPosition: e.nativeEvent.layout.y})

    handleToggleAlertDetails = () => this.setState({alertDetailsIsOpen: !this.state.alertDetailsIsOpen})

    removeItem = (item, isRecommendation) => {
        if (isRecommendation) {
            removeRecommendationApi.post({
                body: {
                    mutavArray: item.mutavArray ? item.mutavArray : [],
                    bankTransIds: item.bankTransIds,
                    companyAccountId: item.companyAccountId,
                },
            })
                .then(data => {
                    this.handleRemoveRowModalCb(null, null, false)
                    this.getScreenData(false)
                })
                .catch(() => this.handleRemoveRowModalCb(null, null, false))
        } else {
            new Api({endpoint: `cyclic-trans/cfl/${item.targetType}/delete`}).post({
                body: {
                    companyAccountId: item.companyAccountId,
                    transId: item.transId,
                },
            })
                .then(data => {
                    this.handleRemoveRowModalCb(null, null, false)
                    this.getScreenData()
                })
                .catch(() => this.handleRemoveRowModalCb(null, null, false))
        }
    }


    restoreItem = (item) => {
        let keyType = 'TRANS_ID';
        if (item.paymentDesc === 'Slika') {
            keyType = 'SOLEK_ID';
        } else if (item.paymentDesc === 'credit') {
            keyType = 'CREDIT_CARD_ID';
        } else if (item.paymentDesc === 'Loans') {
            keyType = 'LOAN_ID';
        }
        restoreCyclicTransApi.post({
            body: {
                'keyId': item.transId,
                'keyType': keyType,
            },
        })
            .then(data => {
                this.handleRestoreRowModal(false)
                setTimeout(() => {
                    let valuesSave = Object.assign({}, this.state.rowInfo)
                    valuesSave.isRecommendation = null
                    valuesSave.item = null
                    this.setState({rowInfo: valuesSave})
                }, 20)
                this.getScreenData(false)
            })
            .catch(() => {
                this.handleRestoreRowModal(false)
                setTimeout(() => {
                    let valuesSave = Object.assign({}, this.state.rowInfo)
                    valuesSave.isRecommendation = null
                    valuesSave.item = null
                    this.setState({rowInfo: valuesSave})
                }, 20)
            })
    }


    closeModalCreateEditTransaction = () => {
        this.setState({openModalCreateEditTransaction: false, dataTransaction: {}})
    }

    updateRow = (reload, data) => {
        let valuesSave = Object.assign({}, this.state.rowInfo)
        valuesSave.isRecommendation = null
        valuesSave.item = null
        this.setState({
            rowInfo: valuesSave,
            editRowModalOpen: false,
        })
        if (reload) {
            setTimeout(() => {
                this.getScreenData()
            }, 800)
        }
    }

    createEditTransaction = (data) => {
        if (data.type === 'createRecommendationApi') {
            const mutavArray = (!data.mutavArray || !Array.isArray(data.mutavArray) || (Array.isArray(data.mutavArray) && data.mutavArray.length === 1 && data.mutavArray[0].biziboxMutavId === null))
                ? []
                : data.mutavArray.map((item) => {
                    return {
                        biziboxMutavId: item.biziboxMutavId,
                        total: item.total,
                        transTypeId: item.transTypeId.transTypeId,
                    }
                })
            const params = {
                mutavArray: mutavArray,
                autoUpdateTypeName: data.autoUpdateTypeName,
                companyAccountId: data.companyAccountId,
                companyId: exampleCompany.isExample
                    ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
                    : data.companyId,
                expence: data.expence,
                expirationDate: data.endDate === 'none' ? null : data.expirationDate,
                paymentDesc: data.paymentDesc,
                total: Number(data.total),
                transDate: data.transDate,
                transFrquencyName: data.transFrequencyName,
                transName: data.transName,
                transTypeId: data.transTypeId.transTypeId,
            }
            createRecommendationApi.post({
                body: params,
            })
                .then(data => {
                    this.setState({openModalCreateEditTransaction: false, dataTransaction: {}})
                    this.getScreenData()
                })
                .catch(() => this.setState({openModalCreateEditTransaction: false, dataTransaction: {}}))
        } else if (data.type === 'approveRecommendationApi') {
            if (data.mutavArray && Array.isArray(data.mutavArray)) {
                data.mutavArray = data.mutavArray.filter((item) => item.biziboxMutavId).map((item) => {
                    return {
                        accountMutavName: item.accountMutavName,
                        biziboxMutavId: item.biziboxMutavId,
                    }
                })
            }
            const params = {
                mutavArray: data.mutavArray,
                autoUpdateTypeName: data.autoUpdateTypeName,
                companyAccountId: data.companyAccountId,
                companyId: data.companyId,
                bankTransIds: data.bankTransIds,
                expence: data.expence,
                frequencyDay: data.frequencyDay,
                lastBankDate: data.lastBankDate,
                lastBankTotal: data.lastBankTotal,
                paymentDesc: data.paymentDesc,
                total: Number(data.total),
                transDate: data.transDate,
                transFrequencyName: data.transFrequencyName,
                transName: data.transName,
                transTypeId: data.transTypeId.transTypeId,
            }
            if (params.transFrequencyName === 'WEEK' && params.transDate) {
                params.frequencyDay = (AppTimezone.moment(params.transDate).format('dddd')).toUpperCase()
            }
            if (params.transFrequencyName === 'MONTH' && params.transDate) {
                params.frequencyDay = AppTimezone.moment(params.transDate).format('D')
            }
            approveRecommendationApi.post({
                body: params,
            })
                .then(data => {
                    this.setState({openModalCreateEditTransaction: false, dataTransaction: {}})
                    this.getScreenData()
                })
                .catch(() => this.setState({openModalCreateEditTransaction: false, dataTransaction: {}}))
        } else if (data.type === 'update') {
            let expirationDate = data.expirationDate
            if (data.endDate === 'none') {
                expirationDate = null
            } else if (data.endDate === 'times') {
                let transDate = new Date()
                if (data.transDate) {
                    transDate = data.transDate
                }
                if (data.transFrequencyName === 'TWO_MONTHS') {
                    expirationDate = AppTimezone.moment(transDate).add((Number(data.timesValue) * 2), 'month').valueOf()
                } else {
                    let units = data.transFrequencyName.toLowerCase()
                    expirationDate = AppTimezone.moment(transDate).add(Number(data.timesValue), units).valueOf()
                }
            } else if (data.endDate === 'on') {
                expirationDate = data.expirationDate
            }
            // const params = {
            //   autoUpdateTypeName: data.autoUpdateTypeName,
            //   companyAccountId: data.companyAccountId,
            //   expence: data.expence,
            //   expirationDate: expirationDate,
            //   frequencyDay: (data.frequencyDay) ? data.frequencyDay : null,
            //   lastBankDate: (data.lastBankDate) ? data.lastBankDate : null,
            //   lastBankDateColor: (data.lastBankDateColor) ? data.lastBankDateColor : null,
            //   lastBankTotal: (data.lastBankTotal) ? data.lastBankTotal : null,
            //   monthlyAverageTotal: data.monthlyAverageTotal,
            //   notExpence: (data.notExpence) ? data.notExpence : null,
            //   paymentDesc: data.paymentDesc,
            //   targetType: data.targetType,
            //   total: Number(data.total),
            //   transDate: data.transDate,
            //   transFrequencyName: data.transFrequencyName,
            //   transId: data.transId,
            //   transName: data.transName,
            //   transTypeId: data.transTypeId.transTypeId,
            //   updatedBy: (data.updatedBy) ? data.updatedBy : null,
            // }
            // new Api({ endpoint: `cyclic-trans/cfl/${data.targetType}/update` }).post({
            //   body: params,
            // })
            //   .then(data => {
            //     this.setState({ openModalCreateEditTransaction: false, dataTransaction: {} })
            //     this.getScreenData()
            //   })
            //   .catch(() => {
            //     this.setState({ openModalCreateEditTransaction: false, dataTransaction: {} })
            //   })

            const mutavArray = (!data.mutavArray || !Array.isArray(data.mutavArray) || (Array.isArray(data.mutavArray) && data.mutavArray.length === 1 && data.mutavArray[0].biziboxMutavId === null))
                ? []
                : data.mutavArray.map((item) => {
                    return {
                        biziboxMutavId: item.biziboxMutavId,
                        total: item.total,
                        transTypeId: item.transTypeId.transTypeId,
                    }
                })
            const params = {
                autoUpdateTypeName: data.autoUpdateTypeName,
                companyAccountId: data.companyAccountId,
                companyId: exampleCompany.isExample
                    ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
                    : data.companyId,
                expence: data.expence,
                expirationDate: expirationDate,
                mutavArray: mutavArray,
                paymentDesc: data.paymentDesc,
                total: Number(data.total),
                transDate: data.transDate,
                transFrequencyName: data.transFrequencyName,
                transName: data.transName,
                transTypeId: data.transTypeId.transTypeId,
            }

            new Api({endpoint: 'cyclic-trans/cfl/create'}).post({
                body: params,
            })
                .then(data => {
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

                    this.setState({openModalCreateEditTransaction: false, dataTransaction: {}})
                    this.getScreenData()
                })
                .catch(() => {
                    this.setState({openModalCreateEditTransaction: false, dataTransaction: {}})
                })
        }
    }

    createTransaction = (type) => () => {
        const {
            currentCompanyId,
        } = this.props
        this.setState({
            openModalCreateEditTransaction: true,
            dataTransaction: {
                mutavArray: [
                    {
                        total: null,
                        biziboxMutavId: null,
                        transTypeId: {
                            companyId: '00000000-0000-0000-0000-000000000000',
                            createDefaultSupplier: true,
                            iconType: 'No category',
                            shonaScreen: true,
                            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                            transTypeName: 'ללא קטגוריה',
                        },
                    },
                ],
                timesValue: 0,
                endDate: 'none',
                type: 'createRecommendationApi',
                autoUpdateTypeName: 'AVG_3_MONTHS',
                companyAccountId: null,
                companyId: currentCompanyId,
                expence: type,
                expirationDate: AppTimezone.moment().valueOf(),
                paymentDesc: null,
                total: null,
                transDate: AppTimezone.moment().valueOf(),
                transFrequencyName: 'MONTH',
                transName: '',
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

    approveRecommendation = (item) => {
        const {
            currentCompanyId,
        } = this.props
        let transDate = AppTimezone.moment().valueOf()
        let autoUpdateTypeName = item.autoUpdateTypeName
        let transFrequencyName = item.transFrequencyName
        if (!autoUpdateTypeName) {
            autoUpdateTypeName = 'AVG_3_MONTHS'
        }
        if (!transFrequencyName) {
            transFrequencyName = 'MONTH'
        }
        if (transFrequencyName === 'MONTH') {
            transDate = AppTimezone.moment(item.lastBankDate).add(1, 'months').valueOf()
        } else if (transFrequencyName === 'DAY') {
            transDate = AppTimezone.moment(item.lastBankDate).add(1, 'day').valueOf()
        } else if (transFrequencyName === 'TWO_MONTHS') {
            transDate = AppTimezone.moment(item.lastBankDate).add(2, 'months').valueOf()
        } else if (transFrequencyName === 'QUARTER') {
            transDate = AppTimezone.moment(item.lastBankDate).add(3, 'months').valueOf()
        } else if (transFrequencyName === 'WEEK') {
            transDate = AppTimezone.moment(item.lastBankDate).add(1, 'weeks').valueOf()
        }

        this.setState({
            openModalCreateEditTransaction: true,
            dataTransaction: {
                mutavArray: item.mutavArray,
                timesValue: 0,
                endDate: 'none',
                expirationDate: AppTimezone.moment().valueOf(),
                type: 'approveRecommendationApi',
                autoUpdateTypeName: autoUpdateTypeName,
                companyAccountId: item.companyAccountId,
                companyId: currentCompanyId,
                bankTransIds: item.bankTransIds,
                expence: item.expence,
                frequencyDay: item.frequencyDay,
                lastBankDate: item.lastBankDate,
                lastBankTotal: item.lastBankTotal,
                paymentDesc: 'BankTransfer',
                total: item.total,
                transDate: transDate,
                transFrequencyName: transFrequencyName,
                transName: item.transName,
                transTypeId: this.getAccountCflTransType(item.transTypeId),
            },
        })
    }

    updateTransaction = (item) => {
        let valuesSave = Object.assign({}, this.state.rowInfo)
        valuesSave.isRecommendation = null
        valuesSave.item = item
        this.setState({editRowModalOpen: true, rowInfo: valuesSave})

        // this.setState({
        //   openModalCreateEditTransaction: true,
        //   dataTransaction: {
        //     timesValue: 0,
        //     endDate: 'none',
        //     type: 'update',
        //     autoUpdateTypeName: item.autoUpdateTypeName,
        //     companyAccountId: item.companyAccountId,
        //     expence: item.expence,
        //     expirationDate: (item.expirationDate) ? item.expirationDate : AppTimezone.moment().valueOf(),
        //     frequencyDay: item.frequencyDay,
        //     lastBankDate: item.lastBankDate,
        //     lastBankDateColor: item.lastBankDateColor,
        //     lastBankTotal: item.lastBankTotal,
        //     monthlyAverageTotal: item.monthlyAverageTotal,
        //     notExpence: item.notExpence,
        //     paymentDesc: item.paymentDesc,
        //     targetType: item.targetType,
        //     total: item.total,
        //     transDate: item.transDate,
        //     transFrequencyName: item.transFrequencyName,
        //     transId: item.transId,
        //     transName: item.transName,
        //     transTypeId: this.getAccountCflTransType(item.transTypeId),
        //     updatedBy: item.updatedBy,
        //   },
        // })
    }
    handleScrollEnd = (e) => this.setState({currentScrollPosition: e.nativeEvent.contentOffset.y})

    componentWillUnmount() {
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

    render() {
        const {
            isRtl,
            accountGroups,
            accounts,
            currentCompanyId,
            navigation,
        } = this.props

        const {
            selectedAccountIds,
            selectedGroup,
            accountsModalIsOpen,
            alertYPosition,
            alertDetailsIsOpen,
            isLayoutComplete,
            queryStatus,
            transactions,
            removeRowModalOpen,
            restoreRowModalOpen,
            openModalCreateEditTransaction,
            rowInfo,
            dataTransaction,
            currentScrollPosition,
            editRowModalOpen,
            showAlert,
            fadeAnim,
        } = this.state

        if (!isLayoutComplete) {
            return <Loader/>
        }
        const alertState = this.headerAlertState
        console.log('---transactions----', transactions)

        return (
            <View style={commonStyles.mainContainer}>
                <AlertsTrial navigation={navigation} dontShowActivated refresh={this._onRefresh}
                             updateToken={this.props.globalParams.updateToken}/>

                {(this.isLoader) && (<Loader/>)}

                {!this.isLoader && transactions.length === 0 && (this.selectedAccounts.length > 0) && (
                    <View
                        style={[styles.tableWrapper, {
                            flexGrow: 1,
                            flex: 1,
                            marginTop: this.headerMinHeightCalc,
                            // paddingBottom: this.headerMinHeightCalc,
                            position: 'relative',
                            overflow: 'hidden',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            height: '100%',
                        }]}>
                        <Image
                            style={[styles.imgIcon, {width: 30, height: 30, marginTop: 10}]}
                            source={require('BiziboxUI/assets/cyclic.png')}
                        />
                        <Text style={{
                            color: colors.blue7,
                            fontSize: sp(20),
                            marginTop: 15,
                            marginBottom: 20,
                            fontFamily: fonts.semiBold,
                        }}>{'לא נמצאו תנועות לסינון המבוקש'}</Text>
                        <TouchableOpacity
                            style={{
                                backgroundColor: '#0f3860',
                                borderRadius: 30,
                                width: 160,
                                height: 35,
                                flexDirection: 'row',
                                alignSelf: 'center',
                                justifyContent: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                            }}
                            onPress={this.filtersAllNull}>
                            <Text style={{
                                color: colors.white,
                                fontSize: sp(18),
                                textAlign: 'center',
                                fontFamily: fonts.regular,
                            }}>שנו את הסינון</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {!this.isLoader && transactions && (
                    <AnimatedFlatList
                        refreshControl={
                            <RefreshControl
                                refreshing={this.state.refreshing}
                                onRefresh={this._onRefresh}
                            />
                        }
                        showsVerticalScrollIndicator={false}
                        ref={this.handleSetRef}
                        style={styles.accountsContainer}
                        contentContainerStyle={[styles.tableWrapper, {
                            flexGrow: 1,
                            marginTop: this.headerMinHeightCalc,
                            paddingBottom: this.headerMinHeightCalc,
                            overflow: 'hidden',
                        }]}
                        ItemSeparatorComponent={this.renderItemSeparator}
                        renderItem={this._renderItem}
                        data={transactions}
                        keyExtractor={this._keyExtractor}
                        extraData={this.state}
                        scrollEventThrottle={1}
                        onScrollEndDrag={this.handleScrollEnd}
                        onMomentumScrollEnd={this.handleScrollEnd}
                        onScroll={Animated.event(
                            [{nativeEvent: {contentOffset: {y: this.scrollY}}}],
                            {useNativeDriver: true},
                        )}
                    />
                )}

                <BankAccountsHeader
                    navigation={this.props.navigation}
                    currentCompanyId={currentCompanyId}
                    summary={this.summary}
                    searchQuery={this.searchQuery}
                    queryStatus={queryStatus}
                    filtersAll={this.filtersAll}
                    isRtl={isRtl}
                    selectedAccounts={this.selectedAccounts}
                    selectedDeviantAccounts={this.selectedDeviantAccounts}
                    selectedNotUpdatedAccounts={this.selectedNotUpdatedAccounts}
                    hasData={this.hasData}
                    hasAlert={this.hasHeaderAlert}
                    alertState={this.headerAlertState}
                    scrollY={this.scrollY}
                    alertYPosition={alertYPosition}
                    headerMinHeight={this.headerMinHeight}
                    accountGroups={accountGroups}
                    selectedGroup={selectedGroup}
                    selectedAccountIds={selectedAccountIds}
                    headerScrollDistance={this.headerScrollDistance}
                    onOpenAccountsModal={this.handleOpenAccountsModal}
                    onSetAlertPosition={this.handleSetAlertPosition}
                    onSelectAccount={this.handleForceSelectAccount}
                    onToggleAlertDetails={this.handleToggleAlertDetails}
                    onSetHeaderHeight={this.handleSetHeaderHeight}
                />

                {alertDetailsIsOpen && (
                    <AccountAlertDetails
                        alertState={alertState}
                        isRtl={isRtl}
                        top={alertYPosition - currentScrollPosition - 20}
                        accounts={this.selectedNotUpdatedAccounts.length ? this.selectedNotUpdatedAccounts : this.selectedDeviantAccounts}
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
                        onSelectAccounts={this.handleSelectAccount}
                        selectedAccountIds={selectedAccountIds}
                        selectedGroup={selectedGroup}
                    />
                )}

                {removeRowModalOpen && (
                    <RemoveRowModal
                        setModalVisible={this.handleRemoveRowModalCb}
                        isRtl={isRtl}
                        isRecommendation={rowInfo.isRecommendation}
                        item={rowInfo.item}
                        removeItem={this.removeItem}
                    />
                )}

                {restoreRowModalOpen && (
                    <RestoreRowModal
                        setModalVisible={this.handleRestoreRowModalCb}
                        isRtl={isRtl}
                        item={rowInfo.item}
                        removeItem={this.restoreItem}
                    />
                )}


                {openModalCreateEditTransaction && (
                    <CreateEditTransaction
                        categories={this.state.categories}
                        update={this.createEditTransaction}
                        accounts={accounts}
                        selectedAccountIds={selectedAccountIds}
                        closeModalCreateEditTransaction={this.closeModalCreateEditTransaction}
                        currentCompanyId={currentCompanyId}
                        dataTransaction={dataTransaction}/>)}

                {editRowModalOpen && (
                    <EditRowModal
                        categories={this.state.categories}
                        screen={'CyclicTransScreen'}
                        currentCompanyId={currentCompanyId}
                        accounts={accounts}
                        dataOfRow={rowInfo.item}
                        updateRow={this.updateRow}
                    />
                )}

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
                            onPress={this.animatedTime}/>
                        <View style={{
                            height: 83.5,
                            width: 348,
                            backgroundColor: '#ffffff',
                            borderRadius: 15,
                            zIndex: 10,
                            shadowColor: '#a0a0a0',
                            shadowOffset: {width: 0, height: 0},
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 2,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <TouchableOpacity
                                style={{
                                    height: 20,
                                    alignSelf: 'flex-end',
                                }}
                                onPress={this.animatedTime}>
                                <Icon
                                    name="close"
                                    type="material-community"
                                    size={25}
                                    color={'#022258'}
                                />
                            </TouchableOpacity>
                            <Text style={{
                                color: '#0f3860',
                                fontSize: sp(16),
                                lineHeight: 24,
                                fontFamily: fonts.regular,
                                textAlign: 'center',
                            }}>
                                {showAlert}
                            </Text>
                        </View>
                    </Animated.View>
                )}

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
                        title="הכנסה קבועה"
                        onPress={this.createTransaction(false)}>
                        <Image
                            style={[styles.actionButtonIcon, {
                                height: 25,
                                width: 25,
                            }]}
                            source={require('BiziboxUI/assets/cycIncIcon.png')}/>
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
                        title="הוצאה קבועה"
                        onPress={this.createTransaction(true)}
                    >
                        <Image
                            style={[styles.actionButtonIcon, {
                                height: 24.5,
                                width: 25,
                            }]}
                            source={require('BiziboxUI/assets/cycExIcon.png')}/>
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
                            style={[styles.actionButtonIcon, {
                                height: 25.5,
                                width: 25.5,
                            }]}
                            source={require('BiziboxUI/assets/recoIcon.png')}/>
                    </ActionButton.Item>
                </ActionButton>
            </View>
        )
    }
}
