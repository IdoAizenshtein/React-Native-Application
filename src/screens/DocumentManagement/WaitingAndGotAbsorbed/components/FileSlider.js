import React, { Fragment, PureComponent } from 'react'
import { setOpenedBottomSheet } from 'src/redux/actions/user'
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native'
import { getFormattedValueArray, sp } from '../../../../utils/func'
import { colors, fonts } from '../../../../styles/vars'

import Interactable from 'react-native-interactable'
import { getDocumentStorageDataApi } from '../../../../api'
import { Icon } from 'react-native-elements'
import CustomIcon from '../../../../components/Icons/Fontello'
import AppTimezone from '../../../../utils/appTimezone'

import SlidePictures from './SlidePictures'
import { connect } from 'react-redux'

const win = Dimensions.get('window')

const Screen = {
  width: win.width,
  height: win.height - 75,
}

const styles = StyleSheet.create({
  panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999999,
  },
  panel: {
    height: Screen.height + 280,
    paddingBottom: 20,
    paddingTop: 14,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  panelHeader: {
    height: 15,
    paddingBottom: 10,
    alignItems: 'center',
  },
  panelHandle: {
    width: 54,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#cdcdcd',
  },
  panelTitle: {
    height: 28,
    color: '#022258',
    fontSize: sp(20),
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },
  panelSubtitle: {
    fontSize: sp(16),
    height: 28,
    color: '#229f88',
    marginBottom: 10,
    textAlign: 'center',
  },
  panelButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#459FED',
    alignItems: 'center',
    marginVertical: 10,
  },
  panelButtonTitle: {
    fontSize: sp(17),
    fontWeight: 'bold',
    color: 'white',
  },
})

@connect()
export default class FileSlider extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      currentOpenItemIndex: null,
      file: false,
      inProgressSnap: false,
      inProgressGetPic: true,
      imagesArr: [],
    }
    this._deltaY = new Animated.Value(0)
  }

  UNSAFE_componentWillReceiveProps (props) {
    if (props && props.file && props.file !== this.props.file) {
      this.setState({ file: JSON.parse(JSON.stringify(props.file)) }, () => {
        this.getDocumentStorageData()
      })
      this.listRef.snapTo({ index: 0 })
    }
    if (props && props.file === false && this.props.file) {
      this.listRef.snapTo({ index: 2 })
    }
  }

  getDocumentStorageData = () => {
    this.setState({
      inProgressGetPic: true,
    })
    const { file } = this.state
    getDocumentStorageDataApi.post({
      body: [file.fileId],
    })
      .then((img) => {
        // console.log('--------img-------', img)
        console.log(img[file.fileId][0].contentUrl)
        this.setState({
          inProgressGetPic: false,
          imagesArr: img[file.fileId],
        })
        this.props.setFileImgs(img[file.fileId])
      })
      .catch(() => {

      })
  }

  componentDidMount () {
  }

  closeSheet = () => {
    this.listRef.snapTo({ index: 2 })
  }

  onDrawerSnap = (states) => {
    const index = states.nativeEvent.index
    // console.log('index---', index)
    if (index === 0) {
      this.props.dispatch(setOpenedBottomSheet(true))
      // console.log('Top')
      this.setState({
        currentOpenItemIndex: 'Top',
      })
    } else if (index === 1) {
      // console.log('Middle')
      this.props.dispatch(setOpenedBottomSheet(true))
      this.setState({
        currentOpenItemIndex: 'Middle',
      })
    } else if (index === 2) {
      // console.log('Close')
      this.props.dispatch(setOpenedBottomSheet(false))
      this.setState({
        currentOpenItemIndex: null,
      })
      this.props.closeBottomSlideFile()
    }
  }

  handleSetRef = (ref) => {
    this.listRef = ref
  }

  _onScroll (e) {
    const offset = e.nativeEvent.contentOffset.y
    if (offset < 0) {
      this.setState({
        inProgressSnap: true,
      })
      if (this.scrollViewTop && this.scrollViewTop._component) {
        this.scrollViewTop._component.scrollTo({ animated: false, y: 0, x: 0 })
      }
      this.listRef.snapTo({ index: 1 })
      setTimeout(() => {
        this.setState({
          inProgressSnap: false,
        })
      }, 30)
    }
  }

  openActionSheet = () => {
    this.props.bottomActionSheet()
  }

  render () {
    const {
      isRtl,
    } = this.props

    const {
      currentOpenItemIndex,
      inProgressSnap,
      file,
      inProgressGetPic,
      imagesArr,
    } = this.state

    return (
      <Fragment>
        <View style={[styles.panelContainer]} pointerEvents={'box-none'}>
          <TouchableWithoutFeedback
            onPress={this.closeSheet}
            style={[{
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9,
            }]}>
            <Animated.View
              pointerEvents={currentOpenItemIndex === null ? 'box-none' : 'auto'}
              style={[{
                backgroundColor: 'black',
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9,
                opacity: this._deltaY.interpolate({
                  inputRange: [0, 1, Screen.height - 500, Screen.height + 30],
                  outputRange: [0, 0.8, 0.8, 0],
                  extrapolate: 'clamp',
                }),
              }]} />
          </TouchableWithoutFeedback>

          <Interactable.View
            style={{
              zIndex: 999,
            }}
            onSnapStart={this.onDrawerSnap}
            verticalOnly
            ref={this.handleSetRef}
            animatedValueX={new Animated.Value(0)}
            snapPoints={[{ y: 20 }, { y: Screen.height - 500 }, { y: Screen.height + 30 }]}
            boundaries={{ top: -500 }}
            initialPosition={{ y: Screen.height + 30 }}
            animatedValueY={this._deltaY}>
            <View style={styles.panel}>
              <View style={styles.panelHeader}>
                <View style={styles.panelHandle} />
              </View>

              <TouchableOpacity
                onPress={this.openActionSheet}
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 20,
                }}>
                <Icon
                  iconStyle={{}}
                  name="dots-three-horizontal"
                  type="entypo"
                  size={22}
                  color={'#022258'}
                />
              </TouchableOpacity>

              <View style={{ left: 0, right: 0, height: Screen.height - 90 }}>
                {file && (
                  <View>
                    <View style={{
                      paddingHorizontal: 10,
                    }}>
                      <View
                        style={{
                          flexDirection: 'row-reverse',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={styles.panelTitle}>{file.name}</Text>
                      </View>
                      {file.details ? (
                        <Text style={styles.panelSubtitle}>
                          {file.statusDesc === 'נקלט' ? 'החשבונית נקלטה' : 'החשבונית ממתינה לקליטה'}
                        </Text>
                      ) : (<View style={{ height: 15, width: '100%' }} />)}
                      <View style={{
                        height: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        width: '100%',
                        backgroundColor: colors.gray30,
                      }} />
                    </View>
                  </View>
                )}

                <Animated.ScrollView
                  contentContainerStyle={{}}
                  ref={scrollViewTop => (this.scrollViewTop = scrollViewTop)}
                  maximumZoomScale={0}
                  decelerationRate={'fast'}
                  disableIntervalMomentum
                  disableScrollViewPanResponder
                  directionalLockEnabled
                  automaticallyAdjustContentInsets
                  scrollEnabled={currentOpenItemIndex === 'Top' || (currentOpenItemIndex === 'Middle' && inProgressSnap)}
                  showsVerticalScrollIndicator={false}
                  scrollEventThrottle={1}
                  onScroll={(e) => this._onScroll(e)}>
                  <View>
                    <View style={{
                      paddingHorizontal: 10,
                    }}>
                      <View style={{
                        flexDirection: 'row-reverse',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'space-between',
                        height: 45,
                      }}>
                        <View style={{
                          flexDirection: 'row-reverse',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <View style={{
                            width: 30,
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                          }}>
                            <CustomIcon name="calendar"
                              size={20}
                              color={'#022258'} />
                          </View>
                          <View style={{}}>
                            <Text style={{
                              color: '#022258',
                              fontSize: sp(16),
                              fontFamily: fonts.regular,
                              textAlign: 'center',
                            }}>{'תאריך שליחה'}</Text>
                          </View>
                        </View>
                        <View style={{}}>
                          <Text style={{
                            color: '#022258',
                            fontSize: sp(16),
                            fontFamily: fonts.regular,
                            textAlign: 'center',
                          }}>{file.sendDate ? AppTimezone.moment(file.sendDate).format('DD/MM/YYYY') : ''}</Text>
                        </View>
                      </View>

                      <View style={{
                        height: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'center',
                        width: '100%',
                        backgroundColor: colors.gray30,
                      }} />

                      {file.details && (
                        <Fragment>

                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'space-between',
                            height: 45,
                          }}>
                            <View style={{
                              flexDirection: 'row-reverse',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <View style={{
                                width: 30,
                                flexDirection: 'row-reverse',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                              }}>
                                <CustomIcon name="calendar"
                                  size={20}
                                  color={'#022258'} />
                              </View>
                              <View style={{}}>
                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{'תאריך חשבונית'}</Text>
                              </View>
                            </View>
                            <View style={{}}>
                              <Text style={{
                                color: '#022258',
                                fontSize: sp(16),
                                fontFamily: fonts.regular,
                                textAlign: 'center',
                              }}>{file.invoiceDate ? AppTimezone.moment(file.invoiceDate).format('DD/MM/YYYY') : ''}</Text>
                            </View>
                          </View>

                          <View style={{
                            height: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            width: '100%',
                            backgroundColor: colors.gray30,
                          }} />

                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'space-between',
                            height: 45,
                          }}>
                            <View style={{
                              flexDirection: 'row-reverse',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <View style={{
                                width: 30,
                                flexDirection: 'row-reverse',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                              }}>
                                <CustomIcon name="asmachta-icon"
                                  size={20}
                                  color={'#022258'} />
                              </View>
                              <View style={{}}>
                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{'אסמכתא'}</Text>
                              </View>
                            </View>
                            <View style={{}}>
                              {file.asmachta !== null && (
                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{file.asmachta}</Text>
                              )}
                            </View>
                          </View>

                          <View style={{
                            height: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            width: '100%',
                            backgroundColor: colors.gray30,
                          }} />

                          <View style={{
                            flexDirection: 'row-reverse',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'space-between',
                            height: 45,
                          }}>
                            <View style={{
                              flexDirection: 'row-reverse',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}>
                              <View style={{
                                width: 30,
                                flexDirection: 'row-reverse',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                              }}>
                                <CustomIcon name="money-ocr"
                                  size={20}
                                  color={'#022258'} />
                              </View>
                              <View style={{}}>
                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{'סכום כולל מע״מ'}</Text>
                              </View>
                            </View>
                            <View style={{}}>
                              {file.totalIncludeMaam !== null && (
                                <Text style={{
                                  color: '#022258',
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: 'center',
                                }}>{getFormattedValueArray(file.totalIncludeMaam)[0]}.{getFormattedValueArray(file.totalIncludeMaam)[1]}</Text>
                              )}
                            </View>
                          </View>

                          <View style={{
                            height: 1,
                            alignItems: 'center',
                            justifyContent: 'center',
                            alignSelf: 'center',
                            width: '100%',
                            backgroundColor: colors.gray30,
                          }} />
                        </Fragment>
                      )}

                    </View>

                    <View style={{
                      flex: 1,
                      marginHorizontal: 0,
                      marginTop: 10,
                      marginBottom: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <SlidePictures
                        imagesArr={imagesArr}
                        isRtl={isRtl}
                        parentIsOpen
                        inProgress={inProgressGetPic}
                      />
                    </View>

                  </View>
                </Animated.ScrollView>
              </View>
            </View>
          </Interactable.View>
        </View>

      </Fragment>
    )
  }
}
