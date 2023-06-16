import React, { Fragment } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import AppTimezone from '../../../utils/appTimezone'
import CalendarModal from 'src/components/CalendarModal/CalendarModal'
import { combineStyles as cs } from 'src/utils/func'
import styles from 'src/components/CalendarModal/CalendarModalStyles'

export default class BankAccountsCalendarModal extends CalendarModal {
  datePresets = {
    last30Days: 'last30Days',
    last60Days: 'last60Days',
    beginningOfTheMonth: 'beginningOfTheMonth',
    monthEarlier: 'monthEarlier',
  }

    constructor (props) {
      super(props)

      this.state = {
        ...this.state,
        futureScrollRange: 24,
        maxDate: this.today,
      }

      this.modalTitle = props.t('bankAccount:calendar')
    }

    getInitialDatePreset ({ dateFromTimestamp, dateTillTimestamp }) {
      if (!dateFromTimestamp || !dateTillTimestamp) {
        return {
          isLast30Days: false,
          isLast60Days: false,
          isBeginningOfTheMonth: false,
          isMonthEarlier: false,
        }
      }
      const todayIsDateTill = AppTimezone.moment().startOf('day').format('DD/MM/YYYY') === AppTimezone.moment(dateTillTimestamp).format('DD/MM/YYYY')

      return {
        isLast30Days:
                todayIsDateTill &&
                AppTimezone.moment(dateTillTimestamp).subtract(30, 'days').format('DD/MM/YYYY') === AppTimezone.moment(dateFromTimestamp).format('DD/MM/YYYY'),
        isLast60Days:
                todayIsDateTill &&
                AppTimezone.moment(dateTillTimestamp).subtract(60, 'days').format('DD/MM/YYYY') === AppTimezone.moment(dateFromTimestamp).format('DD/MM/YYYY'),
        isBeginningOfTheMonth:
                todayIsDateTill &&
                AppTimezone.moment(dateTillTimestamp).startOf('month').format('DD/MM/YYYY') === AppTimezone.moment(dateFromTimestamp).format('DD/MM/YYYY'),
        isMonthEarlier:
                AppTimezone.moment().subtract(1, 'month').startOf('month').format('DD/MM/YYYY') === AppTimezone.moment(dateFromTimestamp).format('DD/MM/YYYY') &&
                AppTimezone.moment().subtract(1, 'month').endOf('month').format('DD/MM/YYYY') === AppTimezone.moment(dateTillTimestamp).format('DD/MM/YYYY'),
      }
    }

    handleSetDatePreset (preset) {
      return () => {
        const { onSetDates } = this.props

        const today = AppTimezone.moment().startOf('day').valueOf()

        switch (preset) {
          case this.datePresets.last30Days:
            onSetDates({
              dateFromTimestamp: AppTimezone.moment(today).subtract(30, 'days').valueOf(),
              dateTillTimestamp: today,
            })
            break
          case this.datePresets.last60Days:
            onSetDates({
              dateFromTimestamp: AppTimezone.moment(today).subtract(60, 'days').valueOf(),
              dateTillTimestamp: today,
            })
            break
          case this.datePresets.beginningOfTheMonth:
            onSetDates({
              dateFromTimestamp: AppTimezone.moment(today).startOf('month').valueOf(),
              dateTillTimestamp: today,
            })
            break
          case this.datePresets.monthEarlier:
            onSetDates({
              dateFromTimestamp: AppTimezone.moment(today).subtract(1, 'month').startOf('month').valueOf(),
              dateTillTimestamp: AppTimezone.moment(today).subtract(1, 'month').endOf('month').valueOf(),
            })
        }
      }
    }

    renderPresets () {
      const { isLast30Days, isLast60Days, isBeginningOfTheMonth, isMonthEarlier } = this.state
      const { t } = this.props

      return (
        <Fragment>

          <TouchableOpacity
            style={cs(isLast30Days, styles.calendarPresetBtn, styles.calendarPresetBtnActive)}
            onPress={this.handleSetDatePreset(this.datePresets.last30Days)}
          >
            <Text style={cs(isLast30Days, styles.calendarPresetBtnText, styles.calendarPresetBtnActiveText)}>
              {t('bankAccount:last30Days')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={cs(isLast60Days, styles.calendarPresetBtn, styles.calendarPresetBtnActive)}
            onPress={this.handleSetDatePreset(this.datePresets.last60Days)}
          >
            <Text style={cs(isLast60Days, styles.calendarPresetBtnText, styles.calendarPresetBtnActiveText)}>
              {t('bankAccount:last60Days')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={cs(isBeginningOfTheMonth, styles.calendarPresetBtn, styles.calendarPresetBtnActive)}
            onPress={this.handleSetDatePreset(this.datePresets.beginningOfTheMonth)}
          >
            <Text
              style={cs(isBeginningOfTheMonth, styles.calendarPresetBtnText, styles.calendarPresetBtnActiveText)}>
              {t('bankAccount:beginningOfTheMonth')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={cs(isMonthEarlier, styles.calendarPresetBtn, styles.calendarPresetBtnActive)}
            onPress={this.handleSetDatePreset(this.datePresets.monthEarlier)}
          >
            <Text style={cs(isMonthEarlier, styles.calendarPresetBtnText, styles.calendarPresetBtnActiveText)}>
              {t('bankAccount:monthEarlier')}
            </Text>
          </TouchableOpacity>

        </Fragment>
      )
    }
}
