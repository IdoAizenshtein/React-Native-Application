import React, { Fragment, PureComponent } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import AppTimezone from '../../../utils/appTimezone'
import { withTranslation } from 'react-i18next'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'
import { combineStyles as cs, getCurrencyChar, getFormattedValueArray, getTransCategoryIcon, sp } from 'src/utils/func'
import commonStyles from 'src/styles/styles'
import { colors, fonts } from 'src/styles/vars'
import styles from '../CreditCardsStyles'
import { CURRENCIES } from 'src/constants/common'
import CustomIcon from 'src/components/Icons/Fontello'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import EditRowModal from './EditRowModal/EditRowModal'

@withTranslation()
export default class CreditCardAdditionalInfo extends PureComponent {
  constructor (props) {
    super(props)

    this.state = ({
      rowInfo: null,
      editRowModalOpen: false,
    })
  }

    handlePopRowEditsModal = (item) => () => {
      this.setState({ rowInfo: item, editRowModalOpen: true })
    };

    handlePopCloseRowEditsModal = () => {
      this.setState({ rowInfo: null, editRowModalOpen: false })
    };

    updateRow = (reload, data) => {
      const {
        onEdit,
      } = this.props
      this.setState({
        editRowModalOpen: false,
      })
      if (reload) {
        onEdit(data)
      }
    };

    render () {
      const {
        t,
        isRtl,
        data,
        cycleDate,
        account,
        companyId,
      } = this.props
      const {
        rowInfo,
        editRowModalOpen,
      } = this.state
      const originalTotal = getFormattedValueArray(data.originalTotal)
      const withinRowStyles = cs(isRtl, commonStyles.row, commonStyles.rowReverse)

      return (
        <Fragment>
          <View style={[withinRowStyles, {
            backgroundColor: '#d9e7ee',
            paddingRight: 5,
            paddingLeft: 20,
          }]}>
            <View style={[{
              flex: 86,
              paddingHorizontal: 6,
            }, commonStyles.column]}>
              {(data && data.originalTotal !== null) && (
                <View style={[withinRowStyles, {
                  height: 30,
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  alignSelf: 'center',
                  alignContent: 'center',
                }]}>
                  <View style={{
                    flex: 1,
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                  }}>
                    <View
                      style={cs(isRtl, [commonStyles.row, commonStyles.alignItemsCenter], [commonStyles.rowReverse])}>
                      <Text style={styles.dataRowLevel3Text}
                        numberOfLines={1}>{t('common:transactionSum')}{':'}</Text>
                      <Text>{' '}</Text>
                      <Text style={[styles.dataRowValueText, { flex: 0 }]} numberOfLines={1}>
                        {(data && data.currency && data.currency.toLowerCase() !== CURRENCIES.ILS) &&
                        <Text
                          style={styles.dataRowLevel3CurrencyChar}>{getCurrencyChar(data.currency)}</Text>}

                        <Text style={styles.dataValueText}>{originalTotal[0]}</Text>
                        <Text style={styles.fractionalPart}>.{originalTotal[1]}</Text>
                      </Text>
                    </View>
                  </View>
                </View>
              )}
              <View style={[withinRowStyles, {
                height: 30,
                alignItems: 'center',
                justifyContent: 'flex-end',
                alignSelf: 'center',
                alignContent: 'center',
              }]}>
                <View style={{
                  flex: 50,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}>
                  <View
                    style={cs(isRtl, styles.categoryNameWrapper, commonStyles.rowReverse)}
                  >
                    <View>
                      <CustomIcon
                        name={getTransCategoryIcon(data.iconType)}
                        size={18}
                        color={colors.blue7}
                      />
                    </View>
                    <View style={commonStyles.spaceDividerDouble} />
                    <Text style={styles.dataRowLevel3Text}>{data.transTypeName}</Text>
                  </View>
                </View>
                <View style={{
                  flex: 10,
                }} />
                <View style={{
                  flex: 50,
                }}>
                  <View style={cs(isRtl, commonStyles.row, [commonStyles.rowReverse], {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'flex-end',
                  })}>
                    <Text numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        fontSize: sp(16),
                        color: colors.blue7,
                        fontFamily: fonts.regular,
                      }}>
                      {t('common:chargedOn')}: {AppTimezone.moment(cycleDate).format('DD/MM')}
                    </Text>
                  </View>
                </View>
              </View>
              <View style={[withinRowStyles, {
                height: 30,
                alignItems: 'center',
                justifyContent: 'flex-end',
                alignSelf: 'center',
                alignContent: 'center',
              }]}>
                <View style={{
                  flex: 50,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}>
                  <View style={cs(!isRtl, commonStyles.row, [commonStyles.rowReverse], {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                  })}>
                    <Text
                      style={{
                        fontSize: sp(16),
                        color: colors.blue7,
                        fontFamily: fonts.regular,
                      }}
                      numberOfLines={1}
                      ellipsizeMode="tail">
                      {account.accountNickname}
                    </Text>
                    <View style={commonStyles.spaceDivider} />
                    <AccountIcon account={account} />
                  </View>
                </View>
                <View style={{
                  flex: 10,
                }} />
                <View style={{
                  flex: 50,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                }}>
                  {data.currentPaymentNumber !== null && data.totalNumOfPayments !== null && (
                    <Text style={styles.dataRowLevel3Text}>
                      {t('creditCards:paymentOutOf', {
                        count: data.currentPaymentNumber,
                        total: data.totalNumOfPayments,
                      })}
                      {(data && data.currency && data.currency.toLowerCase() !== CURRENCIES.ILS) && ` ${t('creditCards:forexDeal')}`}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            <View style={{
              flex: 8,
            }}>
              <TouchableOpacity
                onPress={this.handlePopRowEditsModal(data)}
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              >
                <Icon name="chevron-left"
                  size={36}
                  color={colors.blue32}
                />
              </TouchableOpacity>
            </View>
          </View>

          {editRowModalOpen && (
            <EditRowModal
              t={t}
              closeEdit={this.handlePopCloseRowEditsModal}
              isRtl={isRtl}
              companyId={companyId}
              dataOfRow={rowInfo}
              updateRow={this.updateRow}
            />
          )}
        </Fragment>
      )
    }
}
