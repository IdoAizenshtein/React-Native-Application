import { Dimensions, StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export const FILLER_HEIGHT = 41
export const FILLER_WIDTH = 41
export const FILLER_BORDER_RADIUS = FILLER_HEIGHT / 2
const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
}
export default StyleSheet.create({
  calendarPresetsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 26,
    marginBottom: 29,
  },

  calendarPresetBtn: {
    height: 53,
    width: 79,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray17,
    borderRadius: 26,
    paddingHorizontal: 5,
  },

  calendarPresetBtnActive: {
    backgroundColor: colors.green13,
  },

  calendarPresetBtnText: {
    textAlign: 'center',
    color: colors.blue8,
    fontSize: sp(15),
    fontFamily: fonts.regular,
    lineHeight: 17,
  },

  calendarPresetBtnActiveText: {
    fontFamily: fonts.bold,
    color: colors.white,
  },

  calendarTitleText: {
    fontSize: sp(15),
    color: colors.blue8,
    fontFamily: fonts.bold,
    marginBottom: 22,
    textAlign: 'center',
  },

  calendarDatesWrapper: {
    paddingHorizontal: 21,
    paddingBottom: 13,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  calendarDatesDivider: {
    marginHorizontal: 25,
    backgroundColor: colors.gray18,
  },

  calendarDateBtn: {
    height: 53,
    width: 135,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
  },

  calendarDateBtnActive: {
    backgroundColor: colors.green13,
  },

  calendarDatesIcon: {
    marginHorizontal: 6,
  },

  calendarDateBtnLabelText: {
    fontSize: sp(15),
    color: colors.blue8,
    fontFamily: fonts.regular,
  },

  calendarDateBtnLabelTextActive: {
    color: colors.white,
  },

  calendarDateBtnText: {
    fontSize: sp(21),
    color: colors.blue8,
    fontFamily: fonts.regular,
  },

  calendarDateBtnActiveText: {
    fontFamily: fonts.bold,
    color: colors.white,
  },

  panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999999,
  },
  panel: {
    height: Screen.height + 280,
    paddingBottom: 20,
    paddingTop: 14,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  panelHeader: {
    height: 15,
    paddingBottom: 10,
    alignItems: 'center',
  },
  panelHandle: {
    width: 54,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#cdcdcd',
  },
  panelTitle: {
    height: 28,
    color: '#022258',
    fontSize: sp(20),
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },
  panelSubtitle: {
    fontSize: sp(20),
    fontFamily: fonts.regular,
    height: 28,
    marginBottom: 10,
    textAlign: 'center',
  },
  panelButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#459FED',
    alignItems: 'center',
    marginVertical: 10,
  },
  panelButtonTitle: {
    fontSize: sp(17),
    fontFamily: fonts.bold,
    fontWeight: 'bold',
    color: 'white',
  },
})

export const getCalendarStyles = (isRtl) => {
  const rowStyle = isRtl ? 'row-reverse' : 'row'

  return {
    'stylesheet.calendar-list.main': {
      calendar: {
        paddingLeft: 0,
        paddingRight: 0,
      },
    },
    'stylesheet.calendar.main': {
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
        paddingLeft: 10,
        paddingRight: 10,
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
      yearText: {
        fontSize: sp(13),
        color: colors.blue8,
        fontFamily: fonts.regular,
        margin: 0,
        textAlign: 'center',
      },
      monthText: {
        fontSize: sp(39),
        color: colors.blue8,
        fontFamily: fonts.regular,
        margin: 0,
        textAlign: 'center',
      },
    },
    'stylesheet.day.period': {
      text: {
        fontSize: sp(18),
        fontFamily: fonts.semiBold,
        color: colors.gray14,
      },
      disabledText: {
        color: colors.gray15,
      },
      quickAction: {
        backgroundColor: colors.blue32,
        borderRadius: FILLER_HEIGHT / 2,
      },
      quickActionText: {
        color: colors.white,
      },
      base: {
        // DO NOT REMOVE IT!!!
        // This fixes the render bug when merging styles
        borderWidth: 0.1,
        borderColor: 'transparent',
        //

        width: FILLER_WIDTH,
        height: FILLER_HEIGHT,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
      },
      fillers: {
        left: 0,
        right: 0,
        position: 'absolute',
        height: FILLER_HEIGHT,
        flexDirection: rowStyle,
      },
      leftFiller: {
        flex: 1,
        height: FILLER_HEIGHT,
        backgroundColor: colors.blue35,
      },
      rightFiller: {
        flex: 1,
        height: FILLER_HEIGHT,
        backgroundColor: colors.blue35,
      },
    },
  }
}
