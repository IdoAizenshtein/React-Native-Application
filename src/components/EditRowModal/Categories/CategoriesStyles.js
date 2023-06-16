import { Dimensions, StyleSheet } from 'react-native'
import { colors, fonts } from "../../../styles/vars";
import { sp } from 'src/utils/func'

const winWidth = Dimensions.get('window').width

export const CATEGORY_CARD_WIDTH = (winWidth / 3) - 20
export const MODAL_FOOTER_HEIGHT = 100
export const REMOVE_BTN_SIZE = 80

export default StyleSheet.create({
  removeBtn: {
    backgroundColor: colors.green5,
    width: REMOVE_BTN_SIZE,
    height: REMOVE_BTN_SIZE,
    borderRadius: REMOVE_BTN_SIZE,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    elevation: 2,
    zIndex: 2,
  },

  draggableCardInner: {
    width: 90,
    height: 85,
    backgroundColor: colors.blue31,
    borderRadius: 10,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },

  draggableCardText: {
    fontSize: sp(14),
    color: colors.blue8,
    fontFamily: fonts.regular,
  },

  categoriesContainer: {
    paddingVertical: 20,
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginHorizontal: 10,
    paddingBottom: MODAL_FOOTER_HEIGHT,
  },

  categoriesDivider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.gray28,
    marginTop: 7,
    marginBottom: 13,
  },

  cardWrapper: {
    width: CATEGORY_CARD_WIDTH,
    height: 94,
    alignItems: 'center',
    marginHorizontal: 3,
    borderRadius: 8,
  },

  cardInner: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    width: CATEGORY_CARD_WIDTH,
    height: 62,
  },

  cardInnerSelected: {
    backgroundColor: colors.green5,
  },

  cardText: {
    fontSize: sp(15),
    color: colors.blue8,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },

  inputWrapper: {
    flex: 1,
    height: 43,
    overflow: 'hidden',
    marginHorizontal: 23,
    borderRadius: 21,
    backgroundColor: colors.gray17,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },

  input: {
    flex: 1,
    height: 43,
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderColor: 'transparent',
    marginHorizontal: 25,
  },

  submitBtn: {
    width: 93,
    height: 43,
    borderRadius: 21,
  },

  submitBlockTitle: {
    fontSize: sp(15),
    color: colors.blue8,
    textAlign: 'center',
    marginBottom: 9,
    fontFamily: fonts.regular,
  },

  modalFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    height: MODAL_FOOTER_HEIGHT,
    paddingTop: 8,
    paddingBottom: 20,
  },
})
