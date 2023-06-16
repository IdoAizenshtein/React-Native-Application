import React, { Fragment } from 'react'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import {
  combineStyles as cs,
  getFormattedValueArray,
  sp,
} from '../../utils/func'
import AnimatedControlledRow
  from '../../components/DataRow/AnimatedControlledRow'
import commonStyles from '../../styles/styles'
import styles, { DATA_ROW_HEIGHT } from './OverviewScreenStyles'
import { colors, fonts } from '../../styles/vars'
import AppTimezone from '../../utils/appTimezone'
import { connect } from 'react-redux'
import Swipeout from 'react-native-swipeout'
import CustomIcon from '../../components/Icons/Fontello'

@connect(state => ({
  searchkey: state.searchkey,
}))
@withTranslation()
export default class AggregateDataTypeRow extends AnimatedControlledRow {
  constructor (props) {
    super(props)

    this.initialHeight = DATA_ROW_HEIGHT
    this.maxHeight = this.initialHeight
    this.state = this.initialState
  }

  get initialState () {
    return {
      ...super.initialState,
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
      chequeComment: null,
    }
  }

  render () {
    const {
      isOpen,
      isRtl,
      item,
      onItemToggle,
      expenses,
      translates,
      markRow,
      openPopUp,
    } = this.props
    const { height } = this.state
    const wrapperStyles = cs(isOpen, styles.dataRow, styles.dataRowActive)
    const withinRowStyles = cs(isRtl, commonStyles.row, commonStyles.rowReverse)

    const total = getFormattedValueArray(item.dateTotals[0].total)
    const numberStyle = cs(expenses,
      [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })
    const isGraph = item.dateTotals.length > 1
    const totalGraph = (isGraph) ? (item.dateTotals[1].total +
      item.dateTotals[2].total + item.dateTotals[3].total) : null
    const right = [
      {
        backgroundColor: '#e2e1e1',
        component: (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <CustomIcon name={!item.pressed ? 'greenpie' : 'redpie'}
                        size={25}
                        color={!item.pressed ? '#229f88' : '#022258'}
            />
          </View>
        ),
        onPress: markRow,
      },
    ]
    return (
      <Fragment>
        <Swipeout
          buttonWidth={63}
          autoClose
          disabled={false}
          right={(isRtl) ? right : null}
          left={(isRtl) ? null : right}>
          <View style={{
            width: '100%',
            height: 1,
            backgroundColor: '#f4f4f4',
          }}/>
          <Animated.View
            style={[
              styles.dataRowAnimatedWrapper,
              {
                height,
                backgroundColor: item.pressed ? '#ffffff' : '#f3f2f2',
              }]}>
            <TouchableOpacity
              activeOpacity={(item.pressed) ? 0.2 : 1}
              onPress={item.pressed ? openPopUp : null}>
              <View style={wrapperStyles} onLayout={this.setMinHeight}>
                <View style={[
                  withinRowStyles, {
                    justifyContent: 'flex-start',
                  }]}>
                  <View style={{
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'flex-start',
                    height: 55,
                    flex: 300,
                  }}>
                    <Text numberOfLines={1} ellipsizeMode="tail" style={[
                      {
                        color: item.pressed ? colors.blue8 : '#687f96',
                        fontSize: sp(18),
                      }, cs(isOpen, {
                        fontFamily: fonts.semiBold,
                      }, {
                        fontFamily: fonts.bold,
                      })]}>
                      {translates ? (this.props.searchkey &&
                      this.props.searchkey.length > 0 &&
                      this.props.searchkey.length > 0 &&
                      this.props.searchkey.find(
                        (it) => it.paymentDescription === item.description)
                        ? this.props.searchkey.find(
                          (it) => it.paymentDescription ===
                            item.description).name
                        : '') : item.description}
                    </Text>
                  </View>
                  {item.pressed && (
                    <Fragment>
                      <View style={{
                        flex: 195,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'flex-start',
                        height: 55,
                      }}>
                        <Text
                          numberOfLines={1}
                          ellipsizeMode="tail">
                          <Text style={[
                            numberStyle, { fontSize: sp(18) }, cs(isOpen, {
                              fontFamily: fonts.semiBold,
                            }, {
                              fontFamily: fonts.bold,
                            })]}>{total[0]}</Text>
                          <Text style={[
                            styles.fractionalPart,
                            { fontSize: sp(18) }]}>.{total[1]}</Text>
                        </Text>
                      </View>
                      <View style={{
                        flex: 123,
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'flex-start',
                        height: 55,
                      }}>
                        <Text numberOfLines={1} ellipsizeMode="tail" style={[
                          {
                            textAlign: 'right',
                            color: colors.blue8,
                            fontSize: sp(18),
                          }, cs(isOpen, {
                            fontFamily: fonts.semiBold,
                          }, {
                            fontFamily: fonts.bold,
                          })]}>
                          {item.prc}{'%'}
                        </Text>
                      </View>
                      {isGraph && (
                        <TouchableOpacity
                          onPress={onItemToggle}
                          style={{
                            flex: 50,
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'flex-start',
                            height: 55,
                          }}>
                          <View style={{
                            alignSelf: 'center',
                            flexDirection: 'row-reverse',
                            alignItems: 'flex-end',
                            alignContent: 'center',
                            justifyContent: 'center',
                          }}>
                            <View
                              style={{
                                marginHorizontal: 1.5,
                                backgroundColor: (isOpen) ? expenses
                                  ? '#e0474d'
                                  : '#3a9c68' : '#d0dde4',
                                height: totalGraph ? ((100 *
                                  item.dateTotals[1].total / (totalGraph)) *
                                  0.3) : 0,
                                width: 5,
                                position: 'relative',
                              }}/>
                            <View
                              style={{
                                marginHorizontal: 1.5,
                                backgroundColor: (isOpen) ? expenses
                                  ? '#e0474d'
                                  : '#3a9c68' : '#d0dde4',
                                height: totalGraph ? ((100 *
                                  item.dateTotals[2].total / (totalGraph)) *
                                  0.3) : 0,
                                width: 5,
                                position: 'relative',
                              }}/>
                            <View
                              style={{
                                marginHorizontal: 1.5,
                                backgroundColor: (isOpen) ? expenses
                                  ? '#e0474d'
                                  : '#3a9c68' : '#d0dde4',
                                height: totalGraph ? ((100 *
                                  item.dateTotals[3].total / (totalGraph)) *
                                  0.3) : 0,
                                width: 5,
                                position: 'relative',
                              }}/>
                          </View>
                        </TouchableOpacity>
                      )}
                    </Fragment>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            <View onLayout={this.setMaxHeight}>
              {isGraph && (
                <View style={{
                  height: 166,
                  backgroundColor: '#f1f8fc',
                }}>
                  <View style={{
                    flex: 1,
                    position: 'absolute',
                    top: 40,
                    left: 0,
                    right: 0,
                    bottom: 5,
                    zIndex: 2,
                  }}>
                    <View style={{
                      width: 250,
                      flexDirection: 'row-reverse',
                      flex: 1,
                      alignSelf: 'center',
                    }}>
                      <View
                        style={{
                          flexDirection: 'column',
                          flex: 1,
                          justifyContent: 'flex-end',
                        }}>
                        <View>
                          <Text style={{
                            color: '#0f3860',
                            fontFamily: fonts.regular,
                            fontSize: sp(13),
                            textAlign: 'center',
                          }}>{getFormattedValueArray(
                            item.dateTotals[1].total)[0]}</Text>
                        </View>
                        <View
                          style={{
                            borderTopRightRadius: 3,
                            borderTopLeftRadius: 3,
                            backgroundColor: expenses ? '#e0474d' : '#3a9c68',
                            height: totalGraph
                              ? ((100 * item.dateTotals[1].total /
                                (totalGraph)) * 1.1)
                              : 0,
                            width: 23,
                            alignSelf: 'center',
                            position: 'relative',
                          }}/>
                        <View>
                          <Text style={{
                            color: '#0f3860',
                            fontFamily: fonts.regular,
                            fontSize: sp(13),
                            textAlign: 'center',
                          }}>{AppTimezone.moment(item.dateTotals[1].date)
                            .format('MM/YYYY')}</Text>
                        </View>
                      </View>
                      <View style={{
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'flex-end',
                      }}>
                        <View>
                          <Text style={{
                            color: '#0f3860',
                            fontFamily: fonts.regular,
                            fontSize: sp(13),
                            textAlign: 'center',
                          }}>{getFormattedValueArray(
                            item.dateTotals[2].total)[0]}</Text>
                        </View>
                        <View
                          style={{
                            borderTopRightRadius: 3,
                            borderTopLeftRadius: 3,
                            backgroundColor: expenses ? '#e0474d' : '#3a9c68',
                            zIndex: 1,
                            height: totalGraph
                              ? ((100 * item.dateTotals[2].total /
                                (totalGraph)) * 1.1)
                              : 0,
                            width: 23,
                            alignSelf: 'center',
                            position: 'relative',
                          }}/>
                        <View>
                          <Text style={{
                            color: '#0f3860',
                            fontFamily: fonts.regular,
                            fontSize: sp(13),
                            textAlign: 'center',
                          }}>{AppTimezone.moment(item.dateTotals[2].date)
                            .format('MM/YYYY')}</Text>
                        </View>
                      </View>
                      <View style={{
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'flex-end',
                      }}>
                        <View>
                          <Text style={{
                            color: '#0f3860',
                            fontFamily: fonts.regular,
                            fontSize: sp(13),
                            textAlign: 'center',
                          }}>{getFormattedValueArray(
                            item.dateTotals[3].total)[0]}</Text>
                        </View>
                        <View
                          style={{
                            borderTopRightRadius: 3,
                            borderTopLeftRadius: 3,
                            backgroundColor: expenses ? '#e0474d' : '#3a9c68',
                            height: totalGraph
                              ? ((100 * item.dateTotals[3].total /
                                (totalGraph)) * 1.1)
                              : 0,
                            width: 23,
                            alignSelf: 'center',
                            position: 'relative',
                          }}/>
                        <View>
                          <Text style={{
                            color: '#0f3860',
                            fontFamily: fonts.regular,
                            fontSize: sp(13),
                            textAlign: 'center',
                          }}>{AppTimezone.moment(item.dateTotals[3].date)
                            .format('MM/YYYY')}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                  <View style={{
                    flex: 1,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 1,
                  }}>
                    {[1, 1, 1, 1, 1, 1, 1, 1].map((gr, i) => {
                      return (
                        <View
                          key={i}
                          style={{
                            flexDirection: 'column',
                            flex: 1,
                            justifyContent: 'center',
                          }}>
                          <View style={{
                            flexDirection: 'row',
                            flex: 1,
                            justifyContent: 'center',
                            borderBottomWidth: 1,
                            borderBottomColor: '#e2e7ea',
                          }}>
                            {
                              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((c, i1) => {
                                return (
                                  <View key={i1} style={{
                                    flex: 1,
                                    borderRightWidth: 0.5,
                                    borderRightColor: '#e2e7ea',
                                    borderLeftWidth: 0.5,
                                    borderLeftColor: '#e2e7ea',
                                  }}/>
                                )
                              })
                            }
                          </View>
                        </View>
                      )
                    })}
                  </View>
                </View>
              )}
            </View>
          </Animated.View>

          <View style={{
            width: '100%',
            height: 1,
            backgroundColor: '#f4f4f4',
          }}/>
        </Swipeout>
      </Fragment>
    )
  }
}
