import { CURRENCIES } from './common'

export const BANK_ICONS = {
  2: { uri: require('BiziboxUI/assets/bank2.png') },
  4: { uri: require('BiziboxUI/assets/bank4.png') },
  9: { uri: require('BiziboxUI/assets/bank9.png') },
  10: { uri: require('BiziboxUI/assets/bank10.png') },
  11: { uri: require('BiziboxUI/assets/bank11.png') },
  12: { uri: require('BiziboxUI/assets/bank12.png') },
  13: { uri: require('BiziboxUI/assets/bank13.png') },
  14: { uri: require('BiziboxUI/assets/bank14.png') },
  17: { uri: require('BiziboxUI/assets/bank17.png') },
  20: { uri: require('BiziboxUI/assets/bank20.png') },
  26: { uri: require('BiziboxUI/assets/bank26.png') },
  31: { uri: require('BiziboxUI/assets/bank31.png') },
  46: { uri: require('BiziboxUI/assets/bank46.png') },
  52: { uri: require('BiziboxUI/assets/bank52.png') },
  54: { uri: require('BiziboxUI/assets/bank54.png') },
  68: { uri: require('BiziboxUI/assets/bank68.jpg') },
  90: { uri: require('BiziboxUI/assets/bank90.png') },
  122: { uri: require('BiziboxUI/assets/bank12.png') },
  126: { uri: require('BiziboxUI/assets/bank126.png') },
  157: { uri: require('BiziboxUI/assets/bank17.png') },
  158: { uri: require('BiziboxUI/assets/bank11.png') },
}

export const CREDIT_CARD_ICONS = {
  21: { uri: require('BiziboxUI/assets/card21.png') },
  22: { uri: require('BiziboxUI/assets/card22.png') },
  23: { uri: require('BiziboxUI/assets/card23.png') },
  24: { uri: require('BiziboxUI/assets/card24.png') },
  25: { uri: require('BiziboxUI/assets/card25.png') },
  26: { uri: require('BiziboxUI/assets/card26.png') },
}

export const SLIKA_ICONS = {
  80: { uri: require('BiziboxUI/assets/solek80.png') },
  81: { uri: require('BiziboxUI/assets/solek81.png') },
  82: { uri: require('BiziboxUI/assets/solek82.png') },
  83: { uri: require('BiziboxUI/assets/solek83.png') },
  88: { uri: require('BiziboxUI/assets/solek88.png') },
  87: { uri: require('BiziboxUI/assets/solek87.png') },
  89: { uri: require('BiziboxUI/assets/solek89.png') },
  90: { uri: require('BiziboxUI/assets/solek90.png') },
  91: { uri: require('BiziboxUI/assets/solek91.png') },
}

export const BANK_TOKEN_STATUS = {
  VALID: 0,
  VALIDPOALIMBAASAKIM: 0,
  TECHNICAL_PROBLEM: 1,
  INVALID_PASSWORD: 2,
  BLOCKED: 3,
  PASSWORD_EXPIRED: 4,
  PASSWORD_ABOUT_TO_EXPIRED: 5,
  IN_PROGRESS: 9,
  NEW: 10,
  OTP_REQUIRED: 12,
  AGREEMENT_REQUIRED: 17,
  SUSPENDED: 18,
  BANK_TRANS_LOAD: 100,
  CREDIT_CARD_LOAD: 101,
  CHECKS_LOAD: 102,
  DEPOSIT_LOAD: 103,
  LOAN_LOAD: 104,
  STANDING_ORDERS_LOAD: 105,
  FOREIGN_TRANS_LOAD: 106,
  MARCOD_REQUIRED: 157,
  DISCOD_REQUIRED: 158,
  INVALID_PASSWORD_AND_ACCESS: 999,
  ALMOST_DONE: 99,
}

export const BANK_TRANS_ICONS_NAME = {
  bankTransfer: 'bank',
  directDebit: 'desktop-ok',
  credit: 'credit',
  otherCredit: 'credit',
  slika: 'enter-card-alt',
  loans: 'portfolio',
  deposits: 'umbrella',
  bankfees: 'bank-ckeck',
  checks: 'check',
  other: 'graph-alt',
  cash: 'wallet',
}

export const DEFAULT_PRIMARY_CURRENCY = CURRENCIES.ILS

export const SCREEN_MODES = {
  details: 'details',
  aggregate: 'aggregate',
  inChecks: 'in-checks',
  outChecks: 'out-checks',
}

export const PASSWORD_RECOVERY_LINKS = {
  4: 'https://register.yahav.co.il/IBAdmin-SelfRegistration/additionalDetails.action',
  9: 'https://www.bankhadoar.co.il/#/Login/ResetPassword',
  10: 'https://www.leumi.co.il/ForgotPasswordUserRenewal/40966',
  11: 'https://start.telebank.co.il/apollo/core/templates/lobby/masterPage.html#/PWD_RESET',
  12: 'https://login.bankhapoalim.co.il/authenticate/logon?fmp=true',
  14: 'https://online.bankotsar.co.il/MatafRecoverPassword/index.jsp',
  17: 'https://start.telebank.co.il/apollo/core/templates/lobby/masterPage.html#/PWD_RESET',
  13: 'https://help.unionbank.co.il/SRVS/CGI-BIN/WEBCGI.EXE?St=363,E=0000000000251485172,K=1195,Sxi=9,new,t=meda_doactions,varset_option=0,varset_templ=meda_doactions',
  20: 'https://sc.mizrahi-tefahot.co.il/SCServicesClientEZ/index.html#/recoveryPassword?show=1',
  21: 'https://services.cal-online.co.il/card-holders/Screens/AccountManagement/PasswordRestoring.aspx',
  22: 'https://digital.isracard.co.il/personalarea/loginarea/#/ForgotPassword',
  23: '',
  24: 'https://online.leumi-card.co.il/Anonymous/RecoverPassword.aspx',
  25: 'https://he.americanexpress.co.il/personalarea/loginarea/#/ForgotPassword',
  31: 'https://online.fibi.co.il/MatafRecoverPassword/index.jsp',
  34: 'https://www.leumi.co.il/ForgotPasswordUserRenewal/40966',
  46: 'https://online.bankmassad.co.il/MatafRecoverPassword/index.jsp',
  52: 'https://online.pagi.co.il/MatafRecoverPassword/index.jsp',
  54: 'https://services.bankjerusalem.co.il/Pages/ResetPasswordNew.aspx',
  57: 'https://start.telebank.co.il/apollo/core/templates/lobby/masterPage.html#/PWD_RESET',
  58: 'https://start.telebank.co.il/apollo/core/templates/lobby/masterPage.html#/PWD_RESET',
  68: 'https://login.dexia-israel.co.il/heb/Personal/',
  80: 'https://businessinfo.leumi-card.co.il/NotRegistered/Login/RecoverPassword.aspx',
  81: 'https://services.cal-online.co.il/card-holders/Screens/AccountManagement/PasswordRestoring.aspx',
  82: 'https://service.isracard.co.il/newSupplier/restorePassword_tmpl.html',
  89: 'https://service.tzm.co.il/Account/ForgotPasswordStep1?Length=7',
  90: '',
  91: 'https://services.yatzil.co.il/online/screens/AccountManagement/RenewPassword.aspx',
  126: 'https://online.u-bank.net/MatafRecoverPassword/index.jsp',
  157: 'https://start.telebank.co.il/apollo/core/templates/lobby/masterPage.html#/PWD_RESET',
  158: 'https://start.telebank.co.il/apollo/core/templates/lobby/masterPage.html#/PWD_RESET',
}

export const BANK_CREDENTIALS_CONTROL_TYPES = {
  TEXT: 'TEXT',
  PASSWORD: 'PASSWORD',
}

export const BANK_CREDENTIAL_4 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 4, maximum: 16 },
      },
    },
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 9, maximum: 9 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 16 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_9 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 5, maximum: 10 },
      },
    },
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 9, maximum: 9 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 8, maximum: 15 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_10 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 5, maximum: 10 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 12 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_11 = {
  fields: [
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 9, maximum: 9 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userCode',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_12 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 16 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_13 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 12 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_14 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 8 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_17 = {
  fields: [
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 9, maximum: 9 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userCode',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_20 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 9, maximum: 10 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 15 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_31 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 8 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_46 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 8 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_52 = {
  fields: [

    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
  ],
}
export const BANK_CREDENTIAL_54 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_122 = {
  otp: true,
}

export const BANK_CREDENTIAL_126 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 10 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_157 = {
  // otp: true,
  // otpTypes: [
  //   {
  //     key: 'constant',
  //     validation: {
  //       presence: true,
  //       numericality: true,
  //       length: { minimum: 16, maximum: 16 },
  //     },
  //   },
  //   {
  //     key: 'application',
  //     validation: {
  //       presence: true,
  //       numericality: true,
  //       length: { minimum: 6, maximum: 6 },
  //     },
  //   },
  // ],
  fields: [
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 9, maximum: 9 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
  ],
}

export const BANK_CREDENTIAL_158 = {
  // otp: true,
  // otpTypes: [
  //   {
  //     key: 'constant',
  //     validation: {
  //       presence: true,
  //       numericality: true,
  //       length: { minimum: 16, maximum: 16 },
  //     },
  //   },
  //   {
  //     key: 'application',
  //     validation: {
  //       presence: true,
  //       numericality: true,
  //       length: { minimum: 6, maximum: 6 },
  //     },
  //   },
  // ],
  fields: [
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 9, maximum: 9 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 14 },
      },
    },
  ],
}

export const CREDIT_CARD_CREDENTIAL_21 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 4, maximum: 10 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 12 },
      },
    },
  ],
}

export const CREDIT_CARD_CREDENTIAL_22 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 9, maximum: 9 },
      },
    },
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 6, maximum: 6 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 20 },
      },
    },
  ],
}
export const CREDIT_CARD_CREDENTIAL_23 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        // numericality: true,
        length: { minimum: 9, maximum: 9 },
      },
    },
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 6, maximum: 6 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 20 },
      },
    },
  ],
}
export const CREDIT_CARD_CREDENTIAL_24 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 5, maximum: 20 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 8, maximum: 14 },
      },
    },
  ],
}
export const CREDIT_CARD_CREDENTIAL_25 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 9, maximum: 9 },
      },
    },
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 6, maximum: 6 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 20 },
      },
    },
  ],
}

export const SLIKA_CREDENTIAL_80 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 5, maximum: 20 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 14 },
      },
    },
  ],
}
export const SLIKA_CREDENTIAL_81 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 8, maximum: 8 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 10 },
      },
    },
  ],
}
export const SLIKA_CREDENTIAL_82 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 6, maximum: 18 },
      },
    },
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 3, maximum: 8 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 20 },
      },
    },
  ],
}
export const SLIKA_CREDENTIAL_89 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 4, maximum: 16 },
      },
    },
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 20 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 16 },
      },
    },
  ],
}
export const SLIKA_CREDENTIAL_90 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 4, maximum: 20 },
      },
    },
    {
      key: 'userId',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        numericality: true,
        length: { minimum: 4, maximum: 6 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 16 },
      },
    },
  ],
}
export const SLIKA_CREDENTIAL_91 = {
  fields: [
    {
      key: 'username',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.TEXT,
      validation: {
        presence: true,
        length: { minimum: 8, maximum: 8 },
      },
    },
    {
      key: 'userPassword',
      controlType: BANK_CREDENTIALS_CONTROL_TYPES.PASSWORD,
      validation: {
        presence: true,
        length: { minimum: 2, maximum: 10 },
      },
    },
  ],
}

export const BANK_CREDENTIALS_SCHEME = {
  4: BANK_CREDENTIAL_4,
  9: BANK_CREDENTIAL_9,
  10: BANK_CREDENTIAL_10,
  11: BANK_CREDENTIAL_11,
  12: BANK_CREDENTIAL_12,
  13: BANK_CREDENTIAL_13,
  14: BANK_CREDENTIAL_14,
  17: BANK_CREDENTIAL_17,
  20: BANK_CREDENTIAL_20,
  31: BANK_CREDENTIAL_31,
  46: BANK_CREDENTIAL_46,
  52: BANK_CREDENTIAL_52,
  54: BANK_CREDENTIAL_54,
  122: BANK_CREDENTIAL_122,
  126: BANK_CREDENTIAL_126,
  157: BANK_CREDENTIAL_157,
  158: BANK_CREDENTIAL_158,
  // 157: { ...BANK_CREDENTIAL_17, ...BANK_CREDENTIAL_157 },
  // 158: { ...BANK_CREDENTIAL_11, ...BANK_CREDENTIAL_158 },
}

export const CREDIT_CARDS_CREDENTIALS_SCHEME = {
  21: CREDIT_CARD_CREDENTIAL_21,
  22: CREDIT_CARD_CREDENTIAL_22,
  23: CREDIT_CARD_CREDENTIAL_23,
  24: CREDIT_CARD_CREDENTIAL_24,
  25: CREDIT_CARD_CREDENTIAL_25,
}

export const SLIKA_CREDENTIALS_SCHEME = {
  80: SLIKA_CREDENTIAL_80,
  81: SLIKA_CREDENTIAL_81,
  82: SLIKA_CREDENTIAL_82,
  89: SLIKA_CREDENTIAL_89,
  90: SLIKA_CREDENTIAL_90,
  91: SLIKA_CREDENTIAL_91,
}

export const ALL_BANK_CREDENTIALS_SCHEME = {
  ...BANK_CREDENTIALS_SCHEME,
  ...CREDIT_CARDS_CREDENTIALS_SCHEME,
  ...SLIKA_CREDENTIALS_SCHEME,
}
