import React, { Fragment, PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import { Text, TouchableOpacity, View } from 'react-native'
import { colors, fonts } from '../../../styles/vars'
import styles from '../CreditCardsStyles'
import LinearGradient from 'react-native-linear-gradient'
import Loader from '../../../components/Loader/Loader'
import { getCurrencyChar, getFormattedValueArray, sp } from '../../../utils/func'

@withTranslation()
export default class Graph extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isPressed: null,
    }
    if (props.dataGraph && props.dataGraph.data) {
      this.dataPos = [...Array(props.dataGraph.data.length)].map(() => {
        return {}
      })
    }
  }

  componentDidMount () {
    // const {
    //   loaded,
    // } = this.props
    // loaded()
  }

    pressed = (c, total, iskatHulStr) => () => {
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
            iskatHulStr: iskatHulStr,
          },
        })
      }
    };

    render () {
      const {
        dataGraph,
      } = this.props
      const {
        isPressed,
      } = this.state

      return (
        <Fragment>
          <View
            style={{
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
              height: 265,
            }}>
              {dataGraph.data === undefined && (
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

              {dataGraph.data === null && (
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

              {dataGraph.data && (
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
                    }}>

                      {isPressed && (
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
                                ellipsizeMode="tail">{getCurrencyChar(isPressed.iskatHulStr)}{getFormattedValueArray(isPressed.total)[0]}</Text>
                            </View>
                          </View>
                        </View>
                      )}

                      {dataGraph.avg && (
                        <View style={{
                          height: 4,
                          backgroundColor: '#ffffff',
                          flex: 1,
                          width: '100%',
                          zIndex: 0,
                          position: 'absolute',
                          right: 0,
                          left: 0,
                          bottom: dataGraph.avg,
                        }} />
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
                              onPress={this.pressed(this.dataPos[i], c.total, c.iskatHulStr)}>
                              {!c.isThisMonth && (
                                <View
                                  collapsable={false}
                                  style={{
                                    borderTopRightRadius: 3,
                                    borderTopLeftRadius: 3,
                                    backgroundColor: '#244a6f',
                                    height: height,
                                    zIndex: 1,
                                    width: '40%',
                                    alignSelf: 'flex-end',
                                    position: 'relative',
                                  }}
                                  onLayout={(e) => {
                                    const { y } = e.nativeEvent.layout
                                    this.dataPos[i].top = ((y - 20) > 74.5) ? (y - 30) : ((y < 35) ? (10) : (y - 30))
                                  }} />
                              )}
                              {c.isThisMonth && (
                                <LinearGradient
                                  onLayout={(e) => {
                                    const { y } = e.nativeEvent.layout
                                    this.dataPos[i].top = ((y - 20) > 74.5) ? (y - 30) : ((y < 35) ? (10) : (y - 30))
                                  }}
                                  start={{ x: -5, y: 0 }}
                                  end={{ x: 5, y: 0.5 }}
                                  colors={['#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe', '#eccd4f', '#fcfdfe']}
                                  style={{
                                    zIndex: 1,
                                    borderTopRightRadius: 3,
                                    borderTopLeftRadius: 3,
                                    height: height,
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
                    flex: 8,
                    marginBottom: 34,
                    marginTop: 8,
                    alignItems: 'center',
                    alignContent: 'center',
                    flexDirection: 'column-reverse',
                    justifyContent: 'space-between',
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
                </View>
              )}
            </View>
          </View>
        </Fragment>
      )
    }
}
