import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  modalWrapper: {
    flex: 1,
    backgroundColor: colors.white,
  },

  modalInner: {
    flex: 1,
  },

  modalHeader: {
    height: 58,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: colors.blue32,
  },

  leftHeaderPart: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  rightHeaderPart: {
    flex: 1,
    height: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 10,
  },

  centerHeaderPart: {
    flex: 2,
    height: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },

  headerBtnText: {
    fontSize: sp(16),
    color: colors.white,
    fontFamily: fonts.semiBold,
  },

  modalTitle: {
    flex: 2,
    color: colors.white,
    fontSize: sp(20),
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },

  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },

  alertModalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0, 0.5)',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },

  alertModalInner: {
    position: 'relative',
    padding: 18,
    paddingTop: 20,
    width: '100%',
    backgroundColor: colors.white,
    elevation: 4,
    borderRadius: 7,
  },

  alertModalCloseBtn: {
    position: 'absolute',
    left: 15,
    top: 11,
  },

  alertModalText: {
    textAlign: 'right',
    color: colors.blue8,
  },
})
