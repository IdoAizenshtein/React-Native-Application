import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../../styles/vars'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  notificationWrapper: {
    flex: 1,
    alignItems: 'center',
  },
  notificationIcon: {
    width: 45,
    height: 45,
    marginBottom: 10,
  },
  notificationText: {
    fontSize: sp(16),
    color: colors.blue7,
    fontFamily: fonts.semiBold,
  },
  notificationBtnWrapper: {
    backgroundColor: '#173048ff',
    borderRadius: 20,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 15,
  },
  notificationBtnText: {
    color: colors.white,
  },
})
