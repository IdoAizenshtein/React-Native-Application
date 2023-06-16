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

import { withTranslation } from 'react-i18next'
import commonStyles from '../../../styles/styles'
import DataListSectionHeader
  from '../../../components/DataList/DataListSectionHeader'
import DataRow from './DataRow'
import Row from './Row'
import styles, { DATA_ROW_HEIGHT } from '../CashFlowStyles'
import AppTimezone from '../../../utils/appTimezone'
import { IS_IOS } from '../../../constants/common'
import { KeyboardAwareSectionList } from 'react-native-keyboard-aware-scroll-view'
import { combineStyles as cs, getCurrencyChar, sp } from '../../../utils/func'
import Swiper from 'react-native-swiper/src'
import { Pagination } from 'react-native-snap-carousel'
import Switch from 'src/components/Button/Switch'
import EmptyChart from 'src/components/Chart/EmptyChart'
import Chart from 'src/components/Chart/Chart'
import AccountAlert from '../../../components/AccountAlert/AccountAlert'

import CustomIcon from '../../../components/Icons/Fontello'
import { Button } from 'react-native-elements'
import { colors } from '../../../styles/vars'
import LoaderSimple from '../../../components/Loader/LoaderSimple'

const winWidth = Dimensions.get('window').width
const numberFormat = new Intl.NumberFormat('he')

const AnimatedSectionList = Animated.createAnimatedComponent(KeyboardAwareSectionList)

const Slide = props => {
  return (<View style={styles.slide}>
    {props.loaded ? (Object.keys(props.item.accountBalanceChartData).length > 0)
      ? (<Chart data={props.item.accountBalanceChartData}
                creditLimit={props.item.creditLimit}
                colorsReverse={false}/>)
      : (<EmptyChart
        colorsReverse={false}
        showError
        width={winWidth}
        yMaxValue={6000}
        showRedLine={false}
        dateTillTimestamp={props.dateTillTimestamp}
      />)
      : <EmptyChart width={winWidth} dateTillTimestamp={props.dateTillTimestamp}
                    colorsReverse={false}/>}
  </View>)
}

class ScrollCompWithHeader extends PureComponent {
  static listRef = null

  constructor (props) {
    super(props)
    this.state = {
      toggleAlerts: false,
    }
  }

  get accountsBalance () {
    if (this.props.propsPage.selectedAccounts &&
      this.props.propsPage.selectedAccounts.length) {
      const total = this.props.propsPage.selectedAccounts.reduce(
        (memo, account) => {
          return memo + account.accountBalance
        }, 0)
      return numberFormat.format(Math.round(total))
    } else {
      return null
    }
  }

  get accountsBalanceNumber () {
    if (this.props.propsPage.selectedAccounts &&
      this.props.propsPage.selectedAccounts.length) {
      return this.props.propsPage.selectedAccounts.reduce((memo, account) => {
        return memo + account.accountBalance
      }, 0)
    } else {
      return null
    }
  }

  componentWillUnmount () {
    ScrollCompWithHeader.listRef = null
  }

  UNSAFE_componentWillReceiveProps (props) {
    if (
      props.propsPage.currentSelectedAccountId !==
      this.props.propsPage.currentSelectedAccountId ||
      props.propsPage.dateFromTimestamp !==
      this.props.propsPage.dateFromTimestamp ||
      props.propsPage.dateTillTimestamp !==
      this.props.propsPage.dateTillTimestamp
    ) {
      setTimeout(() => {
        if (ScrollCompWithHeader.listRef &&
          ScrollCompWithHeader.listRef.scrollTo) {
          ScrollCompWithHeader.listRef.scrollTo({
            animated: true,
            x: 0,
          })
        }
      }, 500)
    }
  }

  handleToggleAlerts = () => {
    const { toggleAlerts } = this.state
    this.setState({ toggleAlerts: !toggleAlerts })
  }

  render () {
    const children = this.props.children
    const stickyHeaderIndices = this.props.props.stickyHeaderIndices
    const {
      currentCompanyId,
      t,
      hasData,
      screenSwitchState,
      accountBalanceChartDataState,
      onIndexChanged,
      dateTillTimestamp,
      selectedIndex,
      selectedGroup,
      onSetAlertPosition,
      isRtl,
      hasAlert,
      selectedDeviantAccounts,
      selectedNotUpdatedAccounts,
      onSelectAccount,
      onToggleAlertDetails,
      alertState,
      selectedAccountIds,
      currentAccountIndex,
      onChangeScreenMode,
      selectedAccounts,
      onOpenAccountsModal,
      dataAlertHeader,
      isSearchOpen,
      bankTransNotExist,
      loaderProgress,
      navigation,
    } = this.props.propsPage
    const { toggleAlerts } = this.state

    const tableHeaderWrapperStyles = cs(isRtl,
      [styles.dataRow, styles.dataRowHeader], commonStyles.rowReverse)
    const notUpdate = selectedNotUpdatedAccounts &&
      selectedNotUpdatedAccounts.length === 1
    const notUpDateTime = (notUpdate) ? AppTimezone.moment()
      .diff(selectedNotUpdatedAccounts[0].balanceLastUpdatedDate, 'days') : 0

    const accountsBalance = (getCurrencyChar(selectedGroup) + ' ' +
      this.accountsBalance)

    const totalBalanceTitle = (selectedAccounts.length === 1)
      ? (selectedAccounts[0].isUpdate
        ? t('bankAccount:totalBalance')
        : (selectedAccounts[0].isShowItrot ? (`יתרה ל-${AppTimezone.moment(
          selectedAccounts[0].balanceLastUpdatedDate).format('DD/MM/YY')}`) : t(
          'bankAccount:totalBalance')))
      : t('sumsTitles:accountBalance')
    const totalBalanceText = (selectedAccounts.length === 1)
      ? (selectedAccounts[0].isUpdate
        ? (accountsBalance)
        : (selectedAccounts[0].isShowItrot ? (accountsBalance) : '-'))
      : (accountsBalance)

    const tomorrowItra = dataAlertHeader ? ((selectedAccounts.length === 1 &&
      !screenSwitchState && dataAlertHeader && !selectedAccounts[0].isUpdate &&
      selectedAccounts[0].isShowItrot)
      ? dataAlertHeader.tomorrowItraNoUpdate
      : dataAlertHeader.tomorrowItra) : ''

    const hovaNigrarot = screenSwitchState ? 'hovaNigrarot' : 'hovaNigreret'
    const zhutNigrarot = screenSwitchState ? 'zhutNigrarot' : 'zhutNigreret'

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
          height: screenSwitchState ? 20 : isSearchOpen ? 0 : 55,
          backgroundColor: isSearchOpen ? colors.white : colors.blue32,
        }}/>

        {!isSearchOpen && (
          <View style={{
            backgroundColor: colors.blue32,
          }}>
            <Swiper
              key={accountBalanceChartDataState.length}
              loop={false}
              width={winWidth}
              height={156}
              index={selectedIndex}
              onIndexChanged={onIndexChanged}
              showsPagination={false}>
              {
                accountBalanceChartDataState.map((item, i) => <Slide
                  dateTillTimestamp={dateTillTimestamp}
                  loaded={!!accountBalanceChartDataState[i].accountBalanceChartData}
                  item={item}
                  i={i.toString()}
                  key={item.companyAccountId}/>)
              }
            </Swiper>

            {hasData && (
              <View style={styles.totalBalanceWrapper}>
                <TouchableOpacity
                  style={cs(isRtl, [commonStyles.alignItemsCenter],
                    commonStyles.rowReverse)}
                  onPress={this.handleToggleAlerts}
                >
                  {toggleAlerts
                    ? (
                      <View style={{
                        alignItems: 'center',
                        flex: 1,
                      }}>
                        <Text
                          style={styles.totalBalanceTitle}>{totalBalanceTitle}</Text>

                        <Text style={[
                          styles.totalBalanceText, {
                            fontSize: sp(22),
                          }]}>
                          {totalBalanceText}
                        </Text>
                      </View>
                    )
                    : (
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          flexDirection: 'row',
                          flex: 1,
                        }}
                      >
                        <View>
                          <View style={{
                            alignItems: 'flex-end',
                            alignSelf: 'flex-start',
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            flex: 1,
                          }}>
                            <Text
                              style={[
                                styles.totalBalanceTitle,
                                { textAlign: 'right' }]}>{'סכום תנועות נגררות'}</Text>

                            {((notUpdate && notUpDateTime >= 7) ||
                              (dataAlertHeader &&
                                dataAlertHeader[hovaNigrarot] === 0 &&
                                dataAlertHeader[zhutNigrarot] === 0)) && (
                              <Text style={[
                                styles.totalBalanceText, {
                                  textAlign: 'right',
                                  fontSize: sp(22),
                                  paddingBottom: 1,
                                }]}
                              >
                                <Text> - </Text>
                              </Text>
                            )}
                            {((!notUpdate) ||
                              (notUpdate && notUpDateTime < 7)) &&
                            dataAlertHeader &&
                            (dataAlertHeader[hovaNigrarot] !== 0 ||
                              dataAlertHeader[zhutNigrarot] !== 0) && (
                              <Text style={[
                                styles.totalBalanceText, {
                                  textAlign: 'right',
                                  fontSize: sp(IS_IOS ? 22 : 20),
                                  paddingBottom: 1,
                                }]}
                              >
                                {/* {dataAlertHeader && (dataAlertHeader[hovaNigrarot] === 0) && */}
                                {/* <Text style={{ color: '#fe3461' }}> */}
                                {/* - */}
                                {/* </Text>} */}
                                {dataAlertHeader &&
                                (dataAlertHeader[hovaNigrarot] !== 0) &&
                                (dataAlertHeader[zhutNigrarot] !== 0) && (
                                  <Text>{'('}</Text>
                                )}
                                {dataAlertHeader &&
                                (dataAlertHeader[hovaNigrarot] !== 0) &&
                                <Text style={{ color: '#fe3461' }}>

                                  {getCurrencyChar(selectedGroup)}-
                                  {numberFormat.format(
                                    Math.round(dataAlertHeader[hovaNigrarot]))}
                                </Text>}

                                {dataAlertHeader &&
                                (dataAlertHeader[hovaNigrarot] !== 0) &&
                                (dataAlertHeader[zhutNigrarot] !== 0) && (
                                  <Text> + </Text>
                                )}

                                {/* {dataAlertHeader && (dataAlertHeader[zhutNigrarot] === 0) && */}
                                {/* <Text style={{ color: '#53e69d' }}> */}
                                {/* - */}
                                {/* </Text>} */}
                                {dataAlertHeader &&
                                (dataAlertHeader[zhutNigrarot] !== 0) &&
                                <Text style={{ color: '#53e69d' }}>
                                  {getCurrencyChar(selectedGroup)}
                                  {numberFormat.format(
                                    Math.round(dataAlertHeader[zhutNigrarot]))}
                                </Text>}

                                {dataAlertHeader &&
                                (dataAlertHeader[hovaNigrarot] !== 0) &&
                                (dataAlertHeader[zhutNigrarot] !== 0) && (
                                  <Text>{')'}</Text>
                                )}
                              </Text>
                            )}
                          </View>
                        </View>
                        <Text style={{ color: '#ffffff' }}>+</Text>
                        <View>
                          <View style={{
                            alignItems: 'flex-end',
                            alignSelf: 'flex-start',
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            flex: 1,
                          }}>
                            <Text
                              style={[
                                styles.totalBalanceTitle,
                                { textAlign: 'right' }]}>{'יתרה צפויה למחר'}</Text>

                            {!notUpdate && screenSwitchState &&
                            dataAlertHeader &&
                            dataAlertHeader.accountTransactions && (
                              <Text style={[
                                styles.totalBalanceText, {
                                  textAlign: 'right',
                                  fontSize: sp(22),
                                }]}>
                                {getCurrencyChar(
                                  selectedGroup)} {numberFormat.format(
                                Math.round(
                                  (dataAlertHeader.accountTransactions[1].zhut -
                                    dataAlertHeader.accountTransactions[1].hova) +
                                  this.accountsBalanceNumber))}
                              </Text>
                            )}
                            {!screenSwitchState && dataAlertHeader && (
                              <Text style={[
                                styles.totalBalanceText, {
                                  textAlign: 'right',
                                  fontSize: sp(22),
                                }]}>
                                {getCurrencyChar(
                                  selectedGroup)} {numberFormat.format(
                                Math.round((tomorrowItra)))}
                              </Text>
                            )}
                            {/* {notUpdate && ( */}
                            {/* <Text style={[styles.totalBalanceText, { */}
                            {/* fontSize: sp(22), */}
                            {/* }]}> */}
                            {/* - */}
                            {/* </Text> */}
                            {/* )} */}
                          </View>
                        </View>
                      </View>)
                  }
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {!isSearchOpen && hasAlert && (
          <Fragment>
            <View style={[styles.alertBorder]}/>

            <View onLayout={onSetAlertPosition}>
              <AccountAlert
                navigation={navigation}
                currentCompanyId={currentCompanyId}
                screen={'tazrim'}
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

        {!isSearchOpen && selectedAccountIds.length > 1 && (
          <View>
            <Pagination
              dotsLength={selectedAccountIds.length + 1}
              activeDotIndex={currentAccountIndex}
              containerStyle={styles.headerSliderPaginationContainer}
              dotStyle={styles.sliderDot}
              inactiveDotStyle={styles.sliderInactiveDot}
              dotContainerStyle={styles.sliderDotContainer}
              inactiveDotOpacity={1}
              inactiveDotScale={1}
            />
          </View>
        )}

        {!isSearchOpen && (
          <View style={styles.headerSwitchWrapper}>
            <Switch
              value={screenSwitchState}
              firstBtnText={t('bankAccount:detailed')}
              secondBtnText={t('bankAccount:aggregated')}
              onPress={onChangeScreenMode}
            />
          </View>
        )}

        {(screenSwitchState && hasData) && (
          <View>
            <View style={[styles.tableHeadWrapper]}>
              <View style={tableHeaderWrapperStyles}>
                <Text style={styles.tableHeadText}>{'הכנסה'}</Text>
                <Text style={styles.tableHeadText}>{'הוצאה'}</Text>
                <Text
                  style={[styles.tableHeadText]}>{'יתרה (כולל נגררות)'}</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {children}

      {hasData && bankTransNotExist && !loaderProgress && (
        <View
          style={{
            backgroundColor: 'white',
            flex: 1,
            position: 'relative',
            maxHeight: Dimensions.get('window').height - (IS_IOS ? 75 : 75),
          }}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: 0,
              paddingBottom: 0,
            }]}>
          <View style={commonStyles.horizontalCenterContainer}>
            <CustomIcon name="bank-fees" size={56} color={colors.blue32}
                        style={{ marginVertical: 16 }}/>

            <Text style={styles.bankAccountInfoText}>
              {'לא נמצאו תנועות לסינון המבוקש'}
            </Text>
          </View>
        </View>
      )}

      {!hasData && !loaderProgress && (
        <View
          style={{
            backgroundColor: 'white',
            flex: 1,
            position: 'relative',
            maxHeight: Dimensions.get('window').height - (IS_IOS ? 75 : 75),
          }}
          contentContainerStyle={[
            {
              flexGrow: 1,
              paddingTop: 0,
              paddingBottom: 0,
            }]}>
          <View style={commonStyles.horizontalCenterContainer}>
            <Text style={styles.bankAccountInfoText}>
              {selectedAccounts.length
                ? t('common:noFilterFound')
                : t('bankAccount:pleaseSelectAnAccountToViewData')}
            </Text>

            <CustomIcon name="no-data" size={56} color={colors.gray9}
                        style={{ marginBottom: 16 }}/>

            <Button
              buttonStyle={[commonStyles.blueBtn, styles.bankAccountBtn]}
              onPress={onOpenAccountsModal}
              title={selectedAccounts.length ? t('common:changeFilter') : t(
                'bankAccount:selectAccount')}
            />
          </View>
        </View>
      )}
    </ScrollView>)
  }
}

@withTranslation()
export default class DataList extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      refreshing: false,
      // titleSticky: props.bankTrans && props.bankTrans.length > 0 ? props.bankTrans[0].title : '',
      currentOpenItemIndex: null,
    }
  }

  renderDetailsDataSectionHeader = ({ section }) => {
    const { accounts, selectedAccountIds, isSearchOpen, openGraph, bankTrans } = this.props
    const titleSticky = bankTrans && bankTrans.length > 0
      ? bankTrans[0].title
      : ''
    return <DataListSectionHeader
      section={section}
      cashScreen
      openGraph={openGraph}
      showIconGraph={!this.props.screenSwitchState && isSearchOpen &&
      (titleSticky === section.title)}
      cashFlow={!this.props.screenSwitchState}
      account={accounts.find(a => a.companyAccountId === selectedAccountIds[0])}
    />
  }

  renderAggregatedScrollItem = ({ item }) => {
    const { isRtl, accounts, handleGetOneAggregateDataPerDay, removeItem, categories, reload, handlePopRowEditsModal, itemUpdate, goToMatch, selectedAccountIds, companyId } = this.props
    const accountUuid = accounts.find(
      a => a.companyAccountId === selectedAccountIds[0])

    return (
      <DataRow
        openBottomSheet={this.openBottomSheet}
        companyId={companyId}
        showBtnMatch={!(selectedAccountIds.length === 1 && AppTimezone.moment()
          .diff(accountUuid.balanceLastUpdatedDate, 'days') > 7)}
        accountUuid={(selectedAccountIds.length === 1) ? ((accountUuid.isUpdate)
          ? null
          : AppTimezone.moment(accountUuid.balanceLastUpdatedDate)
            .format('DD/MM/YY')) : null}
        goToMatch={goToMatch}
        reload={reload}
        itemUpdate={itemUpdate}
        categories={categories}
        removeItem={removeItem}
        isRtl={isRtl}
        data={item}
        handlePopRowEditsModal={handlePopRowEditsModal}
        accounts={accounts}
        OneAggregateDataPerDay={handleGetOneAggregateDataPerDay}
      />
    )
  }

  renderFakeHeaderTop = () => {
    return <Animated.View
      style={{
        flex: 1,
        height: 0,
        backgroundColor: 'transparent',
      }}
    />
  }

  renderItemSeparator = () => <View style={styles.dataRowSeparator}/>

  renderDetailsDataScrollItem = ({ item, section, index }) => {
    const { isRtl, queryStatus } = this.props
    const { currentOpenItemIndex } = this.state
    // return (
    //   <SectionRowWrapper
    //     queryStatus={queryStatus}
    //     companyId={companyId}
    //     handlePopRowEditsModal={handlePopRowEditsModal}
    //     removeItem={removeItem}
    //     isOpen={(queryStatus && queryStatus.query !== null && queryStatus.query !== '') ? true : ((item.transId + '_' + section.title) === currentOpenItemIndex)}
    //     accounts={accounts}
    //     getAccountCflTransType={categories}
    //     isRtl={isRtl}
    //     cashFlowDetailsDataItem={item}
    //     account={accounts.find(a => a.companyAccountId === item.companyAccountId)}
    //     onItemToggle={this.handleItemToggle(item.transId + '_' + section.title)}
    //     updateRow={updateRow}
    //   />
    // )

    return (
      <Row
        queryStatus={queryStatus}
        key={index}
        isOpen={(queryStatus && queryStatus.query !== null &&
          queryStatus.query !== '') ? true : (item.transId + '_' + item.nigreret
          ? item.originalDate
          : item.transDate) === currentOpenItemIndex}
        isRtl={isRtl}
        cashFlowDetailsDataItem={item}
        onToggle={this.openBottomSheet(item)}
      />
    )
  }

  openBottomSheet = (item) => () => {
    const {
      openBottomSheet,
      screenSwitchState,
    } = this.props
    if (!screenSwitchState) {
      this.setState({
        currentOpenItemIndex: (item.transId + '_' + item.nigreret
          ? item.originalDate
          : item.transDate),
      })
    }
    openBottomSheet(item)
  }

  handleItemToggle = (index) => () => {
    const { currentOpenItemIndex } = this.state
    const { screenSwitchState } = this.props

    this.setState(
      { currentOpenItemIndex: currentOpenItemIndex === index ? null : index })

    if (currentOpenItemIndex === null || currentOpenItemIndex ===
      index) {return}
    if (screenSwitchState) {this.handleScrollTo(index)}
  }

  handleScrollTo = (index) => {
    if (!this.listRef) {return}

    if (this.listRef && this.listRef.props.scrollToPosition) {
      const offset = parseInt(
        index * (DATA_ROW_HEIGHT + 1) + this.props.headerMaxHeight - 20, 10)
      this.listRef.props.scrollToPosition(0, offset)
    }
  }

  UNSAFE_componentWillReceiveProps ({ screenSwitchState, cashFlowDetailsData, currentOpenItemIndex }) {
    // if (this.props.dateFromTimestamp !== dateFromTimestamp || this.props.dateTillTimestamp !== dateTillTimestamp) {
    //   setTimeout(() => {
    //     this.setState({
    //       titleSticky: bankTrans && bankTrans.length > 0 ? bankTrans[0].title : '',
    //     })
    //   }, 30)
    // }
    if (currentOpenItemIndex === null) {
      if (!this.props.screenSwitchState) {
        this.setState({ currentOpenItemIndex: null })
      } else {
        this.setState({ currentOpenItemIndexInside: null })
      }
    }
    if (this.props.screenSwitchState === screenSwitchState) {return}
    this.setState({ currentOpenItemIndex: null })
  }

  handleScrollEnd = (e) => this.props.onSetScrollPosition(
    e.nativeEvent.contentOffset.y)

  _onRefresh = () => {
    this.setState({ refreshing: true })
    this.props.refresh()
    setTimeout(() => {
      this.setState({ refreshing: false })
    }, 1000)
  }
  // _onViewableItemsChanged = ({ changed }) => {
  //   // console.log('title----', changed)
  //
  //   const isViewable = changed.filter((item) => !item.isViewable)
  //   if (isViewable.length) {
  //     // console.log('isViewable length----', isViewable.length)
  //     if (isViewable[0].section.title !== '') {
  //       this.setState({
  //         titleSticky: isViewable[0].section.title,
  //       })
  //     }
  //     // console.log('title----', isViewable[0].section.title)
  //   } else if (this.state.titleSticky !== '') {
  //     const {
  //       bankTrans,
  //     } = this.props
  //     if (bankTrans && bankTrans.length) {
  //       const currentIdx = bankTrans.findIndex((it) => it.title === this.state.titleSticky)
  //       // console.log('changed length----', this.state.titleSticky)
  //       // console.log('changed next length----', bankTrans[currentIdx + 1].title)
  //       this.setState({
  //         titleSticky: bankTrans[currentIdx + 1].title,
  //       })
  //     }
  //   } else {
  //     const {
  //       screenSwitchState,
  //       cashFlowAggregatedDataStateArr,
  //       bankTrans,
  //     } = this.props
  //     if (screenSwitchState) {
  //       this.setState({
  //         titleSticky: cashFlowAggregatedDataStateArr[0].title,
  //       })
  //     } else {
  //       this.setState({
  //         titleSticky: bankTrans[0].title,
  //       })
  //     }
  //   }
  // }

  onViewableItemsChanged = ({ viewableItems, changed }) => {
    // this.setState({
    //   titleSticky: viewableItems[0].section.title,
    // })
  }

  render () {
    const {
      hasData,
      screenSwitchState,
      inProgress,
      scrollAnim,
      selectedAccounts,
      headerMaxHeight,
      cashFlowAggregatedDataStateArr,
      bankTrans,
      isSearchOpen,
    } = this.props

    if (inProgress && screenSwitchState) {
      return <LoaderSimple containerStyle={{ paddingTop: headerMaxHeight }}/>
    }

    return screenSwitchState
      ? (
        <AnimatedSectionList
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
          removeClippedSubviews={!(!hasData && selectedAccounts.length === 1)}
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
              marginTop: 75,
              paddingBottom: 75,
            }]}
          ListHeaderComponent={this.renderFakeHeaderTop}
          scrollEventThrottle={IS_IOS ? 16 : 1}
          sections={(cashFlowAggregatedDataStateArr &&
            cashFlowAggregatedDataStateArr.length > 0 && !inProgress)
            ? cashFlowAggregatedDataStateArr
            : []}
          renderItem={this.renderAggregatedScrollItem}
          renderSectionHeader={this.renderDetailsDataSectionHeader}
          ItemSeparatorComponent={this.renderItemSeparator}
          keyExtractor={(item, i) => `${item.transDate}_${i}`}
          initialNumToRender={55}
          windowSize={5}
        />
      ) : (
        <AnimatedSectionList
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
          ListHeaderComponent={this.renderFakeHeaderTop}
          scrollEventThrottle={IS_IOS ? 16 : 1}
          sections={(bankTrans && bankTrans.length > 0 && !inProgress)
            ? bankTrans
            : []}
          renderItem={this.renderDetailsDataScrollItem}
          renderSectionHeader={this.renderDetailsDataSectionHeader}
          ItemSeparatorComponent={this.renderItemSeparator}
          keyExtractor={(item, i) => `${item.transId}_${i}`}
          initialNumToRender={55}
          windowSize={5}
          onViewableItemsChanged={this.onViewableItemsChanged}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50,
          }}
        />
      )
  }
}
