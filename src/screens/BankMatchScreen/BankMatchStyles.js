import { Dimensions, StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { IS_IOS } from '../../constants/common'
import { sp } from 'src/utils/func'

export const CONTAINER_PADDING = 25
export const DATA_ROW_HEIGHT = 55
export const DATA_ROW_3_HEIGHT = 125
export const SLIDER_HEIGHT = 200
export const SLIDER_IMG_HEIGHT = 127
export const HEADER_STICKY_BLOCK_HEIGHT = IS_IOS ? 45 : 45
export const HEADER_DATA_ROW_HEIGHT = 35
export const HEADER_ALERT_BORDER_HEIGHT = 4
let CIRCLE_RADIUS = 36
const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
}
export default StyleSheet.create({
  accountsContainer: {
    flex: 1,
    position: 'relative',
  },

  checkboxIcon: {
    fontSize: sp(18),
    color: colors.dark,
    marginLeft: 10,
    marginRight: 10,
  },

  checkboxIconRtl: {
    marginLeft: 10,
    marginRight: 10,
  },

  iconDisabled: {
    color: colors.gray2,
  },

  divider: {
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: colors.gray,
  },

  bankAccountBtn: {
    height: 51,
    width: 131,
  },

  bankAccountInfoText: {
    fontSize: sp(20),
    marginTop: 15,
    marginBottom: 18,
    color: colors.blue5,
    textAlign: 'center',
    fontFamily: fonts.semiBold,
  },

  dataRowAnimatedWrapper: {
    overflow: 'hidden',
    backgroundColor: 'white',
  },

  dataRow: {
    height: DATA_ROW_HEIGHT,
    paddingHorizontal: CONTAINER_PADDING,
    paddingVertical: 0,
    width: '100%',
    justifyContent: 'center',
  },

  dataRowSecondLevel: {
    height: DATA_ROW_3_HEIGHT,
    paddingHorizontal: 0,
    paddingVertical: 0,
    width: '100%',
    justifyContent: 'flex-start',
  },

  dataRowLevel2: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dataRowLevel3: {
    height: 'auto',
    paddingTop: 0,
    paddingBottom: 14,
    paddingLeft: 40,
    borderBottomWidth: 0,
    justifyContent: 'space-between',
  },

  dataRowLevel3Text: {
    fontSize: sp(16),
    color: colors.blue7,
  },

  dataRowLevel3Wrapper: {
    backgroundColor: colors.blue9,
  },

  sliderItemWrapper: {
    position: 'relative',
    height: SLIDER_HEIGHT,
    marginHorizontal: 0,
    marginBottom: 10,
    alignItems: 'center',
  },

  sliderItemWrapperHasImg: {
    height: SLIDER_HEIGHT + SLIDER_IMG_HEIGHT + 10,
  },

  sliderItemGradient: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: '100%',
  },

  sliderRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.blue13,
  },

  sliderRowLast: {
    borderBottomWidth: 0,
    justifyContent: 'flex-end',
  },

  sliderRowTextGroup: {
    flex: 1,
    paddingRight: 16,
  },

  sliderRowTitle: {
    fontFamily: fonts.semiBold,
    fontSize: sp(14),
    color: colors.white,
    textAlign: 'right',
  },

  sliderRowValue: {
    fontFamily: fonts.regular,
    fontSize: sp(16),
    color: colors.white,
    textAlign: 'right',
  },

  dataRowActive: {
    backgroundColor: '#d9e7ee',
  },

  titleRowActive: {
    backgroundColor: '#45b7ec',
  },

  dataRowLevel2Active: {
    backgroundColor: colors.blue9,
    borderBottomWidth: 0,
  },

  dataRowHeader: {
    height: HEADER_DATA_ROW_HEIGHT,
    paddingHorizontal: 7,
    borderBottomWidth: 0,
    paddingBottom: 0,
    marginBottom: 5,
  },

  tableHeadText: {
    flex: 1,
    fontSize: sp(16),
    textAlign: 'right',
    color: colors.blue5,
    fontFamily: fonts.light,
  },

  transData: {
    fontSize: sp(14),
    color: colors.gray6,
    textAlign: 'right',
    fontFamily: fonts.light,
  },

  tableHeadWrapper: {
    paddingHorizontal: 18,
    elevation: 5,
  },

  tableWrapper: {
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: colors.white,
  },

  dataDescInput: {
    flex: 1,
    height: 20,
    backgroundColor: colors.white,
    borderWidth: 0,
    borderColor: 'transparent',
    fontSize: sp(17),
    color: colors.blue5,
    fontFamily: fonts.semiBold,
    paddingVertical: 0,
  },

  dataValueWrapper: {
    flex: 1,
  },

  dataValueWrapperLevel2: {
    alignItems: 'center',
  },

  dataValueDescWrapperLevel2: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dataValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: sp(17),
    color: colors.blue5,
    fontFamily: fonts.semiBold,
  },

  dataValueDescLevel2: {
    fontFamily: fonts.regular,
  },

  zhutValue: {
    flex: 0,
    color: colors.green4,
  },

  hovaValue: {
    color: colors.red2,
  },

  fractionalPart: {
    fontSize: sp(17),
    color: colors.gray7,
    fontFamily: fonts.light,
  },

  bankAccountTitle: {
    textAlign: 'center',
    fontSize: sp(24),
    color: colors.blue32,
    // marginBottom: 3,
    marginBottom: 8,
    fontFamily: fonts.semiBold,
  },

  bankAccountHeaderAnimatedWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
  },

  bankAccountHeaderBgWrapper: {
    position: 'relative',
    paddingTop: 10,
    backgroundColor: colors.white,
  },

  bankAccountHeaderBgWrapperImg: {
    flex: 1,
    width: null,
    height: null,
    resizeMode: 'cover',
  },

  bankAccountHeaderWrapper: {
    paddingHorizontal: 20,
    paddingTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 0,
    height: HEADER_STICKY_BLOCK_HEIGHT,
    // elevation: 5,
  },

  dateDivider: {
    paddingHorizontal: 5,
  },

  bankAccountHeaderText: {
    fontSize: sp(16),
    color: colors.blue32,
    fontFamily: fonts.regular,
  },

  totalBalanceWrapper: {
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: 13,
    marginBottom: 10,
  },

  totalBalanceZeroWrapper: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
  },

  totalBalanceHasAlertWrapper: {
    borderBottomWidth: 0,
    borderBottomColor: 'transparent',
    marginBottom: 0,
  },

  totalBalanceTitle: {
    textAlign: 'center',
    color: colors.blue32,
    fontSize: sp(15),
  },

  totalBalanceText: {
    textAlign: 'center',
    color: colors.blue32,
    fontFamily: fonts.semiBold,
    lineHeight: 25,
    fontSize: sp(25),
  },

  bankAccountHeaderShadowBg: {
    backgroundColor: colors.white,
    position: 'absolute',
    height: HEADER_STICKY_BLOCK_HEIGHT + 5,
    width: '100%',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 0.5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  bankAccountHeaderShadowBgWhite: {
    backgroundColor: colors.white,
  },

  bankAccountHeaderBottomBg: {
    position: 'absolute',
    backgroundColor: 'white',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    width: '100%',
  },

  noTransactions: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.blue5,
  },

  headerSliderPaginationContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    top: 0,
    paddingVertical: 5,
    margin: 0,
  },

  sliderPaginationContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    paddingVertical: 10,
  },

  sliderDotContainer: {
    marginHorizontal: 2,
  },

  sliderDot: {
    width: 15,
    height: 4,
    borderRadius: 5,
    backgroundColor: colors.green6,
  },

  sliderInactiveDot: {
    width: 15,
    height: 4,
    backgroundColor: colors.blue14,
  },

  sliderImg: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },

  noImageText: {
    color: colors.white,
    fontSize: sp(16),
    textAlign: 'center',
    alignSelf: 'center',
  },

  alertBorder: {
    flex: 1,
    height: HEADER_ALERT_BORDER_HEIGHT,
    backgroundColor: colors.red2,
    zIndex: 4,
  },

  headerSwitchWrapper: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    marginTop: 11,
    paddingHorizontal: 23,
  },

  headerSwitch: {
    // borderWidth: 0,
    // borderColor: 'rgba(216, 216, 216, 0.3)',
  },

  headerSwitchText: {
    fontSize: sp(13),
    textAlign: 'center',
    color: colors.blue8,
  },

  headSectionTitleContainer: {
    opacity: 0,
    elevation: 4,
    position: 'absolute',
    top: 34,
    left: 0,
    right: 0,
    width: '100%',
    justifyContent: 'center',
    zIndex: 1,
    alignItems: 'center',
  },

  headSectionTitleWrapper: {
    width: 79,
    height: 26,
    backgroundColor: colors.white,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray5,
  },
  headSectionTitleText: {
    textAlign: 'center',
    fontSize: sp(16),
    color: colors.blue7,
  },

  categoryNameWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  categoryEditBtnWrapper: {
    width: 30,
    height: 30,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },

  dataRowSeparator: {
    height: 1,
    flex: 1,
    marginHorizontal: CONTAINER_PADDING,
    backgroundColor: colors.gray30,
  },

  actionButtonIcon: {
    width: 20,
    height: 20,
  },

  talkBubble: {
    backgroundColor: 'transparent',
    zIndex: 9,
    flex: 1,
  },
  talkBubbleSquare: {
    width: 80,
    height: 24,
    zIndex: 9,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    borderColor: '#dcdbdb',
    borderWidth: 1,
    alignSelf: 'center',
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'center',
  },
  talkBubbleTriangleWhite: {
    position: 'absolute',
    top: 23,
    left: '50%',
    marginLeft: -4,
    width: 0,
    height: 0,
    zIndex: 10,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#ffffff',
  },
  talkBubbleTriangle: {
    position: 'absolute',
    top: 24,
    left: '50%',
    marginLeft: -5,
    zIndex: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#dcdbdb',
  },
  talkBubbleMessage: {
    color: '#0f3860',
    textAlign: 'center',
    fontSize: sp(12),
    fontFamily: fonts.regular,
  },

  mainContainer: {
    flex: 1,
  },
  dropZone: {
    height: 100,
    zIndex: 1,
    backgroundColor: '#2c3e50',
  },
  text: {
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
    textAlign: 'center',
    color: '#fff',
  },
  draggableContainer: {
    flex: 1,
    zIndex: 9999,
  },
  circle: {
    zIndex: 999,
    position: 'absolute',
    backgroundColor: '#1abc9c',
    width: CIRCLE_RADIUS * 2,
    height: CIRCLE_RADIUS * 2,
    borderRadius: CIRCLE_RADIUS,
  },
  btnMatch: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: sp(16),
    width: '100%',
    textAlign: 'center',
  },
  calendarPresetBtn: {
    height: 48,
    width: 79,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray17,
    borderRadius: 24,
    paddingHorizontal: 5,
  },
  calendarPresetBtnActive: {
    backgroundColor: colors.green13,
  },
  calendarPresetBtnText: {
    textAlign: 'center',
    color: colors.blue8,
    fontSize: sp(15),
    lineHeight: 17,
  },
  calendarPresetBtnActiveText: {
    fontFamily: fonts.bold,
    color: colors.white,
  },
  calendarPresetsWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 26,
    marginBottom: 29,
  },

  panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
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
    shadowOffset: { width: 0, height: 0 },
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
    fontWeight: 'bold',
    color: 'white',
  },
  photo: {
    width: Screen.width - 40,
    height: 225,
    marginTop: 30,
  },
  map: {
    height: Screen.height,
    width: Screen.width,
  },

})
