import {
    accountCflAggregateDataApi,
    accountCflApi,
    accountCflChartDataApi,
    accountCflDataApi,
    accountCflTodayApi,
    tokenTypeApi,
} from '../../api'
import {
    exampleCompany,
    GET_ACCOUNT_BALANCE_CHART_DATA,
    GET_ACCOUNT_DATA_AGGREGATE,
    GET_ACCOUNT_TODAY_TRANS,
    GET_ACCOUNTS,
    GET_BANK_TRANS,
    GET_TOKEN,
    SELECT_ACCOUNT,
    UPDATE_BANK_TRANS_IN_STORE,
} from '../constants/account'
import AppTimezone from '../../utils/appTimezone'
import {DEFAULT_PRIMARY_CURRENCY} from '../../constants/bank';

export function getAccounts(companyUuid = null) {
    return (dispatch, getState) => {
        const {currentCompanyId} = getState()
        let newCompanyId = companyUuid || currentCompanyId
        if (!newCompanyId) {
            return
        }

        return dispatch({
            type: GET_ACCOUNTS.START,
            async: accountCflApi.post({body: {uuid: newCompanyId}})
                .then(data => {
                    exampleCompany.isExample = data.exampleCompany
                    exampleCompany.companyId = newCompanyId

                    if (data.accounts && data.accounts.length) {
                        data.accounts.forEach(it => {
                            it.currency = it.currency ? it.currency.toLowerCase() : DEFAULT_PRIMARY_CURRENCY
                        })
                    }
                    if (data.exampleCompany) {
                        dispatch(getTokenType(newCompanyId))
                    }
                    return data.accounts || []
                }),
        })
    }
}

export function getTokenType(newCompanyId) {
    return dispatch => {
        return dispatch({
            type: GET_TOKEN.START,
            async: tokenTypeApi.post({
                pathParams: {tokenType: 'ACCOUNT'},
                body: {uuid: newCompanyId},
            }).then(data => {
                return data
            }),
        })
    }
}

export function selectAccounts(selectedAccountIds = []) {
    return dispatch => {
        return dispatch({
            type: SELECT_ACCOUNT,
            payload: selectedAccountIds,
        })
    }
}

export function getAccountAggregateData({companyId, companyAccountIds, dateFrom, dateTill}) {
    return dispatch => {
        const body = {
            accountShowOnly: [],
            accountToSum: companyAccountIds,
            companyId,
            dateFrom,
            dateTill,
        }
        return dispatch({
            type: GET_ACCOUNT_DATA_AGGREGATE.START,
            async: accountCflAggregateDataApi.post({body})
                .then(data => data),
        })
    }
}

export function getAccountTodayTransData({companyId, companyAccountIds}) {
    return dispatch => {
        const date = AppTimezone.moment().valueOf()
        const body = {
            companyAccountIds,
            companyId,
            dateFrom: date,
            dateTill: date,
        }

        return dispatch({
            type: GET_ACCOUNT_TODAY_TRANS.START,
            async: accountCflTodayApi.post({body}),
        })
    }
}

export function getAccountBalanceChartData({companyAccountIds, dateFrom, dateTill}) {
    return dispatch => {
        return dispatch({
            type: GET_ACCOUNT_BALANCE_CHART_DATA.START,
            async: accountCflChartDataApi.post({
                body: {
                    companyAccountIds,
                    dateFrom,
                    dateTill,
                },
            }),
        })
    }
}

export function getAccountBankTrans({companyAccountIds, companyId, dateFrom, dateTill}) {
    return dispatch => {
        const body = {
            companyAccountIds,
            companyId,
            dateFrom,
            dateTill,
        }

        return dispatch({
            type: GET_BANK_TRANS.START,
            async: accountCflDataApi.post({body})
                .then(res => {
                    if (res && res.bankTransList) {
                        return res.bankTransList
                    }
                    return []
                }),
        })
    }
}

export function updateBankTrans(newBankTrans) {
    return (dispatch, getState) => {
        if (!newBankTrans || !newBankTrans.bankTransId) {
            return
        }
        const {accountBankTrans} = getState()

        const oldIndex = accountBankTrans.findIndex(
            t => t.bankTransId === newBankTrans.bankTransId)
        if (oldIndex < 0) {
            return
        }
        const newData = [...accountBankTrans]
        newData[oldIndex] = {...newData[oldIndex], ...newBankTrans}

        return dispatch({
            type: UPDATE_BANK_TRANS_IN_STORE,
            payload: newData,
        })
    }
}
