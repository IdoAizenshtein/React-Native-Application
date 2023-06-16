import AppTimezone from './appTimezone'
import { extendMoment } from 'moment-range'
import { DEFAULT_DATE_FORMAT } from '../constants/common'

export function getListOfDatesInterval (
  start,
  end,
  interval = 'days',
  format = 'YYYY-MM-DD',
) {
  const momentRange = extendMoment(AppTimezone.moment)
  const range = momentRange.range(start, end)
  return Array.from(range.by(interval)).map((m) => m.format(format))
}

export function isToday (timestamp) {
  return AppTimezone.moment().diff(timestamp, 'days') < 1
}

export function isYesterday (timestamp) {
  return AppTimezone.moment().subtract(1, 'day').isSame(timestamp, 'day')
}

export function isCardUpdated (balanceLastUpdatedDate) {
  return (
    AppTimezone.moment(balanceLastUpdatedDate).format('DD/MM/YYYY') ===
    AppTimezone.moment().format('DD/MM/YYYY')
  )
}

export function dateToFromNowDaily (date, t, format) {
  if (!date || !t) {
    return null
  }
  return AppTimezone.moment(date).calendar(null, {
    sameDay: `[${t('calendar:today')}]`,
    nextDay: `[${t('calendar:tomorrow')}]`,
    nextWeek: format || DEFAULT_DATE_FORMAT,
    lastDay: `[${t('calendar:yesterday')}]`,
    lastWeek: format || DEFAULT_DATE_FORMAT,
    sameElse: format || DEFAULT_DATE_FORMAT,
  })
}

export function getDaysBetweenTwoDates (now, end) {
  if (!now || !end) {
    return null
  }
  return Math.abs(
    Math.floor(
      AppTimezone.moment
        .duration(AppTimezone.moment(end).diff(AppTimezone.moment(now)))
        .asDays(),
    ),
  )
}
