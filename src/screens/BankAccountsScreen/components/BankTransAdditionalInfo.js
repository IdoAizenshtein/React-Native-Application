import React, { PureComponent } from 'react'
import { Image, Text, TouchableOpacity, View } from 'react-native'
import { withTranslation } from 'react-i18next'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import CustomIcon from '../../../components/Icons/Fontello'
import BankTransSlider from './BankTransSlider'
import {
  accountCflCheckDetailsApi,
  accountCflDataDetailApi,
} from '../../../api'
import { combineStyles as cs, getTransCategoryIcon } from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../BankAccountsStyles'
import { colors } from '../../../styles/vars'
import { connect } from 'react-redux'

@connect(state => ({
  searchkey: state.searchkey,
}))
@withTranslation()
export default class BankTransAdditionalInfo extends PureComponent {
  state = {
    inProgress: true,
    details: null,
  }

    getDetails = () => {
      const { bankTrans, account } = this.props

      if (bankTrans.linkId) {
        return accountCflDataDetailApi.post({
          body: {
            bankTransId: bankTrans.bankTransId,
            companyAccountId: bankTrans.companyAccountId,
            linkId: bankTrans.linkId,
          },
        })
          .then(details => this.setState({ details, inProgress: false }))
          .catch(() => this.setState({ inProgress: false }))
      }

      if (bankTrans.pictureLink) {
        return accountCflCheckDetailsApi.post({
          body: {
            companyAccountId: bankTrans.companyAccountId,
            folderName: `${account.bankId}${account.bankSnifId}${account.bankAccountId}`,
            pictureLink: bankTrans.pictureLink,
            bankTransId: bankTrans.bankTransId,
          },
        })
          .then(details => this.setState({ details, inProgress: false }))
          .catch(() => this.setState({ inProgress: false }))
      }
    };

    UNSAFE_componentWillReceiveProps (nextProps) {
      const { parentIsOpen } = nextProps
      const { details } = this.state
      if (parentIsOpen && !details) {this.getDetails()}
    }

    render () {
      const {
        t,
        isRtl,
        bankTrans,
        account,
        parentIsOpen,
        onEditCategory,
        onStartEdit,
        onSubmitEdit,
        isEditing,
        disabledEdit,
        renderTextYellow,
      } = this.props
      const { details, inProgress } = this.state
      const rowStyles = cs(isRtl, [styles.dataRow, styles.dataRowLevel3], commonStyles.rowReverse)
      return (
        <View style={styles.dataRowLevel3Wrapper}>
          <View style={rowStyles}>
            <View style={cs(isRtl, commonStyles.row, [commonStyles.rowReverse])}>
              {!disabledEdit && (
                <View style={[styles.categoryEditBtnWrapper, styles.descEditBtnWrapper]}>
                  <TouchableOpacity
                    activeOpacity={(!disabledEdit) ? 0.2 : 1}
                    style={[cs((!disabledEdit), { opacity: 0.8 }, { opacity: 1 })]}
                    onPress={!disabledEdit ? (isEditing ? onSubmitEdit : onStartEdit) : null}
                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                  >
                    <CustomIcon
                      name={isEditing ? 'ok' : 'pencil'}
                      size={16}
                      color={colors.blue10}
                    />
                  </TouchableOpacity>
                </View>
              )}
              <AccountIcon style={{ marginRight: disabledEdit ? 0 : 20 }} account={account} />
              <View style={commonStyles.spaceDivider} />
              <Text style={[styles.dataRowLevel3Text]}>{account.accountNickname}</Text>
            </View>
            <View style={cs(isRtl, commonStyles.row, commonStyles.rowReverse)}>
              {bankTrans.kvua && (
                <Image
                  style={styles.cyclicIcon}
                  source={require('BiziboxUI/assets/cyclic.png')}
                />
              )}
              <Text style={styles.dataRowLevel3Text}>
                {this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === bankTrans.paymentDesc) ? this.props.searchkey.find((it) => it.paymentDescription === bankTrans.paymentDesc).name : ''}
              </Text>
            </View>
          </View>
          <View style={rowStyles}>
            <Text style={[styles.dataRowLevel3Text, { marginRight: disabledEdit ? 0 : 20 }]}>
              {t('bankAccount:reference')} {renderTextYellow(bankTrans.asmachta)}
            </Text>
            <TouchableOpacity
              activeOpacity={(!disabledEdit) ? 0.2 : 1}
              style={[cs(isRtl, styles.categoryNameWrapper, commonStyles.rowReverse),
                cs((!disabledEdit), { opacity: 0.8 }, { opacity: 1 })]}
              onPress={!disabledEdit ? onEditCategory(bankTrans) : null}
            >
              {!disabledEdit && (
                <View style={styles.categoryEditBtnWrapper}>
                  <CustomIcon
                    name={getTransCategoryIcon(bankTrans.iconType)}
                    size={18}
                    color={colors.blue7}
                  />
                </View>
              )}
              <View style={commonStyles.spaceDividerDouble} />
              <Text style={styles.dataRowLevel3Text}>{bankTrans.transTypeName}</Text>
            </TouchableOpacity>
          </View>

          {bankTrans.linkId || bankTrans.pictureLink ? (
            <BankTransSlider
              isRtl={isRtl}
              account={account}
              parentIsOpen={parentIsOpen}
              inProgress={inProgress}
              details={details}
              bankTrans={bankTrans}
            />
          ) : null}
        </View>
      )
    }
}
