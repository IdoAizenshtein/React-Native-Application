import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  controlWrapper: {
    flexDirection: 'row',
  },

  btnWrapper: {
    paddingHorizontal: 20,
    paddingVertical: 5,
  },

  logo: {
    height: 25,
    width: 26,
    alignSelf: 'center',
    resizeMode: 'contain',
  },

  messagesCountContainer: {
    position: 'relative',
    overflow: 'visible',
  },

  messagesCountWrapper: {
    backgroundColor: colors.blue3,
    borderRadius: 100,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -2,
    right: -8,
  },

  messagesCount: {
    color: 'white',
    fontSize: sp(8),
    fontFamily: fonts.bold,
  },
})
