import React, { Fragment, PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import {
  Animated,
  Image,
  Keyboard,
  Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { WebView } from 'react-native-webview'
import { colors, fonts } from '../../../../styles/vars'
import {
  downloadInvoiceApi,
  endBiziboxServiceApi,
  getBillingAccountDetailsApi,
  getBillingHistoryApi,
  getCardcomClientApi,
  getCitiesApi,
  getUserBillingAccountsApi,
  sendInvoiceMailApi,
  updateBillingAccountApi,
} from '../../../../api'
import styles from '../../../../components/EditRowModal/EditRowModalStyles'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import commonStyles from '../../../../styles/styles'
import {
  combineStyles as cs,
  getBankTransIcon,
  getEmoji,
  sp,
} from '../../../../utils/func'
import AppTimezone from '../../../../utils/appTimezone'
import { IS_IOS } from '../../../../constants/common'
import { Button, CheckBox } from 'react-native-elements'
import Modals from '../../../../components/Modal/Modal'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CustomIcon from 'src/components/Icons/Fontello'

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)

@withTranslation()
export default class PaymentsTab extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      cities: [],
      citiesFilter: [],
      billingAccounts: null,
      idx: 0,
      refreshing: false,
      modalChangeBillingAccounts: false,
      showListOfCompanies: false,
      getBillingAccountDetails: [],
      getBillingHistory: [],
      showModalBillingHistory: false,
      emailAddressParamas: {},
      openModalEmail: false,
      mailValid: true,
      mailIsHebrew: false,
      inProgress: false,
      showWebView: false,
      companyNameValid: true,
      contactMailValid: true,
      modalCitiesShow: false,
      currentCity: '',
      contactPhoneValid: true,
      companyHpValid: true,
      emailSide: 'right',
      companyIdSide: 'right',
      billingAccountPhoneSide: 'right',
      modalEndOfService: false,
      fadeAnim: new Animated.Value(1),
      listReasons: [
        {
          'text': 'מחיר',
          'checked': false,
        },
        {
          'text': 'שירות',
          'checked': false,
        },
        {
          'text': 'המוצר אינו עונה על צרכיי',
          'checked': false,
        },
        {
          'text': 'אחר',
          'checked': true,
        },
      ],
      text: '',
    }
  }

  get currentCompany () {
    const { companies, currentCompanyId } = this.props
    if (!companies || !companies.length) {return {}}
    return companies.find(c => c.companyId === currentCompanyId) || {}
  }

  get companiesLite () {
    const { billingAccounts, idx } = this.state
    const { companies } = this.props
    if (companies && companies.length && billingAccounts &&
      billingAccounts.length) {
      const companiesLite = companies.filter(c => c.biziboxType === 'regular')
      if (companiesLite.length) {
        const idAllCompanies = billingAccounts[idx].companies.map(
          (id) => id.companyId)
        return idAllCompanies.every(
          (id) => companiesLite.filter((ids) => ids.companyId === id).length)
      }
    }
    return false
  }

  getUserBillingAccounts = () => {
    getUserBillingAccountsApi.get()
      .then((billingAccounts) => {
        this.setState({
          billingAccounts,
          refreshing: false,
        })
        if (billingAccounts.length) {
          setTimeout(() => this.getBillingAccountDetails(), 20)
        }
      })
  }

  getBillingAccountDetails = () => {
    const { billingAccounts, idx } = this.state

    const param = {
      'billingAccountId': billingAccounts[idx].billingAccountId,
      'companyIds': billingAccounts[idx].companies.map((id) => id.companyId),
    }
    getBillingAccountDetailsApi.post({
      body: param,
    })
      .then((getBillingAccountDetails) => {
        this.setState({
          inProgress: false,
          getBillingAccountDetails,
        })
      })
  }

  getCardcomClient = () => {
    const { currentCompanyId } = this.props
    const { getBillingAccountDetails } = this.state

    getCardcomClientApi.post({
      body: {
        'billingAccountAddress': getBillingAccountDetails.billingAccountAddress,
        'billingAccountCityId': getBillingAccountDetails.billingAccountCityId,
        'billingAccountCompanyName': getBillingAccountDetails.billingAccountCompanyName,
        'billingAccountEmail': getBillingAccountDetails.billingAccountEmail,
        'billingAccountHp': getBillingAccountDetails.billingAccountHp,
        'billingAccountId': getBillingAccountDetails.billingAccountId,
        'billingAccountName': getBillingAccountDetails.billingAccountName,
        'billingAccountPhone': getBillingAccountDetails.billingAccountPhone,
        'companyId': currentCompanyId,
        'leloMaam': getBillingAccountDetails.leloMaam,
      },
    }).then((url) => {
      if (typeof url === 'string' && url.startsWith('http')) {
        this.setState({
          showWebView: url,
        })
      }
    })
  }
  showWebView = () => {
    this.setState({
      showWebView: false,
    })
  }
  getBillingHistory = () => {
    const { getBillingAccountDetails } = this.state

    getBillingHistoryApi.post({
      body: {
        uuid: getBillingAccountDetails.billingAccountId,
      },
    })
      .then((getBillingHistory) => {
        this.setState({
          getBillingHistory,
          showModalBillingHistory: true,
        })
      })
  }

  downloadInvoice = (item) => () => {
    downloadInvoiceApi.post({
      body: {
        'invoiceNumber': item.invoiceNumber,
        'invoiceresponseInvoicetype': item.invoiceresponseInvoicetype,
      },
    }).then(() => {

    })
  }

  openSendEmail = (item) => () => {
    this.setState({
      emailAddressParamas: {
        'emailAddress': this.state.getBillingAccountDetails.billingAccountEmail,
        'invoiceNumber': item.invoiceNumber,
        'invoiceresponseInvoicetype': item.invoiceresponseInvoicetype,
      },
      openModalEmail: true,
    })
  }

  componentDidMount () {
    getCitiesApi.get()
      .then(cities => {
        let citiesArr = JSON.parse(JSON.stringify(cities))
        citiesArr = citiesArr.reduce((memo, trans, currentIndex) => {
          const title = trans.cityName.substring(0, 1)
          const oldIndex = memo.findIndex(item => item.title === title)
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
          .sort((a, b) => (a.data[0].cityName > b.data[0].cityName) ? 1 : -1)
        this.setState({
          cities: cities,
          citiesFilter: citiesArr,
        })
      })
    this.getUserBillingAccounts()
  }

  _onRefresh = (isRefresh) => {
    this.setState(
      { refreshing: (!(isRefresh !== undefined && isRefresh === false)) })
    this.getUserBillingAccounts()
  }

  openModalChangeBillingAccounts = () => {
    this.setState({
      modalChangeBillingAccounts: true,
    })
  }
  closeModalChangeBillingAccounts = () => {
    this.setState({
      modalChangeBillingAccounts: false,
    })
  }

  closeModalBillingHistory = () => {
    this.setState({
      showModalBillingHistory: false,
    })
  }

  changeIdxBillingAccounts = (idx) => () => {
    this.setState({
      idx,
      modalChangeBillingAccounts: false,
      showListOfCompanies: false,
    })
    setTimeout(() => this.getBillingAccountDetails(), 20)
  }

  openShowListOfCompanies = () => {
    this.setState({
      showListOfCompanies: !this.state.showListOfCompanies,
    })
  }
  handleGoToBusinessDetailsTab = () => {
    const { handleSetTab } = this.props
    return handleSetTab('BUSINESS_DETAILS_TAB')
  }

  handleCloseModalEmail = () => {
    this.setState({
      openModalEmail: false,
      emailAddressParamas: {},
    })
  }

  handleUpdateFieldValidAsyncPop = (e) => {
    const { mail } = this.state
    const re = /\S+@\S+\.\S+/
    let val = (IS_IOS ? e.nativeEvent.text : mail) || ''
    if (val && re.test(val) && val.length > 0) {

    } else {
      const isHebrew = (val && /[\u0590-\u05FF]/.test(val))
      this.setState({
        'mailValid': false,
        mailIsHebrew: isHebrew,
      })
    }
  }

  handleUpdateFieldPop = name => val => {
    let value = val || ''
    value = value.toString().replace(getEmoji(), '').replace(/\s+/g, '')
    let emailAddressParamas = Object.assign({}, this.state.emailAddressParamas)
    emailAddressParamas.emailAddress = value
    this.setState({ emailAddressParamas })
    this.handleUpdateFieldValidPop('mailValid')({
      nativeEvent: {
        text: value,
      },
    })
  }

  handleUpdateFieldValidPop = name => val => {
    let value = val.nativeEvent.text || ''
    const re = /\S+@\S+\.\S+/
    const isHebrew = (value && /[\u0590-\u05FF]/.test(value))
    const mailValid = (value && re.test(value) && value.length > 0)
    this.setState({
      [name]: mailValid,
      mailIsHebrew: isHebrew,
    })
  }

  onFocusInput = name => val => {
    this.setState({
      [name]: 'left',
    })
  }

  handleUpdateField = name => val => {
    let value = val || ''
    value = value.toString().replace(getEmoji(), '')

    if (name === 'billingAccountEmail') {
      value = value.toString().replace(/([\u05D0-\u05FF/\s+]+)/g, '')
    } else if (name === 'billingAccountPhone') {
      value = value.toString().replace(/[^\d-]/g, '')
    } else if (name === 'billingAccountHp') {
      value = value.toString().replace(/[^\d]/g, '')
    }

    let getBillingAccountDetails = Object.assign({},
      this.state.getBillingAccountDetails)
    getBillingAccountDetails[name] = value
    this.setState({ getBillingAccountDetails })

    if (name === 'billingAccountEmail') {
      this.handleUpdateFieldValid('contactMailValid', true)({
        nativeEvent: {
          text: value,
        },
      })
    } else if (name === 'billingAccountCompanyName') {
      this.handleUpdateFieldValid('companyNameValid', true)({
        nativeEvent: {
          text: value,
        },
      })
    } else if (name === 'billingAccountHp') {
      this.handleUpdateFieldValid('companyHpValid', true)({
        nativeEvent: {
          text: value,
        },
      })
    }
  }
  handleUpdateFieldValid = (name, isKey) => val => {
    let value = val.nativeEvent.text || ''

    if (name === 'contactMailValid') {
      const re = /\S+@\S+\.\S+/
      const isHebrew = !!(value && value.length > 0 &&
        /[\u0590-\u05FF]/.test(value))
      const contactMailValid = !!(value && value.length > 0 && re.test(value))
      this.setState({
        [name]: contactMailValid,
        mailIsHebrew: isHebrew,
      })
    } else if (name === 'contactPhoneValid') {
      this.setState({
        billingAccountPhoneSide: 'right',
        [name]: value && (value.length === 10 || value.length === 11) &&
        new RegExp(
          '(050|052|053|054|055|057|058|02|03|04|08|09|072|073|076|077|078)-?\\d{7,7}').test(
          value),
      })
    } else if (name === 'companyNameValid') {
      this.setState(
        { [name]: value && (value.length !== 0 && value.length < 40) })
    } else if (name === 'companyHpValid') {
      let result = false
      const c = {
        value: Number(value),
      }
      if (c.value) {
        const digits = Array.from(
          String(c.value).replace(/\D/g, '').padStart(9, '0'))
          .map(ch => +ch)

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
        [name]: value && (value.length === 9 && result),
        companyIdSide: 'right',
      })
    } else {
      this.setState(
        { [name]: value && (value.length !== 0 && value.length < 30) })
    }
    if (!isKey) {
      setTimeout(() => this.handleUpdateCompany(false), 150)
    }
  }
  handleUpdateFieldValidAsync = (e) => {
    this.setState({
      emailSide: 'right',
    })
    const { getBillingAccountDetails } = this.state
    const re = /\S+@\S+\.\S+/
    let val = (IS_IOS
      ? e.nativeEvent.text
      : getBillingAccountDetails.billingAccountEmail) || ''
    if (val && re.test(val) && val.length > 0) {
      setTimeout(() => this.handleUpdateCompany(), 150)
    } else {
      const isHebrew = (val && /[\u0590-\u05FF]/.test(val))
      this.setState({
        'contactMailValid': false,
        mailIsHebrew: isHebrew,
      })
    }
  }
  sendInvoiceMail = () => {
    const { emailAddressParamas, mailValid, inProgress } = this.state

    if (inProgress || !(
      mailValid && emailAddressParamas.emailAddress.length > 0
    )) {
      return
    }
    Keyboard.dismiss()
    this.setState({ inProgress: true })

    return sendInvoiceMailApi.post({
      body: emailAddressParamas,
    })
      .then(() => {
        this.setState({
          inProgress: false,
          emailAddressParamas: {},
          openModalEmail: false,
        })
      })
      .catch(() => {

      })
  }

  handleToggleProgramName = () => {
    let getBillingAccountDetails = Object.assign({}, this.state.getBillingAccountDetails)
    getBillingAccountDetails.leloMaam = !getBillingAccountDetails.leloMaam
    this.setState({ getBillingAccountDetails }, ()=>{
      this.handleUpdateCompany()
    })
  }

  handleUpdateCompany = (isRefresh) => {
    const {
      inProgress,
      contactMailValid,
      companyNameValid,
      getBillingAccountDetails,
      companyHpValid,
    } = this.state
    if (inProgress || !(
      contactMailValid && companyNameValid && companyHpValid &&
      getBillingAccountDetails.billingAccountHp &&
      String(getBillingAccountDetails.billingAccountHp).length > 0 &&
      getBillingAccountDetails.billingAccountEmail &&
      getBillingAccountDetails.billingAccountEmail.length > 0 &&
      getBillingAccountDetails.billingAccountCompanyName &&
      getBillingAccountDetails.billingAccountCompanyName.length > 0
    )) {
      return
    }

    Keyboard.dismiss()
    this.setState({ inProgress: true })
    const obj = {
      'billingAccountAddress': getBillingAccountDetails.billingAccountAddress,
      'billingAccountCityId': getBillingAccountDetails.billingAccountCityId,
      'leloMaam': getBillingAccountDetails.leloMaam,
      'billingAccountCompanyName': getBillingAccountDetails.billingAccountCompanyName,
      'billingAccountEmail': getBillingAccountDetails.billingAccountEmail,
      'billingAccountHp': getBillingAccountDetails.billingAccountHp,
      'billingAccountId': getBillingAccountDetails.billingAccountId,
      'billingAccountName': getBillingAccountDetails.billingAccountName,
      'billingAccountPhone': getBillingAccountDetails.billingAccountPhone,
    }
    updateBillingAccountApi.post({
      body: obj,
    })
      .then(() => {
        this.setState({ inProgress: false })
        // this._onRefresh(isRefresh)
      })
      .catch(() => {
        this.setState({ inProgress: false })
      })
  }
  openModalCities = () => {
    this.setState({
      modalCitiesShow: true,
    })
  }
  modalCitiesClose = () => {
    this.setState({
      modalCitiesShow: false,
    })
  }
  handleFilterField = val => {
    let value = val || ''
    this.setState({ currentCity: value })
    setTimeout(() => this.filterCity(), 40)
  }
  handleFilter = val => {
    let value = val.nativeEvent.text || ''
    this.setState({ currentCity: value })
    setTimeout(() => this.filterCity(), 40)
  }
  filterCity = () => {
    let citiesArr = JSON.parse(JSON.stringify(this.state.cities))
    if (this.state.currentCity && this.state.currentCity.length > 0) {
      citiesArr = citiesArr.filter(
        (item) => item.cityName.includes(this.state.currentCity))
    }
    citiesArr = citiesArr.reduce((memo, trans, currentIndex) => {
      const title = trans.cityName.substring(0, 1)
      const oldIndex = memo.findIndex(item => item.title === title)
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
      .sort((a, b) => (a.data[0].cityName > b.data[0].cityName) ? 1 : -1)
    this.setState({
      citiesFilter: citiesArr,
    })
  }

  setCity = (city) => () => {
    let getBillingAccountDetails = Object.assign({},
      this.state.getBillingAccountDetails)
    getBillingAccountDetails.billingAccountCityId = city.cityId
    this.setState({
      getBillingAccountDetails,
      modalCitiesShow: false,
    })
    setTimeout(() => this.handleUpdateCompany(), 40)
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
    return (
      <View style={{
        height: 33,
        flexDirection: 'row-reverse',
        justifyContent: 'flex-start',
        alignItems: 'center',
      }}>
        <TouchableOpacity onPress={this.setCity(item)}>
          <Text style={{
            paddingRight: 10,
          }}>{item.cityName}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  handleToggleCheck = (i) => () => {
    const { listReasons } = this.state
    const listReasonsCopy = JSON.parse(JSON.stringify(listReasons))
    listReasonsCopy[i].checked = !listReasonsCopy[i].checked
    this.setState({
      listReasons: listReasonsCopy,
    })
  }

  getIconName (paymentTypeId) {
    if (paymentTypeId === 1) {
      return 'cash'
    } else if (paymentTypeId === 2) {
      return 'Checks'
    } else if (paymentTypeId === 3) {
      return 'credit'
    } else if (paymentTypeId === 4) {
      return 'BankTransfer'
    } else if (paymentTypeId === 5) {
      return 'DirectDebit'
    } else {
      return 'Other'
    }
  }

  handleLinkSignBizibox = () => {
    const link = 'https://bizibox.biz/contact-us/'
    Linking.canOpenURL(link)
      .then(s => {
        if (s) {Linking.openURL(link)}
      })
  }

  handleSendEmail = () => {
    const url = 'mailto:service@bizibox.biz?subject=&body=&cc=&bcc='
    Linking.canOpenURL(url)
      .then(s => {
        if (s) {Linking.openURL(url)}
      })
  }

  endBiziboxService = () => {
    const { billingAccounts, idx, text, listReasons } = this.state
    this.animatedTime()
    const param = {
      'companyIds': billingAccounts[idx].companies.map((id) => id.companyId),
      'reason': listReasons.filter((it) => it.checked)
        .map(item => item.text)
        .join(),
      'text': text,
    }
    endBiziboxServiceApi.post({
      body: param,
    })
      .then(() => {
        this._onRefresh(true)
      })
  }

  cancelService = () => {
    this.setState({ modalEndOfService: true })

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
        duration: 300,
        useNativeDriver: true,
      },
    ).start(() => {
      this.setState({ modalEndOfService: false })
    })
  }
  handleChangeFields = (val) => {
    let value = val || ''
    value = value.toString().replace(getEmoji(), '')
    this.setState({
      text: value,
    })
  }

  render () {
    const { isRtl, t } = this.props
    const {
      billingAccounts,
      idx,
      modalChangeBillingAccounts,
      showListOfCompanies,
      getBillingAccountDetails,
      cities,
      showModalBillingHistory,
      getBillingHistory,
      openModalEmail,
      emailAddressParamas,
      mailIsHebrew,
      mailValid,
      inProgress,
      showWebView,
      companyNameValid,
      modalCitiesShow,
      currentCity,
      citiesFilter,
      contactMailValid,
      companyHpValid,
      emailSide,
      companyIdSide,
      billingAccountPhoneSide,
      modalEndOfService,
      fadeAnim,
      listReasons,
      text,
    } = this.state

    const companiesLite = this.companiesLite

    return (
      <SafeAreaView style={[
        {
          flex: 1,
          height: '100%',
          position: 'relative',
          backgroundColor: colors.white,
        }]}>
        {showWebView && (
          <Modals
            isOpen
            title={'תהליך רכישה'}
            onLeftPress={this.showWebView}
            leftText={'יציאה'}
          >
            <WebView
              source={{ uri: showWebView }}
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
          </Modals>
        )}
        {showListOfCompanies && (
          <View style={{
            flex: 1,
            maxHeight: 200,
            zIndex: 99,
            position: 'absolute',
            top: 67,
            right: 1,
            left: 1,
            shadowColor: '#000000',
            shadowOpacity: 0.1,
            shadowOffset: {
              width: 0,
              height: 4,
            },
            elevation: 4,
          }}>
            {billingAccounts && billingAccounts.length > 0 &&
            billingAccounts[idx].companies.length > 1 && (
              <ScrollView
                style={[
                  styles.accountsContainer, {
                    flex: 1,
                    position: 'relative',
                  }]}
                contentContainerStyle={[
                  styles.tableWrapper, {
                    flexGrow: 1,
                    paddingTop: 0,
                    backgroundColor: '#fff',
                    marginTop: 0,
                    paddingBottom: 0,
                  }]}>

                <View style={{
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                }}>
                  <View style={{
                    flex: 95,
                    alignItems: 'center',
                  }}>
                    {billingAccounts[idx].companies.map((item, i) => (
                      <View
                        key={item.companyId}
                        style={{
                          alignItems: 'center',
                          paddingVertical: 5,
                        }}>
                        <Text style={{
                          textAlign: 'center',
                          color: '#022258',
                          fontSize: sp(16),
                          fontFamily: fonts.semiBold,
                        }}>{item.companyName}</Text>
                      </View>
                    ))}
                  </View>

                  {billingAccounts && billingAccounts.length > 1 && (
                    <View
                      style={{
                        flex: 10,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                      }}/>
                  )}

                </View>

              </ScrollView>
            )}
          </View>
        )}

        {modalEndOfService !== false && (
          <Modal
            animationType="slide"
            transparent
            visible={modalEndOfService}>
            <Animated.View style={{
              opacity: fadeAnim,
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
                onPress={this.animatedTime}/>

              <View style={{
                marginTop: 145,
                width: 715 / 2,
                height: 444,
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
                <Fragment>
                  <TouchableOpacity
                    style={{
                      height: 20,
                      marginBottom: 0,
                      marginTop: 5,
                      alignSelf: 'flex-start',
                      marginLeft: 10,
                    }}
                    onPress={this.animatedTime}>
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
                    alignItems: 'center',
                    alignContent: 'center',
                    alignSelf: 'center',
                    marginBottom: 10,
                  }}>
                    <Text
                      style={{
                        marginTop: 4,
                        color: '#022258',
                        fontSize: sp(19.5),
                        fontFamily: fonts.bold,
                      }}>{'ביטול שירות'}</Text>
                    <Image
                      style={{
                        width: 93.5,
                        height: 22,
                        marginHorizontal: 5,
                      }}
                      source={require('BiziboxUI/assets/logoEndService.png')}/>
                  </View>
                  <View style={{
                    width: '100%',
                    flexDirection: 'row-reverse',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    alignSelf: 'center',
                    height: 38,
                    backgroundColor: '#dde7f1',
                    marginBottom: 10,
                  }}>
                    <Text
                      style={{
                        color: '#022258',
                        fontSize: sp(18.5),
                        lineHeight: 38,
                        fontFamily: fonts.regular,
                      }}>{'בקשתך התקבלה, נציגנו יצור איתך קשר בהקדם'}</Text>
                  </View>
                  <View style={{
                    paddingHorizontal: 17,
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    alignSelf: 'flex-end',
                  }}>
                    <Text style={{
                      color: '#022258',
                      fontSize: sp(17),
                      textAlign: 'right',
                      fontFamily: fonts.regular,
                    }}>{'ספרו לנו מהי סיבת הביטול'}</Text>
                  </View>
                  <View style={{
                    paddingHorizontal: 10,
                    marginTop: 10,
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    alignContent: 'flex-end',
                    alignSelf: 'flex-end',
                  }}>
                    {listReasons.map((f, i) => {
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
                              lineHeight: 22,
                              fontWeight: 'normal',
                              color: '#022258',
                              fontSize: sp(17),
                              textAlign: 'right',
                              fontFamily: fonts.regular,
                              // right: 0,
                              // left: 0,
                              // justifyContent: 'space-between',
                              // width: '87%',
                              margin: 0,
                              padding: 0,
                            }}
                            size={22}
                            right
                            checkedColor="#0addc1"
                            uncheckedColor="#dddddd"
                            title={f.text}
                            iconRight
                            iconType="material-community"
                            checkedIcon="check"
                            uncheckedIcon="check"
                            checked={f.checked}
                            onPress={this.handleToggleCheck(i)}
                          />
                        </View>
                      )
                    })}
                  </View>

                  <View>
                    <View style={[
                      commonStyles.row, {
                        height: 100,
                        width: '100%',
                        marginHorizontal: 23,
                        backgroundColor: '#ffffff',
                        borderBottomColor: '#f0eff1',
                        borderBottomWidth: 1,
                        borderTopColor: '#f0eff1',
                        borderTopWidth: 1,
                        paddingHorizontal: 10,
                      }]}>
                      <TextInput
                        editable
                        onSubmitEditing={Keyboard.dismiss}
                        autoCorrect={false}
                        autoCapitalize="sentences"
                        returnKeyType="done"
                        keyboardType="default"
                        multiline
                        placeholder={'מלל חופשי'}
                        placeholderTextColor="#a7a3a3"
                        numberOfLines={8}
                        underlineColorAndroid="transparent"
                        style={[
                          {
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 100,
                            fontSize: sp(15),
                            width: '100%',
                            textAlignVertical: 'top',
                          }, commonStyles.regularFont]}
                        onChangeText={this.handleChangeFields}
                        onEndEditing={(e) => {
                          this.setState({
                            text: e.nativeEvent.text.toString()
                              .replace(getEmoji(), ''),
                          })
                        }}
                        value={text}
                      />
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={this.endBiziboxService}
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
                    }}>{'שליחה'}</Text>
                  </TouchableOpacity>
                </Fragment>
              </View>
            </Animated.View>
          </Modal>

        )}
        <KeyboardAwareScrollView
          // refreshControl={
          //   <RefreshControl
          //     refreshing={refreshing}
          //     onRefresh={this._onRefresh}
          //   />
          // }
          onScroll={(e) => {
            this.setState({
              showListOfCompanies: false,
            })
          }}
          extraHeight={10}
          enableOnAndroid
          scrollEnabled
          extraScrollHeight={40}
          keyboardShouldPersistTaps="always"
          showsVerticalScrollIndicator={false}
          style={{
            backgroundColor: 'white',
            flex: 1,
            position: 'relative',
            maxHeight: '100%',
          }}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: 0,
              overflow: 'hidden',
              paddingBottom: 0,
            }]}
          scrollEventThrottle={16}>

          {billingAccounts && billingAccounts.length === 0 && (
            <Fragment>
              <Text style={{
                paddingHorizontal: 20,
                paddingVertical: 40,
                textAlign: 'center',
                color: '#022258',
                fontSize: sp(18),
                lineHeight: 20,
                fontFamily: fonts.semiBold,
              }}>{'מרכז התמיכה פתוח בימים א\'-ה\', בין השעות 09:00-18:00. טלפון 03-5610382 או service@bizibox.biz *2365'}</Text>
            </Fragment>
          )}

          {billingAccounts && billingAccounts.length > 0 && (
            <Fragment>
              <View style={{
                height: 65,
                backgroundColor: '#d9e7ee',
                flexDirection: 'row-reverse',
                alignItems: 'center',
              }}>
                <View style={{
                  flex: 95,
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {billingAccounts && billingAccounts.length > 0 && (
                    <View style={{
                      // flex: 5,
                    }}>
                      {billingAccounts[idx].billingAccountId ===
                      '00000000-0000-0000-0000-000000000000' && (
                        <Image
                          resizeMode="contain"
                          style={{
                            width: 24,
                            height: 24,
                            marginHorizontal: 10,
                          }}
                          source={require('BiziboxUI/assets/waiting.png')}/>
                      )}
                      {billingAccounts[idx].billingAccountId !==
                      '00000000-0000-0000-0000-000000000000' &&
                      billingAccounts[idx].paymentTypeId === 3 && (
                        <Fragment>
                          {(billingAccounts[idx].extspMutag24 === 0) && (<Image
                            resizeMode="contain"
                            style={{
                              width: 20,
                              height: 20,
                              marginHorizontal: 10,
                            }}
                            source={require(
                              'BiziboxUI/assets/creditIc.png')}/>)}

                          {(billingAccounts[idx].extspMutag24 === 1) && (<Image
                            resizeMode="contain"
                            style={{
                              width: 20,
                              height: 20,
                              marginHorizontal: 10,
                            }}
                            source={require(
                              'BiziboxUI/assets/billing1.png')}/>)}

                          {(billingAccounts[idx].extspMutag24 === 2) && (<Image
                            resizeMode="contain"
                            style={{
                              width: 20,
                              height: 20,
                              marginHorizontal: 10,
                            }}
                            source={require(
                              'BiziboxUI/assets/billing2.png')}/>)}

                          {(billingAccounts[idx].extspMutag24 === 3) && (<Image
                            resizeMode="contain"
                            style={{
                              width: 20,
                              height: 20,
                              marginHorizontal: 10,
                            }}
                            source={require('BiziboxUI/assets/maestro.png')}/>)}

                          {(billingAccounts[idx].extspMutag24 === 4) && (<Image
                            resizeMode="contain"
                            style={{
                              width: 20,
                              height: 20,
                              marginHorizontal: 10,
                            }}
                            source={require(
                              'BiziboxUI/assets/billing4.png')}/>)}

                          {(billingAccounts[idx].extspMutag24 === 5) && (<Image
                            resizeMode="contain"
                            style={{
                              width: 20,
                              height: 20,
                              marginHorizontal: 10,
                            }}
                            source={require(
                              'BiziboxUI/assets/billing5.png')}/>)}

                          {(billingAccounts[idx].extspMutag24 === 6) && (<Image
                            resizeMode="contain"
                            style={{
                              width: 20,
                              height: 20,
                              marginHorizontal: 10,
                            }}
                            source={require(
                              'BiziboxUI/assets/billing6.png')}/>)}

                          {(billingAccounts[idx].extspMutag24 === 7) && (<Image
                            resizeMode="contain"
                            style={{
                              width: 20,
                              height: 20,
                              marginHorizontal: 10,
                            }}
                            source={require(
                              'BiziboxUI/assets/billing7.png')}/>)}

                          {(billingAccounts[idx].extspMutag24 === 8) && (<Image
                            resizeMode="contain"
                            style={{
                              width: 20,
                              height: 20,
                              marginHorizontal: 10,
                            }}
                            source={require(
                              'BiziboxUI/assets/billing8.png')}/>)}
                        </Fragment>
                      )}
                      {billingAccounts[idx].billingAccountId !==
                      '00000000-0000-0000-0000-000000000000' &&
                      billingAccounts[idx].paymentTypeId !== 3 && (
                        <CustomIcon
                          style={{ marginHorizontal: 10 }}
                          name={getBankTransIcon(this.getIconName(
                            billingAccounts[idx].paymentTypeId))}
                          size={20}
                          color={'#022258'}/>
                      )}
                    </View>)}
                  <View>
                    {billingAccounts && billingAccounts.length > 0 &&
                    billingAccounts[idx].billingAccountId ===
                    '00000000-0000-0000-0000-000000000000' && (
                      <Text style={{
                        textAlign: 'center',
                        color: '#022258',
                        fontSize: sp(18),
                        lineHeight: 20,
                        fontFamily: fonts.semiBold,
                      }}>{'ממתין לפרטי תשלום'}</Text>
                    )}

                    {billingAccounts && billingAccounts.length > 0 &&
                    billingAccounts[idx].billingAccountId !==
                    '00000000-0000-0000-0000-000000000000' && (
                      <Text style={{
                        textAlign: 'center',
                        color: '#022258',
                        fontSize: sp(18),
                        lineHeight: 20,
                        fontFamily: fonts.semiBold,
                      }}>{billingAccounts[idx].paymentTypeId === 3 ? (t(
                        `billingCreditCard:${billingAccounts[idx].extspMutag24}`) +
                        ' ' + billingAccounts[idx].extspCardnumber5) : t(
                        `billingPayment:${billingAccounts[idx].paymentTypeId}`)}</Text>
                    )}

                    {billingAccounts && billingAccounts.length > 0 && (
                      <Text style={{
                        textAlign: 'center',
                        color: '#022258',
                        fontSize: sp(16),
                        lineHeight: 16,
                        fontFamily: fonts.semiBold,
                      }}>{billingAccounts[idx].companies[0].companyName}</Text>
                    )}

                    {billingAccounts && billingAccounts.length > 0 &&
                    billingAccounts[idx].companies.length > 1 && (
                      <TouchableOpacity
                        activeOpacity={(billingAccounts[idx].companies.length ===
                          2) ? 1 : 0.2}
                        onPress={billingAccounts[idx].companies.length === 2
                          ? null
                          : this.openShowListOfCompanies}>
                        <Text style={{
                          textAlign: 'center',
                          color: '#2aa1d9',
                          fontSize: sp(16),
                          lineHeight: 16,
                          fontFamily: fonts.semiBold,
                        }}>{billingAccounts[idx].companies.length === 2
                          ? 'ועוד חברה אחת '
                          : `ועוד ${billingAccounts[idx].companies.length} חברות`}</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                </View>

                {billingAccounts && billingAccounts.length > 1 && (
                  <TouchableOpacity
                    style={{
                      flex: 10,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                    }}
                    onPress={this.openModalChangeBillingAccounts}>
                    <Icon name="chevron-left" size={27} color={'#022258'}/>
                  </TouchableOpacity>
                )}
              </View>

              <View style={{
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingHorizontal: 10,
                height: 45,
              }}>
                <Text style={{
                  flex: 1,
                  textAlign: 'right',
                  color: '#022258',
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>{'החיוב הבא'}</Text>
                <Text style={{
                  flex: 1,
                  textAlign: 'center',
                  color: '#022258',
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>{getBillingAccountDetails.nextPaymentDate
                  ? AppTimezone.moment(getBillingAccountDetails.nextPaymentDate)
                    .format('DD/MM/YY')
                  : ''}</Text>
                <Text style={{
                  flex: 0.9,
                  textAlign: 'left',
                  color: '#022258',
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}>{'₪'}{getBillingAccountDetails.nextPaymentTotal}</Text>
              </View>

              <TouchableOpacity
                style={{
                  flexDirection: 'row-reverse',
                  height: 20,
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  marginBottom: 10,
                }}
                onPress={this.getBillingHistory}>
                <Text style={{
                  textAlign: 'center',
                  color: '#2aa1d9',
                  fontSize: sp(14),
                  fontFamily: fonts.regular,
                }}>{'צפייה בחיובים אחרונים '}</Text>
                <Icon name="chevron-left"
                      size={18}
                      color={'#2aa1d9'}
                      style={{
                        marginTop: 1,
                      }}/>
              </TouchableOpacity>

              <View style={{
                borderBottomColor: '#eaeaea',
                borderBottomWidth: 1,
              }}/>

              {getBillingAccountDetails &&
              getBillingAccountDetails.billingAccountId ===
              '00000000-0000-0000-0000-000000000000' && (
                <View style={{
                  paddingHorizontal: 20,
                }}>

                  <View style={{
                    flexDirection: 'row-reverse',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-end',
                    height: 40,
                    marginBottom: 10,
                  }}>
                    <Text style={{
                      color: '#022258',
                      fontSize: sp(18),
                      textAlign: 'right',
                      fontFamily: fonts.bold,
                    }}>{'אמצעי תשלום'}</Text>
                  </View>

                  <Text style={{
                    color: '#022258',
                    fontSize: sp(17),
                    textAlign: 'center',
                    fontFamily: fonts.semiBold,
                    marginBottom: 30,
                  }}>{'הסליקה מתבצעת דרך חברת קארדקום בע"מ'}</Text>

                  <Text style={{
                    color: '#022258',
                    fontSize: sp(15),
                    textAlign: 'center',
                    fontFamily: fonts.regular,
                    marginBottom: 6,
                  }}>{'אנא וודאו שפרטי החשבונית הרשומים מטה נכונים'}</Text>

                  <TouchableOpacity
                    activeOpacity={(getBillingAccountDetails.billingAccountCompanyName !==
                      '' &&
                      getBillingAccountDetails.billingAccountCompanyName !==
                      null &&
                      getBillingAccountDetails.billingAccountHp !== '' &&
                      getBillingAccountDetails.billingAccountHp !== null &&
                      getBillingAccountDetails.billingAccountEmail !== '' &&
                      getBillingAccountDetails.billingAccountEmail !== null)
                      ? 0.2
                      : 1}
                    onPress={(getBillingAccountDetails.billingAccountCompanyName !==
                      '' &&
                      getBillingAccountDetails.billingAccountCompanyName !==
                      null &&
                      getBillingAccountDetails.billingAccountHp !== '' &&
                      getBillingAccountDetails.billingAccountHp !== null &&
                      getBillingAccountDetails.billingAccountEmail !== '' &&
                      getBillingAccountDetails.billingAccountEmail !== null)
                      ? this.getCardcomClient
                      : null}
                    style={{
                      opacity: (getBillingAccountDetails.billingAccountCompanyName !==
                        '' &&
                        getBillingAccountDetails.billingAccountCompanyName !==
                        null &&
                        getBillingAccountDetails.billingAccountHp !== '' &&
                        getBillingAccountDetails.billingAccountHp !== null &&
                        getBillingAccountDetails.billingAccountEmail !== '' &&
                        getBillingAccountDetails.billingAccountEmail !== null)
                        ? 1
                        : 0.3,
                      flexDirection: 'row',
                      alignItems: 'center',
                      alignSelf: 'center',
                      alignContent: 'center',
                      justifyContent: 'center',
                      width: '100%',
                      height: 42,
                      backgroundColor: '#022258',
                      borderRadius: 10,
                      marginBottom: 25,
                    }}>
                    <Text style={{
                      color: '#ffffff',
                      fontSize: sp(17),
                      fontFamily: fonts.regular,
                    }}>{'המשך לתשלום'}</Text>
                  </TouchableOpacity>

                  <View style={{
                    borderBottomColor: '#eaeaea',
                    borderBottomWidth: 1,
                  }}/>
                </View>)}

              {getBillingAccountDetails &&
              getBillingAccountDetails.billingAccountId !==
              '00000000-0000-0000-0000-000000000000' && (
                <View style={{
                  paddingHorizontal: 20,
                }}>

                  <View style={{
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    height: 40,
                    marginBottom: 10,
                  }}>
                    <View style={{
                      flexDirection: 'row-reverse',
                    }}>
                      <Text style={{
                        color: '#022258',
                        fontSize: sp(18),
                        fontFamily: fonts.bold,
                      }}>{'אמצעי תשלום'}</Text>
                      {getBillingAccountDetails.operationresponse !== 0 && (
                        <Text style={{
                          color: '#022258',
                          fontSize: sp(18),
                          fontFamily: fonts.bold,
                        }}>{' - '}</Text>
                      )}
                      {getBillingAccountDetails.operationresponse !== 0 && (
                        <Text style={{
                          color: '#ef3636',
                          fontSize: sp(18),
                          fontFamily: fonts.bold,
                        }}>{'לא תקין'}</Text>
                      )}
                    </View>

                    <TouchableOpacity
                      activeOpacity={
                        (
                          contactMailValid && companyNameValid &&
                          companyHpValid &&
                          getBillingAccountDetails.billingAccountHp && String(
                            getBillingAccountDetails.billingAccountHp).length >
                          0 && getBillingAccountDetails.billingAccountEmail &&
                          getBillingAccountDetails.billingAccountEmail.length >
                          0 &&
                          getBillingAccountDetails.billingAccountCompanyName &&
                          getBillingAccountDetails.billingAccountCompanyName.length >
                          0
                        ) ? 0.2 : 1}
                      onPress={(
                        contactMailValid && companyNameValid &&
                        companyHpValid &&
                        getBillingAccountDetails.billingAccountHp && String(
                          getBillingAccountDetails.billingAccountHp).length >
                        0 && getBillingAccountDetails.billingAccountEmail &&
                        getBillingAccountDetails.billingAccountEmail.length >
                        0 &&
                        getBillingAccountDetails.billingAccountCompanyName &&
                        getBillingAccountDetails.billingAccountCompanyName.length >
                        0
                      ) ? this.getCardcomClient : null}>
                      <Text style={{
                        color: (
                          contactMailValid && companyNameValid &&
                          companyHpValid &&
                          getBillingAccountDetails.billingAccountHp && String(
                            getBillingAccountDetails.billingAccountHp).length >
                          0 && getBillingAccountDetails.billingAccountEmail &&
                          getBillingAccountDetails.billingAccountEmail.length >
                          0 &&
                          getBillingAccountDetails.billingAccountCompanyName &&
                          getBillingAccountDetails.billingAccountCompanyName.length >
                          0
                        ) ? '#2aa1d9' : '#d0cece',
                        fontSize: sp(14.5),
                        fontFamily: fonts.regular,
                      }}>{'לעדכון פרטי אשראי'}</Text>
                    </TouchableOpacity>
                  </View>

                  {getBillingAccountDetails.paymentTypeId === 3 && (
                    <Fragment>
                      <View style={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 50,
                      }}>
                        <Text style={{
                          color: '#022258',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{'תשלום באמצעות'}</Text>

                        <Text style={{
                          color: '#d0cece',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{t(
                          `billingPayment:${getBillingAccountDetails.paymentTypeId}`)}</Text>
                      </View>
                      <View style={{
                        borderBottomColor: '#eaeaea',
                        borderBottomWidth: 1,
                      }}/>

                      <View style={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 50,
                      }}>
                        <Text style={{
                          color: '#022258',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{'סוג כרטיס'}</Text>

                        <Text style={{
                          color: '#d0cece',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{t(
                          `billingCreditCard:${getBillingAccountDetails.extspMutag24}`)}</Text>
                      </View>
                      <View style={{
                        borderBottomColor: '#eaeaea',
                        borderBottomWidth: 1,
                      }}/>

                      <View style={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 50,
                      }}>
                        <Text style={{
                          color: '#022258',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{'מסתיים בספרות'}</Text>

                        <Text style={{
                          color: '#d0cece',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{getBillingAccountDetails.extspCardnumber5}</Text>
                      </View>
                      <View style={{
                        borderBottomColor: '#eaeaea',
                        borderBottomWidth: 1,
                      }}/>
                      <View style={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 50,
                      }}>
                        <Text style={{
                          color: '#022258',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{'תוקף'}</Text>

                        {getBillingAccountDetails.cardvaliditymonth &&
                        getBillingAccountDetails.cardvalidityyear && (
                          <Text style={{
                            color: '#d0cece',
                            fontSize: sp(15),
                            fontFamily: fonts.regular,
                          }}>{getBillingAccountDetails.cardvaliditymonth}{'/'}{getBillingAccountDetails.cardvalidityyear}</Text>
                        )}

                        {(!getBillingAccountDetails.cardvaliditymonth ||
                          !getBillingAccountDetails.cardvalidityyear) && (
                          <Text style={{
                            color: '#d0cece',
                            fontSize: sp(15),
                            fontFamily: fonts.regular,
                          }}>{'-'}</Text>
                        )}
                      </View>
                      <View style={{
                        borderBottomColor: '#eaeaea',
                        borderBottomWidth: 1,
                      }}/>
                    </Fragment>
                  )}

                  {getBillingAccountDetails.paymentTypeId !== 3 &&
                  getBillingAccountDetails.operationresponse === 0 && (
                    <Fragment>
                      <View style={{
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        height: 50,
                      }}>
                        <Text style={{
                          color: '#022258',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{'תשלום באמצעות'}</Text>

                        <Text style={{
                          color: '#d0cece',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{t(
                          `billingPayment:${getBillingAccountDetails.paymentTypeId}`)}</Text>
                      </View>
                      <View style={{
                        borderBottomColor: '#eaeaea',
                        borderBottomWidth: 1,
                      }}/>
                    </Fragment>
                  )}
                </View>)}

              <View style={{
                borderBottomColor: '#eaeaea',
                borderBottomWidth: 1,
              }}/>

              <View style={{
                marginTop: 10,
                paddingHorizontal: 20,
              }}>
                <View style={{
                  height: 30,
                }}>
                  <Text style={{
                    color: '#022258',
                    fontSize: sp(18),
                    textAlign: 'right',
                    fontFamily: fonts.bold,
                  }}>{'פרטים לחשבונית'}</Text>
                </View>

                <View style={{
                  flexDirection: 'row-reverse',
                }}>
                  <Text style={{
                    color: '#022258',
                    fontSize: sp(15),
                    fontFamily: fonts.regular,
                  }}>{'עדכון פרטי החשבונית אינו משנה את'}</Text>
                  <Text>{' '}</Text>
                  <TouchableOpacity onPress={this.handleGoToBusinessDetailsTab}>
                    <Text style={{
                      color: '#2aa1d9',
                      fontSize: sp(15),
                      fontFamily: fonts.regular,
                    }}>{'פרטי העסק'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={{
                paddingRight: 20,
                marginTop: 20,
              }}>
                <View
                  style={[
                    cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }]}>
                  <View style={{ flex: 2.3 }}>
                    <Text style={{
                      textAlign: 'right',
                      color: '#0f3860',
                      fontSize: sp(13),
                      lineHeight: 42,
                    }}>שם העסק</Text>
                  </View>
                  <View style={[
                    {
                      flex: 5.73,
                      backgroundColor: '#f5f5f5',
                      paddingHorizontal: 21,
                      borderBottomRightRadius: 20,
                      borderTopRightRadius: 20,
                    }, cs(!companyNameValid, {}, {
                      borderWidth: 1,
                      borderColor: colors.red,
                    })]}>
                    <TextInput
                      editable
                      maxLength={40}
                      onEndEditing={this.handleUpdateFieldValid(
                        'companyNameValid')}
                      onBlur={this.handleUpdateFieldValid('companyNameValid')}
                      autoCorrect={false}
                      autoCapitalize="sentences"
                      returnKeyType="done"
                      keyboardType="default"
                      underlineColorAndroid="transparent"
                      style={[
                        {
                          textAlign: 'right',
                          color: '#0f3860',
                          height: 42,
                          fontSize: sp(15),
                          width: '100%',
                        }, commonStyles.regularFont]}
                      onSubmitEditing={this.handleUpdateCompany}
                      onChangeText={this.handleUpdateField(
                        'billingAccountCompanyName')}
                      value={getBillingAccountDetails.billingAccountCompanyName}
                    />
                  </View>
                </View>

                <View
                  style={[
                    cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }]}>
                  <View style={{ flex: 2.3 }}>
                    <Text style={{
                      textAlign: 'right',
                      color: '#0f3860',
                      fontSize: sp(13),
                      lineHeight: 42,
                    }}>ח.פ/ת.ז</Text>
                  </View>
                  <View style={[
                    {
                      flex: 5.73,
                      backgroundColor: '#f5f5f5',
                      paddingHorizontal: 21,
                      borderBottomRightRadius: 20,
                      borderTopRightRadius: 20,
                    }, cs(!companyHpValid, {}, {
                      borderWidth: 1,
                      borderColor: colors.red,
                    })]}>
                    <TextInput
                      editable
                      maxLength={9}
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      keyboardType="numeric"
                      underlineColorAndroid="transparent"
                      style={[
                        {
                          color: '#0f3860',
                          height: 42,
                          fontSize: sp(15),
                          textAlign: (!getBillingAccountDetails.billingAccountHp ||
                            (getBillingAccountDetails.billingAccountHp &&
                              String(
                                getBillingAccountDetails.billingAccountHp).length ===
                              0)) ? 'right' : companyIdSide,
                          width: '100%',
                        }, commonStyles.regularFont]}
                      onEndEditing={(e) => {
                        let currentCompanyState = Object.assign({},
                          this.state.getBillingAccountDetails)
                        currentCompanyState.billingAccountHp = e.nativeEvent.text.toString()
                          .replace(/[^\d]/g, '')
                        this.setState(
                          { getBillingAccountDetails: currentCompanyState })
                        this.handleUpdateFieldValid('companyHpValid')(e)
                      }}
                      onFocus={this.onFocusInput('companyIdSide')}
                      onBlur={this.handleUpdateFieldValid('companyHpValid')}
                      onChangeText={this.handleUpdateField('billingAccountHp')}
                      onSubmitEditing={this.handleUpdateCompany}
                      value={getBillingAccountDetails.billingAccountHp ? String(
                        getBillingAccountDetails.billingAccountHp) : null}
                    />
                  </View>

                </View>

                <View style={[
                  cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                    height: 42,
                    marginBottom: 8,
                  }]}>
                  <View style={{ flex: 2.3 }}>
                    <Text style={{
                      color: '#0f3860',
                      fontSize: sp(13),
                      lineHeight: 42,
                      textAlign: 'right',
                    }}>עיר</Text>
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
                        cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),
                        {
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }]}
                      onPress={this.openModalCities}>

                      <View style={{
                        marginRight: 'auto',
                      }}>
                        <Icon name="chevron-left" size={24}
                              color={colors.blue34}/>
                      </View>
                      <Text
                        style={[
                          styles.dataRowLevel3Text, {
                            fontSize: sp(15),
                            color: '#0f3860',
                            lineHeight: 42,
                          }, commonStyles.regularFont]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {cities && cities.find((item) => item.cityId ===
                          getBillingAccountDetails.billingAccountCityId) !==
                        undefined
                          ? cities.find((item) => item.cityId ===
                            getBillingAccountDetails.billingAccountCityId).cityName
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
                    }]}>
                  <View style={{ flex: 2.3 }}>
                    <Text style={{
                      color: '#0f3860',
                      fontSize: sp(13),
                      lineHeight: 42,
                      textAlign: 'right',
                    }}>כתובת</Text>
                  </View>
                  <View style={[
                    {
                      flex: 5.73,
                      backgroundColor: '#f5f5f5',
                      paddingHorizontal: 21,
                      borderBottomRightRadius: 20,
                      borderTopRightRadius: 20,
                    }]}>
                    <TextInput
                      editable
                      maxLength={30}
                      autoCorrect={false}
                      autoCapitalize="sentences"
                      returnKeyType="done"
                      keyboardType="default"
                      underlineColorAndroid="transparent"
                      style={[
                        {
                          textAlign: 'right',
                          color: '#0f3860',
                          height: 42,
                          fontSize: sp(15),
                          width: '100%',
                        }, commonStyles.regularFont]}
                      onEndEditing={this.handleUpdateCompany}
                      onBlur={this.handleUpdateCompany}
                      onSubmitEditing={this.handleUpdateCompany}
                      onChangeText={this.handleUpdateField(
                        'billingAccountAddress')}
                      value={getBillingAccountDetails.billingAccountAddress}
                    />
                  </View>
                </View>

                <View
                  style={[
                    cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }]}>
                  <View style={{ flex: 2.3 }}>
                    <Text style={{
                      color: '#0f3860',
                      fontSize: sp(13),
                      textAlign: 'right',
                      lineHeight: 42,
                    }}>שם איש קשר</Text>
                  </View>
                  <View style={[
                    {
                      flex: 5.73,
                      backgroundColor: '#f5f5f5',
                      paddingHorizontal: 21,
                      borderBottomRightRadius: 20,
                      borderTopRightRadius: 20,
                    }]}>
                    <TextInput
                      editable
                      maxLength={30}
                      autoCorrect={false}
                      autoCapitalize="sentences"
                      returnKeyType="done"
                      keyboardType="default"
                      underlineColorAndroid="transparent"
                      style={[
                        {
                          textAlign: 'right',
                          color: '#0f3860',
                          height: 42,
                          fontSize: sp(15),
                          width: '100%',
                        }, commonStyles.regularFont]}
                      onEndEditing={this.handleUpdateCompany}
                      onBlur={this.handleUpdateCompany}
                      onSubmitEditing={this.handleUpdateCompany}
                      onChangeText={this.handleUpdateField(
                        'billingAccountName')}
                      value={getBillingAccountDetails.billingAccountName}
                    />
                  </View>
                </View>

                <View
                  style={[
                    cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: (mailIsHebrew || !contactMailValid) ? 0 : 8,
                    }]}>
                  <View style={{ flex: 2.3 }}>
                    <Text style={{
                      color: '#0f3860',
                      fontSize: sp(13),
                      lineHeight: 42,
                      textAlign: 'right',
                    }}>מייל</Text>
                  </View>
                  <View style={[
                    {
                      flex: 5.73,
                      backgroundColor: '#f5f5f5',
                      paddingHorizontal: 21,
                      borderBottomRightRadius: 20,
                      borderTopRightRadius: 20,
                    }, cs((!contactMailValid), {}, {
                      borderWidth: 1,
                      borderColor: colors.red,
                    })]}>
                    <TextInput
                      editable
                      style={[
                        {
                          color: '#0f3860',
                          height: 42,
                          fontSize: sp(15),
                          textAlign: (!getBillingAccountDetails.billingAccountEmail ||
                            (getBillingAccountDetails.billingAccountEmail &&
                              getBillingAccountDetails.billingAccountEmail.length ===
                              0)) ? 'right' : emailSide,
                          width: '100%',
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
                      onSubmitEditing={this.handleUpdateCompany}
                      onChangeText={this.handleUpdateField(
                        'billingAccountEmail')}
                      value={getBillingAccountDetails.billingAccountEmail}
                    />
                  </View>
                </View>

                {(mailIsHebrew || !contactMailValid) && (
                  <View
                    style={[
                      cs(isRtl, commonStyles.row, [commonStyles.rowReverse])]}>
                    <View style={{ flex: 2.3 }}/>
                    <View style={[
                      {
                        flex: 5.73,
                      }]}>
                      {(mailIsHebrew === true) && (
                        <Text style={[
                          {
                            width: '100%',
                            marginVertical: 0,
                            color: colors.red7,
                            fontSize: sp(14),
                            textAlign: 'right',
                            fontFamily: fonts.regular,
                          }]}>
                          {'שימו לב - המקלדת בעברית'}
                        </Text>
                      )}

                      {(contactMailValid === false) && (
                        <Text style={[
                          {
                            width: '100%',
                            marginVertical: 0,
                            color: colors.red7,
                            fontSize: sp(14),
                            textAlign: 'right',
                            fontFamily: fonts.regular,
                          }]}>
                          {'נראה שנפלה טעות במייל, אנא בדקו שנית'}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                <View
                  style={[
                    cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }]}>
                  <View style={{ flex: 2.3 }}>
                    <Text style={{
                      color: '#0f3860',
                      fontSize: sp(13),
                      textAlign: 'right',
                      lineHeight: 42,
                    }}>טלפון</Text>
                  </View>
                  <View style={[
                    {
                      flex: 5.73,
                      backgroundColor: '#f5f5f5',
                      paddingHorizontal: 21,
                      borderBottomRightRadius: 20,
                      borderTopRightRadius: 20,
                    }]}>
                    <TextInput
                      editable
                      maxLength={11}
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      keyboardType="numeric"
                      underlineColorAndroid="transparent"
                      style={[
                        {
                          color: '#0f3860',
                          height: 42,
                          fontSize: sp(15),
                          textAlign: (!getBillingAccountDetails.billingAccountPhone ||
                            (getBillingAccountDetails.billingAccountPhone &&
                              getBillingAccountDetails.billingAccountPhone.length ===
                              0)) ? 'right' : billingAccountPhoneSide,
                          width: '100%',
                        }, commonStyles.regularFont]}
                      onEndEditing={(e) => {
                        let currentCompanyState = Object.assign({},
                          this.state.getBillingAccountDetails)
                        currentCompanyState.billingAccountPhone = e.nativeEvent.text.toString()
                          .replace(/[^\d-]/g, '')
                        this.setState(
                          { getBillingAccountDetails: currentCompanyState })
                        this.handleUpdateFieldValid('contactPhoneValid')(e)
                      }}
                      onFocus={this.onFocusInput('billingAccountPhoneSide')}
                      onBlur={this.handleUpdateFieldValid('contactPhoneValid')}
                      onChangeText={this.handleUpdateField(
                        'billingAccountPhone')}
                      onSubmitEditing={this.handleUpdateCompany}
                      value={getBillingAccountDetails.billingAccountPhone}
                    />
                  </View>
                </View>

                {getBillingAccountDetails &&
                (getBillingAccountDetails.billingAccountId ===
                  '00000000-0000-0000-0000-000000000000' ||
                  getBillingAccountDetails.leloMaam === true) && (
                  <View style={{
                    height: 30,
                    alignSelf: 'flex-end',
                    alignItems: 'flex-end',
                    alignContent: 'flex-end',
                    justifyContent: 'space-between',
                    flexDirection: 'row-reverse',
                  }}>
                    <CheckBox
                      disabled={getBillingAccountDetails.billingAccountId !==
                      '00000000-0000-0000-0000-000000000000'}
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
                        fontSize: sp(14),
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
                      size={30}
                      right
                      checkedColor="#022258"
                      uncheckedColor="#dddddd"
                      title={'פטור ממע"מ'}
                      iconRight
                      iconType="material-community"
                      checkedIcon="check-circle-outline"
                      uncheckedIcon="checkbox-blank-circle-outline"
                      checked={getBillingAccountDetails.leloMaam}
                      onPress={this.handleToggleProgramName}
                    />

                    {companiesLite && (
                      <TouchableOpacity onPress={this.cancelService}
                                        style={{
                                          marginLeft: 10,
                                        }}>
                        <Text style={{
                          color: '#2aa1d9',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>{'ביטול שירות'}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
                {companiesLite && (!getBillingAccountDetails ||
                  (getBillingAccountDetails.billingAccountId &&
                    getBillingAccountDetails.billingAccountId !==
                    '00000000-0000-0000-0000-000000000000' &&
                    getBillingAccountDetails.leloMaam !== true)) && (
                  <View style={{
                    height: 30,
                    alignSelf: 'flex-start',
                    alignItems: 'flex-start',
                    alignContent: 'flex-start',
                    justifyContent: 'flex-start',
                    flexDirection: 'row-reverse',
                  }}>
                    <TouchableOpacity onPress={this.cancelService}
                                      style={{
                                        marginLeft: 10,
                                      }}>
                      <Text style={{
                        color: '#2aa1d9',
                        fontSize: sp(15),
                        fontFamily: fonts.regular,
                      }}>{'ביטול שירות'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {companiesLite && (
                  <Fragment>
                    <View style={{
                      flexDirection: 'row-reverse',
                      height: 20,
                      paddingTop: 10,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                    }}>
                      <Text
                        style={{
                          fontSize: sp(14),
                          height: 20,
                          textAlign: 'center',
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                        }}>
                        {'נתקלתם בבעיה? '}</Text>
                      <TouchableOpacity
                        onPress={this.handleLinkSignBizibox}>
                        <Text
                          style={{
                            fontSize: sp(14),
                            height: 20,
                            textAlign: 'center',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            color: colors.blue30,
                          }}>
                          {'צרו קשר'}</Text>
                      </TouchableOpacity>
                      <Text
                        style={{
                          fontSize: sp(14),
                          height: 20,
                          textAlign: 'center',
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                        }}>
                        {' או שלחו '}</Text>
                    </View>
                    <View style={{
                      flexDirection: 'row-reverse',
                      height: 20,
                      alignSelf: 'center',
                      justifyContent: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                    }}>
                      <Text
                        style={{
                          fontSize: sp(14),
                          height: 20,
                          textAlign: 'center',
                          alignSelf: 'center',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                        }}>
                        {'לנו מייל '}</Text>
                      <TouchableOpacity
                        onPress={this.handleSendEmail}>
                        <Text
                          style={{
                            fontSize: sp(14),
                            height: 20,
                            textAlign: 'center',
                            alignSelf: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            color: colors.blue30,
                          }}>
                          {'service@bizibox.biz'}</Text>
                      </TouchableOpacity>
                    </View>
                  </Fragment>
                )}
              </View>
            </Fragment>
          )}
        </KeyboardAwareScrollView>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalChangeBillingAccounts}
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
                    <Text style={{
                      fontSize: sp(20),
                      color: '#ffffff',
                      fontFamily: fonts.semiBold,
                    }}>
                      {'אמצעי תשלום'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={this.closeModalChangeBillingAccounts}>
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
                marginTop: 10,
                marginBottom: 10,
                paddingLeft: 0,
                paddingRight: 0,
                flex: 1,
              }}>
                {billingAccounts && billingAccounts.length > 1 && (
                  <ScrollView
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
                      }]}>
                    {billingAccounts.map((item, i) => (
                      <TouchableOpacity
                        onPress={this.changeIdxBillingAccounts(i)}
                        key={item.billingAccountId}
                        style={{
                          flexDirection: 'row-reverse',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 45,
                          marginRight: 20,
                          borderTopLeftRadius: 21,
                          borderBottomLeftRadius: 21,
                          backgroundColor: (idx === i) ? '#f5f5f5' : '#ffffff',
                        }}>

                        <View style={{
                          flex: 12,
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                          {idx === i && (
                            <Icon
                              name="check"
                              type="material-community"
                              size={25}
                              color={'#0addc1'}
                            />
                          )}
                        </View>

                        <View style={{
                          flex: 80,
                          flexDirection: 'row-reverse',
                          alignItems: 'center',
                        }}>
                          <View>
                            {item.billingAccountId ===
                            '00000000-0000-0000-0000-000000000000' && (
                              <Image
                                resizeMode="contain"
                                style={{
                                  width: 24,
                                  height: 24,
                                  marginHorizontal: 10,
                                }}
                                source={require(
                                  'BiziboxUI/assets/waiting.png')}/>
                            )}
                            {item.billingAccountId !==
                            '00000000-0000-0000-0000-000000000000' &&
                            item.paymentTypeId === 3 && (
                              <Fragment>
                                {(item.extspMutag24 === 0) && (<Image
                                  resizeMode="contain"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginHorizontal: 10,
                                  }}
                                  source={require(
                                    'BiziboxUI/assets/creditIc.png')}/>)}
                                {(item.extspMutag24 === 1) && (<Image
                                  resizeMode="contain"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginHorizontal: 10,
                                  }}
                                  source={require(
                                    'BiziboxUI/assets/billing1.png')}/>)}

                                {(item.extspMutag24 === 2) && (<Image
                                  resizeMode="contain"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginHorizontal: 10,
                                  }}
                                  source={require(
                                    'BiziboxUI/assets/billing2.png')}/>)}

                                {(item.extspMutag24 === 3) && (<Image
                                  resizeMode="contain"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginHorizontal: 10,
                                  }}
                                  source={require(
                                    'BiziboxUI/assets/maestro.png')}/>)}

                                {(item.extspMutag24 === 4) && (<Image
                                  resizeMode="contain"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginHorizontal: 10,
                                  }}
                                  source={require(
                                    'BiziboxUI/assets/billing4.png')}/>)}

                                {(item.extspMutag24 === 5) && (<Image
                                  resizeMode="contain"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginHorizontal: 10,
                                  }}
                                  source={require(
                                    'BiziboxUI/assets/billing5.png')}/>)}

                                {(item.extspMutag24 === 6) && (<Image
                                  resizeMode="contain"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginHorizontal: 10,
                                  }}
                                  source={require(
                                    'BiziboxUI/assets/billing6.png')}/>)}

                                {(item.extspMutag24 === 7) && (<Image
                                  resizeMode="contain"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginHorizontal: 10,
                                  }}
                                  source={require(
                                    'BiziboxUI/assets/billing7.png')}/>)}

                                {(item.extspMutag24 === 8) && (<Image
                                  resizeMode="contain"
                                  style={{
                                    width: 20,
                                    height: 20,
                                    marginHorizontal: 10,
                                  }}
                                  source={require(
                                    'BiziboxUI/assets/billing8.png')}/>)}
                              </Fragment>
                            )}
                            {item.billingAccountId !==
                            '00000000-0000-0000-0000-000000000000' &&
                            item.paymentTypeId !== 3 && (
                              <CustomIcon
                                style={{ marginHorizontal: 10 }}
                                name={getBankTransIcon(
                                  this.getIconName(item.paymentTypeId))}
                                size={20}
                                color={'#022258'}/>
                            )}
                          </View>
                          <View>
                            {item.billingAccountId ===
                            '00000000-0000-0000-0000-000000000000' && (
                              <Text style={{
                                textAlign: 'right',
                                color: '#022258',
                                fontSize: sp(14),
                                fontFamily: fonts.semiBold,
                              }}>{'ממתין לפרטי תשלום'}</Text>
                            )}
                            {item.billingAccountId !==
                            '00000000-0000-0000-0000-000000000000' && (
                              <Text style={{
                                textAlign: 'right',
                                color: '#022258',
                                fontSize: sp(14),
                                fontFamily: fonts.semiBold,
                              }}>{item.paymentTypeId === 3 ? (t(
                                `billingCreditCard:${item.extspMutag24}`) +
                                ' ' + item.extspCardnumber5) : t(
                                `billingPayment:${item.paymentTypeId}`)}</Text>
                            )}

                            <View style={{
                              flexDirection: 'row-reverse',
                              justifyContent: 'flex-start',
                              alignItems: 'center',
                            }}>
                              <Text style={{
                                textAlign: 'right',
                                color: '#022258',
                                fontSize: sp(14),
                                fontFamily: fonts.semiBold,
                              }}>{item.companies[0].companyName}</Text>

                              {item.companies.length > 1 && (
                                <Text style={{
                                  textAlign: 'right',
                                  color: '#2aa1d9',
                                  fontSize: sp(14),
                                  fontFamily: fonts.semiBold,
                                }}>{' '}{item.companies.length === 2
                                  ? 'ועוד חברה אחת '
                                  : `ועוד ${item.companies.length} חברות`}</Text>
                              )}
                            </View>
                          </View>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </SafeAreaView>
        </Modal>
        <Modal
          animationType="slide"
          transparent={false}
          visible={showModalBillingHistory}
        >
          <SafeAreaView style={{
            flex: 1,
            marginTop: 0,
            paddingTop: 0,
            position: 'relative',
          }}>
            {openModalEmail && (
              <View style={{
                flex: 1,
                zIndex: 99,
                position: 'absolute',
                top: 0,
                right: 0,
                left: 0,
                bottom: 0,
              }}>
                <View style={{
                  flex: 1,
                  zIndex: 99,
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  left: 0,
                  bottom: 0,
                  backgroundColor: '#000000',
                  opacity: 0.3,
                }}/>

                <View style={{
                  flex: 1,
                  zIndex: 999,
                  position: 'absolute',
                  top: 150,
                  right: 0,
                  left: 0,
                  marginHorizontal: 15,
                  height: 222,
                  backgroundColor: '#ffffff',
                  borderRadius: 10,
                  shadowColor: '#000000',
                  shadowOpacity: 0.1,
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  elevation: 4,
                  paddingHorizontal: 16,
                  paddingVertical: 17,
                }}>
                  <TouchableOpacity onPress={this.handleCloseModalEmail}>
                    <Icon
                      name="close"
                      type="material-community"
                      size={24}
                      color={'#022258'}
                    />
                  </TouchableOpacity>

                  <Text style={{
                    color: '#022258',
                    fontSize: sp(19),
                    textAlign: 'center',
                    fontFamily: fonts.regular,
                  }}>{'כתובת מייל'}</Text>

                  <View style={{
                    width: '100%',
                    marginVertical: 5,
                    marginTop: 35,
                    alignItems: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                  }}>
                    <TextInput
                      onEndEditing={this.handleUpdateFieldValidPop('mailValid')}
                      onBlur={this.handleUpdateFieldValidAsyncPop}
                      placeholder={t('common:label:email')}
                      placeholderTextColor="#202020"
                      autoCorrect={false}
                      autoCapitalize="none"
                      returnKeyType="done"
                      keyboardType="email-address"
                      underlineColorAndroid="transparent"
                      style={[
                        {
                          marginBottom: 5,
                          width: 260,
                          borderBottomColor: (!mailValid)
                            ? colors.red2
                            : '#022258',
                          borderBottomWidth: 2,
                          fontFamily: fonts.semiBold,
                          fontWeight: 'normal',
                          color: '#022258',
                          textAlign: (!emailAddressParamas.emailAddress ||
                            (emailAddressParamas.emailAddress &&
                              emailAddressParamas.emailAddress.length === 0))
                            ? 'right'
                            : 'left',
                          height: 30,
                          fontSize: sp(15),
                          lineHeight: 20,
                          backgroundColor: 'transparent',
                        },
                      ]}
                      onSubmitEditing={this.sendInvoiceMail}
                      onChangeText={this.handleUpdateFieldPop('mail')}
                      value={emailAddressParamas.emailAddress}
                    />
                  </View>
                  <View style={{
                    width: '100%',
                    marginVertical: 0,
                    alignItems: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                  }}>
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
                    width: '100%',
                    marginVertical: 0,
                    alignItems: 'center',
                    alignSelf: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                    marginTop: (mailIsHebrew || !mailValid) ? 12 : 30,
                  }}>
                    <Button
                      loading={inProgress}
                      buttonStyle={{
                        height: 35,
                        borderRadius: 6,
                        backgroundColor: '#022258',
                        width: 155,
                        padding: 0,
                        alignItems: 'center',
                        alignSelf: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                      }}
                      titleStyle={{
                        fontFamily: fonts.semiBold,
                        fontSize: sp(18.5),
                        textAlign: 'center',
                        color: '#ffffff',
                      }}
                      onPress={this.sendInvoiceMail}
                      title={'שליחה'}
                    />
                  </View>
                </View>
              </View>
            )}
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
                    <Text style={{
                      fontSize: sp(20),
                      color: '#ffffff',
                      fontFamily: fonts.semiBold,
                    }}>
                      {'חיובים אחרונים'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity onPress={this.closeModalBillingHistory}>
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
                marginTop: 10,
                marginBottom: 10,
                paddingLeft: 0,
                paddingRight: 0,
                flex: 1,
              }}>
                {getBillingHistory && getBillingHistory.length > 0 && (
                  <ScrollView
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
                      }]}>

                    {getBillingHistory.map((item, i) => (
                      <View
                        key={item.billingPaymentId}
                        style={{
                          flexDirection: 'row-reverse',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: 62.5,
                          marginHorizontal: 16,
                          backgroundColor: '#ffffff',
                          borderBottomColor: '#eaeaea',
                          borderBottomWidth: 1,
                          paddingHorizontal: 16,
                        }}>

                        <View style={{
                          flex: 434,
                          justifyContent: 'center',
                          alignItems: 'flex-end',
                        }}>
                          <View style={{
                            flexDirection: 'row-reverse',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                          }}>
                            <TouchableOpacity
                              onPress={this.downloadInvoice(item)}
                              style={{
                                flexDirection: 'row-reverse',
                                justifyContent: 'flex-start',
                                alignItems: 'flex-start',
                              }}>
                              <Text style={{
                                textAlign: 'right',
                                color: '#2aa1d9',
                                fontSize: sp(16),
                                fontFamily: fonts.bold,
                              }}>{AppTimezone.moment(item.paymentDate)
                                .format('DD/MM/YY')}</Text>
                              <Text style={{
                                textAlign: 'right',
                                color: '#2aa1d9',
                                fontSize: sp(16),
                                fontFamily: fonts.regular,
                                paddingHorizontal: 2,
                              }}>{'|'}</Text>
                              <Text style={{
                                textAlign: 'right',
                                color: '#2aa1d9',
                                fontSize: sp(16),
                                fontFamily: fonts.semiBold,
                              }}>{item.paymentTypeId === 3 ? (t(
                                `billingCreditCard:${item.extspMutag24}`) +
                                ' ' + item.extspCardnumber5) : t(
                                `billingPayment:${item.paymentTypeId}`)}</Text>
                            </TouchableOpacity>
                          </View>
                          <View>
                            <Text style={{
                              textAlign: 'right',
                              color: '#022258',
                              fontSize: sp(16),
                              fontFamily: fonts.regular,
                            }}>{'אסמכתא: '}{item.invoiceNumber}</Text>
                          </View>
                        </View>
                        <View style={{
                          flex: 60,
                          alignItems: 'center',
                          alignSelf: 'center',
                          alignContent: 'center',
                          justifyContent: 'center',
                        }}>
                          <TouchableOpacity onPress={this.openSendEmail(item)}>
                            <Image
                              style={[
                                styles.imgIcon,
                                {
                                  width: 18.5,
                                  height: 13.5,
                                }]}
                              source={require('BiziboxUI/assets/mailIcon.png')}
                            />
                          </TouchableOpacity>
                        </View>
                        <View style={{
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: 1,
                          marginHorizontal: 6,
                          height: 16,
                          backgroundColor: '#022258',
                        }}/>
                        <View style={{
                          flex: 170,
                          justifyContent: 'flex-start',
                          alignItems: 'center',
                        }}>
                          <Text style={{
                            textAlign: 'left',
                            color: '#022258',
                            fontSize: sp(18),
                            fontFamily: fonts.bold,
                          }}>{'₪'}{item.sumtobill}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
                {(!getBillingHistory || getBillingHistory.length === 0) && (
                  <Text style={{
                    textAlign: 'center',
                    color: '#2aa1d9',
                    fontSize: sp(20),
                    fontFamily: fonts.bold,
                  }}>{'לא קיימים חיובים אחרונים'}</Text>
                )}
              </View>
            </View>
          </SafeAreaView>
        </Modal>
        <Modal
          animationType="slide"
          transparent={false}
          visible={modalCitiesShow}
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
                    <Text style={{
                      fontSize: sp(20),
                      color: '#ffffff',
                      fontFamily: fonts.semiBold,
                    }}>
                      {'בחירת עיר'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity onPress={this.modalCitiesClose}>
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
                marginTop: 10,
                marginBottom: 10,
                paddingLeft: 0,
                paddingRight: 10,
                flex: 1,
              }}>
                <View style={[
                  {
                    height: 42,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 20,
                    marginBottom: 5,
                    marginHorizontal: 10,
                    marginVertical: 5,
                  }]}>
                  <TextInput
                    placeholder={'חיפוש...'}
                    placeholderTextColor="#0f3860"
                    editable
                    maxLength={40}
                    onEndEditing={this.handleFilter}
                    autoCorrect={false}
                    autoCapitalize="sentences"
                    returnKeyType="done"
                    keyboardType="default"
                    underlineColorAndroid="transparent"
                    style={[
                      {
                        textAlign: 'right',
                        color: '#0f3860',
                        height: 42,
                        paddingHorizontal: 10,
                        fontSize: sp(15),
                        width: '100%',
                      }, commonStyles.regularFont]}
                    onChangeText={this.handleFilterField}
                    value={currentCity}
                  />
                </View>

                <AnimatedSectionList
                  removeClippedSubviews
                  stickySectionHeadersEnabled
                  showsVerticalScrollIndicator={false}
                  scrollEnabled
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
                  scrollEventThrottle={16}
                  sections={citiesFilter}
                  renderItem={this.renderScrollItem}
                  renderSectionHeader={this.renderTitleSectionHeader}
                  ListHeaderComponent={this.renderFakeHeader}
                  ItemSeparatorComponent={this.renderItemSeparator}
                  keyExtractor={(item) => item.cityId}
                  initialNumToRender={100}
                  windowSize={5}
                />
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    )
  }
}
