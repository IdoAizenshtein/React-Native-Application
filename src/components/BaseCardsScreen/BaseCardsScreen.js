import React, {Fragment, PureComponent} from 'react'
import {cloneDeep, values} from 'lodash'
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    RefreshControl,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
    SafeAreaView,
} from 'react-native'
// import {SafeAreaView} from 'react-native-safe-area-context';
import Loader from 'src/components/Loader/Loader'
import CreditCardUpdateLimit from 'src/screens/CreditCardsScreen/components/CreditCardUpdateLimit'
import CustomIcon from 'src/components/Icons/Fontello'
import {Button} from 'react-native-elements'
import Swiper from 'react-native-swiper/src'

import {IS_IOS} from 'src/constants/common'
import commonStyles from 'src/styles/styles'
import styles, {HEADER_MIN_HEIGHT} from 'src/screens/CreditCardsScreen/CreditCardsStyles'
import {updateCreditLimit} from 'src/redux/actions/card'
import {combineStyles as cs, getErrText, goTo, sp} from 'src/utils/func'
import {creditCardCflUpdateApi} from 'src/api'
import {SLIDER_ITEM_HEIGHT} from 'src/screens/CreditCardsScreen/components/CreditCardSlider/CreditCardSliderStyles'
import {colors, fonts} from 'src/styles/vars'
import CreditCardAggregatedDataHead from 'src/screens/CreditCardsScreen/components/CreditCardAggregatedDataHead'
import FilterNotification from 'src/components/BaseCardsScreen/components/FilterNotification'
import {HEADER_ALERT_BORDER_HEIGHT} from 'src/screens/CreditCardsScreen/components/CreditCardHeaderStyles'
import {CreditCardsTab, SlikaTab} from 'src/screens/SettingsScreen/tabs'
import AlertsTrial from 'src/components/AlertsTrial/AlertsTrial'
import {KeyboardAwareFlatList, KeyboardAwareSectionList} from 'react-native-keyboard-aware-scroll-view'
import {Pagination} from 'react-native-snap-carousel'
import SlikaAlert from 'src/screens/SlikaScreen/components/SlikaAlert/SlikaAlert'
import CreditCardAlert from 'src/screens/CreditCardsScreen/components/CreditCardAlert/CreditCardAlert'
import {connect} from 'react-redux'
import {CLEARING_ACCOUNTS_TAB, CREDIT_CARDS_TAB} from '../../constants/settings';

const AnimatedSectionList = Animated.createAnimatedComponent(
    KeyboardAwareSectionList)
const AnimatedFlatList = Animated.createAnimatedComponent(KeyboardAwareFlatList)
const winWidth = Dimensions.get('window').width

const Modals = Modal

class ScrollCompWithHeader extends PureComponent {
    static listRef = null

    constructor(props) {
        super(props)
        this.state = {}
    }

    componentWillUnmount() {
        ScrollCompWithHeader.listRef = null
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (
            nextProps.currentSlideIndex !== this.props.currentSlideIndex
        ) {
            setTimeout(() => {
                if (ScrollCompWithHeader.listRef &&
                    ScrollCompWithHeader.listRef.scrollTo) {
                    ScrollCompWithHeader.listRef.scrollTo({
                        animated: true,
                        y: 0,
                    })
                }
            }, 500)
        }
    }

    render() {
        const children = this.props.children
        const stickyHeaderIndices = this.props.props.stickyHeaderIndices

        const {
            t,
            currentCompanyId,
            isRtl,
            currentSlideIndex,
            selectedCards,
            hasAlert,
            alertState,
            onOpenCardsModal,
            notHasData,
            type,
            cardsLengthExist,
            addCard,
            inProgressInside,
        } = this.props
        // console.log(notHasData, type)

        return (<ScrollView
            ref={scrollView => {
                if (scrollView) {
                    ScrollCompWithHeader.listRef = scrollView
                }
            }}
            {...this.props.props}
            stickyHeaderIndices={stickyHeaderIndices.map((i) => i + 1)}>
            <View>
                <View>
                    <Swiper
                        key={selectedCards.length}
                        loop={false}
                        width={winWidth}
                        height={232}
                        index={currentSlideIndex}
                        onIndexChanged={this.props.onSnapToItem}
                        showsPagination={false}>
                        {
                            this.props.selectedCardsSlider.map((item) => {
                                return this.props.renderItemInside({item})
                            })
                        }
                    </Swiper>
                    {/* {(this.props.selectedCards.length || this.props.isFiltersIncorrect) ? ( */}
                    {/* <View style={{ elevation: 2, zIndex: 2 }}> */}
                    {/* /!* <Carousel *!/ */}
                    {/* /!* loop *!/ */}
                    {/* /!* currentIndex={currentSlideIndex} *!/ */}
                    {/* /!* shouldOptimizeUpdates={false} *!/ */}
                    {/* /!* data={this.props.selectedCardsSlider} *!/ */}
                    {/* /!* renderItem={this.props.renderItemInside} *!/ */}
                    {/* /!* onSnapToItem={this.props.onSnapToItem} *!/ */}
                    {/* /!* sliderWidth={winWidth} *!/ */}
                    {/* /!* itemWidth={SLIDER_ITEM_WIDTH} *!/ */}
                    {/* /!* /> *!/ */}

                    {/**/}
                    {/* </View> */}
                    {/* ) : null} */}
                </View>

                {hasAlert && (
                    <Fragment>
                        <Animated.View style={[
                            {
                                flex: 1,
                                height: HEADER_ALERT_BORDER_HEIGHT,
                                backgroundColor: colors.red2,
                                zIndex: 4,
                            }]}/>

                        <View onLayout={this.props.onSetAlertPosition}>
                            {type === 'Card' && (
                                <CreditCardAlert
                                    navigation={this.props.navigation}
                                    currentCompanyId={currentCompanyId}
                                    t={t}
                                    isRtl={isRtl}
                                    selectedNotUpdatedCards={this.props.selectedNotUpdatedCards}
                                    selectedLowCreditLimitCards={this.props.selectedLowCreditLimitCards}
                                    selectedNoCreditLimitCards={this.props.selectedNoCreditLimitCards}
                                    onSelectCard={this.props.onSelectCard}
                                    onToggleAlertDetails={this.props.onToggleAlertDetails}
                                    {...alertState}
                                />
                            )}

                            {type === 'Slika' && (
                                <SlikaAlert
                                    navigation={this.props.navigation}
                                    t={t}
                                    currentCompanyId={currentCompanyId}
                                    isRtl={isRtl}
                                    selectedNotUpdatedCards={this.props.selectedNotUpdatedCards}
                                    onSelectCard={this.props.onSelectCard}
                                    onToggleAlertDetails={this.props.onToggleAlertDetails}
                                    {...alertState}
                                />
                            )}
                        </View>
                    </Fragment>
                )}

                {selectedCards.length > 1 && (
                    <View>
                        <Pagination
                            dotsLength={selectedCards.length + 1}
                            activeDotIndex={currentSlideIndex}
                            containerStyle={{
                                backgroundColor: 'transparent',
                                width: '100%',
                                bottom: 0,
                                paddingVertical: 10,
                            }}
                            dotStyle={{
                                width: 15,
                                height: 4,
                                borderRadius: 5,
                                backgroundColor: colors.green6,
                            }}
                            inactiveDotStyle={{
                                width: 15,
                                height: 4,
                                backgroundColor: colors.blue14,
                            }}
                            dotContainerStyle={{
                                marginHorizontal: 2,
                            }}
                            inactiveDotOpacity={1}
                            inactiveDotScale={1}
                        />
                    </View>
                )}
            </View>
            <Fragment>
                {(inProgressInside) && (
                    <Loader isDefault
                            containerStyle={{backgroundColor: 'transparent'}}
                            color={colors.blue}/>
                )}
                {children}
                {notHasData && type === 'Card' && (
                    <View
                        style={{
                            backgroundColor: 'white',
                            flex: 1,
                            marginTop: 120,
                            position: 'relative',
                            maxHeight: Dimensions.get('window').height - 75,
                        }}
                        contentContainerStyle={[
                            {
                                flexGrow: 1,
                                paddingTop: 0,
                                paddingBottom: 0,
                            }]}>
                        <View style={commonStyles.horizontalCenterContainer}>
                            <CustomIcon name="credit" size={56} color={colors.blue15}/>

                            <Text style={{
                                fontSize: sp(20),
                                marginTop: 15,
                                marginBottom: 18,
                                color: colors.blue5,
                                textAlign: 'center',
                                fontFamily: fonts.semiBold,
                            }}>
                                {cardsLengthExist && cardsLengthExist.length > 0
                                    ? t('common:noFilterFound')
                                    : t('creditCards:notExistCards')}
                            </Text>

                            {/* <Button */}
                            {/* buttonStyle={[commonStyles.blueBtn, { */}
                            {/* height: 51, */}
                            {/* width: 131, */}
                            {/* backgroundColor: colors.blue5, */}
                            {/* }]} */}
                            {/* onPress={cardsLengthExist && cardsLengthExist.length > 0 ? this.handleOpenCardsModal : this.addCard} */}
                            {/* title={cardsLengthExist && cardsLengthExist.length > 0 ? t('common:changeFilter') : t('creditCards:addCard')} */}
                            {/* /> */}
                        </View>
                    </View>
                )}
                {notHasData && type === 'Slika' && (
                    <View
                        style={{
                            backgroundColor: 'white',
                            flex: 1,
                            marginTop: 120,
                            position: 'relative',
                            maxHeight: Dimensions.get('window').height - 75,
                        }}
                        contentContainerStyle={[
                            {
                                flexGrow: 1,
                                paddingTop: 0,
                                paddingBottom: 0,
                            }]}>
                        <View style={commonStyles.horizontalCenterContainer}>
                            <Image
                                style={[
                                    {
                                        width: 56,
                                        height: 56,
                                    }]}
                                source={require('BiziboxUI/assets/slika_notexist.png')}
                            />
                            <Text style={{
                                fontSize: sp(20),
                                marginTop: 15,
                                marginBottom: 18,
                                color: colors.blue5,
                                textAlign: 'center',
                                fontFamily: fonts.semiBold,
                            }}>
                                {cardsLengthExist && cardsLengthExist.length > 0
                                    ? t('common:noFilterFound')
                                    : t('slika:noAccountsNotification')}
                            </Text>

                            {cardsLengthExist && cardsLengthExist.length > 0 && (
                                <Button
                                    buttonStyle={[
                                        commonStyles.blueBtn, {
                                            height: 51,
                                            width: 131,
                                            backgroundColor: colors.blue5,
                                        }]}
                                    onPress={cardsLengthExist && cardsLengthExist.length > 0
                                        ? onOpenCardsModal
                                        : addCard}
                                    title={cardsLengthExist && cardsLengthExist.length > 0 ? t(
                                        'common:changeFilter') : t('slika:noAccountsButtonText')}
                                />
                            )}

                        </View>
                    </View>
                )}
            </Fragment>
        </ScrollView>)
    }
}

@connect(state => ({
    globalParams: state.globalParams,
}))
export default class BaseCardsScreen extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            isReady: false,
            inProgress: false,
            inProgressInside: false,
            error: null,
            isLayoutComplete: false,
            cardsModalIsOpen: false,
            selectedCardIds: [],
            selectedCardIdsSave: [],
            currentCardSlideId: null,
            currentSlideIndex: 0,
            cardsData: [],
            cardsAggregatedData: [],
            headerMaxHeight: HEADER_MIN_HEIGHT,
            currentOpenItemIndex: null,
            currentOpenItem: null,
            alertYPosition: 0,
            creditLimitModalYPosition: 0,
            alertDetailsIsOpen: false,
            creditLimitUpdateIsOpen: false,
            newCreditLimit: '',
            currentCreditCardId: null,
            currentScrollPosition: 0,
            stateOpenTabAdd: false,
            refreshing: false,
            updateType: 'only',
            updateTypePopup: false,
        }
        this.currentScrollPosition = 0
        this.scrollY = this.initialScrollY
        this.flatListRef = null
    }

    get isLoader() {
        const {isReady, inProgress} = this.state
        return !isReady || inProgress
    }

    get headerScrollDistance() {
        // const headerScrollDistance = this.state.headerMaxHeight - this.headerMinHeight
        // return headerScrollDistance < 0 ? 0 : headerScrollDistance
        //
        //

        const {headerMaxHeight} = this.state
        const scrollDistance = headerMaxHeight
        return scrollDistance >= 0 ? scrollDistance : 0
    }

    get headerMinHeight() {
        return this.hasHeaderAlert
            ? HEADER_MIN_HEIGHT + HEADER_ALERT_BORDER_HEIGHT
            : HEADER_MIN_HEIGHT
    }

    get selectedCards() {
        const {getSelectedCards} = this.props
        const {selectedCardIds} = this.state
        return getSelectedCards(selectedCardIds)
    }

    get selectedNotUpdatedCards() {
        const {currentCardSlideId} = this.state
        if (currentCardSlideId === null) {
            return this.selectedCards.filter(c => c.isUpdate === false)
        } else {
            if (this.props.type === 'Slika') {
                return this.selectedCards.filter(
                    c => c.solekId === currentCardSlideId && c.isUpdate === false)
            } else {
                return this.selectedCards.filter(
                    c => c.creditCardId === currentCardSlideId && c.isUpdate === false)
            }
        }
    }

    get selectedLowCreditLimitCards() {
        const {currentCardSlideId} = this.state
        if (currentCardSlideId === null) {
            return this.selectedCards.filter(
                c => (c.availableCredit / c.creditLimit * 100) < 30)
        } else {
            return this.selectedCards.filter(
                c => c.creditCardId === currentCardSlideId &&
                    ((c.availableCredit / c.creditLimit * 100) < 30))
        }
    }

    get selectedNoCreditLimitCards() {
        const {currentCardSlideId} = this.state
        if (currentCardSlideId === null) {
            return this.selectedCards.filter(
                c => c.availableCredit <= 0 && c.creditLimit !== null)
        } else {
            return this.selectedCards.filter(
                c => c.creditCardId === currentCardSlideId && c.availableCredit <= 0 &&
                    c.creditLimit !== null)
        }
    }

    get currentData() {
        const {cardsData, currentCardSlideId} = this.state
        const {getCurrentData} = this.props
        return getCurrentData(cardsData, currentCardSlideId)
    }

    get initialScrollY() {
        return new Animated.Value(IS_IOS ? -HEADER_MIN_HEIGHT : 0)
    }

    get hasHeaderAlert() {
        if (!this.selectedCards.length) {
            return false
        }
        return values(this.headerAlertState).some(v => v)
    }

    get headerAlertState() {
        const {currentCardSlideId} = this.state
        const {getAlertState} = this.props
        return getAlertState(
            (currentCardSlideId === null) ? this.selectedCards : (this.props.type ===
            'Slika'
                ? this.selectedCards.filter(c => c.solekId === currentCardSlideId)
                : this.selectedCards.filter(
                    c => c.creditCardId === currentCardSlideId)),
            this.selectedNotUpdatedCards,
            this.selectedLowCreditLimitCards,
            this.selectedNoCreditLimitCards,
        )
    }

    get cardsAggregatedDataBySections() {
        const {getCardsAggregatedDataBySections} = this.props
        const {cardsAggregatedData} = this.state
        if (!cardsAggregatedData || !cardsAggregatedData.length) {
            return []
        }

        return getCardsAggregatedDataBySections(cardsAggregatedData)
    }

    get incorrectFilter() {
        const {
            accountsWithCards,
            cards,
        } = this.props
        return {
            noAccounts: !accountsWithCards.length,
            noCardSelected: !this.selectedCards.length,
            noCards: !cards.length,
        }
    }

    get isFilterIncorrect() {
        return Object.keys(this.incorrectFilter)
            .some(key => this.incorrectFilter[key] === true)
    }

    get selectedCardsSlider() {
        if (this.selectedCards.length > 1) {
            return [null, ...this.selectedCards]
        }
        return this.selectedCards
    }

    getAggregateData = (cardIds = null, setLoader = true) => {
        const {selectedCardIds} = this.state
        const {cards, onGetAggregateData, getFormattedAggregatedData, aggregatedBody} = this.props
        cardIds = cardIds || selectedCardIds
        if (setLoader) {
            this.setState({
                inProgress: true,
                isLayoutComplete: false,
                inProgressInside: false,
            })
        } else {
            this.setState({
                inProgressInside: true,
            })
        }
        if (cards.length) {
            const body = aggregatedBody(cardIds)
            return onGetAggregateData({body})
                .then(data => {
                    data = getFormattedAggregatedData(data, cardIds.length === 1)
                    if (cardIds.length === 1) {
                        return this.setData(data, cardIds[0])
                    }
                    return this.setAggregatedData(data)
                })
                .catch((err) => this.setState({
                    inProgress: false,
                    inProgressInside: false,
                    error: getErrText(err),
                }))
        } else {
            this.setState({
                inProgress: false,
                inProgressInside: false,
            })
        }
    }

    setData = (data, cardId) => {
        const {currentCardSlideId, cardsData} = this.state
        const {getLast12MonthData} = this.props
        const newCardsData = cloneDeep(cardsData)
        const oldIndex = newCardsData.findIndex(c => c.cardId === cardId)

        if (oldIndex >= 0) {
            newCardsData[oldIndex] = {
                data: getLast12MonthData(data, true),
                cardId,
            }
        } else {
            newCardsData.push({
                data: getLast12MonthData(data, true),
                cardId,
            })
        }

        this.setState({
            cardsData: newCardsData,
            currentCardSlideId: currentCardSlideId || cardId,
            inProgress: false,
            inProgressInside: false,
        })
    }

    setAggregatedData = (data) => {
        this.setState({
            cardsData: [],
            cardsAggregatedData: cloneDeep(data),
            currentCardSlideId: null,
            inProgress: false,
            inProgressInside: false,
        })
    }

    selectDefaultCards = () => {
        const {selectedCardIds} = this.props
        this.setState({selectedCardIds: selectedCardIds()}, this.getAggregateData)
    }

    handleSetHeaderHeight = (e) => {
        this.scrollY = new Animated.Value(IS_IOS ? -e.nativeEvent.layout.height : 0)
        this.setState({
            headerMaxHeight: e.nativeEvent.layout.height,
            isLayoutComplete: true,
        })
    }

    handleCloseCardsModal = () => {
        this.setState({
            selectedCardIds: JSON.parse(
                JSON.stringify(this.state.selectedCardIdsSave)),
            cardsModalIsOpen: false,
        })
    }

    handleSubmitCardsModal = () => {
        const {selectedCardIds} = this.state
        if (selectedCardIds.length > 0) {
            if (this.props.deleteParamsLink) {
                this.props.deleteParamsLink()
            }
            this.setState({
                cardsModalIsOpen: false,
                currentCardSlideId: null,
                selectedCardIdsSave: [],
            }, this.getAggregateData)
        }
    }

    handleOpenCreditLimitModal = (cardId) => {
        this.setState({
            creditLimitUpdateIsOpen: true,
            currentCreditCardId: cardId,
        })
    }

    handleCloseCreditLimitModal = () => {
        this.setState({
            creditLimitUpdateIsOpen: false,
            newCreditLimit: '',
        })
    }

    handleChangeCreditLimit = (value) => {
        this.setState({newCreditLimit: value})
    }

    handleSubmitNewCreditLimit = () => {
        const {cards, dispatch, onGetData} = this.props
        const {currentCreditCardId, newCreditLimit} = this.state
        if (!newCreditLimit.length || isNaN(newCreditLimit)) {
            return
        }
        const currentCreditCard = cards.find(
            card => card.creditCardId === currentCreditCardId)
        const updatedCreditCard = {
            ...currentCreditCard,
            creditLimit: Number(newCreditLimit),
        }

        dispatch(updateCreditLimit(updatedCreditCard))
        this.setState({
            creditLimitUpdateIsOpen: false,
            newCreditLimit: '',
            currentCreditCardId: null,
        })

        return creditCardCflUpdateApi.post({body: updatedCreditCard})
            .then(() => {
                onGetData()
                    .then(() => {
                        this.getAggregateData([currentCreditCard.creditCardId], false)
                    })
                    .catch((err) => this.setState({
                        isReady: true,
                        error: getErrText(err),
                    }))
            })
    }

    handleOpenCardsModal = () => {
        const {navigation} = this.props
        if (this.incorrectFilter.noAccounts) {
            goTo(navigation, 'SETTINGS', {
                paramsLinkAddCard: {
                    addCard: CLEARING_ACCOUNTS_TAB,
                },
            })
        } else {
            if (this.incorrectFilter.noCards) {
                goTo(navigation, 'SETTINGS', {
                    paramsLinkAddCard: {
                        addCard: CREDIT_CARDS_TAB,
                    },
                })
            } else {
                if (this.incorrectFilter.noCardSelected === false) {
                    this.setState({
                        selectedCardIdsSave: JSON.parse(JSON.stringify(this.state.selectedCardIds)),
                        cardsModalIsOpen: true,
                    })
                }
            }

        }

    }


    handleToggleSelectCard = (id) => {
        const {selectedCardIds} = this.state
        const hasSelected = selectedCardIds.includes(id)

        if (hasSelected) {
            return this.setState(
                {selectedCardIds: selectedCardIds.filter(s => s !== id)})
        }
        this.setState({selectedCardIds: [...selectedCardIds, id]})
    }

    handleToggleSelectCardGroup = (cardIds = []) => {
        const {selectedCardIds} = this.state
        if (!cardIds.length) {
            return
        }
        const hasSelected = cardIds.every(id => selectedCardIds.includes(id))

        if (hasSelected) {
            return this.setState({
                selectedCardIds: selectedCardIds.filter(id => !cardIds.includes(id)),
            })
        }
        this.setState({selectedCardIds: [...selectedCardIds, ...cardIds]})
    }

    handleToggleSelectAllCards = () => {
        const {cards, selectedCardIds: getSelectedCardIds} = this.props
        const {selectedCardIds} = this.state

        if (cards.length === selectedCardIds.length) {
            return this.setState({selectedCardIds: []})
        }
        this.setState({selectedCardIds: getSelectedCardIds()})
    }

    handleForceSelectCard = (id) => {
        this.setState({
            selectedCardIds: [id],
            alertDetailsIsOpen: false,
            cardsModalIsOpen: false,
            currentCardSlideId: null,
            selectedCardIdsSave: [],
        }, this.getAggregateData)
    }

    handleApplySelectedCards = () => {
        this.handleCloseCardsModal()
        this.getAggregateData()
    }

    handleItemToggle = (index, item) => () => {
        const {currentOpenItemIndex} = this.state
        this.setState({
            currentOpenItemIndex: currentOpenItemIndex === index ? null : index,
            currentOpenItem: currentOpenItemIndex === index ? null : item,
        })
    }

    renderCarouselItem = ({item}) => {
        const {
            getLast12MonthData,
            getCarouselItemData,
            SliderItem,
            aggregatedFutureBalance,
            aggregatedFutureCharges,
            aggregatedFutureCredits,
            type,
        } = this.props
        const {selectedCardIds, cardsData, cardsAggregatedData, currentOpenItem} = this.state

        if (!item) {
            return (
                <SliderItem
                    isAggregatedView
                    selectedCards={this.selectedCards}
                    selectedCardsCount={selectedCardIds.length}
                    futureBalance={aggregatedFutureBalance}
                    futureCharges={aggregatedFutureCharges}
                    futureCredits={aggregatedFutureCredits}
                    account={null}
                    card={null}
                    currentMonth={currentOpenItem ? ((currentOpenItem._id)
                        ? currentOpenItem.month + currentOpenItem._id
                        : currentOpenItem.month) : null}
                    data={getLast12MonthData(cardsAggregatedData)}
                />
            )
        }

        const getData = getCarouselItemData(item, cardsData)
        const account = getData.account
        const data = this.isFilterIncorrect ? item.data : getData.data
        let dataAll = false

        if (data && data.data) {
            if (type === 'Card') {
                dataAll = data.data.filter((it) => {
                    return (!it.cardDetails.length) || (it.cardDetails.length &&
                        it.cardDetails[0].monthlyTotal.iskatHul === 'ILS')
                })
            } else {
                dataAll = data.data
            }
        }

        return (
            <SliderItem
                isAggregatedView={false}
                account={account}
                card={item}
                currentMonth={currentOpenItem ? ((currentOpenItem._id)
                    ? currentOpenItem.month + currentOpenItem._id
                    : currentOpenItem.month) : null}
                onOpenCreditLimitModal={this.handleOpenCreditLimitModal}
                onSetCreditLimitModalPosition={this.handleSetCreditLimitModalPosition}
                data={dataAll}
            />
        )
    }

    onUpdateTrans = (newTransData) => {
        this.setState({
            updateTypePopup: newTransData,
        })
    }

    handleTransCategory = (transType) => () => {
        this.setState({
            updateType: transType,
        })
    }

    closeUpdateTypePopup = () => {
        const {updateTypePopup} = this.state
        const {
            onUpdateTrans,
        } = this.props
        onUpdateTrans(updateTypePopup)
        this.setState({
            updateTypePopup: false,
        })
    }

    updateTypeOfTrans = () => {
        const {updateTypePopup, updateType} = this.state
        const {
            onUpdateTrans,
        } = this.props
        onUpdateTrans(updateTypePopup, updateType)
        this.setState({
            updateTypePopup: false,
            updateType: updateType,
        })
    }

    renderScrollItem = ({item, index}) => {
        const {currentOpenItemIndex} = this.state
        const {
            isRtl,
            currentCompanyId,
            onRemoveCardTransCategory,
            onCreateCardTransCategory,
            onGetTransDetails,
            getScrollItemData,
            DataRow,
            t,
            navigation,
            onEdit,
        } = this.props

        const account = getScrollItemData(item, this.selectedCards).account
        // console.log('isOpen----', index === currentOpenItemIndex)
        return (
            <DataRow
                navigation={navigation}
                onEdit={onEdit}
                t={t}
                isRtl={isRtl}
                data={item}
                account={account}
                isOpen={index === currentOpenItemIndex}
                onGetDetails={onGetTransDetails}
                onItemToggle={this.handleItemToggle(index, item)}
                onUpdateCardTrans={this.onUpdateTrans}
                companyId={currentCompanyId}
                onRemoveCardTransCategory={onRemoveCardTransCategory}
                onCreateCardTransCategory={onCreateCardTransCategory}
            />
        )
    }

    renderAggregatedScrollItem = ({item, section, index}) => {
        const {
            isRtl,
            accountsWithCards,
            currentCompanyId,
            onRemoveCardTransCategory,
            onCreateCardTransCategory,
            onGetTransDetails,
            AggregatedDataRow,
            navigation,
            t,
            onEdit,
        } = this.props

        return (
            <AggregatedDataRow
                navigation={navigation}
                key={index + item._id}
                onEdit={onEdit}
                t={t}
                isRtl={isRtl}
                section={section}
                data={item}
                accounts={accountsWithCards}
                onGetDetails={onGetTransDetails}
                onUpdateCardTrans={this.onUpdateTrans}
                companyId={currentCompanyId}
                onRemoveCardTransCategory={onRemoveCardTransCategory}
                onCreateCardTransCategory={onCreateCardTransCategory}
            />
        )
    }

    renderAggregatedScrollHead = ({section}) => {
        return <CreditCardAggregatedDataHead section={section}
                                             type={this.props.type}/>
    }

    renderListHeader = () => {
        return <View style={{
            backgroundColor: colors.white,
            width: '100%',
            height: SLIDER_ITEM_HEIGHT,
        }}/>
    }

    renderSectionListHeader = () => {
        const {headerMaxHeight} = this.state
        return (
            <View
                style={{
                    backgroundColor: colors.white,
                    width: '100%',
                    height: headerMaxHeight - this.headerMinHeight,
                }}
            />
        )
    }

    handleSnapToItem = (index) => {
        const {selectedCardIds, cardsData} = this.state

        this.scrollY.setValue(IS_IOS ? -HEADER_MIN_HEIGHT : 0)
        console.log('--------render------------', index)
        // if (this.flatListRef) {
        //   const list = this.flatListRef.getNode()
        //   if (list.scrollToOffset) list.scrollToOffset({ offset: 0, animated: false })
        // }
        if (selectedCardIds.length > 1 && index === 0) {
            return this.setState({
                currentCardSlideId: null,
                currentSlideIndex: index,
                currentOpenItemIndex: null,
                inProgressInside: false,
            })
        }

        const cardId = selectedCardIds[selectedCardIds.length > 1
            ? index - 1
            : index]
        this.setState({
            currentCardSlideId: cardId,
            currentSlideIndex: index,
            currentOpenItemIndex: null,
            inProgressInside: true,
        })
        // console.log('--cardsData---', cardsData.find(d => d.cardId === cardId))
        if (cardsData.find(d => d.cardId === cardId)) {
            this.setState({
                inProgressInside: false,
            })
            return
        }
        return this.getAggregateData([cardId], false)
    }

    handleSetFlatListRef = ref => {
        this.flatListRef = ref
    }

    handleSetAlertPosition = (e) => this.setState(
        {alertYPosition: e.nativeEvent.layout.y})

    handleSetCreditLimitModalPosition = (e) => this.setState(
        {creditLimitModalYPosition: e.nativeEvent.layout.y})

    handleToggleAlertDetails = () => this.setState(
        {alertDetailsIsOpen: !this.state.alertDetailsIsOpen})

    handleScrollEnd = (e) => this.setState(
        {currentScrollPosition: e.nativeEvent.contentOffset.y})

    setContentOffsetY = (pos) => () => {
        this.currentScrollPosition = pos
    }

    renderItemSeparator = () => <View style={styles.dataRowSeparator}/>

    getData = () => {
        const {onGetData} = this.props
        onGetData()
            .then(() => {
                this.setState({isReady: true})
                this.selectDefaultCards()
            })
            .catch((err) => this.setState({
                isReady: true,
                error: getErrText(err),
            }))
    }

    componentDidMount() {
        this.getData()
    }

    addCard = () => {
        const {
            type,
        } = this.props
        this.setState({
            stateOpenTabAdd: type,
        })
    }

    closeParent = () => {
        this.setState({
            stateOpenTabAdd: false,
        })
    }

    _onRefresh = () => {
        this.setState({refreshing: true})
        this.getData()
        setTimeout(() => {
            this.setState({refreshing: false})
        }, 1000)
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

    render() {
        const {
            type,
            isRtl,
            isCreditCardScreen,
            accountsWithCards,
            cards,
            t,
            Header,
            Modal,
            Alert,
            selectedCardIds,
            companies,
            currentCompanyId,
            navigation,
        } = this.props
        const {
            cardsModalIsOpen,
            headerMaxHeight,
            isLayoutComplete,
            cardsAggregatedData,
            currentCardSlideId,
            currentSlideIndex,
            alertYPosition,
            creditLimitModalYPosition,
            alertDetailsIsOpen,
            creditLimitUpdateIsOpen,
            currentScrollPosition,
            newCreditLimit,
            stateOpenTabAdd,
            updateTypePopup,
            updateType,
            inProgressInside,
        } = this.state
        // console.log('-----------------------------------------,,,,,,',
        //   inProgressInside)
        const selectedCards = this.selectedCards
        const selectedNotUpdatedCards = this.selectedNotUpdatedCards
        const selectedLowCreditLimitCards = this.selectedLowCreditLimitCards
        const selectedNoCreditLimitCards = this.selectedNoCreditLimitCards
        const currentAggregatedData = this.currentData
        const alertState = this.headerAlertState
        const isFiltersIncorrect = Object.keys(this.incorrectFilter).some(key => this.incorrectFilter[key] === true)

        if (this.isLoader) {
            return <Loader/>
        }

        const currentCompany = companies.find(c => c.companyId === currentCompanyId)
        const cardsLengthExist = selectedCardIds()
        const notHasData = !inProgressInside && (
            (!cards || (cards && cards.length === 0)) ||
            (!selectedCards || (selectedCards && selectedCards.length === 0)) ||
            (!accountsWithCards || (Array.isArray(accountsWithCards) &&
                    (accountsWithCards && accountsWithCards.length === 0)) ||
                (!Array.isArray(accountsWithCards) &&
                    accountsWithCards.futureBallance === null &&
                    accountsWithCards.futureCharges === null &&
                    accountsWithCards.futureCredits === null)) ||
            (!cardsLengthExist ||
                (cardsLengthExist && cardsLengthExist.length === 0)) ||
            (currentCardSlideId &&
                isLayoutComplete && (!currentAggregatedData ||
                    (currentAggregatedData && currentAggregatedData.data &&
                        currentAggregatedData.data.length === 0))) ||
            (!currentCardSlideId &&
                isLayoutComplete &&
                (!cardsAggregatedData ||
                    (cardsAggregatedData && cardsAggregatedData.length === 0))
            )
        )

        return (
            <View style={commonStyles.mainContainer}>
                <AlertsTrial refresh={this._onRefresh}
                             updateToken={this.props.globalParams.updateToken}
                             navigation={navigation}/>

                {(!isLayoutComplete) && (
                    <Loader overlay containerStyle={{backgroundColor: colors.white}}/>
                )}
                <Fragment>
                    {(
                        ((cards && (cards && cards.length > 0)) &&
                            (selectedCards && (selectedCards && selectedCards.length > 0)) &&
                            (accountsWithCards && (Array.isArray(accountsWithCards) &&
                                (accountsWithCards.length > 0))) &&
                            (cardsLengthExist &&
                                (cardsLengthExist && cardsLengthExist.length > 0)) &&
                            (currentCardSlideId && isLayoutComplete))

                    ) && (
                        <AnimatedFlatList
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh}
                                />
                            }
                            renderScrollComponent={(props) => <ScrollCompWithHeader
                                props={props}
                                key={selectedCards.length}
                                addCard={this.addCard}
                                cardsLengthExist={cardsLengthExist}
                                type={type}
                                inProgressInside={inProgressInside}
                                notHasData={notHasData}
                                currentCompanyId={currentCompanyId}
                                t={t}
                                cardsModalIsOpen={cardsModalIsOpen}
                                isRtl={isRtl}
                                aaa={'FlatList'}
                                isFiltersIncorrect={isFiltersIncorrect}
                                currentSlideIndex={currentSlideIndex}
                                headerScrollDistance={this.headerScrollDistance}
                                scrollY={this.scrollY}
                                cards={cards}
                                selectedCards={selectedCards}
                                selectedCardsSlider={this.selectedCardsSlider}
                                selectedNotUpdatedCards={selectedNotUpdatedCards}
                                selectedLowCreditLimitCards={selectedLowCreditLimitCards}
                                selectedNoCreditLimitCards={selectedNoCreditLimitCards}
                                renderItemInside={this.renderCarouselItem}
                                alertYPosition={alertYPosition}
                                hasAlert={this.hasHeaderAlert}
                                filterStatus={this.incorrectFilter}
                                alertState={alertState}
                                onSetAlertPosition={this.handleSetAlertPosition}
                                onToggleAlertDetails={this.handleToggleAlertDetails}
                                onSelectCard={this.handleForceSelectCard}
                                onSnapToItem={this.handleSnapToItem}
                                onSetHeaderHeight={this.handleSetHeaderHeight}
                                onOpenCardsModal={this.handleOpenCardsModal}/>}
                            extraData={this.state}
                            ref={this.handleSetFlatListRef}
                            showsVerticalScrollIndicator={false}
                            style={styles.dataContainer}
                            contentContainerStyle={[
                                styles.listWrapper, {
                                    marginTop: headerMaxHeight,
                                    paddingBottom: headerMaxHeight,
                                    flexGrow: 1,
                                }]}
                            scrollEventThrottle={1}
                            onScroll={Animated.event(
                                [{nativeEvent: {contentOffset: {y: this.scrollY}}}],
                                {useNativeDriver: true})}
                            data={(currentAggregatedData && currentAggregatedData.data &&
                                currentAggregatedData.data.length > 0)
                                ? [...currentAggregatedData.data].reverse()
                                : []}
                            renderItem={this.renderScrollItem}
                            ItemSeparatorComponent={this.renderItemSeparator}
                            ListHeaderComponent={this.renderFakeHeaderTop}
                            keyExtractor={(item, index) => `${item._id}_${index}`}
                            onScrollEndDrag={this.handleScrollEnd}
                            onMomentumScrollEnd={this.handleScrollEnd}
                            bounces
                            bouncesZoom
                            enableOnAndroid={false}
                            removeClippedSubviews
                        />
                    )}

                    {(((cards && (cards && cards.length > 0)) &&
                        (selectedCards && (selectedCards && selectedCards.length > 0)) &&
                        (accountsWithCards && (Array.isArray(accountsWithCards) &&
                            (accountsWithCards.length > 0))) &&
                        (cardsLengthExist &&
                            (cardsLengthExist && cardsLengthExist.length > 0)) &&
                        !currentCardSlideId &&
                        cardsAggregatedData &&
                        isLayoutComplete
                    )) && (
                        <AnimatedSectionList
                            refreshControl={
                                <RefreshControl
                                    refreshing={this.state.refreshing}
                                    onRefresh={this._onRefresh}
                                />
                            }
                            extraData={this.state}
                            onScrollEndDrag={(e) => {
                                this.setContentOffsetY(e.nativeEvent.contentOffset.y)()
                            }}
                            onMomentumScrollEnd={(e) => {
                                this.setContentOffsetY(e.nativeEvent.contentOffset.y)()
                            }}
                            stickySectionHeadersEnabled
                            showsVerticalScrollIndicator={false}
                            style={styles.dataContainer}
                            contentContainerStyle={[
                                styles.listWrapper, {
                                    marginTop: this.headerMinHeight,
                                    paddingBottom: this.headerMinHeight,
                                    flexGrow: 1,
                                }]}
                            scrollEventThrottle={IS_IOS ? 16 : 1}
                            onScroll={
                                Animated.event(
                                    [{nativeEvent: {contentOffset: {y: this.scrollY}}}],
                                    {
                                        useNativeDriver: true,
                                    },
                                )
                            }
                            renderScrollComponent={(props) => <ScrollCompWithHeader
                                props={props}
                                type={type}
                                aaa={'SectionList'}
                                addCard={this.addCard}
                                cardsLengthExist={cardsLengthExist}
                                notHasData={notHasData}
                                inProgressInside={inProgressInside}
                                t={t}
                                currentCompanyId={currentCompanyId}
                                cardsModalIsOpen={cardsModalIsOpen}
                                isRtl={isRtl}
                                isFiltersIncorrect={isFiltersIncorrect}
                                currentSlideIndex={currentSlideIndex}
                                headerScrollDistance={this.headerScrollDistance}
                                scrollY={this.scrollY}
                                cards={cards}
                                selectedCards={selectedCards}
                                selectedCardsSlider={this.selectedCardsSlider}
                                selectedNotUpdatedCards={selectedNotUpdatedCards}
                                selectedLowCreditLimitCards={selectedLowCreditLimitCards}
                                selectedNoCreditLimitCards={selectedNoCreditLimitCards}
                                renderItemInside={this.renderCarouselItem}
                                alertYPosition={alertYPosition}
                                hasAlert={this.hasHeaderAlert}
                                filterStatus={this.incorrectFilter}
                                alertState={alertState}
                                onSetAlertPosition={this.handleSetAlertPosition}
                                onToggleAlertDetails={this.handleToggleAlertDetails}
                                onSelectCard={this.handleForceSelectCard}
                                onSnapToItem={this.handleSnapToItem}
                                onSetHeaderHeight={this.handleSetHeaderHeight}
                                onOpenCardsModal={this.handleOpenCardsModal}
                            />}
                            sections={this.cardsAggregatedDataBySections}
                            renderItem={this.renderAggregatedScrollItem}
                            renderSectionHeader={this.renderAggregatedScrollHead}
                            ItemSeparatorComponent={this.renderItemSeparator}
                            ListHeaderComponent={this.renderFakeHeaderTop}
                            keyExtractor={(item, index) => `${item._id}_${index}`}
                            initialNumToRender={55}
                            windowSize={5}
                            keyboardShouldPersistTaps="handled"
                            scrollEnabled
                            bounces
                            bouncesZoom
                            enableOnAndroid={false}
                            removeClippedSubviews
                        />
                    )}

                    {isFiltersIncorrect ? (
                        <FilterNotification
                            style={{marginTop: headerMaxHeight + 40}}
                            filterStatuses={this.incorrectFilter}
                            onPress={this.handleOpenCardsModal}
                        />
                    ) : null}

                    {stateOpenTabAdd === 'Card' && (
                        <CreditCardsTab
                            closeParent={this.closeParent}
                            paramsLinkAddCard
                            navigation={navigation}
                            currentCompany={currentCompany}
                            companies={companies}
                        />
                    )}
                    {stateOpenTabAdd === 'Slika' && (
                        <SlikaTab
                            closeParent={this.closeParent}
                            paramsLinkAddCard
                            navigation={navigation}
                            currentCompany={currentCompany}
                            companies={companies}
                        />
                    )}

                    <Header
                        currentCompanyId={currentCompanyId}
                        cardsModalIsOpen={cardsModalIsOpen}
                        isRtl={isRtl}
                        isFiltersIncorrect={isFiltersIncorrect}
                        currentSlideIndex={currentSlideIndex}
                        headerScrollDistance={this.headerScrollDistance}
                        scrollY={this.scrollY}
                        cards={cards}
                        selectedCards={selectedCards}
                        selectedNotUpdatedCards={selectedNotUpdatedCards}
                        selectedLowCreditLimitCards={selectedLowCreditLimitCards}
                        selectedNoCreditLimitCards={selectedNoCreditLimitCards}
                        // renderItem={this.renderCarouselItem}
                        alertYPosition={alertYPosition}
                        hasAlert={this.hasHeaderAlert}
                        filterStatus={this.incorrectFilter}
                        alertState={alertState}
                        onSetAlertPosition={this.handleSetAlertPosition}
                        onToggleAlertDetails={this.handleToggleAlertDetails}
                        onSelectCard={this.handleForceSelectCard}
                        onSnapToItem={this.handleSnapToItem}
                        onSetHeaderHeight={this.handleSetHeaderHeight}
                        onOpenCardsModal={this.handleOpenCardsModal}
                    />

                    {(alertDetailsIsOpen && Alert) ? (
                        <Alert
                            t={t}
                            isRtl={isRtl}
                            top={alertYPosition - ((!currentCardSlideId)
                                ? this.currentScrollPosition
                                : currentScrollPosition)}
                            selectedNotUpdatedCards={selectedNotUpdatedCards}
                            selectedLowCreditLimitCards={selectedLowCreditLimitCards}
                            selectedNoCreditLimitCards={selectedNoCreditLimitCards}
                            alertState={alertState}
                            onSelectCard={this.handleForceSelectCard}
                            onClose={this.handleToggleAlertDetails}
                        />
                    ) : null}

                    {isCreditCardScreen && creditLimitUpdateIsOpen && (
                        <CreditCardUpdateLimit
                            t={t}
                            creditLimit={newCreditLimit}
                            onSubmit={this.handleSubmitNewCreditLimit}
                            onChange={this.handleChangeCreditLimit}
                            onClose={this.handleCloseCreditLimitModal}
                            creditLimitModalYPosition={creditLimitModalYPosition}
                            currentScrollPosition={((!currentCardSlideId)
                                ? this.currentScrollPosition
                                : currentScrollPosition)}
                        />
                    )}

                    {cardsModalIsOpen && (
                        <Modal
                            onSubmit={this.handleSubmitCardsModal}
                            isOpen
                            isRtl={isRtl}
                            accounts={accountsWithCards}
                            cards={cards}
                            selectedCards={selectedCards}
                            onSelectGroup={this.handleToggleSelectCardGroup}
                            onSelectItem={this.handleToggleSelectCard}
                            onSelectAll={this.handleToggleSelectAllCards}
                            onClose={this.handleCloseCardsModal}
                        />
                    )}

                    <Modals
                        animationType="slide"
                        transparent={false}
                        visible={updateTypePopup !== false}
                        onRequestClose={() => {
                            // //console.log('Modal has been closed.')
                        }}>
                        <SafeAreaView style={{
                            flex: 1,
                            marginTop: 0,
                            paddingTop: 0,
                            position: 'relative',
                        }}>
                            <View style={{
                                flex: 1,
                                // alignItems: 'center',
                            }}>

                                <View style={{
                                    height: 60,
                                    backgroundColor: '#002059',
                                    width: '100%',
                                    paddingTop: 0,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    alignContent: 'center',
                                    justifyContent: 'center',
                                }}>
                                    <View style={cs(
                                        !isRtl,
                                        [
                                            {
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                            }],
                                        commonStyles.rowReverse,
                                    )}>
                                        <View style={{
                                            // flex: 15,
                                            alignSelf: 'center',
                                        }}>
                                            <TouchableOpacity onPress={this.closeUpdateTypePopup}>
                                                <Text style={{
                                                    fontSize: sp(16),
                                                    color: '#ffffff',
                                                    fontFamily: fonts.semiBold,
                                                }}>{'ביטול'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <View style={{
                                            alignItems: 'center',
                                            flex: 70,
                                            alignSelf: 'center',
                                        }}>
                                            <Text
                                                style={{
                                                    fontSize: sp(20),
                                                    color: '#ffffff',
                                                    fontFamily: fonts.semiBold,
                                                    textAlign: 'center',
                                                }}>
                                                {'קטגוריה'}
                                            </Text>
                                        </View>
                                        <View style={{
                                            // flex: 15,
                                            alignSelf: 'center',
                                        }}>
                                            <TouchableOpacity onPress={this.updateTypeOfTrans}>
                                                <Text style={{
                                                    fontSize: sp(16),
                                                    color: '#ffffff',
                                                    fontFamily: fonts.semiBold,
                                                }}>{'אישור'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>

                                <View style={{
                                    width: '100%',
                                    height: '100%',
                                    marginTop: 15,
                                    marginBottom: 10,
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                    flex: 1,
                                }}>
                                    <ScrollView
                                        style={[
                                            {
                                                flex: 1,
                                                position: 'relative',
                                            }]}
                                        contentContainerStyle={[
                                            {
                                                backgroundColor: '#ffffff',
                                                flexGrow: 1,
                                                paddingTop: 0,
                                                marginTop: 0,
                                                paddingBottom: 0,
                                            }]}>

                                        <View style={{
                                            marginBottom: 15,
                                        }}>
                                            <Text style={{
                                                fontSize: sp(22),
                                                color: colors.blue32,
                                                fontFamily: fonts.regular,
                                                textAlign: 'center',
                                            }}>
                                                {'האם ברצונך לקטלג את '}
                                                <Text style={{
                                                    fontFamily: fonts.semiBold,
                                                }}>{updateTypePopup.mainDesc
                                                    ? updateTypePopup.mainDesc
                                                    : updateTypePopup.mainDescription}</Text></Text>
                                            <Text style={{
                                                fontSize: sp(22),
                                                color: colors.blue32,
                                                fontFamily: fonts.regular,
                                                textAlign: 'center',
                                            }}>
                                                {'כ'}
                                                <Text style={{
                                                    fontFamily: fonts.semiBold,
                                                }}>{updateTypePopup.transTypeName}</Text>
                                                {' גם עבור'}
                                            </Text>
                                        </View>

                                        <View
                                            style={[
                                                cs(this.props.isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginBottom: 8,
                                                }]}>
                                            <View style={{
                                                flex: 0.46,
                                                alignItems: 'flex-end',
                                            }}/>
                                            <View style={{
                                                flex: 7.3,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                            }}>
                                                <TouchableOpacity
                                                    style={[
                                                        cs(this.props.isRtl, commonStyles.row,
                                                            [commonStyles.rowReverse]), {
                                                            flex: 1,
                                                            flexDirection: 'row',
                                                            justifyContent: 'flex-end',
                                                            alignItems: 'center',
                                                        }]}
                                                    onPress={this.handleTransCategory('only')}>
                                                    <View style={{
                                                        marginRight: 'auto',
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                    }}>
                                                        {updateType === 'only' && (
                                                            <CustomIcon name="ok" size={16}
                                                                        color={colors.blue34}/>)}
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.dataRowLevel3Text, {
                                                                fontSize: sp(15),
                                                                lineHeight: 42,
                                                            }, commonStyles.regularFont]}
                                                        numberOfLines={1}
                                                        ellipsizeMode="tail">
                                                        {'תנועה זו בלבד'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View
                                            style={[
                                                cs(this.props.isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginBottom: 8,
                                                }]}>
                                            <View style={{
                                                flex: 0.46,
                                                alignItems: 'flex-end',
                                            }}/>
                                            <View style={{
                                                flex: 7.3,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                            }}>
                                                <TouchableOpacity
                                                    style={[
                                                        cs(this.props.isRtl, commonStyles.row,
                                                            [commonStyles.rowReverse]), {
                                                            flex: 1,
                                                            flexDirection: 'row',
                                                            justifyContent: 'flex-end',
                                                            alignItems: 'center',
                                                        }]}
                                                    onPress={this.handleTransCategory('both')}>
                                                    <View style={{
                                                        marginRight: 'auto',
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                    }}>
                                                        {updateType === 'both' && (
                                                            <CustomIcon name="ok" size={16}
                                                                        color={colors.blue34}/>)}
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.dataRowLevel3Text, {
                                                                fontSize: sp(15),
                                                                lineHeight: 42,
                                                            }, commonStyles.regularFont]}
                                                        numberOfLines={1}
                                                        ellipsizeMode="tail">
                                                        {'כל התנועות'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View
                                            style={[
                                                cs(this.props.isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginBottom: 8,
                                                }]}>
                                            <View style={{
                                                flex: 0.46,
                                                alignItems: 'flex-end',
                                            }}/>
                                            <View style={{
                                                flex: 7.3,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                            }}>
                                                <TouchableOpacity
                                                    style={[
                                                        cs(this.props.isRtl, commonStyles.row,
                                                            [commonStyles.rowReverse]), {
                                                            flex: 1,
                                                            flexDirection: 'row',
                                                            justifyContent: 'flex-end',
                                                            alignItems: 'center',
                                                        }]}
                                                    onPress={this.handleTransCategory('past')}>
                                                    <View style={{
                                                        marginRight: 'auto',
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                    }}>
                                                        {updateType === 'past' && (
                                                            <CustomIcon name="ok" size={16}
                                                                        color={colors.blue34}/>)}
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.dataRowLevel3Text, {
                                                                fontSize: sp(15),
                                                                lineHeight: 42,
                                                            }, commonStyles.regularFont]}
                                                        numberOfLines={1}
                                                        ellipsizeMode="tail">
                                                        {'תנועות עבר'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                        <View
                                            style={[
                                                cs(this.props.isRtl, commonStyles.row,
                                                    [commonStyles.rowReverse]), {
                                                    height: 42,
                                                    marginBottom: 8,
                                                }]}>
                                            <View style={{
                                                flex: 0.46,
                                                alignItems: 'flex-end',
                                            }}/>
                                            <View style={{
                                                flex: 7.3,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                            }}>
                                                <TouchableOpacity
                                                    style={[
                                                        cs(this.props.isRtl, commonStyles.row,
                                                            [commonStyles.rowReverse]), {
                                                            flex: 1,
                                                            flexDirection: 'row',
                                                            justifyContent: 'flex-end',
                                                            alignItems: 'center',
                                                        }]}
                                                    onPress={this.handleTransCategory('future')}>
                                                    <View style={{
                                                        marginRight: 'auto',
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-start',
                                                        alignItems: 'center',
                                                    }}>
                                                        {updateType === 'future' && (
                                                            <CustomIcon name="ok" size={16}
                                                                        color={colors.blue34}/>)}
                                                    </View>
                                                    <Text
                                                        style={[
                                                            styles.dataRowLevel3Text, {
                                                                fontSize: sp(15),
                                                                lineHeight: 42,
                                                            }, commonStyles.regularFont]}
                                                        numberOfLines={1}
                                                        ellipsizeMode="tail">
                                                        {'תנועות עתיד'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    </ScrollView>
                                </View>
                            </View>
                        </SafeAreaView>
                    </Modals>

                </Fragment>
            </View>
        )
    }
}
