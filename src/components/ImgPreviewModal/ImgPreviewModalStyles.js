import { StyleSheet } from 'react-native'

export default StyleSheet.create({
  closeBtn: {
    position: 'absolute',
    top: 15,
    right: 20,
    backgroundColor: 'transparent',
    elevation: 3,
    zIndex: 3,
  },

  img: {
    transform: [{ rotate: '90deg' }],
    alignSelf: 'flex-end',
  },
})
