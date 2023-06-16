import { getAsyncActionTypes } from '../reduxHelpers'

export const LOGIN = getAsyncActionTypes('LOGIN')
export const OTP_LOGIN = getAsyncActionTypes('OTP_LOGIN')
export const RESET_PASSWORD = getAsyncActionTypes('RESET_PASSWORD')
export const CHANGE_PASSWORD = getAsyncActionTypes('CHANGE_PASSWORD')
export const GET_USER = getAsyncActionTypes('GET_USER')
export const GET_SEARCHKEY = getAsyncActionTypes('GET_SEARCHKEY')
export const GET_MESSAGES_COUNT = getAsyncActionTypes('GET_MESSAGES_COUNT')
export const SET_PUSH_NOTIFICATION_TOKEN = getAsyncActionTypes(
  'SET_PUSH_NOTIFICATION_TOKEN')
export const SEND_PUSH_NOTIFICATION_TOKEN = getAsyncActionTypes(
  'SEND_PUSH_NOTIFICATION_TOKEN')
export const SIGNUP_CREATE = getAsyncActionTypes('SIGNUP_CREATE')

export const LOGOUT = 'LOGOUT'
