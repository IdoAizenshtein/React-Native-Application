import {
  CHANGE_PASSWORD,
  GET_MESSAGES_COUNT,
  GET_SEARCHKEY,
  GET_USER,
  LOGIN,
  LOGOUT,
  OTP_LOGIN,
  RESET_PASSWORD,
  SIGNUP_CREATE,
} from '../constants/auth'

import { createReducer } from '../reduxHelpers'

export function token (state = null, action) {
  switch (action.type) {
    case LOGIN.SUCCESS:
    case RESET_PASSWORD.SUCCESS:
    case CHANGE_PASSWORD.SUCCESS:
    case SIGNUP_CREATE.SUCCESS:
      return action.resp.token

    case OTP_LOGIN.SUCCESS:
      return (action.resp.token === 'Incorrect one time token code')
        ? state
        : action.resp.token

    case LOGOUT:
      return null

    default:
      return state
  }
}

export function user (state = {}, action) {
  switch (action.type) {
    case GET_USER.SUCCESS:
      return action.resp
    default:
      return state
  }
}

export function searchkey (state = {}, action) {
  switch (action.type) {
    case GET_SEARCHKEY.SUCCESS:
      return action.resp
    default:
      return state
  }
}

export const messagesCount = createReducer(0, {
  [GET_MESSAGES_COUNT.SUCCESS] (state, action) {
    return parseInt(action.resp, 10)
  },
})
