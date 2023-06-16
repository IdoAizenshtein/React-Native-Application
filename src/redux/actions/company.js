import { isNull } from 'lodash'
import { companiesApi } from '../../api'
import { GET_COMPANIES, SELECT_COMPANY } from '../constants/company'
import { getMessagesCount } from './auth'

export function getCompanies () {
  return dispatch => {
    return dispatch({
      type: GET_COMPANIES.START,
      async: companiesApi.get(),
    })
  }
}

export function selectCompany (companyId = null) {
  return (dispatch, getState) => {
    const { user, companies, currentCompanyId } = getState()
    if (!companies.length || !user) {return}

    let newCompanyId = companyId || currentCompanyId || null

    if (!newCompanyId) {
      newCompanyId = companies[0].companyId

      if (user.hasOwnProperty('mainCompanyId') && !isNull(user.mainCompanyId)) {
        const company = companies.find(c => c.companyId === user.mainCompanyId)
        if (company) {
          newCompanyId = company.companyId
        }
      }
    }

    dispatch({
      type: SELECT_COMPANY,
      payload: newCompanyId,
    })
    return dispatch(getMessagesCount(newCompanyId))
  }
}
