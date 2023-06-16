import { createReducer } from '../reduxHelpers'
import {
  BANK_TRANS_FOR_MATCH,
  CASH_FLOW_MATCH,
  GET_BANK_MATCH_ACCOUNT,
} from '../constants/bankMatch'

export const getBankMatchAccountData = createReducer([], {
  [GET_BANK_MATCH_ACCOUNT.SUCCESS] (state, action) {
    return action.resp
  },
})

export const banktransForMatchData = createReducer([], {
  [BANK_TRANS_FOR_MATCH.SUCCESS] (state, action) {
    return action.resp
  },
})

export const cashflowMatchData = createReducer([], {
  [CASH_FLOW_MATCH.SUCCESS] (state, action) {
    return action.resp
  },
})
