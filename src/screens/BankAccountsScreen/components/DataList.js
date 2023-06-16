import React, {Fragment, PureComponent} from 'react'
import {Animated, Dimensions, RefreshControl, ScrollView, Text, View} from 'react-native'

import AppTimezone from '../../../utils/appTimezone'
import {KeyboardAwareSectionList} from 'react-native-keyboard-aware-scroll-view'
import {withTranslation} from 'react-i18next'
import CustomIcon from '../../../components/Icons/Fontello'
import DataListSectionHeader from '../../../components/DataList/DataListSectionHeader'
import BankTransRowLevelOne from './BankTransRowLevelOne'
// import SectionRowWrapper from './SectionRowWrapper'
import {Button} from 'react-native-elements'
import commonStyles from '../../../styles/styles'
import styles from '../BankAccountsStyles'
import { colors, fonts } from "../../../styles/vars";
import BankTransRowToday from './BankTransRowToday'
import {IS_IOS} from '../../../constants/common'
import EmptyChart from 'src/components/Chart/EmptyChart'
import Chart from 'src/components/Chart/Chart'
import {combineStyles as cs, getCurrencyChar} from '../../../utils/func'
import Switch from 'src/components/Button/Switch'
import Swiper from 'react-native-swiper/src'
import {Pagination} from 'react-native-snap-carousel'
import AccountAlert from 'src/components/AccountAlert/AccountAlert'
import LoaderSimple from '../../../components/Loader/LoaderSimple'
import Row from './Row'

const winWidth = Dimensions.get('window').width

const Slide = props => {
  return (<View style={styles.slide}>
    {props.loaded ? (Object.keys(props.item.accountBalanceChartData).length > 0)
        ? (<Chart data={props.item.accountBalanceChartData} creditLimit={props.item.creditLimit}
                  colorsReverse={false} />)
        : (<EmptyChart
          colorsReverse={false}
          showError
          width={winWidth}
          yMaxValue={6000}
          showRedLine={false}
          dateTillTimestamp={props.dateTillTimestamp}
        />)
      : <EmptyChart width={winWidth} dateTillTimestamp={props.dateTillTimestamp} colorsReverse={false} />}
  </View>)
}

class ScrollCompWithHeader extends PureComponent {
  static listRef = null

  componentWillUnmount () {
    ScrollCompWithHeader.listRef = null
  }

  UNSAFE_componentWillReceiveProps (props) {
    if (
      props.propsPage.currentSelectedAccountId !== this.props.propsPage.currentSelectedAccountId ||
      props.propsPage.dateFromTimestamp !== this.props.propsPage.dateFromTimestamp ||
      props.propsPage.dateTillTimestamp !== this.props.propsPage.dateTillTimestamp
    ) {
      setTimeout(() => {
        if (ScrollCompWithHeader.listRef && ScrollCompWithHeader.listRef.scrollTo) {
          ScrollCompWithHeader.listRef.scrollTo({ animated: true, x: 0 })
        }
      }, 500)
    }
  }

  render () {
    const children = this.props.children
    const stickyHeaderIndices = this.props.props.stickyHeaderIndices
    const {
      t,
      hasData,
      screenSwitchState,
      accountBalanceChartDataState,
      onIndexChanged,
      dateTillTimestamp,
      selectedIndex,
      currentSelectedAccountId,
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
      accountsCreditLimitFormatted,
      accountsBalanceFormatted,
      selectedAccounts,
      onOpenAccountsModal,
      companyId,
      isSearchOpen,
      bankTransNotExist,
      loaderProgress,
      navigation,
    } = this.props.propsPage
    const tableHeaderWrapperStyles = cs(isRtl, [styles.dataRow, styles.dataRowHeader], commonStyles.rowReverse)
    const totalBalanceTitle = (currentSelectedAccountId !== null) ? (selectedAccounts && selectedAccounts[0] && selectedAccounts[0].isUpdate ? t('sumsTitles:accountBalanceOne') : (selectedAccounts && selectedAccounts[0] && selectedAccounts[0].isShowItrot ? (`יתרה ל-${AppTimezone.moment(selectedAccounts[0].balanceLastUpdatedDate).format('DD/MM/YY')}`) : t('sumsTitles:accountBalanceOne'))) : t('sumsTitles:accountBalance')

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
        }} />

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
                  key={item.companyAccountId} />)
              }
            </Swiper>

            <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
              <View
                style={cs(!hasData, cs(hasAlert, styles.totalBalanceWrapper, styles.totalBalanceHasAlertWrapper), styles.totalBalanceZeroWrapper)}
              >
                <Text
                  style={styles.totalBalanceTitle}>{(currentSelectedAccountId !== null) ? t('sumsTitles:creditLimitOne') : t('sumsTitles:creditLimit')}</Text>

                <Text
                  style={styles.totalBalanceText}>{getCurrencyChar(selectedGroup)} {accountsCreditLimitFormatted}</Text>
              </View>

              <View
                style={cs(!hasData, cs(hasAlert, styles.totalBalanceWrapper, styles.totalBalanceHasAlertWrapper), styles.totalBalanceZeroWrapper)}>

                <Text
                  style={styles.totalBalanceTitle}>
                  {totalBalanceTitle}
                </Text>
                <Text style={styles.totalBalanceText}>{accountsBalanceFormatted}</Text>
              </View>
            </View>
          </View>
        )}

        {!isSearchOpen && hasAlert && (
          <Fragment>
            <View style={[styles.alertBorder]} />

            <View onLayout={onSetAlertPosition}>
              <AccountAlert
                navigation={navigation}
                currentCompanyId={companyId}
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
          <View style={{ marginBottom: 10 }}>
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
                <Text style={styles.tableHeadText}>{t('bankAccount:credit')}</Text>
                <Text style={styles.tableHeadText}>{t('bankAccount:debit')}</Text>
                <Text style={[styles.tableHeadText, {
                  flex: 1,
                  maxWidth: 90,
                }]}>{t('bankAccount:all')}</Text>
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
          contentContainerStyle={[{
            flexGrow: 1,
            paddingTop: 0,
            paddingBottom: 0,
          }]}>
          <View style={commonStyles.horizontalCenterContainer}>
            <CustomIcon name="bank-fees" size={56} color={colors.blue32} style={{ marginVertical: 16 }} />

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
          contentContainerStyle={[{
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

            <CustomIcon name="no-data" size={56} color={colors.gray9} style={{ marginBottom: 16 }} />

            <Button
              titleStyle={{
                fontFamily: fonts.regular,
              }}
              buttonStyle={[commonStyles.blueBtn, styles.bankAccountBtn]}
              onPress={onOpenAccountsModal}
              title={selectedAccounts.length ? t('common:changeFilter') : t('bankAccount:selectAccount')}
            />
          </View>
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
      currentOpenItemIndexInside: null,
      // titleSticky: props.bankTrans && props.bankTrans.length > 0 ? props.bankTrans[0].title : '',
    }
  }

  get accountsCreditLimit () {
    const {
      selectedAccounts,
      currentSelectedAccountId,
    } = this.props
    const currentAccount = selectedAccounts.find(a => a.companyAccountId === currentSelectedAccountId)
    if (currentAccount) {
      return Math.abs(currentAccount.creditLimit)
    } else {
      return Math.abs(selectedAccounts.reduce((memo, account) => {
        return memo + account.creditLimit
      }, 0))
    }
  }

  _onRefresh = () => {
    this.setState({ refreshing: true })
    this.props.refresh()
    setTimeout(() => {
      this.setState({ refreshing: false })
    }, 1000)
  }

  handleItemToggle = (item) => () => {
    const { currentOpenItemIndexInside } = this.state
    this.setState({ currentOpenItemIndexInside: currentOpenItemIndexInside === item ? null : item })
  }

  renderBankTransSectionHeader = ({ section }) => {
    const {
      isSearchOpen,
      openGraph,
      showAlert,
      bankTrans,
      accounts,
      selectedAccountIds,
    } = this.props

    const titleSticky = bankTrans && bankTrans.length > 0 ? bankTrans[0].title : ''

    if (section.total === undefined) {
      return <DataListSectionHeader
        section={section}
        showAlert={showAlert}
        openGraph={openGraph}
        screenSwitchState={!this.props.screenSwitchState}
        showIconGraph={!this.props.screenSwitchState && isSearchOpen && (titleSticky === section.title)}
        itra
        cashScreen={false}
        cashFlow={!this.props.screenSwitchState}
        account={accounts.find(a => a.companyAccountId === selectedAccountIds[0])}
      />
    } else {
      return <DataListSectionHeader
        section={section}
        showAlert={showAlert}
        openGraph={openGraph}
        screenSwitchState={!this.props.screenSwitchState}
        showIconGraph={!this.props.screenSwitchState && isSearchOpen && (titleSticky === section.title)}
        account={accounts.find(a => a.companyAccountId === selectedAccountIds[0])}
      />
    }
  }

  renderAggregatedScrollItem = ({ item, index }) => {
    const {
      onGetOneBankTrans,
      isRtl,
      accountAggregatedTodayTrans,
      dateTillTimestamp,
      accountTodayTrans,
      accounts,
      companyId,
      onUpdateBankTrans,
      onUpdateBankTransText,
      onRemoveBankTransCategory,
      onCreateBankTransCategory,
      accountsCreditLimit,
    } = this.props
    const { currentOpenItemIndexInside } = this.state

    const isToday = AppTimezone.moment().diff(dateTillTimestamp, 'days') === 0
    if (isToday && item.zhutTotal !== undefined) {
      return (
        <BankTransRowToday
          currentOpenItemIndexInside={currentOpenItemIndexInside}
          openBottomSheet={this.openBottomSheet}
          key={index}
          isRtl={isRtl}
          data={accountTodayTrans}
          accountAggregatedTodayTrans={accountAggregatedTodayTrans}
          accounts={accounts}
          companyId={companyId}
          onUpdateBankTrans={onUpdateBankTrans}
          onUpdateBankTransText={onUpdateBankTransText}
          onRemoveBankTransCategory={onRemoveBankTransCategory}
          onCreateBankTransCategory={onCreateBankTransCategory}
        />
      )
    } else {
      const itraRed = item.itra < accountsCreditLimit
      return (
        <BankTransRowLevelOne
          currentOpenItemIndexInside={currentOpenItemIndexInside}
          openBottomSheet={this.openBottomSheet}
          key={index}
          itraRed={itraRed}
          isRtl={isRtl}
          data={item}
          accounts={accounts}
          companyId={companyId}
          isOpen={(item._id + item.transDate) === currentOpenItemIndexInside}
          onItemToggle={this.handleItemToggle(item._id + item.transDate)}
          onGetBankTrans={onGetOneBankTrans}
          onUpdateBankTrans={onUpdateBankTrans}
          onUpdateBankTransText={onUpdateBankTransText}
          onRemoveBankTransCategory={onRemoveBankTransCategory}
          onCreateBankTransCategory={onCreateBankTransCategory}
        />
      )
    }
  }

  renderBankTransScrollItem = ({ item, index }) => {
    const {
      isRtl,
      // accounts,
      // companyId,
      // onUpdateBankTrans,
      // onUpdateBankTransText,
      // onRemoveBankTransCategory,
      // onCreateBankTransCategory,
      queryStatus,
    } = this.props
    const { currentOpenItemIndex } = this.state

    // return (
    //   <SectionRowWrapper
    //     queryStatus={queryStatus}
    //     disabledEdit={item.isToday}
    //     key={index}
    //     isOpen={(queryStatus && queryStatus.query !== null && queryStatus.query !== '') ? true : (item.bankTransId + item.transDate) === currentOpenItemIndex}
    //     isRtl={isRtl}
    //     companyId={companyId}
    //     bankTrans={item}
    //     account={accounts.find(a => a.companyAccountId === item.companyAccountId)}
    //     onItemToggle={openBottomSheet(item)}
    //     onUpdateBankTrans={onUpdateBankTrans}
    //     onUpdateBankTransText={onUpdateBankTransText}
    //     onRemoveBankTransCategory={onRemoveBankTransCategory}
    //     onCreateBankTransCategory={onCreateBankTransCategory}
    //   />
    // )

    return (
      <Row
        queryStatus={queryStatus}
        key={index}
        isOpen={(queryStatus && queryStatus.query !== null && queryStatus.query !== '') ? true : (item.bankTransId + item.transDate) === currentOpenItemIndex}
        isRtl={isRtl}
        bankTrans={item}
        onToggle={this.openBottomSheet(item)}
      />
    )
  }

  openBottomSheet = (item) => () => {
    const {
      openBottomSheet,
      screenSwitchState,
    } = this.props
    if (screenSwitchState) {
      this.setState({ currentOpenItemIndexInside: item.bankTransId + item.transDate })
    } else {
      this.setState({ currentOpenItemIndex: item.bankTransId + item.transDate })
    }
    openBottomSheet(item)
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

  renderItemSeparator = () => <View style={styles.dataRowSeparator} />

  handleScrollEnd = (e) => {
    this.props.onSetScrollPosition(e.nativeEvent.contentOffset.y)
  }

  UNSAFE_componentWillReceiveProps ({ screenSwitchState, currentSelectedAccountId, currentOpenItemIndex }) {
    if (currentOpenItemIndex === null) {
      if (!this.props.screenSwitchState) {
        this.setState({ currentOpenItemIndex: null })
      } else {
        this.setState({ currentOpenItemIndexInside: null })
      }
    }
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
      // console.log('title----', isViewable[0].section.title)
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
      inProgress,
      screenSwitchState,
      headerMaxHeight,
      bankTrans,
      selectedAccounts,
      accountAggregatedData,
      scrollAnim,
      isSearchOpen,
    } = this.props

    if (inProgress && screenSwitchState) {return <LoaderSimple containerStyle={{ paddingTop: headerMaxHeight }} />}

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
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollAnim } } }], {
            useNativeDriver: IS_IOS,
          })}
          renderScrollComponent={(props) => <ScrollCompWithHeader props={props} propsPage={this.props} />}
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
          style={[styles.accountsContainer, {
            flex: 1,
            position: 'relative',
          }]}
          contentContainerStyle={[styles.tableWrapper, {
            backgroundColor: '#ffffff',
            flexGrow: 1,
            paddingTop: 0,
            marginTop: 70,
            paddingBottom: 70,
          }]}
          ListHeaderComponent={this.renderFakeHeader}
          scrollEventThrottle={IS_IOS ? 16 : 1}
          sections={(accountAggregatedData && accountAggregatedData.accountTransactions && accountAggregatedData.accountTransactions.length > 0 && !inProgress) ? accountAggregatedData.accountTransactions : []}
          renderItem={this.renderAggregatedScrollItem}
          renderSectionHeader={this.renderBankTransSectionHeader}
          ItemSeparatorComponent={this.renderItemSeparator}
          keyExtractor={(item, index) => item._id + index}
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
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollAnim } } }], {
            useNativeDriver: IS_IOS,
          })}
          renderScrollComponent={(props) => <ScrollCompWithHeader props={props} propsPage={this.props} />}
          bounces
          bouncesZoom
          enableOnAndroid={false}
          removeClippedSubviews={IS_IOS && !(!hasData && selectedAccounts.length === 1)}
          stickySectionHeadersEnabled
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          scrollEnabled
          onScrollEndDrag={this.handleScrollEnd}
          onMomentumScrollEnd={this.handleScrollEnd}
          style={[styles.accountsContainer, {
            flex: 1,
            position: 'relative',
          }]}
          contentContainerStyle={[styles.tableWrapper, {
            backgroundColor: '#ffffff',
            flexGrow: 1,
            paddingTop: 0,
            marginTop: 35 + (isSearchOpen ? (IS_IOS ? 85 : 90) : 0),
            paddingBottom: 35 + (isSearchOpen ? (IS_IOS ? 85 : 90) : 0),
          }]}
          ListHeaderComponent={this.renderFakeHeader}
          scrollEventThrottle={IS_IOS ? 16 : 1}
          sections={(bankTrans && bankTrans.length > 0 && !inProgress) ? bankTrans : []}
          renderItem={this.renderBankTransScrollItem}
          renderSectionHeader={this.renderBankTransSectionHeader}
          ItemSeparatorComponent={this.renderItemSeparator}
          keyExtractor={(item, index) => (item.bankTransId + item.transDate)}
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
