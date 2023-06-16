import React, { Fragment, PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors, fonts } from '../../../styles/vars'
import styles from '../MutavimStyles'
import LinearGradient from 'react-native-linear-gradient'
import Loader from '../../../components/Loader/Loader'
import {
  combineStyles as cs,
  getFormattedValueArray,
  sp,
} from '../../../utils/func'
import AppTimezone from 'src/utils/appTimezone'

@withTranslation()
export default class Graph extends PureComponent {
  dataPos = null

  constructor (props) {
    super(props)
    let showZeroLine = false
    let dataGraph = null
    // let data = {
    //   'monthsTotal': [
    //     {
    //       'month': 1535749200000,
    //       'total': 200,
    //     },
    //     {
    //       'month': 1538341200000,
    //       'total': 150,
    //     },
    //     {
    //       'month': 1541023200000,
    //       'total': -230,
    //     },
    //     {
    //       'month': 1543615200000,
    //       'total': -10,
    //     },
    //     {
    //       'month': 1546293600000,
    //       'total': 0,
    //     },
    //     {
    //       'month': 1548972000000,
    //       'total': 344,
    //     },
    //     {
    //       'month': 1551391200000,
    //       'total': 810,
    //     },
    //     {
    //       'month': 1554066000000,
    //       'total': 22,
    //     },
    //     {
    //       'month': 1556658000000,
    //       'total': 41483,
    //     },
    //     {
    //       'month': 1559336400000,
    //       'total': -900,
    //     }, {
    //       'month': 1561928400000,
    //       'total': 98,
    //     }, {
    //       'month': 1564606800000,
    //       'total': 600,
    //     }],
    //   'transes': null,
    //   'transesTotal': null,
    //   'average': 400,
    // }

    let dataAverage = null
    let average = null
    if (props.isOpen) {
      let data = Object.assign({}, props.dataGraph)
      if (data.monthsTotal.length) {
        if (!props.dontSort) {
          data.monthsTotal = data.monthsTotal.sort((a, b) => b.month - a.month)
            .slice(0, 8)
        } else {
          data.monthsTotal = data.monthsTotal.slice(0, 8)
        }
        let isAllZero = true
        const totals = data.monthsTotal.map((num) => {
          if (num.total !== 0) {
            isAllZero = false
          }
          return num.total
        })
        if (!isAllZero) {
          const min = Math.min(...totals)
          const max = Math.max(...totals)
          const spaceBetween = ((max - min) / 4)
          let sumsY
          if (min <= 0 && max <= 0) {
            sumsY = [
              this.checkIfK((max)),
              this.checkIfK((min + (spaceBetween * 3))),
              this.checkIfK((min + (spaceBetween * 2))),
              this.checkIfK((min + spaceBetween)),
              this.checkIfK((min)),
            ]
          } else if (min >= 0 && max >= 0) {
            sumsY = [
              this.checkIfK((min)),
              this.checkIfK((min + spaceBetween)),
              this.checkIfK((min + (spaceBetween * 2))),
              this.checkIfK((min + (spaceBetween * 3))),
              this.checkIfK((max)),
            ]
          } else {
            showZeroLine = Math.abs(min) / ((max - min) / 100)
            sumsY = [
              this.checkIfK((min)),
              this.checkIfK((min + spaceBetween)),
              this.checkIfK((min + (spaceBetween * 2))),
              this.checkIfK((min + (spaceBetween * 3))),
              this.checkIfK((max)),
            ]
          }
          if (data.average !== undefined && data.average !== null) {
            average = Math.abs(((100 * data.average) / (max - min)))
          }
          data.monthsTotal.forEach((it) => {
            it.month = AppTimezone.moment(it.month).format('MM/YY')
            it.isThisMonth = AppTimezone.moment().format('MM/YY') === it.month
            it.height = Math.abs(((100 * it.total) / (max - min)))
            it.bottom = !showZeroLine ? 0 : it.total < 0 ? (showZeroLine -
              it.height) : (showZeroLine + (2 / ((max - min) / 100)))
          })
          dataGraph = {
            average: average,
            sumsY: sumsY,
            data: data.monthsTotal,
          }
        } else {
          dataGraph = {
            data: null,
          }
        }
      } else {
        dataGraph = {
          data: null,
        }
      }
      if (data.average !== undefined && data.average !== null) {
        dataAverage = data.average
      }
    }
    this.state = {
      showZeroLine: showZeroLine,
      dataGraph: dataGraph,
      isPressed: null,
      average: dataAverage,
    }
  }

  toFixedNum (num) {
    const numSplit = num.toString().split('.')
    if (numSplit.length > 1) {
      const first = numSplit[0]
      const point = numSplit[1].substring(0, 1)
      if (point === '0' || (first.replace(/-/g, '').length >= 2)) {
        return Number(first)
      } else {
        return Number(first + '.' + point)
      }
    } else {
      return Number(num)
    }
  }

  checkIfK (num) {
    num = Number(num.toString().split('.')[0])
    if (num.toString().replace(/-/g, '').length >= 7) {
      return this.toFixedNum(num / 1000000) + 'm'
    } else if (num.toString().replace(/-/g, '').length >= 4) {
      return this.toFixedNum(num / 1000) + 'k'
    } else {
      return this.toFixedNum(num)
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    // if (nextProps.isOpen) {
    //
    // }
    // //console.log('--------UNSAFE_componentWillReceiveProps---0000--------', nextProps)

    // if (nextProps.isOpen && nextProps.dataGraph && nextProps.dataGraph.data) {
    //   // //console.log('--------UNSAFE_componentWillReceiveProps---1111--------')
    //
    //   this.dataPos = [...Array(nextProps.dataGraph.data.length)].map(() => {
    //     return {}
    //   })
    // }
  }

  componentDidMount () {
    // if (isOpen) {
    //
    //   // //console.log(dataGraph)
    // }
    // console.log('--------componentDidMount---0000--------', dataGraph)

    // if (isOpen && dataGraph && dataGraph.data) {
    //   console.log('--------componentDidMount---111--------')
    //   this.dataPos = [...Array(dataGraph.data.length)].map(() => {
    //     return {}
    //   })
    // }
  }

  pressed = (c, total) => () => {
    if (total === 0) {
      this.setState({
        isPressed: null,
      })
    } else {
      this.setState({
        isPressed: {
          top: c.top,
          left: c.left,
          total: total,
        },
      })
    }
  }

  handleToggle = () => {
    const {
      handleToggle,
    } = this.props
    handleToggle()
  }

  render () {
    const {
      isOpen,
    } = this.props
    const {
      isPressed,
      dataGraph,
      showZeroLine,
      average,
    } = this.state
    // console.log(isPressed)
    console.log(dataGraph)

    if (isOpen && dataGraph && dataGraph.data && !this.dataPos) {
      // console.log('--------render---111--------')
      this.dataPos = [...Array(dataGraph.data.length)].map(() => {
        return {}
      })
    }

    const total = average ? getFormattedValueArray(average) : null
    const numberStyle = average ? cs(average.toString().includes('-'), [
      {
        fontFamily: fonts.regular,
        fontSize: sp(18),
      }, { color: colors.green4 }], { color: colors.red2 }) : {}

    return (
      <Fragment>
        <View
          style={{
            backgroundColor: 'transparent',
            position: 'relative',
            height: 295,
            flexDirection: 'column',
            overflow: 'hidden',
            width: '100%',
            marginHorizontal: 0,
            marginBottom: 0,
            alignSelf: 'center',
            alignContent: 'center',
            justifyContent: 'space-between',
          }}>

          <View style={{
            alignSelf: 'center',
            alignItems: 'center',
            alignContent: 'center',
            justifyContent: 'center',
            width: '100%',
            height: 295,
          }}>
            {isOpen && (!dataGraph || dataGraph.data === undefined) && (
              <LinearGradient
                locations={[0, 0.5, 1]}
                colors={[colors.blue10, colors.blue11, colors.blue12]}
                style={[styles.sliderItemGradient, { width: '100%' }]}
              >
                <Loader
                  containerStyle={{ backgroundColor: 'transparent' }}
                  size="small"
                  color={colors.white}
                />
              </LinearGradient>)}

            {isOpen && dataGraph && dataGraph.data === null && (
              <View style={{
                flex: 1,
                width: '98%',
                marginVertical: 1,
                alignSelf: 'center',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{
                  color: '#23496f',
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                  textAlign: 'center',
                }}>{'לא נמצאו רשומות קודמות'}</Text>
              </View>
            )}

            {isOpen && dataGraph && dataGraph.data !== null && (
              <View style={{
                flexDirection: 'row-reverse',
                flex: 1,
                width: '98%',
                marginVertical: 1,
              }}>
                <View style={{
                  flex: 90,
                  flexDirection: 'column',
                }}>
                  <View style={{
                    flex: 90,
                    alignItems: 'flex-end',
                    alignContent: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row-reverse',
                    marginTop: 6,
                  }}>

                    {(isPressed) && (
                      <View style={[
                        {
                          position: 'absolute',
                          zIndex: 999,
                          right: isPressed.left - 42,
                          top: isPressed.top,
                        }]}>
                        <View style={styles.talkBubbleTriangle}/>
                        <View style={styles.talkBubbleTriangleWhite}/>
                        <View style={styles.talkBubble}>
                          <View style={styles.talkBubbleSquare}>
                            <Text
                              style={styles.talkBubbleMessage}
                              numberOfLines={1}
                              ellipsizeMode="tail">{getFormattedValueArray(
                              isPressed.total)[0]}</Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {(dataGraph.average !== undefined) && (
                      <View style={{
                        height: 4,
                        backgroundColor: '#0185bf',
                        flex: 1,
                        width: '100%',
                        zIndex: 0,
                        position: 'absolute',
                        right: 0,
                        left: 0,
                        bottom: dataGraph.average + '%',
                      }}/>
                    )}

                    {showZeroLine && (
                      <View style={{
                        height: 2,
                        backgroundColor: '#d6d8d9',
                        flex: 1,
                        width: '100%',
                        zIndex: 0,
                        position: 'absolute',
                        right: 0,
                        left: 0,
                        bottom: showZeroLine + '%',
                      }}/>
                    )}

                    {dataGraph.data.map((c, i) => {
                      const height = c.height
                      const bottom = c.bottom
                      const isBottomLine = c.total < 0 && showZeroLine

                      return (
                        <View
                          key={c.month + i}
                          collapsable={false}
                          onLayout={(e) => {
                            const { x, width } = e.nativeEvent.layout
                            this.dataPos[i].left = x + (width / 2)
                          }}
                          style={{
                            maxWidth: 60,
                            flex: 1,
                            alignSelf: 'flex-end',
                            alignItems: 'center',
                            alignContent: 'flex-end',
                            justifyContent: 'flex-end',
                          }}>
                          <TouchableOpacity
                            style={{
                              zIndex: 1,
                              height: '100%',
                              width: '100%',
                              alignItems: 'center',
                              alignContent: 'center',
                              justifyContent: 'center',
                              flexDirection: 'row-reverse',
                            }}
                            onPress={this.pressed(this.dataPos[i], c.total)}>
                            {!c.isThisMonth && (
                              <View
                                collapsable={false}
                                style={{
                                  borderTopRightRadius: isBottomLine ? 0 : 3,
                                  borderTopLeftRadius: isBottomLine ? 0 : 3,
                                  borderBottomLeftRadius: isBottomLine ? 3 : 0,
                                  borderBottomRightRadius: isBottomLine ? 3 : 0,
                                  backgroundColor: '#244a6f',
                                  height: height + '%',
                                  zIndex: 1,
                                  bottom: bottom + '%',
                                  width: '40%',
                                  alignSelf: 'flex-end',
                                  position: 'absolute',
                                }}
                                onLayout={(e) => {
                                  const { y } = e.nativeEvent.layout
                                  this.dataPos[i].top = ((y - 20) > 74.5) ? (y -
                                    30) : ((y < 35) ? (10) : (y - 30))
                                }}
                              />
                            )}
                            {c.isThisMonth && (
                              <LinearGradient
                                onLayout={(e) => {
                                  const { y } = e.nativeEvent.layout
                                  this.dataPos[i].top = ((y - 20) > 74.5) ? (y -
                                    30) : ((y < 35) ? (10) : (y - 30))
                                }}
                                start={{
                                  x: -5,
                                  y: 0,
                                }}
                                end={{
                                  x: 5,
                                  y: 0.5,
                                }}
                                colors={[
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe',
                                  '#eccd4f',
                                  '#fcfdfe']}
                                style={{
                                  zIndex: 1,
                                  borderTopRightRadius: isBottomLine ? 0 : 3,
                                  borderTopLeftRadius: isBottomLine ? 0 : 3,
                                  borderBottomLeftRadius: isBottomLine ? 3 : 0,
                                  borderBottomRightRadius: isBottomLine ? 3 : 0,
                                  height: height + '%',
                                  bottom: bottom + '%',
                                  width: '40%',
                                  alignSelf: 'flex-end',
                                  position: 'absolute',
                                }}/>
                            )}
                          </TouchableOpacity>
                        </View>
                      )
                    })}
                  </View>
                  <View style={{
                    flex: 16,
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                    borderRadius: 20,
                    backgroundColor: '#d3e0e7',
                    flexDirection: 'row-reverse',
                  }}>
                    {dataGraph.data.map((c, i) => {
                      return (
                        <View key={c.month + i} style={{
                          flex: 1,
                          maxWidth: 60,
                          alignSelf: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'center',
                        }}>
                          <Text style={{
                            color: '#23496f',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            textAlign: 'center',
                          }}>{c.month}</Text>
                        </View>
                      )
                    })}
                  </View>
                </View>
                <View style={{
                  flex: 9,
                  flexDirection: 'column',
                }}>
                  <View style={{
                    flex: 90,
                    alignItems: 'center',
                    alignContent: 'center',
                    flexDirection: 'column-reverse',
                    justifyContent: 'space-between',
                    marginTop: 6,
                  }}>
                    {dataGraph.sumsY.map((c, i) => {
                      return (
                        <View key={c.toString() + i}>
                          <Text style={{
                            color: '#0f3861',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                          }}>{c}</Text>
                        </View>
                      )
                    })}
                  </View>
                  <View style={{
                    flex: 16,
                    alignItems: 'center',
                    alignContent: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row-reverse',
                  }}/>
                </View>
              </View>
            )}

            {(isOpen && average !== 0 && total !== null) && (
              <View style={{
                flexDirection: 'row-reverse',
                alignSelf: 'center',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                marginTop: 10,
              }}>
                <Text style={{
                  fontFamily: fonts.semiBold,
                  color: '#022258',
                  fontSize: sp(18),
                }}>{'ממוצע'}</Text>
                <Text>{' '}</Text>
                <Text style={[
                  {
                    fontSize: sp(18),
                    color: colors.gray7,
                    fontFamily: fonts.light,
                  }]}>.{total[1]}</Text>
                <Text style={numberStyle}>{total[0]}</Text>
                <Text style={[
                  {
                    fontSize: sp(18),
                    color: colors.gray7,
                    fontFamily: fonts.light,
                  }]}>{'₪'}</Text>
              </View>
            )}
          </View>
        </View>
      </Fragment>
    )
  }
}
