import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },

  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    zIndex: 100,
    opacity: 0.8,
  },

  customLoaderWrapper: {
    flex: 1,
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  biziboxAnimation: {
    width: 256,
    height: 256,
  },

  simpleLoaderWrapper: {
    flex: 1,
    width: '100%',
    backgroundColor: 'transparent',
  },
})
