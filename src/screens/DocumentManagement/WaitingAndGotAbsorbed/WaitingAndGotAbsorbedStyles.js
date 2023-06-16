import { StyleSheet } from 'react-native'
import { sp } from '../../../utils/func'
import { fonts } from '../../../styles/vars'

export default StyleSheet.create({
  container: {
    backgroundColor: 'white',
    overflow: 'hidden',
  },
  bar: {
    height: 22,
    borderWidth: 1,
    borderColor: '#e2e1e1',
    borderRadius: 4,
    justifyContent: 'flex-start',
    flexDirection: 'row',
    alignContent: 'center',
    width: '100%',
  },
  fillBar: {
    width: '0%',
    height: 20,
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 4,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  capture: {
    alignSelf: 'center',
    width: 65,
    height: 65,
    borderRadius: 32.5,
    borderColor: 'white',
    borderWidth: 5,
    marginBottom: 20,
  },
  nav: {
    height: 33,
    alignSelf: 'center',
    flex: 1,
  },
  navText: {
    fontSize: sp(18),
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },
  rowAlbum: {
    height: 62.5,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingRight: 6,
    alignContent: 'center',
  },
  folderGrid: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  folderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    height: 45,
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  closeCameraAndCameraRoll: {
    position: 'absolute',
    top: 20,
    right: 17.5,
    zIndex: 99,
  },
  fileRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 1,
    paddingHorizontal: 5,
    marginLeft: 11,
    paddingVertical: 12,
  },
  sliderItemGradient: {
    // flex: 1,
    borderRadius: 5,
    paddingHorizontal: 0,
    // height: '100%',
    borderColor: '#dbdbdc',
    borderWidth: 1,
    backgroundColor: '#ffffff',

    marginHorizontal: 6,
    marginVertical: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.12,
    shadowRadius: 2.22,
    elevation: 3,
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
    width: '100%',
    position: 'absolute',
    bottom: -45,
  },

  sliderDotContainer: {
    marginHorizontal: 2,
  },

  sliderDot: {
    width: 15,
    height: 4,
    borderRadius: 5,
    backgroundColor: '#0addc1',
  },

  sliderInactiveDot: {
    width: 15,
    height: 4,
    backgroundColor: '#022258',
  },

  sliderImg: {
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
  },

  noImageText: {
    color: '#022258',
    fontSize: sp(16),
    textAlign: 'center',
    alignSelf: 'center',
  },
})
