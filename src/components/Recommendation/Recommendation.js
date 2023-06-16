import React, {PureComponent} from 'react'
import {Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, SafeAreaView} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import {connect} from 'react-redux'
import AppTimezone from '../../utils/appTimezone'
import {withTranslation} from 'react-i18next'
import {colors, fonts} from '../../styles/vars'
import styles from './RecommendationStyle'
import {combineStyles as cs, getCurrencyChar, getFormattedValueArray, goTo, goToBack, sp} from '../../utils/func'
import commonStyles from '../../styles/styles'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {Icon} from 'react-native-elements'
import AccountIcon from '../../components/AccountIcon/AccountIcon'
import {LocaleConfig} from 'react-native-calendars'
import CheckList from './components/CheckList'
import {recommendationApi} from '../../api'
import {IS_IOS} from '../../constants/common'
import Loader from '../../components/Loader/Loader'
import {isToday} from '../../utils/date'

@connect(state => ({
    isRtl: state.isRtl,
    currentCompanyId: state.currentCompanyId,
    accounts: state.accounts,
    searchkey: state.searchkey,
}))
@withTranslation()
export default class Recommendation extends PureComponent {
    constructor(props) {
        super(props)

        const objParamas = props.route.params.objParamas

        let datesList = []
        for (let i = 0; i < 6; i++) {
            const startOf = AppTimezone.moment().add(i, 'month').startOf('month')
            datesList.push({
                text: LocaleConfig.locales.he.monthNames[startOf.month()] + ' ' + startOf.year(),
                id: startOf.format('YYYY-MM-DD'),
                selected: (i === 0),
            })
        }

        this.state = {
            isReady: true,
            inProgress: false,
            editSum: false,
            nextStep: false,
            titleModalInside: '',
            editModalInsideIsOpen: false,
            recommendation: false,
            paymentList: [
                {
                    text: 'צ׳ק',
                    id: 'Checks',
                    selected: false,
                }, {
                    text: 'העברה בנקאית',
                    id: 'BankTransfer',
                    selected: false,
                }, {
                    text: 'אחר/מזומן',
                    id: 'Other',
                    selected: false,
                },
            ],
            values: {
                'total': (objParamas && objParamas.obj && (objParamas.idxObj !== null)) ? objParamas.obj.transes[objParamas.idxObj].total : null,
                'companyAccountId': objParamas && objParamas.obj && objParamas.obj.companyAccountId ? objParamas.obj.companyAccountId : ((this.props.accounts.find(a => a.primaryAccount)) ? this.props.accounts.find(a => a.primaryAccount).companyAccountId : null),
                'dateFrom': (objParamas && objParamas.obj && (objParamas.idxObj !== null)) ? AppTimezone.moment(objParamas.obj.transes[objParamas.idxObj].dueDate).startOf('month').format('YYYY-MM-DD') : AppTimezone.moment().startOf('month').format('YYYY-MM-DD'),
                'dateTill': (objParamas && objParamas.obj && (objParamas.idxObj !== null)) ? AppTimezone.moment(objParamas.obj.transes[objParamas.idxObj].dueDate).endOf('month').format('YYYY-MM-DD') : AppTimezone.moment().endOf('month').format('YYYY-MM-DD'),
                'paymentDesc': objParamas && objParamas.obj && objParamas.obj.targetType ? objParamas.obj.targetType : null,
            },
            dataList: [],
            datesList: datesList,
            typeEditModal: null,
            companyAccountIdNoValid: false,
            totalNoValid: false,
            paymentDescValid: false,
        }
    }

    get isLoader() {
        const {isReady, inProgress} = this.state
        return !isReady || inProgress
    }

    setModalInsideVisible = (visible) => () => {
        if (this.state.recommendation && !visible) {
            setTimeout(() => {
                this.getRecommendation()
            }, 10)
        }
        this.setState({editModalInsideIsOpen: visible})
    };

    loadGetRecommendation = () => {
        if (this.state.recommendation) {
            setTimeout(() => {
                this.getRecommendation()
            }, 10)
        }
    };

    getRecommendation() {
        this.setState({inProgress: true})
        const {
            values,
        } = this.state
        const params = {
            'total': values.total,
            'companyAccountId': values.companyAccountId,
            'dateFrom': AppTimezone.moment(values.dateFrom, 'YYYY-MM-DD').valueOf(),
            'dateTill': AppTimezone.moment(values.dateFrom, 'YYYY-MM-DD').endOf('month').valueOf(),
        }

        return recommendationApi.post({body: params})
            .then(data => {
                const recommendedDate = data.recommendedDate
                data.reommendationsList.forEach((item) => {
                    const transDate = AppTimezone.moment(item.transDate).format('YYYY-MM-DD')
                    const now = AppTimezone.moment().format('YYYY-MM-DD')
                    item.disabled = AppTimezone.moment(transDate).isBefore(AppTimezone.moment(now))
                    item.recommendedDate = recommendedDate && AppTimezone.moment(item.transDate).isSame(AppTimezone.moment(recommendedDate))
                    item.checked = item.recommendedDate
                })
                const dayStartMonth = AppTimezone.moment(data.reommendationsList[0].transDate).day()
                if (dayStartMonth > 0) {
                    for (let i = (dayStartMonth - 1); i >= 0; i--) {
                        data.reommendationsList.unshift({
                            disabled: true,
                            checked: false,
                            recommendedDate: false,
                            transDate: AppTimezone.moment(data.reommendationsList[0].transDate).day(i).valueOf(),
                        })
                    }
                }
                const dayLastMonth = AppTimezone.moment(data.reommendationsList[data.reommendationsList.length - 1].transDate).day()
                if (dayLastMonth < 6) {
                    for (let i = (dayLastMonth + 1); i <= 6; i++) {
                        data.reommendationsList.push({
                            disabled: true,
                            checked: false,
                            recommendedDate: false,
                            transDate: AppTimezone.moment(data.reommendationsList[data.reommendationsList.length - 1].transDate).day(i).valueOf(),
                        })
                    }
                }

                this.setState({nextStep: true, recommendation: data})
                this.checked(this.state.recommendation.reommendationsList.find(item => item.recommendedDate), true)()
            })
            .catch(() => this.setState({nextStep: false, inProgress: true}))
    }

    checked = (item, next) => () => {
        if (!item.disabled || next) {
            let valuesSave = JSON.parse(JSON.stringify(this.state.recommendation))
            valuesSave.reommendationsList.forEach((it) => {
                it.checked = (item.transDate === it.transDate)
            })
            this.setState({recommendation: valuesSave, checked: item, inProgress: false})
        }
    };

    divideList(list) {
        const arr = []
        list.forEach((item, i) => {
            if (i % 7 === 0) {
                arr.push([item])
            } else {
                arr[arr.length - 1].push(item)
            }
        })
        return arr
    }

    handleCloseCheckListModal = () => {
        const {values} = this.state
        if (this.state.typeEditModal === 'companyAccountId') {
            this.setState({
                companyAccountIdNoValid: values.companyAccountId === null || values.companyAccountId === '',
            })
        }
        if (this.state.typeEditModal === 'paymentDesc') {
            this.setState({
                paymentDescValid: values.paymentDesc === null || values.paymentDesc === '',
            })
        }
        this.setModalInsideVisible(!this.state.editModalInsideIsOpen)()
    };
    setStates = (params) => () => {
        this.setState(params)
    };

    editInput = (param) => () => {
        const {values, paymentList, datesList} = this.state

        if (param === 'accounts') {
            const types = this.props.accounts.map((item) => {
                return {
                    text: item.accountNickname,
                    id: item.companyAccountId,
                    selected: (item.companyAccountId === values.companyAccountId) && isToday(item.balanceLastUpdatedDate),
                    account: item,
                }
            })
            this.setState({
                typeEditModal: 'companyAccountId',
                titleModalInside: 'ח-ן',
                dataList: types,
            })
            this.setModalInsideVisible(true)()
        } else if (param === 'dateFrom') {
            if (values.dateFrom) {
                const selected = datesList.find((item) => item.id === values.dateFrom)
                selected.selected = true
            }
            this.setState({
                typeEditModal: 'dateFrom',
                titleModalInside: 'בחירת חודש',
                dataList: datesList,
            })
            this.setModalInsideVisible(true)()
        } else if (param === 'paymentDesc') {
            if (values.paymentDesc) {
                const selected = paymentList.find((item) => item.id === values.paymentDesc)
                selected.selected = true
            }
            this.setState({
                typeEditModal: 'paymentDesc',
                titleModalInside: 'סוג תשלום',
                dataList: paymentList,
            })
            this.setModalInsideVisible(true)()
        } else if (param === 'total') {
            this.setState({
                companyAccountIdNoValid: values.companyAccountId === null || values.companyAccountId === '',
                totalNoValid: values.total === null || values.total === '' || values.total === undefined,
                paymentDescValid: values.paymentDesc === null || values.paymentDesc === '',
            })
            if (values.total !== null && values.total !== undefined && values.total !== '' && values.paymentDesc !== null && values.companyAccountId) {
                this.getRecommendation()
            }
        }
    };

    dateFrom = (type) => () => {
        const {
            values,
        } = this.state
        if (type === 1) {
            const index = this.state.datesList.findIndex(a => a.id === this.state.values.dateFrom)
            if (index < 4) {
                let valuesSave = Object.assign({}, values)
                valuesSave.dateFrom = this.state.datesList[index + 1].id
                this.setState({values: valuesSave})
                setTimeout(() => {
                    this.getRecommendation()
                }, 10)
            }
        } else if (type === 2) {
            const index = this.state.datesList.findIndex(a => a.id === this.state.values.dateFrom)

            if (index > 0) {
                let valuesSave = Object.assign({}, values)
                valuesSave.dateFrom = this.state.datesList[index - 1].id
                this.setState({values: valuesSave})
                setTimeout(() => {
                    this.getRecommendation()
                }, 10)
            }
        }
    };

    goToLocation = () => {
        const objParamas = this.props.route.params.objParamas
        if (objParamas) {
            objParamas.obj.transes[objParamas.idxObj].dueDate = this.state.checked.transDate
            const {values} = this.state
            objParamas.obj.companyAccountId = values.companyAccountId
            objParamas.obj.targetType = values.paymentDesc
            objParamas.obj.transes[objParamas.idxObj].total = values.total
            goToBack(this.props.navigation)
        } else {
            const {values} = this.state
            goTo(this.props.navigation, 'CASH_FLOW', {
                objParamas: {
                    receiptTypeId: 44,
                    obj: {
                        'companyAccountId': values.companyAccountId,
                        'companyId': this.props.currentCompanyId,
                        'deleteOldExcel': false,
                        'receiptTypeId': 44,
                        'sourceProgramId': null,
                        'targetType': values.paymentDesc,
                        'transes': [
                            {
                                'asmachta': '',
                                'asmachtaExist': null,
                                'dueDate': this.state.checked.transDate,
                                'paymentDesc': null,
                                'total': values.total,
                                'transTypeId': {
                                    companyId: '00000000-0000-0000-0000-000000000000',
                                    createDefaultSupplier: true,
                                    iconType: 'No category',
                                    shonaScreen: true,
                                    transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                                    transTypeName: 'ללא קטגוריה 1',
                                },
                            },
                        ],
                    },
                },
            })
        }
    };

    render() {
        const {isRtl} = this.props
        const {
            editSum,
            values,
            datesList,
            editModalInsideIsOpen,
        } = this.state

        const total = getFormattedValueArray(values.total)

        const account = (values.companyAccountId) ? this.props.accounts.find(a => a.companyAccountId === values.companyAccountId) : null
        const balanceLastUpdatedDate = (account) ? isToday(account.balanceLastUpdatedDate) : false

        return (
            <View style={{
                backgroundColor: '#ffffff',
                flex: 1,
            }}>
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={editModalInsideIsOpen}
                    onRequestClose={() => {
                        // //console.log('Modal has been closed.')
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
                                    [styles.container, {
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                    }],
                                    commonStyles.rowReverse,
                                )}>
                                    <View/>
                                    <View style={{alignItems: 'center'}}>
                                        <Text style={{fontSize: sp(20), color: '#ffffff', fontFamily: fonts.semiBold}}>
                                            {this.state.titleModalInside}
                                        </Text>
                                    </View>
                                    <View>
                                        <TouchableOpacity
                                            onPress={this.setModalInsideVisible(!this.state.editModalInsideIsOpen)}>
                                            <View style={{
                                                marginRight: 'auto',
                                            }}>
                                                <Icon name="chevron-right" size={24} color={colors.white}/>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                            <View style={{
                                width: '100%',
                                height: '100%',
                                marginTop: 44,
                                marginBottom: 10,
                                paddingLeft: 0,
                                paddingRight: 10,
                                flex: 1,
                            }}>
                                <CheckList
                                    loadGetRecommendation={this.loadGetRecommendation}
                                    close={this.handleCloseCheckListModal}
                                    data={this.state.dataList}
                                    value={values}
                                    type={this.state.typeEditModal}
                                />
                            </View>
                        </View>

                    </SafeAreaView>

                </Modal>

                {(!this.state.recommendation && !this.isLoader) && (<View style={{
                    width: '100%',
                    height: '100%',
                    marginTop: 35,
                    marginBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 20,
                    flex: 1,
                }}>
                    <KeyboardAwareScrollView enableOnAndroid>
                        <View
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                height: 42,
                                marginBottom: 8,
                            }]}>
                            <View style={{flex: 1.76, alignItems: 'flex-end'}}>
                                <Text style={{
                                    color: '#0f3860',
                                    fontSize: sp(13),
                                    lineHeight: 42,
                                }}>סכום</Text>
                            </View>
                            <View style={[{
                                flex: 5.73,
                                backgroundColor: '#f5f5f5',
                                paddingHorizontal: 21,
                                borderBottomRightRadius: 20,
                                borderTopRightRadius: 20,
                            }, cs(this.state.totalNoValid, {}, {
                                borderWidth: 1,
                                borderColor: colors.red,
                            })]}>

                                {editSum && (
                                    <TextInput
                                        autoCorrect={false}
                                        autoFocus
                                        editable={editSum}
                                        keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                                        style={[{
                                            // direction: 'ltr',
                                            textAlign: 'right',
                                            color: '#0f3860',
                                            height: 42,
                                            fontSize: sp(15),
                                            width: '100%',
                                        }, commonStyles.regularFont]}
                                        onEndEditing={(e) => {
                                            let valuesSave = Object.assign({}, values)
                                            valuesSave.total = (e.nativeEvent.text) ? e.nativeEvent.text.toString().replace(/[^\d]/g, '') : null
                                            this.setState({
                                                values: valuesSave,
                                                editSum: false,
                                                totalNoValid: valuesSave.total === '',
                                            })
                                        }}
                                        onChangeText={(totals) => {
                                            let valuesSave = Object.assign({}, values)
                                            valuesSave.total = totals.toString().replace(/[^\d]/g, '')
                                            this.setState({values: valuesSave, totalNoValid: valuesSave.total === ''})
                                        }}
                                        value={values.total ? (values.total) : null}
                                        underlineColorAndroid="transparent"
                                    />
                                )}

                                {!editSum && (
                                    <TouchableOpacity
                                        style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        }]}
                                        onPress={this.setStates({editSum: true})}>
                                        {(total[0] !== null && total[1] !== null) && (
                                            <Text
                                                style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2, {
                                                    fontSize: sp(15),
                                                    lineHeight: 42,
                                                    color: '#0f3860',
                                                }, commonStyles.regularFont]} numberOfLines={1}
                                                ellipsizeMode="tail">
                                                <Text style={[{
                                                    fontSize: sp(15),
                                                    lineHeight: 42,
                                                    color: '#0f3860',
                                                }, commonStyles.regularFont]}>{total[0]}</Text>
                                                <Text style={[styles.fractionalPart, {
                                                    fontSize: sp(15),
                                                    lineHeight: 42,
                                                    color: '#0f3860',
                                                }, commonStyles.regularFont]}>.{total[1]}</Text>
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                            height: 42,
                            marginBottom: 8,
                        }]}>
                            <View style={{flex: 1.76, alignItems: 'flex-end'}}>
                                <Text style={{
                                    color: '#0f3860',
                                    fontSize: sp(13),
                                    lineHeight: 42,
                                }}>ח-ן</Text>
                            </View>
                            <View style={[
                                {
                                    flex: 5.73,
                                    backgroundColor: '#f5f5f5',
                                    paddingHorizontal: 21,
                                    borderBottomRightRadius: 20,
                                    borderTopRightRadius: 20,
                                }, cs(this.state.companyAccountIdNoValid, {}, {
                                    borderWidth: 1,
                                    borderColor: colors.red,
                                }),
                            ]}>
                                <TouchableOpacity
                                    style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                    }]}
                                    onPress={this.editInput('accounts')}>
                                    <View style={{
                                        marginRight: 'auto',
                                    }}>
                                        <Icon name="chevron-left" size={24} color={colors.blue34}/>
                                    </View>
                                    <Text
                                        style={[styles.dataRowLevel3Text, {
                                            fontSize: sp(15),
                                            color: '#0f3860',
                                            lineHeight: 42,
                                        }, commonStyles.regularFont]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {(balanceLastUpdatedDate) ? this.props.accounts.find(a => a.companyAccountId === values.companyAccountId).accountNickname : 'בחירה'}
                                    </Text>
                                    {balanceLastUpdatedDate && (
                                        <View style={commonStyles.spaceDivider}/>
                                    )}
                                    {balanceLastUpdatedDate && (
                                        <AccountIcon
                                            account={this.props.accounts.find(a => a.companyAccountId === values.companyAccountId)}/>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                height: 42,
                                marginBottom: 8,
                            }]}>
                            <View style={{flex: 1.76, alignItems: 'flex-end'}}>
                                <Text style={{
                                    color: '#0f3860',
                                    fontSize: sp(13),
                                    lineHeight: 42,
                                }}>סוג תשלום</Text>
                            </View>

                            <View style={[
                                {
                                    flex: 5.73,
                                    backgroundColor: '#f5f5f5',
                                    paddingHorizontal: 21,
                                    borderBottomRightRadius: 20,
                                    borderTopRightRadius: 20,
                                }, cs(this.state.paymentDescValid, {}, {
                                    borderWidth: 1,
                                    borderColor: colors.red,
                                }),
                            ]}>
                                <TouchableOpacity
                                    style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                    }]}
                                    onPress={this.editInput('paymentDesc')}>
                                    <View style={{
                                        marginRight: 'auto',
                                    }}>
                                        <Icon name="chevron-left" size={24} color={colors.blue34}/>
                                    </View>
                                    <Text style={[{
                                        textAlign: 'right',
                                        color: '#0f3860',
                                        fontSize: sp(15),
                                        lineHeight: 42,
                                    }, commonStyles.regularFont]}>
                                        {(values.paymentDesc)
                                            ? (this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === values.paymentDesc) ? this.props.searchkey.find((it) => it.paymentDescription === values.paymentDesc).name : '')
                                            : 'בחירה'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                height: 42,
                                marginBottom: 8,
                            }]}>
                            <View style={{flex: 1.76, alignItems: 'flex-end'}}>
                                <Text style={{
                                    color: '#0f3860',
                                    fontSize: sp(13),
                                    lineHeight: 42,
                                }}>חודש</Text>
                            </View>
                            <View style={{
                                flex: 5.73,
                                backgroundColor: '#f5f5f5',
                                paddingHorizontal: 21,
                                borderBottomRightRadius: 20,
                                borderTopRightRadius: 20,
                            }}>
                                <TouchableOpacity
                                    style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'flex-end',
                                        alignItems: 'center',
                                    }]}
                                    onPress={this.editInput('dateFrom')}>
                                    <View style={{
                                        marginRight: 'auto',
                                    }}>
                                        <Icon name="chevron-left" size={24} color={colors.blue34}/>
                                    </View>
                                    <Text style={[{
                                        textAlign: 'right',
                                        color: '#0f3860',
                                        fontSize: sp(15),
                                        lineHeight: 42,
                                    }, commonStyles.regularFont]}>
                                        {datesList.find(a => a.id === values.dateFrom).text}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                marginTop: 65,
                                marginBottom: 20,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }]}>

                            <TouchableOpacity
                                style={[{
                                    height: 30,
                                    backgroundColor: '#022258',
                                    borderRadius: 5,
                                    width: 204,
                                    opacity: 1,
                                }]}
                                onPress={this.editInput('total')}>
                                <Text style={{
                                    color: colors.white,
                                    lineHeight: 28,
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(16),
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }}>{'המשך'}</Text>
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                </View>)}

                {(this.isLoader && !this.state.recommendation) && (<Loader/>)}

                {this.state.recommendation && (
                    <ScrollView>
                        <View style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                            paddingHorizontal: 15,
                            marginVertical: 15,
                            height: 40,
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            alignItems: 'center',
                            alignContent: 'center',
                        }]}>

                            <View style={{
                                borderBottomColor: '#022258',
                                borderBottomWidth: 0.5,
                                width: 118.5,
                            }}>
                                <TouchableOpacity
                                    style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                        flex: 1,
                                        flexDirection: 'row',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }]}
                                    onPress={this.editInput('accounts')}>
                                    <Text
                                        style={[styles.dataRowLevel3Text, {
                                            fontSize: sp(16),
                                            color: '#2c546c',
                                            lineHeight: 42,
                                        }, commonStyles.regularFont]}
                                        numberOfLines={1}
                                        ellipsizeMode="tail"
                                    >
                                        {this.props.accounts.find(a => a.companyAccountId === values.companyAccountId).accountNickname}
                                    </Text>
                                    <View style={commonStyles.spaceDivider}/>
                                    <AccountIcon
                                        account={this.props.accounts.find(a => a.companyAccountId === values.companyAccountId)}/>
                                </TouchableOpacity>
                            </View>
                            <View style={{
                                width: 21,
                            }}/>
                            <View style={{
                                borderBottomColor: '#022258',
                                borderBottomWidth: 0.5,
                                width: 118.5,
                                alignItems: 'center',
                            }}>
                                {editSum && (
                                    <TextInput
                                        autoCorrect={false}
                                        autoFocus
                                        editable={editSum}
                                        autoCapitalize="none"
                                        keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                                        multiline={false}
                                        style={[{
                                            direction: 'ltr',
                                            textAlign: 'center',
                                            color: '#59b1af',
                                            fontFamily: fonts.semiBold,
                                            fontSize: sp(21),
                                            width: '100%',
                                            padding: 0,
                                            margin: 0,
                                            borderWidth: 0,
                                        }, cs(IS_IOS, {height: 40}, {height: '100%'})]}
                                        onEndEditing={(e) => {
                                            let valuesSave = Object.assign({}, values)
                                            valuesSave.total = (e.nativeEvent.text) ? e.nativeEvent.text.toString().replace(/[^\d]/g, '') : null
                                            this.setState({values: valuesSave, editSum: false})
                                            setTimeout(() => {
                                                this.getRecommendation()
                                            }, 10)
                                        }}
                                        onChangeText={(totals) => {
                                            let valuesSave = Object.assign({}, values)
                                            valuesSave.total = totals.toString().replace(/[^\d]/g, '')
                                            this.setState({values: valuesSave})
                                        }}
                                        value={values.total ? String(values.total) : null}
                                        underlineColorAndroid="transparent"
                                    />
                                )}

                                {!editSum && (
                                    <TouchableOpacity
                                        style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                            flex: 1,
                                            height: 42,
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        }]}
                                        onPress={this.setStates({editSum: true})}>
                                        {(total[0] !== null && total[1] !== null) && (
                                            <Text
                                                style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2, {
                                                    fontSize: sp(21),
                                                    textAlign: 'center',
                                                    lineHeight: 42,
                                                    color: '#59b1af',
                                                }, commonStyles.semiBoldFont]} numberOfLines={1}
                                                ellipsizeMode="tail">
                                                <Text style={{
                                                    fontSize: sp(21),
                                                    lineHeight: 42,
                                                    color: '#59b1af',
                                                }}>{getCurrencyChar(account.currency)}</Text>
                                                <Text style={[{
                                                    fontSize: sp(21),
                                                    lineHeight: 42,
                                                    color: '#59b1af',
                                                }, commonStyles.semiBoldFont]}>{total[0]}</Text>
                                                <Text style={[styles.fractionalPart, {
                                                    fontSize: sp(21),
                                                    lineHeight: 42,
                                                    color: '#59b1af',
                                                }, commonStyles.semiBoldFont]}>.{total[1]}</Text>
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        <View style={{
                            marginRight: 22,
                            marginLeft: 22,
                            borderBottomWidth: 1,
                            borderBottomColor: '#e5e5e5',
                            height: 1,
                        }}/>

                        <View style={{
                            paddingHorizontal: 15,
                            marginBottom: 5,
                            flex: 1,
                            flexDirection: 'row',
                            height: 40,
                            alignItems: 'center',
                            alignContent: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <TouchableOpacity
                                onPress={this.dateFrom(1)}>
                                <Icon name={'chevron-left'}
                                      size={25}
                                      color={(this.state.datesList.findIndex(a => a.id === this.state.values.dateFrom) === 4) ? colors.gray11 : colors.blue32}/>
                            </TouchableOpacity>

                            <Text style={{
                                color: '#59b1af',
                                textAlign: 'center',
                                fontSize: sp(35),
                                lineHeight: 40,
                                fontFamily: fonts.regular,
                            }}>
                                {this.state.datesList.find(a => a.id === this.state.values.dateFrom).text}
                            </Text>

                            <TouchableOpacity
                                onPress={this.dateFrom(2)}>
                                <Icon name={'chevron-right'}
                                      size={25}
                                      color={(this.state.datesList.findIndex(a => a.id === this.state.values.dateFrom) === 0) ? colors.gray11 : colors.blue32}/>
                            </TouchableOpacity>
                        </View>

                        {(this.isLoader && this.state.recommendation) && (<Loader/>)}

                        {
                            (!this.isLoader && this.state.recommendation) && (<View style={{
                                paddingHorizontal: 15,
                                flex: 1,
                                alignItems: 'center',
                                alignContent: 'center',
                                position: 'relative',
                                flexDirection: 'row-reverse',
                                justifyContent: 'space-between',
                            }}>

                                {
                                    LocaleConfig.locales.he.dayNamesShort.map((item, i) => {
                                        return (<View key={i} style={{flex: 1, justifyContent: 'flex-start'}}>
                                            <Text style={{
                                                textAlign: 'center',
                                                fontSize: sp(17),
                                                lineHeight: 25,
                                                color: '#59b1af',
                                                fontFamily: fonts.regular,
                                            }}>
                                                {item}
                                            </Text>
                                        </View>)
                                    })
                                }

                            </View>)
                        }
                        {(!this.isLoader) && this.divideList(this.state.recommendation.reommendationsList).map((gr, i1) => {
                            return (<View key={i1} style={{
                                paddingHorizontal: 15,
                                flex: 1,
                                alignItems: 'center',
                                alignContent: 'center',
                                position: 'relative',
                                flexDirection: 'row-reverse',
                                justifyContent: 'space-between',
                            }}>{
                                gr.map((item, i) => {
                                    return (
                                        <View key={i} style={{flex: 1}}>
                                            {(item.checked && item.holiday) && (
                                                <View style={[cs(IS_IOS, {}, {position: 'relative', zIndex: 9})]}>
                                                    <View style={styles.talkBubbleTriangle}/>
                                                    <View style={styles.talkBubbleTriangleWhite}/>
                                                    <View style={styles.talkBubble}>
                                                        <View style={styles.talkBubbleSquare}>
                                                            <Text style={styles.talkBubbleMessage}
                                                                  numberOfLines={1}
                                                                  ellipsizeMode="tail">{item.holiday}</Text>
                                                        </View>
                                                    </View>
                                                </View>
                                            )}
                                            <TouchableOpacity
                                                style={[{
                                                    height: 48,
                                                    borderColor: 'transparent',
                                                    zIndex: 1,
                                                    borderWidth: 1.5,
                                                    position: 'relative',
                                                    borderRadius: 5,
                                                }, cs(item.checked,
                                                    cs(item.recommendedDate, {
                                                            borderColor: 'transparent',
                                                        },
                                                        {
                                                            backgroundColor: '#59b1af',
                                                            borderColor: '#59b1af',
                                                        },
                                                    ),
                                                    cs(item.recommendedDate, {
                                                            borderColor: '#59b1af',
                                                        },
                                                        {
                                                            backgroundColor: '#59b1af',
                                                            borderColor: '#59b1af',
                                                        },
                                                    ),
                                                )]}
                                                onPress={this.checked(item)}>

                                                <View style={[{
                                                    alignItems: 'center',
                                                    alignContent: 'flex-start',
                                                    justifyContent: 'flex-start',
                                                    alignSelf: 'center',
                                                    flexDirection: 'column',
                                                    flex: 1,
                                                    width: '100%',
                                                    height: '100%',
                                                    borderWidth: 1,
                                                    borderRadius: 5,
                                                    borderColor: 'transparent',
                                                    marginHorizontal: 1,
                                                    marginVertical: 0,
                                                    paddingHorizontal: 0.5,
                                                    paddingVertical: 1,
                                                }, cs(item.recommendedDate && item.checked, {borderColor: 'transparent'}, {borderColor: colors.white})]}>

                                                    {item.holiday && (
                                                        <View style={{
                                                            position: 'absolute',
                                                            right: 3,
                                                            top: 3,
                                                            width: 5,
                                                            height: 5,
                                                            zIndex: 1,
                                                        }}>
                                                            <Image
                                                                style={{width: 5, height: 5}}
                                                                source={(!item.recommendedDate) ? require('BiziboxUI/assets/star.png') : require('BiziboxUI/assets/starWhite.png')}
                                                            /></View>)}

                                                    <Text style={[{
                                                        justifyContent: 'flex-start',
                                                        textAlign: 'center',
                                                        fontSize: sp(24),
                                                        lineHeight: 25,
                                                        fontFamily: fonts.bold,
                                                    }, cs(!item.disabled, {color: '#c3cad2'}, cs(item.recommendedDate, {color: colors.blue8}, {color: colors.white}))]}>
                                                        {AppTimezone.moment(item.transDate).format('D')}
                                                    </Text>

                                                    {(item && item.itra !== undefined && item.itra !== null && item.itra !== 0) && (
                                                        <Text style={[
                                                            cs(item.disabled, cs(item.recommendedDate, cs(item.color === 'green', {color: colors.red2}, {color: colors.green14}), {color: colors.white}), {color: '#c3cad2'}),
                                                            {
                                                                flex: 1,
                                                                textAlign: 'center',
                                                                alignItems: 'center',
                                                                fontSize: sp((item.itra.toString().split('.')[0].replace('-', '').length >= 6) ? 10 : 12),
                                                                lineHeight: 13,
                                                                fontFamily: fonts.regular,
                                                            }]} numberOfLines={1} ellipsizeMode="tail">
                                                            {getFormattedValueArray(item.itra)[0]}
                                                        </Text>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    )
                                })
                            }</View>)
                        })}

                        {(!this.isLoader && this.state.checked) && (<View style={{
                            flex: 1,
                            marginTop: 10,
                            alignItems: 'center',
                            alignContent: 'center',
                        }}>
                            <Text style={{
                                textAlign: 'center',
                                color: colors.blue32,
                                fontSize: sp(14),
                                fontFamily: fonts.regular,
                                lineHeight: 18,
                            }}>
                                {(this.state.checked.recommendedDate) ? 'התאריך המומלץ' : 'התאריך הנבחר'} {'לתשלום הוא'} {AppTimezone.moment(this.state.checked.transDate).format('DD/MM/YY')}
                            </Text>
                            <View style={{
                                flexDirection: 'row-reverse',
                            }}>
                                <Text style={{
                                    textAlign: 'center',
                                    color: colors.blue32,
                                    fontSize: sp(14),
                                    fontFamily: fonts.semiBold,
                                    lineHeight: 18,
                                }}>
                                    {'היתרה הצפויה לתאריך זה'}
                                </Text>
                                <Text>{' '}</Text>
                                <Text style={{
                                    textAlign: 'center',
                                    color: colors.blue32,
                                    fontSize: sp(14),
                                    fontFamily: fonts.semiBold,
                                    lineHeight: 18,
                                }}>
                                    {getCurrencyChar(account.currency)}{getFormattedValueArray(this.state.checked.itra)[0]}
                                </Text>
                            </View>

                            {this.state.checked.harigaDate && !this.state.checked.growHarigaDate && (AppTimezone.moment(this.state.checked.harigaDate).format('DD/MM/YY') === AppTimezone.moment(this.state.checked.transDate).format('DD/MM/YY')) && (
                                <Text style={{
                                    marginVertical: 5,
                                    textAlign: 'center',
                                    color: '#f21a1a',
                                    fontSize: sp(13),
                                    fontFamily: fonts.regular,
                                    lineHeight: 14.5,
                                }}>
                                    {'שימו לב, הוצאה בסכום זה תגרום לחריגה בתאריך הנבחר'}
                                </Text>
                            )}

                            {this.state.checked.harigaDate && !this.state.checked.growHarigaDate && (AppTimezone.moment(this.state.checked.harigaDate).format('DD/MM/YY') !== AppTimezone.moment(this.state.checked.transDate).format('DD/MM/YY')) && (
                                <Text style={{
                                    marginVertical: 5,
                                    textAlign: 'center',
                                    color: '#f21a1a',
                                    fontSize: sp(13),
                                    fontFamily: fonts.regular,
                                    lineHeight: 14.5,
                                }}>
                                    {'שימו לב, הוצאה בסכום זה תגרום לחריגה בתאריך'} {AppTimezone.moment(this.state.checked.harigaDate).format('DD/MM/YY')}
                                </Text>
                            )}

                            {this.state.checked.harigaDate && this.state.checked.growHarigaDate && (
                                <Text style={{
                                    marginVertical: 5,
                                    textAlign: 'center',
                                    color: '#f21a1a',
                                    fontSize: sp(13),
                                    fontFamily: fonts.regular,
                                    lineHeight: 14.5,
                                }}>
                                    {'שימו לב, הוצאה בסכום זה תגרום לחריגה בתאריך'} {AppTimezone.moment(this.state.checked.harigaDate).format('DD/MM/YY')} {'ותגדיל את החריגה בתאריך'} {AppTimezone.moment(this.state.checked.growHarigaDate).format('DD/MM/YY')}
                                </Text>
                            )}

                            {this.state.checked.harigaDate === null && this.state.checked.growHarigaDate && (AppTimezone.moment(this.state.checked.growHarigaDate).format('DD/MM/YY') === AppTimezone.moment(this.state.checked.transDate).format('DD/MM/YY')) && (
                                <Text style={{
                                    marginVertical: 5,
                                    textAlign: 'center',
                                    color: '#f21a1a',
                                    fontSize: sp(13),
                                    fontFamily: fonts.regular,
                                    lineHeight: 14.5,
                                }}>
                                    {'שימו לב, הוצאה בסכום זה תגדיל את החריגה בתאריך'} {AppTimezone.moment(this.state.checked.growHarigaDate).format('DD/MM/YY')}
                                </Text>
                            )}

                            {this.state.checked.harigaDate === null && this.state.checked.growHarigaDate && (AppTimezone.moment(this.state.checked.growHarigaDate).format('DD/MM/YY') !== AppTimezone.moment(this.state.checked.transDate).format('DD/MM/YY')) && (
                                <Text style={{
                                    marginVertical: 5,
                                    textAlign: 'center',
                                    color: '#f21a1a',
                                    fontSize: sp(13),
                                    fontFamily: fonts.regular,
                                    lineHeight: 14.5,
                                }}>
                                    {'שימו לב, הוצאה בסכום זה תגדיל את החריגה בתאריך הנבחר'}
                                </Text>
                            )}

                            <TouchableOpacity
                                style={[{
                                    marginTop: 11,
                                    height: 30,
                                    backgroundColor: '#022258',
                                    borderRadius: 5,
                                    width: 204,
                                }]}
                                onPress={this.goToLocation}>
                                <Text style={{
                                    color: colors.white,
                                    lineHeight: 28,
                                    fontFamily: fonts.semiBold,
                                    fontSize: sp(16),
                                    fontWeight: 'bold',
                                    textAlign: 'center',
                                }}>{'המשיכו להוספת הוצאה'}</Text>
                            </TouchableOpacity>
                        </View>)}

                    </ScrollView>
                )}

            </View>
        )
    }
}
