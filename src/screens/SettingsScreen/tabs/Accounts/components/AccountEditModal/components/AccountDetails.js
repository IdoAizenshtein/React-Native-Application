import React, { PureComponent } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { isEmpty } from 'lodash'
import { withTranslation } from 'react-i18next'
import EditableTextInput from 'src/components/FormInput/EditableTextInput'
import styles from '../AccountEditModalStyles'
import tabStyles
  from '../../../../../components/BaseTokenTab/BaseTokenTabStyles'

@withTranslation()
export default class AccountDetails extends PureComponent {
  render () {
    const {
      t,
      account,
      onRemoveAccount,
      accountNickname,
      isPrimaryAccount,
      onTogglePrimaryAccount,
      onChangeAccountName,
    } = this.props

    if (!account) {return null}

    return (
      <ScrollView
        style={styles.detailsModalBody}
        contentContainerStyle={styles.detailsContainer}
      >

        <View style={styles.detailsRow}>
          <View style={styles.detailsLeftPart}>
            <EditableTextInput
              isEditable
              hideIcon
              textStyle={styles.detailsLeftText}
              value={accountNickname}
              onChangeText={onChangeAccountName}
            />
          </View>
          <View style={styles.detailsRightPart}>
            <Text style={styles.detailsRightText}>{t(
              'settings:bankAccountsTab:editAccountName')}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailsLeftPart}>
            {(!isEmpty(account.privsList) &&
              !account.privsList.includes('Denied Access')) ? (
              <Text style={styles.detailsLeftText}>
                {account.privsList.length > 1
                  ? t('settings:bankAccountsTab:usersCount',
                    { count: account.privsList.length })
                  : account.privsList[0]
                }
              </Text>
            ) : null}
          </View>

          <View style={styles.detailsRightPart}>
            <Text style={styles.detailsRightText}>{t(
              'settings:bankAccountsTab:selectUsers')}</Text>
          </View>
        </View>

        <View style={styles.detailsRow}>
          <TouchableOpacity onPress={onTogglePrimaryAccount} style={{
            width: '60%',
            paddingRight: 5,
            height: 42,
          }}>
            {isPrimaryAccount
              ? <Image
                style={[styles.primaryAccountIcon, { alignSelf: 'flex-end' }]}
                source={require('BiziboxUI/assets/star-on.png')}/>
              : <Image
                style={[styles.primaryAccountIcon, { alignSelf: 'flex-end' }]}
                source={require('BiziboxUI/assets/star-off.png')}/>}
          </TouchableOpacity>

          <View style={styles.detailsRightPart}>
            <Text
              style={styles.detailsRightText}>{t(
              'settings:bankAccountsTab:selectLeadingAccount')}</Text>
          </View>
        </View>

        <View style={styles.detailsLastRow}>
          <TouchableOpacity onPress={onRemoveAccount}>
            <Text style={tabStyles.modalLinkText}>
              {t('settings:bankAccountsTab:deletingAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    )
  }
}
