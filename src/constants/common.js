import { Platform } from 'react-native'

export const IS_IOS = Platform.OS === 'ios'

export const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY'

export const USER_SCREENS = {
  bankAccountMobile: 'bankAccountMobile',
  cashFlowMobile: 'cashFlowMobile',
  checksMobile: 'checksMobile',
  shouldHandleBackground: true,
}

export const CURRENCIES = {
  ILS: 'ils',
  USD: 'usd',
  CAD: 'cad',
  EUR: 'eur',
  GBP: 'gbp',
}

export const TRANS_CATEGORY_ICON_BY_TYPE = {
  default: 'edit',
  'Bills': 'paper-roll',
  'Office expenses': 'calc',
  'Loans': 'safe',
  'Institutions': 'bank-alt',
  'Revenue from sales': 'NONE',
  'Computing expenses': 'desktop-alt',
  'Salaries': 'people',
  'Bank fees': 'bank-ckeck',
  'Car expenses': 'car',
  'Communication expenses': 'NONE',
  'rent': 'key',
  'No category': 'graph-alt',
}
