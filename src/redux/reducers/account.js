import { createReducer } from '../reduxHelpers'
import {
  GET_ACCOUNT_BALANCE_CHART_DATA,
  GET_ACCOUNT_DATA_AGGREGATE,
  GET_ACCOUNT_TODAY_TRANS,
  GET_ACCOUNTS,
  GET_BANK_TRANS,
  GET_TOKEN,
  SELECT_ACCOUNT,
  UPDATE_BANK_TRANS_IN_STORE,
} from '../constants/account'

export const accounts = createReducer([], {
  [GET_ACCOUNTS.SUCCESS] (state, action) {
    return [...action.resp]
  },
})

export const selectedAccountIds = createReducer([], {
  [SELECT_ACCOUNT] (state, action) {
    return action.payload
  },
})

export const accountAggregatedData = createReducer(null, {
  [GET_ACCOUNT_DATA_AGGREGATE.SUCCESS] (state, action) {
    return action.resp
  },
})

export const accountBalanceChartData = createReducer(null, {
  [GET_ACCOUNT_BALANCE_CHART_DATA.SUCCESS] (state, action) {
    return action.resp
  },
  [GET_ACCOUNT_BALANCE_CHART_DATA.FAILURE] () {
    return null
  },
})

export const accountTodayTrans = createReducer(null, {
  [GET_ACCOUNT_TODAY_TRANS.SUCCESS] (state, action) {
    return action.resp
  },
})

export const accountBankTrans = createReducer([], {
  [GET_BANK_TRANS.SUCCESS] (state, action) {
    return action.resp
  },
  [UPDATE_BANK_TRANS_IN_STORE] (state, action) {
    return action.payload
  },
})

export const getToken = createReducer(null, {
  [GET_TOKEN.SUCCESS] (state, action) {
    return [...action.resp]
  },
})
