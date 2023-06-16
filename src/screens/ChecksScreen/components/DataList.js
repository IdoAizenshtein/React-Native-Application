import React, { Fragment, PureComponent } from 'react'
import {
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  SectionList,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view'
import { withTranslation } from 'react-i18next'
import CustomIcon from '../../../components/Icons/Fontello'
import DataListSectionHeader
  from '../../../components/DataList/DataListSectionHeader'
import commonStyles from '../../../styles/styles'
import styles from '../ChecksStyles'
import { colors, fonts } from '../../../styles/vars'
import CheckRow from './CheckRow'
import { IS_IOS } from '../../../constants/common'
import {
  combineStyles as cs,
  getFormattedValueArray,
  sp,
} from '../../../utils/func'
import { Pagination } from 'react-native-snap-carousel'
import AccountAlert from 'src/components/AccountAlert/AccountAlert'

class ScrollCompWithHeader extends PureComponent {
  static listRef = null

  constructor (props) {
    super(props)

    const {
      currentIndex,
      statusTotals,
      changeScreenModeInProgress,
      selectedAccounts,
    } = this.props.propsPage

    let currentIdx = 0
    if (statusTotals.length > 0 && selectedAccounts.length > 0 &&
      !changeScreenModeInProgress && currentIndex) {
      const idddxxx = statusTotals.findIndex(
        (it) => it.status.toLowerCase() === currentIndex)
      currentIdx = (Math.ceil(idddxxx / 3) - 1)
    }

    this.state = {
      numberOfPoints: 0,
      currentIndex: currentIdx,
    }
  }

  componentDidMount () {
    this.scrollToEnd()
  }

  UNSAFE_componentWillReceiveProps (props) {
    if (
      props.propsPage.isUpdate
    ) {
      setTimeout(() => {
        if (ScrollCompWithHeader.listRef &&
          ScrollCompWithHeader.listRef.scrollTo) {
          // ScrollCompWithHeader.listRef.scrollTo({ animated: true, x: 0 })
          this.scrollToEnd()
        }
      }, 500)
    }
  }

  componentWillUnmount () {
    ScrollCompWithHeader.listRef = null
  }

  handleStartScroll = (e) => {
    const {
      winWidth,
      statusTotals,
    } = this.props.propsPage
    const numberOfPoints = Math.ceil(statusTotals.length / 3)
    if (numberOfPoints > 1) {
      const currentIndex = Math.ceil(
        (winWidth + e.nativeEvent.contentOffset.x) / winWidth) - 1
      this.setState({
        numberOfPoints: numberOfPoints,
        currentIndex: currentIndex,
      })
    }
  }

  divideList (list) {
    const arr = []
    list.forEach((item, i) => {
      if (i % 3 === 0) {
        arr.push([item])
      } else {
        arr[arr.length - 1].push(item)
      }
    })
    return arr
  }

  setCheckTitleMarks = (param) => () => {
    const {
      winWidth,
      setCheckTitleMarks,
    } = this.props.propsPage
    const width = (winWidth / 2) - 10
    if (param === true) {
      setCheckTitleMarks(width, 0, param)
    } else {
      setCheckTitleMarks(0, width, param)
    }
  }

  filtersAll = (param) => () => {
    const {
      filtersAll,
    } = this.props.propsPage
    filtersAll(param)
  }

  scrollToEnd () {
    const {
      isRtl,
      statusTotals,
    } = this.props.propsPage
    if (isRtl) {
      setTimeout(() => {
        if (this.scrollViewInside && this.scrollViewInside._component) {
          this.scrollViewInside._component.scrollToEnd({ animated: false })
        }
      }, 10)
    }
    const numberOfPoints = Math.ceil(statusTotals.length / 3)
    this.setState({
      numberOfPoints: numberOfPoints,
    })
  }

  render () {
    const children = this.props.children
    const stickyHeaderIndices = this.props.props.stickyHeaderIndices
    const {
      numberOfPoints,
      currentIndex,
    } = this.state
    const {
      currentCompanyId,
      t,
      screenSwitchState,
      onSetAlertPosition,
      isRtl,
      hasAlert,
      selectedDeviantAccounts,
      selectedNotUpdatedAccounts,
      onSelectAccount,
      onToggleAlertDetails,
      alertState,
      selectedAccountIds,
      selectedAccounts,
      isSearchOpen,
      statusTotals,
      winWidth,
      changeScreenModeInProgress,
      getNameOfStatus,
      queryStatus,
      sizeFontStatusTotals,
      widthIncome,
      widthOut,
      chequeDetails,
      onToggleCalendar,
      onOpenAccountsModal,
      error,
      isLoader,
    } = this.props.propsPage
    const showOperators = (screenSwitchState)
      ? (statusTotals.length > 2 && statusTotals[0].status.toLowerCase() ===
        'not_paid' && statusTotals[1].status.toLowerCase() ===
        'mechake_lehafkada' && statusTotals[2].status.toLowerCase() ===
        'mishmeret_babank')
      : (statusTotals.length > 2 && statusTotals[0].status ===
        'MECHAKE_LEHAFKADA' && statusTotals[1].status === 'FUTURE_DUE_DATE' &&
        statusTotals[2].status === 'PAST_DUE_DATE')

    return (<ScrollView
      ref={scrollView => {
        if (scrollView) {
          ScrollCompWithHeader.listRef = scrollView
        }
      }}
      {...this.props.props}
      stickyHeaderIndices={stickyHeaderIndices.map((i) => i + 1)}
    >
      <View>
        <View style={{
          flex: 1,
          height: isSearchOpen ? 0 : 55,
          backgroundColor: colors.white,
        }}/>

        {!isSearchOpen && (
          <View>
            <View style={{
              position: 'relative',
              flex: 1,
              marginTop: 20,
              flexGrow: 1,
              flexDirection: 'row',
            }}>
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={this.setCheckTitleMarks(true)}>
                  <View style={{
                    backgroundColor: widthIncome !== 0 ? '#08d3b8' : '#ffffff',
                    height: 33,
                    flex: 1,
                    width: '100%',
                    borderTopRightRadius: 12,
                    borderBottomRightRadius: 12,
                  }}>
                    <Text style={[
                      {
                        fontFamily: widthIncome === 0
                          ? fonts.regular
                          : fonts.semiBold,
                        textAlign: 'center',
                        width: '100%',
                        color: widthIncome === 0 ? '#022258' : '#ffffff',
                        fontSize: sp(24),
                      }]}
                    >{'נכנסים'}</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={this.setCheckTitleMarks(false)}>
                  <View style={{
                    backgroundColor: widthOut !== 0 ? '#08d3b8' : '#ffffff',
                    height: 33,
                    flex: 1,
                    width: '100%',
                    borderTopLeftRadius: 12,
                    borderBottomLeftRadius: 12,
                  }}>
                    <Text style={[
                      {
                        fontFamily: widthOut === 0
                          ? fonts.regular
                          : fonts.semiBold,
                        textAlign: 'center',
                        width: '100%',
                        color: widthOut === 0 ? '#022258' : '#ffffff',
                        fontSize: sp(24),
                      }]}
                    >{'יוצאים'}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {statusTotals.length > 0 && selectedAccounts.length > 0 &&
            !changeScreenModeInProgress && (
              <View style={{
                backgroundColor: '#022258',
                flexGrow: 1,
                position: 'relative',
                marginTop: 20,
                height: 94,
              }}>
                <Animated.ScrollView
                  horizontal
                  scrollEnabled={numberOfPoints > 1}
                  ref={scrollViewInside => (this.scrollViewInside = scrollViewInside)}
                  scrollEventThrottle={16}
                  onScroll={this.handleStartScroll}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  pagingEnabled={false}
                  contentContainerStyle={{
                    flexDirection: (isRtl) ? 'row-reverse' : 'row',
                    alignSelf: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                  }}>
                  {this.divideList(statusTotals).map((gr, i) => {
                    return (
                      <View key={i.toString()} style={{
                        width: winWidth,
                        height: 53.5,
                        paddingHorizontal: 5,
                        paddingVertical: 0,
                        flex: 1,
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                        flexDirection: (isRtl) ? 'row-reverse' : 'row',
                      }}>
                        {
                          gr.map((c, i1) => {
                            const total = getFormattedValueArray(c.total)
                            const redTotal = ((screenSwitchState &&
                              c.status.toLowerCase() ===
                              'huavar_lesapak_vehazar') ||
                              (screenSwitchState && c.status.toLowerCase() ===
                                'ufkad_vehazar') ||
                              (!screenSwitchState && c.status.toUpperCase() ===
                                'RETURN_CHECK'))
                            const isActive = ((c.status.toLowerCase() ===
                              queryStatus) ||
                              (screenSwitchState && c.status.toLowerCase() ===
                                'huavar_lesapak_vehazar' && queryStatus ===
                                'ufkad_vehazar'))
                            return (
                              <View key={i1.toString()}
                                    style={{
                                      flexDirection: 'row',
                                      alignSelf: 'center',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      alignContent: 'center',
                                      flex: 1,
                                    }}>
                                {(i === 0 && showOperators && i1 === 0) && (
                                  <View style={{
                                    flexDirection: 'row',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    flex: 1,
                                  }}>
                                    <Text style={{
                                      textAlign: 'center',
                                      fontSize: sp(25),
                                      lineHeight: 25,
                                      color: '#fff',
                                      fontFamily: fonts.regular,
                                    }}>{'='}</Text>
                                  </View>
                                )}
                                <TouchableOpacity
                                  onPress={this.filtersAll(c.status)}>
                                  <View
                                    style={[
                                      {
                                        alignItems: 'flex-end',
                                        alignContent: 'flex-start',
                                        justifyContent: 'flex-start',
                                        alignSelf: 'center',
                                        flexDirection: 'column',
                                        flex: 1,
                                        borderRadius: 8,
                                        borderColor: 'transparent',
                                        paddingHorizontal: 5,
                                        paddingVertical: 3,
                                      }, cs(isActive, {}, {
                                        backgroundColor: '#ffffff',
                                      })]}>
                                    <View>
                                      <Text numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={[
                                              {
                                                fontSize: sp(15),
                                                lineHeight: 22.5,
                                                textAlign: 'right',
                                                fontFamily: fonts.regular,
                                              },
                                              cs(isActive, {
                                                color: '#fff',
                                              }, {
                                                color: '#022258',
                                              }),
                                            ]}>
                                        {t(getNameOfStatus(c.status))}
                                      </Text>
                                    </View>
                                    <View>
                                      <Text
                                        style={[
                                          styles.dataValueWrapper,
                                          styles.dataValueWrapperLevel2,
                                          {
                                            fontSize: sp(sizeFontStatusTotals),
                                            lineHeight: 25,
                                          },
                                          commonStyles.semiBoldFont,
                                          cs(isActive, {
                                            color: redTotal
                                              ? colors.red2
                                              : '#fff',
                                          }, {
                                            color: redTotal
                                              ? colors.red2
                                              : '#022258',
                                          })]} numberOfLines={1}
                                        ellipsizeMode="tail">
                                        <Text style={{
                                          fontSize: sp(18),
                                        }}>{'₪'}</Text>
                                        <Text style={{
                                          paddingHorizontal: 1,
                                        }}/>
                                        {total[0]}
                                      </Text>
                                    </View>
                                  </View>
                                </TouchableOpacity>

                                {(i === 0 && showOperators && i1 === 2) && (
                                  <View style={{
                                    flexDirection: 'row',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    flex: 1,
                                  }}>
                                    <Text style={{
                                      textAlign: 'center',
                                      fontSize: sp(25),
                                      lineHeight: 25,
                                      color: '#fff',
                                      fontFamily: fonts.regular,
                                    }}>{'+'}</Text>
                                  </View>
                                )}
                              </View>
                            )
                          })
                        }
                      </View>
                    )
                  })}
                </Animated.ScrollView>
              </View>
            )}

            {(statusTotals.length === 0 || selectedAccounts.length === 0 ||
              changeScreenModeInProgress) && (
              <View style={{
                backgroundColor: '#022258',
                flexGrow: 1,
                position: 'relative',
                marginTop: 20,
                height: 94,
              }}/>
            )}
          </View>
        )}

        {!isSearchOpen && hasAlert && (
          <Fragment>
            <View style={[styles.alertBorder]}/>

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

        {!isSearchOpen && selectedAccountIds.length > 1 &&
        !changeScreenModeInProgress && statusTotals.length > 0 &&
        numberOfPoints > 1 && (
          <View>
            <Pagination
              dotsLength={numberOfPoints}
              activeDotIndex={currentIndex}
              containerStyle={styles.headerSliderPaginationContainer}
              dotStyle={styles.sliderDot}
              inactiveDotStyle={styles.sliderInactiveDot}
              dotContainerStyle={styles.sliderDotContainer}
              inactiveDotOpacity={1}
              inactiveDotScale={1}
            />
          </View>
        )}
      </View>

      {children}

      {!isLoader && chequeDetails && (chequeDetails.length === 0) &&
      (selectedAccounts.length > 0) && !error && (
        <View
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: 0,
              paddingBottom: 0,
            }]}
          style={[
            styles.tableWrapper, {
              flexGrow: 1,
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
              height: '100%',
              backgroundColor: 'white',
              maxHeight: Dimensions.get('window').height - (IS_IOS ? 75 : 75),
            }]}>
          <CustomIcon
            name="check"
            size={40}
            color={colors.blue7}
          />
          <Text style={{
            color: colors.blue7,
            fontSize: sp(20),
            marginTop: 15,
            marginBottom: 20,
            fontFamily: fonts.semiBold,
          }}>{'לא נמצאו תנועות לסינון המבוקש'}</Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#0f3860',
              borderRadius: 30,
              width: 160,
              height: 35,
              flexDirection: 'row',
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}
            onPress={onToggleCalendar}>
            <Text style={{
              color: colors.white,
              fontSize: sp(18),
              textAlign: 'center',
              fontFamily: fonts.regular,
            }}>שנו את הסינון</Text>
          </TouchableOpacity>
        </View>
      )}

      {!isLoader && (selectedAccounts.length === 0) && !error && (
        <View
          style={[
            styles.tableWrapper, {
              flexGrow: 1,
              flex: 1,
              position: 'relative',
              overflow: 'hidden',
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
              height: '100%',
              backgroundColor: 'white',
              maxHeight: Dimensions.get('window').height - (IS_IOS ? 75 : 75),
            }]}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: 0,
              paddingBottom: 0,
            }]}>
          <Text style={{
            color: colors.blue7,
            fontSize: sp(20),
            marginBottom: 20,
            fontFamily: fonts.semiBold,
          }}>{'אנא בחרו חשבון להצגת נתונים'}</Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#3fb6ee',
              borderRadius: 30,
              width: 160,
              height: 35,
              flexDirection: 'row',
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}
            onPress={onOpenAccountsModal}>
            <Text style={{
              color: colors.white,
              fontSize: sp(18),
              textAlign: 'center',
              fontFamily: fonts.regular,
            }}>בחרו חשבון</Text>
          </TouchableOpacity>
        </View>
      )}

    </ScrollView>)
  }
}

const AnimatedSectionList = Animated.createAnimatedComponent(KeyboardAwareSectionList)
@withTranslation()
export default class DataList extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      refreshing: false,
      currentOpenItemIndex: null,
      titleSticky: props.chequeDetails && props.chequeDetails.length > 0
        ? props.chequeDetails[0].title
        : '',
    }
  }

  _onRefresh = () => {
    this.setState({ refreshing: true })
    this.props.refresh()
    setTimeout(() => {
      this.setState({ refreshing: false })
    }, 1000)
  }

  handleItemToggle = (index) => () => {
    const { currentOpenItemIndex } = this.state
    this.setState(
      { currentOpenItemIndex: currentOpenItemIndex === index ? null : index })
  }

  renderBankTransSectionHeader = ({ section }) => {
    // const {
    //   isSearchOpen,
    //   openGraph,
    //   chequeDetails,
    // } = this.props
    // const titleSticky = chequeDetails && chequeDetails.length > 0 ? chequeDetails[0].title : ''

    return <DataListSectionHeader
      section={section}
      // openGraph={openGraph}
      // showIconGraph={isSearchOpen && (titleSticky === section.title)}
    />
  }

  renderBankTransScrollItem = ({ item, index }) => {
    const {
      isRtl,
      currentCompanyId,
      accountsILS,
      querySearch,
      refresh,
      deleteOperationApi,
      screenSwitchState,
      selectedAccountIds,
    } = this.props

    const { currentOpenItemIndex } = this.state
    return (
      <CheckRow
        selectedAccountIds={selectedAccountIds}
        querySearch={querySearch}
        onRefresh={refresh}
        deleteOperationApi={deleteOperationApi}
        screenSwitchState={screenSwitchState}
        isRtl={isRtl}
        item={item}
        companyId={currentCompanyId}
        account={accountsILS.find(
          a => a.companyAccountId === item.companyAccountId)}
        isOpen={(querySearch && querySearch !== null && querySearch !== '')
          ? true
          : item.chequePaymentId === currentOpenItemIndex}
        accounts={accountsILS}
        onItemToggle={this.handleItemToggle(item.chequePaymentId)}
      />
    )
  }

  renderFakeHeader = () => {
    return <Animated.View
      style={{
        flex: 1,
        height: 0,
        backgroundColor: 'transparent',
      }}
    />
  }

  renderItemSeparator = () => <View style={styles.dataRowSeparator}/>

  handleScrollEnd = (e) => this.props.onSetScrollPosition(
    e.nativeEvent.contentOffset.y)

  UNSAFE_componentWillReceiveProps ({ screenSwitchState, currentSelectedAccountId }) {
    if (this.props.screenSwitchState === screenSwitchState &&
      this.props.currentSelectedAccountId === currentSelectedAccountId) {
      return
    }

    this.setState({ currentOpenItemIndex: null })
  }

  _onViewableItemsChanged = ({ changed }) => {
    const isViewable = changed.filter((item) => !item.isViewable)
    if (isViewable.length) {
      // console.log('isViewable length----', isViewable.length)
      this.setState({
        titleSticky: isViewable[0].section.title,
      })
      console.log('title----', isViewable[0].section.title)
    } else {
      const {
        chequeDetails,
      } = this.props
      this.setState({
        titleSticky: chequeDetails[0].title,
      })
    }
  }
  onViewableItemsChanged = ({ viewableItems, changed }) => {
    // this.setState({
    //   titleSticky: viewableItems[0].section.title,
    // })
  }

  render () {
    const {
      hasData,
      chequeDetails,
      selectedAccounts,
      scrollAnim,
      isSearchOpen,
    } = this.props

    return (<AnimatedSectionList
      refreshControl={
        <RefreshControl
          refreshing={this.state.refreshing}
          onRefresh={this._onRefresh}
        />
      }
      extraData={this.state.refreshing}
      onScroll={Animated.event(
        [{ nativeEvent: { contentOffset: { y: scrollAnim } } }], {
          useNativeDriver: IS_IOS,
        })}
      renderScrollComponent={(props) => <ScrollCompWithHeader props={props}
                                                              propsPage={this.props}/>}
      bounces
      bouncesZoom
      enableOnAndroid={false}
      removeClippedSubviews={IS_IOS &&
      !(!hasData && selectedAccounts.length === 1)}
      stickySectionHeadersEnabled
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      scrollEnabled
      onScrollEndDrag={this.handleScrollEnd}
      onMomentumScrollEnd={this.handleScrollEnd}
      style={[
        styles.accountsContainer, {
          flex: 1,
          position: 'relative',
        }]}
      contentContainerStyle={[
        styles.tableWrapper, {
          backgroundColor: '#ffffff',
          flexGrow: 1,
          paddingTop: 0,
          marginTop: 35 + (isSearchOpen ? (IS_IOS ? 85 : 90) : 0),
          paddingBottom: 35 + (isSearchOpen ? (IS_IOS ? 85 : 90) : 0),
        }]}
      ListHeaderComponent={this.renderFakeHeader}
      scrollEventThrottle={IS_IOS ? 16 : 1}
      sections={(chequeDetails && chequeDetails.length > 0)
        ? chequeDetails
        : []}
      renderItem={this.renderBankTransScrollItem}
      renderSectionHeader={this.renderBankTransSectionHeader}
      ItemSeparatorComponent={this.renderItemSeparator}
      keyExtractor={(item, index) => (item.chequePaymentId)}
      initialNumToRender={55}
      windowSize={5}
      onViewableItemsChanged={this.onViewableItemsChanged}
      viewabilityConfig={{
        itemVisiblePercentThreshold: 50,
      }}
    />)
  }
}
