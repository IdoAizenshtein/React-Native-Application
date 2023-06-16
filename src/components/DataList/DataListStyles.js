import { StyleSheet } from 'react-native'
import { colors, fonts } from "../../styles/vars";
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  sectionTitleWrapper: {
    position: 'relative',
    width: '100%',
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },

  sectionTitleText: {
    textAlign: 'center',
    color: colors.blue32,
    fontSize: sp(17),
    fontFamily: fonts.regular,
  },
})
