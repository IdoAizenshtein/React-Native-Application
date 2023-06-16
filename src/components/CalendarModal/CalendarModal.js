import React, {Fragment, PureComponent} from 'react';
import {Text, TouchableOpacity, View, Dimensions} from 'react-native';
import {Divider} from 'react-native-elements';
import AppTimezone from '../../utils/appTimezone';
import {CalendarList} from 'react-native-calendars';
import CustomIcon from '../Icons/Fontello';
import Modal from '../Modal/Modal';
import {combineStyles as cs} from '../../utils/func';
import {getListOfDatesInterval} from '../../utils/date';
import commonStyles from '../../styles/styles';
import styles, {getCalendarStyles} from './CalendarModalStyles';
import {colors} from '../../styles/vars';
import {DEFAULT_DATE_FORMAT} from '../../constants/common';

export default class CalendarModal extends PureComponent {
  today = AppTimezone.moment().valueOf();

  datePresets = {
    lastMonth: 'lastMonth',
    lastThreeMonths: 'lastThreeMonths',
    lastSixMonths: 'lastSixMonths',
    lastYear: 'lastYear',
    notRepaid: 'notRepaid',
    lastTwoMonths: 'lastTwoMonths',
    lastMonthUntilToday: 'lastMonthUntilToday',
  };

  modalTitle = null;

  constructor(props) {
    super(props);
    const {t, dateFromTimestamp, dateTillTimestamp, isChecks, minDate} = props;
    this.state = {
      modalWidth: Dimensions.get('window').width,
      isSetDateTill: false,
      pastScrollRange: minDate
        ? Math.round(
          AppTimezone.moment().diff(
            AppTimezone.moment(minDate).valueOf(),
            'months',
            true,
          ),
        )
        : 36,
      futureScrollRange: isChecks ? 36 : 0,
      maxDate: isChecks ? null : this.today,
      isChecks: !!isChecks,
      dateFromTimestamp,
      dateTillTimestamp,
      ...this.getInitialDatePreset({dateFromTimestamp, dateTillTimestamp}),
    };

    this.modalTitle = t('bankAccount:calendar');

    this.handleSetDatePreset = this.handleSetDatePreset.bind(this);
    this.handleSelectDay = this.handleSelectDay.bind(this);
    this.handleApplyDates = this.handleApplyDates.bind(this);
    this.handleToggleSetDateMode = this.handleToggleSetDateMode.bind(this);
    this.handleSetModalWidth = this.handleSetModalWidth.bind(this);
  }

  get markedDates() {
    const {dateFromTimestamp, dateTillTimestamp} = this.state;

    if (!dateTillTimestamp) {
      return {
        [AppTimezone.moment(dateFromTimestamp).format('YYYY-MM-DD')]: {
          startingDay: true,
          selected: true,
          color: colors.blue32,
        },
      };
    }

    const interval = getListOfDatesInterval(
      dateFromTimestamp,
      dateTillTimestamp,
      'days',
    ).reduce((memo, date, i, list) => {
      switch (i) {
        case 0:
          memo[date] = {
            startingDay: true,
            selected: true,
            color: colors.blue32,
            fillerColor: colors.blue35,
          };
          return memo;
        case list.length - 1:
          memo[date] = {
            endingDay: true,
            selected: true,
            color: colors.blue32,
            fillerColor: colors.blue35,
          };
          return memo;
        default:
          memo[date] = {
            selected: true,
            color: colors.blue35,
            textColor: colors.blue8,
          };
          return memo;
      }
    }, {});

    const keys = Object.keys(interval);
    if (keys.length === 1) {
      interval[keys[0]].startingDay = false;
    }

    return interval;
  }

  setDatePreset() {
    const {dateFromTimestamp, dateTillTimestamp} = this.state;
    this.setState({
      ...this.getInitialDatePreset({dateFromTimestamp, dateTillTimestamp}),
    });
  }

  getInitialDatePreset({dateFromTimestamp, dateTillTimestamp}) {
    const {isChecks} = this.props;

    if (!dateFromTimestamp || !dateTillTimestamp) {
      return {
        isLastMonth: false,
        isLastThreeMonths: false,
        isLastSixMonths: false,
        isLastYear: false,
        isLastTwoMonths: false,
        isLastMonthUntilToday: false,
        isNotRepaid: !!isChecks,
      };
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
    };
  }

  handleSetDatePreset(preset) {
    return () => {
      const {onSetDates} = this.props;

      switch (preset) {
        case this.datePresets.notRepaid:
          onSetDates({
            dateFromTimestamp: null,
            dateTillTimestamp: null,
          });
          break;
        case this.datePresets.lastMonth:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(1, 'month')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          });
          break;
        case this.datePresets.lastMonthUntilToday:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment().startOf('month').valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          });
          break;
        case this.datePresets.lastTwoMonths:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(2, 'month')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          });
          break;
        case this.datePresets.lastThreeMonths:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(3, 'month')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          });
          break;
        case this.datePresets.lastSixMonths:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(6, 'month')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          });
          break;
        case this.datePresets.lastYear:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment()
              .subtract(1, 'year')
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment().valueOf(),
          });
      }
    };
  }

  handleSelectDay({timestamp}) {
    timestamp = new Date(
      AppTimezone.moment(timestamp).format('YYYY-MM-DD'),
    ).getTime();
    setTimeout(() => {
      const {dateFromTimestamp, isSetDateTill} = this.state;

      if (isSetDateTill) {
        if (timestamp >= dateFromTimestamp) {
          return this.setState(
            {isSetDateTill: false, dateTillTimestamp: timestamp},
            this.setDatePreset,
          );
        }

        this.setState(
          {
            isSetDateTill: true,
            dateFromTimestamp: timestamp,
            dateTillTimestamp: null,
          },
          this.setDatePreset,
        );
      } else {
        this.setState(
          {
            isSetDateTill: true,
            dateFromTimestamp: timestamp,
            dateTillTimestamp: null,
          },
          this.setDatePreset,
        );
      }
    }, 0);
  }

  handleSetModalWidth(e) {
    this.setState({modalWidth: e.nativeEvent.layout.width});
  }

  handleToggleSetDateMode() {
    this.setState({isSetDateTill: !this.state.isSetDateTill});
  }

  handleApplyDates() {
    const {dateFromTimestamp, dateTillTimestamp} = this.state;
    if (!dateFromTimestamp || !dateTillTimestamp) {
      return;
    }
    return this.props.onSetDates({dateFromTimestamp, dateTillTimestamp});
  }

  renderPresets() {
    const {
      isChecks,
      isNotRepaid,
      isLastMonth,
      isLastThreeMonths,
      isLastSixMonths,
      isLastYear,
      isLastMonthUntilToday,
      isLastTwoMonths,
    } = this.state;
    const {t} = this.props;

    return (
      <Fragment>
        {isChecks && (
          <TouchableOpacity
            style={cs(
              isNotRepaid,
              styles.calendarPresetBtn,
              styles.calendarPresetBtnActive,
            )}
            onPress={this.handleSetDatePreset(this.datePresets.notRepaid)}>
            <Text
              style={cs(
                isNotRepaid,
                styles.calendarPresetBtnText,
                styles.calendarPresetBtnActiveText,
              )}>
              {t('checks:notRepaid')}
            </Text>
          </TouchableOpacity>
        )}

        {isChecks && (
          <TouchableOpacity
            style={cs(
              isLastMonthUntilToday,
              styles.calendarPresetBtn,
              styles.calendarPresetBtnActive,
            )}
            onPress={this.handleSetDatePreset(
              this.datePresets.lastMonthUntilToday,
            )}>
            <Text
              style={cs(
                isLastMonthUntilToday,
                styles.calendarPresetBtnText,
                styles.calendarPresetBtnActiveText,
              )}>
              {t('bankAccount:lastMonthDays')}
            </Text>
          </TouchableOpacity>
        )}
        {!isChecks && (
          <TouchableOpacity
            style={cs(
              isLastMonth,
              styles.calendarPresetBtn,
              styles.calendarPresetBtnActive,
            )}
            onPress={this.handleSetDatePreset(this.datePresets.lastMonth)}>
            <Text
              style={cs(
                isLastMonth,
                styles.calendarPresetBtnText,
                styles.calendarPresetBtnActiveText,
              )}>
              {isChecks
                ? t('bankAccount:lastMonthDays')
                : t('bankAccount:lastMonth')}
            </Text>
          </TouchableOpacity>
        )}

        {isChecks && (
          <TouchableOpacity
            style={cs(
              isLastTwoMonths,
              styles.calendarPresetBtn,
              styles.calendarPresetBtnActive,
            )}
            onPress={this.handleSetDatePreset(this.datePresets.lastTwoMonths)}>
            <Text
              style={cs(
                isLastTwoMonths,
                styles.calendarPresetBtnText,
                styles.calendarPresetBtnActiveText,
              )}>
              {t('bankAccount:lastTwoMonthsDays')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={cs(
            isLastThreeMonths,
            styles.calendarPresetBtn,
            styles.calendarPresetBtnActive,
          )}
          onPress={this.handleSetDatePreset(this.datePresets.lastThreeMonths)}>
          <Text
            style={cs(
              isLastThreeMonths,
              styles.calendarPresetBtnText,
              styles.calendarPresetBtnActiveText,
            )}>
            {isChecks
              ? t('bankAccount:lastThreeMonthsDays')
              : t('bankAccount:lastThreeMonths')}
          </Text>
        </TouchableOpacity>

        {!isChecks && (
          <TouchableOpacity
            style={cs(
              isLastSixMonths,
              styles.calendarPresetBtn,
              styles.calendarPresetBtnActive,
            )}
            onPress={this.handleSetDatePreset(this.datePresets.lastSixMonths)}>
            <Text
              style={cs(
                isLastSixMonths,
                styles.calendarPresetBtnText,
                styles.calendarPresetBtnActiveText,
              )}>
              {t('bankAccount:lastSixMonths')}
            </Text>
          </TouchableOpacity>
        )}
        {!isChecks && (
          <TouchableOpacity
            style={cs(
              isLastYear,
              styles.calendarPresetBtn,
              styles.calendarPresetBtnActive,
            )}
            onPress={this.handleSetDatePreset(this.datePresets.lastYear)}>
            <Text
              style={cs(
                isLastYear,
                styles.calendarPresetBtnText,
                styles.calendarPresetBtnActiveText,
              )}>
              {t('bankAccount:lastYear')}
            </Text>
          </TouchableOpacity>
        )}
      </Fragment>
    );
  }

  render() {
    const {
      maxDate,
      modalWidth,
      isSetDateTill,
      pastScrollRange,
      futureScrollRange,
      dateFromTimestamp,
      dateTillTimestamp,
    } = this.state;
    const {t, isRtl, isOpen, onClose, minDate} = this.props;

    return (
      <Modal
        isOpen={isOpen}
        title={this.modalTitle}
        onLeftPress={onClose}
        onRightPress={this.handleApplyDates}
        leftText={t('common:cancel')}
        rightText={t('common:apply')}>
        <View
          style={cs(
            isRtl,
            styles.calendarPresetsWrapper,
            commonStyles.rowReverse,
          )}
          onLayout={this.handleSetModalWidth}>
          {this.renderPresets()}
        </View>

        <Text style={styles.calendarTitleText}>
          {t('bankAccount:setDateRange')}
        </Text>

        <View
          style={cs(
            isRtl,
            styles.calendarDatesWrapper,
            commonStyles.rowReverse,
          )}>
          <TouchableOpacity
            style={cs(
              !isSetDateTill,
              styles.calendarDateBtn,
              styles.calendarDateBtnActive,
            )}
            onPress={isSetDateTill ? this.handleToggleSetDateMode : null}>
            <Text
              style={cs(
                !isSetDateTill,
                styles.calendarDateBtnLabelText,
                styles.calendarDateBtnLabelTextActive,
              )}>
              {t('bankAccount:from')}
            </Text>
            <Text
              style={cs(
                !isSetDateTill,
                styles.calendarDateBtnText,
                styles.calendarDateBtnActiveText,
              )}>
              {dateFromTimestamp
                ? AppTimezone.moment(dateFromTimestamp).format(
                  DEFAULT_DATE_FORMAT,
                )
                : '-'}
            </Text>
          </TouchableOpacity>

          <CustomIcon
            name="calendar"
            size={23}
            color={colors.blue7}
            style={styles.calendarDatesIcon}
          />

          <TouchableOpacity
            style={cs(
              isSetDateTill,
              styles.calendarDateBtn,
              styles.calendarDateBtnActive,
            )}
            onPress={!isSetDateTill ? this.handleToggleSetDateMode : null}>
            <Text
              style={cs(
                isSetDateTill,
                styles.calendarDateBtnLabelText,
                styles.calendarDateBtnLabelTextActive,
              )}>
              {t('bankAccount:until')}
            </Text>
            <Text
              style={cs(
                isSetDateTill,
                styles.calendarDateBtnText,
                styles.calendarDateBtnActiveText,
              )}>
              {dateTillTimestamp
                ? AppTimezone.moment(dateTillTimestamp).format(
                  DEFAULT_DATE_FORMAT,
                )
                : '-'}
            </Text>
          </TouchableOpacity>
        </View>

        <Divider style={styles.calendarDatesDivider} />

        <CalendarList
          current={AppTimezone.moment().format('YYYY-MM-DD')}
          scrollEnabled
          showScrollIndicator
          pastScrollRange={pastScrollRange}
          futureScrollRange={futureScrollRange}
          minDate={
            minDate ? AppTimezone.moment(minDate).format('YYYY-MM-DD') : null
          }
          maxDate={
            maxDate ? AppTimezone.moment(maxDate).format('YYYY-MM-DD') : null
          }
          calendarWidth={modalWidth}
          markingType={'period'}
          markedDates={this.markedDates}
          onDayPress={day => {
            console.log('day pressed', day);
            this.handleSelectDay(day);
          }}
          monthFormat={'MMMM'}
          yearFormat={'yyyy'}
          theme={getCalendarStyles(isRtl)}
        />
      </Modal>
    );
  }
}
