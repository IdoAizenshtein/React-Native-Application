import React, { Fragment, PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import AppTimezone from '../../utils/appTimezone'
import styles from './AccountAlertStyles'
import { colors, fonts } from '../../styles/vars'
import { Icon } from 'react-native-elements'
import { getStatusTokenTypeApi } from '../../api'
import BankTokenService from '../../services/BankTokenService'
import { BANK_TOKEN_STATUS } from '../../constants/bank'
import CustomIcon from 'src/components/Icons/Fontello'
import UpdateTokenModal
  from 'src/screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/UpdateTokenModal'
import { IS_LIGHT } from '../../constants/config'
import { getCurrencyChar, sp } from '../../utils/func'

export class AccountAlertOverview extends PureComponent {
  intervalId = null

  constructor (props) {
    super(props)
    this.state = {
      currentToken: null,
      updateTokenModalIsOpen: false,
      newTokenStatus: null,
      statusToken: null,
    }

    if (!IS_LIGHT.light && props.selectedAccounts &&
      props.selectedAccounts.length === 1 && props.selectedAccounts[0] &&
      props.selectedAccounts[0].companyId &&
      props.selectedAccounts[0].nonUpdateDays > 0 &&
      props.selectedAccounts[0].alertStatus === null) {
      clearInterval(this.intervalId)
      this.getStatus(props.selectedAccounts[0].companyId,
        props.selectedAccounts[0].token)
    }
  }

  get getStatusView () {
    const {
      statusToken,
    } = this.state
    const { selectedAccounts } = this.props

    if ([
      BANK_TOKEN_STATUS.BANK_TRANS_LOAD,
      BANK_TOKEN_STATUS.CREDIT_CARD_LOAD,
      BANK_TOKEN_STATUS.CHECKS_LOAD,
      BANK_TOKEN_STATUS.DEPOSIT_LOAD,
      BANK_TOKEN_STATUS.LOAN_LOAD,
      BANK_TOKEN_STATUS.STANDING_ORDERS_LOAD,
      BANK_TOKEN_STATUS.FOREIGN_TRANS_LOAD,
      BANK_TOKEN_STATUS.NEW,
      BANK_TOKEN_STATUS.IN_PROGRESS,
      BANK_TOKEN_STATUS.ALMOST_DONE,
    ].includes(statusToken)) {
      let percentage = '0%'
      if (statusToken === BANK_TOKEN_STATUS.BANK_TRANS_LOAD) {
        percentage = '20%'
      } else if (statusToken === BANK_TOKEN_STATUS.CREDIT_CARD_LOAD) {
        percentage = '30%'
      } else if (statusToken === BANK_TOKEN_STATUS.CHECKS_LOAD) {
        percentage = '40%'
      } else if (statusToken === BANK_TOKEN_STATUS.DEPOSIT_LOAD) {
        percentage = '50%'
      } else if (statusToken === BANK_TOKEN_STATUS.LOAN_LOAD) {
        percentage = '60%'
      } else if (statusToken === BANK_TOKEN_STATUS.STANDING_ORDERS_LOAD) {
        percentage = '70%'
      } else if (statusToken === BANK_TOKEN_STATUS.FOREIGN_TRANS_LOAD) {
        percentage = '80%'
      } else if (statusToken === BANK_TOKEN_STATUS.ALMOST_DONE) {
        percentage = '100%'
      } else if (statusToken === BANK_TOKEN_STATUS.NEW || statusToken ===
        BANK_TOKEN_STATUS.IN_PROGRESS) {
        percentage = '10%'
      }
      return (
        <View style={{
          flexDirection: 'column',
          alignSelf: 'center',
          justifyContent: 'center',
          alignItems: 'center',
          alignContent: 'center',
        }}>
          <Text style={{
            color: '#0f3860',
            fontFamily: fonts.regular,
            fontSize: sp(18),
            textAlign: 'center',
          }}>
            {(statusToken === BANK_TOKEN_STATUS.NEW || statusToken ===
              BANK_TOKEN_STATUS.IN_PROGRESS)
              ? 'מאמת פרטי זיהוי'
              : 'מושך נתונים מהבנק'}
          </Text>
          <View
            style={{
              width: 200,
              height: 6,
              backgroundColor: 'powderblue',
              marginTop: 10,
              marginBottom: 5,
            }}>
            <View style={{
              width: percentage,
              height: 6,
              backgroundColor: 'steelblue',
            }}/>
          </View>
          <Text style={{
            color: '#0f3860',
            fontFamily: fonts.regular,
            fontSize: sp(18),
            textAlign: 'center',
          }}>
            {percentage}
          </Text>
        </View>
      )
    } else if (statusToken === BANK_TOKEN_STATUS.SUSPENDED) {
      return (
        <View style={{
          alignItems: 'center',
          flexDirection: 'row-reverse',
        }}>
          <Image
            style={[
              styles.imgIcon,
              {
                width: 16,
                height: 16,
                marginHorizontal: 10,
              }]}
            source={require('BiziboxUI/assets/frozen.png')}
          />
          <Text style={{
            color: '#0f3860',
            fontFamily: fonts.regular,
            fontSize: sp(18),
            textAlign: 'center',
          }}>
            {'החשבון מוקפא לבקשתכם'}
          </Text>
        </View>
      )
    } else if (statusToken === BANK_TOKEN_STATUS.TECHNICAL_PROBLEM) {
      return (
        <View style={{
          alignItems: 'center',
          flexDirection: 'row-reverse',
        }}>
          <Image style={{
            width: 18,
            height: 18,
            marginHorizontal: 10,
          }}
                 source={require('BiziboxUI/assets/b.png')}/>
          <Text style={{
            color: '#0f3860',
            fontFamily: fonts.regular,
            fontSize: sp(18),
            textAlign: 'center',
          }}>
            {'התעוררה תקלה טכנית. אנחנו עובדים על פיתרון'}
          </Text>
        </View>
      )
    } else if ([
      BANK_TOKEN_STATUS.AGREEMENT_REQUIRED,
    ].includes(statusToken)) {
      return (
        <View style={{
          alignItems: 'center',
          flexDirection: 'row-reverse',
        }}>
          <Image
            style={[
              styles.imgIcon,
              {
                width: 16,
                height: 22,
                marginHorizontal: 10,
              }]}
            source={require('BiziboxUI/assets/paper.png')}
          />
          <Text style={{
            color: '#0f3860',
            fontFamily: fonts.regular,
            fontSize: sp(18),
            textAlign: 'center',
          }}>
            {'נדרש אישור הסכם שירות'}
          </Text>
        </View>
      )
    } else if (statusToken ===
      BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS) {
      return (
        <View style={{
          alignItems: 'center',
          flexDirection: 'row-reverse',
        }}>
          <View style={{
            marginHorizontal: 10,
          }}>
            <CustomIcon name="exclamation-triangle" size={18}
                        color={colors.red2}/>
          </View>
          <Text style={{
            color: '#0f3860',
            fontFamily: fonts.regular,
            fontSize: sp(18),
            textAlign: 'center',
          }}>
            {'סיסמה שגויה אנא פנה למנהל המערכת'}
          </Text>
        </View>
      )
    } else if ([
      BANK_TOKEN_STATUS.INVALID_PASSWORD,
      BANK_TOKEN_STATUS.BLOCKED,
      BANK_TOKEN_STATUS.PASSWORD_EXPIRED,
      BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED,
    ].includes(statusToken)) {
      let hasBtnUpdate = true
      if (this.state.newTokenStatus.hasPrivs === false || statusToken ===
        BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED) {
        hasBtnUpdate = false
      }
      return (
        <TouchableOpacity
          activeOpacity={(hasBtnUpdate) ? 0.2 : 1}
          onPress={(hasBtnUpdate) ? this.handleOpenUpdateTokenModal(
            selectedAccounts[0]) : null}>
          <Text style={{
            color: '#ef3636',
            fontFamily: fonts.bold,
            fontSize: sp(29),
            textAlign: 'center',
            lineHeight: 29.5,
          }}>
            הנתונים לא מעודכנים
          </Text>
          <Text style={{
            color: '#0f3860',
            fontFamily: fonts.regular,
            fontSize: sp(18),
            textAlign: 'center',
            lineHeight: 20,
          }}>
            {'עדכון אחרון לפני'} {AppTimezone.moment()
            .diff(selectedAccounts[0].balanceLastUpdatedDate,
              'days')} {'ימים'}
          </Text>
          {(hasBtnUpdate) && (
            <View style={{
              alignItems: 'center',
              flexDirection: 'row-reverse',
              alignSelf: 'center',
              justifyContent: 'center',
              alignContent: 'center',
            }}>
              <Text style={{
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: sp(16),
                fontFamily: fonts.semiBold,
                color: colors.blue32,
              }}>עדכון</Text>
              <Icon name="chevron-left" size={22}
                    color={colors.blue32}/>
            </View>
          )}
        </TouchableOpacity>
      )
    }
  }

  get text () {
    const {
      accountExceeded,
      accountExceptionExpected,
      accountNicknameAccountException,
      xAccountsExceeded,
      expectedDateExceeded,
      expectedXExceeded,
      selectedDeviantAccounts,
      accounts,
      isSelectedNotUpdatedAccounts,
      selectedAccounts,
      hasHeaderAlert,
      selectedHarigaDatetAccounts,
    } = this.props
    const {
      statusToken,
    } = this.state
    if (IS_LIGHT.light) {
      return (
        <View>
          <Text style={{
            color: '#0f3860',
            fontFamily: fonts.regular,
            fontSize: sp(18),
            textAlign: 'center',
            lineHeight: 20,
          }}>
            מצב החשבונות להיום בבוקר
          </Text>
          {isSelectedNotUpdatedAccounts && (<Fragment>
            <Text style={{
              color: '#ef3636',
              fontFamily: fonts.bold,
              fontSize: sp(29),
              textAlign: 'center',
              lineHeight: 29.5,
            }}>
              הנתונים לא מעודכנים
            </Text>
            <Text style={{
              color: '#0f3860',
              fontFamily: fonts.regular,
              fontSize: sp(18),
              textAlign: 'center',
              lineHeight: 20,
            }}>
              {'עדכון אחרון לפני'} {AppTimezone.moment()
              .diff(selectedAccounts[0].balanceLastUpdatedDate,
                'days')} {'ימים'}
            </Text>
          </Fragment>)}
          {!isSelectedNotUpdatedAccounts && accountExceptionExpected &&
          (<Fragment>
            <Text style={{
              color: '#ef3636',
              fontFamily: fonts.bold,
              fontSize: sp(21),
              textAlign: 'center',
            }}>
              {'החשבון בחריגה'}
            </Text>
          </Fragment>)}
          {accountNicknameAccountException && (<Fragment>
            <Text style={{
              color: '#ef3636',
              fontFamily: fonts.bold,
              fontSize: sp(21),
              textAlign: 'center',
              textDecorationLine: 'underline',
              textDecorationStyle: 'solid',
              textDecorationColor: '#ef3636',
            }}>
              {'חשבון'} {(accountNicknameAccountException)
              ? selectedDeviantAccounts[0].accountNickname
              : ''} ({getCurrencyChar(
              selectedDeviantAccounts[0].currency)}) {'בחריגה'}
            </Text>
          </Fragment>)}
          {xAccountsExceeded && (<Fragment>
            <TouchableOpacity
              onPress={this.handleToggleDetails}>
              <Text style={{
                color: '#ef3636',
                fontFamily: fonts.bold,
                fontSize: sp(21),
                textAlign: 'center',
                textDecorationLine: 'underline',
                textDecorationStyle: 'solid',
                textDecorationColor: '#ef3636',
              }}>
                {selectedDeviantAccounts.length} {'חשבונות בחריגה'}
              </Text>
            </TouchableOpacity>
          </Fragment>)}

          {!isSelectedNotUpdatedAccounts &&
          !accountNicknameAccountException && !xAccountsExceeded &&
          !accountExceptionExpected && (
            <Fragment>
              <Text style={{
                color: '#229f88',
                fontFamily: fonts.bold,
                fontSize: sp(29),
                textAlign: 'center',
                lineHeight: 29.5,
              }}>
                לא קיימת חריגה
              </Text>
            </Fragment>)}
        </View>
      )
    } else {
      const expectedDateExceededAcc = (selectedHarigaDatetAccounts) ||
        null
      if (selectedAccounts.length === 1) {
        if (selectedAccounts[0].nonUpdateDays > 0) {
          const alertStatus = selectedAccounts[0].alertStatus
          if (alertStatus === 'Not found in bank website') {
            return (
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row',
              }}>
                <Text style={{
                  color: '#0f3860',
                  fontFamily: fonts.regular,
                  fontSize: sp(18),
                  textAlign: 'center',
                  marginRight: 4,
                }}>
                  {'אין הרשאה לחשבון באתר הבנק'}
                </Text>
                <Image style={{
                  width: 17,
                  height: 19,
                }}
                       resizeMode="contain"
                       source={require(
                         'BiziboxUI/assets/alertStatusNotFound.png')}/>
              </View>
            )
          } else if (alertStatus === 'Error itrot sequence') {
            return (
              <View style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'row-reverse',
              }}>
                <Image resizeMode="contain"
                       style={{
                         width: 18,
                         height: 18,
                         marginHorizontal: 2,
                       }}
                       source={require(
                         'BiziboxUI/assets/b.png')}/>
                <Text style={{
                  color: '#0f3860',
                  fontFamily: fonts.regular,
                  fontSize: sp(18),
                  textAlign: 'center',
                }}>
                  {'התעוררה תקלה טכנית. אנחנו עובדים על פיתרון'}
                </Text>
              </View>
            )
          } else if (alertStatus === null && statusToken === null) {
            return null
          } else if (alertStatus === null && statusToken !==
            BANK_TOKEN_STATUS.VALID) {
            return this.getStatusView
          }
        }
        if (isSelectedNotUpdatedAccounts) {
          return (
            <View>
              <Text style={{
                color: '#ef3636',
                fontFamily: fonts.bold,
                fontSize: sp(29),
                textAlign: 'center',
                lineHeight: 29.5,
              }}>
                הנתונים לא מעודכנים
              </Text>
              <Text style={{
                color: '#0f3860',
                fontFamily: fonts.regular,
                fontSize: sp(18),
                textAlign: 'center',
                lineHeight: 20,
              }}>
                {'עדכון אחרון לפני'} {AppTimezone.moment()
                .diff(selectedAccounts[0].balanceLastUpdatedDate,
                  'days')} {'ימים'}
              </Text>
            </View>
          )
        }
        if (accountExceptionExpected) {
          return (
            <View>
              <Text style={{
                color: '#ef3636',
                fontFamily: fonts.bold,
                fontSize: sp(21),
                textAlign: 'center',
              }}>
                {'החשבון בחריגה'}
              </Text>
            </View>
          )
        }
        if (accountExceeded) {
          return (
            <View>
              <Text style={{
                color: '#0f3860',
                fontFamily: fonts.regular,
                fontSize: sp(18),
                textAlign: 'center',
                lineHeight: 20,
              }}>
                מצב התזרים לחודש הקרוב
              </Text>
              <Text style={{
                color: '#ef3636',
                fontFamily: fonts.bold,
                fontSize: sp(29),
                textAlign: 'center',
                lineHeight: 29.5,
              }}>
                {'צפויה חריגה מתאריך'} {AppTimezone.moment(
                expectedDateExceededAcc[0].harigaDate)
                .format('DD/MM/YY')}
              </Text>
            </View>
          )
        }
        if (!hasHeaderAlert) {
          return (
            <View>
              <Text style={{
                color: '#0f3860',
                fontFamily: fonts.regular,
                fontSize: sp(18),
                textAlign: 'center',
                lineHeight: 20,
              }}>
                מצב התזרים לחודש הקרוב
              </Text>
              <Text style={{
                color: '#229f88',
                fontFamily: fonts.bold,
                fontSize: sp(29),
                textAlign: 'center',
                lineHeight: 29.5,
              }}>
                לא צפויה חריגה
              </Text>
            </View>
          )
        }
      } else {
        if (accountNicknameAccountException) {
          return (<View>
            <TouchableOpacity
              style={{
                flexDirection: 'row-reverse',
                alignContent: 'center',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={this.handleSelectAccount}>
              <Text style={{
                color: '#ef3636',
                fontFamily: fonts.bold,
                fontSize: sp(21),
                textAlign: 'center',
                textDecorationLine: 'underline',
                textDecorationStyle: 'solid',
                textDecorationColor: '#ef3636',
              }}>
                {'חשבון'} {(accountNicknameAccountException)
                ? selectedDeviantAccounts[0].accountNickname
                : ''} {'בחריגה'}
              </Text>
              <Icon name="chevron-left" size={24}
                    color={colors.blue32}/>
            </TouchableOpacity>
          </View>)
        } else if (xAccountsExceeded) {
          return (
            <View>
              <TouchableOpacity
                onPress={this.handleToggleDetails}>
                <Text style={{
                  color: '#ef3636',
                  fontFamily: fonts.bold,
                  fontSize: sp(21),
                  textAlign: 'center',
                  textDecorationLine: 'underline',
                  textDecorationStyle: 'solid',
                  textDecorationColor: '#ef3636',
                }}>
                  {selectedDeviantAccounts.length} {'חשבונות בחריגה'}
                </Text>
              </TouchableOpacity>
            </View>
          )
        } else if (expectedXExceeded) {
          return (
            <View>
              <TouchableOpacity
                onPress={this.handleToggleDetails}>
                <Text style={{
                  color: '#0f3860',
                  fontFamily: fonts.regular,
                  fontSize: sp(18),
                  textAlign: 'center',
                  lineHeight: 20,
                }}>
                  מצב התזרים לחודש הקרוב
                </Text>
                <Text style={{
                  color: '#ef3636',
                  fontFamily: fonts.bold,
                  fontSize: sp(29),
                  textAlign: 'center',
                  lineHeight: 29.5,
                  textDecorationLine: 'underline',
                  textDecorationStyle: 'solid',
                  textDecorationColor: '#ef3636',
                }}>
                  {'צפויה חריגה ל-'} {(expectedDateExceededAcc)
                  ? expectedDateExceededAcc.length
                  : ''} {'חשבונות'}
                </Text>
              </TouchableOpacity>
            </View>
          )
        } else if (expectedDateExceeded) {
          return (
            <View>
              <TouchableOpacity
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  flexDirection: 'row-reverse',
                }}
                onPress={this.handleSelectAccount}>
                <View style={{
                  flex: 95,
                }}>
                  <Text style={{
                    color: '#0f3860',
                    fontFamily: fonts.regular,
                    fontSize: sp(18),
                    textAlign: 'center',
                    lineHeight: 20,
                  }}>
                    מצב התזרים לחודש הקרוב
                  </Text>
                  <Text style={{
                    color: '#ef3636',
                    fontFamily: fonts.bold,
                    fontSize: sp(21),
                    textAlign: 'center',
                    lineHeight: 21.5,
                  }}>
                    {'צפויה חריגה '}
                  </Text>
                  <Text style={{
                    color: '#ef3636',
                    fontFamily: fonts.bold,
                    fontSize: sp(21),
                    textAlign: 'center',
                    lineHeight: 21.5,
                  }}>
                    {'ב'}{accounts
                    ? accounts.find(d => d.companyAccountId ===
                      expectedDateExceededAcc[0].accountUuid).accountNickname
                    : ''} {'מ-'} {AppTimezone.moment(
                    expectedDateExceededAcc[0].harigaDate)
                    .format('DD/MM/YY')}
                  </Text>
                </View>
                <View style={{
                  alignItems: 'flex-end',
                  flex: 5,
                }}>
                  <Icon name="chevron-left" size={28}
                        color={colors.blue32}/>
                </View>
              </TouchableOpacity>
            </View>
          )
        } else if (!hasHeaderAlert) {
          return (
            <View>
              <Text style={{
                color: '#0f3860',
                fontFamily: fonts.regular,
                fontSize: sp(18),
                textAlign: 'center',
                lineHeight: 20,
              }}>
                מצב התזרים לחודש הקרוב
              </Text>
              <Text style={{
                color: '#229f88',
                fontFamily: fonts.bold,
                fontSize: sp(29),
                textAlign: 'center',
                lineHeight: 29.5,
              }}>
                לא קיימת חריגה
              </Text>
            </View>
          )
        }
      }
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { selectedAccounts } = this.props
    const selectedAccountsNextProps = nextProps.selectedAccounts

    if (!IS_LIGHT.light && selectedAccounts && selectedAccounts.length &&
      selectedAccountsNextProps.length === 1 &&
      selectedAccountsNextProps[0] &&
      selectedAccountsNextProps[0].companyId &&
      (selectedAccounts[0].companyAccountId !==
        selectedAccountsNextProps[0].companyAccountId)) {
      if (selectedAccountsNextProps[0].nonUpdateDays > 0 &&
        selectedAccountsNextProps[0].alertStatus === null) {
        clearInterval(this.intervalId)
        this.getStatus(selectedAccountsNextProps[0].companyId,
          selectedAccountsNextProps[0].token)
      }
    }
  }

  getStatus = (companyId, token) => {
    if (!IS_LIGHT.light && companyId) {
      return getStatusTokenTypeApi.post({
        body: {
          companyId,
          tokens: [token],
        },
      })
        .then(([newTokenStatus]) => {
          const statusCode = BankTokenService.getTokenStatusCode(
            newTokenStatus.tokenStatus)
          this.setState({
            newTokenStatus,
            statusToken: statusCode,
          })
          this.props.setStatusToken([
            BANK_TOKEN_STATUS.SUSPENDED,
            BANK_TOKEN_STATUS.TECHNICAL_PROBLEM,
            BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS,
            BANK_TOKEN_STATUS.INVALID_PASSWORD,
            BANK_TOKEN_STATUS.BLOCKED,
            BANK_TOKEN_STATUS.PASSWORD_EXPIRED,
            BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED,
            BANK_TOKEN_STATUS.AGREEMENT_REQUIRED,
          ].includes(statusCode))
          if (statusCode !== BANK_TOKEN_STATUS.VALID) {
            this.startPullingTokenStatus()
          }
        })
        .catch(() => this.setState({ inProgress: false }))
    }
  }

  startPullingTokenStatus = () => {
    this.intervalId = setInterval(() => {
      const { selectedAccounts } = this.props
      if (!IS_LIGHT.light && selectedAccounts &&
        selectedAccounts.length && selectedAccounts[0].companyId) {
        return getStatusTokenTypeApi.post({
          body: {
            companyId: selectedAccounts[0].companyId,
            tokens: [selectedAccounts[0].token],
          },
        })
          .then(([newTokenStatus]) => {
            this.setState({ newTokenStatus })
            if (!newTokenStatus) {return}

            const statusCode = BankTokenService.getTokenStatusCode(
              newTokenStatus.tokenStatus)
            this.setState({ statusToken: statusCode })
            this.props.setStatusToken([
              BANK_TOKEN_STATUS.SUSPENDED,
              BANK_TOKEN_STATUS.TECHNICAL_PROBLEM,
              BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS,
              BANK_TOKEN_STATUS.INVALID_PASSWORD,
              BANK_TOKEN_STATUS.BLOCKED,
              BANK_TOKEN_STATUS.PASSWORD_EXPIRED,
              BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED,
              BANK_TOKEN_STATUS.AGREEMENT_REQUIRED,
            ].includes(statusCode))
            if (BankTokenService.isTokenStatusProgressing(
              newTokenStatus.tokenStatus)) {
              return
            }

            if (statusCode === BANK_TOKEN_STATUS.INVALID_PASSWORD || [
              BANK_TOKEN_STATUS.VALID,
              BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED].includes(
              statusCode)) {
              this.stopPullingTokenStatus()
            }
          })
      } else {
        this.stopPullingTokenStatus()
      }
    }, 5000)
  }

  stopPullingTokenStatus = () => {
    clearInterval(this.intervalId)
  }

  handleSelectAccount = () => {
    const { onSelectAccount, selectedDeviantAccounts, selectedHarigaDatetAccounts, accountNicknameAccountException } = this.props
    const expectedDateExceededAcc = (selectedHarigaDatetAccounts) || null
    if (accountNicknameAccountException) {
      onSelectAccount(selectedDeviantAccounts[0].companyAccountId)
    } else {
      onSelectAccount(expectedDateExceededAcc[0].accountUuid)
    }
  }

  handleToggleDetails = () => this.props.onToggleAlertDetails()

  handleOpenUpdateTokenModal = (token) => () => {
    token.tokenNickname = token.accountNickname
    token.tokenStatus = this.state.statusToken
    token.websiteTargetTypeId = token.bankId
    token.screenPasswordUpdateCount = 0
    token.tokenTargetType = 'ACCOUNT'
    this.setState({
      currentToken: token,
      updateTokenModalIsOpen: true,
    })
  }

  handleCloseUpdateTokenModal = () => this.setState({
    currentToken: null,
    updateTokenModalIsOpen: false,
  })

  render () {
    const {
      currentToken,
      updateTokenModalIsOpen,
    } = this.state
    const {
      t,
      currentCompanyId,
    } = this.props

    return (
      <View style={styles.alertOuter}>

        {this.text}
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
      </View>
    )
  }
}
