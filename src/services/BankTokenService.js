import { BANK_TOKEN_STATUS } from 'src/constants/bank'

export default class BankTokenService {
  static isShouldTokenUpdatePassword (tokenStatus) {
    return [
      BANK_TOKEN_STATUS.INVALID_PASSWORD,
      BANK_TOKEN_STATUS.PASSWORD_EXPIRED,
      BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED,
      BANK_TOKEN_STATUS.BLOCKED,
      BANK_TOKEN_STATUS.MARCOD_REQUIRED,
      BANK_TOKEN_STATUS.DISCOD_REQUIRED,
    ]
      .includes(BankTokenService.getTokenStatusCode(tokenStatus))
  }

  static isTokenStatusProgressing (tokenStatus) {
    return [
      BANK_TOKEN_STATUS.NEW,
      BANK_TOKEN_STATUS.IN_PROGRESS,
      BANK_TOKEN_STATUS.BANK_TRANS_LOAD,
      BANK_TOKEN_STATUS.CREDIT_CARD_LOAD,
      BANK_TOKEN_STATUS.CHECKS_LOAD,
      BANK_TOKEN_STATUS.DEPOSIT_LOAD,
      BANK_TOKEN_STATUS.LOAN_LOAD,
      BANK_TOKEN_STATUS.STANDING_ORDERS_LOAD,
      BANK_TOKEN_STATUS.FOREIGN_TRANS_LOAD,
      BANK_TOKEN_STATUS.ALMOST_DONE,
    ]
      .includes(BankTokenService.getTokenStatusCode(tokenStatus))
  }

  static getCompletedPercentage (tokenStatus) {
    if (!tokenStatus || !BankTokenService.isTokenStatusProgressing(tokenStatus)) {return 0}

    tokenStatus = tokenStatus.toLowerCase()

    switch (tokenStatus) {
      case 'new':
      case 'inprogress':
      case BANK_TOKEN_STATUS.NEW:
      case BANK_TOKEN_STATUS.IN_PROGRESS:
        return 10
      case 'banktransLoad':
      case BANK_TOKEN_STATUS.BANK_TRANS_LOAD:
        return 20
      case 'creditcardload':
      case BANK_TOKEN_STATUS.CREDIT_CARD_LOAD:
        return 30
      case 'checksload':
      case BANK_TOKEN_STATUS.CHECKS_LOAD:
        return 40
      case 'depositload':
      case BANK_TOKEN_STATUS.DEPOSIT_LOAD:
        return 50
      case 'loanload':
      case BANK_TOKEN_STATUS.LOAN_LOAD:
        return 60
      case 'standingordersLoad':
      case BANK_TOKEN_STATUS.STANDING_ORDERS_LOAD:
        return 70
      case 'foreigntransload':
      case BANK_TOKEN_STATUS.FOREIGN_TRANS_LOAD:
        return 80
      default:
        return 0
    }
  }

  static getTokenStatusCode (tokenStatus) {
    if (!tokenStatus) {return ''}

    tokenStatus = tokenStatus.toLowerCase()

    switch (tokenStatus) {
      case 'valid':
      case 'valid_otp':
        return BANK_TOKEN_STATUS.VALID
      case 'loginfailed':
      case 'invalidpassword':
        return BANK_TOKEN_STATUS.INVALID_PASSWORD
      case 'technicalproblem':
        return BANK_TOKEN_STATUS.TECHNICAL_PROBLEM
      case 'blocked':
        return BANK_TOKEN_STATUS.BLOCKED
      case 'marcodrequired':
        return BANK_TOKEN_STATUS.MARCOD_REQUIRED
      case 'discodrequired':
        return BANK_TOKEN_STATUS.DISCOD_REQUIRED
      case 'otprequired':
        return BANK_TOKEN_STATUS.OTP_REQUIRED
      case 'expired':
      case 'passwordexpired':
        return BANK_TOKEN_STATUS.PASSWORD_EXPIRED
      case 'abouttoexpire':
      case 'passwordabottoexpired':
        return BANK_TOKEN_STATUS.PASSWORD_ABOUT_TO_EXPIRED
      case 'new':
        return BANK_TOKEN_STATUS.NEW
      case 'inprogress':
        return BANK_TOKEN_STATUS.IN_PROGRESS
      case 'banktransload':
        return BANK_TOKEN_STATUS.BANK_TRANS_LOAD
      case 'creditcardload':
        return BANK_TOKEN_STATUS.CREDIT_CARD_LOAD
      case 'checksload':
        return BANK_TOKEN_STATUS.CHECKS_LOAD
      case 'depositload':
        return BANK_TOKEN_STATUS.DEPOSIT_LOAD
      case 'loanload':
        return BANK_TOKEN_STATUS.LOAN_LOAD
      case 'standingordersload':
        return BANK_TOKEN_STATUS.STANDING_ORDERS_LOAD
      case 'foreigntransload':
        return BANK_TOKEN_STATUS.FOREIGN_TRANS_LOAD
      case 'invalidpassordandaccess':
      case 'invalidpasswordandaccess':
        return BANK_TOKEN_STATUS.INVALID_PASSWORD_AND_ACCESS
      case 'agreement_required':
        return BANK_TOKEN_STATUS.AGREEMENT_REQUIRED
      case 'suspended':
        return BANK_TOKEN_STATUS.SUSPENDED
      case 'validpoalimbaasakim':
        return BANK_TOKEN_STATUS.VALIDPOALIMBAASAKIM
      case 'almost_done':
        return BANK_TOKEN_STATUS.ALMOST_DONE
      default:
        return tokenStatus
    }
  }

  static getTokenStatusEnumKey (tokenStatus) {
    const code = BankTokenService.getTokenStatusCode(tokenStatus)
    return Object.keys(BANK_TOKEN_STATUS).find(k => BANK_TOKEN_STATUS[k] === code)
  }
}
