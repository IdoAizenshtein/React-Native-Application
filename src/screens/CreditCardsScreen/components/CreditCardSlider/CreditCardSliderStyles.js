import { Dimensions, StyleSheet } from 'react-native'
import { colors, fonts } from 'src/styles/vars'
import { sp } from 'src/utils/func'

const winWidth = Dimensions.get('window').width
export const SLIDER_ITEM_WIDTH = winWidth - 6
export const SLIDER_ITEM_HEIGHT = 232

export default StyleSheet.create({
  itemWrapper: {
    position: 'relative',
    width: SLIDER_ITEM_WIDTH,
    height: SLIDER_ITEM_HEIGHT,
    borderRadius: 10,
    overflow: 'hidden',
  },

  imgGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
  },

  itemHeadWrapper: {
    height: 44 + 13 + 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 13,
    paddingBottom: 8,
  },

  itemHeadPart: {
    justifyContent: 'space-between',
    height: '100%',
    flex: 1,
  },

  itemMiddleWrapper: {
    width: '100%',
    height: 44,
    backgroundColor: 'rgba(219,244,255, 0.83)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 17,
  },

  creditLimitBackgroundWrapper: {
    position: 'absolute',
    flex: 1,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },

  itemCreditCardLimitModal: {
    height: 65,
    backgroundColor: colors.white,
    position: 'absolute',
    paddingTop: 15,
    paddingBottom: 15,
    paddingLeft: 35,
    paddingRight: 35,
    left: 20,
    right: 20,
    borderRadius: 5,
    zIndex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  submitCreditLimitBtn: {
    flex: 1,
    height: 34,
    width: 30,
    backgroundColor: colors.blue3,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submitCreditLimitBtnText: {
    fontSize: sp(16),
    color: colors.white,
    textAlign: 'center',
  },

  creditLimitInputWrapper: {
    flex: 2,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F3F3',
    marginLeft: 10,
    paddingRight: 10,
    borderWidth: 1,
    borderColor: '#E3EBEF',
    borderRadius: 5,
  },

  creditLimitInputCurrency: {
    fontSize: sp(16),
    marginLeft: 10,
    marginBottom: 5,
  },

  creditLimitInput: {
    flex: 1,
    alignItems: 'center',
    height: 35,
    backgroundColor: 'transparent',
    borderWidth: 0,
    direction: 'ltr',
    textAlign: 'right',
  },

  itemMiddlePart: {
    justifyContent: 'space-between',
    height: '100%',
    flex: 1,
  },

  itemMiddlePartTitleText: {
    fontSize: sp(14),
    color: colors.blue8,
    textAlign: 'center',
  },

  itemMiddlePartValueText: {
    fontSize: sp(19),
    color: colors.blue8,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },

  itemNoCreditLimitText: {
    fontSize: sp(15),
    fontFamily: fonts.semiBold,
    textAlign: 'right',
  },

  itemMiddlePartValueGreenText: {
    color: colors.green11,
  },

  itemGraphWrapper: {
    height: 94,
    width: '100%',
    paddingLeft: 9,
    flexDirection: 'row',
  },

  itemGraphYAxis: {
    width: 23,
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: 3,
    opacity: 0.75,
  },

  itemGraphRightWrapper: {
    flexDirection: 'column',
    flex: 1,
  },

  itemGraphBar: {
    width: 7,
    backgroundColor: colors.blue20,
  },

  itemGraphBarNotFinal: {
    width: 7,
    backgroundColor: colors.yellow,
  },

  itemGraphBarSelected: {
    width: 7,
    backgroundColor: colors.blue8,
  },

  itemGraphBarImgNotFinal: {
    height: '100%',
    width: '100%',
  },

  itemGraph: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 5,
    paddingLeft: 14,
    paddingRight: 18,
  },

  itemGraphXAxis: {
    width: '100%',
    height: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 24 / 2,
    borderTopLeftRadius: 24 / 2,
    paddingLeft: 10,
    paddingRight: 15,
  },

  itemGraphAxisText: {
    fontSize: sp(14),
    color: colors.white,
  },

  cardIconWrapper: {
    width: 50,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  cardCountWrapper: {
    width: 31,
    height: 28,
  },

  cardIcon25Wrapper: {
    backgroundColor: colors.blue28,
  },

  cardCountText: {
    fontSize: sp(19),
    fontFamily: fonts.semiBold,
    color: colors.blue8,
    textAlign: 'center',
  },

  cardIconImg: {
    maxHeight: 28,
    maxWidth: 50,
  },

  cardNicknameText: {
    fontSize: sp(15),
    color: colors.white,
    textAlign: 'left',
  },

  cartNameText: {
    fontSize: sp(19),
    color: colors.white,
    fontFamily: fonts.semiBold,
    textAlign: 'right',
  },

  cardNumberText: {
    fontSize: sp(18),
    color: colors.white,
    textAlign: 'right',
  },

  noDataWrapper: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  noDataText: {
    fontSize: sp(19),
    color: colors.white,
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },
})
