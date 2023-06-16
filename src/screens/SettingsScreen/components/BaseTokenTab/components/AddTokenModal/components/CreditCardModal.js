import React, { PureComponent } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import { Icon } from 'react-native-elements'
import Modal from 'src/components/Modal/Modal'
import Checker from 'src/components/Checker/Checker'
import accountModalStyles
  from 'src/components/AccountsModal/AccountsModalStyles'
import { colors } from 'src/styles/vars'
import {
  CREDIT_CARD_ICONS,
  CREDIT_CARDS_CREDENTIALS_SCHEME,
} from 'src/constants/bank'
import { sp } from '../../../../../../../utils/func'

@withTranslation()
export default class CreditCardModal extends PureComponent {
  handleChangeId = (cardId) => () => this.props.onChange(cardId)

  render () {
    const { t, onClose, selectedId, title } = this.props

    return (
      <Modal
        isOpen
        title={title}
        onRightPress={onClose}
        rightComponent={<Icon name="chevron-right" size={30}
                              color={colors.white}/>}
      >
        <ScrollView
          style={[
            accountModalStyles.modalBodyRtl,
            accountModalStyles.modalBodyRtl]}
          contentContainerStyle={{ paddingVertical: 20 }}
        >
          {Object.keys(CREDIT_CARDS_CREDENTIALS_SCHEME).map(cardId => {
            const wrapperStyle = [
              accountModalStyles.item,
              accountModalStyles.itemRtl]
            const isSelected = selectedId === cardId
            if (isSelected) {wrapperStyle.push(accountModalStyles.itemChecked)}

            return (
              <View
                key={cardId}
                style={[
                  accountModalStyles.itemsWrapper,
                  accountModalStyles.itemsWrapperRtl]}
              >
                <TouchableOpacity
                  style={wrapperStyle}
                  onPress={this.handleChangeId(cardId)}
                >
                  <View style={accountModalStyles.checkerWrapper}>
                    <Image source={CREDIT_CARD_ICONS[cardId].uri} style={{
                      width: 30,
                      height: 19,
                    }}/>

                    {isSelected && (
                      <Checker
                        isChecked
                        hasBackground={false}
                        iconStyle={{ fontSize: sp(25) }}
                        isDisabled={false}
                      />
                    )}
                  </View>

                  <View style={{ marginHorizontal: 5 }}/>

                  <Text style={accountModalStyles.itemText}>{t(
                    `creditCardsName:${cardId}`)}</Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </ScrollView>
      </Modal>
    )
  }
}
