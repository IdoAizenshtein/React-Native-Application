import React, { Fragment, PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { withTranslation } from 'react-i18next'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { combineStyles as cs } from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import styles, { ALERT_HEIGHT } from './SlikaAlertStyles'
import { colors } from 'src/styles/vars'
import moment from 'moment/moment'

@withTranslation()
export default class SlikaAlertDetails extends PureComponent {
  handleSelectCard = (id) => () => {
    this.props.onSelectCard(id)
  }

  render () {
    const { isRtl, top, selectedNotUpdatedCards, onClose, t } = this.props

    return (
      <Fragment>
        <TouchableOpacity style={styles.alertDetailsBackgroundWrapper}
                          onPress={onClose}/>

        <ScrollView
          style={[styles.alertDetailsWrapper, { top: top + ALERT_HEIGHT }]}
          contentContainerStyle={styles.alertDetailsContainer}
        >
          {selectedNotUpdatedCards.map((c, i) => {
            const isLast = i + 1 >= selectedNotUpdatedCards.length

            return (
              <TouchableOpacity
                key={c.solekId}
                style={cs(isRtl,
                  cs(isLast, styles.alertDetailsRow, { borderBottomWidth: 0 }),
                  commonStyles.rowReverse)}
                onPress={this.handleSelectCard(c.solekId)}
              >
                <Text style={styles.alertDetailsText}
                      numberOfLines={1}>{c.solekNum} {t(
                  `slika:cardNameByType:${c.solekBankId}`)}</Text>
                <Text
                  style={[styles.alertAdditionalText, { color: colors.red2 }]}>
                  {t(
                    'bankAccount:lastUpdatedXDaysAgo',
                    {
                      days: moment()
                        .diff(moment(c.ballanceLastUpdatedDate), 'days'),
                    },
                  )}
                </Text>
                <Icon name={isRtl ? 'chevron-left' : 'chevron-right'} size={18}
                      color={colors.blue8}/>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </Fragment>
    )
  }
}
