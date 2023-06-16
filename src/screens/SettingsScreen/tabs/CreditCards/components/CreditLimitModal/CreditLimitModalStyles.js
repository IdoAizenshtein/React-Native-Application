import { StyleSheet } from 'react-native'
import { colors, fonts } from 'src/styles/vars'
import { sp } from 'src/utils/func'

export const CREDIT_LIMIT_MODAL_HEIGHT = 140

export default StyleSheet.create({
  creditLimitModalWrapper: {
    flex: 1,
    height: '100%',
    width: '100%',
    position: 'relative',
  },

  creditLimitModalInner: {
    position: 'absolute',
    width: '100%',
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
    zIndex: 10,
  },

  saveBtnWrapper: {
    backgroundColor: colors.blue32,
    height: 32,
    minWidth: 117,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    borderRadius: 7,
  },

  saveBtnText: {
    fontFamily: fonts.semiBold,
    fontSize: sp(15),
    lineHeight: 15,
    textAlign: 'center',
    color: colors.white,
  },

  textInput: {
    width: 178,
    paddingBottom: 10,
    textAlign: 'center',
    padding: 0,
    borderBottomColor: colors.blue8,
    borderBottomWidth: 1,
    fontSize: sp(25),
    fontFamily: fonts.semiBold,
  },

  hiddenArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
})
