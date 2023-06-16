import { Dimensions, StyleSheet } from 'react-native'
import { colors, fonts } from 'src/styles/vars'
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

  editCategoryCard: {
    position: 'relative',
    borderRadius: 10,
    elevation: 3,
  },

  deleteBtn: {
    position: 'absolute',
    top: 10,
    left: 10,
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
    fontFamily: fonts.regular,
    color: colors.blue8,
    textAlign: 'center',
  },

  cardTextSelected: {
    fontFamily: fonts.bold,
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
    color: colors.blue32,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginBottom: 9,
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

  bgBtn: {
    position: 'absolute',
    top: 0,
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },

  nameTextInput: {
    borderBottomColor: colors.blue8,
    borderBottomWidth: 1,
    textAlign: 'center',
    fontSize: sp(15),
    color: colors.blue8,
    fontFamily: fonts.regular,
    paddingVertical: 0,
    marginVertical: 0,
    maxWidth: CATEGORY_CARD_WIDTH - 6,
    height: 15,
  },
})
