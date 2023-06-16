import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

const inputStyles = StyleSheet.create({
  inputContainer: {
    position: 'relative',
  },

  controlContainer: {
    justifyContent: 'center',
  },

  valid: {
    borderColor: colors.green,
  },

  invalid: {
    borderColor: colors.orange,
  },

  rightControl: {
    position: 'absolute',
    backgroundColor: 'transparent',
    height: '100%',
    left: 0,
    top: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  hoshiInput: {
    borderBottomWidth: 2,
    borderBottomColor: colors.blue3,
  },

  hoshiLabel: {
    fontSize: sp(17),
    fontFamily: fonts.regular,
    color: colors.blue29,
    backgroundColor: 'transparent',
  },

  roundedInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: colors.gray17,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray17,
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
    height: 42,
    paddingHorizontal: 20,
  },

  expandedInputWrapper: {
    flexDirection: 'column',
    minHeight: 42,
    height: 'auto',
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.gray17,
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.gray17,
    borderTopRightRadius: 21,
    borderBottomRightRadius: 21,
    paddingVertical: 9,
    paddingHorizontal: 20,
  },

  expandedInputLabelText: {
    fontSize: sp(15),
    fontFamily: fonts.regular,
    lineHeight: 15,
    color: colors.blue8,
    textAlign: 'right',
  },

  expandedMarkWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.green15,
    borderRadius: 8,
    height: 18,
    paddingHorizontal: 9,
  },

  expandedMarkText: {
    color: colors.white,
    fontSize: sp(13),
    lineHeight: 13,
    fontFamily: fonts.semiBold,
  },

  tooltipWrapper: {
    height: 15,
    width: 15,
    backgroundColor: colors.blue30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tooltipText: {
    fontSize: sp(15),
    color: colors.white,
    fontFamily: fonts.bold,
  },

  expandedInputDescText: {
    fontSize: sp(16),
    fontFamily: fonts.regular,
    lineHeight: 16,
    color: colors.white,
  },

  expandedInputFirstRow: {
    justifyContent: 'space-between',
    flexDirection: 'row',
    flex: 1,
    width: '100%',
    marginBottom: 5,
  },

  expandedInputCountText: {
    fontSize: sp(14),
    color: colors.blue8,
    fontFamily: fonts.regular,
    textAlign: 'right',
  },

  expandedTextInput: {
    marginLeft: 50,
    marginBottom: 0,
    flex: 1,
    direction: 'ltr',
    textAlign: 'right',
    padding: 0,
    borderBottomColor: colors.blue8,
    borderBottomWidth: 1,
  },
})

export default inputStyles
