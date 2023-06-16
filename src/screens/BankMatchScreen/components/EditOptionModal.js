import React, {PureComponent} from 'react'
import {Modal,SafeAreaView, ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import {colors, fonts} from '../../../styles/vars'
import styles from '../BankMatchStyles'
import {combineStyles as cs, getFormattedValueArray, sp} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import AppTimezone from '../../../utils/appTimezone'
import CustomIcon from '../../../components/Icons/Fontello'
import {Calendar} from 'react-native-calendars'
import {Icon} from 'react-native-elements'

import DeviceInfo from 'react-native-device-info'

export const BUNDLE_ID = DeviceInfo.getBundleId();

export const IS_DEV = BUNDLE_ID.endsWith('dev');

@withTranslation()
export default class EditOptionModal extends PureComponent {
    constructor(props) {
        super(props)

        this.state = {
            isActive: 0,
            tomorrowStable: AppTimezone.moment().add(1, 'day').valueOf(),
            tomorrow: AppTimezone.moment().add(1, 'day').valueOf(),
            editModalInsideIsOpen: false,
        }
    }

    setModalInsideVisible = (visible) => () => {
        this.setState({editModalInsideIsOpen: visible})
    };

    showIconRef(type) {
        if (type === 'DIRECTD' ||
            type === 'CCARD_TAZRIM' ||
            type === 'SOLEK_TAZRIM ' ||
            type === 'LOAN_TAZRIM'
        ) {
            return true
        }
        return false
    }

    updateFromBankmatch = (param, param2) => () => {
        const {updateFromBankmatch} = this.props
        this.setModalInsideVisible(!this.state.editModalInsideIsOpen)()
        updateFromBankmatch(param, param2)
    };
    setStates = (params) => () => {
        this.setState(params)
    };

    setModalVisible = (...params) => () => {
        const {setModalVisible} = this.props
        setModalVisible(params[0], params[1], params[2])
    };

    removeItem = (...params) => () => {
        const {removeItem} = this.props
        removeItem(params[0], params[1], params[2])
    };

    handlePopRowEditsModal = (params) => () => {
        const {handlePopRowEditsModal} = this.props
        handlePopRowEditsModal(params)
    };

    createPaymentNew = (params) => () => {
        const {createPaymentNew} = this.props
        createPaymentNew(params)
    };

    removeItemFromList = (...params) => () => {
        const {removeItemFromList} = this.props
        removeItemFromList(params[0], params[1], params[2])
    };

    render() {
        const {item, isRtl} = this.props
        const rowStyle = isRtl ? 'row-reverse' : 'row'
        const {tomorrow, isActive, tomorrowStable} = this.state

        const total = getFormattedValueArray(item.banktransForMatchData ? item.total : item.targetOriginalTotal)
        const numberStyle = cs((item.banktransForMatchData ? item.hova : item.expence), [{color: colors.green4}], {color: colors.red2})
        const targetName = item.banktransForMatchData ? item.transDescAzonly : item.targetName

        return (
            <Modal
                animationType="slide"
                transparent={false}
                visible
                onRequestClose={() => {
                    // //console.log('Modal has been closed.')
                }}>

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.editModalInsideIsOpen}
                    onRequestClose={() => {
                        // console.log('Modal has been closed.')
                    }}>
                    <SafeAreaView style={{
                        flex: 1,
                        marginTop: 0,
                        paddingTop: 0,
                        position: 'relative',
                    }}>
                        <View style={{
                            flex: 1,
                            alignItems: 'center',
                        }}>
                            <View style={{
                                height: 60,
                                backgroundColor: '#002059',
                                width: '100%',
                                paddingTop: 0,
                                paddingLeft: 10,
                                paddingRight: 10,
                            }}>
                                <View style={cs(
                                    isRtl,
                                    [styles.container, {
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }],
                                    commonStyles.rowReverse,
                                )}>
                                    <View>
                                        <TouchableOpacity onPress={this.updateFromBankmatch(item, tomorrow)}>
                                            <View style={{
                                                marginRight: 'auto',
                                            }}>
                                                <Text style={{
                                                    fontSize: sp(16),
                                                    color: '#ffffff',
                                                    fontFamily: fonts.semiBold,
                                                }}>{'אישור'}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={{fontSize: sp(20), color: '#ffffff', fontFamily: fonts.semiBold}}>
                                            {'דחיית תנועה צפוייה'}
                                        </Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity
                                            onPress={this.setModalInsideVisible(!this.state.editModalInsideIsOpen)}>
                                            <View style={{
                                                marginRight: 'auto',
                                            }}>
                                                <Text style={{
                                                    fontSize: sp(16),
                                                    color: '#ffffff',
                                                    fontFamily: fonts.semiBold,
                                                }}>{'ביטול'}</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={{
                                width: '100%',
                                height: '100%',
                                marginTop: 0,
                                marginBottom: 0,
                                paddingLeft: 0,
                                paddingRight: 0,
                                flex: 1,
                            }}>
                                <ScrollView>
                                    <View style={cs(isRtl, styles.calendarPresetsWrapper, commonStyles.rowReverse)}>
                                        <TouchableOpacity
                                            style={cs(isActive === 1, styles.calendarPresetBtn, styles.calendarPresetBtnActive)}
                                            onPress={this.setStates({
                                                isActive: 1,
                                                tomorrow: AppTimezone.moment(tomorrowStable).add(1, 'weeks').valueOf(),
                                            })}>
                                            <Text
                                                style={cs(isActive === 1, styles.calendarPresetBtnText, styles.calendarPresetBtnActiveText)}>
                                                לעוד שבוע
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={{
                                            flex: 0.1,
                                        }}/>
                                        <TouchableOpacity
                                            style={cs(isActive === 2, styles.calendarPresetBtn, styles.calendarPresetBtnActive)}
                                            onPress={this.setStates({
                                                isActive: 2,
                                                tomorrow: AppTimezone.moment(tomorrowStable).add(2, 'weeks').valueOf(),
                                            })}>
                                            <Text
                                                style={cs(isActive === 2, styles.calendarPresetBtnText, styles.calendarPresetBtnActiveText)}>
                                                לעוד שבועיים
                                            </Text>
                                        </TouchableOpacity>
                                        <View style={{
                                            flex: 0.1,
                                        }}/>
                                        <TouchableOpacity
                                            style={cs(isActive === 3, styles.calendarPresetBtn, styles.calendarPresetBtnActive)}
                                            onPress={this.setStates({
                                                isActive: 3,
                                                tomorrow: AppTimezone.moment(tomorrowStable).add(1, 'month').valueOf(),
                                            })}
                                        >
                                            <Text
                                                style={cs(isActive === 3, styles.calendarPresetBtnText, styles.calendarPresetBtnActiveText)}>
                                                לעוד חודש
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Calendar
                                        monthFormat={'MMMM \n yyyy'}
                                        minDate={AppTimezone.moment().valueOf()}
                                        current={AppTimezone.moment(tomorrow).format('YYYY-MM-DD')}
                                        markingType={'custom'}
                                        markedDates={{
                                            [AppTimezone.moment(tomorrow).format('YYYY-MM-DD')]: {
                                                customStyles: {
                                                    container: {
                                                        backgroundColor: '#002059',
                                                    },
                                                    text: {
                                                        color: '#ffffff',
                                                        fontWeight: 'bold',
                                                    },
                                                },
                                                startingDay: true,
                                                selected: true,
                                                color: '#002059',
                                            },
                                        }}
                                        renderArrow={direction => (
                                            <Icon
                                                size={30}
                                                color={'#002059'}
                                                name={direction === 'right'
                                                    ? (isRtl ? 'chevron-left' : 'chevron-right')
                                                    : (isRtl ? 'chevron-right' : 'chevron-left')}
                                            />
                                        )}
                                        onDayPress={(day) => {
                                            day.timestamp = AppTimezone.moment(day.dateString).valueOf()

                                            this.setState({
                                                tomorrow: AppTimezone.moment(day.timestamp).valueOf(),
                                            })
                                            // console.log(day.timestamp)
                                        }}
                                        theme={{
                                            selectedDayBackgroundColor: '#002059',
                                            todayTextColor: '#ffffff',

                                            textDayFontFamily: fonts.regular,
                                            textMonthFontFamily: fonts.regular,
                                            textDayHeaderFontFamily: fonts.regular,
                                            textDayFontWeight: 'normal',
                                            // textMonthFontWeight: 'bold',
                                            // textDayHeaderFontWeight: 'bold',

                                            'stylesheet.calendar.main': {
                                                calendar: {
                                                    paddingLeft: 0,
                                                    paddingRight: 0,
                                                },
                                                week: {
                                                    marginTop: 2,
                                                    marginBottom: 2,
                                                    flexDirection: rowStyle,
                                                    justifyContent: 'space-around',
                                                },
                                            },
                                            'stylesheet.calendar.header': {
                                                header: {
                                                    flexDirection: rowStyle,
                                                    justifyContent: 'space-between',
                                                    paddingLeft: 2,
                                                    paddingRight: 2,
                                                    alignItems: 'center',
                                                },
                                                week: {
                                                    marginTop: 7,
                                                    flexDirection: rowStyle,
                                                    justifyContent: 'space-around',
                                                },
                                                dayHeader: {
                                                    fontSize: sp(15),
                                                    fontFamily: fonts.semiBold,
                                                    color: colors.red4,
                                                },
                                                monthText: {
                                                    fontSize: sp(20),
                                                    color: '#002059',
                                                    fontFamily: fonts.regular,
                                                    margin: 0,
                                                    textAlign: 'center',
                                                },
                                            },
                                        }}
                                    />
                                </ScrollView>
                            </View>
                        </View>
                    </SafeAreaView>
                </Modal>

                <SafeAreaView style={{
                    flex: 1,
                    marginTop: 0,
                    paddingTop: 0,
                    position: 'relative',
                }}>
                    <View style={{
                        flex: 1,
                        alignItems: 'center',
                    }}>
                        <View style={{
                            height: 68,
                            backgroundColor: '#002059',
                            width: '100%',
                            paddingTop: 0,
                            paddingLeft: 10,
                            paddingRight: 10,
                        }}>
                            <View style={cs(
                                isRtl,
                                [styles.container, {
                                    flex: 1,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }],
                                commonStyles.rowReverse,
                            )}>
                                <View>
                                    <TouchableOpacity onPress={this.setModalVisible(null, false, null)}>
                                        <Text style={{
                                            fontSize: sp(16),
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                        }}>ביטול</Text>
                                    </TouchableOpacity>
                                </View>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={{fontSize: sp(20), color: '#ffffff', fontFamily: fonts.semiBold}}>
                                        {'התאמות בנקים'}
                                    </Text>
                                </View>
                                <View/>
                            </View>
                        </View>
                        <View style={{
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#ffffff',
                            marginTop: 10,
                            marginBottom: 0,
                            paddingLeft: 0,
                            paddingRight: 10,
                            flex: 1,
                        }}>

                            {!item.banktransForMatchData && (
                                <ScrollView>
                                    <View>
                                        <Text style={{
                                            color: '#0f3860',
                                            textAlign: 'center',
                                            fontSize: sp(29),
                                        }}>{targetName}</Text>
                                    </View>
                                    <View>
                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{
                                            textAlign: 'center',
                                            marginBottom: 32,
                                        }}>
                                            <Text
                                                style={[numberStyle, {
                                                    fontFamily: fonts.semiBold,
                                                    fontSize: sp(29),
                                                }]}>{total[0]}</Text>
                                            <Text style={[styles.fractionalPart, {fontSize: sp(29)}]}>.{total[1]}</Text>
                                        </Text>
                                    </View>

                                    {item.hovAvar && !this.showIconRef(item.targetTypeName) && (
                                        <View
                                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                            <View style={{flex: 3, alignItems: 'flex-end'}}>
                                                <Text style={{
                                                    color: '#0f3860',
                                                    fontSize: sp(13),
                                                    lineHeight: 42,
                                                }}>
                                                    צפויה לקרות בקרוב
                                                </Text>
                                            </View>
                                            <View style={{
                                                flex: 6,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                            }}>
                                                <TouchableOpacity
                                                    style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                    onPress={this.setModalInsideVisible(true)}>
                                                    <View style={{
                                                        marginRight: 'auto',
                                                    }}>
                                                        <CustomIcon name={'calendar'} size={24} color={colors.blue34}/>
                                                    </View>
                                                    <Text style={[{
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                        fontSize: sp(15),
                                                        lineHeight: 42,
                                                    }, commonStyles.regularFont]}>{'כן לדחות'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    <View style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                        height: 42,
                                        marginBottom: 8,
                                    }]}>
                                        <View style={{flex: 3, alignItems: 'flex-end'}}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(13),
                                                lineHeight: 42,
                                            }}>לא צפויה לקרות/קרה</Text>
                                        </View>
                                        <View style={[{
                                            flex: 6,
                                            paddingHorizontal: 21,
                                        }]}>
                                            <TouchableOpacity
                                                style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                    alignItems: 'center',
                                                }]}
                                                onPress={this.removeItem(item, true, true)}>
                                                <Text
                                                    style={[styles.dataRowLevel3Text, {
                                                        fontSize: sp(15),
                                                        color: '#ef3636',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#ef3636',
                                                        lineHeight: 42,
                                                    }, commonStyles.regularFont]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
                                                    {'למחוק מהתזרים'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                    <View
                                        style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                            height: 42,
                                            marginBottom: 8,
                                        }]}>
                                        <View style={{flex: 3, alignItems: 'flex-end'}}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(13),
                                                lineHeight: 42,
                                            }}>הפרטים לא מדוייקים</Text>
                                        </View>
                                        <View style={{
                                            flex: 6,
                                            backgroundColor: '#f5f5f5',
                                            paddingHorizontal: 21,
                                            borderBottomRightRadius: 20,
                                            borderTopRightRadius: 20,
                                        }}>
                                            <TouchableOpacity
                                                style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                    alignItems: 'center',
                                                }]}
                                                onPress={this.handlePopRowEditsModal(true)}>
                                                <View style={{
                                                    marginRight: 'auto',
                                                }}>
                                                    <Icon name="chevron-left" size={24} color={colors.blue34}/>
                                                </View>
                                                <Text style={[{
                                                    textAlign: 'right',
                                                    color: '#0f3860',
                                                    fontSize: sp(15),
                                                    lineHeight: 42,
                                                }, commonStyles.regularFont]}>
                                                    {'עריכת תנועה'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ScrollView>
                            )}

                            {item.banktransForMatchData && (
                                <ScrollView>
                                    <View>
                                        <Text style={{
                                            color: '#0f3860',
                                            textAlign: 'center',
                                            fontSize: sp(29),
                                        }}>{targetName}</Text>
                                    </View>
                                    <View>
                                        <Text numberOfLines={1} ellipsizeMode="tail" style={{
                                            textAlign: 'center',
                                            marginBottom: 32,
                                        }}>
                                            <Text
                                                style={[numberStyle, {
                                                    fontFamily: fonts.semiBold,
                                                    fontSize: sp(29),
                                                }]}>{total[0]}</Text>
                                            <Text style={[styles.fractionalPart, {fontSize: sp(29)}]}>.{total[1]}</Text>
                                        </Text>
                                    </View>

                                    {IS_DEV && (
                                        <View
                                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                height: 42,
                                                marginBottom: 8,
                                            }]}>
                                            <View style={{flex: 3, alignItems: 'flex-end'}}>
                                                <Text style={{
                                                    color: '#0f3860',
                                                    fontSize: sp(13),
                                                    lineHeight: 42,
                                                }}>תנועה קבועה?</Text>
                                            </View>
                                            <View style={{
                                                flex: 6,
                                                backgroundColor: '#f5f5f5',
                                                paddingHorizontal: 21,
                                                borderBottomRightRadius: 20,
                                                borderTopRightRadius: 20,
                                            }}>
                                                <TouchableOpacity
                                                    style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                        flex: 1,
                                                        flexDirection: 'row',
                                                        justifyContent: 'flex-end',
                                                        alignItems: 'center',
                                                    }]}
                                                    onPress={this.createPaymentNew(item)}>
                                                    <View style={{
                                                        marginRight: 'auto',
                                                    }}>
                                                        <Icon name="chevron-left" size={24} color={colors.blue34}/>
                                                    </View>
                                                    <Text style={[{
                                                        textAlign: 'right',
                                                        color: '#0f3860',
                                                        fontSize: sp(15),
                                                        lineHeight: 42,
                                                    }, commonStyles.regularFont]}>
                                                        {'הוספה לתזרים'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}

                                    <View style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                        height: 42,
                                        marginBottom: 8,
                                    }]}>
                                        <View style={{flex: 3, alignItems: 'flex-end'}}>
                                            <Text style={{
                                                color: '#0f3860',
                                                fontSize: sp(13),
                                                lineHeight: 42,
                                            }}>אין צורך בהתאמה?</Text>
                                        </View>
                                        <View style={[{
                                            flex: 6,
                                            paddingHorizontal: 21,
                                        }]}>
                                            <TouchableOpacity
                                                style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                                    flex: 1,
                                                    flexDirection: 'row',
                                                    justifyContent: 'flex-end',
                                                    alignItems: 'center',
                                                }]}
                                                onPress={this.removeItemFromList(item, true, true)}>
                                                <Text
                                                    style={[styles.dataRowLevel3Text, {
                                                        fontSize: sp(15),
                                                        color: '#ef3636',
                                                        textDecorationLine: 'underline',
                                                        textDecorationStyle: 'solid',
                                                        textDecorationColor: '#ef3636',
                                                        lineHeight: 42,
                                                    }, commonStyles.regularFont]}
                                                    numberOfLines={1}
                                                    ellipsizeMode="tail"
                                                >
                                                    {'הסרה מהרשימה'}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </ScrollView>
                            )}
                        </View>

                    </View>
                </SafeAreaView>
            </Modal>
        )
    }
}
