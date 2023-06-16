import React, { PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import styles from './FilterNotificationStyles'

@withTranslation()
export default class FilterNotification extends PureComponent {
  getStatusData = () => {
    const { filterStatuses, t } = this.props
    if (filterStatuses.noAccounts) {
      return {
        notificationText: t('slika:noAccountsNotification'),
        buttonText: t('slika:noAccountsButtonText'),
      }
    }
    if (filterStatuses.noCardSelected) {
      return {
        notificationText: t('slika:noCardSelectedNotification'),
        buttonText: t('slika:noCardSelectedButtonText'),
      }
    }
    return {
      notificationText: t('slika:noCardsNotification'),
      buttonText: t('slika:noCardsButtonText'),
    }
  }

  render () {
    const { onPress, style } = this.props
    const status = this.getStatusData()
    return (
      <View style={[style, styles.notificationWrapper]}>
        <Image style={styles.notificationIcon}
               source={require('BiziboxUI/assets/enterCardSlika.png')}/>
        <Text style={styles.notificationText}>
          {status.notificationText}
        </Text>
        <TouchableOpacity
          onPress={onPress}
          style={styles.notificationBtnWrapper}
        >
          <Text style={styles.notificationBtnText}>
            {status.buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
}
