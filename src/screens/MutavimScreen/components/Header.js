import React, { PureComponent } from 'react'
import {
  Animated,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { withTranslation } from 'react-i18next'
import CustomIcon from 'src/components/Icons/Fontello'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import TextIcon from 'src/components/Icons/TextIcon'
import { colors, fonts } from 'src/styles/vars'
import { combineStyles as cs, getCurrencyChar, sp } from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles, { HEADER_DATA_ROW_HEIGHT } from '../MutavimStyles'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'

import DeviceInfo from 'react-native-device-info'
import { connect } from 'react-redux'

import * as Animatable from 'react-native-animatable'

const AnimatableIcon = Animatable.createAnimatableComponent(Icons)
const AnimatableCustomIcon = Animatable.createAnimatableComponent(CustomIcon)

export const BUNDLE_ID = DeviceInfo.getBundleId()
@connect(state => ({
  searchkey: state.searchkey,
}))
@withTranslation()
export default class Header extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isEdit: (props.isSearchOpenState) || false,
      query: props.queryStatus.query,
    }
  }

  get accountTitle () {
    const { selectedAccounts, selectedGroup, accountGroups, t, isRtl, onOpenAccountsModal, offsetY, headerScrollDistance } = this.props
    const { isEdit } = this.state
    const headerColor = offsetY.interpolate({
      inputRange: [0, headerScrollDistance],
      outputRange: [colors.blue32, colors.white],
    })
    const animateColor = {
      color: !isEdit ? headerColor : colors.blue32,
    }
    const trimTitle = (title, currency) => {
      const newTitle = `${title} ${currency}`
      if (newTitle.length > 14) {return `${title.slice(0, 12)}... ${currency}`}
      return newTitle
    }

    if (!selectedAccounts.length) {
      return (
        <TouchableOpacity
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter],
            commonStyles.rowReverse)}
          onPress={onOpenAccountsModal}
        >
          <AnimatableCustomIcon name="plus" size={10} style={animateColor}/>
          <View style={commonStyles.spaceDividerDouble}/>
          <Animated.Text
            style={[styles.bankAccountHeaderText, animateColor]}>{t(
            'bankAccount:selectAccount')}</Animated.Text>
        </TouchableOpacity>
      )
    }

    const account = selectedAccounts[0]
    const currencySign = selectedGroup
      ? `(${getCurrencyChar(selectedGroup)})`
      : ''

    if (selectedAccounts.length === 1) {
      return (
        <TouchableOpacity
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 10,
            right: 10,
          }}
          style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter],
            commonStyles.rowReverse)}
          onPress={onOpenAccountsModal}
        >
          <AccountIcon account={account}/>
          <Animated.Text
            style={[styles.bankAccountHeaderText, animateColor]}>{trimTitle(
            account.accountNickname, currencySign)}</Animated.Text>
        </TouchableOpacity>
      )
    }

    const title = selectedAccounts.every(a => a._isUpdated) &&
    selectedAccounts.length ===
    accountGroups[selectedGroup].filter(a => a._isUpdated).length
      ? t('bankAccount:allAccounts')
      : t('bankAccount:multiSelection')

    return (
      <TouchableOpacity
        hitSlop={{
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        }}
        style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter],
          commonStyles.rowReverse)}
        onPress={onOpenAccountsModal}
      >
        <TextIcon
          isAnimate={!isEdit}
          isRtl={isRtl}
          text={trimTitle(title, currencySign)}
          textStyle={[styles.bankAccountHeaderText, animateColor]}
          iconName="wallet"
          iconSize={14}
          iconColor={animateColor}
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
          this.scrollViewTop._component.scrollTo({
            animated: true,
            x: 0,
          })
        }
      }
    }, 10)
    if (val === true || val === false) {
      this.setState({ isEdit: !val })
    } else {
      const isEdit = this.state.isEdit
      this.props.isSearchOpen(isEdit)
      this.setState({ isEdit: !isEdit })
    }
    setTimeout(() => {
      this.props.setDefaultScrollPosition()
    }, 20)
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
    this.setState({
      query: '',
      isEdit: false,
    })
    this.handleToggleEdit()
  }

  handleDeletePays = (f) => () => {
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
    }, 10)
    this.props.handleDeletePays(f)()
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
    }, 10)
    this.props.handleDeleteCategory(f)()
  }

  containerTouched = () => {
    if (Header.listRef && Header.listRef.blur) {
      Header.listRef.blur()
    }
    return false
  }
  handleSetRef = (ref) => {
    Header.listRef = ref
  }
  filtersAll = (val) => () => {
    const {
      filtersAll,
    } = this.props
    filtersAll(true, val)
  }

  render () {
    const {
      isRtl,
      t,
      headerScrollDistance,
      onSetHeaderHeight,
      scrollAnim,
      handleModalTypes,
      queryStatus,
      categoriesMatchCopy,
      offsetY,
      notHasData,
    } = this.props
    const { isEdit, query } = this.state

    const headerWrapperTranslate = scrollAnim.interpolate({
      inputRange: [0, 5, headerScrollDistance],
      outputRange: [
        0,
        0,
        -headerScrollDistance + (isEdit ? headerScrollDistance : 85)],
      extrapolate: 'clamp',
    })

    const yFixed = 45

    const headerTranslate = scrollAnim.interpolate({
      inputRange: [
        0,
        (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0,
        headerScrollDistance],
      outputRange: [0, 0, headerScrollDistance - yFixed - 85],
      extrapolate: 'clamp',
    })

    const headerWrapperTranslateColor = offsetY.interpolate({
      inputRange: [0, headerScrollDistance, headerScrollDistance],
      outputRange: [colors.white, colors.blue32, colors.blue32],
      extrapolate: 'clamp',
    })
    const animateBgColor = {
      backgroundColor: headerWrapperTranslateColor,
    }
    const headerColor = offsetY.interpolate({
      inputRange: [0, headerScrollDistance],
      outputRange: [colors.blue32, colors.white],
      extrapolate: 'clamp',
    })
    const animateColor = {
      color: headerColor,
    }

    const opacityTitlesX = scrollAnim.interpolate({
      inputRange: [
        0,
        (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0,
        headerScrollDistance],
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

    // const opacityTitles = scrollAnim.interpolate({
    //   inputRange: [0, 330 - 1, 330],
    //   outputRange: [0, 0, 1],
    //   extrapolate: 'clamp',
    // })
    //
    // const titlesTranslate = scrollAnim.interpolate({
    //   inputRange: [0, (headerScrollDistance && yFixed < headerScrollDistance) ? yFixed : 0, headerScrollDistance],
    //   outputRange: [0, 0, headerScrollDistance - yFixed - 50],
    //   extrapolate: 'clamp',
    // })

    return (
      <Animated.View
        onStartShouldSetResponder={this.containerTouched}
        pointerEvents="box-none"
        onLayout={onSetHeaderHeight}
        style={[
          {
            transform: [{ translateY: headerWrapperTranslate }],
            zIndex: 99,
          }]}
      >
        <View style={[styles.bankAccountHeaderBgWrapper]}
              pointerEvents="box-none">
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
                ref={this.handleSetRef}
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
                    size={28}
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

          <Text style={styles.bankAccountTitle}>{t('mainMenu:mutavim')}</Text>

          {isEdit && (
            <View style={{
              elevation: 5,
              zIndex: 5,
            }}>
              <View style={[
                cs(isRtl, styles.bankAccountHeaderWrapper,
                  commonStyles.rowReverse),
                {
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: colors.white,
                },
              ]}>
                {this.accountTitle}
              </View>

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
                    onPress={handleModalTypes}
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
                  {categoriesMatchCopy.length > 0 &&
                  categoriesMatchCopy.map((f, i) => {
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
                </Animated.ScrollView>
              </View>
            </View>
          )}

          {!isEdit && (
            <Animated.View style={{
              transform: [{ translateY: headerTranslate }],
              elevation: 5,
              zIndex: 5,
            }}>
              <Animated.View style={[
                cs(isRtl, styles.bankAccountHeaderWrapper,
                  commonStyles.rowReverse),
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                }, animateBgColor]}>

                {this.accountTitle}

                <Animated.View style={[
                  {
                    opacity: opacityTitlesX,
                    position: 'absolute',
                    left: 22,
                    top: 14,
                    zIndex: 2,
                  }]}>
                  <TouchableOpacity
                    onPress={this.handleToggleEdit}>
                    <AnimatableIcon
                      name="magnify"
                      type="material-community"
                      size={25}
                      style={animateColor}
                    />
                  </TouchableOpacity>
                </Animated.View>
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
                      onPress={handleModalTypes}
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
                    {categoriesMatchCopy.length > 0 &&
                    categoriesMatchCopy.map((f, i) => {
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
                  </Animated.ScrollView>
                </View>
              )}
            </Animated.View>
          )}
          {(!isEdit) && (
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
                  style={[
                    {
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
                      {'זכות'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.filtersAll(true)}>
                <View
                  style={[
                    {
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
                      {'חובה'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={this.filtersAll(null)}>
                <View
                  style={[
                    {
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
          )}

          {!notHasData && (
            <View style={[
              styles.tableHeadWrapper, {
                flex: 1,
                paddingHorizontal: 25,
                backgroundColor: colors.white,
                height: HEADER_DATA_ROW_HEIGHT,
                width: '100%',
                shadowColor: 'black',
                shadowOpacity: 0.1,
                shadowRadius: 0.5,
                shadowOffset: {
                  width: 0,
                  height: 2,
                },
                elevation: 4,
              }]}>
              <View style={{
                flex: 1,
                flexDirection: 'row-reverse',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                alignSelf: 'center',
              }}>
                <Text style={[
                  styles.tableHeadText, {
                    flex: 2,
                  }]}>{'מוטב'}</Text>
                <Text style={styles.tableHeadText}>{'ממוצע 3 חודשים'}</Text>
              </View>
            </View>
          )}
        </View>
      </Animated.View>
    )
  }
}
