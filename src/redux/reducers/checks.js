import { createReducer } from '../reduxHelpers'
import { GET_CHECKS_INCOME, GET_CHECKS_OUT } from '../constants/checks'

export const checksIncomeData = createReducer([], {
  [GET_CHECKS_INCOME.SUCCESS] (state, action) {
    return action.resp
  },
})

export const checksOutData = createReducer([], {
  [GET_CHECKS_OUT.SUCCESS] (state, action) {
    return action.resp
  },
})
