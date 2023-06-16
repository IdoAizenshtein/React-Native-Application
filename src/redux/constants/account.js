import { getAsyncActionTypes } from '../reduxHelpers'

export const GET_ACCOUNTS = getAsyncActionTypes('GET_ACCOUNTS')
export const GET_ACCOUNT_DATA_AGGREGATE = getAsyncActionTypes(
  'GET_ACCOUNT_DATA_AGGREGATE')
export const GET_ACCOUNT_TODAY_TRANS = getAsyncActionTypes(
  'GET_ACCOUNT_TODAY_TRANS')
export const GET_ACCOUNT_BALANCE_CHART_DATA = getAsyncActionTypes(
  'GET_ACCOUNT_BALANCE_CHART_DATA')

export const GET_BANK_TRANS = getAsyncActionTypes('GET_BANK_TRANS')
export const UPDATE_BANK_TRANS_IN_STORE = 'UPDATE_BANK_TRANS_IN_STORE'

export const SELECT_ACCOUNT = 'SELECT_ACCOUNT'
export const exampleCompany = {
  isExample: false,
  companyId: null,
}
export const GET_TOKEN = getAsyncActionTypes('GET_TOKEN')
