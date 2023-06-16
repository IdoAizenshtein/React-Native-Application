import AppTimezone from '../../utils/appTimezone'
import { cloneDeep, uniqueId } from 'lodash'
import { createSelector } from 'reselect'
import { getCreditCards } from './creditCard'
import { getSlika } from './slika'
import {DEFAULT_PRIMARY_CURRENCY} from '../../constants/bank';

export const getAccounts = (state) => state.accounts
export const getAccountTodayTrans = (state) => state.accountTodayTrans
export const getAccountBankTrans = (state) => state.accountBankTrans
export const getAccountAggregatedData = (state) => state.accountAggregatedData
export const getToken = (state) => state.getToken

export const getAccount = createSelector(
  [getAccounts],
  (accounts) => {
    return cloneDeep(accounts)
      .map(a => {
        a._isUpdated = a.nonUpdateDays === 0
        return a
      })
  },
)

export const getAccountSortByDate = createSelector(
  [getAccounts],
  (accounts) => {
    return [...accounts]
      .sort((a, b) => {
        if (a.primaryAccount === b.primaryAccount) {
          return a.dateCreated -
            b.dateCreated
        }
        if (a.primaryAccount && !b.primaryAccount) {return -1}
        return 1
      })
  },
)

export const getAccountTodayTransAggregated = createSelector(
  [getAccountTodayTrans],
  (accountTodayTrans) => {
    if (!accountTodayTrans || !accountTodayTrans.length) {
      return {
        zhutTotal: 0,
        hovaTotal: 0,
        transDate: AppTimezone.moment().valueOf(),
      }
    }

    return accountTodayTrans.reduce((memo, trans) => {
      if (!memo.transDate && trans.transDate) {
        memo.transDate = trans.transDate
      }

      if (trans.hova) {
        memo.hovaTotal += trans.total
      } else {
        memo.zhutTotal += trans.total
      }

      return memo
    }, {
      zhutTotal: 0,
      hovaTotal: 0,
      transDate: AppTimezone.moment().valueOf(),
    })
  },
)

export const getAccountAggregatedDataWithIds = createSelector(
  [getAccountAggregatedData],
  (data) => {
    let dataCopy = cloneDeep(data)
    if (!dataCopy) {return null}

    dataCopy.forEach((acc) => {
      const newBankTrans = acc.accountTransactions.reduce((memo, trans) => {
        trans._id = uniqueId()
        const title = AppTimezone.moment(trans.transDate).format('YYYY')
        const oldIndex = memo.findIndex(item => item.title === title)

        if (oldIndex > -1) {
          memo[oldIndex].data.push(trans)
        } else {
          memo.push({
            title,
            data: [trans],
          })
        }
        return memo
      }, [])

      acc.accountTransactions = newBankTrans
    })

    return dataCopy
  },
)

export const getAccountGroups = createSelector(
  [getAccountSortByDate],
  (accounts) => {
    return cloneDeep(accounts)
      .map(a => {
        a._isUpdated = a.nonUpdateDays === 0
        return a
      })
      .reduce((memo, a) => {
        const currency = a.currency ? a.currency.toLowerCase() : DEFAULT_PRIMARY_CURRENCY
        memo[currency] = memo[currency] || []
        memo[currency].push(a)
        return memo
      }, {})
  },
)

export const getAccountsWithCreditCards = createSelector(
  [getAccountSortByDate, getCreditCards],
  (accounts, creditCards) => {
    return accounts.filter(
      a => creditCards.some(c => c.companyAccountId === a.companyAccountId))
  },
)

export const getAccountsWithSlika = createSelector(
  [getAccountSortByDate, getSlika],
  (accounts, slika) => {
    return accounts.filter(a => slika.solekDetails &&
      slika.solekDetails.some(c => c.companyAccountId === a.companyAccountId))
  },
)

export const getAccountBankTransBySections = createSelector(
  [getAccountBankTrans, getAccountTodayTrans],
  (bankTrans, todayTrans) => {
    const newBankTrans = bankTrans.reduce((memo, trans) => {
      const title = AppTimezone.moment(trans.transDate).format('DD/MM/YY')
      const oldIndex = memo.findIndex(item => item.title === title)

      if (oldIndex > -1) {
        memo[oldIndex].data.push(trans)
      } else {
        memo.push({
          title,
          data: [trans],
        })
      }

      return memo
    }, [])
      .sort((a, b) => b.data[0].transDate - a.data[0].transDate)

    if (!todayTrans || !todayTrans.length) {return newBankTrans}
    todayTrans.forEach(item => {
      item.isToday = true
    })
    return [
      {
        title: 'היום (לא סופי)',
        data: [...todayTrans],
      }, ...newBankTrans]
  },
)
