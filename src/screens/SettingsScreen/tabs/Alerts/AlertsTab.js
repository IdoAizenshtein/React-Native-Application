import React, { PureComponent } from 'react'
import { withTranslation } from 'react-i18next'
import {
  Modal,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
import {Picker} from '@react-native-picker/picker';
// import { SafeAreaView } from 'react-native-safe-area-context';
import {
  messagesUserSettingApi,
  messagesUserSettingDefaultApi,
  messagesUserSettingUpdategApi,
  userTimeToSendUpdApi,
} from '../../../../api'
import { combineStyles as cs, sp } from '../../../../utils/func'
import { colors, fonts } from '../../../../styles/vars'
import styles from '../../../../components/EditRowModal/EditRowModalStyles'
import commonStyles from '../../../../styles/styles'
import { Icon } from 'react-native-elements'
import CustomIcon from 'src/components/Icons/Fontello'
import { IS_IOS } from '../../../../constants/common'

@withTranslation()
export default class AlertsTab extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      currentCompany: JSON.parse(JSON.stringify(props.currentCompany)),
      alerts: [],
      messageShow: false,
      inProgress: false,
      min: '5',
      hour: '6',
      pushTimeToSendShow: false,
      refreshing: false,
    }
  }

  componentDidMount () {
    this.getData()
  }

  getData = () => {
    this.setState({
      refreshing: true,
    })
    messagesUserSettingApi.post({
      body: {
        uuid: this.state.currentCompany.companyId,
      },
    })
      .then(alerts => {
        let hour = '6'
        let min = '5'
        if (alerts && alerts.pushTimeToSend) {
          const pushTimeToSend = alerts.pushTimeToSend.toString().split('.')
          hour = pushTimeToSend[0]
          min = pushTimeToSend[1] === undefined ? '0' : pushTimeToSend[1]
        }
        this.setState({
          alerts: alerts.list,
          min: min,
          hour: hour,
          refreshing: false,
        })
      })
  }

  openModalPushTimeToSend = () => {
    this.setState({
      pushTimeToSendShow: true,
    })
  }
  closeModalPushTimeToSend = () => {
    userTimeToSendUpdApi.post({
      body: {
        pushTimeToSend: Number(this.state.hour + '.' + this.state.min),
      },
    })
      .then(alerts => {

      })
    this.setState({
      pushTimeToSendShow: false,
    })
  }

  componentWillUnmount () {

  }

  openRow = (item) => () => {
    this.setState({
      messageShow: item,
    })
  }

  closeModalMessageShow = () => {
    this.setState({
      messageShow: false,
    })
  }

  toggleSwitch = (idx) => (val) => {
    const value = val
    const index = idx
    let messageShow = Object.assign({}, this.state.messageShow)
    messageShow.messages[index].push = value
    this.setState({ messageShow: messageShow })

    messagesUserSettingUpdategApi.post({
      body: {
        companyId: this.state.currentCompany.companyId,
        enabled: true,
        messageTypeId: messageShow.messages[index].messageTypeId,
        push: value,
      },
    })
      .then(alerts => {

      })
  }

  messagesUserSettingDefault = () => {
    messagesUserSettingDefaultApi.post({
      body: {
        uuid: this.state.currentCompany.companyId,
      },
    })
      .then(data => {
        this.getData()
      })
  }
  _onRefresh = () => {
    this.setState({ refreshing: true })
    this.getData()
  }

  render () {
    const { isRtl } = this.props
    const { alerts, min, hour, pushTimeToSendShow, messageShow } = this.state

    return (
      <SafeAreaView style={[
        {
          flex: 1,
          height: '100%',
          position: 'relative',
          backgroundColor: colors.white,
        }]}>

        <ScrollView
          style={[
            styles.accountsContainer, {
              flex: 1,
              position: 'relative',
            }]}
          contentContainerStyle={[
            styles.tableWrapper, {
              backgroundColor: '#ffffff',
              flexGrow: 1,
              paddingTop: 0,
              marginTop: 0,
              paddingBottom: 0,
            }]}
          refreshControl={
            <RefreshControl
              refreshing={this.state.refreshing}
              onRefresh={this._onRefresh}
            />
          }
          extraData={this.state.refreshing}>

          <View style={{
            height: 1,
            width: '100%',
            backgroundColor: colors.gray30,
          }}/>

          <View style={{
            flexDirection: 'column',
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'center',
            alignContent: 'center',
            paddingTop: 17.5,
            paddingBottom: 20,
          }}>
            <View style={{
              flexDirection: 'row-reverse',
            }}>
              <CustomIcon name="exclamation-triangle" size={16}
                          color={colors.red2} style={{
                marginHorizontal: 10,
              }}/>
              <Text style={{
                color: '#022157',
                fontSize: sp(16),
                fontFamily: fonts.semiBold,
              }}>
                {'הודעות קריטיות ישלחו כל יום בשעה'}
              </Text>
            </View>

            <TouchableOpacity onPress={this.openModalPushTimeToSend} style={{
              height: 34,
              width: 97,
              backgroundColor: '#f1f1f1',
              borderRadius: 30,
              flexDirection: 'column',
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
              marginTop: 14,
            }}>
              <Text style={{
                color: '#022157',
                fontSize: sp(20),
                fontFamily: fonts.bold,
              }}>{`${hour === '10' ? hour : '0' + hour}:${min === '0'
                ? '00'
                : '30'}`}</Text>
            </TouchableOpacity>
          </View>

          <View style={{
            height: 1,
            width: '100%',
            backgroundColor: colors.gray30,
          }}/>

          {alerts.length > 0 && alerts.map((item, i) => (
            <View key={item.messageTypeCatId}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row-reverse',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  height: 65,
                  paddingHorizontal: 15,
                }}
                onPress={this.openRow(item)}>
                <Text style={{
                  color: '#0f3861',
                  fontSize: sp(18),
                  fontFamily: fonts.bold,
                }}>{item.messageTypeCatName}</Text>

                <Icon name="chevron-left" size={26} color={'#0f3861'}/>
              </TouchableOpacity>
              <View style={{
                height: 1,
                flex: 1,
                backgroundColor: colors.gray30,
              }}/>
            </View>
          ))}
          <TouchableOpacity onPress={this.messagesUserSettingDefault}
                            style={{
                              flexDirection: 'row',
                              marginTop: 26,
                              height: 65,
                              paddingHorizontal: 15,
                            }}>
            <Text style={{
              color: '#45b6eb',
              fontSize: sp(16),
              fontFamily: fonts.regular,
              textDecorationLine: 'underline',
              textDecorationStyle: 'solid',
              textDecorationColor: '#45b6eb',
            }}>{'שחזור ברירת מחדל'}</Text>
            <Icon
              type="material-community"
              name="reload"
              size={22}
              color={'#45b6eb'}
            />
          </TouchableOpacity>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={false}
          visible={pushTimeToSendShow}
          onRequestClose={() => {
            // console.log('Modal has been closed.')
          }}>
          <SafeAreaView style={{
            flex: 1,
            marginTop: 0,
            paddingTop: 0,
            position: 'relative',
          }}>
            <View style={{
              flex: 1,
              alignItems: 'center',
            }}>
              <View style={{
                height: 60,
                backgroundColor: '#002059',
                width: '100%',
                paddingTop: 0,
                paddingLeft: 10,
                paddingRight: 10,
              }}>
                <View style={cs(
                  !isRtl,
                  [
                    styles.container, {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }],
                  commonStyles.rowReverse,
                )}>
                  <View/>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: sp(20),
                      color: '#ffffff',
                      fontFamily: fonts.semiBold,
                    }}>
                      {'בחירת שעה'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity onPress={this.closeModalPushTimeToSend}>
                      <View style={{
                        marginRight: 'auto',
                      }}>
                        <Icon name="chevron-right" size={24}
                              color={colors.white}/>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={{
                width: '100%',
                height: '100%',
                marginTop: 10,
                marginBottom: 10,
                paddingLeft: 0,
                paddingRight: 0,
                flex: 1,
              }}>
                <View style={{
                  flexDirection: 'row',
                  alignSelf: 'center',
                  justifyContent: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  zIndex: 9,
                  elevation: 9,
                  marginTop: IS_IOS ? 0 : 83,
                }}>
                  <View style={{}}>
                    <Picker
                      mode={'dropdown'}
                      selectedValue={this.state.hour}
                      style={{
                        height: 50,
                        width: 100,
                      }}
                      onValueChange={(itemValue, itemIndex) => {
                        this.setState({ hour: itemValue })
                        if (itemValue === '6') {
                          this.setState({ min: '5' })
                        }
                      }}>
                      <Picker.Item label="06" value="6"/>
                      <Picker.Item label="07" value="7"/>
                      <Picker.Item label="08" value="8"/>
                      <Picker.Item label="09" value="9"/>
                      <Picker.Item label="10" value="10"/>
                    </Picker>
                  </View>
                  <View style={{}}>
                    <Picker
                      mode={'dropdown'}
                      selectedValue={this.state.min}
                      style={{
                        height: 50,
                        width: 100,
                      }}
                      onValueChange={(itemValue, itemIndex) => {
                        if (itemValue === '0' && this.state.hour === '6') {
                          this.setState({ min: '5' })
                        } else {
                          this.setState({ min: itemValue })
                        }
                      }}>
                      <Picker.Item label="00" value="0"/>
                      <Picker.Item label="30" value="5"/>
                    </Picker>
                  </View>
                </View>
                <View style={{
                  height: 44,
                  position: 'absolute',
                  right: 0,
                  left: 0,
                  top: 86,
                  zIndex: 2,
                  borderTopColor: '#bbbbbb',
                  borderTopWidth: 1,
                  borderBottomColor: '#bbbbbb',
                  borderBottomWidth: 1,
                  width: '100%',
                  flex: 1,
                  elevation: 2,
                }}>
                  <Text style={{
                    textAlign: 'right',
                    color: '#000000',
                    fontSize: sp(22),
                    paddingRight: 50,
                    lineHeight: 40,
                  }}>AM</Text>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

        <Modal
          animationType="slide"
          transparent={false}
          visible={!!(messageShow)}
          onRequestClose={() => {
            // console.log('Modal has been closed.')
          }}>
          <SafeAreaView style={{
            flex: 1,
            marginTop: 0,
            paddingTop: 0,
            position: 'relative',
          }}>
            <View style={{
              flex: 1,
              alignItems: 'center',
            }}>
              <View style={{
                height: 60,
                backgroundColor: '#002059',
                width: '100%',
                paddingTop: 0,
                paddingLeft: 10,
                paddingRight: 10,
              }}>
                <View style={cs(
                  !isRtl,
                  [
                    styles.container, {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }],
                  commonStyles.rowReverse,
                )}>
                  <View/>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: sp(20),
                      color: '#ffffff',
                      fontFamily: fonts.semiBold,
                    }}>
                      {messageShow.messageTypeCatName}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity onPress={this.closeModalMessageShow}>
                      <View style={{
                        marginRight: 'auto',
                      }}>
                        <Icon name="chevron-right" size={24}
                              color={colors.white}/>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={{
                width: '100%',
                height: '100%',
                marginTop: 10,
                marginBottom: 10,
                paddingLeft: 0,
                paddingRight: 0,
                flex: 1,
              }}>
                {messageShow && messageShow.messages && (
                  <ScrollView
                    style={[
                      styles.accountsContainer, {
                        flex: 1,
                        position: 'relative',
                      }]}
                    contentContainerStyle={[
                      styles.tableWrapper, {
                        backgroundColor: '#ffffff',
                        flexGrow: 1,
                        paddingTop: 0,
                        marginTop: 0,
                        paddingBottom: 0,
                      }]}>
                    {messageShow.messages.map((item, i) => (
                      <View key={item.messageTypeId}
                            style={{
                              flexDirection: 'row-reverse',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              alignContent: 'center',
                              height: 50,
                              paddingHorizontal: 15,
                              flexWrap: 'wrap',
                            }}>

                        <Text style={{
                          color: '#0f3861',
                          fontSize: sp(16),
                          textAlign: 'right',
                          flex: 80,
                          fontFamily: fonts.regular,
                        }}>{item.messageTypeName
                          ? item.messageTypeName.trim()
                          : ''}</Text>

                        <View style={{
                          flex: 20,
                        }}>
                          <Switch value={item.push}
                                  style={{
                                    transform: [
                                      { scaleX: 0.8 },
                                      { scaleY: 0.8 }],
                                  }}
                                  onTintColor={'#022258'}
                                  thumbTintColor={'#f5f5f5'}
                                  ios_backgroundColor={'#babbbb'}
                                  trackColor={'#022258'}
                                  thumbColor={'#f5f5f5'}
                                  tintColor={'#babbbb'}
                                  onValueChange={this.toggleSwitch(i)}
                          />
                        </View>

                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            </View>
          </SafeAreaView>
        </Modal>

      </SafeAreaView>
    )
  }
}
