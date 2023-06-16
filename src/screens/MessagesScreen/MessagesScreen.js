import React, { PureComponent } from 'react'
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  RefreshControl,
  ScrollView,
  SectionList,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import commonStyles from '../../styles/styles'
import { goTo, goToBack, sp } from '../../utils/func'
import {
  cashFlowDetailsDataApi,
  cyclicSingelApi,
  getAccountCflTransTypeApi,
  getStatusTokenTypeApi,
  messagesApi,
  messagesUpdateApi,
  tokenAlertApi,
} from '../../api'
import { IS_IOS } from '../../constants/common'
import styles from '../CashFlowScreen/CashFlowStyles'
import Loader from 'src/components/Loader/Loader'
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view'
import { colors, fonts } from '../../styles/vars'
import Message from './components/Message'
import Icon from '../../components/Icons/Fontello'
import { getMessagesCount } from '../../redux/actions/auth'
import Api from '../../api/Api'
import UpdateTokenModal
  from '../SettingsScreen/components/BaseTokenTab/components/AddTokenModal/UpdateTokenModal'
import BankTokenService from '../../services/BankTokenService'
import { BANK_ACCOUNTS_TAB } from '../../constants/settings'
import EditRowModal from '../../components/EditRowModal/EditRowModal'
import AppTimezone from '../../utils/appTimezone'
import { getAccount } from '../../redux/selectors/account'
import { CHECKS } from '../../constants/navigation'
import { setGlobalParams, setOpenedBottomSheet } from 'src/redux/actions/user'

const AnimatedSectionList = Animated.createAnimatedComponent(KeyboardAwareSectionList)

class ScrollCompWithHeader extends PureComponent {
  static listRef = null

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentWillUnmount () {
    ScrollCompWithHeader.listRef = null
  }

  componentDidMount () {
    setTimeout(() => {
      if (ScrollCompWithHeader.listRef && this.props.isActive) {
        ScrollCompWithHeader.listRef.scrollTo({
          animated: true,
          y: this.props.indexRowActive,
        })
      }
    }, 500)
  }

  UNSAFE_componentWillReceiveProps (props) {
    // if (
    //   props.propsPage.currentSelectedAccountId !== this.props.propsPage.currentSelectedAccountId ||
    //   props.propsPage.dateFromTimestamp !== this.props.propsPage.dateFromTimestamp ||
    //   props.propsPage.dateTillTimestamp !== this.props.propsPage.dateTillTimestamp
    // ) {
    //   setTimeout(() => {
    //     if (ScrollCompWithHeader.listRef && props.isActive) {
    //       debugger
    //       ScrollCompWithHeader.listRef.scrollTo({ animated: true, y: 770 })
    //     }
    //   }, 500)
    // }
  }

  marksAllAsRead = () => {
    this.props.marksAllAsRead()
  }

  render () {
    const children = this.props.children
    const stickyHeaderIndices = this.props.props.stickyHeaderIndices
    return (<ScrollView
      ref={scrollView => {
        if (scrollView) {
          ScrollCompWithHeader.listRef = scrollView
        }
      }}
      {...this.props.props}
      stickyHeaderIndices={stickyHeaderIndices.map((i) => i + 1)}
    >
      <View style={{
        borderBottomColor: '#e7e6e6',
        borderBottomWidth: this.props.propsPage && this.props.propsPage.length >
        0 ? 1 : 0,
      }}>
        <View style={{
          height: 44,
          alignContent: 'center',
          flexDirection: 'row-reverse',
          justifyContent: 'center',
          alignSelf: 'center',
          alignItems: 'center',
        }}>
          <Icon name="bell" size={24} color={'#022258'}/>
          <View style={{
            paddingHorizontal: 3,
          }}/>
          {this.props.type === 'popup' && (
            <Text style={{
              fontFamily: fonts.semiBold,
              color: '#022258',
              fontSize: sp(24),
            }}>{'עדכונים והתראות'}</Text>
          )}
          {this.props.type !== 'popup' && (
            <Text style={{
              fontFamily: fonts.semiBold,
              color: '#022258',
              fontSize: sp(24),
            }}>{'כל העדכונים וההתראות'}</Text>
          )}
        </View>
        {this.props.propsPage && this.props.propsPage.length > 0 &&
        (this.props.getMessageIds && this.props.getMessageIds.length > 0) && (
          <View style={{
            height: 30,
            paddingHorizontal: 10,
            flexDirection: 'column',
            alignSelf: 'flex-end',
            justifyContent: 'center',
          }}>
            <TouchableOpacity
              onPress={this.marksAllAsRead}>
              <Text
                style={{
                  fontFamily: fonts.regular,
                  color: '#037dba',
                  fontSize: sp(15),
                }}>{'סימון הכל כנקרא'}</Text>
            </TouchableOpacity>
          </View>)}
      </View>
      {children}
      {this.props.propsPage && !this.props.propsPage.length && (
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
              paddingTop: 0,
              paddingBottom: 0,
            }]}>
          <View style={commonStyles.horizontalCenterContainer}>
            <Image style={{
              width: 115,
              height: 113.5,
              marginBottom: 40,
              marginTop: 90,
            }}
                   source={require('BiziboxUI/assets/bigBell.png')}/>
            <Text style={{
              textAlign: 'center',
              color: '#022258',
              fontSize: sp(22),
              fontFamily: fonts.semiBold,
            }}>
              {'אין לכם התראות חדשות,'}
            </Text>
            <Text style={{
              textAlign: 'center',
              color: '#022258',
              fontSize: sp(22),
              fontFamily: fonts.semiBold,
            }}>
              {'שיהיה יום  טוב ומוצלח!'}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>)
  }
}

@connect(state => ({
  currentCompanyId: state.currentCompanyId,
  isRtl: state.isRtl,
  accounts: getAccount(state),
  globalParams: state.globalParams,
}))
@withTranslation()
export default class MessagesScreen extends PureComponent {
  constructor (props) {
    super(props)

    const paramsLink = props.route.params.messageId

    this.state = {
      focusAsmachtaInput: false,
      indexRowActive: null,
      isActive: (paramsLink) || null,
      messagesArr: [],
      refreshing: false,
      isReady: true,
      inProgress: true,
      isLayoutComplete: false,
      currentScrollPosition: 0,
      scrollAnim: new Animated.Value(IS_IOS ? 0 : 0),
      type: 'popup',
      statusToken: null,
      currentToken: null,
      updateTokenModalIsOpen: false,
      categories: [],
      rowInfo: null,
      editRowModalOpen: false,
    }
  }

  handleSetScrollPosition = (e) => this.setState(
    { currentScrollPosition: e.nativeEvent.contentOffset.y })

  _onRefresh = () => {
    this.setState({ refreshing: true })
    this.handlerMessages(this.state.type)
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    this.setState({
      isLayoutComplete: true,
    })

    return this.handlerMessages(
      this.props.route.params.messageId ? 'page' : 'popup')
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  handleBackPress = () => {
    this.props.dispatch(setOpenedBottomSheet(false))

    goToBack(this.props.navigation)
    return true
  }

  handlerMessages = (type) => {
    this.setState({
      refreshing: true,
      inProgress: true,
    })
    this.getData(this.getMessages(type))
      .then((data) => {
        let messagesArr = []
        let indexRowActive = null
        if (data.length) {
          if (this.props.route.params.messageId) {
            indexRowActive = data.findIndex(
              (item) => item.messageId === this.props.route.params.messageId)
            if (indexRowActive !== -1) {
              indexRowActive = (indexRowActive + 1) * 90
            }
          }
          const indNew = data.filter((item) => item.indNew === true)
          if (indNew.length) {
            messagesArr.push({
              title: 'חדש',
              data: indNew,
            })
          }
          const indNotNew = data.filter((item) => item.indNew === false)
          if (indNotNew.length) {
            messagesArr.push({
              title: 'מוקדם יותר',
              data: indNotNew,
            })
          }
        }
        // console.log(messagesArr)
        this.setState({
          messagesArr,
          type,
          refreshing: false,
          inProgress: false,
          indexRowActive: indexRowActive,
        })

        if (this.props.route.params.messageId) {
          delete this.props.route.params.messageId

          setTimeout(() => {
            this.setState({
              isActive: null,
              indexRowActive: null,
            })
          }, 5000)
        }
      })
      .catch(() => {
        this.setState({
          messagesArr: [],
          type,
          refreshing: false,
          inProgress: false,
        })
      })
  }

  getMessages = (type) => {
    return messagesApi.post({
      body: {
        companyAccountIds: [],
        companyId: this.props.currentCompanyId,
        source: type,
      },
    })
  }

  updateMessages = (obj) => {
    this.getData(messagesUpdateApi.post({
      body: obj,
    }))
      .then(() => {
        if (obj.indRead !== undefined) {
          this.updateAsRead(obj.messageIds, obj.indRead)
        } else if (obj.indHide !== undefined) {
          this.updateAsHide(obj.messageIds[0])
        }

        return this.props.dispatch(
          getMessagesCount(this.props.currentCompanyId))
      })
      .catch(() => {

      })
  }

  doAction = (data, act) => {
    const { navigation } = this.props
    const action = act || data.linked_action
    switch (action) {
      case 'bankaccountByAccount':
        goTo(navigation, 'BANK_ACCOUNTS', {
          selectedAccountIds: [data.companyAccountId],
        })
        break
      case 'bankaccountBySearchword':
        goTo(navigation, 'BANK_ACCOUNTS', {
          selectedAccountIds: [data.companyAccountId],
          filterText: data.linked_text,
        })
        break
      case 'goToCyclicTrans':
        goTo(navigation, 'CYCLIC_TRANS', {
          selectedAccountIds: [data.companyAccountId],
          filterText: data.linked_text,
        })
        break
      case 'getTransHistory':
        goTo(navigation, 'CYCLIC_TRANS', {
          selectedAccountIds: [data.companyAccountId],
          transIdOpened: data.keyId,
        })
        break
      case 'removeAlert':
        goTo(navigation, 'CYCLIC_TRANS', {
          selectedAccountIds: [data.companyAccountId],
          transIdRemove: data.keyId,
        })
        break
      case 'averageThreeMonths':
        this.averageThreeMonths({
          companyAccountId: data.companyAccountId,
          targetType: data.keyType,
          transId: data.keyId,
        })
        break
      case 'tokenAlert':
        this.tokenAlert({
          indAlert: 0,
          tokenIds: [
            data.keyId,
          ],
        })
        break
      case 'returnTrans':
        this.returnTrans({
          companyAccountId: data.companyAccountId,
          transId: data.keyId,
        }, data.keyType)
        break
      case 'openPasswordPopup':
        this.getStatus(data.keyId)
        break
      case 'taryaPopup':
        const openTarya = this.props.globalParams.openTarya
        if (openTarya !== undefined) {
          this.props.dispatch(
            setGlobalParams(Object.assign(this.props.globalParams, {
              openTarya: openTarya + 1,
            })))
        } else {
          this.props.dispatch(
            setGlobalParams(Object.assign(this.props.globalParams, {
              openTarya: 0,
            })))
        }
        break
      case 'SlikaTwoMonths':
        goTo(navigation, 'SLIKA', {
          paramTo: 'SlikaTwoMonths',
        })
        break
      case 'SlikaThirteenMonths':
        goTo(navigation, 'SLIKA', {
          paramTo: 'SlikaThirteenMonths',
        })
        break
      case 'goToAccountSettings':
        goTo(navigation, 'SETTINGS', {
          paramsLinkAddCard: {
            goToUrl: BANK_ACCOUNTS_TAB,
          },
        })
        break

      case 'updateTazrimTransaction':
      case 'updateNonCyclicTransaction':
        this.handlePopRowEditsModal(data.keyId, data.companyAccountId,
          action === 'updateTazrimTransaction')
        break

      case 'showCheckDetails':
        goTo(navigation, 'BANK_ACCOUNTS', {
          selectedAccountIds: [data.companyAccountId],
          bankTransId: data.keyId,
        })
        break

      case 'showCheqimLemishmeret':
      case 'showCheqimLenicaion':
        goTo(navigation, CHECKS, {
          paramsLink: {
            queryStatus: action === 'showCheqimLemishmeret'
              ? 'mishmeret_babank'
              : 'lenicaion',
            checksMobileState: 'in-checks',
            selectedAccountIds: [data.companyAccountId],
          },
        })
        break

      case 'showCashflowChecks':
        goTo(navigation, 'CASH_FLOW', {
          selectedAccountIds: [data.companyAccountId],
          messageLink: true,
        })
        break

      default:
      // console.log('Sorry, we are out of ')
    }
  }
  handlePopRowEditsModal = (
    keyId, companyAccountId, isUpdateTazrimTransaction) => {
    const companyAccountIds = [companyAccountId]
    getAccountCflTransTypeApi.post(
      { body: { uuid: this.props.currentCompanyId } })
      .then(data => {
        this.setState({ categories: data.filter(item => item.shonaScreen) })

        cashFlowDetailsDataApi.post({
          body: {
            companyAccountIds: companyAccountIds,
            companyId: this.props.currentCompanyId,
            dateFrom: AppTimezone.moment(AppTimezone.moment().valueOf())
              .toISOString(),
            dateTill: AppTimezone.moment(
              AppTimezone.moment().add(30, 'days').valueOf()).toISOString(),
            expence: -1,
          },
        }).then((data) => {
          const rowInfo = data.cashFlowDetails.filter(
            (it) => it.transId === keyId)
          if (rowInfo.length) {
            if (!isUpdateTazrimTransaction) {
              if (rowInfo[0].nigreret) {
                rowInfo[0].originalDate = AppTimezone.moment()
                  .add(30, 'days')
                  .valueOf()
              } else {
                rowInfo[0].transDate = AppTimezone.moment()
                  .add(30, 'days')
                  .valueOf()
              }
            }
            this.setState({
              rowInfo: rowInfo[0],
              editRowModalOpen: true,
              focusAsmachtaInput: isUpdateTazrimTransaction,
            })
          }
        })
          .catch(() => {
          })
      })
  }

  updateRow = () => {
    this.setState({
      editRowModalOpen: false,
    })
  }
  getAllMessages = () => {
    this.handlerMessages('page')
  }

  averageThreeMonths = (obj) => {
    cyclicSingelApi.post({
      body: obj,
    })
      .then(data => {
        new Api({ endpoint: `cyclic-trans/cfl/${obj.targetType}/update` }).post(
          {
            body: {
              autoUpdateTypeName: 'AVG_3_MONTHS',
              companyAccountId: obj.companyAccountId,
              targetType: obj.targetType,
              transId: obj.transId,
            },
          })
          .then(data => {

          })
          .catch(() => {

          })
      })
      .catch(() => {

      })
  }
  tokenAlert = (obj) => {
    tokenAlertApi.post({
      body: obj,
    })
      .then(data => {

      })
      .catch(() => {

      })
  }
  returnTrans = (obj, targetType) => {
    new Api({ endpoint: `cyclic-trans/cfl/${targetType}/return` }).post({
      body: obj,
    })
      .then(data => {

      })
      .catch(() => {

      })
  }
  getStatus = (token) => {
    if (this.props.currentCompanyId) {
      return getStatusTokenTypeApi.post({
        body: {
          companyId: this.props.currentCompanyId,
          tokens: [token],
        },
      })
        .then(([newTokenStatus]) => {
          const statusCode = BankTokenService.getTokenStatusCode(
            newTokenStatus.tokenStatus)
          this.setState({ statusToken: statusCode })
          this.setState({
            currentToken: newTokenStatus,
            updateTokenModalIsOpen: true,
          })
        })
        .catch(() => this.setState({ inProgress: false }))
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

  renderFakeHeader = () => {
    return <Animated.View
      style={{
        flex: 1,
        height: 0,
        backgroundColor: 'transparent',
      }}
    />
  }
  renderTitleSectionHeader = ({ section }) => {
    return (
      <View style={styles.sectionTitleWrapper}>
        <View style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: colors.white,
          height: 20,
          width: 'auto',
          flexDirection: 'row-reverse',
          paddingHorizontal: 10,
          borderBottomColor: '#e7e6e6',
          borderBottomWidth: 1,
        }}>
          <Text style={[
            styles.sectionTitleText, {
              textAlign: 'right',
              color: '#022258',
              fontSize: sp(15),
              fontFamily: fonts.semiBold,
            }]}>{section.title}</Text>
        </View>
      </View>
    )
  }
  renderItemSeparator = () => <View style={{
    height: 1,
    flex: 1,
    backgroundColor: '#e7e6e6',
  }}/>
  renderScrollItem = ({ item, index }) => {
    const {
      isRtl,
    } = this.props
    const {
      isActive,
    } = this.state

    return (
      <Message
        isActive={item.messageId === isActive}
        doAction={this.doAction}
        updateMessages={this.updateMessages}
        isRtl={isRtl}
        data={item}
      />
    )
  }
  marksAllAsRead = () => {
    this.updateMessages({
      messageIds: this.getMessageIds,
      indRead: true,
    })
  }

  get getMessageIds () {
    const {
      messagesArr,
    } = this.state
    let messageIds
    if (messagesArr && messagesArr.length) {
      const messagesArrFirst = messagesArr[0].data.filter(
        (item) => item.indRead === false).map((it) => it.messageId)
      if (messagesArr.length > 1) {
        messageIds = messagesArrFirst.concat(
          messagesArr[1].data.filter((item) => item.indRead === false)
            .map((it) => it.messageId))
      } else {
        messageIds = messagesArrFirst
      }
    }
    return messageIds
  }

  updateAsHide = (id) => {
    const messagesArr = JSON.parse(JSON.stringify(this.state.messagesArr))

    const indexToDelete = messagesArr[0].data.findIndex(
      element => element.messageId === id)
    if (indexToDelete !== -1) {
      messagesArr[0].data.splice(indexToDelete, 1)
    }

    if (messagesArr.length > 1) {
      const indexToDelete = messagesArr[1].data.findIndex(
        element => element.messageId === id)
      if (indexToDelete !== -1) {
        messagesArr[1].data.splice(indexToDelete, 1)
      }
    }

    this.setState({ messagesArr })
  }
  updateAsRead = (id, read) => {
    const messagesArr = JSON.parse(JSON.stringify(this.state.messagesArr))
    messagesArr[0].data.forEach((it) => {
      if (id.some((item) => item === it.messageId)) {
        it.indRead = read
      }
    })
    if (messagesArr.length > 1) {
      messagesArr[1].data.forEach((it) => {
        if (id.some((item) => item === it.messageId)) {
          it.indRead = read
        }
      })
    }
    this.setState({ messagesArr })
  }
  handleCloseUpdateTokenModal = () => this.setState({
    currentToken: null,
    updateTokenModalIsOpen: false,
  })

  render () {
    const {
      isLayoutComplete,
      scrollAnim,
      messagesArr,
      isReady,
      inProgress,
      type,
      currentToken,
      updateTokenModalIsOpen,
      isActive,
      indexRowActive,
      rowInfo,
      editRowModalOpen,
      focusAsmachtaInput,
      categories,
    } = this.state

    const { t, currentCompanyId, accounts } = this.props
    if (!isLayoutComplete || !isReady || inProgress) {return <Loader/>}

    return (
      <SafeAreaView style={[
        {
          flex: 1,
          width: '100%',
          backgroundColor: colors.white,
        }]}>
        <AnimatedSectionList
          ref={scrollView => (this.scrollView = scrollView)}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          extraData={this.state.refreshing}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollAnim } } }], {
              useNativeDriver: true,
            })}
          renderScrollComponent={(props) => <ScrollCompWithHeader props={props}
                                                                  propsPage={messagesArr}
                                                                  type={type}
                                                                  getMessageIds={this.getMessageIds}
                                                                  isActive={isActive}
                                                                  indexRowActive={indexRowActive}
                                                                  marksAllAsRead={this.marksAllAsRead}/>}
          bounces
          bouncesZoom
          enableOnAndroid
          removeClippedSubviews
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled
          onScrollEndDrag={this.handleSetScrollPosition}
          onMomentumScrollEnd={this.handleSetScrollPosition}
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
            }]}
          ListHeaderComponent={this.renderFakeHeader}
          scrollEventThrottle={IS_IOS ? 16 : 1}
          sections={messagesArr}
          renderItem={this.renderScrollItem}
          renderSectionHeader={this.renderTitleSectionHeader}
          ItemSeparatorComponent={this.renderItemSeparator}
          keyExtractor={(item, i) => `${item.messageId}_${i}`}
          initialNumToRender={55}
          windowSize={5}
        />

        {type === 'popup' && (<View style={{
          height: 30,
          alignContent: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#dfdede',
          shadowColor: '#dfdede',
          shadowOpacity: 0.4,
          shadowOffset: {
            width: 0,
            height: -3,
          },
          elevation: 4,
        }}>
          <TouchableOpacity
            onPress={this.getAllMessages}>
            <Text style={{
              fontFamily: fonts.semiBold,
              color: '#037dba',
              fontSize: sp(15),
              textAlign: 'center',
            }}>
              {'לכל ההתראות'}
            </Text>
          </TouchableOpacity>
        </View>)}

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

        {editRowModalOpen && (
          <EditRowModal
            focusAsmachtaInput={focusAsmachtaInput}
            categories={categories}
            screen={'CashFlowScreen'}
            currentCompanyId={currentCompanyId}
            accounts={accounts}
            dataOfRow={rowInfo}
            updateRow={this.updateRow}
          />
        )}
      </SafeAreaView>
    )
  }
}
