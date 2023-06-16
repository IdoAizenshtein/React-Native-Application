import { createReducer } from '../reduxHelpers'
import { SET_LANG_DIRECTION } from '../constants/lang'

export const isRtl = createReducer(true, {
  [SET_LANG_DIRECTION] (state, action) {
    return action.payload
  },
})
