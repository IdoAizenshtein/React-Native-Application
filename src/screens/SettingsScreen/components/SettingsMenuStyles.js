import { StyleSheet } from 'react-native'
import { colors, fonts } from 'src/styles/vars'
import { MENU_WIDTH_COLLAPSED } from '../SettingsScreenStyles'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  menuContainer: {
    width: '100%',
    paddingLeft: 22,
    paddingRight: 22,
    backgroundColor: colors.white,
  },

  menuContainerCollapsed: {
    width: MENU_WIDTH_COLLAPSED,
    paddingLeft: 0,
    paddingRight: 0,
  },

  menuRow: {
    height: 65,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomColor: colors.gray31,
    borderBottomWidth: 1,
    paddingHorizontal: 12,
  },

  menuRowActive: {
    backgroundColor: colors.blue32,
  },

  menuText: {
    fontSize: sp(18),
    color: colors.blue5,
    fontFamily: fonts.semiBold,
    marginRight: 20,
  },

  menuTopBorder: {
    height: 4,
    backgroundColor: colors.blue32,
  },
})
