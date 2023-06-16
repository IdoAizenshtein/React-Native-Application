import React, { PureComponent } from 'react'
import {
  Animated,
  Dimensions,
  Image,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
} from 'react-native'
import {
  combineStyles as cs,
  getFormattedValueArray,
  sp,
} from '../../../utils/func'
import { colors, fonts } from '../../../styles/vars'
import styles from '../BankMatchStyles'
import AppTimezone from '../../../utils/appTimezone'
import { Icon } from 'react-native-elements'
import CustomIcon from '../../../components/Icons/Fontello'
import { getDaysBetweenTwoDates } from '../../../utils/date'
import { IS_IOS } from '../../../constants/common'
import { connect } from 'react-redux'

let Window = Dimensions.get('window')

@connect(state => ({
  searchkey: state.searchkey,
}))
export class Card extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      pressed: false,
    }
  }

  static showIconRef (type) {
    if (type === 'CYCLIC_TRANS' ||
      type === 'DIRECTD' ||
      type === 'CCARD_TAZRIM' ||
      type === 'SOLEK_TAZRIM' ||
      type === 'LOAN_TAZRIM'
    ) {
      return true
    }
    return false
  }

  onPressCard = (isNotDisabled, isNotMatchable) => () => {
    const { banktransForMatchData, item, pressItem, openAlert } = this.props
    if (isNotDisabled) {
      pressItem(banktransForMatchData, item)
    }
    if (isNotMatchable) {
      openAlert()
    }
  }

  handleEditOptionModalCb = (type) => () => {
    const { banktransForMatchData, item, handleEditOptionModalCb } = this.props
    handleEditOptionModalCb(item, type, banktransForMatchData)
  }

  handleRemoveRowModalCb = (type) => () => {
    const { handleRemoveRowModalCb, item } = this.props
    handleRemoveRowModalCb(item, type)
  }

  render () {
    const { banktransForMatchData, item, disabled, isFirst } = this.props

    const total = getFormattedValueArray(
      banktransForMatchData ? item.total : item.targetOriginalTotal)
    const numberStyle = cs((banktransForMatchData ? item.hova : item.expence),
      [{ color: colors.green4 }], { color: colors.red2 })
    const isNotDisabled = (!disabled &&
      (banktransForMatchData || (!banktransForMatchData && item.isMatchable)))
    const isNotMatchable = item.isMatchable === false
    return (
      <TouchableHighlight
        onPress={this.onPressCard(isNotDisabled, isNotMatchable)}
        style={[
          {
            marginHorizontal: 7.5,
            borderRadius: 10,
            shadowColor: '#bac6cc',
            shadowOffset: {
              width: 0,
              height: (IS_IOS || isNotDisabled) ? 4 : 0,
            },
            shadowOpacity: (IS_IOS || isNotDisabled) ? 1 : 0,
            shadowRadius: (IS_IOS || isNotDisabled) ? 4 : 0,
            elevation: (IS_IOS || isNotDisabled) ? 4 : 0,
          },
          cs((!banktransForMatchData && isFirst), {},
            { marginRight: Window.width / 2 - 90 }),
          cs((banktransForMatchData && isFirst), {},
            { marginLeft: Window.width / 2 - 90 }),
        ]}
        onHideUnderlay={() => {
          this.setState({ pressed: false })
        }}
        onShowUnderlay={() => {
          this.setState({ pressed: true })
        }}>
        <View>
          {isNotMatchable && (
            <Image
              style={{
                width: 38.5,
                height: 41.5,
                position: 'absolute',
                left: 68.75,
                top: 24.25,
                zIndex: 6,
              }}
              source={require('BiziboxUI/assets/b.png')}/>
          )}
          {banktransForMatchData && (
            <Animated.View
              style={[
                {
                  height: 81,
                  width: 176,
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                },
                cs(isNotDisabled, { opacity: 0.3 }, { opacity: 1 }),
                cs(this.state.pressed && isNotDisabled,
                  {
                    backgroundColor: '#ffffff',
                  },
                  {
                    borderRadius: 10,
                    backgroundColor: '#0f3860',
                  })]}>

              {item.isCyclic && (
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    left: 5,
                    top: 5,
                    zIndex: 2,
                    paddingRight: 10,
                  }}
                  onPress={this.handleEditOptionModalCb(true)}>
                  <Icon
                    name="dots-vertical"
                    type="material-community"
                    size={20}
                    color={this.state.pressed && isNotDisabled
                      ? '#ffffff'
                      : '#26496c'}
                  />
                </TouchableOpacity>
              )}
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  textAlign: 'center',
                  fontSize: sp(25),
                  lineHeight: 30,
                }}>
                <Text style={[
                  numberStyle, cs(this.state.pressed && isNotDisabled,
                    {},
                    {
                      color: '#ffffff',
                    }), {
                    fontFamily: fonts.semiBold,
                    fontSize: sp(25),
                    lineHeight: 30,
                  }]}>{total[0]}</Text>
                <Text style={[
                  styles.fractionalPart, {
                    fontSize: sp(25),
                    lineHeight: 30,
                  }, cs(this.state.pressed && isNotDisabled,
                    {},
                    {
                      color: '#ffffff',
                    })]}>{'.'}{total[1]}</Text>
              </Text>
              <Text style={[
                {
                  textAlign: 'center',
                  fontFamily: fonts.regular,
                  fontSize: sp(18),
                  lineHeight: 20,
                }, cs(this.state.pressed && isNotDisabled,
                  {
                    color: '#26496c',
                  },
                  {
                    color: '#ffffff',
                  })]} numberOfLines={1}>{item.transDescAzonly}</Text>
              <Text
                style={{
                  marginTop: 5,
                  textAlign: 'center',
                }}
                numberOfLines={1}
                ellipsizeMode="tail">
                <Text style={[
                  {
                    fontSize: sp(14),
                    fontFamily: fonts.regular,
                  },
                  cs(this.state.pressed && isNotDisabled,
                    {
                      color: '#26496c',
                    },
                    {
                      color: '#ffffff',
                    })]}>
                  {this.props.searchkey && this.props.searchkey.length > 0 &&
                  this.props.searchkey.find(
                    (it) => it.paymentDescription === item.paymentDesc)
                    ? this.props.searchkey.find(
                      (it) => it.paymentDescription === item.paymentDesc).name
                    : ''} {':'}
                </Text>
                <Text style={[
                  {
                    fontSize: sp(14),
                    color: '#26496c',
                    fontFamily: fonts.semiBold,
                  }, cs(this.state.pressed && isNotDisabled,
                    {
                      color: '#26496c',
                    },
                    {
                      color: '#ffffff',
                    })]}>
                  {AppTimezone.moment(item.transDate).format('DD/MM/YY')}
                </Text>
              </Text>
            </Animated.View>
          )}

          {!banktransForMatchData && (
            <Animated.View
              style={[
                {
                  height: 81,
                  width: 176,
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  borderRadius: 10,
                },
                cs(isNotDisabled, { opacity: 0.3 }, { opacity: 1 }),
                cs(this.state.pressed && isNotDisabled,
                  {
                    backgroundColor: '#ffffff',
                  },
                  {
                    borderRadius: 10,
                    backgroundColor: '#0f3860',
                  })]}>

              <TouchableOpacity
                style={{
                  position: 'absolute',
                  left: 5,
                  top: 5,
                  zIndex: 2,
                  paddingRight: 10,
                }}
                onPress={this.handleEditOptionModalCb(true)}>
                <Icon
                  name="dots-vertical"
                  type="material-community"
                  size={20}
                  color="#000"
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  right: 5,
                  top: 5,
                  zIndex: 2,
                  paddingLeft: 10,
                }}
                onPress={this.handleRemoveRowModalCb(true)}>
                <CustomIcon
                  name="trash"
                  size={20}
                  color={colors.blue}
                />
              </TouchableOpacity>

              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  textAlign: 'center',
                  fontSize: sp(25),
                  lineHeight: item.hovAvar &&
                  AppTimezone.moment(item.targetOriginalDate)
                    .isBefore(AppTimezone.moment()) ? 25 : 30,
                }}>
                <Text style={[
                  numberStyle, cs(this.state.pressed && isNotDisabled,
                    {},
                    {
                      color: '#ffffff',
                    }), {
                    fontFamily: fonts.semiBold,
                    fontSize: sp(25),
                    lineHeight: item.hovAvar &&
                    AppTimezone.moment(item.targetOriginalDate)
                      .isBefore(AppTimezone.moment()) ? 25 : 30,
                  }]}>{total[0]}</Text>
                <Text style={[
                  styles.fractionalPart, {
                    fontSize: sp(25),
                    lineHeight: item.hovAvar &&
                    AppTimezone.moment(item.targetOriginalDate)
                      .isBefore(AppTimezone.moment()) ? 25 : 30,
                  }, cs(this.state.pressed && isNotDisabled,
                    {},
                    {
                      color: '#ffffff',
                    })]}>{'.'}{total[1]}</Text>
              </Text>
              <Text style={[
                {
                  textAlign: 'center',
                  fontFamily: fonts.regular,
                  fontSize: sp(18),
                  lineHeight: item.hovAvar &&
                  AppTimezone.moment(item.targetOriginalDate)
                    .isBefore(AppTimezone.moment()) ? 18 : 20,
                  marginBottom: item.hovAvar &&
                  AppTimezone.moment(item.targetOriginalDate)
                    .isBefore(AppTimezone.moment()) ? 0 : 3,
                }, cs(this.state.pressed && isNotDisabled,
                  {
                    color: '#26496c',
                  },
                  {
                    color: '#ffffff',
                  })]} numberOfLines={1}>{item.targetName}</Text>

              <View
                style={{
                  marginTop: item.hovAvar &&
                  AppTimezone.moment(item.targetOriginalDate)
                    .isBefore(AppTimezone.moment()) ? 1 : 3,
                  flexDirection: 'row-reverse',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}>
                {Card.showIconRef(item.targetTypeName) && (
                  <Icon
                    iconStyle={{
                      transform: [{ scaleX: -1 }],
                      marginHorizontal: 2,
                    }}
                    name="refresh"
                    type="simple-line-icon"
                    size={14}
                    color={this.state.pressed && isNotDisabled
                      ? '#ffffff'
                      : '#26496c'}
                  />
                )}
                <Text style={[
                  {
                    lineHeight: 14,
                    fontSize: sp(14),
                    fontFamily: fonts.regular,
                  },
                  cs(this.state.pressed && isNotDisabled,
                    {
                      color: '#26496c',
                    },
                    {
                      color: '#ffffff',
                    })]}>
                  {this.props.searchkey && this.props.searchkey.length > 0 &&
                  this.props.searchkey.find(
                    (it) => it.paymentDescription === item.paymentDesc)
                    ? this.props.searchkey.find(
                      (it) => it.paymentDescription === item.paymentDesc).name
                    : ''} {':'}
                </Text>
                <Text style={[
                  {
                    lineHeight: 14,
                    fontSize: sp(14),
                    color: '#26496c',
                    fontFamily: fonts.semiBold,
                  }, cs(this.state.pressed && isNotDisabled,
                    {
                      color: '#26496c',
                    },
                    {
                      color: '#ffffff',
                    })]}>
                  {(item.hovAvar && AppTimezone.moment(item.targetOriginalDate)
                    .isBefore(AppTimezone.moment()))
                    ? 'היום'
                    : AppTimezone.moment(item.targetOriginalDate)
                      .format('DD/MM/YY')}
                </Text>
              </View>

              {item.hovAvar && AppTimezone.moment(item.targetOriginalDate)
                .isBefore(AppTimezone.moment()) && (
                <Text
                  style={[
                    {
                      marginTop: 0,
                      textAlign: 'center',
                      fontSize: sp(14),
                      lineHeight: 14,
                      fontFamily: fonts.regular,
                    }, cs(this.state.pressed && isNotDisabled,
                      {
                        color: '#26496c',
                      },
                      {
                        color: '#ffffff',
                      })]}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {'נגרר'} {getDaysBetweenTwoDates(new Date(),
                  new Date(item.targetOriginalDate))} {'ימים'}
                </Text>
              )}

            </Animated.View>
          )}
        </View>
      </TouchableHighlight>
    )
  }
}
