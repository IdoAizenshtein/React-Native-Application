import React, { PureComponent } from 'react'
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import commonStyles from '../../../styles/styles'
import { combineStyles as cs, getCurrencyChar, sp } from '../../../utils/func'
import styles from '../CashFlowStyles'
import { withTranslation } from 'react-i18next'
import CustomIcon from '../../../components/Icons/Fontello'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import { colors, fonts } from '../../../styles/vars'
import AppTimezone from '../../../utils/appTimezone'
import { Calendar } from 'react-native-calendars'
import { Icon } from 'react-native-elements'
import NumericInput from 'react-native-numeric-input'
import { isToday } from '../../../utils/date'

class MyListItem extends PureComponent {
  state = {
    timesValue: this.props.value.timesValue,
  }

  _onPress = () => {
    this.props.onPressItem(this.props.id)
  }

  _onPressNumber = (value) => {
    this.setState({ timesValue: value })
    this.props.onPressNumber(value)
  }

  render () {
    const selected = this.props.selected
    return (
      <View style={[
        cs(!this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
          height: 42,
          marginBottom: 8,
        }]}>
        <View style={{
          flex: 0.46,
          alignItems: 'flex-end',
        }}/>
        <View style={{
          flex: 7.3,
          backgroundColor: '#f5f5f5',
          paddingHorizontal: 21,
          borderBottomRightRadius: 20,
          borderTopRightRadius: 20,
        }}>
          <TouchableOpacity
            style={[
              cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]),
              {
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
              {selected &&
              (<CustomIcon name="ok" size={16} color={colors.blue34}/>)}

              {(this.props.id === 'on') && (
                <CustomIcon name="calendar" size={16} color={colors.blue34}
                            style={cs(selected, {
                              marginHorizontal: 0,
                            }, [
                              {
                                marginHorizontal: 15,
                              }])}/>)}
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
                    shadowOffset: {
                      width: 0,
                      height: 1,
                    },
                    elevation: 4,
                  }}
                  inputStyle={{
                    borderWidth: 0,
                    height: 28,
                    backgroundColor: '#ffffff',
                  }}
                  textColor="#0f3860"
                  iconStyle={{
                    color: 'white',
                    borderRadius: 40,
                    fontSize: sp(20),
                    lineHeight: 28,
                  }}
                  rightButtonBackgroundColor="#0addc1"
                  leftButtonBackgroundColor="#0addc1"/></View>)}
            {(this.props.account &&
              !isToday(this.props.account.balanceLastUpdatedDate)) &&
            <Text style={{ color: colors.red }}>{` - ${this.props.t(
              'bankAccount:notUpdated')}`}</Text>}
            <Text
              style={[
                styles.dataRowLevel3Text, {
                  fontSize: sp(15),
                  lineHeight: 42,
                }, commonStyles.regularFont]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {this.props.text} {(this.props.id === 'on')
              ? AppTimezone.moment(this.props.expirationDate).format('DD/MM/YY')
              : ''} {(this.props.account) ? `(${getCurrencyChar(
              this.props.account.currency)})` : ''}
            </Text>
            {this.props.account && (
              <View style={{ paddingHorizontal: 2 }}><AccountIcon
                account={this.props.account}/></View>)}
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}

@withTranslation()
export default class CheckList extends PureComponent {
  today = AppTimezone.moment().valueOf()

  state = {
    copyArr: [],
  }

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
      this.props.close()
    }, 10)
  }

  _keyExtractor = (item, index) => item.id

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
      this.props.value[this.props.type] = id
      return { copyArr: copyArr }
    })
    setDataState(this.props.value)
    this.setState({ refreshing: true })
    setTimeout(() => {
      this.setState({ refreshing: false })
      if (id !== 'times' && !(this.props.type === 'endDate' && id === 'on')) {
        this.props.close()
      }
    }, 10)
  }

  _renderItem = ({ item }) => (
    <MyListItem
      id={item.id}
      value={this.props.value}
      expirationDate={this.state.expirationDate}
      onPressItem={this._onPressItem}
      onPressNumber={this._onPressNumber}
      selected={item.selected}
      text={item.text}
      t={this.props.t}
      account={(item.account) ? item.account : null}
    />
  )

  _onRefresh = () => {
    this.setState({ refreshing: true })
  }

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
        {(this.props.type === 'endDate' &&
          this.state.copyArr.find((item) => item.selected).id === 'on') &&
        (<Calendar
          minDate={this.today}
          current={AppTimezone.moment(this.props.value.expirationDate)
            .format('YYYY-MM-DD')}
          markedDates={{
            [AppTimezone.moment(this.props.value.expirationDate)
              .format('YYYY-MM-DD')]: {
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
