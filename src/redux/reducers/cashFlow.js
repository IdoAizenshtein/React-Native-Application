import { createReducer } from '../reduxHelpers'
import {
  GET_CASHFLOW_BALANCE_CHART_DATA,
  GET_CASHFLOW_DATA_AGGREGATE,
  GET_CASHFLOW_DATA_DETAILS,
  GET_CASHFLOW_DATA_DETAILS_DATA,
} from '../constants/cashFlow'

export const cashFlowAggregatedData = createReducer(null, {
  [GET_CASHFLOW_DATA_AGGREGATE.SUCCESS] (state, action) {
    return action.resp
  },
})

export const cashFlowDetailsData = createReducer([], {
  [GET_CASHFLOW_DATA_DETAILS.SUCCESS] (state, action) {
    return action.resp
  },
  [GET_CASHFLOW_DATA_DETAILS_DATA] (state, action) {
    return action.payload
  },
})

export const cashFlowBalanceChartData = createReducer(null, {
  [GET_CASHFLOW_BALANCE_CHART_DATA.SUCCESS] (state, action) {
    return action.resp
  },
  [GET_CASHFLOW_BALANCE_CHART_DATA.FAILURE] () {
    return null
  },
})
