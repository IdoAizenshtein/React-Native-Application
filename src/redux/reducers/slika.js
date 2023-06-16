import { createReducer } from '../reduxHelpers'
import { GET_SLIKA } from '../constants/slika'

export const slika = createReducer({}, {
  [GET_SLIKA.SUCCESS] (state, action) {
    return action.resp
  },
})
