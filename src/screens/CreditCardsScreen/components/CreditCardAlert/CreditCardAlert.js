import React, { Fragment, PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import AppTimezone from 'src/utils/appTimezone'
import { withTranslation } from 'react-i18next'
import CustomIcon from 'src/components/Icons/Fontello'
import { combineStyles as cs, sp } from 'src/utils/func'
import styles from './CreditCardAlertStyles'
import commonStyles from 'src/styles/styles'
import { colors, fonts } from 'src/styles/vars'
import { Icon } from 'react-native-elements'
import BankTokenService from '../../../../services/BankTokenService'
import { BANK_TOKEN_STATUS } from '../../../../constants/bank'
import { getStatusTokenTypeApi } from 'src/api'
import UpdateTokenModal
  from 'src/screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/UpdateTokenModal'

@withTranslation()
export default class CreditCardAlert extends PureComponent {
    intervalId = null;

    constructor (props) {
      super(props)
      this.state = {
        newTokenStatus: null,
        statusToken: null,
        currentToken: null,
        updateTokenModalIsOpen: false,
      }
      if (props.selectedCards && props.selectedCards.length === 1 && props.selectedCards[0].isUpdate === false && props.selectedCards[0].alertStatus === null) {
        clearInterval(this.intervalId)
        this.getStatus(props.currentCompanyId, props.selectedCards[0].token)
      }
    }

    get getStatusView () {
      const {
        statusToken,
      } = this.state
      const { selectedCards, t, isRtl } = this.props

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
        } else if (statusToken === BANK_TOKEN_STATUS.NEW || statusToken === BANK_TOKEN_STATUS.IN_PROGRESS) {
          percentage = '10%'
        }
        return (
          <View style={{
            backgroundColor: colors.red3,
            paddingHorizontal: 11,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
          }}>
            <Text style={{
              color: '#0f3860',
              fontFamily: fonts.regular,
              fontSize: sp(16),
              textAlign: 'center',
            }}>
              {(statusToken === BANK_TOKEN_STATUS.NEW || statusToken === BANK_TOKEN_STATUS.IN_PROGRESS) ? 'מאמת פרטי זיהוי' : 'מושך נתונים מהבנק'}
            </Text>
            <View style={{ width: 200, height: 6, backgroundColor: 'powderblue', marginTop: 0, marginBottom: 0 }}>
              <View style={{ width: percentage, height: 6, backgroundColor: 'steelblue' }} />
            </View>
            <Text style={{
              color: '#0f3860',
              fontFamily: fonts.regular,
              fontSize: sp(16),
              textAlign: 'center',
            }}>
              {percentage}
            </Text>
          </View>
        )
      } else if (statusToken === BANK_TOKEN_STATUS.SUSPENDED) {
        return (
          <View style={[styles.alertWrapper, {
            alignItems: 'center',
            flexDirection: 'row-reverse',
            justifyContent: 'center',
          }]}>
            <Image
              style={[styles.imgIcon, { width: 16, height: 16, marginHorizontal: 10 }]}
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
          <View style={[styles.alertWrapper, {
            alignItems: 'center',
            flexDirection: 'row-reverse',
            justifyContent: 'center',
          }]}>
            <Image style={{ width: 18, height: 18, marginHorizontal: 10 }}
              source={require('BiziboxUI/assets/b.png')} />
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
          <View style={[styles.alertWrapper, {
            alignItems: 'center',
            flexDirection: 'row-reverse',
            justifyContent: 'center',
          }]}>
            <Image
              style={[styles.imgIcon, { width: 16, height: 22, marginHorizontal: 10 }]}
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
      } else if (statusToken === BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS) {
        return (
          <View style={[styles.alertWrapper, {
            alignItems: 'center',
            flexDirection: 'row-reverse',
            justifyContent: 'center',
          }]}>
            <View style={{
              marginHorizontal: 10,
            }}>
              <CustomIcon name="exclamation-triangle" size={18} color={colors.red2} />
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
        if (statusToken === BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED) {
          hasBtnUpdate = false
        }

        return (
          <TouchableOpacity
            style={cs(isRtl, styles.alertWrapper, commonStyles.rowReverse)}
            activeOpacity={(hasBtnUpdate) ? 0.2 : 1}
            onPress={(hasBtnUpdate) ? this.handleOpenUpdateTokenModal(selectedCards[0]) : null}>
            <View style={{
              flex: 0.3,
              marginHorizontal: 5,
            }}>
              <CustomIcon name="exclamation-triangle" size={18} color={colors.red2} />
            </View>
            <View
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                flex: 2,
                paddingHorizontal: 5,
                alignItems: 'flex-end',
                justifyContent: 'center',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
              }}>
              <Text
                style={[styles.alertAdditionalText, commonStyles.boldFont, styles.alertText, { textAlign: 'right' }]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {t('bankAccount:notUpdates')}
              </Text>
              <Text style={styles.alertAdditionalText}
                numberOfLines={1}
                ellipsizeMode="tail">
                {(AppTimezone.moment().diff(AppTimezone.moment(selectedCards[0].balanceLastUpdatedDate), 'days') > 0) ? t(
                  'bankAccount:lastUpdatedXDaysAgo',
                  { days: AppTimezone.moment().diff(AppTimezone.moment(selectedCards[0].balanceLastUpdatedDate), 'days') },
                ) : (
                  t('bankAccount:lastUpdatedYesterday')
                )}
              </Text>
            </View>
            {(hasBtnUpdate) && (
              <Text style={{
                flex: 0.3,
                alignItems: 'flex-start',
                justifyContent: 'center',
                fontSize: sp(16),
                fontFamily: fonts.semiBold,
                color: colors.blue32,
                textAlign: 'left',
                marginHorizontal: 5,
              }}>עדכון</Text>
            )}
            {(hasBtnUpdate) && (
              <Icon name="chevron-left" size={24} color={colors.blue32} />
            )}
          </TouchableOpacity>
        )
      }
    }

    get allStatus () {
      const {
        isRtl,
        isOneOfOne,
        isOneOfMultiple,
        isMoreThenOneOfMultiple,
        isLowCreditLimitIsOneOfMultiple,
        isLowCreditLimitIsMoreThenOneOfMultiple,
        isNoCreditLimitIsOneOfMultiple,
        isNoCreditLimitIsMoreThenOneOfMultiple,
        selectedNotUpdatedCards,
        isNoCreditLimit,
        isLowCreditLimit,
      } = this.props

      if (!isOneOfOne &&
            !isOneOfMultiple &&
            !isMoreThenOneOfMultiple &&
            !isLowCreditLimitIsOneOfMultiple &&
            !isLowCreditLimitIsMoreThenOneOfMultiple &&
            !isNoCreditLimitIsOneOfMultiple &&
            !isNoCreditLimitIsMoreThenOneOfMultiple &&
            !isNoCreditLimit &&
            !isLowCreditLimit
      ) {
        return null
      }
      const hasBtn = isMoreThenOneOfMultiple || isLowCreditLimitIsOneOfMultiple || isLowCreditLimitIsMoreThenOneOfMultiple || isNoCreditLimitIsOneOfMultiple || isNoCreditLimitIsMoreThenOneOfMultiple
      // this.handleOpenUpdateTokenModal(selectedNotUpdatedCards[0])
      return (
        <View style={styles.alertOuter}>
          <TouchableOpacity
            activeOpacity={(hasBtn) ? 0.2 : 1}
            onPress={(hasBtn)
              ? ((isLowCreditLimitIsOneOfMultiple || isNoCreditLimitIsOneOfMultiple) ? this.handleSelectCard : this.handleToggleDetails)
              : null}>
            <View style={cs(isRtl, styles.alertWrapper, commonStyles.rowReverse)}>
              <View style={{
                flex: 0.3,
                marginHorizontal: 5,
              }}>
                <CustomIcon
                  name="exclamation-triangle"
                  size={25}
                  color={colors.red2}
                />
              </View>
              <View
                style={cs(!hasBtn && !isNoCreditLimit && !isLowCreditLimit && !isOneOfOne && !isOneOfMultiple, styles.alertTextWrapper, styles.alertTextWrapperAbsolute)}>
                <Text
                  numberOfLines={(isMoreThenOneOfMultiple || isNoCreditLimit || isNoCreditLimitIsMoreThenOneOfMultiple || isLowCreditLimit || isLowCreditLimitIsMoreThenOneOfMultiple) ? 1 : 2}
                  ellipsizeMode="tail"
                  style={[cs(!hasBtn, cs(selectedNotUpdatedCards.length === 0, styles.alertText, commonStyles.boldFont), commonStyles.textCenter), ((isMoreThenOneOfMultiple || isLowCreditLimitIsMoreThenOneOfMultiple || isNoCreditLimitIsMoreThenOneOfMultiple) ? styles.underLine : {})]}>
                  {this.error}
                </Text>
              </View>
              {/* {(isOneOfOne || isOneOfMultiple) && ( */}
              {/* <Text style={{ */}
              {/* flex: 0.3, */}
              {/* alignItems: 'flex-start', */}
              {/* justifyContent: 'center', */}
              {/* fontSize: sp(16), */}
              {/* fontFamily: fonts.semiBold, */}
              {/* color: colors.blue32, */}
              {/* textAlign: 'left', */}
              {/* marginHorizontal: 5, */}
              {/* }}>עדכון</Text> */}
              {/* )} */}
              {/* {(isOneOfOne || isOneOfMultiple || isLowCreditLimitIsOneOfMultiple || isNoCreditLimitIsOneOfMultiple) && ( */}
              {(isLowCreditLimitIsOneOfMultiple || isNoCreditLimitIsOneOfMultiple) && (
                <Icon name="chevron-left" size={24} color={colors.blue32} />
              )}
            </View>
          </TouchableOpacity>
        </View>
      )
    }

    get error () {
      const {
        t,
        isOneOfOne,
        isOneOfMultiple,
        isMoreThenOneOfMultiple,
        isLowCreditLimit,
        isLowCreditLimitIsOneOfMultiple,
        isLowCreditLimitIsMoreThenOneOfMultiple,
        isNoCreditLimit,
        isNoCreditLimitIsOneOfMultiple,
        isNoCreditLimitIsMoreThenOneOfMultiple,
        selectedNotUpdatedCards,
        selectedLowCreditLimitCards,
        selectedNoCreditLimitCards,
      } = this.props

      if (isOneOfOne && selectedNotUpdatedCards[0].alertStatus === null) {
        return (
          <Fragment>
            <Text style={[commonStyles.boldFont, styles.alertText, { textAlign: 'right' }]}
              numberOfLines={1}
              ellipsizeMode="tail">{t('creditCards:notUpdates')}</Text>
            <Text style={styles.alertAdditionalText}
              numberOfLines={1}
              ellipsizeMode="tail">
              {'\n'}
              {t(
                'creditCards:lastUpdatedXDaysAgo',
                { days: AppTimezone.moment().diff(AppTimezone.moment(selectedNotUpdatedCards[0].balanceLastUpdatedDate), 'days') },
              )}
            </Text>
          </Fragment>
        )
      }

      if (isOneOfMultiple) {
        return (
          <Fragment>
            <Text numberOfLines={1}
              ellipsizeMode="tail"
              style={[commonStyles.boldFont, styles.alertText, { textAlign: 'right' }]}>{t('creditCards:notUpdates')}</Text>
            <Text style={styles.alertAdditionalText} numberOfLines={1} ellipsizeMode="tail">
              {'\n'}
              {t(
                'creditCards:toTheCard',
                { creditCardNickname: selectedNotUpdatedCards[0].creditCardNickname },
              )}
            </Text>
          </Fragment>
        )
      }

      if (isMoreThenOneOfMultiple) {return t('creditCards:xTicketsAreOutOfDate', { count: selectedNotUpdatedCards.length })}

      if (isNoCreditLimit) {return t('creditCards:creditLineIsOver')}

      if (isNoCreditLimitIsMoreThenOneOfMultiple) {
        return t('creditCards:xCardsHaveEnded', { count: selectedNoCreditLimitCards.length })
      }

      if (isNoCreditLimitIsOneOfMultiple) {
        return (
          <Fragment>
            <Text numberOfLines={1}
              ellipsizeMode="tail"
              style={[commonStyles.boldFont, { textAlign: 'right' }]}>{t('creditCards:creditLineIsOver')}</Text>
            <Text style={styles.alertAdditionalText} numberOfLines={1} ellipsizeMode="tail">
              {'\n'}
              {selectedNoCreditLimitCards[0].creditCardNickname}
            </Text>
          </Fragment>
        )
      }

      if (isLowCreditLimit) {return t('creditCards:aCreditLineIsAboutToEnd')}

      if (isLowCreditLimitIsOneOfMultiple) {
        return (
          <Fragment>
            <Text numberOfLines={1}
              ellipsizeMode="tail"
              style={[commonStyles.boldFont, { textAlign: 'right' }]}>{t('creditCards:aCreditLineIsAboutToEnd')}</Text>
            <Text style={styles.alertAdditionalText} numberOfLines={1} ellipsizeMode="tail">
              {'\n'}
              {selectedLowCreditLimitCards[0].creditCardNickname}
            </Text>
          </Fragment>
        )
      }

      if (isLowCreditLimitIsMoreThenOneOfMultiple) {
        return t('creditCards:xCardsAboutToExpire', { count: selectedLowCreditLimitCards.length })
      }
    }

    get data () {
      const {
        selectedCards,
      } = this.props
      const {
        statusToken,
      } = this.state

      if (selectedCards.length === 1) {
        if (selectedCards[0].isUpdate === false) {
          const alertStatus = selectedCards[0].alertStatus
          if (alertStatus === 'Not found in bank website') {
            return (
              <View style={[styles.alertWrapper, {
                alignItems: 'center',
                flexDirection: 'row-reverse',
              }]}>
                <Text style={{
                  color: '#0f3860',
                  fontFamily: fonts.regular,
                  fontSize: sp(18),
                  textAlign: 'center',
                }}>
                  {'אין הרשאה לחשבון באתר הבנק'}
                </Text>
                <Image style={{ width: 17, height: 19, marginHorizontal: 2 }}
                  source={require('BiziboxUI/assets/alertStatusNotFound.png')} />
              </View>
            )
          } else if (alertStatus === 'Error itrot sequence') {
            return (
              <View style={[styles.alertWrapper, {
                alignItems: 'center',
                flexDirection: 'row-reverse',
              }]}>
                <Image style={{ width: 18, height: 18, marginHorizontal: 2 }}
                  source={require('BiziboxUI/assets/b.png')} />
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
          } else if (alertStatus === null && statusToken !== BANK_TOKEN_STATUS.VALID) {
            return this.getStatusView
          }
        }

        return this.allStatus
      } else {
        return this.allStatus
      }
    }

    UNSAFE_componentWillReceiveProps (nextProps) {
      const { selectedCards } = this.props
      const selectedAccountsNextProps = nextProps.selectedCards

      if (selectedAccountsNextProps.length === 1) {
        if (
          (selectedAccountsNextProps.length !== selectedCards.length) ||
                (selectedCards && selectedCards.length > 0 && (selectedCards[0].creditCardId !== selectedAccountsNextProps[0].creditCardId))
        ) {
          if (selectedAccountsNextProps[0].isUpdate === false && selectedAccountsNextProps[0].alertStatus === null) {
            clearInterval(this.intervalId)
            this.getStatus(nextProps.currentCompanyId, selectedAccountsNextProps[0].token)
          }
        }
      }
    }

    getStatus = (companyId, token) => {
      if (companyId) {
        return getStatusTokenTypeApi.post({ body: { companyId, tokens: [token] } })
          .then(([newTokenStatus]) => {
            const statusCode = BankTokenService.getTokenStatusCode(newTokenStatus.tokenStatus)
            this.setState({ newTokenStatus, statusToken: statusCode })

            if (statusCode !== BANK_TOKEN_STATUS.VALID) {
              this.startPullingTokenStatus()
            }
          })
          .catch(() => this.setState({ inProgress: false }))
      }
    };

    startPullingTokenStatus = () => {
      this.intervalId = setInterval(() => {
        const { selectedCards, currentCompanyId } = this.props
        if (currentCompanyId) {
          return getStatusTokenTypeApi.post({
            body: {
              companyId: currentCompanyId,
              tokens: [selectedCards[0].token],
            },
          })
            .then(([newTokenStatus]) => {
              this.setState({ newTokenStatus })
              if (!newTokenStatus) {return}

              const statusCode = BankTokenService.getTokenStatusCode(newTokenStatus.tokenStatus)
              this.setState({ statusToken: statusCode })

              if (BankTokenService.isTokenStatusProgressing(newTokenStatus.tokenStatus)) {return}

              if (statusCode === BANK_TOKEN_STATUS.INVALID_PASSWORD || [BANK_TOKEN_STATUS.VALID, BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED].includes(statusCode)) {
                this.stopPullingTokenStatus()
              }
            })
        }
      }, 5000)
    };

    stopPullingTokenStatus = () => {
      clearInterval(this.intervalId)
    };

    handleSelectCard = () => {
      const {
        onSelectCard,
        selectedNotUpdatedCards,
        selectedLowCreditLimitCards,
        selectedNoCreditLimitCards,
        isLowCreditLimitIsOneOfMultiple,
        isNoCreditLimitIsOneOfMultiple,
      } = this.props

      const card = isLowCreditLimitIsOneOfMultiple
        ? selectedLowCreditLimitCards[0]
        : isNoCreditLimitIsOneOfMultiple
          ? selectedNoCreditLimitCards[0]
          : selectedNotUpdatedCards[0]

      return onSelectCard(card.creditCardId)
    };

    handleToggleDetails = () => this.props.onToggleAlertDetails();

    handleOpenUpdateTokenModal = (token) => () => {
      token.tokenNickname = token.creditCardNickname
      token.tokenStatus = this.state.statusToken
      token.websiteTargetTypeId = token.creditCardTypeId
      token.screenPasswordUpdateCount = 0
      token.tokenTargetType = 'CREDITCARD'
      this.setState({ currentToken: token, updateTokenModalIsOpen: true })
    };

    handleCloseUpdateTokenModal = () => this.setState({ currentToken: null, updateTokenModalIsOpen: false });

    render () {
      const {
        currentCompanyId,
        t,
      } = this.props
      const {
        currentToken,
        updateTokenModalIsOpen,
      } = this.state
      return (
        <Fragment>
          {this.data}

          {updateTokenModalIsOpen && (
            <UpdateTokenModal
              navigation={this.props.navigation}
              tokenType={'CREDITCARD'}
              title={t('settings:creditCardsTab:creditCards')}
              token={currentToken}
              companyId={currentCompanyId}
              onClose={this.handleCloseUpdateTokenModal}
            />
          )}
        </Fragment>)
    }
}
