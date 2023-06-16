import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../../styles/vars'
import { HEADER_MIN_HEIGHT, HEADER_STICKY_BLOCK_HEIGHT } from '../CreditCardsStyles'
import { sp } from 'src/utils/func'

export const HEADER_ALERT_BORDER_HEIGHT = 4

export default StyleSheet.create({
  headerAnimatedWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'visible',
    paddingTop: 20,
  },

  title: {
    textAlign: 'center',
    fontSize: sp(24),
    color: colors.blue5,
    fontFamily: fonts.semiBold,
  },

  cardTitleWrapper: {
    // justifyContent: 'center',
    // alignItems: 'center',
    // height: HEADER_MIN_HEIGHT + 4,

    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    overflow: 'visible',
  },

  cardTitleText: {
    fontSize: sp(16),
    color: colors.blue7,
  },

  headerFakeBg: {
    backgroundColor: colors.white,
    position: 'absolute',
    height: HEADER_MIN_HEIGHT,
    width: '100%',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 0.5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    zIndex: 3,
  },

  sliderPaginationContainer: {
    backgroundColor: 'transparent',
    width: '100%',
    paddingVertical: 15,
  },

  sliderDotContainer: {
    marginHorizontal: 2,
  },

  sliderDot: {
    width: 15,
    height: 3,
    borderRadius: 5,
    backgroundColor: colors.green6,
  },

  sliderInactiveDot: {
    width: 15,
    height: 3,
    backgroundColor: colors.blue14,
  },

  alertBorder: {
    flex: 1,
    height: HEADER_ALERT_BORDER_HEIGHT,
    backgroundColor: colors.red2,
    zIndex: 4,
  },

  headerShadowBg: {
    backgroundColor: colors.white,
    position: 'absolute',
    height: HEADER_STICKY_BLOCK_HEIGHT + 5,
    width: '100%',
    shadowColor: 'black',
    shadowOpacity: 0.1,
    shadowRadius: 0.5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },

  bankAccountHeaderWrapper: {
    paddingHorizontal: 20,
    paddingTop: 7,
    flexDirection: 'row',
    marginBottom: 0,
    height: HEADER_STICKY_BLOCK_HEIGHT,
    // elevation: 6,
    backgroundColor: '#ffffff',
    zIndex: 99,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  },
})
