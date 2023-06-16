import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from '../../utils/func'

const PADDING_HORIZONTAL = 72
const ITEM_HEIGHT = 42

export default StyleSheet.create({
  modalBody: {
    flex: 1,
    paddingLeft: 12,
    position: 'relative',
  },

  modalBodyRtl: {
    paddingLeft: 12,
    paddingRight: 0,
  },

  accountGroupsDivider: {
    marginTop: 12,
    marginBottom: 15,
    marginRight: 48,
    backgroundColor: colors.gray17,
  },

  accountGroupsDividerRtl: {
    marginRight: 0,
    marginLeft: 48,
  },

  itemsWrapper: {
    paddingRight: 27,
  },

  itemsWrapperRtl: {
    paddingRight: 0,
    paddingLeft: 27,
  },

  group: {
    marginBottom: 5,
  },

  item: {
    position: 'relative',
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
  },

  itemRtl: {
    paddingLeft: PADDING_HORIZONTAL,
    flexDirection: 'row-reverse',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
  },

  itemChecked: {
    backgroundColor: colors.gray,
  },

  groupTitle: {
    color: colors.blue8,
    fontFamily: fonts.bold,
    fontSize: sp(16),
  },

  itemText: {
    fontSize: sp(15),
    fontFamily: fonts.regular,
    color: colors.blue8,
  },

  itemTextDisabled: {
    color: colors.gray6,
  },

  checkerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    flexDirection: 'row',
    top: 0,
    bottom: 0,
    left: 5,
    width: 65,
  },

  checkerWrapperRtl: {
    flexDirection: 'row-reverse',
    left: 'auto',
    right: 0,
  },
})
