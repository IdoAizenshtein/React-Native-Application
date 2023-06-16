import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export const FORM_WIDTH = 260

export default StyleSheet.create({
  addModalBody: {
    flex: 1,
    position: 'relative',
  },

  addModalContainer: {
    flexDirection: 'column',
  },

  otpFormModalContainer: {
    flexDirection: 'column',
    paddingRight: 20,
    paddingTop: 35,
  },

  confirmRemoveIcon: {
    marginBottom: 20,
  },

  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  formRowLeftPart: {
    justifyContent: 'center',
    backgroundColor: colors.gray17,
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
    height: 42,
    width: '75%',
  },

  formRowRightPart: {
    justifyContent: 'flex-end',
    width: '25%',
    paddingRight: 5,
  },

  formRowRightText: {
    fontSize: sp(13),
    lineHeight: 13,
    textAlign: 'center',
    color: colors.blue8,
  },

  formWrapper: {
    marginVertical: 21,
  },

  bankTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gray17,
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
    height: 42,
    paddingHorizontal: 20,
  },

  bankName: {
    fontSize: sp(15),
    lineHeight: 15,
    color: colors.blue8,
    marginRight: 12,
  },

  banksModalBody: {
    flex: 1,
    position: 'relative',
  },

  banksModalContainer: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    alignItems: 'center',
    paddingVertical: 30,
    paddingLeft: 10,
  },

  bankCardWrapper: {
    width: 94,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginBottom: 10,
    elevation: 0,
  },

  bankCardSelected: {
    backgroundColor: colors.blue8,
    elevation: 2,
  },

  bankNameText: {
    textAlign: 'center',
    color: colors.blue8,
    marginTop: 5,
  },

  bankNameTextSelected: {
    textAlign: 'center',
    color: colors.white,
  },

  validationContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 0,
  },

  errMessageText: {
    fontSize: sp(14),
    color: colors.red7,
    marginBottom: 5,
  },

  infoMessageText: {
    fontSize: sp(14),
    color: colors.blue8,
    marginBottom: 5,
  },

  passwordUpdateContText: {
    textAlign: 'right',
    fontSize: sp(15),
    color: colors.blue8,
    marginBottom: 10,
    marginRight: 10,
  },

  addAccountTitle: {
    fontSize: sp(17),
    fontFamily: fonts.semiBold,
    color: colors.blue8,
    textAlign: 'center',
  },

  addAccountSubTitle: {
    color: colors.blue8,
    textAlign: 'center',
  },

  infoModalBody: {
    flex: 1,
    paddingHorizontal: 30,
    position: 'relative',
  },

  infoModalContainer: {
    paddingTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoModalTitle: {
    textAlign: 'center',
    color: colors.blue8,
    fontFamily: fonts.bold,
    fontSize: sp(21),
    marginBottom: 10,
  },

  infoModalDesc: {
    textAlign: 'center',
    color: colors.blue8,
    marginBottom: 45,
  },

  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },

  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    width: FORM_WIDTH,
    alignSelf: 'center',
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
  },

  infoText: {
    fontSize: sp(16),
    color: colors.blue8,
    textAlign: 'center',
    width: '100%',
  },

  switchWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: 6,
    marginTop: 0,
  },

  switchText: {
    fontSize: sp(18),
    color: colors.blue39,
  },
})
