import Api from './Api'

export const tokenApi = new Api({ endpoint: 'auth/token' })
export const otpTokenApi = new Api({ endpoint: 'auth/otp/code' })
export const smsApi = new Api({ endpoint: 'auth/otp/resend-sms' })
export const resetPasswordApi = new Api(
  { endpoint: 'auth/otp/reset-password' })
export const changePasswordApi = new Api({ endpoint: 'users/change-password' })
export const defaultUserScreenApi = new Api(
  { endpoint: 'users/default-user-for-screen' })
export const updateDefaultUserScreenApi = new Api(
  { endpoint: 'users/default-user-for-screen-update' })
export const updatePushNotificationData = new Api(
  { endpoint: 'users/update-push-data' })
export const updateAgreementConfirmationApi = new Api({ endpoint: 'users/update-agreement-confirmation' })
export const updateAgreementCompaniesConfirmationApi = new Api({ endpoint: 'companies/update-agreement-confirmation' })
export const userApi = new Api({ endpoint: 'users/current' })
export const hideTaryaPopupApi = new Api(
  { endpoint: 'users/hide-tarya-popup' })
export const getVersionApi = new Api({ endpoint: 'auth/version' })
export const createApiTokenApi = new Api(
  { endpoint: 'auth/otp/create-api-token' })
export const searchkeyApi = new Api({ endpoint: 'searchkey/searchkey-cat' })
export const companiesApi = new Api({ endpoint: 'companies' })
export const messagesCountApi = new Api({ endpoint: 'messages/cfl/count' })
export const messagesApi = new Api({ endpoint: 'messages/cfl' })
export const messagesUpdateApi = new Api(
  { endpoint: 'messages/cfl/user-read-update' })
export const tokenAlertApi = new Api({ endpoint: 'message/cfl/token-alert' })

export const accountCflApi = new Api({ endpoint: 'account/cfl' })
export const accountSettingCflApi = new Api(
  { endpoint: 'account/cfl/account-setting' })

export const accountDeletedCflApi = new Api(
  { endpoint: 'account/cfl/get-deleted-account' })
export const accountCflDataApi = new Api(
  { endpoint: 'account/cfl/bank-trans' })
export const accountCflDataUpdateApi = new Api(
  { endpoint: 'account/cfl/bank-trans-row-update' })
export const cashDetailsApi = new Api({ endpoint: 'account/cfl/cash-details' })
export const cashSplitApi = new Api({ endpoint: 'account/cfl/cash-split' })

export const defineSearchkeyApi = new Api(
  { endpoint: 'searchkey/define-searchkey' })
export const mutavCategoryUpdateApi = new Api(
  { endpoint: 'mutav/update-mutav-category' })

export const accountCflCheckDetailsApi = new Api(
  { endpoint: 'account/cfl/check-details' })
export const accountCflDataDetailApi = new Api(
  { endpoint: 'account/cfl/perut-bank-detail' })
export const accountCflTodayApi = new Api(
  { endpoint: 'account/cfl/bank-trans-peulot-today' })
export const accountCflAggregateDataApi = new Api(
  { endpoint: 'account/cfl/bank-trans/aggregate' })
export const accountCflChartDataApi = new Api(
  { endpoint: 'account/cfl/bank-trans/ballance-chart' })

export const getAccountCflTransTypeApi = new Api(
  { endpoint: 'account/cfl/trans-type' })
export const removeAccountCflTransTypeApi = new Api(
  { endpoint: 'account/cfl/trans-type-delete' })
export const createAccountCflTransTypeApi = new Api(
  { endpoint: 'account/cfl/trans-type-create' })
export const updateAccountCflTransTypeApi = new Api(
  { endpoint: 'account/cfl/trans-type-update' })
export const recoverAccountCflApi = new Api(
  { endpoint: 'account/cfl/undeleted-account' })
export const setAccountNameCflApi = new Api(
  { endpoint: 'account/cfl/set-account-nickname' })
export const setPrimaryAccountCflApi = new Api(
  { endpoint: 'account/cfl/account-set-primary' })
export const updateCheckCategoryApi = new Api(
  { endpoint: 'account/cfl/update-check-category' })

export const creditCardCflApi = new Api({ endpoint: 'credit-card/cfl' })
export const creditCardCflDetailsApi = new Api(
  { endpoint: 'credit-card/cfl/details' })
export const creditCardCflUpdateApi = new Api(
  { endpoint: 'credit-card/cfl/update' })
export const creditCardCflAggregateDataApi = new Api(
  { endpoint: 'credit-card/cfl/aggregate' })
export const updateCreditAccountApi = new Api(
  { endpoint: 'credit-card/cfl/update-credit-account' })
export const creditCardCflDataUpdateApi = new Api(
  { endpoint: 'credit-card/cfl/card-trans-row-update' })
export const getDeletedSolekApi = new Api(
  { endpoint: 'credit-card/cfl/get-deleted-solek' })
export const getDeletedCreditCardsApi = new Api(
  { endpoint: 'credit-card/cfl/get-deleted-credit-card' })
export const getHistoryCreditCardsApi = new Api(
  { endpoint: 'credit-card/cfl/history' })
export const getDeletedSolekSlikaApi = new Api(
  { endpoint: 'slika/cfl/get-deleted-solek' })

export const slikaCflApi = new Api({ endpoint: 'slika/cfl' })
export const slikaCflAggregateDataApi = new Api(
  { endpoint: 'slika/cfl/aggregate' })
export const getSlikaSummaryApi = new Api({ endpoint: 'slika/cfl/sum' })
export const slikaCflDetailsApi = new Api({ endpoint: 'slika/cfl/details' })
export const setSlikaDescApi = new Api(
  { endpoint: 'slika/cfl/set-solek-desc' })
export const updateSolekAccountApi = new Api(
  { endpoint: 'slika/cfl/update-solek-account' })

export const cashFlowAggregateDataApi = new Api(
  { endpoint: 'account/cfl/cash-flow/aggregate' })
export const cashFlowDetailsDataApi = new Api(
  { endpoint: 'account/cfl/cash-flow/details' })
export const cashFlowAggregateDataPerDayApi = new Api(
  { endpoint: 'account/cfl/cash-flow/trans-per-day' })
export const cashFlowBalanceChartDataApi = new Api(
  { endpoint: 'account/cfl/cash-flow/balance-chart' })

export const recommendationApi = new Api(
  { endpoint: 'payments/cfl/recommendation' })
export const existingCheckApi = new Api(
  { endpoint: 'checks/cfl/existing-cheque' })

export const getInChecksApi = new Api({ endpoint: 'checks/cfl/in-checks' })
export const getOutChecksApi = new Api({ endpoint: 'checks/cfl/out-checks' })

export const updateCheckRowApi = new Api(
  { endpoint: 'payments/cfl/payment-row-update/check' })

export const getCyclicTransApi = new Api({ endpoint: 'cyclic-trans/cfl' })
export const getCyclicTransRecommendationsApi = new Api(
  { endpoint: 'cyclic-trans/cfl/recommendations' })
export const cyclicSingelApi = new Api({ endpoint: 'cyclic-trans/cfl/single' })

export const removeRecommendationApi = new Api(
  { endpoint: 'cyclic-trans/cfl/recommendation/remove' })

export const restoreCyclicTransApi = new Api(
    { endpoint: 'cyclic-trans/cfl/restore' })
export const createRecommendationApi = new Api(
  { endpoint: 'cyclic-trans/cfl/create' })
export const approveRecommendationApi = new Api(
  { endpoint: 'cyclic-trans/cfl/recommendation-approve' })
export const cyclicTransHistoryApi = new Api(
  { endpoint: 'cyclic-trans/cfl/history' })
export const getRecommendationHistoryApi = new Api(
  { endpoint: 'cyclic-trans/cfl/recommendation/history' })
export const getBankMatchAccountApi = new Api(
  { endpoint: 'bank-match/cfl/bank-match-account' })
export const bankMatchDeleteApi = new Api(
  { endpoint: 'bank-match/cfl/bank-delete' })
export const bankMatchApi = new Api({ endpoint: 'bank-match/cfl/match' })
export const banktransForMatchApi = new Api(
  { endpoint: 'bank-match/cfl/banktrans-for-match' })
export const cashflowMatchApi = new Api(
  { endpoint: 'bank-match/cfl/cashflow-match' })
export const matchRestartApi = new Api(
  { endpoint: 'bank-match/cfl/match-restart' })

export const tokenTypeApi = new Api({ endpoint: 'token/cfl/:tokenType' })
export const createTokenTypeApi = new Api({ endpoint: 'token/cfl/create' })
export const updateTokenTypeApi = new Api({ endpoint: 'token/cfl/update' })
export const getStatusTokenTypeApi = new Api(
  { endpoint: 'token/cfl/token-get-status' })

export const getLoanDetailsApi = new Api(
  { endpoint: 'over-view/cfl/loan-details' })
export const getDepositDetailsApi = new Api(
  { endpoint: 'over-view/cfl/deposit-details' })

export const deleteRowLoanApi = new Api(
  { endpoint: 'over-view/cfl/delete-row-loan' })
export const deleteRowDepositApi = new Api(
  { endpoint: 'over-view/cfl/delete-row-deposit' })

export const usersActivityApi = new Api({ endpoint: 'users/mobile-activity' })

export const getCardcomClientApi = new Api(
  { endpoint: 'billing/get-cardcom-client' })
export const getUserBillingAccountsApi = new Api(
  { endpoint: 'billing/get_user_billing_accounts' })
export const getBillingAccountDetailsApi = new Api(
  { endpoint: 'billing/billing-account-details' })

export const accountDeleteApi = new Api(
  { endpoint: 'account/cfl/account-delete' })
export const activateUserApi = new Api({
  endpoint: 'users/activate',
  secure: false,
})

export const isEmailExists = new Api({
  endpoint: 'users/cfl/is-exists',
  secure: false,
})
export const updateLeadInfo = new Api({
  endpoint: 'users/cfl/update-lead-info',
  secure: false,
})
export const signupCreateApi = new Api({
  endpoint: 'auth/sign-up-create',
  secure: false,
})
export const skipToDemoCompany = new Api(
  { endpoint: 'users/cfl/update-lead-example' })

export const getCitiesApi = new Api({ endpoint: 'companies/get-cities' })
export const updateCompanyApi = new Api({ endpoint: 'companies/update' })
export const addCompanyApi = new Api({ endpoint: 'companies/add' })

export const sendActivationMailsApi = new Api(
  { endpoint: 'users/send-activation-mail' })
export const checkMailExistsApi = new Api({ endpoint: 'users/mail-check' })
export const updateUserMailApi = new Api({ endpoint: 'users/mail-update' })
export const getAlertTokensApi = new Api(
  { endpoint: 'token/cfl/get-alert-tokens' })

export const cardDeleteApi = new Api(
  { endpoint: 'credit-card/cfl/credit-card-delete' })
export const solekDeleteApi = new Api({ endpoint: 'slika/cfl/slika-delete' })
export const messagesUserSettingApi = new Api(
  { endpoint: 'messages/cfl/user-setting' })
export const messagesUserSettingUpdategApi = new Api(
  { endpoint: 'messages/cfl/user-setting-update' })
export const messagesUserSettingDefaultApi = new Api(
  { endpoint: 'messages/cfl/user-setting-default' })
export const userTimeToSendUpdApi = new Api(
  { endpoint: 'messages/cfl/user-time-to-send' })

export const getBillingHistoryApi = new Api(
  { endpoint: 'billing/get-billing-history' })
export const downloadInvoiceApi = new Api(
  { endpoint: 'billing/download-invoice' })
export const sendInvoiceMailApi = new Api(
  { endpoint: 'billing/send-invoice-mail' })
export const updateBillingAccountApi = new Api(
  { endpoint: 'billing/update-billing-account' })
export const getUnionDetApi = new Api(
  { endpoint: 'account/cfl/cash-flow/get-union-det' })

export const getUserSettingsApi = new Api({ endpoint: 'users/settings' })

export const updateUserApi = new Api({ endpoint: 'users/update' })
export const sendSmsApi = new Api({ endpoint: 'auth/otp/send-sms' })

export const turnOnTwoPhaseForUseApi = new Api(
  { endpoint: 'users/two-factor/on' })
export const turnOffTwoPhaseForUserApi = new Api(
  { endpoint: 'users/two-factor/off' })
export const getQuestionsAnswersApi = new Api(
  { endpoint: 'help/get-questions-answers' })
export const openTicketApi = new Api({ endpoint: 'help/open-ticket' })
export const getTermsApi = new Api({ endpoint: 'help/get-terms' })

export const getMutavApi = new Api({ endpoint: 'mutav/get-mutavim' })
export const createMutavApi = new Api({ endpoint: 'mutav/create-mutav' })
export const existingMutavApi = new Api({ endpoint: 'mutav/existing-mutav' })
export const updateMutavApi = new Api({ endpoint: 'mutav/update-mutav' })
export const updateMutavCategoryApi = new Api(
  { endpoint: 'mutav/update-mutav-category' })

export const cashFlowUnionBankDetApi = new Api(
  { endpoint: 'account/cfl/cash-flow/get-union-bankdetail' })
export const companyMutavDetailsApi = new Api(
  { endpoint: 'mutav/company-mutav-details' })
export const mutavHistoryApi = new Api({ endpoint: 'mutav/history' })
export const startBusinessTrialApi = new Api(
  { endpoint: 'companies/start-business-trial' })
export const customerServiceUpgradeApi = new Api(
  { endpoint: 'companies/start-business-trial' })

export const denyUpgradeApi = new Api({ endpoint: 'companies/deny-upgrade' })
export const approveUpgradeApi = new Api(
  { endpoint: 'companies/approve-upgrade' })
export const endBiziboxServiceApi = new Api(
  { endpoint: 'companies/end-bizibox-service' })
export const approveDowngradeApi = new Api(
  { endpoint: 'companies/approve-downgrade' })

export const getBudgetApi = new Api({ endpoint: 'budget/cfl/get-budget' })
export const updateBudgetPrcApi = new Api(
  { endpoint: 'budget/cfl/update-budget-prc' })
export const updateBudgetDetailsApi = new Api(
  { endpoint: 'budget/cfl/update-budget-details' })
export const deletedBudgetApi = new Api({ endpoint: 'budget/cfl/delete' })
export const getCategoriesApi = new Api(
  { endpoint: 'budget/cfl/get-categories' })
export const createBudgetApi = new Api(
  { endpoint: 'budget/cfl/create-budget' })
export const updateBudgetApi = new Api(
  { endpoint: 'budget/cfl/update-budget' })
export const keyHistoryApi = new Api({ endpoint: 'budget/cfl/key-history' })
export const removeKeyApi = new Api({ endpoint: 'budget/cfl/remove-key' })
export const createBudgetTransApi = new Api(
  { endpoint: 'budget/cfl/create-budget-trans' })
export const updateTransTypeApi = new Api(
  { endpoint: 'budget/cfl/update-trans-type' })
export const deleteBudgetTransApi = new Api(
  { endpoint: 'budget/cfl/delete-budget-trans' })
export const updateBudgetTransApi = new Api(
  { endpoint: 'budget/cfl/update-budget-trans' })

export const budgetPopUpApi = new Api({ endpoint: 'companies/budget-pop-up' })
export const oneAccountPopUpApi = new Api(
  { endpoint: 'companies/one-account-pop-up' })

export const companyDetailsApi = new Api({ endpoint: 'ocr/company-details' })
export const updateFavoriteApi = new Api({ endpoint: 'ocr/update-favorite' })
export const getUploadUrlApi = new Api({ endpoint: 'ocr/desktop/get-upload-url' })
export const getFoldersApi = new Api({ endpoint: 'ocr/get-folders' })
export const updateFolderNameApi = new Api(
  { endpoint: 'ocr/update-folder-name' })
export const deleteFolderApi = new Api({ endpoint: 'ocr/delete-folder' })
export const createFolderApi = new Api({ endpoint: 'ocr/create-folder' })
export const updateLastUseDateApi = new Api(
  { endpoint: 'ocr/update-last-use-date' })
export const countStatusApi = new Api({ endpoint: 'ocr/count-status' })
export const fileSearchApi = new Api({ endpoint: 'ocr/file-search' })
export const changeFileFolderApi = new Api(
  { endpoint: 'ocr/change-file-folder' })
export const deleteFileApi = new Api({ endpoint: 'ocr/delete-file' })
export const getDocumentStorageDataApi = new Api(
  { endpoint: 'ocr/get-invoice-link' })
export const updateFileNameApi = new Api({ endpoint: 'ocr/update-file-name' })

