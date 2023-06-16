import { createReducer } from '../reduxHelpers'
import { GET_CREDIT_CARDS, UPDATE_CREDIT_LIMIT } from '../constants/card'

export const creditCards = createReducer([], {
  [GET_CREDIT_CARDS.SUCCESS] (state, action) {
    return action.resp
  },
  [UPDATE_CREDIT_LIMIT] (state, action) {
    return action.payload
  },
})
