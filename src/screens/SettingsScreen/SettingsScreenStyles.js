import { StyleSheet } from 'react-native'
import { colors, fonts } from 'src/styles/vars'
import { sp } from 'src/utils/func'

export const MENU_WIDTH_COLLAPSED = 47

export default StyleSheet.create({
  companyTitleWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },

  companyTitleText: {
    fontSize: sp(24),
    lineHeight: 24,
    color: colors.blue5,
    fontFamily: fonts.semiBold,
  },

  headerWrapper: {
    height: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.blue32,
  },

  headerWhiteWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 5,
    borderBottomColor: colors.green6,
  },

  rightHeaderPart: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    width: MENU_WIDTH_COLLAPSED,
  },

  centerHeaderPart: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  headerTitle: {
    color: colors.white,
    fontSize: sp(24),
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },

  headerTitleWhiteBg: {
    color: colors.blue8,
  },

  tabWrapper: {
    flex: 1,
    elevation: 2,
    height: '100%',
    position: 'relative',
    borderTopRightRadius: 5,
    backgroundColor: colors.white,
  },
})
