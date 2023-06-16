import React, {Fragment, PureComponent} from 'react'
import {
    Animated,
    BackHandler,
    Dimensions,
    Image,
    Keyboard,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    SafeAreaView,
} from 'react-native'
// import {SafeAreaView} from 'react-native-safe-area-context';
import {connect} from 'react-redux'
import {withTranslation} from 'react-i18next'
import commonStyles from '../../styles/styles'
import {combineStyles as cs, getEmoji, getErrText, goToBack, sp} from '../../utils/func'
import {getQuestionsAnswersApi, getTermsApi, openTicketApi} from 'src/api'
import Accordion from 'react-native-collapsible/Accordion'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {colors, fonts} from '../../styles/vars'
import {Button, Icon} from 'react-native-elements'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import Carousel from 'react-native-snap-carousel'
import jwtDecode from 'jwt-decode'
import {IS_IOS} from '../../constants/common'
import Loader from '../../components/Loader/Loader'
import CustomIcon from '../../components/Icons/Fontello'
import {setOpenedBottomSheet} from '../../redux/actions/user'

const SLIDER_1_FIRST_ITEM = 2
const AnimatedIcon = Animated.createAnimatedComponent(Icons)
export const ENTRIES1 = [
    {
        data: [
            {
                name: 'תקציב',
                link: 'budget',
            },
            {
                name: 'מוטבים',
                link: 'mutavim',
            },
            {
                name: 'הגדרות',
                link: 'settings',
            },
        ],
    },
    {
        data: [
            {
                name: 'כרטיסי אשראי',
                link: 'creditCard',
            },
            {
                name: 'חשבונות סליקה',
                link: 'slika',
            },
            {
                name: 'צ׳קים',
                link: 'checks',
            },
            {
                name: 'סקירה כללית',
                link: 'overview',
            },
        ],
    },
    {
        data: [
            {
                name: 'תזרים מזומנים',
                link: 'cashflow',
            },
            {
                name: 'חשבונות בנק',
                link: 'bankAccount',
            },
            {
                name: 'התאמות בנקים',
                link: 'bankmatch',
            },
            {
                name: 'תנועות קבועות',
                link: 'fixedMovements',
            },
        ],
    },
]
const {width: viewportWidth} = Dimensions.get('window')

function wp(percentage) {
    const value = (percentage * viewportWidth) / 100
    return Math.round(value)
}

const slideWidth = wp(75)
const itemHorizontalMargin = wp(2)

export const sliderWidth = viewportWidth
export const itemWidth = slideWidth + itemHorizontalMargin * 2

@connect(state => ({
    user: state.user,
    currentCompanyId: state.currentCompanyId,
    isRtl: state.isRtl,
    token: state.token,
    companies: state.companies,
}))
@withTranslation()
export default class HelpScreen extends PureComponent {
    constructor(props) {
        super(props)

        let username
        try {
            const decodedToken = jwtDecode(this.props.token)
            username = decodedToken && decodedToken.sub
        } catch (e) {
            username = null
        }

        this.state = {
            activeSections: [],
            questionsAnswers: [],
            questionsAnswersFilter: [],
            terms: [],
            termsFilter: [],
            multipleSelect: false,
            refreshing: false,
            valSearch: '',
            screen: null,
            inProgress: true,
            openModalTicket: false,
            userCellPhone: '',
            taskOpenerName: props.user.userName,
            taskTitle: '',
            taskDesc: '',
            closeMailToSend: username,
            cellValid: true,
            mailValid: true,
            mailIsHebrew: false,
            taskOpenerNameValid: true,
            taskTitleValid: true,
            taskDescValid: true,
            successSend: false,
            slider1ActiveSlide: SLIDER_1_FIRST_ITEM,
            valTermsSearch: '',
            openModalTerms: false,
            inProgressTerms: true,
        }
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
        this.getQuestionsAnswers()
    }

    handleBackPress = () => {
        this.props.dispatch(setOpenedBottomSheet(false))

        goToBack(this.props.navigation)
        return true
    }

    getQuestionsAnswers = () => {
        // getQuestionsAnswersApi.get()

        const {companies, currentCompanyId} = this.props
        if (!companies || !companies.length) {
            return {}
        }
        const currentCompany = companies && companies.length &&
            companies.find(c => c.companyId === currentCompanyId)
        getQuestionsAnswersApi.post({
            body: {
                biziboxType: currentCompany.biziboxType,
            },
        })
            .then(data => {
                if (!this.state.screen) {
                    this.setState({
                        questionsAnswers: data,
                        questionsAnswersFilter: data,
                        inProgress: false,
                    })
                } else {
                    this.setState({questionsAnswers: data})
                    this.handleSendSearch()
                }
            })
            .catch((err) => this.setState({
                isReady: true,
                error: getErrText(err),
            }))
    }

    _renderHeader = (section, _, isActive) => {
        return (
            <View style={[
                styles.header, (isActive ? styles.active : styles.inactiveHedaer), {
                    flexDirection: 'row-reverse',
                    paddingLeft: 15,
                    paddingRight: 25,
                }]}>
                <AnimatedIcon
                    size={18}
                    name={isActive ? 'chevron-up' : 'chevron-down'}
                    color={'#022258'}
                />
                <View style={commonStyles.spaceDivider}/>
                <Text style={styles.headerText}>{section.question
                    ? section.question.replace(/\n/ig, '')
                    : ''}</Text>
            </View>
        )
    }

    _renderContent = (section, _, isActive) => {
        return (
            <View
                style={[styles.content, isActive ? styles.active : styles.inactive]}>
                <Text style={{
                    fontSize: sp(15),
                    color: '#022258',
                    fontFamily: fonts.regular,
                    textAlign: 'right',
                }}>{section.answer ? section.answer.replace(/\n/ig, '') : ''}</Text>
            </View>
        )
    }

    _updateSections = activeSections => {
        this.setState({activeSections})
    }

    _onRefresh = () => {
        this.setState({
            refreshing: true,
            inProgress: true,
        })
        this.getQuestionsAnswers()
        setTimeout(() => {
            this.setState({
                refreshing: false,
                inProgress: false,
            })
        }, 1000)
    }

    handleSearch = value => {
        this.setState({
            valSearch: value,
            inProgress: true,
        })
        setTimeout(() => {
            this.handleSendSearch()
        }, 50)
    }
    handleSearchEnd = (e) => {
        this.setState({
            valSearch: e.nativeEvent.text,
            inProgress: true,
        })
        setTimeout(() => {
            this.handleSendSearch()
        }, 50)
    }
    handleSendSearch = () => {
        const {valSearch, questionsAnswers, screen} = this.state
        if (!screen) {
            if (valSearch && valSearch.length) {
                const filterSearch = questionsAnswers.filter((item) => {
                    return (item.question.split(' ')
                            .some((key) => valSearch.includes(key)) ||
                        item.keywords.some((key) => valSearch.includes(key.keyword)))
                })
                this.setState({
                    questionsAnswersFilter: filterSearch,
                    inProgress: false,
                })
            } else {
                this.setState({
                    inProgress: false,
                    questionsAnswersFilter: questionsAnswers,
                })
            }
        } else {
            if (valSearch && valSearch.length) {
                const filterSearch = questionsAnswers.filter((item) => {
                    return item.screens.some((key) => key.screenName === screen) &&
                        (
                            item.question.split(' ').some((key) => valSearch.includes(key)) ||
                            item.keywords.some((key) => valSearch.includes(key.keyword))
                        )
                })
                this.setState({
                    inProgress: false,
                    questionsAnswersFilter: filterSearch,
                })
            } else {
                const filterScreen = questionsAnswers.filter((item) => {
                    return item.screens.some((key) => key.screenName === screen)
                })
                this.setState({
                    inProgress: false,
                    questionsAnswersFilter: filterScreen,
                })
            }
        }
    }

    handleSetScreen = (screen) => () => {
        const {questionsAnswers, terms} = this.state
        if (screen) {
            const filterScreen = questionsAnswers.filter((item) => {
                return item.screens.some((key) => key.screenName === screen)
            })
            const filterScreenTerms = terms.filter((item) => {
                return item.screens.some((key) => key.screenName === screen)
            })

            this.setState({
                screen,
                questionsAnswersFilter: filterScreen,
                terms: filterScreenTerms,
                inProgress: false,
                inProgressTerms: false,
            })
        } else {
            this.setState({
                screen,
                inProgress: true,
                inProgressTerms: true,
            })
            setTimeout(() => {
                this.handleSendSearch()
                this.handleSendSearchTerms()
            }, 50)
        }
    }

    openModalTicket = () => {
        let username
        try {
            const decodedToken = jwtDecode(this.props.token)
            username = decodedToken && decodedToken.sub
        } catch (e) {
            username = null
        }
        this.setState({
            openModalTicket: true,
            userCellPhone: '',
            taskOpenerName: this.props.user.userName,
            taskTitle: '',
            taskDesc: '',
            closeMailToSend: username,
            cellValid: true,
            mailValid: true,
            mailIsHebrew: false,
            taskOpenerNameValid: true,
            taskTitleValid: true,
            taskDescValid: true,
        })
    }
    closeModalTicket = () => {
        this.setState({
            openModalTicket: false,
        })
    }

    handleUpdate = () => {
        const {
            inProgress,
            userCellPhone,
            taskOpenerName,
            taskTitle,
            taskDesc,
            closeMailToSend,
            cellValid,
            mailValid,
        } = this.state

        if (inProgress || !(
            String(taskDesc).length > 0 &&
            String(taskOpenerName).length > 0 &&
            String(taskTitle).length > 0 &&
            String(userCellPhone).length > 0 &&
            String(closeMailToSend).length > 0 &&
            cellValid &&
            mailValid
        )) {
            return
        }

        Keyboard.dismiss()
        this.setState({inProgress: true})
        openTicketApi.post({
            body: {
                userCellPhone,
                taskOpenerName,
                taskTitle,
                taskDesc,
                closeMailToSend,
                companyId: this.props.currentCompanyId,
            },
        })
            .then(() => {
                this.setState({
                    inProgress: false,
                    successSend: true,
                })
            })
            .catch(() => {
                this.setState({inProgress: false})
                this.closeModalTicket()
            })
    }

    handleUpdateFields = name => val => {
        let value = val || ''
        if (name === 'taskOpenerName' ||
            name === 'taskTitle' ||
            name === 'taskDesc'
        ) {
            value = value.toString().replace(getEmoji(), '')
        } else {
            value = value.toString().replace(getEmoji(), '').replace(/\s+/g, '')
        }

        if (name === 'userCellPhone') {
            const values = value.toString().replace(/[^\d-]/g, '')
            this.setState({[name]: values})
            this.handleUpdateFieldValid('cellValid')({
                nativeEvent: {
                    text: values,
                },
            })
        } else if (name === 'mail') {
            this.setState({[name]: value})
            this.handleUpdateFieldValid('mailValid')({
                nativeEvent: {
                    text: value,
                },
            })
        } else {
            this.setState({[name]: value})
            this.handleUpdateFieldValid(`${name}Valid`)({
                nativeEvent: {
                    text: value,
                },
            })
        }
    }
    handleUnhandledTouches(){
        Keyboard.dismiss
        return false;
    }
    handleUpdateFieldValid = name => val => {
        let value = val.nativeEvent.text || ''

        if (name === 'mailValid') {
            const re = /\S+@\S+\.\S+/
            const isHebrew = (value && /[\u0590-\u05FF]/.test(value))
            const mailValid = (value && re.test(value) && value.length > 0)
            this.setState({
                [name]: mailValid,
                mailIsHebrew: isHebrew,
            })
        } else if (name === 'cellValid') {
            this.setState({
                [name]: value && (value.length === 10 || value.length === 11) &&
                new RegExp(
                    '(050|052|053|054|055|057|058|02|03|04|08|09|072|073|076|077|078)-?\\d{7,7}').test(
                    value),
            })
        } else {
            this.setState({[name]: value && (value.length !== 0)})
        }
    }

    _renderItem = ({item}) => {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
            }}>
                <View style={{
                    flexDirection: 'row-reverse',
                    marginVertical: 7,
                    marginHorizontal: 10,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <TouchableOpacity
                        onPress={this.handleSetScreen(item.data[0].link)}
                        style={{
                            flex: 325,
                            height: 105,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            shadowColor: '#000000',
                            shadowOpacity: 0.2,
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            elevation: 4,
                            borderRadius: 10,
                            alignContent: 'center',
                            justifyContent: 'center',
                        }}>
                        {item.data[0].link === 'cashflow' && (
                            <Image
                                style={[
                                    {
                                        alignSelf: 'center',
                                        resizeMode: 'contain',
                                        height: 40,
                                    }]}
                                source={require('BiziboxUI/assets/cashflow.png')}
                            />
                        )}
                        {item.data[0].link === 'creditCard' && (
                            <Image
                                style={[
                                    {
                                        alignSelf: 'center',
                                        resizeMode: 'contain',
                                        height: 40,
                                    }]}
                                source={require('BiziboxUI/assets/creditCard.png')}
                            />
                        )}
                        {item.data[0].link === 'budget' && (
                            <CustomIcon
                                name={'budget'}
                                size={40}
                                style={{
                                    height: 40,
                                    alignSelf: 'center',
                                    resizeMode: 'contain',
                                }}
                                color={'#022258'}
                            />
                        )}
                        <Text style={{
                            fontFamily: fonts.regular,
                            fontSize: sp(15),
                            textAlign: 'center',
                            color: '#022258',
                            paddingTop: 10,
                        }}>{item.data[0].name}</Text>
                    </TouchableOpacity>
                    <View style={{
                        flex: 25,
                        height: 105,
                    }}/>
                    <TouchableOpacity
                        onPress={this.handleSetScreen(item.data[1].link)}
                        style={{
                            flex: 325,
                            height: 105,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            shadowColor: '#000000',
                            shadowOpacity: 0.2,
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            elevation: 4,
                            borderRadius: 10,
                            alignContent: 'center',
                            justifyContent: 'center',
                        }}>
                        {item.data[1].link === 'bankAccount' && (
                            <Image
                                style={[
                                    {
                                        alignSelf: 'center',
                                        resizeMode: 'contain',
                                        height: 40,
                                    }]}
                                source={require('BiziboxUI/assets/bankAccount.png')}
                            />
                        )}
                        {item.data[1].link === 'slika' && (
                            <Image
                                style={[
                                    {
                                        alignSelf: 'center',
                                        resizeMode: 'contain',
                                        height: 40,
                                    }]}
                                source={require('BiziboxUI/assets/slika.png')}
                            />
                        )}
                        {item.data[1].link === 'mutavim' && (
                            <CustomIcon
                                name={'mutavim'}
                                size={60}
                                style={{
                                    height: 40,
                                    alignSelf: 'center',
                                    resizeMode: 'contain',
                                }}
                                color={'#022258'}
                            />
                        )}
                        <Text style={{
                            fontFamily: fonts.regular,
                            fontSize: sp(15),
                            textAlign: 'center',
                            color: '#022258',
                            paddingTop: 10,
                        }}>{item.data[1].name}</Text>
                    </TouchableOpacity>
                </View>

                <View style={{
                    flexDirection: 'row-reverse',
                    marginVertical: 7,
                    marginHorizontal: 10,
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>
                    <TouchableOpacity
                        onPress={this.handleSetScreen(item.data[2].link)}
                        style={{
                            flex: 325,
                            height: 105,
                            backgroundColor: 'white',
                            alignItems: 'center',
                            shadowColor: '#000000',
                            shadowOpacity: 0.2,
                            shadowOffset: {
                                width: 0,
                                height: 2,
                            },
                            elevation: 4,
                            borderRadius: 10,
                            alignContent: 'center',
                            justifyContent: 'center',
                        }}>
                        {item.data[2].link === 'bankmatch' && (
                            <Image
                                style={[
                                    {
                                        alignSelf: 'center',
                                        resizeMode: 'contain',
                                        height: 40,
                                    }]}
                                source={require('BiziboxUI/assets/bankmatch.png')}
                            />
                        )}
                        {item.data[2].link === 'checks' && (
                            <Image
                                style={[
                                    {
                                        alignSelf: 'center',
                                        resizeMode: 'contain',
                                        height: 40,
                                    }]}
                                source={require('BiziboxUI/assets/checks.png')}
                            />
                        )}
                        {item.data[2].link === 'settings' && (
                            <CustomIcon
                                name={'settings'}
                                size={40}
                                style={{
                                    height: 40,
                                    alignSelf: 'center',
                                    resizeMode: 'contain',
                                }}
                                color={'#022258'}
                            />
                        )}
                        <Text style={{
                            fontFamily: fonts.regular,
                            fontSize: sp(15),
                            textAlign: 'center',
                            color: '#022258',
                            paddingTop: 10,
                        }}>{item.data[2].name}</Text>
                    </TouchableOpacity>
                    <View style={{
                        flex: 25,
                        height: 105,
                    }}/>
                    {item.data[3] ? (
                        <TouchableOpacity
                            onPress={this.handleSetScreen(item.data[3].link)}
                            style={{
                                flex: 325,
                                height: 105,
                                backgroundColor: 'white',
                                alignItems: 'center',
                                shadowColor: '#000000',
                                shadowOpacity: 0.2,
                                shadowOffset: {
                                    width: 0,
                                    height: 2,
                                },
                                elevation: 4,
                                borderRadius: 10,
                                alignContent: 'center',
                                justifyContent: 'center',
                            }}>
                            {item.data[3].link === 'fixedMovements' && (
                                <Image
                                    style={[
                                        {
                                            alignSelf: 'center',
                                            resizeMode: 'contain',
                                            height: 40,
                                        }]}
                                    source={require('BiziboxUI/assets/fixedMovements.png')}
                                />
                            )}
                            {item.data[3].link === 'overview' && (
                                <Image
                                    style={[
                                        {
                                            alignSelf: 'center',
                                            resizeMode: 'contain',
                                            height: 40,
                                        }]}
                                    source={require('BiziboxUI/assets/overview.png')}
                                />
                            )}
                            <Text style={{
                                fontFamily: fonts.regular,
                                fontSize: sp(15),
                                textAlign: 'center',
                                color: '#022258',
                                paddingTop: 10,
                            }}>{item.data[3].name}</Text>
                        </TouchableOpacity>
                    ) : (
                        <View
                            style={{
                                flex: 325,
                                height: 105,
                            }}/>
                    )}
                </View>
            </View>
        )
    }

    getTerms = () => {
        // getTermsApi.get()

        this.setState({openModalTerms: true})
        const {companies, currentCompanyId} = this.props
        if (!companies || !companies.length) {
            return {}
        }
        const currentCompany = companies && companies.length &&
            companies.find(c => c.companyId === currentCompanyId)
        getTermsApi.post({
            body: {
                biziboxType: currentCompany.biziboxType,
            },
        })
            .then(data => {
                if (!this.state.screen) {
                    this.setState({
                        terms: data,
                        termsFilter: data,
                        inProgressTerms: false,
                    })
                } else {
                    this.setState({terms: data})
                    this.handleSendSearchTerms()
                }
            })
            .catch((err) => this.setState({
                isReady: true,
                error: getErrText(err),
            }))
    }

    closeModalTerms = () => {
        this.setState({
            openModalTerms: false,
            terms: [],
            termsFilter: [],
        })
    }

    handleSearchTerms = value => {
        this.setState({
            valTermsSearch: value,
            inProgressTerms: true,
        })
        setTimeout(() => {
            this.handleSendSearchTerms()
        }, 50)
    }
    handleSearchEndTerms = (e) => {
        this.setState({
            valTermsSearch: e.nativeEvent.text,
            inProgressTerms: true,
        })
        setTimeout(() => {
            this.handleSendSearchTerms()
        }, 50)
    }
    handleSendSearchTerms = () => {
        const {valTermsSearch, terms, screen} = this.state
        if (!screen) {
            if (valTermsSearch && valTermsSearch.length) {
                const filterSearch = terms.filter((item) => {
                    return (item.subject.split(' ')
                            .some((key) => valTermsSearch.includes(key)) ||
                        item.keywords.some((key) => valTermsSearch.includes(key.keyword)))
                })
                this.setState({
                    termsFilter: filterSearch,
                    inProgressTerms: false,
                })
            } else {
                this.setState({
                    inProgressTerms: false,
                    termsFilter: terms,
                })
            }
        } else {
            if (valTermsSearch && valTermsSearch.length) {
                const filterSearch = terms.filter((item) => {
                    return item.screens.some((key) => key.screenName === screen) &&
                        (
                            item.subject.split(' ')
                                .some((key) => valTermsSearch.includes(key)) ||
                            item.keywords.some((key) => valTermsSearch.includes(key.keyword))
                        )
                })
                this.setState({
                    inProgressTerms: false,
                    termsFilter: filterSearch,
                })
            } else {
                const filterScreen = terms.filter((item) => {
                    return item.screens.some((key) => key.screenName === screen)
                })
                this.setState({
                    inProgressTerms: false,
                    termsFilter: filterScreen,
                })
            }
        }
    }

    render() {
        const {
            questionsAnswersFilter,
            multipleSelect,
            refreshing,
            valSearch,
            screen,
            inProgress,
            openModalTicket,
            userCellPhone,
            taskOpenerName,
            taskTitle,
            taskDesc,
            closeMailToSend,
            mailValid,
            cellValid,
            mailIsHebrew,
            taskOpenerNameValid,
            taskTitleValid,
            taskDescValid,
            successSend,
            termsFilter,
            valTermsSearch,
            openModalTerms,
            inProgressTerms,
        } = this.state
        const {t, isRtl} = this.props

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
                    <View>
                        <Text style={{
                            fontFamily: fonts.semiBold,
                            fontSize: sp(24),
                            color: '#022258',
                            textAlign: 'center',
                            paddingBottom: 20,
                            paddingTop: 15,
                        }}>{'במה נוכל לעזור?'}</Text>
                        <View style={{
                            width: '100%',
                        }}>
                            <View style={{
                                marginHorizontal: 35,
                                borderBottomColor: '#6b6b6c',
                                borderBottomWidth: 1,
                                height: 40,
                                marginBottom: 20,
                                flexDirection: 'row-reverse',
                                justifyContent: 'space-between',
                            }}>
                                <TextInput
                                    onSubmitEditing={this.handleSendSearch}
                                    onEndEditing={this.handleSearchEnd}
                                    placeholder={'הקלידו טקסט לחיפוש'}
                                    placeholderTextColor="#202020"
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                    keyboardType="default"
                                    underlineColorAndroid="transparent"
                                    style={[
                                        {
                                            height: 35,
                                            flex: 1,
                                            fontFamily: fonts.regular,
                                            color: '#6b6b6c',
                                            textAlign: 'right',
                                            fontSize: sp(14),
                                            backgroundColor: 'transparent',
                                        },
                                    ]}
                                    onChangeText={this.handleSearch}
                                    value={valSearch}
                                />
                                <TouchableOpacity
                                    style={{
                                        marginTop: 7,
                                    }}
                                    onPress={this.handleSendSearch}>
                                    <Icons
                                        name="magnify"
                                        type="material-community"
                                        size={24}
                                        color="#6b6b6c"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <KeyboardAwareScrollView
                        enableOnAndroid
                        directionalLockEnabled
                        scrollEnabled
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={this._onRefresh}
                            />
                        }
                        enableAutomaticScroll
                        extraScrollHeight={42}
                        extraHeight={42}
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
                            }]}>

                        {(screen) && (
                            <View style={{
                                flexDirection: 'row-reverse',
                                alignContent: 'center',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 10,
                            }}>
                                <TouchableOpacity
                                    style={{
                                        paddingLeft: 5,
                                    }}
                                    onPress={this.handleSetScreen(null)}>
                                    <Icon name="chevron-right" size={24} color={'#022258'}/>
                                </TouchableOpacity>
                                {screen === 'fixedMovements' && (
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 25,
                                            }]}
                                        source={require('BiziboxUI/assets/fixedMovements.png')}
                                    />
                                )}
                                {screen === 'overview' && (
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 25,
                                            }]}
                                        source={require('BiziboxUI/assets/overview.png')}
                                    />
                                )}
                                {screen === 'bankmatch' && (
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 25,
                                            }]}
                                        source={require('BiziboxUI/assets/bankmatch.png')}
                                    />
                                )}
                                {screen === 'checks' && (
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 25,
                                            }]}
                                        source={require('BiziboxUI/assets/checks.png')}
                                    />
                                )}
                                {screen === 'bankAccount' && (
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 25,
                                            }]}
                                        source={require('BiziboxUI/assets/bankAccount.png')}
                                    />
                                )}
                                {screen === 'slika' && (
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 25,
                                            }]}
                                        source={require('BiziboxUI/assets/slika.png')}
                                    />
                                )}
                                {screen === 'cashflow' && (
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 25,
                                            }]}
                                        source={require('BiziboxUI/assets/cashflow.png')}
                                    />
                                )}
                                {screen === 'creditCard' && (
                                    <Image
                                        style={[
                                            {
                                                alignSelf: 'center',
                                                resizeMode: 'contain',
                                                width: 25,
                                            }]}
                                        source={require('BiziboxUI/assets/creditCard.png')}
                                    />
                                )}
                                {screen === 'budget' && (
                                    <CustomIcon
                                        name={'budget'}
                                        size={25}
                                        style={{
                                            alignSelf: 'center',
                                            resizeMode: 'contain',
                                            width: 25,
                                        }}
                                        color={'#022258'}
                                    />
                                )}
                                {screen === 'mutavim' && (
                                    <CustomIcon
                                        name={'mutavim'}
                                        size={25}
                                        style={{
                                            alignSelf: 'center',
                                            resizeMode: 'contain',
                                            width: 25,
                                        }}
                                        color={'#022258'}
                                    />
                                )}
                                {screen === 'settings' && (
                                    <CustomIcon
                                        name={'settings'}
                                        size={25}
                                        style={{
                                            alignSelf: 'center',
                                            resizeMode: 'contain',
                                            width: 25,
                                        }}
                                        color={'#022258'}
                                    />
                                )}
                                <Text style={{
                                    paddingRight: 10,
                                    fontFamily: fonts.regular,
                                    fontSize: sp(20),
                                    color: '#022258',
                                }}>{t(`screenHelp:${screen}`)}</Text>
                            </View>
                        )}

                        {(!inProgress && questionsAnswersFilter.length === 0 &&
                            valSearch.length > 0) && (
                            <View>
                                <Image
                                    style={[
                                        {
                                            width: 42,
                                            height: 47.5,
                                            marginBottom: 5,
                                            alignSelf: 'center',
                                        }]}
                                    source={require('BiziboxUI/assets/helpNotResults.png')}
                                />
                                <Text style={{
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(16),
                                    textAlign: 'center',
                                    color: '#022258',
                                }}>{'מצטערים,'}</Text>
                                <Text style={{
                                    fontFamily: fonts.regular,
                                    fontSize: sp(15),
                                    textAlign: 'center',
                                    color: '#022258',
                                }}>{'לא נמצאו תוצאות שרלוונטיות לחיפוש “'}{valSearch}{'”.'}</Text>
                                <Text style={{
                                    fontFamily: fonts.regular,
                                    fontSize: sp(15),
                                    textAlign: 'center',
                                    color: '#022258',
                                    paddingBottom: 20,
                                }}>{'אפשר לחפש ביטוי אחר או לפתוח קריאת שירות.'}</Text>
                            </View>
                        )}

                        {(!inProgress && questionsAnswersFilter.length === 0 &&
                            valSearch.length === 0) && (
                            <View>
                                <Image
                                    style={[
                                        {
                                            width: 42,
                                            height: 47.5,
                                            marginBottom: 5,
                                            alignSelf: 'center',
                                        }]}
                                    source={require('BiziboxUI/assets/helpNotResults.png')}
                                />
                                <Text style={{
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(16),
                                    textAlign: 'center',
                                    color: '#022258',
                                }}>{'מצטערים,'}</Text>
                                <Text style={{
                                    fontFamily: fonts.regular,
                                    fontSize: sp(15),
                                    textAlign: 'center',
                                    color: '#022258',
                                }}>{'לא נמצאו שאלות בנושא זה.'}</Text>
                            </View>
                        )}

                        {!screen &&
                            (questionsAnswersFilter.length === 0 || valSearch.length === 0) && (
                                <View>
                                    <Carousel
                                        slideHeight={230}
                                        ref={(c) => {
                                            this._carousel = c
                                        }}
                                        data={ENTRIES1}
                                        handleSetScreen={this.handleSetScreen}
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
                                        // loopClonesPerSide={2}
                                        autoplay={false}
                                        onSnapToItem={(index) => this.setState(
                                            {slider1ActiveSlide: index})}
                                    />
                                </View>
                            )}

                        <Accordion
                            align="center"
                            sections={questionsAnswersFilter}
                            duration={0}
                            touchableComponent={TouchableOpacity}
                            activeSections={this.state.activeSections}
                            renderHeader={this._renderHeader}
                            renderContent={this._renderContent}
                            onChange={this._updateSections}
                            expandMultiple={multipleSelect}
                        />

                        <TouchableOpacity
                            onPress={this.getTerms}
                            style={{
                                height: 27,
                                marginVertical: 20,
                                backgroundColor: '#d9e7ee',
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'flex-start',
                                flexDirection: 'row-reverse',
                                paddingHorizontal: 35,
                            }}>
                            <Text style={{
                                fontFamily: fonts.semiBold,
                                fontSize: sp(16),
                                textAlign: 'right',
                                color: '#022258',
                            }}>{'מילון מונחים'}</Text>
                            <Icon name="chevron-left" size={18} color={'#022258'}/>
                        </TouchableOpacity>

                        <View style={[
                            {
                                // borderTopColor: '#f2f2f2',
                                // borderTopWidth: 1,
                                height: 52,
                                backgroundColor: 'white',
                                alignItems: 'center',
                                // shadowColor: '#f2f2f2',
                                // shadowOpacity: 1,
                                // shadowOffset: { width: 0, height: -4 },
                                // elevation: 4,
                                marginTop: 15,
                                marginBottom: 40,
                            }]}>
                            <Button
                                buttonStyle={[
                                    {
                                        marginTop: 10,
                                        height: 42,
                                        borderRadius: 6,
                                        backgroundColor: '#022258',
                                        width: 223,
                                    }]}
                                titleStyle={{
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(17),
                                    textAlign: 'center',
                                }}
                                onPress={this.openModalTicket}
                                title={'פתיחת קריאת שירות'}
                            />
                        </View>

                    </KeyboardAwareScrollView>

                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={openModalTicket}
                        onRequestClose={() => {
                            // console.log('Modal has been closed.')
                        }}>
                        <SafeAreaView
                            style={{
                            flex: 1,
                            marginTop: 0,
                            paddingTop: 0,
                            position: 'relative',
                        }}>
                            <View style={[
                                {
                                    height: 68,
                                    backgroundColor: '#002059',
                                    width: '100%',
                                    paddingTop: 0,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    // alignItems: 'center',
                                    // alignSelf: 'center',
                                    // alignContent: 'center',
                                    justifyContent: 'center',
                                }, cs(
                                    !isRtl,
                                    [
                                        {
                                            flexDirection: 'row',
                                        }],
                                    commonStyles.rowReverse,
                                )]}>
                                <View style={{
                                    flex: 0.5,
                                }}/>
                                <View style={{
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    flex: 1,
                                }}>
                                    <Text
                                        style={{
                                            fontSize: sp(20),
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                            textAlign: 'center',
                                        }}>
                                        {'פתיחת קריאת שירות'}
                                    </Text>
                                </View>
                                <View style={{
                                    flex: 0.5,
                                    alignItems: 'flex-end',
                                    alignSelf: 'center',
                                }}>
                                    <TouchableOpacity
                                        onPress={this.closeModalTicket}>
                                        <Text style={{
                                            fontSize: sp(16),
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                        }}>{successSend ? 'סגירה' : 'ביטול'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <KeyboardAwareScrollView
                                enableOnAndroid
                                contentContainerStyle={{
                                    width: '100%',
                                    marginTop: 20,
                                    marginBottom: 0,
                                    flexGrow: 1,
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    alignContent: 'center',
                                }}
                                style={{
                                    height: '100%',
                                    width: '100%',
                                    marginTop: 0,
                                    marginBottom: 0,
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                    flex: 1,
                                }}>
                                {successSend && (
                                    <Fragment>
                                        <Image
                                            style={[
                                                {
                                                    width: 185 / 2,
                                                    height: 165 / 2,
                                                    marginBottom: 25,
                                                    marginTop: 15,
                                                    alignSelf: 'center',
                                                }]}
                                            source={require('BiziboxUI/assets/successSendTicket.png')}
                                        />
                                        <Text style={{
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(20),
                                            textAlign: 'center',
                                            color: '#022258',
                                        }}>{'תודה על פנייתכם,'}</Text>
                                        <Text style={{
                                            fontFamily: fonts.regular,
                                            fontSize: sp(16),
                                            textAlign: 'center',
                                            color: '#022258',
                                        }}>{'קריאת שירות היא הדרך המהירה ביותר ליצור עמנו קשר.\n' +
                                            'קריאתכם נקלטה במערכת ותטופל בהקדם\n' +
                                            'האפשרי (לפי סדר הפונים).'}</Text>
                                    </Fragment>
                                )}
                                {!successSend && (
                                    <Fragment>
                                        <View
                                            style={[
                                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),
                                                {
                                                    height: 42,
                                                    marginBottom: 8,
                                                    marginLeft: 10,
                                                }]}>
                                            <View style={{flex: 3}}>
                                                <Text style={{
                                                    textAlign: 'right',
                                                    color: '#0f3860',
                                                    fontSize: sp(14),
                                                    fontFamily: fonts.regular,
                                                    lineHeight: 42,
                                                }}>נושא</Text>
                                            </View>
                                            <View style={[
                                                {
                                                    flex: 5.73,
                                                    backgroundColor: '#f5f5f5',
                                                    paddingHorizontal: 21,
                                                    borderBottomRightRadius: 20,
                                                    borderTopRightRadius: 20,
                                                    borderColor: colors.red,
                                                    borderWidth: (taskTitleValid) ? 0 : 1,
                                                }]}>
                                                <TextInput
                                                    editable
                                                    autoCorrect={false}
                                                    autoCapitalize="sentences"
                                                    returnKeyType="done"
                                                    keyboardType="default"
                                                    underlineColorAndroid="transparent"
                                                    style={[
                                                        {
                                                            textAlign: 'right',
                                                            color: '#0f3860',
                                                            height: 42,
                                                            fontSize: sp(15),
                                                            width: '100%',
                                                        }, commonStyles.regularFont]}
                                                    // onSubmitEditing={this.handleUpdate}
                                                    onChangeText={this.handleUpdateFields('taskTitle')}
                                                    onEndEditing={(e) => {
                                                        this.setState({
                                                            taskTitle: e.nativeEvent.text.toString()
                                                                .replace(getEmoji(), ''),
                                                        })
                                                        this.handleUpdateFieldValid('taskTitleValid')(e)
                                                    }}
                                                    onBlur={this.handleUpdateFieldValid('taskTitleValid')}
                                                    onSubmitEditing={() => {
                                                        Keyboard.dismiss()
                                                    }}
                                                    value={taskTitle}
                                                />
                                            </View>
                                        </View>

                                        <View
                                            style={[
                                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),
                                                {
                                                    height: 42,
                                                    marginBottom: (mailIsHebrew || !mailValid) ? 0 : 8,
                                                    marginLeft: 10,
                                                }]}>
                                            <View style={{flex: 3}}>
                                                <Text style={{
                                                    textAlign: 'right',
                                                    color: '#0f3860',
                                                    fontSize: sp(14),
                                                    fontFamily: fonts.regular,
                                                    lineHeight: 42,
                                                }}>מייל לחזרה</Text>
                                            </View>
                                            <View style={[
                                                {
                                                    flex: 5.73,
                                                    backgroundColor: '#f5f5f5',
                                                    paddingHorizontal: 21,
                                                    borderBottomRightRadius: 20,
                                                    borderTopRightRadius: 20,
                                                    borderWidth: (!mailValid) ? 1 : 0,
                                                    borderColor: colors.red,
                                                }]}>
                                                <TextInput
                                                    onEndEditing={this.handleUpdateFieldValid(
                                                        'mailValid')}
                                                    autoCorrect={false}
                                                    autoCapitalize="none"
                                                    returnKeyType="done"
                                                    keyboardType="email-address"
                                                    underlineColorAndroid="transparent"
                                                    style={[
                                                        styles.input,
                                                        {
                                                            color: '#0f3860',
                                                            height: 42,
                                                            fontSize: sp(15),
                                                            width: '100%',
                                                            fontFamily: fonts.regular,
                                                            fontWeight: 'normal',
                                                            textAlign: (!closeMailToSend ||
                                                                (closeMailToSend && closeMailToSend.length ===
                                                                    0)) ? 'right' : 'left',
                                                            backgroundColor: 'transparent',
                                                        },
                                                    ]}
                                                    // onSubmitEditing={this.handleUpdate}
                                                    onChangeText={this.handleUpdateFields(
                                                        'closeMailToSend')}
                                                    onBlur={this.handleUpdateFieldValid('mailValid')}
                                                    onSubmitEditing={() => {
                                                        Keyboard.dismiss()
                                                    }}
                                                    value={closeMailToSend}
                                                />
                                            </View>
                                        </View>

                                        <View style={{
                                            width: '100%',
                                            marginVertical: 0,
                                            flexDirection: 'row-reverse',
                                            marginBottom: (mailIsHebrew || !mailValid) ? 8 : 0,
                                            marginLeft: 10,
                                        }}>
                                            <View style={{flex: 3}}/>
                                            <View style={{
                                                flex: 5.73,
                                            }}>
                                                {(mailIsHebrew === true) && (
                                                    <Text style={[
                                                        {
                                                            width: '100%',
                                                            marginVertical: 0,
                                                            color: colors.red7,
                                                            fontSize: sp(14),
                                                            textAlign: 'right',
                                                            fontFamily: fonts.regular,
                                                        }]}>
                                                        {'שימו לב - המקלדת בעברית'}
                                                    </Text>
                                                )}

                                                {(mailValid === false) && (
                                                    <Text style={[
                                                        {
                                                            width: '100%',
                                                            marginVertical: 0,
                                                            color: colors.red7,
                                                            fontSize: sp(14),
                                                            textAlign: 'right',
                                                            fontFamily: fonts.regular,
                                                        }]}>
                                                        {'נראה שנפלה טעות במייל, אנא בדקו שנית'}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>

                                        <View
                                            style={[
                                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),
                                                {
                                                    height: 42,
                                                    marginBottom: 8,
                                                    marginLeft: 10,
                                                }]}>
                                            <View style={{flex: 3}}>
                                                <Text style={{
                                                    textAlign: 'right',
                                                    color: '#0f3860',
                                                    fontSize: sp(14),
                                                    fontFamily: fonts.regular,
                                                    lineHeight: 42,
                                                }}>שם פותח הקריאה</Text>
                                            </View>
                                            <View style={[
                                                {
                                                    flex: 5.73,
                                                    backgroundColor: '#f5f5f5',
                                                    paddingHorizontal: 21,
                                                    borderBottomRightRadius: 20,
                                                    borderTopRightRadius: 20,
                                                    borderColor: colors.red,
                                                    borderWidth: (taskOpenerNameValid) ? 0 : 1,
                                                }]}>
                                                <TextInput
                                                    editable
                                                    autoCorrect={false}
                                                    autoCapitalize="sentences"
                                                    returnKeyType="done"
                                                    keyboardType="default"
                                                    underlineColorAndroid="transparent"
                                                    style={[
                                                        {
                                                            textAlign: 'right',
                                                            color: '#0f3860',
                                                            height: 42,
                                                            fontSize: sp(15),
                                                            width: '100%',
                                                        }, commonStyles.regularFont]}
                                                    onChangeText={this.handleUpdateFields(
                                                        'taskOpenerName')}
                                                    onSubmitEditing={() => {
                                                        Keyboard.dismiss()
                                                    }}
                                                    // onSubmitEditing={this.handleUpdate}
                                                    onEndEditing={(e) => {
                                                        this.setState({
                                                            taskOpenerName: e.nativeEvent.text.toString()
                                                                .replace(getEmoji(), ''),
                                                        })
                                                        this.handleUpdateFieldValid('taskOpenerNameValid')(
                                                            e)
                                                    }}
                                                    onBlur={this.handleUpdateFieldValid('taskOpenerNameValid')}
                                                    value={taskOpenerName}
                                                />
                                            </View>
                                        </View>

                                        <View
                                            style={[
                                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),
                                                {
                                                    height: 42,
                                                    marginBottom: 8,
                                                    marginLeft: 10,
                                                }]}>
                                            <View style={{flex: 3}}>
                                                <Text style={{
                                                    textAlign: 'right',
                                                    color: '#0f3860',
                                                    fontSize: sp(14),
                                                    fontFamily: fonts.regular,
                                                    lineHeight: 42,
                                                }}>טלפון לחזרה</Text>
                                            </View>
                                            <View style={[
                                                {
                                                    flex: 5.73,
                                                    backgroundColor: '#f5f5f5',
                                                    paddingHorizontal: 21,
                                                    borderBottomRightRadius: 20,
                                                    borderTopRightRadius: 20,
                                                    borderColor: colors.red,
                                                    borderWidth: (cellValid) ? 0 : 1,
                                                }]}>
                                                <TextInput
                                                    maxLength={11}
                                                    autoCorrect={false}
                                                    autoCapitalize="none"
                                                    returnKeyType="done"
                                                    keyboardType="numeric"
                                                    underlineColorAndroid="transparent"
                                                    style={[
                                                        {
                                                            textAlign: (!userCellPhone ||
                                                                (userCellPhone && userCellPhone.length === 0))
                                                                ? 'right'
                                                                : 'left',
                                                            color: '#0f3860',
                                                            height: 42,
                                                            fontSize: sp(15),
                                                            width: '100%',
                                                        }, commonStyles.regularFont]}
                                                    onEndEditing={(e) => {
                                                        this.setState({
                                                            userCellPhone: e.nativeEvent.text.toString()
                                                                .replace(/[^\d-]/g, ''),
                                                        })
                                                        this.handleUpdateFieldValid('cellValid')(e)
                                                    }}
                                                    onBlur={this.handleUpdateFieldValid('cellValid')}
                                                    onSubmitEditing={() => {
                                                        Keyboard.dismiss()
                                                    }}
                                                    onChangeText={this.handleUpdateFields(
                                                        'userCellPhone')}
                                                    // onSubmitEditing={this.handleUpdate}
                                                    value={userCellPhone}
                                                />
                                            </View>
                                        </View>

                                        <View>
                                            <View style={[
                                                cs(isRtl, commonStyles.row, [commonStyles.rowReverse]),
                                                {
                                                    height: 42,
                                                }]}>
                                                <Text style={{
                                                    marginRight: 10,
                                                    textAlign: 'right',
                                                    color: '#0f3860',
                                                    fontSize: sp(14),
                                                    fontFamily: fonts.regular,
                                                    lineHeight: 42,
                                                }}>תיאור</Text>
                                            </View>
                                            <View style={[
                                                commonStyles.row, {
                                                    height: 100,
                                                    width: '100%',
                                                    marginBottom: 8,
                                                    backgroundColor: '#ffffff',
                                                    borderColor: (taskDescValid) ? '#0f3860' : colors.red,
                                                    borderWidth: 1,
                                                    paddingHorizontal: 10,
                                                }]}>
                                                <TextInput
                                                    editable
                                                    autoCorrect={false}
                                                    autoCapitalize="sentences"
                                                    returnKeyType="done"
                                                    keyboardType="default"
                                                    multiline
                                                    placeholder={'אנא ציינו את נושא הפנייה בצורה מפורטת.\n' +
                                                        '(בחלק מהמקרים באפשרותנו לטפל בבעיה מרחוק)'}
                                                    placeholderTextColor="#a7a3a3"
                                                    numberOfLines={8}
                                                    underlineColorAndroid="transparent"
                                                    style={[
                                                        {
                                                            textAlign: 'right',
                                                            color: '#0f3860',
                                                            height: 100,
                                                            fontSize: sp(15),
                                                            width: '100%',
                                                            textAlignVertical: 'top',
                                                        }, commonStyles.regularFont]}
                                                    onChangeText={this.handleUpdateFields('taskDesc')}
                                                    // onSubmitEditing={this.handleUpdate}
                                                    onEndEditing={(e) => {
                                                        this.setState({
                                                            taskDesc: e.nativeEvent.text.toString()
                                                                .replace(getEmoji(), ''),
                                                        })
                                                        this.handleUpdateFieldValid('taskDescValid')(e)
                                                    }}
                                                    onBlur={this.handleUpdateFieldValid('taskDescValid')}
                                                    value={taskDesc}
                                                />
                                            </View>
                                        </View>

                                        <Button
                                            // disabled={!((taskDesc && String(taskDesc).length > 0) && (userCellPhone && String(userCellPhone).length > 0) && cellValid && (taskOpenerName && String(taskOpenerName).length > 0) && (closeMailToSend && String(closeMailToSend).length > 0) && mailValid && (taskTitle && String(taskTitle).length > 0))}
                                            buttonStyle={[
                                                {
                                                    marginTop: 25,
                                                    height: 45,
                                                    borderRadius: 6,
                                                    backgroundColor: '#022258',
                                                    width: 240,
                                                }]}
                                            icon={
                                                <Image
                                                    style={[
                                                        {
                                                            width: 24.5,
                                                            height: 23,
                                                            marginLeft: -50,
                                                            marginRight: 35,
                                                        }]}
                                                    source={require('BiziboxUI/assets/sendArrow.png')}
                                                />
                                            }
                                            titleStyle={{
                                                fontFamily: fonts.semiBold,
                                                fontSize: sp(21),
                                                color: '#ffffff',
                                                textAlign: 'center',
                                            }}
                                            onPress={this.handleUpdate}
                                            title={'שליחה'}
                                        />
                                    </Fragment>
                                )}
                            </KeyboardAwareScrollView>
                        </SafeAreaView>
                    </Modal>

                    <Modal
                        animationType="slide"
                        transparent={false}
                        visible={openModalTerms}
                        onRequestClose={() => {
                            // console.log('Modal has been closed.')
                        }}>
                        <SafeAreaView style={{
                            flex: 1,
                            marginTop: 0,
                            paddingTop: 0,
                            position: 'relative',
                        }}>

                            <View style={[
                                {
                                    height: 60,
                                    backgroundColor: '#002059',
                                    width: '100%',
                                    paddingTop: 0,
                                    paddingLeft: 10,
                                    paddingRight: 10,
                                    justifyContent: 'center',
                                }, cs(
                                    !isRtl,
                                    [
                                        {
                                            flexDirection: 'row',
                                        }],
                                    commonStyles.rowReverse,
                                )]}>
                                <View style={{
                                    flex: 0.5,
                                }}/>
                                <View style={{
                                    alignItems: 'center',
                                    alignSelf: 'center',
                                    flex: 1,
                                }}>
                                    <Text
                                        style={{
                                            fontSize: sp(20),
                                            color: '#ffffff',
                                            fontFamily: fonts.semiBold,
                                            textAlign: 'center',
                                        }}>
                                        {'מילון מונחים'}
                                    </Text>
                                </View>
                                <View style={{
                                    flex: 0.5,
                                    alignItems: 'flex-end',
                                    alignSelf: 'center',
                                }}>
                                    <TouchableOpacity onPress={this.closeModalTerms}>
                                        <View style={{
                                            marginRight: 'auto',
                                        }}>
                                            <Icon name="chevron-right" size={24}
                                                  color={colors.white}/>
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={{
                                marginHorizontal: 35,
                                borderBottomColor: '#6b6b6c',
                                borderBottomWidth: 1,
                                height: 40,
                                marginBottom: 0,
                                marginTop: 20,
                                flexDirection: 'row-reverse',
                                justifyContent: 'space-between',
                            }}>
                                <TextInput
                                    onSubmitEditing={this.handleSendSearchTerms}
                                    onEndEditing={this.handleSearchEndTerms}
                                    placeholder={'הקלידו טקסט לחיפוש'}
                                    placeholderTextColor="#202020"
                                    autoCorrect={false}
                                    autoCapitalize="none"
                                    returnKeyType="done"
                                    keyboardType="default"
                                    underlineColorAndroid="transparent"
                                    style={[
                                        {
                                            height: 35,
                                            flex: 1,
                                            fontFamily: fonts.regular,
                                            color: '#6b6b6c',
                                            textAlign: 'right',
                                            fontSize: sp(14),
                                            backgroundColor: 'transparent',
                                        },
                                    ]}
                                    onChangeText={this.handleSearchTerms}
                                    value={valTermsSearch}
                                />
                                <TouchableOpacity
                                    style={{
                                        marginTop: 7,
                                    }}
                                    onPress={this.handleSendSearchTerms}>
                                    <Icons
                                        name="magnify"
                                        type="material-community"
                                        size={24}
                                        color="#6b6b6c"
                                    />
                                </TouchableOpacity>
                            </View>

                            <KeyboardAwareScrollView
                                enableOnAndroid
                                keyboardShouldPersistTaps="always"
                                contentContainerStyle={{
                                    width: '100%',
                                    marginTop: 0,
                                    marginBottom: 0,
                                    flexGrow: 1,
                                }}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    marginTop: 0,
                                    marginBottom: 30,
                                    paddingLeft: 0,
                                    paddingRight: 0,
                                    flex: 1,
                                }}>

                                {(termsFilter && termsFilter.length > 0 &&
                                    termsFilter.map(s => {
                                        return (<View key={s.termId}>
                                            <View style={{
                                                paddingHorizontal: 35,
                                                height: 27,
                                                marginTop: 20,
                                                backgroundColor: '#d9e7ee',
                                                flexDirection: 'row-reverse',
                                                alignItems: 'center',
                                            }}>
                                                <Text style={{
                                                    fontFamily: fonts.semiBold,
                                                    fontSize: sp(16),
                                                    textAlign: 'right',
                                                    color: '#022258',
                                                }}>{s.subject}</Text>
                                            </View>

                                            <Text style={{
                                                paddingHorizontal: 35,
                                                fontFamily: fonts.regular,
                                                fontSize: sp(15),
                                                textAlign: 'right',
                                                color: '#022258',
                                            }}>{s.details}</Text>
                                        </View>)
                                    }))}
                                {inProgressTerms && (
                                    <Loader
                                        isDefault
                                        containerStyle={{backgroundColor: 'transparent'}}
                                        color={colors.blue}
                                    />
                                )}
                                {(!inProgressTerms && termsFilter.length === 0 &&
                                    valTermsSearch.length > 0) && (
                                    <View style={{
                                        marginTop: 20,
                                    }}>
                                        <Image
                                            style={[
                                                {
                                                    width: 42,
                                                    height: 47.5,
                                                    marginBottom: 5,
                                                    alignSelf: 'center',
                                                }]}
                                            source={require('BiziboxUI/assets/helpNotResults.png')}
                                        />
                                        <Text style={{
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(16),
                                            textAlign: 'center',
                                            color: '#022258',
                                        }}>{'מצטערים,'}</Text>
                                        <Text style={{
                                            fontFamily: fonts.regular,
                                            fontSize: sp(15),
                                            textAlign: 'center',
                                            color: '#022258',
                                        }}>{'לא נמצאו תוצאות שרלוונטיות לחיפוש “'}{valTermsSearch}{'”.'}</Text>
                                        <Text style={{
                                            fontFamily: fonts.regular,
                                            fontSize: sp(15),
                                            textAlign: 'center',
                                            color: '#022258',
                                            paddingBottom: 20,
                                        }}>{'אפשר לחפש ביטוי אחר או לפתוח קריאת שירות.'}</Text>
                                    </View>
                                )}
                            </KeyboardAwareScrollView>

                        </SafeAreaView>
                    </Modal>
                </SafeAreaView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    title: {
        textAlign: 'center',
        fontSize: sp(22),
        fontWeight: '300',
        marginBottom: 0,
    },
    header: {
        // padding: 10,
        paddingTop: 10,
    },
    headerText: {
        fontFamily: fonts.semiBold,
        fontSize: sp(16),
        textAlign: 'right',
        color: '#022258',
    },
    content: {
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 38,
        textAlign: 'right',
        backgroundColor: '#ffffff',
    },
    active: {
        backgroundColor: '#e9f3fd',
    },
    inactive: {
        backgroundColor: '#ffffff',
    },
    inactiveHedaer: {
        paddingBottom: 10,
        backgroundColor: '#ffffff',
    },
    selectors: {
        marginBottom: 0,
        flexDirection: 'row',
        justifyContent: 'center',
    },
    selector: {
        backgroundColor: '#F5FCFF',
        padding: 0,
    },
    activeSelector: {
        fontWeight: 'bold',
    },
    selectTitle: {
        fontSize: sp(14),
        fontWeight: '500',
        padding: 0,
    },
    multipleToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginVertical: 0,
        alignItems: 'center',
    },
    multipleToggle__title: {
        fontSize: sp(16),
        marginRight: 0,
    },
    slider: {
        marginTop: 0,
        overflow: 'visible', // for custom animations
    },
    sliderContentContainer: {
        paddingVertical: 10, // for custom animation
    },
})
