import React, { PureComponent } from 'react'
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { withTranslation } from 'react-i18next'
import { colors, fonts } from '../../../../styles/vars'
import styles from './EditRowModalStyles'
import { combineStyles as cs, sp } from '../../../../utils/func'
import commonStyles from '../../../../styles/styles'
import { Icon } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import {
  createAccountCflTransTypeApi,
  getHistoryCreditCardsApi,
  removeAccountCflTransTypeApi,
} from '../../../../api'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import { cloneDeep, take } from 'lodash'
import { dateToFromNowDaily } from '../../../../utils/date'
import Graph from './../Graph'
import CustomIcon from 'src/components/Icons/Fontello'
import AppTimezone from 'src/utils/appTimezone'

@withTranslation()
export default class EditRowModal extends PureComponent {
  constructor (props) {
    super(props)
    const item = props.dataOfRow
    this.state = {
      categoriesModalIsOpen: false,
      expirationDate: null,
      editRowModalIsOpen: true,
      editSum: false,
      currentEditBankTrans: null,
      companyId: props.companyId,
      saveOriginObj: JSON.parse(JSON.stringify(item)),
      obj: cloneDeep(item),
      inProgress: true,
      dataGraph: {},
    }
    this.getHistoryCreditCardsApi(item)
  }

  kFormatter (num) {
    return num > 999 ? (num / 1000).toFixed(0) + 'k' : num.toFixed(0).toString()
  }

    getHistoryCreditCardsApi = ({ creditCardId, searchkeyId }) => {
      getHistoryCreditCardsApi.post({
        body: {
          creditCardId: creditCardId,
          searchkeyId: searchkeyId,
        },
      }).then(data => {
        if (data && !Object.keys(data).length) {
          this.setState({
            inProgress: false,
            dataGraph: {
              data: null,
            },
          })
        } else {
          data = take(data, 8)
          const isHaveBigger = data.some(item => item.transTotal > 0)
          if (isHaveBigger) {
            const totals = data.map((num) => num.transTotal)
            const max = Math.max(...totals)
            const reducer = (accumulator, currentValue) => accumulator + currentValue
            const totalArr = totals.reduce(reducer)
            const onePr = max / 100
            const lenData = data.filter((num) => num.transTotal > 0)
            const avg = ((totalArr / lenData.length) / onePr) * 2.1
            const spaceBetween = (max / 4)

            const sumsY = [
              this.kFormatter((0)),
              this.kFormatter(spaceBetween),
              this.kFormatter(spaceBetween * 2),
              this.kFormatter(spaceBetween * 3),
              this.kFormatter((max)),
            ]
            data.forEach((it) => {
              it.total = it.transTotal
              it.month = AppTimezone.moment(it.nextCycleDate).format('MM/YY')
              it.isThisMonth = AppTimezone.moment().format('MM/YY') === it.month
              it.height = Math.abs(it.total / onePr) * 2.1
            })

            this.setState({
              inProgress: false,
              dataGraph: {
                avg: avg,
                sumsY: sumsY,
                data: data,
              },
            })
          } else {
            this.setState({
              inProgress: false,
              dataGraph: {
                data: null,
              },
            })
          }
        }
      }).catch(() => this.setState({ inProgress: false }))
    };

    update = () => {
      const { updateRow } = this.props
      const params = this.state.obj
      let valuesSave = Object.assign({}, params)
      this.setState({
        userDescriptionNoValid: valuesSave.mainDescription === '',
      })
      if (valuesSave.mainDescription === '') {return}
      this.setModalUnVisible()
      setTimeout(() => {
        updateRow(!this.isEquivalent(this.state.obj, this.state.saveOriginObj), valuesSave)
      }, 10)
    };

    isEquivalent (a, b) {
      let aProps = Object.getOwnPropertyNames(a)
      let bProps = Object.getOwnPropertyNames(b)
      if (aProps.length !== bProps.length) {
        return false
      }

      for (let i = 0; i < aProps.length; i++) {
        let propName = aProps[i]
        if (a[propName] !== b[propName]) {
          return false
        }
      }
      return true
    }

    setModalUnVisible = () => {
      const { closeEdit } = this.props
      closeEdit()
    };

    getAccountCflTransType (transTypeId) {
      const { getAccountCflTransType } = this.props
      if (getAccountCflTransType && transTypeId) {
        const type = getAccountCflTransType.find((item) => (item.transTypeId === transTypeId))
        if (type !== undefined) {
          return type
        } else {
          return getAccountCflTransType[0]
        }
      } else {
        return ''
      }
    }

    pressed = (idx) => {
      let valuesSave = Object.assign({}, this.state.dataGraph)
      valuesSave.data.forEach((it, index) => {
        it.isPressed = idx === index
      })
      this.setState({ dataGraph: valuesSave })
    };

    handleSelectCategory = (category) => {
      const { currentEditBankTrans } = this.state
      if (!currentEditBankTrans || currentEditBankTrans.transTypeId === category.transTypeId) {return}

      const newCardTrans = {
        ...currentEditBankTrans,
        iconType: category.iconType,
        transTypeId: category.transTypeId,
        transTypeName: category.transTypeName,
      }

      this.setState({ obj: { ...newCardTrans } })

      setTimeout(() => this.setState({ currentEditBankTrans: null, categoriesModalIsOpen: false }), 800)
    };

    handleCloseCategoriesModal = () => {
      this.setState({ categoriesModalIsOpen: false, currentEditBankTrans: null })
    };

    handleOpenCategoriesModal = (bankTransId) => {
      this.setState({
        categoriesModalIsOpen: true,
        currentEditBankTrans: bankTransId,
      })
    };

    handleRemoveBankTransCategory = (transTypeId) => {
      const { companyId } = this.props
      return removeAccountCflTransTypeApi.post({ body: { transTypeId, companyId: companyId } })
    };

    handleCreateBankTransCategory = (transTypeName) => {
      const { companyId } = this.props
      return createAccountCflTransTypeApi.post({
        body: {
          companyId: companyId,
          'transTypeId': null,
          transTypeName,
        },
      })
    };

    setDataState = (data) => {
      this.setState({ obj: data })
    };

    editInput = () => {
      this.handleOpenCategoriesModal(cloneDeep(this.state.obj))
    };

    render () {
      const { isRtl, t } = this.props
      const { categoriesModalIsOpen, currentEditBankTrans, saveOriginObj, userDescriptionNoValid, inProgress, dataGraph } = this.state

      return (
        <View>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.editRowModalIsOpen}
            onRequestClose={() => {
              // console.log('Modal has been closed.')
            }}>

            {categoriesModalIsOpen && (
              <CategoriesModal
                isOpen
                isRtl={isRtl}
                companyId={this.state.companyId}
                bankTrans={currentEditBankTrans}
                onClose={this.handleCloseCategoriesModal}
                onUpdateBankTrans={this.handleSelectCategory}
                onSelectCategory={this.handleSelectCategory}
                onCreateCategory={this.handleCreateBankTransCategory}
                onRemoveCategory={this.handleRemoveBankTransCategory}
              />
            )}

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
                  height: 68,
                  backgroundColor: '#002059',
                  width: '100%',
                  paddingTop: 0,
                  paddingLeft: 10,
                  paddingRight: 10,
                }}>
                  <View style={cs(
                    !isRtl,
                    [styles.container, {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }],
                    commonStyles.rowReverse,
                  )}>
                    <View>
                      <TouchableOpacity onPress={this.setModalUnVisible}>
                        <Text style={{
                          fontSize: sp(16),
                          color: '#ffffff',
                          fontFamily: fonts.semiBold,
                        }}>ביטול</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text numberOfLines={1} ellipsizeMode="tail"
                        style={{ fontSize: sp(20), color: '#ffffff', fontFamily: fonts.semiBold }}>
                        {saveOriginObj.mainDescription}
                      </Text>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={{
                        fontSize: sp(18),
                        fontFamily: fonts.regular,
                        color: colors.white,
                      }}>
                        {dateToFromNowDaily(saveOriginObj.transDate, t, 'DD/MM')}
                      </Text>
                    </View>
                    <View>
                      <TouchableOpacity
                        activeOpacity={(!userDescriptionNoValid) ? 0.2 : 1}
                        onPress={this.update}>
                        <Text style={[{
                          fontSize: sp(16),
                          color: '#ffffff',
                          fontFamily: fonts.semiBold,
                        }, { opacity: (!userDescriptionNoValid) ? 1 : 0.5 }]}>שמירה</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                <View style={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#ffffff',
                  marginTop: 38,
                  marginBottom: 0,
                  paddingLeft: 0,
                  paddingRight: 0,
                  flex: 1,
                }}>
                  <KeyboardAwareScrollView enableOnAndroid>
                    <View
                      style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                        paddingLeft: 10,
                      }]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          lineHeight: 42,
                        }}>תיאור</Text>
                      </View>
                      <View style={[{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                        alignItems: 'flex-end',
                      }, cs(this.state.userDescriptionNoValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                        <TextInput
                          editable
                          autoCorrect={false}
                          keyboardType="default"
                          style={[{
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            width: '100%',
                          }, commonStyles.regularFont]}
                          onEndEditing={(e) => {
                            let valuesSave = Object.assign({}, this.state.obj)
                            valuesSave.mainDescription = e.nativeEvent.text
                            this.setState({
                              obj: valuesSave,
                              userDescriptionNoValid: valuesSave.mainDescription === '',
                            })
                          }}
                          onChangeText={(userDescription) => {
                            let valuesSave = Object.assign({}, this.state.obj)
                            valuesSave.mainDescription = userDescription
                            this.setState({
                              obj: valuesSave,
                              userDescriptionNoValid: valuesSave.mainDescription === '',
                            })
                          }}
                          value={this.state.obj.mainDescription}
                          underlineColorAndroid="transparent"
                        />
                      </View>
                    </View>

                    <View
                      style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 71,
                        paddingLeft: 10,
                      }]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          lineHeight: 42,
                        }}>קטגוריה</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }}>
                        <TouchableOpacity
                          style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }]}
                          onPress={this.editInput}>
                          <View style={{
                            marginRight: 'auto',
                          }}>
                            <Icon name="chevron-left" size={24} color={colors.blue34} />
                          </View>
                          <Text style={[{
                            textAlign: 'right',
                            color: '#0f3860',
                            fontSize: sp(15),
                            lineHeight: 42,
                          }, commonStyles.regularFont]}>
                            {this.state.obj.transTypeName}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 10,
                      alignSelf: 'center',
                      alignItems: 'center',
                      alignContent: 'center',
                      justifyContent: 'center',
                    }]}>
                      <Text style={{
                        textAlign: 'center',
                        fontFamily: fonts.regular,
                        color: '#022258',
                        fontSize: sp(26),
                        paddingHorizontal: 5,
                      }}>היסטוריה</Text>
                      <CustomIcon
                        name={'graph-alt'}
                        size={18}
                        color={colors.blue7}
                      />
                    </View>
                    <View style={[commonStyles.row, {
                      height: 300,
                      width: '100%',
                      backgroundColor: '#e4eef3',
                    }]}>
                      <View style={{
                        flex: 1,
                        position: 'absolute',
                        top: 40,
                        left: 0,
                        right: 0,
                        bottom: 5,
                        zIndex: 2,
                      }}>
                        <View style={{
                          width: '98%',
                          flexDirection: 'row-reverse',
                          flex: 1,
                          alignSelf: 'center',
                          alignItems: 'center',
                          alignContent: 'center',
                          justifyContent: 'center',
                        }}>
                          {inProgress
                            ? <ActivityIndicator color="#999999"/>
                            : <Graph
                              pressed={this.pressed}
                              dataGraph={dataGraph}
                            />}
                        </View>
                      </View>
                      <View style={{
                        flex: 1,
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        zIndex: 1,
                      }}>
                        {[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((gr, i) => {
                          return (
                            <View
                              key={i}
                              style={{
                                flexDirection: 'column',
                                flex: 1,
                                justifyContent: 'center',
                              }}>
                              <View style={{
                                flexDirection: 'row',
                                flex: 1,
                                justifyContent: 'center',
                                borderBottomWidth: 1,
                                borderBottomColor: '#dee7ec',
                              }}>
                                {
                                  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1].map((c, i1) => {
                                    return (
                                      <View key={i1} style={{
                                        flex: 1,
                                        borderRightWidth: 0.5,
                                        borderRightColor: '#dee7ec',
                                        borderLeftWidth: 0.5,
                                        borderLeftColor: '#dee7ec',
                                      }} />
                                    )
                                  })
                                }
                              </View>
                            </View>
                          )
                        })}
                      </View>
                    </View>
                  </KeyboardAwareScrollView>
                </View>

              </View>
            </SafeAreaView>
          </Modal>
        </View>
      )
    }
}
