import { StyleSheet } from 'react-native'
import { colors, fonts } from '../../styles/vars'
import { sp } from 'src/utils/func'

export default StyleSheet.create({
  container: {
    paddingRight: 12,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },

  containerRtl: {
    paddingRight: 0,
    paddingLeft: 12,
  },

  titleContainer: {
    borderRadius: 100,
    paddingRight: 18,
    marginLeft: 10,
  },

  titleContainerRtl: {
    borderRadius: 100,
    paddingRight: 0,
    paddingLeft: 18,
    marginLeft: 0,
    marginRight: 10,
  },

  active: {
    backgroundColor: colors.green3,
  },

  titleWrapper: {
    height: 57,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 0,
    paddingLeft: 12,
  },

  titleWrapperRtl: {
    flexDirection: 'row-reverse',
  },

  titleItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  titleItemRtl: {
    flexDirection: 'row-reverse',
  },

  title: {
    fontSize: sp(18),
    padding: 10,
    color: colors.blue4,
    fontFamily: fonts.semiBold,
  },

  titleActive: {
    color: colors.white,
    fontFamily: fonts.bold,
  },

  body: {
    paddingLeft: 55,
    flexDirection: 'column',
  },

  bodyRtl: {
    paddingRight: 55,
    paddingLeft: 0,
  },

  childWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },

  childWrapperRtl: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },

  childTitle: {
    fontSize: sp(18),
    marginRight: 10,
    color: colors.blue5,
  },

  divider: {
    marginRight: 30,
    backgroundColor: colors.gray3,
  },

  dividerRtl: {
    marginRight: 0,
    marginLeft: 30,
  },
})
