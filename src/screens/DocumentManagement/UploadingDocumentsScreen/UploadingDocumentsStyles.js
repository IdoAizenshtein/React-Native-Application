import { StyleSheet } from 'react-native'

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
})
