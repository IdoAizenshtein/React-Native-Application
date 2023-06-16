import React, { PureComponent } from 'react'
import {
  FlatList,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import commonStyles from '../../styles/styles'
import { combineStyles as cs, getCurrencyChar, sp } from '../../utils/func'
import styles from './EditRowModalStyles'
import { withTranslation } from 'react-i18next'
import CustomIcon from '../Icons/Fontello'
import AccountIcon from '../AccountIcon/AccountIcon'
import { colors, fonts } from '../../styles/vars'
import AppTimezone from '../../utils/appTimezone'
import { Calendar, LocaleConfig } from 'react-native-calendars'
import { Icon } from 'react-native-elements'
import NumericInput from 'react-native-numeric-input'
import { isToday } from '../../utils/date'
import { IS_IOS } from '../../constants/common'

const inputWorkaround = (() => {
  let workaroundIncrement = 0
  const invisibleCharsArr = [
    String.fromCharCode(28),
    String.fromCharCode(29),
    String.fromCharCode(30),
    String.fromCharCode(31),
  ]
  return {
    getWorkaroundChar: () => {
      workaroundIncrement += 1
      const mod = workaroundIncrement % invisibleCharsArr.length
      return IS_IOS ? invisibleCharsArr[mod] : ''
    },
  }
})()

class MyListItem extends PureComponent {
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    constructor (props) {
      super(props)
      this.state = {
        timesValue: this.props.value.timesValue,
        totalVal: this.props.value.total,
        frequencyDayName: this.props.value.frequencyDay || null,
      }
    }

    _onPress = () => {
      if (this.props.type === 'transFrequencyNameSolek' && (this.props.id === 'WEEK' || this.props.id === 'MONTH')) {
        this._onPressFrequencyDay(null)()
        setTimeout(() => {
          this.props.onPressItem(this.props.id)
        }, 20)
      } else {
        this.props.onPressItem(this.props.id)
      }
    };

    _onPressTotal = (total) => {
      this.props.onPressTotal(total)
    };

    _onPressFrequencyDay = (value) => () => {
      let frequencyDay = value
      // if (!this.props.text.includes('חודשי')) {
      //   const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      //   frequencyDay = days[value - 1].toUpperCase()
      // }
      this.setState({ frequencyDayName: value })
      // console.log('frequencyDayName-----', this.state.frequencyDayName)
      this.props.onPressFrequencyDay(frequencyDay)
    };

    _onPressNumber = (value) => {
      this.setState({ timesValue: value })
      this.props.onPressNumber(value)
    };

    render () {
      const selected = this.props.selected
      const frequencyDay = this.state.frequencyDayName
      // //console.log('----frequencyDay--------', frequencyDay)
      return (
        <View>
          <View style={[cs(!this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
            height: 42,
            marginBottom: 8,
          }]}>
            <View style={{ flex: 0.46, alignItems: 'flex-end' }} />
            <View style={{
              flex: 7.3,
              backgroundColor: '#f5f5f5',
              paddingHorizontal: 21,
              borderBottomRightRadius: 20,
              borderTopRightRadius: 20,
            }}>
              <TouchableOpacity
                style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-end',
                  alignItems: 'center',
                }]}
                onPress={this._onPress}>
                <View style={{
                  marginRight: 'auto',
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                }}>
                  {selected && (<CustomIcon name="ok" size={16} color={colors.blue34} />)}

                  {(this.props.id === 'on') && (
                    <CustomIcon name="calendar" size={16} color={colors.blue34} style={cs(selected, {
                      marginHorizontal: 0,
                    }, [{
                      marginHorizontal: 15,
                    }])} />)}
                </View>

                {(this.props.id === 'times') && (
                  <View style={{ paddingHorizontal: 12 }}>
                    <NumericInput
                      value={this.state.timesValue}
                      onChange={this._onPressNumber}
                      totalWidth={90}
                      totalHeight={30}
                      iconSize={30}
                      step={1}
                      minValue={1}
                      valueType="real"
                      rounded
                      containerStyle={{
                        borderWidth: 0,
                        height: 30,
                        backgroundColor: '#ffffff',
                        borderRadius: 6,
                        shadowColor: 'black',
                        shadowOpacity: 0.1,
                        shadowRadius: 0.5,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: 4,
                      }}
                      inputStyle={{ borderWidth: 0, height: 28, backgroundColor: '#ffffff' }}
                      textColor="#0f3860"
                      iconStyle={{ color: 'white', borderRadius: 40, fontSize: sp(20), lineHeight: 28 }}
                      rightButtonBackgroundColor="#0addc1"
                      leftButtonBackgroundColor="#0addc1" /></View>)}

                {(selected && ((this.props.id === 'USER_DEFINED_TOTAL' && ((this.props.targetTypeDIRECTD) || this.props.type === 'autoUpdateTypeName_CCARD_TAZRIM' || this.props.type === 'autoUpdateTypeNameDIRECTD')) || (this.props.type === 'autoUpdateTypeName_SOLEK_TAZRIM' && (this.props.id === 'USER_DEFINED_TOTAL')))) && (
                  <View style={{
                    paddingHorizontal: 12,
                  }}>
                    <TextInput
                      autoCorrect={false}
                      autoFocus
                      keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                      style={[{
                        direction: 'ltr',
                        textAlign: 'right',
                        color: '#0f3860',
                        fontSize: sp(15),
                        width: 100,
                        height: 30,
                        paddingHorizontal: 8,
                        borderWidth: 0,
                        backgroundColor: '#ffffff',
                        borderRadius: 6,
                        shadowColor: 'black',
                        shadowOpacity: 0.1,
                        shadowRadius: 0.5,
                        shadowOffset: { width: 0, height: 1 },
                        elevation: 4,
                        paddingTop: 0,
                        paddingBottom: 0,
                      }, commonStyles.regularFont]}
                      onEndEditing={(e) => {
                        this.setState({ totalVal: e.nativeEvent.text.toString().replace(/[^\d.]/g, '') })
                        this._onPressTotal(e.nativeEvent.text.toString().replace(/[^\d.]/g, ''))
                      }}
                      onChangeText={(totals) => {
                        if (String(totals).split('.').length > 2) {
                          this.setState({ totalVal: this.state.totalVal })
                          this._onPressTotal(this.state.totalVal)
                        } else {
                          this.setState({ totalVal: totals.toString().replace(/[^\d.]/g, '') })
                          this._onPressTotal(totals.toString().replace(/[^\d.]/g, ''))
                        }
                      }}
                      value={this.state.totalVal ? inputWorkaround.getWorkaroundChar() + String(this.state.totalVal) : null}
                      underlineColorAndroid="transparent"
                    />
                  </View>)}
                {(this.props.account && !isToday(this.props.account.balanceLastUpdatedDate)) &&
                  <Text style={{ color: colors.red }}>{` - ${this.props.t('bankAccount:notUpdated')}`}</Text>}
                <Text
                  style={[styles.dataRowLevel3Text, {
                    fontSize: sp(15),
                    lineHeight: 42,
                  }, commonStyles.regularFont]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {this.props.text} {(this.props.id === 'on') ? AppTimezone.moment(this.props.expirationDate).format('DD/MM/YY') : ''} {(this.props.account) ? `(${getCurrencyChar(this.props.account.currency)})` : ''}
                </Text>
                {this.props.account && (
                  <View style={{ paddingHorizontal: 2 }}><AccountIcon
                    account={this.props.account} /></View>)}
              </TouchableOpacity>
            </View>
          </View>
          {(selected && ((this.props.type === 'transFrequencyNameSolek' && (this.props.id === 'WEEK' || this.props.id === 'MONTH')))) && (
            <View style={[cs(!this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
              height: 42,
              marginBottom: 8,
            }]}>
              <View style={{ flex: 1.46, alignItems: 'flex-end' }} />
              <View style={{
                flex: 7.3,
                backgroundColor: '#f5f5f5',
                paddingHorizontal: 21,
                borderBottomRightRadius: 20,
                borderTopRightRadius: 20,
                borderColor: 'red',
                borderWidth: frequencyDay ? 0 : 1,
              }}>
                <View
                  style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  }]}>

                  <View style={{ marginLeft: 40, marginRight: 25 }}>
                    <ScrollView
                      horizontal
                      scrollEnabled
                      scrollEventThrottle={16}
                      showsHorizontalScrollIndicator={false}
                      showsVerticalScrollIndicator={false}
                      pagingEnabled={false}
                      contentContainerStyle={{
                        flexDirection: 'row-reverse',
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'center',
                      }}>
                      {
                        (this.props.id === 'MONTH' ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].reverse() : [1, 2, 3, 4, 5]).map((item, i) => {
                          return (<TouchableOpacity
                            style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              alignItems: 'center',
                              width: 34,
                              height: 34,
                              borderRadius: 17,
                              backgroundColor: (this.props.id === 'MONTH' ? (item === frequencyDay) : (this.days[item - 1].toUpperCase() === frequencyDay)) ? '#08d3b8' : 'transparent',
                            }]}
                            key={i.toString()}
                            onPress={this._onPressFrequencyDay(this.props.id === 'MONTH' ? item : this.days[item - 1].toUpperCase())}><View>
                              <Text style={{
                                fontSize: sp(15),
                                width: 34,
                                textAlign: 'center',
                                fontFamily: fonts.regular,
                                color: ((this.props.id === 'MONTH' ? item : this.days[item - 1].toUpperCase()) === frequencyDay) ? '#ffffff' : '#0f3860',
                              }}>
                                {this.props.id === 'MONTH' ? item : LocaleConfig.locales.he.dayNamesShort[item - 1]}
                              </Text>
                            </View></TouchableOpacity>)
                        })
                      }
                    </ScrollView>
                  </View>

                  <Text
                    style={[styles.dataRowLevel3Text, {
                      fontSize: sp(15),
                      lineHeight: 42,
                    }, commonStyles.regularFont]}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {'יום'} {(this.props.id === 'MONTH' ? 'בחודש' : 'בשבוע')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      )
    }
}

@withTranslation()
export default class CheckList extends PureComponent {
    today = AppTimezone.moment().valueOf();

    state = {
      copyArr: [],
    };

    constructor (props) {
      super(props)
      this.state = {
        copyArr: props.data,
        refreshing: false,
        expirationDate: this.props.value.expirationDate,
      }
    }

    _onPressNumber = (val) => {
      const { setDataState } = this.props
      this.props.value.timesValue = val
      setDataState(this.props.value)
      this.setState({ refreshing: true })
      setTimeout(() => {
        this.setState({ refreshing: false })
        // this.props.close()
      }, 10)
    };

    _onPressFrequencyDay = (val) => {
      const { setDataState } = this.props
      this.props.value.frequencyDay = val
      setDataState(this.props.value)
      this.setState({ refreshing: true })
      setTimeout(() => {
        this.setState({ refreshing: false })
      }, 10)
    };

    _onPressTotal = (val) => {
      const { setDataState } = this.props
      this.props.value.total = val
      setDataState(this.props.value)
      this.setState({ refreshing: true })
      setTimeout(() => {
        this.setState({ refreshing: false })
      }, 10)
    };

    _keyExtractor = (item, index) => item.id;

    _onPressItem = (id) => {
      const { setDataState } = this.props

      this.setState((state) => {
        const copyArr = state.copyArr
        copyArr.forEach((item) => {
          item.selected = false
          if (item.id === id) {
            item.selected = true
          }
        })
        // if (this.props.type === 'autoUpdateTypeName_SOLEK_TAZRIM' && (id === 'USER_DEFINED_TOTAL_MONTH' || id === 'USER_DEFINED_TOTAL_WEEK')) {
        //   id = 'USER_DEFINED_TOTAL'
        // }
        let type = this.props.type
        if (this.props.type.includes('autoUpdateTypeName')) {
          type = 'autoUpdateTypeName'
        }
        if (this.props.type.includes('transFrequencyNameSolek')) {
          type = 'transFrequencyName'
        }
        this.props.value[type] = id
        return { copyArr: copyArr }
      })
      this.setState({ refreshing: true })
      setTimeout(() => {
        setDataState(this.props.value)
        this.setState({ refreshing: false })
        if (!(this.props.type === 'transFrequencyNameSolek' && (id === 'WEEK' || id === 'MONTH')) && !(this.props.type === 'autoUpdateTypeName_SOLEK_TAZRIM' && (id === 'USER_DEFINED_TOTAL')) && !((this.props.targetTypeDIRECTD || this.props.type === 'autoUpdateTypeNameDIRECTD' || this.props.type === 'autoUpdateTypeName_CCARD_TAZRIM') && id === 'USER_DEFINED_TOTAL') && id !== 'times' && !(this.props.type === 'endDate' && id === 'on')) {
          this.props.close()
        }
      }, 10)
    };

    _renderItem = ({ item }) => (
      <MyListItem
        type={this.props.type}
        targetTypeDIRECTD={this.props.targetTypeDIRECTD}
        id={item.id}
        value={this.props.value}
        expirationDate={this.state.expirationDate}
        onPressFrequencyDay={this._onPressFrequencyDay}
        onPressItem={this._onPressItem}
        onPressTotal={this._onPressTotal}
        onPressNumber={this._onPressNumber}
        selected={item.selected}
        text={item.text}
        t={this.props.t}
        account={(item.account) ? item.account : null}
      />
    );

    _onRefresh = () => {
      this.setState({ refreshing: true })
    };

    render () {
      const { setDataState } = this.props
      const rowStyle = !this.props.isRtl ? 'row-reverse' : 'row'
      return (
        <View>
          <FlatList
            refreshControl={
              <RefreshControl
                refreshing={this.state.refreshing}
                onRefresh={this._onRefresh}
              />
            }
            data={this.state.copyArr}
            extraData={this.state}
            keyExtractor={this._keyExtractor}
            renderItem={this._renderItem}
          />

          {(((this.props.type === 'autoUpdateTypeName_SOLEK_TAZRIM' && this.props.value.autoUpdateTypeName === 'USER_DEFINED_TOTAL'))) && (
            <View style={{
              marginTop: 10,
              alignItems: 'center',
              flexDirection: 'row-reverse',
              justifyContent: 'center',
            }}>
              <Image
                style={[styles.imgIcon, { width: 18, height: 15, marginHorizontal: 5 }]}
                source={require('BiziboxUI/assets/alertIcon.png')}
              />
              <Text
                numberOfLines={2}
                ellipsizeMode="tail"
                style={{
                  fontSize: sp(13),
                  fontFamily: fonts.regular,
                  color: colors.blue32,
                }}>{'הסכום שהוקלד יוצג בתזרים, אלא אם סכום הזיכוי בפועל גדול יותר'}</Text>
            </View>
          )}
          {(this.props.type === 'endDate' && this.state.copyArr.find((item) => item.selected).id === 'on') &&
                (<Calendar
                  minDate={this.today}
                  current={AppTimezone.moment(this.props.value.expirationDate).format('YYYY-MM-DD')}
                  markedDates={{
                    [AppTimezone.moment(this.props.value.expirationDate).format('YYYY-MM-DD')]: {
                      startingDay: true,
                      selected: true,
                      color: colors.blue3,
                    },
                  }}
                  renderArrow={direction => (
                    <Icon
                      color={'#00adf5'}
                      name={direction === 'left'
                        ? (this.props.isRtl ? 'chevron-left' : 'chevron-right')
                        : (this.props.isRtl ? 'chevron-right' : 'chevron-left')}
                    />
                  )}
                  onDayPress={(day) => {
                    day.timestamp = AppTimezone.moment(day.dateString).valueOf()
                    this.setState({ expirationDate: day.timestamp })
                    this.props.value.expirationDate = day.timestamp
                    setDataState(this.props.value)
                    this.setState({ refreshing: true })
                    setTimeout(() => {
                      this.setState({ refreshing: false })
                      this.props.close()
                    }, 10)
                  }}
                  theme={{
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
                        color: colors.blue8,
                        fontFamily: fonts.regular,
                        margin: 10,
                      },
                    },
                  }}
                />)
          }
        </View>
      )
    }
}
