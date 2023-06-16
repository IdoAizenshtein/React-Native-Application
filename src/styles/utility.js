import { StyleSheet } from 'react-native'
import { capitalize } from 'lodash'
import { px } from '../utils/func'

const SIZES = [0, 2, 5, 10, 15, 30, 50, 100]
const DIRECTIONS = [
  { t: 'top' },
  { b: 'bottom' },
  { l: 'left' },
  { r: 'right' },
]
const RULES = [
  { m: 'margin' },
  { p: 'padding' },
]

const rules = RULES.reduce((memo, rule) => {
  const ruleKey = Object.keys(rule)[0]
  const tmpRules = DIRECTIONS.reduce((dMemo, direction) => {
    const directionKey = Object.keys(direction)[0]
    const resultRules = SIZES.reduce((sMemo, size, index) => {
      return {
        ...sMemo,
        [`${ruleKey}${directionKey}${index}`]: {
          [`${rule[ruleKey]}${capitalize(direction[directionKey])}`]: px(size),
        },
      }
    }, {})

    return { ...dMemo, ...resultRules }
  }, {})

  return { ...memo, ...tmpRules }
}, {})

export default StyleSheet.create({ ...rules })
