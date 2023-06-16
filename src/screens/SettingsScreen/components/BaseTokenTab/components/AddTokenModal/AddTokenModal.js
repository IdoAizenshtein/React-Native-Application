import React, { Fragment, PureComponent } from 'react'
import {
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import validate from 'validate.js'
import { withTranslation } from 'react-i18next'
import { isEmpty } from 'lodash'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Modal from 'src/components/Modal/Modal'
import RoundedTextInput from 'src/components/FormInput/RoundedTextInput'
import {
  ALL_BANK_CREDENTIALS_SCHEME,
  BANK_CREDENTIALS_CONTROL_TYPES,
  BANK_CREDENTIALS_SCHEME,
  BANK_ICONS,
  BANK_TOKEN_STATUS,
  CREDIT_CARD_ICONS,
  CREDIT_CARDS_CREDENTIALS_SCHEME,
  PASSWORD_RECOVERY_LINKS,
  SLIKA_CREDENTIALS_SCHEME,
  SLIKA_ICONS,
} from 'src/constants/bank'
import { colors, fonts } from 'src/styles/vars'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import LoaderWrapper from 'src/components/Loader/LoaderWrapper'
import BankModal from './components/BankModal'
import ExtendableTextInput from 'src/components/FormInput/ExtendableTextInput'
import {
  createTokenTypeApi,
  getStatusTokenTypeApi,
  updateTokenTypeApi,
} from 'src/api'
import textInputStyles from 'src/components/FormInput/FormInputStyles'
import { combineStyles as cs, getEmoji, sp } from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles from './AddTokenModalStyles'
import he from 'src/locales/he'
import BankTokenService from 'src/services/BankTokenService'
import WrongStatusModal from './components/WrongStatusModal'
import BlockedModal from './components/BlockedModal'
import SuccessModal from './components/SuccessModal'
import CreditCardModal from './components/CreditCardModal'
import SlikaModal from './components/SlikaModal'
import AccountModal from './components/AccountModal'
import { getAccounts } from '../../../../../../redux/actions/account'
import { connect } from 'react-redux'
import { setGlobalParams } from '../../../../../../redux/actions/user'

@withTranslation()
@connect(state => ({
  globalParams: state.globalParams,
}))
export default class AddTokenModal extends PureComponent {
  intervalId = null

  constructor (props) {
    super(props)
    this.state = ({
      bankId: Object.keys(BANK_CREDENTIALS_SCHEME)[0],
      slikaId: Object.keys(SLIKA_CREDENTIALS_SCHEME)[0],
      creditCardId: Object.keys(CREDIT_CARDS_CREDENTIALS_SCHEME)[0],
      accountId: isEmpty(props.accounts)
        ? null
        : props.accounts[0].companyAccountId,
      formData: {},
      formErrors: {},
      bankModalIsOpen: false,
      creditCardModalIsOpen: false,
      slikaModalIsOpen: false,
      accountModalIsOpen: false,
      newTokenStatus: null,
      newTokenId: null,
      inProgress: false,
      otpFormModalIsOpen: false,
      currentOtpField: null,
      invalidPasswordModalIsOpen: false,
      lockedModalIsOpen: false,
      successModalIsOpen: false,
      is409Error: false,
    })
  }

  get screenPasswordUpdateCount () {
    const { newTokenStatus } = this.state

    if (!newTokenStatus || !newTokenStatus.screenPasswordUpdateCount) {return 1}
    if (newTokenStatus.screenPasswordUpdateCount) {return newTokenStatus.screenPasswordUpdateCount}
    // if (newTokenStatus.screenPasswordUpdateCount === 1) return 2
    // if (newTokenStatus.screenPasswordUpdateCount > 2) return 3
  }

  handleToggleOtpFormModal = () => this.setState(
    { otpFormModalIsOpen: !this.state.otpFormModalIsOpen })

  handleUpdateFormField = (name) => (value) => {
    let val = value || ''
    val = val.toString()
      .replace(getEmoji(), '')
      .replace(/([\u05D0-\u05FF/\s+]+)/g, '')
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: val,
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

  handleChangeCreditCardId = (creditCardId) => {
    this.setState({
      creditCardId,
      formData: {},
      formErrors: {},
      currentOtpField: null,
    })
  }

  handleChangeAccountId = (accountId) => {
    this.setState({
      accountId,
      formData: {},
      formErrors: {},
      currentOtpField: null,
    })
  }

  handleChangeSlikaId = (slikaId) => {
    this.setState({
      slikaId,
      formData: {},
      formErrors: {},
      currentOtpField: null,
    })
  }

  handleToggleBankModal = () => this.setState(
    { bankModalIsOpen: !this.state.bankModalIsOpen })

  handleToggleCreditCardModal = () => this.setState(
    { creditCardModalIsOpen: !this.state.creditCardModalIsOpen })

  handleToggleAccountModal = () => this.setState(
    { accountModalIsOpen: !this.state.accountModalIsOpen })

  handleToggleSlikaModal = () => this.setState(
    { slikaModalIsOpen: !this.state.slikaModalIsOpen })

  handleSetOtpField = (currentOtpField) => () => this.setState(
    { currentOtpField: currentOtpField })

  handleCreateBankToken = () => {
    const { inProgress, bankId, formData, formErrors, currentOtpField, accountId, newTokenId, creditCardId, slikaId } = this.state
    const { tokenType, idCompany } = this.props
    const { companyId } = this.props

    const schemeId = tokenType === 'CREDITCARD' ? creditCardId : tokenType ===
    'SLIKA' ? slikaId : bankId
    const scheme = ALL_BANK_CREDENTIALS_SCHEME[schemeId]
    if (!scheme || inProgress || !isEmpty(formErrors) ||
      isEmpty(scheme.fields)) {
      return
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
        bankId: schemeId,
        companyId,
        bankAuto: formData[keyCode] || 1,
        bankPass: formData[scheme.fields.find(f => f.controlType ===
          BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD).key],
        bankUserName: formData[scheme.fields[0].key],
        companyAccountId: idCompany ? null : accountId,
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
        bankId: schemeId,
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
  }

  handleOpenBankSite = () => {
    const link = PASSWORD_RECOVERY_LINKS[this.state.bankId]
    Linking.canOpenURL(link)
      .then(s => {
        if (!s) {return}
        return Linking.openUrl(PASSWORD_RECOVERY_LINKS[this.state.bankId])
      })

    this.props.onClose()
  }

  startPullingTokenStatus = () => {
    this.intervalId = setInterval(() => {
      const { newTokenId } = this.state
      const { companyId, dispatch } = this.props
      if (companyId) {
        return getStatusTokenTypeApi.post({
          body: {
            companyId,
            tokens: [newTokenId],
          },
        })
          .then(([newTokenStatus]) => {
            // console.log('newTokenStatus---', newTokenStatus)
            this.setState({ newTokenStatus })
            if (!newTokenStatus) {return}
            const statusCode = BankTokenService.getTokenStatusCode(
              newTokenStatus.tokenStatus)
            if (BankTokenService.isTokenStatusProgressing(
              newTokenStatus.tokenStatus) || statusCode ===
              BANK_TOKEN_STATUS.ALMOST_DONE) {
              this.setState({
                inProgress: false,
                invalidPasswordModalIsOpen: newTokenStatus.screenPasswordUpdateCount <
                  3,
                lockedModalIsOpen: newTokenStatus.screenPasswordUpdateCount >=
                  3,
              })
              this.stopPullingTokenStatus()
              this.handleClose()
            }
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
              if (statusCode === BANK_TOKEN_STATUS.VALID) {
                dispatch(getAccounts())
              }
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
    })
  }

  renderForm = () => {
    const { bankId, creditCardId, slikaId, formData, formErrors, currentOtpField } = this.state
    const { t, tokenType } = this.props

    const schemeId = tokenType === 'CREDITCARD'
      ? creditCardId
      : tokenType === 'SLIKA'
        ? slikaId
        : bankId

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
                <Text style={styles.formRowRightText}>
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
    const { bankId, slikaId, creditCardId, accountId } = this.state
    const { t, tokenType, accounts } = this.props
    const currentAccount = isEmpty(accounts) ? {} : accounts.find(
      a => a.companyAccountId === accountId)

    return (
      <Fragment>
        {tokenType === 'ACCOUNT' ? (
          <View style={styles.formRow}>
            <View style={styles.formRowLeftPart}>
              <TouchableOpacity style={styles.bankTypeBtn}
                                onPress={this.handleToggleBankModal}>
                <Icon name="chevron-left" size={22} color={colors.blue8}/>

                <View
                  style={[commonStyles.row, commonStyles.alignItemsCenter]}>
                  <Text style={styles.bankName}>{t(
                    `bankName:${bankId}`)}</Text>
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
        ) : (
          <View style={styles.formRow}>
            <View style={styles.formRowLeftPart}>
              <TouchableOpacity style={styles.bankTypeBtn}
                                onPress={this.handleToggleAccountModal}>
                <Icon name="chevron-left" size={22} color={colors.blue8}/>

                <View
                  style={[commonStyles.row, commonStyles.alignItemsCenter]}>
                  <Text
                    style={styles.bankName}>{currentAccount.accountNickname}</Text>
                  <Image source={BANK_ICONS[currentAccount.bankId].uri}/>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.formRowRightPart}>
              <Text style={styles.formRowRightText}>
                {t('settings:accountAssociation')}
              </Text>
            </View>
          </View>
        )}

        {tokenType === 'CREDITCARD' && (
          <View style={styles.formRow}>
            <View style={styles.formRowLeftPart}>
              <TouchableOpacity style={styles.bankTypeBtn}
                                onPress={this.handleToggleCreditCardModal}>
                <Icon name="chevron-left" size={22} color={colors.blue8}/>

                <View
                  style={[commonStyles.row, commonStyles.alignItemsCenter]}>
                  <Text style={styles.bankName}>{t(
                    `creditCardsName:${creditCardId}`)}</Text>
                  <Image source={CREDIT_CARD_ICONS[creditCardId].uri}/>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.formRowRightPart}>
              <Text style={styles.formRowRightText}>
                {t('settings:creditCardsTab:creditCard')}
              </Text>
            </View>
          </View>
        )}

        {tokenType === 'SLIKA' && (
          <View style={styles.formRow}>
            <View style={styles.formRowLeftPart}>
              <TouchableOpacity style={styles.bankTypeBtn}
                                onPress={this.handleToggleSlikaModal}>
                <Icon name="chevron-left" size={22} color={colors.blue8}/>

                <View
                  style={[commonStyles.row, commonStyles.alignItemsCenter]}>
                  <Text style={styles.bankName}>{t(
                    `clearingAgenciesName:${slikaId}`)}</Text>
                  <Image source={SLIKA_ICONS[slikaId].uri}/>
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.formRowRightPart}>
              <Text style={styles.formRowRightText}>
                {t('settings:clearingAccount:clearingAccounts')}
              </Text>
            </View>
          </View>
        )}
      </Fragment>
    )
  }

  renderOtpForm = () => {
    const { bankId, formData, formErrors, currentOtpField } = this.state
    const { t } = this.props

    const scheme = ALL_BANK_CREDENTIALS_SCHEME[bankId]
    if (!scheme || isEmpty(scheme.otpTypes)) {return null}
    return (
      <Modal
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
      </Modal>
    )
  }

  validateForm = () => {
    const { bankId, creditCardId, slikaId, formData, currentOtpField } = this.state

    const { tokenType } = this.props

    const schemeId = tokenType === 'CREDITCARD' ? creditCardId : tokenType ===
    'SLIKA' ? slikaId : bankId

    const scheme = ALL_BANK_CREDENTIALS_SCHEME[schemeId]
    if (!scheme || isEmpty(scheme.fields)) {return null}

    const formErrors = scheme.fields.reduce((memo, field) => {
      if (!field.validation ||
        (field.key === 'userCode' && scheme.otp)) {
        return memo
      }
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

  handleClose = () => {
    this.stopPullingTokenStatus()
    this.clearForm()
    setTimeout(() => {
      this.props.onClose()
    }, 10)
  }

  render () {
    const {
      bankId,
      bankModalIsOpen,
      formErrors,
      inProgress,
      otpFormModalIsOpen,
      currentOtpField,
      lockedModalIsOpen,
      invalidPasswordModalIsOpen,
      successModalIsOpen,
      creditCardModalIsOpen,
      slikaModalIsOpen,
      accountModalIsOpen,
      creditCardId,
      slikaId,
      accountId,
      is409Error,
    } = this.state
    const { t, onClose, title, accounts, tokenType } = this.props

    const schemeId = tokenType === 'CREDITCARD'
      ? creditCardId
      : tokenType === 'SLIKA'
        ? slikaId
        : bankId

    return (
      <Modal
        isOpen
        title={title}
        onLeftPress={this.handleClose}
        onRightPress={this.handleCreateBankToken}
        leftText={t('common:cancel')}
        rightText={t('common:add')}
      >
        <ScrollView
          style={styles.addModalBody}
          contentContainerStyle={[
            styles.addModalContainer, {
              height: '100%',
            }]}
        >
          <Text style={styles.passwordUpdateContText}>
            {t('settings:bankAccountsTab:experienceNumOfNum',
              {
                count: this.screenPasswordUpdateCount,
                total: 3,
              },
            )}
          </Text>

          <LoaderWrapper isDefalse isLoading={inProgress}>
            <Text style={styles.addAccountTitle}>
              {t('settings:bankAccountsTab:enterLogin')}
            </Text>
            <Text style={styles.addAccountSubTitle}>
              {t('settings:bankAccountsTab:pleaseEnterDataFromBank')}
            </Text>

            <View style={styles.formWrapper}>
              {this.renderHeaderForm()}
              {this.renderForm()}
            </View>

            <View style={styles.validationContainer}>
              {Object.keys(formErrors).map(key => {
                if (key.includes('__otp__')) {
                  if (!currentOtpField) {return null}
                  return (
                    <Text style={styles.errMessageText} key={key}>
                      {t(
                        `foreignCredentials:${bankId}:otpTypes:${currentOtpField}:label`)}: {t(
                      `foreignCredentials:${bankId}:otpTypes:${currentOtpField}:rule`)}
                    </Text>
                  )
                }

                return (
                  <Text style={styles.errMessageText} key={key}>
                    {t(`foreignCredentials:${schemeId}:${key}:label`)}: {t(
                    `foreignCredentials:${schemeId}:${key}:rule`)}
                  </Text>
                )
              })}

              {'message' in he.foreignCredentials[schemeId] && (
                <Text
                  style={styles.infoMessageText}>{t(
                  `foreignCredentials:${schemeId}:message`)}</Text>
              )}

              {is409Error && (
                <Text
                  style={styles.errMessageText}>{'פרטי הכניסה קיימים במערכת'}</Text>
              )}
            </View>

            <View style={{
              // position: 'absolute',
              // bottom: 50,
              // right: 0,
              // left: 0,
              marginHorizontal: 20,
            }}>
              <Text style={{
                fontSize: sp(14),
                fontFamily: fonts.regular,
                color: colors.blue8,
                textAlign: 'center',
              }}>{tokenType === 'CREDITCARD'
                ? 'ניתן לשנות את חשבון הבנק אליו משויך כרטיס האשראי בכל עת דרך מסך הגדרות - כרטיסי אשראי'
                : tokenType === 'SLIKA'
                  ? 'ניתן לשנות את חשבון הבנק אליו משויך הסולק בכל עת דרך מסך הגדרות - חשבונות סליקה'
                  : ''}</Text>
            </View>
          </LoaderWrapper>
        </ScrollView>

        {bankModalIsOpen && (
          <BankModal
            selectedBankId={bankId}
            onClose={this.handleToggleBankModal}
            onChange={this.handleChangeBankId}
          />
        )}

        {accountModalIsOpen && (
          <AccountModal
            title={title}
            selectedId={accountId}
            accounts={tokenType === 'ACCOUNT' ? accounts : accounts.filter(
              (it) => it.currency === 'ILS')}
            onClose={this.handleToggleAccountModal}
            onChange={this.handleChangeAccountId}
          />
        )}

        {creditCardModalIsOpen && (
          <CreditCardModal
            title={title}
            selectedId={creditCardId}
            onClose={this.handleToggleCreditCardModal}
            onChange={this.handleChangeCreditCardId}
          />
        )}

        {slikaModalIsOpen && (
          <SlikaModal
            title={title}
            selectedId={slikaId}
            onClose={this.handleToggleSlikaModal}
            onChange={this.handleChangeSlikaId}
          />
        )}

        {otpFormModalIsOpen && this.renderOtpForm()}

        {invalidPasswordModalIsOpen && (
          <WrongStatusModal
            title={title}
            attemptsNumber={3 - this.screenPasswordUpdateCount}
            onSubmit={this.clearForm}
          />
        )}

        {lockedModalIsOpen && (
          <BlockedModal
            title={title}
            onClose={onClose}
            onOpenBankSite={this.handleOpenBankSite}
          />
        )}

        {successModalIsOpen && (
          <SuccessModal
            title={title}
            onClose={onClose}
            onOpenBankSite={this.handleOpenBankSite}
          />
        )}
      </Modal>
    )
  }
}
