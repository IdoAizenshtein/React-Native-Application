import { StyleSheet } from 'react-native'

const PADDING_HORIZONTAL = 53
const ITEM_HEIGHT = 42

export default StyleSheet.create({
  accountGroupsDividerRtl: {
    marginRight: 0,
    marginLeft: 48,
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

  checkerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 10,
  },

  checkerWrapperRtl: {
    left: 'auto',
    right: 0,
  },
})
