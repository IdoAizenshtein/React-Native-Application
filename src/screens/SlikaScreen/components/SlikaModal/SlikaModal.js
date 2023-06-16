import React, { Fragment, PureComponent } from 'react'
import { ScrollView, Text, TouchableOpacity } from 'react-native'
import { withTranslation } from 'react-i18next'
import { Divider } from 'react-native-elements'
import Modal from '../../../../components/Modal/Modal'
import { combineStyles as cs } from '../../../../utils/func'
import accountModalStyles
  from '../../../../components/AccountsModal/AccountsModalStyles'
import styles from './SlikaModalStyles'
import CardsGroup from './CardsGroup'

@withTranslation()
export default class SlikaModal extends PureComponent {
  get groups () {
    const {
      isRtl,
      accounts,
      cards,
      selectedCards,
      onSelectGroup,
      onSelectItem,
    } = this.props

    return accounts.map((account, i) => {
      const filteredCards = cards.filter(
        c => c.companyAccountId === account.companyAccountId)

      return (
        <Fragment key={account.companyAccountId}>
          <CardsGroup
            isRtl={isRtl}
            account={account}
            cards={filteredCards}
            selectedCards={selectedCards}
            onSelectGroup={onSelectGroup}
            onSelectItem={onSelectItem}
          />
          {i + 1 < accounts.length &&
          <Divider
            style={cs(isRtl, accountModalStyles.accountGroupsDivider,
              accountModalStyles.accountGroupsDividerRtl)}/>}
        </Fragment>
      )
    })
  }

  render () {
    const { t, isRtl, isOpen, onClose, cards, selectedCards, onSelectAll, onSubmit } = this.props

    const isAllSelected = cards.length === selectedCards.length

    return (
      <Modal
        isOpen={isOpen}
        activeOpacity={selectedCards.length === 0}
        title={t('mainMenu:slika')}
        onLeftPress={onClose}
        onRightPress={onSubmit}
        leftText={t('common:cancel')}
        rightText={t('common:apply')}
      >
        <ScrollView
          style={cs(isRtl, accountModalStyles.modalBody,
            accountModalStyles.modalBodyRtl)}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          <TouchableOpacity
            style={cs(isRtl,
              cs(isAllSelected, [styles.item, accountModalStyles.group],
                accountModalStyles.itemChecked), styles.itemRtl)}
            onPress={onSelectAll}
            hitSlop={{
              top: 20,
              bottom: 20,
              left: 20,
              right: 20,
            }}
          >
            <Text style={accountModalStyles.groupTitle}>
              {t('slika:allSelected')}
            </Text>
          </TouchableOpacity>

          <Divider
            style={cs(isRtl, accountModalStyles.accountGroupsDivider,
              accountModalStyles.accountGroupsDividerRtl)}/>

          {this.groups}
        </ScrollView>
      </Modal>
    )
  }
}
