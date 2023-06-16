import React, { PureComponent } from 'react'
import {
  Animated,
  Easing,
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
import { getDaysBetweenTwoDates } from '../../../utils/date'
import { Card } from './Card'
import { IS_IOS } from '../../../constants/common'
import { connect } from 'react-redux'

@connect(state => ({
  searchkey: state.searchkey,
}))
export class CardMatch extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      isShake: props.isShake,
      animatedValue: new Animated.Value(0),
    }
  }

  animate = () => {
    if (this.state.isShake) {
      this.state.animatedValue.setValue(0)
      Animated.timing(
        this.state.animatedValue,
        {
          toValue: 1,
          duration: 1000,
          easing: Easing.easeInEaseOut,
          useNativeDriver: true,
        },
      ).start(() => this.animate())
    }
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (nextProps.isShake !== this.props.isShake) {
      this.setState({
        isShake: nextProps.isShake,
      })
      if (nextProps.isShake) {
        setTimeout(() => {
          this.animate()
        }, 200)
      }
    }
  }

  shakeAll = (type, con) => () => {
    const { shakeAll, removeFromMatches, banktransForMatchData, item } = this.props
    shakeAll(type)
    if (con) {
      removeFromMatches(item, banktransForMatchData)
    }
  }

  render () {
    const { banktransForMatchData, item, shakeAll } = this.props
    const { isShake, animatedValue } = this.state
    const total = getFormattedValueArray(
      banktransForMatchData ? item.total : item.targetOriginalTotal)
    const numberStyle = cs((banktransForMatchData ? item.hova : item.expence),
      [{ color: colors.green4 }], { color: colors.red2 })

    const wiggle = animatedValue.interpolate({
      inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1],
      outputRange: ['0deg', '2deg', '-2deg', '3deg', '-1deg', '0deg'],
    })

    return (
      <TouchableHighlight
        onLongPress={() => {
          shakeAll(true)
        }}
        onPress={this.shakeAll(false)}
        style={[
          {
            marginVertical: 16,
            borderRadius: 10,
            marginHorizontal: IS_IOS ? 0 : 7.5,
          }]}>
        <View>
          {banktransForMatchData && (
            <Animated.View
              style={[
                {
                  height: 75,
                  width: 176,
                  borderRadius: 10,
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  transform: [{ rotate: wiggle }],
                  backgroundColor: '#0f3860',
                }]}>
              {isShake && (
                <TouchableOpacity
                  style={{
                    padding: 10,
                    position: 'absolute',
                    right: IS_IOS ? -14 : -12,
                    top: IS_IOS ? -15 : -13,
                    zIndex: 2,
                  }}
                  onPress={this.shakeAll(false, true)}>
                  <Icon
                    name="close-circle"
                    type="material-community"
                    size={22}
                    color="#ddd"
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
                  numberStyle, {
                    color: '#ffffff',
                    fontFamily: fonts.semiBold,
                    fontSize: sp(25),
                    lineHeight: 30,
                  }]}>{total[0]}</Text>
                <Text style={[
                  styles.fractionalPart, {
                    fontSize: sp(25),
                    lineHeight: 30,
                    color: '#ffffff',
                  }]}>.{total[1]}</Text>
              </Text>
              <Text style={[
                {
                  textAlign: 'center',
                  fontFamily: fonts.regular,
                  fontSize: sp(18),
                  lineHeight: 20,
                  color: '#ffffff',
                }]} numberOfLines={1}>{item.transDescAzonly}</Text>
              <Text
                style={{
                  marginTop: 0,
                  textAlign: 'center',
                }}
                numberOfLines={1}
                ellipsizeMode="tail">
                <Text style={[
                  {
                    fontSize: sp(14),
                    fontFamily: fonts.regular,
                    color: '#ffffff',
                  }]}>
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
                    color: '#ffffff',
                    fontFamily: fonts.semiBold,
                  }]}>
                  {AppTimezone.moment(item.transDate).format('DD/MM/YY')}
                </Text>
              </Text>
            </Animated.View>
          )}

          {!banktransForMatchData && (
            <Animated.View
              style={[
                {
                  height: 75,
                  width: 176,
                  borderRadius: 10,
                  paddingVertical: 5,
                  paddingHorizontal: 8,
                  transform: [{ rotate: wiggle }],
                  backgroundColor: '#0f3860',
                }]}>
              {isShake && (
                <TouchableOpacity
                  style={{
                    padding: 10,
                    position: 'absolute',
                    right: IS_IOS ? -14 : -12,
                    top: IS_IOS ? -15 : -13,
                    zIndex: 2,
                  }}
                  onPress={this.shakeAll(false, true)}>
                  <Icon
                    name="close-circle"
                    type="material-community"
                    size={22}
                    color="#ddd"
                  />
                </TouchableOpacity>
              )}
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
                  numberStyle, {
                    color: '#ffffff',
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
                    color: '#ffffff',
                  }]}>.{total[1]}</Text>
              </Text>
              <Text style={[
                {
                  textAlign: 'center',
                  fontFamily: fonts.regular,
                  fontSize: sp(18),
                  lineHeight: item.hovAvar &&
                  AppTimezone.moment(item.targetOriginalDate)
                    .isBefore(AppTimezone.moment()) ? 17 : 20,
                  marginBottom: item.hovAvar &&
                  AppTimezone.moment(item.targetOriginalDate)
                    .isBefore(AppTimezone.moment()) ? 0 : 2,
                  color: '#ffffff',
                }]} numberOfLines={1}>{item.targetName}</Text>

              <View
                style={{
                  marginTop: 0,
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
                    color={'#ffffff'}
                  />
                )}
                <Text style={[
                  {
                    lineHeight: item.hovAvar &&
                    AppTimezone.moment(item.targetOriginalDate)
                      .isBefore(AppTimezone.moment()) ? 13 : 14,
                    fontSize: sp(14),
                    fontFamily: fonts.regular,
                    color: '#ffffff',
                  }]}>
                  {this.props.searchkey && this.props.searchkey.length > 0 &&
                  this.props.searchkey.find(
                    (it) => it.paymentDescription === item.paymentDesc)
                    ? this.props.searchkey.find(
                      (it) => it.paymentDescription === item.paymentDesc).name
                    : ''} {':'}
                </Text>
                <Text style={[
                  {
                    lineHeight: item.hovAvar &&
                    AppTimezone.moment(item.targetOriginalDate)
                      .isBefore(AppTimezone.moment()) ? 13 : 14,
                    fontSize: sp(14),
                    fontFamily: fonts.semiBold,
                    color: '#ffffff',
                  }]}>
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
                      lineHeight: item.hovAvar &&
                      AppTimezone.moment(item.targetOriginalDate)
                        .isBefore(AppTimezone.moment()) ? 13 : 14,
                      fontFamily: fonts.regular,
                      color: '#ffffff',
                    }]}
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
