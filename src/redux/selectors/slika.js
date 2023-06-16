import { createSelector } from 'reselect'
import { cloneDeep, uniqueId } from 'lodash'

export const getSlika = (state) => state.slika

export const getSlikaWithIds = createSelector(
  [getSlika],
  (slika) => {
    if (!slika) {return {}}
    if (!slika.solekDetails) {return slika}

    const newSlika = cloneDeep(slika)
    newSlika.solekDetails = newSlika.solekDetails.map((item) => ({
      ...item,
      solekId: uniqueId('sokekId_'),
    }))
    return newSlika
  },
)

export const getSlikaDetails = createSelector(
  [getSlikaWithIds],
  (slika) => slika && slika.solekDetails ? slika.solekDetails : [],
)
