import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  wrapper: {
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    height: 20,
    minWidth: 127,
    backgroundColor: colors.blue37,
    paddingHorizontal: 10,
    paddingVertical: 3,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  divider: {
    width: 1,
    height: '100%',
    backgroundColor: colors.white,
    marginHorizontal: 5,
  },

  text: {
    fontSize: sp(14),
    color: colors.white,
    fontFamily: fonts.light,
    alignItems: 'center',
    lineHeight: 15,
  },
})
