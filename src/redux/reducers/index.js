import recycleState from 'redux-recycle'
import { LOGOUT } from '../constants/auth'
import { messagesCount, searchkey, token, user } from './auth'
import { companies, currentCompanyId } from './company'
import {
  accountAggregatedData,
  accountBalanceChartData,
  accountBankTrans,
  accounts,
  accountTodayTrans,
  getToken,
  selectedAccountIds,
} from './account'
import { isRtl } from './lang'
import {
  bankAccountScreenMode,
  cashFlowScreenMode,
  globalParams,
  isPopAddCashShow,
  isPopAddCheckShow,
  isPopAddCreateTransShow,
  mutavimPopupTimes,
  openedBottomSheet,
  rememberMe,
  taryePopupTimes,
} from './user'
import { creditCards } from './card'
import { slika } from './slika'
import {
  cashFlowAggregatedData,
  cashFlowBalanceChartData,
  cashFlowDetailsData,
} from './cashFlow'
import { checksIncomeData, checksOutData } from './checks'
import { cyclicTransData, cyclicTransRecommendationsData } from './cyclicTrans'
import {
  banktransForMatchData,
  cashflowMatchData,
  getBankMatchAccountData,
} from './bankMatch'

export default {
  globalParams: recycleState(globalParams, [LOGOUT]),
  openedBottomSheet: recycleState(openedBottomSheet, [LOGOUT]),
  isRtl: isRtl,
  token: recycleState(token, [LOGOUT]),
  showPopAlertCheck: isPopAddCheckShow,
  showPopAlertCash: isPopAddCashShow,
  showPopAlertCreateTrans: isPopAddCreateTransShow,
  taryePopupTimes: recycleState(taryePopupTimes, [LOGOUT]),
  mutavimPopupTimes: recycleState(mutavimPopupTimes, [LOGOUT]),
  rememberMe: rememberMe,
  user: recycleState(user, [LOGOUT]),
  searchkey: recycleState(searchkey, [LOGOUT]),
  currentCompanyId: recycleState(currentCompanyId, [LOGOUT]),
  messagesCount: recycleState(messagesCount, [LOGOUT]),
  companies: recycleState(companies, [LOGOUT]),
  accounts: recycleState(accounts, [LOGOUT]),
  getToken: recycleState(getToken, [LOGOUT]),
  selectedAccountIds: recycleState(selectedAccountIds, [LOGOUT]),
  bankAccountScreenMode: recycleState(bankAccountScreenMode, [LOGOUT]),
  accountAggregatedData: recycleState(accountAggregatedData, [LOGOUT]),
  accountTodayTrans: recycleState(accountTodayTrans, [LOGOUT]),
  accountBalanceChartData: recycleState(accountBalanceChartData, [LOGOUT]),
  accountBankTrans: recycleState(accountBankTrans, [LOGOUT]),
  creditCards: recycleState(creditCards, [LOGOUT]),
  slika: recycleState(slika, [LOGOUT]),
  cashFlowScreenMode: recycleState(cashFlowScreenMode, [LOGOUT]),
  cashFlowAggregatedData: recycleState(cashFlowAggregatedData, [LOGOUT]),
  cashFlowDetailsData: recycleState(cashFlowDetailsData, [LOGOUT]),
  cashFlowBalanceChartData: recycleState(cashFlowBalanceChartData, [LOGOUT]),
  checksIncomeData: recycleState(checksIncomeData, [LOGOUT]),
  checksOutData: recycleState(checksOutData, [LOGOUT]),
  cyclicTransData: recycleState(cyclicTransData, [LOGOUT]),
  cyclicTransRecommendationsData: recycleState(cyclicTransRecommendationsData,
    [LOGOUT]),
  bankMatchAccountData: recycleState(getBankMatchAccountData, [LOGOUT]),
  banktransForMatchData: recycleState(banktransForMatchData, [LOGOUT]),
  cashflowMatchData: recycleState(cashflowMatchData, [LOGOUT]),
}
