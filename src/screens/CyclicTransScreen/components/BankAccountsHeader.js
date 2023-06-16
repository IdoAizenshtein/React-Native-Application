import React, { Fragment, PureComponent } from 'react'
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import CustomIcon from '../../../components/Icons/Fontello'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import AccountAlert from '../../../components/AccountAlert/AccountAlert'
import { colors, fonts } from '../../../styles/vars'
import {
  combineStyles as cs,
  getCurrencyChar,
  getFormattedValueArray,
  sp,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles, { HEADER_ALERT_BORDER_HEIGHT } from '../CyclicTransStyles'
import { IS_IOS } from '../../../constants/common'
import EditableTextInput from '../../../components/FormInput/EditableTextInput'

const numberFormat = new Intl.NumberFormat('he')

@withTranslation()
export default class BankAccountsHeader extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: false,
      query: props.queryStatus.query,
    }
  }

  get accountTitle () {
    const { selectedAccounts, selectedGroup, accountGroups, t, isRtl, onOpenAccountsModal } = this.props

    if (!selectedAccounts.length) {
      return (
        <TouchableOpacity
          style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter], commonStyles.rowReverse)}
          onPress={onOpenAccountsModal}
        >
          <CustomIcon
            name="plus"
            size={10}
            color={colors.blue7}
          />
          <View style={commonStyles.spaceDividerDouble} />
          <Text style={styles.bankAccountHeaderText}>{t('bankAccount:selectAccount')}</Text>
        </TouchableOpacity>
      )
    }

    const account = selectedAccounts[0]

    if (selectedAccounts.length === 1) {
      return (
        <TouchableOpacity
          style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter], commonStyles.rowReverse)}
          onPress={onOpenAccountsModal}
        >
          <AccountIcon account={account} />
          <Text style={styles.bankAccountHeaderText}>{account.accountNickname}</Text>
        </TouchableOpacity>
      )
    }

    const title = selectedAccounts.length === accountGroups[selectedGroup].length
      ? t('bankAccount:allAccounts')
      : t('bankAccount:multiSelection')

    return (
      <TouchableOpacity
        style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter], commonStyles.rowReverse)}
        onPress={onOpenAccountsModal}
      >
        <Text style={styles.bankAccountHeaderText}>
          {title} {`(${getCurrencyChar(selectedGroup)})`}
        </Text>
      </TouchableOpacity>
    )
  }

  get accountsBalance () {
    const { selectedAccounts, hasData } = this.props

    if (!hasData) {return '-'}

    const total = selectedAccounts.reduce((memo, account) => {
      return memo + account.accountBalance
    }, 0)

    return `${numberFormat.format(Math.round(total))}`
  }

  componentDidMount () {
  }

    handleToggleEdit = (val) => {
      if (val === true || val === false) {
        this.setState({ isEdit: !val })
      } else {
        this.setState({ isEdit: !this.state.isEdit })
      }
    };

    handleChangeQuery = (query) => {
      const {
        searchQuery,
      } = this.props
      this.setState({ query })
      searchQuery(query)
    };

    handleSearch = () => {
      const {
        searchQuery,
      } = this.props
      const { query } = this.state
      this.setState({ isEdit: false })
      searchQuery(query)
    };
    filtersAll = (val) => () => {
      const {
        filtersAll,
      } = this.props
      filtersAll(val)
    };

    render () {
      const {
        isRtl,
        t,
        hasAlert,
        alertState,
        selectedDeviantAccounts,
        selectedNotUpdatedAccounts,
        scrollY,
        alertYPosition,
        headerScrollDistance,
        onSetAlertPosition,
        onSelectAccount,
        onToggleAlertDetails,
        onSetHeaderHeight,
        queryStatus,
        summary,
        currentCompanyId,
      } = this.props

      const { isEdit, query } = this.state

      const headerWrapperTranslate = scrollY.interpolate({
        inputRange: [0, headerScrollDistance],
        outputRange: [0, -headerScrollDistance],
        extrapolate: 'clamp',
      })

      const yFixed = 45

      const headerTranslate = scrollY.interpolate({
        inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance],
        outputRange: [0, 0, headerScrollDistance - yFixed],
        extrapolate: 'clamp',
      })

      const yAlertFixed = alertYPosition - (hasAlert ? 35 + HEADER_ALERT_BORDER_HEIGHT : 35) + (IS_IOS ? 3 : 1)

      const alertBorderTranslate = scrollY.interpolate({
        inputRange: [0, (headerScrollDistance && yAlertFixed > 0 && yAlertFixed < headerScrollDistance) ? yAlertFixed : 0, headerScrollDistance],
        outputRange: [0, 0, headerScrollDistance - yAlertFixed],
        extrapolate: 'clamp',
      })

      const firstImgOpacity = scrollY.interpolate({
        inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance, headerScrollDistance],
        outputRange: [0, 0, headerScrollDistance - yFixed, 0],
        extrapolate: 'clamp',
      })
      const avgExpense = (summary.monthlyExpense < 0 ? summary.monthlyExpense * -1 : summary.monthlyExpense)
      return (
        <Animated.View
          style={[styles.bankAccountHeaderAnimatedWrapper, { transform: [{ translateY: headerWrapperTranslate }] }]}
          pointerEvents="box-none"
          onLayout={onSetHeaderHeight}
        >
          <View style={styles.bankAccountHeaderBgWrapper} pointerEvents="box-none">
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                width: '100%',
                height: 162,
              }}>
              <Image style={styles.bankAccountHeaderBgWrapperImg}
                source={require('BiziboxUI/assets/bgCheckHeader.png')} />
            </View>

            <View style={[cs(!isRtl, commonStyles.row, commonStyles.rowReverse), {
              height: 32,
              alignItems: 'center',
              justifyContent: 'flex-end',
              alignSelf: 'center',
              alignContent: 'center',
              paddingVertical: 5,
              position: 'absolute',
              left: 22,
              right: 20,
              top: 10,
              zIndex: 2,
            }]}>
              <TouchableOpacity
                onPress={this.handleToggleEdit}>
                <View style={{
                  width: 21,
                  height: 21,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Image style={{ width: 21, height: 21 }}
                    source={require('BiziboxUI/assets/searchIcon.png')} />
                </View>
              </TouchableOpacity>
              <View style={commonStyles.spaceDividerDouble} />
              <EditableTextInput
                handleToggleIsEdit={this.handleToggleEdit}
                hideIcon
                isEditProp={isEdit}
                isEditable
                textInputStyle={{
                  flex: 1,
                  height: 24,
                  backgroundColor: colors.white,
                  borderWidth: 1,
                  borderColor: '#ddd',
                  fontSize: sp(17),
                  color: colors.blue5,
                  fontFamily: fonts.semiBold,
                  paddingVertical: 1,
                  paddingHorizontal: 5,
                }}
                textStyle={{
                  fontFamily: fonts.bold,
                  direction: 'ltr',
                  textAlign: 'right',
                }}
                value={query}
                onChangeText={this.handleChangeQuery}
                onSubmit={this.handleSearch}
              />
            </View>

            <Text style={styles.bankAccountTitle}>{t('mainMenu:cyclicTrans')}</Text>

            <Animated.View style={{ transform: [{ translateY: headerTranslate }], elevation: 5, zIndex: 5 }}>

              <Animated.View style={[styles.bankAccountHeaderShadowBg, { opacity: firstImgOpacity }]} />

              <View style={[styles.bankAccountHeaderWrapper, {
                // alignSelf: 'center',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
              }]}>
                {this.accountTitle}
              </View>
            </Animated.View>

            <View style={{
              paddingHorizontal: 20,
              flexGrow: 1,
              position: 'relative',
              marginTop: 0,
              height: 90,
              flexDirection: (isRtl) ? 'row-reverse' : 'row',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'space-around',
            }}>
              <View>
                <Text style={{
                  fontSize: sp(15),
                  color: '#022258',
                  textAlign: 'center',
                  fontFamily: fonts.regular,
                }}>{'ממוצע חודשי הכנסות'}</Text>
                <Text
                  style={{
                    color: '#229f88',
                    fontSize: sp(25),
                    textAlign: 'center',
                    fontFamily: fonts.semiBold,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {getFormattedValueArray(summary.monthlyIncome)[0]}
                </Text>
              </View>
              <View>
                <Text style={{
                  fontSize: sp(15),
                  color: '#022258',
                  textAlign: 'center',
                  fontFamily: fonts.regular,
                }}>{'ממוצע חודשי הוצאות'}</Text>
                <Text
                  style={{
                    color: '#fb4242',
                    fontSize: sp(25),
                    textAlign: 'center',
                    fontFamily: fonts.semiBold,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {getFormattedValueArray(avgExpense)[0]}
                </Text>
              </View>
            </View>

            <View style={{
              paddingHorizontal: 20,
              backgroundColor: '#022258',
              flexGrow: 1,
              position: 'relative',
              height: 50,
              flexDirection: (isRtl) ? 'row-reverse' : 'row',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
            }}>
              <TouchableOpacity
                onPress={this.filtersAll(false)}>
                <View
                  style={[{
                    alignSelf: 'center',
                    borderRadius: 8,
                    borderColor: 'transparent',
                    paddingHorizontal: 10,
                    paddingVertical: 0,
                    height: 31,
                  }, cs(queryStatus.expense === false, {}, {
                    backgroundColor: '#ffffff',
                  })]}>
                  <View>
                    <Text numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        {
                          fontSize: sp(16.5),
                          lineHeight: 30,
                          textAlign: 'center',
                          fontFamily: fonts.regular,
                        },
                        cs(queryStatus.expense === false, {
                          color: '#fff',
                        }, {
                          color: '#022258',
                        }),
                      ]}>
                      {'הכנסות'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.filtersAll(true)}>
                <View
                  style={[{
                    marginHorizontal: 20,
                    alignSelf: 'center',
                    borderRadius: 8,
                    borderColor: 'transparent',
                    paddingHorizontal: 10,
                    paddingVertical: 0,
                    height: 31,
                  }, cs(queryStatus.expense === true, {}, {
                    backgroundColor: '#ffffff',
                  })]}>
                  <View>
                    <Text numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        {
                          fontSize: sp(16.5),
                          lineHeight: 30,
                          textAlign: 'center',
                          fontFamily: fonts.regular,
                        },
                        cs(queryStatus.expense === true, {
                          color: '#fff',
                        }, {
                          color: '#022258',
                        }),
                      ]}>
                      {'הוצאות'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.filtersAll(null)}>
                <View
                  style={[{
                    alignSelf: 'center',
                    borderRadius: 8,
                    borderColor: 'transparent',
                    paddingHorizontal: 10,
                    height: 31,
                    paddingVertical: 0,
                  }, cs(queryStatus.expense === null, {}, {
                    backgroundColor: '#ffffff',
                  })]}>
                  <View>
                    <Text numberOfLines={1}
                      ellipsizeMode="tail"
                      style={[
                        {
                          fontSize: sp(16.5),
                          lineHeight: 30,
                          textAlign: 'center',
                          fontFamily: fonts.regular,
                        },
                        cs(queryStatus.expense === null, {
                          color: '#fff',
                        }, {
                          color: '#022258',
                        }),
                      ]}>
                      {'הכל'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>

            {hasAlert && (
              <Fragment>
                <Animated.View
                  style={[styles.alertBorder, { transform: [{ translateY: alertBorderTranslate }] }]} />

                <View onLayout={onSetAlertPosition}>
                  <AccountAlert
                    navigation={this.props.navigation}
                    currentCompanyId={currentCompanyId}
                    t={t}
                    isRtl={isRtl}
                    selectedDeviantAccounts={selectedDeviantAccounts}
                    selectedNotUpdatedAccounts={selectedNotUpdatedAccounts}
                    onSelectAccount={onSelectAccount}
                    onToggleAlertDetails={onToggleAlertDetails}
                    {...alertState}
                  />
                </View>
              </Fragment>
            )}

          </View>
        </Animated.View>
      )
    }
}
