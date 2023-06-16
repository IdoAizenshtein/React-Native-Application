import { StyleSheet } from 'react-native'
import { colors, fonts } from 'src/styles/vars'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  confirmRemoveModalBody: {
    flex: 1,
    paddingHorizontal: 35,
    position: 'relative',
  },

  confirmRemoveContainer: {
    paddingTop: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },

  confirmRemoveIcon: {
    marginBottom: 20,
  },

  confirmRemoveTitle1: {
    textAlign: 'center',
    color: colors.blue8,
    fontFamily: fonts.bold,
    fontSize: sp(21),
    marginBottom: 20,
  },

  confirmRemoveDesc1: {
    fontSize: sp(18),
    textAlign: 'center',
    color: colors.blue8,
    marginBottom: 45,
  },

  detailsModalBody: {
    flex: 1,
    paddingRight: 15,
    position: 'relative',
  },

  detailsContainer: {
    paddingTop: 38,
    flexDirection: 'column',
  },

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  detailsLeftPart: {
    justifyContent: 'center',
    backgroundColor: colors.gray17,
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
    height: 42,
    width: '60%',
    paddingRight: 22,
  },

  detailsRightPart: {
    justifyContent: 'flex-end',
    width: '40%',
  },

  detailsLeftText: {
    fontSize: sp(16),
    lineHeight: 16,
    color: colors.blue8,
    textAlign: 'right',
  },

  detailsRightText: {
    fontSize: sp(15),
    lineHeight: 15,
    color: colors.blue8,
    textAlign: 'right',
  },

  detailsLastRow: {
    marginTop: 15,
    justifyContent: 'flex-end',
  },

  primaryAccountIcon: {
    width: 33,
    height: 31,
    marginLeft: 15,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
})
