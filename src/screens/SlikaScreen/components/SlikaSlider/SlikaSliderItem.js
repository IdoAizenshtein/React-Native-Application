import React, { Fragment, PureComponent } from 'react'
import { Image, Text, View } from 'react-native'
import { maxBy, range } from 'lodash'
import AppTimezone from '../../../../utils/appTimezone'
import LinearGradient from 'react-native-linear-gradient'
import { withTranslation } from 'react-i18next'
import Loader from 'src/components/Loader/Loader'
import {
  combineStyles as cs,
  formatNumberToUnits,
  getCurrencyChar,
  sp,
} from 'src/utils/func'
import styles from './SlikaSliderStyles'
import commonStyles from 'src/styles/styles'
import { colors, fonts } from 'src/styles/vars'
import { CARD_THEMES } from 'src/constants/card'
import { CURRENCIES } from 'src/constants/common'

const numberFormat = new Intl.NumberFormat('he')

@withTranslation()
export default class SlikaSliderItem extends PureComponent {
  constructor (props) {
    super(props)
    this.state = this.setInitialState(props.data)
  }

  get theme () {
    const { isAggregatedView, card } = this.props
    const defaultTheme = {
      ...CARD_THEMES[80],
      imgUri: null,
    }

    if (isAggregatedView) {return defaultTheme}

    const theme = CARD_THEMES[card.solekBankId]
    return theme || defaultTheme
  }

  setInitialState = (data = []) => {
    const state = {
      maxMonth: null,
      yAxis: [],
    }

    if (!data || !data.length) {return state}

    state.maxMonth = maxBy(data, ({ sumMonthlyTotal }) => sumMonthlyTotal)

    const maxSumMonthlyTotal = state.maxMonth.sumMonthlyTotal
    const multiplier = maxSumMonthlyTotal / 4
    state.yAxis = range(5)
      .map((num, i) => formatNumberToUnits(i * multiplier))
      .reverse()

    return state
  }

  getBarHeight = (sumMonthlyTotal) => {
    const maxSumMonthlyTotal = this.state.maxMonth.sumMonthlyTotal
    const percent = Math.round(sumMonthlyTotal / maxSumMonthlyTotal * 100)
    if (percent && percent > 0) {return `${percent}%`}
    return 0
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    const { data } = this.props
    if (data || (!data && !nextProps.data)) {return}
    this.setState({ ...this.setInitialState(nextProps.data) })
  }

  render () {
    const {
      t,
      isAggregatedView,
      selectedCardsCount,
      futureBalance,
      futureCharges,
      futureCredits,
      data,
      card,
      account,
      currentMonth,
    } = this.props
    const { yAxis } = this.state
    const theme = this.theme

    // if(currentOpenItem && data && data.data){
    //   debugger
    // }

    return (
      <LinearGradient
        style={styles.itemWrapper}
        start={{
          x: 0,
          y: 1,
        }}
        end={{
          x: 1,
          y: 0,
        }}
        locations={[0, 1]}
        colors={theme.gradientColors}
      >
        <Image
          style={styles.imgGradient}
          resizeMode="cover"
          source={require('BiziboxUI/assets/cardItemGradient.png')}
        />

        <View style={styles.itemHeadWrapper}>
          <View style={[
            commonStyles.justifyCenter,
            isAggregatedView ? styles.itemHeadPart : { flex: 1 },
            {}]}>
            <View style={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row-reverse',
            }}>
              {isAggregatedView ? (
                <Fragment>
                  <Text
                    style={[styles.cartBalanceText, { marginBottom: 0 }]}>{t(
                    'slika:allSelectedCards')}</Text>
                  <View
                    style={[styles.cardIconWrapper, styles.cardCountWrapper]}>
                    <Text>
                      <Text style={styles.cartBalanceText}>{t(
                        'slika:cardsCount')}{' '}</Text>
                      <Text style={styles.cardCountText}>
                        {selectedCardsCount}
                      </Text>
                    </Text>
                  </View>
                </Fragment>
              ) : (<Fragment>
                <View style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      flex: 1,
                      fontSize: sp(19),
                      color: '#ffffff',
                      textAlign: 'right',
                      fontFamily: fonts.semiBold,
                    }}>
                    {card.solekDesc}
                  </Text>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={{
                      flex: 1,
                      fontSize: sp(18),
                      color: '#ffffff',
                      textAlign: 'right',
                      fontFamily: fonts.regular,
                    }}>
                    {card.solekNum}
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}>
                  <View style={[
                    styles.cardIconWrapper, {
                      maxWidth: 50,
                    }]}>
                    {theme.imgUri && (
                      <Image
                        resizeMode="contain"
                        style={styles.cardIconImg}
                        source={theme.imgUri}
                      />
                    )}
                  </View>
                  <Text numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          fontSize: sp(15),
                          color: '#ffffff',
                          textAlign: 'center',
                          fontFamily: fonts.regular,
                        }}>
                    {t(`bankName:${account.bankId}`)} {account.bankAccountId}
                  </Text>
                </View>
              </Fragment>)
              }
            </View>
          </View>
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

                {data.map(({ sumMonthlyTotal, soleksTotals, month, _id }) => {
                  const isNotFinal = soleksTotals.some(c => c.notFinal)
                  const isSelected = (currentMonth === month) ||
                    (currentMonth === (month + _id))
                  // console.log(isSelected)
                  return (
                    <View
                      key={month + _id}
                      style={[
                        { height: this.getBarHeight(sumMonthlyTotal) },
                        cs(
                          isSelected,
                          cs(isNotFinal,
                            [styles.itemGraphBar],
                            styles.itemGraphBarNotFinal),
                          styles.itemGraphBarSelected,
                        ),
                      ]}
                    />
                  )
                })}
              </View>

              <LinearGradient
                style={styles.itemGraphXAxis}
                start={{
                  x: 0,
                  y: 1,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                locations={[0, 1]}
                colors={theme.gradientColors2}
              >
                {data.map(({ month, _id }) => (
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
              containerStyle={{ backgroundColor: 'transparent' }}
              color={colors.white}
            />
          ) : null}

        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          left: 0,
          marginTop: 12.5,
          height: 43,
          backgroundColor: '#dae0e6',
          flexDirection: 'row-reverse',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 10,
        }}>
          <View style={{
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: sp(14),
                color: '#0f3860',
                textAlign: 'center',
                fontFamily: fonts.regular,
              }}>
              זיכויים עתידיים
            </Text>

            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: sp(19),
                fontFamily: fonts.semiBold,
                color: '#0f3860',
                textAlign: 'center',
              }}>
              {isAggregatedView ? (
                `${getCurrencyChar(CURRENCIES.ILS)} ${futureCredits &&
                numberFormat.format(futureCredits.toString().split('.')[0])}`
              ) : card.futureCredits ? (
                `${getCurrencyChar(CURRENCIES.ILS)} ${card &&
                numberFormat.format(
                  card.futureCredits.toString().split('.')[0])}`
              ) : '-'
              }
            </Text>
          </View>
          <View style={{
            alignSelf: 'center',
          }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: sp(23),
                fontFamily: fonts.semiBold,
                color: '#0f3860',
                textAlign: 'center',
              }}>-</Text>
          </View>
          <View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: sp(14),
                color: '#0f3860',
                textAlign: 'center',
                fontFamily: fonts.regular,
              }}>
              התחייבויות עתידיות
            </Text>

            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: sp(19),
                fontFamily: fonts.semiBold,
                color: '#0f3860',
                textAlign: 'center',
              }}>
              {isAggregatedView ? (
                `${getCurrencyChar(CURRENCIES.ILS)} ${futureCharges &&
                numberFormat.format(futureCharges.toString().split('.')[0])}`
              ) : card.futureCharges ? (
                `${getCurrencyChar(CURRENCIES.ILS)} ${card &&
                numberFormat.format(
                  card.futureCharges.toString().split('.')[0])}`
              ) : '-'
              }
            </Text>
          </View>
          <View style={{
            alignSelf: 'center',
          }}>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: sp(23),
                fontFamily: fonts.semiBold,
                color: '#0f3860',
                textAlign: 'center',
              }}>=</Text>
          </View>
          <View>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: sp(14),
                color: '#0f3860',
                textAlign: 'center',
                fontFamily: fonts.regular,
              }}>
              {t('slika:futureBalance')}
            </Text>

            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                fontSize: sp(19),
                fontFamily: fonts.semiBold,
                color: '#13927b',
                textAlign: 'center',
              }}>
              {isAggregatedView ? (
                `${getCurrencyChar(CURRENCIES.ILS)} ${futureBalance &&
                numberFormat.format(futureBalance.toString().split('.')[0])}`
              ) : card.futureBallance ? (
                `${getCurrencyChar(CURRENCIES.ILS)} ${card &&
                numberFormat.format(
                  card.futureBallance.toString().split('.')[0])}`
              ) : '-'
              }
            </Text>
          </View>
        </View>
      </LinearGradient>
    )
  }
}
