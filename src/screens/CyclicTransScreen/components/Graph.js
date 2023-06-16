import React, { Fragment, PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import { Animated, Text, TouchableOpacity, View } from 'react-native'
import commonStyles from '../../../styles/styles'
import { colors, fonts } from '../../../styles/vars'
import CustomIcon from '../../../components/Icons/Fontello'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import styles from '../CyclicTransStyles'
import LinearGradient from 'react-native-linear-gradient'
import Loader from '../../../components/Loader/Loader'
import { getFormattedValueArray, sp } from '../../../utils/func'

const AnimatedIcon = Animated.createAnimatedComponent(Icon)

@withTranslation()
export default class Graph extends PureComponent {
    dataPos = null;

    constructor (props) {
      super(props)

      this.state = {
        isPressed: null,
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
      const {
        loaded,
      } = this.props
      loaded()
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
    };

    handleToggle = () => {
      const {
        handleToggle,
      } = this.props
      handleToggle()
    };

    render () {
      const {
        isOpen,
        dataGraph,
      } = this.props
      const {
        isPressed,
      } = this.state
      // console.log(isPressed)
      // console.log(isOpen && dataGraph && dataGraph.data)

      if (isOpen && dataGraph && dataGraph.data && !this.dataPos) {
        // console.log('--------render---111--------')
        this.dataPos = [...Array(dataGraph.data.length)].map(() => {
          return {}
        })
      }

      return (
        <Fragment>
          <View
            style={{
              backgroundColor: '#e4eef3',
              position: 'relative',
              height: 155,
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
              height: 125,
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

              {isOpen && dataGraph && dataGraph.data && (
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
                        <View style={[{
                          position: 'absolute',
                          zIndex: 999,
                          right: isPressed.left - 42,
                          top: isPressed.top,
                        }]}>
                          <View style={styles.talkBubbleTriangle} />
                          <View style={styles.talkBubbleTriangleWhite} />
                          <View style={styles.talkBubble}>
                            <View style={styles.talkBubbleSquare}>
                              <Text
                                style={styles.talkBubbleMessage}
                                numberOfLines={1}
                                ellipsizeMode="tail">{getFormattedValueArray(isPressed.total)[0]}</Text>
                            </View>
                          </View>
                        </View>
                      )}

                      {dataGraph.data.map((c, i) => {
                        const height = c.height

                        return (
                          <View
                            key={c.month + i}
                            collapsable={false}
                            onLayout={(e) => {
                              const { x, width } = e.nativeEvent.layout

                              this.dataPos[i].left = x + (width / 2)
                            }}
                            style={{
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
                                    borderTopRightRadius: 3,
                                    borderTopLeftRadius: 3,
                                    backgroundColor: '#244a6f',
                                    height: height + '%',
                                    zIndex: 1,
                                    width: '40%',
                                    alignSelf: 'flex-end',
                                    position: 'relative',
                                  }}
                                  onLayout={(e) => {
                                    const { y } = e.nativeEvent.layout
                                    this.dataPos[i].top = ((y - 20) > 74.5) ? (y - 30) : ((y < 35) ? (10) : (y - 30))
                                  }}
                                />
                              )}
                              {c.isThisMonth && (
                                <LinearGradient
                                  onLayout={(e) => {
                                    const { y } = e.nativeEvent.layout
                                    this.dataPos[i].top = ((y - 20) > 74.5) ? (y - 30) : ((y < 35) ? (10) : (y - 30))
                                  }}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 0.3, y: 1.3 }}
                                  colors={['#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe']}
                                  style={{
                                    zIndex: 1,
                                    borderTopRightRadius: 3,
                                    borderTopLeftRadius: 3,
                                    height: height + '%',
                                    width: '40%',
                                    alignSelf: 'flex-end',
                                    position: 'relative',
                                  }} />
                              )}
                            </TouchableOpacity>
                          </View>
                        )
                      })}
                    </View>
                    <View style={{
                      flex: 20,
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
                      marginTop: 2,
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
                      flex: 12,
                      alignItems: 'center',
                      alignContent: 'center',
                      justifyContent: 'center',
                      flexDirection: 'row-reverse',
                    }} />
                  </View>
                </View>
              )}
            </View>

            <View style={{
              width: '100%',
              justifyContent: 'center',
            }}>
              <TouchableOpacity onPress={this.handleToggle}>
                <View style={[commonStyles.rowReverse, {
                  alignSelf: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  height: 30,
                  backgroundColor: '#e4eef3',
                  paddingHorizontal: 0,
                  paddingVertical: 0,
                  width: '100%',
                  borderTopWidth: 1,
                  borderTopColor: '#dddddd',
                  justifyContent: 'center',
                }]}>
                  <CustomIcon
                    name={'graph-alt'}
                    size={18}
                    color={colors.blue7}
                  />
                  <View style={commonStyles.spaceDivider} />
                  <AnimatedIcon
                    size={18}
                    name={isOpen ? 'chevron-up' : 'chevron-down'}
                    color={colors.blue4}
                  />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </Fragment>
      )
    }
}
