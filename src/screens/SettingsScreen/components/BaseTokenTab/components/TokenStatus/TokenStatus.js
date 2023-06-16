import React, { PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import BankTokenService from 'src/services/BankTokenService'
import CustomIcon from 'src/components/Icons/Fontello'
import { BANK_TOKEN_STATUS } from 'src/constants/bank'
import commonStyles from 'src/styles/styles'
import styles from './TokenStatusStyles'
import { colors } from 'src/styles/vars'
import { getStatusTokenTypeApi } from '../../../../../../api'

@withTranslation()
export default class TokenStatus extends PureComponent {
  intervalId = null

  constructor (props) {
    super(props)
    const { t, token: { tokenStatus } } = props

    const tokenStatusKey = BankTokenService.getTokenStatusEnumKey(tokenStatus)
      ? BankTokenService.getTokenStatusEnumKey(tokenStatus)
      : ((tokenStatus === 'VALIDPOALIMBAASAKIM' || tokenStatus ===
        'SUSPENDED' || tokenStatus === 'AGREEMENT_REQUIRED' || tokenStatus ===
        'INVALIDPASSORDANDACCESS') ? tokenStatus : undefined)
    const statusCode = BankTokenService.getTokenStatusCode(tokenStatus)
    this.state = {
      newTokenStatus: null,
      tokenStatusCode: statusCode,
      hasProgressBar: BankTokenService.isTokenStatusProgressing(tokenStatus),
      percent: BankTokenService.getCompletedPercentage(tokenStatus),
      isShouldUpdatePassword: BankTokenService.isShouldTokenUpdatePassword(
        tokenStatus),
      statusTitle: tokenStatusKey ? t(
        `settings:bankAccountsTab:status:${tokenStatusKey}`) : tokenStatus,
    }

    if (statusCode !== BANK_TOKEN_STATUS.VALID) {
      clearInterval(this.intervalId)
      this.startPullingTokenStatus()
    }
  }

  get icon () {
    const { tokenStatusCode, hasProgressBar } = this.state

    if (hasProgressBar) {
      return (
        <Image
          style={[
            styles.imgIcon,
            {
              width: 11,
              height: 14,
            }]}
          source={require('BiziboxUI/assets/inProgress.png')}
        />
      )
    }

    switch (tokenStatusCode) {
      case BANK_TOKEN_STATUS.VALID:
      case BANK_TOKEN_STATUS.VALIDPOALIMBAASAKIM:
        return (
          <View style={styles.validIcon}>
            <CustomIcon name={'ok'} size={7} color={colors.blue32}/>
          </View>
        )
      case BANK_TOKEN_STATUS.INVALID_PASSWORD:
      case BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS:
        return <CustomIcon name="exclamation-triangle" size={18}
                           color={colors.red2}/>
      case BANK_TOKEN_STATUS.TECHNICAL_PROBLEM:
        return (
          <Image
            style={[
              styles.imgIcon,
              {
                width: 15,
                height: 15,
              }]}
            source={require('BiziboxUI/assets/logo.png')}
          />
        )
      case BANK_TOKEN_STATUS.BLOCKED:
        return (
          <Image
            style={[
              styles.imgIcon,
              {
                width: 13,
                height: 18,
              }]}
            source={require('BiziboxUI/assets/lock.png')}
          />
        )
      case BANK_TOKEN_STATUS.DISCOD_REQUIRED:
        return (
          <Image
            style={[
              styles.imgIcon,
              {
                width: 11,
                height: 22,
              }]}
            source={require('BiziboxUI/assets/key.png')}
          />
        )
      case BANK_TOKEN_STATUS.OTP_REQUIRED:
        return (
          <Image
            style={[styles.imgIcon, { width: 15 }]}
            source={require('BiziboxUI/assets/balloon.png')}
          />
        )
      case BANK_TOKEN_STATUS.PASSWORD_EXPIRED:
      case BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED:
        return (
          <Image
            style={[
              styles.imgIcon,
              {
                width: 14,
                height: 14,
              }]}
            source={require('BiziboxUI/assets/act-then-redo.png')}
          />
        )
      case BANK_TOKEN_STATUS.AGREEMENT_REQUIRED:
        return (
          <Image
            style={[
              styles.imgIcon,
              {
                width: 16,
                height: 16,
              }]}
            source={require('BiziboxUI/assets/paper.png')}
          />
        )
      case BANK_TOKEN_STATUS.SUSPENDED:
        return (
          <Image
            style={[
              styles.imgIcon,
              {
                width: 16,
                height: 16,
              }]}
            source={require('BiziboxUI/assets/frozen.png')}
          />
        )
      default:
        return null
    }
  }

  get action () {
    const { tokenStatusCode } = this.state
    const { t } = this.props

    // if (!isShouldUpdatePassword) return null

    switch (tokenStatusCode) {
      case BANK_TOKEN_STATUS.DISCOD_REQUIRED:
      case BANK_TOKEN_STATUS.MARCOD_REQUIRED:
      case BANK_TOKEN_STATUS.OTP_REQUIRED:
        return t('actions:setCode')
      case BANK_TOKEN_STATUS.BLOCKED:
        return t('actions:unBlock')
      case BANK_TOKEN_STATUS.VALID:
      case BANK_TOKEN_STATUS.VALIDPOALIMBAASAKIM:
        return t('actions:updateIdInfo')

      case BANK_TOKEN_STATUS.AGREEMENT_REQUIRED:
        return null

      case 'INVALIDPASSORDANDACCESS'.toLowerCase():
        return 'אנא פנה למנהל המערכת'

      case BANK_TOKEN_STATUS.INVALID_PASSWORD:
      case BANK_TOKEN_STATUS.PASSWORD_EXPIRED:
      case BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED:
        return t('actions:updatePassword')

      default:
        return null
    }
  }

  startPullingTokenStatus = () => {
    this.intervalId = setInterval(() => {
      if (this.props.currentCompany.companyId) {
        return getStatusTokenTypeApi.post({
          body: {
            companyId: this.props.currentCompany.companyId,
            tokens: [this.props.token.token],
          },
        })
          .then(([newTokenStatus]) => {
            this.setState({ newTokenStatus })
            if (!newTokenStatus) {return}
            const tokenStatus = newTokenStatus.tokenStatus
            const tokenStatusKey = BankTokenService.getTokenStatusEnumKey(
              tokenStatus)
              ? BankTokenService.getTokenStatusEnumKey(tokenStatus)
              : ((tokenStatus === 'VALIDPOALIMBAASAKIM' || tokenStatus ===
                'SUSPENDED' || tokenStatus === 'AGREEMENT_REQUIRED' ||
                tokenStatus === 'INVALIDPASSORDANDACCESS')
                ? tokenStatus
                : undefined)
            const statusCode = BankTokenService.getTokenStatusCode(
              newTokenStatus.tokenStatus)

            this.setState({
              tokenStatusCode: statusCode,
              hasProgressBar: BankTokenService.isTokenStatusProgressing(
                tokenStatus),
              percent: BankTokenService.getCompletedPercentage(tokenStatus),
              isShouldUpdatePassword: BankTokenService.isShouldTokenUpdatePassword(
                tokenStatus),
              statusTitle: tokenStatusKey
                ? this.props.t(
                  `settings:bankAccountsTab:status:${tokenStatusKey}`)
                : tokenStatus,
            })

            if (BankTokenService.isTokenStatusProgressing(tokenStatus)) {return}

            if (statusCode === BANK_TOKEN_STATUS.INVALID_PASSWORD || [
              BANK_TOKEN_STATUS.VALID,
              BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED].includes(
              statusCode)) {
              this.stopPullingTokenStatus()
            }
          })
      }
    }, 5000)
  }

  stopPullingTokenStatus = () => {
    clearInterval(this.intervalId)
  }

  render () {
    const { statusTitle, hasProgressBar, percent } = this.state
    const { onOpenTokenUpdateModal, token, openAddToken } = this.props
    const actionText = this.action

    return (
      <View style={styles.statusContainer}>
        <View style={styles.statusWrapper}>
          {this.icon}
          <View style={commonStyles.spaceDivider}/>
          {!(token.tokenNickname === null && token.tokenStatus === null &&
            token.tokenTargetType === null) && (
            <View>
              <Text style={styles.statusTitleText}>{statusTitle}</Text>
              {(token.hasPrivs !== false) && this.action && (
                <TouchableOpacity
                  hitSlop={{
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20,
                  }}
                  onPress={onOpenTokenUpdateModal(token)}
                  activeOpacity={1}
                >
                  <Text style={styles.linkText}>{(actionText)}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
          {(token.tokenNickname === null && token.tokenStatus === null &&
            token.tokenTargetType === null) && (
            <View>
              <TouchableOpacity
                hitSlop={{
                  top: 20,
                  bottom: 20,
                  left: 20,
                  right: 20,
                }}
                onPress={(token.tokenNickname === null && token.tokenStatus ===
                  null && token.tokenTargetType === null)
                  ? openAddToken
                  : onOpenTokenUpdateModal(token)}
                activeOpacity={1}
              >
                <Text style={styles.linkText}>{'אין פרטי זיהוי'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {hasProgressBar && (
          <View style={styles.progressBarWrapper}>
            <View style={[styles.progressBarInner, { width: `${percent}%` }]}/>
          </View>
        )}
      </View>
    )
  }
}
