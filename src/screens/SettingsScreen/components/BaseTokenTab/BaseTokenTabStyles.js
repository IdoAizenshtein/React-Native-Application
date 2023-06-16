import { StyleSheet } from 'react-native'
import { colors, fonts } from 'src/styles/vars'
import { sp } from 'src/utils/func'

export const TOKEN_ROW_MIN_HEIGHT = 50

export default StyleSheet.create({
  addBtnWrapper: {
    left: 0,
    right: 0,
    bottom: 65,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },

  addNewBtn: {
    width: 55,
    height: 55,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.green6,
  },

  tokenItemLeftPart: {
    flexDirection: 'row',
    paddingRight: 5,
    alignItems: 'center',
  },

  switchWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },

  switchText: {
    fontSize: sp(14),
    color: colors.blue39,
  },

  tokenItemWrapper: {
    flex: 1,
    width: '100%',
    height: TOKEN_ROW_MIN_HEIGHT,
    borderTopWidth: 1,
    borderTopColor: colors.white,
    backgroundColor: colors.blue38,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  tokenTitle: {
    color: colors.blue39,
    fontFamily: fonts.bold,
    fontSize: sp(16),
    lineHeight: 16,
  },

  tokenRowWrapper: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'white',
  },

  accountTitleText: {
    fontSize: sp(18),
    color: colors.blue5,
    textAlign: 'right',
  },

  accountDetailsFirstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 7,
  },

  accountDetailsWrapper: {
    position: 'relative',
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderBottomColor: colors.gray32,
    borderBottomWidth: 1,
  },

  accountPaleText: {
    color: colors.gray33,
  },

  accountRegularText: {
    color: colors.blue5,
    fontSize: sp(16),
  },

  accountTodayText: {
    color: colors.green4,
    fontFamily: fonts.bold,
    fontSize: sp(16),
    textAlign: 'center',
  },

  accountDateText: {
    color: colors.red2,
    fontFamily: fonts.semiBold,
    fontSize: sp(16),
    textAlign: 'center',
  },

  accountLinkText: {
    fontSize: sp(16),
    color: colors.blue41,
    textDecorationLine: 'underline',
  },

  bucketIcon: {
    width: 40,
    height: 57,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 30,
  },

  confirmModalBody: {
    flex: 1,
    paddingHorizontal: 35,
    position: 'relative',
  },

  modalContainer1: {
    paddingVertical: 33,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalTitle1: {
    textAlign: 'center',
    color: colors.blue8,
    fontFamily: fonts.bold,
    marginBottom: 20,
  },

  modalDesc1: {
    fontSize: sp(17),
    textAlign: 'center',
    color: colors.blue8,
    marginBottom: 50,
  },

  modalBtn: {
    height: 42,
    width: 223,
    borderRadius: 7,
    backgroundColor: colors.blue8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
  },

  modalBtnText: {
    textAlign: 'center',
    color: colors.white,
    fontFamily: fonts.semiBold,
    fontSize: sp(17),
  },

  modalLinkText: {
    textAlign: 'right',
    fontSize: sp(16),
    color: colors.red2,
    textDecorationLine: 'underline',
  },
})
