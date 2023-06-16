import React, { Fragment, PureComponent } from "react";
import { setOpenedBottomSheet } from "src/redux/actions/user";
import {
  Animated, AppState,
  BackHandler,
  Dimensions,
  Image,
  Keyboard, Linking,
  Modal,
  SafeAreaView,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { connect } from "react-redux";
import AppTimezone from "../../utils/appTimezone";
import { last, values } from "lodash";
import { withTranslation } from "react-i18next";
import { getAccountIdForSelection } from "src/utils/account";
import Loader from "src/components/Loader/Loader";
import {
  getAccount,
  getAccountAggregatedDataWithIds,
  getAccountBankTransBySections,
  getAccountGroups,
  getAccountTodayTransAggregated,
} from "src/redux/selectors/account";
import {
  getAccountAggregateData,
  getAccountBalanceChartData,
  getAccountBankTrans,
  getAccountTodayTransData,
  selectAccounts,
  updateBankTrans,
} from "src/redux/actions/account";
import AccountsModal from "src/components/AccountsModal/AccountsModal";
import AccountAlertDetails from "src/components/AccountAlert/AccountAlertDetails";
import BankAccountsCalendarModal from "./components/BankAccountsCalendarModal";
import { DEFAULT_PRIMARY_CURRENCY, SCREEN_MODES } from "src/constants/bank";
import { IS_IOS } from "src/constants/common";
import {
  accountCflCheckDetailsApi,
  accountCflDataApi,
  accountCflDataDetailApi,
  accountCflDataUpdateApi,
  cashDetailsApi,
  cashSplitApi,
  createAccountCflTransTypeApi,
  defineSearchkeyApi,
  getAccountCflTransTypeApi,
  mutavCategoryUpdateApi,
  removeAccountCflTransTypeApi,
  updateCheckCategoryApi,
} from "src/api";
import { colors, fonts } from "src/styles/vars";
import {
  combineStyles as cs,
  formatAsSumNoMath,
  getBankTransIcon,
  getCurrencyChar,
  getEmoji,
  getErrText,
  getFormattedValueArray,
  getTransCategoryIcon,
  goToBack,
  sp,
} from "../../utils/func";
import styles from "./BankAccountsStyles";
import DataList from "./components/DataList";
import BankAccountsHeader from "./components/BankAccountsHeader";
import AlertsTrial from "src/components/AlertsTrial/AlertsTrial";
import CustomIcon from "src/components/Icons/Fontello";
import commonStyles from "../../styles/styles";
import { Grid, LineChart, XAxis, YAxis } from "react-native-svg-charts";
import { getListOfDatesInterval } from "../../utils/date";
import { LocaleConfig } from "react-native-calendars";
import { isIphoneX } from "react-native-iphone-x-helper";
import CategoriesModal from "src/components/CategoriesModal/CategoriesModal";
import AccountIcon from "src/components/AccountIcon/AccountIcon";
import CheckTransSlider from "./components/CheckTransSlider";
import { Icon } from "react-native-elements";

import Interactable from "react-native-interactable";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { exampleCompany } from "../../redux/constants/account";
import CreditLimitModal from "../SettingsScreen/tabs/CreditCards/components/CreditLimitModal/CreditLimitModal";
import Icons from "react-native-vector-icons/MaterialCommunityIcons";
import { HeaderHeightContext } from "@react-navigation/elements";

const Screen = {
  width: Dimensions.get("window").width,
  height: Dimensions.get("window").height - 75,
};
const win = Dimensions.get("window");

const numberFormat = new Intl.NumberFormat("he");

@connect(state => ({
  globalParams: state.globalParams,
  isRtl: state.isRtl,
  currentCompanyId: state.currentCompanyId,
  accounts: getAccount(state),
  accountGroups: getAccountGroups(state),
  accountAggregatedData: getAccountAggregatedDataWithIds(state),
  accountAggregatedTodayTrans: getAccountTodayTransAggregated(state),
  accountTodayTrans: state.accountTodayTrans,
  bankTrans: getAccountBankTransBySections(state),
  accountBalanceChartData: state.accountBalanceChartData,
  searchkey: state.searchkey,
}))
@withTranslation()
export default class BankAccountsScreen extends PureComponent {
  constructor(props) {
    super(props);


    this.state = {
      isCheckEditCategory: false,
      categoriesModalIsOpen: false,
      currentOpenItemIndex: null,
      screenMode: "details",
      bounceValue: new Animated.Value(400),
      isDefDates: true,
      fadeAnim: new Animated.Value(0),
      showAlert: false,
      updateType: "only",
      updateTypePopup: false,
      categories: [],
      enabledScroll: true,
      selectedIndex: 0,
      appStateBgTime: null,
      isReady: false,
      inProgress: false,
      isLayoutComplete: false,
      switchAccountInProgress: false,
      changeScreenModeInProgress: false,
      error: null,
      selectedAccountIds: [],
      creditLimitAcc: {},
      // if null then it is aggregated request
      currentSelectedAccountId: null,
      selectedGroup: null,
      accountsModalIsOpen: false,
      calendarModalIsOpen: false,
      dateFromTimestamp: AppTimezone.moment().subtract(30, "days").startOf("day").valueOf(),
      dateTillTimestamp: AppTimezone.moment().startOf("day").valueOf(),
      headerMaxHeight: 100,
      alertYPosition: 0,
      alertDetailsIsOpen: false,
      isHeaderChartSliderPanEnable: true,
      currentScrollPosition: 0,
      bankTrans: {},
      bankTransCopy: {},
      accountAggregatedData: null,
      accountBalanceChartDataState: [],
      pointerEvents: "none",
      pointerEvent: "none",
      scrollAnim: new Animated.Value(IS_IOS ? 0 : 0),
      queryStatus: {
        query: null,
      },
      payList: [],
      payListCopy: [],
      categoriesMatch: [],
      categoriesMatchCopy: [],
      categoriesMatchModal: false,
      isSearchOpen: false,
      payListModal: false,
      showGraph: false,
      datesGraphList: [],
      bankTransGraphHova: [],
      bankTransGraphZchut: [],
      numberTickZchut: 2.5,
      numberTickHova: 2.5,
      yAxisSums: [],
      monthYear: [],
      isScreenSwitchState: false,
      dataRow: null,
      details: null,
      categoryItem: null,
      inProgressDetails: false,
      editDescModal: false,
      copyMainDesc: "",
      copyMainDescValid: true,
      bankTransIdOpened: this.props.route.params.bankTransId ? this.props.route.params.bankTransId : null,
      idxCategory: 0,
      enabledScrolls: true,
      bounces: true,
      screenHeight: 0,
      refreshing: false,
      scrollY: new Animated.Value(0),
      inProgressSnap: false,
      cashDetails: [],
      cashDetailsSrc: [],
      sumTotals: 0,
      cashSplitPopupOpen: false,
      categoriesInsideSplitModalIsOpen: false,
      editDescModalInsideSplit: false,
      copyMainDescInsideSplit: "",
      copyMainDescValidInsideSplit: true,
      descIdxInsideSplitModalIsOpen: false,
      totalCategoryModalIsOpen: false,
      setTotalCategoryInProgress: false,
    };
    this.scrollY = new Animated.Value(IS_IOS ? -100 : 0);
    this.headerChartX = new Animated.ValueXY();
    this._deltaY = new Animated.Value(0);
    this.props.dispatch(setOpenedBottomSheet(false));
  }

  get headerScrollDistance() {
    const { headerMaxHeight } = this.state;
    const scrollDistance = headerMaxHeight;
    return scrollDistance >= 0 ? scrollDistance : 0;
  }

  get headerMinHeight() {
    const minHeight = this.screenSwitchState ? 75 : 35;
    return minHeight;
  }

  get selectedAccounts() {
    const { accounts } = this.props;
    const selectedAccountIds = this.accountIdsForRequest;

    return accounts.filter(a => selectedAccountIds.includes(a.companyAccountId));
  }

  get selectedDeviantAccounts() {
    return this.selectedAccounts.filter(a => a.balanceUse < 0);
  }

  get selectedNotUpdatedAccounts() {
    return this.selectedAccounts.filter(a => a.nonUpdateDays > 0);
  }

  get isLoader() {
    const { isReady, inProgress } = this.state;
    return !isReady || inProgress;
  }

  get screenSwitchState() {
    return this.state.screenMode === SCREEN_MODES.aggregate;
  }

  get hasData() {
    const { accountAggregatedData, bankTransCopy } = this.state;

    return this.screenSwitchState
      ? !!(accountAggregatedData && accountAggregatedData.accountTransactions.length)
      : !!(bankTransCopy && bankTransCopy.length);
  }

  get hasDataFilter() {
    const { bankTrans } = this.state;
    return !this.screenSwitchState && (!bankTrans || (bankTrans && bankTrans.length === 0));
  }

  get hasHeaderAlert() {
    if (!this.selectedAccounts.length || (!this.selectedDeviantAccounts.length && !this.selectedNotUpdatedAccounts.length)) {
      return false;
    }
    return values(this.headerAlertState).some(v => v);
  }

  get headerAlertState() {
    const selectedAccounts = this.selectedAccounts;
    const selectedDeviantAccounts = this.selectedDeviantAccounts;
    const selectedNotUpdatedAccounts = this.selectedNotUpdatedAccounts;

    return {
      selectedAccounts: selectedAccounts,
      isOneOfOne: selectedAccounts.length === 1 && selectedDeviantAccounts.length === 1,
      isOneOfMultiple: selectedAccounts.length > 1 && selectedDeviantAccounts.length === 1,
      isMoreThenOneOfMultiple: selectedAccounts.length > 1 && selectedDeviantAccounts.length > 1,
      isOneOfOneNotUpdated: selectedAccounts.length === 1 && selectedNotUpdatedAccounts.length === 1,
      isOneOfMultipleNotUpdated: selectedAccounts.length > 1 && selectedNotUpdatedAccounts.length === 1,
      isMoreThenOneOfMultipleNotUpdated: selectedAccounts.length > 1 && selectedNotUpdatedAccounts.length > 1,
      isAccountNotUpdated: !!(selectedAccounts.length && selectedNotUpdatedAccounts.length),
    };
  }

  get accountIdsForRequest() {
    const { selectedAccountIds, currentSelectedAccountId } = this.state;
    return currentSelectedAccountId ? [currentSelectedAccountId] : selectedAccountIds;
  }

  get canChangeAccountsBySlider() {
    const { selectedAccountIds } = this.state;
    return selectedAccountIds && selectedAccountIds.length > 1;
  }

  get nextAccountIndex() {
    const { selectedAccountIds, currentSelectedAccountId } = this.state;
    if (!this.canChangeAccountsBySlider) {
      return null;
    }
    if (!currentSelectedAccountId) {
      return 1;
    }

    const oldIndex = selectedAccountIds.findIndex(id => id === currentSelectedAccountId);
    const newIndex = oldIndex + 2;
    const lastIndex = selectedAccountIds.length;
    return newIndex <= lastIndex ? newIndex : 0;
  }

  get previousAccountIndex() {
    const { selectedAccountIds, currentSelectedAccountId } = this.state;
    if (!this.canChangeAccountsBySlider) {
      return null;
    }
    if (!currentSelectedAccountId) {
      return selectedAccountIds.length;
    }

    const newIndex = selectedAccountIds.findIndex(id => id === currentSelectedAccountId);
    const lastIndex = selectedAccountIds.length;
    return newIndex >= 0 ? newIndex : lastIndex;
  }

  get currentAccountIndex() {
    const { selectedAccountIds, currentSelectedAccountId } = this.state;
    if (!this.canChangeAccountsBySlider || !currentSelectedAccountId) {
      return 0;
    }
    return selectedAccountIds.findIndex(id => id === currentSelectedAccountId) + 1;
  }

  get hasNextAccount() {
    return this.nextAccountIndex !== null;
  }

  get hasPreviousAccount() {
    return this.previousAccountIndex !== null;
  }

  get minOldestTransDateInSelectedAccounts() {
    if (!this.selectedAccounts || !this.selectedAccounts.length) {
      return null;
    }
    let oldestTransDate = this.selectedAccounts.reduce((accmltr, acc) => {
      return Number.isFinite(acc.oldestTransDate) &&
      (accmltr === null || acc.oldestTransDate < accmltr)
        ? acc.oldestTransDate : accmltr;
    }, null);
    if (oldestTransDate !== null) {
      oldestTransDate = AppTimezone.moment(oldestTransDate).startOf("month").valueOf();
    }
    return oldestTransDate;
  }

  get accountsCreditLimit() {
    const currentAccount = this.selectedAccounts.find(a => a.companyAccountId === this.state.currentSelectedAccountId);
    if (currentAccount) {
      return currentAccount.creditLimit;
    } else {
      return this.selectedAccounts.reduce((memo, account) => {
        return memo + account.creditLimit;
      }, 0);
    }
  }

  get currentSelectedAccount() {
    const { currentSelectedAccountId } = this.state;
    return this.selectedAccounts.find(a => a.companyAccountId === currentSelectedAccountId);
  }

  get accountsBalanceFormatted() {
    const { selectedGroup } = this.state;
    // const hasNotUpdated = this.selectedAccounts.some(a => !a._isUpdated)
    if ((this.selectedAccounts.length === 1 && !this.selectedAccounts[0].isShowItrot && !this.selectedAccounts[0].isUpdate)) {
      return "-";
    }

    const total = this.selectedAccounts.reduce((memo, account) => {
      return memo + account.accountBalance;
    }, 0);

    return `${getCurrencyChar(selectedGroup)} ${numberFormat.format(Math.round(total))}`;
  }

  get accountsCreditLimitFormatted() {
    return `${numberFormat.format(Math.abs(Math.round(this.accountsCreditLimit)))}`;
  }

  setDefaultScrollPosition = () => {
    const { scrollAnim } = this.state;
    Animated.spring(
      scrollAnim,
      {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
  };

  selectDefaultAccounts = () => {
    let creditLimit = {};
    this.props.accounts.forEach((a) => {
      creditLimit[a.companyAccountId] = a.creditLimit;
    });
    this.setState({ creditLimitAcc: creditLimit });

    const { selectedAccountIds, selectedGroup } = this.state;
    const { accountGroups } = this.props;

    if (!accountGroups || !Object.keys(accountGroups).length) {
      return this.setState({
        inProgress: false,
        isReady: true,
        isLayoutComplete: true,
      });
    }

    const findIdsToSelect = (currency) => {
      currency = currency && currency.toLowerCase();
      const hasUpdatedAccount = accountGroups[currency].some(a => a._isUpdated);

      if (hasUpdatedAccount) {
        const selectedIds = accountGroups[currency].filter(a => a._isUpdated).map(a => a.companyAccountId);
        this.handleSelectAccounts(currency, selectedIds);
      } else {
        const accountId = accountGroups[currency][0].companyAccountId;
        this.setState({
          ...getAccountIdForSelection(currency, accountId, selectedAccountIds, selectedGroup),
        }, () => {
          let accountBalanceChartDataState = JSON.parse(JSON.stringify(this.state.selectedAccountIds));
          if (accountBalanceChartDataState.length > 1) {
            accountBalanceChartDataState.unshift(null);
          }
          accountBalanceChartDataState = accountBalanceChartDataState.map((id) => {
            let creditLimits;
            if (id === null) {
              creditLimits = this.props.accounts.filter(a => this.state.selectedAccountIds.includes(a.companyAccountId)).reduce((memo, account) => {
                return memo + account.creditLimit;
              }, 0);
            } else {
              creditLimits = this.props.accounts.filter(a => this.state.selectedAccountIds.includes(a.companyAccountId)).find(a => a.companyAccountId === id).creditLimit;
            }

            return {
              creditLimit: creditLimits,
              companyAccountId: id,
              accountBalanceChartData: null,
            };
          });

          this.setState({
            accountBalanceChartDataState,
            currentSelectedAccountId: this.state.selectedAccountIds.length > 1 ? null : this.state.selectedAccountIds[0],
          });
        });
      }

      return this.getScreenData();
    };

    if (accountGroups.hasOwnProperty(DEFAULT_PRIMARY_CURRENCY)) {
      return findIdsToSelect(DEFAULT_PRIMARY_CURRENCY);
    }
    return findIdsToSelect(Object.keys(accountGroups)[0]);
  };

  getScreenData = (isLoader = true, isSwitchAccount = false) => {
    const { dateTillTimestamp, currentSelectedAccountId, categories } = this.state;

    if (isLoader) {
      this.setState({ inProgress: true });
    }
    if (isSwitchAccount) {
      this.setState({ switchAccountInProgress: true });
    }
    this.setDefaultScrollPosition();

    const currentSelectedAccountIdThis = this.state.accountBalanceChartDataState.find(a => a.companyAccountId === currentSelectedAccountId);
    let tasks;
    if (!isSwitchAccount) {
      // const getScreenDataReq = (this.state.screenMode === SCREEN_MODES.details
      //   ? this.getBankTans()
      //   : this.getAggregateData())
      //
      if (this.state.screenMode === SCREEN_MODES.details) {
        tasks = [this.getBankTans(), this.getAggregateData()];
      } else {
        tasks = [this.getAggregateData()];
      }

      if (!currentSelectedAccountIdThis || (currentSelectedAccountIdThis && !currentSelectedAccountIdThis.accountBalanceChartData)) {
        tasks.push(this.getChartData());
      }
    } else if (!currentSelectedAccountIdThis || (currentSelectedAccountIdThis && currentSelectedAccountIdThis.accountBalanceChartData === null)) {
      tasks = [this.getChartData()];
    }

    if (tasks === undefined) {
      tasks = [];
    }
    const isToday = AppTimezone.moment().diff(dateTillTimestamp, "days") === 0;
    if (isToday) {
      tasks.push(this.getTodayTransData());
    }

    return Promise.all(tasks)
      .then(() => {
        const { bankTrans, accountAggregatedData, accountBalanceChartData, accountAggregatedTodayTrans } = this.props;
        console.log("----accountAggregatedData---", accountAggregatedData);
        let bankTransCopy = JSON.parse(JSON.stringify(bankTrans));
        const accountAggregatedDataCopy = JSON.parse(JSON.stringify(accountAggregatedData));

        if (this.props.route.params.filterText) {
          if (!this.screenSwitchState) {
            const idxEmpty = [];
            bankTransCopy.forEach((section, idx) => {
              section.data = section.data.filter(
                a => a.mainDesc.includes(this.props.route.params.filterText));
              if (!section.data.length) {
                idxEmpty.push(idx);
              }
            });
            if (idxEmpty.length) {
              bankTransCopy = bankTransCopy.filter((item) => item.data.length);
            }
          }
          delete this.props.route.params.filterText;
        }

        let accountBalanceChartDataCopy = Object.assign({}, accountBalanceChartData);
        const accountBalanceChartDataCopyState = JSON.parse(JSON.stringify(this.state.accountBalanceChartDataState));
        if (accountAggregatedDataCopy) {
          let accountAggregatedDataCopyId = accountAggregatedDataCopy.find(a => a.accountUuid === currentSelectedAccountId);
          if (accountAggregatedDataCopyId && accountAggregatedTodayTrans && isToday) {
            accountAggregatedDataCopyId.accountTransactions.unshift({
              title: "היום (לא סופי)",
              data: [accountAggregatedTodayTrans],
            });
          }
        }

        if (isSwitchAccount && currentSelectedAccountId !== null) {
          if (!this.screenSwitchState) {
            let allRowsAgr = [];
            const accMatch = accountAggregatedDataCopy && accountAggregatedDataCopy.find(a => a.accountUuid === currentSelectedAccountId);
            if (accMatch) {
              accMatch.accountTransactions.forEach((sect) => {
                allRowsAgr = allRowsAgr.concat(sect.data);
              });
            }
            const idxEmpty = [];
            bankTransCopy.forEach((section, idx) => {
              if (accMatch && allRowsAgr.length) {
                const itraRow = allRowsAgr.find((row) => AppTimezone.moment(row.transDate).format("DD/MM/YY") === section.title);
                if (itraRow) {
                  section.total = itraRow.itra;
                }
              }
              section.data = section.data.filter(a => a.companyAccountId === currentSelectedAccountId);
              if (!section.data.length) {
                idxEmpty.push(idx);
              }
            });
            if (idxEmpty.length) {
              bankTransCopy = bankTransCopy.filter((item) => item.data.length);
            }
          }
        }

        if (accountBalanceChartDataCopy && accountBalanceChartDataCopy.data === null) {
          accountBalanceChartDataCopy = {};
        }

        let obj = {};
        if (this.state.accountBalanceChartDataState.find(a => a.companyAccountId === currentSelectedAccountId) && this.state.accountBalanceChartDataState.find(a => a.companyAccountId === currentSelectedAccountId).accountBalanceChartData === null) {
          const idxAccountBalanceChartData = accountBalanceChartDataCopyState.findIndex(a => a.companyAccountId === currentSelectedAccountId);
          accountBalanceChartDataCopyState[idxAccountBalanceChartData].accountBalanceChartData = accountBalanceChartDataCopy;
          obj.accountBalanceChartDataState = accountBalanceChartDataCopyState;
        }
        let categoriesMatch = [];
        let payList = [];
        if (!this.screenSwitchState) {
          let allRows = [];
          bankTransCopy.forEach((section, idx) => {
            allRows = allRows.concat(section.data);
          });
          payList = Array.from(new Set(allRows.map(s => s.paymentDesc))).map(id => {
            return {
              id: id,
              press: false,
            };
          });
          categoriesMatch = Array.from(new Set(allRows.map(s => s.transTypeId))).map(id => {
            let objs = categories.find((cat) => cat.transTypeId === id);
            if (!objs) {
              const row = allRows.find((it) => it.transTypeId === id);
              objs = {
                iconType: row.iconType,
                transTypeId: id,
                transTypeName: row.transTypeName,
              };
            }
            return Object.assign(objs, {
              press: false,
            });
          });
          // categoriesMatch = categories.filter((cat) => allRows.some(id => cat.transTypeId === id.transTypeId)).map(obj => {
          //   return Object.assign(obj, {
          //     press: true,
          //   })
          // })
        }

        this.setState(Object.assign(obj, {
          accountAggregatedData: accountAggregatedDataCopy ? accountAggregatedDataCopy.find(a => a.accountUuid === currentSelectedAccountId) : null,
          bankTransCopy: bankTransCopy,
          categoriesMatch,
          payList,
          categoriesMatchCopy: categoriesMatch,
          payListCopy: payList,
          inProgress: !this.screenSwitchState,
          isLayoutComplete: this.screenSwitchState ? true : this.state.isLayoutComplete,
          isHeaderChartSliderPanEnable: true,
          switchAccountInProgress: false,
        }));

        if (!this.screenSwitchState) {
          this.filtersAll();
        }
        this.headerChartX = new Animated.ValueXY();
      })
      .catch((err) => {
        const { bankTrans, accountAggregatedData, accountBalanceChartData, accountAggregatedTodayTrans } = this.props;

        const accountBalanceChartDataCopy = Object.assign({}, accountBalanceChartData);
        const accountBalanceChartDataCopyState = JSON.parse(JSON.stringify(this.state.accountBalanceChartDataState));
        const idxAccountBalanceChartData = accountBalanceChartDataCopyState.findIndex(a => a.companyAccountId === currentSelectedAccountId);
        accountBalanceChartDataCopyState[idxAccountBalanceChartData].accountBalanceChartData = accountBalanceChartDataCopy;

        this.headerChartX = new Animated.ValueXY();
        if (err.path.includes("ballance-chart")) {
          let bankTransCopy = JSON.parse(JSON.stringify(bankTrans));
          const accountAggregatedDataCopy = JSON.parse(JSON.stringify(accountAggregatedData));

          if (accountAggregatedDataCopy) {
            let accountAggregatedDataCopyId = accountAggregatedDataCopy.find(a => a.accountUuid === currentSelectedAccountId);
            if (accountAggregatedDataCopyId && accountAggregatedTodayTrans && isToday) {
              accountAggregatedDataCopyId.accountTransactions.unshift({
                title: "היום (לא סופי)",
                data: [accountAggregatedTodayTrans],
              });
            }
          }

          if (isSwitchAccount && currentSelectedAccountId !== null) {
            if (!this.screenSwitchState) {
              let allRowsAgr = [];
              const accMatch = accountAggregatedDataCopy && accountAggregatedDataCopy.find(a => a.accountUuid === currentSelectedAccountId);
              if (accMatch) {
                accMatch.accountTransactions.forEach((sect) => {
                  allRowsAgr = allRowsAgr.concat(sect.data);
                });
              }
              const idxEmpty = [];
              bankTransCopy.forEach((section, idx) => {
                if (accMatch && allRowsAgr.length) {
                  const itraRow = allRowsAgr.find((row) => AppTimezone.moment(row.transDate).format("DD/MM/YY") === section.title);
                  if (itraRow) {
                    section.total = itraRow.itra;
                  }
                }
                section.data = section.data.filter(a => a.companyAccountId === currentSelectedAccountId);
                if (!section.data.length) {
                  idxEmpty.push(idx);
                }
              });
              if (idxEmpty.length) {
                bankTransCopy = bankTransCopy.filter((item) => item.data.length);
              }
            }
          }
          this.setState({
            accountBalanceChartDataState: accountBalanceChartDataCopyState,
            accountAggregatedData: accountAggregatedDataCopy ? accountAggregatedDataCopy.find(a => a.accountUuid === currentSelectedAccountId) : null,
            bankTrans: bankTransCopy,
            inProgress: false,
            isLayoutComplete: true,
            isHeaderChartSliderPanEnable: true,
            switchAccountInProgress: false,
          });
        } else {
          this.setState({
            accountBalanceChartDataState: accountBalanceChartDataCopyState,
            isLayoutComplete: true,
            accountAggregatedData: this.props.accountAggregatedData,
            bankTrans: this.props.bankTrans,
            inProgress: false,
            isHeaderChartSliderPanEnable: true,
            switchAccountInProgress: false,
            error: getErrText(err),
          });
        }
      });
  };

  getAggregateData = () => {
    const { dispatch, currentCompanyId } = this.props;
    const { dateFromTimestamp, dateTillTimestamp } = this.state;
    const isToday = AppTimezone.moment().diff(dateTillTimestamp, "days") === 0;
    const newDateTill = isToday
      ? AppTimezone.moment(dateTillTimestamp).subtract(1, "day")
      : AppTimezone.moment(dateTillTimestamp);

    return dispatch(getAccountAggregateData({
      companyId: currentCompanyId,
      companyAccountIds: this.accountIdsForRequest,
      dateFrom: AppTimezone.moment(dateFromTimestamp).toISOString(),
      dateTill: newDateTill.toISOString(),
    }));
  };

  getTodayTransData = () => {
    const { dispatch, currentCompanyId } = this.props;

    return dispatch(getAccountTodayTransData({
      companyId: currentCompanyId,
      companyAccountIds: this.accountIdsForRequest,
    }));
  };

  getBankTans = () => {
    const { dateFromTimestamp, dateTillTimestamp } = this.state;
    const { currentCompanyId, dispatch } = this.props;
    const isToday = AppTimezone.moment().diff(dateTillTimestamp, "days") === 0;
    const newDateTill = isToday
      ? AppTimezone.moment(dateTillTimestamp).subtract(1, "day")
      : AppTimezone.moment(dateTillTimestamp);

    return dispatch(getAccountBankTrans({
      companyAccountIds: this.accountIdsForRequest,
      companyId: currentCompanyId,
      dateFrom: AppTimezone.moment(dateFromTimestamp).toISOString(),
      dateTill: newDateTill.toISOString(),
    }));
  };

  getChartData = () => {
    const { dateFromTimestamp, dateTillTimestamp } = this.state;
    const { dispatch } = this.props;
    // //console.log('currentSelectedAccountId-----', this.accountIdsForRequest)

    return dispatch(getAccountBalanceChartData({
      companyAccountIds: this.accountIdsForRequest,
      dateFrom: AppTimezone.moment(dateFromTimestamp).toISOString(),
      dateTill: AppTimezone.moment(dateTillTimestamp).toISOString(),
    }));
  };

  handleSelectAccounts = (selectedGroup, selectedAccountIds = [], fn) => {
    let accountBalanceChartDataState = JSON.parse(JSON.stringify(selectedAccountIds));

    if (accountBalanceChartDataState.length > 1) {
      accountBalanceChartDataState.unshift(null);
    }
    accountBalanceChartDataState = accountBalanceChartDataState.map((id) => {
      let creditLimit;
      if (id === null) {
        creditLimit = this.props.accounts.filter(a => selectedAccountIds.includes(a.companyAccountId)).reduce((memo, account) => {
          return memo + account.creditLimit;
        }, 0);
      } else {
        creditLimit = this.props.accounts.filter(a => selectedAccountIds.includes(a.companyAccountId)).find(a => a.companyAccountId === id).creditLimit;
      }

      return {
        creditLimit: creditLimit,
        companyAccountId: id,
        accountBalanceChartData: null,
      };
    });
    this.setState({
      selectedAccountIds,
      selectedGroup,
      currentSelectedAccountId: selectedAccountIds.length > 1 ? null : selectedAccountIds[0],
      accountBalanceChartDataState,
    }, () => {
      if (typeof fn === "function") {
        return fn();
      }
    });
  };

  handleForceSelectAccount = (id) => {
    let creditLimit;
    if (id === null) {
      creditLimit = this.props.accounts.filter(a => id === a.companyAccountId).reduce((memo, account) => {
        return memo + account.creditLimit;
      }, 0);
    } else {
      creditLimit = this.props.accounts.find(a => a.companyAccountId === id).creditLimit;
    }
    this.setState(
      {
        currentSelectedAccountId: id,
        selectedAccountIds: [id],
        accountBalanceChartDataState: [{
          companyAccountId: id,
          accountBalanceChartData: null,
          creditLimit: creditLimit,
        }],
        alertDetailsIsOpen: false,
      },
      this.handleApplySelectedAccounts,
    );
  };

  handleCloseAccountsModal = () => this.setState({ accountsModalIsOpen: false });

  handleOpenAccountsModal = () => this.setState({
    accountsModalIsOpen: true,
    selectedAccountIdsSave: JSON.parse(JSON.stringify(this.state.selectedAccountIds)),
    selectedGroupSave: JSON.parse(JSON.stringify(this.state.selectedGroup)),
  });

  handleOpenCalendarModal = () => this.setState({ calendarModalIsOpen: true });

  handleCloseCalendarModal = () => this.setState({ calendarModalIsOpen: false });

  handleApplySelectedAccounts = () => {
    this.props.dispatch(selectAccounts(this.state.selectedAccountIds));
    this.handleCloseAccountsModal();
    this.getScreenData();
  };

  handleCloseSelectedAccounts = () => {
    this.setState({
      accountsModalIsOpen: false,
      selectedAccountIds: JSON.parse(JSON.stringify(this.state.selectedAccountIdsSave)),
      selectedGroup: JSON.parse(JSON.stringify(this.state.selectedGroupSave)),
    });
  };

  handleGetOneBankTrans = (date) => {
    const { currentCompanyId } = this.props;

    return accountCflDataApi.post({
      body: {
        companyAccountIds: this.accountIdsForRequest,
        companyId: currentCompanyId,
        dateFrom: date,
        dateTill: date,
      },
    });
  };

  handleSetHeaderHeight = (e) => {
    this.scrollY = new Animated.Value(IS_IOS ? -e.nativeEvent.layout.height : 0);
    this.setState({
      headerMaxHeight: e.nativeEvent.layout.height,
      isLayoutComplete: true,
      scrollAnim: new Animated.Value(IS_IOS ? -e.nativeEvent.layout.height : 0),
    });
  };

  handleSetAlertPosition = (e) => this.setState({ alertYPosition: e.nativeEvent.layout.y });

  handleToggleAlertDetails = () => this.setState({ alertDetailsIsOpen: !this.state.alertDetailsIsOpen });

  handleSetDates = ({ dateFromTimestamp, dateTillTimestamp }) => {
    const { selectedAccountIds } = this.state;
    let accountBalanceChartDataState = JSON.parse(JSON.stringify(selectedAccountIds));

    if (accountBalanceChartDataState.length > 1) {
      accountBalanceChartDataState.unshift(null);
    }
    accountBalanceChartDataState = accountBalanceChartDataState.map((id) => {
      let creditLimit;
      if (id === null) {
        creditLimit = this.props.accounts.filter(a => selectedAccountIds.includes(a.companyAccountId)).reduce((memo, account) => {
          return memo + account.creditLimit;
        }, 0);
      } else {
        creditLimit = this.props.accounts.filter(a => selectedAccountIds.includes(a.companyAccountId)).find(a => a.companyAccountId === id).creditLimit;
      }

      return {
        creditLimit: creditLimit,
        companyAccountId: id,
        accountBalanceChartData: null,
      };
    });
    this.setState({
      dateFromTimestamp,
      dateTillTimestamp,
      isDefDates: false,
      calendarModalIsOpen: false,
      accountBalanceChartDataState,
    }, this.getScreenData);
  };

  handleChangeScreenMode = (state, isOpen, closeState) => {
    const { screenMode } = this.state;

    const newScreenMode = state ? SCREEN_MODES.aggregate : SCREEN_MODES.details;
    if (screenMode === newScreenMode) {
      return;
    }

    let queryStatus = Object.assign({}, this.state.queryStatus);
    queryStatus.query = null;
    this.setState({
      queryStatus,
      isScreenSwitchState: closeState ? false : this.state.isScreenSwitchState,
      changeScreenModeInProgress: true,
      inProgress: true,
      isLayoutComplete: isOpen || false,
      isSearchOpen: isOpen || false,
      screenMode: newScreenMode,
    });
    this.setDefaultScrollPosition();
    setTimeout(() => {
      return this.getScreenData(false)
        .then(() => this.setState({ changeScreenModeInProgress: false }))
        .catch((err) => this.setState({ changeScreenModeInProgress: false, error: getErrText(err) }));
    }, 30);
  };

  handleUpdateTrans = (newTransData) => {
    const { currentCompanyId, dispatch } = this.props;
    dispatch(updateBankTrans(newTransData));
    if (newTransData.biziboxMutavId !== null && newTransData.paymentDesc === "BankTransfer" && newTransData.linkId === "00000000-0000-0000-0000-000000000000") {
      this.setState({
        updateTypePopup: {
          biziboxMutavId: newTransData.biziboxMutavId,
          bankTransId: newTransData.bankTransId,
          ccardTransId: null,
          companyId: currentCompanyId,
          searchkeyId: newTransData.searchkeyId,
          transTypeId: newTransData.transTypeId,
          mainDesc: newTransData.mainDesc,
          transTypeName: newTransData.transTypeName,
          companyAccountId: newTransData.companyAccountId,
          transId: newTransData.bankTransId,
          kvua: newTransData.kvua,
        },
      });
    } else {
      if (newTransData.transTypePopup) {
        this.setState({
          updateTypePopup: {
            bankTransId: newTransData.bankTransId,
            ccardTransId: null,
            companyId: currentCompanyId,
            searchkeyId: newTransData.searchkeyId,
            transTypeId: newTransData.transTypeId,
            mainDesc: newTransData.mainDesc,
            transTypeName: newTransData.transTypeName,
            companyAccountId: newTransData.companyAccountId,
            transId: newTransData.bankTransId,
            kvua: newTransData.kvua,
          },
        });
      } else {
        return accountCflDataUpdateApi.post({
          body: {
            companyId: exampleCompany.isExample
              ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
              : currentCompanyId,
            companyAccountId: newTransData.companyAccountId,
            transId: newTransData.bankTransId,
            transName: newTransData.mainDesc,
            transTypeId: newTransData.transTypeId,
          },
        }).then(() => {
          this.getScreenData();
        });
      }
    }
  };

  handleUpdateTransText = () => {
    const { currentCompanyId, dispatch } = this.props;
    let valuesSave = Object.assign({}, this.state.dataRow);
    valuesSave.mainDesc = this.state.copyMainDesc;
    this.setState({ dataRow: valuesSave, editDescModal: false });
    dispatch(updateBankTrans(valuesSave));
    return accountCflDataUpdateApi.post({
      body: {
        companyId: exampleCompany.isExample
          ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
          : currentCompanyId,
        companyAccountId: valuesSave.companyAccountId,
        transId: valuesSave.bankTransId,
        transName: valuesSave.mainDesc,
        transTypeId: valuesSave.transTypeId,
      },
    }).then(() => {
      this.getScreenData();
    });
  };

  handleTransCategory = (transType) => () => {
    this.setState({
      updateType: transType,
    });
  };

  closeUpdateTypePopup = () => {
    const { updateTypePopup } = this.state;
    return accountCflDataUpdateApi.post({
      body: {
        companyId: exampleCompany.isExample
          ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
          : updateTypePopup.companyId,
        companyAccountId: updateTypePopup.companyAccountId,
        transId: updateTypePopup.bankTransId,
        transName: updateTypePopup.mainDesc,
        transTypeId: updateTypePopup.transTypeId,
      },
    }).then(() => {
      this.setState({
        isCheckEditCategory: false,
        updateTypePopup: false,
      });
    });
  };

  updateTypeOfTrans = () => {
    const { updateTypePopup, updateType, categoryItem } = this.state;
    if (categoryItem) {
      return mutavCategoryUpdateApi.post({
        body: {
          "companyId": exampleCompany.isExample
            ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
            : updateTypePopup.companyId,
          "biziboxMutavId": updateTypePopup.biziboxMutavId,
          "transTypeId": updateTypePopup.transTypeId,
          "updateType": updateType === "only" ? "bankdetail" : ((updateType === "both") ? "future+past" : updateType),
          "transId": updateTypePopup.transId,
        },
      }).then(() => {
        this.setState({
          categoryItem: null,
          bankTransIdOpened: updateTypePopup.bankTransId,
          updateTypePopup: false,
          isCheckEditCategory: false,
        });
        setTimeout(() => {
          this.getScreenData();
        }, 50);
      });
    } else {
      if (updateType === "only") {
        return accountCflDataUpdateApi.post({
          body: {
            companyId: exampleCompany.isExample
              ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
              : updateTypePopup.companyId,
            companyAccountId: updateTypePopup.companyAccountId,
            transId: updateTypePopup.bankTransId,
            transName: updateTypePopup.mainDesc,
            transTypeId: updateTypePopup.transTypeId,
          },
        }).then(() => {
          this.setState({
            updateTypePopup: false,
            isCheckEditCategory: false,
          });
        });
      } else {
        if (updateTypePopup.biziboxMutavId) {
          return accountCflDataUpdateApi.post({
            body: {
              companyId: exampleCompany.isExample
                ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
                : updateTypePopup.companyId,
              companyAccountId: updateTypePopup.companyAccountId,
              transId: updateTypePopup.bankTransId,
              transName: updateTypePopup.mainDesc,
              transTypeId: updateTypePopup.transTypeId,
            },
          }).then(() => {
            mutavCategoryUpdateApi.post({
              body: {
                "companyId": exampleCompany.isExample
                  ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
                  : updateTypePopup.companyId,
                "biziboxMutavId": updateTypePopup.biziboxMutavId,
                "transTypeId": updateTypePopup.transTypeId,
                "updateType": ((updateType === "both") ? "future+past" : updateType),
                "transId": updateTypePopup.transId,
              },
            }).then(() => {
              this.setState({
                bankTransIdOpened: updateTypePopup.bankTransId,
                updateTypePopup: false,
                isCheckEditCategory: false,
              });
              setTimeout(() => {
                this.getScreenData();
              }, 50);
            });
          });
        } else {
          return accountCflDataUpdateApi.post({
            body: {
              companyId: exampleCompany.isExample
                ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
                : updateTypePopup.companyId,
              companyAccountId: updateTypePopup.companyAccountId,
              transId: updateTypePopup.bankTransId,
              transName: updateTypePopup.mainDesc,
              transTypeId: updateTypePopup.transTypeId,
            },
          }).then(() => {
            defineSearchkeyApi.post({
              body: {
                "bankTransId": updateTypePopup.bankTransId,
                "ccardTransId": updateTypePopup.ccardTransId,
                "companyId": updateTypePopup.companyId,
                "kvua": updateTypePopup.kvua,
                "searchkeyId": updateTypePopup.searchkeyId,
                "transTypeId": updateTypePopup.transTypeId,
                "updateType": updateType,
              },
            }).then(() => {
              this.setState({
                updateTypePopup: false,
                isCheckEditCategory: false,
              });
            });
          });
        }
      }
    }
  };

  handleRemoveBankTransCategory = (transTypeId) => {
    const { currentCompanyId } = this.props;
    return removeAccountCflTransTypeApi.post({ body: { transTypeId, companyId: currentCompanyId } });
  };

  // _handleAppStateChange = (nextAppState) => {
  //   if (nextAppState === 'active') {
  //     // //console.log('-----------   active')
  //     // //console.log(AppTimezone.moment().diff(this.state.appStateBgTime, 'minutes'))
  //     if (AppTimezone.moment().diff(this.state.appStateBgTime, 'minutes') >= 15) {
  //       this.setState({ isReady: true })
  //       this.getScreenData()
  //     }
  //   }
  //   if (nextAppState === 'background') {
  //     // //console.log('-----------   background')
  //     this.setState({ appStateBgTime: AppTimezone.moment().valueOf() })
  //     // //console.log(this.state.appStateBgTime)
  //   }
  // }

  handleCreateBankTransCategory = (transTypeName) => {
    const { currentCompanyId } = this.props;
    return createAccountCflTransTypeApi.post({
      body: {
        "transTypeId": null,
        transTypeName,
        companyId: currentCompanyId,
      },
    });
  };

  handleMoveHeaderSlider = (e, gesture) => {
  };

  selectNextAccount = () => {
    const { selectedAccountIds, currentSelectedAccountId } = this.state;
    if (!this.canChangeAccountsBySlider) {
      return;
    }

    if (!currentSelectedAccountId) {
      return this.setState({ currentSelectedAccountId: selectedAccountIds[0] }, () => this.getScreenData(false, true));
    }

    const index = this.nextAccountIndex;
    this.setState({
      currentSelectedAccountId: index === 0 && selectedAccountIds.length > 1 ? null : selectedAccountIds[index - 1],
    }, () => this.getScreenData(false, true));
  };

  selectPreviousAccount = () => {
    const { selectedAccountIds, currentSelectedAccountId } = this.state;
    if (!this.canChangeAccountsBySlider) {
      return;
    }

    if (!currentSelectedAccountId) {
      return this.setState({
        currentSelectedAccountId: last(selectedAccountIds),
      }, () => this.getScreenData(false, true));
    }

    const index = this.previousAccountIndex;
    this.setState({
      currentSelectedAccountId: index === 0 && selectedAccountIds.length > 1 ? null : selectedAccountIds[index - 1],
    }, () => this.getScreenData(false, true));
  };

  handleSetScrollPosition = (y) => {
    this.setState({ currentScrollPosition: y });
    Keyboard.dismiss();
  };

  componentWillUnmount() {
    if(BackHandler && BackHandler.removeEventListener){
      BackHandler.removeEventListener("hardwareBackPress", this.handleBackPress);
    }
    // AppState.removeEventListener('change', this._handleAppStateChange)
  }

  componentDidMount() {

    this._deltaY = new Animated.Value(0);
    const { currentCompanyId } = this.props;
    // AppState.addEventListener('change', this._handleAppStateChange)
    BackHandler.addEventListener("hardwareBackPress", this.handleBackPress);
    if (currentCompanyId) {
      getAccountCflTransTypeApi.post({ body: { uuid: currentCompanyId } })
        .then(data => {
          this.setState({ categories: data });
          const selectedAccountIds = this.props.route.params.selectedAccountIds;
          if (selectedAccountIds) {
            const { accountGroups } = this.props;
            const today = AppTimezone.moment().startOf("day").valueOf();
            let creditLimit = {};
            this.props.accounts.forEach((a) => {
              creditLimit[a.companyAccountId] = a.creditLimit;
            });

            let currency;
            if (accountGroups.hasOwnProperty(DEFAULT_PRIMARY_CURRENCY)) {
              currency = DEFAULT_PRIMARY_CURRENCY;
            } else {
              currency = Object.keys(accountGroups)[0];
            }

            let accountBalanceChartDataState = JSON.parse(JSON.stringify(selectedAccountIds));

            if (accountBalanceChartDataState.length > 1) {
              accountBalanceChartDataState.unshift(null);
            }
            accountBalanceChartDataState = accountBalanceChartDataState.map((id) => {
              let creditLimits;
              if (id === null) {
                creditLimits = this.props.accounts.filter(a => selectedAccountIds.includes(a.companyAccountId)).reduce((memo, account) => {
                  return memo + account.creditLimit;
                }, 0);
              } else {
                creditLimits = this.props.accounts.filter(a => selectedAccountIds.includes(a.companyAccountId)).find(a => a.companyAccountId === id).creditLimit;
              }

              return {
                creditLimit: creditLimits,
                companyAccountId: id,
                accountBalanceChartData: null,
              };
            });

            this.setState({
              isReady: true,
              dateFromTimestamp: AppTimezone.moment(today).subtract(30, "days").valueOf(),
              dateTillTimestamp: today,
              creditLimitAcc: creditLimit,
              selectedAccountIds,
              selectedGroup: currency.toLowerCase(),
              currentSelectedAccountId: selectedAccountIds.length > 1 ? null : selectedAccountIds[0],
              accountBalanceChartDataState,
            }, () => {
              setTimeout(() => {
                if (this.props.route.params.selectedAccountIds) {
                  delete this.props.route.params.selectedAccountIds;
                }
                return this.getScreenData();
              }, 200);
            });
          } else {
            this.setState({ isReady: true });
            this.selectDefaultAccounts();
          }
        })
        .catch((err) => this.setState({ isReady: true, error: getErrText(err) }));
    }
  }

  onIndexChanged = (index) => {
    const {
      selectedAccountIds,
    } = this.state;

    // //console.log(index === 0 ? null : selectedAccountIds[index - 1])

    this.setState({
      selectedIndex: index,
      currentSelectedAccountId: index === 0 && selectedAccountIds.length > 1 ? null : selectedAccountIds[index - 1],
    }, () => this.getScreenData(false, true));
  };

  refresh = () => {
    this.setState({ inProgress: true });
    return this.getScreenData();
  };

  handleEnabledScroll = (state) => this.setState({ enabledScroll: state });

  handlePointerEvents = (state) => this.setState({ pointerEvents: state });

  handleBackPress = () => {
    this.props.dispatch(setOpenedBottomSheet(false));
    goToBack(this.props.navigation);
    return true;
  };

  searchQuery = (query) => {
    let valuesSave = Object.assign({}, this.state.queryStatus);
    valuesSave.query = (query === "") ? null : query;
    this.setState({ queryStatus: valuesSave });
    setTimeout(() => {
      // console.log(this.state.queryStatus)
      this.filtersAll();
    }, 20);
  };

  isSearchOpen = (isSearchOpen) => {
    if (isSearchOpen) {
      // if (this.state.isScreenSwitchState) {
      //   // this.handleChangeScreenMode(true, false, true)
      // } else {
      let queryStatus = Object.assign({}, this.state.queryStatus);
      queryStatus.query = null;
      this.setState({ isSearchOpen: !isSearchOpen, queryStatus });
      setTimeout(() => {
        // //console.log(this.state.queryStatus)
        // this.filtersAll()
        this.handleSetDates({
          dateFromTimestamp: AppTimezone.moment().subtract(30, "days").startOf("day").valueOf(),
          dateTillTimestamp: AppTimezone.moment().startOf("day").valueOf(),
        });
      }, 20);
      // }
    } else {
      this.setState({ isSearchOpen: !isSearchOpen, isScreenSwitchState: this.screenSwitchState });
      if (this.screenSwitchState) {
        setTimeout(() => {
          this.handleChangeScreenMode(false, true);
        }, 20);
      }
    }
  };

  filtersAll = (changeTypes) => {
    this.setState({
      inProgress: true,
    });
    setTimeout(() => {
      const { bankTransCopy, queryStatus, categoriesMatch, payList } = this.state;
      // //console.log('categoriesMatch', categoriesMatch)
      // //console.log('payList', payList)
      // //console.log('bankTransCopy', bankTransCopy)
      let dataGraph = [];
      let bankTrans = JSON.parse(JSON.stringify(bankTransCopy));
      if (bankTrans.length) {
        if (queryStatus) {
          try {
            if ((queryStatus.query !== null && queryStatus.query !== "") || changeTypes) {
              const categoriesMatchPressFilter = categoriesMatch.filter(a => a.press === true);
              const payListPressFilter = payList.filter(a => a.press === true);

              const idxEmpty = [];
              bankTrans.forEach((section, idx) => {
                section.data = section.data.filter((item, index) => {
                  // //console.log('item.transTypeId', item.transTypeId)
                  // //console.log('item.paymentDesc', item.paymentDesc)
                  const categoriesMatchPress = categoriesMatch.find(a => a.transTypeId === item.transTypeId).press;
                  const payListPress = payList.find(a => a.id === item.paymentDesc).press;

                  if (queryStatus.query !== null && queryStatus.query !== "") {
                    return (
                      (categoriesMatchPressFilter.length ? categoriesMatchPress : !categoriesMatchPress) &&
                      (payListPressFilter.length ? payListPress : !payListPress) &&
                      (
                        (item.mainDesc && item.mainDesc.toString().toLowerCase().includes(queryStatus.query.toLowerCase())) ||
                        (item.total && item.total.toString().includes(queryStatus.query)) ||
                        (item.itra && item.itra.toString().toLowerCase().includes(queryStatus.query.toLowerCase())) ||
                        (item.asmachta && item.asmachta.toString().toLowerCase().includes(queryStatus.query.toLowerCase())) ||
                        (item.transDate &&
                          (queryStatus.query.toLowerCase() === AppTimezone.moment(item.transDate).format("DD/MM") ||
                            queryStatus.query.toLowerCase() === AppTimezone.moment(item.transDate).format("MM/YY") ||
                            queryStatus.query.toLowerCase() === AppTimezone.moment(item.transDate).format("DD/MM/YY")
                          )
                        )
                      )
                    );
                  } else {
                    return (
                      (categoriesMatchPressFilter.length ? categoriesMatchPress : !categoriesMatchPress) &&
                      (payListPressFilter.length ? payListPress : !payListPress)
                    );
                  }
                });
                dataGraph = dataGraph.concat(section.data);
                if (!section.data.length) {
                  idxEmpty.push(idx);
                }
              });
              if (idxEmpty.length) {
                bankTrans = bankTrans.filter((item) => item.data.length);
              }
            } else {
              bankTrans.forEach((section, idx) => {
                dataGraph = dataGraph.concat(section.data);
              });
            }
          } catch (e) {

          }
        } else {
          bankTrans.forEach((section, idx) => {
            dataGraph = dataGraph.concat(section.data);
          });
        }
        if (dataGraph.length) {
          dataGraph.sort((a, b) => a.transDate - b.transDate);
          const listDays = getListOfDatesInterval(
            AppTimezone.moment(dataGraph[0].transDate),
            AppTimezone.moment(dataGraph[dataGraph.length - 1].transDate),
            "days",
            "DD/MM/YY",
          );
          const hovaArr = [];
          const zchutArr = [];
          listDays.forEach((it) => {
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            const hova = dataGraph.filter((item) => item.hova === true && it === AppTimezone.moment(item.transDate).format("DD/MM/YY"));
            const zchut = dataGraph.filter((item) => item.hova === false && it === AppTimezone.moment(item.transDate).format("DD/MM/YY"));

            if (hova.length) {
              hovaArr.push(hova.map((ite) => ite.total * -1).reduce(reducer));
            } else {
              hovaArr.push(0);
            }
            if (zchut.length) {
              zchutArr.push(zchut.map((ite) => ite.total).reduce(reducer));
            } else {
              zchutArr.push(0);
            }
          });

          const datesGraphList = Array.from(new Set(listDays.map(s => {
            const day = s.split("/")[1] + "/" + s.split("/")[2];
            return day;
          }))).map(da => {
            return da;
          });

          const pushIdx = [];
          let lenGlob = 0;
          datesGraphList.forEach((dateMonth) => {
            const lenOfDays = listDays.filter((it) => (it.split("/")[1] + "/" + it.split("/")[2]) === dateMonth).length;
            lenGlob += lenOfDays;
            pushIdx.push({
              date: dateMonth,
              idx: (lenGlob - Math.floor(lenOfDays / 2)) - 1,
            });
          });

          const monthYear = listDays.map((s, i) => {
            const getIdx = pushIdx.find((it) => {
              const isSameDate = (s.split("/")[1] + "/" + s.split("/")[2]) === it.date;
              const isSameIdx = (it.idx === i);
              return isSameDate && isSameIdx;
            });
            return getIdx ? getIdx.date : "";
          });

          let numberTickZchut = Math.round(Math.max(...zchutArr) / ((Math.max(...zchutArr) - (Math.min(...hovaArr))) / 5));
          numberTickZchut = numberTickZchut === 0 ? 1 : numberTickZchut;
          let numberTickHova = Math.round(Math.abs(Math.min(...hovaArr)) / ((Math.max(...zchutArr) - (Math.min(...hovaArr))) / 5));
          numberTickHova = numberTickHova === 0 ? 1 : numberTickHova;
          const part = ((Math.max(...zchutArr) - (Math.min(...hovaArr))) / 5);
          const max = Math.max(...zchutArr) === 0 ? part : Math.max(...zchutArr);
          const yAxisSums = Array.from(new Array(numberTickZchut + numberTickHova + 1)).map((it, i) => {
            return max - (part * i);
          });

          this.setState({
            inProgress: false,
            bankTrans: bankTrans,
            datesGraphList: listDays,
            bankTransGraphHova: hovaArr,
            bankTransGraphZchut: zchutArr,
            isLayoutComplete: true,
            numberTickZchut,
            numberTickHova,
            yAxisSums,
            monthYear,
          });
        } else {
          this.setState({
            inProgress: false,
            bankTrans: bankTrans,
            datesGraphList: [],
            bankTransGraphHova: [],
            bankTransGraphZchut: [],
            numberTickZchut: 2.5,
            numberTickHova: 2.5,
            yAxisSums: [],
            monthYear: [],
          });
        }
      } else {
        this.setState({
          isReady: true,
          isLayoutComplete: true,
          inProgress: false,
          bankTrans: bankTrans,
          datesGraphList: [],
          bankTransGraphHova: [],
          bankTransGraphZchut: [],
          numberTickZchut: 2.5,
          numberTickHova: 2.5,
          yAxisSums: [],
          monthYear: [],
        });
      }

      if (this.state.bankTransIdOpened) {
        setTimeout(() => {
          const lastRowOpened = bankTrans.find((item) => item.data.find((row) => row.bankTransId === this.state.bankTransIdOpened));
          if (lastRowOpened) {
            const lastRow = lastRowOpened.data.find((item) => item.bankTransId === this.state.bankTransIdOpened);
            if (lastRow) {
              if (!this.props.route.params.bankTransId) {
                this.openBottomSheet(lastRow, true);
              } else {
                this.setState({
                  dataRow: lastRow,
                  bankTransIdOpened: null,
                  categoryItem: null,
                });
                if (lastRow.linkId || lastRow.pictureLink) {
                  setTimeout(() => {
                    this.getDetails();
                  }, 50);
                }
                this.listRef.snapTo({ index: 0 });
              }
            }
          }
          if (this.props.route.params.bankTransId) {
            delete this.props.route.params.bankTransId;
          }
        }, this.props.route.params.bankTransId ? 600 : 0);
      }
    }, 100);
  };

  handleDeletePays = (i) => () => {
    const {
      payListCopy,
    } = this.state;
    let payList = JSON.parse(JSON.stringify(payListCopy));
    const index = payList.findIndex((it) => it.id === i.id);
    payList[index].press = false;
    this.setState({
      payListCopy: payList,
      payList: payList,
    });
    this.filtersAll(true);
  };
  handleDeleteCategory = (i) => () => {
    const {
      categoriesMatchCopy,
    } = this.state;
    let categoriesMatch = JSON.parse(JSON.stringify(categoriesMatchCopy));
    const index = categoriesMatch.findIndex((it) => it.transTypeId === i.transTypeId);
    categoriesMatch[index].press = false;
    this.setState({
      categoriesMatchCopy: categoriesMatch,
      categoriesMatch: categoriesMatch,
    });
    this.filtersAll(true);
  };

  handleToggleCategory = (i) => () => {
    const {
      categoriesMatchCopy,
    } = this.state;
    let categoriesMatch = JSON.parse(JSON.stringify(categoriesMatchCopy));
    const index = categoriesMatch.findIndex((it) => it.transTypeId === i.transTypeId);
    categoriesMatch[index].press = !categoriesMatch[index].press;
    this.setState({
      categoriesMatchCopy: categoriesMatch,
    });
  };
  handleCancelSaveCategories = () => {
    const {
      categoriesMatch,
    } = this.state;

    Animated.spring(
      this.state.bounceValue,
      {
        toValue: 400,
        velocity: 3,
        tension: 2,
        friction: 8,
        useNativeDriver: true,
      },
    ).start();
    setTimeout(() => {
      this.setState({
        categoriesMatchCopy: categoriesMatch,
        categoriesMatchModal: false,
      });
    }, 50);
  };
  handleSaveCategories = () => {
    const {
      categoriesMatchCopy,
    } = this.state;
    Animated.spring(
      this.state.bounceValue,
      {
        toValue: 400,
        velocity: 3,
        tension: 2,
        friction: 8,
        useNativeDriver: true,
      },
    ).start();
    setTimeout(() => {
      this.setState({
        categoriesMatch: categoriesMatchCopy,
        categoriesMatchModal: false,
      });
    }, 50);
    this.filtersAll(true);
  };
  handleRemoveAllCategories = () => {
    const {
      categoriesMatchCopy,
    } = this.state;
    let categoriesMatch = JSON.parse(JSON.stringify(categoriesMatchCopy));
    categoriesMatch.forEach(it => {
      it.press = false;
    });
    this.setState({
      categoriesMatchCopy: categoriesMatch,
    });
  };

  handleTogglePays = (i) => () => {
    const {
      payListCopy,
    } = this.state;
    let payList = JSON.parse(JSON.stringify(payListCopy));
    const index = payList.findIndex((it) => it.id === i.id);
    payList[index].press = !payList[index].press;
    this.setState({
      payListCopy: payList,
    });
  };
  handleCancelSavePays = () => {
    const {
      payList,
    } = this.state;
    Animated.spring(
      this.state.bounceValue,
      {
        toValue: 400,
        velocity: 3,
        tension: 2,
        friction: 8,
        useNativeDriver: true,
      },
    ).start();
    setTimeout(() => {
      this.setState({
        payListCopy: payList,
        payListModal: false,
      });
    }, 50);
  };
  handleSavePays = () => {
    const {
      payListCopy,
    } = this.state;
    Animated.spring(
      this.state.bounceValue,
      {
        toValue: 400,
        velocity: 3,
        tension: 2,
        friction: 8,
        useNativeDriver: true,
      },
    ).start();
    setTimeout(() => {
      this.setState({
        payList: payListCopy,
        payListModal: false,
      });
    }, 50);

    this.filtersAll(true);
  };
  handleRemoveAllPays = () => {
    const {
      payListCopy,
    } = this.state;
    let payList = JSON.parse(JSON.stringify(payListCopy));
    payList.forEach(it => {
      it.press = false;
    });
    this.setState({
      payListCopy: payList,
    });
  };

  handleModalTypes = (type) => () => {
    if (type === "categoriesMatchModal") {
      this.setState({
        categoriesMatchModal: true,
      });
    } else if (type === "payListModal") {
      this.setState({
        payListModal: true,
      });
    }

    Animated.spring(
      this.state.bounceValue,
      {
        toValue: 0,
        velocity: 3,
        tension: 2,
        friction: 8,
        useNativeDriver: true,
      },
    ).start();
  };

  divideList(list) {
    const arr = [];
    list.forEach((item, i) => {
      if (i % 4 === 0) {
        arr.push([item]);
      } else {
        arr[arr.length - 1].push(item);
      }
    });
    if (arr[arr.length - 1].length < 4) {
      for (let x = 0; x < 5 - arr[arr.length - 1].length; x++) {
        arr[arr.length - 1].push({
          press: null,
        });
      }
    }
    return arr;
  }

  openGraph = () => {
    this.setState({
      showGraph: true,
    });
  };
  closeGraph = () => {
    this.setState({
      showGraph: false,
    });
  };

  toFixedNum(num) {
    const numSplit = num.toString().split(".");
    if (numSplit.length > 1) {
      const first = numSplit[0];
      const point = numSplit[1].substring(0, 1);
      if (point === "0" || (first.replace(/-/g, "").length >= 2)) {
        return Number(first);
      } else {
        return Number(first + "." + point);
      }
    } else {
      return Number(num);
    }
  }

  checkIfK(num) {
    num = Number(num.toString().split(".")[0]);
    if (num.toString().replace(/-/g, "").length >= 7) {
      return this.toFixedNum(num / 1000000) + "m";
    } else if (num.toString().replace(/-/g, "").length >= 4) {
      return this.toFixedNum(num / 1000) + "k";
    } else {
      return this.toFixedNum(num);
    }
  }

  openAlert = () => {
    this.setState({ showAlert: true });

    Animated.timing(
      this.state.fadeAnim,
      {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      },
    ).start();
  };
  animatedTime = () => {
    const {
      fadeAnim,
    } = this.state;
    Animated.timing(
      fadeAnim,
      {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      },
    ).start(() => {
      this.setState({ showAlert: false });
    });
  };

  handleSetRef = (ref) => {
    this.listRef = ref;
  };
  openBottomSheet = (dataRow, notChange) => {
    this.setState({
      dataRow,
      bankTransIdOpened: null,
      categoryItem: null,
    });
    if (dataRow.linkId || dataRow.pictureLink) {
      setTimeout(() => {
        this.getDetails();
      }, 50);
    }
    if (!notChange) {
      this.listRef.snapTo({ index: 1 });
    }
  };
  close = () => {
    this.setState({
      dataRow: null,
    });
    if (this.listRef && this.listRef.snapTo) {
      this.listRef.snapTo({ index: 2 });
    }
  };
  onDrawerSnap = (states) => {
    const index = states.nativeEvent.index;
    // console.log('index---', index)
    if (index === 0) {
      this.props.dispatch(setOpenedBottomSheet(true));
      // console.log('Top')
      this.setState({
        currentOpenItemIndex: "Top",
      });
    } else if (index === 1) {
      // console.log('Middle')
      this.props.dispatch(setOpenedBottomSheet(true));
      this.setState({
        currentOpenItemIndex: "Middle",
      });
    } else if (index === 2) {
      // console.log('Close')
      this.props.dispatch(setOpenedBottomSheet(false));
      this.setState({
        dataRow: null,
        cashDetails: [],
        cashDetailsSrc: [],
        sumTotals: 0,
        cashSplitPopupOpen: false,
        categoriesInsideSplitModalIsOpen: false,
        currentOpenItemIndex: null,
      });
    }
  };

  handleOpenCategoriesModal = () => {
    this.setState({ categoriesModalIsOpen: true });
  };

  handleOpenCategoriesInsideModal = (category, idxCategory, bankTrans, isCheck) => () => {
    this.setState({
      isCheckEditCategory: !!isCheck,
      categoriesModalIsOpen: true,
      categoryItem: Object.assign(bankTrans, category),
      idxCategory: idxCategory,
    });
  };

  handleSelectCategory = (category) => {
    const { dataRow, categoryItem } = this.state;
    if (categoryItem) {
      if (!categoryItem || categoryItem.transTypeId === category.transTypeId) {
        return;
      }

      const newBankTrans = {
        ...categoryItem,
        iconType: category.iconType,
        transTypeId: category.transTypeId,
        transTypeName: category.transTypeName,
      };
      return this.handleUpdateBankTrans(newBankTrans);
    } else {
      if (!dataRow || dataRow.transTypeId === category.transTypeId) {
        return;
      }

      const newBankTrans = {
        ...dataRow,
        iconType: category.iconType,
        transTypeId: category.transTypeId,
        transTypeName: category.transTypeName,
      };

      return this.handleUpdateBankTrans(newBankTrans);
    }
  };

  handleUpdateBankTrans = (newBankTrans) => {
    if (this.state.categoryItem) {
      const { currentCompanyId } = this.props;
      const details = JSON.parse(JSON.stringify(this.state.details));
      details[this.state.idxCategory] = newBankTrans;
      if (this.state.isCheckEditCategory) {
        this.setState({
          details,
          categoriesModalIsOpen: false,
          isCheckEditCategory: false,
          categoryItem: null,
        }, () => {
          return updateCheckCategoryApi.post({
            body: {
              transId: newBankTrans.transId,
              transTypeId: newBankTrans.transTypeId,
            },
          }).then(() => {

          });
        });
      } else {
        this.setState({
          details,
          categoriesModalIsOpen: false,
          updateTypePopup: {
            biziboxMutavId: newBankTrans.biziboxMutavId,
            bankTransId: newBankTrans.bankTransId,
            ccardTransId: null,
            companyId: currentCompanyId,
            searchkeyId: newBankTrans.searchkeyId,
            transTypeId: newBankTrans.transTypeId,
            mainDesc: newBankTrans.mainDesc,
            transTypeName: newBankTrans.transTypeName,
            companyAccountId: newBankTrans.companyAccountId,
            transId: newBankTrans.transId,
            kvua: newBankTrans.kvua,
          },
        });
      }
    } else {
      this.setState({ dataRow: { ...newBankTrans }, categoriesModalIsOpen: false });
      this.handleUpdateTrans({ ...newBankTrans });
    }
  };

  handleCloseCategoriesModal = () => {
    this.setState({ categoriesModalIsOpen: false, categoryItem: null, idxCategory: 0 });
  };

  getDetails = () => {
    const { accounts } = this.props;
    const { dataRow } = this.state;
    const account = dataRow ? accounts.find(a => a.companyAccountId === dataRow.companyAccountId) : null;
    this.setState({ inProgressDetails: true });

    if (dataRow.linkId) {
      return accountCflDataDetailApi.post({
        body: {
          bankTransId: dataRow.bankTransId,
          companyAccountId: dataRow.companyAccountId,
          linkId: dataRow.linkId,
        },
      })
        .then(details => {
          this.setState({ details, inProgressDetails: false });
        })
        .catch(() => this.setState({ inProgressDetails: false }));
    }

    if (dataRow.pictureLink) {
      return accountCflCheckDetailsApi.post({
        body: {
          companyAccountId: dataRow.companyAccountId,
          folderName: `${account.bankId}${account.bankSnifId}${account.bankAccountId}`,
          pictureLink: dataRow.pictureLink,
          bankTransId: dataRow.bankTransId,
        },
      })
        .then(details => this.setState({ details, inProgressDetails: false }))
        .catch(() => this.setState({ inProgressDetails: false }));
    }
  };

  handleToggleEditDesc = () => {
    const { dataRow } = this.state;
    this.setState({
      editDescModal: !this.state.editDescModal,
      copyMainDesc: dataRow.mainDesc.replace(/\n/g, ""),
    });
  };

  handleUpdateFieldValid = name => val => {
    let value = val.nativeEvent.text || "";
    this.setState({ [name]: !!(value && (value.length !== 0)) });
  };

  handleUpdateFields = name => val => {
    let value = val || "";
    value = value.toString().replace(getEmoji(), "").replace(/\n/g, "");

    this.setState({ [name]: value });
    this.handleUpdateFieldValid(`${name}Valid`)({
      nativeEvent: {
        text: value,
      },
    });
  };

  onScroll = (e) => {
    const offset = e.nativeEvent.contentOffset.y;
    if (offset < 0) {
      setTimeout(() => {
        this.listRef.snapTo({ index: 1 });
      }, 80);
    }
  };

  cashDetails = () => {
    this.setState({ cashSplitPopupOpen: true });
    this.listRef.snapTo({ index: 0 });
    const {
      dataRow,
      categories,
    } = this.state;
    cashDetailsApi.post({
      body: {
        uuid: dataRow.bankTransId,
      },
    })
      .then(cashDetails => {
        if (cashDetails.length) {
          cashDetails.forEach((item, idx) => {
            let transType = categories.find(ctt => ctt.transTypeId === item.transTypeId);
            if (transType === undefined) {
              transType = categories.find(ctt => ctt.transTypeId === "8a583d2a-c88d-584c-a2a2-33ae9a36d888");
            }
            cashDetails[idx].isDeleted = !!((item.isDeleted && item.isDeleted === true));
            cashDetails[idx] = Object.assign(cashDetails[idx], transType);
          });
        } else {
          const transType = categories.find(ctt => ctt.transTypeId === "8a583d2a-c88d-584c-a2a2-33ae9a36d888");
          cashDetails = [Object.assign({
            cashCatId: null,
            total: dataRow.total,
            hova: dataRow.hova,
            isDeleted: false,
            cashCatDesc: dataRow.mainDesc,
          }, transType)];
        }
        console.log(cashDetails);
        this.setState({ cashDetails: cashDetails, cashDetailsSrc: cashDetails }, () => {
          this.calcSumTotals();
        });
      })
      .catch(() => {

      });
  };

  calcSumTotals = () => {
    const {
      cashDetails,
    } = this.state;
    const sumTotals = cashDetails.reduce((total, item) => total + Number(item.total), 0);
    this.setState({
      sumTotals,
    });
  };

  cancelEditSplit = () => {
    this.setState({
      cashDetails: [],
      cashDetailsSrc: [],
      sumTotals: 0,
      cashSplitPopupOpen: false,
      categoriesInsideSplitModalIsOpen: false,
      currentOpenItemIndex: null,
    });
  };

  addSplit = () => {
    const {
      dataRow,
      categories,
      cashDetails,
    } = this.state;
    const cashDetailsSave = JSON.parse(JSON.stringify(cashDetails));
    const transType = categories.find(ctt => ctt.transTypeId === "8a583d2a-c88d-584c-a2a2-33ae9a36d888");
    const obj = Object.assign({
      hova: dataRow.hova,
      cashCatDesc: dataRow.mainDesc,
      total: "",
      cashCatId: null,
      isDeleted: false,
    }, transType);
    cashDetailsSave.push(obj);
    this.setState({ cashDetails: cashDetailsSave }, () => {
      this.calcSumTotals();
    });
  };

  removeItem = (index) => () => {
    const {
      cashDetails,
    } = this.state;
    const cashDetailsSave = JSON.parse(JSON.stringify(cashDetails));
    cashDetailsSave.splice(index, 1);
    this.setState({ cashDetails: cashDetailsSave }, () => {
      this.calcSumTotals();
    });
  };

  submitData = () => {
    const {
      dataRow,
      cashDetailsSrc,
      cashDetails,
      sumTotals,
    } = this.state;
    const { currentCompanyId } = this.props;

    if (cashDetails.filter(it => it.total === 0 || it.total === "0" || it.total === "" || it.total === null).length || (cashDetails.length > 1 && sumTotals !== dataRow.total && ((sumTotals > dataRow.total && ((sumTotals - dataRow.total) >= 0.01)) || (sumTotals < dataRow.total && ((dataRow.total - sumTotals) >= 0.01))))
    ) {
      return;
    }

    const cashData = JSON.parse(JSON.stringify(cashDetails));
    cashData.forEach((it) => {
      it.isDeleted = false;
    });
    if (cashDetailsSrc.length) {
      cashDetailsSrc.forEach((it) => {
        if (!cashDetails.some((item) => item.cashCatId === it.cashCatId)) {
          it.isDeleted = true;
          cashData.push(it);
        }
      });
    }
    if (cashData.length === 1) {
      accountCflDataUpdateApi.post({
        body: {
          companyId: exampleCompany.isExample
            ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
            : currentCompanyId,
          transId: dataRow.bankTransId,
          transName: cashDetails[0].cashCatDesc,
          transTypeId: cashDetails[0].transTypeId,
          companyAccountId: dataRow.companyAccountId,
        },
      })
        .then(() => {
          this.setState({ cashSplitPopupOpen: false });
          this.getScreenData();
        })
        .catch(() => {
          this.setState({ cashSplitPopupOpen: false });
        });
    } else {
      if (cashDetails.length === 1) {
        cashData[0].isDeleted = true;
      }
      cashSplitApi.post({
        body: {
          companyId: exampleCompany.isExample
            ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
            : currentCompanyId,
          bankTransId: dataRow.bankTransId,
          hova: dataRow.hova,
          cashData: cashData,
        },
      })
        .then(() => {
          if (cashDetails.length === 1) {
            accountCflDataUpdateApi.post({
              body: {
                companyId: exampleCompany.isExample
                  ? "856f4212-3f5f-4cfc-b2fb-b283a1da2f7c"
                  : currentCompanyId,
                transId: dataRow.bankTransId,
                transName: cashDetails[0].cashCatDesc,
                transTypeId: cashDetails[0].transTypeId,
                companyAccountId: dataRow.companyAccountId,
              },
            })
              .then(() => {
                this.setState({ cashSplitPopupOpen: false });
                this.getScreenData();
              })
              .catch(() => {
                this.setState({ cashSplitPopupOpen: false });
              });
          } else {
            this.setState({ cashSplitPopupOpen: false });
            this.getScreenData();
          }
        })
        .catch(() => {
          this.setState({ cashSplitPopupOpen: false });
        });
    }
  };
  handleOpenCategoriesInsideSplitModal = (idx) => () => {
    this.setState({ categoriesInsideSplitModalIsOpen: idx });
  };

  handleCloseCategoriesInsideSplitModal = () => {
    this.setState({ categoriesInsideSplitModalIsOpen: false });
  };

  handleUpdateBankTransInsideSplitModal = (newBankTrans) => {
    const {
      categoriesInsideSplitModalIsOpen,
      cashDetails,
      categories,
    } = this.state;
    const cashData = JSON.parse(JSON.stringify(cashDetails));
    const transType = categories.find(ctt => ctt.transTypeId === newBankTrans);
    cashData[categoriesInsideSplitModalIsOpen] = Object.assign(cashData[categoriesInsideSplitModalIsOpen], transType);
    this.setState({ cashDetails: cashData, categoriesInsideSplitModalIsOpen: false });
  };
  handleSelectCategoryInsideSplitModal = (category) => {
    return this.handleUpdateBankTransInsideSplitModal(category.transTypeId);
  };

  handleUpdateTransTextInsideSplit = () => {
    const {
      descIdxInsideSplitModalIsOpen,
      cashDetails,
      copyMainDescInsideSplit,
    } = this.state;
    const cashData = JSON.parse(JSON.stringify(cashDetails));
    cashData[descIdxInsideSplitModalIsOpen].cashCatDesc = copyMainDescInsideSplit;
    this.setState({
      cashDetails: cashData,
      descIdxInsideSplitModalIsOpen: false,
      editDescModalInsideSplit: false,
      copyMainDescInsideSplit: "",
      copyMainDescValidInsideSplit: true,
    });
  };

  handleToggleEditDescInsideSplit = (idx) => () => {
    const {
      editDescModalInsideSplit,
      cashDetails,
    } = this.state;
    if (idx === undefined) {
      this.setState({
        descIdxInsideSplitModalIsOpen: false,
        editDescModalInsideSplit: false,
        copyMainDescInsideSplit: "",
        copyMainDescValidInsideSplit: true,
      });
    } else {
      this.setState({
        descIdxInsideSplitModalIsOpen: idx,
        editDescModalInsideSplit: !editDescModalInsideSplit,
        copyMainDescInsideSplit: cashDetails[idx].cashCatDesc.replace(/\n/g, ""),
      });
    }
  };

  handleUpdateFieldValidInsideSplit = name => val => {
    let value = val.nativeEvent.text || "";
    this.setState({ [name]: !!(value && (value.length !== 0)) });
  };

  handleUpdateFieldsInsideSplit = name => val => {
    let value = val || "";
    value = value.toString().replace(getEmoji(), "").replace(/\n/g, "");

    this.setState({ [name]: value });
    this.handleUpdateFieldValidInsideSplit(`${name}Valid`)({
      nativeEvent: {
        text: value,
      },
    });
  };
  changeTotalCategory = (idx) => () => {
    this.setState({
      descIdxInsideSplitModalIsOpen: idx,
      totalCategoryModalIsOpen: true,
    });
  };

  handleUpdateTotalCategory = (total) => {
    const {
      setTotalCategoryInProgress,
      descIdxInsideSplitModalIsOpen,
      cashDetails,
    } = this.state;
    if (setTotalCategoryInProgress) {
      return;
    }

    const cashData = JSON.parse(JSON.stringify(cashDetails));
    cashData[descIdxInsideSplitModalIsOpen].total = Number(total.replace(/[^\d.]/g, ""));

    this.setState({
      cashDetails: cashData,
      descIdxInsideSplitModalIsOpen: false,
      setTotalCategoryInProgress: false,
      totalCategoryModalIsOpen: false,
    }, () => {
      this.calcSumTotals();
    });
  };

  handleCloseTotalCategoryModal = () => {
    this.setState({
      totalCategoryModalIsOpen: false,
      setTotalCategoryInProgress: false,
      descIdxInsideSplitModalIsOpen: false,
    });
  };

  render() {
    const {
      navigation,
      t,
      isRtl,
      accountGroups,
      accountAggregatedTodayTrans,
      accountTodayTrans,
      accounts,
      currentCompanyId,
    } = this.props;
    const {
      bankTrans,
      accountAggregatedData,
      changeScreenModeInProgress,
      selectedAccountIds,
      selectedGroup,
      accountsModalIsOpen,
      dateTillTimestamp,
      dateFromTimestamp,
      headerMaxHeight,
      alertYPosition,
      alertDetailsIsOpen,
      calendarModalIsOpen,
      currentSelectedAccountId,
      isLayoutComplete,
      currentScrollPosition,
      accountBalanceChartDataState,
      selectedIndex,
      creditLimitAcc,
      isHeaderChartSliderPanEnable,
      pointerEvents,
      scrollAnim,
      queryStatus,
      categoriesMatchCopy,
      payListCopy,
      categoriesMatchModal,
      payListModal,
      isSearchOpen,
      payList,
      categoriesMatch,
      showGraph,
      bankTransGraphHova,
      bankTransGraphZchut,
      datesGraphList,
      numberTickZchut,
      numberTickHova,
      yAxisSums,
      monthYear,
      updateTypePopup,
      isCheckEditCategory,
      updateType,
      showAlert,
      fadeAnim,
      isDefDates,
      bounceValue,
      currentOpenItemIndex,
      dataRow,
      categoriesModalIsOpen,
      details,
      inProgressDetails,
      categories,
      editDescModal,
      copyMainDesc,
      copyMainDescValid,
      categoryItem,
      idxCategory,
      inProgressSnap,
      cashSplitPopupOpen,
      sumTotals,
      cashDetails,
      categoriesInsideSplitModalIsOpen,
      editDescModalInsideSplit,
      copyMainDescInsideSplit,
      copyMainDescValidInsideSplit,
      totalCategoryModalIsOpen,
      setTotalCategoryInProgress,
      descIdxInsideSplitModalIsOpen,
    } = this.state;
    // console.log(this._deltaY)
    // console.log('copyMainDescValid---', copyMainDescValid)
    const alertState = this.headerAlertState;
    let payListArr = [];
    let categoriesMatchArr = [];
    let lenCategoriesMatchCopy = 0;
    let lenPayListCopy = 0;
    if (!this.screenSwitchState) {
      payListArr = payList.filter((it) => it.press === true);
      categoriesMatchArr = categoriesMatch.filter((it) => it.press === true);
      lenPayListCopy = payListCopy.filter((it) => it.press === true).length;
      lenCategoriesMatchCopy = categoriesMatchCopy.filter((it) => it.press === true).length;
    }

    if (!isLayoutComplete) {
      return <Loader />;
    }

    const axesSvg = { fontSize: sp(10), fill: colors.blue32 };
    const verticalContentInset = { top: 0, bottom: 0 };
    const xAxisHeight = 35;
    const ratio = (win.height - this.headerHeight) / win.width;

    const total = dataRow ? getFormattedValueArray(dataRow.total) : null;
    const numberStyle = dataRow ? cs(dataRow.hova, [{
      fontFamily: fonts.semiBold,
    }, { color: colors.green4 }], { color: colors.red2 }) : {};
    const account = dataRow ? accounts.find(a => a.companyAccountId === dataRow.companyAccountId) : null;

    const disabledEdit =
      ((dataRow && dataRow.paymentDesc === "Checks" && dataRow.pictureLink && dataRow.pictureLink !== "00000000-0000-0000-0000-000000000000" && dataRow.pictureLink !== null) || (dataRow && dataRow.cashCat === true))
        ? true
        : (dataRow ? ((dataRow.isToday) || (dataRow.paymentDesc === "BankTransfer" && dataRow.linkId !== "00000000-0000-0000-0000-000000000000" && dataRow.linkId !== null)) : null);
    // console.log('disabledEdit---', disabledEdit, details)

    StatusBar.setBarStyle((IS_IOS || currentOpenItemIndex !== null) ? "dark-content" : "light-content", true);

    return (
      <Fragment>
        <HeaderHeightContext.Consumer>
          {headerHeight => {
            this.headerHeight = headerHeight;
          }}
        </HeaderHeightContext.Consumer>
        <View keyboardShouldPersistTaps="handled"
              style={[styles.fill, {
                backgroundColor: (changeScreenModeInProgress || (isSearchOpen && !this.screenSwitchState)) ? "#ffffff" : colors.blue32,
              }]}>
          <AlertsTrial navigation={navigation} refresh={this.refresh}
                       updateToken={this.props.globalParams.updateToken} />

          {(this.isLoader) && (<Loader overlay containerStyle={{ backgroundColor: colors.white }} />)}

          <View />
          <Fragment>
            <DataList
              navigation={this.props.navigation}
              currentOpenItemIndex={currentOpenItemIndex}
              openBottomSheet={this.openBottomSheet}
              showAlert={this.openAlert}
              loaderProgress={this.isLoader}
              bankTransNotExist={this.hasDataFilter}
              openGraph={this.openGraph}
              isSearchOpen={isSearchOpen}
              queryStatus={queryStatus}
              refresh={this.refresh}
              headerScrollDistance={this.handleSetHeaderHeight}
              scrollAnim={scrollAnim}
              accountsBalanceFormatted={this.accountsBalanceFormatted}
              accountsCreditLimitFormatted={this.accountsCreditLimitFormatted}
              selectedDeviantAccounts={this.selectedDeviantAccounts}
              selectedNotUpdatedAccounts={this.selectedNotUpdatedAccounts}
              onSelectAccount={this.handleForceSelectAccount}
              onToggleAlertDetails={this.handleToggleAlertDetails}
              handlePointerEvents={this.handlePointerEvents}
              pointerEvents={pointerEvents}
              handleEnabledScroll={this.handleEnabledScroll}
              accountsCreditLimit={this.accountsCreditLimit}
              creditLimitAcc={creditLimitAcc}
              isRtl={isRtl}
              companyId={currentCompanyId}
              hasData={this.hasData}
              scrollY={this.scrollY}
              alertYPosition={alertYPosition}
              headerChartX={this.headerChartX}
              screenSwitchState={this.screenSwitchState}
              scrollEnabled={!alertDetailsIsOpen}
              accounts={accounts}
              inProgress={changeScreenModeInProgress}
              dateTillTimestamp={dateTillTimestamp}
              selectedAccounts={this.selectedAccounts}
              headerMaxHeight={headerMaxHeight}
              headerMinHeight={this.headerMinHeight}
              accountTodayTrans={accountTodayTrans}
              bankTrans={bankTrans}
              accountAggregatedData={accountAggregatedData}
              accountAggregatedTodayTrans={accountAggregatedTodayTrans}
              currentSelectedAccountId={currentSelectedAccountId}
              onOpenAccountsModal={this.handleOpenAccountsModal}
              onGetOneBankTrans={this.handleGetOneBankTrans}
              onUpdateBankTrans={this.handleUpdateTrans}
              onUpdateBankTransText={this.handleUpdateTransText}
              onRemoveBankTransCategory={this.handleRemoveBankTransCategory}
              onCreateBankTransCategory={this.handleCreateBankTransCategory}
              onSetScrollPosition={this.handleSetScrollPosition}
              isHeaderChartSliderPanEnable={isHeaderChartSliderPanEnable}
              onMoveHeaderSlider={this.handleMoveHeaderSlider}
              accountBalanceChartDataState={accountBalanceChartDataState}
              onIndexChanged={this.onIndexChanged}
              dateFromTimestamp={dateFromTimestamp}
              selectedIndex={selectedIndex}
              selectedGroup={selectedGroup}
              hasAlert={this.hasHeaderAlert}
              onSetAlertPosition={this.handleSetAlertPosition}
              alertState={alertState}
              selectedAccountIds={selectedAccountIds}
              currentAccountIndex={this.currentAccountIndex}
              onChangeScreenMode={this.handleChangeScreenMode}
            />

            <BankAccountsHeader
              isDefDates={isDefDates}
              isSearchOpenState={isSearchOpen}
              handleDeletePays={this.handleDeletePays}
              handleDeleteCategory={this.handleDeleteCategory}
              payListCopy={payListArr}
              categoriesMatchCopy={categoriesMatchArr}
              handleModalTypes={this.handleModalTypes}
              isSearchOpen={this.isSearchOpen}
              searchQuery={this.searchQuery}
              queryStatus={queryStatus}
              scrollAnim={scrollAnim}
              isRtl={isRtl}
              dateFromTimestamp={dateFromTimestamp}
              dateTillTimestamp={dateTillTimestamp}
              screenSwitchState={this.screenSwitchState}
              selectedAccounts={this.selectedAccounts}
              selectedDeviantAccounts={this.selectedDeviantAccounts}
              selectedNotUpdatedAccounts={this.selectedNotUpdatedAccounts}
              hasData={this.hasData}
              hasAlert={this.hasHeaderAlert}
              accountGroups={accountGroups}
              selectedGroup={selectedGroup}
              headerScrollDistance={this.headerScrollDistance}
              onOpenAccountsModal={this.handleOpenAccountsModal}
              onToggleCalendar={this.handleOpenCalendarModal}
              onSetHeaderHeight={this.handleSetHeaderHeight}
            />

            {alertDetailsIsOpen && (
              <AccountAlertDetails
                isRtl={isRtl}
                top={alertYPosition + currentScrollPosition + 75}
                accounts={this.selectedDeviantAccounts}
                alertState={alertState}
                onSelectAccount={this.handleForceSelectAccount}
                onClose={this.handleToggleAlertDetails}
              />
            )}

            {accountsModalIsOpen && (accounts && accounts.length > 1) && (
              <AccountsModal
                isOpen
                isRtl={isRtl}
                accountGroups={accountGroups}
                onClose={this.handleCloseSelectedAccounts}
                onSubmit={this.handleApplySelectedAccounts}
                onSelectAccounts={this.handleSelectAccounts}
                selectedAccountIds={selectedAccountIds}
                selectedGroup={selectedGroup}
              />
            )}

            {calendarModalIsOpen && (
              <BankAccountsCalendarModal
                minDate={this.minOldestTransDateInSelectedAccounts}
                isOpen
                t={t}
                isRtl={isRtl}
                onClose={this.handleCloseCalendarModal}
                dateFromTimestamp={dateFromTimestamp}
                dateTillTimestamp={dateTillTimestamp}
                onSetDates={this.handleSetDates}
              />
            )}

            {(categoriesMatchModal) && (
              <View style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 999999,
                height: "100%",
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-end",
                alignContent: "center",
              }}>

                <TouchableOpacity style={{
                  backgroundColor: "black",
                  opacity: 0.7,
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 999999,
                  height: "100%",
                  width: "100%",
                }} onPress={this.handleCancelSaveCategories} />

                <Animated.View style={{
                  width: "100%",
                  zIndex: 9999999,
                  backgroundColor: "white",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  height: 400,
                  transform: [{ translateY: bounceValue }],
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}>
                  <View style={{
                    flexDirection: "row-reverse",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    paddingHorizontal: 15,
                    paddingBottom: 5,
                    backgroundColor: "white",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    // shadowColor: '#000000',
                    // shadowOpacity: 0.1,
                    // shadowOffset: { width: 0, height: 4 },
                    // elevation: 4,
                  }}>
                    <View>
                      <TouchableOpacity
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        onPress={this.handleSaveCategories}>
                        <Text style={{
                          color: "#2aa1d9",
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>
                          {"שמירה"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <Text style={{
                        color: "#022258",
                        fontSize: sp(16),
                        fontFamily: fonts.regular,
                      }}>
                        {"סינון לפי קטגוריה"}
                      </Text>
                    </View>
                    <View style={{
                      marginTop: 30,
                    }}>
                      <TouchableOpacity
                        activeOpacity={(lenCategoriesMatchCopy > 0) ? 0.2 : 1}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        onPress={this.handleRemoveAllCategories}>
                        <Text style={{
                          color: lenCategoriesMatchCopy > 0 ? "#2aa1d9" : "#c2c3c3",
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>
                          {"הסר הכל"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <ScrollView
                    style={{
                      flex: 1,
                      position: "relative",
                    }}
                    contentContainerStyle={{
                      marginHorizontal: 15,
                    }}
                  >
                    {categoriesMatchCopy.length > 0 && this.divideList(categoriesMatchCopy).map((gr, i) => {
                      return (
                        <View key={i.toString()}
                              style={{
                                height: 77,
                                marginBottom: 15,
                                flex: 1,
                                width: "100%",
                                alignSelf: "center",
                                alignItems: "center",
                                alignContent: "center",
                                justifyContent: "space-between",
                                flexDirection: (isRtl) ? "row-reverse" : "row",
                              }}>
                          {
                            gr.map((f, i1) => {
                              if (f.press !== null) {
                                return (
                                  <TouchableOpacity key={i1.toString()}
                                                    onPress={this.handleToggleCategory(f)}
                                                    style={{
                                                      flexDirection: "column",
                                                      alignSelf: "center",
                                                      justifyContent: "center",
                                                      alignItems: "center",
                                                      alignContent: "center",
                                                      height: 77,
                                                      width: 82,
                                                      borderWidth: 1,
                                                      borderColor: f.press ? "#11cab1" : "#0c2b5f",
                                                      borderRadius: 5,
                                                      backgroundColor: f.press ? "#11cab1" : "white",
                                                    }}>
                                    <View style={{}}>
                                      <CustomIcon
                                        name={getTransCategoryIcon(f.iconType)}
                                        size={30}
                                        color={f.press ? "white" : "#022258"} />
                                    </View>
                                    <Text
                                      style={{
                                        paddingTop: 8,
                                        fontSize: sp(14),
                                        fontFamily: fonts.regular,
                                        color: f.press ? "white" : "#022258",
                                      }}
                                      numberOfLines={1}
                                      ellipsizeMode="tail">
                                      {f.transTypeName}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              } else {
                                return (
                                  <View key={i1.toString()}
                                        style={{
                                          height: 77,
                                          width: 82,
                                        }} />
                                );
                              }
                            })
                          }
                        </View>
                      );
                    })}
                  </ScrollView>
                </Animated.View>
              </View>
            )}

            {(payListModal) && (
              <View style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                zIndex: 999999,
                height: "100%",
                width: "100%",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "flex-end",
                alignContent: "center",
              }}>

                <TouchableOpacity style={{
                  backgroundColor: "black",
                  opacity: 0.7,
                  position: "absolute",
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 999999,
                  height: "100%",
                  width: "100%",
                }} onPress={this.handleCancelSavePays} />

                <Animated.View style={{
                  width: "100%",
                  zIndex: 9999999,
                  backgroundColor: "white",
                  borderTopLeftRadius: 12,
                  borderTopRightRadius: 12,
                  height: 400,
                  transform: [{ translateY: bounceValue }],
                  position: "absolute",
                  right: 0,
                  bottom: 0,
                  left: 0,
                }}>
                  <View style={{
                    flexDirection: "row-reverse",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 8,
                    paddingHorizontal: 15,
                    paddingBottom: 5,
                    backgroundColor: "white",
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                    // shadowColor: '#000000',
                    // shadowOpacity: 0.1,
                    // shadowOffset: { width: 0, height: 4 },
                    // elevation: 4,
                  }}>
                    <View>
                      <TouchableOpacity
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        onPress={this.handleSavePays}>
                        <Text style={{
                          color: "#2aa1d9",
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>
                          {"שמירה"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <View>
                      <Text style={{
                        color: "#022258",
                        fontSize: sp(16),
                        fontFamily: fonts.regular,
                      }}>
                        {"סינון לפי סוג תשלום"}
                      </Text>
                    </View>
                    <View style={{
                      marginTop: 30,
                    }}>
                      <TouchableOpacity
                        activeOpacity={(lenPayListCopy > 0) ? 0.2 : 1}
                        hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                        onPress={this.handleRemoveAllPays}>
                        <Text style={{
                          color: lenPayListCopy > 0 ? "#2aa1d9" : "#c2c3c3",
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>
                          {"הסר הכל"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <ScrollView
                    style={{
                      flex: 1,
                      position: "relative",
                    }}
                    contentContainerStyle={{
                      marginHorizontal: 15,
                    }}
                  >
                    {payListCopy.length > 0 && this.divideList(payListCopy).map((gr, i) => {
                      return (
                        <View key={i.toString()}
                              style={{
                                height: 77,
                                marginBottom: 15,
                                flex: 1,
                                width: "100%",
                                alignSelf: "center",
                                alignItems: "center",
                                alignContent: "center",
                                justifyContent: "space-between",
                                flexDirection: (isRtl) ? "row-reverse" : "row",
                              }}>
                          {
                            gr.map((f, i1) => {
                              if (f.press !== null) {
                                return (
                                  <TouchableOpacity key={i1.toString()}
                                                    onPress={this.handleTogglePays(f)}
                                                    style={{
                                                      flexDirection: "column",
                                                      alignSelf: "center",
                                                      justifyContent: "center",
                                                      alignItems: "center",
                                                      alignContent: "center",
                                                      height: 77,
                                                      width: 82,
                                                      borderWidth: 1,
                                                      borderColor: f.press ? "#11cab1" : "#0c2b5f",
                                                      borderRadius: 5,
                                                      backgroundColor: f.press ? "#11cab1" : "white",
                                                    }}>
                                    <View style={{}}>
                                      <CustomIcon
                                        name={getBankTransIcon(f.id)}
                                        size={30}
                                        color={f.press ? "white" : "#022258"} />
                                    </View>
                                    <Text
                                      style={{
                                        paddingTop: 8,
                                        fontSize: sp(14),
                                        fontFamily: fonts.regular,
                                        color: f.press ? "white" : "#022258",
                                      }}
                                      numberOfLines={1}
                                      ellipsizeMode="tail">
                                      {(this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === f.id) ? this.props.searchkey.find((it) => it.paymentDescription === f.id).name : "")}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              } else {
                                return (
                                  <View key={i1.toString()}
                                        style={{
                                          height: 77,
                                          width: 82,
                                        }} />
                                );
                              }
                            })
                          }
                        </View>
                      );
                    })}
                  </ScrollView>
                </Animated.View>
              </View>
            )}

            {showAlert && (
              <Animated.View style={{
                opacity: fadeAnim,
                position: "absolute",
                bottom: 0,
                right: 0,
                left: 0,
                top: 0,
                zIndex: 9,
                height: "100%",
                width: "100%",
                flexDirection: "row",
                alignSelf: "center",
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
              }}>
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    left: 0,
                    top: 0,
                    zIndex: 9,
                    height: "100%",
                    width: "100%",
                    backgroundColor: "#cccccc",
                    opacity: 0.7,
                  }}
                  onPress={this.animatedTime} />
                <View style={{
                  height: 83.5,
                  width: 348,
                  backgroundColor: "#ffffff",
                  borderRadius: 15,
                  zIndex: 10,
                  shadowColor: "#a0a0a0",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 2,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <TouchableOpacity
                    style={{
                      height: 20,
                      alignSelf: "flex-end",
                    }}
                    onPress={this.animatedTime}>
                    <Icon
                      name="close"
                      type="material-community"
                      size={25}
                      color={"#022258"}
                    />
                  </TouchableOpacity>
                  <Text style={{
                    color: "#0f3860",
                    fontSize: sp(16),
                    lineHeight: 24,
                    fontFamily: fonts.regular,
                    textAlign: "center",
                  }}>
                    פירוט התנועות אינו סופי ועשוי להשתנות/ לא להתבצע.
                  </Text>
                  <Text style={{
                    color: "#0f3860",
                    fontSize: sp(16),
                    lineHeight: 24,
                    fontFamily: fonts.regular,
                    textAlign: "center",
                  }}>
                    ייתכן שתהיינה נוספות שלא מופיעות בשלב זה.
                  </Text>
                </View>
              </Animated.View>
            )}

            <Modal
              animationType="slide"
              transparent={false}
              visible={showGraph}
              onRequestClose={() => {
                // //console.log('Modal has been closed.')
              }}>
              <SafeAreaView style={{
                flex: 1,
                marginTop: 0,
                paddingTop: 0,
                position: "relative",
              }}>
                <View style={{
                  flex: 1,
                  alignItems: "center",
                }}>

                  <View style={{
                    height: 68,
                    backgroundColor: "#002059",
                    width: "100%",
                    paddingTop: 0,
                    paddingLeft: 10,
                    paddingRight: 10,
                    alignItems: "center",
                    alignSelf: "center",
                    alignContent: "center",
                    justifyContent: "center",
                  }}>
                    <View style={cs(
                      isRtl,
                      [{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }],
                      commonStyles.rowReverse,
                    )}>
                      <View style={{
                        flex: 15,
                        alignSelf: "center",
                      }}>
                        <TouchableOpacity onPress={this.closeGraph}>
                          <Text style={{
                            fontSize: sp(16),
                            color: "#ffffff",
                            fontFamily: fonts.semiBold,
                          }}>{"ביטול"}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ alignItems: "center", flex: 70, alignSelf: "center" }}>
                        <Text
                          style={{
                            fontSize: sp(20),
                            color: "#ffffff",
                            fontFamily: fonts.semiBold,
                            textAlign: "center",
                          }}>
                          {"תצוגת גרף"}
                        </Text>
                      </View>
                      <View style={{
                        flex: 15,
                      }} />
                    </View>
                  </View>

                  <View style={{
                    width: "80%",
                    height: "100%",
                    marginTop: 15,
                    marginBottom: 10,
                    paddingLeft: 0,
                    paddingRight: 10,
                    flex: 1,
                    alignItems: "center",
                    alignSelf: "center",
                    alignContent: "center",
                    justifyContent: "center",
                  }}>
                    <View
                      style={{
                        marginTop: 0,
                        width: win.height - 93 * ratio,
                        height: win.width - (isIphoneX() ? 25 : 0),
                        flexDirection: "row",
                        transform: [{ rotate: "90deg" }],
                      }}>

                      <YAxis
                        numberOfTicks={numberTickZchut + numberTickHova}
                        data={yAxisSums}
                        formatLabel={(value, idx) => {
                          if (value === 0) {
                            return value;
                          } else {
                            const val = yAxisSums[idx];
                            return val !== undefined ? this.checkIfK(val) : Math.max(...bankTransGraphZchut) !== 0 ? this.checkIfK(Math.max(...bankTransGraphZchut)) : this.checkIfK(Math.abs(Math.min(...bankTransGraphHova)) / 5);
                          }
                        }}
                        style={{
                          marginBottom: (monthYear && monthYear.filter(item => item !== "").length === 1) ? 60 : 35,
                          width: 30,
                          fontFamily: fonts.regular,
                        }}
                        contentInset={verticalContentInset}
                        svg={axesSvg}
                      />

                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <LineChart
                          numberOfTicks={numberTickZchut}
                          style={{ flex: Math.max(...bankTransGraphZchut) !== 0 ? Math.max(...bankTransGraphZchut) : Math.abs(Math.min(...bankTransGraphHova)) / 5 }}
                          data={bankTransGraphZchut}
                          contentInset={verticalContentInset}
                          svg={{ stroke: "blue" }}
                        >
                          <Grid />
                        </LineChart>
                        <LineChart
                          numberOfTicks={numberTickHova}
                          style={{ flex: Math.abs(Math.min(...bankTransGraphHova)) !== 0 ? Math.abs(Math.min(...bankTransGraphHova)) : Math.max(...bankTransGraphZchut) / 5 }}
                          data={bankTransGraphHova}
                          contentInset={verticalContentInset}
                          svg={{ stroke: "red" }}
                        >
                          <Grid />
                        </LineChart>

                        {monthYear && monthYear.filter(item => item !== "").length === 1 && (
                          <XAxis
                            data={datesGraphList}
                            svg={{
                              rotation: 0,
                              originY: 0,
                              y: 5,
                              fontSize: sp(10),
                              fill: colors.blue32,
                              fontFamily: fonts.regular,
                            }}
                            xAccessor={({ item, index }) => index}
                            style={{
                              marginHorizontal: -10,
                              height: xAxisHeight - 10,
                              fontFamily: fonts.regular,
                            }}
                            contentInset={{
                              left: 10,
                              right: 10,
                            }}
                            formatLabel={(value) => Number(
                              datesGraphList[value].split("/")[0])}
                          />
                        )}

                        {monthYear && monthYear.length > 0 && (
                          <XAxis
                            data={monthYear}
                            svg={{
                              rotation: 0,
                              originY: 0,
                              y: 5,
                              fontSize: sp(12),
                              fill: colors.blue32,
                              fontFamily: fonts.regular,
                            }}
                            xAccessor={({ item, index }) => index}
                            style={{
                              marginHorizontal: -10,
                              height: xAxisHeight,
                              fontFamily: fonts.regular,
                            }}
                            contentInset={{
                              left: 10,
                              right: 10,
                            }}
                            formatLabel={(value) => {
                              const val = monthYear[value];
                              if (val.toString().length === 0) {
                                return val;
                              } else {
                                const vals = monthYear[value].split("/");
                                if (IS_IOS) {
                                  return (LocaleConfig.locales.he.monthNamesShort[Number(
                                    vals[0]) - 1] + " " + vals[1]);
                                } else {
                                  const mon = Number(vals[0]) - 1;
                                  const monHeb = LocaleConfig.locales.he.monthNamesShort[mon];
                                  return (vals[1] + " " +
                                    Array.from(monHeb).reverse().join(""));
                                }
                              }
                            }}
                          />
                        )}
                      </View>
                    </View>
                  </View>
                </View>
              </SafeAreaView>
            </Modal>

            <Modal
              animationType="slide"
              transparent={false}
              visible={updateTypePopup !== false && !isCheckEditCategory}
              onRequestClose={() => {
                // //console.log('Modal has been closed.')
              }}>
              <SafeAreaView style={{
                flex: 1,
                marginTop: 0,
                paddingTop: 0,
                position: "relative",
              }}>
                <View style={{
                  flex: 1,
                  // alignItems: 'center',
                }}>

                  <View style={{
                    height: 60,
                    backgroundColor: "#002059",
                    width: "100%",
                    paddingTop: 0,
                    paddingLeft: 10,
                    paddingRight: 10,
                    alignItems: "center",
                    alignSelf: "center",
                    alignContent: "center",
                    justifyContent: "center",
                  }}>
                    <View style={cs(
                      !isRtl,
                      [{
                        flexDirection: "row",
                        justifyContent: "space-between",
                      }],
                      commonStyles.rowReverse,
                    )}>
                      <View style={{
                        // flex: 15,
                        alignSelf: "center",
                      }}>
                        <TouchableOpacity onPress={this.closeUpdateTypePopup}>
                          <Text style={{
                            fontSize: sp(16),
                            color: "#ffffff",
                            fontFamily: fonts.semiBold,
                          }}>{"ביטול"}</Text>
                        </TouchableOpacity>
                      </View>
                      <View style={{ alignItems: "center", flex: 70, alignSelf: "center" }}>
                        <Text
                          style={{
                            fontSize: sp(20),
                            color: "#ffffff",
                            fontFamily: fonts.semiBold,
                            textAlign: "center",
                          }}>
                          {"קטגוריה"}
                        </Text>
                      </View>
                      <View style={{
                        // flex: 15,
                        alignSelf: "center",
                      }}>
                        <TouchableOpacity onPress={this.updateTypeOfTrans}>
                          <Text style={{
                            fontSize: sp(16),
                            color: "#ffffff",
                            fontFamily: fonts.semiBold,
                          }}>{"אישור"}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  <View style={{
                    width: "100%",
                    height: "100%",
                    marginTop: 15,
                    marginBottom: 10,
                    paddingLeft: 0,
                    paddingRight: 0,
                    flex: 1,
                  }}>
                    <ScrollView
                      style={[{
                        flex: 1,
                        position: "relative",
                      }]}
                      contentContainerStyle={[{
                        backgroundColor: "#ffffff",
                        flexGrow: 1,
                        paddingTop: 0,
                        marginTop: 0,
                        paddingBottom: 0,
                      }]}>

                      <View style={{
                        marginBottom: 15,
                      }}>
                        <Text style={{
                          fontSize: sp(22),
                          color: colors.blue32,
                          fontFamily: fonts.regular,
                          textAlign: "center",
                        }}>
                          {"האם ברצונך לקטלג את "}
                          <Text style={{
                            fontFamily: fonts.semiBold,
                          }}>{updateTypePopup.mainDesc}</Text></Text>
                        <Text style={{
                          fontSize: sp(22),
                          color: colors.blue32,
                          fontFamily: fonts.regular,
                          textAlign: "center",
                        }}>
                          {"כ"}
                          <Text style={{
                            fontFamily: fonts.semiBold,
                          }}>{updateTypePopup.transTypeName}</Text>
                          {" גם עבור"}
                        </Text>
                      </View>

                      <View
                        style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 0.46, alignItems: "flex-end" }} />
                        <View style={{
                          flex: 7.3,
                          backgroundColor: "#f5f5f5",
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }}>
                          <TouchableOpacity
                            style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }]}
                            onPress={this.handleTransCategory("only")}>
                            <View style={{
                              marginRight: "auto",
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "flex-start",
                              alignItems: "center",
                            }}>
                              {updateType === "only" && (<CustomIcon name="ok" size={16}
                                                                     color={colors.blue34} />)}
                            </View>
                            <Text
                              style={[styles.dataRowLevel3Text, {
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {"תנועה זו בלבד"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View
                        style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 0.46, alignItems: "flex-end" }} />
                        <View style={{
                          flex: 7.3,
                          backgroundColor: "#f5f5f5",
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }}>
                          <TouchableOpacity
                            style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }]}
                            onPress={this.handleTransCategory("both")}>
                            <View style={{
                              marginRight: "auto",
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "flex-start",
                              alignItems: "center",
                            }}>
                              {updateType === "both" && (<CustomIcon name="ok" size={16}
                                                                     color={colors.blue34} />)}
                            </View>
                            <Text
                              style={[styles.dataRowLevel3Text, {
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {"כל התנועות"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View
                        style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 0.46, alignItems: "flex-end" }} />
                        <View style={{
                          flex: 7.3,
                          backgroundColor: "#f5f5f5",
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }}>
                          <TouchableOpacity
                            style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }]}
                            onPress={this.handleTransCategory("past")}>
                            <View style={{
                              marginRight: "auto",
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "flex-start",
                              alignItems: "center",
                            }}>
                              {updateType === "past" && (<CustomIcon name="ok" size={16}
                                                                     color={colors.blue34} />)}
                            </View>
                            <Text
                              style={[styles.dataRowLevel3Text, {
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {"תנועות עבר"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View
                        style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 0.46, alignItems: "flex-end" }} />
                        <View style={{
                          flex: 7.3,
                          backgroundColor: "#f5f5f5",
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }}>
                          <TouchableOpacity
                            style={[cs(this.props.isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "flex-end",
                              alignItems: "center",
                            }]}
                            onPress={this.handleTransCategory("future")}>
                            <View style={{
                              marginRight: "auto",
                              flex: 1,
                              flexDirection: "row",
                              justifyContent: "flex-start",
                              alignItems: "center",
                            }}>
                              {updateType === "future" && (<CustomIcon name="ok" size={16}
                                                                       color={colors.blue34} />)}
                            </View>
                            <Text
                              style={[styles.dataRowLevel3Text, {
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              {"תנועות עתיד"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </ScrollView>
                  </View>
                </View>
              </SafeAreaView>
            </Modal>

            {categoriesModalIsOpen && (
              <CategoriesModal
                isOpen
                isRtl={isRtl}
                companyId={currentCompanyId}
                bankTrans={categoryItem || dataRow}
                onClose={this.handleCloseCategoriesModal}
                onUpdateBankTrans={this.handleUpdateBankTrans}
                onSelectCategory={this.handleSelectCategory}
                onCreateCategory={this.handleCreateBankTransCategory}
                onRemoveCategory={this.handleRemoveBankTransCategory}
              />
            )}
            {categoriesInsideSplitModalIsOpen !== false && (
              <CategoriesModal
                isOpen
                isRtl={isRtl}
                companyId={currentCompanyId}
                bankTrans={cashDetails[categoriesInsideSplitModalIsOpen]}
                onClose={this.handleCloseCategoriesInsideSplitModal}
                onUpdateBankTrans={this.handleUpdateBankTransInsideSplitModal}
                onSelectCategory={this.handleSelectCategoryInsideSplitModal}
                onCreateCategory={this.handleCreateBankTransCategory}
                onRemoveCategory={this.handleRemoveBankTransCategory}
              />
            )}
            <Modal
              animationType="slide"
              transparent={false}
              visible={editDescModal}>
              <SafeAreaView style={{
                flex: 1,
                marginTop: 0,
                paddingTop: 0,
                position: "relative",
              }}>
                <View style={{
                  flex: 1,
                }}>
                  <View style={{
                    height: 50,
                    width: "100%",
                    paddingTop: 0,
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}>
                    <View style={cs(
                      !isRtl,
                      [{
                        height: 50,
                        flexDirection: "row",
                        alignContent: "center",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }],
                      commonStyles.rowReverse,
                    )}>
                      <View style={{
                        alignSelf: "center",
                      }}>
                        <TouchableOpacity onPress={this.handleToggleEditDesc}>
                          <Icon
                            name="close"
                            type="material-community"
                            size={20}
                            color={"#022258"}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={{
                        alignSelf: "center",
                        opacity: (copyMainDescValid === true && copyMainDesc.length > 0) ? 1 : 0.3,
                      }}>
                        <TouchableOpacity
                          activeOpacity={(copyMainDescValid === true && copyMainDesc.length > 0) ? 0.2 : 1}
                          onPress={(copyMainDescValid === true && copyMainDesc.length > 0) ? this.handleUpdateTransText : null}>
                          <Text style={{
                            fontSize: sp(16),
                            color: "#022258",
                            fontFamily: fonts.semiBold,
                          }}>{"אישור"}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <KeyboardAwareScrollView
                    enableOnAndroid
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={{
                      width: "100%",
                      marginTop: 0,
                      marginBottom: 0,
                      flexGrow: 1,
                      alignItems: "center",
                      alignSelf: "center",
                      alignContent: "center",
                    }}
                    style={{
                      height: "100%",
                      width: "100%",
                      marginTop: 0,
                      marginBottom: 0,
                      paddingLeft: 0,
                      paddingRight: 0,
                      flex: 1,
                    }}>
                    <View>
                      <View style={[commonStyles.row, {
                        flex: 1,
                        width: "100%",
                        marginBottom: 8,
                        backgroundColor: "#ffffff",
                        borderColor: colors.red,
                        borderWidth: (copyMainDescValid) ? 0 : 1,
                        paddingHorizontal: 10,
                      }]}>
                        <TextInput
                          autoFocus
                          editable
                          autoCorrect={false}
                          autoCapitalize="sentences"
                          returnKeyType="done"
                          keyboardType="default"
                          multiline
                          placeholder={"תיאור התנועה"}
                          placeholderTextColor="#a7a3a3"
                          numberOfLines={12}
                          underlineColorAndroid="transparent"
                          style={[{
                            textAlign: "right",
                            color: "#022258",
                            fontSize: sp(20),
                            width: "100%",
                            height: 300,
                            textAlignVertical: "top",
                          }, commonStyles.regularFont]}
                          onChangeText={this.handleUpdateFields("copyMainDesc")}
                          onEndEditing={(e) => {
                            this.setState({
                              copyMainDesc: e.nativeEvent.text.toString().replace(getEmoji(), "").replace(/\n/g, ""),
                            });
                            this.handleUpdateFieldValid("copyMainDescValid")(e);
                          }}
                          onBlur={this.handleUpdateFieldValid("copyMainDescValid")}
                          value={copyMainDesc}
                        />
                      </View>
                    </View>
                  </KeyboardAwareScrollView>
                </View>
              </SafeAreaView>
            </Modal>

            <Modal
              animationType="slide"
              transparent={false}
              visible={editDescModalInsideSplit}>
              <SafeAreaView style={{
                flex: 1,
                marginTop: 0,
                paddingTop: 0,
                position: "relative",
              }}>
                <View style={{
                  flex: 1,
                }}>
                  <View style={{
                    height: 50,
                    width: "100%",
                    paddingTop: 0,
                    paddingLeft: 10,
                    paddingRight: 10,
                  }}>
                    <View style={cs(
                      !isRtl,
                      [{
                        height: 50,
                        flexDirection: "row",
                        alignContent: "center",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }],
                      commonStyles.rowReverse,
                    )}>
                      <View style={{
                        alignSelf: "center",
                      }}>
                        <TouchableOpacity onPress={this.handleToggleEditDescInsideSplit()}>
                          <Icon
                            name="close"
                            type="material-community"
                            size={20}
                            color={"#022258"}
                          />
                        </TouchableOpacity>
                      </View>
                      <View style={{
                        alignSelf: "center",
                        opacity: (copyMainDescValidInsideSplit === true && copyMainDescInsideSplit.length > 0) ? 1 : 0.3,
                      }}>
                        <TouchableOpacity
                          activeOpacity={(copyMainDescValidInsideSplit === true && copyMainDescInsideSplit.length > 0) ? 0.2 : 1}
                          onPress={(copyMainDescValidInsideSplit === true && copyMainDescInsideSplit.length > 0) ? this.handleUpdateTransTextInsideSplit : null}>
                          <Text style={{
                            fontSize: sp(16),
                            color: "#022258",
                            fontFamily: fonts.semiBold,
                          }}>{"אישור"}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                  <KeyboardAwareScrollView
                    enableOnAndroid
                    keyboardShouldPersistTaps="always"
                    contentContainerStyle={{
                      width: "100%",
                      marginTop: 0,
                      marginBottom: 0,
                      flexGrow: 1,
                      alignItems: "center",
                      alignSelf: "center",
                      alignContent: "center",
                    }}
                    style={{
                      height: "100%",
                      width: "100%",
                      marginTop: 0,
                      marginBottom: 0,
                      paddingLeft: 0,
                      paddingRight: 0,
                      flex: 1,
                    }}>
                    <View>
                      <View style={[commonStyles.row, {
                        flex: 1,
                        width: "100%",
                        marginBottom: 8,
                        backgroundColor: "#ffffff",
                        borderColor: colors.red,
                        borderWidth: (copyMainDescValidInsideSplit) ? 0 : 1,
                        paddingHorizontal: 10,
                      }]}>
                        <TextInput
                          autoFocus
                          editable
                          autoCorrect={false}
                          autoCapitalize="sentences"
                          returnKeyType="done"
                          keyboardType="default"
                          multiline
                          placeholder={"תיאור התנועה"}
                          placeholderTextColor="#a7a3a3"
                          numberOfLines={12}
                          underlineColorAndroid="transparent"
                          style={[{
                            textAlign: "right",
                            color: "#022258",
                            fontSize: sp(20),
                            width: "100%",
                            height: 300,
                            textAlignVertical: "top",
                          }, commonStyles.regularFont]}
                          onChangeText={this.handleUpdateFieldsInsideSplit("copyMainDescInsideSplit")}
                          onEndEditing={(e) => {
                            this.setState({
                              copyMainDescInsideSplit: e.nativeEvent.text.toString().replace(getEmoji(), "").replace(/\n/g, ""),
                            });
                            this.handleUpdateFieldValidInsideSplit("copyMainDescValidInsideSplit")(e);
                          }}
                          onBlur={this.handleUpdateFieldValidInsideSplit("copyMainDescValidInsideSplit")}
                          value={copyMainDescInsideSplit}
                        />
                      </View>
                    </View>
                  </KeyboardAwareScrollView>
                </View>
              </SafeAreaView>
            </Modal>

            {totalCategoryModalIsOpen && (
              <CreditLimitModal
                allowPoint
                total={cashDetails[descIdxInsideSplitModalIsOpen].total}
                currency={account ? account.currency : "ils"}
                inProgress={setTotalCategoryInProgress}
                onSubmit={this.handleUpdateTotalCategory}
                onClose={this.handleCloseTotalCategoryModal}
              />
            )}

          </Fragment>
          <View style={[styles.panelContainer]} pointerEvents={"box-none"}>
            {/* {currentOpenItemIndex !== null && ( */}
            <TouchableWithoutFeedback
              onPress={this.close}
              style={[{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9,
              }]}>
              <Animated.View
                pointerEvents={currentOpenItemIndex === null ? "box-none" : "auto"}
                style={[{
                  backgroundColor: "black",
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  right: 0,
                  zIndex: 9,
                  opacity: this._deltaY.interpolate({
                    inputRange: [0, 1, Screen.height - 360, Screen.height + 30],
                    outputRange: [0, 0.8, 0.8, 0],
                    extrapolate: "clamp",
                  }),
                }]} />
            </TouchableWithoutFeedback>
            {/* // )} */}

            <Interactable.View
              style={{
                zIndex: 999,
              }}
              // animatedNativeDriver
              animatedValueX={new Animated.Value(0)}
              onSnapStart={this.onDrawerSnap}
              verticalOnly
              ref={this.handleSetRef}
              snapPoints={[{ y: 40 }, { y: Screen.height - 360 }, { y: Screen.height + 30 }]}
              boundaries={{ top: -360 }}
              initialPosition={{ y: Screen.height + 30 }}
              animatedValueY={this._deltaY}>
              <View style={styles.panel}>
                <View style={styles.panelHeader}>
                  <View style={styles.panelHandle} />
                </View>

                <View style={{ left: 0, right: 0, height: Screen.height - 90 }}>
                  {dataRow && !cashSplitPopupOpen && (
                    <View>
                      <View style={{
                        paddingHorizontal: 10,
                      }}>
                        <TouchableOpacity onPress={this.handleToggleEditDesc}>
                          <Text
                            style={styles.panelTitle}>{dataRow.mainDesc.replace(/\n/g, "")}</Text>
                        </TouchableOpacity>
                        <Text style={styles.panelSubtitle}>
                          <Text style={numberStyle}>{dataRow.hova ? "-" : ""}{total[0]}</Text>
                          <Text style={[{
                            color: colors.gray7,
                            fontFamily: fonts.light,
                          }]}>.{total[1]}</Text>
                        </Text>
                        <View style={{
                          height: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          alignSelf: "center",
                          width: "100%",
                          backgroundColor: colors.gray30,
                        }} />
                      </View>
                    </View>
                  )}

                  {dataRow && cashSplitPopupOpen && (
                    <View>
                      <View style={{
                        paddingHorizontal: 10,
                      }}>
                        <View style={{
                          flexDirection: "row-reverse",
                          alignItems: "center",
                          alignContent: "center",
                          justifyContent: "space-between",
                        }}>
                          <TouchableOpacity onPress={this.submitData}>
                            <Text style={styles.panelBtnNav}>{"אישור"}</Text>
                          </TouchableOpacity>

                          <TouchableOpacity onPress={this.cancelEditSplit}>
                            <Text style={styles.panelBtnNav}>{"ביטול"}</Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={[
                          styles.panelSubtitle,
                          { marginBottom: 5 },
                        ]}>
                          <Text
                            style={numberStyle}>{dataRow.hova ? "-" : ""}{total[0]}</Text>
                          <Text style={[{
                            color: colors.gray7,
                            fontFamily: fonts.light,
                          }]}>.{total[1]}</Text>
                        </Text>
                        <View>
                          <Text
                            style={styles.panelTitleText}>{"ניתן לפצל את הסכום ולבחור תיאור וקטגוריה מתאימים"}</Text>
                        </View>
                        <View style={{
                          height: 1,
                          alignItems: "center",
                          justifyContent: "center",
                          alignSelf: "center",
                          width: "100%",
                          backgroundColor: colors.gray30,
                        }} />
                      </View>
                    </View>
                  )}

                  <Animated.ScrollView
                    ref={scrollViewTop => (this.scrollViewTop = scrollViewTop)}
                    maximumZoomScale={0}
                    decelerationRate={"fast"}
                    disableIntervalMomentum
                    disableScrollViewPanResponder
                    directionalLockEnabled
                    automaticallyAdjustContentInsets={false}
                    scrollEnabled={currentOpenItemIndex === "Top" || (currentOpenItemIndex === "Middle" && inProgressSnap)}
                    showsVerticalScrollIndicator={false}
                    scrollEventThrottle={1}
                    onScroll={
                      Animated.event([{ nativeEvent: { contentOffset: {} } }],
                        {
                          useNativeDriver: false,
                          isInteraction: false,
                          listener: e => {
                            const offset = e.nativeEvent.contentOffset.y;
                            if (offset < 0) {
                              this.setState({
                                inProgressSnap: true,
                              });
                              if (this.scrollViewTop && this.scrollViewTop._component) {
                                this.scrollViewTop._component.scrollTo({
                                  animated: false,
                                  y: 0,
                                  x: 0,
                                });
                              }
                              this.listRef.snapTo({ index: 1 });
                              setTimeout(() => {
                                // this.props.dispatch(setOpenedBottomSheet(false))
                                this.setState({
                                  inProgressSnap: false,
                                });
                              }, 30);
                            }
                          },
                        })
                    }>

                    {dataRow && !cashSplitPopupOpen && (
                      <View>
                        <View style={{
                          paddingHorizontal: 10,
                        }}>
                          <View style={{
                            flexDirection: "row-reverse",
                            alignItems: "center",
                            alignContent: "center",
                            justifyContent: "space-between",
                            marginVertical: 8,
                            marginHorizontal: 15,
                          }}>
                            <View style={{
                              flex: 1,
                              flexDirection: "row-reverse",
                              alignSelf: "center",
                              justifyContent: "center",
                            }}>
                              <View style={{
                                paddingLeft: 5,
                                alignSelf: "flex-start",
                              }}>
                                <AccountIcon account={account} />
                              </View>
                              <View>
                                <Text style={{
                                  color: "#022258",
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: "center",
                                }}>{account.bankAccountId}</Text>
                                <Text style={{
                                  color: "#022258",
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: "center",
                                }}>{"ח-ן"}</Text>
                              </View>
                            </View>
                            <View style={{
                              flex: 1,
                              alignSelf: "center",
                              justifyContent: "center",
                            }}>
                              <Text style={{
                                color: "#022258",
                                fontSize: sp(16),
                                fontFamily: fonts.regular,
                                textAlign: "center",
                              }}>{dataRow.asmachta}</Text>
                              <Text style={{
                                color: "#022258",
                                fontSize: sp(16),
                                fontFamily: fonts.regular,
                                textAlign: "center",
                              }}>{"אסמכתא"}</Text>
                            </View>

                            {dataRow.kvua && (
                              <View style={{
                                flex: 1,
                                alignItems: "center",
                                alignSelf: "center",
                                justifyContent: "center",
                              }}>
                                <View style={{
                                  height: 20,
                                  alignSelf: "center",
                                  justifyContent: "center",
                                  alignContent: "center",
                                  alignItems: "center",
                                }}>
                                  <Image
                                    style={styles.cyclicIcon}
                                    source={require("BiziboxUI/assets/cyclic.png")}
                                  />
                                </View>

                                <Text style={{
                                  color: "#022258",
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: "center",
                                }}>{"תנועה קבועה"}</Text>
                              </View>
                            )}
                          </View>

                          <View style={{
                            height: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            alignSelf: "center",
                            width: "100%",
                            backgroundColor: colors.gray30,
                          }} />

                          <View style={{
                            flexDirection: "row-reverse",
                            marginVertical: 15,
                            alignItems: "center",
                            alignContent: "center",
                            justifyContent: "space-between",
                          }}>
                            <View style={{
                              flexDirection: "row-reverse",
                              alignItems: "center",
                              alignContent: "center",
                            }}>
                              <CustomIcon
                                name={getBankTransIcon(dataRow.paymentDesc)}
                                size={16}
                                color={"#022258"}
                              />
                              <View style={commonStyles.spaceDividerDouble} />
                              <Text style={{
                                color: "#022258",
                                fontSize: sp(16),
                                fontFamily: fonts.regular,
                                textAlign: "right",
                              }}>
                                {this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === dataRow.paymentDesc) ? this.props.searchkey.find((it) => it.paymentDescription === dataRow.paymentDesc).name : ""}
                              </Text>
                            </View>

                            {dataRow && dataRow.paymentDesc === "cash" && (
                              <TouchableOpacity
                                onPress={this.cashDetails}
                                style={{
                                  flexDirection: "row-reverse",
                                  alignItems: "center",
                                  alignContent: "center",
                                }}>
                                <Text style={{
                                  color: "#022258",
                                  fontSize: sp(16),
                                  fontFamily: fonts.regular,
                                  textAlign: "right",
                                }}>{"פיצול הסכום"}</Text>
                                <Icon name="chevron-left" size={24} color={colors.blue32}
                                      style={{
                                        alignSelf: "flex-start",
                                      }} />
                              </TouchableOpacity>
                            )}
                          </View>

                          <View style={{
                            height: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            alignSelf: "center",
                            width: "100%",
                            backgroundColor: colors.gray30,
                          }} />

                          {disabledEdit ? (
                            <View
                              style={{
                                opacity: 0.3,
                                flexDirection: "row-reverse",
                                marginVertical: 15,
                                alignItems: "center",
                                alignContent: "center",
                                justifyContent: "space-between",
                              }}>
                              <View style={{
                                flexDirection: "row-reverse",
                                alignItems: "center",
                                alignContent: "center",
                              }}>
                                <CustomIcon
                                  name={getTransCategoryIcon(dataRow.iconType)}
                                  size={16}
                                  color={"#022258"}
                                />
                                <View style={commonStyles.spaceDividerDouble} />
                                <Text
                                  style={styles.dataRowLevel3Text}>{dataRow.transTypeName}</Text>
                              </View>
                            </View>
                          ) : (
                            <TouchableOpacity
                              activeOpacity={1}
                              style={{
                                opacity: 1,
                                flexDirection: "row-reverse",
                                marginVertical: 15,
                                alignItems: "center",
                                alignContent: "center",
                                justifyContent: "space-between",
                              }}
                              onPress={this.handleOpenCategoriesModal}>
                              <View style={{
                                flexDirection: "row-reverse",
                                alignItems: "center",
                                alignContent: "center",
                              }}>
                                <CustomIcon
                                  name={getTransCategoryIcon(dataRow.iconType)}
                                  size={16}
                                  color={"#022258"}
                                />
                                <View style={commonStyles.spaceDividerDouble} />
                                <Text
                                  style={styles.dataRowLevel3Text}>{dataRow.transTypeName}</Text>
                              </View>

                              <Icon name="chevron-left" size={24} color={colors.blue32}
                                    style={{
                                      alignSelf: "flex-start",
                                    }} />
                            </TouchableOpacity>
                          )}

                          <View style={{
                            height: 1,
                            alignItems: "center",
                            justifyContent: "center",
                            alignSelf: "center",
                            width: "100%",
                            backgroundColor: colors.gray30,
                          }} />
                        </View>

                        {(dataRow.linkId || dataRow.pictureLink) && (
                          <View style={{
                            marginTop: 18,
                            alignSelf: "center",
                            flex: 1,
                            marginBottom: 20,
                          }}>
                            <CheckTransSlider
                              idxCategory={idxCategory}
                              handleOpenCategoriesModal={this.handleOpenCategoriesInsideModal}
                              enabledEditCategory={dataRow && (dataRow.paymentDesc === "BankTransfer" && dataRow.linkId !== "00000000-0000-0000-0000-000000000000")}
                              categories={categories}
                              isRtl={isRtl}
                              account={account}
                              parentIsOpen
                              inProgress={inProgressDetails}
                              details={details}
                              bankTrans={dataRow}
                            />
                          </View>
                        )}

                      </View>
                    )}

                    {dataRow && cashSplitPopupOpen && (
                      <View>
                        <View style={{
                          paddingHorizontal: 10,
                        }}>
                          {cashDetails.length > 0 && cashDetails.map((f, i) => {
                            return (
                              <View key={i.toString()}
                                    style={{
                                      height: "auto",
                                      width: "100%",
                                    }}>

                                <TouchableOpacity
                                  activeOpacity={1}
                                  onPress={this.changeTotalCategory(i)}
                                  style={{
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    alignContent: "center",
                                    justifyContent: "flex-start",
                                    height: 45,
                                  }}>

                                  <View style={{
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    alignContent: "center",
                                  }}>
                                    <View style={{
                                      width: 22,
                                      marginLeft: 7.5,
                                    }}>
                                      <Text style={{
                                        color: "#022258",
                                        fontSize: sp(26),
                                        fontFamily: fonts.light,
                                        textAlign: "left",
                                      }}>{"₪"}</Text>
                                    </View>
                                    <View>
                                      <Text style={{
                                        color: "#022258",
                                        fontSize: sp(16),
                                        fontFamily: fonts.regular,
                                      }}>
                                        <Text
                                          style={numberStyle}>{dataRow.hova && f.total !== 0 && f.total !== "" ? "-" : ""}{getFormattedValueArray(f.total)[0]}</Text>
                                        {f.total !== "" && getFormattedValueArray(f.total)[1] !== "00" && (
                                          <Text style={[{
                                            color: colors.gray7,
                                            fontFamily: fonts.light,
                                          }]}>.{getFormattedValueArray(f.total)[1]}</Text>)}
                                      </Text>
                                    </View>
                                  </View>

                                  {cashDetails.length > 1 && (
                                    <TouchableOpacity
                                      activeOpacity={1}
                                      style={{
                                        alignSelf: "center",
                                        marginLeft: "auto",
                                        width: 25,
                                        flexDirection: "row-reverse",
                                        alignItems: "center",
                                        alignContent: "center",
                                        justifyContent: "center",
                                      }}
                                      onPress={this.removeItem(i)}>
                                      <CustomIcon
                                        iconStyle={{
                                          textAlign: "center",
                                        }}
                                        name="trash"
                                        size={22}
                                        color={"#022258"} />
                                    </TouchableOpacity>
                                  )}
                                </TouchableOpacity>

                                <View style={{
                                  height: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  alignSelf: "center",
                                  width: "100%",
                                  backgroundColor: ((cashDetails.length > 1 && sumTotals !== dataRow.total && ((sumTotals > dataRow.total && ((sumTotals - dataRow.total) >= 0.01)) || (sumTotals < dataRow.total && ((dataRow.total - sumTotals) >= 0.01)))) || !f.total) ? "#cd1010" : colors.gray30,
                                }} />

                                <TouchableOpacity
                                  activeOpacity={1}
                                  onPress={this.handleToggleEditDescInsideSplit(i)}
                                  style={{
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    alignContent: "center",
                                    justifyContent: "flex-start",
                                    height: 45,
                                  }}>
                                  <View
                                    style={{
                                      width: 22,
                                      marginLeft: 7.5,
                                    }}>
                                    <Image
                                      resizeMode="contain"
                                      style={{ width: 20.5, height: 19 }}
                                      source={require("BiziboxUI/assets/commentDescIcon.png")} />
                                  </View>
                                  <View>
                                    <Text style={{
                                      color: "#022258",
                                      fontSize: sp(16),
                                      fontFamily: fonts.regular,
                                    }}>{f.cashCatDesc}</Text>
                                  </View>
                                </TouchableOpacity>

                                <View style={{
                                  height: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  alignSelf: "center",
                                  width: "100%",
                                  backgroundColor: colors.gray30,
                                }} />

                                <TouchableOpacity
                                  activeOpacity={1}
                                  onPress={this.handleOpenCategoriesInsideSplitModal(i)}
                                  style={{
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    alignContent: "center",
                                    justifyContent: "flex-start",
                                    height: 45,
                                  }}>

                                  <View style={{
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    alignContent: "center",
                                  }}>
                                    <View style={{
                                      width: 22,
                                      marginLeft: 7.5,
                                    }}>
                                      <CustomIcon
                                        name={getTransCategoryIcon(f.iconType)}
                                        size={sp(20)}
                                        iconStyle={{
                                          textAlign: "left",
                                        }}
                                        color={"#022258"}
                                      />
                                    </View>
                                    <View>
                                      <Text style={{
                                        color: "#022258",
                                        fontSize: sp(16),
                                        fontFamily: fonts.regular,
                                      }}>{f.transTypeName}</Text>
                                    </View>
                                  </View>

                                  <View style={{
                                    alignSelf: "center",
                                    marginLeft: "auto",
                                    width: 25,
                                    flexDirection: "row-reverse",
                                    alignItems: "center",
                                    alignContent: "center",
                                    justifyContent: "center",
                                  }}>
                                    <Icon
                                      iconStyle={{
                                        textAlign: "center",
                                      }}
                                      name="chevron-left"
                                      size={24}
                                      color={colors.blue32}
                                    />
                                  </View>
                                </TouchableOpacity>

                                <View style={{
                                  height: 1,
                                  alignItems: "center",
                                  justifyContent: "center",
                                  alignSelf: "center",
                                  width: "100%",
                                  backgroundColor: colors.gray30,
                                }} />
                              </View>
                            );
                          })}
                          <TouchableOpacity
                            style={{
                              flexDirection: "row-reverse",
                              alignItems: "center",
                              alignContent: "center",
                              justifyContent: "flex-start",
                              height: 45,
                            }}
                            onPress={this.addSplit}>
                            <View style={{
                              width: 22,
                              marginLeft: 7.5,
                            }}>
                              <Icons
                                iconStyle={{
                                  alignSelf: "center",
                                }}
                                name="plus-circle"
                                type="material-community"
                                size={sp(22)}
                                color={"#0addc1"}
                              />
                            </View>

                            <View>
                              <Text style={{
                                color: "#037dba",
                                fontSize: sp(16),
                                fontFamily: fonts.regular,
                              }}>{"פיצול"}</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                  </Animated.ScrollView>

                  {dataRow && cashSplitPopupOpen &&
                    (cashDetails.length > 1 && sumTotals !== dataRow.total && ((sumTotals > dataRow.total && ((sumTotals - dataRow.total) >= 0.01)) || (sumTotals < dataRow.total && ((dataRow.total - sumTotals) >= 0.01)))) &&
                    (<View style={{
                      flexDirection: "row-reverse",
                      alignItems: "center",
                      alignContent: "center",
                      justifyContent: "center",
                      height: 30,
                      marginBottom: 10,
                    }}>
                      <CustomIcon name="exclamation-triangle"
                                  iconStyle={{
                                    alignSelf: "align-start",
                                    marginLeft: 5,
                                  }}
                                  size={sp(15)}
                                  color={"#cd1010"} />

                      {sumTotals > dataRow.total && (
                        <Text style={{
                          color: "#cd1010",
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>
                          {"שימו לב, הסכום הכולל גבוה ב "}
                          {formatAsSumNoMath(sumTotals - dataRow.total)}
                          {" מהסכום בבנק"}
                        </Text>
                      )}
                      {sumTotals < dataRow.total && (
                        <Text style={{
                          color: "#cd1010",
                          fontSize: sp(15),
                          fontFamily: fonts.regular,
                        }}>
                          {"שימו לב, הסכום הכולל קטן ב "}
                          {formatAsSumNoMath(dataRow.total - sumTotals)}
                          {" מהסכום בבנק"}
                        </Text>
                      )}
                    </View>)}

                </View>
              </View>
            </Interactable.View>
          </View>
        </View>

      </Fragment>
    );
  }
}
