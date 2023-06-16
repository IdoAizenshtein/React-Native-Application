import React, { Fragment, PureComponent } from 'react'
import { setGlobalParams } from 'src/redux/actions/user'
import {
  Image,
  Keyboard,
  Linking,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { connect } from 'react-redux'
import { withTranslation } from 'react-i18next'
import { Button, Icon } from 'react-native-elements'
import Loader from '../../components/Loader/Loader'
import { setLangDirection } from '../../redux/actions/lang'
import {
  combineStyles as cs, getDeviceLang,
  getEmoji,
  goTo,
  isRtl as checkRtl,
  sp,
} from 'src/utils/func'
import { colors, fonts } from 'src/styles/vars'
import {
  createTokenTypeApi,
  getStatusTokenTypeApi,
  isEmailExists,
  skipToDemoCompany,
  updateLeadInfo,
  updateTokenTypeApi,
} from '../../api'
import Api from '../../api/Api'
import CustomIcon from 'src/components/Icons/Fontello'

import {
  ALL_BANK_CREDENTIALS_SCHEME,
  BANK_CREDENTIALS_CONTROL_TYPES,
  BANK_CREDENTIALS_SCHEME,
  BANK_TOKEN_STATUS,
  PASSWORD_RECOVERY_LINKS,
} from 'src/constants/bank'
import { isEmpty } from 'lodash'

import validate from 'validate.js'
import ModalRen from 'src/components/Modal/Modal'
import RoundedTextInput from 'src/components/FormInput/RoundedTextInput'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import ExtendableTextInput from 'src/components/FormInput/ExtendableTextInput'
import textInputStyles from 'src/components/FormInput/FormInputStyles'
import commonStyles from 'src/styles/styles'

import BankTokenService from 'src/services/BankTokenService'
import styles from './SignupScreenStyles'
import { signupCreate } from '../../redux/actions/auth'
import { getCompanies } from '../../redux/actions/company'
import { IS_IOS } from '../../constants/common'
import { LOGIN } from '../../constants/navigation'
import { IS_LIGHT } from '../../constants/config'

import DeviceInfo from 'react-native-device-info'

export const BUNDLE_ID = DeviceInfo.getBundleId()

export const IS_DEV = BUNDLE_ID.endsWith('dev')
const SCREEN = {
  Preview: 'Preview',
  PersonalData: 'PersonalData',
  BusinessData: 'BusinessData',
  AccountData: 'AccountData',
  TokenTrack: 'TokenTrack',
}
const locale =getDeviceLang();

@connect(state => ({
  isRtl: state.isRtl,
  globalParams: state.globalParams,
}))
@withTranslation()
export default class SignupScreen extends PureComponent {
  constructor (props) {
    super(props)
    const { isRtl, dispatch } = props
    if (isRtl || checkRtl(locale)) {dispatch(setLangDirection(true))}

    this.state = {
      termsOpen: false,
      privacyPolicyOpen: false,
      isReady: true,
      screen: SCREEN.PersonalData,
      inProgress: false,
      errMail: false,
      firstName: '',
      lastName: '',
      mail: '',
      cell: '',
      password: '',
      agreementConfirm: false,
      marketingMessagesAgreed: true,
      secureTextEntry: false,
      firstNameValid: true,
      lastNameValid: true,
      cellValid: true,
      mailValid: true,
      passwordValid: true,
      emailExists: false,
      mailIsHebrew: false,
      businessCategory: '',
      companyName: '',
      companyHp: '',
      companyNameValid: true,
      companyHpValid: true,
      idExists: false,
      companyId: null,
      bankId: Object.keys(BANK_CREDENTIALS_SCHEME)[0],
      accountId: null,
      formData: {},
      formErrors: {},
      bankModalIsOpen: false,
      accountModalIsOpen: false,
      newTokenStatus: null,
      newTokenId: null,
      otpFormModalIsOpen: false,
      currentOtpField: null,
      invalidPasswordModalIsOpen: false,
      lockedModalIsOpen: false,
      successModalIsOpen: false,
      is409Error: false,
      business: IS_LIGHT.light,
    }
  }

  // get screenTitle () {
  //   const { screen, status401 } = this.state
  //   const { t } = this.props
  //
  //   switch (screen) {
  //     case SCREEN.LOGIN:
  //       return t('login:loginTitle')
  //     case SCREEN.CHANGE_PASSWORD:
  //       return t('login:forgotPassword')
  //     case SCREEN.CAN_NOT_BE_CHANGED:
  //     case SCREEN.OTP_RESET_PASSWORD:
  //     case SCREEN.RESET_PASSWORD:
  //     case SCREEN.ERROR_401 && status401:
  //       return 'שחזור סיסמה'
  //     case SCREEN.OTP_LOGIN:
  //     case SCREEN.ERROR_401 && !status401:
  //       return 'עוד צעד קטן...'
  //     default:
  //       return ''
  //   }
  // }

  // componentWillUnmount () {
  //   // this.removeSmsListener()

  get screenPasswordUpdateCount () {
    const { newTokenStatus } = this.state

    if (!newTokenStatus || !newTokenStatus.screenPasswordUpdateCount) {return 1}
    if (newTokenStatus.screenPasswordUpdateCount) {return newTokenStatus.screenPasswordUpdateCount}
  }

  // }
  handleUpdateField = name => val => {
    let value = val || ''
    if (name === 'firstName' ||
      name === 'lastName' ||
      name === 'companyName' ||
      name === 'businessCategory'
    ) {
      value = value.toString().replace(getEmoji(), '')
    } else {
      value = value.toString().replace(getEmoji(), '').replace(/\s+/g, '')
    }

    if (name === 'password') {
      this.setState(
        { [name]: value.toString().replace(/([\u05D0-\u05FF/\s+]+)/g, '') })
      this.handleUpdateFieldValid(`${name}Valid`)({
        nativeEvent: {
          text: value,
        },
      })
    } else if (name === 'cell') {
      const values = value.toString().replace(/[^\d-]/g, '')
      this.setState({ [name]: values })
      this.handleUpdateFieldValid('cellValid')({
        nativeEvent: {
          text: values,
        },
      })
    } else if (name === 'mail') {
      this.setState({ [name]: value })
      this.handleUpdateFieldValid('mailValid')({
        nativeEvent: {
          text: value,
        },
      })
    } else if (name === 'businessCategory') {
      this.setState({ [name]: value })
    } else if (name === 'companyHp') {
      const values = value && value.toString().replace(/[^\d]/g, '')
      this.setState({ [name]: values })
      this.handleUpdateFieldValid('companyHpValid')({
        nativeEvent: {
          text: values,
        },
      })
    } else {
      this.setState({ [name]: value })
      this.handleUpdateFieldValid(`${name}Valid`)({
        nativeEvent: {
          text: value,
        },
      })
    }
  }

  handleUpdateFieldValid = name => val => {
    let value = val.nativeEvent.text || ''

    if (name === 'passwordValid') {
      this.setState({
        [name]: !(!value || value.length < 8 || value.length >= 12 ||
          value.replace(/[^\d]/g, '').length === 0 ||
          value.replace(/[^A-Za-z]/g, '').length === 0),
      })
    } else if (name === 'mailValid') {
      const re = /\S+@\S+\.\S+/
      const isHebrew = (value && /[\u0590-\u05FF]/.test(value))
      const mailValid = (value && re.test(value) && value.length > 0)
      this.setState({
        [name]: mailValid,
        mailIsHebrew: isHebrew,
      })
    } else if (name === 'cellValid') {
      this.setState({
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
      this.setState({ [name]: value && (value.length === 9 && result) })
      if (value && value.length === 9 && result) {
        const { mail } = this.state
        new Api({
          endpoint: 'companies/hp-exists',
          secure: mail === null,
        }).post({
          body: {
            companyHp: value,
            username: mail,
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

  handleUpdateFieldValidAsync = (e) => {
    const { firstName, lastName, cell, mail } = this.state
    const re = /\S+@\S+\.\S+/
    let val = (IS_IOS ? e.nativeEvent.text : mail) || ''
    if (val && re.test(val) && val.length > 0) {
      isEmailExists.post({
        body: {
          firstName: firstName,
          lastName: lastName,
          phoneNumber: cell,
          username: val,
          hesderId: null,
        },
      })
        .then((data) => {
          this.setState({ emailExists: data.exists !== false })
        })
        .catch(() => {

        })
    } else {
      const isHebrew = (val && /[\u0590-\u05FF]/.test(val))
      this.setState({
        'mailValid': false,
        mailIsHebrew: isHebrew,
        emailExists: false,
      })
    }
  }

  handleUpdateLeadInfo = () => {
    const { cell, mail, cellValid, mailValid, emailExists, inProgress } = this.state

    if (inProgress || !(
      cellValid && mailValid && !emailExists && mail.length > 0 && cell.length >
      0
    )) {
      return
    }
    Keyboard.dismiss()
    this.setState({ inProgress: true })

    return updateLeadInfo.post({
      body: {
        firstName: 'הרשמה',
        lastName: 'אפל',
        phoneNumber: cell,
        username: mail,
        hesderId: 222,
      },
    })
      .then(() => {
        this.setState({
          inProgress: false,
          screen: SCREEN.BusinessData,
        }, () => {
          setTimeout(() => {
            this.handleGoToLogin()
          }, 2500)
        })
      })
      .catch(() => {

      })
  }

  handleSignupCreate = () => {
    const { dispatch } = this.props

    const {
      firstName, lastName, cell, mail, inProgress, password,
      businessCategory,
      companyName,
      companyHp,
      companyNameValid,
      companyHpValid,
      idExists,
      business,
    } = this.state

    if (inProgress || !(
      companyNameValid && companyHpValid && !idExists &&
      companyHp.length > 0 && companyName.length > 0
    )) {
      return
    }
    Keyboard.dismiss()
    this.setState({ inProgress: true })
    return dispatch(signupCreate({
      body: {
        companyInfo: {
          biziboxType: !business ? 'regular' : 'business',
          businessCategory: businessCategory,
          companyHp: companyHp,
          companyName: companyName,
          hesderId: null,
        },
        userInfo: {
          firstName: firstName,
          lastName: lastName,
          cellPhone: cell,
          username: mail,
          password: password,
        },
      },
    }))
      .then(() => {
        return dispatch(getCompanies()).then((data) => {
          const companyId = Array.isArray(data) && data.length > 0
            ? data[0].companyId
            : null
          if (companyId) {
            this.setState({
              inProgress: false,
              screen: SCREEN.AccountData,
              companyId,
            })
          }
        })
          .catch(() => {

          })
      })
      .catch(() => {

      })
  }

  componentDidMount () {

  }

  handleTogglePasswordVisibility = () => {
    const { secureTextEntry } = this.state
    this.setState({ secureTextEntry: !secureTextEntry })
  }

  handleGoToLogin = () => {
    const { navigation } = this.props
    goTo(navigation, 'LOGIN')
  }

  handleGoToPersonalData = () => this.setState({
    inProgress: false,
    screen: SCREEN.PersonalData,
  })

  handleToggleOtpFormModal = () => this.setState(
    { otpFormModalIsOpen: !this.state.otpFormModalIsOpen })

  handleUpdateFormField = (name) => (value) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value.toString().replace(/([\u05D0-\u05FF/\s+]+)/g, ''),
      },
    })
    setTimeout(() => this.validateForm(), 200)
  }

  handleChangeBankId = (bankId) => this.setState({
    bankId,
    formData: {},
    formErrors: {},
    currentOtpField: null,
  })

  handleToggleBankModal = () => this.setState(
    { bankModalIsOpen: !this.state.bankModalIsOpen })

  handleSetOtpField = (currentOtpField) => () => this.setState(
    { currentOtpField: currentOtpField })

  handleCreateBankToken = () => {
    this.validateForm()

    setTimeout(() => {
      const { inProgress, bankId, formData, formErrors, currentOtpField, accountId, newTokenId, companyId } = this.state
      const scheme = ALL_BANK_CREDENTIALS_SCHEME[bankId]
      if (!scheme || inProgress || !isEmpty(formErrors)) {
        return this.setState({ inProgress: false })
      }

      this.setState({ inProgress: true })

      const keyCode = scheme.otp
        ? `__otp__${currentOtpField}`
        : scheme.fields[1].controlType ===
        BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD
          ? scheme.fields[2] ? scheme.fields[2].key : null
          : scheme.fields[1] ? scheme.fields[1].key : null

      if (!newTokenId) {
        const body = {
          bankId,
          companyId,
          bankAuto: formData[keyCode] || 1,
          bankPass: formData[scheme.fields.find(f => f.controlType ===
            BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD).key],
          bankUserName: formData[scheme.fields[0].key],
          companyAccountId: accountId,
        }

        return createTokenTypeApi.post({ body })
          .then((token) => {
            this.props.dispatch(
              setGlobalParams(Object.assign(this.props.globalParams, {
                updateToken: token,
              })))
            this.setState({
              newTokenId: token,
              is409Error: false,
            })
            if (companyId) {
              return getStatusTokenTypeApi.post({
                body: {
                  companyId,
                  tokens: [token],
                },
              })
            } else {
              return false
            }
          })
          .then(([newTokenStatus]) => {
            this.setState({ newTokenStatus })
            this.startPullingTokenStatus()
          })
          .catch((err) => {
            if (err.status === 409) {
              this.setState({
                inProgress: false,
                is409Error: true,
              })
            } else {
              this.setState({ inProgress: false })
            }
          })
      } else {
        const body = {
          bankId,
          companyId,
          tokenId: newTokenId,
          bankAuto: formData[keyCode] || null,
          bankPass: formData[scheme.fields.find(f => f.controlType ===
            BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD).key],
          bankUserName: formData[scheme.fields[0].key],
          companyAccountId: accountId,
        }
        return updateTokenTypeApi.post({ body })
          .then(() => {
            this.props.dispatch(
              setGlobalParams(Object.assign(this.props.globalParams, {
                updateToken: newTokenId,
              })))
            if (companyId) {
              return getStatusTokenTypeApi.post({
                body: {
                  companyId,
                  tokens: [newTokenId],
                },
              })
            } else {
              return false
            }
          })
          .then(([newTokenStatus]) => {
            this.setState({ newTokenStatus })
            this.startPullingTokenStatus()
          })
          .catch(() => this.setState({ inProgress: false }))
      }
    }, 20)
  }

  handleOpenBankSite = () => {
    this.clearForm()
    setTimeout(() => {
      this.props.onClose()
      const link = PASSWORD_RECOVERY_LINKS[this.state.bankId]
      Linking.canOpenURL(link)
        .then(s => {
          if (s) {Linking.openURL(PASSWORD_RECOVERY_LINKS[this.state.bankId])}
        })
    }, 100)
  }

  startPullingTokenStatus = () => {
    this.intervalId = setInterval(() => {
      const { newTokenId, companyId } = this.state
      if (companyId) {
        return getStatusTokenTypeApi.post({
          body: {
            companyId,
            tokens: [newTokenId],
          },
        })
          .then(([newTokenStatus]) => {
            this.setState({ newTokenStatus })
            if (!newTokenStatus) {return}
            const statusCode = BankTokenService.getTokenStatusCode(
              newTokenStatus.tokenStatus)

            if (BankTokenService.isTokenStatusProgressing(
              newTokenStatus.tokenStatus)) {return}

            if (statusCode === BANK_TOKEN_STATUS.INVALID_PASSWORD) {
              this.setState({
                inProgress: false,
                invalidPasswordModalIsOpen: newTokenStatus.screenPasswordUpdateCount <
                  3,
                lockedModalIsOpen: newTokenStatus.screenPasswordUpdateCount >=
                  3,
              })
              this.stopPullingTokenStatus()
            }

            if ([
              BANK_TOKEN_STATUS.VALID,
              BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED].includes(
              statusCode)) {
              this.setState({
                inProgress: false,
                successModalIsOpen: true,
              })
              this.stopPullingTokenStatus()
            }
          })
      }
    }, 5000)
  }

  stopPullingTokenStatus = () => {
    clearInterval(this.intervalId)
  }

  clearForm = () => {
    this.setState({
      formData: {},
      formErrors: {},
      bankModalIsOpen: false,
      creditCardModalIsOpen: false,
      slikaModalIsOpen: false,
      inProgress: false,
      otpFormModalIsOpen: false,
      currentOtpField: null,
      invalidPasswordModalIsOpen: false,
      lockedModalIsOpen: false,
      successModalIsOpen: false,
    })
  }

  renderForm = () => {
    const { bankId, formData, formErrors, currentOtpField } = this.state
    const { t } = this.props

    const schemeId = bankId

    const scheme = ALL_BANK_CREDENTIALS_SCHEME[schemeId]
    if (!scheme || isEmpty(scheme.fields)) {return null}

    return (
      <Fragment>

        {scheme.fields.map(f => {
          if (f.key === 'userCode' && scheme.otp) {return null}

          let placeHolder = t(
            `foreignCredentials:${schemeId}:${f.key}:placeHolder`)
          if (placeHolder.includes('.placeHolder')) {
            placeHolder = ''
          }
          return (
            <View style={styles.formRow} key={f.key}>
              <View style={styles.formRowLeftPart}>
                <RoundedTextInput
                  placeholder={placeHolder}
                  placeholderTextColor={colors.gray34}
                  onEndEditing={(e) => {
                    this.handleUpdateFormField(f.key)(
                      e.nativeEvent.text.toString()
                        .replace(/([\u05D0-\u05FF/\s+]+)/g, ''))
                  }}
                  isInvalid={formErrors[f.key]}
                  isPassword={f.controlType ===
                  BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD}
                  onChangeText={this.handleUpdateFormField(f.key)}
                  onSubmitEditing={this.validateForm}
                  onBlur={this.validateForm}
                  value={formData[f.key]}
                  keyboardType={f.validation.numericality
                    ? 'numeric'
                    : 'default'}
                />
              </View>

              <View style={styles.formRowRightPart}>
                <Text style={[styles.formRowRightText, {}]}>
                  {t(`foreignCredentials:${schemeId}:${f.key}:label`)}
                </Text>
              </View>
            </View>
          )
        })}

        {(scheme.otp && scheme.otpTypes) ? (
          <TouchableOpacity style={styles.formRow}
                            onPress={this.handleToggleOtpFormModal}>
            <View
              style={cs(
                Object.keys(formErrors).some(k => k.includes('__otp__')),
                styles.bankTypeBtn, [
                  textInputStyles.invalid, {
                    borderTopWidth: 1,
                    borderBottomWidth: 1,
                    borderRightWidth: 1,
                  }])}>
              <Icon name="chevron-left" size={22} color={colors.blue8}/>
              {currentOtpField && (
                <Text
                  style={styles.bankName}>{formData[`__otp__${currentOtpField}`]}</Text>
              )}
            </View>

            <View style={styles.formRowRightPart}>
              <Text style={styles.formRowRightText}>
                {t(`foreignCredentials:${bankId}:description`)}
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}
      </Fragment>
    )
  }

  renderHeaderForm = () => {
    const { bankId } = this.state
    const { t } = this.props

    return (
      <Fragment>
        <View style={styles.formRow}>
          <View style={styles.formRowLeftPart}>
            <TouchableOpacity style={styles.bankTypeBtn}
                              onPress={this.handleToggleBankModal}>
              <Icon name="chevron-left" size={22} color={colors.blue8}/>

              <View style={[commonStyles.row, commonStyles.alignItemsCenter]}>
                <Text style={styles.bankName}>{t(`bankName:${bankId}`)}</Text>
                <AccountIcon account={{ bankId }}/>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.formRowRightPart}>
            <Text style={styles.formRowRightText}>
              {t('settings:bankAccountsTab:bankName')}
            </Text>
          </View>
        </View>
      </Fragment>
    )
  }

  renderOtpForm = () => {
    const { bankId, formData, formErrors, currentOtpField } = this.state
    const { t } = this.props

    const scheme = ALL_BANK_CREDENTIALS_SCHEME[bankId]
    if (!scheme || isEmpty(scheme.otpTypes)) {return null}
    return (
      <ModalRen
        isOpen
        title={t(`foreignCredentials:${bankId}:description`)}
        onRightPress={this.handleToggleOtpFormModal}
        rightComponent={<Icon name="chevron-right" size={30}
                              color={colors.white}/>}
      >
        <ScrollView
          style={styles.addModalBody}
          contentContainerStyle={styles.otpFormModalContainer}
        >
          {scheme.otpTypes.map((f, i) => {
            return (
              <View style={styles.formRow} key={f.key}>
                <ExtendableTextInput
                  isInvalid={formErrors[`__otp__${f.key}`]}
                  isChecked={currentOtpField === f.key}
                  isMarked={i === 0}
                  keyboardType="numeric"
                  maxLength={f.validation.length.maximum}
                  onChangeText={this.handleUpdateFormField(`__otp__${f.key}`)}
                  onSubmitEditing={this.validateForm}
                  onBlur={this.validateForm}
                  value={formData[`__otp__${f.key}`]}
                  onCheck={this.handleSetOtpField(f.key)}
                  placeholder={t(
                    `foreignCredentials:${bankId}:otpTypes:${f.key}:rule`)}
                  placeholderTextColor={colors.gray34}
                  label={t(
                    `foreignCredentials:${bankId}:otpTypes:${f.key}:label`)}
                  description={t(
                    `foreignCredentials:${bankId}:otpTypes:${f.key}:description`)}
                  tooltip={t(
                    `foreignCredentials:${bankId}:otpTypes:${f.key}:info`)}
                />
              </View>
            )
          })}
        </ScrollView>
      </ModalRen>
    )
  }

  validateForm = () => {
    const { bankId, formData, currentOtpField } = this.state

    const schemeId = bankId

    const scheme = ALL_BANK_CREDENTIALS_SCHEME[schemeId]
    if (!scheme || isEmpty(scheme.fields)) {return null}

    const formErrors = scheme.fields.reduce((memo, field) => {
      if (!field.validation ||
        (field.key === 'userCode' && scheme.otp)) {return memo}
      const error = validate.single(formData[field.key], field.validation)

      if (error) {memo[field.key] = true}

      return memo
    }, {})

    if (scheme.otp) {
      if (currentOtpField) {
        const otpField = scheme.otpTypes.find(f => f.key === currentOtpField)
        const error = validate.single(formData[`__otp__${currentOtpField}`],
          otpField.validation)
        if (error) {formErrors[`__otp__${currentOtpField}`] = true}
      } else {
        formErrors.__otp__ = false
      }
    }

    this.setState({ formErrors })
  }

  componentWillUnmount () {
    this.stopPullingTokenStatus()
  }

  handleGoToExample = () => {
    const { navigation } = this.props
    Keyboard.dismiss()
    this.setState({ inProgress: true })

    return skipToDemoCompany.post({
      body: {},
    })
      .then(() => {
        this.setState({ inProgress: false })
        return goTo(navigation, 'LOGIN')
      })
      .catch(() => {

      })
  }

  termsToggle = () => {
    const { termsOpen } = this.state
    this.setState({ termsOpen: !termsOpen })
  }
  privacyPolicyToggle = () => {
    const { privacyPolicyOpen } = this.state
    this.setState({ privacyPolicyOpen: !privacyPolicyOpen })
  }
  handleLink = () => {
    IS_LIGHT.light = null
    this.setState({
      business: null,
      screen: SCREEN.Preview,
    })
    const { navigation } = this.props
    goTo(navigation, LOGIN)
  }
  handleLinkTermsPrivacyPolicy = () => {
    this.privacyPolicyToggle()
    this.termsToggle()
  }

  handleLinkAppStore = () => {
    const link = 'https://www.apple.com/legal/internet-services/itunes/'
    Linking.canOpenURL(link)
      .then(s => {
        if (s) {Linking.openURL(link)}
      })
  }
  handleLinkGoogle = () => {
    const link = 'https://play.google.com/intl/en/about/play-terms.html'
    Linking.canOpenURL(link)
      .then(s => {
        if (s) {Linking.openURL(link)}
      })
  }
  handleLinkTermsPrivacyPolicyGoogle = () => {
    const link = 'https://www.google.com/policies/privacy'
    Linking.canOpenURL(link)
      .then(s => {
        if (s) {Linking.openURL(link)}
      })
  }
  handleLinkSignBizibox = () => {
    const link = 'https://bizibox.biz/contact-us/'
    Linking.canOpenURL(link)
      .then(s => {
        if (s) {Linking.openURL(link)}
      })
  }
  getSwitchIcon = () => {
    return (
      <CustomIcon
        name={this.state.business ? 'ok' : 'times'}
        size={7}
        color={this.state.business ? colors.blue32 : colors.gray29}
      />
    )
  }
  handleChangeLight = (state) => () => {
    IS_LIGHT.light = state
    this.setState({
      business: !state,
    }, () => {
      setTimeout(() => {
        this.setState({
          screen: SCREEN.PersonalData,
        })
      }, 1000)
    })
  }

  render () {
    const {
      inProgress, screen, agreementConfirm, firstName, lastName, password, mail, cell, isReady, emailExists,
      firstNameValid,
      lastNameValid,
      cellValid,
      mailValid,
      passwordValid,
      mailIsHebrew,
    } = this.state
    const { t } = this.props
    if (!isReady) {return <Loader/>}

    return (
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.contentContainer}
        style={commonStyles.mainContainer}>
        <Image
          style={commonStyles.mainBgImg}
          source={require('BiziboxUI/assets/main-bg.png')}
        />

        <Image
          style={styles.bottomImgBg}
          resizeMode="cover"
          source={require('BiziboxUI/assets/loginBg.png')}
        />

        <View style={[
          styles.container,

        ]}>
          <View style={[
            styles.titleWrapper, {
              marginBottom: 20,
            }]}>
            <Image
              style={styles.logoImg}
              resizeMode="contain"
              source={require('BiziboxUI/assets/logoBig.png')}
            />
          </View>

          {screen === SCREEN.PersonalData && (
            <Fragment>

              <View style={{
                width: '100%',
                marginVertical: 5,
              }}>
                <TextInput
                  onEndEditing={this.handleUpdateFieldValid('mailValid')}
                  onBlur={this.handleUpdateFieldValidAsync}
                  placeholder={t('common:label:email')}
                  placeholderTextColor="#202020"
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  keyboardType="email-address"
                  underlineColorAndroid="transparent"
                  style={[
                    styles.input,
                    {
                      borderBottomColor: (emailExists || !mailValid)
                        ? colors.red2
                        : colors.blue3,
                      borderBottomWidth: 2,
                      fontFamily: fonts.semiBold,
                      fontWeight: 'normal',
                      color: colors.blue29,
                      textAlign: (!mail || (mail && mail.length === 0))
                        ? 'right'
                        : 'left',
                      height: 50,
                      fontSize: sp(17),
                      backgroundColor: 'transparent',
                    },
                  ]}
                  onSubmitEditing={this.handleUpdateLeadInfo}
                  onChangeText={this.handleUpdateField('mail')}
                  value={mail}
                />
              </View>
              <View style={{
                width: '100%',
                marginVertical: 0,
              }}>
                {(emailExists === true) && (
                  <View style={{
                    width: '100%',
                    marginVertical: 0,
                    flexDirection: 'row-reverse',
                    justifyContent: 'center',
                  }}>

                    <Text
                      style={[
                        {
                          color: colors.red7,
                          fontSize: sp(14),
                          textAlign: 'center',
                          fontFamily: fonts.regular,
                        }]}>
                      {'מייל זה קיים במערכת, עבור ל-'}
                    </Text>

                    <TouchableOpacity onPress={this.handleGoToLogin}>
                      <Text
                        style={[
                          {
                            color: colors.blue30,
                            fontSize: sp(14),
                            textAlign: 'center',
                            fontFamily: fonts.regular,
                          }]}>
                        {'מסך כניסה'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

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
                marginVertical: 5,
              }}>
                <TextInput
                  maxLength={11}
                  placeholder={'טלפון נייד'}
                  placeholderTextColor="#202020"
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  keyboardType="numeric"
                  underlineColorAndroid="transparent"
                  style={[
                    styles.input,
                    {
                      borderBottomColor: !cellValid
                        ? colors.red2
                        : colors.blue3,
                      borderBottomWidth: 2,
                      fontFamily: fonts.semiBold,
                      fontWeight: 'normal',
                      color: colors.blue29,
                      textAlign: (!cell || (cell && cell.length === 0))
                        ? 'right'
                        : 'left',
                      height: 50,
                      fontSize: sp(17),
                      backgroundColor: 'transparent',
                    },
                  ]}
                  onEndEditing={(e) => {
                    this.setState({
                      cell: e.nativeEvent.text.toString()
                        .replace(/[^\d-]/g, ''),
                    })
                    this.handleUpdateFieldValid('cellValid')(e)
                  }}
                  onBlur={this.handleUpdateFieldValid('cellValid')}
                  onChangeText={this.handleUpdateField('cell')}
                  onSubmitEditing={this.handleUpdateLeadInfo}
                  value={cell}
                />
              </View>

              <Button
                disabled={!(
                  firstNameValid && lastNameValid && cellValid && mailValid &&
                  passwordValid && agreementConfirm && !emailExists &&
                  (firstName && firstName.length > 0) &&
                  (lastName && lastName.length > 0) &&
                  (password && password.length > 0) &&
                  (mail && mail.length > 0) && (cell && cell.length > 0)
                )}
                disabledTitleStyle={{
                  color: '#ffffff',
                  opacity: 0.8,
                }}
                disabledStyle={{
                  backgroundColor: colors.green12,
                  opacity: 0.8,
                }}
                loading={inProgress}
                buttonStyle={[
                  styles.btn, {
                    marginTop: 10,
                  }]}
                titleStyle={styles.btnText}
                onPress={this.handleUpdateLeadInfo}
                title={'אישור'}
              />
            </Fragment>
          )}

          {screen === SCREEN.BusinessData && (
            <Fragment>
              <Image
                resizeMode="contain"
                style={[
                  {
                    width: 69,
                    height: 67,
                    marginVertical: 15,
                  }]}
                source={require('BiziboxUI/assets/iconVSignUp.png')}
              />
              <Text style={{
                fontFamily: fonts.regular,
                color: colors.blue32,
                textAlign: 'center',
                fontSize: sp(26),
                marginTop: 5,
              }}>{'הפרטים הועברו בהצלחה'}</Text>
            </Fragment>
          )}
        </View>
        <View style={{
          flexDirection: 'column',
          alignSelf: 'center',
          justifyContent: 'flex-end',
          alignItems: 'center',
          alignContent: 'center',
          marginBottom: 50,
        }}>
          <View style={{
            flexDirection: 'row-reverse',
            height: 20,
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}>
            <Text style={{
              fontSize: sp(14),
              height: 20,
            }}>
              {'נתקלתם בבעיה? חייגו 2365* ונשמח לעזור'}
            </Text>
          </View>
          <Image
            style={[
              {
                width: 188,
                height: 23,
                marginTop: 10,
              }]}
            source={require('BiziboxUI/assets/securityIcons.png')}
          />

          <TouchableOpacity
            onPress={this.handleLink}
            style={{
              flexDirection: 'row-reverse',
              height: 20,
              paddingTop: 10,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}>
            <Text style={{
              fontSize: sp(14),
              height: 20,
              textAlign: 'center',
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
              color: colors.blue30,
            }}>
              {'חזרה למסך כניסה'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }
}
