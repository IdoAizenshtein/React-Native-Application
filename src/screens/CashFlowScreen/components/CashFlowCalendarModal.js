import React, { Fragment } from 'react'
import { Text, TouchableOpacity } from 'react-native'
import AppTimezone from '../../../utils/appTimezone'
import CalendarModal from '../../../components/CalendarModal/CalendarModal'
import { combineStyles as cs } from '../../../utils/func'
import styles from '../../../components/CalendarModal/CalendarModalStyles'

export default class CashFlowCalendarModal extends CalendarModal {
  datePresets = {
    tillEndOfThisMonth: 'tillEndOfThisMonth',
    tillEndOfNextMonth: 'tillEndOfNextMonth',
    nextSixtyDays: 'nextSixtyDays',
    nextThirtyDays: 'nextThirtyDays',
  }

  constructor (props) {
    super(props)
    const { minDate } = props

    this.state = {
      ...this.state,
      pastScrollRange: (minDate) ? Math.round(AppTimezone.moment()
        .diff(AppTimezone.moment(minDate).valueOf(), 'months', true)) : 36,
      futureScrollRange: 24,
      maxDate: null,
    }

    this.modalTitle = props.t('bankAccount:calendar')
  }

  getInitialDatePreset ({ dateFromTimestamp, dateTillTimestamp }) {
    if (!dateFromTimestamp || !dateTillTimestamp) {return}

    const { balanceLastUpdatedDate } = this.props
    return ({
      isTillEndOfThisMonth: AppTimezone.moment(dateFromTimestamp)
          .endOf('month')
          .format('DD/MM/YYYY') ===
        AppTimezone.moment(dateTillTimestamp).format('DD/MM/YYYY'),
      isTillEndOfNextMonth: (AppTimezone.moment(dateFromTimestamp)
          .format('DD/MM/YYYY') ===
        AppTimezone.moment(this.props.balanceLastUpdatedDate)
          .format('DD/MM/YYYY')) && AppTimezone.moment(dateFromTimestamp)
          .add(2, 'months')
          .date(0)
          .format('DD/MM/YYYY') ===
        AppTimezone.moment(dateTillTimestamp).format('DD/MM/YYYY'),
      isNextSixtyDays: (AppTimezone.moment(dateFromTimestamp)
          .format('DD/MM/YYYY') ===
        AppTimezone.moment(balanceLastUpdatedDate).format('DD/MM/YYYY')) &&
        AppTimezone.moment(dateFromTimestamp)
          .add(60, 'day')
          .format('DD/MM/YYYY') ===
        AppTimezone.moment(dateTillTimestamp).format('DD/MM/YYYY'),
      isNextThirtyDays: (AppTimezone.moment(dateFromTimestamp)
          .format('DD/MM/YYYY') ===
        AppTimezone.moment(balanceLastUpdatedDate).format('DD/MM/YYYY')) &&
        AppTimezone.moment(dateFromTimestamp)
          .add(30, 'day')
          .format('DD/MM/YYYY') ===
        AppTimezone.moment(dateTillTimestamp).format('DD/MM/YYYY'),
    })
  }

  handleSetDatePreset (preset) {
    return () => {
      const { onSetDates, balanceLastUpdatedDate } = this.props

      switch (preset) {
        case this.datePresets.tillEndOfThisMonth:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment(balanceLastUpdatedDate)
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment(balanceLastUpdatedDate)
              .endOf('month')
              .valueOf(),
          })
          break
        case this.datePresets.tillEndOfNextMonth:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment(balanceLastUpdatedDate)
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment(balanceLastUpdatedDate)
              .add(2, 'months')
              .date(0)
              .valueOf(),
          })
          break
        case this.datePresets.nextSixtyDays:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment(balanceLastUpdatedDate)
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment(balanceLastUpdatedDate)
              .add(60, 'day')
              .valueOf(),
          })
          break
        case this.datePresets.nextThirtyDays:
          onSetDates({
            dateFromTimestamp: AppTimezone.moment(balanceLastUpdatedDate)
              .valueOf(),
            dateTillTimestamp: AppTimezone.moment(balanceLastUpdatedDate)
              .add(30, 'day')
              .valueOf(),
          })
      }
    }
  }

  renderPresets () {
    const { isTillEndOfThisMonth, isTillEndOfNextMonth, isNextSixtyDays, isNextThirtyDays } = this.state
    const { t } = this.props

    return (
      <Fragment>
        <TouchableOpacity
          style={cs(isNextThirtyDays, styles.calendarPresetBtn,
            styles.calendarPresetBtnActive)}
          onPress={this.handleSetDatePreset(this.datePresets.nextThirtyDays)}
        >
          <Text
            style={cs(isNextThirtyDays, styles.calendarPresetBtnText,
              styles.calendarPresetBtnActiveText)}>
            {t('cashFlow:nextThirtyDays')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={cs(isNextSixtyDays, styles.calendarPresetBtn,
            styles.calendarPresetBtnActive)}
          onPress={this.handleSetDatePreset(this.datePresets.nextSixtyDays)}
        >
          <Text style={cs(isNextSixtyDays, styles.calendarPresetBtnText,
            styles.calendarPresetBtnActiveText)}>
            {t('cashFlow:nextSixtyDays')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={cs(isTillEndOfThisMonth, styles.calendarPresetBtn,
            styles.calendarPresetBtnActive)}
          onPress={this.handleSetDatePreset(
            this.datePresets.tillEndOfThisMonth)}
        >
          <Text
            style={cs(isTillEndOfThisMonth, styles.calendarPresetBtnText,
              styles.calendarPresetBtnActiveText)}>
            {t('cashFlow:tillEndOfThisMonth')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={cs(isTillEndOfNextMonth, styles.calendarPresetBtn,
            styles.calendarPresetBtnActive)}
          onPress={this.handleSetDatePreset(
            this.datePresets.tillEndOfNextMonth)}
        >
          <Text
            style={cs(isTillEndOfNextMonth, styles.calendarPresetBtnText,
              styles.calendarPresetBtnActiveText)}>
            {t('cashFlow:tillEndOfNextMonth')}
          </Text>
        </TouchableOpacity>
      </Fragment>
    )
  }
}
