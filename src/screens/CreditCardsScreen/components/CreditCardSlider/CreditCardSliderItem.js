import React, {Fragment, PureComponent} from 'react'
import {Image, Text, TouchableOpacity, View} from 'react-native'
import {isNull, maxBy, range} from 'lodash'
import AppTimezone from '../../../../utils/appTimezone'
import LinearGradient from 'react-native-linear-gradient'
import {withTranslation} from 'react-i18next'
import TextIcon from 'src/components/Icons/TextIcon'
import Loader from 'src/components/Loader/Loader'
import commonStyles from 'src/styles/styles'
import {combineStyles as cs, formatNumberToUnits} from 'src/utils/func'
import styles from './CreditCardSliderStyles'
import {colors} from 'src/styles/vars'
import {CARD_THEMES} from 'src/constants/card'

const numberFormat = new Intl.NumberFormat('he')

@withTranslation()
export default class CreditCardSliderItem extends PureComponent {
    constructor(props) {
        super(props)
        this.state = this.setInitialState(props.data)
    }

    get theme() {
        const {isAggregatedView, card} = this.props
        const defaultTheme = CARD_THEMES.default

        if (isAggregatedView) {return defaultTheme}

        const theme = CARD_THEMES[card.creditCardTypeId]
        return theme || defaultTheme
    }

    get availableCredit() {
        const {isAggregatedView, card, selectedCards} = this.props

        if (!isAggregatedView && isNull(card.creditLimit)) {return '-'}

        if (!isAggregatedView) {
            return `₪ ${numberFormat.format(Math.ceil(card.availableCredit))}`
        }

        const availableCredit = Math.ceil(selectedCards.reduce((sum, card) => sum + card.availableCredit, 0))
        return `₪ ${numberFormat.format(availableCredit)}`
    }

    get creditLimit() {
        const {isAggregatedView, card, selectedCards} = this.props
        if (!isAggregatedView && isNull(card.creditLimit)) {return '-'}
        if (!isAggregatedView) {return `₪ ${numberFormat.format(card.creditLimit)}`}

        const creditLimit = selectedCards.reduce((sum, card) => sum + card.creditLimit, 0)
        return `₪ ${numberFormat.format(creditLimit)}`
    }

    setInitialState = (data = []) => {
        const state = {
            maxMonth: null,
            yAxis: [],
        }

        if (!data || !data.length) {return state}

        state.maxMonth = maxBy(data, ({sumMonthlyTotal}) => sumMonthlyTotal)

        const maxSumMonthlyTotal = state.maxMonth.sumMonthlyTotal
        const multiplier = maxSumMonthlyTotal / 4
        state.yAxis = range(5).map((num, i) => formatNumberToUnits(i * multiplier)).reverse()

        return state
    };

    getBarHeight = (sumMonthlyTotal) => {
        const maxSumMonthlyTotal = this.state.maxMonth.sumMonthlyTotal
        const percent = Math.round(sumMonthlyTotal / maxSumMonthlyTotal * 100)
        if (percent && percent > 0) {return `${percent}%`}
        return 0
    };

    handleToggleCreditLimitInput = () => {
        const {card, onOpenCreditLimitModal, isAggregatedView} = this.props
        if (isAggregatedView) {return}
        if (card && isNull(card.creditLimit)) {
            onOpenCreditLimitModal(card.creditCardId)
        }
    };

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {data} = this.props
        if (data || (!data && !nextProps.data)) {return}
        this.setState({...this.setInitialState(nextProps.data)})
    }

    render() {
        const {
            isRtl,
            t,
            isAggregatedView,
            selectedCardsCount,
            onSetCreditLimitModalPosition,
            data,
            card,
            account,
            currentMonth,
        } = this.props
        const {yAxis} = this.state
        const theme = this.theme

        const isCreditLimitExist = isAggregatedView || (card && !isNull(card.creditLimit))

        return (
            <LinearGradient
                style={styles.itemWrapper}
                start={{x: 0, y: 1}}
                end={{x: 1, y: 0}}
                locations={[0, 1]}
                colors={theme.gradientColors}
            >
                <Image
                    style={styles.imgGradient}
                    resizeMode="cover"
                    source={require('BiziboxUI/assets/cardItemGradient.png')}
                />

                <View style={styles.itemHeadWrapper}>
                    <View style={cs(isAggregatedView, styles.itemHeadPart, commonStyles.justifyCenter)}>
                        {isAggregatedView ? (
                            <View style={[styles.cardIconWrapper, styles.cardCountWrapper]}>
                                <Text style={styles.cardCountText}>{selectedCardsCount}</Text>
                            </View>
                        ) : theme.imgUri ? (
                            <View
                                style={cs(card.creditCardTypeId === 25, styles.cardIconWrapper, styles.cardIcon25Wrapper)}>
                                <Image
                                    style={styles.cardIconImg}
                                    resizeMode="contain"
                                    source={theme.imgUri}
                                />
                            </View>
                        ) : null}

                        {!isAggregatedView &&
                        <Text style={styles.cardNicknameText} numberOfLines={1}>{account.accountNickname}</Text>}
                    </View>

                    <View style={cs(isAggregatedView, styles.itemHeadPart, commonStyles.justifyCenter)}>
                        <Text style={styles.cartNameText} numberOfLines={1}>
                            {isAggregatedView
                                ? t('creditCards:allSelectedCards')
                                : t(`creditCards:cardNameByType:${card.creditCardTypeId}`)}
                        </Text>

                        {!isAggregatedView &&
                        <Text style={styles.cardNumberText} numberOfLines={1}>
                            {card.creditCardNo} {!card.bankLoaded ? `(${t('creditCards:nonBank')})` : ''}
                        </Text>}
                    </View>
                </View>

                <View
                    style={cs(isRtl, styles.itemMiddleWrapper, commonStyles.rowReverse)}
                    onLayout={onSetCreditLimitModalPosition}
                >
                    <Fragment>
                        {!isAggregatedView && (
                            <View style={styles.itemMiddlePart}>
                                <Text style={[styles.itemMiddlePartTitleText, commonStyles.textLeft]}>
                                    {t('creditCards:billingDate')}
                                </Text>

                                <TextIcon
                                    isRtl={isRtl}
                                    text={`${card.cycleDay} ${t('creditCards:perMonth')}`}
                                    textStyle={[styles.itemMiddlePartValueText, commonStyles.textLeft]}
                                    iconName="calendar"
                                    iconSize={14}
                                    iconColor={colors.blue8}
                                />
                            </View>
                        )}

                        <View style={styles.itemMiddlePart}>
                            <Text style={cs(isAggregatedView, styles.itemMiddlePartTitleText, commonStyles.textLeft)}>
                                {t('creditCards:availableFrame')}
                            </Text>
                            <Text
                                style={cs(isAggregatedView, [styles.itemMiddlePartValueText, styles.itemMiddlePartValueGreenText], commonStyles.textLeft)}>
                                {this.availableCredit}
                            </Text>
                        </View>

                        <View style={styles.itemMiddlePart}>
                            <TouchableOpacity onPress={this.handleToggleCreditLimitInput}>
                                <Text style={[styles.itemMiddlePartTitleText, commonStyles.textRight]}>
                                    {t('creditCards:totalFrame')}
                                </Text>

                                {isCreditLimitExist ? (
                                    <Text style={[styles.itemMiddlePartValueText, commonStyles.textRight]}>
                                        {this.creditLimit}
                                    </Text>
                                ) : (
                                    <View style={[commonStyles.row, commonStyles.rowReverse]}>
                                        <Text style={[styles.itemNoCreditLimitText, {color: colors.red6}]}>
                                            {t('creditCards:notReceived')}{' '}
                                        </Text>
                                        <Text style={[styles.itemNoCreditLimitText, {color: colors.blue}]}>
                                            {t('creditCards:updateCreditLimit')}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                    </Fragment>
                </View>
                {(data && data.length) ? (
                    <View style={styles.itemGraphWrapper}>
                        <View style={styles.itemGraphYAxis}>
                            {yAxis.map((val, idx) => (
                                <Text
                                    key={val + idx.toString()}
                                    style={styles.itemGraphAxisText}
                                    numberOfLines={1}
                                >
                                    {val}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.itemGraphRightWrapper}>

                            <View style={styles.itemGraph}>
                                {data.map(({sumMonthlyTotal, cardDetails, month, _id}) => {
                                    const isNotFinal = cardDetails.some(c => c.notFinal)
                                    const isSelected = (currentMonth === month) || (currentMonth === (month + _id))

                                    return (
                                        <View
                                            key={month + _id}
                                            style={cs(
                                                isSelected,
                                                cs(
                                                    isNotFinal,
                                                    [styles.itemGraphBar, {height: this.getBarHeight(sumMonthlyTotal)}],
                                                    styles.itemGraphBarNotFinal,
                                                ),
                                                styles.itemGraphBarSelected,
                                            )}
                                        />
                                    )
                                })}
                            </View>

                            <LinearGradient
                                style={styles.itemGraphXAxis}
                                start={{x: 0, y: 1}}
                                end={{x: 1, y: 0}}
                                locations={[0, 1]}
                                colors={theme.gradientColors2}
                            >
                                {data.map(({month, _id}) => (
                                    <Text
                                        key={month + _id}
                                        style={styles.itemGraphAxisText}
                                    >
                                        {AppTimezone.moment(month).format('MM')}
                                    </Text>
                                ))}
                            </LinearGradient>
                        </View>
                    </View>
                ) : !data
                    ? (
                        <Loader
                            isDefault
                            containerStyle={{backgroundColor: 'transparent'}}
                            color={colors.white}
                        />
                    ) : null}

            </LinearGradient>
        )
    }
}
