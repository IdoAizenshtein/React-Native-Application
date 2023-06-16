import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export const CONTAINER_PADDING = 18
export const DATA_ROW_HEIGHT = 55

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
    backgroundColor: colors.blue3,
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
    height: 20,
    backgroundColor: colors.white,
    borderWidth: 0,
    borderColor: 'transparent',
    fontSize: sp(17),
    color: colors.blue5,
    fontFamily: fonts.semiBold,
    paddingVertical: 0,
  },

  dataRowLevel3Wrapper: {
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
    paddingHorizontal: 25,
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

  dataValuePositiveText: {
    color: colors.green4,
  },

  dataValueNegativeText: {
    color: colors.red4,
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
  },

  sectionTitleInner: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.blue32,
    height: 29,
    width: 200,
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
})
