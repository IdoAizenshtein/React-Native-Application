import React, {PureComponent} from 'react'
import {BackHandler, Text, TouchableOpacity, View} from 'react-native'
import {withTranslation} from 'react-i18next'
import {connect} from 'react-redux'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import {
    AccountsTab,
    AlertsTab,
    BusinessDetailsTab,
    CreditCardsTab,
    GeneralTab,
    MyAccountTab,
    PaymentsTab,
    SlikaTab,
} from './tabs'
import CompaniesModal from './components/CompaniesModal/CompaniesModal'
import SettingsMenu from './components/SettingsMenu'
import {
    ACCOUNT_TAB,
    ALERTS_TAB,
    BANK_ACCOUNTS_TAB,
    BUSINESS_DETAILS_TAB,
    CLEARING_ACCOUNTS_TAB,
    CREDIT_CARDS_TAB,
    GENERAL_TAB,
    PAYMENTS_TO_BIZIBOX_TAB,
} from 'src/constants/settings'
import {exampleCompany} from 'src/redux/constants/account'
import commonStyles from 'src/styles/styles'
import {combineStyles as cs, goToBack} from 'src/utils/func'
import styles from './SettingsScreenStyles'
import {colors} from 'src/styles/vars'
import AlertsTrial from 'src/components/AlertsTrial/AlertsTrial'

import DeviceInfo from 'react-native-device-info'
import {accountCflApi} from '../../api'
import {setOpenedBottomSheet} from '../../redux/actions/user'

export const BUNDLE_ID = DeviceInfo.getBundleId()

export const IS_DEV = BUNDLE_ID.endsWith('dev')

@connect(state => ({
    globalParams: state.globalParams,
    isRtl: state.isRtl,
    user: state.user,
    companies: state.companies,
    currentCompanyId: state.currentCompanyId,
}))
@withTranslation()
export default class SettingsScreen extends PureComponent {
    constructor(props) {
        super(props)

        const paramsLinkAddCard = props.route.params.paramsLinkAddCard

        this.state = {
            exampleCompany: exampleCompany.isExample,
            companiesModalIsOpen: false,
            currentCompany: this.props.companies.filter(
                (it) => it.companyId === props.currentCompanyId)[0],
            currentTab: (paramsLinkAddCard && paramsLinkAddCard.addCard)
                ? paramsLinkAddCard.addCard
                : ((paramsLinkAddCard && paramsLinkAddCard.goToUrl)
                    ? paramsLinkAddCard.goToUrl
                    : null)
        }

        if (paramsLinkAddCard && paramsLinkAddCard.goToUrl) {
            if (this.props.route.params.paramsLinkAddCard) {
                delete this.props.route.params.paramsLinkAddCard
            }
        }
    }

    get menu() {
        const {t, user} = this.props
        if (this.props.globalParams.ocrPilot !== undefined && this.props.globalParams.ocrPilot === 3) {
            return [
                {
                    title: t('settings:myAccount'),
                    icon: 'desktop',
                    name: ACCOUNT_TAB,
                },
                {
                    title: t('settings:businessDetails'),
                    icon: 'desktop',
                    name: BUSINESS_DETAILS_TAB,
                },
                {
                    title: t('settings:alerts'),
                    icon: 'bell',
                    name: ALERTS_TAB,
                },
                {
                    title: t('settings:paymentsToBizibox'),
                    icon: 'desktop',
                    name: PAYMENTS_TO_BIZIBOX_TAB,
                },
                {
                    title: 'כללי',
                    icon: 'gear',
                    name: GENERAL_TAB,
                },
            ]
        } else {
            return IS_DEV ? [
                {
                    title: t('settings:myAccount'),
                    icon: 'desktop',
                    name: ACCOUNT_TAB,
                },
                {
                    title: t('settings:businessDetails'),
                    icon: 'desktop',
                    name: BUSINESS_DETAILS_TAB,
                },
                {
                    title: t('settings:alerts'),
                    icon: 'bell',
                    name: ALERTS_TAB,
                },
                {
                    title: t('settings:bankAccounts'),
                    icon: 'wallet',
                    name: BANK_ACCOUNTS_TAB,
                },
                {
                    title: t('settings:creditCards'),
                    icon: 'credit',
                    name: CREDIT_CARDS_TAB,
                },
                {
                    title: t('settings:clearingAccounts'),
                    icon: 'enter-card-alt',
                    name: CLEARING_ACCOUNTS_TAB,
                },
                {
                    title: t('settings:paymentsToBizibox'),
                    icon: 'desktop',
                    name: PAYMENTS_TO_BIZIBOX_TAB,
                },
                {
                    title: 'כללי',
                    icon: 'gear',
                    name: GENERAL_TAB,
                },
            ] : [
                {
                    title: t('settings:businessDetails'),
                    icon: 'desktop',
                    name: BUSINESS_DETAILS_TAB,
                },
                {
                    title: t('settings:bankAccounts'),
                    icon: 'wallet',
                    name: BANK_ACCOUNTS_TAB,
                },
                {
                    title: t('settings:creditCards'),
                    icon: 'credit',
                    name: CREDIT_CARDS_TAB,
                },
                {
                    title: t('settings:clearingAccounts'),
                    icon: 'enter-card-alt',
                    name: CLEARING_ACCOUNTS_TAB,
                },
                {
                    title: t('settings:paymentsToBizibox'),
                    icon: 'desktop',
                    name: PAYMENTS_TO_BIZIBOX_TAB,
                },
                {
                    title: 'כללי',
                    icon: 'gear',
                    name: GENERAL_TAB,
                },
            ]
        }

    }

    get tabTitle() {
        const {currentTab} = this.state
        const {t} = this.props
        if (!currentTab) {
            return t('settings:settings')
        }
        const menuItem = this.menu.find(m => m.name === this.state.currentTab)
        return menuItem ? menuItem.title : ''
    }

    get tab() {
        const {currentCompany, exampleCompany, addCard} = this.state
        const {companies, navigation, isRtl, dispatch, route} = this.props

        switch (this.state.currentTab) {
            case ACCOUNT_TAB:
                return (
                    <MyAccountTab
                        dispatch={dispatch}
                        handleSetCompany={this.handleSetCompany}
                        isRtl={isRtl}
                        handleSetTab={this.handleSetTab}
                        navigation={navigation}
                        currentCompany={currentCompany}
                        companies={companies}
                    />
                )

            case BANK_ACCOUNTS_TAB:
                return (
                    <AccountsTab
                        deleteParamsLinkAddCard={this.deleteParamsLinkAddCard}
                        paramsLinkAddCard={route.params.paramsLinkAddCard}
                        handleSetTab={this.handleSetTab}
                        navigation={navigation}
                        currentCompany={currentCompany}
                        companies={companies}
                        exampleCompany={exampleCompany}
                    />
                )
            case CREDIT_CARDS_TAB:
                return (
                    <CreditCardsTab
                        deleteParamsLinkAddCard={this.deleteParamsLinkAddCard}
                        paramsLinkAddCard={route.params.paramsLinkAddCard}
                        handleSetTab={this.handleSetTab}
                        navigation={navigation}
                        currentCompany={currentCompany}
                        exampleCompany={exampleCompany}
                        companies={companies}
                    />
                )

            case CLEARING_ACCOUNTS_TAB:
                return (
                    <SlikaTab
                        deleteParamsLinkAddCard={this.deleteParamsLinkAddCard}
                        paramsLinkAddCard={route.params.paramsLinkAddCard}
                        isRtl={isRtl}
                        handleSetTab={this.handleSetTab}
                        navigation={navigation}
                        currentCompany={currentCompany}
                        exampleCompany={exampleCompany}
                        companies={companies}
                    />
                )

            case BUSINESS_DETAILS_TAB:
                return (
                    <BusinessDetailsTab
                        dispatch={dispatch}
                        handleSetCompany={this.handleSetCompanyFromInside}
                        isRtl={isRtl}
                        handleSetTab={this.handleSetTab}
                        navigation={navigation}
                        currentCompany={currentCompany}
                        companies={companies}
                    />
                )

            case ALERTS_TAB:
                return (
                    <AlertsTab
                        dispatch={dispatch}
                        handleSetCompany={this.handleSetCompany}
                        isRtl={isRtl}
                        handleSetTab={this.handleSetTab}
                        navigation={navigation}
                        currentCompany={currentCompany}
                        companies={companies}
                    />
                )

            case GENERAL_TAB:
                return (
                    <GeneralTab/>
                )

            case PAYMENTS_TO_BIZIBOX_TAB:
                return (
                    <PaymentsTab
                        dispatch={dispatch}
                        handleSetCompany={this.handleSetCompany}
                        isRtl={isRtl}
                        handleSetTab={this.handleSetTab}
                        navigation={navigation}
                        currentCompany={currentCompany}
                        companies={companies}
                    />
                )

            default:
                return null
        }
    }

    handleClearTab = () => this.setState({currentTab: null})

    handleOpenCompaniesModal = () => this.setState({companiesModalIsOpen: true})

    handleCloseCompaniesModal = () => this.setState(
        {companiesModalIsOpen: false})

    handleSetCompany = (company) => {
        const tab = this.state.currentTab
        this.setState({
            currentCompany: company,
            currentTab: null,
        })

        accountCflApi.post({body: {uuid: company.companyId}})
            .then(data => {
                this.setState({
                    exampleCompany: data.exampleCompany,
                })
            })

        this.handleCloseCompaniesModal()
        setTimeout(() => {
            this.setState({currentTab: tab})
        }, 20)
    }

    handleSetCompanyFromInside = (company) => {
        this.setState({currentCompany: company})
    }

    handleSetTab = (tab) => this.setState({currentTab: tab})

    deleteParamsLinkAddCard = () => {
        if (this.props.route.params.paramsLinkAddCard) {
            delete this.props.route.params.paramsLinkAddCard
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

    render() {
        const {currentTab, currentCompany, companiesModalIsOpen} = this.state
        const {isRtl, companies, navigation} = this.props
        return (
            <View style={cs(currentTab, commonStyles.mainContainer,
                {backgroundColor: colors.blue32})}>
                {currentTab !== 'PAYMENTS_TO_BIZIBOX_TAB' && (
                    <AlertsTrial onlyShowPopUp isSettings navigation={navigation}
                                 dontShowActivated
                                 refresh={this.handleClearTab}
                                 updateToken={this.props.globalParams.updateToken}/>
                )}

                <View style={cs(!currentTab, styles.headerWrapper,
                    styles.headerWhiteWrapper)}>
                    <View style={styles.centerHeaderPart}>
                        <Text
                            style={cs(!currentTab, styles.headerTitle,
                                styles.headerTitleWhiteBg)}>{this.tabTitle}</Text>
                    </View>

                    {currentTab && (
                        <TouchableOpacity style={styles.rightHeaderPart}
                                          onPress={this.handleClearTab}>
                            <Icon name="chevron-right" size={20} color={colors.white}/>
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[
                    commonStyles.row, {
                        flex: 1,
                    }]}>
                    {currentTab && (
                        <View style={styles.tabWrapper}>
                            {(currentTab !== 'PAYMENTS_TO_BIZIBOX_TAB' && currentTab !==
                                'ACCOUNT_TAB') && (
                                <TouchableOpacity
                                    onPress={this.handleOpenCompaniesModal}
                                    style={styles.companyTitleWrapper}
                                >
                                    <Icon name="chevron-left" size={22} color={colors.blue5}/>
                                    <Text
                                        style={styles.companyTitleText}>{currentCompany.companyName}</Text>
                                </TouchableOpacity>
                            )}
                            {this.tab}
                        </View>
                    )}

                    <SettingsMenu
                        currentTab={currentTab}
                        menu={this.menu}
                        onSetTab={this.handleSetTab}
                    />
                </View>

                {companiesModalIsOpen && (
                    <CompaniesModal
                        isOpen
                        isRtl={isRtl}
                        onClose={this.handleCloseCompaniesModal}
                        onSelect={this.handleSetCompany}
                        currentCompany={currentCompany}
                        companies={companies}
                    />
                )}
            </View>
        )
    }
}
