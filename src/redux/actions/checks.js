import { getInChecksApi, getOutChecksApi } from '../../api'

import { GET_CHECKS_INCOME, GET_CHECKS_OUT } from '../constants/checks'

export function getChecks ({ income, companyAccountIds, dateFrom, dateTill }) {
  return dispatch => {
    const body = {
      companyAccountIds,
      dateFrom,
      dateTill,
    }

    return dispatch({
      type: (income) ? GET_CHECKS_INCOME.START : GET_CHECKS_OUT.START,
      async: (income) ? getInChecksApi.post({ body }) : getOutChecksApi.post(
        { body }),
    })
  }
}
