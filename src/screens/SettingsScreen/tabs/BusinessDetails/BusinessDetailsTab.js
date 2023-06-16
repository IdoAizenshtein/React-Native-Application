import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import {
  Animated,
  Keyboard,
  Modal,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { combineStyles as cs, getEmoji, goTo, sp } from '../../../../utils/func'
import commonStyles from '../../../../styles/styles'
import { colors, fonts } from '../../../../styles/vars'
import styles from '../../../../components/EditRowModal/EditRowModalStyles'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Icon } from 'react-native-elements'
import { IS_IOS } from '../../../../constants/common'
import {
  getCitiesApi,
  getUserSettingsApi,
  isEmailExists,
  updateCompanyApi,
  updateLeadInfo,
} from '../../../../api'
import CustomIcon from 'src/components/Icons/Fontello'
import Api from '../../../../api/Api'
import { getCompanies, selectCompany } from 'src/redux/actions/company'
import { BANK_ACCOUNTS_TAB } from '../../../../constants/settings'
import { signupCreate } from '../../../../redux/actions/auth'
import LoaderSimple from "../../../../components/Loader/LoaderSimple";

const AnimatedSectionList = Animated.createAnimatedComponent(SectionList)

@withTranslation()
export default class BusinessDetailsTab extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      currentCompany: JSON.parse(JSON.stringify(props.currentCompany)),
      firstName: '',
      lastName: '',
      mail: '',
      cell: '',
      password: '',
      firstNameValid: true,
      lastNameValid: true,
      contactPhoneValid: true,
      mainContactNameValid: true,
      contactMailValid: true,
      passwordValid: true,
      emailExists: false,
      mailIsHebrew: false,
      businessCategory: '',
      companyName: '',
      companyHp: '',
      companyNameValid: true,
      companyNameValidAdd: true,
      companyHpValid: true,
      idExists: false,
      cities: [],
      citiesFilter: [],
      modalCitiesShow: false,
      currentCity: '',
      inProgress: false,
      modalAddCompanyShow: false,
      companyIdNew: null,
      userSettings: {},
    }
  }

  componentDidMount () {
    this.getUserSettings()
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
  }

  componentWillUnmount () {

  }

  handleUpdateField = name => val => {
    let value = val || ''
    value = value.toString().replace(getEmoji(), '')

    if (name === 'contactMail') {
      value = value.toString().replace(/([\u05D0-\u05FF/\s+]+)/g, '')
    } else if (name === 'contactPhone') {
      value = value.toString().replace(/[^\d-]/g, '')
    }

    let currentCompanyState = Object.assign({}, this.state.currentCompany)
    currentCompanyState[name] = value
    this.setState({ currentCompany: currentCompanyState })

    if (name === 'contactMail' || name === 'contactPhone' || name ===
      'companyName' || name === 'mainContactName') {
      this.handleUpdateFieldValid(`${name}Valid`, true)({
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
        [name]: value && (value.length === 10 || value.length === 11) &&
        new RegExp(
          '(050|052|053|054|055|057|058|02|03|04|08|09|072|073|076|077|078)-?\\d{7,7}').test(
          value),
      })
    } else if (name === 'companyNameValid') {
      this.setState(
        { [name]: value && (value.length !== 0 && value.length < 40) })
    } else {
      this.setState(
        { [name]: value && (value.length !== 0 && value.length < 30) })
    }
    if (!isKey) {
      setTimeout(() => this.handleUpdateCompany(), 150)
    }
  }

  handleUpdateFieldValidAsync = (e) => {
    const { currentCompany } = this.state
    const re = /\S+@\S+\.\S+/
    let val = (IS_IOS ? e.nativeEvent.text : currentCompany.contactMail) || ''
    if (val && re.test(val) && val.length > 0) {
      isEmailExists.post({
        body: {
          firstName: '',
          lastName: '',
          phoneNumber: '',
          username: val,
          hesderId: null,
        },
      })
        .then((data) => {
          this.setState({ emailExists: data.exists !== false })
          setTimeout(() => this.handleUpdateCompany(), 150)
        })
        .catch(() => {

        })
    } else {
      const isHebrew = (val && /[\u0590-\u05FF]/.test(val))
      this.setState({
        'contactMailValid': false,
        mailIsHebrew: isHebrew,
        emailExists: false,
      })
    }
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

  openModalAddCompany = () => {
    this.setState({
      modalAddCompanyShow: true,
    })
  }
  closeModalAddCompany = () => {
    this.setState({
      modalAddCompanyShow: false,
    })
  }

  handleUpdateCompany = () => {
    const {
      inProgress,
      currentCompany,
      contactMailValid,
      contactPhoneValid,
      companyNameValid,
      mainContactNameValid,
      emailExists,
    } = this.state

    if (inProgress || !(
      contactMailValid && contactPhoneValid && companyNameValid &&
      mainContactNameValid && !emailExists &&
      currentCompany.contactMail && currentCompany.contactMail.length > 0 &&
      currentCompany.contactPhone && currentCompany.contactPhone.length > 0 &&
      currentCompany.companyName && currentCompany.companyName.length > 0 &&
      currentCompany.mainContactName && currentCompany.mainContactName.length > 0
    )) {
      return
    }
    Keyboard.dismiss()
    this.setState({ inProgress: true })
    const obj = {
      'cfiUser': true,
      'cityId': currentCompany.cityId,
      'companyId': currentCompany.companyId,
      'companyLogoPath': currentCompany.companyLogoPath,
      'companyName': currentCompany.companyName,
      'contactMail': currentCompany.contactMail,
      'contactPhone': currentCompany.contactPhone,
      'mainContactName': currentCompany.mainContactName,
      'businessCategory': currentCompany.businessCategory,
      'street': currentCompany.street,
    }
    updateCompanyApi.post({
      body: obj,
    })
      .then(() => {
        this.setState({ inProgress: false })
        return this.props.dispatch(getCompanies())
      })
      .then((list) => {
        return this.props.dispatch(selectCompany(currentCompany.companyId))
          .then(() => {
            const newCompany = list.filter(
              (item) => item.companyId === currentCompany.companyId)
            this.props.handleSetCompany(newCompany[0])
          })
      })
      .catch(() => {
        this.setState({ inProgress: false })
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
    let currentCompanyState = Object.assign({}, this.state.currentCompany)
    currentCompanyState.cityId = city.cityId
    currentCompanyState.cityName = city.cityName
    this.setState({
      currentCompany: currentCompanyState,
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

  handleUpdateFieldAdd = name => val => {
    let value = val || ''
    value = value.toString().replace(getEmoji(), '')

    if (name === 'businessCategory') {
      this.setState({ [name]: value })
    } else if (name === 'companyHp') {
      value = value.toString().replace(/\s+/g, '')
      const values = value && value.toString().replace(/[^\d]/g, '')
      this.setState({ [name]: values })
      this.handleUpdateFieldValidAdd('companyHpValid')({
        nativeEvent: {
          text: values,
        },
      })
    } else {
      this.setState({ [name]: value })
      this.handleUpdateFieldValidAdd(`${name}Valid`)({
        nativeEvent: {
          text: value,
        },
      })
    }
  }

  handleUpdateFieldValidAdd = name => val => {
    let value = val.nativeEvent.text || ''

    if (name === 'companyNameValidAdd') {
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
      this.setState({ [name]: value && (value.length === 9 && result) })
      if (value && value.length === 9 && result) {
        const { currentCompany } = this.state
        new Api({
          endpoint: 'companies/hp-exists',
          secure: currentCompany.contactMail === null,
        }).post({
          body: {
            companyHp: value,
            username: currentCompany.contactMail,
          },
        })
          .then((data) => {
            this.setState({ idExists: data.exists !== false })
          })
          .catch(() => {

          })
      }
    } else {
      this.setState(
        { [name]: value && (value.length !== 0 && value.length < 30) })
    }
  }
  getUserSettings = () => {
    getUserSettingsApi.get()
      .then((userSettings) => {
        this.setState({
          userSettings,
        })
      })
  }
  handleAddCompany = () => {
    const { dispatch, currentCompany, companies } = this.props

    const {
      inProgress,
      businessCategory,
      companyName,
      companyHp,
      companyNameValid,
      companyHpValid,
      idExists,
      userSettings,
    } = this.state

    if (inProgress || !(
      companyNameValid && companyHpValid && !idExists &&
      companyHp.length > 0 && companyName.length > 0
    )) {
      return
    }
    Keyboard.dismiss()
    this.setState({ inProgress: true })

    const {
      firstName,
      lastName,
      cellPhone,
      mail,
    } = userSettings

    const saveCompanies = JSON.parse(JSON.stringify(companies))

    updateLeadInfo.post({
      body: {
        biziboxType: currentCompany.biziboxType,
        firstName: firstName,
        lastName: lastName,
        phoneNumber: cellPhone,
        username: mail,
        hesderId: '4',
      },
    }).then(() => {
      return dispatch(signupCreate({
        body: {
          companyInfo: {
            biziboxType: currentCompany.biziboxType,
            businessCategory: businessCategory,
            companyHp: companyHp,
            companyName: companyName,
            hesderId: '4',
          },
          userInfo: {
            firstName: firstName,
            lastName: lastName,
            cellPhone: cellPhone,
            username: mail,
            password: '',
          },
        },
      }))
        .then(() => {
          return dispatch(getCompanies())
        })
        .then((list) => {
          const companyIdNew = list.find((com) => saveCompanies.every(
            save => save.companyId !== com.companyId)).companyId
          return dispatch(selectCompany(companyIdNew))
            .then(() => {
              const newCompany = list.filter(
                (item) => item.companyId === companyIdNew)
              this.props.handleSetCompany(newCompany[0])
              this.setState({ inProgress: false })
              this.closeModalAddCompany();
              setTimeout(() => {
                goTo(this.props.navigation, 'SETTINGS', {
                  paramsLinkAddCard: {
                    addCard: BANK_ACCOUNTS_TAB,
                  },
                })
              }, 100)
            })
        })
        .catch(() => {
          this.setState({ inProgress: false })
        })
    })
      .catch(() => {
        this.setState({ inProgress: false })
      })
  }

  render () {
    const { isRtl } = this.props
    const {
      currentCompany,
      emailExists,
      contactPhoneValid,
      contactMailValid,
      mailIsHebrew,
      companyNameValid,
      mainContactNameValid,
      cities,
      modalCitiesShow,
      citiesFilter,
      currentCity,
      modalAddCompanyShow,
      inProgress,
      companyNameValidAdd,
      companyName,
      businessCategory,
      companyHp,
      companyHpValid,
      idExists,
    } = this.state
    return (
      <View>
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
                height: 68,
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

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalAddCompanyShow}
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
                height: 55,
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
                      {'הוספת חברה'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity onPress={this.closeModalAddCompany}>
                      <Text style={{
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>ביטול</Text>
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
                <KeyboardAwareScrollView enableOnAndroid>
                  <Text style={{
                    textAlign: 'center',
                    color: '#0f3860',
                    fontSize: sp(13),
                    lineHeight: 42,
                  }}>פרטי העסק</Text>
                  <View
                    style={[
                      cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                    <View style={{ flex: 1.76 }}>
                      <Text style={{
                        textAlign: 'center',
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
                      }, cs(!companyNameValidAdd, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        maxLength={40}
                        onEndEditing={this.handleUpdateFieldValidAdd(
                          'companyNameValidAdd')}
                        onBlur={this.handleUpdateFieldValidAdd(
                          'companyNameValidAdd')}
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
                        onSubmitEditing={this.handleAddCompany}
                        onChangeText={this.handleUpdateFieldAdd('companyName')}
                        value={companyName}
                      />
                    </View>
                  </View>
                  <View
                    style={[
                      cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                    <View style={{ flex: 1.76 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        textAlign: 'center',
                        lineHeight: 42,
                      }}>מס׳ ח.פ/ת.ז</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs((!companyHpValid || idExists), {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        style={[
                          {
                            textAlign: (!companyHp ||
                              (companyHp && companyHp.length === 0))
                              ? 'right'
                              : 'left',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            width: '100%',
                          }, commonStyles.regularFont]}
                        maxLength={9}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="done"
                        keyboardType="numeric"
                        underlineColorAndroid="transparent"
                        onEndEditing={(e) => {
                          this.setState({
                            companyHp: e.nativeEvent.text.toString()
                              .replace(/[^\d]/g, ''),
                          })
                          this.handleUpdateFieldValidAdd('companyHpValid')(e)
                        }}
                        onBlur={this.handleUpdateFieldValidAdd(
                          'companyHpValid')}
                        onChangeText={this.handleUpdateFieldAdd('companyHp')}
                        onSubmitEditing={this.handleAddCompany}
                        value={companyHp}
                      />
                    </View>
                  </View>

                  {(idExists) && (
                    <View
                      style={[
                        cs(isRtl, commonStyles.row,
                          [commonStyles.rowReverse])]}>
                      <View style={{ flex: 1.76 }}/>
                      <View style={[
                        {
                          flex: 5.73,
                        }]}>
                        <Text style={[
                          {
                            width: '100%',
                            marginVertical: 0,
                            color: colors.red7,
                            fontSize: sp(14),
                            textAlign: 'right',
                            fontFamily: fonts.regular,
                          }]}>
                          {'מספר זה קיים במערכת. חייגו 03-5610382 ונשמח לעזור'}
                        </Text>
                      </View>
                    </View>
                  )}
                  <View
                    style={[
                      cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                    <View style={{ flex: 1.76 }}>
                      <Text style={{
                        textAlign: 'center',
                        color: '#0f3860',
                        fontSize: sp(13),
                        lineHeight: 42,
                      }}>תחום עיסוק</Text>
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
                        maxLength={30}
                        placeholder={'(לדוגמה: בית קפה, סוכנות ביטוח)'}
                        placeholderTextColor="#202020"
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
                        onSubmitEditing={this.handleAddCompany}
                        onChangeText={this.handleUpdateFieldAdd(
                          'businessCategory')}
                        value={businessCategory}
                      />
                    </View>
                  </View>


                  {inProgress ? (<LoaderSimple />) : (
                    <TouchableOpacity
                      style={[
                        {
                          height: 45,
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          alignSelf: 'center',
                          backgroundColor: '#0f3860',
                          borderRadius: 5,
                          marginTop: 30,
                          width: 200,
                        }]}
                      onPress={this.handleAddCompany}>
                      <Text
                        style={[
                          styles.btnMatch,
                          { fontFamily: fonts.semiBold }]}>{'קישור חשבון בנק'}</Text>
                    </TouchableOpacity>
                  )}




                </KeyboardAwareScrollView>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        <KeyboardAwareScrollView
          enableOnAndroid
          style={{
            marginRight: 15,
          }}>
          <View
            style={[
              cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                height: 42,
                marginBottom: 8,
              }]}>
            <View style={{ flex: 2.5 }}>
              <Text style={{
                textAlign: 'center',
                color: '#0f3860',
                fontSize: sp(IS_IOS ? 13 : 12),
                lineHeight: 42,
              }}>ח.פ/ת.ז</Text>
            </View>
            <View style={[
              {
                flex: 5.73,
                paddingHorizontal: 21,
              }]}>
              <Text
                style={[
                  {
                    textAlign: 'right',
                    color: '#0f3860',
                    height: 42,
                    lineHeight: 42,
                    fontSize: sp(15),
                    width: '100%',
                  },
                  commonStyles.regularFont]}>{currentCompany.companyHp}</Text>
            </View>
          </View>

          <View
            style={[
              cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                height: 42,
                marginBottom: 8,
              }]}>
            <View style={{ flex: 2.5 }}>
              <Text style={{
                textAlign: 'center',
                color: '#0f3860',
                fontSize: sp(IS_IOS ? 13 : 12),
                lineHeight: 42,
              }}>שם העסק/אחר</Text>
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
                onEndEditing={this.handleUpdateFieldValid('companyNameValid')}
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
                onChangeText={this.handleUpdateField('companyName')}
                value={currentCompany.companyName}
              />
            </View>
          </View>

          <View
            style={[
              cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                height: 42,
                marginBottom: 8,
              }]}>
            <View style={{ flex: 2.5 }}>
              <Text style={{
                textAlign: 'center',
                color: '#0f3860',
                fontSize: sp(IS_IOS ? 13 : 12),
                lineHeight: 42,
              }}>תחום עיסוק</Text>
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
                placeholder={'לדוגמה: משק בית, בית קפה'}
                placeholderTextColor="#202020"
                editable
                maxLength={30}
                autoCorrect={false}
                autoCapitalize="sentences"
                returnKeyType="done"
                keyboardType="default"
                onEndEditing={this.handleUpdateCompany}
                onBlur={this.handleUpdateCompany}
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
                onChangeText={this.handleUpdateField('businessCategory')}
                value={currentCompany.businessCategory}
              />
            </View>
          </View>

          <View style={[
            cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
              height: 42,
              marginBottom: 8,
            }]}>
            <View style={{ flex: 2.5 }}>
              <Text style={{
                color: '#0f3860',
                fontSize: sp(IS_IOS ? 13 : 12),
                lineHeight: 42,
                textAlign: 'center',
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
                  cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }]}
                onPress={this.openModalCities}>

                <View style={{
                  marginRight: 'auto',
                }}>
                  <Icon name="chevron-left" size={24} color={colors.blue34}/>
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
                  {cities && cities.find(
                    (item) => item.cityId === currentCompany.cityId) !==
                  undefined
                    ? cities.find(
                      (item) => item.cityId === currentCompany.cityId).cityName
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
            <View style={{ flex: 2.5 }}>
              <Text style={{
                color: '#0f3860',
                fontSize: sp(IS_IOS ? 13 : 12),
                lineHeight: 42,
                textAlign: 'center',
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
                onChangeText={this.handleUpdateField('street')}
                value={currentCompany.street}
              />
            </View>
          </View>

          <View
            style={[
              cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                height: 42,
                marginBottom: 8,
              }]}>
            <View style={{ flex: 2.5 }}>
              <Text style={{
                color: '#0f3860',
                fontSize: sp(IS_IOS ? 13 : 12),
                textAlign: 'center',
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
              }, cs(!mainContactNameValid, {}, {
                borderWidth: 1,
                borderColor: colors.red,
              })]}>
              <TextInput
                editable
                onEndEditing={this.handleUpdateFieldValid(
                  'mainContactNameValid')}
                onBlur={this.handleUpdateFieldValid('mainContactNameValid')}
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
                onSubmitEditing={this.handleUpdateCompany}
                onChangeText={this.handleUpdateField('mainContactName')}
                value={currentCompany.mainContactName}
              />
            </View>
          </View>

          <View
            style={[
              cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                height: 42,
                marginBottom: (emailExists || mailIsHebrew || !contactMailValid)
                  ? 0
                  : 8,
              }]}>
            <View style={{ flex: 2.5 }}>
              <Text style={{
                color: '#0f3860',
                fontSize: sp(IS_IOS ? 13 : 12),
                lineHeight: 42,
                textAlign: 'center',
              }}>מייל</Text>
            </View>
            <View style={[
              {
                flex: 5.73,
                backgroundColor: '#f5f5f5',
                paddingHorizontal: 21,
                borderBottomRightRadius: 20,
                borderTopRightRadius: 20,
              }, cs((emailExists || !contactMailValid), {}, {
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
                    textAlign: (!currentCompany.contactMail ||
                      (currentCompany.contactMail &&
                        currentCompany.contactMail.length === 0))
                      ? 'right'
                      : 'left',
                    width: '100%',
                  }, commonStyles.regularFont]}
                onEndEditing={this.handleUpdateFieldValid('contactMailValid')}
                onBlur={this.handleUpdateFieldValidAsync}
                autoCorrect={false}
                autoCapitalize="none"
                returnKeyType="done"
                keyboardType="email-address"
                underlineColorAndroid="transparent"
                onSubmitEditing={this.handleUpdateCompany}
                onChangeText={this.handleUpdateField('contactMail')}
                value={currentCompany.contactMail}
              />
            </View>
          </View>

          {(emailExists || mailIsHebrew || !contactMailValid) && (
            <View
              style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse])]}>
              <View style={{ flex: 2.5 }}/>
              <View style={[
                {
                  flex: 5.73,
                }]}>
                {(emailExists === true) && (
                  <Text style={[
                    {
                      width: '100%',
                      marginVertical: 0,
                      color: colors.red7,
                      fontSize: sp(14),
                      textAlign: 'right',
                      fontFamily: fonts.regular,
                    }]}>
                    {'מייל זה קיים במערכת'}
                  </Text>
                )}

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
            <View style={{ flex: 2.5 }}>
              <Text style={{
                color: '#0f3860',
                fontSize: sp(IS_IOS ? 13 : 12),
                textAlign: 'center',
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
              }, cs(!contactPhoneValid, {}, {
                borderWidth: 1,
                borderColor: colors.red,
              })]}>
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
                    textAlign: (!currentCompany.contactPhone ||
                      (currentCompany.contactPhone &&
                        currentCompany.contactPhone.length === 0))
                      ? 'right'
                      : 'left',
                    width: '100%',
                  }, commonStyles.regularFont]}
                onEndEditing={(e) => {
                  let currentCompanyState = Object.assign({},
                    this.state.currentCompany)
                  currentCompanyState.contactPhone = e.nativeEvent.text.toString()
                    .replace(/[^\d-]/g, '')
                  this.setState({ currentCompany: currentCompanyState })
                  this.handleUpdateFieldValid('contactPhoneValid')(e)
                }}
                onBlur={this.handleUpdateFieldValid('contactPhoneValid')}
                onChangeText={this.handleUpdateField('contactPhone')}
                onSubmitEditing={this.handleUpdateCompany}
                value={currentCompany.contactPhone}
              />

            </View>
          </View>
        </KeyboardAwareScrollView>

        <View style={{
          left: 30,
          right: 0,
          top: 10,
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}>
          <TouchableOpacity
            onPress={this.openModalAddCompany}
            style={{
              width: 55,
              height: 55,
              borderRadius: 55,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
              backgroundColor: colors.green6,
            }}>
            <CustomIcon
              name="plus"
              size={32}
              color={colors.white}
            />
          </TouchableOpacity>
        </View>

      </View>
    )
  }
}
