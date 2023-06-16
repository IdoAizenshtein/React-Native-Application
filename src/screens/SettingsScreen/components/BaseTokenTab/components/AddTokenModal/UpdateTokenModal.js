import React, { Fragment, PureComponent } from 'react'
import { Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import validate from 'validate.js'
import { withTranslation } from 'react-i18next'
import { isEmpty } from 'lodash'
import Modal from 'src/components/Modal/Modal'
import RoundedTextInput from 'src/components/FormInput/RoundedTextInput'
import {
  ALL_BANK_CREDENTIALS_SCHEME,
  BANK_CREDENTIALS_CONTROL_TYPES,
  BANK_TOKEN_STATUS,
  PASSWORD_RECOVERY_LINKS,
} from 'src/constants/bank'
import { colors, fonts } from 'src/styles/vars'
import LoaderWrapper from 'src/components/Loader/LoaderWrapper'
import ExtendableTextInput from 'src/components/FormInput/ExtendableTextInput'
import { getStatusTokenTypeApi, updateTokenTypeApi } from 'src/api'
import styles from './AddTokenModalStyles'
import he from 'src/locales/he'
import BankTokenService from 'src/services/BankTokenService'
import WrongStatusModal from './components/WrongStatusModal'
import BlockedModal from './components/BlockedModal'
import SuccessModal from './components/SuccessModal'
import { sp } from 'src/utils/func'
import { connect } from 'react-redux'
import { setGlobalParams } from '../../../../../../redux/actions/user'

@withTranslation()
@connect(state => ({
  globalParams: state.globalParams,
}))
export default class UpdateTokenModal extends PureComponent {
  intervalId = null

  constructor (props) {
    super(props)
    this.stopPullingTokenStatus()

    this.state = ({
      bankId: props.token.websiteTargetTypeId,
      formData: {},
      formErrors: {},
      newTokenStatus: null,
      newTokenId: null,
      inProgress: false,
      currentOtpField: null,
      invalidPasswordModalIsOpen: false,
      lockedModalIsOpen: false,
      successModalIsOpen: false,
    })

    const statusCode = (typeof props.token.tokenStatus === 'number')
      ? props.token.tokenStatus
      : BankTokenService.getTokenStatusCode(props.token.tokenStatus)
    this.isUpdatePassword = [
      BANK_TOKEN_STATUS.INVALID_PASSWORD,
      BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED,
      BANK_TOKEN_STATUS.PASSWORD_EXPIRED,
    ].includes(statusCode)
    this.isBlocked = BANK_TOKEN_STATUS.BLOCKED === statusCode
    this.isValid = BANK_TOKEN_STATUS.VALID === statusCode
    this.isUpdateOtpCode = [
      BANK_TOKEN_STATUS.MARCOD_REQUIRED,
      BANK_TOKEN_STATUS.DISCOD_REQUIRED,
    ].includes(statusCode)
  }

  get screenPasswordUpdateCount () {
    const { newTokenStatus } = this.state

    if (!newTokenStatus || !newTokenStatus.screenPasswordUpdateCount) {return 1}
    if (newTokenStatus.screenPasswordUpdateCount) {return newTokenStatus.screenPasswordUpdateCount}
    // if (newTokenStatus.screenPasswordUpdateCount === 1) return 2
    // if (newTokenStatus.screenPasswordUpdateCount > 2) return 3
  }

  get errors () {
    const { formErrors, formData, bankId } = this.state
    const { t } = this.props

    if (isEmpty(formErrors)) {return null}

    if (this.isUpdatePassword || this.isValid) {
      return (
        <Fragment>
          {formErrors.username && (
            <Text style={styles.errMessageText}>
              {t(`foreignCredentials:${bankId}:username:rule`)}
            </Text>
          )}
          {formErrors.password && (
            <Text style={styles.errMessageText}>
              {t(`foreignCredentials:${bankId}:userPassword:rule`)}
            </Text>
          )}

          {formData.password !== formData.newPassword && (
            <Text style={styles.errMessageText}>{t(
              'settings:bankAccountsTab:passwordsAreNotBeSame')}</Text>
          )}
        </Fragment>
      )
    }
  }

  handleUpdateFormField = (name) => (value) => {
    this.setState({
      formData: {
        ...this.state.formData,
        [name]: value,
      },
    })
  }

  handleSetOtpField = (currentOtpField) => () => this.setState(
    { currentOtpField: currentOtpField })

  handleUpdateBankToken = () => {
    const { inProgress, bankId, formData, formErrors, currentOtpField } = this.state
    const { companyId, token } = this.props
    const scheme = ALL_BANK_CREDENTIALS_SCHEME[bankId]
    if (!scheme || inProgress || !isEmpty(formErrors)) {return}
    this.setState({ inProgress: true })
    const body = {
      bankId,
      companyId,
      tokenId: token.token,
      bankAuto: this.isUpdateOtpCode
        ? formData[`__otp__${currentOtpField}`]
        : null,
      bankPass: formData.password || null,
      bankUserName: this.isBlocked ? formData.username : null,
      companyAccountId: null,
    }
    return updateTokenTypeApi.post({ body })
      .then((time) => {
        this.setState({ newTokenId: token.token })
        this.props.dispatch(
          setGlobalParams(Object.assign(this.props.globalParams, {
            updateToken: token.token,
          })))
        if (companyId) {
          return getStatusTokenTypeApi.post({
            body: {
              companyId,
              tokens: [token.token],
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
      .catch(() => {
        this.setState({ inProgress: false })
      })
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
  handleClose = () => {
    this.stopPullingTokenStatus()
    this.clearForm()
    setTimeout(() => {
      this.props.onClose()
    }, 10)
  }
  startPullingTokenStatus = () => {
    this.intervalId = setInterval(() => {
      const { newTokenId } = this.state
      const { companyId } = this.props
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
      inProgress: false,
      currentOtpField: null,
      invalidPasswordModalIsOpen: false,
      lockedModalIsOpen: false,
      successModalIsOpen: false,
    })
  }

  changeToUpdate = () => {
    this.isUpdatePassword = false
    this.isValid = true
    this.clearForm()
  }

  renderForm = () => {
    const { bankId, formData, formErrors, currentOtpField } = this.state
    const { t, token } = this.props

    const scheme = ALL_BANK_CREDENTIALS_SCHEME[bankId]
    if (!scheme || isEmpty(scheme.fields) || !token) {return null}

    if (this.isUpdatePassword) {
      return (
        <Fragment>
          <View style={styles.formRow}>
            <View style={styles.formRowLeftPart}>
              <RoundedTextInput
                isPassword
                isInvalid={formErrors.password}
                onChangeText={this.handleUpdateFormField('password')}
                onSubmitEditing={this.validateForm}
                onBlur={this.validateForm}
                value={formData.password}
              />
            </View>

            <View style={styles.formRowRightPart}>
              <Text style={styles.formRowRightText}>
                {t('common:label:newPassword')}
              </Text>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formRowLeftPart}>
              <RoundedTextInput
                isPassword
                isInvalid={formErrors.newPassword}
                onChangeText={this.handleUpdateFormField('newPassword')}
                onSubmitEditing={this.validateForm}
                onBlur={this.validateForm}
                value={formData.newPassword}
              />
            </View>

            <View style={styles.formRowRightPart}>
              <Text style={styles.formRowRightText}>
                {t('common:label:enterPasswordAgain')}
              </Text>
            </View>
          </View>

          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
          }}>
            <View style={{
              justifyContent: 'center',
              height: 22,
              width: '75%',
              alignItems: 'flex-end',
            }}>
              <TouchableOpacity
                onPress={this.changeToUpdate}>
                <Text style={{
                  fontSize: sp(15),
                  fontFamily: fonts.regular,
                  color: '#007ebf',
                  textDecorationLine: 'underline',
                  textDecorationStyle: 'solid',
                  textDecorationColor: '#007ebf',
                }}>{'עדכון שם משתמש'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formRowRightPart}/>
          </View>
        </Fragment>
      )
    }

    if (this.isBlocked || this.isValid) {
      return (
        <Fragment>
          <View style={styles.formRow}>
            <View style={styles.formRowLeftPart}>
              <RoundedTextInput
                isInvalid={formErrors.username}
                onChangeText={this.handleUpdateFormField('username')}
                onSubmitEditing={this.validateForm}
                onBlur={this.validateForm}
                value={formData.username}
              />
            </View>

            <View style={styles.formRowRightPart}>
              <Text style={styles.formRowRightText}>
                {'שם משתמש'}
              </Text>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formRowLeftPart}>
              <RoundedTextInput
                isPassword
                isInvalid={formErrors.password}
                onChangeText={this.handleUpdateFormField('password')}
                onSubmitEditing={this.validateForm}
                onBlur={this.validateForm}
                value={formData.password}
              />
            </View>

            <View style={styles.formRowRightPart}>
              <Text style={styles.formRowRightText}>
                {t('common:label:newPassword')}
              </Text>
            </View>
          </View>

          <View style={styles.formRow}>
            <View style={styles.formRowLeftPart}>
              <RoundedTextInput
                isPassword
                isInvalid={formErrors.newPassword}
                onChangeText={this.handleUpdateFormField('newPassword')}
                onSubmitEditing={this.validateForm}
                onBlur={this.validateForm}
                value={formData.newPassword}
              />
            </View>

            <View style={styles.formRowRightPart}>
              <Text style={styles.formRowRightText}>
                {t('common:label:enterPasswordAgain')}
              </Text>
            </View>
          </View>
        </Fragment>
      )
    }

    if (this.isUpdateOtpCode && scheme.otp && scheme.otpTypes) {
      return (
        <View style={[styles.otpFormModalContainer, { paddingTop: 0 }]}>
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
        </View>
      )
    }
  }

  validateForm = () => {
    const { bankId, formData } = this.state
    const { token } = this.props

    const scheme = ALL_BANK_CREDENTIALS_SCHEME[bankId]
    if (!scheme || isEmpty(scheme.fields) || !token) {return null}

    if (this.isUpdatePassword || this.isBlocked || this.isValid) {
      const passwordField = scheme.fields.find(
        f => f.controlType === BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD)

      const formErrors = {}

      if (validate.single(formData.password, passwordField.validation)) {
        formErrors.password = true
      }

      if (validate.single(formData.newPassword, passwordField.validation) ||
        formData.password !== formData.newPassword) {
        formErrors.newPassword = true
      }
      if (this.isBlocked || this.isValid) {
        const usernameField = scheme.fields.find(
          f => f.controlType === BANK_CREDENTIALS_CONTROL_TYPES.TEXT)
        if (validate.single(formData.username, usernameField.validation)) {
          formErrors.username = true
        }
      }

      return this.setState({ formErrors })
    }
  }

  componentWillUnmount () {
    this.stopPullingTokenStatus()
  }

  render () {
    const {
      bankId,
      inProgress,
      lockedModalIsOpen,
      invalidPasswordModalIsOpen,
      successModalIsOpen,
    } = this.state
    const { t, title, token, tokenType } = this.props

    return (
      <Modal
        isOpen
        title={this.isBlocked ? (t(
          'settings:bankAccountsTab:unblockAccountIsBlocked',
          { tokenName: token.tokenNickname }))
          : (this.isValid ? (
            (tokenType === 'ACCOUNT') ? t(
              'settings:bankAccountsTab:updateAccount',
              { tokenName: token.tokenNickname }) : t(
              'settings:bankAccountsTab:updateCard',
              { tokenName: token.tokenNickname })
          ) : (
            (tokenType === 'ACCOUNT') ? t(
              'settings:bankAccountsTab:unblockAccount',
              { tokenName: token.tokenNickname }) : t(
              'settings:bankAccountsTab:unblockCard',
              { tokenName: token.tokenNickname })
          ))
        }
        onLeftPress={this.handleClose}
        onRightPress={this.handleUpdateBankToken}
        leftText={t('common:cancel')}
        rightText={t('common:update')}
      >
        <ScrollView
          style={styles.addModalBody}
          contentContainerStyle={styles.addModalContainer}
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
              {this.isValid
                ? 'הזינו את פרטי הכניסה העדכניים לאתר הבנק'
                : (this.isUpdatePassword
                  ? t('settings:bankAccountsTab:updateTokenPassword')
                  : t('settings:bankAccountsTab:updateTokenCredentials'))}
            </Text>

            <View style={styles.formWrapper}>
              {this.renderForm()}
            </View>

            <View style={styles.validationContainer}>
              {this.errors}
              {'message' in he.foreignCredentials[bankId] && (
                <Text style={styles.infoMessageText}>{t(
                  `foreignCredentials:${bankId}:message`)}</Text>
              )}
            </View>
          </LoaderWrapper>
        </ScrollView>

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
            onClose={this.handleClose}
            onOpenBankSite={this.handleOpenBankSite}
          />
        )}

        {successModalIsOpen && (
          <SuccessModal
            title={title}
            onClose={this.handleClose}
            onOpenBankSite={this.handleOpenBankSite}
          />
        )}
      </Modal>
    )
  }
}
