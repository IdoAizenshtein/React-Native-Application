import React, {PureComponent} from 'react'
import {RefreshControl, Text, TouchableOpacity, View} from 'react-native'
import commonStyles from '../../../styles/styles'
import {combineStyles as cs, getCurrencyChar, sp} from '../../../utils/func'
import {withTranslation} from 'react-i18next'
import CustomIcon from '../../../components/Icons/Fontello'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import {colors} from '../../../styles/vars'
import {isToday} from '../../../utils/date'
import AppTimezone from '../../../utils/appTimezone'
import {KeyboardAwareFlatList} from 'react-native-keyboard-aware-scroll-view'

class MyListItem extends PureComponent {
    _onPress = () => {
        if (!this.props.account || (this.props.account &&
            isToday(this.props.account.balanceLastUpdatedDate))) {
            this.props.onPressItem(this.props.id)
        }
    }

    _onPressNumber = (value) => {
        this.props.onPressNumber(value)
    };

    render() {
        const selected = this.props.selected
        return (
            <View style={[cs(!this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                height: 42,
                marginBottom: 8,
            }]}>
                <View style={{flex: 0.46, alignItems: 'flex-end'}}/>
                <View style={{
                    flex: 7.3,
                    backgroundColor: '#f5f5f5',
                    paddingHorizontal: 21,
                    borderBottomRightRadius: 20,
                    borderTopRightRadius: 20,
                }}>
                    <TouchableOpacity
                        style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                        }, cs(this.props.account && !isToday(this.props.account.balanceLastUpdatedDate), {opacity: 1}, {opacity: 0.3})]}
                        onPress={this._onPress}>
                        <View style={{
                            marginRight: 'auto',
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                        }}>
                            {selected && (<CustomIcon name="ok" size={16} color={colors.blue34}/>)}
                        </View>

                        {(this.props.account && !isToday(this.props.account.balanceLastUpdatedDate)) &&
                        <Text style={{color: colors.red}}>{` - ${this.props.t('bankAccount:notUpdated')}`}</Text>}
                        <Text
                            style={[{
                                fontSize: sp(16),
                                color: colors.blue7,
                            }, {
                                fontSize: sp(15),
                                lineHeight: 42,
                            }, commonStyles.regularFont]}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {this.props.text} {(this.props.account) ? `(${getCurrencyChar(this.props.account.currency)})` : ''}
                        </Text>
                        {this.props.account && (
                            <View style={{paddingHorizontal: 2}}><AccountIcon account={this.props.account}/></View>)}
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}

@withTranslation()
export default class CheckList extends PureComponent {
    today = AppTimezone.moment().valueOf();

    constructor(props) {
        super(props)
        this.state = {
            copyArr: props.data ? props.data : [],
            refreshing: false,
        }
    }

    _onPressNumber = () => {
        this.setState({refreshing: true})
        setTimeout(() => {
            this.setState({refreshing: false})
            this.props.close()
            this.props.loadGetRecommendation()
        }, 10)
    };

    _keyExtractor = (item, index) => item.id;

    _onPressItem = (id) => {
        this.setState((state) => {
            const copyArr = state.copyArr
            copyArr.forEach((item) => {
                item.selected = false
                if (item.id === id) {
                    item.selected = true
                }
            })
            this.props.value[this.props.type] = id
            return {copyArr: copyArr}
        })
        this.setState({refreshing: true})
        setTimeout(() => {
            this.setState({refreshing: false})
            this.props.close()
            this.props.loadGetRecommendation()
        }, 10)
    };

    _renderItem = ({item}) => (
        <MyListItem
            id={item.id}
            value={this.props.value}
            onPressItem={this._onPressItem}
            onPressNumber={this._onPressNumber}
            selected={item.selected}
            text={item.text}
            t={this.props.t}
            account={(item.account) ? item.account : null}
        />
    );

    _onRefresh = () => {
        this.setState({refreshing: true})
    };

    componentWillUnmount() {
        // debugger
    }

    render() {
        // const rowStyle = !this.props.isRtl ? 'row-reverse' : 'row'
        return (
            <View>
                <KeyboardAwareFlatList
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                    data={this.state.copyArr}
                    extraData={this.state}
                    keyExtractor={this._keyExtractor}
                    renderItem={this._renderItem}
                />
            </View>
        )
    }
}
