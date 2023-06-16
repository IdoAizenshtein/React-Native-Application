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
import { createReducer } from '../reduxHelpers'

export const bankAccountScreenMode = createReducer(null, {
  [GET_DEFAULT_USER_SCREEN.SUCCESS] (state, action) {
    return action.resp.displayMode
  },
  [UPDATE_DEFAULT_USER_SCREEN.SUCCESS] (state, action) {
    return action.resp.displayMode
  },
})

export const cashFlowScreenMode = createReducer(null, {
  [GET_DEFAULT_USER_SCREEN.SUCCESS] (state, action) {
    return action.resp.displayMode
  },
  [UPDATE_DEFAULT_USER_SCREEN.SUCCESS] (state, action) {
    return action.resp.displayMode
  },
})

export const isPopAddCheckShow = createReducer(true, {
  [SET_SHOW_POP_ADD_CHECK] (state, action) {
    return action.payload
  },
})
export const isPopAddCreateTransShow = createReducer(true, {
  [SET_SHOW_POP_ADD_TRANS] (state, action) {
    return action.payload
  },
})

export const rememberMe = createReducer(true, {
  [SET_REMEMBER_ME] (state, action) {
    return action.payload
  },
})

export const taryePopupTimes = createReducer(0, {
  [SET_TIMES_OF_TARYE] (state, action) {
    return action.payload
  },
})

export const isPopAddCashShow = createReducer(true, {
  [SET_SHOW_POP_ADD_CASH] (state, action) {
    return action.payload
  },
})

export const mutavimPopupTimes = createReducer(0, {
  [SET_TIMES_OF_MUTAVIM] (state, action) {
    return action.payload
  },
})

export const openedBottomSheet = createReducer(false, {
  [SET_IF_OPEN_BOTTOM_SHEET] (state, action) {
    return action.payload
  },
})

export const globalParams = createReducer({}, {
  [GLOBAL_PARAMS] (state, action) {
    return action.payload
  },
})
