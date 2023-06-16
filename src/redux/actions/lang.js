import { SET_LANG_DIRECTION } from '../constants/lang'

export function setLangDirection (isRtl) {
  return dispatch => {
    return dispatch({
      type: SET_LANG_DIRECTION,
      payload: isRtl,
    })
  }
}
