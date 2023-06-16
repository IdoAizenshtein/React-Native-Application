import React, { PureComponent } from 'react'
import {
  Keyboard,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import { withTranslation } from 'react-i18next'
import { Icon } from 'react-native-elements'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import { colors, fonts } from '../../styles/vars'
import { combineStyles as cs, getEmoji, sp } from '../../utils/func'
import commonStyles from '../../styles/styles'
import AccountIcon from 'src/components/AccountIcon/AccountIcon'

import { connect } from 'react-redux'
import {
  createAccountCflTransTypeApi,
  createMutavApi,
  existingMutavApi,
  getAccountCflTransTypeApi,
  removeAccountCflTransTypeApi,
  updateMutavApi,
} from '../../api'
import BankModal
  from '../../screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/components/BankModal'
import styles
  from '../../screens/SettingsScreen/components/BaseTokenTab/components/AddTokenModal/AddTokenModalStyles'
import { IS_IOS } from '../../constants/common'

@connect(state => ({
  searchkey: state.searchkey,
  showPopAlertCash: state.showPopAlertCash,
}))
@withTranslation()
export default class AddMutav extends PureComponent {
  constructor (props) {
    super(props)
    const isEdit = props.isEdit
    this.progress = false
    this.state = {
      save: false,
      distableEdit: !!(props.isEdit && props.isEdit.fakeMutav === false),
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
      bankModalIsOpen: false,
      transTypeId: isEdit ? {
        companyId: '00000000-0000-0000-0000-000000000000',
        createDefaultSupplier: true,
        iconType: 'No category',
        shonaScreen: true,
        transTypeId: isEdit.transTypeId,
        transTypeName: 'ללא קטגוריה 1',
      } : {
        companyId: '00000000-0000-0000-0000-000000000000',
        createDefaultSupplier: true,
        iconType: 'No category',
        shonaScreen: true,
        transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
        transTypeName: 'ללא קטגוריה 1',
      },
      accountMutavHp: isEdit ? isEdit.accountMutavHp : null,
      accountMutavName: isEdit ? isEdit.accountMutavName : null,
      bankId: isEdit ? isEdit.bankId : null,
      snifId: isEdit ? isEdit.snifId : null,
      accountId: isEdit ? isEdit.accountId : null,
      companyAccountId: props.companyAccountId,
      companyId: props.companyId,
      contactMail: isEdit ? isEdit.contactMail : null,
      contactName: isEdit ? isEdit.contactName : null,
      contactPhone: isEdit ? isEdit.contactPhone : null,
      paymentDesc: isEdit ? isEdit.paymentDesc : props.paymentDesc,
      accountMutavNameValid: true,
      bankIdValid: true,
      snifIdValid: true,
      accountIdValid: true,
      emailSide: 'right',
      companyIdSide: 'right',
      billingAccountPhoneSide: 'right',
      contactMailValid: true,
      mailIsHebrew: false,
      companyHpValid: true,
      contactPhoneValid: true,
      inProgress: false,
      existingMutav: false,
      saveDataId: {
        bankId: isEdit ? isEdit.bankId : null,
        snifId: isEdit ? isEdit.snifId : null,
        accountId: isEdit ? isEdit.accountId : null,
      },
    }
    if (isEdit && this.props.companyId) {
      getAccountCflTransTypeApi.post({ body: { uuid: this.props.companyId } })
        .then(data => {
          const categories = data.filter(c => c.shonaScreen)
          const transTypeId = categories.find(
            (item) => item.transTypeId === isEdit.transTypeId)
          this.setState({
            transTypeId,
          })
        })
    }
  }

  handleSelectCategory = (category) => {
    const { currentEditBankTrans } = this.state
    if (!currentEditBankTrans || currentEditBankTrans.transTypeId ===
      category.transTypeId) {
      return
    }

    const newBankTrans = {
      ...currentEditBankTrans,
      iconType: category.iconType,
      transTypeId: category.transTypeId,
      transTypeName: category.transTypeName,
    }
    this.setState({
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
      transTypeId: { ...newBankTrans },
    })
  };

    handleCloseCategoriesModal = () => {
      this.setState({
        categoriesModalIsOpen: false,
        currentEditBankTrans: null,
      })
    };

    handleOpenCategoriesModal = (bankTransId) => () => {
      this.setState({
        categoriesModalIsOpen: true,
        currentEditBankTrans: bankTransId,
      })
    };

    handleRemoveBankTransCategory = (transTypeId) => {
      const { companyId } = this.props
      return removeAccountCflTransTypeApi.post({
        body: {
          transTypeId,
          companyId: companyId,
        },
      })
    };

    handleCreateBankTransCategory = (transTypeName) => {
      const { companyId } = this.props
      return createAccountCflTransTypeApi.post({
        body: {
          'transTypeId': null,
          transTypeName,
          companyId: companyId,
        },
      })
    };

  componentDidMount () {

  }

    existingMutav = () => {
      const {
        bankId,
        accountId,
        snifId,
        companyId,
        saveDataId,
        save,
        inProgress,
      } = this.state
      // console.log({
      //   'accountId': Number(accountId),
      //   'bankId': Number(bankId),
      //   'companyId': companyId,
      //   'snifId': Number(snifId),
      // })
      if ((
        saveDataId.bankId !== Number(bankId) ||
        saveDataId.accountId !== Number(accountId) ||
        saveDataId.snifId !== Number(snifId)
      ) && !save && !inProgress) {
        this.setState({ inProgress: true })

        existingMutavApi.post({
          body: {
            'accountId': Number(accountId),
            'bankId': Number(bankId),
            'companyId': companyId,
            'snifId': Number(snifId),
          },
        })
          .then((res) => {
            if (res.length) {
              this.setState({
                existingMutav: res[0],
                inProgress: false,
              })
            } else {
              this.setState({
                existingMutav: false,
                inProgress: false,
              })
            }
          })
          .catch(() => {
            // this.setState({ inProgress: false })
          })
      } else {
        this.setState({
          existingMutav: false,
          inProgress: false,
        })
      }
    };

    update = () => {
      const { update, isEdit } = this.props
      const {
        inProgress,
        bankId,
        accountId,
        accountMutavName,
        snifId,
        accountMutavNameValid,
        bankIdValid,
        snifIdValid,
        accountIdValid,
        mailIsHebrew,
        contactMailValid,
        companyHpValid,
        contactPhoneValid,
        transTypeId,
        accountMutavHp,
        companyId,
        contactMail,
        contactName,
        contactPhone,
        paymentDesc,
        companyAccountId,
        existingMutav,
        saveDataId,
        save,
      } = this.state

      if (this.progress || inProgress || !(
        !existingMutav &&
        (!mailIsHebrew) &&
        (contactPhoneValid && companyHpValid && contactMailValid &&
          accountMutavNameValid && snifIdValid && accountIdValid &&
          bankIdValid) &&
        ((bankId !== null) && String(accountMutavName).length > 0 &&
          String(accountId).length > 0 && String(snifId).length > 0)
      )) {
        return
      }

      Keyboard.dismiss()
      if ((
        saveDataId.bankId !== Number(bankId) ||
        saveDataId.accountId !== Number(accountId) ||
        saveDataId.snifId !== Number(snifId)
      ) && !save && !inProgress && !this.progress) {
        this.progress = true
        this.setState({
          inProgress: true,
          save: true,
        })

        existingMutavApi.post({
          body: {
            'accountId': Number(accountId),
            'bankId': Number(bankId),
            'companyId': companyId,
            'snifId': Number(snifId),
          },
        })
          .then((res) => {
            if (res.length) {
              this.setState({
                existingMutav: res[0],
                inProgress: false,
                save: false,
              })
              this.progress = false
            } else {
              this.setState({
                existingMutav: false,
                inProgress: false,
              })

              if (isEdit) {
                const obj = {
                  'accountId': Number(accountId),
                  'accountMutavHp': Number(accountMutavHp),
                  'accountMutavName': accountMutavName,
                  'bankId': Number(bankId),
                  'biziboxMutavId': isEdit.biziboxMutavId,
                  'companyId': companyId,
                  'contactMail': contactMail,
                  'contactName': contactName,
                  'contactPhone': contactPhone,
                  'snifId': Number(snifId),
                  'transTypeId': transTypeId.transTypeId,
                }
                updateMutavApi.post({
                  body: obj,
                })
                  .then(() => {
                    // updateMutavCategoryApi.post({
                    //   body: {
                    //     'biziboxMutavId': isEdit.biziboxMutavId,
                    //     'companyId': companyId,
                    //     'transId': null,
                    //     'transTypeId': transTypeId.transTypeId,
                    //     'updateType': 'future',
                    //   },
                    // })
                    //   .then(() => {
                    //     this.setState({ inProgress: false })
                    //     update()
                    //   })
                    //   .catch(() => {
                    //     this.setState({ inProgress: false })
                    //   })
                    this.setState({
                      inProgress: false,
                      save: false,
                    })
                    this.progress = false
                    update()
                  })
                  .catch(() => {
                    this.setState({
                      inProgress: false,
                      save: false,
                    })
                    this.progress = false
                  })
              } else {
                const obj = {
                  'accountId': Number(accountId),
                  'accountMutavHp': Number(accountMutavHp),
                  'accountMutavName': accountMutavName,
                  'bankId': Number(bankId),
                  'companyAccountId': companyAccountId,
                  'companyId': companyId,
                  'contactMail': contactMail,
                  'contactName': contactName,
                  'contactPhone': contactPhone,
                  'paymentDesc': paymentDesc,
                  'snifId': Number(snifId),
                  'transTypeId': transTypeId.transTypeId,
                }

                createMutavApi.post({
                  body: obj,
                })
                  .then(() => {
                    this.setState({
                      inProgress: false,
                      save: false,
                    })
                    this.progress = false
                    update()
                  })
                  .catch(() => {
                    this.setState({
                      inProgress: false,
                      save: false,
                    })
                    this.progress = false
                  })
              }
            }
          })
          .catch(() => {
            // this.setState({ inProgress: false })
          })
      } else if (!inProgress && !this.progress) {
        this.progress = true
        this.setState({
          existingMutav: false,
          inProgress: true,
        })

        if (isEdit) {
          const obj = {
            'accountId': Number(accountId),
            'accountMutavHp': Number(accountMutavHp),
            'accountMutavName': accountMutavName,
            'bankId': Number(bankId),
            'biziboxMutavId': isEdit.biziboxMutavId,
            'companyId': companyId,
            'contactMail': contactMail,
            'contactName': contactName,
            'contactPhone': contactPhone,
            'snifId': Number(snifId),
            'transTypeId': transTypeId.transTypeId,
          }
          updateMutavApi.post({
            body: obj,
          })
            .then(() => {
              this.setState({
                inProgress: false,
                save: false,
              })
              this.progress = false
              update()
            })
            .catch(() => {
              this.setState({
                inProgress: false,
                save: false,
              })
              this.progress = false
            })
        } else {
          const obj = {
            'accountId': Number(accountId),
            'accountMutavHp': Number(accountMutavHp),
            'accountMutavName': accountMutavName,
            'bankId': Number(bankId),
            'companyAccountId': companyAccountId,
            'companyId': companyId,
            'contactMail': contactMail,
            'contactName': contactName,
            'contactPhone': contactPhone,
            'paymentDesc': paymentDesc,
            'snifId': Number(snifId),
            'transTypeId': transTypeId.transTypeId,
          }

          createMutavApi.post({
            body: obj,
          })
            .then(() => {
              this.setState({
                inProgress: false,
                save: false,
              })
              this.progress = false
              update()
            })
            .catch(() => {
              this.setState({
                inProgress: false,
                save: false,
              })
              this.progress = false
            })
        }
      }
    };

  handleToggleBankModal = () => this.setState(
    { bankModalIsOpen: !this.state.bankModalIsOpen })

    handleChangeBankId = (bankId) => {
      this.setState({
        bankId: bankId,
        existingMutav: false,
      })
      const {
        accountId,
        snifId,
        inProgress,
      } = this.state

      if (bankId && snifId && accountId && !inProgress) {
        this.existingMutav()
      }
    };

    handleUpdateField = name => val => {
      let value = val || ''
      value = value.toString().replace(getEmoji(), '')

      if (name === 'contactMail') {
        value = value.toString().replace(/([\u05D0-\u05FF/\s+]+)/g, '')
      } else if (name === 'contactPhone') {
        value = value.toString().replace(/[^\d-]/g, '')
      } else if (name === 'accountMutavHp' || name === 'snifId' || name ===
        'accountId') {
        value = value.toString().replace(/[^\d]/g, '')
      }

      this.setState({
        [name]: value,
        existingMutav: false,
      })

      if (name !== 'contactName') {
        if (name === 'accountMutavHp') {
          this.handleUpdateFieldValid('companyHpValid', true)({
            nativeEvent: {
              text: value,
            },
          })
        } else {
          this.handleUpdateFieldValid(`${name}Valid`, true)({
            nativeEvent: {
              text: value,
            },
          })
        }
      }
    };

    onFocusInput = name => val => {
      this.setState({
        [name]: 'left',
      })
    };

    handleUpdateFieldValid = (name, isNotBlur, isRun) => val => {
      if (isRun === undefined || isRun) {
        let value = val.nativeEvent.text || ''

        if (name === 'contactMailValid') {
          const re = /\S+@\S+\.\S+/
          const isHebrew = !!(value && value.length > 0 &&
            /[\u0590-\u05FF]/.test(value))
          const contactMailValid = !!(value && value.length > 0 &&
            re.test(value))
          this.setState({
            [name]: (!value || (value && value.length === 0))
              ? true
              : contactMailValid,
            mailIsHebrew: isHebrew,
          })
        } else if (name === 'contactPhoneValid') {
          this.setState({
            billingAccountPhoneSide: 'right',
            [name]: (!value || (value && value.length === 0))
              ? true
              : !!(value && (value.length === 10 || value.length === 11) &&
                new RegExp(
                  '(050|052|053|054|055|057|058|02|03|04|08|09|072|073|076|077|078)-?\\d{7,7}').test(
                  value)),
          })
        } else if (name === 'companyHpValid') {
          let result = false
          const c = {
            value: Number(value),
          }
          if (c.value) {
            const digits = Array.from(
              String(c.value).replace(/\D/g, '').padStart(9, '0'))
              .map(ch => +ch)

            if (digits.length === 9) {
              let sum = 0
              let multiplyDigit = 0

              for (let idx = 0; idx < digits.length; idx++) {
                const dig = digits[idx]
                if (idx % 2 === 1) {
                  multiplyDigit = dig * 2
                  sum += (multiplyDigit > 9) ? multiplyDigit - 9 : multiplyDigit
                } else {
                  sum += dig
                }
              }

              result = sum % 10 === 0
            }
          }
          this.setState({
            [name]: (!value || (value && value.length === 0))
              ? true
              : !!(value && (value.length === 9 && result)),
            companyIdSide: 'right',
          })
        } else {
          this.setState(
            { [name]: value && (value.length !== 0 && value.length < 30) })
          if (!isNotBlur) {
            const {
              bankId,
              accountId,
              snifId,
              inProgress,
            } = this.state

            if (bankId && snifId && accountId && !inProgress) {
              this.existingMutav()
            }
          }
        }
      }
    };
    handleUpdateFieldValidAsync = (e) => {
      this.setState({
        emailSide: 'right',
      })
      const { contactMail } = this.state
      const re = /\S+@\S+\.\S+/
      let val = (IS_IOS ? e.nativeEvent.text : contactMail) || ''
      if (!(val && re.test(val) && val.length > 0)) {
        const isHebrew = (val && /[\u0590-\u05FF]/.test(val))
        this.setState({
          'contactMailValid': (!val || (val && val.length === 0)),
          mailIsHebrew: isHebrew,
        })
      }
    };

  render () {
    const {
      categoriesModalIsOpen,
      currentEditBankTrans,
      bankModalIsOpen,
      bankId,
      accountId,
      transTypeId,
      accountMutavHp,
      accountMutavName,
      contactMail,
      contactName,
      contactPhone,
      snifId,
      accountMutavNameValid,
      bankIdValid,
      snifIdValid,
      accountIdValid,
      emailSide,
      companyIdSide,
      billingAccountPhoneSide,
      mailIsHebrew,
      contactMailValid,
      companyHpValid,
      contactPhoneValid,
      companyId,
      existingMutav,
      distableEdit,
    } = this.state
    const { isRtl, closeModal, t, isEdit } = this.props
    return (
      <View>
        <Modal
          animationType="slide"
          transparent={false}
          visible>

          {categoriesModalIsOpen && (
            <CategoriesModal
              isOpen
              isRtl={isRtl}
              companyId={companyId}
              bankTrans={currentEditBankTrans}
              onClose={this.handleCloseCategoriesModal}
              onUpdateBankTrans={this.handleSelectCategory}
              onSelectCategory={this.handleSelectCategory}
              onCreateCategory={this.handleCreateBankTransCategory}
              onRemoveCategory={this.handleRemoveBankTransCategory}
            />
          )}

          {bankModalIsOpen && (
            <BankModal
              selectedBankId={bankId}
              onClose={this.handleToggleBankModal}
              onChange={this.handleChangeBankId}
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
                height: 60,
                backgroundColor: '#002059',
                width: '100%',
                paddingTop: 0,
                paddingLeft: 10,
                paddingRight: 10,
              }}>
                <View style={cs(
                  isRtl,
                  [
                    {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }],
                  commonStyles.rowReverse,
                )}>
                  <View>
                    <TouchableOpacity onPress={closeModal}>
                      <Text style={{
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>ביטול</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{
                      fontSize: sp(20),
                      color: '#ffffff',
                      fontFamily: fonts.semiBold,
                    }}>
                      {isEdit ? 'עריכת מוטב' : 'מוטב חדש'}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      onPress={this.update}>
                      <Text style={{
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>שמירה</Text>
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
                paddingRight: 10,
                flex: 1,
              }}>
                <KeyboardAwareScrollView enableOnAndroid={true}>
                  <View style={[
                    cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }, cs(distableEdit, { opacity: 1 }, { opacity: 0.5 })]}>
                    <View style={{ flex: 2.2 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        fontFamily: fonts.regular,
                        textAlign: 'center',
                        lineHeight: 42,
                      }}>שם המוטב</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.5,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs(!accountMutavNameValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        editable={!distableEdit}
                        maxLength={30}
                        autoCorrect={false}
                        autoCapitalize="sentences"
                        returnKeyType="done"
                        keyboardType="default"
                        underlineColorAndroid="transparent"
                        style={[
                          {
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            width: '100%',
                          }, commonStyles.regularFont]}
                        onEndEditing={this.handleUpdateFieldValid(
                          'accountMutavNameValid', false, !IS_IOS)}
                        onBlur={this.handleUpdateFieldValid(
                          'accountMutavNameValid', false, IS_IOS)}
                        onChangeText={this.handleUpdateField(
                          'accountMutavName')}
                        value={accountMutavName}
                      />
                    </View>
                  </View>

                  <View style={[
                    cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }, cs(distableEdit, { opacity: 1 }, { opacity: 0.5 })]}>
                    <View style={{ flex: 2.2 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        fontFamily: fonts.regular,
                        textAlign: 'center',
                        lineHeight: 42,
                      }}>בנק</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.5,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs(!bankIdValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TouchableOpacity
                        activeOpacity={(distableEdit) ? 1 : 0.5}
                        style={[
                          cs(isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }]}
                        onPress={!distableEdit
                          ? this.handleToggleBankModal
                          : null}>
                        <View style={{
                          marginRight: 'auto',
                        }}>
                          <Icon name="chevron-left" size={24}
                                color={colors.blue34}/>
                        </View>
                        {bankId && (
                          <View style={[
                            commonStyles.row, commonStyles.alignItemsCenter, {
                              textAlign: 'right',
                              color: '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                            <Text style={styles.bankName}>{t(
                              `bankName:${bankId}`)}</Text>
                            <AccountIcon account={{ bankId }}/>
                          </View>
                        )}
                        {!bankId && (
                          <Text style={[
                            {
                              textAlign: 'right',
                              color: '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                            {'בחירה'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(distableEdit, { opacity: 1 }, { opacity: 0.5 })]}>

                    <View style={{ flex: 2.2 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        textAlign: 'center',
                        lineHeight: 42,
                      }}>סניף</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.5,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs(!snifIdValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        autoCorrect={false}
                        editable={!distableEdit}
                        keyboardType="numeric"
                        style={[
                          {
                            direction: 'ltr',
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            width: '100%',
                          }, commonStyles.regularFont]}
                        onEndEditing={this.handleUpdateFieldValid('snifIdValid',
                          false, !IS_IOS)}
                        onBlur={this.handleUpdateFieldValid('snifIdValid',
                          false, IS_IOS)}
                        onChangeText={this.handleUpdateField('snifId')}
                        value={snifId ? String(snifId) : ''}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(distableEdit, { opacity: 1 }, { opacity: 0.5 })]}>
                    <View style={{ flex: 2.2 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        textAlign: 'center',
                        fontFamily: fonts.regular,
                        lineHeight: 42,
                      }}>מספר חשבון</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.5,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs((!accountIdValid || existingMutav), {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        autoCorrect={false}
                        editable={!distableEdit}
                        keyboardType="numeric"
                        style={[
                          {
                            direction: 'ltr',
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            width: '100%',
                          }, commonStyles.regularFont]}
                        onEndEditing={this.handleUpdateFieldValid(
                          'accountIdValid', false, !IS_IOS)}
                        onBlur={this.handleUpdateFieldValid('accountIdValid',
                          false, IS_IOS)}
                        onChangeText={this.handleUpdateField('accountId')}
                        value={accountId ? String(accountId) : ''}
                        underlineColorAndroid="transparent"
                      />
                    </View>
                  </View>

                  <View
                    style={[
                      cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                    <View style={{ flex: 2.2 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        fontFamily: fonts.regular,
                        textAlign: 'center',
                        lineHeight: 42,
                      }}>קטגוריה</Text>
                    </View>
                    <View style={{
                      flex: 5.5,
                      backgroundColor: '#f5f5f5',
                      paddingHorizontal: 21,
                      borderBottomRightRadius: 20,
                      borderTopRightRadius: 20,
                    }}>
                      <TouchableOpacity
                        style={[
                          cs(isRtl, commonStyles.row,
                            [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }]}
                        onPress={this.handleOpenCategoriesModal(transTypeId)}
                      >
                        <View style={{
                          marginRight: 'auto',
                        }}>
                          <Icon name="chevron-left" size={24}
                                color={colors.blue34}/>
                        </View>
                        <Text style={[
                          {
                            textAlign: 'right',
                            color: '#0f3860',
                            fontSize: sp(15),
                            lineHeight: 42,
                          }, commonStyles.regularFont]}>
                          {transTypeId.transTypeName}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={[
                    cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }]}>
                    <View style={{ flex: 2.2 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        fontFamily: fonts.regular,
                        textAlign: 'center',
                        lineHeight: 42,
                      }}>איש קשר</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.5,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }]}>
                      <TextInput
                        placeholder={'לא חובה'}
                        placeholderTextColor={'#88909e'}
                        editable
                        maxLength={30}
                        autoCorrect={false}
                        autoCapitalize="sentences"
                        returnKeyType="done"
                        keyboardType="default"
                        underlineColorAndroid="transparent"
                        style={[
                          {
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            width: '100%',
                          }, commonStyles.regularFont]}
                        onEndEditing={(e) => {
                          this.setState({
                            contactName: e.nativeEvent.text.toString()
                              .replace(getEmoji(), ''),
                          })
                        }}
                        onChangeText={this.handleUpdateField('contactName')}
                        value={contactName}
                      />
                    </View>
                  </View>

                  <View style={[
                    cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: (mailIsHebrew || !contactMailValid) ? 0 : 8,
                    }]}>
                    <View style={{ flex: 2.2 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        fontFamily: fonts.regular,
                        textAlign: 'center',
                        lineHeight: 42,
                      }}>מייל</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.5,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs((!contactMailValid), {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        placeholder={'לא חובה'}
                        placeholderTextColor={'#88909e'}
                        editable
                        style={[
                          {
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            textAlign: (!contactMail ||
                              (contactMail && contactMail.length === 0))
                              ? 'right'
                              : emailSide,
                            width: '100%',
                          }, commonStyles.regularFont]}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="done"
                        keyboardType="email-address"
                        underlineColorAndroid="transparent"
                        onEndEditing={this.handleUpdateFieldValid(
                          'contactMailValid')}
                        onFocus={this.onFocusInput('emailSide')}
                        onBlur={this.handleUpdateFieldValidAsync}
                        onChangeText={this.handleUpdateField('contactMail')}
                        value={contactMail}
                      />
                    </View>
                  </View>

                  {(mailIsHebrew || !contactMailValid) && (
                    <View
                      style={[
                        cs(!isRtl, commonStyles.row,
                          [commonStyles.rowReverse])]}>
                      <View style={{ flex: 2.2 }}/>
                      <View style={[
                        {
                          flex: 5.5,
                        }]}>
                        {(mailIsHebrew === true) && (
                          <Text style={[
                            {
                              width: '100%',
                              marginVertical: 0,
                              color: colors.red7,
                              fontSize: sp(14),
                              textAlign: 'right',
                              fontFamily: fonts.regular,
                            }]}>
                            {'שימו לב - המקלדת בעברית'}
                          </Text>
                        )}

                        {(contactMailValid === false) && (
                          <Text style={[
                            {
                              width: '100%',
                              marginVertical: 0,
                              color: colors.red7,
                              fontSize: sp(14),
                              textAlign: 'right',
                              fontFamily: fonts.regular,
                            }]}>
                            {'נראה שנפלה טעות במייל, אנא בדקו שנית'}
                          </Text>
                        )}
                      </View>
                    </View>
                  )}

                  <View style={[
                    cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }]}>
                    <View style={{ flex: 2.2 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        fontFamily: fonts.regular,
                        textAlign: 'center',
                        lineHeight: 42,
                      }}>טלפון</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.5,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs((!contactPhoneValid), {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        placeholder={'לא חובה'}
                        placeholderTextColor={'#88909e'}
                        editable
                        maxLength={11}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="done"
                        keyboardType="numeric"
                        underlineColorAndroid="transparent"
                        style={[
                          {
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            textAlign: (!contactPhone ||
                              (contactPhone && contactPhone.length === 0))
                              ? 'right'
                              : billingAccountPhoneSide,
                            width: '100%',
                          }, commonStyles.regularFont]}
                        onEndEditing={(e) => {
                          this.setState({
                            contactPhone: e.nativeEvent.text.toString()
                              .replace(/[^\d-]/g, ''),
                          })
                          this.handleUpdateFieldValid('contactPhoneValid')(e)
                        }}
                        onFocus={this.onFocusInput('billingAccountPhoneSide')}
                        onBlur={this.handleUpdateFieldValid(
                          'contactPhoneValid')}
                        onChangeText={this.handleUpdateField('contactPhone')}
                        value={contactPhone}
                      />
                    </View>
                  </View>

                  <View style={[
                    cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }]}>
                    <View style={{ flex: 2.2 }}>
                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(13),
                        fontFamily: fonts.regular,
                        textAlign: 'center',
                        lineHeight: 42,
                      }}> ע.מ
                        /
                        ח.פ</Text>
                    </View>
                    <View style={[
                      {
                        flex: 5.5,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs(!companyHpValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                      <TextInput
                        placeholder={'לא חובה'}
                        placeholderTextColor={'#88909e'}
                        editable
                        maxLength={9}
                        autoCorrect={false}
                        autoCapitalize="none"
                        returnKeyType="done"
                        keyboardType="numeric"
                        underlineColorAndroid="transparent"
                        style={[
                          {
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            textAlign: (!accountMutavHp || (accountMutavHp &&
                              String(accountMutavHp).length === 0))
                              ? 'right'
                              : companyIdSide,
                            width: '100%',
                          }, commonStyles.regularFont]}
                        onEndEditing={(e) => {
                          this.setState({
                            accountMutavHp: e.nativeEvent.text.toString()
                              .replace(/[^\d]/g, ''),
                          })
                          this.handleUpdateFieldValid('companyHpValid')(e)
                        }}
                        onFocus={this.onFocusInput('companyIdSide')}
                        onBlur={this.handleUpdateFieldValid('companyHpValid')}
                        onChangeText={this.handleUpdateField('accountMutavHp')}
                        value={accountMutavHp ? String(accountMutavHp) : ''}
                      />
                    </View>

                  </View>

                  {(existingMutav) && (
                    <Text style={[
                      {
                        width: '100%',
                        marginVertical: 0,
                        color: colors.red7,
                        fontSize: sp(14),
                        textAlign: 'right',
                        fontFamily: fonts.regular,
                      }]}>
                      {existingMutav.ACCOUNT_MUTAV_NAME} {'מספר חשבון זה כבר קיים עבור מוטב '}
                    </Text>
                  )}
                </KeyboardAwareScrollView>
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    )
    }
}
