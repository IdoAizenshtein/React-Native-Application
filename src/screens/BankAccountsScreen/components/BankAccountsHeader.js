import React, {Fragment, PureComponent} from 'react'
import {Animated, Keyboard, Text, TextInput, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import AppTimezone from '../../../utils/appTimezone'
import CustomIcon from 'src/components/Icons/Fontello'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import TextIcon from 'src/components/Icons/TextIcon'
import {colors, fonts} from 'src/styles/vars'
import {combineStyles as cs, getCurrencyChar, sp} from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles, {HEADER_DATA_ROW_HEIGHT} from '../BankAccountsStyles'
import {IS_IOS} from '../../../constants/common'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'

import DeviceInfo from 'react-native-device-info'
import {connect} from 'react-redux'


export const BUNDLE_ID = DeviceInfo.getBundleId()
@connect(state => ({
  searchkey: state.searchkey,
}))
@withTranslation()
export default class BankAccountsHeader extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: (props.isSearchOpenState) || false,
      query: props.queryStatus.query,
    }
  }

  get accountTitle () {
    const { selectedAccounts, selectedGroup, accountGroups, t, isRtl, onOpenAccountsModal } = this.props
    const { isEdit } = this.state

    const trimTitle = (title, currency) => {
      const newTitle = `${title} ${currency}`
      if (newTitle.length > 14) {return `${title.slice(0, 12)}... ${currency}`}
      return newTitle
    }

    if (!selectedAccounts.length) {
      return (
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter], commonStyles.rowReverse)}
          onPress={onOpenAccountsModal}
        >
          <CustomIcon
            name="plus"
            size={10}
            color={isEdit ? colors.blue32 : colors.white}
          />
          <View style={commonStyles.spaceDividerDouble} />
          <Text style={styles.bankAccountHeaderText}>{t('bankAccount:selectAccount')}</Text>
        </TouchableOpacity>
      )
    }

    const account = selectedAccounts[0]
    const currencySign = selectedGroup ? `(${getCurrencyChar(selectedGroup)})` : ''

    if (selectedAccounts.length === 1) {
      return (
        <TouchableOpacity
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter], commonStyles.rowReverse)}
          onPress={onOpenAccountsModal}
        >
          <AccountIcon account={account} />
          <Text style={[styles.bankAccountHeaderText, {
            color: isEdit ? colors.blue32 : colors.white,
          }]}>{trimTitle(account.accountNickname, currencySign)}</Text>
        </TouchableOpacity>
      )
    }

    const title = selectedAccounts.every(a => a._isUpdated) &&
    selectedAccounts.length === accountGroups[selectedGroup].filter(a => a._isUpdated).length
      ? t('bankAccount:allAccounts')
      : t('bankAccount:multiSelection')

    return (
      <TouchableOpacity
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter], commonStyles.rowReverse)}
        onPress={onOpenAccountsModal}
      >
        <TextIcon
          isRtl={isRtl}
          text={trimTitle(title, currencySign)}
          textStyle={[styles.bankAccountHeaderText, {
            color: isEdit ? colors.blue32 : colors.white,
          }]}
          iconName="wallet"
          iconSize={14}
          iconColor={isEdit ? colors.blue32 : colors.white}
        />
      </TouchableOpacity>
    )
  }

  handleToggleEdit = (val) => {
    setTimeout(() => {
      if (this.scrollViewTop && this.scrollViewTop._component) {
        if (this.props.isRtl) {
          this.scrollViewTop._component.scrollToEnd({ animated: true })
        } else {
          this.scrollViewTop._component.scrollTo({ animated: true, x: 0 })
        }
      }
    }, IS_IOS ? 10 : 100)
    if (val === true || val === false) {
      this.setState({ isEdit: !val })
    } else {
      this.setState({ isEdit: !this.state.isEdit })
      this.props.isSearchOpen(this.state.isEdit)
    }
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
  handleCloseKeyboard = () => {
    Keyboard.dismiss()
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
    this.setState({ query: '', isEdit: false })
    this.handleToggleEdit()
  }

  handleDeletePays = (f) => () => {
    setTimeout(() => {
      if (this.scrollViewTop && this.scrollViewTop._component) {
        if (this.props.isRtl) {
          this.scrollViewTop._component.scrollToEnd({ animated: true })
        } else {
          this.scrollViewTop._component.scrollTo({ animated: true, x: 0 })
        }
      }
    }, IS_IOS ? 10 : 100)
    this.props.handleDeletePays(f)()
  }
  handleDeleteCategory = (f) => () => {
    setTimeout(() => {
      if (this.scrollViewTop && this.scrollViewTop._component) {
        if (this.props.isRtl) {
          this.scrollViewTop._component.scrollToEnd({ animated: true })
        } else {
          this.scrollViewTop._component.scrollTo({ animated: true, x: 0 })
        }
      }
    }, IS_IOS ? 10 : 100)
    this.props.handleDeleteCategory(f)()
  }

  containerTouched = () => {
    if (BankAccountsHeader.listRef && BankAccountsHeader.listRef.blur) {
      BankAccountsHeader.listRef.blur()
    }
    return false
  }
  handleSetRef = (ref) => {
    BankAccountsHeader.listRef = ref
  }

  UNSAFE_componentWillReceiveProps (props) {
    if (this.scrollViewTop && this.scrollViewTop._component &&
      ((props.categoriesMatchCopy && (props.categoriesMatchCopy !== this.props.categoriesMatchCopy)) ||
        (props.payListCopy && (props.payListCopy !== this.props.payListCopy)))
    ) {
      setTimeout(() => {
        if (this.scrollViewTop && this.scrollViewTop._component) {
          if (this.props.isRtl) {
            this.scrollViewTop._component.scrollToEnd({ animated: true })
          } else {
            this.scrollViewTop._component.scrollTo({ animated: true, x: 0 })
          }
        }
      }, IS_IOS ? 10 : 100)
    }
  }

  render () {
    const {
      isRtl,
      t,
      hasData,
      hasAlert,
      dateTillTimestamp,
      dateFromTimestamp,
      headerScrollDistance,
      onToggleCalendar,
      screenSwitchState,
      onSetHeaderHeight,
      scrollAnim,
      handleModalTypes,
      categoriesMatchCopy,
      payListCopy,
      isDefDates,
    } = this.props
    const { isEdit, query } = this.state

    const tableHeaderWrapperStyles = cs(isRtl, [styles.dataRow, styles.dataRowHeader], commonStyles.rowReverse)

    const headerWrapperTranslate = scrollAnim.interpolate({
      inputRange: [0, headerScrollDistance],
      outputRange: [0, -headerScrollDistance +
      (!screenSwitchState
        ? (35 + (isEdit ? 47 + 40 : 0))
        : (35 + (isEdit ? 47 + 40 : 0))
      )],
      extrapolate: 'clamp',
    })

    const yFixed = 45 + (isEdit ? 45 : (screenSwitchState
      ? 0
      : 0
    ))

    const firstImgOpacity = scrollAnim.interpolate({
      inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance, headerScrollDistance],
      outputRange: [0, 0, headerScrollDistance - yFixed, 0],
      extrapolate: 'clamp',
    })

    const opacity = scrollAnim.interpolate({
      inputRange: [0, 272 - 1, 272],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    })

    const opacityTitles = scrollAnim.interpolate({
      inputRange: [0, (hasAlert) ? (360 - 1) : (330 - 1), hasAlert ? 360 : 330],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    })

    const titlesTranslate = scrollAnim.interpolate({
      inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance],
      outputRange: [0, 0, IS_IOS ? 32 : 34],
      extrapolate: 'clamp',
    })

    const titlesX = scrollAnim.interpolate({
      inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance],
      outputRange: [-25, 0, 0],
      extrapolate: 'clamp',
    })
    const opacityTitlesX = scrollAnim.interpolate({
      inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance],
      outputRange: [0, 0, 1],
      extrapolate: 'clamp',
    })
    const opacityTitlesXTop = scrollAnim.interpolate({
      inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance],
      outputRange: [1, 0, 0],
      extrapolate: 'clamp',
    })

    let textDates = AppTimezone.moment(dateFromTimestamp).format('DD/MM/YY') + ' - ' + AppTimezone.moment(dateTillTimestamp).format('DD/MM/YY')
    const todayIsDateTill = AppTimezone.moment().startOf('day').isSame(dateTillTimestamp)
    if (todayIsDateTill &&
      AppTimezone.moment(dateTillTimestamp).subtract(30, 'days').isSame(dateFromTimestamp)) {
      textDates = t('bankAccount:last30Days')
    } else if (todayIsDateTill &&
      AppTimezone.moment(dateTillTimestamp).subtract(60, 'days').isSame(dateFromTimestamp)) {
      textDates = t('bankAccount:last60Days')
    } else if (todayIsDateTill &&
      AppTimezone.moment(dateTillTimestamp).startOf('month').isSame(dateFromTimestamp)) {
      textDates = t('bankAccount:beginningOfTheMonth')
    } else if (AppTimezone.moment().startOf('month').subtract(1, 'month').isSame(dateTillTimestamp) &&
      AppTimezone.moment(dateTillTimestamp).subtract(1, 'month').isSame(dateFromTimestamp)) {
      textDates = t('bankAccount:monthEarlier')
    }

    if (isDefDates) {
      textDates = 'בחרו טווח תאריכים'
    }

    return (
      <View
        onStartShouldSetResponder={this.containerTouched}
        style={[styles.bankAccountHeaderAnimatedWrapper]}
        pointerEvents="box-none"
        onLayout={onSetHeaderHeight}
      >
        <Animated.View
          style={[{ transform: [{ translateY: headerWrapperTranslate }], zIndex: 99 }]}
          pointerEvents="box-none"
        >
          <View style={[styles.bankAccountHeaderBgWrapper, {
            backgroundColor: isEdit ? colors.white : colors.blue32,
          }]}>
            <View style={[cs(isRtl, commonStyles.row, commonStyles.rowReverse), {
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
                  ref={this.handleSetRef}
                  blurOnSubmit
                  onBlur={this.handleCloseKeyboard}
                  onEndEditing={this.handleCloseKeyboard}
                  autoFocus
                  style={[{
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

              <View style={commonStyles.spaceDividerDouble} />

              {!isEdit && (
                <Animated.View style={[{
                  opacity: opacityTitlesXTop,
                }]}>
                  <TouchableOpacity
                    onPress={this.handleToggleEdit}>
                    <Icons
                      name="magnify"
                      type="material-community"
                      size={25}
                      color={colors.white}
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

            <Text style={styles.bankAccountTitle}>{t('mainMenu:bankAccount')}</Text>

            <Animated.View style={{ elevation: 6, zIndex: 6 }}>

              <Animated.View style={[styles.bankAccountHeaderShadowBg, {
                opacity: firstImgOpacity,
                backgroundColor: isEdit ? colors.white : colors.blue32,
              }]} />

              <Animated.View style={[cs(isRtl, styles.bankAccountHeaderWrapper, commonStyles.rowReverse),
                cs(!isEdit, {
                  alignItems: 'flex-start',
                }, {
                  transform: [{ translateX: titlesX }],
                  alignItems: screenSwitchState ? 'flex-start' : 'center',
                }),
                {
                  backgroundColor: isEdit ? colors.white : colors.blue32,
                }]}>
                {this.accountTitle}

                <TouchableOpacity
                  style={[cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter], commonStyles.rowReverse)]}
                  onPress={onToggleCalendar}>
                  <Text style={[styles.bankAccountHeaderText, {
                    color: isEdit ? colors.blue32 : colors.white,
                  }]}>
                    {textDates}
                  </Text>
                  <View style={styles.dateDivider} />
                  <CustomIcon name="calendar" size={14}
                    color={isEdit ? colors.blue32 : colors.white} />
                </TouchableOpacity>

                {(!isEdit) && (
                  <Animated.View style={[{
                    opacity: opacityTitlesX,
                  }]}>
                    <TouchableOpacity
                      onPress={this.handleToggleEdit}>
                      <Icons
                        name="magnify"
                        type="material-community"
                        size={25}
                        color={colors.white}
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
                      onPress={handleModalTypes('payListModal')}
                    >
                      <Text style={{
                        color: '#022258',
                        fontSize: sp(14),
                        fontFamily: fonts.regular,
                      }}>
                        {'סוג תשלום'}
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
                    {categoriesMatchCopy.length > 0 && categoriesMatchCopy.map((f, i) => {
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
                    {payListCopy.length > 0 && payListCopy.map((f, i) => {
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
                          onPress={this.handleDeletePays(f)}
                        >
                          <Text style={{
                            color: '#ffffff',
                            fontSize: sp(14),
                            fontFamily: fonts.regular,
                          }}>
                            {this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === f.id) ? this.props.searchkey.find((it) => it.paymentDescription === f.id).name : ''}
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
                  style={[styles.alertBorder, {
                    transform: [{ translateY: 0 }],
                    opacity: opacity,
                  }]} />
              </Fragment>
            )}
          </View>
        </Animated.View>

        {(screenSwitchState && hasData) && (
          <Animated.View style={[styles.tableHeadWrapper, {
            transform: [{ translateY: titlesTranslate }],
            opacity: opacityTitles,
            top: 0,
            left: 0,
            zIndex: 9,
            right: 0,
            backgroundColor: colors.white,
            position: 'absolute',
            height: HEADER_DATA_ROW_HEIGHT,
            width: '100%',
            shadowColor: 'black',
            shadowOpacity: 0.1,
            shadowRadius: 0.5,
            shadowOffset: { width: 0, height: 2 },
            elevation: 4,
          }, styles.bankAccountHeaderShadowBgWhite]}>
            <View style={tableHeaderWrapperStyles}>
              <Text style={styles.tableHeadText}>{t('bankAccount:credit')}</Text>
              <Text style={styles.tableHeadText}>{t('bankAccount:debit')}</Text>
              <Text style={[styles.tableHeadText, { flex: 1, maxWidth: 90 }]}>{t('bankAccount:all')}</Text>
            </View>
          </Animated.View>
        )}
      </View>
    )
  }
}
