import React, { Fragment, PureComponent } from 'react'
import { Dimensions, Text, TouchableOpacity, View } from 'react-native'
import { Divider } from 'react-native-elements'
import AppTimezone from '../../utils/appTimezone'
import Modal from 'src/components/Modal/Modal'
import { combineStyles as cs, sp } from '../../utils/func'
import { getListOfDatesInterval } from '../../utils/date'
import commonStyles from '../../styles/styles'
import styles from 'src/components/CalendarModal/CalendarModalStyles'
import { fonts } from '../../styles/vars'
import Swiper from 'react-native-swiper/src'
import { LocaleConfig } from 'react-native-calendars'

const winWidth = Dimensions.get('window').width

export default class CalendarModal extends PureComponent {
  modalTitle = 'מסנן תקופת זמן'

  constructor (props) {
    super(props)
    const { dateFrom, dateTill } = props
    const years = getListOfDatesInterval(
      (new Date().getFullYear() - 3) + '-01-01',
      new Date().getFullYear() + '-01-01', 'years', 'YYYY').reverse()
    this.state = {
      isFrom: true,
      isEnd: false,
      dateFrom: dateFrom,
      dateTill: dateTill,
      selectedIndex: years.findIndex(
        (item) => item === AppTimezone.moment(dateFrom).format('YYYY')),
      years: years,
      modalWidth: 320,
    }
    // this.modalTitle = t('bankAccount:calendar')

    this.handleSetDatePreset = this.handleSetDatePreset.bind(this)
    this.handleApplyDates = this.handleApplyDates.bind(this)
    this.handleSetModalWidth = this.handleSetModalWidth.bind(this)
  }

  handleSetDatePreset (preset) {
    return () => {
      if (preset === 1) {
        const dateFrom = AppTimezone.moment().startOf('month')
        this.setState({
          dateFrom: dateFrom.format('YYYY-MM-DD'),
          dateTill: AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
          // selectedIndex: this.state.years.findIndex((item) => item === AppTimezone.moment(dateFrom).format('YYYY')),
        })
      } else if (preset === 2) {
        const dateFrom = AppTimezone.moment()
          .subtract(1, 'month')
          .startOf('month')
        this.setState({
          dateFrom: dateFrom.format('YYYY-MM-DD'),
          dateTill: AppTimezone.moment()
            .subtract(1, 'month')
            .endOf('month')
            .format('YYYY-MM-DD'),
          // selectedIndex: this.state.years.findIndex((item) => item === AppTimezone.moment(dateFrom).format('YYYY')),
        })
      } else if (preset === 3) {
        const dateFrom = AppTimezone.moment().startOf('year')
        this.setState({
          dateFrom: dateFrom.format('YYYY-MM-DD'),
          dateTill: AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
          // selectedIndex: this.state.years.findIndex((item) => item === AppTimezone.moment(dateFrom).format('YYYY')),
        })
      } else if (preset === 4) {
        const dateFrom = AppTimezone.moment()
          .subtract(1, 'year')
          .startOf('year')
        this.setState({
          dateFrom: dateFrom.format('YYYY-MM-DD'),
          dateTill: AppTimezone.moment()
            .subtract(1, 'year')
            .endOf('year')
            .format('YYYY-MM-DD'),
          // selectedIndex: this.state.years.findIndex((item) => item === AppTimezone.moment(dateFrom).format('YYYY')),
        })
      }
    }
  }

  handleSetModalWidth (e) {
    this.setState({ modalWidth: e.nativeEvent.layout.width })
  }

  handleApplyDates () {
    const { dateFrom, dateTill } = this.state
    if (!dateFrom || !dateTill) {return}
    return this.props.onSetDates(dateFrom, dateTill)
  }

  renderPresets () {
    const {
      dateFrom,
      dateTill,
    } = this.state
    const isStartMonth = (AppTimezone.moment(dateFrom)
      .isSame(AppTimezone.moment().startOf('month').format('YYYY-MM-DD'),
        'year') && AppTimezone.moment(dateFrom)
      .isSame(AppTimezone.moment().startOf('month').format('YYYY-MM-DD'),
        'month') && AppTimezone.moment(dateTill)
      .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
        'year') && AppTimezone.moment(dateTill)
      .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
        'month'))
    const isLastMonth = (AppTimezone.moment(dateFrom)
      .isSame(AppTimezone.moment()
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateFrom)
      .isSame(AppTimezone.moment()
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DD'), 'month') && AppTimezone.moment(dateTill)
      .isSame(AppTimezone.moment()
        .subtract(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateTill)
      .isSame(AppTimezone.moment()
        .subtract(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DD'), 'month'))
    const isFromStartYear = (AppTimezone.moment(dateFrom)
      .isSame(AppTimezone.moment().startOf('year').format('YYYY-MM-DD'),
        'year') && AppTimezone.moment(dateFrom)
      .isSame(AppTimezone.moment().startOf('year').format('YYYY-MM-DD'),
        'month') && AppTimezone.moment(dateTill)
      .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
        'year') && AppTimezone.moment(dateTill)
      .isSame(AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
        'month'))
    const isLastYear = (AppTimezone.moment(dateFrom)
      .isSame(AppTimezone.moment()
        .subtract(1, 'year')
        .startOf('year')
        .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateFrom)
      .isSame(AppTimezone.moment()
        .subtract(1, 'year')
        .startOf('year')
        .format('YYYY-MM-DD'), 'month') && AppTimezone.moment(dateTill)
      .isSame(AppTimezone.moment()
        .subtract(1, 'year')
        .endOf('year')
        .format('YYYY-MM-DD'), 'year') && AppTimezone.moment(dateTill)
      .isSame(AppTimezone.moment()
        .subtract(1, 'year')
        .endOf('year')
        .format('YYYY-MM-DD'), 'month'))

    return (
      <Fragment>
        <TouchableOpacity
          style={cs(isStartMonth, styles.calendarPresetBtn,
            styles.calendarPresetBtnActive)}
          onPress={this.handleSetDatePreset(1)}
        >
          <Text style={cs(isStartMonth, styles.calendarPresetBtnText,
            styles.calendarPresetBtnActiveText)}>
            {'מתחילת החודש'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={cs(isLastMonth, styles.calendarPresetBtn,
            styles.calendarPresetBtnActive)}
          onPress={this.handleSetDatePreset(2)}
        >
          <Text style={cs(isLastMonth, styles.calendarPresetBtnText,
            styles.calendarPresetBtnActiveText)}>
            {'חודש קודם'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={cs((isFromStartYear && !isStartMonth),
            styles.calendarPresetBtn, styles.calendarPresetBtnActive)}
          onPress={this.handleSetDatePreset(3)}
        >
          <Text
            style={cs((isFromStartYear && !isStartMonth),
              styles.calendarPresetBtnText,
              styles.calendarPresetBtnActiveText)}>
            {'מתחילת השנה'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={cs(isLastYear, styles.calendarPresetBtn,
            styles.calendarPresetBtnActive)}
          onPress={this.handleSetDatePreset(4)}
        >
          <Text style={cs(isLastYear, styles.calendarPresetBtnText,
            styles.calendarPresetBtnActiveText)}>
            {'שנה שעברה'}
          </Text>
        </TouchableOpacity>
      </Fragment>
    )
  }

  divideList (list) {
    const arr = []
    list.forEach((item, i) => {
      if (i % 3 === 0) {
        arr.push([item])
      } else {
        arr[arr.length - 1].push(item)
      }
    })
    return arr
  }

  onIndexChanged = (index) => {
    this.setState({
      selectedIndex: index,
    })
  }

  selectMonth = (month) => () => {
    const dateFormat = AppTimezone.moment({
      'year': this.state.years[this.state.selectedIndex],
      'month': month,
      'date': 1,
    })
    if (this.state.isFrom) {
      this.setState({
        dateFrom: dateFormat.format('YYYY-MM-DD'),
        dateTill: null,
        // dateTill: dateFormat.isAfter(this.state.dateTill) ? AppTimezone.moment(dateFormat).add(1, 'month').format('YYYY-MM-DD') : this.state.dateTill,
      }, this.selectFromEnd(false, true))
    } else {
      this.setState({
        dateFrom: dateFormat.isBefore(this.state.dateFrom) ? dateFormat.format(
          'YYYY-MM-DD') : this.state.dateFrom,
        dateTill: dateFormat.format('YYYY-MM-DD'),
      }, (dateFormat.isBefore(this.state.dateFrom)) ? this.selectFromEnd(true,
        false) : null)
    }
  }

  selectFromEnd = (isFrom, isEnd) => () => {
    return this.setState({
      isFrom,
      isEnd,
    })
  }

  render () {
    const {
      years,
      selectedIndex,
      isFrom,
      isEnd,
      dateFrom,
      dateTill,
    } = this.state
    const {
      t,
      isRtl,
      isOpen,
      onClose,
    } = this.props

    return (
      <Modal
        isOpen={isOpen}
        title={this.modalTitle}
        onLeftPress={onClose}
        animationType="slide"
        transparent={false}
        visible
        onRightPress={this.handleApplyDates}
        leftText={t('common:cancel')}
        rightText={t('common:apply')}
      >
        <View
          style={cs(isRtl, styles.calendarPresetsWrapper,
            commonStyles.rowReverse)}
          onLayout={this.handleSetModalWidth}
        >
          {this.renderPresets()}
        </View>

        <View style={[
          cs(isRtl, { flexDirection: 'row' }, commonStyles.rowReverse), {
            borderBottomColor: '#d8d8d8',
            borderBottomWidth: 1,
            marginHorizontal: 30,
            height: 50,
            padding: 0,
          }]}>
          <TouchableOpacity
            style={cs(isFrom, {
              borderBottomColor: 'transparent',
              borderBottomWidth: 2,
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f3860',
              fontSize: sp(16.5),
              fontFamily: fonts.regular,
              height: 50,
              flex: 1,
            }, {
              borderBottomColor: '#0f3860',
              borderBottomWidth: 2,
              fontFamily: fonts.bold,
            })}
            onPress={this.selectFromEnd(true, false)}
          >
            <Text style={cs(isFrom, {
              color: '#0f3860',
              fontSize: sp(16.5),
              fontFamily: fonts.regular,
            }, {
              fontFamily: fonts.bold,
            })}>
              {'מחודש'}
            </Text>
            <Text style={cs(isFrom, {
              color: '#0f3860',
              fontSize: sp(16.5),
              fontFamily: fonts.regular,
            }, {
              fontFamily: fonts.bold,
            })}>
              {LocaleConfig.locales.he.monthNames[parseFloat(
                AppTimezone.moment(this.state.dateFrom).format('MM')) -
              1]} {AppTimezone.moment(this.state.dateFrom).format('YYYY')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={cs(isEnd, {
              borderBottomColor: 'transparent',
              borderBottomWidth: 2,
              alignItems: 'center',
              justifyContent: 'center',
              color: '#0f3860',
              fontSize: sp(16.5),
              fontFamily: fonts.regular,
              height: 50,
              flex: 1,
            }, {
              borderBottomColor: '#0f3860',
              borderBottomWidth: 2,
              fontFamily: fonts.bold,
            })}
            onPress={this.selectFromEnd(false, true)}
          >
            <Text style={cs(isEnd, {
              color: '#0f3860',
              fontSize: sp(16.5),
              fontFamily: fonts.regular,
            }, {
              fontFamily: fonts.bold,
            })}>
              {'עד חודש'}
            </Text>
            {this.state.dateTill && (
              <Text style={cs(isEnd, {
                color: '#0f3860',
                fontSize: sp(16.5),
                fontFamily: fonts.regular,
              }, {
                fontFamily: fonts.bold,
              })}>
                {LocaleConfig.locales.he.monthNames[parseFloat(
                  AppTimezone.moment(this.state.dateTill).format('MM')) -
                1]} {AppTimezone.moment(this.state.dateTill).format('YYYY')}
              </Text>
            )}
            {!this.state.dateTill && (
              <Text style={cs(isEnd, {
                color: '#0f3860',
                fontSize: sp(16.5),
                fontFamily: fonts.regular,
              }, {
                fontFamily: fonts.bold,
              })}>
                {'-'}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Divider style={styles.calendarDatesDivider}/>
        <View style={{
          flex: 1,
          flexGrow: 1,
        }}>
          <Text style={{
            fontSize: sp(38),
            color: '#0f3860',
            fontFamily: fonts.regular,
            marginTop: 10,
            marginBottom: 20,
            textAlign: 'center',
            zIndex: 1,
          }}>{years[selectedIndex]}</Text>

          <Swiper
            style={{
              zIndex: 99999,
              marginTop: 60,
            }}
            containerStyle={{
              // backgroundColor: '#1e9eff',
              // opacity:0.3,

              zIndex: 99999,
              marginTop: -60,
            }}
            nextButton={<Text style={{
              color: '#0f3860',
              fontSize: sp(60),
              lineHeight: 40,
            }}>›</Text>}
            prevButton={<Text style={{
              color: '#0f3860',
              fontSize: sp(60),
              lineHeight: 40,
            }}>‹</Text>}
            buttonWrapperStyle={
              {
                // backgroundColor: '#133a60',
                // opacity:0.3,
                marginTop: 0,
                zIndex: 99999,
                paddingHorizontal: 35,
                height: 320,
                flexDirection: 'row',
                alignItems: 'flex-start',
              }
            }
            showsButtons
            key={years.length}
            loop={false}
            width={winWidth}
            height={320}
            index={selectedIndex}
            onIndexChanged={this.onIndexChanged}
            showsPagination={false}>
            {
              years.map((item, i) => {
                return (<View style={styles.slide}
                              i={i.toString()}
                              key={i.toString()}>
                  {this.divideList([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
                    .map((gr, i1) => {
                      return (
                        <View key={i1.toString()}
                              style={{
                                width: winWidth,
                                height: 50,
                                paddingHorizontal: 5,
                                marginBottom: 2,
                                paddingVertical: 0,
                                alignSelf: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'center',
                                flexDirection: 'row-reverse',
                              }}>
                          {
                            gr.map((c, i2) => {
                              const isActiveFrom = (((AppTimezone.moment(
                                dateFrom).format('YYYY') === item) &&
                                ((parseFloat(
                                  AppTimezone.moment(dateFrom).format('MM')) -
                                  1) === c)))
                              const isActiveTill = dateTill
                                ? ((AppTimezone.moment(dateTill)
                                  .format('YYYY') === item) && ((parseFloat(
                                  AppTimezone.moment(dateTill).format('MM')) -
                                  1) === c))
                                : false

                              const isActive = (((AppTimezone.moment(dateFrom)
                                  .format('YYYY') === item) && ((parseFloat(
                                  AppTimezone.moment(dateFrom).format('MM')) -
                                  1) === c)) ||
                                (dateTill && ((AppTimezone.moment(dateTill)
                                  .format('YYYY') === item) && ((parseFloat(
                                  AppTimezone.moment(dateTill).format('MM')) -
                                  1) === c)))
                              )
                              const isBetween = dateTill && AppTimezone.moment({
                                'year': item,
                                'month': c,
                              }).isBetween(dateFrom, dateTill)

                              return (
                                <View
                                  key={c.toString()}
                                  style={{
                                    height: 50,
                                    flexDirection: 'row',
                                    alignSelf: 'center',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    flex: 1,
                                    backgroundColor: isActive
                                      ? '#e4f3ff'
                                      : 'transparent',
                                    borderTopRightRadius: isActiveFrom ? 25 : 0,
                                    borderBottomRightRadius: isActiveFrom
                                      ? 25
                                      : 0,
                                    borderTopLeftRadius: isActiveTill ? 25 : 0,
                                    borderBottomLeftRadius: isActiveTill
                                      ? 25
                                      : 0,
                                  }}>
                                  <TouchableOpacity
                                    style={[
                                      {
                                        alignItems: 'center',
                                        alignContent: 'center',
                                        justifyContent: 'center',
                                        alignSelf: 'center',
                                        flexDirection: 'column',
                                        borderColor: 'transparent',
                                        height: 50,
                                      }, cs(isActive, {
                                        borderRadius: 0,
                                      }, {
                                        borderRadius: 25,
                                        backgroundColor: '#022258',
                                      }), cs(!isActive && isBetween, {
                                        flex: 1,
                                      }, {
                                        backgroundColor: '#e4f3ff',
                                      }),
                                    ]}
                                    onPress={this.selectMonth(c)}>
                                    <View style={{
                                      height: 50,
                                      width: '100%',
                                      alignItems: 'center',
                                      alignContent: 'center',
                                      justifyContent: 'center',
                                      alignSelf: 'center',
                                    }}>
                                      <Text numberOfLines={1}
                                            ellipsizeMode="tail"
                                            style={[
                                              {
                                                fontSize: sp(22),
                                                lineHeight: 22.5,
                                                textAlign: 'right',
                                                fontFamily: fonts.regular,
                                              },
                                              cs(isActive, {
                                                color: '#0f3860',
                                              }, {
                                                color: '#ffffff',
                                              }),
                                            ]}>
                                        {LocaleConfig.locales.he.monthNames[c]}
                                      </Text>
                                    </View>
                                  </TouchableOpacity>
                                </View>
                              )
                            })
                          }
                        </View>
                      )
                    })}
                </View>)
              })
            }

          </Swiper>
        </View>

      </Modal>
    )
  }
}
