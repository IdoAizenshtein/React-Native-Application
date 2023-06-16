import { StyleSheet } from 'react-native'
import { fonts } from 'src/styles/vars'

const PADDING_HORIZONTAL = 53
const ITEM_HEIGHT = 42

export default StyleSheet.create({
  modalBody: {
    flex: 1,
    paddingLeft: 39,
    position: 'relative',
  },

  modalBodyRtl: {
    paddingLeft: 39,
    paddingRight: 0,
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

  itemTextChecked: {
    fontFamily: fonts.semiBold,
  },

  checkerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 0,
    bottom: 0,
    left: 10,
  },
})
