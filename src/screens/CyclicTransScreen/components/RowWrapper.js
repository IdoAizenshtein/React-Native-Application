import React, {Fragment} from 'react'
import {ActivityIndicator, Animated, Easing, Text, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import {combineStyles as cs, getFormattedValueArray, sp} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles, {DATA_ROW_HEIGHT} from '../CyclicTransStyles'
import {colors, fonts} from '../../../styles/vars'
import RowSecondLevel from './RowSecondLevel'
import AnimatedControlledRow from '../../../components/DataRow/AnimatedControlledRow'
import {connect} from 'react-redux'

@connect(state => ({
    searchkey: state.searchkey,
}))
@withTranslation()
export default class RowWrapper extends AnimatedControlledRow {
    static defaultProps = {onUpdateBankTrans: () => null}

    constructor(props) {
        super(props)
        this.initialHeight = DATA_ROW_HEIGHT
        this.maxHeight = this.initialHeight
        this.state = this.initialState
    }

    get initialState() {
        return {
            ...super.initialState,
            isOpen: this.props.isOpen,
        }
    }

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

    cbIsClose() {

    }

    handleUpdateBankTrans = (newBankTrans) => {
        const {expandedData} = this.state
        const {onUpdateBankTrans} = this.props
        const oldIndex = expandedData.findIndex(t => t.bankTransId === newBankTrans.bankTransId)
        if (oldIndex < 0) {
            return
        }
        const newData = [...expandedData]
        newData[oldIndex] = {...newData[oldIndex], ...newBankTrans}

        onUpdateBankTrans(newBankTrans)
        this.setState({expandedData: newData, currentEditBankTrans: {...newBankTrans}})
    }

    handleSelectCategory = (category) => {
        const {currentEditBankTrans} = this.state
        if (!currentEditBankTrans || currentEditBankTrans.transTypeId === category.transTypeId) {
            return
        }

        const newBankTrans = {
            ...currentEditBankTrans,
            iconType: category.iconType,
            transTypeId: category.transTypeId,
            transTypeName: category.transTypeName,
        }

        this.setState({currentEditBankTrans: {...newBankTrans}})
        return this.handleUpdateBankTrans(newBankTrans)
    }

    handleCloseCategoriesModal = () => {
        this.setState({categoriesModalIsOpen: false, currentEditBankTrans: null})
    }

    handleOpenCategoriesModal = (bankTransId) => () => {
        this.setState({categoriesModalIsOpen: true, currentEditBankTrans: bankTransId})
    }

    componentDidMount() {
    }

    fixRowHeightChild = (heightVal) => {
        const {height} = this.state

        const initialValue = height.__getValue()
        // //console.log(initialValue)
        height.setValue(initialValue)
        Animated.timing(height, {
            toValue: heightVal,
            duration: 10,
            easing: Easing.bounce,
            useNativeDriver: false,
        }).start()
    }

    setMaxHeightAll = (e) => {
        this.setMaxHeight(e)
        const {isOpen} = this.state
        if (isOpen) {
            setTimeout(() => {
                this.fixRowHeightChild(this.maxHeight + 55)
            }, 20)
        }
    }

    render() {
        const {
            isRtl,
            item,
            accounts,
            t,
            account,
            onRefresh,
            companyId,
            loaded,
            handleRemoveRowModalCb,
            approveRecommendationCb,
            updateTransactionCb,
            transIdOpened,
            isTransIdRemove,
            deleteParamNav,
            showAlert,
        } = this.props
        const {height, isOpen, inProgress} = this.state
        const wrapperStyles = cs(isOpen, styles.dataRow, styles.titleRowActive)
        const withinRowStyles = cs(isRtl, commonStyles.row, commonStyles.rowReverse)

        const total = getFormattedValueArray(item.sum)
        const numberStyle = cs((item.sum < 0), [styles.dataValue, {color: colors.green4}], {color: colors.red2})

        return (
            <Fragment>
                <Animated.View style={[styles.dataRowAnimatedWrapper, {height}]}>
                    <View style={wrapperStyles} onLayout={this.setMinHeight}>
                        <TouchableOpacity onPress={this.handleToggle}>
                            <View style={[withinRowStyles, {
                                alignSelf: 'center',
                                alignItems: 'center',
                                alignContent: 'center',
                                justifyContent: 'center',
                            }]}>
                                <View style={{
                                    flex: 70,
                                }}>
                                    <Text numberOfLines={1} ellipsizeMode="tail" style={[{
                                        textAlign: 'right',
                                        fontSize: sp(18),
                                    }, cs(isOpen, {
                                        fontFamily: fonts.semiBold,
                                        color: colors.blue5,
                                    }, {
                                        fontFamily: fonts.bold,
                                        color: colors.white,
                                    })]}>
                                        {item.title === 'RECOMMENDATION' ? ('תנועות מומלצות להוספה') :
                                            item.title === 'deleted' ?
                                                'תנועות שנמחקו'
                                                : (this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === item.title) ? this.props.searchkey.find((it) => it.paymentDescription === item.title).name : '')}
                                    </Text>
                                </View>

                                {(item.title !== 'RECOMMENDATION') && (<View style={{
                                    flex: 30,
                                }}>
                                    <Text
                                        style={{
                                            flex: 1,
                                        }}
                                        numberOfLines={1}
                                        ellipsizeMode="tail">
                                        <Text style={[numberStyle, {fontSize: sp(18)}, cs(isOpen, {
                                            fontFamily: fonts.semiBold,
                                            color: colors.blue5,
                                        }, {
                                            fontFamily: fonts.bold,
                                            color: colors.white,
                                        })]}>{total[0]}</Text>
                                        <Text style={[styles.fractionalPart, {fontSize: sp(18)}, cs(isOpen, {
                                            color: colors.blue5,
                                        }, {
                                            color: colors.white,
                                        })]}>.{total[1]}</Text>
                                    </Text>
                                </View>)}
                            </View>
                        </TouchableOpacity>
                    </View>

                    <View onLayout={this.setMaxHeightAll}>
                        {inProgress
                            ? <ActivityIndicator color="#999999" style={{padding: 10}}/>
                            : <RowSecondLevel
                                showAlert={showAlert}
                                deleteParamNav={deleteParamNav}
                                isTransIdRemove={isTransIdRemove}
                                transIdOpened={transIdOpened}
                                isParentOpened={isOpen}
                                updateTransactionCb={updateTransactionCb}
                                approveRecommendationCb={approveRecommendationCb}
                                handleRemoveRowModalCb={handleRemoveRowModalCb}
                                loaded={loaded}
                                isRtl={isRtl}
                                data={item.data}
                                isDeleted={(item.title === 'deleted')}
                                isRecommendation={(item.title === 'RECOMMENDATION')}
                                t={t}
                                account={account}
                                onRefresh={onRefresh}
                                companyId={companyId}
                                accounts={accounts}
                            />}
                    </View>
                </Animated.View>
            </Fragment>
        )
    }
}
