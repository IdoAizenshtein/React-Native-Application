import React, {PureComponent} from 'react'
import AppTimezone from '../../utils/appTimezone'
import {cloneDeep, uniqueId} from 'lodash'
import {connect} from 'react-redux'
import {withTranslation} from 'react-i18next'
import {getAccountSortByDate, getAccountsWithCreditCards, getAccountsWithSlika} from 'src/redux/selectors/account'
import {getCreditCards} from 'src/redux/actions/card'

import CreditCardSliderItem from './components/CreditCardSlider/CreditCardSliderItem'
import CreditCardDataRow from './components/CreditCardDataRow'
import CreditCardAggregatedDataRow from './components/CreditCardAggregatedDataRow'
import CreditCardHeader from './components/CreditCardHeader'
import CreditCardModal from './components/CreditCardModal/CreditCardsModal'
import CreditCardAlertDetails from './components/CreditCardAlert/CreditCardAlertDetails'

import BaseCardsScreen from 'src/components/BaseCardsScreen/BaseCardsScreen'
import {
  createAccountCflTransTypeApi,
  creditCardCflAggregateDataApi,
  creditCardCflDataUpdateApi,
  creditCardCflDetailsApi,
  defineSearchkeyApi,
  removeAccountCflTransTypeApi,
} from 'src/api'
import {getListOfDatesInterval} from 'src/utils/date'
import {BackHandler} from 'react-native'
import {goToBack} from '../../utils/func'
import { setOpenedBottomSheet } from '../../redux/actions/user'

@connect(state => ({
  companies: state.companies,
  isRtl: state.isRtl,
  currentCompanyId: state.currentCompanyId,
  accounts: getAccountSortByDate(state),
  accountsWithCards: getAccountsWithCreditCards(state),
  accountsWithSlika: getAccountsWithSlika(state),
  creditCards: state.creditCards,
}))
@withTranslation()
export default class CreditCardsScreen extends PureComponent {
  constructor (props) {
    super(props)

    const dateTill = AppTimezone.moment().add(1, 'month').endOf('month')

    this.state = ({
      dateFromTimestamp: dateTill.clone().subtract(11, 'month').valueOf(),
      dateTillTimestamp: dateTill.valueOf(),
    })
  }

    getAggregatedDataBody = (cardIds) => {
      const { dateFromTimestamp, dateTillTimestamp } = this.state

      return {
        creditCardIds: cardIds,
        dateFrom: AppTimezone.moment(dateFromTimestamp).toISOString(),
        dateTill: AppTimezone.moment(dateTillTimestamp).toISOString(),
      }
    };

    getSelectedCards = (selectedCardIds) => {
      return this.props.creditCards.filter(c => selectedCardIds.includes(c.creditCardId))
    };

    getSelectedCardIds = () => {
      const paramsLink = this.props.route.params.paramsLink
      if (paramsLink && paramsLink.selectedAccountIds) {
        const creditCards = this.props.creditCards.filter(c => paramsLink.selectedAccountIds.includes(c.companyAccountId)).map(c => c.creditCardId)
        return creditCards
      } else {
        return this.props.creditCards.map(c => c.creditCardId)
      }
    };

    getAlertState = (selectedCards, selectedNotUpdatedCards, selectedLowCreditLimitCards, selectedNoCreditLimitCards) => {
      return {
        selectedCards: selectedCards,
        isOneOfOne: selectedCards.length === 1 && selectedNotUpdatedCards.length === 1,
        isOneOfMultiple: selectedCards.length > 1 && selectedNotUpdatedCards.length === 1,
        isMoreThenOneOfMultiple: selectedCards.length > 1 && selectedNotUpdatedCards.length > 1,

        isLowCreditLimit: !selectedNotUpdatedCards.length && selectedCards.length === 1 && selectedLowCreditLimitCards.length === 1,
        isLowCreditLimitIsOneOfMultiple: !selectedNotUpdatedCards.length && selectedCards.length > 1 && selectedLowCreditLimitCards.length === 1,
        isLowCreditLimitIsMoreThenOneOfMultiple: !selectedNotUpdatedCards.length && selectedCards.length > 1 && selectedLowCreditLimitCards.length > 1,

        isNoCreditLimit: !selectedNotUpdatedCards.length && selectedCards.length === 1 && selectedNoCreditLimitCards.length === 1,
        isNoCreditLimitIsOneOfMultiple: !selectedNotUpdatedCards.length && selectedCards.length > 1 && selectedNoCreditLimitCards.length === 1,
        isNoCreditLimitIsMoreThenOneOfMultiple: !selectedNotUpdatedCards.length && selectedCards.length > 1 && selectedNoCreditLimitCards.length > 1,
      }
    };

    getData = () => {
      const { dispatch, accounts } = this.props
      if (accounts && accounts.length) {
        return dispatch(getCreditCards(accounts))
      } else {
        return Promise.reject(new Error('fail'))
      }
    };

    getAggregateData = ({ body }) => {
      return creditCardCflAggregateDataApi.post({ body })
    };

    getCurrentData = (cardsData, currentCardSlideId) => {
      const { dateFromTimestamp, dateTillTimestamp } = this.state

      const data = cardsData.find(d => d.cardId === currentCardSlideId)
      if (!data) {return null}

      if (currentCardSlideId === null) {
        const TEMP_DATE_FORMAT = 'MM/YYYY'
        const newData = data.data.filter(d => d.cardDetails && d.cardDetails.length)
        const last12MonthList = getListOfDatesInterval(
          AppTimezone.moment(dateFromTimestamp),
          AppTimezone.moment(dateTillTimestamp),
          'months',
          TEMP_DATE_FORMAT,
        )
          .reduce((memo, date) => {
            const item = newData.find(d => AppTimezone.moment(d.month).format(TEMP_DATE_FORMAT) === date)
            if (item) {
              memo.push(item)
            } else {
              memo.push({
                _id: uniqueId(),
                month: AppTimezone.moment(date, TEMP_DATE_FORMAT).valueOf(),
                sumMonthlyTotal: null,
                cardDetails: [],
              })
            }
            return memo
          }, [])

        return {
          cardId: data.cardId,
          data: last12MonthList,
        }
      } else {
        return {
          cardId: data.cardId,
          data: data.data,
        }
      }
    };

    getLast12MonthData = (data = [], isOneCard) => {
      const { dateFromTimestamp, dateTillTimestamp } = this.state
      if (!data || !data.length) {return []}

      data = cloneDeep(data)

      const TEMP_DATE_FORMAT = 'MM/YYYY'
      if (isOneCard) {
        let last12MonthListArr = []

        const last12MonthList = getListOfDatesInterval(
          AppTimezone.moment(dateFromTimestamp),
          AppTimezone.moment(dateTillTimestamp),
          'months',
          TEMP_DATE_FORMAT,
        )

        last12MonthList.forEach((date, index) => {
          const items = data.filter((item) => AppTimezone.moment(item.month).format(TEMP_DATE_FORMAT) === date)
          if (items.length) {
            last12MonthListArr = last12MonthListArr.concat(items)
          } else {
            last12MonthListArr.push({
              _id: uniqueId(),
              month: AppTimezone.moment(date, TEMP_DATE_FORMAT).valueOf(),
              sumMonthlyTotal: 0,
              cardDetails: [],
            })
          }
        })

        return last12MonthListArr
      } else {
        const last12MonthList = getListOfDatesInterval(
          AppTimezone.moment(dateFromTimestamp),
          AppTimezone.moment(dateTillTimestamp),
          'months',
          TEMP_DATE_FORMAT,
        )
          .reduce((memo, date) => {
            memo[date] = {
              _id: uniqueId(),
              month: AppTimezone.moment(date, TEMP_DATE_FORMAT).valueOf(),
              sumMonthlyTotal: 0,
              cardDetails: [],
            }
            return memo
          }, {})

        return Object.values(data.reduce((memo, item) => {
          const date = AppTimezone.moment(item.month).format(TEMP_DATE_FORMAT)

          if (!memo.hasOwnProperty(date)) {return memo}

          memo[date] = {
            _id: item._id,
            month: item.month,
            sumMonthlyTotal: memo[date].sumMonthlyTotal + item.sumMonthlyTotal,
            cardDetails: [...memo[date].cardDetails, ...item.cardDetails].reduce((memo2, card) => {
              const oldIndex = memo2.findIndex(c => c.creditCardId === card.creditCardId)
              if (oldIndex >= 0) {
                memo2[oldIndex] = {
                  ...card,
                  monthlyTotal: memo2[oldIndex].monthlyTotal + card.monthlyTotal,
                  notFinal: memo2[oldIndex].notFinal || card.notFinal,
                }
              }

              memo2.push(card)

              return memo2
            }, []),
          }

          return memo
        }, last12MonthList))
      }
    };

    getCardsAggregatedDataBySections = (aggregatedData) => {
      return aggregatedData
        .reduce((memo, item) => {
          const title = AppTimezone.moment(item.month).format('MM/YYYY')
          const oldIndex = memo.findIndex(d => d.title === title)

          if (oldIndex > -1) {
            memo[oldIndex].data = memo[oldIndex].data.concat(item.cardDetails)
          } else {
            memo.push({ title, month: item.month, data: [...item.cardDetails] })
          }

          return memo
        }, [])
        .map(({ title, month, data }) => {
          return {
            title,
            month,
            data: data.reduce((memo, cardDetails) => {
              const card = this.props.creditCards.find(c => c.creditCardId === cardDetails.creditCardId)
              memo = memo.concat(cardDetails.monthlyTotal.map(d => {
                return {
                  _id: uniqueId(),
                  iskatHulNumber: d.iskatHulNumber,
                  currency: d.iskatHul,
                  monthlyTotal: d.total,
                  notFinal: d.notFinal,
                  creditCardId: cardDetails.creditCardId,
                  creditCardNickname: card ? card.creditCardNickname : '',
                }
              }))

              return memo
            }, [])
              .reduce((memo, monthlyTotal) => {
                const oldIndex = memo.findIndex(d => {
                  const isSameCard = d.creditCardId === monthlyTotal.creditCardId
                  const isSameCurrency = d.currency === monthlyTotal.currency
                  return isSameCard && isSameCurrency
                })

                if (oldIndex >= 0) {
                  memo[oldIndex] = {
                    ...monthlyTotal,
                    monthlyTotal: monthlyTotal.monthlyTotal + memo[oldIndex].monthlyTotal,
                    notFinal: memo[oldIndex].notFinal || monthlyTotal.notFinal,
                  }
                } else {
                  memo.push(monthlyTotal)
                }

                return memo
              }, []),
          }
        })
        .sort((a, b) => b.month - a.month)
    };

    getFormattedAggregatedData = (data, isOneCard) => {
      const dataAgr = []
      if (isOneCard) {
        data.forEach((parent, index) => {
          parent.cardDetails.forEach((monthlyTotal, index1) => {
            monthlyTotal.monthlyTotal.forEach((child, index2) => {
              dataAgr.push(JSON.parse(JSON.stringify(parent)))
              dataAgr[dataAgr.length - 1].cardDetails[index1].monthlyTotal = child
            })
          })
        })
      }

      const dataFilter = (isOneCard) ? dataAgr : data
      return dataFilter
        .sort((a, b) => a.month - b.month)
        .map(item => {
          return {
            ...item,
            _id: uniqueId(),
            cardDetails: item.cardDetails.map(d => ({ ...d, _id: uniqueId() })),
          }
        })
    };

    getDataForCarouselItem = (item, cardsData) => {
      return {
        account: this.props.accountsWithCards.find(a => a.companyAccountId === item.companyAccountId),
        data: cardsData.find(d => d.cardId === item.creditCardId),
      }
    };

    getDataForScrollItem = (item, selectedCards) => {
      const { accountsWithCards } = this.props

      const hasCardDetails = item.cardDetails.length > 0
      const currentCard = hasCardDetails
        ? selectedCards.find(c => c.creditCardId === item.cardDetails[0].creditCardId)
        : null
      const account = currentCard
        ? accountsWithCards.find(a => a.companyAccountId === currentCard.companyAccountId)
        : null

      return { account }
    };

    handleUpdateTrans = (newTransData, updateType) => {
      const { currentCompanyId } = this.props
      if (!updateType || updateType === 'only') {
        return creditCardCflDataUpdateApi.post({
          body: {
            ccardTransId: newTransData.ccardTransId,
            companyAccountId: newTransData.companyAccountId,
            transTypeId: newTransData.transTypeId,
            companyId: currentCompanyId,
            userDescription: newTransData.mainDesc || newTransData.mainDescription,
          },
        })
      } else {
        return defineSearchkeyApi.post({
          body: {
            bankTransId: null,
            ccardTransId: newTransData.ccardTransId,
            companyId: currentCompanyId,
            kvua: false,
            searchkeyId: newTransData.searchkeyId,
            transTypeId: newTransData.transTypeId,
            updateType: updateType,
          },
        }).then(() => {
          creditCardCflDataUpdateApi.post({
            body: {
              ccardTransId: newTransData.ccardTransId,
              companyAccountId: newTransData.companyAccountId,
              transTypeId: newTransData.transTypeId,
              companyId: currentCompanyId,
              userDescription: newTransData.mainDesc || newTransData.mainDescription,
            },
          })
        })
      }
    };

    handleRemoveCardTransCategory = (transTypeId) => {
      const { currentCompanyId } = this.props
      return removeAccountCflTransTypeApi.post({ body: { transTypeId, companyId: currentCompanyId } })
    };

    handleCreateCardTransCategory = (transTypeName) => {
      const { currentCompanyId } = this.props
      return createAccountCflTransTypeApi.post({
        body: {
          companyId: currentCompanyId,
          'transTypeId': null,
          transTypeName,
        },
      })
    };

    handleGetTransDetails = (creditCardIds = [], iskatHulNumber, timestamp) => {
      const { currentCompanyId } = this.props

      return creditCardCflDetailsApi.post({
        body: {
          companyId: currentCompanyId,
          creditCardIds,
          iskatHul: iskatHulNumber,
          dateFrom: AppTimezone.moment(timestamp).startOf('month').valueOf(),
          dateTill: AppTimezone.moment(timestamp).endOf('month').valueOf(),
        },
      })
    };

    addCard = () => {
      // goTo( this.props.navigation, SETTINGS, {
      //   paramsLinkAddCard: {
      //     addCard: CREDIT_CARDS_TAB,
      //   },
      // })
    };

    componentDidMount () {
      BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
    }

    componentWillUnmount () {
      if (this.props.route.params.paramsLink) {
        delete this.props.route.params.paramsLink
      }
      BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
    }

    handleBackPress = () => {
      this.props.dispatch(setOpenedBottomSheet(false))
      goToBack( this.props.navigation)
      return true
    };

    deleteParamsLink = () => {
      if (this.props.route.params.paramsLink) {
        delete this.props.route.params.paramsLink
      }
    };

    render () {
      const {
        dateFromTimestamp,
        dateTillTimestamp,
      } = this.state
      const { creditCards, isRtl, t, accountsWithCards, currentCompanyId, dispatch, navigation, companies } = this.props

      return (
        <BaseCardsScreen
          deleteParamsLink={this.deleteParamsLink}
          companies={companies}
          type={'Card'}
          addCard={this.addCard}
          navigation={navigation}
          isRtl={isRtl}
          isCreditCardScreen
          t={t}
          dispatch={dispatch}
          dateFrom={dateFromTimestamp}
          dateTill={dateTillTimestamp}
          onGetData={this.getData}
          currentCompanyId={currentCompanyId}
          onGetAggregateData={this.getAggregateData}
          aggregatedBody={this.getAggregatedDataBody}
          onGetTransDetails={this.handleGetTransDetails}
          getFormattedAggregatedData={this.getFormattedAggregatedData}
          getCardsAggregatedDataBySections={this.getCardsAggregatedDataBySections}
          getSelectedCards={this.getSelectedCards}
          selectedCardIds={this.getSelectedCardIds}
          getAlertState={this.getAlertState}
          getCarouselItemData={this.getDataForCarouselItem}
          getScrollItemData={this.getDataForScrollItem}
          getCurrentData={this.getCurrentData}
          getLast12MonthData={this.getLast12MonthData}
          cards={creditCards}
          accountsWithCards={accountsWithCards}
          onUpdateTrans={this.handleUpdateTrans}
          onRemoveCardTransCategory={this.handleRemoveCardTransCategory}
          onCreateCardTransCategory={this.handleCreateCardTransCategory}
          SliderItem={CreditCardSliderItem}
          Header={CreditCardHeader}
          Modal={CreditCardModal}
          Alert={CreditCardAlertDetails}
          DataRow={CreditCardDataRow}
          AggregatedDataRow={CreditCardAggregatedDataRow}
          onEdit={this.handlePopRowEditsModal}
        />
      )
    }
}
