import {
  banktransForMatchApi,
  cashflowMatchApi,
  getBankMatchAccountApi,
} from '../../api'

import {
  BANK_TRANS_FOR_MATCH,
  CASH_FLOW_MATCH,
  GET_BANK_MATCH_ACCOUNT,
} from '../constants/bankMatch'

export function getBankMatchAccount (params) {
  return dispatch => {
    const body = params
    return dispatch({
      type: GET_BANK_MATCH_ACCOUNT.START,
      async: getBankMatchAccountApi.post({ body }),
    })
  }
}

export function banktransForMatch ({ uuid }) {
  return dispatch => {
    const body = { uuid }
    return dispatch({
      type: BANK_TRANS_FOR_MATCH.START,
      async: banktransForMatchApi.post({ body }),
    })
  }
}

export function cashflowMatch ({ uuid }) {
  return dispatch => {
    const body = { uuid }
    return dispatch({
      type: CASH_FLOW_MATCH.START,
      async: cashflowMatchApi.post({ body }),
    })
  }
}
