import React, {Fragment, PureComponent} from 'react'
import {Animated, Image, Text, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import CustomIcon from '../../../components/Icons/Fontello'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import {colors, fonts} from '../../../styles/vars'
import {combineStyles as cs, getCurrencyChar, sp} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../BankMatchStyles'
import {IS_IOS} from '../../../constants/common'
import EditableTextInput from '../../../components/FormInput/EditableTextInput'
// import CheckTitleMarks from './CheckTitleMarks'
import AppTimezone from '../../../utils/appTimezone'

// const DELAY = IS_IOS ? 150 : 400
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
    this.scrollToEnd()
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

    scrollToEnd () {
      if (this.props.isRtl) {
        setTimeout(() => {
          if (this.scrollView && this.scrollView._component) {
            this.scrollView._component.scrollToEnd({ animated: false })
          }
        }, 800)
      }
    }

    setCheckTitleMarks = (val) => () => {
      const {
        setCheckTitleMarks,
      } = this.props
      setCheckTitleMarks(val)
    };

    filtersAll = (val) => () => {
      const {
        filtersAll,
      } = this.props
      filtersAll(val)
    };

    handleSelectAccount = (val) => () => {
      const {
        handleSelectAccount,
      } = this.props
      handleSelectAccount(val)
    };

    render () {
      const {
        isRtl,
        t,
        scrollY,
        headerScrollDistance,
        onSetHeaderHeight,
        queryStatus,
        onToggleCalendar,
        adjustableMovementsScreen,
        dateTillTimestamp,
        dateFromTimestamp,
        accounts,
        selectedAccountIds,
        // adjustableMovementsWidth,
        // adjustedMovementsScreenWidth,
      } = this.props

      const {
        isEdit,
        query,

      } = this.state

      const headerWrapperTranslate = scrollY.interpolate({
        inputRange: [0, headerScrollDistance],
        outputRange: [0, -headerScrollDistance],
        extrapolate: 'clamp',
      })

      const yFixed = IS_IOS ? (100 - 60) : (100 - 60)

      const headerTranslate = scrollY.interpolate({
        inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance],
        outputRange: [0, 0, headerScrollDistance - yFixed],
        extrapolate: 'clamp',
      })
      // const firstImgOpacity = scrollY.interpolate({
      //   inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance, headerScrollDistance],
      //   outputRange: [0, 0, headerScrollDistance - yFixed, 0],
      //   extrapolate: 'clamp',
      // })

      return (
        <Animated.View
          style={[styles.bankAccountHeaderAnimatedWrapper, { transform: [{ translateY: headerWrapperTranslate }] }]}
          pointerEvents="box-none"
          onLayout={onSetHeaderHeight}
        >
          <View style={styles.bankAccountHeaderBgWrapper} pointerEvents="box-none">
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

            <Text style={styles.bankAccountTitle}>{t('mainMenu:bankMatch')}</Text>

            {/* <View */}
            {/* style={{ */}
            {/* flex: 1, */}
            {/* flexGrow: 1, */}
            {/* flexDirection: 'row', */}
            {/* marginTop: 20, */}
            {/* marginBottom: 12, */}
            {/* }}> */}
            {/* <View style={{ flex: 1 }}> */}
            {/* <TouchableOpacity onPress={this.setCheckTitleMarks(false)}> */}
            {/* <CheckTitleMarks text={'תנועות שהותאמו'} value={adjustedMovementsScreenWidth} delay={DELAY} /> */}
            {/* </TouchableOpacity> */}
            {/* </View> */}
            {/* <View style={{ flex: 1, transform: [{ scaleX: -1 }] }}> */}
            {/* <TouchableOpacity onPress={this.setCheckTitleMarks(true)}> */}
            {/* <CheckTitleMarks text={'תנועות להתאמה'} value={adjustableMovementsWidth} delay={DELAY} scaleX /> */}

            {/* </TouchableOpacity> */}
            {/* </View> */}
            {/* </View> */}

            {adjustableMovementsScreen ? (
              <Fragment>
                <Animated.View
                  style={{ transform: [{ translateY: headerTranslate }], elevation: 5, zIndex: 5 }}>
                  <Animated.ScrollView
                    horizontal
                    scrollEnabled
                    ref={scrollView => (this.scrollView = scrollView)}
                    scrollEventThrottle={16}
                    showsHorizontalScrollIndicator={false}
                    showsVerticalScrollIndicator={false}
                    pagingEnabled={false}
                    contentContainerStyle={{
                      height: 30,
                      flexDirection: (isRtl) ? 'row-reverse' : 'row',
                      alignSelf: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      justifyContent: 'center',
                    }}>
                    {accounts.map((c, i) => {
                      const isActive = ((c.companyAccountId === selectedAccountIds[0]))
                      return (
                        <View
                          key={i}
                          style={{
                            width: 'auto',
                            height: 30,
                            paddingHorizontal: 2,
                            paddingVertical: 0,
                            flex: 1,
                            alignSelf: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                            flexDirection: (isRtl) ? 'row-reverse' : 'row',
                          }}>
                          <TouchableOpacity
                            onPress={this.handleSelectAccount(c.companyAccountId)}>
                            <View
                              style={[{
                                alignItems: 'center',
                                alignContent: 'flex-start',
                                justifyContent: 'flex-start',
                                alignSelf: 'center',
                                flexDirection: 'column',
                                flex: 1,
                                paddingHorizontal: 5,
                                paddingVertical: 0,
                                borderBottomWidth: 4,
                                borderBottomColor: 'transparent',
                              }, cs(isActive, {}, {
                                borderBottomWidth: 4,
                                borderBottomColor: '#08d3b8',
                              })]}>

                              {/* {IS_IOS && ( */}
                              {/* <View style={[{ */}
                              {/* borderWidth: 1, */}
                              {/* borderTopWidth: 1, */}
                              {/* borderBottomWidth: 1, */}
                              {/* borderRightWidth: 1, */}
                              {/* borderLeftWidth: 1, */}
                              {/* borderBottomLeftRadius: 10, */}
                              {/* borderBottomRightRadius: 10, */}
                              {/* borderTopLeftRadius: 0, */}
                              {/* borderTopRightRadius: 10, */}
                              {/* marginBottom: 3.5, */}
                              {/* width: 20, */}
                              {/* height: 20, */}
                              {/* transform: [{ rotate: '-135deg' }], */}
                              {/* }, cs(isActive, { */}
                              {/* borderColor: '#71757c', */}
                              {/* }, { */}
                              {/* borderColor: '#022156', */}
                              {/* })]}> */}
                              {/* <View style={{ */}
                              {/* flexDirection: 'row', */}
                              {/* alignSelf: 'center', */}
                              {/* alignItems: 'center', */}
                              {/* alignContent: 'center', */}
                              {/* justifyContent: 'center', */}
                              {/* transform: [{ rotate: '135deg' }], */}
                              {/* }}> */}
                              {/* <Text numberOfLines={1} */}
                              {/* ellipsizeMode='tail' */}
                              {/* style={[ */}
                              {/* { */}
                              {/* fontSize: sp(12), */}
                              {/* lineHeight: 18, */}
                              {/* textAlign: 'center', */}
                              {/* fontFamily: fonts.regular, */}
                              {/* }, */}
                              {/* cs(isActive, { */}
                              {/* color: '#71757c', */}
                              {/* }, { */}
                              {/* color: '#022156', */}
                              {/* }), */}
                              {/* ]}> */}
                              {/* {(c.countNigrarot)} */}
                              {/* </Text> */}
                              {/* </View> */}
                              {/* </View> */}
                              {/* )} */}
                              {/* {!IS_IOS && ( */}
                              {/* <View style={[{ */}
                              {/* marginBottom: 3.5, */}
                              {/* width: 20, */}
                              {/* height: 20, */}
                              {/* }]}> */}
                              {/* <View style={{ */}
                              {/* flexDirection: 'row', */}
                              {/* alignSelf: 'center', */}
                              {/* alignItems: 'center', */}
                              {/* alignContent: 'center', */}
                              {/* justifyContent: 'center', */}
                              {/* }}> */}
                              {/* <View style={{ */}
                              {/* position: 'absolute', */}
                              {/* left: -7, */}
                              {/* top: 0, */}
                              {/* zIndex: 1, */}
                              {/* }}> */}
                              {/* <Icon */}
                              {/* iconStyle={{ */}
                              {/* transform: [{ rotate: '180deg' }], */}
                              {/* }} */}
                              {/* name='drop' */}
                              {/* type='simple-line-icon' */}
                              {/* size={25} */}
                              {/* color={(isActive) ? '#022156' : '#71757c'} */}
                              {/* /> */}
                              {/* </View> */}
                              {/* <View style={{ */}
                              {/* position: 'absolute', */}
                              {/* left: -6, */}
                              {/* top: 4, */}
                              {/* zIndex: 2, */}
                              {/* width: 23, */}
                              {/* height: 23, */}
                              {/* }}> */}
                              {/* <Text numberOfLines={1} */}
                              {/* ellipsizeMode='tail' */}
                              {/* style={[ */}
                              {/* { */}
                              {/* fontSize: sp(10), */}
                              {/* textAlign: 'center', */}
                              {/* fontFamily: fonts.regular, */}
                              {/* }, */}
                              {/* cs(isActive, { */}
                              {/* color: '#71757c', */}
                              {/* }, { */}
                              {/* color: '#022156', */}
                              {/* }), */}
                              {/* ]}> */}
                              {/* {(c.countNigrarot)} */}
                              {/* </Text> */}
                              {/* </View> */}

                              {/* </View> */}
                              {/* </View> */}
                              {/* )} */}

                              <View
                                style={{
                                  flexDirection: 'row-reverse',
                                  alignSelf: 'center',
                                  alignItems: 'center',
                                  alignContent: 'center',
                                  justifyContent: 'center',
                                }}
                                numberOfLines={1}
                                ellipsizeMode="tail">
                                <AccountIcon account={c} />
                                <Text
                                  style={[{
                                    fontSize: sp(16),
                                    fontFamily: fonts.regular,
                                  },
                                  cs(isActive, {
                                    color: '#71757c',
                                  }, {
                                    color: '#022156',
                                  })]}>{(c.currency !== 'ILS') ? `(${getCurrencyChar(c.currency)})` : ''} {c.bankAccountId}</Text>
                                <Text numberOfLines={1}
                                  ellipsizeMode="tail"
                                  style={[
                                    {
                                      marginHorizontal: 2,
                                      width: 20,
                                      height: 20,
                                      borderWidth: 1,
                                      borderColor: isActive ? '#022156' : '#71757c',
                                      borderRadius: 10,
                                      fontSize: sp(12),
                                      lineHeight: 16,
                                      textAlign: 'center',
                                      fontFamily: fonts.regular,
                                    },
                                    cs(isActive, {
                                      color: '#71757c',
                                    }, {
                                      color: '#022156',
                                    }),
                                  ]}>
                                  {(c.countNigrarot)}
                                </Text>
                              </View>
                            </View>
                          </TouchableOpacity>
                        </View>
                      )
                    })}
                  </Animated.ScrollView>
                </Animated.View>

              </Fragment>
            ) : (
              <Fragment>
                <Animated.View
                  style={{ transform: [{ translateY: headerTranslate }], elevation: 5, zIndex: 5 }}>

                  <View style={cs(isRtl, styles.bankAccountHeaderWrapper, commonStyles.rowReverse)}>

                    {this.accountTitle}

                    <TouchableOpacity
                      style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter], commonStyles.rowReverse)}
                      onPress={onToggleCalendar}
                    >
                      {dateFromTimestamp && dateTillTimestamp && (
                        <Text style={styles.bankAccountHeaderText}>
                          {AppTimezone.moment(dateFromTimestamp).format('M/YYYY')} - {AppTimezone.moment(dateTillTimestamp).format('M/YYYY')}
                        </Text>
                      )}
                      {!dateFromTimestamp && !dateTillTimestamp && (
                        <Text style={styles.bankAccountHeaderText}>
                          {t('checks:notRepaid')}
                        </Text>
                      )}
                      <View style={styles.dateDivider} />
                      <CustomIcon name="calendar" size={14} color={colors.blue32} />
                    </TouchableOpacity>
                  </View>
                </Animated.View>

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
                          {'מערכת'}
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
                          {'ידני'}
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
              </Fragment>
            )}

          </View>
        </Animated.View>
      )
    }
}
