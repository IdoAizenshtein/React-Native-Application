import React, {Fragment, PureComponent} from 'react'
import {Image, Text, TouchableOpacity, View} from 'react-native'
import AppTimezone from '../../utils/appTimezone'
import {withTranslation} from 'react-i18next'
import CustomIcon from '../Icons/Fontello'
import {combineStyles as cs, sp} from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles from './AccountAlertStyles'
import {colors, fonts} from 'src/styles/vars'
import {Icon} from 'react-native-elements'
import BankTokenService from '../../services/BankTokenService'
import {BANK_TOKEN_STATUS} from '../../constants/bank'
import {getStatusTokenTypeApi} from '../../api'
import UpdateTokenModal
    from 'src/screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/UpdateTokenModal'

@withTranslation()
export default class AccountAlert extends PureComponent {
    intervalId = null;

    constructor(props) {
        super(props)
        this.state = {
            newTokenStatus: null,
            statusToken: null,
            currentToken: null,
            updateTokenModalIsOpen: false,
        }
        if (props.selectedAccounts && props.selectedAccounts.length === 1 && props.selectedAccounts[0].nonUpdateDays > 0 && props.selectedAccounts[0].alertStatus === null) {
            clearInterval(this.intervalId)
            this.getStatus(props.selectedAccounts[0].companyId, props.selectedAccounts[0].token)
        }
    }

    get getStatusView() {
        const {
            statusToken,
        } = this.state
        const {selectedAccounts, t, isRtl} = this.props

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
                <View style={[styles.alertWrapperRow, {
                    backgroundColor: colors.red3,
                    paddingHorizontal: 11,
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                }]}>
                    <Text style={{
                        color: '#0f3860',
                        fontFamily: fonts.regular,
                        fontSize: sp(16),
                        textAlign: 'center',
                    }}>
                        {(statusToken === BANK_TOKEN_STATUS.NEW || statusToken === BANK_TOKEN_STATUS.IN_PROGRESS) ? 'מאמת פרטי זיהוי' : 'מושך נתונים מהבנק'}
                    </Text>
                    <View style={{width: 200, height: 6, backgroundColor: 'powderblue', marginTop: 0, marginBottom: 0}}>
                        <View style={{width: percentage, height: 6, backgroundColor: 'steelblue'}}/>
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
                        style={[styles.imgIcon, {width: 16, height: 16, marginHorizontal: 10}]}
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
                    <Image style={{width: 18, height: 18, marginHorizontal: 10}}
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
                <View style={[styles.alertWrapper, {
                    alignItems: 'center',
                    flexDirection: 'row-reverse',
                    justifyContent: 'center',
                }]}>
                    <Image
                        style={[styles.imgIcon, {width: 16, height: 22, marginHorizontal: 10}]}
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
                        <CustomIcon name="exclamation-triangle" size={18} color={colors.red2}/>
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
            if (this.state.newTokenStatus.hasPrivs === false || statusToken === BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED) {
                hasBtnUpdate = false
            }
            return (
                <TouchableOpacity
                    style={cs(isRtl, styles.alertWrapper, commonStyles.rowReverse)}
                    activeOpacity={(hasBtnUpdate) ? 0.2 : 1}
                    onPress={(hasBtnUpdate) ? this.handleOpenUpdateTokenModal(selectedAccounts[0]) : null}>
                    <View style={{
                        marginHorizontal: 10,
                    }}>
                        <CustomIcon name="exclamation-triangle" size={18} color={colors.red2}/>
                    </View>
                    <View style={{
                        flex: 2,
                        paddingHorizontal: 10,
                        top: 0,
                        bottom: 0,
                        right: 0,
                        left: 0,
                    }}>
                        <Text
                            style={[styles.alertAdditionalText, commonStyles.boldFont, styles.alertText, {textAlign: 'right'}]}>
                            {t('bankAccount:notUpdates')}
                        </Text>
                        {(selectedAccounts[0].isUpdate === false && selectedAccounts[0].isShowItrot === true) && (
                            <Text style={styles.alertAdditionalText}>
                                {(selectedAccounts[0].nonUpdateDays > 1) ? t(
                                    'bankAccount:lastUpdatedXDaysAgo',
                                    {days: selectedAccounts[0].nonUpdateDays},
                                ) : (
                                    t('bankAccount:lastUpdatedYesterday')
                                )}
                            </Text>
                        )}
                        {(selectedAccounts[0].isUpdate === true || selectedAccounts[0].isShowItrot === false) && (
                            <Text style={styles.alertAdditionalText}>
                                {(AppTimezone.moment().diff(AppTimezone.moment(selectedAccounts[0].balanceLastUpdatedDate), 'days') > 0) ? t(
                                    'bankAccount:lastUpdatedXDaysAgo',
                                    {days: AppTimezone.moment().diff(AppTimezone.moment(selectedAccounts[0].balanceLastUpdatedDate), 'days')},
                                ) : (
                                    t('bankAccount:lastUpdatedYesterday')
                                )}
                            </Text>
                        )}
                    </View>
                    {(hasBtnUpdate) && (
                        <Text style={{
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: sp(16),
                            fontFamily: fonts.semiBold,
                            color: colors.blue32,
                            textAlign: 'left',
                            marginHorizontal: 5,
                        }}>עדכון</Text>
                    )}
                    {(hasBtnUpdate) && (
                        <Icon name="chevron-left" size={24} color={colors.blue32}/>
                    )}
                </TouchableOpacity>
            )
        }
    }

    get error() {
        const {
            t,
            isOneOfOne,
            isOneOfMultiple,
            isMoreThenOneOfMultiple,
            isOneOfOneNotUpdated,
            isOneOfMultipleNotUpdated,
            isMoreThenOneOfMultipleNotUpdated,
            selectedDeviantAccounts,
            selectedNotUpdatedAccounts,
        } = this.props

        if (isOneOfOneNotUpdated || isOneOfMultipleNotUpdated || isMoreThenOneOfMultipleNotUpdated) {
            let text
            if (isOneOfOneNotUpdated || isOneOfMultipleNotUpdated) {
                text = t('bankAccount:notUpdates')
            } else if (isMoreThenOneOfMultipleNotUpdated) {
                text = t('bankAccount:accountsNotUpdates', {count: selectedNotUpdatedAccounts.length})
            }
            return (
                <Fragment>
                    <Text style={[commonStyles.boldFont, styles.alertText, {textAlign: 'right'}]}>
                        {text}
                    </Text>

                    {(isOneOfOneNotUpdated && (selectedNotUpdatedAccounts[0].isUpdate === true || selectedNotUpdatedAccounts[0].isShowItrot === false)) && (
                        <Text style={styles.alertAdditionalText}>
                            {'\n'}
                            {(AppTimezone.moment().diff(AppTimezone.moment(selectedNotUpdatedAccounts[0].balanceLastUpdatedDate), 'days') > 0) ? t(
                                'bankAccount:lastUpdatedXDaysAgo',
                                {days: AppTimezone.moment().diff(AppTimezone.moment(selectedNotUpdatedAccounts[0].balanceLastUpdatedDate), 'days')},
                            ) : (
                                t('bankAccount:lastUpdatedYesterday')
                            )}
                        </Text>
                    )}

                    {(isOneOfOneNotUpdated && selectedNotUpdatedAccounts[0].isUpdate === false && selectedNotUpdatedAccounts[0].isShowItrot === true) && (
                        <Text style={styles.alertAdditionalText}>
                            {'\n'}
                            {(selectedNotUpdatedAccounts[0].nonUpdateDays > 1) ? t(
                                'bankAccount:lastUpdatedXDaysAgo',
                                {days: selectedNotUpdatedAccounts[0].nonUpdateDays},
                            ) : (
                                t('bankAccount:lastUpdatedYesterday')
                            )}
                        </Text>
                    )}

                    {(isOneOfMultipleNotUpdated) && (
                        <Text style={styles.alertAdditionalText}>
                            {'\n'}
                            {t('bankAccount:specificAccountNotUpdate', {accountNickname: selectedNotUpdatedAccounts[0].accountNickname})}
                        </Text>
                    )}
                </Fragment>
            )
        }

        if (isOneOfOne) {return t('bankAccount:accountExceeded')}
        if (isOneOfMultiple) {
            return t('bankAccount:specificAccountExceeded', {accountNickname: selectedDeviantAccounts[0].accountNickname})
        }
        if (isMoreThenOneOfMultiple) {return t('bankAccount:accountsExceeded', {count: selectedDeviantAccounts.length})}

        return null
    }

    get allStatus() {
        const {
            isRtl,
            isAccountNotUpdated,
            isOneOfMultiple,
            isMoreThenOneOfMultiple,
            isOneOfOneNotUpdated,
            isOneOfMultipleNotUpdated,
            isMoreThenOneOfMultipleNotUpdated,
            selectedNotUpdatedAccounts,
        } = this.props

        const hasBtn = isOneOfMultiple || isMoreThenOneOfMultiple || isOneOfOneNotUpdated || isOneOfMultipleNotUpdated || isMoreThenOneOfMultipleNotUpdated

        return (
            <View style={styles.alertOuter}>
                <TouchableOpacity
                    activeOpacity={(hasBtn) ? 0.2 : 1}
                    onPress={(hasBtn)
                        ? ((isOneOfMultiple || isOneOfOneNotUpdated || isOneOfMultipleNotUpdated) ? ((isOneOfOneNotUpdated || isOneOfMultipleNotUpdated) ? this.handleOpenUpdateTokenModal(selectedNotUpdatedAccounts[0]) : this.handleSelectAccount) : this.handleToggleDetails)
                        : null}>
                    <View style={cs(isRtl, styles.alertWrapper, commonStyles.rowReverse)}>
                        <CustomIcon
                            name="exclamation-triangle"
                            size={25}
                            color={colors.red2}
                        />
                        <View style={cs(!hasBtn, styles.alertTextWrapper, styles.alertTextWrapperAbsolute)}>
                            <Text
                                style={[cs(!hasBtn, cs(!isAccountNotUpdated, styles.alertText, commonStyles.boldFont), commonStyles.textCenter),
                                    (isMoreThenOneOfMultiple || isMoreThenOneOfMultipleNotUpdated) ? styles.underLine : {},
                                ]}>
                                {this.error}
                            </Text>
                        </View>
                        {(isOneOfOneNotUpdated || isOneOfMultipleNotUpdated) && (
                            <Text style={{
                                flex: 1,
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: sp(16),
                                fontFamily: fonts.semiBold,
                                color: colors.blue32,
                                textAlign: 'left',
                                marginHorizontal: 5,
                            }}>עדכון</Text>
                        )}
                        {(isOneOfMultiple || isOneOfOneNotUpdated || isOneOfMultipleNotUpdated) && (
                            <Icon name="chevron-left" size={24} color={colors.blue32}/>
                        )}
                    </View>
                </TouchableOpacity>
            </View>
        )
    }

    get allStatusTazrim() {
        const {
            isRtl,
            t,
            selectedDeviantAccounts,
            selectedNotUpdatedAccounts,
            selectedAccounts,
            selectedHarigaDatetAccounts,
            screenSwitchState,
        } = this.props

        if (selectedAccounts.length === 1) {
            if (selectedNotUpdatedAccounts && selectedNotUpdatedAccounts.length > 0) {
                return (
                    <View style={styles.alertOuter}>
                        <TouchableOpacity
                            onPress={this.handleOpenUpdateTokenModal(selectedAccounts[0])}>
                            <View style={cs(isRtl, styles.alertWrapper, commonStyles.rowReverse)}>
                                <CustomIcon
                                    name="exclamation-triangle"
                                    size={25}
                                    color={colors.red2}
                                />
                                <View style={styles.alertTextWrapper}>
                                    <Text
                                        style={[styles.alertText]}>
                                        <Text style={[commonStyles.boldFont, styles.alertText, {textAlign: 'right'}]}>
                                            {t('bankAccount:notUpdates')}
                                        </Text>

                                        <Text style={styles.alertAdditionalText}>
                                            {'\n'}
                                            {(AppTimezone.moment().diff(AppTimezone.moment(selectedNotUpdatedAccounts[0].balanceLastUpdatedDate), 'days') > 0) ? t(
                                                'bankAccount:lastUpdatedXDaysAgo',
                                                {days: AppTimezone.moment().diff(AppTimezone.moment(selectedNotUpdatedAccounts[0].balanceLastUpdatedDate), 'days')},
                                            ) : (
                                                t('bankAccount:lastUpdatedYesterday')
                                            )}
                                        </Text>
                                    </Text>
                                </View>
                                <Text style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: sp(16),
                                    fontFamily: fonts.semiBold,
                                    color: colors.blue32,
                                    textAlign: 'left',
                                    marginHorizontal: 5,
                                }}>עדכון</Text>
                                <Icon name="chevron-left" size={24} color={colors.blue32}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            } else if (selectedDeviantAccounts && selectedDeviantAccounts.length > 0) {
                return (
                    <View style={styles.alertOuter}>
                        <View style={cs(isRtl, styles.alertWrapper, commonStyles.rowReverse)}>
                            <CustomIcon
                                name="exclamation-triangle"
                                size={25}
                                color={colors.red2}
                            />
                            <View style={[styles.alertTextWrapper, styles.alertTextWrapperAbsolute]}>
                                <Text
                                    style={[styles.alertText, commonStyles.boldFont, commonStyles.textCenter]}>
                                    {t('bankAccount:accountExceeded')}
                                </Text>
                            </View>
                        </View>
                    </View>
                )
            } else if (selectedHarigaDatetAccounts && selectedHarigaDatetAccounts.length > 0 &&
                (screenSwitchState
                    ? selectedHarigaDatetAccounts.find(d => d.accountUuid === selectedAccounts[0].companyAccountId)
                    : selectedHarigaDatetAccounts.find(d => d.companyAccountId === selectedAccounts[0].companyAccountId))
            ) {
                const harigaDate = selectedHarigaDatetAccounts[0].harigaDate

                return (
                    <View style={[styles.alertOuter, styles.alertWrapperRow]}>
                        <Text style={{
                            textAlign: 'center',
                            color: '#0f3860',
                            fontFamily: fonts.regular,
                            fontSize: sp(16),
                            lineHeight: 18,
                        }}>
                            {'מצב התזרים לחודש הקרוב'}
                        </Text>
                        <Text style={{
                            textAlign: 'center',
                            color: '#ef3636',
                            fontFamily: fonts.bold,
                            fontSize: sp(18),
                            lineHeight: 20,
                        }}>
                            {'צפויה חריגה מתאריך'} {AppTimezone.moment(harigaDate).format('DD/MM/YY')}
                        </Text>
                    </View>
                )
            } else {
                return (
                    <View style={[styles.alertOuter, styles.alertWrapperRow, {
                        backgroundColor: '#ffffff',
                    }]}>
                        <Text style={{
                            textAlign: 'center',
                            color: '#11cab1',
                            fontFamily: fonts.bold,
                            fontSize: sp(23.5),
                        }}>
                            {'לא צפויה חריגה בחודש הקרוב'}
                        </Text>
                    </View>
                )
            }
        } else {
            if (selectedDeviantAccounts && selectedDeviantAccounts.length > 0) {
                let text = ''
                if (selectedDeviantAccounts.length === 1) {
                    text = t('bankAccount:specificAccountExceeded', {accountNickname: selectedDeviantAccounts[0].accountNickname})
                } else {
                    text = t('bankAccount:accountsExceeded', {count: selectedDeviantAccounts.length})
                }
                return (
                    <View style={styles.alertOuter}>
                        <TouchableOpacity
                            onPress={selectedDeviantAccounts.length === 1 ? this.handleSelectAccount : this.handleToggleDetails}>
                            <View style={cs(isRtl, styles.alertWrapper, commonStyles.rowReverse)}>
                                <CustomIcon
                                    name="exclamation-triangle"
                                    size={25}
                                    color={colors.red2}
                                />
                                <View style={styles.alertTextWrapper}>
                                    <Text
                                        style={[styles.alertText, commonStyles.textCenter,
                                            (selectedDeviantAccounts.length > 1) ? styles.underLine : {},
                                        ]}>
                                        {text}
                                    </Text>
                                </View>

                                {(selectedDeviantAccounts.length === 1) && (
                                    <Icon name="chevron-left" size={24} color={colors.blue32}/>
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                )
            } else if (selectedHarigaDatetAccounts && selectedHarigaDatetAccounts.length > 0) {
                if (selectedHarigaDatetAccounts.length === 1) {
                    const companyAccountId = screenSwitchState
                        ? selectedHarigaDatetAccounts[0].accountUuid
                        : selectedHarigaDatetAccounts[0].companyAccountId

                    const harigaDate = selectedHarigaDatetAccounts[0].harigaDate

                    return (
                        <View>
                            <TouchableOpacity
                                style={[styles.alertWrapperRow, {
                                    flexDirection: 'row-reverse',
                                }]}
                                onPress={this.handleSelectAccount}>
                                <View style={{
                                    flex: 95,
                                }}>
                                    <Text style={{
                                        textAlign: 'center',
                                        color: '#0f3860',
                                        fontFamily: fonts.regular,
                                        fontSize: sp(16),
                                        lineHeight: 18,
                                    }}>
                                        מצב התזרים לחודש הקרוב
                                    </Text>
                                    <View style={{
                                        flexDirection: 'row-reverse',
                                    }}>
                                        <Text style={{
                                            textAlign: 'center',
                                            color: '#ef3636',
                                            fontFamily: fonts.bold,
                                            fontSize: sp(18),
                                            lineHeight: 20,
                                        }}>
                                            {'צפויה חריגה '}
                                        </Text>
                                        <Text style={{
                                            textAlign: 'center',
                                            color: '#ef3636',
                                            fontFamily: fonts.bold,
                                            fontSize: sp(18),
                                            lineHeight: 20,
                                        }}>
                                            {'ב'}{selectedAccounts ? selectedAccounts.find(d => d.companyAccountId === companyAccountId).accountNickname : ''} {'מ-'} {AppTimezone.moment(harigaDate).format('DD/MM/YY')}
                                        </Text>
                                    </View>
                                </View>
                                <View style={{
                                    flex: 5,
                                }}>
                                    <Icon name="chevron-left" size={24} color={colors.blue32}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )
                } else {
                    return (
                        <View style={[styles.alertOuter, styles.alertWrapperRow]}>
                            <TouchableOpacity
                                onPress={this.handleToggleDetails}>
                                <Text style={{
                                    textAlign: 'center',
                                    color: '#0f3860',
                                    fontFamily: fonts.regular,
                                    fontSize: sp(16),
                                    lineHeight: 18,
                                }}>
                                    מצב התזרים לחודש הקרוב
                                </Text>
                                <Text style={{
                                    textDecorationLine: 'underline',
                                    textDecorationStyle: 'solid',
                                    textDecorationColor: '#ef3636',
                                    textAlign: 'center',
                                    color: '#ef3636',
                                    fontFamily: fonts.bold,
                                    fontSize: sp(18),
                                    lineHeight: 20,
                                }}>
                                    {'צפויה חריגה ל-'} {(selectedHarigaDatetAccounts) ? selectedHarigaDatetAccounts.length : ''} {'חשבונות'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )
                }
            } else {
                return (
                    <View style={[styles.alertOuter, styles.alertWrapperRow, {
                        backgroundColor: '#ffffff',
                    }]}>
                        <Text style={{
                            textAlign: 'center',
                            color: '#11cab1',
                            fontFamily: fonts.bold,
                            fontSize: sp(23.5),
                        }}>
                            {'לא צפויה חריגה בחודש הקרוב'}
                        </Text>
                    </View>
                )
            }
        }
    }

    get data() {
        const {
            selectedAccounts,
            screen,
        } = this.props
        const {
            statusToken,
        } = this.state

        if (selectedAccounts.length === 1) {
            if (selectedAccounts[0].nonUpdateDays > 0) {
                const alertStatus = selectedAccounts[0].alertStatus
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
                            <Image style={{width: 17, height: 19, marginHorizontal: 2}}
                                   source={require('BiziboxUI/assets/alertStatusNotFound.png')}/>
                        </View>
                    )
                } else if (alertStatus === 'Error itrot sequence') {
                    return (
                        <View style={[styles.alertWrapper, {
                            alignItems: 'center',
                            flexDirection: 'row-reverse',
                        }]}>
                            <Image style={{width: 18, height: 18, marginHorizontal: 2}}
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
                } else if (alertStatus === null && statusToken === null) {
                    return null
                } else if (alertStatus === null && statusToken !== BANK_TOKEN_STATUS.VALID) {
                    return this.getStatusView
                }
            }

            return (screen && screen === 'tazrim') ? this.allStatusTazrim : this.allStatus
        } else {
            return (screen && screen === 'tazrim') ? this.allStatusTazrim : this.allStatus
        }
    }

    UNSAFE_componentWillReceiveProps(nextProps, prevState) {
        const {selectedAccounts} = this.props
        const selectedAccountsNextProps = nextProps.selectedAccounts

        if (selectedAccounts && selectedAccountsNextProps.length === 1 && (selectedAccounts[0].companyAccountId !== selectedAccountsNextProps[0].companyAccountId)) {
            if (selectedAccountsNextProps[0].nonUpdateDays > 0 && selectedAccountsNextProps[0].alertStatus === null) {
                clearInterval(this.intervalId)
                this.getStatus(selectedAccountsNextProps[0].companyId, selectedAccountsNextProps[0].token)
            }
        }
    }

    getStatus = (companyId, token) => {
        if (companyId) {
            return getStatusTokenTypeApi.post({body: {companyId, tokens: [token]}})
                .then(([newTokenStatus]) => {
                    const statusCode = BankTokenService.getTokenStatusCode(newTokenStatus.tokenStatus)
                    this.setState({newTokenStatus, statusToken: statusCode})

                    if (statusCode !== BANK_TOKEN_STATUS.VALID) {
                        this.startPullingTokenStatus()
                    }
                })
                .catch(() => this.setState({inProgress: false}))
        }
    };

    startPullingTokenStatus = () => {
        this.intervalId = setInterval(() => {
            const {selectedAccounts} = this.props
            if (selectedAccounts[0].companyId) {
                return getStatusTokenTypeApi.post({
                    body: {
                        companyId: selectedAccounts[0].companyId,
                        tokens: [selectedAccounts[0].token],
                    },
                })
                    .then(([newTokenStatus]) => {
                        this.setState({newTokenStatus})
                        if (!newTokenStatus) {return}

                        const statusCode = BankTokenService.getTokenStatusCode(newTokenStatus.tokenStatus)
                        this.setState({statusToken: statusCode})

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

    handleSelectAccount = () => {
        const {onSelectAccount, selectedDeviantAccounts, selectedNotUpdatedAccounts, isOneOfMultiple, isOneOfOneNotUpdated, isOneOfMultipleNotUpdated} = this.props

        if (isOneOfMultiple) {
            onSelectAccount(selectedDeviantAccounts[0].companyAccountId)
        } else if (isOneOfOneNotUpdated || isOneOfMultipleNotUpdated) {
            onSelectAccount(selectedNotUpdatedAccounts[0].companyAccountId)
        }
    };

    handleToggleDetails = () => {
        this.props.onToggleAlertDetails()
    };

    handleOpenUpdateTokenModal = (token) => () => {
        token.tokenNickname = token.accountNickname
        token.tokenStatus = this.state.statusToken
        token.websiteTargetTypeId = token.bankId
        token.screenPasswordUpdateCount = 0
        token.tokenTargetType = 'ACCOUNT'
        this.setState({currentToken: token, updateTokenModalIsOpen: true})
    };

    handleCloseUpdateTokenModal = () => this.setState({currentToken: null, updateTokenModalIsOpen: false});

    render() {
        const {
            t,
            currentCompanyId,
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
                        tokenType={'ACCOUNT'}
                        title={t('settings:bankAccountsTab:addBankAccount')}
                        token={currentToken}
                        companyId={currentCompanyId}
                        onClose={this.handleCloseUpdateTokenModal}
                    />
                )}
            </Fragment>)
    }
}
