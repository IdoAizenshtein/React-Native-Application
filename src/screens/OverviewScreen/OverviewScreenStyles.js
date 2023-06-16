import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export const CONTAINER_PADDING = 25
const FORM_WIDTH = 260
export const DATA_ROW_HEIGHT = 55
// const NAVBAR_HEIGHT = 225

export default StyleSheet.create({
  sliderItemGradient: {
    flex: 1,
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: '100%',
  },
  dataRowActive: {
    backgroundColor: '#d9e7ee',
  },
  dataRowAnimatedWrapper: {
    overflow: 'hidden',
    backgroundColor: 'white',
  },

  dataValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: sp(17),
    color: colors.blue5,
    fontFamily: fonts.semiBold,
  },
  fractionalPart: {
    fontSize: sp(17),
    color: colors.gray7,
    fontFamily: fonts.light,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: FORM_WIDTH,
    marginHorizontal: 10,
  },

  logoImg: {
    width: 146,
    height: 35,
    marginBottom: 19,
  },

  input: {
    marginBottom: 5,
    width: '100%',
  },

  btn: {
    height: 52,
    borderRadius: 6,
    backgroundColor: colors.green12,
    width: FORM_WIDTH,
  },

  btnText: {
    fontFamily: fonts.semiBold,
    fontSize: sp(21),
    textAlign: 'center',
  },

  titleWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },

  titleText: {
    fontSize: sp(24),
    color: colors.blue8,
    textAlign: 'center',
  },

  bottomImgBg: {
    position: 'absolute',
    height: 160,
    width: '100%',
    bottom: 0,
    left: 0,
    right: 0,
  },

  formControlsWrapper: {
    width: '100%',
    height: 45,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },

  linkBtn: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  linkBtnText: {
    fontSize: sp(14),
    color: colors.blue30,
    textAlign: 'center',
  },

  infoText: {
    fontSize: sp(16),
    color: colors.blue8,
    textAlign: 'center',
    width: '100%',
  },

  fill: {
    flex: 1,
  },

  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'white',
    height: 95,
    paddingTop: 0,
    zIndex: 9,
    overflow: 'visible',
    shadowColor: '#f2f2f2',
    shadowOpacity: 1,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    color: '#333333',
  },
  row: {
    height: 300,
    width: null,
    marginBottom: 1,
    padding: 16,
    backgroundColor: 'transparent',
  },
  rowText: {
    color: 'white',
    fontSize: sp(18),
  },

  bankAccountTitle: {
    textAlign: 'center',
    fontSize: sp(24),
    color: '#0f3860',
    fontFamily: fonts.semiBold,
    height: 47,
    lineHeight: 47,
    backgroundColor: 'white',
  },

  headerSliderPaginationContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    bottom: -15,
    paddingVertical: 5,
    margin: 0,
  },

  sliderPaginationContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    width: '100%',
    bottom: 0,
    paddingVertical: 10,
  },

  sliderDotContainer: {
    marginHorizontal: 2,
  },

  sliderDot: {
    width: 15,
    height: 4,
    borderRadius: 5,
    backgroundColor: colors.green6,
  },

  sliderInactiveDot: {
    width: 15,
    height: 4,
    backgroundColor: colors.blue14,
  },

  sliderImg: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },

  noImageText: {
    color: colors.white,
    fontSize: sp(16),
    textAlign: 'center',
    alignSelf: 'center',
  },

  bankAccountHeaderText: {
    fontSize: sp(20.5),
    fontFamily: fonts.semiBold,
    color: colors.white,
  },

  link: {
    fontSize: sp(15),
    fontFamily: fonts.regular,
    color: '#007ebf',
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#007ebf',
  },
  tableWrapper: {
    backgroundColor: colors.white,
    width: '100%',
  },

  errorWrapper: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  errorDivider: {
    height: 1,
    flex: 1,
  },

  errorText: {
    textAlign: 'center',
    fontSize: sp(16),
    marginHorizontal: 5,
  },

  dataRowSeparator: {
    height: 1,
    flex: 1,
    marginHorizontal: CONTAINER_PADDING,
    backgroundColor: colors.gray30,
  },

  dataRow: {
    height: DATA_ROW_HEIGHT,
    paddingHorizontal: 25,
    width: '100%',
  },
})
