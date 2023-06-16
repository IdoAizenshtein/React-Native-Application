import {
  GET_CASHFLOW_BALANCE_CHART_DATA,
  GET_CASHFLOW_DATA_AGGREGATE,
  GET_CASHFLOW_DATA_DETAILS,
  GET_CASHFLOW_DATA_DETAILS_DATA,
} from '../constants/cashFlow'
import {
  cashFlowAggregateDataApi,
  cashFlowBalanceChartDataApi,
  cashFlowDetailsDataApi,
} from '../../api'

export function getCashFlowAggregateData (
  { companyAccountIds, companyId, dateFrom, dateTill, expence }, allData) {
  return dispatch => {
    const body = {
      companyAccountIds,
      companyId,
      dateFrom,
      dateTill,
      expence,
    }
    return dispatch({
      type: GET_CASHFLOW_DATA_AGGREGATE.START,
      async: cashFlowAggregateDataApi.post({ body })
        .then(data => {
          return ((!allData) ? data.find(d => d.accountUuid === null) : data) ||
            null
        }),
    })
  }
}

export function getCashFlowDetailsData ({ companyAccountIds, companyId, dateFrom, dateTill, expence }) {
  return dispatch => {
    const body = {
      companyAccountIds,
      companyId,
      dateFrom,
      dateTill,
      expence,
    }
    return dispatch({
      type: GET_CASHFLOW_DATA_DETAILS.START,
      async: cashFlowDetailsDataApi.post({ body }),
    })
  }
}

export function setCashFlowData (data) {
  return dispatch => {
    return dispatch({
      type: GET_CASHFLOW_DATA_DETAILS_DATA,
      payload: data,
    })
  }
}

export function getCashFlowBalanceChartData ({ companyAccountIds, companyId, dateFrom, dateTill }) {
  return dispatch => {
    return dispatch({
      type: GET_CASHFLOW_BALANCE_CHART_DATA.START,
      async: cashFlowBalanceChartDataApi.post({
        body: {
          companyAccountIds,
          companyId,
          dateFrom,
          dateTill,
        },
      }),
    })
  }
}
