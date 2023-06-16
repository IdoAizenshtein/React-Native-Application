import { createReducer } from '../reduxHelpers'
import { GET_COMPANIES, SELECT_COMPANY } from '../constants/company'

export const companies = createReducer([], {
  [GET_COMPANIES.SUCCESS] (state, action) {
    return [...action.resp]
  },
})

export const currentCompanyId = createReducer(null, {
  [SELECT_COMPANY] (state, action) {
    return action.payload
  },
})
