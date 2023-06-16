import { StyleSheet } from 'react-native'
import { colors, fonts } from './vars'

export default StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    paddingLeft: 15,
    paddingRight: 15,
    backgroundColor: colors.white,
  },

  mainContainer: {
    flex: 1,
    height: '100%',
    position: 'relative',
    backgroundColor: colors.white,
  },

  mainBgImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },

  headerFakeBgImg: {
    top: 140,
  },

  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  verticalCenterContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  horizontalCenterContainer: {
    flex: 1,
    alignItems: 'center',
  },

  textCenter: {
    textAlign: 'center',
  },

  textLeft: {
    textAlign: 'left',
  },

  textRight: {
    textAlign: 'right',
  },

  fill: {
    width: '100%',
  },

  rowReverse: {
    flexDirection: 'row-reverse',
  },

  column: {
    flexDirection: 'column',
  },

  row: {
    flexDirection: 'row',
  },

  justifyCenter: {
    justifyContent: 'center',
  },

  justifyEnd: {
    justifyContent: 'flex-end',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  alignItemsCenter: {
    alignItems: 'center',
  },

  boldFont: {
    fontFamily: fonts.bold,
  },

  extraBoldFont: {
    fontFamily: fonts.extraBold,
  },

  extraLightFont: {
    fontFamily: fonts.extraLight,
  },

  regularFont: {
    fontFamily: fonts.regular,
  },

  lightFont: {
    fontFamily: fonts.light,
  },

  semiBoldFont: {
    fontFamily: fonts.semiBold,
  },

  relative: {
    position: 'relative',
  },

  spaceDivider: {
    paddingHorizontal: 2,
  },

  spaceDividerDouble: {
    paddingHorizontal: 4,
  },

  blueBtn: {
    backgroundColor: '#022258',
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 100,
  },

  bgWhite: {
    backgroundColor: colors.white,
  },

  textWhite: {
    color: colors.white,
  },
})
