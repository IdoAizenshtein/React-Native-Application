import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { IS_IOS } from '../../constants/common'
import { sp } from 'src/utils/func'

export const CONTAINER_PADDING = 18
export const DATA_ROW_HEIGHT = 55
export const SLIDER_HEIGHT = 200
export const SLIDER_IMG_HEIGHT = 127

export default StyleSheet.create({
  accountsContainer: {
    flex: 1,
    paddingHorizontal: CONTAINER_PADDING,
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
    overflow: 'visible',
    backgroundColor: 'white',
  },

  dataRowParent: {
    height: DATA_ROW_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    width: '100%',
  },

  dataRow: {
    height: DATA_ROW_HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray8,
  },

  dataRowLevel2: {
    backgroundColor: colors.white,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dataRowLevel3: {
    height: 'auto',
    paddingTop: 0,
    paddingBottom: 14,
    paddingLeft: 0,
    borderBottomWidth: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dataRowLevel3Text: {
    fontSize: sp(16),
    color: colors.blue7,
  },

  dataRowLevel3Wrapper: {
    backgroundColor: colors.blue9,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray8,
  },

  sliderItemWrapper: {
    position: 'relative',
    height: SLIDER_HEIGHT,
    marginHorizontal: IS_IOS ? 10 : 0,
    marginBottom: 10,
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
    backgroundColor: colors.blue3,
  },

  dataRowLevel2Active: {
    backgroundColor: colors.blue9,
    borderBottomWidth: 0,
  },

  dataRowHeader: {
    height: 35,
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
  },

  tableWrapper: {
    paddingTop: 3,
    paddingBottom: 12,
    borderRadius: 5,
  },

  dataValueWrapper: {
    flex: 1,
    textAlign: 'right',
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
    color: colors.blue5,
    marginBottom: 20,
    fontFamily: fonts.semiBold,
  },

  bankAccountHeaderAnimatedWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
    paddingTop: 20,
  },

  bankAccountHeaderWrapper: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  dateDivider: {
    paddingHorizontal: 5,
  },

  bankAccountHeaderText: {
    fontSize: sp(16),
    color: colors.blue7,
  },

  totalBalanceWrapper: {
    justifyContent: 'center',
    marginBottom: 10,
    marginHorizontal: 18,
  },

  totalBalanceTitle: {
    textAlign: 'center',
    color: colors.blue5,
    fontSize: sp(14),
    marginBottom: 2,
  },

  totalBalanceText: {
    textAlign: 'center',
    color: colors.blue5,
    fontFamily: fonts.semiBold,
    fontSize: sp(28),
  },

  bankAccountHeaderFakeBg: {
    backgroundColor: colors.blue6,
    position: 'absolute',
    height: '100%',
    width: '100%',
    top: -5,
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 0.5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  noTransactions: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.blue5,
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

  headerSwitchWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: -13,
    left: 15,
  },

  headerSwitch: {
    borderWidth: 1,
    borderColor: 'rgba(216, 216, 216, 0.3)',
  },

  headerSwitchText: {
    fontSize: sp(13),
    textAlign: 'center',
    color: colors.blue8,
  },

  titleWrapper: {
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    height: 28,
    shadowColor: '#dedede',
    shadowOpacity: 1,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    borderWidth: 0,
    marginBottom: 6,
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

  btnMatch: {
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: sp(16),
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
  },

  modalWrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },

  modalInner: {
    flex: 1,
  },

  modalHeader: {
    height: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.blue32,
  },

  leftHeaderPart: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  rightHeaderPart: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  centerHeaderPart: {
    flex: 2,
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  headerBtnText: {
    fontSize: sp(16),
    color: colors.white,
    fontFamily: fonts.semiBold,
  },

  modalTitle: {
    flex: 2,
    color: colors.white,
    fontSize: sp(20),
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  talkBubble: {
    backgroundColor: 'transparent',
    position: 'absolute',
    zIndex: 9,
    flex: 1,
    left: -5,
    top: 15,
  },
  talkBubbleSquare: {
    width: 80,
    height: 19,
    backgroundColor: '#ffffff',
    borderRadius: 3,
    borderColor: '#dcdbdb',
    borderWidth: 1,
  },
  talkBubbleTriangleWhite: {
    position: 'absolute',
    top: 12,
    right: 4,
    width: 0,
    height: 0,
    zIndex: 10,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#ffffff',
  },
  talkBubbleTriangle: {
    position: 'absolute',
    top: 10,
    right: 3,
    zIndex: 4,
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#dcdbdb',
  },
  talkBubbleMessage: {
    color: '#0f3860',
    textAlign: 'center',
    fontSize: sp(12),
    fontFamily: fonts.regular,
  },
})
