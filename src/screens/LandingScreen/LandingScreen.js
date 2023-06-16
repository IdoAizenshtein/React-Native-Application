import React, {PureComponent} from 'react'
import {
    Animated,
    BackHandler,
    Image,
    ImageBackground,
    Keyboard,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
    SafeAreaView,
} from 'react-native'
import {connect} from 'react-redux'
import {withTranslation} from 'react-i18next'
import {getEmoji, goTo, goToBack, sp} from '../../utils/func'
import {setOpenedBottomSheet} from '../../redux/actions/user'
import {fonts} from '../../styles/vars';
import commonStyles from '../../styles/styles';
import {IS_IOS} from '../../constants/common';
import {Button} from 'react-native-elements';
import {updateLeadInfo} from '../../api';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

@connect(state => ({
    user: state.user,
    companies: state.companies,
    currentCompanyId: state.currentCompanyId,
}))
@withTranslation()
export default class LandingScreen extends PureComponent {

    constructor(props) {
        super(props)

        this.state = {
            inProgress: false,
            fullName: '',
            phoneNumber: '',
            phoneNumberSide: 'right',
            phoneNumberValid: true,
            fullNameValid: true,
            alertModal: false,
            fadeAnim: new Animated.Value(0),
        }
    }


    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
    }

    handleBackPress = () => {
        this.props.dispatch(setOpenedBottomSheet(false))

        goToBack(this.props.navigation)
        return true
    }


    handleUpdateFieldValid = (name, isNotBlur, isRun) => val => {
        if (isRun === undefined || isRun) {
            let value = val.nativeEvent.text || ''

            if (name === 'fullNameValid') {
                const fullNameValidLen = value && value.length && String(value).trim().split(' ').length > 1
                this.setState({
                    [name]: (!value || (value && value.length === 0))
                        ? false
                        : fullNameValidLen,
                })
            } else if (name === 'phoneNumberValid') {
                this.setState({
                    phoneNumberSide: 'right',
                    [name]: (!value || (value && value.length === 0))
                        ? false
                        : !!(value && (value.length === 10 || value.length === 11) &&
                            new RegExp(
                                '(050|052|053|054|055|057|058|02|03|04|08|09|072|073|076|077|078)-?\\d{7,7}').test(
                                value)),
                })
            }
        }
    };

    onFocusInput = name => val => {
        this.setState({
            [name]: 'left',
        })
    }
    handleUpdateField = name => val => {
        let value = val || ''
        value = value.toString().replace(getEmoji(), '')

        if (name === 'phoneNumber') {
            value = value.toString().replace(/[^\d-]/g, '')
        }

        this.setState({
            [name]: value,
        })

        this.handleUpdateFieldValid(`${name}Valid`, true)({
            nativeEvent: {
                text: value,
            },
        })
    }
    handleUpdateLeadInfo = () => {
        const {fullName, phoneNumber, inProgress, phoneNumberValid, fullNameValid} = this.state
        if (inProgress || !(
            fullNameValid && phoneNumberValid &&
            fullName.length > 0 && phoneNumber.length > 0
        )) {
            this.handleUpdateFieldValid('fullNameValid')({
                nativeEvent: {
                    text: fullName,
                },
            })
            this.handleUpdateFieldValid('phoneNumberValid')({
                nativeEvent: {
                    text: phoneNumber,
                },
            })
            return
        }
        Keyboard.dismiss()
        this.setState({inProgress: true})

        const {companies, currentCompanyId, user, navigation} = this.props
        if (!companies || !companies.length) {
            return {}
        }
        const currentCompany = companies && companies.length &&
            companies.find(c => c.companyId === currentCompanyId)

        const name = fullName.trim().split(' ');
        const lastNames = name.map((it, idx)=> idx === 0 ? '' : it).join(' ');
        return updateLeadInfo.post({
            body: {
                biziboxType: currentCompany.biziboxType,
                firstName: name[0],
                lastName: lastNames.trim(),
                phoneNumber: phoneNumber,
                username: user.mail,
                hesderId: 21,
            },
        })
            .then(() => {
                this.setState({
                    inProgress: false,
                })
                const {
                    fadeAnim,
                } = this.state
                return Animated.timing(
                    fadeAnim,
                    {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    },
                ).start(() => {
                    this.setState({
                        alertModal: true,
                    }, () => {
                        setTimeout(() => {
                            Animated.timing(
                                fadeAnim,
                                {
                                    toValue: 0,
                                    duration: 300,
                                    useNativeDriver: true,
                                },
                            ).start(() => {
                                this.setState({
                                    alertModal: false,
                                })

                                goTo(navigation, 'UPLOADING_DOCUMENTS')
                            })
                        }, 3000)
                    })
                })
            })
            .catch(() => {

            })
    }

    render() {
        const {fullName, phoneNumber, phoneNumberSide, phoneNumberValid, fullNameValid, inProgress, alertModal, fadeAnim} = this.state

        return (
            <SafeAreaView style={styles.container}>
                <KeyboardAwareScrollView enableOnAndroid style={styles.scrollView} extraHeight={190}>
                    <ImageBackground source={require('BiziboxUI/assets/bg_landing_top.png')}
                                     style={styles.image}>
                        <Text style={styles.textBold}>רוצה להיות הבוס של הכסף שלך?</Text>
                        <View style={{
                            flexDirection: 'row-reverse',
                        }}>
                            <Text style={styles.text}> - bizibox</Text>
                            <Text style={styles.text}>המערכת המובילה לניהול תזרים מזומנים אוטומטי</Text>
                        </View>
                        <Text style={styles.text}>עוזרת לכם להבין מה קורה עם הכסף של העסק שלכם</Text>
                    </ImageBackground>

                    <View style={{
                        height: 304,
                        backgroundColor: '#efefef',
                        paddingTop: 30,
                        paddingHorizontal: 50,
                    }}>
                        <Text style={styles.titleForm}>מלאו פרטים ונחזור אליכם</Text>

                        <TextInput
                            placeholder={'שם מלא'}
                            placeholderTextColor={'#88909e'}
                            editable
                            maxLength={30}
                            autoCorrect={false}
                            autoCapitalize="sentences"
                            returnKeyType="done"
                            keyboardType="default"
                            underlineColorAndroid="transparent"
                            style={[
                                {
                                    textAlign: 'right',
                                    color: '#010101',
                                    paddingHorizontal: 10,
                                    borderRadius: 4,
                                    backgroundColor: '#ffffff',
                                    borderColor: fullNameValid ? '#cccbcb' : '#e40000',
                                    borderWidth: 1,
                                    height: 48,
                                    fontSize: sp(20),
                                    width: '100%',
                                }, commonStyles.regularFont]}
                            onEndEditing={this.handleUpdateFieldValid('fullNameValid', false, !IS_IOS)}
                            onBlur={this.handleUpdateFieldValid('fullNameValid', false, IS_IOS)}
                            onChangeText={this.handleUpdateField('fullName')}
                            value={fullName}
                        />

                        <View style={{
                            height: 20,
                        }}>
                            {!fullNameValid && (
                                <Text style={{
                                    color: '#e40000',
                                    fontFamily: fonts.regular,
                                    fontSize: sp(17),
                                    lineHeight: sp(17),
                                    textAlign: 'left',
                                }}>
                                    {(!fullName || (fullName && fullName.length === 0)) ?
                                        '* שדה חובה'
                                        :
                                        'הזינו שם פרטי ומשפחה'
                                    }
                                </Text>
                            )}
                        </View>


                        <TextInput
                            placeholder={'טלפון'}
                            placeholderTextColor={'#88909e'}
                            editable
                            maxLength={11}
                            autoCorrect={false}
                            autoCapitalize="none"
                            returnKeyType="done"
                            keyboardType="numeric"
                            underlineColorAndroid="transparent"
                            style={[{
                                textAlign: (!phoneNumber ||
                                    (phoneNumber && phoneNumber.length === 0))
                                    ? 'right'
                                    : phoneNumberSide,
                                color: '#010101',
                                paddingHorizontal: 10,
                                borderRadius: 4,
                                backgroundColor: '#ffffff',
                                borderColor: phoneNumberValid ? '#cccbcb' : '#e40000',
                                borderWidth: 1,
                                height: 48,
                                fontSize: sp(20),
                                width: '100%',
                            }, commonStyles.regularFont]}
                            onEndEditing={(e) => {
                                this.setState({
                                    phoneNumber: e.nativeEvent.text.toString().replace(/[^\d-]/g, ''),
                                })
                                this.handleUpdateFieldValid('phoneNumberValid')(e)
                            }}
                            onFocus={this.onFocusInput('phoneNumberSide')}
                            onBlur={this.handleUpdateFieldValid('phoneNumberValid')}
                            onChangeText={this.handleUpdateField('phoneNumber')}
                            value={phoneNumber}
                        />
                        <View style={{
                            height: 20,
                        }}>
                            {!phoneNumberValid && (
                                <Text style={{
                                    color: '#e40000',
                                    fontFamily: fonts.regular,
                                    fontSize: sp(17),
                                    lineHeight: sp(17),
                                    textAlign: 'left',
                                }}>
                                    {(!phoneNumber || (phoneNumber && phoneNumber.length === 0)) ?
                                        '* שדה חובה'
                                        :
                                        'הזינו טלפון תקין'
                                    }
                                </Text>
                            )}
                        </View>

                        <Button
                            disabled={!phoneNumberValid || !fullNameValid}
                            disabledTitleStyle={{
                                opacity: 0.9,
                            }}
                            disabledStyle={{
                                opacity: 0.9,
                            }}
                            loading={inProgress}
                            buttonStyle={{
                                height: 53,
                                backgroundColor: '#f3ca35',
                                borderRadius: 6,
                            }}
                            titleStyle={{
                                color: '#000000',
                                fontFamily: fonts.semiBold,
                                fontSize: sp(22),
                            }}
                            onPress={this.handleUpdateLeadInfo}
                            title={'השארת פרטים'}
                        />

                        <Text style={{
                            color: '#515050',
                            fontFamily: fonts.light,
                            textAlign: 'center',
                            fontSize: sp(17),
                        }}>
                            התחברו עכשיו וקבלו חודש ניסיון בחינם
                        </Text>
                    </View>

                    <View style={{
                        backgroundColor: '#ffffff',
                        paddingHorizontal: 15,
                        paddingTop: 15,
                    }}>

                        <View style={{
                            flexDirection: 'row-reverse',
                        }}>
                            <View style={{
                                flex: 1,
                                maxHeight: 180,
                            }}>

                                <View style={{
                                    height: 70,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Image source={require('BiziboxUI/assets/land_1.png')}/>
                                </View>

                                <Text style={{
                                    color: '#000000',
                                    fontFamily: fonts.semiBold,
                                    textAlign: 'center',
                                    fontSize: sp(19),
                                }}>
                                    ריכוז הנתונים הפיננסיים
                                </Text>

                                <Text style={{
                                    color: '#000000',
                                    fontFamily: fonts.light,
                                    textAlign: 'center',
                                    fontSize: sp(18),
                                }}>
                                    נתוני בנקים, צ'קים,
                                    תשלומים, כרטיסי אשראי
                                    הכל באופן אוטומטי!
                                </Text>
                            </View>
                            <View style={{
                                flex: 0.1,
                            }}/>
                            <View style={{
                                flex: 1,
                                maxHeight: 180,
                            }}>

                                <View style={{
                                    height: 70,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Image source={require('BiziboxUI/assets/land_2.png')}/>
                                </View>

                                <Text style={{
                                    color: '#000000',
                                    fontFamily: fonts.semiBold,
                                    textAlign: 'center',
                                    fontSize: sp(19),
                                }}>
                                    רק 3 דקות ביום
                                </Text>

                                <Text style={{
                                    color: '#000000',
                                    fontFamily: fonts.light,
                                    textAlign: 'center',
                                    fontSize: sp(18),
                                }}>
                                    מערכת ידידותית וקלה לשימוש להפקת תזרים מזומנים עתידי
                                </Text>
                            </View>
                        </View>

                        <View style={{
                            maxHeight: 180,
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignContent: 'center',
                            marginTop: 10,
                        }}>

                            <View style={{
                                width: 227,
                                alignSelf: 'center',
                            }}>
                                <View style={{
                                    height: 70,
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignContent: 'center',
                                    alignItems: 'center',
                                }}>
                                    <Image source={require('BiziboxUI/assets/land_3.png')}/>
                                </View>

                                <Text style={{
                                    color: '#000000',
                                    fontFamily: fonts.semiBold,
                                    textAlign: 'center',
                                    fontSize: sp(19),
                                }}>
                                    התראות חכמות
                                </Text>

                                <Text style={{
                                    color: '#000000',
                                    fontFamily: fonts.light,
                                    textAlign: 'center',
                                    fontSize: sp(18),
                                }}>
                                    המערכת החכמה מזהה
                                    חריגות בחשבון ובהוצאות ומדווחת בשוטף!
                                </Text>
                            </View>

                        </View>

                        <Text style={{
                            color: '#acacac',
                            fontFamily: fonts.regular,
                            textAlign: 'center',
                            fontSize: sp(14),
                            marginBottom: 10,
                            marginTop: 20,
                        }}>
                            © כל הזכויות שמורות, איי-פקט בע"מ 2020
                        </Text>
                    </View>
                </KeyboardAwareScrollView>

                {alertModal && (
                    <Animated.View
                        style={{
                            opacity: fadeAnim,
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 9,
                            height: '100%',
                            width: '100%',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}>
                        <View style={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            left: 0,
                            top: 0,
                            zIndex: 9,
                            height: '100%',
                            width: '100%',
                            backgroundColor: '#777777',
                            opacity: 0.7,
                        }}
                        />
                        <View style={{
                            height: 240,
                            width: 360,
                            marginTop: 50,
                            backgroundColor: '#ffffff',
                            zIndex: 10,
                            shadowColor: '#a0a0a0',
                            shadowOffset: {width: 0, height: 0},
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 2,
                            paddingHorizontal: 10,
                            paddingVertical: 8,
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <View style={{
                                borderColor: '#56bce9',
                                borderWidth: 1,
                                flex: 1,
                                paddingVertical: 5,
                                paddingHorizontal: 15,
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                            }}>
                                <Image
                                    resizeMode="contain"
                                    style={[
                                        {
                                            width: 69,
                                            height: 67,
                                            marginVertical: 15,
                                            marginTop: 30,
                                        }]}
                                    source={require('BiziboxUI/assets/iconVSignUp.png')}
                                />
                                <Text style={{
                                    color: '#0f3860',
                                    fontSize: sp(23),
                                    fontFamily: fonts.bold,
                                    textAlign: 'center',
                                    paddingBottom: 10,
                                }}>
                                    תודה, הפרטים התקבלו בהצלחה!
                                </Text>
                                <Text style={{
                                    color: '#0f3860',
                                    fontSize: sp(19),
                                    fontFamily: fonts.regular,
                                    textAlign: 'center',
                                }}>
                                    נציגנו יצרו קשר בהקדם
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                )}
            </SafeAreaView>
        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    image: {
        flex: 1,
        resizeMode: 'contain',
        justifyContent: 'flex-end',
        height: 326,
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        paddingBottom: 10,
    },
    scrollView: {
        flex: 1,
        marginHorizontal: 0,
        flexDirection: 'column',
    },
    textBold: {
        alignSelf: 'center',
        fontSize: sp(26),
        color: '#ffffff',
        fontFamily: fonts.bold,
        paddingBottom: 10,
    },
    text: {
        alignSelf: 'center',
        fontSize: sp(16.5),
        color: '#ffffff',
        fontFamily: fonts.semiBold,
    },
    titleForm: {
        alignSelf: 'center',
        fontSize: sp(23),
        color: '#010101',
        fontFamily: fonts.semiBold,
        paddingBottom: 20,
    },


});
