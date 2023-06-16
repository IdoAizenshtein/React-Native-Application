import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { IS_IOS } from '../../constants/common'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: IS_IOS ? 30 : 30,
    marginBottom: 100,
    position: 'relative',
  },

  headerWrapper: {
    paddingBottom: 20,
    elevation: 2,
  },

  userName: {
    fontSize: sp(15),
    marginLeft: 27,
    color: colors.blue5,
    fontFamily: fonts.light,
  },

  userNameRtl: {
    marginLeft: 0,
    marginRight: 47,
    textAlign: 'right',
  },

  picker: {
    position: 'absolute',
    top: -7,
    right: 0,
    left: 0,
    bottom: 0,
    width: 1000,
    color: 'transparent',
  },

  pickerWrapper: {
    position: 'relative',
    alignItems: 'center',
  },

  pickerTitle: {
    color: colors.blue3,
    fontFamily: fonts.semiBold,
    fontSize: sp(18),
    width:'80%',
    textAlign:'center',
  },

  pickerTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  pickerTitleWrapperRtl: {
    flexDirection: 'row-reverse',
  },

  closeDrawer: {
    position: 'absolute',
    top: IS_IOS ? 45 : 20,
    left: 20,
  },

  closeDrawerRtl: {
    left: 'auto',
    right: 20,
    elevation: 3,
  },

  avatar: {
    width: 52,
    height: 52,
    borderRadius: 25,
  },

  menuItemWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 18,
  },

  footerWrapper: {
    position: 'absolute',
    bottom: -100,
    left: 0,
    right: 0,
    width: '100%',
    flex: 1,
    paddingBottom: 20,
    marginLeft: 23,
  },

  footerWrapperRtl: {},

  footerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  footerInnerRtl: {
    flexDirection: 'row-reverse',
  },

  footerMenuItem: {
    paddingLeft: 20,
    paddingRight: 20,
    marginBottom: 10,
    paddingTop: 0,
    paddingBottom: 0,
  },

  divider: {
    marginRight: 23,
    marginBottom: 18,
    backgroundColor: colors.gray4,
  },

  dividerRtl: {},

  footerMenuWrapper: {
    paddingLeft: 25,
  },

  footerMenuWrapperRtl: {
    paddingLeft: 0,
    paddingRight: 25,
  },

  logoutBtnText: {
    fontFamily: fonts.bold,
    color: colors.blue5,
    fontSize: sp(18),
    marginLeft: 10,
  },

  logoutBtnTextRtl: {
    marginLeft: 0,
    marginRight: 10,
  },





  // centeredView: {
  //   flex: 1,
  //   justifyContent: "center",
  //   alignItems: "center",
  //   marginTop: 22,
  //   backgroundColor:'red'
  // },
  // modalView: {
  //   margin: 20,
  //   backgroundColor: "white",
  //   borderRadius: 20,
  //   padding: 35,
  //   alignItems: "center",
  //   shadowColor: "#000",
  //   shadowOffset: {
  //     width: 0,
  //     height: 2
  //   },
  //   shadowOpacity: 0.25,
  //   shadowRadius: 4,
  //   elevation: 5
  // },
  // button: {
  //   borderRadius: 20,
  //   padding: 10,
  //   elevation: 2
  // },
  // buttonOpen: {
  //   backgroundColor: "#F194FF",
  // },
  // buttonClose: {
  //   backgroundColor: "#2196F3",
  // },
  // textStyle: {
  //   color: "white",
  //   fontWeight: "bold",
  //   textAlign: "center"
  // },
  // modalText: {
  //   marginBottom: 15,
  //   textAlign: "center"
  // }
})
