import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export const CONTAINER_PADDING = 25
export const DATA_ROW_HEIGHT = 55
export const HEADER_MIN_HEIGHT = 70
export const HEADER_STICKY_BLOCK_HEIGHT = 40

export default StyleSheet.create({
  dataContainer: {
    flex: 1,
    position: 'relative',
  },

  listWrapper: {
    paddingBottom: 12,
    borderRadius: 5,
    backgroundColor: colors.white,
  },

  dataRowAnimatedWrapper: {
    overflow: 'hidden',
    backgroundColor: colors.white,
  },

  dataRowActive: {
    backgroundColor: '#d9e7ee',
  },

  dataRowLevel2Active: {
    backgroundColor: colors.blue9,
    borderBottomWidth: 0,
  },

  dataRowWrapper: {
    height: DATA_ROW_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: CONTAINER_PADDING,
  },

  dataRowSeparator: {
    height: 1,
    flex: 1,
    marginHorizontal: CONTAINER_PADDING,
    backgroundColor: colors.gray,
  },

  dataRowLevel2: {
    backgroundColor: colors.white,
    paddingHorizontal: 25,
  },

  dataValueWrapperLevel2: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  dataDescTextLevel2: {
    flex: 3,
    textAlign: 'right',
    color: colors.blue5,
    fontSize: sp(17),
  },

  dataDescInput: {
    flex: 1,
    fontSize: sp(17),
    color: colors.blue5,
    fontFamily: fonts.semiBold,
    paddingVertical: 0,
  },

  dataRowLevel3Wrapper: {
    position: 'relative',
    backgroundColor: colors.blue38,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray8,
    paddingBottom: 10,
  },

  dataRowLevel3: {
    height: 'auto',
    paddingTop: 0,
    borderBottomWidth: 0,
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 50,
  },

  dataRowLevel3MainDescription: {
    fontFamily: fonts.bold,
    color: colors.blue5,
    fontSize: sp(17),
  },

  dataRowLevel3CurrencyChar: {
    color: colors.blue7,
    fontSize: sp(17),
    fontFamily: fonts.regular,
  },

  dataRowLevel3Text: {
    fontSize: sp(16),
    color: colors.blue7,
  },

  dataRowAggregatedWrapper: {
    backgroundColor: colors.white,
    margin: 0,
  },

  dataRowValueText: {
    textAlign: 'right',
    flex: 1,
  },

  dataRowValueTextLevel2: {
    textAlign: 'left',
  },

  dataRowDateText: {
    fontSize: sp(17),
    color: colors.gray6,
    textAlign: 'right',
    fontFamily: fonts.semiBold,
    flex: 3,
  },

  dataValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: sp(17),
    color: colors.blue5,
    fontFamily: fonts.semiBold,
  },

  dataValueText: {
    fontSize: sp(17),
    fontFamily: fonts.semiBold,
    color: colors.blue8,
  },

  dataValueNegativeText: {
    color: colors.green4,
  },

  fractionalPart: {
    fontSize: sp(17),
    color: colors.gray7,
    fontFamily: fonts.light,
  },

  sectionTitleWrapper: {
    backgroundColor: 'transparent',
    position: 'relative',
    width: '100%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 18,
  },

  sectionTitleInner: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.blue32,
    height: 29,
    width: '100%',
    borderRadius: 29 / 2,
  },

  sectionTitleText: {
    textAlign: 'center',
    color: colors.blue32,
    fontSize: sp(17),
  },

  noTransactions: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.blue5,
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

  descEditBtnWrapper: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 35,
    height: 35,
  },

  dataRow: {
    minHeight: DATA_ROW_HEIGHT,
    paddingHorizontal: CONTAINER_PADDING,
    paddingVertical: 10,
    width: '100%',
  },

  sliderItemGradient: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: '100%',
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
})
