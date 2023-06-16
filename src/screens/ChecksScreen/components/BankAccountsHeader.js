import React, { Fragment, PureComponent } from 'react'
import {
  Animated,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { withTranslation } from 'react-i18next'
import AppTimezone from '../../../utils/appTimezone'
import CustomIcon from '../../../components/Icons/Fontello'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import { colors, fonts } from '../../../styles/vars'
import { combineStyles as cs, getCurrencyChar, sp } from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../ChecksStyles'
// import { IS_IOS } from '../../../constants/common'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'

import DeviceInfo from 'react-native-device-info'
import { IS_IOS } from '../../../constants/common'

export const BUNDLE_ID = DeviceInfo.getBundleId()

const numberFormat = new Intl.NumberFormat('he')
// const DELAY = IS_IOS ? 200 : 0

@withTranslation()
export default class BankAccountsHeader extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: (props.isSearchOpenState) || false,
      query: props.querySearch,
    }
  }

  get accountTitle () {
    const { selectedAccounts, selectedGroup, accountGroups, t, isRtl, onOpenAccountsModal } = this.props

    if (!selectedAccounts.length) {
      return (
        <TouchableOpacity
          style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter],
            commonStyles.rowReverse)}
          onPress={onOpenAccountsModal}
        >
          <CustomIcon
            name="plus"
            size={10}
            color={colors.blue7}
          />
          <View style={commonStyles.spaceDividerDouble}/>
          <Text style={styles.bankAccountHeaderText}>{t(
            'bankAccount:selectAccount')}</Text>
        </TouchableOpacity>
      )
    }

    const account = selectedAccounts[0]

    if (selectedAccounts.length === 1) {
      return (
        <TouchableOpacity
          style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter],
            commonStyles.rowReverse)}
          onPress={onOpenAccountsModal}
        >
          <AccountIcon account={account}/>
          <Text
            style={styles.bankAccountHeaderText}>{account.accountNickname}</Text>
        </TouchableOpacity>
      )
    }

    const title = selectedAccounts.length ===
    accountGroups[selectedGroup].length
      ? t('bankAccount:allAccounts')
      : t('bankAccount:multiSelection')

    return (
      <TouchableOpacity
        style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter],
          commonStyles.rowReverse)}
        onPress={onOpenAccountsModal}
      >
        <CustomIcon
          name="wallet"
          size={12}
          color={colors.blue7}
        />
        <View style={commonStyles.spaceDividerDouble}/>
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

  handleToggleEdit = (val, filter) => {
    setTimeout(() => {
      if (this.scrollViewTop && this.scrollViewTop._component) {
        if (this.props.isRtl) {
          this.scrollViewTop._component.scrollToEnd({ animated: true })
        } else {
          this.scrollViewTop._component.scrollTo({
            animated: true,
            x: 0,
          })
        }
      }
    }, IS_IOS ? 10 : 100)
    if (val === true || val === false) {
      this.setState({ isEdit: !val })
    } else {
      this.setState({ isEdit: !this.state.isEdit })
      this.props.isSearchOpen(this.state.isEdit, filter)
    }
  }
  handleDeleteStatus = (f) => () => {
    setTimeout(() => {
      if (this.scrollViewTop && this.scrollViewTop._component) {
        if (this.props.isRtl) {
          this.scrollViewTop._component.scrollToEnd({ animated: true })
        } else {
          this.scrollViewTop._component.scrollTo({
            animated: true,
            x: 0,
          })
        }
      }
    }, IS_IOS ? 10 : 100)
    this.props.handleDeleteStatus(f)()
  }
  handleDeleteProgramName = (f) => () => {
    setTimeout(() => {
      if (this.scrollViewTop && this.scrollViewTop._component) {
        if (this.props.isRtl) {
          this.scrollViewTop._component.scrollToEnd({ animated: true })
        } else {
          this.scrollViewTop._component.scrollTo({
            animated: true,
            x: 0,
          })
        }
      }
    }, IS_IOS ? 10 : 100)
    this.props.handleDeleteProgramName(f)()
  }
  handleDeleteCategory = (f) => () => {
    setTimeout(() => {
      if (this.scrollViewTop && this.scrollViewTop._component) {
        if (this.props.isRtl) {
          this.scrollViewTop._component.scrollToEnd({ animated: true })
        } else {
          this.scrollViewTop._component.scrollTo({
            animated: true,
            x: 0,
          })
        }
      }
    }, IS_IOS ? 10 : 100)
    this.props.handleDeleteCategory(f)()
  }
  handleChangeQuery = (query) => {
    const {
      searchQuery,
    } = this.props
    this.setState({ query })
    if (query.length !== 1) {
      searchQuery(query)
    }
  }

  handleSearch = () => {
    const {
      searchQuery,
    } = this.props
    const { query } = this.state
    this.setState({ query })
    if (!query || (query && query.length !== 1)) {
      searchQuery(query)
    }
  }

  handleSearchClose = () => {
    this.setState({
      query: '',
      isEdit: false,
    })
    this.handleToggleEdit('', true)
  }
  handleCloseKeyboard = () => {
    Keyboard.dismiss()
  }

  UNSAFE_componentWillReceiveProps (props) {
    if (this.scrollViewTop && this.scrollViewTop._component &&
      ((props.categoriesMatchArr &&
        (props.categoriesMatchArr !== this.props.categoriesMatchArr)) ||
        (props.statusListArr &&
          (props.statusListArr !== this.props.statusListArr)) ||
        (props.programNameListArr &&
          (props.programNameListArr !== this.props.programNameListArr)))
    ) {
      setTimeout(() => {
        if (this.scrollViewTop && this.scrollViewTop._component) {
          if (this.props.isRtl) {
            this.scrollViewTop._component.scrollToEnd({ animated: true })
          } else {
            this.scrollViewTop._component.scrollTo({
              animated: true,
              x: 0,
            })
          }
        }
      }, IS_IOS ? 10 : 100)
    }
  }

  render () {
    const {
      isRtl,
      t,
      hasAlert,

      dateTillTimestamp,
      dateFromTimestamp,
      scrollAnim,

      // alertYPosition,
      // onSetAlertPosition,
      // onSelectAccount,
      // onToggleAlertDetails,
      // winWidth,
      // statusTotals,
      // changeScreenModeInProgress,
      // getNameOfStatus,
      // queryStatus,
      // selectedAccounts,
      // sizeFontStatusTotals,
      // widthIncome,
      // widthOut,
      // currentCompanyId,
      // alertState,
      // selectedDeviantAccounts,
      // selectedNotUpdatedAccounts,

      headerScrollDistance,
      onToggleCalendar,
      onSetHeaderHeight,
      handleModalTypes,
      // handleDeleteStatus,
      // handleDeleteProgramName,
      // handleDeleteCategory,
      statusListArr,
      programNameListArr,
      categoriesMatchArr,
      isDefDates,
    } = this.props

    const { isEdit, query } = this.state
    const headerWrapperTranslate = scrollAnim.interpolate({
      inputRange: [0, headerScrollDistance],
      outputRange: [0, -headerScrollDistance + (35 + (isEdit ? 47 + 40 : 0))],
      extrapolate: 'clamp',
    })

    const yFixed = 45 + (isEdit ? 45 : 0)
    const firstImgOpacity = scrollAnim.interpolate({
      inputRange: [
        0,
        (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0,
        headerScrollDistance,
        headerScrollDistance],
      outputRange: [0, 0, headerScrollDistance - yFixed, 0],
      extrapolate: 'clamp',
    })

    const opacity = scrollAnim.interpolate({
      inputRange: [0, 272 - 1, 272],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    })
    const titlesX = scrollAnim.interpolate({
      inputRange: [
        0,
        (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0,
        headerScrollDistance],
      outputRange: [-25, 0, 0],
      extrapolate: 'clamp',
    })
    const opacityTitlesX = scrollAnim.interpolate({
      inputRange: [
        0,
        (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0,
        headerScrollDistance + 50],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    })
    const opacityTitlesXTop = scrollAnim.interpolate({
      inputRange: [
        0,
        (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0,
        headerScrollDistance],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp',
    })

    return (
      <View
        style={[styles.bankAccountHeaderAnimatedWrapper, {}]}
        pointerEvents="box-none"
        onLayout={onSetHeaderHeight}
      >
        <Animated.View
          style={[
            {
              transform: [{ translateY: headerWrapperTranslate }],
              zIndex: 99,
            }]}
          pointerEvents="box-none"
        >
          <View style={[
            styles.bankAccountHeaderBgWrapper, {
              backgroundColor: colors.white,
            }]}>
            <View style={[
              cs(isRtl, commonStyles.row, commonStyles.rowReverse), {
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
              {isEdit && (
                <TextInput
                  blurOnSubmit
                  onBlur={this.handleCloseKeyboard}
                  onEndEditing={this.handleCloseKeyboard}
                  autoFocus
                  style={[
                    {
                      direction: 'ltr',
                      textAlign: 'right',
                      flex: 1,
                      height: 27.5,
                      backgroundColor: '#ededed',
                      borderRadius: 6,
                      fontSize: sp(14),
                      color: colors.blue32,
                      fontFamily: fonts.regular,
                      paddingVertical: 1,
                      paddingHorizontal: 5,
                    }]}
                  placeholder={'הקלידו טקסט לחיפוש'}
                  placeholderTextColor={'#88909e'}
                  value={query}
                  multiline={false}
                  onChangeText={this.handleChangeQuery}
                  onSubmitEditing={this.handleSearch}
                  underlineColorAndroid="rgba(0,0,0,0)"
                />
              )}
              <View style={commonStyles.spaceDividerDouble}/>

              {!isEdit && (
                <Animated.View style={[
                  {
                    opacity: opacityTitlesXTop,
                  }]}>
                  <TouchableOpacity
                    onPress={this.handleToggleEdit}>
                    <Icons
                      name="magnify"
                      type="material-community"
                      size={25}
                      color={colors.blue32}
                    />
                  </TouchableOpacity></Animated.View>)}
              {isEdit && (
                <TouchableOpacity
                  onPress={this.handleSearchClose}>
                  <Text style={{
                    color: '#2aa1d9',
                    fontSize: sp(15),
                    fontFamily: fonts.regular,
                  }}>{'ביטול'}</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.bankAccountTitle}>{t('mainMenu:checks')}</Text>

            <Animated.View style={{
              elevation: 6,
              zIndex: 6,
            }}>

              <Animated.View style={[
                styles.bankAccountHeaderShadowBg, {
                  opacity: firstImgOpacity,
                  backgroundColor: colors.white,
                }]}/>

              <Animated.View style={[
                cs(isRtl, styles.bankAccountHeaderWrapper,
                  commonStyles.rowReverse),
                cs(!isEdit, {
                  alignItems: 'flex-start',
                }, {
                  transform: [{ translateX: titlesX }],
                  alignItems: 'center',
                }),
                {
                  backgroundColor: colors.white,
                }]}>
                {this.accountTitle}

                <TouchableOpacity
                  style={[
                    cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter],
                      commonStyles.rowReverse)]}
                  onPress={onToggleCalendar}>

                  {!isDefDates && dateFromTimestamp && dateTillTimestamp &&
                  AppTimezone.moment()
                    .startOf('month')
                    .isSame(dateFromTimestamp, 'day') && (
                    <Text style={[
                      styles.bankAccountHeaderText, {
                        color: colors.blue32,
                      }]}>{t('bankAccount:lastMonthDays')}</Text>
                  )}
                  {!isDefDates && dateFromTimestamp && dateTillTimestamp &&
                  (AppTimezone.moment(dateTillTimestamp)
                    .subtract(2, 'month')
                    .isSame(dateFromTimestamp, 'day')) && (
                    <Text style={[
                      styles.bankAccountHeaderText, {
                        color: colors.blue32,
                      }]}>{t('bankAccount:lastTwoMonthsDays')}</Text>
                  )}
                  {!isDefDates && dateFromTimestamp && dateTillTimestamp &&
                  AppTimezone.moment(dateTillTimestamp)
                    .subtract(3, 'month')
                    .isSame(dateFromTimestamp, 'day') && (
                    <Text style={[
                      styles.bankAccountHeaderText, {
                        color: colors.blue32,
                      }]}>{t('bankAccount:lastThreeMonthsDays')}</Text>
                  )}

                  {!isDefDates && dateFromTimestamp && dateTillTimestamp &&
                  !AppTimezone.moment()
                    .startOf('month')
                    .isSame(dateFromTimestamp, 'day') &&
                  !AppTimezone.moment(dateTillTimestamp)
                    .subtract(2, 'month')
                    .isSame(dateFromTimestamp, 'day') &&
                  !AppTimezone.moment(dateTillTimestamp)
                    .subtract(3, 'month')
                    .isSame(dateFromTimestamp, 'day') && (
                    <Text style={[
                      styles.bankAccountHeaderText, {
                        color: colors.blue32,
                      }]}>{AppTimezone.moment(dateFromTimestamp)
                      .format('DD/MM/YY')} - {AppTimezone.moment(
                      dateTillTimestamp).format('DD/MM/YY')}</Text>
                  )}

                  {!isDefDates && !dateFromTimestamp && !dateTillTimestamp && (
                    <Text style={[
                      styles.bankAccountHeaderText, {
                        color: colors.blue32,
                      }]}>
                      {t('checks:notRepaid')}
                    </Text>
                  )}

                  {isDefDates && (
                    <Text style={[
                      styles.bankAccountHeaderText, {
                        color: colors.blue32,
                      }]}>{'בחרו טווח תאריכים'}</Text>
                  )}
                  <View style={styles.dateDivider}/>
                  <CustomIcon name="calendar" size={14}
                              color={colors.blue32}/>
                </TouchableOpacity>

                {(!isEdit) && (
                  <Animated.View style={[
                    {
                      opacity: opacityTitlesX,
                    }]}>
                    <TouchableOpacity
                      onPress={this.handleToggleEdit}>
                      <Icons
                        name="magnify"
                        type="material-community"
                        size={25}
                        color={colors.blue32}
                      />
                    </TouchableOpacity>
                  </Animated.View>
                )}
              </Animated.View>

              {(isEdit) && (
                <View style={{
                  flex: 1,
                  borderTopColor: '#6b6b6c',
                  borderTopWidth: 1,
                  borderBottomColor: '#6b6b6c',
                  borderBottomWidth: 1,
                }}>
                  <Animated.ScrollView
                    ref={scrollViewTop => (this.scrollViewTop = scrollViewTop)}
                    showsHorizontalScrollIndicator={false}
                    horizontal
                    contentContainerStyle={{
                      flexGrow: 1,
                      flexDirection: 'row-reverse',
                      alignSelf: 'flex-start',
                      zIndex: 999,
                      alignItems: 'flex-start',
                      alignContent: 'flex-start',
                      justifyContent: 'flex-start',
                      height: 40,
                      overflow: 'hidden',
                    }}
                  >
                    <TouchableOpacity
                      style={{
                        height: 24,
                        backgroundColor: '#e7e7e7',
                        borderRadius: 12,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        paddingHorizontal: 8,
                        marginHorizontal: 5,
                      }}
                      onPress={handleModalTypes('categoriesMatchModal')}
                    >
                      <Text style={{
                        color: '#022258',
                        fontSize: sp(14),
                        fontFamily: fonts.regular,
                      }}>
                        {'קטגוריה'}
                      </Text>
                      <View style={{
                        marginTop: 2,
                      }}>
                        <Icons
                          name="chevron-down"
                          type="material-community"
                          size={16}
                          color={'#022258'}
                        />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        height: 24,
                        backgroundColor: '#e7e7e7',
                        borderRadius: 12,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        paddingHorizontal: 8,
                        marginHorizontal: 5,
                      }}
                      onPress={handleModalTypes('statusListModal')}
                    >
                      <Text style={{
                        color: '#022258',
                        fontSize: sp(14),
                        fontFamily: fonts.regular,
                      }}>
                        {'סטטוס צ׳ק'}
                      </Text>
                      <View style={{
                        marginTop: 2,
                      }}>
                        <Icons
                          name="chevron-down"
                          type="material-community"
                          size={16}
                          color={'#022258'}
                        />
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        height: 24,
                        backgroundColor: '#e7e7e7',
                        borderRadius: 12,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        paddingHorizontal: 8,
                        marginHorizontal: 5,
                      }}
                      onPress={handleModalTypes('programNameListModal')}
                    >
                      <Text style={{
                        color: '#022258',
                        fontSize: sp(14),
                        fontFamily: fonts.regular,
                      }}>
                        {'מקור הצ׳ק'}
                      </Text>
                      <View style={{
                        marginTop: 2,
                      }}>
                        <Icons
                          name="chevron-down"
                          type="material-community"
                          size={16}
                          color={'#022258'}
                        />
                      </View>
                    </TouchableOpacity>
                    {categoriesMatchArr.length > 0 &&
                    categoriesMatchArr.map((f, i) => {
                      return (
                        <TouchableOpacity
                          key={i.toString()}
                          style={{
                            height: 24,
                            backgroundColor: '#022258',
                            borderRadius: 12,
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            paddingHorizontal: 8,
                            marginHorizontal: 5,
                          }}
                          onPress={this.handleDeleteCategory(f)}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: sp(14),
                            fontFamily: fonts.regular,
                          }}>
                            {f.transTypeName}
                          </Text>
                          <View style={{
                            marginTop: 2,
                            marginRight: 3,
                          }}>
                            <Icons
                              name="close"
                              type="material-community"
                              size={14}
                              color={'#ffffff'}
                            />
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                    {statusListArr.length > 0 && statusListArr.map((f, i) => {
                      return (
                        <TouchableOpacity
                          key={i.toString()}
                          style={{
                            height: 24,
                            backgroundColor: '#022258',
                            borderRadius: 12,
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            paddingHorizontal: 8,
                            marginHorizontal: 5,
                          }}
                          onPress={this.handleDeleteStatus(f)}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: sp(14),
                            fontFamily: fonts.regular,
                          }}>
                            {f.text}
                          </Text>
                          <View style={{
                            marginTop: 2,
                            marginRight: 3,
                          }}>
                            <Icons
                              name="close"
                              type="material-community"
                              size={14}
                              color={'#ffffff'}
                            />
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                    {programNameListArr.length > 0 &&
                    programNameListArr.map((f, i) => {
                      return (
                        <TouchableOpacity
                          key={i.toString()}
                          style={{
                            height: 24,
                            backgroundColor: '#022258',
                            borderRadius: 12,
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            paddingHorizontal: 8,
                            marginHorizontal: 5,
                          }}
                          onPress={this.handleDeleteProgramName(f)}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: sp(14),
                            fontFamily: fonts.regular,
                          }}>
                            {f.id}
                          </Text>
                          <View style={{
                            marginTop: 2,
                            marginRight: 3,
                          }}>
                            <Icons
                              name="close"
                              type="material-community"
                              size={14}
                              color={'#ffffff'}
                            />
                          </View>
                        </TouchableOpacity>
                      )
                    })}
                  </Animated.ScrollView>
                </View>
              )}
            </Animated.View>

            {hasAlert && (
              <Fragment>
                <Animated.View
                  style={[
                    styles.alertBorder, {
                      transform: [{ translateY: 0 }],
                      opacity: opacity,
                    }]}/>
              </Fragment>
            )}
          </View>
        </Animated.View>
      </View>
    )
  }
}
