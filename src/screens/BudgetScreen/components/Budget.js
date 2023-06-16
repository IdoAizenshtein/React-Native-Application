import React, { Fragment } from 'react'
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { withTranslation } from 'react-i18next'
import styles from '../BudgetStyles'
import AnimatedControlledRow
  from '../../../components/DataRow/AnimatedControlledRow'
import { PieChart } from 'react-native-svg-charts'
import { fonts } from 'src/styles/vars'
import { Icon } from 'react-native-elements'
import AppTimezone from '../../../utils/appTimezone'
import { LocaleConfig } from 'react-native-calendars'
import commonStyles from '../../../styles/styles'
import { BANK_ICONS } from '../../../constants/bank'
import CustomIcon from '../../../components/Icons/Fontello'
import { getFormattedValueArray, sp } from '../../../utils/func'

@withTranslation()
export default class Budget extends AnimatedControlledRow {
  constructor (props) {
    super(props)

    this.initialHeight = 20
    this.maxHeight = this.initialHeight
    this.state = this.initialState
  }

  get initialState () {
    return {
      ...super.initialState,
      isOpen: this.props.isOpen,
    }
  }

  getExpandedData () {
    const { inProgress } = this.state
    const { item } = this.props
    if (inProgress) {return}
    this.setState({ inProgress: true })
    if (!item.budgetsDetails) {
      const isGetBudgetsDetails = setInterval(() => {
        if (this.props.item.budgetsDetails) {
          clearInterval(isGetBudgetsDetails)
          this.setState({ inProgress: false })
        }
      }, 200)
    } else {
      this.setState({ inProgress: false })
    }
  }

  setMaxHeightAll = (e) => {
    this.setMaxHeight(e)

    const { isOpen } = this.props
    if (isOpen) {
      setTimeout(() => {
        const { height } = this.state
        height.setValue(this.maxHeight + this.minHeight)
        Animated.timing(height, {
          toValue: this.maxHeight + this.minHeight,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: false,
        }).start()
      }, 20)
    } else {
      setTimeout(() => {
        const { height } = this.state
        const initialValue = height.__getValue()
        height.setValue(initialValue)
        Animated.timing(height, {
          toValue: this.minHeight,
          duration: 200,
          easing: Easing.ease,
          useNativeDriver: false,
        }).start()
      }, 20)
    }
  }

  render () {
    const {
      item,
      onItemToggle,
      accounts,
      nextDate,
      prevDate,
      disabledNavDatePrev,
      disabledNavDateNext,
      openActionSheet,
      showPanelOfCategories,
    } = this.props

    const { height, inProgress } = this.state
    // console.log(isOpen)
    // const wrapperStyles = cs(isOpen, styles.dataRow, styles.dataRowActive)
    let prcIncomesArr = []
    let prcIncome = 0
    if (!inProgress &&
      (item.budgetTotalType === 'both' || item.budgetTotalType === 'income') &&
      item.budgetsDetails) {
      prcIncome = (item.budgetsDetails.totalIncomeUse < 0)
        ? 0
        : ((item.totalIncome === 0 && item.budgetsDetails.totalIncomeUse !== 0)
          ? 20
          : (item.budgetsDetails.totalIncomeUse / (item.totalIncome / 100)))
      console.log('prcIncome--', prcIncome)
      prcIncomesArr = Array.from(Array(100).keys())
        .map((key, index) => {
          return {
            prc: 1,
            active: ((index + 1)) <= prcIncome,
          }
        })
    }

    let prcOutcomeArr = []
    let prcOutcome = 0
    if (!inProgress &&
      (item.budgetTotalType === 'both' || item.budgetTotalType === 'outcome') &&
      item.budgetsDetails) {
      prcOutcome = (item.budgetsDetails.totalOutcomeUse < 0)
        ? 0
        : ((item.totalOutcome === 0 && item.budgetsDetails.totalOutcomeUse !==
          0) ? 20 : (item.budgetsDetails.totalOutcomeUse /
          (item.totalOutcome / 100)))
      console.log('prcIncome--', prcOutcome)
      prcOutcomeArr = Array.from(Array(100).keys())
        .map((key, index) => {
          return {
            prc: 1,
            active: ((index + 1)) <= prcOutcome,
          }
        })
    }

    let account
    if (item.budgetAccounts.length === 1) {
      account = accounts.find(
        (acc) => acc.companyAccountId === item.budgetAccounts[0])
    }
    const disabledNavDatePrevConst = disabledNavDatePrev()
    const disabledNavDateNextConst = disabledNavDateNext()

    return (
      <Fragment>
        <Animated.View style={[styles.container, { height }]}>
          <TouchableOpacity
            style={{
              marginHorizontal: 15,
              height: 112,
            }}
            onLayout={this.setMinHeight}
            onPress={onItemToggle}>
            <View style={{
              marginTop: 0,
              flexDirection: 'row-reverse',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'space-between',
              height: 45,
              marginBottom: 15,
            }}>
              <TouchableOpacity
                hitSlop={{
                  top: 10,
                  bottom: 10,
                  left: 10,
                  right: 10,
                }}
                style={{
                  flex: 10,
                  marginTop: 5,
                  alignItems: 'flex-end',
                  alignContent: 'center',
                }}
                onPress={() => {
                  openActionSheet(false, item)
                }}>
                <Icon
                  name="dots-horizontal"
                  type="material-community"
                  size={30}
                  color="#00215c"
                />
              </TouchableOpacity>
              <View style={{
                flex: 100,
              }}>
                <Text style={{
                  textAlign: 'center',
                  color: '#022258',
                  fontSize: sp(21),
                  fontFamily: fonts.semiBold,
                }}>{item.budgetName}</Text>
              </View>
              {item.indDefault === 1 && (
                <TouchableOpacity
                  style={{
                    flex: 10,
                    alignSelf: 'center',
                  }}
                  onPress={() => {
                    openActionSheet('tooltipB')
                  }}>
                  <Image
                    resizeMode="cover"
                    style={[
                      {
                        height: 20,
                        width: 37 / 2,
                      }]}
                    source={require('BiziboxUI/assets/b.png')}/>
                </TouchableOpacity>
              )}
              {item.indDefault !== 1 && (
                <View
                  style={{
                    flex: 10,
                  }}/>
              )}
            </View>

            <View style={{
              flexDirection: 'row-reverse',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'space-between',
              height: 33,
            }}>
              <View style={{
                flexDirection: 'row-reverse',
                alignItems: 'center',
                alignContent: 'center',
              }}>
                <Image
                  resizeMode="cover"
                  style={[
                    {
                      height: 33 / 2,
                      width: 33 / 2,
                      marginRight: 2,
                    }]}
                  source={require('BiziboxUI/assets/clock.png')}/>
                <View style={{
                  marginHorizontal: 5,
                }}>
                  <Text style={{
                    color: '#022258',
                    fontSize: sp(17),
                    fontFamily: fonts.regular,
                  }}>
                    {item.frequencyDesc === 'MONTH'
                      ? 'חודשי'
                      : (item.frequencyDesc === 'ONE_TIME'
                        ? 'חד פעמי'
                        : 'שנתי')}
                  </Text>
                </View>
                <View style={{
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}>
                  {item.frequencyDesc === 'ONE_TIME' && (
                    <Text style={{
                      color: '#022258',
                      fontSize: sp(16),
                      fontFamily: fonts.regular,
                    }}>
                      {AppTimezone.moment(item.dateFrom).format('DD/MM/YY')}
                      -
                      {AppTimezone.moment(item.dateTill).format('DD/MM/YY')}
                    </Text>
                  )}
                  {(item.frequencyDesc !== 'ONE_TIME') && (
                    <Fragment>
                      <TouchableOpacity
                        style={{
                          marginTop: 2,
                        }}
                        activeOpacity={(!disabledNavDatePrevConst) ? 0.2 : 1}
                        onPress={prevDate}>
                        <Icon
                          name="chevron-thin-right"
                          type="entypo"
                          size={19}
                          color={!disabledNavDatePrevConst
                            ? '#022258'
                            : '#a2a2a2'}
                        />
                      </TouchableOpacity>

                      <Text style={{
                        color: '#022258',
                        fontSize: sp(16),
                        fontFamily: fonts.regular,
                      }}>{item.frequencyDesc === 'MONTH'
                        ? LocaleConfig.locales.he.monthNames[parseFloat(
                          AppTimezone.moment(item.dateTill).format('MM')) - 1]
                        : ''} {AppTimezone.moment(item.dateTill)
                        .format(item.frequencyDesc === 'MONTH'
                          ? 'YY'
                          : 'YYYY')}</Text>

                      <TouchableOpacity
                        style={{
                          marginTop: 2,
                        }}
                        activeOpacity={(!disabledNavDateNextConst) ? 0.2 : 1}
                        onPress={nextDate}>
                        <Icon
                          name="chevron-thin-left"
                          type="entypo"
                          size={19}
                          color={!disabledNavDateNextConst
                            ? '#022258'
                            : '#a2a2a2'}
                        />
                      </TouchableOpacity>
                    </Fragment>
                  )}
                </View>
              </View>

              <View>
                {item.budgetAccounts.length > 1 && (
                  <View style={[
                    commonStyles.row, commonStyles.alignItemsCenter, {
                      alignItems: 'center',
                      alignContent: 'center',
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }]}>
                    <Text style={{
                      color: '#022258',
                      fontSize: sp(17),
                      fontFamily: fonts.regular,
                    }}>
                      {(item.budgetAccounts.length + ' חשבונות')}
                    </Text>
                    <CustomIcon name="bank-fees" size={20} color={'#022258'}
                                style={{
                                  marginHorizontal: 8,
                                  marginTop: -6,
                                }}/>
                  </View>
                )}

                {account && item.budgetAccounts.length === 1 && (
                  <View style={[
                    commonStyles.row, commonStyles.alignItemsCenter, {
                      alignItems: 'center',
                      alignContent: 'center',
                      flexDirection: 'row',
                    }]}>
                    <Text style={{
                      color: '#022258',
                      fontSize: sp(17),
                      fontFamily: fonts.regular,
                    }}>{account.bankAccountId}</Text>
                    <Image
                      resizeMode="cover"
                      style={[
                        {
                          height: 24,
                          marginHorizontal: 6,
                          marginTop: -2,
                        }]}
                      source={BANK_ICONS[account.bankId].uri}/>
                  </View>)}
              </View>
            </View>
          </TouchableOpacity>

          <View onLayout={this.setMaxHeightAll}>
            {(inProgress)
              ? <ActivityIndicator color="#999999" style={{ padding: 10 }}/>
              : <View style={{
                height: item.budgetTotalType === 'both' ? 200 : 100,
                flexDirection: 'row-reverse',
                justifyContent: 'center',
                alignContent: 'center',
                overflow: 'hidden',
                marginHorizontal: 10,
              }}>
                {!item.budgetsDetails
                  ? <ActivityIndicator color="#999999" style={{ padding: 10 }}/>
                  : (<Fragment>

                    <View style={{
                      flexDirection: 'column',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      flex: 150,
                    }}>
                      {(item.budgetTotalType === 'both' ||
                        item.budgetTotalType === 'income') && (
                        <View style={{
                          width: '100%',
                          height: 100,
                          flexDirection: 'row-reverse',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'space-between',
                          flex: 1,
                          marginBottom: 10,
                        }}>
                          {item.budgetsDetails && (
                            <View style={{
                              height: 87,
                              width: 87,
                              alignSelf: 'center',
                              flex: 195,
                            }}>
                              <PieChart
                                spacing={0}
                                style={{
                                  zIndex: 2,
                                  top: 0,
                                  height: 87,
                                  width: 87,
                                  position: 'absolute',
                                  left: 0,
                                }}
                                outerRadius={'100%'}
                                innerRadius={'90%'}
                                data={
                                  prcIncomesArr.map((key, index) => {
                                    return {
                                      value: key.prc,
                                      key: `pie-${index}`,
                                      svg: {
                                        fill: key.active
                                          ? '#229f88'
                                          : '#bbf6eb',
                                      },
                                      arc: {
                                        outerRadius: '100%',
                                        padAngle: 0,
                                      },
                                    }
                                  })
                                }
                              />
                              <View style={{
                                position: 'absolute',
                                width: 87,
                                left: 0,
                                top: 24,
                                zIndex: 9,
                              }}>
                                <Text
                                  style={{
                                    textAlign: 'center',
                                    color: '#022258',
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(18),
                                    lineHeight: 18,
                                  }}>
                                  {item.budgetsDetails.totalIncomeUse < 0
                                    ? '0%'
                                    : `${item.totalIncome !== 0 ? Math.round(
                                      (item.budgetsDetails.totalIncomeUse /
                                        (item.totalIncome / 100))) : (0)}%`}
                                </Text>
                                <Text style={{
                                  textAlign: 'center',
                                  color: '#022258',
                                  lineHeight: 24,
                                  fontFamily: fonts.regular,
                                  fontSize: sp(20),
                                }}>{'הכנסות'}</Text>
                              </View>
                            </View>
                          )}

                          <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flex: 215,
                          }}>
                            <Text style={{
                              textAlign: 'center',
                              color: '#022258',
                              fontFamily: fonts.regular,
                              fontSize: sp(19.5),
                            }}>{item.currency} {getFormattedValueArray(
                              Math.round(item.totalIncome))[0]}</Text>
                            <Text style={{
                              textAlign: 'center',
                              color: '#022258',
                              fontFamily: fonts.light,
                              fontSize: sp(19.5),
                            }}>{'תקציב'}</Text>
                          </View>

                          {item.budgetsDetails && (
                            <View style={{
                              flexDirection: 'column',
                              justifyContent: 'center',
                              flex: 200,
                            }}>
                              <Text style={{
                                textAlign: 'center',
                                color: '#022258',
                                fontFamily: fonts.regular,
                                fontSize: sp(19.5),
                              }}>{item.currency} {(item.budgetsDetails.totalIncomeUse <
                                0) ? '' : (item.totalIncome !== 0
                                ? (item.budgetsDetails.totalIncomeUse >
                                  item.totalIncome)
                                  ? 0
                                  : getFormattedValueArray(Math.round(
                                    (item.totalIncome -
                                      item.budgetsDetails.totalIncomeUse)))[0]
                                : '')}</Text>
                              <Text style={{
                                textAlign: 'center',
                                color: '#022258',
                                fontFamily: fonts.light,
                                fontSize: sp(19.5),
                              }}>{'נותרו'}</Text>
                            </View>
                          )}

                          <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            flex: 85,
                          }}>
                            {item.incomeAlert && (
                              <TouchableOpacity
                                onPress={() => {
                                  openActionSheet('incomeAlert', item)
                                }}>
                                <CustomIcon name="bell-enable" size={26}
                                            color={'#022258'}/>
                              </TouchableOpacity>
                            )}
                            {!item.incomeAlert && (
                              <TouchableOpacity
                                onPress={() => {
                                  openActionSheet('incomeAlert', item)
                                }}>
                                <CustomIcon name="bell-disable" size={26}
                                            color={'#9e9e9e'}/>
                              </TouchableOpacity>
                            )}

                            <Text style={{
                              textAlign: 'center',
                              fontFamily: fonts.light,
                              fontSize: sp(18),
                              color: item.incomeAlert ? '#022258' : '#9e9e9e',
                            }}>
                              {item.prcIncome}%
                            </Text>
                          </View>
                        </View>
                      )}
                      {(item.budgetTotalType === 'both' ||
                        item.budgetTotalType === 'outcome') && (
                        <View style={{
                          width: '100%',
                          height: 100,
                          flexDirection: 'row-reverse',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'space-between',
                          flex: 1,
                          marginBottom: 10,
                        }}>
                          {item.budgetsDetails && (
                            <View style={{
                              height: 87,
                              width: 87,
                              alignSelf: 'center',
                              flex: 195,
                            }}>
                              <PieChart
                                spacing={0}
                                style={{
                                  zIndex: 2,
                                  top: 0,
                                  height: 87,
                                  width: 87,
                                  position: 'absolute',
                                  left: 0,
                                }}
                                outerRadius={'100%'}
                                innerRadius={'90%'}
                                data={
                                  prcOutcomeArr.map((key, index) => {
                                    return {
                                      value: key.prc,
                                      key: `pie-${index}`,
                                      svg: {
                                        fill: key.active
                                          ? '#cd1010'
                                          : '#fedddd',
                                      },
                                      arc: {
                                        outerRadius: 100 + '%',
                                        padAngle: 0,
                                      },
                                    }
                                  })
                                }
                              />
                              <View style={{
                                position: 'absolute',
                                width: 87,
                                left: 0,
                                top: 24,
                                zIndex: 9,
                              }}>
                                <Text
                                  style={{
                                    textAlign: 'center',
                                    color: '#022258',
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(18),
                                    lineHeight: 18,
                                  }}>
                                  {item.budgetsDetails.totalOutcomeUse < 0 ? 0
                                    : (item.totalOutcome !== 0 ? Math.round(
                                    (item.budgetsDetails.totalOutcomeUse /
                                      (item.totalOutcome / 100))) : (0)) + '%'}
                                </Text>
                                <Text style={{
                                  textAlign: 'center',
                                  color: '#022258',
                                  lineHeight: 24,
                                  fontFamily: fonts.regular,
                                  fontSize: sp(20),
                                }}>{'הוצאות'}</Text>
                              </View>
                            </View>
                          )}

                          <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            flex: 215,
                          }}>
                            <Text style={{
                              textAlign: 'center',
                              color: '#022258',
                              fontFamily: fonts.regular,
                              fontSize: sp(18),
                            }}>{item.currency} {getFormattedValueArray(
                              Math.round(item.totalOutcome))[0]}</Text>
                            <Text style={{
                              textAlign: 'center',
                              color: '#022258',
                              fontFamily: fonts.light,
                              fontSize: sp(19.5),
                            }}>{'תקציב'}</Text>
                          </View>

                          {item.budgetsDetails && (
                            <View style={{
                              flexDirection: 'column',
                              justifyContent: 'center',
                              flex: 200,
                            }}>
                              <Text style={{
                                textAlign: 'center',
                                color: '#022258',
                                fontFamily: fonts.regular,
                                fontSize: sp(18),
                              }}>{item.currency} {(item.budgetsDetails.totalOutcomeUse <
                                0) ? '' : (item.totalOutcome !== 0
                                ? (item.budgetsDetails.totalOutcomeUse >
                                  item.totalOutcome)
                                  ? 0
                                  : getFormattedValueArray(Math.round(
                                    item.totalOutcome -
                                    item.budgetsDetails.totalOutcomeUse))[0]
                                : '')}</Text>
                              <Text style={{
                                textAlign: 'center',
                                color: '#022258',
                                fontFamily: fonts.light,
                                fontSize: sp(19.5),
                              }}>{'נותרו'}</Text>
                            </View>
                          )}

                          <View style={{
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            alignItems: 'center',
                            flex: 85,
                          }}>
                            {item.outcomeAlert && (
                              <TouchableOpacity
                                onPress={() => {
                                  openActionSheet('outcomeAlert', item)
                                }}>
                                <CustomIcon name="bell-enable" size={26}
                                            color={'#022258'}/>
                              </TouchableOpacity>
                            )}
                            {!item.outcomeAlert && (
                              <TouchableOpacity
                                onPress={() => {
                                  openActionSheet('outcomeAlert', item)
                                }}>
                                <CustomIcon name="bell-disable" size={26}
                                            color={'#9e9e9e'}/>
                              </TouchableOpacity>
                            )}

                            <Text style={{
                              textAlign: 'center',
                              fontFamily: fonts.light,
                              fontSize: sp(18),
                              color: item.outcomeAlert ? '#022258' : '#9e9e9e',
                            }}>
                              {item.prcOutcome}%
                            </Text>
                          </View>

                        </View>
                      )}
                    </View>

                    <View style={{
                      flex: 15,
                      flexDirection: 'row',
                      justifyContent: 'flex-start',
                    }}>
                      <TouchableOpacity
                        hitSlop={{
                          top: 30,
                          bottom: 30,
                          left: 10,
                          right: 10,
                        }}
                        onPress={showPanelOfCategories}
                        style={{
                          alignSelf: 'center',
                        }}
                      >
                        <Icon
                          name="chevron-thin-left"
                          type="entypo"
                          size={26}
                          color={'#022258'}
                        />
                      </TouchableOpacity>
                    </View>

                  </Fragment>)}
              </View>}
          </View>
        </Animated.View>
      </Fragment>

    )
  }
}
