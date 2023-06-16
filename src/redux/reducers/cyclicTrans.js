import { createReducer } from '../reduxHelpers'
import {
  GET_CYCLIC_TRANS,
  GET_CYCLIC_TRANS_RECOMMENDATIONS,
} from '../constants/cyclicTrans'

export const cyclicTransData = createReducer([], {
  [GET_CYCLIC_TRANS.SUCCESS] (state, action) {
    return action.resp
  },
})

export const cyclicTransRecommendationsData = createReducer([], {
  [GET_CYCLIC_TRANS_RECOMMENDATIONS.SUCCESS] (state, action) {
    return action.resp
  },
})
