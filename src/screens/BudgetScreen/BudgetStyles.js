import { Dimensions, StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export const CONTAINER_PADDING = 25
export const DATA_ROW_HEIGHT = 20
export const SLIDER_HEIGHT = 200
export const SLIDER_IMG_HEIGHT = 152
export const HEADER_STICKY_BLOCK_HEIGHT = 50
export const HEADER_DATA_ROW_HEIGHT = 35
export const HEADER_ALERT_BORDER_HEIGHT = 4
const FORM_WIDTH = 260

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
}
export default StyleSheet.create({
  dataRow: {
    height: DATA_ROW_HEIGHT,
    paddingHorizontal: CONTAINER_PADDING,
    paddingVertical: 10,
    flexDirection: 'row',
    width: '100%',
  },
  dataRowActive: {
    backgroundColor: '#d9e7ee',
  },
  container: {
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  containerModal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: FORM_WIDTH,
    marginHorizontal: 10,
  },
  titleContainer: {
    backgroundColor: 'red',
    height: DATA_ROW_HEIGHT,
    paddingHorizontal: CONTAINER_PADDING,
    paddingVertical: 0,
    width: '100%',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    padding: 10,
    color: '#2a2f43',
    fontWeight: 'bold',
  },
  button: {},
  buttonImage: {
    width: 30,
    height: 25,
  },
  body: {
    backgroundColor: 'blue',
    // padding: 10,
    paddingTop: 0,
  },
  panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
  },
  panel: {
    height: Screen.height + 280,
    paddingBottom: 20,
    paddingTop: 14,
    paddingHorizontal: 0,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: 'black',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowRadius: 5,
    shadowOpacity: 0.4,
  },
  panelHeader: {
    height: 15,
    paddingBottom: 10,
    alignItems: 'center',
  },
  panelHandle: {
    width: 54,
    height: 5,
    borderRadius: 4,
    backgroundColor: '#cdcdcd',
  },
  panelTitle: {
    color: '#022258',
    fontSize: sp(20),
    fontFamily: fonts.semiBold,
    textAlign: 'center',
    alignSelf: 'center',
  },
  panelSubtitle: {
    fontSize: sp(20),
    height: 28,
    marginBottom: 10,
    textAlign: 'center',
  },
  panelButton: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#459FED',
    alignItems: 'center',
    marginVertical: 10,
  },
  panelButtonTitle: {
    fontSize: sp(17),
    fontWeight: 'bold',
    color: 'white',
  },
  bar: {
    height: 22,
    borderWidth: 1,
    borderColor: '#e2e1e1',
    borderRadius: 4,
    flex: 1,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignContent: 'center',
  },
  fillBar: {
    width: '0%',
    height: 20,
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4,
  },
  red1: {
    backgroundColor: '#fd9393',
  },
  red2: {
    backgroundColor: '#e97f7f',
  },
  red3: {
    backgroundColor: '#d34a4a',
  },
  red4: {
    backgroundColor: '#cd1010',
  },
  green1: {
    backgroundColor: '#a1ecde',
  },
  green2: {
    backgroundColor: '#81dfcd',
  },
  green3: {
    backgroundColor: '#5bc6b2',
  },
  green4: {
    backgroundColor: '#229f88',
  },

  alertDetailsBackgroundWrapper: {
    position: 'absolute',
    flex: 1,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    zIndex: 9999,
  },

  alertDetailsWrapper: {
    backgroundColor: colors.white,
    maxHeight: 146 * 2,
    width: '100%',
    paddingHorizontal: 6,
    position: 'absolute',
    shadowColor: colors.gray11,
    shadowOpacity: 0.01,
    shadowRadius: 0.5,
    shadowOffset: {
      width: 2,
      height: 3,
    },
    elevation: 5,
    zIndex: 9999,
    borderBottomColor: colors.gray11,
    borderBottomWidth: 1,
  },

  alertDetailsContainer: {
    flex: 1,
    flexDirection: 'column',
  },

  alertDetailsRow: {
    height: 50,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.gray12,
  },

  alertDetailsText: {
    textAlign: 'right',
    flex: 2,
    fontSize: sp(16),
    fontFamily: fonts.semiBold,
    color: colors.blue8,
  },

  alertValueText: {
    flex: 1,
    fontSize: sp(16),
    fontFamily: fonts.semiBold,
    color: colors.red2,
    textAlign: 'right',
    marginHorizontal: 5,
  },

  dataRowLevel3Text: {
    fontSize: sp(18),
    fontFamily: fonts.regular,
    color: '#022258',
  },

  bankAccountHeaderText: {
    fontSize: sp(15),
    color: '#022258',
    fontFamily: fonts.regular,
  },

  slider: {
    marginTop: 0,
    overflow: 'visible', // for custom animations

  },
  sliderContentContainer: {
    paddingVertical: 0, // for custom animation
    left: 0,
  },

  sliderPaginationContainer: {
    width: '100%',
    bottom: 0,
    paddingVertical: 10,
  },

  sliderDotContainer: {
    marginHorizontal: 2,
  },

  sliderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#022258',
  },

  sliderInactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#b7b7b7',
  },
})
