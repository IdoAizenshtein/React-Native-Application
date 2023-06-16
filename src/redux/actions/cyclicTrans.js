import { getCyclicTransApi, getCyclicTransRecommendationsApi } from '../../api'

import {
  GET_CYCLIC_TRANS,
  GET_CYCLIC_TRANS_RECOMMENDATIONS,
} from '../constants/cyclicTrans'

export function getCyclicTrans ({ companyId, companyAccountIds }) {
  return dispatch => {
    const body = {
      companyId,
      companyAccountIds,
    }

    return dispatch({
      type: GET_CYCLIC_TRANS.START,
      async: getCyclicTransApi.post({ body }),
    })
  }
}

export function getCyclicTransRecommendations ({ accountIds }) {
  return dispatch => {
    const body = { accountIds }

    return dispatch({
      type: GET_CYCLIC_TRANS_RECOMMENDATIONS.START,
      async: getCyclicTransRecommendationsApi.post({ body }),
    })
  }
}
