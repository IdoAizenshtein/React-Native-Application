import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import React, { PureComponent } from 'react'
import {
  Animated,
  BackHandler,
  Dimensions,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../../styles/vars'
import { goTo, goToBack, sp } from '../../utils/func'
import Loader from 'src/components/Loader/Loader'
import { customerServiceUpgradeApi, startBusinessTrialApi } from 'src/api'
import { getCompanies, selectCompany } from '../../redux/actions/company'
import { getAccounts } from '../../redux/actions/account'
import { OVERVIEW } from '../../constants/navigation'
import { IS_IOS } from '../../constants/common'
import styles from './PackagesStyles'
import Carousel, { Pagination } from 'react-native-snap-carousel'
import { Icon } from 'react-native-elements'
import { setOpenedBottomSheet } from '../../redux/actions/user'

const SLIDER_1_FIRST_ITEM = 0
export const ENTRIES1 = [
  {
    title: 'לעסקים bizibox',
    sum: 174,
    color: '#f3cb37',
    data: [
      {
        name: 'ריכוז נתונים פיננסים',
        active: null,
      },
      {
        name: 'ניתוח נתוני חשבונות בנק',
        active: null,
      },
      {
        name: 'ניתוח נתוני כרטיסי אשראי וסליקה',
        active: null,
      },
      {
        name: 'ניתוח צ\'קים',
        active: null,
      },
      {
        name: 'שמירת היסטוריית נתונים',
        active: null,
      },
      {
        name: 'הודעות והתראות',
        active: null,
      },
      {
        name: 'ניהול והתראות תקציב',
        active: null,
      },
      {
        name: 'מייל יומי',
        active: null,
      },
      {
        name: 'אפליקציה סלולרית',
        active: null,
      },
      {
        name: 'דו״ח תזרים מזומנים',
        active: true,
      },
      {
        name: 'התאמות אוטומטיות',
        active: true,
      },
      {
        name: 'ניהול תנועות קבועות',
        active: true,
      },
      {
        name: 'מחשבון המלצה לתשלום',
        active: true,
      },
      {
        name: 'מייל ריכוז חיובי אשראי שבועי',
        active: true,
      },
      {
        name: ' מוקד תמיכה ושירות',
        active: true,
      },
    ],
  },
  {
    color: '#d2d2d2',
    title: 'bizibox',
    sum: 19,
    data: [
      {
        name: 'ריכוז נתונים פיננסים',
        active: null,
      },
      {
        name: 'ניתוח נתוני חשבונות בנק',
        active: null,
      },
      {
        name: 'ניתוח נתוני כרטיסי אשראי וסליקה',
        active: null,
      },
      {
        name: 'ניתוח צ\'קים',
        active: null,
      },
      {
        name: 'שמירת היסטוריית נתונים',
        active: null,
      },
      {
        name: 'הודעות והתראות',
        active: null,
      },
      {
        name: 'ניהול והתראות תקציב',
        active: null,
      },
      {
        name: 'מייל יומי',
        active: null,
      },
      {
        name: 'אפליקציה סלולרית',
        active: null,
      },
      {
        name: 'דו״ח תזרים מזומנים',
        active: false,
      },
      {
        name: 'התאמות אוטומטיות',
        active: false,
      },
      {
        name: 'ניהול תנועות קבועות',
        active: false,
      },
      {
        name: 'מחשבון המלצה לתשלום',
        active: false,
      },
      {
        name: 'מייל ריכוז חיובי אשראי שבועי',
        active: false,
      },
      {
        name: ' מוקד תמיכה ושירות',
        active: false,
      },
    ],
  },
]
const { width: viewportWidth } = Dimensions.get('window')

function wp (percentage) {
  const value = (percentage * viewportWidth) / 100
  return Math.round(value)
}

const slideWidth = wp(90)
const itemHorizontalMargin = wp(2)

export const sliderWidth = viewportWidth
export const itemWidth = slideWidth + itemHorizontalMargin * 2

@connect(state => ({
  currentCompanyId: state.currentCompanyId,
  isRtl: state.isRtl,
  user: state.user,
  companies: state.companies,
}))
@withTranslation()
export default class PackagesScreen extends PureComponent {
  constructor (props) {
    super(props)

    this.state = {
      showAlert: false,
      isReady: false,
      inProgress: true,
      isLayoutComplete: false,
      slider1ActiveSlide: SLIDER_1_FIRST_ITEM,
      fadeAnim: new Animated.Value(1),
      fadeAnimSuc: new Animated.Value(1),
      showAlertSuc: false,
    }
  }

  get isLoader () {
    const { isReady, inProgress } = this.state
    return !isReady || inProgress
  }

  handleBackPress = () => {
    this.props.dispatch(setOpenedBottomSheet(false))

    goToBack(this.props.navigation)
    return true
  }

  _onRefresh = () => {
  }

  componentDidMount () {
    this.setState({
      isLayoutComplete: true,
      inProgress: false,
    })
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  startBusinessTrial = () => {
    this.setState({ inProgress: true })
    const { dispatch, navigation } = this.props
    return startBusinessTrialApi.post({
      body: {
        'uuid': this.props.currentCompanyId,
      },
    })
      .then(() => {
        Promise.all([
          dispatch(getCompanies()),
        ])
          .then(() => dispatch(selectCompany()))
          .then(() => dispatch(getAccounts()))
          .then(() => goTo(navigation, OVERVIEW, {
            openPopupAfterUpgrade: true,
          }))
          .catch(() => {

          })
      })
      .catch(() => {

      })
  }

  openAlert = () => {
    this.setState({ showAlert: true })

    Animated.timing(
      this.state.fadeAnim,
      {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      },
    ).start()
  }

  animatedTime = () => {
    const {
      fadeAnim,
    } = this.state
    Animated.timing(
      fadeAnim,
      {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      },
    ).start(() => {
      this.setState({ showAlert: false })
    })
  }

  customerServiceUpgrade = () => {
    this.openAlertSuc()
    return customerServiceUpgradeApi.post({
      body: {
        'uuid': this.props.currentCompanyId,
      },
    })
      .then(() => {

      })
      .catch(() => {

      })
  }

  openAlertSuc = () => {
    this.setState({ showAlertSuc: true })

    Animated.timing(
      this.state.fadeAnimSuc,
      {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      },
    ).start()
  }

  animatedTimeSuc = () => {
    const {
      fadeAnimSuc,
    } = this.state
    Animated.timing(
      fadeAnimSuc,
      {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      },
    ).start(() => {
      this.setState({ showAlertSuc: false })
    })
  }

  _renderItem = ({ item, index }) => {
    const {
      isRtl,
    } = this.props
    return (
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: item.color,
        marginHorizontal: 6,
        paddingHorizontal: 22.5,
        paddingTop: 23,
        paddingBottom: 16,
        borderRadius: 2,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
      }}>
        <Text style={{
          color: '#022258',
          fontFamily: fonts.bold,
          fontSize: sp(22.5),
          textAlign: 'center',
          marginBottom: 5,
        }}>{item.title}</Text>
        <View style={{
          flexDirection: (isRtl) ? 'row-reverse' : 'row',
          alignSelf: 'center',
          height: 50,
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          alignContent: 'flex-end',
        }}>
          <Text style={{
            alignSelf: 'center',
            color: '#022258',
            fontFamily: fonts.bold,
            fontSize: sp(IS_IOS ? 50 : 53),
            textAlign: 'right',
          }}>
            <Text style={{
              fontSize: sp(28),
            }}>{'₪'}</Text>
            {item.sum}
          </Text>

          {index === 0 && (
            <View style={{
              height: IS_IOS ? 39 : 44,
              alignSelf: 'flex-end',
              paddingRight: 15,
            }}>
              <Text style={{
                color: '#022258',
                fontFamily: fonts.bold,
                fontSize: sp(20.5),
                textAlign: 'left',
              }}>{'לחודש'}</Text>
              <Text style={{
                color: '#022258',
                fontFamily: fonts.bold,
                fontSize: sp(16),
                textAlign: 'left',
              }}>{'כולל מע"מ'}</Text>
            </View>
          )}
          {index === 1 && (
            <View style={{
              height: IS_IOS ? 39 : 44,
              alignSelf: 'flex-end',
              paddingRight: 15,
            }}>
              <Text style={{
                color: '#022258',
                fontFamily: fonts.bold,
                fontSize: sp(20.5),
                textAlign: 'left',
              }}>{'לחשבון אחד *'}</Text>
              <Text style={{
                color: '#022258',
                fontFamily: fonts.regular,
                fontSize: sp(16),
                textAlign: 'left',
              }}>{'לחודש כולל מע"מ'}</Text>
            </View>
          )}
        </View>

        <View style={{
          marginTop: 15,
          marginBottom: 15,
          width: '100%',
          height: 3,
          backgroundColor: item.color,
        }}/>

        {item.data.map((it, i) => {
          return (
            <View key={i.toString()}
                  style={{
                    height: 34,
                    width: '100%',
                    // alignSelf: 'center',
                    // alignItems: 'center',
                    // alignContent: 'center',
                    justifyContent: 'center',
                    flexDirection: (isRtl) ? 'row-reverse' : 'row',
                  }}>
              <View
                style={{
                  flex: 90,
                  justifyContent: 'center',
                  flexDirection: 'column',
                }}>
                {it.active === null && (
                  <Image
                    style={[
                      {
                        alignSelf: 'center',
                        resizeMode: 'contain',
                        height: 14.5,
                      }]}
                    source={require('BiziboxUI/assets/icon-packages.png')}
                  />
                )}
                {it.active === true && (
                  <Image
                    style={[
                      {
                        alignSelf: 'center',
                        resizeMode: 'contain',
                        height: 14.5,
                      }]}
                    source={require(
                      'BiziboxUI/assets/icon-packages-active.png')}
                  />
                )}
              </View>
              <View
                style={{
                  flex: 477,
                  justifyContent: 'center',
                }}>
                <Text style={{
                  fontFamily: it.active === true ? fonts.bold : fonts.regular,
                  fontSize: sp(18.5),
                  textAlign: 'right',
                  color: it.active === false ? '#a7a6a6' : '#515151',
                }}>{it.name}</Text>
              </View>
            </View>
          )
        })}
      </View>
    )
  }

  render () {
    const {
      user,
      companies,
      currentCompanyId,
    } = this.props
    const {
      isLayoutComplete,
      slider1ActiveSlide,
      showAlert,
      fadeAnim,
      showAlertSuc,
      fadeAnimSuc,
    } = this.state
    const thisCompany = (!companies || !companies.length)
      ? {}
      : (companies.find(c => c.companyId === currentCompanyId) ? companies.find(
        c => c.companyId === currentCompanyId) : {})
    const showLastRowPopup = thisCompany.billingAccountId !==
      '00000000-0000-0000-0000-000000000000'
    if (!isLayoutComplete) {return <Loader/>}
    return (
      <View style={[
        {
          padding: 0,
          margin: 0,
          flexGrow: 1,
          width: '100%',
          backgroundColor: colors.white,
          paddingLeft: 0,
          paddingRight: 0,
        }]}>
        <SafeAreaView style={{
          flex: 1,
          backgroundColor: colors.white,
        }}>
          <ScrollView
            enableOnAndroid
            directionalLockEnabled
            scrollEnabled
            enableAutomaticScroll
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
            keyboardShouldPersistTaps="always"
            style={[
              styles.contentContainer, {
                flex: 1,
                margin: 0,
                padding: 0,
                width: '100%',
              }]}
            contentContainerStyle={[
              {
                flexGrow: 1,
                backgroundColor: colors.white,
                margin: 0,
                padding: 0,
                width: '100%',
                alignContent: 'center',
              }]}>
            <View style={{
              paddingTop: 15,
              alignSelf: 'center',
              alignItems: 'center',
              alignContent: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              <Image
                style={[
                  styles.imgIcon,
                  {
                    width: 58 / 2,
                    height: 55 / 2,
                  }]}
                source={require('BiziboxUI/assets/diamond.png')}
              />
              <Text style={{
                fontFamily: fonts.bold,
                fontSize: sp(19),
                color: '#022258',
                textAlign: 'center',
                paddingBottom: 5,
                paddingTop: 10,
              }}>{`שלום ${user.firstName}!`}</Text>
              <View style={{
                flexDirection: 'row-reverse',
              }}>
                <View>
                  <Text style={{
                    fontFamily: fonts.semiBold,
                    fontSize: sp(19),
                    color: '#022258',
                    textAlign: 'center',
                  }}>{'bizibox'}</Text>
                </View>
                <View>
                  <Text style={{
                    fontFamily: fonts.regular,
                    fontSize: sp(19),
                    color: '#022258',
                    textAlign: 'center',
                  }}> {'מזמינה אותך להצטרף למערכת'}</Text>
                </View>
              </View>
              <Text style={{
                paddingBottom: 5,
                fontFamily: fonts.regular,
                fontSize: sp(19),
                color: '#022258',
                textAlign: 'center',
              }}>{'לניהול תזרים מזומנים.'}</Text>

              <View style={{
                flexDirection: 'row-reverse',
              }}>
                <View>
                  <Text style={{
                    fontFamily: fonts.regular,
                    fontSize: sp(19),
                    color: '#022258',
                    textAlign: 'center',
                  }}>{'bizibox'}</Text>
                </View>
                <View>
                  <Text style={{
                    fontFamily: fonts.regular,
                    fontSize: sp(19),
                    color: '#022258',
                    textAlign: 'center',
                  }}> {'עוזרת לאלפי בעלי עסקים לשדרג את'}</Text>
                </View>
              </View>

              <Text style={{
                fontFamily: fonts.regular,
                fontSize: sp(19),
                color: '#022258',
                textAlign: 'center',
                paddingBottom: 5,
              }}>{'השליטה על הנתונים הפיננסיים ולחסוך זמן וכסף\n' +
              'באמצעות ניהול תזרים מזומנים עתידי, נתוני בנקים,\n' +
              'כרטיסי אשראי, התראות והתאמות אוטומטיות.'}</Text>
            </View>

            <Pagination
              dotsLength={2}
              activeDotIndex={slider1ActiveSlide}
              containerStyle={styles.sliderPaginationContainer}
              dotStyle={styles.sliderDot}
              inactiveDotStyle={styles.sliderInactiveDot}
              dotContainerStyle={styles.sliderDotContainer}
              inactiveDotOpacity={1}
              inactiveDotScale={1}
            />
            <Carousel
              slideHeight={650}
              ref={(c) => {
                this._carousel = c
              }}
              data={ENTRIES1}
              renderItem={this._renderItem}
              sliderWidth={sliderWidth}
              itemWidth={itemWidth}
              firstItem={SLIDER_1_FIRST_ITEM}
              inactiveSlideScale={1}
              inactiveSlideShift={0}
              inactiveSlideOpacity={IS_IOS ? 0.7 : 1}
              containerCustomStyle={styles.slider}
              contentContainerCustomStyle={styles.sliderContentContainer}
              loop={false}
              layout={'default'}
              autoplay={false}
              onSnapToItem={(index) => this.setState(
                { slider1ActiveSlide: index })}
            />

            <View style={{
              height: 27,
              paddingBottom: 3,
              width: itemWidth - 10,
              alignSelf: 'center',
              alignItems: 'flex-end',
              alignContent: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
            }}>
              {this.state.slider1ActiveSlide === 1 && (
                <Text style={{
                  color: '#022258',
                  fontFamily: fonts.regular,
                  fontSize: sp(16),
                  textAlign: 'right',
                }}>{'* למספר חשבונות - 49 ₪'}</Text>
              )}
            </View>

            <TouchableOpacity
              onPress={this.openAlert}
              style={{
                marginTop: 0,
                marginBottom: 15,
                width: itemWidth - 10,
                height: 48,
                backgroundColor: '#f3ca35',
                alignSelf: 'center',
                alignItems: 'center',
                alignContent: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                borderRadius: 6,
              }}>
              <Text style={{
                color: '#022258',
                fontFamily: fonts.bold,
                fontSize: sp(21),
                textAlign: 'center',
              }}>{'שדרגו את bizibox'}</Text>
              <Text style={{
                lineHeight: 18,
                color: '#022258',
                fontFamily: fonts.light,
                fontSize: sp(19),
                textAlign: 'center',
              }}>{'וקבלו חודש ניסיון חינם'}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginBottom: 30,
              }}
              onPress={this.customerServiceUpgrade}>
              <Text style={{
                fontSize: sp(19),
                fontFamily: fonts.semiBold,
                textAlign: 'center',
                color: '#007ebf',
                textDecorationLine: 'underline',
                textDecorationStyle: 'solid',
                textDecorationColor: '#007ebf',
              }}>{'שנציג יחזור אליי'}</Text>
            </TouchableOpacity>
          </ScrollView>

        </SafeAreaView>
        {showAlert && (
          <Animated.View style={{
            opacity: fadeAnim,
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            top: 0,
            zIndex: 999,
            elevation: 999,
            height: '100%',
            width: '100%',
            flexDirection: 'row',
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'flex-start',
            alignContent: 'center',
          }}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                left: 0,
                top: 0,
                zIndex: 9,
                height: '100%',
                width: '100%',
                backgroundColor: '#000',
                opacity: 0.6,
              }}
              onPress={this.animatedTime}/>
            <View style={{
              marginTop: 55,
              height: 265,
              width: 385,
              backgroundColor: '#ffffff',
              borderRadius: 8,
              zIndex: 10,
              shadowColor: '#a0a0a0',
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 2,
              paddingHorizontal: 0,
              paddingVertical: 8,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              <TouchableOpacity
                style={{
                  height: 20,
                  alignSelf: 'flex-start',
                  marginLeft: 8,
                }}
                onPress={this.animatedTime}>
                <Icon
                  name="close"
                  type="material-community"
                  size={25}
                  color={'#022258'}
                />
              </TouchableOpacity>
              <Image
                style={[
                  {
                    alignSelf: 'center',
                    resizeMode: 'contain',
                    height: 34,
                    marginTop: -10,
                  }]}
                source={require('BiziboxUI/assets/logoMobileAsakim.png')}
              />
              <Text style={{
                color: '#022258',
                height: 30,
                backgroundColor: '#dde7f1',
                fontSize: sp(19),
                lineHeight: 30,
                fontFamily: fonts.semiBold,
                textAlign: 'center',
                width: '100%',
                marginBottom: 10,
                marginTop: 15,
              }}>
                אנחנו שמחים שבחרת לשדרג ל bizibox לעסקים!
              </Text>
              <Text style={{
                color: '#022258',
                fontSize: sp(18.5),
                fontFamily: fonts.regular,
                textAlign: 'center',
                marginBottom: 10,
              }}>
                {'ניהול תזרים מזומנים - להכיר ולנהל את ההוצאות\n' +
                'וההכנסות של העסק שלך במינימום השקעה וזמן.'}
              </Text>
              {showLastRowPopup && (
                <Text style={{
                  color: '#022258',
                  fontSize: sp(16.5),
                  fontFamily: fonts.light,
                  textAlign: 'center',
                }}>
                  {'במהלך חודש הניסיון התשלום על bizibox ישאר ' +
                  thisCompany.currentPayment +
                  ' ש”ח כולל מע"מ.'}
                </Text>
              )}
              <TouchableOpacity
                onPress={this.startBusinessTrial}
                style={{
                  shadowColor: '#000',
                  shadowOffset: {
                    width: 0,
                    height: 4,
                  },
                  shadowOpacity: 0.30,
                  shadowRadius: 4.65,
                  elevation: 8,
                  marginTop: 15,
                  marginBottom: 15,
                  width: 320,
                  height: 46,
                  backgroundColor: '#f3ca35',
                  alignSelf: 'center',
                  alignItems: 'center',
                  alignContent: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  borderRadius: 6,
                }}>
                <Text style={{
                  color: '#022258',
                  fontFamily: fonts.bold,
                  fontSize: sp(21),
                  textAlign: 'center',
                }}>{'לחודש ניסיון'}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
        {showAlertSuc && (
          <Animated.View style={{
            opacity: fadeAnimSuc,
            position: 'absolute',
            bottom: 0,
            right: 0,
            left: 0,
            top: 0,
            zIndex: 999,
            elevation: 999,
            height: '100%',
            width: '100%',
            flexDirection: 'row',
            alignSelf: 'center',
            justifyContent: 'center',
            alignItems: 'flex-start',
            alignContent: 'center',
          }}>
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                left: 0,
                top: 0,
                zIndex: 9,
                height: '100%',
                width: '100%',
                backgroundColor: '#000',
                opacity: 0.6,
              }}
              onPress={this.animatedTimeSuc}/>
            <View style={{
              marginTop: 55,
              height: 160,
              width: 348,
              backgroundColor: '#ffffff',
              borderRadius: 8,
              zIndex: 10,
              shadowColor: '#a0a0a0',
              shadowOffset: {
                width: 0,
                height: 0,
              },
              shadowOpacity: 0.8,
              shadowRadius: 4,
              elevation: 2,
              paddingHorizontal: 0,
              paddingVertical: 8,
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}>
              <TouchableOpacity
                style={{
                  height: 20,
                  alignSelf: 'flex-start',
                  marginLeft: 8,
                }}
                onPress={this.animatedTimeSuc}>
                <Icon
                  name="close"
                  type="material-community"
                  size={25}
                  color={'#022258'}
                />
              </TouchableOpacity>
              <Image
                style={[
                  {
                    alignSelf: 'center',
                    resizeMode: 'contain',
                    height: 34,
                    marginTop: -10,
                  }]}
                source={require('BiziboxUI/assets/logoMobileAsakim.png')}
              />
              <Text style={{
                color: '#022258',
                height: 'auto',
                backgroundColor: '#dde7f1',
                fontSize: sp(19),
                lineHeight: 26,
                fontFamily: fonts.regular,
                textAlign: 'center',
                width: '100%',
                marginBottom: 10,
                marginTop: 15,
                paddingVertical: 5,
              }}>
                {'פנייתך התקבלה'}
                {'\n'}
                {'נציג bizibox יצור עימך קשר בהקדם'}
              </Text>
            </View>
          </Animated.View>
        )}
      </View>
    )
  }
}
