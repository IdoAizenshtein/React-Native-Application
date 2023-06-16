import React, { PureComponent } from 'react'
import { setOpenedBottomSheet } from 'src/redux/actions/user'
import {
  Animated,
  Dimensions,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Divider } from 'react-native-elements'
import AppTimezone from '../../utils/appTimezone'
import { CalendarList } from 'react-native-calendars'
import CustomIcon from '../Icons/Fontello'
import { combineStyles as cs, sp } from '../../utils/func'
import { getListOfDatesInterval } from '../../utils/date'
import commonStyles from '../../styles/styles'
import styles, { getCalendarStyles } from './CalendarModalStyles'
import { colors, fonts } from '../../styles/vars'
import { DEFAULT_DATE_FORMAT } from '../../constants/common'

import Interactable from 'react-native-interactable'
import { connect } from 'react-redux'


const win = Dimensions.get('window')

const Screen = {
  width: win.width,
  height: win.height - 75,
}
@connect()
export default class CalendarSlider extends PureComponent {
  today = AppTimezone.moment().valueOf()

  datePresets = {
    lastMonth: 'lastMonth',
    lastThreeMonths: 'lastThreeMonths',
    lastSixMonths: 'lastSixMonths',
    lastYear: 'lastYear',
    notRepaid: 'notRepaid',
    lastTwoMonths: 'lastTwoMonths',
    lastMonthUntilToday: 'lastMonthUntilToday',
  }

  modalTitle = null

  constructor (props) {
    super(props)
    const { t, dateFromTimestamp, dateTillTimestamp, minDate } = props
    this.state = {
      modalWidth: 320,
      isSetDateTill: false,
      pastScrollRange: (minDate) ? Math.round(AppTimezone.moment()
        .diff(AppTimezone.moment(minDate).valueOf(), 'months', true)) : 36,
      futureScrollRange: 36,
      maxDate: null,
      currentOpenItemIndex: null,
      dateFromTimestamp,
      dateTillTimestamp,
      ...this.getInitialDatePreset({
        dateFromTimestamp,
        dateTillTimestamp,
      }),
    }

    this.modalTitle = t('bankAccount:calendar')

    this.handleSetDatePreset = this.handleSetDatePreset.bind(this)
    this.handleSelectDay = this.handleSelectDay.bind(this)
    this.handleApplyDates = this.handleApplyDates.bind(this)
    this.handleToggleSetDateMode = this.handleToggleSetDateMode.bind(this)
    this.handleSetModalWidth = this.handleSetModalWidth.bind(this)
    this._deltaY = new Animated.Value(0)
  }

  get markedDates () {
    const { dateFromTimestamp, dateTillTimestamp } = this.state

    if (!dateTillTimestamp) {
      return {
        [AppTimezone.moment(dateFromTimestamp).format('YYYY-MM-DD')]: {
          startingDay: true,
          selected: true,
          color: colors.blue32,
        },
      }
    }

    const interval = getListOfDatesInterval(dateFromTimestamp,
      dateTillTimestamp, 'days')
      .reduce((memo, date, i, list) => {
        switch (i) {
          case 0:
            memo[date] = {
              startingDay: true,
              selected: true,
              color: colors.blue32,
              fillerColor: colors.blue35,
            }
            return memo
          case list.length - 1:
            memo[date] = {
              endingDay: true,
              selected: true,
              color: colors.blue32,
              fillerColor: colors.blue35,
            }
            return memo
          default:
            memo[date] = {
              selected: true,
              color: colors.blue35,
              textColor: colors.blue8,
            }
            return memo
        }
      }, {})

    const keys = Object.keys(interval)
    if (keys.length === 1) {
      interval[keys[0]].startingDay = false
    }

    return interval
  }

  setDatePreset () {
    const { dateFromTimestamp, dateTillTimestamp } = this.state
    this.setState({
      ...this.getInitialDatePreset({
        dateFromTimestamp,
        dateTillTimestamp,
      }),
    })
  }

  getInitialDatePreset ({ dateFromTimestamp, dateTillTimestamp }) {
    if (!dateFromTimestamp || !dateTillTimestamp) {
      return {
        isLastMonth: false,
        isLastThreeMonths: false,
        isLastSixMonths: false,
        isLastYear: false,
        isLastTwoMonths: false,
        isLastMonthUntilToday: false,
        isNotRepaid: false,
      }
    }

    return {
      isNotRepaid: false,
      isLastMonth: AppTimezone.moment(dateTillTimestamp)
        .subtract(1, 'month')
        .isSame(dateFromTimestamp, 'day'),
      isLastThreeMonths: AppTimezone.moment(dateTillTimestamp)
        .subtract(3, 'month')
        .isSame(dateFromTimestamp, 'day'),
      isLastSixMonths: AppTimezone.moment(dateTillTimestamp)
        .subtract(6, 'month')
        .isSame(dateFromTimestamp, 'day'),
      isLastYear: AppTimezone.moment(dateTillTimestamp)
        .subtract(1, 'year')
        .isSame(dateFromTimestamp, 'day'),
      isLastTwoMonths: AppTimezone.moment(dateTillTimestamp)
        .subtract(2, 'month')
        .isSame(dateFromTimestamp, 'day'),
      isLastMonthUntilToday: AppTimezone.moment()
        .startOf('month')
        .isSame(dateFromTimestamp, 'day'),
    }
  }

  handleSetDatePreset (preset) {
    return () => {
      const { onSetDates } = this.props

      switch (preset) {
        case this.datePresets.notRepaid:
          onSetDates({
            dateFromTimestamp: null,
            dateTillTimestamp: null,
          })
          break
        case this.datePresets.lastMonth:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(1, 'month')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          })
          break
        case this.datePresets.lastMonthUntilToday:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment().startOf('month').valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          })
          break
        case this.datePresets.lastTwoMonths:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(2, 'month')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          })
          break
        case this.datePresets.lastThreeMonths:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(3, 'month')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          })
          break
        case this.datePresets.lastSixMonths:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(6, 'month')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          })
          break
        case this.datePresets.lastYear:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(1, 'year')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          })
      }
    }
  }

  handleSelectDay ({ timestamp }) {
    timestamp = new Date(
      AppTimezone.moment(timestamp).format('LL, LTS')).getTime()

    const { dateFromTimestamp, isSetDateTill } = this.state

    if (isSetDateTill) {
      if (timestamp >= dateFromTimestamp) {
        return this.setState({
          isSetDateTill: false,
          dateTillTimestamp: timestamp,
        }, this.setDatePreset)
      }

      this.setState({
        isSetDateTill: true,
        dateFromTimestamp: timestamp,
        dateTillTimestamp: null,
      }, this.setDatePreset)
    }

    this.setState({
      isSetDateTill: true,
      dateFromTimestamp: timestamp,
      dateTillTimestamp: null,
    }, this.setDatePreset)
  }

  handleSetModalWidth (e) {
    this.setState({ modalWidth: e.nativeEvent.layout.width })
  }

  handleToggleSetDateMode () {
    this.setState({ isSetDateTill: !this.state.isSetDateTill })
  }

  handleApplyDates () {
    const { dateFromTimestamp, dateTillTimestamp } = this.state
    if (!dateFromTimestamp || !dateTillTimestamp) {return}
    return this.props.onSetDates({
      dateFromTimestamp,
      dateTillTimestamp,
    })
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps && nextProps.isOpen && nextProps.isOpen !==
      this.props.isOpen) {
      this.listRef.snapTo({ index: 1 })
    }
    if (nextProps && nextProps.isOpen === false && nextProps.isOpen !==
      this.props.isOpen) {
      this.listRef.snapTo({ index: 2 })
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
      this.props.closeCalendarSheet()
    }
  }
  handleSetRef = (ref) => {
    this.listRef = ref
  }

  render () {
    const {
      maxDate,
      isSetDateTill,
      pastScrollRange,
      futureScrollRange,
      dateFromTimestamp,
      dateTillTimestamp,
      currentOpenItemIndex,
    } = this.state
    const {
      t,
      isRtl,
      minDate,
      isOpen,
    } = this.props

    return (
      <View style={[styles.panelContainer]} pointerEvents={'box-none'}>
        <TouchableWithoutFeedback
          onPress={this.closeSheet}
          style={[
            {
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 9,
            }]}>
          <Animated.View
            pointerEvents={currentOpenItemIndex === null ? 'box-none' : 'auto'}
            style={[
              {
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
              }]}/>
        </TouchableWithoutFeedback>

        <Interactable.View
          style={{
            zIndex: 999,
          }}
          onSnapStart={this.onDrawerSnap}
          verticalOnly
          ref={this.handleSetRef}
          snapPoints={[
            { y: 40 },
            { y: Screen.height - 500 },
            { y: Screen.height + 30 }]}
          boundaries={{ top: -500 }}
          animatedValueX={new Animated.Value(0)}
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
                  marginBottom: 20,
                  height: 35,
                  marginHorizontal: 15,
                  flexDirection: 'row-reverse',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onLayout={this.handleSetModalWidth}>
                <TouchableOpacity
                  onPress={this.handleApplyDates}>
                  <Text style={{
                    fontSize: sp(15),
                    color: '#2aa1d9',
                    fontFamily: fonts.regular,
                  }}>
                    שמירה
                  </Text>
                </TouchableOpacity>

                <Text style={{
                  fontSize: sp(16),
                  color: '#022258',
                  fontFamily: fonts.regular,
                  textAlign: 'center',
                }}>{'סינון לפי תאריך '}{isOpen === 'SendDate'
                  ? 'שליחה'
                  : 'מסמך'}</Text>

                <TouchableOpacity onPress={this.closeSheet}>
                  <Text style={{
                    fontSize: sp(15),
                    color: '#2aa1d9',
                    fontFamily: fonts.regular,
                  }}>
                    ביטול
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={cs(isRtl, styles.calendarDatesWrapper,
                commonStyles.rowReverse)}>
                <TouchableOpacity
                  style={cs(!isSetDateTill, styles.calendarDateBtn,
                    styles.calendarDateBtnActive)}
                  onPress={isSetDateTill ? this.handleToggleSetDateMode : null}>
                  <Text
                    style={cs(!isSetDateTill, styles.calendarDateBtnLabelText,
                      styles.calendarDateBtnLabelTextActive)}>
                    {t('bankAccount:from')}
                  </Text>
                  <Text
                    style={cs(!isSetDateTill, styles.calendarDateBtnText,
                      styles.calendarDateBtnActiveText)}>
                    {dateFromTimestamp ? AppTimezone.moment(dateFromTimestamp)
                      .format(DEFAULT_DATE_FORMAT) : '-'}
                  </Text>
                </TouchableOpacity>

                <CustomIcon name="calendar" size={23} color={colors.blue7}
                            style={styles.calendarDatesIcon}/>

                <TouchableOpacity
                  style={cs(isSetDateTill, styles.calendarDateBtn,
                    styles.calendarDateBtnActive)}
                  onPress={!isSetDateTill
                    ? this.handleToggleSetDateMode
                    : null}>
                  <Text
                    style={cs(isSetDateTill, styles.calendarDateBtnLabelText,
                      styles.calendarDateBtnLabelTextActive)}>
                    {t('bankAccount:until')}
                  </Text>
                  <Text
                    style={cs(isSetDateTill, styles.calendarDateBtnText,
                      styles.calendarDateBtnActiveText)}>
                    {dateTillTimestamp ? AppTimezone.moment(dateTillTimestamp)
                      .format(DEFAULT_DATE_FORMAT) : '-'}
                  </Text>
                </TouchableOpacity>
              </View>

              <Divider style={styles.calendarDatesDivider}/>

              <CalendarList
                renderHeader={(date) => {
                  const header = date.toString('MMMM yyyy')
                  const [month, year] = header.split(' ')
                  const textStyle = {
                    color: colors.blue8,
                    fontFamily: fonts.regular,
                    margin: 0,
                    textAlign: 'center',
                  }

                  return (
                    <View style={{
                      flexDirection: 'column',
                      width: '100%',
                      justifyContent: 'center',
                      marginBottom: 5,
                    }}>
                      <Text style={{
                        fontSize: sp(31), ...textStyle,
                      }}>{`${month}`}</Text>
                      <Text
                        style={{ fontSize: sp(12), ...textStyle }}>{year}</Text>
                    </View>
                  )
                }}
                current={AppTimezone.moment().format('YYYY-MM-DD')}
                scrollEnabled
                removeClippedSubviews={false}
                showScrollIndicator
                pastScrollRange={pastScrollRange}
                futureScrollRange={futureScrollRange}
                minDate={minDate ? AppTimezone.moment(minDate)
                  .format('YYYY-MM-DD') : null}
                maxDate={maxDate ? AppTimezone.moment(maxDate)
                  .format('YYYY-MM-DD') : null}
                calendarWidth={Screen.width - 10}
                markingType={'period'}
                markedDates={this.markedDates}
                onDayPress={this.handleSelectDay}
                theme={getCalendarStyles(isRtl)}
              />

            </View>
          </View>
        </Interactable.View>
      </View>
    )
  }
}
