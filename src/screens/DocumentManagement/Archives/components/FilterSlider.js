import React, { PureComponent } from 'react'
import { setOpenedBottomSheet } from 'src/redux/actions/user'
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { sp } from '../../../../utils/func'
import { colors, fonts } from '../../../../styles/vars'

import Interactable from 'react-native-interactable'
import { CheckBox } from 'react-native-elements'
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
    fontSize: sp(20),
    height: 28,
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
export default class FilterSlider extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      currentOpenItemIndex: null,
      folderNameListCopy: [],
      inProgressSnap: false,
    }
    this._deltaY = new Animated.Value(0)
  }

  UNSAFE_componentWillReceiveProps (props) {
    if (props && props.isOpen && props.isOpen !== this.props.isOpen) {
      this.setState({ folderNameListCopy: JSON.parse(JSON.stringify(props.folderNameList)) })
      this.listRef.snapTo({ index: 1 })
    }
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
      this.props.closeFilterSheet()
    }
  }
  handleSetRef = (ref) => {
    this.listRef = ref
  }

  handleToggleFoldersName = (i) => () => {
    const {
      folderNameListCopy,
    } = this.state
    let folderNameList = JSON.parse(JSON.stringify(folderNameListCopy))
    const index = folderNameList.findIndex((it) => it.folderId === i.folderId)
    folderNameList[index].press = !folderNameList[index].press
    this.setState({
      folderNameListCopy: folderNameList,
    })
  }

  handleSaveFoldersName = () => {
    const {
      folderNameListCopy,
    } = this.state
    this.closeSheet()
    this.props.setItemsFilter(folderNameListCopy)
  }

  handleRemoveAllFoldersName = () => {
    const {
      folderNameListCopy,
    } = this.state
    let folderNameList = JSON.parse(JSON.stringify(folderNameListCopy))
    folderNameList.forEach(it => {
      it.press = false
    })
    this.setState({
      folderNameListCopy: folderNameList,
    })
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

  render () {
    const {
      currentOpenItemIndex,
      folderNameListCopy,
      inProgressSnap,
    } = this.state
    let lenFoldersNameCopy = folderNameListCopy.filter((it) => it.press === true).length

    return (
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
          snapPoints={[
            { y: 40 },
            { y: Screen.height - 500 },
            { y: Screen.height + 30 }]}
          boundaries={{ top: -500 }}
          initialPosition={{ y: Screen.height + 30 }}
          animatedValueY={this._deltaY}>
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHandle}/>
            </View>

            <View style={{
              left: 0,
              right: 0,
              height: Screen.height - 90,
            }}>
              <View
                style={{
                  flexDirection: 'row-reverse',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                  paddingHorizontal: 15,
                  paddingBottom: 5,
                }}>
                <View>
                  <TouchableOpacity
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    onPress={this.handleSaveFoldersName}>
                    <Text style={{
                      color: '#2aa1d9',
                      fontSize: sp(15),
                      fontFamily: fonts.regular,
                    }}>
                      {'שמירה'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <Text style={{
                    color: '#022258',
                    fontSize: sp(16),
                    fontFamily: fonts.regular,
                  }}>
                    {'סינון לפי שם תיקייה'}
                  </Text>
                </View>
                <View style={{
                  marginTop: 30,
                }}>
                  <TouchableOpacity
                    activeOpacity={(lenFoldersNameCopy > 0) ? 0.2 : 1}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                    onPress={this.handleRemoveAllFoldersName}>
                    <Text style={{
                      color: lenFoldersNameCopy > 0 ? '#2aa1d9' : '#c2c3c3',
                      fontSize: sp(15),
                      fontFamily: fonts.regular,
                    }}>
                      {'הסר הכל'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <Animated.ScrollView
                contentContainerStyle={{
                  marginRight: 8,
                  marginLeft: 15,
                }}
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
                {folderNameListCopy.length > 0 && folderNameListCopy.map((f, i) => {
                  return (
                    <View key={i.toString()}
                          style={{
                            height: 50,
                            width: '100%',
                          }}>

                      <View style={{
                        height: 50,
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                      }}>
                        <CheckBox
                          containerStyle={{
                            backgroundColor: 'transparent',
                            left: 0,
                            margin: 0,
                            padding: 0,
                            borderWidth: 0,
                            right: 0,
                            width: '100%',
                            alignSelf: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'center',
                          }}
                          textStyle={{
                            fontSize: sp(20),
                            color: colors.blue32,
                            fontWeight: 'normal',
                            textAlign: 'right',
                            fontFamily: fonts.regular,
                            right: 0,
                            left: 0,
                            justifyContent: 'space-between',
                            width: '87%',
                            margin: 0,
                            padding: 0,
                          }}
                          size={30}
                          left
                          title={f.folderName}
                          iconLeft
                          checkedColor={'#022258'}
                          uncheckedColor={'#ced7e0'}
                          iconType="material-community"
                          checkedIcon="checkbox-blank-circle"
                          uncheckedIcon="checkbox-blank-circle-outline"
                          checked={f.press}
                          onPress={this.handleToggleFoldersName(f)}
                        />
                      </View>

                      <View style={{
                        height: 1,
                        width: '100%',
                        backgroundColor: colors.gray30,
                      }} />
                    </View>
                  )
                })}
              </Animated.ScrollView>
            </View>
          </View>
        </Interactable.View>
      </View>
    )
  }
}
