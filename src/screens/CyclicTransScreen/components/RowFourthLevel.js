import React, {Fragment} from 'react'
import {ActivityIndicator, Animated, Image, Text, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import {combineStyles as cs, getFormattedValueArray, getTransCategoryIcon, sp} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles, {DATA_ROW_3_HEIGHT} from '../CyclicTransStyles'
import {colors, fonts} from '../../../styles/vars'
import {getDaysBetweenTwoDates} from '../../../utils/date'
import CustomIcon from '../../../components/Icons/Fontello'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import Graph from './Graph'
import AnimatedControlledRow from '../../../components/DataRow/AnimatedControlledRow'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {cyclicTransHistoryApi, getRecommendationHistoryApi} from '../../../api'
import AppTimezone from '../../../utils/appTimezone'

const AnimatedIcon = Animated.createAnimatedComponent(Icon)

@withTranslation()
export default class RowFourthLevel extends AnimatedControlledRow {
    constructor(props) {
        super(props)
        this.initialHeight = props.isDeleted ? 95 : DATA_ROW_3_HEIGHT
        this.maxHeight = this.initialHeight
        this.state = this.initialState
    }

    get initialState() {
        return {
            ...super.initialState,
            dataGraph: {},
        }
    }

    prepareUpdateRow = (item) => {
        // this.updateRow({
        //   chequeComment: item.chequeComment,
        //   chequeNo: item.chequeNo,
        //   chequePaymentId: item.chequePaymentId,
        //   companyAccountId: item.companyAccountId,
        //   total: item.total,
        //   transTypeId: item.transTypeId.transTypeId,
        //   userDescription: item.userDescription,
        //   dueDate: item.dueDate,
        // })
    };

    updateRow = (params) => {
        // updateCheckRowApi.post({
        //   body: params,
        // }).then(data => {
        //   this.props.onRefresh()
        // }).catch(() => {
        //
        // })
    };

    componentDidMount() {
        setTimeout(() => {
            if (this.props.transIdOpened) {
                this.handleToggleRows()
            }
        }, 0)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        const {isOpen} = this.state
        if ((nextProps.closeChild === true) && isOpen) {
            this.handleToggleRows()
        }
    }

    handleToggleRows = () => {
        const {
            onFixRowHeight,
            item,
            isDeleted,
            isRecommendation,
        } = this.props
        const {isOpen} = this.state
        this.maxHeight = 155
        if (isOpen && !isDeleted) {
            this.setState({
                dataGraph: {},
            })
            this.minHeight = 125
            onFixRowHeight(180)
        } else {
            this.cyclicTransHistory(item, isRecommendation)
            this.minHeight = 95
            onFixRowHeight(305)
        }
        this.handleToggle()
    };

    toFixedNum(num) {
        const numSplit = num.toString().split('.')
        if (numSplit.length > 1) {
            const first = numSplit[0]
            const point = numSplit[1].substring(0, 1)
            if (point === '0' || (first.replace(/-/g, '').length >= 2)) {
                return Number(first)
            } else {
                return Number(first + '.' + point)
            }
        } else {
            return Number(num)
        }
    }

    checkIfK(num) {
        num = Number(num.toString().split('.')[0])
        if (num.toString().replace(/-/g, '').length >= 7) {
            return this.toFixedNum(num / 1000000) + 'm'
        } else if (num.toString().replace(/-/g, '').length >= 4) {
            return this.toFixedNum(num / 1000) + 'k'
        } else {
            return this.toFixedNum(num)
        }
    }

    cyclicTransHistory = (item, isRecommendation) => {
        if (!isRecommendation) {
            cyclicTransHistoryApi.post({
                body: {
                    targetType: item.targetType,
                    transId: item.transId,
                },
            })
                .then(data => {
                    // //console.log(data)
                    if (data.transes.length) {
                        data.monthsTotals = data.monthsTotals.slice(0, 8)
                        let isAllZero = true
                        const totals = data.monthsTotals.map((num) => {
                            if (num.total !== 0) {
                                isAllZero = false
                            }
                            return num.total
                        })
                        if (!isAllZero) {
                            const min = Math.min(...totals)
                            const max = Math.max(...totals)
                            const spaceBetween = ((max - min) / 5)
                            let sumsY
                            if (min <= 0 && max <= 0) {
                                sumsY = [
                                    this.checkIfK((max)),
                                    this.checkIfK((min + (spaceBetween * 3))),
                                    this.checkIfK((min + (spaceBetween * 2))),
                                    this.checkIfK((min + spaceBetween)),
                                    this.checkIfK((min)),
                                ]
                            } else {
                                sumsY = [
                                    this.checkIfK((min)),
                                    this.checkIfK((min + spaceBetween)),
                                    this.checkIfK((min + (spaceBetween * 2))),
                                    this.checkIfK((min + (spaceBetween * 3))),
                                    this.checkIfK((max)),
                                ]
                            }
                            // const reducer = (accumulator, currentValue) => accumulator + currentValue
                            // const totalArr = totals.reduce(reducer)
                            // console.log(totals)
                            data.monthsTotals.forEach((it) => {
                                it.month = AppTimezone.moment(it.month).format('MM/YY')
                                it.isThisMonth = AppTimezone.moment().format('MM/YY') === it.month
                                it.height = Math.abs(((100 * it.total) / (max - min)))
                                // console.log('totalArr %o, total %o, prec %o',
                                //   (max - min),
                                //   it.total,
                                //   it.height
                                // )
                            })
                            this.setState({
                                dataGraph: {
                                    sumsY: sumsY,
                                    data: data.monthsTotals,
                                },
                            })
                        } else {
                            this.setState({
                                dataGraph: {
                                    data: null,
                                },
                            })
                        }
                    } else {
                        this.setState({
                            dataGraph: {
                                data: null,
                            },
                        })
                    }
                })
                .catch(() => {

                })
        } else {
            getRecommendationHistoryApi.post({
                body: {
                    mutavArray: item.mutavArray,
                    bankTransIds: item.bankTransIds,
                    companyAccountId: item.companyAccountId,
                },
            })
                .then(data => {
                    // //console.log(data)
                    if (data.bankTranses.length) {
                        data.monthsTotals = data.monthsTotals.slice(0, 8)
                        let isAllZero = true
                        const totals = data.monthsTotals.map((num, idx) => {
                            if (num.total !== 0) {
                                isAllZero = false
                            }
                            return num.total
                        })
                        if (!isAllZero) {
                            const min = Math.min(...totals)
                            const max = Math.max(...totals)
                            const spaceBetween = ((max - min) / 5)
                            let sumsY
                            if (min <= 0 && max <= 0) {
                                sumsY = [
                                    this.checkIfK((max)),
                                    this.checkIfK((min + (spaceBetween * 3))),
                                    this.checkIfK((min + (spaceBetween * 2))),
                                    this.checkIfK((min + spaceBetween)),
                                    this.checkIfK((min)),
                                ]
                            } else {
                                sumsY = [
                                    this.checkIfK((min)),
                                    this.checkIfK((min + spaceBetween)),
                                    this.checkIfK((min + (spaceBetween * 2))),
                                    this.checkIfK((min + (spaceBetween * 3))),
                                    this.checkIfK((max)),
                                ]
                            }

                            // const reducer = (accumulator, currentValue) => accumulator + currentValue
                            // const totalArr = totals.reduce(reducer)
                            data.monthsTotals.forEach((it) => {
                                it.month = AppTimezone.moment(it.month).format('MM/YY')
                                it.isThisMonth = AppTimezone.moment().format('MM/YY') === it.month
                                it.height = Math.abs(((100 * it.total) / (max - min)))
                                // console.log('totalArr %o, total %o, prec %o',
                                //   (max - min),
                                //   it.total,
                                //   it.height
                                // )
                            })
                            this.setState({
                                dataGraph: {
                                    sumsY: sumsY,
                                    data: data.monthsTotals,
                                },
                            })
                        } else {
                            this.setState({
                                dataGraph: {
                                    data: null,
                                },
                            })
                        }
                    } else {
                        this.setState({
                            dataGraph: {
                                data: null,
                            },
                        })
                    }
                })
                .catch(() => {

                })
        }
    };

    getAutoUpdateTypeName(name, transFrequencyName) {
        if (name === 'AVG_3_MONTHS') {
            if (transFrequencyName === 'NONE') {
                return 'לא ניתן לחשב צפי'
            } else {
                return 'ממוצע'
            }
        } else if (name === 'USER_DEFINED_TOTAL') {
            return 'הסכום שהוקלד'
        } else if (name === 'USER_CURRENT_TOTAL') {
            return 'זיכויים / חיובים בפועל'
        } else if (name === 'LAST_BANK_TOTAL') {
            return 'חיוב אחרון'
        } else {
            return ''
        }
    }

    pressed = (idx) => {
        let valuesSave = Object.assign({}, this.state.dataGraph)
        valuesSave.data.forEach((it, index) => {
            it.isPressed = idx === index
        })
        this.setState({dataGraph: valuesSave})
    };

    updateTransactionCb = (param) => () => {
        const {
            updateTransactionCb,
        } = this.props
        updateTransactionCb(param)
    };
    handleRemoveRowModalCb = (...params) => () => {
        const {handleRemoveRowModalCb} = this.props
        handleRemoveRowModalCb(params[0], params[1], params[2])
    };

    getExpandedData() {
        const {inProgress} = this.state
        if (inProgress) {
            return
        }
        this.setState({inProgress: true})
        setTimeout(() => {
            this.setState({inProgress: false})
        }, 20)
    }

    render() {
        const {
            t,
            isRtl,
            item,
            loaded,
            isRecommendation,
            isDeleted,
        } = this.props
        const {height, isOpen, dataGraph, inProgress} = this.state
        const withinRowStyles = cs(isRtl, commonStyles.row, commonStyles.rowReverse)
        const wrapperStyles = cs(isOpen, styles.dataRowSecondLevel, [styles.titleRowActive, {
            height: 95,
        }])
        const total = getFormattedValueArray(item.lastBankTotal)

        return (
            <Fragment>
                <Animated.View style={[styles.dataRowAnimatedWrapper, {height}]}>
                    <View style={wrapperStyles} onLayout={this.setMinHeight}>
                        <View style={[withinRowStyles, {
                            backgroundColor: '#d9e7ee',
                            paddingHorizontal: 6,
                            height: 95,
                        }]}>
                            <View style={{
                                flex: 10,
                            }}>
                                {(!isRecommendation && !isDeleted) && (
                                    <TouchableOpacity
                                        onPress={this.updateTransactionCb(item)}>
                                        <View style={styles.categoryEditBtnWrapper}>
                                            <CustomIcon
                                                name="pencil"
                                                size={18}
                                                color={colors.blue36}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                            <View style={[{
                                flex: 86,
                                paddingHorizontal: 6,
                            }, commonStyles.column]}>
                                <View style={[withinRowStyles, {
                                    height: 27,
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    alignSelf: 'center',
                                    alignContent: 'center',
                                }]}>
                                    <View style={{
                                        flex: 50,
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end',
                                    }}>
                                        <View style={cs(!isRtl, commonStyles.row, [commonStyles.rowReverse], {
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end',
                                            alignItems: 'center',
                                        })}>
                                            <Text
                                                style={{
                                                    fontSize: sp(16),
                                                    color: isDeleted ? '#787878' : colors.blue7,
                                                    fontFamily: fonts.regular,
                                                }}
                                                numberOfLines={1}
                                                ellipsizeMode="tail">
                                                {item.account.accountNickname}
                                            </Text>
                                            <View style={commonStyles.spaceDivider}/>
                                            <AccountIcon account={item.account}/>
                                        </View>
                                    </View>
                                    <View style={{
                                        flex: 10,
                                    }}/>
                                    <View style={{
                                        flex: 50,
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end',
                                    }}>
                                        <View style={cs(isRtl, commonStyles.row, [commonStyles.rowReverse], {
                                            flex: 1,
                                            flexDirection: 'row',
                                            justifyContent: 'flex-end',
                                            alignItems: 'flex-end',
                                        })}>
                                            <View>
                                                {item.transType.iconType && (
                                                    <CustomIcon
                                                        name={getTransCategoryIcon(item.transType.iconType)}
                                                        size={18}
                                                        color={isDeleted ? '#787878' : colors.blue7}
                                                    />
                                                )}
                                            </View>
                                            <View style={commonStyles.spaceDividerDouble}/>
                                            <Text numberOfLines={1}
                                                  ellipsizeMode="tail"
                                                  style={{
                                                      fontSize: sp(16),
                                                      color: isDeleted ? '#787878' : colors.blue7,
                                                      fontFamily: fonts.regular,
                                                  }}>{item.transType.transTypeName}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={[withinRowStyles, {
                                    height: 27,
                                    justifyContent: 'flex-end',
                                    alignItems: 'flex-end',
                                }]}>
                                    <View style={[{
                                        flex: 50,
                                        justifyContent: 'flex-end',
                                    }]}>
                                        <View style={[withinRowStyles, {
                                            alignItems: 'center',
                                            height: 22,
                                        }]}>
                                            <Text style={[{
                                                fontSize: sp(16),
                                                color: isDeleted ? '#787878' : colors.blue7,
                                                fontFamily: fonts.regular,
                                            }]}>{'חיוב אחרון:'}</Text>
                                            <View style={commonStyles.spaceDividerDouble}/>
                                            <Text numberOfLines={1}
                                                  ellipsizeMode="tail">
                                                <Text style={[styles.dataValue, {
                                                    fontSize: sp(18),
                                                    color: isDeleted ? '#787878' : colors.blue7,
                                                }]}>{total[0]}</Text>
                                                <Text
                                                    style={[styles.fractionalPart, {fontSize: sp(18)}]}>.{total[1]}</Text>
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{
                                        flex: 10,
                                    }}/>
                                    <View style={{
                                        flex: 50,
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end',
                                    }}>
                                        {item.lastBankDate && (
                                            <View style={[withinRowStyles, {
                                                alignItems: 'center',
                                                height: 22,
                                            }]}>
                                                {item.lastBankDateColor === 'RED' && (
                                                    <View style={withinRowStyles}>
                                                        <CustomIcon
                                                            name="exclamation-triangle"
                                                            size={14}
                                                            color={isDeleted ? '#787878' : colors.red2}
                                                        />
                                                        <View style={commonStyles.spaceDividerDouble}/>
                                                    </View>
                                                )}
                                                <Text style={[{
                                                    fontSize: sp(16),
                                                    fontFamily: fonts.regular,
                                                }, cs(item.lastBankDateColor === 'RED', {
                                                    color: isDeleted ? '#787878' : colors.blue7,
                                                }, {
                                                    color: isDeleted ? '#787878' : colors.red2,
                                                })]}>
                                                    {'לפני'} {getDaysBetweenTwoDates(new Date(), new Date(item.lastBankDate))} {'ימים'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                <View style={[withinRowStyles, {
                                    height: 27,
                                    justifyContent: 'flex-end',
                                    alignItems: 'flex-end',
                                }]}>
                                    <View style={[{
                                        flex: 50,
                                    }]}>
                                        <View style={[withinRowStyles, {
                                            alignItems: 'center',
                                            height: 22,
                                            flexDirection: 'row-reverse',
                                        }]}>
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                                style={{
                                                    fontSize: sp(16),
                                                    color: isDeleted ? '#787878' : colors.blue7,
                                                    fontFamily: fonts.regular,
                                                }}>
                                                {'עודכן ע״י'} {t(`updateBy:${item.updatedBy}`)}
                                            </Text>
                                            {item.updatedBy === 'SYSTEM' && (
                                                <Image style={{width: 18, height: 18, marginHorizontal: 2}}
                                                       source={require('BiziboxUI/assets/b.png')}/>
                                            )}
                                        </View>
                                    </View>
                                    <View style={{
                                        flex: 10,
                                    }}/>
                                    <View style={{
                                        flex: 50,
                                        justifyContent: 'flex-end',
                                        alignItems: 'flex-end',
                                    }}>
                                        {item.autoUpdateTypeName && (
                                            <View style={[withinRowStyles, {
                                                alignItems: 'center',
                                                height: 22,
                                            }]}>
                                                <Text style={[{
                                                    fontSize: sp(16),
                                                    color: isDeleted ? '#787878' : colors.blue7,
                                                    fontFamily: fonts.regular,
                                                }]}>
                                                    {(item.autoUpdateTypeName === 'AVG_3_MONTHS' && item.transFrequencyName === 'NONE') ? '' : 'לפי '}{this.getAutoUpdateTypeName(item.autoUpdateTypeName, item.transFrequencyName)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </View>
                            <View style={{
                                flex: 10,
                            }}>
                                {(!isRecommendation && !isDeleted) && (
                                    <TouchableOpacity
                                        onPress={this.handleRemoveRowModalCb(isRecommendation, item, true)}>
                                        <View style={styles.categoryEditBtnWrapper}>
                                            <CustomIcon
                                                name="trash"
                                                size={18}
                                                color={colors.blue36}
                                            />
                                        </View>
                                    </TouchableOpacity>
                                )}
                                {(isDeleted) && (
                                    <TouchableOpacity
                                        onPress={this.handleRemoveRowModalCb(isRecommendation, item, true)}>
                                        <View style={styles.categoryEditBtnWrapper}>
                                            <Image style={{
                                                marginRight: 2,
                                                width: 43 / 2,
                                                height: 39 / 2,
                                            }}
                                                   source={require(
                                                       'BiziboxUI/assets/restore_blue.png')}/>
                                        </View>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                        {(!isOpen && !isDeleted) && (
                            <TouchableOpacity onPress={this.handleToggleRows}>
                                <View style={[commonStyles.rowReverse, {
                                    alignSelf: 'center',
                                    alignItems: 'center',
                                    alignContent: 'center',
                                    height: 30,
                                    backgroundColor: '#e4eef3',
                                    paddingHorizontal: 0,
                                    paddingVertical: 0,
                                    width: '100%',
                                    borderTopWidth: 1,
                                    borderTopColor: '#dddddd',
                                    justifyContent: 'center',
                                }]}>
                                    <CustomIcon
                                        name={'graph-alt'}
                                        size={18}
                                        color={colors.blue7}
                                    />
                                    <View style={commonStyles.spaceDivider}/>
                                    <AnimatedIcon
                                        size={18}
                                        name={isOpen ? 'chevron-up' : 'chevron-down'}
                                        color={colors.blue4}
                                    />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View onLayout={this.setMaxHeight}>
                        {inProgress
                            ? <ActivityIndicator color="#999999" style={{padding: 10}}/>
                            : <Graph loaded={loaded}
                                     pressed={this.pressed}
                                     dataGraph={dataGraph}
                                     handleToggle={this.handleToggleRows}
                                     isOpen={isOpen}
                            />}
                    </View>
                </Animated.View>
            </Fragment>
        )
    }
}
