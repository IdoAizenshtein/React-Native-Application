import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export const Y_AXIS_WIDTH = 50
export const X_AXIS_HEIGHT = 17

export default StyleSheet.create({
  chartWrapper: {
    width: '100%',
    height: 156,
    flexDirection: 'row',
  },

  chartYAxisWrapper: {
    width: Y_AXIS_WIDTH,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: X_AXIS_HEIGHT,
  },

  chartYAxisText: {
    fontSize: sp(15),
    fontFamily: fonts.regular,
  },

  chartRightWrapper: {
    position: 'relative',
    flexDirection: 'column',
    flex: 1,
  },

  chartXAxis: {
    width: '100%',
    height: X_AXIS_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 5,
    borderTopWidth: 1,
    borderTopColor: colors.red5,
  },

  chartXAxisText: {
    fontSize: sp(14),
    fontFamily: fonts.light,
  },

  chartTotalBalanceText: {
    position: 'absolute',
    bottom: X_AXIS_HEIGHT + 1,
    right: 3,
    color: colors.red5,
  },

  chartSliderWrapper: {
    position: 'relative',
    flexDirection: 'row',
  },

  errorWrapper: {
    position: 'absolute',
    width: '100%',
    top: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: X_AXIS_HEIGHT,
    paddingHorizontal: 30,
  },

  errorDivider: {
    height: 1,
    flex: 1,
  },

  errorText: {
    textAlign: 'center',
    fontSize: sp(16),
    fontFamily: fonts.regular,
    marginHorizontal: 5,
  },
})
