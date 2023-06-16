import React, { PureComponent } from 'react'
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import { Icon } from 'react-native-elements'
import Modal from 'src/components/Modal/Modal'
import Checker from 'src/components/Checker/Checker'
import accountModalStyles
  from 'src/components/AccountsModal/AccountsModalStyles'
import { colors } from 'src/styles/vars'
import { SLIKA_CREDENTIALS_SCHEME, SLIKA_ICONS } from 'src/constants/bank'
import { sp } from '../../../../../../../utils/func'

@withTranslation()
export default class SlikaModal extends PureComponent {
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
          {Object.keys(SLIKA_CREDENTIALS_SCHEME).map(slikaId => {
            const isSelected = selectedId === slikaId
            const wrapperStyle = [
              accountModalStyles.item,
              accountModalStyles.itemRtl]
            if (isSelected) {wrapperStyle.push(accountModalStyles.itemChecked)}

            return (
              <View
                key={slikaId}
                style={[
                  accountModalStyles.itemsWrapper,
                  accountModalStyles.itemsWrapperRtl]}
              >
                <TouchableOpacity
                  style={wrapperStyle}
                  onPress={this.handleChangeId(slikaId)}
                >
                  <View style={accountModalStyles.checkerWrapper}>
                    <Image
                      source={SLIKA_ICONS[slikaId].uri}
                      style={{
                        width: 25,
                        height: 25,
                        resizeMode: 'contain',
                      }}
                    />

                    {isSelected && (
                      <Checker
                        isChecked
                        hasBackground={false}
                        iconStyle={{ fontSize: sp(25) }}
                        isDisabled={false}
                      />
                    )}
                  </View>

                  <Text style={accountModalStyles.itemText}>
                    {t(`clearingAgenciesName:${slikaId}`)}
                  </Text>
                </TouchableOpacity>
              </View>
            )
          })}
        </ScrollView>
      </Modal>
    )
  }
}
