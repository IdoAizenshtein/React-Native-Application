import { StyleSheet } from 'react-native'
import { colors, fonts } from "../../styles/vars";
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  checkbox: {
    width: 39,
    height: 39,
    borderRadius: 100,
    backgroundColor: colors.gray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  checkboxRtl: {
    marginRight: 0,
    marginLeft: 10,
  },

  iconDisabled: {
    color: colors.gray2,
  },

  checkboxChecked: {
    backgroundColor: colors.green2,
  },

  checkboxIconChecked: {
    color: colors.white,
  },

  checkboxIconNoBgChecked: {
    color: colors.green2,
  },

  checkboxIcon: {
    fontSize: sp(18),
    fontFamily: fonts.regular,
    color: colors.dark,
    marginLeft: 10,
    marginRight: 10,
  },

  checkboxIconRtl: {
    marginLeft: 10,
    marginRight: 10,
  },
})
