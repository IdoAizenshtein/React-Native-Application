import { cloneDeep } from 'lodash'
import { creditCardCflApi } from 'src/api'
import { GET_CREDIT_CARDS, UPDATE_CREDIT_LIMIT } from '../constants/card'

export function getCreditCards (accounts) {
  return dispatch => {
    if (!accounts || !accounts.length) {return}
    const body = accounts.map(a => ({ uuid: a.companyAccountId }))

    return dispatch({
      type: GET_CREDIT_CARDS.START,
      async: creditCardCflApi.post({ body }),
    })
  }
}

export function updateCreditLimit (creditCard) {
  return (dispatch, getState) => {
    if (!creditCard) {return}
    const state = getState()
    const newCreditCards = cloneDeep(state.creditCards)
    const oldIndex = newCreditCards.findIndex(
      c => c.creditCardId === creditCard.creditCardId)
    if (oldIndex > -1) {
      newCreditCards[oldIndex] = { ...creditCard }
    }
    return dispatch({
      type: UPDATE_CREDIT_LIMIT,
      payload: newCreditCards,
    })
  }
}
