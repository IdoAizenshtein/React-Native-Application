import { isEmpty } from 'lodash'
import {
  GET_DEFAULT_USER_SCREEN,
  GLOBAL_PARAMS,
  SET_IF_OPEN_BOTTOM_SHEET,
  SET_REMEMBER_ME,
  SET_SHOW_POP_ADD_CASH,
  SET_SHOW_POP_ADD_CHECK,
  SET_SHOW_POP_ADD_TRANS,
  SET_TIMES_OF_MUTAVIM,
  SET_TIMES_OF_TARYE,
  UPDATE_DEFAULT_USER_SCREEN,
} from '../constants/user'
import { defaultUserScreenApi, updateDefaultUserScreenApi } from '../../api'
import { SCREEN_MODES } from '../../constants/bank'

export function updateDefaultUserScreen (screenName, displayMode) {
  return dispatch => {
    const body = {
      screenName,
      displayMode,
      numberOfRowsPerTable: null,
    }

    return dispatch({
      type: UPDATE_DEFAULT_USER_SCREEN.START,
      async: updateDefaultUserScreenApi.post({ body })
        .then(() => ({
          displayMode,
          screenName,
        })),
    })
  }
}

export function getDefaultUserScreen (screenName) {
  return dispatch => {
    return dispatch({
      type: GET_DEFAULT_USER_SCREEN.START,
      async: defaultUserScreenApi.post({ body: { screenName } })
        .then(res => {
          if (!res || isEmpty(res)) {
            return {
              displayMode: ((screenName !== 'checksMobile')
                ? SCREEN_MODES.aggregate
                : SCREEN_MODES.inChecks),
              screenName,
            }
          }
          return res
        }),
    })
  }
}

export function setPopAddCheckShow (show) {
  return dispatch => {
    return dispatch({
      type: SET_SHOW_POP_ADD_CHECK,
      payload: show,
    })
  }
}

export function setPopAddCreateTranShow (show) {
  return dispatch => {
    return dispatch({
      type: SET_SHOW_POP_ADD_TRANS,
      payload: show,
    })
  }
}

export function setPopAddCashShow (show) {
  return dispatch => {
    return dispatch({
      type: SET_SHOW_POP_ADD_CASH,
      payload: show,
    })
  }
}

export function setRememberMe (boolMark) {
  return dispatch => {
    return dispatch({
      type: SET_REMEMBER_ME,
      payload: boolMark,
    })
  }
}

export function setTaryePopupTimes (times) {
  return dispatch => {
    return dispatch({
      type: SET_TIMES_OF_TARYE,
      payload: times,
    })
  }
}

export function setMutavimScreenBottomSheetTimes (times) {
  return dispatch => {
    return dispatch({
      type: SET_TIMES_OF_MUTAVIM,
      payload: times,
    })
  }
}

export function setOpenedBottomSheet (show) {
  return dispatch => {
    return dispatch({
      type: SET_IF_OPEN_BOTTOM_SHEET,
      payload: show,
    })
  }
}

export function setGlobalParams (params) {
  return dispatch => {
    return dispatch({
      type: GLOBAL_PARAMS,
      payload: params,
    })
  }
}
