import moment from 'moment-timezone'

export default class AppTimezone {
  static zone = 'Asia/Jerusalem'
  static moment = moment.tz.setDefault(AppTimezone.zone)

  static set setZone (zone) {
    AppTimezone.zone = zone
    AppTimezone.moment = moment.tz.setDefault(AppTimezone.zone)
  }
}
