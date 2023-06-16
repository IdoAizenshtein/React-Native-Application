import { withTranslation } from 'react-i18next'
import React, { Fragment, PureComponent } from 'react'
import { Animated, Image, Text, TouchableOpacity, View } from 'react-native'
import { colors, fonts } from '../../../styles/vars'
import Swipeout from 'react-native-swipeout'
import AppTimezone from '../../../utils/appTimezone'
import { Icon } from 'react-native-elements'
import { getBankTransIcon, sp } from '../../../utils/func'
import CustomIcon from '../../../components/Icons/Fontello'
import { IS_IOS } from '../../../constants/common'
import { IS_LIGHT } from '../../../constants/config'

@withTranslation()
export default class Message extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      animBg: new Animated.Value(IS_IOS ? 0 : 0),
    }

    if (props.isActive) {
      setTimeout(() => {
        Animated.timing(this.state.animBg, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: true,
        }).start()
      }, 10)
    }
  }

  get renderText () {
    const {
      data,
    } = this.props

    const messageTemplate = data.messageTemplate
    const linkedText = data.linked_text
    if (!linkedText ||
      (linkedText && data.linked_action && data.linked_action ===
        'getTransHistory' && IS_LIGHT.light)) {
      return (<Text style={{
        textAlign: 'right',
        color: '#022258',
        fontSize: sp(15),
        fontFamily: fonts.regular,
      }}>
        {messageTemplate}
      </Text>)
    } else {
      const linkedTextSplit = messageTemplate.split(linkedText)
      return (
        <Text style={{
          textAlign: 'right',
          color: '#022258',
          fontSize: sp(15),
          fontFamily: fonts.regular,
        }}>
          <Text style={{}}>
            {linkedTextSplit[0]}
          </Text>
          {data && data.linked_action && data.linked_action ===
          'getTransHistoryForLite' ? (
            <Text>
              {linkedText}
            </Text>
          ) : (
            <Text style={{ color: '#037dba' }} onPress={this.onPressLinked}>
              {linkedText}
            </Text>
          )}
          {linkedTextSplit[1] && linkedTextSplit[1].length > 0 && (
            <Text style={{}}>
              {linkedTextSplit[1]}
            </Text>
          )}
        </Text>
      )
    }
  }

  UNSAFE_componentWillReceiveProps ({ screenSwitchState }) {

  }

  onPressLinked = () => {
    const {
      data,
      updateMessages,
      doAction,
    } = this.props
    updateMessages({
      messageIds: [data.messageId],
      indRead: true,
    })
    doAction(data)
  }

  onPressPeula = (type) => () => {
    const {
      data,
      updateMessages,
      doAction,
    } = this.props
    const peula = data[type]
    updateMessages({
      messageIds: [data.messageId],
      indRead: true,
    })
    doAction(data, peula)
  }

  update = (type) => {
    const {
      data,
      updateMessages,
    } = this.props
    const obj = {
      messageIds: [data.messageId],
    }
    if (type === 'read') {
      obj.indRead = !data.indRead
    } else if (type === 'hide') {
      obj.indHide = true
    }

    updateMessages(obj)
  }

  render () {
    const {
      t,
      data,
      isRtl,
      isActive,
    } = this.props
    const color = this.state.animBg.interpolate({
      inputRange: [0, 1],
      outputRange: ['#939292', '#ffffff'],
    })
    const left = [
      {
        backgroundColor: '#022258',
        component: (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {!data.indRead && (<Image style={{
              width: 20,
              height: 20,
            }}
                                      source={require(
                                        'BiziboxUI/assets/read.png')}/>)}
            {data.indRead && (<Image style={{
              width: 20,
              height: 20,
            }}
                                     source={require(
                                       'BiziboxUI/assets/unread.png')}/>)}
            <Text style={{
              paddingTop: 2,
              color: '#fff',
              fontSize: sp(14),
              fontFamily: fonts.regular,
            }}>{!data.indRead ? 'נקרא' : 'לא נקרא'}</Text>
          </View>
        ),
        onPress: () => {
          this.update('read')
        },
      },
      {
        backgroundColor: '#939292',
        component: (
          <View style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            <Icon size={24} color="#fff" name="close"/>
            <Text style={{
              color: '#fff',
              fontSize: sp(14),
              fontFamily: fonts.regular,
              paddingTop: 2,
            }}>הסתרה</Text>
          </View>
        ),
        onPress: () => {
          this.update('hide')
        },
      },
    ]
    const right = null
    return (
      <Fragment>
        <View style={{
          borderRightColor: data.indAlert === 'bizibox' ? (data.indRead
            ? '#ffffff'
            : '#edf4f8') : (data.indAlert === 'red' ? '#cd1010' : '#f0c100'),
          borderRightWidth: 5,
        }}>
          <Swipeout
            backgroundColor={(data.indRead ? '#ffffff' : '#edf4f8')}
            autoClose
            disabled={false}
            right={(isRtl) ? right : left}
            left={(isRtl) ? left : right}>
            <Animated.View style={{
              backgroundColor: isActive ? color : 'transparent',
              flexDirection: 'row-reverse',
              paddingVertical: 15,
            }}>
              <View style={{ flex: 1 }}/>
              <View style={{
                flex: 10,
                flexDirection: 'column',
                alignSelf: 'flex-start',
                justifyContent: 'center',
                alignItems: 'center',
                alignContent: 'center',
              }}>
                {data.iconName === 'system_alert' && (
                  <Image style={{
                    width: 22,
                    height: 22,
                    marginHorizontal: 2,
                  }}
                         source={require('BiziboxUI/assets/b.png')}/>
                )}
                {data.iconName && data.iconName !== 'system_alert' && (
                  <CustomIcon
                    name={getBankTransIcon(data.iconName.replace(/_/g, ''))}
                    size={22}
                    color={colors.blue8}
                  />
                )}
              </View>
              <View style={{ flex: 2 }}/>
              <View style={{
                flex: 85,
                alignContent: 'flex-start',
                flexDirection: 'column',
                justifyContent: 'flex-start',
              }}>
                <View style={{
                  flexDirection: 'row-reverse',
                }}>
                  <Text style={{
                    textAlign: 'right',
                    color: '#022258',
                    fontSize: sp(15),
                    fontFamily: fonts.semiBold,
                  }}>
                    {AppTimezone.moment(data.dateCreated).format('DD/MM/YY')}
                  </Text>
                  <View style={{
                    paddingHorizontal: 2,
                  }}/>
                  <Text numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          textAlign: 'right',
                          color: '#022258',
                          fontSize: sp(15),
                          fontFamily: fonts.light,
                        }}>
                    {(AppTimezone.moment()
                        .diff(AppTimezone.moment(data.dateCreated), 'days') ===
                      -1)
                      ? (t('sumsTitles:today'))
                      : (
                        (AppTimezone.moment()
                            .diff(AppTimezone.moment(data.dateCreated), 'days') >
                          0)
                          ? t('bankAccount:lastUpdatedXDaysAgo', {
                            days: AppTimezone.moment()
                              .diff(AppTimezone.moment(data.dateCreated), 'days'),
                          })
                          : (t('bankAccount:lastUpdatedYesterday')))}
                  </Text>
                </View>
                <View>
                  {this.renderText}
                </View>
                {(data.peulaName1 || data.peulaName2) && (<View style={{
                  alignItems: 'flex-start',
                  flexDirection: 'row-reverse',
                  marginTop: 5,
                }}>
                  {data.peulaName1 && (
                    <TouchableOpacity
                      onPress={this.onPressPeula('peula1')}>
                      <Text
                        style={{
                          color: '#037dba',
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>
                        {data.peulaName1}
                      </Text></TouchableOpacity>
                  )}
                  {data.peulaName2 && (
                    <View style={{
                      paddingHorizontal: 10,
                    }}/>)}
                  {data.peulaName2 && (
                    <TouchableOpacity
                      onPress={this.onPressPeula('peula2')}>
                      <Text style={{
                        color: '#037dba',
                        fontSize: sp(15),
                        fontFamily: fonts.regular,
                      }}>
                        {data.peulaName2}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>)}
              </View>
              <View style={{ flex: 2 }}/>
            </Animated.View>
          </Swipeout>
        </View>
      </Fragment>
    )
  }
}
