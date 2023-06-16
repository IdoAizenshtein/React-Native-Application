import { slikaCflApi } from '../../api'
import { GET_SLIKA } from '../constants/slika'

export function getSlika (accounts) {
  return dispatch => {
    if (!accounts || !accounts.length) {return}
    const body = accounts.map(a => ({ uuid: a.companyAccountId }))

    return dispatch({
      type: GET_SLIKA.START,
      async: slikaCflApi.post({ body }),
    })
  }
}
