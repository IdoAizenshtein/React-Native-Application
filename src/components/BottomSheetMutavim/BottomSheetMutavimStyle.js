import { Dimensions, StyleSheet } from 'react-native'
import { fonts } from 'src/styles/vars'
import { sp } from 'src/utils/func'

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
}

export default StyleSheet.create({
  panelContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 999999999,
  },

  panel: {
    height: Screen.height + 280,
    paddingBottom: 20,
    paddingTop: 14,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: 0 },
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
    height: 28,
    color: '#022258',
    fontSize: sp(20),
    fontFamily: fonts.semiBold,
    textAlign: 'center',
  },
  panelSubtitle: {
    fontSize: sp(20),
    fontFamily: fonts.regular,
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
})
