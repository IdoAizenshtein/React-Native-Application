import React, {Fragment, PureComponent} from 'react'
import {setOpenedBottomSheet} from 'src/redux/actions/user'
import {Animated, AppState, Dimensions, Image, Text, TouchableWithoutFeedback, View} from 'react-native'
import styles from './BottomSheetMutavimStyle'
import Interactable from 'react-native-interactable'
import {colors, fonts} from '../../styles/vars'
import {Button} from 'react-native-elements'
import {goTo, sp} from '../../utils/func'
import CustomIcon from '../Icons/Fontello'
import {budgetPopUpApi} from '../../api'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 75,
}
export default class BottomSheetMutavim extends PureComponent {
    state = {
        inProgressSnap: false,
        currentOpenItemIndexBottomSheet: null,
        _deltaY: new Animated.Value(0),
    }

    componentDidMount() {
        this.props.dispatch(setOpenedBottomSheet(false))
        AppState.addEventListener('change', this._handleAppStateChange)
        setTimeout(() => {
            // if (this.props.mutavimPopupTimes < 3 && ALERTS_TRIAL.showMutavimSheet) {
            //       //   ALERTS_TRIAL.showMutavimSheet = false
            //       //   this.openBottomSheet()
            //       // }

            // ALERTS_TRIAL.showMutavimSheet = false
            const {company} = this.props
            if (company.budgetPopUpType !== null && company.budgetPopUpType !== 0) {
                if (company.budgetPopUpType === 1) {
                    this.setState({
                        stateData: 1,
                    })
                    this.openBottomSheet()
                } else if (company.budgetPopUpType === 2 || company.budgetPopUpType ===
                    3) {
                    if (company.budgetExpiredDays <= 7 && company.budgetExpiredDays > 0) {
                        this.setState({
                            stateData: 3,
                        })
                        this.openBottomSheet()
                    } else if (company.budgetPopUpType === 2 &&
                        company.budgetExpiredDays > 7) {
                        this.setState({
                            stateData: 2,
                        })
                        this.openBottomSheet()
                    }
                }
            }
        }, 20)
    }

    componentWillUnmount() {
        if(AppState.removeEventListener){
            AppState.removeEventListener('change', this._handleAppStateChange)
        }
    }

    _handleAppStateChange = (nextAppState) => {
        if (nextAppState === 'active') {
            setTimeout(() => {
                // if (this.props.mutavimPopupTimes < 3 && ALERTS_TRIAL.showMutavimSheet) {
                //   ALERTS_TRIAL.showMutavimSheet = false
                //   this.openBottomSheet()
                // }
                const {company} = this.props
                if (company.budgetPopUpType !== null && company.budgetPopUpType !== 0) {
                    if (company.budgetPopUpType === 1) {
                        this.setState({
                            stateData: 1,
                        })
                        this.openBottomSheet()
                    } else if (company.budgetPopUpType === 2 ||
                        company.budgetPopUpType === 3) {
                        if (company.budgetExpiredDays <= 7 && company.budgetExpiredDays >
                            0) {
                            this.setState({
                                stateData: 3,
                            })
                            this.openBottomSheet()
                        } else if (company.budgetPopUpType === 2 &&
                            company.budgetExpiredDays > 7) {
                            this.setState({
                                stateData: 2,
                            })
                            this.openBottomSheet()
                        }
                    }
                }
            }, 20)
        }
    }

    getData = async (name) => {
        const value = await AsyncStorage.getItem(name)
        if (value !== null) {
            return JSON.parse(value)
        } else {
            return null
        }
    }

    storeData = async (name, value) => {
        await AsyncStorage.setItem(name, JSON.stringify(value))
    }
    openBottomSheet = () => {
        if (this.listRefSheet && this.listRefSheet.snapTo) {
            this.listRefSheet.snapTo({index: 1})
        }
    }
    close = () => {
        // ALERTS_TRIAL.showMutavimSheet = false
        // this.setState({
        //   saveCategories: true,
        // })
        setTimeout(() => {
            this.listRefSheet.snapTo({index: 2})
        }, 20)
    }
    budgetPopUp = (goToPage) => {
        const {company} = this.props
        const {stateData} = this.state

        budgetPopUpApi.post({
            body: {
                companyId: company.companyId,
                budgetPopUpType: company.budgetPopUpType,
                purchase: stateData === 3,
            },
        })
            .then(() => {
                if (goToPage !== false && stateData !== 3) {
                    this.goBudget()
                } else if (stateData === 3) {
                    this.setState({
                        stateData: 4,
                    }, () => {
                        this.listRefSheet.snapTo({index: 1})
                    })
                }
            })
            .catch(() => {
            })
    }
    handleSetRefSheet = (ref) => {
        this.listRefSheet = ref
    }
    onDrawerSnap = async (states) => {
        const index = states.nativeEvent.index
        // console.log('index---', index)
        if (index === 0) {
            this.props.dispatch(setOpenedBottomSheet(true))
            // console.log('Top')
            this.setState({
                currentOpenItemIndexBottomSheet: 'Top',
            })
        } else if (index === 1) {
            // console.log('Middle')
            this.props.dispatch(setOpenedBottomSheet(true))
            this.setState({
                currentOpenItemIndexBottomSheet: 'Middle',
            })
        } else if (index === 2) {
            // console.log('Close')
            // if (!this.state.saveCategories) {
            //   this.setState({
            //     saveCategories: true,
            //   })
            // }
            // ALERTS_TRIAL.showMutavimSheet = false
            const {stateData} = this.state
            // console.log('stateData', stateData)

            if (stateData === 2) {
                const isSaveNumClose = await this.getData('closeSlideBudget')
                // console.log('isSaveNumClose', isSaveNumClose)
                if (isSaveNumClose) {
                    await this.storeData('closeSlideBudget', Number(isSaveNumClose) + 1)
                    if ((Number(isSaveNumClose) + 1) >= 3) {
                        this.budgetPopUp(false)
                    }
                } else {
                    await this.storeData('closeSlideBudget', 1)
                }
            } else if (stateData === 1) {
                this.budgetPopUp(false)
            }
            this.props.dispatch(setOpenedBottomSheet(false))
            this.setState({
                currentOpenItemIndexBottomSheet: null,
            })
        }
    }

    // goMutavim = () => {
    //   goTo( this.props.navigation, 'MUTAVIM')
    // }

    goBudget = () => {
        goTo(this.props.navigation, 'BUDGET')
    }

    render() {
        const {
            inProgressSnap,
            currentOpenItemIndexBottomSheet,
            _deltaY,
            stateData,
        } = this.state
        const {company} = this.props

        return (
            <View
                style={[
                    {
                        elevation: 99,
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                    }]}
                pointerEvents={'box-none'}>

                {currentOpenItemIndexBottomSheet !== null && (
                    <TouchableWithoutFeedback
                        onPress={this.close}
                        style={[
                            {
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                zIndex: 9,
                                height: Screen.height,
                            }]}>
                        <Animated.View
                            pointerEvents={currentOpenItemIndexBottomSheet === null
                                ? 'box-none'
                                : 'auto'}
                            style={[
                                {
                                    backgroundColor: 'black',
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    zIndex: 9,
                                    opacity: _deltaY.interpolate({
                                        inputRange: [
                                            0,
                                            1,
                                            Screen.height - (stateData === 3 ? 360 : (stateData === 4 ? 240 : 550)),
                                            Screen.height + 30,
                                        ],
                                        outputRange: [0, 0.8, 0.8, 0],
                                        extrapolate: 'clamp',
                                    }),
                                }]}/>
                    </TouchableWithoutFeedback>
                )}


                <Interactable.View
                    style={{
                        zIndex: 999,
                    }}
                    animatedNativeDriver
                    onSnapStart={this.onDrawerSnap}
                    verticalOnly
                    ref={this.handleSetRefSheet}
                    snapPoints={[
                        {y: 20},
                        {
                            y: Screen.height -
                                (stateData === 3 ? 360 : (stateData === 4 ? 240 : 550)),
                        },
                        {y: Screen.height + 30}]}
                    boundaries={{
                        top: (stateData === 3 ? -360 : (stateData === 4
                            ? -240
                            : -550)),
                    }}
                    initialPosition={{y: Screen.height + 30}}
                    animatedValueX={new Animated.Value(0)}
                    animatedValueY={_deltaY}>
                    <View style={styles.panel}>
                        <View style={[styles.panelHeader, {paddingHorizontal: 10}]}>
                            <View style={styles.panelHandle}/>
                        </View>

                        <View style={{
                            left: 0,
                            right: 0,
                            height: Screen.height - 70,
                        }}>
                            <Animated.ScrollView
                                ref={scrollViewTop => (this.scrollViewTop = scrollViewTop)}
                                maximumZoomScale={0}
                                decelerationRate={'fast'}
                                disableIntervalMomentum
                                disableScrollViewPanResponder
                                directionalLockEnabled
                                automaticallyAdjustContentInsets={false}
                                scrollEnabled={currentOpenItemIndexBottomSheet === 'Top' ||
                                (currentOpenItemIndexBottomSheet === 'Middle' && inProgressSnap)}
                                showsVerticalScrollIndicator={false}
                                scrollEventThrottle={1}
                                onScroll={
                                    Animated.event([{nativeEvent: {contentOffset: {}}}],
                                        {
                                            useNativeDriver: false,
                                            isInteraction: false,
                                            listener: e => {
                                                const offset = e.nativeEvent.contentOffset.y
                                                if (offset < 0) {
                                                    this.setState({
                                                        inProgressSnap: true,
                                                    })
                                                    if (this.scrollViewTop &&
                                                        this.scrollViewTop._component) {
                                                        this.scrollViewTop._component.scrollTo({
                                                            animated: false,
                                                            y: 0,
                                                            x: 0,
                                                        })
                                                    }
                                                    this.listRefSheet.snapTo({index: 1})
                                                    setTimeout(() => {
                                                        this.setState({
                                                            inProgressSnap: false,
                                                        })
                                                    }, 30)
                                                }
                                            },
                                        })
                                }>
                                {(stateData === 1 || stateData === 2) && (<Fragment>
                                    <View style={{
                                        paddingHorizontal: 0,
                                        marginTop: 5,
                                    }}>
                                        <View style={{
                                            height: 32.5,
                                            flex: 1,
                                            backgroundColor: '#f3ca35',
                                            flexDirection: 'row',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            alignContent: 'center',
                                        }}>
                                            <Text style={{
                                                color: '#ffffff',
                                                fontSize: sp(19),
                                                fontFamily: fonts.regular,
                                                textAlign: 'center',
                                            }}>{' • '}</Text>
                                            <Text style={{
                                                height: 32.5,
                                                color: '#ffffff',
                                                fontSize: sp(25),
                                                fontFamily: fonts.semiBold,
                                                textAlign: 'center',
                                            }}>{'התחדשנו'}</Text>
                                            <Text style={{
                                                color: '#ffffff',
                                                fontSize: sp(19),
                                                fontFamily: fonts.regular,
                                                textAlign: 'center',
                                            }}>{' • '}</Text>
                                        </View>
                                    </View>
                                    <View style={{
                                        paddingHorizontal: 10,
                                    }}>
                                        <View style={{
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: 20,
                                        }}>
                                            <Image
                                                style={{
                                                    height: 31,
                                                    marginBottom: 5,
                                                }}
                                                resizeMode="contain"
                                                source={require('BiziboxUI/assets/logoBig.png')}
                                            />
                                            <Text style={{
                                                marginBottom: 30,
                                                color: '#022258',
                                                fontSize: sp(25),
                                                fontFamily: fonts.bold,
                                                textAlign: 'center',
                                            }}>{'בונה עבורכם תקציב אוטומטי'}</Text>
                                        </View>

                                        <View style={{
                                            paddingHorizontal: 25,
                                            marginBottom: 5,
                                            flex: 1,
                                            justifyContent: 'center',
                                        }}>
                                            <View style={{
                                                flexDirection: 'row-reverse',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                            }}>
                                                <View style={{
                                                    height: 34,
                                                    alignSelf: 'flex-start',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    <Image style={{
                                                        alignSelf: 'center',
                                                        resizeMode: 'contain',
                                                        width: 29 / 2,
                                                        height: 24 / 2,
                                                    }} source={require(
                                                        'BiziboxUI/assets/checkBadget.png')}/>
                                                </View>
                                                <View style={{
                                                    paddingHorizontal: 6,
                                                }}/>
                                                <Text style={[
                                                    {
                                                        fontSize: sp(18),
                                                        textAlign: 'right',
                                                        fontFamily: fonts.regular,
                                                        color: '#022258',
                                                    }]}>
                                                    {'מוצר מתקדם לניהול תקציב שנבנה במיוחד עבורכם'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                paddingHorizontal: 25,
                                                marginBottom: 5,
                                                flex: 1,
                                                justifyContent: 'center',
                                            }}>
                                            <View style={{
                                                flexDirection: 'row-reverse',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                            }}>
                                                <View style={{
                                                    height: 34,
                                                    alignSelf: 'flex-start',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    <Image style={{
                                                        alignSelf: 'center',
                                                        resizeMode: 'contain',
                                                        width: 29 / 2,
                                                        height: 24 / 2,
                                                    }} source={require(
                                                        'BiziboxUI/assets/checkBadget.png')}/>
                                                </View>
                                                <View style={{
                                                    paddingHorizontal: 6,
                                                }}/>
                                                <Text style={[
                                                    {
                                                        fontSize: sp(18),
                                                        textAlign: 'right',
                                                        fontFamily: fonts.regular,
                                                        color: '#022258',
                                                    }]}>
                                                    {'התראות בזמן אמת על חריגות מהתקציב שהוגדר'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                paddingHorizontal: 25,
                                                marginBottom: 5,
                                                flex: 1,
                                                justifyContent: 'center',
                                            }}>
                                            <View style={{
                                                flexDirection: 'row-reverse',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                            }}>
                                                <View style={{
                                                    height: 34,
                                                    alignSelf: 'flex-start',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    <Image style={{
                                                        alignSelf: 'center',
                                                        resizeMode: 'contain',
                                                        width: 29 / 2,
                                                        height: 24 / 2,
                                                    }} source={require(
                                                        'BiziboxUI/assets/checkBadget.png')}/>
                                                </View>
                                                <View style={{
                                                    paddingHorizontal: 6,
                                                }}/>
                                                <Text style={[
                                                    {
                                                        fontSize: sp(18),
                                                        textAlign: 'right',
                                                        fontFamily: fonts.regular,
                                                        color: '#022258',
                                                    }]}>
                                                    {'קטלוג אוטומטי על פי ההיסטוריה שלכם'}
                                                </Text>
                                            </View>
                                        </View>
                                        <View
                                            style={{
                                                paddingHorizontal: 25,
                                                marginBottom: 5,
                                                flex: 1,
                                                justifyContent: 'center',
                                            }}>
                                            <View style={{
                                                flexDirection: 'row-reverse',
                                                alignItems: 'center',
                                                alignContent: 'center',
                                            }}>
                                                <View style={{
                                                    height: 34,
                                                    alignSelf: 'flex-start',
                                                    justifyContent: 'center',
                                                    alignContent: 'center',
                                                    alignItems: 'center',
                                                }}>
                                                    <Image style={{
                                                        alignSelf: 'center',
                                                        resizeMode: 'contain',
                                                        width: 29 / 2,
                                                        height: 24 / 2,
                                                    }} source={require(
                                                        'BiziboxUI/assets/checkBadget.png')}/>
                                                </View>
                                                <View style={{
                                                    paddingHorizontal: 6,
                                                }}/>
                                                <Text style={[
                                                    {
                                                        fontSize: sp(18),
                                                        textAlign: 'right',
                                                        fontFamily: fonts.regular,
                                                        color: '#022258',
                                                    }]}>
                                                    {'ניתוח קטגוריות, זיהוי מגמות והשוואתם לשנה הקודמת'}
                                                </Text>
                                            </View>
                                        </View>

                                        <Text style={[
                                            {
                                                fontSize: sp(stateData === 1 ? 22.5 : 19.5),
                                                textAlign: 'center',
                                                fontFamily: fonts.semiBold,
                                                color: '#022258',
                                                marginTop: 20,
                                            }]}>
                                            {stateData === 1
                                                ? 'ואתם נהנים ללא עלות נוספת!'
                                                : 'אנו מזמינים אתכם להתנסות של חודש חינם'}
                                        </Text>
                                        {stateData === 2 && (
                                            <Text style={[
                                                {
                                                    fontSize: sp(16),
                                                    textAlign: 'center',
                                                    fontFamily: fonts.regular,
                                                    color: '#022258',
                                                }]}>
                                                {'ולאחר מכן בתוספת של 34 ש”ח כולל מע״מ בלבד לחודש'}
                                            </Text>
                                        )}

                                        <Button
                                            buttonStyle={{
                                                marginTop: 35,
                                                height: 42,
                                                borderRadius: 6,
                                                backgroundColor: '#f3ca35',
                                                width: 241,
                                                padding: 0,
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                            }}
                                            titleStyle={{
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(18),
                                                textAlign: 'center',
                                                color: '#022258',
                                            }}
                                            icon={
                                                <CustomIcon name="bag" size={22} color={colors.blue32}
                                                            style={{marginRight: 5}}/>
                                            }
                                            onPress={this.budgetPopUp}
                                            title={'למסך ניהול תקציב'}
                                        />
                                    </View>

                                </Fragment>)}

                                {company && (stateData === 3) &&
                                (<Fragment>
                                    <View style={{
                                        paddingHorizontal: 10,
                                    }}>
                                        <View style={{
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: 20,
                                        }}>
                                            <Text style={{
                                                color: '#022258',
                                                fontSize: sp(22),
                                                fontFamily: fonts.bold,
                                                textAlign: 'center',
                                            }}>
                                                {'בעוד '}
                                                {company.budgetExpiredDays}
                                                {' ימים יסתיים חודש ההתנסות'}
                                            </Text>
                                            <Text style={{
                                                color: '#022258',
                                                fontSize: sp(22),
                                                fontFamily: fonts.bold,
                                                textAlign: 'center',
                                            }}>{'שלכם בכלי לניהול תקציב'}</Text>
                                            <Text style={{
                                                marginTop: 5,
                                                color: '#022258',
                                                fontSize: sp(18),
                                                fontFamily: fonts.regular,
                                                textAlign: 'center',
                                            }}>{'על מנת שנוכל להמשיך ולבנות תקציב שיסייע\n' +
                                            'לכם להצליח בניהול פיננסי נכון'}</Text>
                                        </View>

                                        <Button
                                            buttonStyle={{
                                                marginTop: 35,
                                                height: 42,
                                                borderRadius: 6,
                                                backgroundColor: '#f3ca35',
                                                width: 241,
                                                padding: 0,
                                                alignItems: 'center',
                                                alignSelf: 'center',
                                                alignContent: 'center',
                                                justifyContent: 'center',
                                            }}
                                            titleStyle={{
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(18),
                                                textAlign: 'center',
                                                color: '#022258',
                                            }}
                                            onPress={this.budgetPopUp}
                                            title={'לחצו לרכישה'}
                                        />

                                        <Text style={{
                                            marginTop: 50,
                                            color: '#022258',
                                            fontSize: sp(13.5),
                                            fontFamily: fonts.light,
                                            textAlign: 'center',
                                        }}>
                                            {'בתוספת 34 ש"ח כולל מע״מ החל ממועד החיוב הקרוב. מומלץ לרכוש את הכלי לפני\n' +
                                            'תום תקופת הניסיון על מנת לשמור את הנתונים שעבדתם עליהם עד כה'}
                                        </Text>
                                    </View>
                                </Fragment>)}

                                {(stateData === 4) &&
                                (<Fragment>
                                    <View style={{
                                        paddingHorizontal: 10,
                                    }}>
                                        <View style={{
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginTop: 5,
                                        }}>
                                            <Image
                                                style={{
                                                    height: 92,
                                                }}
                                                resizeMode="contain"
                                                source={require('BiziboxUI/assets/logo.png')}
                                            />
                                            <Text style={{
                                                color: '#022258',
                                                fontSize: sp(25),
                                                fontFamily: fonts.bold,
                                                textAlign: 'center',
                                            }}>
                                                {'תודה על הצטרפותכם'}
                                            </Text>
                                            <Text style={{
                                                color: '#022258',
                                                fontSize: sp(21.5),
                                                fontFamily: fonts.regular,
                                                textAlign: 'center',
                                            }}>{'עשיתם עוד צעד לניהול פיננסי נכון ומוצלח'}</Text>
                                        </View>
                                    </View>
                                </Fragment>)}

                                {/* <View style={{ */}
                                {/*  paddingHorizontal: 0, */}
                                {/*  marginTop: 5, */}
                                {/* }}> */}
                                {/*  <View style={{ */}
                                {/*    height: 32.5, */}
                                {/*    flex: 1, */}
                                {/*    backgroundColor: '#44b7e9', */}
                                {/*    flexDirection: 'row', */}
                                {/*    justifyContent: 'center', */}
                                {/*    alignItems: 'center', */}
                                {/*    alignContent: 'center', */}
                                {/*  }}> */}
                                {/*    <Text style={{ */}
                                {/*      color: '#ffffff', */}
                                {/*      fontSize: sp(19), */}
                                {/*      fontFamily: fonts.regular, */}
                                {/*      textAlign: 'center', */}
                                {/*    }}>{' • '}</Text> */}
                                {/*    <Text style={{ */}
                                {/*      height: 32.5, */}
                                {/*      color: '#ffffff', */}
                                {/*      fontSize: sp(25), */}
                                {/*      fontFamily: fonts.semiBold, */}
                                {/*      textAlign: 'center', */}
                                {/*    }}>{'חדש'}</Text> */}
                                {/*    <Text style={{ */}
                                {/*      color: '#ffffff', */}
                                {/*      fontSize: sp(19), */}
                                {/*      fontFamily: fonts.regular, */}
                                {/*      textAlign: 'center', */}
                                {/*    }}>{' • '}</Text> */}
                                {/*  </View> */}
                                {/* </View> */}
                                {/* <View style={{ */}
                                {/*  paddingHorizontal: 10, */}
                                {/* }}> */}
                                {/*  <Text style={{ */}
                                {/*    marginTop: 20, */}
                                {/*    marginBottom: 30, */}
                                {/*    color: '#022258', */}
                                {/*    fontSize: sp(25), */}
                                {/*    fontFamily: fonts.bold, */}
                                {/*    textAlign: 'center', */}
                                {/*  }}>{'כל המוטבים שלך במסך אחד!'}</Text> */}

                                {/*  <View */}
                                {/*    style={{ */}
                                {/*      paddingHorizontal: 12, */}
                                {/*      marginBottom: 20, */}
                                {/*      flex: 1, */}
                                {/*      justifyContent: 'center', */}
                                {/*    }}> */}
                                {/*    <View style={{ */}
                                {/*      flexDirection: 'row-reverse', */}
                                {/*      alignItems: 'center', */}
                                {/*      alignContent: 'center', */}
                                {/*    }}> */}
                                {/*      <View style={{ */}
                                {/*        height: 34, */}
                                {/*        alignSelf: 'center', */}
                                {/*        justifyContent: 'center', */}
                                {/*        alignContent: 'center', */}
                                {/*        alignItems: 'center', */}
                                {/*      }}> */}
                                {/*        <Image style={{ alignSelf: 'center', resizeMode: 'contain', width: 63 / 2, height: 39 / 2 }} */}
                                {/*          source={require('BiziboxUI/assets/mutavim1.png')} /> */}
                                {/*      </View> */}
                                {/*      <View style={{ */}
                                {/*        paddingHorizontal: 6, */}
                                {/*      }} /> */}
                                {/*      <Text style={[{ */}
                                {/*        fontSize: sp(18), */}
                                {/*        textAlign: 'right', */}
                                {/*        fontFamily: fonts.regular, */}
                                {/*        color: '#022258', */}
                                {/*      }]}> */}
                                {/*        <Text style={{ */}
                                {/*          fontFamily: fonts.semiBold, */}
                                {/*        }}>{'ריכוז המוטבים '}</Text> */}
                                {/*        {'מהם מקבלים או מעבירים'} */}
                                {/*        {'\n'} */}
                                {/*        {'העברות בנקאיות (זכות/ חובה)'} */}
                                {/*      </Text> */}
                                {/*    </View> */}
                                {/*  </View> */}
                                {/*  <View */}
                                {/*    style={{ */}
                                {/*      paddingHorizontal: 12, */}
                                {/*      marginBottom: 20, */}
                                {/*      flex: 1, */}
                                {/*      justifyContent: 'center', */}
                                {/*    }}> */}
                                {/*    <View style={{ */}
                                {/*      flexDirection: 'row-reverse', */}
                                {/*      alignItems: 'center', */}
                                {/*      alignContent: 'center', */}
                                {/*    }}> */}
                                {/*      <View style={{ */}
                                {/*        height: 34, */}
                                {/*        alignSelf: 'center', */}
                                {/*        justifyContent: 'center', */}
                                {/*        alignContent: 'center', */}
                                {/*        alignItems: 'center', */}
                                {/*      }}> */}
                                {/*        <Image style={{ alignSelf: 'center', resizeMode: 'contain', width: 46 / 2, height: 44 / 2 }} */}
                                {/*          source={require('BiziboxUI/assets/mutavim2.png')} /> */}
                                {/*      </View> */}
                                {/*      <View style={{ */}
                                {/*        paddingHorizontal: 6, */}
                                {/*      }} /> */}
                                {/*      <Text style={[{ */}
                                {/*        fontSize: sp(18), */}
                                {/*        textAlign: 'right', */}
                                {/*        fontFamily: fonts.regular, */}
                                {/*        color: '#022258', */}
                                {/*      }]}> */}
                                {/*        {'הצגת '} */}
                                {/*        <Text style={{ */}
                                {/*          fontFamily: fonts.semiBold, */}
                                {/*        }}>{'היסטוריית המוטבים'}</Text> */}
                                {/*        {' מכלל'} */}
                                {/*        {'\n'} */}
                                {/*        {'החשבונות שלך!'} */}
                                {/*      </Text> */}
                                {/*    </View> */}
                                {/*  </View> */}
                                {/*  <View */}
                                {/*    style={{ */}
                                {/*      paddingHorizontal: 12, */}
                                {/*      marginBottom: 20, */}
                                {/*      flex: 1, */}
                                {/*      justifyContent: 'center', */}
                                {/*    }}> */}
                                {/*    <View style={{ */}
                                {/*      flexDirection: 'row-reverse', */}
                                {/*      alignItems: 'center', */}
                                {/*      alignContent: 'center', */}
                                {/*    }}> */}
                                {/*      <View style={{ */}
                                {/*        height: 34, */}
                                {/*        alignSelf: 'center', */}
                                {/*        justifyContent: 'center', */}
                                {/*        alignContent: 'center', */}
                                {/*        alignItems: 'center', */}
                                {/*      }}> */}
                                {/*        <Image style={{ alignSelf: 'center', resizeMode: 'contain', width: 46 / 2, height: 37 / 2 }} */}
                                {/*          source={require('BiziboxUI/assets/mutavim3.png')} /> */}
                                {/*      </View> */}
                                {/*      <View style={{ */}
                                {/*        paddingHorizontal: 6, */}
                                {/*      }} /> */}
                                {/*      <Text style={[{ */}
                                {/*        fontSize: sp(18), */}
                                {/*        textAlign: 'right', */}
                                {/*        fontFamily: fonts.regular, */}
                                {/*        color: '#022258', */}
                                {/*      }]}> */}
                                {/*        <Text style={{ */}
                                {/*          fontFamily: fonts.semiBold, */}
                                {/*        }}>{'סינון '}</Text> */}
                                {/*        {'לפי שם המוטב או קטגוריה'} */}
                                {/*      </Text> */}
                                {/*    </View> */}
                                {/*  </View> */}
                                {/*  <View */}
                                {/*    style={{ */}
                                {/*      paddingHorizontal: 12, */}
                                {/*      marginBottom: 20, */}
                                {/*      flex: 1, */}
                                {/*      justifyContent: 'center', */}
                                {/*    }}> */}
                                {/*    <View style={{ */}
                                {/*      flexDirection: 'row-reverse', */}
                                {/*      alignItems: 'center', */}
                                {/*      alignContent: 'center', */}
                                {/*    }}> */}
                                {/*      <View style={{ */}
                                {/*        height: 34, */}
                                {/*        alignSelf: 'center', */}
                                {/*        justifyContent: 'center', */}
                                {/*        alignContent: 'center', */}
                                {/*        alignItems: 'center', */}
                                {/*      }}> */}
                                {/*        <Image style={{ alignSelf: 'center', resizeMode: 'contain', width: 47 / 2, height: 40 / 2 }} */}
                                {/*          source={require('BiziboxUI/assets/mutavim4.png')} /> */}
                                {/*      </View> */}
                                {/*      <View style={{ */}
                                {/*        paddingHorizontal: 6, */}
                                {/*      }} /> */}
                                {/*      <Text style={[{ */}
                                {/*        fontSize: sp(18), */}
                                {/*        textAlign: 'right', */}
                                {/*        fontFamily: fonts.regular, */}
                                {/*        color: '#022258', */}
                                {/*      }]}> */}
                                {/*        <Text style={{ */}
                                {/*          fontFamily: fonts.semiBold, */}
                                {/*        }}>{'תצוגה גרפית '}</Text> */}
                                {/*        {'לכל מוטב המציגה את'} */}
                                {/*        {'\n'} */}
                                {/*        {'ההעברות ב- 12 החודשים האחרונים'} */}
                                {/*      </Text> */}
                                {/*    </View> */}
                                {/*  </View> */}
                                {/*  <View */}
                                {/*    style={{ */}
                                {/*      paddingHorizontal: 12, */}
                                {/*      marginBottom: 20, */}
                                {/*      flex: 1, */}
                                {/*      justifyContent: 'center', */}
                                {/*    }}> */}
                                {/*    <View style={{ */}
                                {/*      flexDirection: 'row-reverse', */}
                                {/*      alignItems: 'center', */}
                                {/*      alignContent: 'center', */}
                                {/*    }}> */}
                                {/*      <View style={{ */}
                                {/*        height: 34, */}
                                {/*        alignSelf: 'center', */}
                                {/*        justifyContent: 'center', */}
                                {/*        alignContent: 'center', */}
                                {/*        alignItems: 'center', */}
                                {/*      }}> */}
                                {/*        <Image style={{ alignSelf: 'center', resizeMode: 'contain', width: 51 / 2, height: 51 / 2 }} */}
                                {/*          source={require('BiziboxUI/assets/mutavim5.png')} /> */}
                                {/*      </View> */}
                                {/*      <View style={{ */}
                                {/*        paddingHorizontal: 6, */}
                                {/*      }} /> */}
                                {/*      <Text style={[{ */}
                                {/*        fontSize: sp(18), */}
                                {/*        textAlign: 'right', */}
                                {/*        fontFamily: fonts.regular, */}
                                {/*        color: '#022258', */}
                                {/*      }]}> */}
                                {/*        <Text style={{ */}
                                {/*          fontFamily: fonts.semiBold, */}
                                {/*        }}>{'הוספת הערות '}</Text> */}
                                {/*        {'ופרטי איש קשר למוטב'} */}
                                {/*        {'\n'} */}
                                {/*        {'(שם, מייל, טלפון ו- ח.פ.)'} */}
                                {/*      </Text> */}
                                {/*    </View> */}
                                {/*  </View> */}
                                {/*  <View */}
                                {/*    style={{ */}
                                {/*      paddingHorizontal: 12, */}
                                {/*      marginBottom: 20, */}
                                {/*      flex: 1, */}
                                {/*      justifyContent: 'center', */}
                                {/*    }}> */}
                                {/*    <View style={{ */}
                                {/*      flexDirection: 'row-reverse', */}
                                {/*      alignItems: 'flex-start', */}
                                {/*      alignContent: 'flex-start', */}
                                {/*    }}> */}
                                {/*      <View style={{ */}
                                {/*        height: 34, */}
                                {/*        alignSelf: 'flex-start', */}
                                {/*        justifyContent: 'flex-start', */}
                                {/*        alignContent: 'flex-start', */}
                                {/*        alignItems: 'flex-start', */}
                                {/*      }}> */}
                                {/*        <Image style={{ alignSelf: 'center', resizeMode: 'contain', width: 46 / 2, height: 56 / 2 }} */}
                                {/*          source={require('BiziboxUI/assets/mutavim6.png')} /> */}
                                {/*      </View> */}
                                {/*      <View style={{ */}
                                {/*        paddingHorizontal: 6, */}
                                {/*      }} /> */}
                                {/*      <Text style={[{ */}
                                {/*        fontSize: sp(18), */}
                                {/*        textAlign: 'right', */}
                                {/*        fontFamily: fonts.regular, */}
                                {/*        color: '#022258', */}
                                {/*      }]}> */}
                                {/*        <Text style={{ */}
                                {/*          fontFamily: fonts.semiBold, */}
                                {/*        }}>{'טיפ'}</Text> */}
                                {/*        {'\n'} */}
                                {/*        {'בחירת מוטב בעת הוספת תנועות לתזרים\n' + */}
                                {/*        'תאפשר '} */}
                                {/*        <Text style={{ */}
                                {/*          fontFamily: fonts.semiBold, */}
                                {/*        }}>{'התאמה אוטומטית '}</Text> */}
                                {/*        {' כשהתנועה\n' + */}
                                {/*        'תופיע בבנק'} */}
                                {/*      </Text> */}
                                {/*    </View> */}
                                {/*  </View> */}

                                {/*  <Button */}
                                {/*    buttonStyle={{ */}
                                {/*      marginTop: 15, */}
                                {/*      height: 42, */}
                                {/*      borderRadius: 6, */}
                                {/*      backgroundColor: '#022258', */}
                                {/*      width: 241, */}
                                {/*      padding: 0, */}
                                {/*      alignItems: 'center', */}
                                {/*      alignSelf: 'center', */}
                                {/*      alignContent: 'center', */}
                                {/*      justifyContent: 'center', */}
                                {/*    }} */}
                                {/*    textStyle={{ */}
                                {/*      fontFamily: fonts.semiBold, */}
                                {/*      fontSize: sp(18), */}
                                {/*      textAlign: 'center', */}
                                {/*      color: '#ffffff', */}
                                {/*    }} */}
                                {/*    onPress={this.goBudget} */}
                                {/*    title={'למסך מוטבים'} */}
                                {/*  /> */}
                                {/* </View> */}

                            </Animated.ScrollView>
                        </View>
                    </View>
                </Interactable.View>
            </View>
        )
    }
}
