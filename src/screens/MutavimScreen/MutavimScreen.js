import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import React, { Fragment, PureComponent } from 'react'
import { setOpenedBottomSheet } from 'src/redux/actions/user'
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
// import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './MutavimStyles'
import {
  companyMutavDetailsApi,
  createAccountCflTransTypeApi,
  getAccountCflTransTypeApi,
  mutavCategoryUpdateApi,
  mutavHistoryApi,
  removeAccountCflTransTypeApi,
  updateMutavApi,
} from '../../api'
import { colors, fonts } from '../../styles/vars'
import {
  combineStyles as cs,
  getEmoji,
  getErrText,
  getFormattedValueArray,
  getTransCategoryIcon,
  goToBack,
  sp,
} from '../../utils/func'
import { getAccountGroups } from '../../redux/selectors/account'
import { selectAccounts } from '../../redux/actions/account'
import Loader from 'src/components/Loader/Loader'
import AccountsModal from 'src/components/AccountsModal/AccountsModal'

import Interactable from 'react-native-interactable'

import AlertsTrial from 'src/components/AlertsTrial/AlertsTrial'
import { DEFAULT_PRIMARY_CURRENCY } from '../../constants/bank'
import { IS_IOS } from '../../constants/common'
import Row from './components/Row'
import Header from './components/Header'
import Graph from './components/Graph'
import commonStyles from '../../styles/styles'
import CustomIcon from 'src/components/Icons/Fontello'
import { Button, Icon } from 'react-native-elements'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { exampleCompany } from '../../redux/constants/account'

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
}

class ScrollCompWithHeader extends PureComponent {
  static listRef = null

  componentWillUnmount () {
    ScrollCompWithHeader.listRef = null
  }

  UNSAFE_componentWillReceiveProps (props) {
    if (props.refreshScroll && props.refreshScroll !==
      this.props.refreshScroll) {
      setTimeout(() => {
        if (ScrollCompWithHeader.listRef &&
          ScrollCompWithHeader.listRef.scrollTo) {
          ScrollCompWithHeader.listRef.scrollTo({
            animated: true,
            y: 0,
          })
        }
      }, 10)
    }
  }

  render () {
    const children = this.props.children
    const {
      t,
      offsetY,
      isSearchOpenState,
      handleDeleteCategory,
      categoriesMatchCopy,
      handleModalTypes,
      isSearchOpen,
      searchQuery,
      queryStatus,
      scrollAnim,
      filtersAll,
      isRtl,
      selectedAccounts,
      accountGroups,
      selectedGroup,
      headerScrollDistance,
      onOpenAccountsModal,
      onSetHeaderHeight,
      setDefaultScrollPosition,
      notHasData,
      notHasDataFilter,
    } = this.props
    return (<ScrollView
      ref={scrollView => {
        if (scrollView) {
          ScrollCompWithHeader.listRef = scrollView
        }
      }}
      {...this.props.props}
      stickyHeaderIndices={[0]}
    >
      <View>
        <Header
          offsetY={offsetY}
          isSearchOpenState={isSearchOpenState}
          handleDeleteCategory={handleDeleteCategory}
          categoriesMatchCopy={categoriesMatchCopy}
          handleModalTypes={handleModalTypes}
          isSearchOpen={isSearchOpen}
          searchQuery={searchQuery}
          queryStatus={queryStatus}
          scrollAnim={scrollAnim}
          filtersAll={filtersAll}
          isRtl={isRtl}
          selectedAccounts={selectedAccounts}
          accountGroups={accountGroups}
          selectedGroup={selectedGroup}
          headerScrollDistance={headerScrollDistance}
          onOpenAccountsModal={onOpenAccountsModal}
          onSetHeaderHeight={onSetHeaderHeight}
          setDefaultScrollPosition={setDefaultScrollPosition}
          notHasData={notHasData || notHasDataFilter}
        />
      </View>
      {children}

      {(notHasDataFilter && !notHasData) && (
        <View
          style={{
            backgroundColor: 'white',
            flex: 1,
            position: 'relative',
            maxHeight: Dimensions.get('window').height,
          }}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: 25,
              paddingBottom: 0,
            }]}>
          <View>
            <Image
              style={[
                {
                  width: 144 / 2,
                  height: 92 / 2,
                  marginBottom: 22.5,
                  alignSelf: 'center',
                  marginTop: 115,
                }]}
              source={require('BiziboxUI/assets/notDataMutav.png')}
            />
            <Text style={{
              fontFamily: fonts.semiBold,
              fontSize: sp(20),
              textAlign: 'center',
              color: '#022258',
            }}>{'לא נמצאו תוצאות לחיפוש המבוקש'}</Text>
          </View>
        </View>
      )}

      {notHasData && (
        <View
          style={{
            backgroundColor: 'white',
            flex: 1,
            position: 'relative',
            maxHeight: Dimensions.get('window').height,
          }}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: 25,
              paddingBottom: 0,
            }]}>
          <View style={commonStyles.horizontalCenterContainer}>
            <Text style={styles.bankAccountInfoText}>
              {selectedAccounts.length > 0
                ? t('common:noFilterFound')
                : t('bankAccount:pleaseSelectAnAccountToViewData')}
            </Text>

            <CustomIcon name="no-data" size={56} color={colors.gray9}
                        style={{ marginBottom: 16 }}/>

            <Button
              buttonStyle={[commonStyles.blueBtn, styles.bankAccountBtn]}
              onPress={onOpenAccountsModal}
              title={selectedAccounts.length > 0 ? t('common:changeFilter') : t(
                'bankAccount:selectAccount')}
            />
          </View>
        </View>
      )}
    </ScrollView>)
  }
}

@connect(state => ({
  globalParams: state.globalParams,
  currentCompanyId: state.currentCompanyId,
  isRtl: state.isRtl,
  accounts: state.accounts,
  accountGroups: getAccountGroups(state),
}))
@withTranslation()
export default class MutavimScreen extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      refreshScroll: false,
      currentOpenItemIndex: null,
      accountsModalIsOpen: false,
      selectedAccountIds: [],
      selectedGroup: null,
      navigationState: null,
      isReady: false,
      inProgress: false,
      isLayoutComplete: false,
      error: null,
      categories: [],
      queryStatus: {
        expense: null,
        query: null,
      },
      editDescModal: false,
      copyMainDesc: '',
      copyMainDescValid: true,
      bankTransIdOpened: null,
      inProgressDetails: false,
      saveCategories: false,
      refreshing: false,
      mutavDetails: [],
      mutavDetailsArr: [],
      isSearchOpen: false,
      scrollAnim: new Animated.Value(IS_IOS ? 0 : 0),
      headerMaxHeight: 100,
      categoriesMatch: [],
      categoriesMatchCopy: [],
      categoriesMatchModal: false,
      categoriesModalIsOpen: false,
      dataRow: null,
      inProgressSnap: false,
      offsetY: new Animated.Value(IS_IOS ? 0 : 0),
      detailsHistory: null,
      updateTypePopup: false,
      type: null,
      emailSide: 'right',
      companyIdSide: 'right',
      billingAccountPhoneSide: 'right',
      contactMailValid: true,
      mailIsHebrew: false,
      accountMutavHpValid: true,
      accountMutavDetailsValid: true,
      contactNameValid: true,
      contactPhoneValid: true,
    }
    this._deltaY = new Animated.Value(0)
  }

  get headerScrollDistance () {
    const { headerMaxHeight } = this.state
    const scrollDistance = headerMaxHeight
    return scrollDistance >= 0 ? scrollDistance : 0
  }

  get accountIdsForRequest () {
    const { selectedAccountIds } = this.state
    return selectedAccountIds
  }

  get selectedAccounts () {
    const { accounts } = this.props
    const selectedAccountIds = this.accountIdsForRequest

    return accounts.filter(a => selectedAccountIds.includes(a.companyAccountId))
  }

  get isLoader () {
    const { isReady, inProgress } = this.state
    return !isReady || inProgress
  }

  handleCloseCategoriesModal = () => {
    this.setState({
      categoriesModalIsOpen: false,
      idxCategory: 0,
    })
  }

  handleUpdateBankTrans = (newBankTrans) => {
    this.setState({
      dataRow: { ...newBankTrans },
      categoriesModalIsOpen: false,
    })
    this.handleUpdateTrans({ ...newBankTrans })
  }

  handleUpdateTrans = (newTransData) => {
    this.setState({
      updateTypePopup: Object.assign(newTransData, {
        updateType: 'future',
      }),
    })
  }

  closeUpdateTypePopup = () => {
    this.setState({
      updateTypePopup: false,
    })
  }

  handleOpenCategoriesModal = () => {
    this.setState({ categoriesModalIsOpen: true })
  }

  handleSelectCategory = (category) => {
    const { dataRow } = this.state
    if (!dataRow || dataRow.transTypeId === category.transTypeId) {return}

    const newBankTrans = {
      ...dataRow,
      iconType: category.iconType,
      transTypeId: category.transTypeId,
      transTypeName: category.transTypeName,
    }

    return this.handleUpdateBankTrans(newBankTrans)
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

  _onRefresh = () => {
    this.companyMutavDetails()
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
    this.props.dispatch(selectAccounts(this.state.selectedAccountIds))
    this.handleCloseAccountsModal()
    this.companyMutavDetails()
  }

  handleCloseAccountsModal = () => this.setState({ accountsModalIsOpen: false })

  handleOpenAccountsModal = () => this.setState({
    accountsModalIsOpen: true,
    selectedAccountIdsSave: JSON.parse(
      JSON.stringify(this.state.selectedAccountIds)),
    selectedGroupSave: JSON.parse(JSON.stringify(this.state.selectedGroup)),
  })

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
          if (typeof fn === 'function') {return fn()}
        })
      }, 0)
    })
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
      currency = currency ? currency.toLowerCase() : DEFAULT_PRIMARY_CURRENCY
      if (currency) {
        const selectedIds = accountGroups[currency].map(a => a.companyAccountId)
        this.handleSelectGroup(currency, selectedIds)
      } else {
        const accountId = accountGroups[currency][0].companyAccountId
        this.handleSelectAccount(currency, accountId)
      }
      return this.companyMutavDetails()
    }

    if (accountGroups.hasOwnProperty(DEFAULT_PRIMARY_CURRENCY)) {
      const currency = DEFAULT_PRIMARY_CURRENCY &&
        DEFAULT_PRIMARY_CURRENCY.toLowerCase()
      const accountId = accountGroups[currency].map(a => a.companyAccountId)
      this.handleSelectGroup(currency, accountId)
      setTimeout(() => {
        return this.companyMutavDetails()
      }, 20)
    } else {
      return findIdsToSelect(Object.keys(accountGroups)[0])
    }
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

    this.setState({ refreshScroll: true })
    setTimeout(() => {
      this.setState({ refreshScroll: false })
    }, 1000)
    // setTimeout(() => {
    //   if (this.listRefTable) {
    //     const aaa = this.listRefTable.getNode()
    //     console.log(aaa)
    //     // this.listRefTable.getNode().scrollToOffset({ offset: 0, animated: true })
    //   }
    // }, 10)

    // setTimeout(() => {
    //   console.log('ScrollCompWithHeader.listRef ', ScrollCompWithHeader.listRef )
    //   if (ScrollCompWithHeader.listRef && ScrollCompWithHeader.listRef.scrollTo) {
    //     ScrollCompWithHeader.listRef.scrollTo({ animated: true, y: 0 })
    //   }
    // }, 10)
  }

  handleBackPress = () => {
    this.props.dispatch(setOpenedBottomSheet(false))

    goToBack(this.props.navigation)
    return true
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    this._deltaY = new Animated.Value(0)
    this.setDefaultScrollPosition()

    const { currentCompanyId } = this.props
    if (currentCompanyId) {
      getAccountCflTransTypeApi.post({ body: { uuid: currentCompanyId } })
        .then(data => {
          this.setState({
            isReady: true,
            categories: data.filter(item => item.shonaScreen),
          })
          const selectedAccountIds = this.props.route.params.selectedAccountIds
          if (selectedAccountIds) {
            const { accountGroups } = this.props
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
                query: this.props.route.params.filterText
                  ? this.props.route.params.filterText
                  : null,
              },
              selectedAccountIds,
              selectedGroup: currency.toLowerCase(),
              currentSelectedAccountId: selectedAccountIds.length > 1
                ? null
                : selectedAccountIds[0],
            }, () => {
              setTimeout(() => {
                if (this.props.route.params.selectedAccountIds) {
                  delete this.props.route.params.selectedAccountIds
                }
                if (this.props.route.params.filterText) {
                  delete this.props.route.params.filterText
                }
                return this.companyMutavDetails()
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

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  companyMutavDetails = (isLoader = true) => {
    this.setState({ inProgress: true })
    this.setDefaultScrollPosition()

    companyMutavDetailsApi.post({
      body: {
        'companyAccountIds': this.accountIdsForRequest,
        'companyId': this.props.currentCompanyId,
      },
    })
      .then((mutavDetailsArr) => {
        const { categories } = this.state

        let categoriesMatch = []
        if (mutavDetailsArr && mutavDetailsArr.length) {
          categoriesMatch = Array.from(
            new Set(mutavDetailsArr.map(s => s.transTypeId))).map(id => {
            let obj = categories.find((cat) => cat.transTypeId === id)
            if (!obj) {
              const row = mutavDetailsArr.find((it) => it.transTypeId === id)
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
          mutavDetailsArr.forEach((trns1, idx1) => {
            let transType = this.state.categories.find(
              ctt => ctt.transTypeId === trns1.transTypeId)
            if (transType === undefined) {
              transType = this.state.categories[0]
            }
            trns1 = Object.assign(trns1, transType)
          })
        }

        this.setState({
          categoriesMatch,
          categoriesMatchCopy: categoriesMatch,
          mutavDetailsArr,
          isLayoutComplete: true,
        })
        this.filtersAll()
      })
      .catch(() => {

      })
  }

  handleSetRef = (ref) => {
    this.listRef = ref
  }

  openBottomSheetFromRow = (item) => () => {
    this.setState({ currentOpenItemIndex: item.biziboxMutavId })
    this.openBottomSheet(item)
  }

  openBottomSheet = (dataRow, notChange) => {
    this.setState({
      dataRow,
      bankTransIdOpened: null,
    })
    if (dataRow) {
      setTimeout(() => {
        this.getDetails()
      }, 50)
    }
    if (!notChange) {
      this.listRef.snapTo({ index: 1 })
    }
  }

  getDetails = () => {
    const { dataRow } = this.state
    this.setState({ inProgressDetails: true })

    return mutavHistoryApi.post({
      body: {
        'companyAccountIds': this.accountIdsForRequest,
        'companyId': this.props.currentCompanyId,
        'biziboxMutavId': dataRow.biziboxMutavId,
        'isDetails': false,
      },
    })
      .then(detailsHistory => {
        this.setState({
          detailsHistory,
          inProgressDetails: false,
        })
      })
      .catch(() => this.setState({ inProgressDetails: false }))
  }

  close = () => {
    const {
      categoriesMatch,
      categoriesMatchModal,
    } = this.state
    if (categoriesMatchModal) {
      this.setState({
        saveCategories: true,
        categoriesMatchCopy: categoriesMatch,
        categoriesMatchModal: false,
      })
    } else {
      this.setState({
        saveCategories: true,
        dataRow: null,
      })
    }
    setTimeout(() => {
      this.listRef.snapTo({ index: 2 })
    }, 20)
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
      if (!this.state.saveCategories) {
        const {
          categoriesMatch,
          dataRow,
        } = this.state
        if (dataRow) {
          this.setState({
            saveCategories: true,
            dataRow: null,
          })
        } else {
          this.setState({
            saveCategories: true,
            categoriesMatchCopy: categoriesMatch,
            categoriesMatchModal: false,
          })
        }
      }
      this.props.dispatch(setOpenedBottomSheet(false))
      this.setState({
        dataRow: null,
        currentOpenItemIndex: null,
      })
    }
  }

  handleSetScrollPosition = (y) => {
    this.setState({ currentScrollPosition: y })
    Keyboard.dismiss()
  }

  handleSetHeaderHeight = (e) => {
    this.setState({
      headerMaxHeight: e.nativeEvent.layout.height,
      isLayoutComplete: true,
      scrollAnim: new Animated.Value(IS_IOS ? -e.nativeEvent.layout.height : 0),
    })
  }

  searchQuery = (query) => {
    let valuesSave = Object.assign({}, this.state.queryStatus)
    valuesSave.query = (query === '') ? null : query
    this.setState({ queryStatus: valuesSave })
    setTimeout(() => {
      this.filtersAll()
    }, 20)
  }

  isSearchOpen = (isSearchOpen) => {
    if (isSearchOpen) {
      let queryStatus = Object.assign({}, this.state.queryStatus)
      queryStatus.query = null
      this.setState({
        isSearchOpen: !isSearchOpen,
        queryStatus,
      })
      setTimeout(() => {
        this.filtersAll()
      }, 20)
    } else {
      this.setState({ isSearchOpen: !isSearchOpen })
    }
  }

  filtersAll = (changeTypes, status) => {
    this.setState({
      inProgress: true,
    })
    if (status !== undefined) {
      let valuesSave = Object.assign({}, this.state.queryStatus)
      valuesSave.expense = status
      this.setState({ queryStatus: valuesSave })
    }
    setTimeout(() => {
      const { mutavDetailsArr, queryStatus, categoriesMatch } = this.state
      // //console.log('categoriesMatch', categoriesMatch)

      let mutavDetails = JSON.parse(JSON.stringify(mutavDetailsArr))
      if (mutavDetails.length) {
        if (queryStatus) {
          try {
            if ((queryStatus.query !== null && queryStatus.query !== '') ||
              changeTypes) {
              const categoriesMatchPressFilter = categoriesMatch.filter(
                a => a.press === true)
              mutavDetails = mutavDetails.filter((item, idx) => {
                const categoriesMatchPress = categoriesMatch.find(
                  a => a.transTypeId === item.transTypeId).press

                if (queryStatus.query !== null && queryStatus.query !== '') {
                  if (queryStatus.expense !== null) {
                    return (
                      (item.averageThreeMonths.toString().includes('-') ===
                        queryStatus.expense) &&
                      (categoriesMatchPressFilter.length
                        ? categoriesMatchPress
                        : !categoriesMatchPress) &&
                      (
                        (item.accountMutavName &&
                          item.accountMutavName.toString()
                            .toLowerCase()
                            .includes(queryStatus.query.toLowerCase())) ||
                        (item.averageThreeMonths &&
                          item.averageThreeMonths.toString()
                            .includes(queryStatus.query))
                      )
                    )
                  } else {
                    return (
                      (categoriesMatchPressFilter.length
                        ? categoriesMatchPress
                        : !categoriesMatchPress) &&
                      (
                        (item.accountMutavName &&
                          item.accountMutavName.toString()
                            .toLowerCase()
                            .includes(queryStatus.query.toLowerCase())) ||
                        (item.averageThreeMonths &&
                          item.averageThreeMonths.toString()
                            .includes(queryStatus.query))
                      )
                    )
                  }
                } else {
                  if (queryStatus.expense !== null) {
                    return (
                      (item.averageThreeMonths.toString().includes('-') ===
                        queryStatus.expense) &&
                      (categoriesMatchPressFilter.length
                        ? categoriesMatchPress
                        : !categoriesMatchPress)
                    )
                  } else {
                    return (
                      (categoriesMatchPressFilter.length
                        ? categoriesMatchPress
                        : !categoriesMatchPress)
                    )
                  }
                }
              })
            }
          } catch (e) {

          }
        }

        this.setState({
          inProgress: false,
          mutavDetails: mutavDetails,
        })
      } else {
        this.setState({
          isReady: true,
          isLayoutComplete: true,
          inProgress: false,
          mutavDetails: mutavDetails,
        })
      }

      setTimeout(() => {
        this.setDefaultScrollPosition()
      }, 100)

      if (this.state.bankTransIdOpened) {
        const lastRowOpened = mutavDetails.find(
          (item) => item.biziboxMutavId === this.state.bankTransIdOpened)
        if (lastRowOpened) {
          this.openBottomSheet(lastRowOpened, true)
        }
      }
    }, 100)
  }
  // handleSetRefTable = (ref) => {
  //   this.listRefTable = ref
  // }

  _onRefreshTable = () => {
    this.setState({ refreshing: true })
    this._onRefresh()
    setTimeout(() => {
      this.setState({ refreshing: false })
    }, 1000)
  }

  renderItemSeparator = () => <View style={styles.dataRowSeparator}/>

  handleScrollEnd = (e) => {
    this.handleSetScrollPosition(e.nativeEvent.contentOffset.y)
  }

  renderItem = ({ item, index }) => {
    const {
      isRtl,
    } = this.props
    const { currentOpenItemIndex, queryStatus } = this.state

    return (
      <Row
        queryStatus={queryStatus}
        key={index}
        isOpen={(queryStatus && queryStatus.query !== null &&
          queryStatus.query !== '') ? true : (item.biziboxMutavId) ===
          currentOpenItemIndex}
        isRtl={isRtl}
        item={item}
        onToggle={this.openBottomSheetFromRow(item)}
      />
    )
  }

  // renderHeader = () => {
  //   return <Animated.View
  //     style={{
  //       flex: 1,
  //       height: 0,
  //       backgroundColor: 'transparent',
  //     }}
  //   />
  // }

  handleModalTypes = () => {
    this.setState({
      categoriesMatchModal: true,
    })
    this.openBottomSheet(null)
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

  handleSaveCategories = () => {
    const {
      categoriesMatchCopy,
    } = this.state

    setTimeout(() => {
      this.setState({
        saveCategories: true,
        categoriesMatch: categoriesMatchCopy,
        categoriesMatchModal: false,
      })
      setTimeout(() => {
        this.listRef.snapTo({ index: 2 })
      }, 20)
      this.filtersAll(true)
    }, 50)
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
        bankTransIdOpened: updateTypePopup.biziboxMutavId,
        updateTypePopup: false,
      })
      setTimeout(() => {
        this.companyMutavDetails()
      }, 50)
    })
  }
  handleToggleEditDesc = (type) => () => {
    const { dataRow } = this.state
    this.setState({
      editDescModal: !this.state.editDescModal,
      copyMainDesc: dataRow[type] ? dataRow[type] : '',
      type: type || null,
    })
  }
  handleUpdateTransText = () => {
    const {
      inProgress,
      copyMainDesc,
      mailIsHebrew,
      type,
    } = this.state

    if (inProgress ||
      (this.state[`${type}Valid`] !== true && copyMainDesc.length !== 0) ||
      mailIsHebrew) {
      return
    }

    Keyboard.dismiss()
    let valuesSave = Object.assign({}, this.state.dataRow)
    valuesSave[this.state.type] = this.state.copyMainDesc
    this.setState({
      dataRow: valuesSave,
      editDescModal: false,
      inProgress: true,
    })
    const obj = {
      'accountMutavDetails': valuesSave.accountMutavDetails,
      'accountId': Number(valuesSave.accountId),
      'accountMutavHp': Number(valuesSave.accountMutavHp),
      'accountMutavName': valuesSave.accountMutavName,
      'bankId': Number(valuesSave.bankId),
      'biziboxMutavId': valuesSave.biziboxMutavId,
      'companyId': this.props.currentCompanyId,
      'contactMail': valuesSave.contactMail,
      'contactName': valuesSave.contactName,
      'contactPhone': valuesSave.contactPhone,
      'snifId': Number(valuesSave.snifId),
      'transTypeId': valuesSave.transTypeId,
    }
    return updateMutavApi.post({
      body: obj,
    }).then(() => {
      this.setState({ inProgress: false })
      setTimeout(() => {
        this.companyMutavDetails()
      }, 20)
    }).catch(() => {
      this.setState({ inProgress: false })
      setTimeout(() => {
        this.companyMutavDetails()
      }, 20)
    })
  }

  onFocusInput = name => val => {
    this.setState({
      [name]: 'left',
    })
  }

  handleUpdateFieldValid = (name, isNotBlur, isRun) => val => {
    if (isRun === undefined || isRun) {
      let value = val.nativeEvent.text || ''

      if (name === 'contactMailValid') {
        const re = /\S+@\S+\.\S+/
        const isHebrew = !!(value && value.length > 0 &&
          /[\u0590-\u05FF]/.test(value))
        const contactMailValid = !!(value && value.length > 0 && re.test(value))
        this.setState({
          [name]: (!value || (value && value.length === 0))
            ? true
            : contactMailValid,
          mailIsHebrew: isHebrew,
        })
      } else if (name === 'contactPhoneValid') {
        this.setState({
          billingAccountPhoneSide: 'right',
          [name]: (!value || (value && value.length === 0)) ? true : !!(value &&
            (value.length === 10 || value.length === 11) && new RegExp(
              '(050|052|053|054|055|057|058|02|03|04|08|09|072|073|076|077|078)-?\\d{7,7}').test(
              value)),
        })
      } else if (name === 'accountMutavHpValid') {
        let result = false
        const c = {
          value: Number(value),
        }
        if (c.value) {
          const digits = Array.from(
            String(c.value).replace(/\D/g, '').padStart(9, '0')).map(ch => +ch)

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
        this.setState({
          [name]: (!value || (value && value.length === 0)) ? true : !!(value &&
            (value.length === 9 && result)),
          companyIdSide: 'right',
        })
      } else if (name === 'accountMutavDetailsValid') {
        this.setState({ [name]: true })
      } else {
        this.setState({ [name]: value && (value.length < 30) })
      }
    }
  }
  handleUpdateFieldValidAsync = (e) => {
    this.setState({
      emailSide: 'right',
    })
    const { copyMainDesc } = this.state
    const re = /\S+@\S+\.\S+/
    let val = (IS_IOS ? e.nativeEvent.text : copyMainDesc) || ''
    if (!(val && re.test(val) && val.length > 0)) {
      const isHebrew = (val && /[\u0590-\u05FF]/.test(val))
      this.setState({
        'contactMailValid': (!val || (val && val.length === 0)),
        mailIsHebrew: isHebrew,
      })
    }
  }
  handleUpdateField = name => val => {
    let value = val || ''
    value = value.toString().replace(getEmoji(), '')

    if (name === 'contactMail') {
      value = value.toString().replace(/([\u05D0-\u05FF/\s+]+)/g, '')
    } else if (name === 'contactPhone') {
      value = value.toString().replace(/[^\d-]/g, '')
    } else if (name === 'accountMutavHp') {
      value = value.toString().replace(/[^\d]/g, '')
    }

    this.setState({ copyMainDesc: value })

    this.handleUpdateFieldValid(`${name}Valid`, true)({
      nativeEvent: {
        text: value,
      },
    })
  }

  render () {
    const {
      isRtl,
      accountGroups,
      accounts,
      currentCompanyId,
      navigation,
      t,
    } = this.props
    const {
      selectedAccountIds,
      selectedGroup,
      accountsModalIsOpen,
      currentOpenItemIndex,
      scrollAnim,
      queryStatus,
      isSearchOpen,
      mutavDetails,
      mutavDetailsArr,
      isLayoutComplete,
      categoriesMatch,
      categoriesModalIsOpen,
      dataRow,
      categoriesMatchModal,
      categoriesMatchCopy,
      inProgressSnap,
      offsetY,
      refreshScroll,
      inProgressDetails,
      detailsHistory,
      updateTypePopup,
      editDescModal,
      copyMainDesc,
      type,
      emailSide,
      companyIdSide,
      billingAccountPhoneSide,
    } = this.state
    if (!isLayoutComplete) {return <Loader/>}
    let categoriesMatchArr = []
    let lenCategoriesMatchCopy = 0
    categoriesMatchArr = categoriesMatch.filter((it) => it.press === true)
    lenCategoriesMatchCopy = categoriesMatchCopy.filter(
      (it) => it.press === true).length

    const total = dataRow
      ? getFormattedValueArray(dataRow.averageThreeMonths)
      : null
    const numberStyle = dataRow ? cs(
      dataRow.averageThreeMonths.toString().includes('-'), [
        {
          fontFamily: fonts.semiBold,
        }, { color: colors.green4 }], { color: colors.red2 }) : {}
    const account = dataRow ? accounts.find(
      a => a.bankAccountId === dataRow.accountId) : null
    const disabledEdit = false
    StatusBar.setBarStyle((IS_IOS || currentOpenItemIndex !== null)
      ? 'dark-content'
      : 'light-content', true)

    return (
      <Fragment>
        <AlertsTrial navigation={navigation} refresh={this.refresh}
                     updateToken={this.props.globalParams.updateToken}/>
        <Fragment>
          {(this.isLoader) && (<Loader overlay
                                       containerStyle={{ backgroundColor: colors.white }}/>)}

          <AnimatedFlatList
            // ListHeaderComponent={this.renderHeader}
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefreshTable}
              />
            }
            extraData={this.state.refreshing}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { y: scrollAnim } } }], {
                useNativeDriver: IS_IOS,
                listener: e => {
                  const offset = e.nativeEvent.contentOffset.y
                  this.state.offsetY.setValue(offset)
                },
              })}
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
              styles.accountsContainer, {
                flex: 1,
                position: 'relative',
              }]}
            contentContainerStyle={[
              styles.tableWrapper, {
                backgroundColor: 'white',
                flexGrow: 1,
              }]}
            scrollEventThrottle={IS_IOS ? 16 : 1}
            data={mutavDetails}
            renderItem={this.renderItem}
            ItemSeparatorComponent={this.renderItemSeparator}
            keyExtractor={(item, index) => (item.biziboxMutavId)}
            initialNumToRender={55}
            windowSize={5}
            renderScrollComponent={(props) => <ScrollCompWithHeader
              offsetY={offsetY}
              t={t}
              notHasDataFilter={mutavDetails.length === 0 && !this.isLoader}
              refreshScroll={refreshScroll}
              isSearchOpenState={isSearchOpen}
              handleDeleteCategory={this.handleDeleteCategory}
              categoriesMatchCopy={categoriesMatchArr}
              handleModalTypes={this.handleModalTypes}
              isSearchOpen={this.isSearchOpen}
              searchQuery={this.searchQuery}
              queryStatus={queryStatus}
              scrollAnim={scrollAnim}
              filtersAll={this.filtersAll}
              isRtl={isRtl}
              selectedAccounts={this.selectedAccounts}
              accountGroups={accountGroups}
              selectedGroup={selectedGroup}
              headerScrollDistance={this.headerScrollDistance}
              onOpenAccountsModal={this.handleOpenAccountsModal}
              onSetHeaderHeight={this.handleSetHeaderHeight}
              setDefaultScrollPosition={this.setDefaultScrollPosition}
              props={props}
              notHasData={((!mutavDetailsArr) ||
                (mutavDetailsArr && mutavDetailsArr.length === 0)) &&
              !this.isLoader}
              propsPage={this.props}/>}
          />

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
          {categoriesModalIsOpen && (
            <CategoriesModal
              isOpen
              isRtl={isRtl}
              companyId={currentCompanyId}
              bankTrans={dataRow}
              onClose={this.handleCloseCategoriesModal}
              onUpdateBankTrans={this.handleUpdateBankTrans}
              onSelectCategory={this.handleSelectCategory}
              onCreateCategory={this.handleCreateBankTransCategory}
              onRemoveCategory={this.handleRemoveBankTransCategory}
            />
          )}
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
                      <TouchableOpacity onPress={this.handleToggleEditDesc()}>
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
                      opacity: (this.state[`${type}Valid`] === true ||
                        copyMainDesc.length === 0) ? 1 : 0.3,
                    }}>
                      <TouchableOpacity
                        activeOpacity={(this.state[`${type}Valid`] === true ||
                          copyMainDesc.length === 0) ? 0.2 : 1}
                        onPress={(this.state[`${type}Valid`] === true ||
                          copyMainDesc.length === 0)
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
                        borderWidth: 0,
                        paddingHorizontal: 10,
                      }]}>
                      {type === 'accountMutavDetails' && (
                        <TextInput
                          autoFocus
                          editable
                          multiline
                          placeholder={'הערה'}
                          placeholderTextColor="#a7a3a3"
                          numberOfLines={12}
                          autoCorrect={false}
                          autoCapitalize="sentences"
                          returnKeyType="done"
                          keyboardType="default"
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
                          onEndEditing={this.handleUpdateFieldValid(
                            'accountMutavDetailsValid', false, !IS_IOS)}
                          onBlur={this.handleUpdateFieldValid(
                            'accountMutavDetailsValid', false, IS_IOS)}
                          onChangeText={this.handleUpdateField(
                            'accountMutavDetails')}
                          value={copyMainDesc ? String(copyMainDesc) : ''}
                        />
                      )}

                      {type === 'contactName' && (
                        <TextInput
                          autoFocus
                          editable
                          multiline
                          placeholder={'שם איש קשר'}
                          placeholderTextColor="#a7a3a3"
                          numberOfLines={12}
                          autoCorrect={false}
                          autoCapitalize="sentences"
                          returnKeyType="done"
                          keyboardType="default"
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
                          onEndEditing={this.handleUpdateFieldValid(
                            'contactNameValid', false, !IS_IOS)}
                          onBlur={this.handleUpdateFieldValid(
                            'contactNameValid', false, IS_IOS)}
                          onChangeText={this.handleUpdateField('contactName')}
                          value={copyMainDesc ? String(copyMainDesc) : ''}
                        />
                      )}

                      {type === 'contactMail' && (
                        <TextInput
                          autoFocus
                          editable
                          multiline
                          placeholder={'מייל'}
                          placeholderTextColor="#a7a3a3"
                          numberOfLines={12}
                          style={[
                            {
                              textAlign: (!copyMainDesc ||
                                (copyMainDesc && copyMainDesc.length === 0))
                                ? 'right'
                                : emailSide,
                              color: '#022258',
                              fontSize: sp(20),
                              width: '100%',
                              height: 300,
                              textAlignVertical: 'top',
                            }, commonStyles.regularFont]}
                          autoCorrect={false}
                          autoCapitalize="none"
                          returnKeyType="done"
                          keyboardType="email-address"
                          underlineColorAndroid="transparent"
                          onEndEditing={this.handleUpdateFieldValid(
                            'contactMailValid')}
                          onFocus={this.onFocusInput('emailSide')}
                          onBlur={this.handleUpdateFieldValidAsync}
                          onChangeText={this.handleUpdateField('contactMail')}
                          value={copyMainDesc ? String(copyMainDesc) : ''}
                        />
                      )}

                      {type === 'contactPhone' && (
                        <TextInput
                          autoFocus
                          editable
                          multiline
                          placeholder={'טלפון'}
                          placeholderTextColor="#a7a3a3"
                          numberOfLines={12}
                          maxLength={15}
                          autoCorrect={false}
                          autoCapitalize="none"
                          returnKeyType="done"
                          keyboardType="numeric"
                          underlineColorAndroid="transparent"
                          style={[
                            {
                              textAlign: (!copyMainDesc ||
                                (copyMainDesc && copyMainDesc.length === 0))
                                ? 'right'
                                : billingAccountPhoneSide,
                              color: '#022258',
                              fontSize: sp(20),
                              width: '100%',
                              height: 300,
                              textAlignVertical: 'top',
                            }, commonStyles.regularFont]}
                          onEndEditing={(e) => {
                            this.setState({
                              copyMainDesc: e.nativeEvent.text.toString()
                                .replace(/[^\d-]/g, ''),
                            })
                            this.handleUpdateFieldValid('contactPhoneValid')(e)
                          }}
                          onFocus={this.onFocusInput('billingAccountPhoneSide')}
                          onBlur={this.handleUpdateFieldValid(
                            'contactPhoneValid')}
                          onChangeText={this.handleUpdateField('contactPhone')}
                          value={copyMainDesc ? String(copyMainDesc) : ''}
                        />
                      )}

                      {type === 'accountMutavHp' && (
                        <TextInput
                          autoFocus
                          editable
                          multiline
                          placeholder={'ע.מ/ח.פ'}
                          placeholderTextColor="#a7a3a3"
                          numberOfLines={12}
                          maxLength={9}
                          autoCorrect={false}
                          autoCapitalize="none"
                          returnKeyType="done"
                          keyboardType="numeric"
                          underlineColorAndroid="transparent"
                          style={[
                            {
                              textAlign: (!copyMainDesc ||
                                (copyMainDesc && String(copyMainDesc).length ===
                                  0)) ? 'right' : companyIdSide,
                              color: '#022258',
                              fontSize: sp(20),
                              width: '100%',
                              height: 300,
                              textAlignVertical: 'top',
                            }, commonStyles.regularFont]}
                          onEndEditing={(e) => {
                            this.setState({
                              copyMainDesc: e.nativeEvent.text.toString()
                                .replace(/[^\d]/g, ''),
                            })
                            this.handleUpdateFieldValid('accountMutavHpValid')(
                              e)
                          }}
                          onFocus={this.onFocusInput('companyIdSide')}
                          onBlur={this.handleUpdateFieldValid(
                            'accountMutavHpValid')}
                          onChangeText={this.handleUpdateField(
                            'accountMutavHp')}
                          value={copyMainDesc ? String(copyMainDesc) : ''}
                        />
                      )}
                    </View>
                  </View>
                </KeyboardAwareScrollView>
              </View>
            </SafeAreaView>
          </Modal>
        </Fragment>

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
                    inputRange: [0, 1, Screen.height - 360, Screen.height + 30],
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
              { y: 20 },
              { y: Screen.height - 360 },
              { y: Screen.height + 30 }]}
            boundaries={{ top: -360 }}
            initialPosition={{ y: Screen.height + 30 }}
            animatedValueY={this._deltaY}>
            <View style={styles.panel}>
              <View style={[styles.panelHeader, { paddingHorizontal: 10 }]}>
                <View style={styles.panelHandle}/>
              </View>

              {categoriesMatchModal && !dataRow && (
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
              )}

              <View style={{
                left: 0,
                right: 0,
                height: Screen.height - 70,
              }}>
                {!categoriesMatchModal && dataRow && (
                  <View>
                    <View style={{
                      paddingHorizontal: 10,
                    }}>
                      <View>
                        <Text
                          style={styles.panelTitle}>{dataRow.accountMutavName}</Text>
                      </View>
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

                  {categoriesMatchModal && !dataRow &&
                  categoriesMatchCopy.length > 0 && (
                    <View style={{ paddingHorizontal: 10 }}>
                      {categoriesMatchModal && !dataRow &&
                      categoriesMatchCopy.length > 0 &&
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
                                                          ? '#11cab1'
                                                          : '#0c2b5f',
                                                        borderRadius: 5,
                                                        backgroundColor: f.press
                                                          ? '#11cab1'
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
                    </View>)}

                  {!categoriesMatchModal && dataRow && (
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
                              }}>{dataRow.accountId}</Text>
                              <Text style={{
                                color: '#022258',
                                fontSize: sp(16),
                                fontFamily: fonts.regular,
                                textAlign: 'center',
                              }}>{'ח-ן'}</Text>
                            </View>
                          </View>

                          {dataRow.isCyclic && (
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
                          {dataRow.hashCustId && (
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
                              }}>{dataRow.hashCustId}</Text>
                              <Text style={{
                                color: '#022258',
                                fontSize: sp(16),
                                fontFamily: fonts.regular,
                                textAlign: 'center',
                              }}>{'אינדקס הנה״ח'}</Text>
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

                        <TouchableOpacity
                          activeOpacity={(disabledEdit) ? 0.3 : 1}
                          style={{
                            opacity: disabledEdit ? 0.3 : 1,
                            flexDirection: 'row-reverse',
                            marginVertical: 15,
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'space-between',
                          }}
                          onPress={!disabledEdit
                            ? this.handleOpenCategoriesModal
                            : null}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                            <CustomIcon
                              name={getTransCategoryIcon(dataRow.iconType)}
                              size={16}
                              color={'#022258'}
                            />
                            <View style={commonStyles.spaceDividerDouble}/>
                            <Text
                              style={styles.dataRowLevel3Text}>{dataRow.transTypeName}</Text>
                          </View>

                          {!disabledEdit && (
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
                      </View>

                      <View style={[
                        cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
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
                            {inProgressDetails
                              ? <ActivityIndicator color="#999999"/>
                              : (<Graph dataGraph={detailsHistory}
                                        isOpen={detailsHistory &&
                                        !inProgressDetails}/>)}
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
                          {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map(
                            (gr, i) => {
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

                      <View style={{ paddingHorizontal: 10 }}>
                        <TouchableOpacity
                          style={{
                            height: 45,
                            flex: 1,
                            justifyContent: 'center',
                          }}
                          onPress={this.handleToggleEditDesc(
                            'accountMutavDetails')}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                            <View style={{
                              height: 22,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignContent: 'center',
                              alignItems: 'center',
                            }}>
                              <Image style={{
                                alignSelf: 'center',
                                resizeMode: 'contain',
                                width: 19,
                                height: 19,
                              }} source={require(
                                'BiziboxUI/assets/commentDescIcon.png')}/>
                            </View>
                            <View style={commonStyles.spaceDividerDouble}/>
                            <Text style={[
                              {
                                fontSize: sp(16),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                                color: dataRow.accountMutavDetails
                                  ? '#022258'
                                  : '#d0cece',
                              }]}>{dataRow.accountMutavDetails
                              ? dataRow.accountMutavDetails
                              : 'הערה'}</Text>
                          </View>
                        </TouchableOpacity>
                        <View style={{
                          height: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          width: '100%',
                          backgroundColor: colors.gray30,
                        }}/>
                        <TouchableOpacity
                          style={{
                            height: 45,
                            flex: 1,
                            justifyContent: 'center',
                          }}
                          onPress={this.handleToggleEditDesc('accountMutavHp')}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                            <View style={{
                              height: 22,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignContent: 'center',
                              alignItems: 'center',
                            }}>
                              <Image style={{
                                alignSelf: 'center',
                                resizeMode: 'contain',
                                width: 19,
                                height: 19,
                              }} source={require(
                                'BiziboxUI/assets/accountMutavHp.png')}/>
                            </View>
                            <View style={commonStyles.spaceDividerDouble}/>
                            <Text style={[
                              {
                                fontSize: sp(16),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                                color: dataRow.accountMutavHp
                                  ? '#022258'
                                  : '#d0cece',
                              }]}>{dataRow.accountMutavHp
                              ? dataRow.accountMutavHp
                              : 'ע.מ/ח.פ'}</Text>
                          </View>
                        </TouchableOpacity>
                        <View style={{
                          height: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          width: '100%',
                          backgroundColor: colors.gray30,
                        }}/>
                        <TouchableOpacity
                          style={{
                            height: 45,
                            flex: 1,
                            justifyContent: 'center',
                          }} onPress={this.handleToggleEditDesc('contactName')}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                            <View style={{
                              height: 22,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignContent: 'center',
                              alignItems: 'center',
                            }}>
                              <Image style={{
                                alignSelf: 'center',
                                resizeMode: 'contain',
                                width: 19,
                                height: 19,
                              }} source={require(
                                'BiziboxUI/assets/account-circle.png')}/>
                            </View>
                            <View style={commonStyles.spaceDividerDouble}/>
                            <Text style={[
                              {
                                fontSize: sp(16),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                                color: dataRow.contactName
                                  ? '#022258'
                                  : '#d0cece',
                              }]}>{dataRow.contactName
                              ? dataRow.contactName
                              : 'שם איש קשר'}</Text>
                          </View>
                        </TouchableOpacity>
                        <View style={{
                          height: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          width: '100%',
                          backgroundColor: colors.gray30,
                        }}/>

                        <TouchableOpacity
                          style={{
                            height: 45,
                            flex: 1,
                            justifyContent: 'center',
                          }} onPress={this.handleToggleEditDesc('contactMail')}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                            <View style={{
                              height: 22,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignContent: 'center',
                              alignItems: 'center',
                            }}>
                              <Image style={{
                                alignSelf: 'center',
                                resizeMode: 'contain',
                                width: 19,
                                height: 19,
                              }} source={require(
                                'BiziboxUI/assets/contactMail.png')}/>
                            </View>
                            <View style={commonStyles.spaceDividerDouble}/>
                            <Text style={[
                              {
                                fontSize: sp(16),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                                color: dataRow.contactMail
                                  ? '#022258'
                                  : '#d0cece',
                              }]}>{dataRow.contactMail
                              ? dataRow.contactMail
                              : 'מייל'}</Text>
                          </View>
                        </TouchableOpacity>
                        <View style={{
                          height: 1,
                          alignItems: 'center',
                          justifyContent: 'center',
                          alignSelf: 'center',
                          width: '100%',
                          backgroundColor: colors.gray30,
                        }}/>
                        <TouchableOpacity
                          style={{
                            height: 45,
                            flex: 1,
                            justifyContent: 'center',
                          }}
                          onPress={this.handleToggleEditDesc('contactPhone')}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                          }}>
                            <View style={{
                              height: 22,
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignContent: 'center',
                              alignItems: 'center',
                            }}>
                              <Image style={{
                                alignSelf: 'center',
                                resizeMode: 'contain',
                                width: 19,
                                height: 19,
                              }} source={require(
                                'BiziboxUI/assets/contactPhone.png')}/>
                            </View>
                            <View style={commonStyles.spaceDividerDouble}/>
                            <Text style={[
                              {
                                fontSize: sp(16),
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                                color: dataRow.contactPhone
                                  ? '#022258'
                                  : '#d0cece',
                              }]}>{dataRow.contactPhone
                              ? dataRow.contactPhone
                              : 'טלפון'}</Text>
                          </View>
                        </TouchableOpacity>
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
                </Animated.ScrollView>
              </View>
            </View>
          </Interactable.View>
        </View>
      </Fragment>
    )
  }
}
