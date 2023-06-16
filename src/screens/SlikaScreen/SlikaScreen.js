import React, { PureComponent } from 'react'
import { BackHandler } from 'react-native'
import { connect } from 'react-redux'
import AppTimezone from '../../utils/appTimezone'
// import { uniqueId } from 'lodash'
import { getSlika } from '../../redux/actions/slika'
import {
  getAccountSortByDate,
  getAccountsWithSlika,
} from '../../redux/selectors/account'
import { getSlikaDetails, getSlikaWithIds } from '../../redux/selectors/slika'
import {
  getSlikaSummaryApi,
  slikaCflAggregateDataApi,
  slikaCflDetailsApi,
} from '../../api'
import { getListOfDatesInterval } from '../../utils/date'

import SlikaHeader from './components/SlikaHeader'
import SlikaSliderItem from './components/SlikaSlider/SlikaSliderItem'
import SlikaModal from './components/SlikaModal/SlikaModal'
import SlikaDataRow from './components/SlikaDataRow'
import SlikaAggregatedDataRow from './components/SlikaAggregatedDataRow'
import SlikaAlertDetails from './components/SlikaAlert/SlikaAlertDetails'
import BaseCardsScreen from '../../components/BaseCardsScreen/BaseCardsScreen'
import { withTranslation } from 'react-i18next'
import { goToBack } from '../../utils/func'
import { setOpenedBottomSheet } from '../../redux/actions/user'

@connect(state => ({
  companies: state.companies,
  isRtl: state.isRtl,
  currentCompanyId: state.currentCompanyId,
  accounts: getAccountSortByDate(state),
  accountsWithSlika: getAccountsWithSlika(state),
  slika: getSlikaWithIds(state),
  cards: getSlikaDetails(state),
}))
@withTranslation()
export default class SlikaScreen extends PureComponent {
  constructor (props) {
    super(props)

    this.state = ({
      dateFromTimestamp: AppTimezone.moment()
        .subtract(8, 'month')
        .startOf('month')
        .valueOf(),
      dateTillTimestamp: AppTimezone.moment().add(3, 'month').endOf('month'),
    })
  }

  get aggregatedFutureBalance () {
    return this.props.slika.futureBallance
  }

  get aggregatedFutureCharges () {
    return this.props.slika.futureCharges
  }

  get aggregatedFutureCredits () {
    return this.props.slika.futureCredits
  }

  getAggregatedDataBody = (cardIds) => {
    const currentCards = this.props.cards.filter(
      c => cardIds.some(id => c.solekId === id))
    const accountIds = currentCards.map(c => c.companyAccountId)
    const solekNums = currentCards.map(c => c.solekNum)

    const { dateFromTimestamp, dateTillTimestamp } = this.state

    if (this.props.route.params.paramTo) {
      const params = {
        companyAccountIds: [],
        solekNums,
      }
      if (this.props.route.params.paramTo === 'SlikaTwoMonths') {
        params.dateFrom = AppTimezone.moment()
          .subtract(2, 'month')
          .startOf('month')
          .toISOString()
        params.dateTill = AppTimezone.moment()
          .subtract(1, 'month')
          .endOf('month')
          .toISOString()
      } else if (this.props.route.params.paramTo === 'SlikaThirteenMonths') {
        params.dateFrom = AppTimezone.moment()
          .subtract(13, 'month')
          .startOf('month')
          .toISOString()
        params.dateTill = AppTimezone.moment()
          .subtract(1, 'month')
          .endOf('month')
          .toISOString()
      }
      delete this.props.route.params.paramTo
      getSlikaSummaryApi.post({ body: params })
        .then(data => {
        })
    }

    return {
      companyAccountIds: accountIds,
      dateFrom: AppTimezone.moment(dateFromTimestamp).toISOString(),
      dateTill: AppTimezone.moment(dateTillTimestamp).toISOString(),
      solekNums,
    }
  }

  getCurrentData = (cardsData, currentCardSlideId) => {
    const { dateFromTimestamp, dateTillTimestamp } = this.state

    const TEMP_DATE_FORMAT = 'MM/YYYY'
    const data = cardsData.find(d => d.cardId === currentCardSlideId)
    if (!data) {return null}
    const newData = data.data.filter(
      d => d.soleksTotals && d.soleksTotals.length)
    const last12MonthList = getListOfDatesInterval(
      AppTimezone.moment(dateFromTimestamp),
      AppTimezone.moment(dateTillTimestamp),
      'months',
      TEMP_DATE_FORMAT,
    )
      .reduce((memo, date) => {
        const item = newData.find(
          d => AppTimezone.moment(d.month).format(TEMP_DATE_FORMAT) === date)
        if (item) {
          memo.push(item)
        } else {
          memo.push({
            _id: '_' + Math.random().toString(36).substr(2, 9),
            month: AppTimezone.moment(date, TEMP_DATE_FORMAT).valueOf(),
            sumMonthlyTotal: null,
            soleksTotals: [],
          })
        }
        return memo
      }, [])
    return {
      cardId: data.cardId,
      data: last12MonthList,
    }
  }

  getLast12MonthData = (data = []) => {
    const { dateFromTimestamp, dateTillTimestamp } = this.state
    const { accounts } = this.props

    if (!data || !data.length) {return []}

    const TEMP_DATE_FORMAT = 'MM/YYYY'

    const last12MonthList = getListOfDatesInterval(
      AppTimezone.moment(dateFromTimestamp),
      AppTimezone.moment(dateTillTimestamp),
      'months',
      TEMP_DATE_FORMAT,
    )
      .reduce((memo, date) => {
        memo[date] = {
          month: AppTimezone.moment(date, TEMP_DATE_FORMAT).valueOf(),
          sumMonthlyTotal: 0,
          soleksTotals: [],
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
        soleksTotals: [...memo[date].soleksTotals, ...item.soleksTotals].reduce(
          (memo2, card) => {
            const account = accounts.find(
              a => a.companyAccountId === card.companyAccountIds[0])
            const oldIndex = memo2.findIndex(c => c.solekId === card.solekId)
            if (oldIndex >= 0) {
              memo2[oldIndex] = {
                ...card,
                account: account,
                monthlyTotal: memo2[oldIndex].monthlyTotal + card.monthlyTotal,
                notFinal: memo2[oldIndex].notFinal || card.notFinal,
              }
            }

            card.account = account
            memo2.push(card)

            return memo2
          }, []),
      }

      return memo
    }, last12MonthList))
  }

  getData = () => {
    const { dispatch, accounts } = this.props
    if (accounts && accounts.length) {
      return dispatch(getSlika(accounts))
    } else {
      return Promise.reject(new Error('fail'))
    }
  }

  getAggregateData = ({ body }) => {
    return slikaCflAggregateDataApi.post({ body })
  }

  getSelectedCards = (selectedCardIds) => {
    return this.props.cards.filter(c => selectedCardIds.includes(c.solekId))
  }

  getSelectedCardIds = () => {
    return this.props.cards.map(c => c.solekId)
  }

  handleGetTransDetails = ({ companyAccounts, solekNums }, timestamp) => {
    return slikaCflDetailsApi.post({
      body: {
        companyAccounts: companyAccounts[0],
        dateFrom: AppTimezone.moment(timestamp).startOf('month').valueOf(),
        dateTill: AppTimezone.moment(timestamp).endOf('month').valueOf(),
        solekNums,
      },
    })
  }

  getCardsAggregatedDataBySections = (aggregatedData) => {
    const { accounts, cards } = this.props

    return aggregatedData
      .reduce((memo, item) => {
        const title = AppTimezone.moment(item.month).format('MM/YYYY')
        const oldIndex = memo.findIndex(d => d.title === title)

        if (oldIndex > -1) {
          memo[oldIndex].data = memo[oldIndex].data.concat(item.soleksTotals)
        } else {
          memo.push({
            title,
            month: item.month,
            sumMonthlyTotal: item.sumMonthlyTotal,
            data: [...item.soleksTotals],
          })
        }

        return memo
      }, [])
      .map(({ title, month, data, sumMonthlyTotal }) => {
        return {
          title,
          month,
          sumMonthlyTotal,
          data: data.reduce((memo, soleksTotals) => {
            const oldIndex = memo.findIndex(
              c => c.companyAccountId === soleksTotals.companyAccountIds[0])
            const account = accounts.find(
              a => a.companyAccountId === soleksTotals.companyAccountIds[0])

            if (oldIndex > -1) {
              memo[oldIndex] = {
                ...memo[oldIndex],
                account: account,
                currency: account ? account.currency : null,
                monthlyTotal: soleksTotals.monthlyTotal +
                  memo[oldIndex].monthlyTotal,
                notFinal: memo[oldIndex].notFinal || soleksTotals.notFinal,
                solekBankId: cards.find((item) => item.solekNum ===
                  soleksTotals.solekNum).solekBankId,
              }
            } else {
              soleksTotals.solekBankId = cards.find(
                (item) => item.solekNum === soleksTotals.solekNum).solekBankId
              memo.push({
                ...soleksTotals,
                currency: account ? account.currency : null,
                account: account,
              })
            }

            return memo
          }, []),
        }
      })
      .sort((a, b) => b.month - a.month)
  }

  getDataForScrollItem = (item, selectedCards) => {
    const { accountsWithSlika } = this.props
    const hasCardDetails = item.soleksTotals.length > 0
    const currentCard = hasCardDetails
      ? selectedCards.find(c => c.solekId === item.soleksTotals[0].solekId)
      : null
    const account = currentCard
      ? accountsWithSlika.find(
        a => a.companyAccountId === currentCard.companyAccountId)
      : null

    return { account }
  }

  getFormattedAggregatedData = (data) => {
    return data
      .sort((a, b) => a.month - b.month)
      .map(item => {
        return {
          ...item,
          _id: '_' + Math.random().toString(36).substr(2, 9),
          soleksTotals: item.soleksTotals.map(d => ({
            ...d,
            _id: '_' + Math.random().toString(36).substr(2, 9),
          })),
        }
      })
  }

  getAlertState = (selectedCards, selectedNotUpdatedCards) => {
    return {
      selectedNotUpdatedCards: selectedNotUpdatedCards,
      selectedCards: selectedCards,
      isOneOfOne: selectedCards.length === 1 &&
        selectedNotUpdatedCards.length === 1,
      isOneOfMultiple: selectedCards.length > 1 &&
        selectedNotUpdatedCards.length === 1,
      isMoreThenOneOfMultiple: selectedCards.length > 1 &&
        selectedNotUpdatedCards.length > 1,
    }
  }

  getDataForCarouselItem = (item, cardsData) => {
    return {
      account: this.props.accountsWithSlika.find(
        a => a.companyAccountId === item.companyAccountId),
      data: cardsData.find(d => d.cardId === item.solekId),
    }
  }

  addCard = () => {
    // goTo( this.props.navigation, SETTINGS, {
    //   paramsLinkAddCard: {
    //     addCard: CLEARING_ACCOUNTS_TAB,
    //   },
    // })
  }

  componentDidMount () {
    BackHandler.addEventListener('hardwareBackPress', this.handleBackPress)
  }

  componentWillUnmount () {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackPress)
  }

  handleBackPress = () => {
    this.props.dispatch(setOpenedBottomSheet(false))

    goToBack(this.props.navigation)
    return true
  }

  render () {
    const { dateFromTimestamp, dateTillTimestamp } = this.state
    const { isRtl, cards, accountsWithSlika, currentCompanyId, t, dispatch, navigation, companies } = this.props

    return (
      <BaseCardsScreen
        companies={companies}
        navigation={navigation}
        type={'Slika'}
        addCard={this.addCard}
        t={t}
        isRtl={isRtl}
        dispatch={dispatch}
        dateFrom={dateFromTimestamp}
        dateTill={dateTillTimestamp}
        onGetData={this.getData}
        onGetAggregateData={this.getAggregateData}
        onGetTransDetails={this.handleGetTransDetails}
        aggregatedBody={this.getAggregatedDataBody}
        currentCompanyId={currentCompanyId}
        getCurrentData={this.getCurrentData}
        getCardsAggregatedDataBySections={this.getCardsAggregatedDataBySections}
        getLast12MonthData={this.getLast12MonthData}
        getSelectedCards={this.getSelectedCards}
        getCarouselItemData={this.getDataForCarouselItem}
        getScrollItemData={this.getDataForScrollItem}
        selectedCardIds={this.getSelectedCardIds}
        getFormattedAggregatedData={this.getFormattedAggregatedData}
        getAlertState={this.getAlertState}
        cards={cards}
        accountsWithCards={accountsWithSlika}
        aggregatedFutureBalance={this.aggregatedFutureBalance}
        aggregatedFutureCharges={this.aggregatedFutureCharges}
        aggregatedFutureCredits={this.aggregatedFutureCredits}
        SliderItem={SlikaSliderItem}
        Header={SlikaHeader}
        Alert={SlikaAlertDetails}
        Modal={SlikaModal}
        DataRow={SlikaDataRow}
        AggregatedDataRow={SlikaAggregatedDataRow}
      />
    )
  }
}
