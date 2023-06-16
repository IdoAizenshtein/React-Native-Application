import { StyleSheet } from 'react-native'
import { fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  title: {
    textAlign: 'center',
    fontSize: sp(23),
    fontWeight: '300',
    marginBottom: 0,
  },
  header: {
    // padding: 10,
    paddingTop: 10,
  },
  headerText: {
    fontFamily: fonts.semiBold,
    fontSize: sp(17),
    textAlign: 'right',
    color: '#022258',
  },
  content: {
    paddingBottom: 10,
    paddingLeft: 15,
    paddingRight: 38,
    textAlign: 'right',
    backgroundColor: '#ffffff',
  },
  active: {
    backgroundColor: '#e9f3fd',
  },
  inactive: {
    backgroundColor: '#ffffff',
  },
  inactiveHedaer: {
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  selectors: {
    marginBottom: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  selector: {
    backgroundColor: '#F5FCFF',
    padding: 0,
  },
  activeSelector: {
    fontWeight: 'bold',
  },
  selectTitle: {
    fontSize: sp(15),
    fontWeight: '500',
    padding: 0,
  },
  multipleToggle: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 0,
    alignItems: 'center',
  },
  multipleToggle__title: {
    fontSize: sp(17),
    marginRight: 0,
  },

  slider: {
    marginTop: 0,
    overflow: 'visible', // for custom animations
  },
  sliderContentContainer: {
    paddingVertical: 0, // for custom animation
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
    backgroundColor: '#f3cb37',
  },

  sliderInactiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#b7b7b7',
  },

})
