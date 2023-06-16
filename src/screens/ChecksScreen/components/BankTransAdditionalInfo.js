import React, { PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
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
import styles from '../ChecksStyles'
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
          companyAccountId: bankTrans.companyAccountId,
          linkId: bankTrans.linkId,
        },
      })
        .then(details => this.setState({
          details,
          inProgress: false,
        }))
        .catch(() => this.setState({ inProgress: false }))
    }

    if (bankTrans.pictureLink) {
      return accountCflCheckDetailsApi.post({
        body: {
          companyAccountId: bankTrans.companyAccountId,
          folderName: `${account.bankId}${account.bankSnifId}${account.bankAccountId}`,
          pictureLink: bankTrans.pictureLink,
          bankTransId: bankTrans.chequePaymentId,
        },
      })
        .then(details => this.setState({
          details,
          inProgress: false,
        }))
        .catch(() => this.setState({ inProgress: false }))
    }
  }

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
    } = this.props
    const { details, inProgress } = this.state
    const rowStyles = cs(isRtl, [styles.dataRow, styles.dataRowLevel3],
      commonStyles.rowReverse)

    return (
      <View style={styles.dataRowLevel3Wrapper}>
        <View style={rowStyles}>
          <View style={cs(isRtl, commonStyles.row, [commonStyles.rowReverse])}>
            <AccountIcon account={account}/>
            <View style={commonStyles.spaceDivider}/>
            <Text
              style={styles.dataRowLevel3Text}>{account.accountNickname}</Text>
          </View>
          <Text style={styles.dataRowLevel3Text}>
            {(this.props.searchkey && this.props.searchkey.length > 0 &&
            this.props.searchkey.find(
              (it) => it.paymentDescription === bankTrans.paymentDesc)
              ? this.props.searchkey.find(
                (it) => it.paymentDescription === bankTrans.paymentDesc).name
              : '')}
          </Text>
        </View>
        <View style={rowStyles}>
          <Text style={styles.dataRowLevel3Text}>
            {t('bankAccount:reference')} {bankTrans.asmachta}
          </Text>
          <TouchableOpacity
            style={cs(isRtl, styles.categoryNameWrapper,
              commonStyles.rowReverse)}
            onPress={onEditCategory(bankTrans)}
          >
            <View style={styles.categoryEditBtnWrapper}>
              <CustomIcon
                name={getTransCategoryIcon(bankTrans.iconType)}
                size={18}
                color={colors.blue7}
              />
            </View>
            <View style={commonStyles.spaceDividerDouble}/>
            <Text
              style={styles.dataRowLevel3Text}>{bankTrans.transTypeName}</Text>
          </TouchableOpacity>
        </View>

        {bankTrans.linkId || bankTrans.pictureLink ? (
          <BankTransSlider
            isRtl={isRtl}
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
