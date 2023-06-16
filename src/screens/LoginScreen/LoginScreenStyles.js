import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

const FORM_WIDTH = 260

export default StyleSheet.create({
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: FORM_WIDTH,
    marginHorizontal: 10,
  },

  logoImg: {
    width: 146,
    height: 35,
    marginBottom: 19,
  },

  input: {
    marginBottom: 5,
    width: '100%',
  },

  btn: {
    height: 52,
    borderRadius: 6,
    backgroundColor: colors.green12,
    width: FORM_WIDTH,
  },

  btnText: {
    fontFamily: fonts.semiBold,
    fontSize: sp(21),
    textAlign: 'center',
  },

  titleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },

  titleText: {
    fontFamily: fonts.semiBold,
    fontSize: sp(24),
    color: colors.blue8,
    textAlign: 'center',
  },

  bottomImgBg: {
    position: 'absolute',
    height: 160,
    width: '100%',
    bottom: 0,
    left: 0,
    right: 0,
  },

  formControlsWrapper: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },

  linkBtn: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  linkBtnText: {
    fontSize: sp(14),
    color: colors.blue30,
    textAlign: 'center',
    fontFamily:fonts.regular,
  },

  infoText: {
    fontSize: sp(16),
    color: colors.blue8,
    textAlign: 'center',
    width: '100%',
  },
})
