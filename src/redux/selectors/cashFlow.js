import { cloneDeep } from 'lodash'
import AppTimezone from 'src/utils/appTimezone'
import { createSelector } from 'reselect'

export const getCashFlowDetailsData = (state) => state.cashFlowDetailsData
export const getCashFlowAggregatedData = (state) => state.cashFlowAggregatedData

export const getCashFlowDetailsDataBySections = createSelector(
  [getCashFlowDetailsData],
  (cashFlowDetailsData) => {
    if (cashFlowDetailsData && cashFlowDetailsData.cashFlowDetails) {
      cashFlowDetailsData.cashFlowDetails = cashFlowDetailsData.cashFlowDetails.reduce(
        (memo, trans, currentIndex) => {
          const title = AppTimezone.moment(trans.transDate).format('DD/MM/YY')
          const oldIndex = memo.findIndex(item => item.title === title)

          if (oldIndex > -1) {
            memo[oldIndex].data.push(trans)
          } else {
            let first = false
            if (currentIndex === 0) {
              first = true
            }
            // if (memo.length) {
            //   memo[memo.length - 1].total = memo[memo.length - 1].data.reduce((total, num) => {
            //     return total + num.total
            //   }, 0)
            // }
            memo.push({
              first,
              title,
              data: [trans],
            })
          }

          // if (currentIndex + 1 === cashFlowDetailsData.cashFlowDetails.length) {
          //   if (memo.length) {
          //     memo[memo.length - 1].total = memo[memo.length - 1].data.reduce((total, num) => {
          //       return total + num.total
          //     }, 0)
          //   }
          // }
          return memo
        }, [])
        .sort((a, b) => a.data[0].transDate - b.data[0].transDate)
    }
    return cashFlowDetailsData
  },
)

export const cashFlowAggregatedCalculateNigrarot = createSelector(
  [getCashFlowAggregatedData],
  (cashFlowAggregatedData) => {
    const accountUuidAll = cashFlowAggregatedData ? cashFlowAggregatedData.find(
      d => d.accountUuid === null) : null
    if (!cashFlowAggregatedData || !accountUuidAll ||
      (accountUuidAll && !accountUuidAll.accountTransactions)) {
      return null
    }

    const newData = cloneDeep(accountUuidAll)

    newData.accountTransactions[0].hova = newData.accountTransactions[0].hova -
      newData.hovaNigrarot
    newData.accountTransactions[0].zhut = newData.accountTransactions[0].zhut -
      newData.zhutNigrarot

    if (newData.accountTransactions[0].transDate) {
      const daysBetween = AppTimezone.moment()
        .diff(AppTimezone.moment(newData.accountTransactions[0].transDate),
          'days')
      newData.accountTransactions[0].isTodaySummary = (daysBetween === 0)
    }

    if (newData.hovaNigrarot !== 0 || newData.zhutNigrarot !== 0) {
      newData.accountTransactions.unshift({
        hova: newData.hovaNigrarot,
        itra: null,
        totalCredit: null,
        transDate: null,
        zhut: newData.zhutNigrarot,
      })
    }

    return newData
  },
)
