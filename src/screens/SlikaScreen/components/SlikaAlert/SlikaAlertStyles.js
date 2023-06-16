import { StyleSheet } from "react-native";
import { colors, fonts } from "src/styles/vars";
import { sp } from "src/utils/func";

export const ALERT_HEIGHT = 45;

export default StyleSheet.create({
  alertOuter: {},

  alertWrapper: {
    position: "relative",
    backgroundColor: colors.red3,
    height: ALERT_HEIGHT,
    paddingHorizontal: 11,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  alertTextWrapper: {
    flex: 2,
    paddingHorizontal: 10,
    // alignItems: 'center',
    // justifyContent: 'center',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
  },

  alertTextWrapperAbsolute: {
    flex: 1,
    position: "absolute",
  },

  alertText: {
    color: colors.red2,
    fontSize: sp(18),
    fontFamily: fonts.regular,
  },

  alertAdditionalText: {
    color: colors.blue8,
    fontSize: sp(16),
    textAlign: "right",
    fontFamily: fonts.regular,
  },
  underLine: {
    textDecorationLine: "underline",
    textDecorationStyle: "solid",
    textDecorationColor: colors.red2,
  },
  alertBtn: {
    flex: 1,
    width: 66,
    height: 34,
    backgroundColor: colors.blue3,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },

  alertBtnText: {
    fontSize: sp(16),
    color: colors.white,
    textAlign: "center",
  },

  alertDetailsBackgroundWrapper: {
    position: "absolute",
    flex: 1,
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "transparent",
  },

  alertDetailsWrapper: {
    backgroundColor: colors.white,
    maxHeight: 146 * 2,
    width: "100%",
    paddingHorizontal: 6,
    position: "absolute",
    shadowColor: colors.gray11,
    shadowOpacity: 0.01,
    shadowRadius: 0.5,
    shadowOffset: {
      width: 2,
      height: 3,
    },
    elevation: 5,
  },

  alertDetailsContainer: {
    flex: 1,
    flexDirection: "column",
  },

  alertDetailsRow: {
    height: 50,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.gray12,
  },

  alertDetailsText: {
    textAlign: "right",
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
    textAlign: "right",
    marginHorizontal: 5,
  },
});
