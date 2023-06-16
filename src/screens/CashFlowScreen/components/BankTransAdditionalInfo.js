import React, { Fragment, PureComponent } from 'react'
import {
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { withTranslation } from 'react-i18next'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import {
  combineStyles as cs,
  getFormattedValueArray,
  getTransCategoryIcon,
  sp,
} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import styles from '../CashFlowStyles'
import { colors, fonts } from '../../../styles/vars'
import CustomIcon from '../../../components/Icons/Fontello'
import { Icon } from 'react-native-elements'
import { connect } from 'react-redux'
import { getUnionDetApi } from '../../../api'

@connect(state => ({
  searchkey: state.searchkey,
}))
@withTranslation()
export default class BankTransAdditionalInfo extends PureComponent {
  constructor (props) {
    super(props)
    this.state = {
      modalGetUnionDet: false,
    }
  }

  updateRow = (reload, data) => {
    // this.setState({
    //   cashFlowDetailsDataItem: data,
    // })
    const { updateRow } = this.props
    updateRow(reload, data)
  }

  handlePopRowEditsModal = (params) => () => {
    this.hideModalGetUnionDet()
    const { handlePopRowEditsModal } = this.props
    handlePopRowEditsModal(params)
  }

  removeItem = (...params) => () => {
    this.hideModalGetUnionDet()
    const { removeItem } = this.props
    removeItem(params[0], params[1])
  }

  showIconRef (type) {
    if (type === 'CYCLIC_TRANS' ||
      type === 'DIRECTD' ||
      type === 'CCARD_TAZRIM' ||
      type === 'SOLEK_TAZRIM' ||
      type === 'CASH' ||
      type === 'LOAN_TAZRIM'
    ) {
      return true
    }
    return false
  }

  getUnionDet = () => {
    const { cashFlowDetailsDataItem } = this.props
    const param = {
      companyAccountId: cashFlowDetailsDataItem.companyAccountId,
      transDate: cashFlowDetailsDataItem.transDate,
      unionId: cashFlowDetailsDataItem.unionId,
    }
    getUnionDetApi.post({
      body: param,
    }).then((modalGetUnionDet) => {
      this.setState({
        modalGetUnionDet,
      })
    })
  }

  hideModalGetUnionDet = () => {
    this.setState({
      modalGetUnionDet: false,
    })
  }

  render () {
    const { isRtl, account, t, transType, cashFlowDetailsDataItem, isEditing, onStartEdit, onEditCategory, renderTextYellow } = this.props
    const { modalGetUnionDet } = this.state
    const withinRowStyles = cs(isRtl, commonStyles.row, commonStyles.rowReverse)

    let totalModal = [0, 0]
    if (modalGetUnionDet && modalGetUnionDet.length) {
      totalModal = getFormattedValueArray(
        modalGetUnionDet.reduce((memo, val) => {
          return memo + val.total
        }, 0))
    }

    return (
      <Fragment>
        <View style={[
          withinRowStyles, {
            backgroundColor: '#d9e7ee',
            paddingHorizontal: 6,
            height: 60,
          }]}>
          <View style={{
            flex: 10,
          }}>
            {cashFlowDetailsDataItem.targetType !== 'BANK_TRANS' && (
              <TouchableOpacity
                onPress={cashFlowDetailsDataItem.targetType === 'SOLEK_TAZRIM'
                  ? this.getUnionDet
                  : this.handlePopRowEditsModal(cashFlowDetailsDataItem)}>
                <View style={styles.categoryEditBtnWrapper}>
                  <CustomIcon
                    name="pencil"
                    size={18}
                    color={colors.blue7}
                  />
                </View>
              </TouchableOpacity>
            )}
            {cashFlowDetailsDataItem.targetType === 'BANK_TRANS' && (
              <View style={[
                styles.categoryEditBtnWrapper,
                styles.descEditBtnWrapper]}>
                <TouchableOpacity
                  onPress={onStartEdit}
                  hitSlop={{
                    top: 20,
                    bottom: 20,
                    left: 20,
                    right: 20,
                  }}
                >
                  <CustomIcon
                    name={isEditing ? 'ok' : 'pencil'}
                    size={16}
                    color={colors.blue10}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={[
            {
              flex: 86,
              paddingHorizontal: 6,
            }, commonStyles.column]}>
            <View style={[
              withinRowStyles, {
                height: 27,
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
                  style={cs(!isRtl, commonStyles.row, [commonStyles.rowReverse],
                    {
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
                  <View style={commonStyles.spaceDivider}/>
                  <AccountIcon account={account}/>
                </View>
              </View>
              <View style={{
                flex: 7,
              }}/>
              <View style={{
                flex: 50,
              }}>

                <TouchableOpacity
                  style={cs(isRtl, commonStyles.row, [commonStyles.rowReverse],
                    {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                    })}
                  activeOpacity={(cashFlowDetailsDataItem.unionId) ? 0.2 : 1}
                  onPress={cashFlowDetailsDataItem.unionId
                    ? this.getUnionDet
                    : null}
                >
                  {this.showIconRef(cashFlowDetailsDataItem.targetType) &&
                  (<View>
                    <Icon
                      iconStyle={{
                        transform: [{ scaleX: -1 }],
                        marginHorizontal: 2,
                      }}
                      name="refresh"
                      type="simple-line-icon"
                      size={14}
                      color={colors.blue8}
                    />
                    <View style={commonStyles.spaceDividerDouble}/>

                  </View>)}
                  <Text numberOfLines={1}
                        ellipsizeMode="tail"
                        style={[
                          {
                            fontSize: sp(16),
                            color: !cashFlowDetailsDataItem.unionId
                              ? colors.blue8
                              : '#038ed6',
                            fontFamily: fonts.regular,
                          }, (cashFlowDetailsDataItem.unionId ? {
                            textDecorationLine: 'underline',
                            textDecorationStyle: 'solid',
                            textDecorationColor: '#038ed6',
                          } : {})]}>
                    {(this.props.searchkey && this.props.searchkey.length > 0 &&
                    this.props.searchkey.find((it) => it.paymentDescription ===
                      cashFlowDetailsDataItem.paymentDesc)
                      ? this.props.searchkey.find(
                        (it) => it.paymentDescription ===
                          cashFlowDetailsDataItem.paymentDesc).name
                      : '')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[
              withinRowStyles, {
                height: 27,
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
                <Text style={{
                  fontSize: sp(16),
                  color: colors.blue7,
                  fontFamily: fonts.regular,
                }}>
                  {t('bankAccount:reference')} {renderTextYellow(
                  cashFlowDetailsDataItem.asmachta)}
                </Text>
              </View>
              <View style={{
                flex: 7,
              }}/>
              <View style={{
                flex: 50,
              }}>
                <TouchableOpacity
                  onPress={cashFlowDetailsDataItem.targetType === 'BANK_TRANS'
                    ? onEditCategory(transType)
                    : null}
                  activeOpacity={(cashFlowDetailsDataItem.targetType !==
                    'BANK_TRANS') ? 1 : 0.2}
                  style={cs(isRtl, commonStyles.row, [commonStyles.rowReverse],
                    {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'flex-end',
                      alignItems: 'flex-end',
                    })}>
                  <View>
                    <CustomIcon
                      name={transType
                        ? getTransCategoryIcon(transType.iconType)
                        : null}
                      size={18}
                      color={colors.blue7}
                    />
                  </View>
                  <View style={commonStyles.spaceDividerDouble}/>
                  <Text numberOfLines={1}
                        ellipsizeMode="tail"
                        style={{
                          fontSize: sp(16),
                          color: colors.blue7,
                          fontFamily: fonts.regular,
                        }}>{(transType && transType.transTypeName)
                    ? transType.transTypeName
                    : ''}</Text>
                </TouchableOpacity>

              </View>
            </View>
          </View>

          <View style={{
            flex: 10,
          }}>
            <TouchableOpacity
              onPress={cashFlowDetailsDataItem.targetType === 'SOLEK_TAZRIM'
                ? this.getUnionDet
                : this.removeItem(cashFlowDetailsDataItem, true)}>
              <View style={styles.categoryEditBtnWrapper}>
                <CustomIcon
                  name="trash"
                  size={18}
                  color={colors.blue36}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          animationType="slide"
          transparent={false}
          visible={modalGetUnionDet !== false}
          onRequestClose={() => {
            // //console.log('Modal has been closed.')
          }}>
          <SafeAreaView style={{
            flex: 1,
            marginTop: 0,
            paddingTop: 0,
            position: 'relative',
          }}>
            <View style={{
              flex: 1,
              alignItems: 'center',
            }}>
              <View style={{
                height: 60,
                backgroundColor: '#002059',
                width: '100%',
                paddingTop: 0,
                paddingLeft: 10,
                paddingRight: 10,
              }}>
                <View style={cs(
                  !isRtl,
                  [
                    styles.container, {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }],
                  commonStyles.rowReverse,
                )}>
                  <View/>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: sp(20),
                      color: '#ffffff',
                      fontFamily: fonts.semiBold,
                    }}>
                      {'פירוט תנועות סליקה'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity onPress={this.hideModalGetUnionDet}>
                      <View style={{
                        marginRight: 'auto',
                      }}>
                        <Icon name="chevron-right" size={30}
                              color={colors.white}/>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={{
                width: '100%',
                height: '100%',
                marginTop: 10,
                marginBottom: 10,
                paddingLeft: 0,
                paddingRight: 10,
                flex: 1,
              }}>
                <ScrollView>
                  <Text style={{
                    marginTop: 10,
                    fontSize: sp(16),
                    color: '#022258',
                    fontFamily: fonts.bold,
                    textAlign: 'center',
                  }}>{'הסליקה הצפוייה מורכבת מסכום המותגים הבאים.'}</Text>
                  <Text style={{
                    fontSize: sp(16),
                    color: '#022258',
                    fontFamily: fonts.semiBold,
                    textAlign: 'center',
                  }}>{'על מנת לדייק בסכום לתזרים ניתן לערוך'}</Text>
                  <Text style={{
                    fontSize: sp(16),
                    color: '#022258',
                    fontFamily: fonts.semiBold,
                    textAlign: 'center',
                    marginBottom: 10,
                  }}>{'או למחוק כל מותג בנפרד'}</Text>

                  <View style={{
                    height: 38,
                    flex: 1,
                    backgroundColor: '#dde7f1',
                    flexDirection: 'row-reverse',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10,
                  }}>
                    <View style={{
                      flex: 68,
                    }}/>
                    <View style={{
                      flex: 330,
                    }}>
                      <Text style={{
                        fontSize: sp(16.5),
                        color: '#022258',
                        fontFamily: fonts.bold,
                        textAlign: 'right',
                      }}>{'מותג'}</Text>
                    </View>
                    <View style={{
                      flex: 284,
                    }}>
                      <Text style={{
                        fontSize: sp(16.5),
                        color: '#022258',
                        fontFamily: fonts.bold,
                        textAlign: 'right',
                      }}>{'סכום'}</Text>
                    </View>
                    <View style={{
                      flex: 20,
                    }}/>
                  </View>
                  {modalGetUnionDet && modalGetUnionDet.map((c, i) => {
                    const numberStyle = cs(c.expence,
                      [styles.dataValue, { color: colors.green4 }],
                      { color: colors.red2 })
                    const total = getFormattedValueArray(
                      c.expence ? -Math.abs(c.total) : c.total)

                    return (
                      <View key={i.toString()}>
                        <View
                          style={{
                            height: 63,
                            flex: 1,
                            backgroundColor: '#ffffff',
                            flexDirection: 'row-reverse',
                            alignContent: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginRight: 10,
                          }}>
                          <View style={{
                            flex: 68,
                          }}/>

                          <View style={{
                            flex: 330,
                            flexDirection: 'column',
                            height: 55,
                            justifyContent: 'flex-end',
                          }}>
                            <Text style={{
                              fontSize: sp(16),
                              color: '#022258',
                              fontFamily: fonts.semiBold,
                              textAlign: 'right',
                            }}>{c.transName}</Text>
                            <TouchableOpacity
                              style={{
                                alignSelf: 'flex-end',
                                alignContent: 'flex-end',
                                justifyContent: 'flex-end',
                                alignItems: 'flex-end',
                              }}
                              onPress={this.removeItem(c, true)}>
                              <Text style={{
                                fontSize: sp(15),
                                color: '#ef3636',
                                fontFamily: fonts.regular,
                                textAlign: 'right',
                                textDecorationLine: 'underline',
                                textDecorationStyle: 'solid',
                                textDecorationColor: '#ef3636',
                              }}>{'מחיקה'}</Text>
                            </TouchableOpacity>
                          </View>
                          <View style={{
                            flex: 284,
                            flexDirection: 'row-reverse',
                            alignContent: 'center',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}>
                            <Text
                              style={[
                                styles.dataValueWrapper,
                                styles.dataValueWrapperLevel2,
                                {
                                  textAlign: 'right',
                                }]}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              <Text style={numberStyle}>{total[0]}</Text>
                              <Text
                                style={styles.fractionalPart}>.{total[1]}</Text>
                            </Text>

                            <TouchableOpacity
                              onPress={this.handlePopRowEditsModal(c)}>
                              <View style={{
                                marginRight: 'auto',
                              }}>
                                <Icon name="chevron-left" size={30}
                                      color={'#022258'}/>
                              </View>
                            </TouchableOpacity>
                          </View>
                          <View style={{
                            flex: 20,
                          }}/>
                        </View>
                        <View style={styles.dataRowSeparator}/>
                      </View>
                    )
                  })}

                  <View style={{
                    height: 38,
                    flex: 1,
                    marginTop: 10,
                    backgroundColor: '#ffffff',
                    flexDirection: 'row-reverse',
                    alignContent: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 10,
                  }}>
                    <View style={{
                      flex: 68,
                    }}/>

                    <View style={{
                      flex: 330,
                    }}>
                      {modalGetUnionDet.length === 1 && (
                        <Text style={{
                          fontSize: sp(16.5),
                          color: '#022258',
                          fontFamily: fonts.bold,
                          textAlign: 'right',
                        }}>{'סה״כ מותג אחד'}</Text>
                      )}
                      {modalGetUnionDet.length > 1 && (
                        <Text style={{
                          fontSize: sp(16.5),
                          color: '#022258',
                          fontFamily: fonts.bold,
                          textAlign: 'right',
                        }}>{'סה״כ '}
                          {modalGetUnionDet.length}
                          {' מותגים'}
                        </Text>
                      )}
                    </View>
                    <View style={{
                      flex: 284,
                    }}>
                      <Text
                        style={[
                          {
                            fontSize: sp(18),
                            color: '#022258',
                            textAlign: 'right',
                            flexDirection: 'row-reverse',
                          }]}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        <Text style={{
                          fontFamily: fonts.semiBold,
                        }}>{totalModal[0]}</Text>
                        <Text
                          style={styles.fractionalPart}>.{totalModal[1]}</Text>
                      </Text>
                    </View>
                    <View style={{
                      flex: 20,
                    }}/>
                  </View>
                </ScrollView>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </Fragment>
    )
  }
}
