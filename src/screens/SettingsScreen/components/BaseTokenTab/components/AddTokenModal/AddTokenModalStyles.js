import { StyleSheet } from 'react-native'
import { colors, fonts } from 'src/styles/vars'
import { sp } from 'src/utils/func'

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
    marginTop: 30,
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
})
