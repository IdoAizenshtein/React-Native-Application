import React, {Fragment, PureComponent} from 'react'
import {ScrollView, Text, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import Switch from 'react-native-switch-pro'
import CustomIcon from 'src/components/Icons/Fontello'
import Loader from 'src/components/Loader/Loader'
import TokenItem from './components/TokenItem'
import AccountRecoveryModal from './components/AccountRecoveryModal'
import {accountDeleteApi, cardDeleteApi, recoverAccountCflApi, solekDeleteApi, tokenTypeApi} from 'src/api'
import {colors} from 'src/styles/vars'
import styles from './BaseTokenTabStyles'
import commonStyles from 'src/styles/styles'
import AddTokenModal from './components/AddTokenModal/AddTokenModal'
import UpdateTokenModal from './components/AddTokenModal/UpdateTokenModal'
import AsyncStorage from '@react-native-async-storage/async-storage';

@withTranslation()
export default class BaseTokenTab extends PureComponent {
    constructor(props) {
        super(props)

        this.state = this.getInitialState()
        // console.log('props----', props)
        const paramsLinkAddCard = props.paramsLinkAddCard;
        if (paramsLinkAddCard) {
            props.deleteParamsLinkAddCard();
            setTimeout(() => this.handleToggleAddAccountModal(), 200)
        }
    }

    getDataStorage = async (name) => {
        const value = await AsyncStorage.getItem(name)
        if (value !== null) {
            return JSON.parse(value)
        } else {
            return null
        }
    }

    storeData = async (name, value) => {
        await AsyncStorage.setItem(name, JSON.stringify(value))
    }
    getInitialState = () => {
        return {
            cards: null,
            inProgress: false,
            tokens: null,
            items: null,
            deletedItems: null,
            selectedAccountToAction: null,
            accountRecoveryModalIsOpen: false,
            accountUpdateModalIsOpen: false,
            addAccountModalIsOpen: false,
            currentToken: null,
            updateTokenModalIsOpen: false,
        }
    }

    getSwitchIcon = () => {
        const {isShowRemovedAccounts} = this.state
        return (
            <CustomIcon
                name={isShowRemovedAccounts ? 'ok' : 'times'}
                size={7}
                color={isShowRemovedAccounts ? colors.blue32 : colors.gray29}
            />
        )
    }

    getData = () => {
        const {tokenType, currentCompany, getItems, getCreditCards, t, exampleCompany} = this.props
        const {isShowRemovedAccounts} = this.state
        const {companyId} = currentCompany

        this.setState({inProgress: true})
        return Promise.all([
            tokenTypeApi.post({
                pathParams: {tokenType},
                body: {uuid: companyId},
            }),
            getItems(),
        ])
            .then(([tokens, items]) => {
                const groupBy = key => array =>
                    array.reduce((objectsByKeyValue, obj) => {
                        const value = obj[key]
                        objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(
                            obj)
                        return objectsByKeyValue
                    }, {})

                if (tokens && !tokens.length && items && items.length) {
                    const tokensGrNew = []
                    const arrayGr = groupBy('token')(items)
                    for (const property in arrayGr) {
                        // console.log(`${property}: ${arrayGr[property]}`)
                        const objAcc = arrayGr[property][0]

                        tokensGrNew.push({
                            token: objAcc.token,
                            tokenStatus: null,
                            tokenNickname: tokenType === 'SLIKA' ? t(
                                `clearingAgenciesName:${objAcc.solekBankId}`) : (tokenType ===
                            'CREDITCARD'
                                ? t(`creditCardsName:${objAcc.creditCardTypeId}`)
                                : t(`bankName:${objAcc.bankId}`)),
                            isFromAccount: true,
                            websiteTargetTypeId: tokenType === 'SLIKA'
                                ? objAcc.solekBankId
                                : (tokenType === 'CREDITCARD'
                                    ? objAcc.creditCardTypeId
                                    : objAcc.bankId),
                            screenPasswordUpdateCount: null,
                            dateCreated: objAcc.dateCreated,
                            tokenTargetType: tokenType === 'SLIKA' ? 'SLIKA' : 'ACCOUNT',
                            hasPrivs: true,
                            companyAccountId: objAcc.companyAccountId,
                            anotherCompanyExist: false,
                        })
                    }

                    tokens = tokensGrNew
                } else if (tokens && tokens.length && items && items.length) {
                    const allAccWithoutTknMatch = items.filter(
                        (acc) => tokens.every((tkn) => tkn.token !== acc.token))
                    if (allAccWithoutTknMatch.length) {
                        const arrayGr = groupBy('token')(allAccWithoutTknMatch)
                        for (const property in arrayGr) {
                            // console.log(`${property}: ${arrayGr[property]}`)
                            const objAcc = arrayGr[property][0]
                            tokens.push({
                                token: objAcc.token,
                                tokenStatus: null,
                                tokenNickname: tokenType === 'SLIKA' ? t(
                                    `clearingAgenciesName:${objAcc.solekBankId}`) : (tokenType ===
                                'CREDITCARD'
                                    ? t(`creditCardsName:${objAcc.creditCardTypeId}`)
                                    : t(`bankName:${objAcc.bankId}`)),
                                isFromAccount: true,
                                websiteTargetTypeId: tokenType === 'SLIKA'
                                    ? objAcc.solekBankId
                                    : (tokenType === 'CREDITCARD'
                                        ? objAcc.creditCardTypeId
                                        : objAcc.bankId),
                                screenPasswordUpdateCount: null,
                                dateCreated: objAcc.dateCreated,
                                tokenTargetType: tokenType === 'SLIKA' ? 'SLIKA' : 'ACCOUNT',
                                hasPrivs: true,
                                companyAccountId: objAcc.companyAccountId,
                                anotherCompanyExist: false,
                            })
                        }
                    }
                }

                if (tokenType === 'ACCOUNT' && exampleCompany) {
                    tokens = []
                }
                this.setState({
                    tokens,
                    items,
                    inProgress: !!(isShowRemovedAccounts),
                })

                if (tokenType === 'ACCOUNT') {
                    getCreditCards().then((cards) => {
                        this.setState({cards})
                    })
                }
                if (isShowRemovedAccounts) {
                    this.getDeletedItems()
                }
            })
            .catch(() => {
                this.setState({inProgress: false})
            })
    }

    getDeletedItems = () => {
        const {getDeletedItems} = this.props
        const {tokens, isShowRemovedAccounts} = this.state
        this.setState({inProgress: true})
        const isExistsTokens = tokens && Array.isArray(tokens) && tokens.filter(it=> it.token).map(t => t.token).length;
        if (isExistsTokens && isShowRemovedAccounts) {
            getDeletedItems(tokens && Array.isArray(tokens) && tokens.filter(it=> it.token).map(t => t.token).length ? tokens.filter(it=> it.token).map(t => t.token) : [])
                .then((deletedItems) => {
                    this.setState({
                        deletedItems,
                        inProgress: false,
                    })
                })
                .catch(() => this.setState({inProgress: false}))
        } else {
            setTimeout(() => {
                this.setState({deletedItems: null, inProgress: false})
            }, 20)
        }
    }

    handleChangeScreenMode = async (state) => {
        console.log('isShowRemovedAccounts', state)
        await this.storeData('isShowRemovedAccounts', state)
        this.setState({isShowRemovedAccounts: state})
        setTimeout(() => {
            this.getDeletedItems()
        }, 20)
    }

    handleOpenAccountRecoverModal = (account) => {
        this.setState({
            selectedAccountToAction: account,
            accountRecoveryModalIsOpen: true,
        })
    }

    handleCloseAccountRecoverModal = () => {
        this.setState({
            selectedAccountToAction: null,
            accountRecoveryModalIsOpen: false,
        })
    }

    handleRecoverAccount = () => {
        const {inProgress, selectedAccountToAction} = this.state
        const {
            tokenType,
        } = this.props
        if (inProgress || !selectedAccountToAction) {
            return
        }

        this.setState({
            inProgress: true,
            selectedAccountToAction: null,
            accountRecoveryModalIsOpen: false,
        })

        setTimeout(() => {
            if (tokenType === 'ACCOUNT') {
                const tokenTypes = 'bank'
                const companyAccountId = selectedAccountToAction.companyAccountId
                return recoverAccountCflApi.post({
                    body: {
                        tokenType: tokenTypes,
                        companyAccountId: companyAccountId,
                    },
                })
                    .finally(this.getData)
            } else if (tokenType === 'CREDITCARD') {
                const tokenTypes = 'card'
                const companyAccountId = selectedAccountToAction.creditCardId
                return recoverAccountCflApi.post({
                    body: {
                        tokenType: tokenTypes,
                        companyAccountId: companyAccountId,
                    },
                })
                    .finally(this.getData)
            } else if (tokenType === 'SLIKA') {
                const tokenTypes = 'solek'
                const companyAccountId = selectedAccountToAction.companyAccountId
                return recoverAccountCflApi.post({
                    body: {
                        solekNum: selectedAccountToAction.solekNum,
                        tokenType: tokenTypes,
                        companyAccountId: companyAccountId,
                    },
                })
                    .finally(this.getData)
            }
        }, 50)
    }

    handleOpenAccountUpdateModal = (account) => {
        this.setState({
            selectedAccountToAction: account,
            accountUpdateModalIsOpen: true,
        })
    }

    handleCloseAccountUpdateModal = () => {
        this.setState({
            selectedAccountToAction: null,
            accountUpdateModalIsOpen: false,
        })
    }

    handleRemoveAccount = () => {
        const {selectedAccountToAction} = this.state
        const {
            tokenType,
        } = this.props
        this.handleCloseAccountUpdateModal()
        setTimeout(() => {
            if (tokenType === 'ACCOUNT') {
                return accountDeleteApi.post({
                    body: {
                        uuid: selectedAccountToAction.companyAccountId,
                    },
                }).then(() => {
                    this.closePopUp()
                    setTimeout(() => this.getData(), 200)
                })
            } else if (tokenType === 'CREDITCARD') {
                return cardDeleteApi.post({
                    body: {
                        uuid: selectedAccountToAction.creditCardId,
                    },
                }).then(() => {
                    this.closePopUp()
                    setTimeout(() => this.getData(), 200)
                })
            } else if (tokenType === 'SLIKA') {
                return solekDeleteApi.post({
                    body: {
                        'companyAccountId': selectedAccountToAction.companyAccountId,
                        'solekNum': selectedAccountToAction.solekNum,
                    },
                }).then(() => {
                    setTimeout(() => this.getData(), 200)
                })
            }
        }, 100)
    }
    closePopUp = () => {
        this.setState({
            selectedAccountToAction: null,
            accountUpdateModalIsOpen: false,
            accountRecoveryModalIsOpen: false,
        })
    }
    handleUpdateItem = ({...args}) => {
        const {inProgress, selectedAccountToAction} = this.state
        const {onUpdateItem} = this.props
        if (inProgress || !selectedAccountToAction) {
            return
        }

        this.setState({
            inProgress: true,
            selectedAccountToAction: null,
            accountUpdateModalIsOpen: false,
        })
        return onUpdateItem({
            ...args,
            item: selectedAccountToAction,
        }).finally(this.getData)
    }

    handleToggleAddAccountModal = () => {
        const {addAccountModalIsOpen} = this.state
        this.setState({addAccountModalIsOpen: !addAccountModalIsOpen})
        if (addAccountModalIsOpen && this.props.closeParent) {
            this.props.closeParent()
        }
        if (addAccountModalIsOpen) {
            this.getData()
        }
    }

    handleOpenUpdateTokenModal = (token) => () => {
        this.setState({
            currentToken: token,
            updateTokenModalIsOpen: true,
        })
    }

    handleCloseUpdateTokenModal = () => this.setState({
        currentToken: null,
        updateTokenModalIsOpen: false,
    })

    async UNSAFE_componentWillReceiveProps(nextProps) {
        const {tokenType, isUpdate} = this.props
        if (!isUpdate && tokenType === nextProps.tokenType) {
            return
        }
        this.setState({...this.getInitialState()}, this.getData)
    }

    async componentDidMount() {
        try {
            const isShowRemovedAccounts = await this.getDataStorage(
                'isShowRemovedAccounts')
            this.setState({
                isShowRemovedAccounts: (isShowRemovedAccounts !== undefined &&
                    isShowRemovedAccounts !== null) ? isShowRemovedAccounts : true,
            }, this.getData)
        } catch (error) {
            console.log(error)
            this.setState({
                isShowRemovedAccounts: true,
            }, this.getData)
        }
    }

    render() {
        const {
            cards,
            tokens,
            items,
            deletedItems,
            currentToken,
            selectedAccountToAction,
            inProgress,
            isShowRemovedAccounts,
            accountRecoveryModalIsOpen,
            accountUpdateModalIsOpen,
            addAccountModalIsOpen,
            updateTokenModalIsOpen,
        } = this.state
        const {
            t,
            title,
            tokenType,
            accounts,
            currentCompany,
            ItemDetailsComponent,
            ItemEditComponent,
            paramsLinkAddCard,
            handleSetTab,
            isRtl,
            exampleCompany,
        } = this.props
        const paramsLinkAddCardAdd = false;
        if (inProgress) {
            return <Loader/>
        }

        return (
            <Fragment>
                {!paramsLinkAddCardAdd && (
                    <View style={styles.switchWrapper}>
                        <Text style={styles.switchText}>
                            {tokenType === 'ACCOUNT' ? t(
                                'settings:bankAccountsTab:viewDeletedAccounts') : t(
                                'settings:bankAccountsTab:viewDeletedCards')}
                        </Text>
                        <View style={commonStyles.spaceDividerDouble}/>
                        <Switch
                            value={isShowRemovedAccounts}
                            width={39}
                            height={20}
                            circleSize={15}
                            circleColorActive={colors.white}
                            circleColorInactive={colors.gray17}
                            backgroundActive={colors.blue32}
                            backgroundInactive={colors.gray29}
                            circleInnerComponent={this.getSwitchIcon}
                            onSyncPress={this.handleChangeScreenMode}
                        />
                    </View>
                )}

                {!paramsLinkAddCardAdd && (
                    <ScrollView
                        keyboardShouldPersistTaps="always"
                        style={commonStyles.mainContainer}
                        contentContainerStyle={{paddingBottom: 150}}
                    >
                        {(tokens && tokens.length)
                            ? tokens.map(t => {
                                return (
                                    <TokenItem
                                        openAddToken={this.handleToggleAddAccountModal}
                                        currentCompany={currentCompany}
                                        tokenType={tokenType}
                                        cards={cards}
                                        handleSetTab={handleSetTab}
                                        key={t.token}
                                        token={t}
                                        isShowRemovedItems={isShowRemovedAccounts}
                                        items={items}
                                        accounts={accounts}
                                        deletedItems={deletedItems}
                                        ItemDetailsComponent={ItemDetailsComponent}
                                        onOpenItemRecoveryModal={this.handleOpenAccountRecoverModal}
                                        onOpenItemUpdateModal={this.handleOpenAccountUpdateModal}
                                        onOpenTokenUpdateModal={this.handleOpenUpdateTokenModal}
                                    />
                                )
                            }) : null}
                    </ScrollView>
                )}

                {!paramsLinkAddCardAdd && (
                    <View style={styles.addBtnWrapper}>
                        <TouchableOpacity
                            activeOpacity={(exampleCompany && tokenType !== 'ACCOUNT')
                                ? 0.4
                                : 0.6}
                            style={[
                                styles.addNewBtn, {
                                    opacity: (exampleCompany && tokenType !== 'ACCOUNT')
                                        ? 0.4
                                        : 1,
                                }]}
                            onPress={(exampleCompany && tokenType !== 'ACCOUNT')
                                ? null
                                : this.handleToggleAddAccountModal}>
                            <CustomIcon
                                name="plus"
                                size={32}
                                color={colors.white}
                            />
                        </TouchableOpacity>
                    </View>
                )}

                {(accountRecoveryModalIsOpen && selectedAccountToAction) ? (
                    <AccountRecoveryModal
                        tokenType={tokenType}
                        onClose={this.handleCloseAccountRecoverModal}
                        onSubmit={this.handleRecoverAccount}
                        account={selectedAccountToAction}
                    />
                ) : null}

                {(accountUpdateModalIsOpen && selectedAccountToAction) ? (
                    <ItemEditComponent
                        isRtl={isRtl}
                        accounts={accounts}
                        tokenType={tokenType}
                        onClose={this.handleCloseAccountUpdateModal}
                        onSubmit={this.handleRecoverAccount}
                        onRemove={this.handleRemoveAccount}
                        onUpdate={this.handleUpdateItem}
                        item={selectedAccountToAction}
                    />
                ) : null}

                {addAccountModalIsOpen && (
                    <AddTokenModal
                        navigation={this.props.navigation}
                        title={title}
                        tokenType={tokenType}
                        accounts={accounts}
                        companyId={currentCompany.companyId}
                        onClose={this.handleToggleAddAccountModal}
                    />
                )}

                {updateTokenModalIsOpen && (
                    <UpdateTokenModal
                        navigation={this.props.navigation}
                        tokenType={tokenType}
                        title={title}
                        token={currentToken}
                        companyId={currentCompany.companyId}
                        onClose={this.handleCloseUpdateTokenModal}
                    />
                )}
            </Fragment>
        )
    }
}
