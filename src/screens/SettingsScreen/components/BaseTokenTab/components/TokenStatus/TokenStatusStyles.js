import { StyleSheet } from 'react-native'
import { colors } from 'src/styles/vars'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  statusContainer: {
    maxWidth: 150,
    paddingLeft: 10,
    height: '100%',
    justifyContent: 'center',
  },

  statusWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  statusTitleText: {
    fontSize: sp(14),
    color: colors.blue5,
  },

  linkText: {
    fontSize: sp(14),
    color: colors.blue41,
    textDecorationLine: 'underline',
  },

  progressBarWrapper: {
    marginTop: 5,
    backgroundColor: colors.white,
    height: 5,
    width: '100%',
    position: 'relative',
  },

  progressBarInner: {
    position: 'absolute',
    backgroundColor: colors.blue41,
    height: 5,
    right: 0,
  },

  validIcon: {
    borderRadius: 100,
    width: 20,
    height: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  imgIcon: {
    alignSelf: 'center',
    resizeMode: 'contain',
  },
})
