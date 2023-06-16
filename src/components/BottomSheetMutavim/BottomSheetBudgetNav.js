import React, {Fragment, PureComponent} from 'react'
import {setOpenedBottomSheet} from 'src/redux/actions/user'
import {Animated, Dimensions, Image, Modal, Text, TouchableWithoutFeedback, View} from 'react-native'
// import {connect} from 'react-redux'

import {withTranslation} from 'react-i18next'
import styles from './BottomSheetMutavimStyle'

import Interactable from 'react-native-interactable'
import {fonts} from '../../styles/vars'
import {Button} from 'react-native-elements'
import {goTo, sp} from '../../utils/func'
import {budgetPopUpApi} from '../../api'

const Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height - 75,
}
@withTranslation()
export default class BottomSheetBudgetNav extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            inProgressSnap: false,
            currentOpenItemIndexBottomSheet: null,
            _deltaY: new Animated.Value(0),
        }
    }

    componentDidMount() {
        setTimeout(() => {
            this.props.dispatch(setOpenedBottomSheet(false))
            this.setState({
                stateData: 3,
            })
            this.openBottomSheet()
        }, 20)
    }

    openBottomSheet = () => {
        if (this.listRefSheet && this.listRefSheet.snapTo) {
            this.listRefSheet.snapTo({index: 1})
        }
    };
    close = () => {
        setTimeout(() => {
            this.listRefSheet.snapTo({index: 2})
        }, 20)
    };
    budgetPopUp = () => {
        const {company} = this.props
        budgetPopUpApi.post({
            body: {
                companyId: company.companyId,
                budgetPopUpType: company.budgetPopUpType,
                purchase: true,
            },
        })
            .then(() => {
                this.setState({
                    stateData: 4,
                }, () => {
                    this.listRefSheet.snapTo({index: 1})
                })
            })
            .catch(() => {

            })
    };
    handleSetRefSheet = (ref) => {
        this.listRefSheet = ref
    };
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
            this.props.dispatch(setOpenedBottomSheet(false))

            this.setState({
                currentOpenItemIndexBottomSheet: null,
            })
            setTimeout(() => {
                this.props.close()
            }, 100)
        }
    };
    goBudget = () => {
        goTo(this.props.navigation, 'BUDGET')
    };

    bottomPress = () => {
        const {company} = this.props
        if (company.budgetExpiredDays > 0) {
            this.goBudget()
        } else {
            this.budgetPopUp()
        }
    };

    render() {
        const {
            inProgressSnap,
            currentOpenItemIndexBottomSheet,
            _deltaY,
            stateData,
        } = this.state
        return (
            <Modal
                animationType="none"
                transparent
                visible>
                <View style={[{
                    elevation: 99,
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                }]} pointerEvents={'box-none'}>
                    <TouchableWithoutFeedback
                        onPress={this.close}
                        style={[{
                            position: 'absolute',
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            zIndex: 9,
                        }]}>
                        <Animated.View
                            pointerEvents={currentOpenItemIndexBottomSheet === null ? 'box-none' : 'auto'}
                            style={[{
                                backgroundColor: 'black',
                                position: 'absolute',
                                top: 0,
                                bottom: 0,
                                left: 0,
                                right: 0,
                                zIndex: 9,
                                opacity: _deltaY.interpolate({
                                    inputRange: [0, 1, Screen.height - ((stateData === 4 ? 150 : 430)), Screen.height + 30],
                                    outputRange: [0, 0.8, 0.8, 0],
                                    extrapolate: 'clamp',
                                }),
                            }]}/>
                    </TouchableWithoutFeedback>

                    <Interactable.View
                        style={{
                            zIndex: 999,
                        }}
                        animatedNativeDriver
                        onSnapStart={this.onDrawerSnap}
                        verticalOnly
                        ref={this.handleSetRefSheet}
                        snapPoints={[{y: 20}, {y: Screen.height - ((stateData === 4 ? 150 : 430))}, {y: Screen.height + 30}]}
                        boundaries={{top: ((stateData === 4 ? -150 : -430))}}
                        initialPosition={{y: Screen.height + 30}}
                        animatedValueX={new Animated.Value(0)}
                        animatedValueY={_deltaY}>
                        <View style={styles.panel}>
                            <View style={[styles.panelHeader, {paddingHorizontal: 10}]}>
                                <View style={styles.panelHandle}/>
                            </View>

                            <View style={{left: 0, right: 0, height: Screen.height - 70}}>
                                <Animated.ScrollView
                                    ref={scrollViewTop => (this.scrollViewTop = scrollViewTop)}
                                    maximumZoomScale={0}
                                    decelerationRate={'fast'}
                                    disableIntervalMomentum
                                    disableScrollViewPanResponder
                                    directionalLockEnabled
                                    automaticallyAdjustContentInsets={false}
                                    scrollEnabled={currentOpenItemIndexBottomSheet === 'Top' || (currentOpenItemIndexBottomSheet === 'Middle' && inProgressSnap)}
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
                                                        if (this.scrollViewTop && this.scrollViewTop._component) {
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
                                    {(stateData === 3) && (<Fragment>
                                        <View style={{
                                            paddingHorizontal: 0,
                                            marginTop: 5,
                                        }}>
                                            <View
                                                style={{
                                                    height: 32.5,
                                                    flex: 1,
                                                    backgroundColor: '#f3ca35',
                                                    flexDirection: 'row',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    alignContent: 'center',
                                                }}>
                                                <Image
                                                    style={{
                                                        height: 42 / 2,
                                                        width: 52 / 2,
                                                    }}
                                                    resizeMode="contain"
                                                    source={require('BiziboxUI/assets/diamondWhite.png')}
                                                />
                                            </View>
                                        </View>
                                        <View
                                            style={{
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
                                                        }} source={require('BiziboxUI/assets/checkBadget.png')}/>
                                                    </View>
                                                    <View style={{
                                                        paddingHorizontal: 6,
                                                    }}/>
                                                    <Text style={[{
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
                                                        }} source={require('BiziboxUI/assets/checkBadget.png')}/>
                                                    </View>
                                                    <View style={{
                                                        paddingHorizontal: 6,
                                                    }}/>
                                                    <Text style={[{
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
                                                        }} source={require('BiziboxUI/assets/checkBadget.png')}/>
                                                    </View>
                                                    <View style={{
                                                        paddingHorizontal: 6,
                                                    }}/>
                                                    <Text style={[{
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
                                                        }} source={require('BiziboxUI/assets/checkBadget.png')}/>
                                                    </View>
                                                    <View style={{
                                                        paddingHorizontal: 6,
                                                    }}/>
                                                    <Text style={[{
                                                        fontSize: sp(18),
                                                        textAlign: 'right',
                                                        fontFamily: fonts.regular,
                                                        color: '#022258',
                                                    }]}>
                                                        {'ניתוח קטגוריות, זיהוי מגמות והשוואתם לשנה הקודמת'}
                                                    </Text>
                                                </View>
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
                                                title={'לרכישה'}
                                            />

                                            <Text style={{
                                                marginTop: 40,
                                                color: '#022258',
                                                fontSize: sp(14),
                                                fontFamily: fonts.regular,
                                                textAlign: 'center',
                                            }}>{'בתוספת של 34 ש”ח כולל מע״מ בלבד לחודש'}</Text>
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

                                </Animated.ScrollView>
                            </View>
                        </View>
                    </Interactable.View>
                </View></Modal>
        )
    }
}
