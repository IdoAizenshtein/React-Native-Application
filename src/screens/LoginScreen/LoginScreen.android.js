import React, {Fragment, PureComponent} from 'react';
import {
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ToastAndroid,
} from 'react-native';
import {connect} from 'react-redux';
// import SmsListener from 'react-native-android-sms-listener'
import Toast from 'react-native-root-toast';
import {withTranslation} from 'react-i18next';
// import { endsWith } from 'lodash'
import {Button, CheckBox, Icon} from 'react-native-elements';
import Loader from '../../components/Loader/Loader';
import styles from './LoginScreenStyles';
import commonStyles from '../../styles/styles';
import {
  changePassword,
  fcmTokenRegister,
  getSearchkey,
  getUser,
  login,
  logout,
  otpLogin,
  resetPassword,
} from '../../redux/actions/auth';
import {setLangDirection} from '../../redux/actions/lang';
import {getCompanies, selectCompany} from '../../redux/actions/company';
import {getAccounts} from '../../redux/actions/account';
import {
  getDeviceLang,
  getEmoji,
  getErrText,
  goTo,
  isRtl as checkRtl,
  sp,
} from '../../utils/func';
import jwtDecode from 'jwt-decode';
import {
  OVERVIEW,
  SIGNUP,
  UPLOADING_DOCUMENTS,
} from '../../constants/navigation';
import {smsApi} from '../../api';
// import { VERIFICATION_SMS_NUMBER } from '../../constants/config'
import {colors, fonts} from '../../styles/vars';
import Icons from 'react-native-vector-icons/MaterialCommunityIcons';
import {setRememberMe} from '../../redux/actions/user';
import {store} from '../../redux/configureStore';
import {
  ALERTS_TRIAL,
  BASE_URL,
  HOST,
  HOSTS,
  IS_DEV,
  setDevModeFunc,
  setLocalModeFunc,
  ReCaptchaV3Var,
} from '../../constants/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReCaptchaV3 from '@haskkor/react-native-recaptchav3';

const SCREEN = {
  LOGIN: 'LOGIN',
  OTP_LOGIN: 'OTP_LOGIN',
  RESET_PASSWORD: 'RESET_PASSWORD',
  ERROR_401: 'ERROR_401',
  OTP_RESET_PASSWORD: 'OTP_RESET_PASSWORD',
  CHANGE_PASSWORD: 'CHANGE_PASSWORD',
  CAN_NOT_BE_CHANGED: 'CAN_NOT_BE_CHANGED',
};
const locale = getDeviceLang();
@connect(state => ({
  token: state.token,
  isRtl: state.isRtl,
  rememberMe: state.rememberMe,
  user: state.user,
  globalParams: state.globalParams,
}))
@withTranslation()
export default class LoginScreen extends PureComponent {
  // smsSubscription = null

  constructor(props) {
    super(props);
    ReCaptchaV3Var.func = null;
    ReCaptchaV3Var.token = null;
    this.state = {
      status401: false,
      rememberMeState: true,
      secureTextEntry: false,
      secureTextEntryNew: false,
      secureTextEntryRepeat: false,
      showWebView: false,
      isReady: false,
      screen: SCREEN.LOGIN,
      gRecaptcha: null,
      username: '',
      password: '',
      confirmPassword: '',
      err: '',
      errMail: false,
      code: '',
      tokenInfo: {
        smsRemained: 0,
        maskedPhoneNumber: '',
      },
      inProgress: false,
      lengthPassValid: false,
      oneDigitPassValid: false,
      oneCharacterPassValid: false,
      smsRemainedOTP: 0,
    };
  }

  get screenTitle() {
    const {screen, status401} = this.state;
    const {t} = this.props;

    switch (screen) {
      case SCREEN.LOGIN:
        return t('login:loginTitle');
      case SCREEN.CHANGE_PASSWORD:
        return 'סיסמת כניסה למערכת';
      case SCREEN.CAN_NOT_BE_CHANGED:
      case SCREEN.OTP_RESET_PASSWORD:
      case SCREEN.RESET_PASSWORD:
      case SCREEN.ERROR_401 && status401:
        return 'שחזור סיסמה';
      case SCREEN.OTP_LOGIN:
      case SCREEN.ERROR_401 && !status401:
        return 'עוד צעד קטן...';
      default:
        return '';
    }
  }

  // setSmsListener = () => {
  //   if (this.smsSubscription) return
  //
  //   this.smsSubscription = SmsListener.addListener(message => {
  //     this.checkVerificationCode(message)
  //   })
  // }

  // removeSmsListener = () => {
  //   if (!this.smsSubscription) return
  //   this.smsSubscription.remove()
  //   this.smsSubscription = null
  // }

  // requestReadSmsPermission = () => {
  //   if (Platform.OS === 'ios') return
  //
  //   try {
  //     PermissionsAndroid.requestMultiple([
  //       PermissionsAndroid.PERMISSIONS.READ_SMS,
  //       PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
  //     ])
  //       .then(this.setSmsListener)
  //   } catch (err) {
  //     Toast.show('Request permission error', Toast.LONG, Toast.BOTTOM)
  //   }
  // }

  // checkVerificationCode = (message) => {
  //   const re = /(.*) ([\d]{4})\./
  //   // Toast.show(message.body, Toast.LONG, Toast.BOTTOM)
  //
  //   if (!message || !endsWith(message.originatingAddress, VERIFICATION_SMS_NUMBER) || !re.test(message.body)) return
  //
  //   const code = message.body.match(re)[2]
  //   this.setState({ code }, () => this.handleOtpLoginSubmit())
  // }

  setScreen = screen => {
    this.setState({
      screen,
      username: '',
      password: '',
      confirmPassword: '',
      code: '',
      inProgress: false,
      err: '',
    });
  };

  handleGoToResetPassword = () => this.setScreen(SCREEN.RESET_PASSWORD);

  handleGoToLogin = () => {
    const {dispatch} = this.props;
    dispatch(logout());
    // this.removeSmsListener()
    this.setScreen(SCREEN.LOGIN);
  };

  handleUpdateField = name => value => {
    if (name === 'password' || name === 'confirmPassword') {
      this.setState({
        [name]: value.toString().replace(getEmoji(), '').replace(/\s+/g, ''),
      });
    } else if (name === 'code') {
      this.setState({[name]: value.toString().replace(/[^\d]/g, '')});
    } else {
      this.setState({[name]: value});
    }
  };

  handleLoginSubmit = () => {
    const {username, password, inProgress, rememberMeState, gRecaptcha} =
      this.state;
    const {dispatch} = this.props;
    const re = /\S+@\S+\.\S+/;
    let errMail = !re.test(username);
    this.setState({
      errMail: errMail,
    });

    if (!username || !password || inProgress || errMail || !gRecaptcha) {
      return;
    }
    Keyboard.dismiss();
    this.setState({
      inProgress: true,
      err: '',
    });
    ALERTS_TRIAL.showAlertActivated = true;

    return dispatch(
      login({
        username,
        password,
        rememberMe: rememberMeState,
        gRecaptcha,
      }),
    )
      .then(({token, tokenInfo}) => {
        dispatch(setRememberMe(rememberMeState));
        const decodedToken = jwtDecode(token);
        if (decodedToken.type !== 'PRE_AUTH') {
          return this.login();
        }

        this.setState({tokenInfo});
        this.setScreen(SCREEN.OTP_LOGIN);
        // this.requestReadSmsPermission()
      })
      .catch(() => {
        this.setState({
          inProgress: false,
          password: '',
          err: 'הפרטים לא תואמים, אנא נסו שוב',
        });
      });
  };

  handleOtpLoginSubmit = () => {
    const {code, inProgress, smsRemainedOTP} = this.state;
    const {dispatch} = this.props;

    if (!code || inProgress) {
      return;
    }
    Keyboard.dismiss();
    this.setState({
      inProgress: true,
      smsRemainedOTP: smsRemainedOTP + 1,
    });

    return dispatch(otpLogin(code))
      .then(res => {
        if (res.token === 'Incorrect one time token code') {
          if (
            this.state.screen === SCREEN.OTP_LOGIN &&
            this.state.smsRemainedOTP >= 4
          ) {
            this.setState({status401: false});
            this.setScreen(SCREEN.ERROR_401);
          } else {
            this.setState({
              inProgress: false,
              code: '',
              err: 'הקוד לא תואם לקוד שנשלח, אנא בדקו אותו ונסו שוב',
            });
          }
          // Toast.show(getErrText(res.token), Toast.LONG, Toast.BOTTOM)
        } else {
          this.setState({err: ''});
          // this.removeSmsListener()
          if (this.state.screen === SCREEN.OTP_LOGIN) {
            return this.login();
          }
          this.setScreen(SCREEN.CHANGE_PASSWORD);
        }
      })
      .catch(err => {
        if (err.status === 401) {
          this.setState({status401: true});
          this.setScreen(SCREEN.ERROR_401);
        }
        this.setState({
          inProgress: false,
          code: '',
          err: '',
        });
        // Toast.show(getErrText(err), Toast.LONG, Toast.BOTTOM)
      });
  };

  handleResendSms = () => {
    Keyboard.dismiss();
    // this.requestReadSmsPermission()
    smsApi
      .post()
      .then(({smsRemained, maskedPhoneNumber}) => {
        this.setState({
          tokenInfo: {
            smsRemained,
            maskedPhoneNumber,
          },
          smsRemainedOTP: 0,
        });
      })
      .catch(err => {
        if (err.status === 401) {
          this.props.dispatch(logout());
          this.setScreen(SCREEN.LOGIN);
        }

        // Toast.show(getErrText(err), Toast.LONG, Toast.BOTTOM)
      });
  };

  getData = async name => {
    const value = await AsyncStorage.getItem(name);
    if (value !== null) {
      return JSON.parse(value);
    } else {
      return null;
    }
  };
  storeData = async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  };
  changeDevMode = async () => {
    if (HOST === HOSTS.dev) {
      setLocalModeFunc();
      ToastAndroid.show('Set Local environment', Toast.LONG, Toast.TOP);
    } else {
      setDevModeFunc();
      ToastAndroid.show('Set Dev environment', Toast.LONG, Toast.TOP);
    }
    await this.storeData('HOST', HOST);
    console.log('BASE_URL', BASE_URL, HOST);
  };

  handleResetPassword = () => {
    const {username, inProgress} = this.state;
    const {dispatch} = this.props;
    const re = /\S+@\S+\.\S+/;
    let errMail = !re.test(username);
    this.setState({
      errMail: errMail,
    });

    if (!username || inProgress || errMail) {
      return;
    }
    Keyboard.dismiss();
    this.setState({inProgress: true});

    return dispatch(resetPassword(username))
      .then(({tokenInfo}) => {
        this.setState({tokenInfo});
        if (
          tokenInfo &&
          tokenInfo.maskedPhoneNumber &&
          tokenInfo.maskedPhoneNumber === 'User not found'
        ) {
          this.setScreen(SCREEN.CAN_NOT_BE_CHANGED);
        } else {
          // this.requestReadSmsPermission()
          this.setScreen(SCREEN.OTP_RESET_PASSWORD);
        }
      })
      .catch(err => {
        this.setScreen(SCREEN.CAN_NOT_BE_CHANGED);
        Toast.show(getErrText(err), Toast.LONG, Toast.BOTTOM);
      });
  };

  handleChangePassword = () => {
    const {password, confirmPassword, inProgress} = this.state;
    const {dispatch} = this.props;
    if (
      !password ||
      password !== confirmPassword ||
      inProgress ||
      password.length < 8 ||
      password.length >= 12 ||
      password.replace(/[^\d]/g, '').length === 0 ||
      password.replace(/[^A-Za-z]/g, '').length === 0
    ) {
      return;
    }
    Keyboard.dismiss();
    this.setState({inProgress: true});

    return dispatch(changePassword(password))
      .then(this.login)
      .catch(err => {
        if (err.status === 401) {
          this.props.dispatch(logout());
          this.setScreen(SCREEN.LOGIN);
        }

        this.setState({inProgress: false});
        Toast.show(getErrText(err), Toast.LONG, Toast.BOTTOM);
      });
  };

  login = () => {
    const {dispatch} = this.props;
    this.setState({inProgress: true});

    return dispatch(fcmTokenRegister())
      .then(() => {
        this.getAllData();
      })
      .catch(() => {
        this.getAllData();
      });
  };

  getAllData = () => {
    const {dispatch, navigation} = this.props;
    return dispatch(getUser())
      .then(() => {
        if (
          this.props.user.changePasswordRequired === 1 ||
          this.props.user.changePasswordRequired === true
        ) {
          this.setScreen(SCREEN.CHANGE_PASSWORD);
        } else {
          return Promise.all([
            dispatch(getSearchkey()),
            dispatch(getCompanies()),
          ])
            .then(() => dispatch(selectCompany()))
            .then(() => dispatch(getAccounts()))
            .then(() => {
              goTo(
                navigation,
                this.props.globalParams.ocrPilot !== undefined &&
                  (this.props.globalParams.ocrPilot === 1 ||
                    this.props.globalParams.ocrPilot === 3)
                  ? UPLOADING_DOCUMENTS
                  : OVERVIEW,
              );
            })
            .catch(err => {
              this.setState({inProgress: false});
              Toast.show(getErrText(err), Toast.LONG, Toast.BOTTOM);
              dispatch(logout());
            });
        }
      })
      .catch(err => {
        this.setState({inProgress: false});
        Toast.show(getErrText(err), Toast.LONG, Toast.BOTTOM);
        dispatch(logout());
      });
  };

  componentDidMount() {
    const {token, isRtl, dispatch, rememberMe} = this.props;
    if (isRtl || checkRtl(locale)) {
      dispatch(setLangDirection(true));
    }
    // console.log('------token', token)
    // console.log('------rememberMe', rememberMe)

    if (IS_DEV) {
      this.getData('HOST').then(host => {
        console.log('BASE_URL', BASE_URL, HOST);
        if (host && host !== HOST) {
          if (host === HOSTS.dev) {
            setDevModeFunc();
          } else {
            setLocalModeFunc();
          }
        }
        console.log('BASE_URL', BASE_URL, HOST);
        if (token && rememberMe) {
          return this.login();
        } else if (!token) {
          store.dispatch(logout());
          this.setState({isReady: true});
        } else {
          this.setState({isReady: true});
        }
      });
    } else {
      if (token && rememberMe) {
        return this.login();
      } else if (!token) {
        store.dispatch(logout());
        this.setState({isReady: true});
      } else {
        this.setState({isReady: true});
      }
    }
    // const interCap = setInterval(()=>{
    //     if(!(token && rememberMe) && ReCaptchaV3Var.func){
    //         clearInterval(interCap);
    //         ReCaptchaV3Var.func.action = 'token'
    //         ReCaptchaV3Var.func.refreshToken();
    //     }
    // }, 300)
    // this.setState({ isReady: true }, () => this.requestReadSmsPermission())
  }

  // componentWillUnmount () {
  //   // this.removeSmsListener()
  // }

  handleLink = () => {
    // const url = 'https://qa-bsecure.bizibox.biz/signup'
    // Linking.canOpenURL(url).then(supported => {
    //   if (!supported) {
    //     console.log('Can\'t handle url: ' + url)
    //   } else {
    //     return Linking.openURL(url)
    //   }
    // }).catch(err => console.error('An error occurred', err))
    const {navigation} = this.props;
    goTo(navigation, SIGNUP);
    // this.setState({
    //   showWebView: true,
    // })
  };
  showWebView = () => {
    this.setState({
      showWebView: false,
    });
  };
  validateEmail = e => {
    const re = /\S+@\S+\.\S+/;
    this.setState({
      errMail: !re.test(e.nativeEvent.text),
    });
  };
  handleTogglePasswordVisibility = () => {
    const {secureTextEntry} = this.state;
    this.setState({secureTextEntry: !secureTextEntry});
  };
  handleTogglePasswordVisibilityDyna = state => () => {
    if (state === 'secureTextEntryNew') {
      this.setState({secureTextEntryNew: !this.state.secureTextEntryNew});
    } else if (state === 'secureTextEntryRepeat') {
      this.setState({secureTextEntryRepeat: !this.state.secureTextEntryRepeat});
    }
  };

  render() {
    const {
      inProgress,
      screen,
      tokenInfo,
      username,
      password,
      confirmPassword,
      code,
      isReady,
      err,
      secureTextEntry,
      rememberMeState,
      errMail,
      secureTextEntryNew,
      secureTextEntryRepeat,
      smsRemainedOTP,
    } = this.state;
    const {t} = this.props;

    if (!isReady) {
      return <Loader />;
    }

    return (
      <ScrollView
        keyboardShouldPersistTaps="always"
        contentContainerStyle={styles.contentContainer}
        style={commonStyles.mainContainer}>
        <Image
          style={commonStyles.mainBgImg}
          source={require('BiziboxUI/assets/main-bg.png')}
        />

        <Image
          style={styles.bottomImgBg}
          resizeMode="cover"
          source={require('BiziboxUI/assets/loginBg.png')}
        />

        <View style={[styles.container]}>
          <View style={styles.titleWrapper}>
            {IS_DEV ? (
              <TouchableOpacity onPress={this.changeDevMode}>
                <Image
                  style={styles.logoImg}
                  resizeMode="contain"
                  source={require('BiziboxUI/assets/logoBig.png')}
                />
              </TouchableOpacity>
            ) : (
              <Image
                style={styles.logoImg}
                resizeMode="contain"
                source={require('BiziboxUI/assets/logoBig.png')}
              />
            )}

            <Text style={styles.titleText}>{this.screenTitle}</Text>
          </View>

          {screen === SCREEN.LOGIN && (
            <Fragment>
              <View
                style={{
                  width: '100%',
                  marginVertical: 5,
                }}>
                <TextInput
                  onEndEditing={this.validateEmail}
                  onBlur={this.validateEmail}
                  placeholder={t('common:label:email')}
                  placeholderTextColor="#202020"
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  keyboardType="email-address"
                  underlineColorAndroid="transparent"
                  style={[
                    styles.input,
                    {
                      borderBottomColor:
                        err !== '' || errMail ? colors.red2 : colors.blue3,
                      borderBottomWidth: 2,
                      fontFamily: fonts.semiBold,
                      fontWeight: 'normal',
                      color: colors.blue29,
                      textAlign: username.length === 0 ? 'right' : 'left',
                      height: 50,
                      fontSize: sp(17),
                      backgroundColor: 'transparent',
                    },
                  ]}
                  onChangeText={this.handleUpdateField('username')}
                  value={username}
                />
              </View>
              {errMail && (
                <View
                  style={{
                    width: '100%',
                    marginVertical: 0,
                  }}>
                  <Text
                    style={[
                      {
                        color: colors.red7,
                        fontSize: sp(14),
                        textAlign: 'center',
                        fontFamily: fonts.regular,
                      },
                    ]}>
                    {'נראה שנפלה טעות במייל, אנא בדקו שוב'}
                  </Text>
                </View>
              )}

              {/* <FormInputAnimated */}
              {/* label={t('common:label:email')} */}
              {/* style={styles.input} */}
              {/* borderBottomColor={err !== '' ? colors.red2 : colors.blue3} */}
              {/* value={username} */}
              {/* autoCorrect={false} */}
              {/* autoCapitalize='none' */}
              {/* returnKeyType='done' */}
              {/* keyboardType='email-address' */}
              {/* onChangeText={this.handleUpdateField('username')} */}
              {/* /> */}
              <View
                style={{
                  width: '100%',
                  marginVertical: 5,
                }}>
                {/* {password.length === 0 && ( */}
                {/* <Text style={{ */}
                {/* position: 'absolute', */}
                {/* top: 13, */}
                {/* right: 0, */}
                {/* fontFamily: fonts.semiBold, */}
                {/* fontWeight: 'normal', */}
                {/* color: '#202020', */}
                {/* textAlign: 'right', */}
                {/* height: 50, */}
                {/* fontSize: sp(17), */}
                {/* }}>{t('common:label:password')}</Text> */}
                {/* )} */}

                <TextInput
                  placeholder={t('common:label:password')}
                  placeholderTextColor="#202020"
                  underlineColorAndroid="transparent"
                  secureTextEntry={!secureTextEntry}
                  style={[
                    styles.input,
                    {
                      borderBottomColor:
                        err !== '' ? colors.red2 : colors.blue3,
                      borderBottomWidth: 2,
                      fontFamily: fonts.semiBold,
                      fontWeight: 'normal',
                      color: colors.blue29,
                      textAlign: 'right',
                      height: 50,
                      fontSize: sp(17),
                      backgroundColor: 'transparent',
                    },
                  ]}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onEndEditing={e => {
                    this.setState({
                      password: e.nativeEvent.text
                        .toString()
                        .replace(getEmoji(), '')
                        .replace(/\s+/g, ''),
                    });
                  }}
                  onChangeText={this.handleUpdateField('password')}
                  value={password}
                  onSubmitEditing={this.handleLoginSubmit}
                />

                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    height: '100%',
                    left: 0,
                    top: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={this.handleTogglePasswordVisibility}>
                  {this.state.secureTextEntry ? (
                    <Icons name="eye-outline" size={19} color={colors.blue29} />
                  ) : (
                    <Icons
                      name="eye-off-outline"
                      size={19}
                      color={colors.blue29}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* <FormInputAnimated */}
              {/* secureTextEntry */}
              {/* label={t('common:label:password')} */}
              {/* style={styles.input} */}
              {/* borderBottomColor={err !== '' ? colors.red2 : colors.blue3} */}
              {/* value={password} */}
              {/* autoCorrect={false} */}
              {/* autoCapitalize='none' */}
              {/* returnKeyType='done' */}
              {/* onChangeText={this.handleUpdateField('password')} */}
              {/* onSubmitEditing={this.handleLoginSubmit} */}
              {/* /> */}

              <View
                style={{
                  width: '100%',
                  maxHeight: 80,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    flexGrow: 1,
                  }}>
                  <View>
                    <CheckBox
                      containerStyle={{
                        backgroundColor: 'transparent',
                        right: -10,
                        margin: 0,
                        padding: 0,
                        borderWidth: 0,
                      }}
                      textStyle={{
                        fontSize: sp(14),
                        color: colors.blue30,
                        fontWeight: 'normal',
                        textAlign: 'right',
                        fontFamily: fonts.regular,
                        right: -2,
                        margin: 0,
                        padding: 0,
                      }}
                      size={30}
                      right
                      title="זכור אותי"
                      iconRight
                      checkedIcon={
                        <Image
                          style={{
                            width: 30,
                            height: 32.5,
                            marginTop: 5,
                          }}
                          source={require('BiziboxUI/assets/checkboxChecked.png')}
                        />
                      }
                      uncheckedIcon={
                        <Image
                          style={{
                            width: 30,
                            height: 32.5,
                            marginTop: 5,
                          }}
                          source={require('BiziboxUI/assets/checkbox.png')}
                        />
                      }
                      checked={rememberMeState}
                      onPress={() =>
                        this.setState({rememberMeState: !rememberMeState})
                      }
                    />
                  </View>

                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={this.handleGoToResetPassword}>
                    <Text style={styles.linkBtnText}>
                      {t('login:forgotPassword')}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text
                  style={[
                    {
                      color: colors.red7,
                      fontSize: sp(14),
                      marginBottom: 50,
                      textAlign: 'center',
                      fontFamily: fonts.regular,
                    },
                  ]}>
                  {err}
                </Text>
              </View>

              <Button
                loading={inProgress}
                buttonStyle={styles.btn}
                titleStyle={styles.btnText}
                onPress={this.handleLoginSubmit}
                title={t('login:loginTitle')}
              />
            </Fragment>
          )}

          {screen === SCREEN.OTP_LOGIN && (
            <Fragment>
              <Text
                style={[
                  commonStyles.fill,
                  {
                    marginTop: 50,
                    textAlign: 'right',
                    fontSize: sp(16.5),
                    color: colors.blue29,
                  },
                ]}>
                {'קוד אימות לכניסה חד פעמית נשלח למספר הטלפון'}{' '}
                {tokenInfo.maskedPhoneNumber}
              </Text>
              <Text
                style={[
                  commonStyles.fill,
                  {
                    textAlign: 'right',
                    fontSize: sp(16.5),
                    color: colors.blue29,
                  },
                ]}>
                {'שימו לב, הקוד תקף ל-10 דקות בלבד'}
              </Text>
              {/* <Text style={[commonStyles.fill, utility.mb2]}>{t('login:attemptsLeft')}: {tokenInfo.smsRemained}</Text> */}
              <View
                style={{
                  width: '100%',
                  marginVertical: 5,
                }}>
                <TextInput
                  placeholder={'הקלידו את הקוד'}
                  placeholderTextColor="#202020"
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  keyboardType="numeric"
                  underlineColorAndroid="transparent"
                  style={[
                    styles.input,
                    {
                      marginTop: 20,
                      borderBottomColor:
                        err !== '' ? colors.red2 : colors.blue3,
                      borderBottomWidth: 2,
                      fontFamily: fonts.semiBold,
                      fontWeight: 'normal',
                      color: colors.blue29,
                      textAlign: username.length === 0 ? 'right' : 'left',
                      height: 50,
                      fontSize: sp(17),
                      backgroundColor: 'transparent',
                    },
                  ]}
                  onEndEditing={e => {
                    this.setState({
                      code: e.nativeEvent.text.toString().replace(/[^\d]/g, ''),
                    });
                  }}
                  onChangeText={this.handleUpdateField('code')}
                  onSubmitEditing={this.handleOtpLoginSubmit}
                  value={code}
                />
              </View>

              {err !== '' && (
                <Text
                  style={[
                    commonStyles.fill,
                    {
                      color: colors.red2,
                      textAlign: 'center',
                    },
                  ]}>
                  {err}
                </Text>
              )}

              <Button
                loading={inProgress}
                buttonStyle={[
                  styles.btn,
                  {
                    marginTop: 10,
                  },
                ]}
                titleStyle={styles.btnText}
                onPress={this.handleOtpLoginSubmit}
                title={t('common:label:submit')}
              />

              <View
                style={{
                  width: '100%',
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  marginTop: 10,
                }}>
                {smsRemainedOTP > 0 && (
                  <View
                    style={{
                      flexDirection: 'row-reverse',
                      height: 20,
                      marginTop: 10,
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        height: 20,
                        fontSize: sp(14),
                        textAlign: 'center',
                      }}>
                      {'לא קיבלתם את הקוד? '}
                    </Text>
                    <TouchableOpacity
                      style={[
                        {
                          height: 20,
                        },
                      ]}
                      onPress={this.handleResendSms}>
                      <Text style={styles.linkBtnText}>{'נסו שוב'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View
                  style={{
                    height: 20,
                  }}>
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={this.handleGoToLogin}>
                    <Text style={styles.linkBtnText}>
                      {t('login:backToLogin')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Fragment>
          )}

          {screen === SCREEN.OTP_RESET_PASSWORD && (
            <Fragment>
              <View
                style={{
                  width: '100%',
                  marginVertical: 5,
                }}>
                <TextInput
                  placeholder={
                    tokenInfo.maskedPhoneNumber + 'הקלידו את הקוד שנשלח לנייד '
                  }
                  placeholderTextColor="#202020"
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  keyboardType="numeric"
                  underlineColorAndroid="transparent"
                  style={[
                    styles.input,
                    {
                      marginTop: 20,
                      borderBottomColor:
                        err !== '' ? colors.red2 : colors.blue3,
                      borderBottomWidth: 2,
                      fontFamily: fonts.semiBold,
                      fontWeight: 'normal',
                      color: colors.blue29,
                      textAlign: username.length === 0 ? 'right' : 'left',
                      height: 50,
                      fontSize: sp(14),
                      backgroundColor: 'transparent',
                    },
                  ]}
                  onEndEditing={e => {
                    this.setState({
                      code: e.nativeEvent.text.toString().replace(/[^\d]/g, ''),
                    });
                  }}
                  onChangeText={this.handleUpdateField('code')}
                  onSubmitEditing={this.handleOtpLoginSubmit}
                  value={code}
                />
              </View>

              {err !== '' && (
                <Text
                  style={[
                    commonStyles.fill,
                    {
                      color: colors.red2,
                      textAlign: 'center',
                    },
                  ]}>
                  {err}
                </Text>
              )}

              <Button
                loading={inProgress}
                buttonStyle={[
                  styles.btn,
                  {
                    marginTop: 10,
                  },
                ]}
                titleStyle={styles.btnText}
                onPress={this.handleOtpLoginSubmit}
                title={'המשך'}
              />

              <View
                style={{
                  width: '100%',
                  height: 60,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 10,
                  marginTop: 10,
                }}>
                {tokenInfo.smsRemained > 0 && (
                  <View
                    style={{
                      flexDirection: 'row-reverse',
                      height: 20,
                      marginTop: 10,
                      marginBottom: 10,
                    }}>
                    <Text
                      style={{
                        height: 20,
                        fontSize: sp(14),
                        textAlign: 'center',
                      }}>
                      {'לא קיבלתם את הקוד? '}
                    </Text>
                    <TouchableOpacity
                      style={[
                        {
                          height: 20,
                        },
                      ]}
                      onPress={this.handleResendSms}>
                      <Text style={styles.linkBtnText}>{'נסו שוב'}</Text>
                    </TouchableOpacity>
                  </View>
                )}

                <View
                  style={{
                    height: 20,
                  }}>
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={this.handleGoToLogin}>
                    <Text style={styles.linkBtnText}>
                      {t('login:backToLogin')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Fragment>
          )}

          {screen === SCREEN.RESET_PASSWORD && (
            <Fragment>
              <View
                style={{
                  width: '100%',
                  // flexDirection: 'column',
                  // alignSelf: 'flex-end',
                  // justifyContent: 'center',
                  // alignItems: 'flex-end',
                  // alignContent: 'flex-end',
                }}>
                <View
                  style={{
                    height: 70,
                    width: '100%',
                    marginVertical: 5,
                    paddingBottom: 80,
                    paddingTop: 30,
                  }}>
                  <TextInput
                    onEndEditing={this.validateEmail}
                    onBlur={this.validateEmail}
                    onSubmitEditing={this.handleResetPassword}
                    placeholder={'הקלידו את כתובת המייל איתה נרשמתם'}
                    placeholderTextColor="#202020"
                    autoCorrect={false}
                    autoCapitalize="none"
                    returnKeyType="done"
                    keyboardType="email-address"
                    underlineColorAndroid="transparent"
                    style={[
                      styles.input,
                      {
                        borderBottomColor:
                          err !== '' || errMail ? colors.red2 : colors.blue3,
                        borderBottomWidth: 2,
                        fontFamily: fonts.semiBold,
                        fontWeight: 'normal',
                        color: colors.blue29,
                        textAlign: username.length === 0 ? 'right' : 'left',
                        height: 50,
                        fontSize: sp(17),
                        backgroundColor: 'transparent',
                      },
                    ]}
                    onChangeText={this.handleUpdateField('username')}
                    value={username}
                  />
                </View>
                {errMail && (
                  <View
                    style={{
                      width: '100%',
                      marginVertical: 0,
                    }}>
                    <Text
                      style={[
                        {
                          color: colors.red7,
                          fontSize: sp(14),
                          textAlign: 'center',
                          fontFamily: fonts.regular,
                        },
                      ]}>
                      {'נראה שנפלה טעות במייל, אנא בדקו שוב'}
                    </Text>
                  </View>
                )}

                <View
                  style={{
                    height: 120,
                    flexDirection: 'column',
                  }}>
                  <View
                    style={{
                      paddingTop: 40,
                    }}>
                    <Button
                      loading={inProgress}
                      buttonStyle={[
                        styles.btn,
                        {
                          marginTop: 0,
                          marginBottom: 0,
                          alignSelf: 'flex-end',
                        },
                      ]}
                      titleStyle={styles.btnText}
                      onPress={this.handleResetPassword}
                      title={t('login:label:continue')}
                    />
                  </View>

                  <View
                    style={[
                      styles.formControlsWrapper,
                      {
                        margin: 0,
                        paddingTop: 15,
                        height: 30,
                      },
                    ]}>
                    <TouchableOpacity
                      style={styles.linkBtn}
                      onPress={this.handleGoToLogin}>
                      <Text style={styles.linkBtnText}>
                        {t('login:backToLogin')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Fragment>
          )}

          {screen === SCREEN.CHANGE_PASSWORD && (
            <Fragment>
              <View
                style={{
                  width: '100%',
                  marginVertical: 5,
                }}>
                <TextInput
                  placeholder={'בחרו סיסמה חדשה'}
                  placeholderTextColor="#202020"
                  underlineColorAndroid="transparent"
                  secureTextEntry={!secureTextEntryNew}
                  style={[
                    styles.input,
                    {
                      borderBottomColor:
                        password.length > 0 &&
                        confirmPassword.length > 0 &&
                        password !== confirmPassword
                          ? colors.red2
                          : colors.blue3,
                      borderBottomWidth: 2,
                      fontFamily: fonts.semiBold,
                      fontWeight: 'normal',
                      color: colors.blue29,
                      textAlign: 'right',
                      height: 50,
                      fontSize: sp(17),
                      backgroundColor: 'transparent',
                    },
                  ]}
                  autoCorrect={false}
                  onEndEditing={e => {
                    this.setState({
                      password: e.nativeEvent.text
                        .toString()
                        .replace(getEmoji(), '')
                        .replace(/\s+/g, ''),
                    });
                  }}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onChangeText={this.handleUpdateField('password')}
                  value={password}
                  onSubmitEditing={this.handleChangePassword}
                />

                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    height: '100%',
                    left: 0,
                    top: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={this.handleTogglePasswordVisibilityDyna(
                    'secureTextEntryNew',
                  )}>
                  {this.state.secureTextEntryNew ? (
                    <Icons name="eye-outline" size={19} color={colors.blue29} />
                  ) : (
                    <Icons
                      name="eye-off-outline"
                      size={19}
                      color={colors.blue29}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <View
                style={{
                  width: '100%',
                  marginVertical: 5,
                }}>
                <TextInput
                  placeholder={'הקלידו את הסיסמה שוב'}
                  placeholderTextColor="#202020"
                  underlineColorAndroid="transparent"
                  secureTextEntry={!secureTextEntryRepeat}
                  style={[
                    styles.input,
                    {
                      borderBottomColor:
                        password.length > 0 &&
                        confirmPassword.length > 0 &&
                        password !== confirmPassword
                          ? colors.red2
                          : colors.blue3,
                      borderBottomWidth: 2,
                      fontFamily: fonts.semiBold,
                      fontWeight: 'normal',
                      color: colors.blue29,
                      textAlign: 'right',
                      height: 50,
                      fontSize: sp(17),
                      backgroundColor: 'transparent',
                    },
                  ]}
                  autoCorrect={false}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onEndEditing={e => {
                    this.setState({
                      confirmPassword: e.nativeEvent.text
                        .toString()
                        .replace(getEmoji(), '')
                        .replace(/\s+/g, ''),
                    });
                  }}
                  onChangeText={this.handleUpdateField('confirmPassword')}
                  value={confirmPassword}
                  onSubmitEditing={this.handleChangePassword}
                />

                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    backgroundColor: 'transparent',
                    height: '100%',
                    left: 0,
                    top: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={this.handleTogglePasswordVisibilityDyna(
                    'secureTextEntryRepeat',
                  )}>
                  {this.state.secureTextEntryRepeat ? (
                    <Icons name="eye-outline" size={19} color={colors.blue29} />
                  ) : (
                    <Icons
                      name="eye-off-outline"
                      size={19}
                      color={colors.blue29}
                    />
                  )}
                </TouchableOpacity>
              </View>

              {/* <FormInputAnimated */}
              {/* secureTextEntry */}
              {/* label={'בחרו סיסמה חדשה'} */}
              {/* style={styles.input} */}
              {/* value={password} */}
              {/* autoCorrect={false} */}
              {/* autoCapitalize='none' */}
              {/* returnKeyType='done' */}
              {/* onChangeText={this.handleUpdateField('password')} */}
              {/* onSubmitEditing={this.handleChangePassword} */}
              {/* /> */}

              {/* <FormInputAnimated */}
              {/* secureTextEntry */}
              {/* label={'הקלידו את הסיסמה שוב'} */}
              {/* style={styles.input} */}
              {/* value={confirmPassword} */}
              {/* autoCorrect={false} */}
              {/* autoCapitalize='none' */}
              {/* returnKeyType='done' */}
              {/* onChangeText={this.handleUpdateField('confirmPassword')} */}
              {/* onSubmitEditing={this.handleChangePassword} */}
              {/* /> */}

              {password.length > 0 &&
                confirmPassword.length > 0 &&
                password !== confirmPassword && (
                  <View>
                    <Text
                      style={{
                        fontSize: sp(16),
                        fontFamily: fonts.regular,
                        color: colors.red2,
                        textAlign: 'center',
                      }}>
                      {'הסיסמאות לא זהות, אנא בדקו שוב'}
                    </Text>
                  </View>
                )}

              <View
                style={[
                  {
                    width: '100%',
                    flexDirection: 'column',
                    alignSelf: 'flex-end',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                    alignContent: 'flex-end',
                    marginBottom: 50,
                    marginTop: 10,
                  },
                ]}>
                <View
                  style={{
                    flexDirection: 'row-reverse',
                    alignSelf: 'flex-end',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                  }}>
                  <Icon
                    name={
                      password.length >= 8 && password.length < 12
                        ? 'check'
                        : 'block-helper'
                    }
                    type="material-community"
                    size={
                      password.length >= 8 && password.length < 12 ? 16 : 12
                    }
                    color={'#022258'}
                  />
                  <View style={commonStyles.spaceDivider} />
                  <Text
                    style={{
                      fontSize: sp(16),
                      fontFamily: fonts.regular,
                      color: colors.blue29,
                    }}>
                    {'8-12 תווים'}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row-reverse',
                    alignSelf: 'flex-end',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                  }}>
                  <Icon
                    name={
                      password.replace(/[^\d]/g, '').length > 0
                        ? 'check'
                        : 'block-helper'
                    }
                    type="material-community"
                    size={password.replace(/[^\d]/g, '').length > 0 ? 16 : 12}
                    color={'#022258'}
                  />
                  <View style={commonStyles.spaceDivider} />
                  <Text
                    style={{
                      fontSize: sp(16),
                      fontFamily: fonts.regular,
                      color: colors.blue29,
                    }}>
                    {'לפחות ספרה אחת'}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row-reverse',
                    alignSelf: 'flex-end',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                  }}>
                  <Icon
                    name={
                      password.replace(/[^A-Za-z]/g, '').length > 0
                        ? 'check'
                        : 'block-helper'
                    }
                    type="material-community"
                    size={
                      password.replace(/[^A-Za-z]/g, '').length > 0 ? 16 : 12
                    }
                    color={'#022258'}
                  />
                  <View style={commonStyles.spaceDivider} />
                  <Text
                    style={{
                      fontSize: sp(16),
                      fontFamily: fonts.regular,
                      color: colors.blue29,
                    }}>
                    {'לפחות אות אחת באנגלית'}
                  </Text>
                </View>

                {/* <TouchableOpacity style={styles.linkBtn} onPress={this.handleGoToLogin}> */}
                {/* <Text style={styles.linkBtnText}>{t('login:backToLogin')}</Text> */}
                {/* </TouchableOpacity> */}
              </View>

              <Button
                loading={inProgress}
                buttonStyle={styles.btn}
                titleStyle={styles.btnText}
                onPress={this.handleChangePassword}
                title={'כניסה למערכת'}
              />
            </Fragment>
          )}

          {screen === SCREEN.CAN_NOT_BE_CHANGED && (
            <Fragment>
              <Text
                style={[
                  styles.infoText,
                  {
                    textAlign: 'right',
                  },
                ]}>
                {t('login:cantProceedResetPass')}
              </Text>
              <Text
                style={[
                  styles.infoText,
                  {
                    textAlign: 'right',
                  },
                ]}>
                {t('login:contactSupportTeam')}
              </Text>

              <View
                style={{
                  height: 120,
                  flexDirection: 'column',
                }}>
                <View
                  style={{
                    paddingTop: 40,
                  }}>
                  <Button
                    loading={inProgress}
                    buttonStyle={[
                      styles.btn,
                      {
                        marginTop: 0,
                        marginBottom: 0,
                        alignSelf: 'flex-end',
                      },
                    ]}
                    titleStyle={styles.btnText}
                    onPress={null}
                    title={'פתיחת קריאת שירות'}
                  />
                </View>

                <View
                  style={[
                    styles.formControlsWrapper,
                    {
                      margin: 0,
                      paddingTop: 15,
                      height: 30,
                    },
                  ]}>
                  <TouchableOpacity
                    style={styles.linkBtn}
                    onPress={this.handleGoToLogin}>
                    <Text style={styles.linkBtnText}>
                      {t('login:backToLogin')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Fragment>
          )}

          {screen === SCREEN.ERROR_401 && (
            <Fragment>
              <Text style={[styles.infoText]}>
                {'נעשו 3 ניסיונות כניסה לא נכונים'}
              </Text>
              <Text style={[styles.infoText]}>
                {'לא ניתן להמשיך בתהליך ההזדהות'}
              </Text>

              <View
                style={{
                  height: 120,
                  flexDirection: 'column',
                }}>
                <View
                  style={{
                    paddingTop: 40,
                  }}>
                  <Button
                    loading={inProgress}
                    buttonStyle={[
                      styles.btn,
                      {
                        marginTop: 0,
                        marginBottom: 0,
                        alignSelf: 'flex-end',
                      },
                    ]}
                    titleStyle={styles.btnText}
                    onPress={this.handleGoToLogin}
                    title={'חזרה למסך הכניסה'}
                  />
                </View>
              </View>
            </Fragment>
          )}
        </View>
        <View
          style={{
            flexDirection: 'column',
            alignSelf: 'center',
            justifyContent: 'flex-end',
            alignItems: 'center',
            alignContent: 'center',
            marginBottom: 50,
          }}>
          <View
            style={{
              flexDirection: 'row-reverse',
              height: 20,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}>
            <Text
              style={{
                fontSize: sp(14),
                height: 20,
                fontFamily:fonts.regular,
              }}>
              {'עדיין לא רשומים?'}
            </Text>
            <TouchableOpacity
              style={[
                {
                  height: 20,
                },
              ]}
              onPress={this.handleLink}>
              <Text style={styles.linkBtnText}>
                {' הרשמו עכשיו ללא התחייבות'}
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row-reverse',
              height: 20,
              alignSelf: 'center',
              justifyContent: 'center',
              alignItems: 'center',
              alignContent: 'center',
            }}>
            <Text
              style={{
                fontSize: sp(14),
                height: 20,
                fontFamily:fonts.regular,
              }}>
              {'נתקלתם בבעיה? חייגו 2365* ונשמח לעזור'}
            </Text>
          </View>
          <Image
            style={[
              {
                width: 188,
                height: 23,
                marginTop: 10,
              },
            ]}
            source={require('BiziboxUI/assets/securityIcons.png')}
          />
        </View>
        <ReCaptchaV3
          ref={ref => (ReCaptchaV3Var.func = ref)}
          captchaDomain={HOST}
          action={'token'}
          siteKey={'6LfQ_z4kAAAAAL5Im2ERNTmRFb_yL7dA4g6uzN59'}
          onReceiveToken={token => {
            ReCaptchaV3Var.token = token;
            console.log('---------ReCaptchaV3Var-----', token)
            this.setState({gRecaptcha: token});
          }}
        />
      </ScrollView>
    );
  }
}
