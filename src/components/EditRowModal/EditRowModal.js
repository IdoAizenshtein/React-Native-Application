import React, {Fragment, PureComponent} from 'react'
import {
  Animated,
  Image,
  Modal,
  ScrollView,
  SectionList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,

} from 'react-native'
// import { SafeAreaView } from 'react-native-safe-area-context';
import {withTranslation} from 'react-i18next'
import {colors, fonts} from '../../styles/vars'
import styles from './EditRowModalStyles'
import CustomIcon from '../Icons/Fontello'
import {combineStyles as cs, getFormattedValueArray, sp} from '../../utils/func'
import commonStyles from '../../styles/styles'
import AccountIcon from '../AccountIcon/AccountIcon'
import AppTimezone from '../../utils/appTimezone'
import CheckList from './CheckList'
import {Calendar} from 'react-native-calendars'
import {CheckBox, Icon} from 'react-native-elements'
import Api from '../../api/Api'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {IS_IOS} from '../../constants/common'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import {
  accountCflDataUpdateApi,
  cashFlowUnionBankDetApi,
  createAccountCflTransTypeApi,
  getMutavApi,
  removeAccountCflTransTypeApi,
} from '../../api'
import {connect} from 'react-redux'
import Loader from 'src/components/Loader/Loader'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import {ActionSheet, ActionSheetItem} from 'react-native-action-sheet-component'
import AddMutav from '../AddMutav/AddMutav'
import {exampleCompany} from '../../redux/constants/account'

const inputWorkaround = (() => {
  let workaroundIncrement = 0
  const invisibleCharsArr = [
    String.fromCharCode(28),
    String.fromCharCode(29),
    String.fromCharCode(30),
    String.fromCharCode(31),
  ]
  return {
    getWorkaroundChar: () => {
      workaroundIncrement += 1
      const mod = workaroundIncrement % invisibleCharsArr.length
      return IS_IOS ? invisibleCharsArr[mod] : ''
    },
  }
})()

@connect(state => ({
  searchkey: state.searchkey,
}))
@withTranslation()
export default class EditRowModal extends PureComponent {
  today = AppTimezone.moment().valueOf()

  constructor (props) {
    super(props)
    let targetType
    if (props.screen === 'CashFlowScreen' || props.screen === 'CyclicTransScreen') {
      targetType = props.dataOfRow.targetType
    } else if (props.screen === 'BankMatchScreen') {
      targetType = props.dataOfRow.targetTypeName
      props.dataOfRow.asmachta = props.dataOfRow.targetAsmachta
    }

    if (!props.dataOfRow.transType) {
      props.dataOfRow.transType = {
        companyId: '00000000-0000-0000-0000-000000000000',
        createDefaultSupplier: true,
        iconType: 'No category',
        shonaScreen: true,
        transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
        transTypeName: 'ללא קטגוריה',
      }
    }

    let dataRow = {}
    if (props.screen === 'CyclicTransScreen') {
      dataRow = props.dataOfRow
      if (!dataRow.autoUpdateTypeName || (dataRow.autoUpdateTypeName && dataRow.autoUpdateTypeName !== 'USER_DEFINED_TOTAL' && dataRow.autoUpdateTypeName !== 'USER_CURRENT_TOTAL')) {
        dataRow.autoUpdateTypeName = 'AVG_3_MONTHS'
      }
      if (!dataRow.transFrequencyName || dataRow.transFrequencyName === '') {
        dataRow.transFrequencyName = 'NONE'
      }
      if (!dataRow.expirationDate) {
        dataRow.expirationDate = AppTimezone.moment().valueOf()
        dataRow.endDate = 'none'
      } else {
        dataRow.endDate = 'on'
      }
      dataRow.timesValue = 0

      if (targetType === 'CYCLIC_TRANS' && dataRow.mutavArray !== null && !Array.isArray(dataRow.mutavArray)) {
        dataRow.mutavArray = null
      }
    }

    dataRow.frequencyAutoUpdateTypeName = 'AVG_3_MONTHS'
    let paymentList = [
      {
        text: 'צ׳ק',
        id: 'Checks',
        selected: false,
      }, {
        text: 'העברה בנקאית',
        id: 'BankTransfer',
        selected: false,
      }, {
        text: 'אחר',
        id: 'Other',
        selected: false,
      },
    ]

    if (targetType === 'CYCLIC_TRANS') {
      paymentList = JSON.parse(JSON.stringify(this.props.searchkey.filter((it) => it.showInDrop))).map((it) => {
        return {
          text: it.name,
          id: it.paymentDescription,
          selected: false,
        }
      })
    }

    if ((targetType === 'WIRE_TRANSFER' || targetType === 'CHEQUE' || targetType === 'OTHER') && (!props.dataOfRow.biziboxMutavId)) {
      props.dataOfRow.biziboxMutavId = null
    }

    this.state = {
      focusAsmachtaInput: props.focusAsmachtaInput ? props.focusAsmachtaInput : false,
      idxObj: 0,
      mutavArray: null,
      mutavText: 'לא חובה',
      mutavText2: 'לא חובה',
      setTransDate: false,
      defDIRECTD: props.screen === 'CyclicTransScreen' ? dataRow.autoUpdateTypeName : null,
      dataOfRow: JSON.parse(JSON.stringify(props.dataOfRow)),
      saveOriginObj: JSON.parse(JSON.stringify(props.dataOfRow)),
      expirationDate: null,
      editRowModalIsOpen: false,
      editModalInsideIsOpen: false,
      timesValue: 0,
      tab: props.screen === 'CyclicTransScreen' ? 2 : 1,
      editSum: false,
      titleModalInside: '',
      targetOriginalDate: null,
      transDate: null,
      disabledGrTab1: this.getRulesEditTab1(targetType),
      disabledGrTab2: props.screen === 'CyclicTransScreen' ? this.getRulesEditTab2(targetType) : {
        account: true,
        transName: true,
        transTypeName: true,
        paymentDesc: true,
        transDate: true,
        total: true,
        transFrequencyName: true,
      },
      checkBoxChecked: targetType === 'CYCLIC_TRANS' && dataRow.autoUpdateTypeName === 'AVG_3_MONTHS',
      modalMutavShow: false,
      dataOfRowGroupSave: JSON.parse(JSON.stringify(dataRow)),
      dataOfRowGroup: JSON.parse(JSON.stringify(dataRow)),
      paymentList: paymentList,
      endDate: [
        {
          text: 'ללא סיום',
          id: 'none',
          selected: false,
        }, {
          text: 'לאחר',
          id: 'times',
          selected: false,
        }, {
          text: 'בתאריך',
          id: 'on',
          selected: false,
        },
      ],
      transFrequencyNameValid: true,
      autoUpdateTypeName: [
        {
          text: 'לפי ממוצע',
          id: 'AVG_3_MONTHS',
          selected: false,
        }, {
          text: 'לפי חיוב אחרון',
          id: 'LAST_BANK_TOTAL',
          selected: false,
        }, {
          text: 'לפי הסכום שהוקלד',
          id: 'USER_DEFINED_TOTAL',
          selected: false,
        },
      ],
      autoUpdateTypeNameDIRECTD: [
        {
          text: 'לפי ממוצע',
          id: 'AVG_3_MONTHS',
          selected: false,
        }, {
          text: 'לפי חיוב אחרון',
          id: 'LAST_BANK_TOTAL',
          selected: false,
        }, {
          text: 'קבוע ₪',
          id: 'USER_DEFINED_TOTAL',
          selected: false,
        },
      ],
      autoUpdateTypeName_SOLEK_TAZRIM: [
        {
          text: 'לפי ממוצע',
          id: 'AVG_3_MONTHS',
          selected: false,
        }, {
          text: 'קבוע',
          id: 'USER_DEFINED_TOTAL',
          selected: false,
        }, {
          text: 'לפי זיכויים בפועל',
          id: 'USER_CURRENT_TOTAL',
          selected: false,
        },
      ],
      autoUpdateTypeName_CCARD_TAZRIM: [
        {
          text: 'לפי ממוצע',
          id: 'AVG_3_MONTHS',
          selected: false,
        }, {
          text: 'קבוע ₪',
          id: 'USER_DEFINED_TOTAL',
          selected: false,
        }, {
          text: 'לפי חיוב אחרון',
          id: 'LAST_BANK_TOTAL',
          selected: false,
        }, {
          text: 'לפי חיובים בפועל',
          id: 'USER_CURRENT_TOTAL',
          selected: false,
        },
      ],
      targetTypeDIRECTD: false,
      transFrequencyName: [
        {
          text: 'יומי',
          id: 'DAY',
          selected: false,
        },
        {
          text: 'שבועי',
          id: 'WEEK',
          selected: false,
        },
        {
          text: 'חודשי',
          id: 'MONTH',
          selected: false,
        },
        {
          text: 'דו חודשי',
          id: 'TWO_MONTHS',
          selected: false,
        },
        {
          text: 'רבעוני',
          id: 'QUARTER',
          selected: false,
        },
      ],
      transFrequencyNameSolek: [
        {
          text: 'יומי',
          id: 'DAY',
          selected: false,
        },
        {
          text: 'שבועי',
          id: 'WEEK',
          selected: false,
        },
        {
          text: 'חודשי',
          id: 'MONTH',
          selected: false,
        },
      ],
      dataList: [],
      typeEditModal: null,
      categoriesModalIsOpen: false,
      currentEditBankTrans: null,
      biziboxMutavList: [],
      biziboxMutavListFilter: [],
      modalMutavListShow: false,
      currentMutav: '',
      inProgressMutavList: false,
      addMutavModal: false,
      biziboxMutavValid: true,
      mutavRow: null,
      modalMutavInsideShow: false,
      totalArrayNoValid: false,
      updateType: 'future',
      textCategory: false,
    }
  }

  isStatusReload (status) {
    if (status === 'CHEQUE' || status === 'OTHER' || status === 'WIRE_TRANSFER' || status === 'CYCLIC_TRANS') {
      return true
    }
    return false
  }

  componentDidCatch (error, errorInfo) {
    console.log('error----', error, errorInfo)
  }

  componentDidMount () {
    const { screen, currentCompanyId } = this.props
    const { dataOfRow, dataOfRowGroup } = this.state
    getMutavApi.post({ body: { uuid: this.props.currentCompanyId } })
      .then(data => {
        this.setState({
          currentMutav: '',
          biziboxMutavList: data,
        })

        let targetType
        if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
          targetType = dataOfRow.targetType
        } else if (screen === 'BankMatchScreen') {
          targetType = dataOfRow.targetTypeName
        }
        if (this.state.tab === 1 && targetType === 'CYCLIC_TRANS' && (screen === 'CashFlowScreen' ? dataOfRow.unionId : dataOfRow.kvuotUnionId)) {
          cashFlowUnionBankDetApi.post({
            body: {
              'companyId': currentCompanyId,
              'dateFrom': screen === 'CashFlowScreen' ? dataOfRow.kvuaDateFrom : dataOfRow.dateFrom,
              'transId': screen === 'CashFlowScreen' ? dataOfRow.transId : dataOfRow.kvuotUnionId,
            },
          })
            .then(res => {
              let mutavArray = res
              let valuesSave = Object.assign({}, this.state.dataOfRow)
              if (mutavArray && Array.isArray(mutavArray)) {
                mutavArray = mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
              }
              valuesSave.mutavArray = mutavArray
              // console.log('-----mutavArray', mutavArray)
              let mutavText = 'לא חובה'
              let textCategory = false

              if ((mutavArray && !Array.isArray(mutavArray)) || (Array.isArray(mutavArray) && mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null)) {
                if (Array.isArray(mutavArray)) {
                  mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
                } else {
                  mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray).accountMutavName
                }
                this.setState({
                  textCategory,
                  mutavText: mutavText,
                  dataOfRow: valuesSave,
                })
                setTimeout(() => {
                  this.prepareArrayOfMutavim()
                }, 50)
              } else if (mutavArray.length > 1) {
                mutavText = (mutavArray.length) + ' מוטבים'
                const transTypeIdCategory = [...new Set(mutavArray.map(x => x.transTypeId))]
                if (transTypeIdCategory.length > 1) {
                  textCategory = 'קטגוריות שונות'
                } else {
                  textCategory = mutavArray[0].transType ? mutavArray[0].transType.transTypeName : (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId).transTypeName : 'ללא קטגוריה'
                }
                this.setState({
                  textCategory,
                  disabledGrTab1: {
                    account: true,
                    transName: true,
                    transTypeName: true,
                    paymentDesc: false,
                    asmachta: false,
                    transDate: false,
                    total: true,
                  },
                  mutavText: mutavText,
                  dataOfRow: valuesSave,
                })
                setTimeout(() => {
                  this.prepareArrayOfMutavim()
                }, 50)
              }
            })
        } else if (this.state.tab === 1 && targetType === 'CYCLIC_TRANS' && (screen === 'CashFlowScreen' ? !dataOfRow.unionId : !dataOfRow.kvuotUnionId) && dataOfRow.biziboxMutavId) {
          let mutavArray = dataOfRow.biziboxMutavId
          let valuesSave = Object.assign({}, this.state.dataOfRow)
          if (mutavArray && Array.isArray(mutavArray)) {
            mutavArray = mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
          }
          valuesSave.mutavArray = mutavArray
          let mutavText = 'לא חובה'
          let textCategory = false

          if ((mutavArray && !Array.isArray(mutavArray)) || (Array.isArray(mutavArray) && mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null)) {
            if (Array.isArray(mutavArray)) {
              mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
            } else {
              mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray).accountMutavName
            }
            this.setState({
              textCategory,
              mutavText: mutavText,
              dataOfRow: valuesSave,
            })
            setTimeout(() => {
              this.prepareArrayOfMutavim()
            }, 50)
          } else if (mutavArray.length > 1) {
            mutavText = (mutavArray.length) + ' מוטבים'
            const transTypeIdCategory = [...new Set(mutavArray.map(x => x.transTypeId))]
            if (transTypeIdCategory.length > 1) {
              textCategory = 'קטגוריות שונות'
            } else {
              textCategory = mutavArray[0].transType ? mutavArray[0].transType.transTypeName : (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId).transTypeName : 'ללא קטגוריה'
            }
            this.setState({
              textCategory,
              disabledGrTab1: {
                account: true,
                transName: true,
                transTypeName: true,
                paymentDesc: false,
                asmachta: false,
                transDate: false,
                total: true,
              },
              mutavText: mutavText,
              dataOfRow: valuesSave,
            })
            setTimeout(() => {
              this.prepareArrayOfMutavim()
            }, 50)
          }
        } else if (targetType === 'CYCLIC_TRANS' && this.state.tab === 2) {
          let mutavArray = dataOfRowGroup.mutavArray
          let mutavText = 'לא חובה'
          let textCategory = false
          if (mutavArray && Array.isArray(mutavArray)) {
            mutavArray = mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
          }
          if ((mutavArray && !Array.isArray(mutavArray)) || (mutavArray && Array.isArray(mutavArray) && mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null)) {
            if (Array.isArray(mutavArray)) {
              mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
            } else {
              mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray).accountMutavName
            }
            this.setState({
              textCategory,
              mutavText2: mutavText,
            })
            setTimeout(() => {
              this.prepareArrayOfMutavim()
            }, 50)
          } else if (mutavArray && mutavArray.length > 1) {
            mutavText = (mutavArray.length) + ' מוטבים'
            const transTypeIdCategory = [...new Set(mutavArray.map(x => x.transTypeId))]
            if (transTypeIdCategory.length > 1) {
              textCategory = 'קטגוריות שונות'
            } else {
              textCategory = mutavArray[0].transType ? mutavArray[0].transType.transTypeName : (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId).transTypeName : 'ללא קטגוריה'
            }
            this.setState({
              textCategory,
              disabledGrTab2: {
                account: false,
                transName: false,
                paymentDesc: false,
                transDate: false,
                transFrequencyName: this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS',
                total: true,
                transTypeName: true,
              },
              mutavText2: mutavText,
            })
            setTimeout(() => {
              this.prepareArrayOfMutavim()
            }, 50)
          } else {
            this.setState({
              textCategory,
              mutavText2: mutavText,
            })
            setTimeout(() => {
              this.prepareArrayOfMutavim()
            }, 50)
          }
        }
      })
  }

  setDataState = (data) => {
    if (this.state.tab === 1) {
      this.setState({ dataOfRow: data })
    } else {
      this.setState({ dataOfRowGroup: data })
      setTimeout(() => {
        let transFrequencyName = this.state.dataOfRowGroup.transFrequencyName
        let targetTypes
        const { screen } = this.props
        if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
          targetTypes = this.state.dataOfRowGroup.targetType
        } else if (screen === 'BankMatchScreen') {
          targetTypes = this.state.dataOfRowGroup.targetTypeName
        }

        this.setState({ transFrequencyNameValid: !(targetTypes === 'SOLEK_TAZRIM' && transFrequencyName === 'NONE') })
      }, 50)
    }
  }
  prepareArrayOfMutavim = () => {
    const { dataOfRow, dataOfRowGroup } = this.state

    if (!this.state.mutavArray) {
      if (this.state.tab === 1) {
        const { screen } = this.props
        let totalVal
        if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
          totalVal = 'total'
        } else if (screen === 'BankMatchScreen') {
          totalVal = 'targetOriginalTotal'
        }
        let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
        if (dataOfRow.mutavArray && Array.isArray(dataOfRow.mutavArray)) {
          if (dataOfRow.mutavArray.length === 1) {
            dataOfRow.mutavArray[0].total = dataOfRowVal[totalVal]
          }
          dataOfRow.mutavArray.forEach((item) => {
            item.transType = (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId) : {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            }
          })
          const mutavArray = JSON.parse(JSON.stringify(dataOfRow.mutavArray))
          mutavArray.push({
            total: null,
            biziboxMutavId: null,
            transType: {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            },
          })
          this.setState({
            idxObj: 0,
            mutavArray: mutavArray,
          })
        } else {
          if (dataOfRow.mutavArray) {
            this.setState({
              idxObj: 0,
              mutavArray: [{
                total: dataOfRowVal[totalVal],
                biziboxMutavId: dataOfRow.mutavArray,
                transType: dataOfRow.transType,
              }, {
                total: null,
                biziboxMutavId: null,
                transType: {
                  companyId: '00000000-0000-0000-0000-000000000000',
                  createDefaultSupplier: true,
                  iconType: 'No category',
                  shonaScreen: true,
                  transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                  transTypeName: 'ללא קטגוריה',
                },
              }],
            })
          } else {
            this.setState({
              idxObj: 0,
              mutavArray: [{
                total: null,
                biziboxMutavId: null,
                transType: {
                  companyId: '00000000-0000-0000-0000-000000000000',
                  createDefaultSupplier: true,
                  iconType: 'No category',
                  shonaScreen: true,
                  transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                  transTypeName: 'ללא קטגוריה',
                },
              }],
            })
          }
        }
      } else if (this.state.tab === 2) {
        if (dataOfRowGroup.mutavArray && Array.isArray(dataOfRowGroup.mutavArray)) {
          dataOfRowGroup.mutavArray.forEach((item) => {
            item.isDeleted = (item.isDeleted === null) ? false : item.isDeleted
            item.updateType = (item.updateType === null) ? 'future' : item.updateType
            item.transType = (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId) : {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            }
          })
          const mutavArray = JSON.parse(JSON.stringify(dataOfRowGroup.mutavArray))
          mutavArray.push({
            total: null,
            biziboxMutavId: null,
            transType: {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            },
          })
          this.setState({
            idxObj: mutavArray.length - 1,
            mutavArray: mutavArray,
          })
        } else {
          this.setState({
            idxObj: 0,
            mutavArray: [{
              total: null,
              updateType: 'future',
              biziboxMutavId: null,
              transId: null,
              isDeleted: false,
              transType: {
                companyId: '00000000-0000-0000-0000-000000000000',
                createDefaultSupplier: true,
                iconType: 'No category',
                shonaScreen: true,
                transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                transTypeName: 'ללא קטגוריה',
              },
            }],
          })
        }
      }
    }

    setTimeout(() => {
      this.modalMutavClose()
    }, 50)
  }

  update = () => {
    if (this.state.tab === 1) {
      const { dataOfRow } = this.state
      const { updateRow, screen } = this.props

      // if (dataOfRow['targetType'] === 'WIRE_TRANSFER' || dataOfRow['targetType'] === 'CHEQUE' || dataOfRow['targetType'] === 'OTHER') {
      //   this.setState({
      //     biziboxMutavValid: dataOfRow.biziboxMutavId !== null,
      //   })
      //   if (!dataOfRow.biziboxMutavId) {
      //     return
      //   }
      // }
      let reloadData = false
      let targetType
      if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
        targetType = dataOfRow.targetType
      } else if (screen === 'BankMatchScreen') {
        targetType = dataOfRow.targetTypeName
      }
      if (targetType === 'CYCLIC_TRANS') {
        let mutavArrayMap = []
        let mutavArrayState = this.state.mutavArray
        // if (this.state.mutavArray && Array.isArray(this.state.mutavArray) && this.state.mutavArray.length) {
        //   mutavArrayState = this.state.mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
        // }
        if (mutavArrayState || (this.state.dataOfRow.mutavArray && Array.isArray(this.state.dataOfRow.mutavArray))) {
          if (mutavArrayState && Array.isArray(mutavArrayState) && mutavArrayState.length) {
            mutavArrayMap = mutavArrayState.map((item) => {
              return {
                'biziboxMutavId': item.biziboxMutavId,
                'total': Number(item.total),
                'transTazrimMapId': item.transTazrimMapId,
                isDeleted: (!(this.state.dataOfRow.mutavArray && Array.isArray(this.state.dataOfRow.mutavArray))),
                transTypeId: item.transType.transTypeId,
              }
            })

            if (this.state.dataOfRow.mutavArray && Array.isArray(this.state.dataOfRow.mutavArray) && this.state.dataOfRow.mutavArray.length) {
              this.state.dataOfRow.mutavArray.forEach((item) => {
                const isExist = mutavArrayMap.some(a => a.biziboxMutavId === item.biziboxMutavId)
                if (!isExist) {
                  mutavArrayMap.push({
                    'biziboxMutavId': item.biziboxMutavId,
                    'total': Number(item.total),
                    'transTazrimMapId': item.transTazrimMapId,
                    isDeleted: true,
                    transTypeId: item.transType ? item.transType.transTypeId : item.transTypeId,
                  })
                }
              })
            } else if (this.state.dataOfRow.mutavArray && !Array.isArray(this.state.dataOfRow.mutavArray)) {
              mutavArrayMap.push({
                'biziboxMutavId': this.state.dataOfRow.mutavArray,
                'total': Number(this.state.dataOfRow.total),
                'transTazrimMapId': null,
                isDeleted: false,
                transTypeId: this.state.dataOfRow.transTypeId,
              })
            }
          } else {
            if (this.state.dataOfRow.mutavArray && Array.isArray(this.state.dataOfRow.mutavArray)) {
              this.state.dataOfRow.mutavArray.forEach((item) => {
                mutavArrayMap.push({
                  'biziboxMutavId': item.biziboxMutavId,
                  'total': Number(item.total),
                  'transTazrimMapId': item.transTazrimMapId,
                  isDeleted: false,
                  transTypeId: item.transType ? item.transType.transTypeId : item.transTypeId,
                })
              })
            } else if (this.state.dataOfRow.mutavArray) {
              mutavArrayMap.push({
                'biziboxMutavId': this.state.dataOfRow.mutavArray,
                'total': Number(this.state.dataOfRow.total),
                'transTazrimMapId': null,
                isDeleted: false,
                transTypeId: this.state.dataOfRow.transTypeId,
              })
            }
          }

          mutavArrayMap = mutavArrayMap.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
        }
        if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
          if (
            this.state.saveOriginObj.companyAccountId !== dataOfRow.companyAccountId ||
            this.state.saveOriginObj.transType.transTypeId !== dataOfRow.transType.transTypeId ||
            ((dataOfRow.nigreret)
              ? (this.state.saveOriginObj.originalDate !== dataOfRow.originalDate)
              : (this.state.saveOriginObj.transDate !== dataOfRow.transDate)
            ) ||
            (this.isStatusReload(dataOfRow.targetType) && this.state.saveOriginObj.paymentDesc !== dataOfRow.paymentDesc)
          ) {
            reloadData = true
          }
          new Api({ endpoint: `payments/cfl/${dataOfRow.targetType}/update` }).post({
            body: Object.assign({
              'biziboxMutavId': dataOfRow.biziboxMutavId ? dataOfRow.biziboxMutavId : null,
              // 'canChangeZefi': true,
              // 'paymentDescTranslate': 'string',
              // 'uniItratSgira': 0,
              'mutavArray': mutavArrayMap,
              'unionId': dataOfRow.unionId,
              'asmachta': dataOfRow.asmachta,
              'bank': dataOfRow.bank,
              'chequeNo': dataOfRow.chequeNo,
              'companyAccountId': dataOfRow.companyAccountId,
              'companyId': dataOfRow.companyId,
              'expence': dataOfRow.expence,
              'kvuaDateFrom': dataOfRow.kvuaDateFrom,
              'kvuaDateTill': dataOfRow.kvuaDateTill,
              'linkId': dataOfRow.linkId,
              'nigreret': dataOfRow.nigreret,
              'originalDate': dataOfRow.originalDate,
              'paymentDesc': dataOfRow.paymentDesc,
              'pictureLink': dataOfRow.pictureLink,
              'sourceProgramName': dataOfRow.sourceProgramName,
              'targetOriginalTotal': dataOfRow.targetOriginalTotal,
              'targetType': dataOfRow.targetType,
              'targetTypeId': dataOfRow.targetTypeId,
              'total': dataOfRow.total,
              'transDate': dataOfRow.nigreret ? dataOfRow.originalDate : dataOfRow.transDate,
              'transDesc': dataOfRow.transDesc,
              'transId': dataOfRow.transId,
              'transName': dataOfRow.transName,
              'transTypeId': dataOfRow.transType.transTypeId,
              'uniItra': dataOfRow.uniItra,
              'uniItraColor': dataOfRow.uniItraColor,
            }, (dataOfRow.targetType === 'WIRE_TRANSFER' || dataOfRow.targetType === 'CHEQUE' || dataOfRow.targetType === 'OTHER') ? {
              'biziboxMutavId': dataOfRow.biziboxMutavId,
            } : {}),
          }).then(data => {
            updateRow(reloadData, dataOfRow)
          }).catch(() => updateRow(false))
        } else if (screen === 'BankMatchScreen') {
          if (this.state.saveOriginObj.companyAccountId !== dataOfRow.companyAccountId ||
            this.state.saveOriginObj.targetOriginalDate !== dataOfRow.targetOriginalDate
          ) {
            reloadData = true
          }

          new Api({ endpoint: `payments/cfl/${dataOfRow.targetTypeName}/update-from-bankmatch` }).post({
            body: {
              companyAccountId: dataOfRow.companyAccountId,
              dateFrom: dataOfRow.dateFrom,
              dateTill: dataOfRow.dateTill,
              expence: dataOfRow.expence,
              hovAvar: dataOfRow.hovAvar,
              isMatchable: dataOfRow.isMatchable,
              paymentDesc: dataOfRow.paymentDesc,
              snoozeDate: dataOfRow.snoozeDate,
              targetAsmachta: dataOfRow.asmachta,
              targetId: dataOfRow.targetId,
              targetName: dataOfRow.targetName,
              targetOriginalDate: dataOfRow.targetOriginalDate,
              targetOriginalTotal: dataOfRow.targetOriginalTotal,
              targetTypeId: dataOfRow.targetTypeId,
              targetTypeName: dataOfRow.targetTypeName,
              transId: dataOfRow.transId,
              transTypeId: dataOfRow.transType.transTypeId,
              mutavArray: mutavArrayMap,
              biziboxMutavId: dataOfRow.biziboxMutavId ? dataOfRow.biziboxMutavId : null,
              kvuotUnionId: dataOfRow.kvuotUnionId,
            },
          }).then(data => {
            updateRow(reloadData, dataOfRow)
          }).catch(() => updateRow(false))
        }
      } else {
        if (!this.isEquivalent(dataOfRow, this.state.saveOriginObj)) {
          if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
            if (
              this.state.saveOriginObj.companyAccountId !== dataOfRow.companyAccountId ||
              this.state.saveOriginObj.transType.transTypeId !== dataOfRow.transType.transTypeId ||
              ((dataOfRow.nigreret)
                ? (this.state.saveOriginObj.originalDate !== dataOfRow.originalDate)
                : (this.state.saveOriginObj.transDate !== dataOfRow.transDate)
              ) ||
              (this.isStatusReload(dataOfRow.targetType) && this.state.saveOriginObj.paymentDesc !== dataOfRow.paymentDesc)
            ) {
              reloadData = true
            }
            if (dataOfRow.targetType === 'BANK_TRANS') {
              accountCflDataUpdateApi.post({
                body: {
                  'asmachta': dataOfRow.asmachta,
                  'bank': dataOfRow.bank,
                  'chequeNo': dataOfRow.chequeNo,
                  'companyAccountId': dataOfRow.companyAccountId,
                  'companyId': exampleCompany.isExample
                    ? '856f4212-3f5f-4cfc-b2fb-b283a1da2f7c'
                    : dataOfRow.companyId,
                  'expence': dataOfRow.expence,
                  'kvuaDateFrom': dataOfRow.kvuaDateFrom,
                  'kvuaDateTill': dataOfRow.kvuaDateTill,
                  'linkId': dataOfRow.linkId,
                  'nigreret': dataOfRow.nigreret,
                  'originalDate': dataOfRow.originalDate,
                  'paymentDesc': dataOfRow.paymentDesc,
                  'pictureLink': dataOfRow.pictureLink,
                  'sourceProgramName': dataOfRow.sourceProgramName,
                  'targetOriginalTotal': dataOfRow.targetOriginalTotal,
                  'targetType': dataOfRow.targetType,
                  'targetTypeId': dataOfRow.targetTypeId,
                  'total': dataOfRow.total,
                  'transDate': dataOfRow.nigreret ? dataOfRow.originalDate : dataOfRow.transDate,
                  'transDesc': dataOfRow.transDesc,
                  'transId': dataOfRow.transId,
                  'transName': dataOfRow.transName,
                  'transTypeId': dataOfRow.transType.transTypeId,
                  'uniItra': dataOfRow.uniItra,
                  'uniItraColor': dataOfRow.uniItraColor,
                },
              }).then(data => {
                updateRow(reloadData, dataOfRow)
              }).catch(() => updateRow(false))
            } else {
              new Api({ endpoint: `payments/cfl/${dataOfRow.targetType}/update` }).post({
                body: Object.assign({
                  'asmachta': dataOfRow.asmachta,
                  'bank': dataOfRow.bank,
                  'chequeNo': dataOfRow.chequeNo,
                  'companyAccountId': dataOfRow.companyAccountId,
                  'companyId': dataOfRow.companyId,
                  'expence': dataOfRow.expence,
                  'kvuaDateFrom': dataOfRow.kvuaDateFrom,
                  'kvuaDateTill': dataOfRow.kvuaDateTill,
                  'linkId': dataOfRow.linkId,
                  'nigreret': dataOfRow.nigreret,
                  'originalDate': dataOfRow.originalDate,
                  'paymentDesc': dataOfRow.paymentDesc,
                  'pictureLink': dataOfRow.pictureLink,
                  'sourceProgramName': dataOfRow.sourceProgramName,
                  'targetOriginalTotal': dataOfRow.targetOriginalTotal,
                  'targetType': dataOfRow.targetType,
                  'targetTypeId': dataOfRow.targetTypeId,
                  'total': dataOfRow.total,
                  'transDate': dataOfRow.nigreret ? dataOfRow.originalDate : dataOfRow.transDate,
                  'transDesc': dataOfRow.transDesc,
                  'transId': dataOfRow.transId,
                  'transName': dataOfRow.transName,
                  'transTypeId': dataOfRow.transType.transTypeId,
                  'uniItra': dataOfRow.uniItra,
                  'uniItraColor': dataOfRow.uniItraColor,
                }, (dataOfRow.targetType === 'WIRE_TRANSFER' || dataOfRow.targetType === 'CHEQUE' || dataOfRow.targetType === 'OTHER') ? {
                  'biziboxMutavId': dataOfRow.biziboxMutavId,
                } : {}),
              }).then(data => {
                updateRow(reloadData, dataOfRow)
              }).catch(() => updateRow(false))
            }
          } else if (screen === 'BankMatchScreen') {
            if (this.state.saveOriginObj.companyAccountId !== dataOfRow.companyAccountId ||
              this.state.saveOriginObj.targetOriginalDate !== dataOfRow.targetOriginalDate
            ) {
              reloadData = true
            }
            new Api({ endpoint: `payments/cfl/${dataOfRow.targetTypeName}/update-from-bankmatch` }).post({
              body: {
                companyAccountId: dataOfRow.companyAccountId,
                dateFrom: dataOfRow.dateFrom,
                dateTill: dataOfRow.dateTill,
                expence: dataOfRow.expence,
                hovAvar: dataOfRow.hovAvar,
                isMatchable: dataOfRow.isMatchable,
                paymentDesc: dataOfRow.paymentDesc,
                snoozeDate: dataOfRow.snoozeDate,
                targetAsmachta: dataOfRow.asmachta,
                targetId: dataOfRow.targetId,
                targetName: dataOfRow.targetName,
                targetOriginalDate: dataOfRow.targetOriginalDate,
                targetOriginalTotal: dataOfRow.targetOriginalTotal,
                targetTypeId: dataOfRow.targetTypeId,
                targetTypeName: dataOfRow.targetTypeName,
                transId: dataOfRow.transId,
                transTypeId: dataOfRow.transType.transTypeId,
              },
            }).then(data => {
              updateRow(reloadData, dataOfRow)
            }).catch(() => updateRow(false))
          }
        } else {
          updateRow(false)
        }
      }
    } else if (this.state.tab === 2) {
      const { updateRow, screen } = this.props
      let transFrequencyName = this.state.dataOfRowGroup.transFrequencyName
      let targetTypes
      if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
        targetTypes = this.state.dataOfRowGroup.targetType
      } else if (screen === 'BankMatchScreen') {
        targetTypes = this.state.dataOfRowGroup.targetTypeName
      }
      if (targetTypes === 'SOLEK_TAZRIM' && transFrequencyName === 'NONE') {
        this.setState({ transFrequencyNameValid: false })
        return
      }
      if (transFrequencyName === 'MULTIPLE') {
        transFrequencyName = 'MONTH'
      }
      let expirationDate = this.state.dataOfRowGroup.expirationDate
      if (this.state.dataOfRowGroup.endDate === 'none') {
        expirationDate = null
      } else if (this.state.dataOfRowGroup.endDate === 'times') {
        let transDate = AppTimezone.moment().valueOf()
        if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
          if (this.state.dataOfRowGroup.transDate) {
            transDate = this.state.dataOfRowGroup.transDate
          }
        } else if (screen === 'BankMatchScreen') {
          if (this.state.dataOfRowGroup.targetOriginalDate) {
            transDate = this.state.dataOfRowGroup.targetOriginalDate
          }
        }
        const cycle = Number(this.state.dataOfRowGroup.timesValue) - 1
        if (AppTimezone.moment(transDate).isSameOrAfter(AppTimezone.moment().valueOf())) {
          if (transFrequencyName === 'TWO_MONTHS') {
            expirationDate = AppTimezone.moment(transDate).add((Number(cycle + 1) * 2), 'month').valueOf()
          } else {
            let units = transFrequencyName.toLowerCase()
            expirationDate = AppTimezone.moment(transDate).add(Number(cycle), units).valueOf()
          }
        } else {
          let i = 0
          while (AppTimezone.moment(AppTimezone.moment(transDate).add((Number((transFrequencyName === 'TWO_MONTHS') ? i * 2 : i)), (transFrequencyName === 'TWO_MONTHS') ? 'month' : transFrequencyName.toLowerCase()).valueOf()).isSameOrBefore(AppTimezone.moment().valueOf())) {
            if (AppTimezone.moment(AppTimezone.moment(transDate).add((Number((transFrequencyName === 'TWO_MONTHS') ? i * 2 : i)), (transFrequencyName === 'TWO_MONTHS') ? 'month' : transFrequencyName.toLowerCase()).valueOf()).isSameOrBefore(AppTimezone.moment().valueOf())) {
              i++
              expirationDate = AppTimezone.moment(transDate).add((Number((transFrequencyName === 'TWO_MONTHS') ? (i * 2) + cycle : i + cycle)), (transFrequencyName === 'TWO_MONTHS') ? 'month' : transFrequencyName.toLowerCase()).valueOf()
            }
          }
        }

        // if (transFrequencyName === 'TWO_MONTHS') {
        //   expirationDate = AppTimezone.moment(transDate).add((Number(this.state.dataOfRowGroup.timesValue) * 2), 'month').valueOf()
        // } else {
        //   let units = transFrequencyName.toLowerCase()
        //   expirationDate = AppTimezone.moment(transDate).add(Number(this.state.dataOfRowGroup.timesValue), units).valueOf()
        // }
      } else if (this.state.dataOfRowGroup.endDate === 'on') {
        expirationDate = this.state.dataOfRowGroup.expirationDate
      }
      let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
      for (let x in dataOfRowGroup) {
        if (dataOfRowGroup[x] === undefined) {
          dataOfRowGroup[x] = null
        }
      }
      this.setState({ dataOfRowGroup, transFrequencyNameValid: true })

      let targetType, total, transName, transTypeId, transDate
      if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
        targetType = this.state.dataOfRowGroup.targetType
        total = Number(this.state.dataOfRowGroup.total)
        transName = this.state.dataOfRowGroup.transName
        transTypeId = this.state.dataOfRowGroup.transType.transTypeId
        transDate = this.state.dataOfRowGroup.transDate
      } else if (screen === 'BankMatchScreen') {
        targetType = this.state.dataOfRowGroup.targetTypeName
        total = Number(this.state.dataOfRowGroup.targetOriginalTotal)
        transName = this.state.dataOfRowGroup.targetName
        transTypeId = this.state.dataOfRowGroup.transType.transTypeId
        transDate = this.state.dataOfRowGroup.targetOriginalDate
      }

      if (targetType === 'CYCLIC_TRANS') {
        let mutavArrayMap = []
        if (this.state.mutavArray || (this.state.dataOfRowGroup.mutavArray && Array.isArray(this.state.dataOfRowGroup.mutavArray))) {
          if (this.state.mutavArray && Array.isArray(this.state.mutavArray)) {
            mutavArrayMap = this.state.mutavArray.map((item) => {
              return {
                'biziboxMutavId': item.biziboxMutavId,
                'total': Number(item.total),
                'transId': item.transId,
                isDeleted: false,
                'updateType': item.updateType ? item.updateType : 'future',
                transTypeId: item.transType.transTypeId,
              }
            })
            if (this.state.dataOfRowGroup.mutavArray && Array.isArray(this.state.dataOfRowGroup.mutavArray)) {
              this.state.dataOfRowGroup.mutavArray.forEach((item) => {
                const isExist = mutavArrayMap.some(a => a.biziboxMutavId === item.biziboxMutavId)
                if (!isExist) {
                  mutavArrayMap.push({
                    'biziboxMutavId': item.biziboxMutavId,
                    'total': Number(item.total),
                    'transId': item.transId,
                    isDeleted: true,
                    'updateType': item.updateType ? item.updateType : 'future',
                    transTypeId: item.transType ? item.transType.transTypeId : item.transTypeId,
                  })
                }
              })
            }
          } else {
            this.state.dataOfRowGroup.mutavArray.forEach((item) => {
              mutavArrayMap.push({
                'biziboxMutavId': item.biziboxMutavId,
                'total': Number(item.total),
                'transId': item.transId,
                isDeleted: true,
                'updateType': item.updateType ? item.updateType : 'future',
                transTypeId: item.transType ? item.transType.transTypeId : item.transTypeId,
              })
            })
          }
          mutavArrayMap = mutavArrayMap.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
        }

        const params = {
          'autoUpdateTypeName': this.state.dataOfRowGroup.autoUpdateTypeName,
          'companyAccountId': this.state.dataOfRowGroup.companyAccountId,
          'expence': this.state.dataOfRowGroup.expence,
          'expirationDate': expirationDate,
          'frequencyDay': (this.state.dataOfRowGroup.frequencyDay) ? this.state.dataOfRowGroup.frequencyDay : null,
          'lastBankDate': (this.state.dataOfRowGroup.lastBankDate) ? this.state.dataOfRowGroup.lastBankDate : null,
          'lastBankDateColor': (this.state.dataOfRowGroup.lastBankDateColor) ? this.state.dataOfRowGroup.lastBankDateColor : null,
          'lastBankTotal': (this.state.dataOfRowGroup.lastBankTotal) ? this.state.dataOfRowGroup.lastBankTotal : null,
          'notExpence': (this.state.dataOfRowGroup.notExpence) ? this.state.dataOfRowGroup.notExpence : null,
          'paymentDesc': this.state.dataOfRowGroup.paymentDesc,
          'targetType': targetType,
          'total': total,
          'transDate': transDate,
          'transFrequencyName': transFrequencyName,
          'frequencyAutoUpdateTypeName': this.state.dataOfRowGroup.frequencyAutoUpdateTypeName,
          'transId': this.state.dataOfRowGroup.transId,
          'transName': transName,
          'transTypeId': transTypeId,
          'updatedBy': (this.state.dataOfRowGroup.updatedBy) ? this.state.dataOfRowGroup.updatedBy : null,
          'mutavArray': mutavArrayMap,
          isUnion: this.state.dataOfRowGroup.isUnion,
          // updateType:this.state.updateType,
        }
        if (['MONTH', 'WEEK'].includes(transFrequencyName) && transDate) {
          if (transFrequencyName === 'WEEK') {
            params.frequencyDay = (AppTimezone.moment(transDate).format('dddd')).toUpperCase()
          }
          if (transFrequencyName === 'MONTH') {
            params.frequencyDay = AppTimezone.moment(transDate).format('D')
          }
        }
        if (transDate && this.state.dataOfRowGroupSave.transFrequencyName === 'MULTIPLE' && params.transFrequencyName === 'MONTH') {
          if (this.state.dataOfRowGroup.autoUpdateTypeName !== 'AVG_3_MONTHS') {
            params.transFrequencyName = 'MONTH'
            params.frequencyDay = AppTimezone.moment(transDate).format('D')
          } else {
            params.transFrequencyName = 'MULTIPLE'
          }
        }
        new Api({ endpoint: `cyclic-trans/cfl/${targetType}/update` }).post({
          body: params,
        })
          .then(data => {
            updateRow(true)
          })
          .catch(() => updateRow(false))
      } else {
        let mutavArrayMap = []
        if (this.state.dataOfRowGroup.mutavArray && Array.isArray(this.state.dataOfRowGroup.mutavArray)) {
          this.state.dataOfRowGroup.mutavArray.forEach((item) => {
            mutavArrayMap.push({
              'biziboxMutavId': item.biziboxMutavId,
              'total': Number(item.total),
              'transId': item.transId,
              isDeleted: false,
              'updateType': item.updateType,
              transTypeId: item.transType.transTypeId,
            })
          })
        }

        const params = {
          'mutavArray': mutavArrayMap,
          isUnion: this.state.dataOfRowGroup.isUnion,
          'autoUpdateTypeName': this.state.dataOfRowGroup.autoUpdateTypeName,
          'companyAccountId': this.state.dataOfRowGroup.companyAccountId,
          'expence': this.state.dataOfRowGroup.expence,
          'expirationDate': expirationDate,
          'frequencyDay': (this.state.dataOfRowGroup.frequencyDay) ? this.state.dataOfRowGroup.frequencyDay : null,
          'lastBankDate': (this.state.dataOfRowGroup.lastBankDate) ? this.state.dataOfRowGroup.lastBankDate : null,
          'lastBankDateColor': (this.state.dataOfRowGroup.lastBankDateColor) ? this.state.dataOfRowGroup.lastBankDateColor : null,
          'lastBankTotal': (this.state.dataOfRowGroup.lastBankTotal) ? this.state.dataOfRowGroup.lastBankTotal : null,
          'notExpence': (this.state.dataOfRowGroup.notExpence) ? this.state.dataOfRowGroup.notExpence : null,
          'paymentDesc': this.state.dataOfRowGroup.paymentDesc,
          'targetType': targetType,
          'total': total,
          'transDate': transDate,
          'transFrequencyName': transFrequencyName,
          'transId': this.state.dataOfRowGroup.transId,
          'transName': transName,
          'transTypeId': transTypeId,
          'updatedBy': (this.state.dataOfRowGroup.updatedBy) ? this.state.dataOfRowGroup.updatedBy : null,
          'frequencyAutoUpdateTypeName': this.state.dataOfRowGroup.frequencyAutoUpdateTypeName,
        }

        if (targetType === 'SOLEK_TAZRIM') {
          params.frequencyAutoUpdateTypeName = this.state.dataOfRowGroup.frequencyAutoUpdateTypeName
        }

        if ((targetType === 'DIRECTD') && transDate && this.state.dataOfRowGroupSave.transFrequencyName === 'MULTIPLE' && params.transFrequencyName === 'MONTH') {
          if (this.state.dataOfRowGroup.autoUpdateTypeName !== 'AVG_3_MONTHS') {
            params.transFrequencyName = 'MONTH'
            params.frequencyDay = AppTimezone.moment(transDate).format('D')
          } else {
            params.transFrequencyName = 'MULTIPLE'
          }
        }
        if (params.transFrequencyName === 'WEEK' && transDate) {
          params.frequencyDay = (AppTimezone.moment(transDate).format('dddd')).toUpperCase()
        }
        if (params.transFrequencyName === 'MONTH' && transDate) {
          params.frequencyDay = AppTimezone.moment(transDate).format('D')
        }
        new Api({ endpoint: `cyclic-trans/cfl/${targetType}/update` }).post({
          body: params,
        })
          .then(data => {
            updateRow(true)
          })
          .catch(() => updateRow(false))
      }
    }
  }

  isEquivalent (a, b) {
    let aProps = Object.getOwnPropertyNames(a)
    let bProps = Object.getOwnPropertyNames(b)
    if (aProps.length !== bProps.length) {
      return false
    }

    for (let i = 0; i < aProps.length; i++) {
      let propName = aProps[i]
      if (propName === 'transType') {
        let aPropsTrans = Object.getOwnPropertyNames(a[propName])
        let bPropsTrans = Object.getOwnPropertyNames(b[propName])
        if (aPropsTrans.length !== bPropsTrans.length) {
          return false
        }
        for (let i1 = 0; i1 < aPropsTrans.length; i1++) {
          if (a[propName][aPropsTrans[i1]] !== b[propName][aPropsTrans[i1]]) {
            return false
          }
        }
      } else {
        if (a[propName] !== b[propName]) {
          return false
        }
      }
    }

    return true
  }

  getSingleCyclicTrans = (dataOfRow) => () => {
    const { currentCompanyId, screen } = this.props
    let body
    if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
      body = Object.assign({}, dataOfRow)
      if (body.mutavArray && !Array.isArray(body.mutavArray)) {
        body.mutavArray = []
      }
    } else if (screen === 'BankMatchScreen') {
      body = {
        'companyId': currentCompanyId,
        'companyAccountId': dataOfRow.companyAccountId,
        'transId': dataOfRow.kvuotUnionId ? dataOfRow.kvuotUnionId : dataOfRow.targetId,
        'targetType': dataOfRow.targetTypeName,
      }
    }
    // console.log(body)
    new Api({ endpoint: 'cyclic-trans/cfl/single' }).post({
      body: body,
    })
      .then(data => {
        if (data && Array.isArray(data.transes) && data.transes.length > 0) {
          if ('asmachta' in data.transes[0] && data.transes[0].asmachta === '') {
            data.transes[0].asmachta = null
          }
          const dataRow = Object.assign(JSON.parse(JSON.stringify(dataOfRow)), data.transes[0])
          if (!dataRow.autoUpdateTypeName || (dataRow.autoUpdateTypeName && dataRow.autoUpdateTypeName !== 'USER_DEFINED_TOTAL' && dataRow.autoUpdateTypeName !== 'USER_CURRENT_TOTAL')) {
            dataRow.autoUpdateTypeName = 'AVG_3_MONTHS'
          }

          // if(dataRow.autoUpdateTypeName && dataRow.autoUpdateTypeName === 'USER_CURRENT_TOTAL'){
          //   dataRow.autoUpdateTypeName = 'USER_CURRENT_TOTAL'
          // }

          if (!dataRow.transFrequencyName || dataRow.transFrequencyName === '') {
            dataRow.transFrequencyName = 'NONE'
          }
          if (!dataRow.expirationDate) {
            dataRow.expirationDate = AppTimezone.moment().valueOf()
            dataRow.endDate = 'none'
          } else {
            dataRow.endDate = 'on'
          }

          dataRow.timesValue = 0
          let targetType
          if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
            targetType = dataRow.targetType
          } else if (screen === 'BankMatchScreen') {
            targetType = dataRow.targetTypeName
          }
          let textCategory = false
          if (targetType === 'CYCLIC_TRANS') {
            let mutavArray = dataRow.mutavArray
            if (mutavArray && Array.isArray(mutavArray)) {
              mutavArray = mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
            }
            let mutavText = 'לא חובה'
            if ((mutavArray && !Array.isArray(mutavArray)) || (Array.isArray(mutavArray) && mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null)) {
              if (Array.isArray(mutavArray)) {
                mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
              } else {
                mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray).accountMutavName
              }
              this.setState({
                mutavArray: null,
                mutavText2: mutavText,
                defDIRECTD: dataRow.autoUpdateTypeName,
                tab: 2,
                dataOfRowGroup: dataRow,
                dataOfRowGroupSave: dataRow,
                editSum: false,
                disabledGrTab2: this.getRulesEditTab2(targetType),
              })
              setTimeout(() => {
                this.prepareArrayOfMutavim()
              }, 50)
            } else if (mutavArray && mutavArray.length > 1) {
              mutavText = (mutavArray.length) + ' מוטבים'
              const transTypeIdCategory = [...new Set(mutavArray.map(x => x.transTypeId))]
              if (transTypeIdCategory.length > 1) {
                textCategory = 'קטגוריות שונות'
              } else {
                textCategory = mutavArray[0].transType ? mutavArray[0].transType.transTypeName : (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId).transTypeName : 'ללא קטגוריה'
              }
              this.setState({
                textCategory,
                mutavArray: null,
                disabledGrTab2: {
                  account: false,
                  transName: false,
                  paymentDesc: false,
                  transDate: false,
                  transFrequencyName: this.state.dataOfRowGroup && this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS',
                  total: true,
                  transTypeName: true,
                },
                mutavText2: mutavText,
                defDIRECTD: dataRow.autoUpdateTypeName,
                tab: 2,
                dataOfRowGroupSave: dataRow,
                dataOfRowGroup: dataRow,
                editSum: false,
              })
              setTimeout(() => {
                this.prepareArrayOfMutavim()
              }, 50)
            } else {
              this.setState({
                textCategory,
                mutavArray: null,
                mutavText2: mutavText,
                defDIRECTD: dataRow.autoUpdateTypeName,
                tab: 2,
                dataOfRowGroupSave: dataRow,
                dataOfRowGroup: dataRow,
                editSum: false,
                disabledGrTab2: this.getRulesEditTab2(targetType),
              })
              setTimeout(() => {
                this.prepareArrayOfMutavim()
              }, 50)
            }
          } else {
            this.setState({
              textCategory,
              mutavArray: null,
              defDIRECTD: dataRow.autoUpdateTypeName,
              tab: 2,
              dataOfRowGroupSave: dataRow,
              dataOfRowGroup: dataRow,
              editSum: false,
              disabledGrTab2: this.getRulesEditTab2(targetType),
            })
            setTimeout(() => {
              this.prepareArrayOfMutavim()
            }, 50)
          }
        } else {
          const dataRow = JSON.parse(JSON.stringify(dataOfRow))
          if (!dataRow.autoUpdateTypeName || (dataRow.autoUpdateTypeName && dataRow.autoUpdateTypeName !== 'USER_DEFINED_TOTAL' && dataRow.autoUpdateTypeName !== 'USER_CURRENT_TOTAL')) {
            dataRow.autoUpdateTypeName = 'AVG_3_MONTHS'
          }
          if (!dataRow.transFrequencyName || dataRow.transFrequencyName === '') {
            dataRow.transFrequencyName = 'NONE'
          }
          if (!dataRow.expirationDate) {
            dataRow.expirationDate = AppTimezone.moment().valueOf()
            dataRow.endDate = 'none'
          } else {
            dataRow.endDate = 'on'
          }
          dataRow.timesValue = 0
          let targetType
          if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
            targetType = dataRow.targetType
          } else if (screen === 'BankMatchScreen') {
            targetType = dataRow.targetTypeName
          }
          let textCategory = false

          if (targetType === 'CYCLIC_TRANS') {
            let mutavArray = dataRow.mutavArray
            if (mutavArray && Array.isArray(mutavArray)) {
              mutavArray = mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
            }
            let mutavText = 'לא חובה'
            if (mutavArray && Array.isArray(mutavArray) && mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null) {
              mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
              this.setState({
                mutavText2: mutavText,
                defDIRECTD: dataRow.autoUpdateTypeName,
                tab: 2,
                dataOfRowGroup: dataRow,
                dataOfRowGroupSave: dataRow,
                editSum: false,
                disabledGrTab2: this.getRulesEditTab2(targetType),
              })
              setTimeout(() => {
                this.prepareArrayOfMutavim()
              }, 50)
            } else if (mutavArray && Array.isArray(mutavArray) && mutavArray.length > 1) {
              mutavText = (mutavArray.length) + ' מוטבים'
              const transTypeIdCategory = [...new Set(mutavArray.map(x => x.transTypeId))]
              if (transTypeIdCategory.length > 1) {
                textCategory = 'קטגוריות שונות'
              } else {
                textCategory = mutavArray[0].transType ? mutavArray[0].transType.transTypeName : (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transTypeId).transTypeName : 'ללא קטגוריה'
              }
              this.setState({
                textCategory,
                disabledGrTab2: {
                  account: false,
                  transName: false,
                  paymentDesc: false,
                  transDate: false,
                  transFrequencyName: this.state.dataOfRowGroup && this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS',
                  total: true,
                  transTypeName: true,
                },
                mutavText2: mutavText,
                defDIRECTD: dataRow.autoUpdateTypeName,
                tab: 2,
                dataOfRowGroup: dataRow,
                dataOfRowGroupSave: dataRow,
                editSum: false,
                mutavArray: null,
              })
              setTimeout(() => {
                this.prepareArrayOfMutavim()
              }, 50)
            } else {
              if (mutavArray === null || Array.isArray(mutavArray)) {
                this.setState({
                  textCategory,
                  mutavText2: mutavText,
                  defDIRECTD: dataRow.autoUpdateTypeName,
                  tab: 2,
                  dataOfRowGroup: dataRow,
                  dataOfRowGroupSave: dataRow,
                  editSum: false,
                  disabledGrTab2: this.getRulesEditTab2(targetType),
                  mutavArray: null,
                })
                setTimeout(() => {
                  this.prepareArrayOfMutavim()
                }, 50)
              } else {
                if (mutavArray) {
                  mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray).accountMutavName
                }
                dataRow.mutavArray = null
                this.setState({
                  textCategory,
                  mutavText2: mutavText,
                  defDIRECTD: dataRow.autoUpdateTypeName,
                  tab: 2,
                  dataOfRowGroup: dataRow,
                  dataOfRowGroupSave: dataRow,
                  editSum: false,
                  disabledGrTab2: this.getRulesEditTab2(targetType),
                  mutavArray: null,
                })
                setTimeout(() => {
                  this.prepareArrayOfMutavim()
                }, 50)
              }
            }
          } else {
            this.setState({
              textCategory,
              mutavArray: null,
              defDIRECTD: dataRow.autoUpdateTypeName,
              tab: 2,
              dataOfRowGroup: dataRow,
              dataOfRowGroupSave: dataRow,
              editSum: false,
              disabledGrTab2: this.getRulesEditTab2(targetType),
            })
            setTimeout(() => {
              this.prepareArrayOfMutavim()
            }, 50)
          }
        }
      })
      .catch(() => {
      })
  }

  getRulesEditTab1 = (data) => {
    const disabledGrTab1 = {
      account: true,
      transName: true,
      transTypeName: true,
      paymentDesc: true,
      asmachta: true,
      transDate: true,
      total: true,
    }
    switch (data) {
      case 'CHEQUE':
      case 'OTHER':
      case 'WIRE_TRANSFER':
        disabledGrTab1.account = false
        disabledGrTab1.transName = false
        disabledGrTab1.transTypeName = false
        disabledGrTab1.paymentDesc = false
        disabledGrTab1.asmachta = false
        disabledGrTab1.transDate = false
        disabledGrTab1.total = false
        break
      case 'BANK_CHEQUE':
        disabledGrTab1.transName = false
        disabledGrTab1.transDate = false
        disabledGrTab1.transTypeName = false
        break
      case 'ERP_CHEQUE':
        disabledGrTab1.account = false
        disabledGrTab1.transName = false
        disabledGrTab1.transDate = false
        disabledGrTab1.transTypeName = false
        break
      case 'SOLEK_TAZRIM':
      case 'CCARD_TAZRIM':
      case 'CASH':
        disabledGrTab1.total = false
        break
      case 'CYCLIC_TRANS':
        disabledGrTab1.paymentDesc = false
        disabledGrTab1.transDate = false
        disabledGrTab1.total = false
        disabledGrTab1.asmachta = false
        break
      case 'BANK_TRANS':
        disabledGrTab1.transName = false
        disabledGrTab1.transTypeName = false
        break
      case 'DIRECTD':
        disabledGrTab1.transDate = false
        disabledGrTab1.total = false
        break
    }
    return disabledGrTab1
  }

  getRulesEditTab2 = (data) => {
    const disabledGrTab2 = {
      account: true,
      transName: true,
      transTypeName: true,
      paymentDesc: true,
      transDate: true,
      total: true,
      transFrequencyName: true,
    }
    switch (data) {
      case 'CASH':
        disabledGrTab2.transName = false
        disabledGrTab2.transTypeName = false
        disabledGrTab2.transFrequencyName = false
        break
      case 'LOAN_TAZRIM':
      case 'DIRECTD':
      case 'CCARD_TAZRIM':
      case 'SOLEK_TAZRIM':
        disabledGrTab2.transName = false
        disabledGrTab2.transTypeName = false
        break

      case 'CYCLIC_TRANS':
        disabledGrTab2.transName = false
        disabledGrTab2.transTypeName = false
        disabledGrTab2.account = false
        disabledGrTab2.paymentDesc = false
        disabledGrTab2.transDate = false
        disabledGrTab2.transFrequencyName = (this.state && this.state.dataOfRowGroup) ? (this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS') : (this.props.dataOfRow.autoUpdateTypeName === 'AVG_3_MONTHS')
        disabledGrTab2.total = (this.state && this.state.dataOfRowGroup) ? (this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS' || this.state.dataOfRowGroup.isUnion) : (this.props.dataOfRow.autoUpdateTypeName === 'AVG_3_MONTHS' || this.props.dataOfRow.isUnion)
        break
    }
    return disabledGrTab2
  }

  setModalInsideVisible = (visible) => () => {
    if (!visible && this.state.typeEditModal === 'transFrequencyNameSolek' && (this.state.dataOfRowGroup.transFrequencyName === 'WEEK' || this.state.dataOfRowGroup.transFrequencyName === 'MONTH') && this.state.dataOfRowGroup.frequencyDay === null) {
    } else {
      this.setState({ editModalInsideIsOpen: visible })
    }
  }

  handleSelectCategory = (category) => {
    const { currentEditBankTrans } = this.state
    if (!currentEditBankTrans || currentEditBankTrans.transTypeId === category.transTypeId) {return}

    const newBankTrans = {
      ...currentEditBankTrans,
      iconType: category.iconType,
      transTypeId: category.transTypeId,
      transTypeName: category.transTypeName,
    }
    if (this.state.tab === 1) {
      // this.props.dataOfRow.transType = { ...newBankTrans }
      const { dataOfRow } = this.state
      let valuesSave = Object.assign({}, dataOfRow)
      valuesSave.transType = { ...newBankTrans }
      this.setState({ categoriesModalIsOpen: false, currentEditBankTrans: null, dataOfRow: valuesSave })
    } else {
      if (this.state.modalMutavShow) {
        let mutavArray = JSON.parse(JSON.stringify(this.state.mutavArray))
        mutavArray[this.state.idxObj].transType = { ...newBankTrans }
        this.setState({ mutavArray: mutavArray, categoriesModalIsOpen: false, currentEditBankTrans: null })
      } else {
        let valuesSave = Object.assign({}, this.state.dataOfRowGroup)
        valuesSave.transType = { ...newBankTrans }
        this.setState({ dataOfRowGroup: valuesSave, categoriesModalIsOpen: false, currentEditBankTrans: null })
      }
    }
  }

  handleCloseCategoriesModal = () => {
    this.setState({ categoriesModalIsOpen: false, currentEditBankTrans: null })
  }

  handleOpenCategoriesModal = (bankTransId) => {
    this.setState({
      categoriesModalIsOpen: true,
      currentEditBankTrans: bankTransId,
    })
  }
  handleOpenCategoriesModalInside = (bankTransId) => () => {
    this.setState({
      categoriesModalIsOpen: true,
      currentEditBankTrans: bankTransId,
    })
  }
  handleRemoveBankTransCategory = (transTypeId) => {
    const { currentCompanyId } = this.props
    return removeAccountCflTransTypeApi.post({ body: { transTypeId, companyId: currentCompanyId } })
  }

  handleCreateBankTransCategory = (transTypeName) => {
    const { currentCompanyId } = this.props
    return createAccountCflTransTypeApi.post({
      body: {
        'transTypeId': null,
        transTypeName,
        companyId: currentCompanyId,
      },
    })
  }

  handleCloseCheckListModal = () => {
    this.setModalInsideVisible(!this.state.editModalInsideIsOpen)()
  }

  updateRow = (param) => () => {
    const { updateRow } = this.props
    updateRow(param)
  }

  setStates = (params) => () => {
    this.setState(params)
  }

  editInput = (param) => () => {
    const { dataOfRow, dataOfRowGroup } = this.state

    if (param === 'account') {
      if (this.state.tab === 1) {
        if (!this.state.disabledGrTab1.account) {
          const types = this.props.accounts.map((item) => {
            return {
              text: item.accountNickname,
              id: item.companyAccountId,
              selected: (item.companyAccountId === dataOfRow.companyAccountId),
              account: item,
            }
          })
          this.setState({
            typeEditModal: 'companyAccountId',
            titleModalInside: 'ח-ן',
            dataList: types,
          })
          this.setModalInsideVisible(true)()
        }
      }
      if (this.state.tab === 2) {
        if (!this.state.disabledGrTab2.account) {
          const types = this.props.accounts.map((item) => {
            return {
              text: item.accountNickname,
              id: item.companyAccountId,
              selected: (item.companyAccountId === this.state.dataOfRowGroup.companyAccountId),
              account: item,
            }
          })
          this.setState({
            typeEditModal: 'companyAccountId',
            titleModalInside: 'ח-ן',
            dataList: types,
          })
          this.setModalInsideVisible(true)()
        }
      }
    } else if (param === 'transTypeName') {
      if (this.state.tab === 1 && !this.state.disabledGrTab1.transTypeName) {
        this.handleOpenCategoriesModal(dataOfRow.transType)
      }

      if (this.state.tab === 2 && !this.state.disabledGrTab2.transTypeName) {
        this.handleOpenCategoriesModal(this.state.dataOfRowGroup.transType)
      }
    } else if (param === 'paymentDesc') {
      if (this.state.tab === 1 && !this.state.disabledGrTab1.paymentDesc) {
        const paymentList = this.state.paymentList
        const selected = paymentList.find((item) => item.id === dataOfRow.paymentDesc)
        if (selected) {
          selected.selected = true
        }
        this.setState({
          typeEditModal: 'paymentDesc',
          titleModalInside: 'סוג תשלום',
          dataList: paymentList,
        })
        this.setModalInsideVisible(true)()
      }

      if (this.state.tab === 2 && !this.state.disabledGrTab2.paymentDesc) {
        const paymentList = this.state.paymentList
        const selected = paymentList.find((item) => item.id === this.state.dataOfRowGroup.paymentDesc)
        if (selected) {
          selected.selected = true
        }
        this.setState({
          typeEditModal: 'paymentDesc',
          titleModalInside: 'סוג תשלום',
          dataList: paymentList,
        })
        this.setModalInsideVisible(true)()
      }
    } else if (param === 'transDate') {
      const { screen } = this.props
      let transDate
      let targetType

      if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
        transDate = 'transDate'
        targetType = this.state.dataOfRowGroup.targetType
      } else if (screen === 'BankMatchScreen') {
        transDate = 'targetOriginalDate'
        targetType = this.state.dataOfRowGroup.targetTypeName
      }

      if (this.state.tab === 1 && !this.state.disabledGrTab1.transDate) {
        this.setState({
          typeEditModal: transDate,
          titleModalInside: 'תאריך',
        })
        this.setModalInsideVisible(true)()
      }

      if (this.state.tab === 2 && (!this.state.disabledGrTab2.transDate || (this.state.disabledGrTab2.transDate && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL' && targetType === 'DIRECTD'))) {
        this.setState({
          typeEditModal: transDate,
          titleModalInside: 'החל מתאריך',
        })
        this.setModalInsideVisible(true)()
      }
    } else if (param === 'total') {
      if (this.state.tab === 1 && !this.state.disabledGrTab1.total) {
        this.setState({ editSum: true })
      }
      if (this.state.tab === 2) {
        const { screen } = this.props
        let targetType
        if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
          targetType = this.state.dataOfRowGroup.targetType
        } else if (screen === 'BankMatchScreen') {
          targetType = this.state.dataOfRowGroup.targetTypeName
        }
        if (targetType === 'CYCLIC_TRANS') {
          if (this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL' && !this.state.disabledGrTab2.total) {
            this.setState({ editSum: true })
          }
        } else {
          if ((!this.state.disabledGrTab2.total ||
            (this.state.disabledGrTab2.total && targetType === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL'))) {
            this.setState({ editSum: true })
          }
        }
      }
    } else if (param === 'transFrequencyName') {
      if (this.state.tab === 2) {
        const { screen } = this.props
        let targetType
        if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
          targetType = this.state.dataOfRowGroup.targetType
        } else if (screen === 'BankMatchScreen') {
          targetType = this.state.dataOfRowGroup.targetTypeName
        }
        if (
          this.state.dataOfRowGroup.transFrequencyName !== 'MULTIPLE' &&
          (
            (!this.state.disabledGrTab2.transFrequencyName || (targetType === 'DIRECTD' && this.state.defDIRECTD === 'USER_DEFINED_TOTAL' && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL') || targetType === 'SOLEK_TAZRIM')
          )
        ) {
          const transFrequencyName = this.state[targetType === 'SOLEK_TAZRIM' ? 'transFrequencyNameSolek' : 'transFrequencyName']
          const selected = transFrequencyName.find((item) => item.id === this.state.dataOfRowGroup.transFrequencyName)
          if (selected) {
            selected.selected = true
          }
          this.setState({
            typeEditModal: targetType === 'SOLEK_TAZRIM' ? 'transFrequencyNameSolek' : 'transFrequencyName',
            titleModalInside: 'תדירות',
            dataList: transFrequencyName,
          })
          this.setModalInsideVisible(true)()
        }
      }
    } else if (param === 'autoUpdateTypeName') {
      const { screen } = this.props
      const autoUpdateTypeName = this.state.autoUpdateTypeName
      const selected = autoUpdateTypeName.find((item) => item.id === this.state.dataOfRowGroup.autoUpdateTypeName)
      selected.selected = true
      let targetType
      if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
        targetType = this.state.dataOfRowGroup.targetType
      } else if (screen === 'BankMatchScreen') {
        targetType = this.state.dataOfRowGroup.targetTypeName
      }
      this.setState({
        targetTypeDIRECTD: targetType === 'DIRECTD',
        typeEditModal: 'autoUpdateTypeName',
        titleModalInside: 'סכום לתזרים',
        dataList: autoUpdateTypeName,
      })
      this.setModalInsideVisible(true)()
    } else if (param === 'autoUpdateTypeNameDIRECTD') {
      const { screen } = this.props
      const autoUpdateTypeName = this.state.autoUpdateTypeNameDIRECTD
      const selected = autoUpdateTypeName.find((item) => item.id === this.state.dataOfRowGroup.autoUpdateTypeName)
      selected.selected = true
      let targetType
      if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
        targetType = this.state.dataOfRowGroup.targetType
      } else if (screen === 'BankMatchScreen') {
        targetType = this.state.dataOfRowGroup.targetTypeName
      }
      this.setState({
        targetTypeDIRECTD: targetType === 'DIRECTD',
        typeEditModal: 'autoUpdateTypeNameDIRECTD',
        titleModalInside: 'סכום לתזרים',
        dataList: autoUpdateTypeName,
      })
      this.setModalInsideVisible(true)()
    } else if (param === 'autoUpdateTypeName_SOLEK_TAZRIM') {
      const { screen } = this.props
      const autoUpdateTypeName = this.state.autoUpdateTypeName_SOLEK_TAZRIM

      const selected = autoUpdateTypeName.find((item) => (item.id === this.state.dataOfRowGroup.autoUpdateTypeName) || (item.id === (this.state.dataOfRowGroup.autoUpdateTypeName + '_' + this.state.dataOfRowGroup.transFrequencyName)))
      selected.selected = true

      let targetType
      if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
        targetType = this.state.dataOfRowGroup.targetType
      } else if (screen === 'BankMatchScreen') {
        targetType = this.state.dataOfRowGroup.targetTypeName
      }
      this.setState({
        targetTypeDIRECTD: targetType === 'DIRECTD',
        typeEditModal: 'autoUpdateTypeName_SOLEK_TAZRIM',
        titleModalInside: 'סכום לתזרים',
        dataList: autoUpdateTypeName,
      })
      this.setModalInsideVisible(true)()
    } else if (param === 'autoUpdateTypeName_CCARD_TAZRIM') {
      const { screen } = this.props
      const autoUpdateTypeName = this.state.autoUpdateTypeName_CCARD_TAZRIM
      const selected = autoUpdateTypeName.find((item) => item.id === this.state.dataOfRowGroup.autoUpdateTypeName)
      selected.selected = true
      let targetType
      if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
        targetType = this.state.dataOfRowGroup.targetType
      } else if (screen === 'BankMatchScreen') {
        targetType = this.state.dataOfRowGroup.targetTypeName
      }
      this.setState({
        targetTypeDIRECTD: targetType === 'DIRECTD',
        typeEditModal: 'autoUpdateTypeName_CCARD_TAZRIM',
        titleModalInside: 'סכום לתזרים',
        dataList: autoUpdateTypeName,
      })
      this.setModalInsideVisible(true)()
    } else if (param === 'endDate') {
      const endDate = this.state.endDate
      const selected = endDate.find((item) => item.id === this.state.dataOfRowGroup.endDate)
      selected.selected = true
      this.setState({
        typeEditModal: 'endDate',
        titleModalInside: 'תאריך סיום',
        dataList: endDate,
      })
      this.setModalInsideVisible(true)()
    } else if (param === 'biziboxMutavList') {
      this.setState({
        inProgressMutavList: true,
        modalMutavListShow: true,
      })
      setTimeout(() => {
        if (!this.state.biziboxMutavList.length) {
          getMutavApi.post({ body: { uuid: this.props.currentCompanyId } })
            .then(data => {
              let biziboxMutavListFilter = JSON.parse(JSON.stringify(data))

              if (this.state.tab === 2) {
                if (!this.state.mutavArray[this.state.idxObj].biziboxMutavId) {
                  biziboxMutavListFilter = biziboxMutavListFilter.filter((item) => !this.state.mutavArray.some((it) => it.biziboxMutavId === item.biziboxMutavId))
                }
              }

              this.setState({
                currentMutav: '',
                biziboxMutavList: data,
                biziboxMutavListFilter: biziboxMutavListFilter,
              })
              this.filterMutav()
            })
        } else {
          if (!this.state.biziboxMutavListFilter.length) {
            this.setState({
              currentMutav: '',
            })
            this.filterMutav()
          } else {
            if (this.state.tab === 1) {
              if (dataOfRow.biziboxMutavId) {
                let itemExist = false
                this.state.biziboxMutavListFilter.forEach((item, idx) => {
                  item.data.forEach((it, index) => {
                    if (it.biziboxMutavId === dataOfRow.biziboxMutavId) {
                      itemExist = true
                    }
                  })
                })
                if (itemExist) {
                  setTimeout(() => {
                    if (this.sectionListRef && this.sectionListRef.scrollToLocation) {
                      let sectionIndex = 0
                      let itemIndex = 0
                      let itemIndexTotal = 0
                      this.state.biziboxMutavListFilter.forEach((item, idx) => {
                        // if(itemIndexTotal === 0){
                        //   sectionIndex += 1
                        // }
                        item.data.forEach((it, index) => {
                          itemIndex += 1
                          if (it.biziboxMutavId === dataOfRow.biziboxMutavId) {
                            itemIndexTotal = itemIndex
                          }
                        })
                      })
                      // console.log('itemIndex', itemIndex)

                      this.sectionListRef.scrollToLocation({
                        animated: true,
                        viewPosition: 0,
                        itemIndex: itemIndexTotal + ((IS_IOS && itemIndexTotal > 0) ? -1 : 0),
                        sectionIndex: sectionIndex,
                      })
                    }
                  }, 20)
                  this.setState({
                    currentMutav: '',
                    inProgressMutavList: false,
                  })
                } else {
                  this.setState({
                    currentMutav: '',
                  })
                  this.filterMutav(true)
                }
              }
            } else if (this.state.tab === 2) {
              if (this.state.mutavArray[this.state.idxObj].biziboxMutavId) {
                let itemExist = false
                this.state.biziboxMutavListFilter.forEach((item, idx) => {
                  item.data.forEach((it, index) => {
                    if (it.biziboxMutavId === this.state.mutavArray[this.state.idxObj].biziboxMutavId) {
                      itemExist = true
                    }
                  })
                })
                if (itemExist) {
                  setTimeout(() => {
                    if (this.sectionListRef && this.sectionListRef.scrollToLocation) {
                      let sectionIndex = 0
                      let itemIndex = 0
                      let itemIndexTotal = 0
                      this.state.biziboxMutavListFilter.forEach((item, idx) => {
                        // if(itemIndexTotal === 0){
                        //   sectionIndex += 1
                        // }
                        item.data.forEach((it, index) => {
                          itemIndex += 1
                          if (it.biziboxMutavId === this.state.mutavArray[this.state.idxObj].biziboxMutavId) {
                            itemIndexTotal = itemIndex
                          }
                        })
                      })
                      // console.log('itemIndex', itemIndex)

                      this.sectionListRef.scrollToLocation({
                        animated: true,
                        viewPosition: 0,
                        itemIndex: itemIndexTotal + ((IS_IOS && itemIndexTotal > 0) ? -1 : 0),
                        sectionIndex: sectionIndex,
                      })
                    }
                  }, 20)
                  this.setState({
                    currentMutav: '',
                    inProgressMutavList: false,
                  })
                } else {
                  this.setState({
                    currentMutav: '',
                  })
                  this.filterMutav(true)
                }
              } else {
                this.setState({
                  currentMutav: '',
                })
                this.filterMutav()
              }
            }
          }
        }
      }, 200)
    } else if (param === 'biziboxMutavPop') {
      if (!this.state.mutavArray) {
        if (this.state.tab === 1) {
          const { screen } = this.props
          let totalVal
          if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
            totalVal = 'total'
          } else if (screen === 'BankMatchScreen') {
            totalVal = 'targetOriginalTotal'
          }
          let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
          if (dataOfRow.mutavArray && Array.isArray(dataOfRow.mutavArray)) {
            if (dataOfRow.mutavArray.length === 1) {
              dataOfRow.mutavArray[0].total = dataOfRowVal[totalVal]
            }
            dataOfRow.mutavArray.forEach((item) => {
              item.transType = (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId) : {
                companyId: '00000000-0000-0000-0000-000000000000',
                createDefaultSupplier: true,
                iconType: 'No category',
                shonaScreen: true,
                transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                transTypeName: 'ללא קטגוריה',
              }
            })
            const mutavArray = JSON.parse(JSON.stringify(dataOfRow.mutavArray))
            mutavArray.push({
              total: null,
              biziboxMutavId: null,
              transType: {
                companyId: '00000000-0000-0000-0000-000000000000',
                createDefaultSupplier: true,
                iconType: 'No category',
                shonaScreen: true,
                transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                transTypeName: 'ללא קטגוריה',
              },
            })
            this.setState({
              idxObj: 0,
              mutavArray: mutavArray,
            })
            setTimeout(() => {
              this.setState({
                modalMutavShow: true,
              })
            }, 50)
          } else {
            if (dataOfRow.mutavArray) {
              this.setState({
                idxObj: 0,
                mutavArray: [{
                  total: dataOfRowVal[totalVal],
                  biziboxMutavId: dataOfRow.mutavArray,
                  transType: dataOfRow.transType,
                }, {
                  total: null,
                  biziboxMutavId: null,
                  transType: {
                    companyId: '00000000-0000-0000-0000-000000000000',
                    createDefaultSupplier: true,
                    iconType: 'No category',
                    shonaScreen: true,
                    transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                    transTypeName: 'ללא קטגוריה',
                  },
                }],
              })
              setTimeout(() => {
                this.setState({
                  modalMutavShow: true,
                })
              }, 50)
            } else {
              this.setState({
                idxObj: 0,
                mutavArray: [{
                  total: null,
                  biziboxMutavId: null,
                  transType: {
                    companyId: '00000000-0000-0000-0000-000000000000',
                    createDefaultSupplier: true,
                    iconType: 'No category',
                    shonaScreen: true,
                    transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                    transTypeName: 'ללא קטגוריה',
                  },
                }],
              })
              setTimeout(() => {
                this.setState({
                  modalMutavShow: true,
                })
              }, 50)
            }
          }
        } else if (this.state.tab === 2) {
          if (dataOfRowGroup.mutavArray && Array.isArray(dataOfRowGroup.mutavArray)) {
            dataOfRowGroup.mutavArray.forEach((item) => {
              item.isDeleted = (item.isDeleted === null) ? false : item.isDeleted
              item.updateType = (item.updateType === null) ? 'future' : item.updateType
              item.transType = (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId) : {
                companyId: '00000000-0000-0000-0000-000000000000',
                createDefaultSupplier: true,
                iconType: 'No category',
                shonaScreen: true,
                transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                transTypeName: 'ללא קטגוריה',
              }
            })
            const mutavArray = JSON.parse(JSON.stringify(dataOfRowGroup.mutavArray))
            mutavArray.push({
              total: null,
              biziboxMutavId: null,
              transType: {
                companyId: '00000000-0000-0000-0000-000000000000',
                createDefaultSupplier: true,
                iconType: 'No category',
                shonaScreen: true,
                transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                transTypeName: 'ללא קטגוריה',
              },
            })
            this.setState({
              idxObj: mutavArray.length - 1,
              mutavArray: mutavArray,
            })
            setTimeout(() => {
              this.setState({
                modalMutavShow: true,
              })
            }, 50)
          } else {
            this.setState({
              idxObj: 0,
              mutavArray: [{
                total: null,
                updateType: 'future',
                biziboxMutavId: null,
                transId: null,
                isDeleted: false,
                transType: {
                  companyId: '00000000-0000-0000-0000-000000000000',
                  createDefaultSupplier: true,
                  iconType: 'No category',
                  shonaScreen: true,
                  transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                  transTypeName: 'ללא קטגוריה',
                },
              }],
            })
            setTimeout(() => {
              this.setState({
                modalMutavShow: true,
              })
            }, 50)
          }
        }
      } else {
        if (this.state.tab === 2 && this.state.mutavArray) {
          let mutavArrayCopy = JSON.parse(JSON.stringify(this.state.mutavArray))
          mutavArrayCopy.forEach((item) => {
            item.isDeleted = (item.isDeleted === null) ? false : item.isDeleted
            item.updateType = (item.updateType === null) ? 'future' : item.updateType
            item.transType = (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === item.transType.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === item.transType.transTypeId) : {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            }
          })
          this.setState({
            idxObj: mutavArrayCopy.length - 1,
            mutavArray: mutavArrayCopy,
          })
          setTimeout(() => {
            this.setState({
              modalMutavShow: true,
            })
          }, 50)
        } else {
          if (this.state.tab === 1 && !this.state.mutavArray.length) {
            this.setState({
              idxObj: 0,
              mutavArray: [{
                total: null,
                biziboxMutavId: null,
                transType: {
                  companyId: '00000000-0000-0000-0000-000000000000',
                  createDefaultSupplier: true,
                  iconType: 'No category',
                  shonaScreen: true,
                  transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                  transTypeName: 'ללא קטגוריה',
                },
              }],
            })
            setTimeout(() => {
              this.setState({
                modalMutavShow: true,
              })
            }, 50)
          } else {
            this.setState({
              modalMutavShow: true,
            })
          }
        }
      }
    }
  }

  setStateAutoUpdateTypeName = (state, isSolek) => () => {
    let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
    if (!isSolek) {
      dataOfRowGroup.autoUpdateTypeName = state
    } else {
      dataOfRowGroup.frequencyAutoUpdateTypeName = state
      if (state === 'AVG_3_MONTHS') {
        dataOfRowGroup.autoUpdateTypeName = state
      }
    }

    this.setState({ dataOfRowGroup: dataOfRowGroup })
  }

  getFrequencyDay (name, day) {
    const {
      t,
    } = this.props

    let dayWeek = ''
    if (day && name === 'WEEK' && typeof (day) === 'number') {
      dayWeek = t(`weekDayNumberShort:${day.toString()}`)
    } else if (day && name === 'WEEK' && typeof (day) === 'string') {
      dayWeek = t(`weekDayShort:${day.toString().toLowerCase()}`)
    }

    switch (name) {
      case 'MONTH':
        return `כל ${day} בחודש `
      case 'WEEK':
        return 'שבועי, כל יום ' + dayWeek
      case 'DAY':
        return 'יומי'
      case 'TWO_MONTHS':
        return `כל ${day} בחודשיים `
      case 'MULTIPLE':
        return 'חודשי'
      case 'NONE':
        return ''
      default:
        return ''
    }
  }

  openModalMutavList = () => {
    this.setState({
      modalMutavListShow: true,
    })
  }
  modalMutavListClose = () => {
    this.setState({
      modalMutavListShow: false,
    })
    const { screen } = this.props
    const { dataOfRow } = this.state
    let targetType
    if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
      targetType = dataOfRow.targetType
    } else if (screen === 'BankMatchScreen') {
      targetType = dataOfRow.targetTypeName
    }

    if (this.state.tab === 2 && targetType === 'CYCLIC_TRANS' && this.state.mutavArray.length === this.state.idxObj + 1) {
      setTimeout(() => this.addMutavim(true), 50)
    }
  }

  handleFilterField = val => {
    let value = val || ''
    this.setState({ currentMutav: value })
    setTimeout(() => this.filterMutav(), 40)
  }
  handleFilter = val => {
    let value = val.nativeEvent.text || ''
    this.setState({ currentMutav: value })
    setTimeout(() => this.filterMutav(), 40)
  }

  filterMutav = (scrollTo) => {
    let mutavListArr = JSON.parse(JSON.stringify(this.state.biziboxMutavList))
    if (this.state.currentMutav && this.state.currentMutav.length > 0) {
      mutavListArr = mutavListArr.filter((item) => item.accountMutavName.includes(this.state.currentMutav))
    }

    if (this.state.tab === 2) {
      if (this.state.mutavArray && !this.state.mutavArray[this.state.idxObj].biziboxMutavId) {
        mutavListArr = mutavListArr.filter((item) => !this.state.mutavArray.some((it) => it.biziboxMutavId === item.biziboxMutavId))
      }
    }

    mutavListArr = mutavListArr.reduce((memo, trans, currentIndex) => {
      const title = trans.accountMutavName.substring(0, 1)
      const oldIndex = memo.findIndex(item => item.title === title)
      if (oldIndex > -1) {
        memo[oldIndex].data.push(trans)
      } else {
        memo.push({ title, data: [trans] })
      }
      return memo
    }, [])

    const isHebrew = mutavListArr.filter((it) => /[\u0590-\u05FF]/.test(it.data[0].accountMutavName)).sort((a, b) => (a.data[0].accountMutavName > b.data[0].accountMutavName) ? 1 : -1)
    const isEnglish = mutavListArr.filter((it) => /^[A-Za-z]+$/.test(it.data[0].accountMutavName)).sort((a, b) => (a.data[0].accountMutavName > b.data[0].accountMutavName) ? 1 : -1)
    const isNumbers = mutavListArr.filter((it) => /^[0-9]+$/.test(it.data[0].accountMutavName)).sort((a, b) => (a.data[0].accountMutavName > b.data[0].accountMutavName) ? 1 : -1)
    const isOthers = mutavListArr.filter((it) => !/^[A-Za-z]+$/.test(it.data[0].accountMutavName) && !/^[0-9]+$/.test(it.data[0].accountMutavName) && !/[\u0590-\u05FF]/.test(it.data[0].accountMutavName)).sort((a, b) => (a.data[0].accountMutavName > b.data[0].accountMutavName) ? 1 : -1)

    this.setState({
      biziboxMutavListFilter: isHebrew.concat(isEnglish, isNumbers, isOthers),
      inProgressMutavList: false,
    })

    if (scrollTo) {
      const { dataOfRow } = this.state
      setTimeout(() => {
        if (this.sectionListRef && this.sectionListRef.scrollToLocation) {
          let sectionIndex = 0
          let itemIndex = 0
          let itemIndexTotal = 0
          this.state.biziboxMutavListFilter.forEach((item, idx) => {
            item.data.forEach((it, index) => {
              itemIndex += 1
              if (this.state.tab === 1) {
                if (it.biziboxMutavId === dataOfRow.biziboxMutavId) {
                  itemIndexTotal = itemIndex
                }
              } else if (this.state.tab === 2) {
                if (it.biziboxMutavId === this.state.mutavArray[this.state.idxObj].biziboxMutavId) {
                  itemIndexTotal = itemIndex
                }
              }
            })
          })
          this.sectionListRef.scrollToLocation({
            animated: true,
            viewPosition: 0,
            itemIndex: itemIndexTotal + ((IS_IOS && itemIndexTotal > 0) ? -1 : 0),
            sectionIndex: sectionIndex,
          })
        }
      }, 20)
    }
  }

  setMutav = (mutav) => () => {
    const { screen } = this.props
    const { dataOfRow } = this.state
    let transName
    let targetType
    if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
      transName = 'transName'
      targetType = dataOfRow.targetType
    } else if (screen === 'BankMatchScreen') {
      transName = 'targetName'
      targetType = dataOfRow.targetTypeName
    }

    if (targetType === 'CYCLIC_TRANS') {
      if (this.state.mutavArray[this.state.idxObj].biziboxMutavId && this.state.mutavArray[this.state.idxObj].biziboxMutavId === mutav.biziboxMutavId) {
        let currentObjState = JSON.parse(JSON.stringify(this.state.mutavArray))
        currentObjState[this.state.idxObj].biziboxMutavId = null
        currentObjState[this.state.idxObj].transType = {
          companyId: '00000000-0000-0000-0000-000000000000',
          createDefaultSupplier: true,
          iconType: 'No category',
          shonaScreen: true,
          transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
          transTypeName: 'ללא קטגוריה',
        }
        this.setState({ mutavArray: currentObjState, biziboxMutavValid: false })
      } else {
        let currentObjState = JSON.parse(JSON.stringify(this.state.mutavArray))
        if (!this.state.mutavArray[this.state.idxObj].biziboxMutavId || mutav.transTypeId !== 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d') {
          currentObjState[this.state.idxObj].transType = (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === mutav.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === mutav.transTypeId) : {
            companyId: '00000000-0000-0000-0000-000000000000',
            createDefaultSupplier: true,
            iconType: 'No category',
            shonaScreen: true,
            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
            transTypeName: 'ללא קטגוריה',
          }
        }
        currentObjState[this.state.idxObj].biziboxMutavId = mutav.biziboxMutavId
        this.setState({
          biziboxMutavValid: true,
          mutavArray: currentObjState,
        })
      }
    } else {
      if (this.state.dataOfRow.biziboxMutavId && this.state.dataOfRow.biziboxMutavId === mutav.biziboxMutavId) {
        let currentObjState = Object.assign({}, this.state.dataOfRow)
        currentObjState.biziboxMutavId = null
        currentObjState.transType = {
          companyId: '00000000-0000-0000-0000-000000000000',
          createDefaultSupplier: true,
          iconType: 'No category',
          shonaScreen: true,
          transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
          transTypeName: 'ללא קטגוריה',
        }
        this.setState({ dataOfRow: currentObjState, biziboxMutavValid: false })
      } else {
        let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
        dataOfRowVal[transName] = (!dataOfRowVal.expence ? 'העברה מ' : 'העברה ל') + '' + mutav.accountMutavName
        if (!this.state.dataOfRow.biziboxMutavId || mutav.transTypeId !== 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d') {
          dataOfRowVal.transType = (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === mutav.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === mutav.transTypeId) : {
            companyId: '00000000-0000-0000-0000-000000000000',
            createDefaultSupplier: true,
            iconType: 'No category',
            shonaScreen: true,
            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
            transTypeName: 'ללא קטגוריה',
          }
        }
        dataOfRowVal.biziboxMutavId = mutav.biziboxMutavId
        this.setState({
          biziboxMutavValid: true,
          dataOfRow: dataOfRowVal,
        })
      }
    }
  }

  renderFakeHeader = () => {
    return <Animated.View
      style={{
        flex: 1,
        height: 0,
        backgroundColor: 'transparent',
      }}
    />
  }
  renderTitleSectionHeader = ({ section }) => {
    return (
      <View style={[
        styles.sectionTitleWrapper,
        {
          paddingHorizontal: 20,
        },
      ]}>
        <View style={{
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: colors.white,
          height: 20,
          width: 'auto',
          flexDirection: 'row-reverse',
          paddingHorizontal: 10,
        }}>
          <Text style={[styles.sectionTitleText, {
            textAlign: 'right',
            color: '#022258',
            fontSize: sp(16),
            fontFamily: fonts.semiBold,
          }]}>{section.title}</Text>
        </View>
      </View>
    )
  }

  getItemLayout = (data, index) => ({
    length: 45,
    offset: 45 * index,
    index,
  })

  openActionSheet = (mutav) => () => {
    this.setState({
      mutavRow: mutav,
    })
    this.bottomActionSheet.show(() => {
      console.log('callback - show')
    })
  }

  onChange = (value, index, values) => {
    console.log(values)
    this.setState({ selectedItems: values })
  }

  onItemPress = (value) => {
    if (value === 'edit') {
      // const mutavRow = this.state.mutavRow
      // console.log('Press: mutavRow -> ', mutavRow)
      this.addMutav()
    }
    console.log('Press: value -> ', value)
  }

  renderScrollItem = ({ item, index }) => {
    const { t } = this.props
    const { screen } = this.props
    const { dataOfRow } = this.state
    let targetType
    let biziboxMutavId = null
    if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
      targetType = dataOfRow.targetType
    } else if (screen === 'BankMatchScreen') {
      targetType = dataOfRow.targetTypeName
    }
    if (targetType === 'CYCLIC_TRANS') {
      biziboxMutavId = this.state.mutavArray[this.state.idxObj].biziboxMutavId
    } else {
      biziboxMutavId = this.state.dataOfRow.biziboxMutavId
    }

    return (
      <TouchableOpacity
        onLongPress={this.openActionSheet(item)}
        onPress={this.setMutav(item)}
        style={{
          flexDirection: 'row-reverse',
          justifyContent: 'center',
          alignItems: 'center',
          height: 45,
          flex: 1,
          marginRight: 20,
          paddingHorizontal: 20,
          borderTopLeftRadius: 21,
          borderBottomLeftRadius: 21,
          backgroundColor: (item.biziboxMutavId === biziboxMutavId) ? '#f5f5f5' : '#ffffff',
        }}>
        <View style={{
          flex: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {item.biziboxMutavId === biziboxMutavId && (
            <Icon
              name="check"
              type="material-community"
              size={25}
              color={'#0addc1'}
            />
          )}
        </View>

        <View style={{
          flex: 80,
          flexDirection: 'row-reverse',
          alignItems: 'center',
        }}>

          <View>
            <Text style={{
              textAlign: 'right',
              color: '#022258',
              fontSize: sp(15),
              fontFamily: fonts.semiBold,
            }}>{item.accountMutavName}</Text>

            <View style={{
              flexDirection: 'row-reverse',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
              <Text style={{
                textAlign: 'right',
                color: '#022258',
                fontSize: sp(13),
                fontFamily: fonts.semiBold,
                paddingLeft: 2,
              }}>{t(`bankName:${item.bankId}`)}</Text>

              <Text style={{
                textAlign: 'right',
                color: '#022258',
                fontSize: sp(13),
                fontFamily: fonts.semiBold,
              }}>{item.accountId}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    )
  }

  addMutav = () => {
    if (this.state.addMutavModal) {
      this.setState({
        mutavRow: null,
      })
    }
    this.setState({
      addMutavModal: !this.state.addMutavModal,
    })
  }

  updateAddMutav = () => {
    this.setState({
      mutavRow: null,
      inProgressMutavList: true,
      addMutavModal: !this.state.addMutavModal,
    })
    getMutavApi.post({ body: { uuid: this.props.currentCompanyId } })
      .then(data => {
        this.setState({
          currentMutav: '',
          biziboxMutavList: data,
          biziboxMutavListFilter: data,
        })
        this.filterMutav()
      })
  }

  editMutav = (index) => () => {
    const params = this.state.mutavArray
    let isValid = true
    if ((this.state.idxObj !== (params.length - 1)) && (params[this.state.idxObj].biziboxMutavId === null || params[this.state.idxObj].total === null || params[this.state.idxObj].total === '')) {
      isValid = false
      this.setState({
        totalArrayNoValid: params[this.state.idxObj].total === null || params[this.state.idxObj].total === '',
        biziboxMutavValid: params[this.state.idxObj].biziboxMutavId !== null,
      })
    }
    if (isValid) {
      this.setState({ idxObj: index, modalMutavInsideShow: true })
    }
  }

  removeMutav = (index) => () => {
    let valuesSave = JSON.parse(JSON.stringify(this.state.mutavArray))
    valuesSave.splice(index, 1)

    if (valuesSave.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '').length) {
      if (this.state.tab === 1) {
        this.setState({
          idxObj: valuesSave.length === 2 ? 0 : (valuesSave.length - 1),
          mutavArray: valuesSave,
          modalMutavInsideShow: false,
        })
      } else {
        this.setState({ idxObj: (valuesSave.length - 1), mutavArray: valuesSave, modalMutavInsideShow: false })
      }
    } else {
      this.setState({ modalMutavInsideShow: false })
      this.removeMutavim()
    }
  }

  removeMutavimOther = () => {
    let currentObjStateArr = []
    if (this.state.mutavArray && Array.isArray(this.state.mutavArray)) {
      currentObjStateArr = JSON.parse(JSON.stringify(this.state.mutavArray))
      currentObjStateArr[this.state.idxObj].biziboxMutavId = null
      currentObjStateArr[this.state.idxObj].transType = {
        companyId: '00000000-0000-0000-0000-000000000000',
        createDefaultSupplier: true,
        iconType: 'No category',
        shonaScreen: true,
        transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
        transTypeName: 'ללא קטגוריה',
      }
    }
    let currentObjState = Object.assign({}, this.state.dataOfRow)
    currentObjState.biziboxMutavId = null
    currentObjState.transType = {
      companyId: '00000000-0000-0000-0000-000000000000',
      createDefaultSupplier: true,
      iconType: 'No category',
      shonaScreen: true,
      transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
      transTypeName: 'ללא קטגוריה',
    }
    this.setState({
      idxObj: 0,
      mutavArray: currentObjStateArr,
      biziboxMutavValid: true,
      mutavText: 'לא חובה',
      dataOfRow: currentObjState,
    })
  }

  removeMutavim = () => {
    const { screen } = this.props
    const { dataOfRow } = this.state
    let targetType
    if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
      targetType = dataOfRow.targetType
    } else if (screen === 'BankMatchScreen') {
      targetType = dataOfRow.targetTypeName
    }
    if (targetType === 'CYCLIC_TRANS') {
      try {
        if (this.state.tab === 1) {
          let currentObjStateArr = []
          if (this.state.mutavArray && Array.isArray(this.state.mutavArray)) {
            currentObjStateArr = JSON.parse(JSON.stringify(this.state.mutavArray))
            currentObjStateArr.forEach((it, idx) => {
              currentObjStateArr[idx].total = null
              currentObjStateArr[idx].biziboxMutavId = null
              currentObjStateArr[idx].transType = {
                companyId: '00000000-0000-0000-0000-000000000000',
                createDefaultSupplier: true,
                iconType: 'No category',
                shonaScreen: true,
                transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                transTypeName: 'ללא קטגוריה',
              }
            })
          }
          let currentObjState = Object.assign({}, this.state.dataOfRow)
          currentObjState.biziboxMutavId = null
          currentObjState.transType = {
            companyId: '00000000-0000-0000-0000-000000000000',
            createDefaultSupplier: true,
            iconType: 'No category',
            shonaScreen: true,
            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
            transTypeName: 'ללא קטגוריה',
          }
          this.setState({
            idxObj: 0,
            mutavArray: currentObjStateArr,
            biziboxMutavValid: true,
            mutavText: 'לא חובה',
            dataOfRow: currentObjState,
          })
        } else if (this.state.tab === 2) {
          this.setState({
            idxObj: 0,
            mutavArray: [{
              total: null,
              updateType: 'future',
              transId: null,
              biziboxMutavId: null,
              isDeleted: false,
              transTypeId: '00000000-0000-0000-0000-000000000000',
              transType: {
                companyId: '00000000-0000-0000-0000-000000000000',
                createDefaultSupplier: true,
                iconType: 'No category',
                shonaScreen: true,
                transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
                transTypeName: 'ללא קטגוריה',
              },
            }],
            biziboxMutavValid: true,
            mutavText2: 'לא חובה',
            textCategory: false,
          })
        }
      } catch (e) {

      }
    } else {
      if (this.state.tab === 1) {
        let currentObjStateArr = []
        if (this.state.mutavArray && Array.isArray(this.state.mutavArray)) {
          currentObjStateArr = JSON.parse(JSON.stringify(this.state.mutavArray))
          currentObjStateArr.forEach((it, idx) => {
            currentObjStateArr[idx].total = null
            currentObjStateArr[idx].biziboxMutavId = null
            currentObjStateArr[idx].transType = {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            }
          })
        }
        let currentObjState = Object.assign({}, this.state.dataOfRow)
        currentObjState.biziboxMutavId = null
        currentObjState.transType = {
          companyId: '00000000-0000-0000-0000-000000000000',
          createDefaultSupplier: true,
          iconType: 'No category',
          shonaScreen: true,
          transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
          transTypeName: 'ללא קטגוריה',
        }
        this.setState({
          dataOfRow: currentObjState,
          biziboxMutavValid: true,
          idxObj: 0,
          mutavArray: currentObjStateArr,
        })
      } else {
        this.setState({
          idxObj: 0,
          mutavArray: [{
            total: null,
            updateType: 'future',
            transId: null,
            biziboxMutavId: null,
            isDeleted: false,
            transTypeId: '00000000-0000-0000-0000-000000000000',
            transType: {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            },
          }],
          biziboxMutavValid: true,
          mutavText2: 'לא חובה',
          textCategory: false,
        })
      }
    }

    setTimeout(() => {
      this.modalMutavClose()
    }, 50)
  }

  modalMutavClose = () => {
    const mutavArray = this.state.mutavArray ? this.state.mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '') : []
    let mutavText = 'לא חובה'
    const { screen } = this.props

    if (this.state.tab === 1) {
      let textCategory = false

      if (mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null) {
        mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
        let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
        dataOfRowVal.transType = mutavArray[0].transType
        let totalVal
        if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
          totalVal = 'total'
        } else if (screen === 'BankMatchScreen') {
          totalVal = 'targetOriginalTotal'
        }
        dataOfRowVal[totalVal] = mutavArray[0].total
        this.setState({
          dataOfRow: dataOfRowVal,
          textCategory,
          mutavText: mutavText,
          modalMutavShow: false,
          idxObj: 0,
        })
      } else if (mutavArray.length > 1) {
        mutavText = (mutavArray.length) + ' מוטבים'
        const transTypeIdCategory = [...new Set(mutavArray.map(x => x.transType.transTypeId))]
        if (transTypeIdCategory.length > 1) {
          textCategory = 'קטגוריות שונות'
        } else {
          textCategory = mutavArray[0].transType ? mutavArray[0].transType.transTypeName : (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transType.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === mutavArray[0].transType.transTypeId).transTypeName : 'ללא קטגוריה'
        }
        this.setState({
          textCategory,
          mutavText: mutavText,
          modalMutavShow: false,
          idxObj: 0,
        })
      } else {
        this.setState({
          textCategory,
          mutavText: mutavText,
          modalMutavShow: false,
          idxObj: 0,
        })
      }
    } else if (this.state.tab === 2) {
      let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
      let transName, totalVal, targetType
      if (this.props.screen === 'CashFlowScreen' || this.props.screen === 'CyclicTransScreen') {
        transName = 'transName'
        totalVal = 'total'
        targetType = dataOfRowGroup.targetType
      } else if (this.props.screen === 'BankMatchScreen') {
        transName = 'targetName'
        targetType = dataOfRowGroup.targetTypeName
        totalVal = 'targetOriginalTotal'
      }
      let textCategory = false
      let editSum = this.state.editSum
      if (mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null) {
        mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
        dataOfRowGroup.transType = mutavArray[0].transType
        dataOfRowGroup[transName] = (!dataOfRowGroup.expence ? 'העברה מ' : 'העברה ל') + ' ' + this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
        dataOfRowGroup[totalVal] = mutavArray[0].total
        this.setState({
          disabledGrTab2: this.getRulesEditTab2(targetType),
          dataOfRowGroup: dataOfRowGroup,
          mutavText2: mutavText,
          modalMutavShow: false,
          editSum: false,
          textCategory,
        })
      } else if (mutavArray.length > 1) {
        mutavText = (mutavArray.length) + ' מוטבים'
        dataOfRowGroup[transName] = (!dataOfRowGroup.expence ? 'העברה מ' : 'העברה ל') + ' ' + mutavArray.length + ' מוטבים'
        dataOfRowGroup[totalVal] = mutavArray.reduce((memo, it) => {
          return memo + Number(it.total)
        }, 0)
        const transTypeIdCategory = [...new Set(mutavArray.map(x => x.transType.transTypeId))]
        if (transTypeIdCategory.length > 1) {
          textCategory = 'קטגוריות שונות'
        } else {
          dataOfRowGroup.transType = mutavArray[0].transType
        }
        editSum = false
        this.setState({
          mutavText2: mutavText,
          modalMutavShow: false,
          dataOfRowGroup: dataOfRowGroup,
          editSum: editSum,
          textCategory,
          disabledGrTab2: {
            account: false,
            transName: false,
            paymentDesc: false,
            transDate: false,
            transFrequencyName: targetType === 'CYCLIC_TRANS' && this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS',
            total: true,
            transTypeName: true,
          },
        })
      } else {
        this.setState({
          textCategory,
          editSum: false,
          disabledGrTab2: this.getRulesEditTab2(targetType),
          mutavText2: mutavText,
          modalMutavShow: false,
        })
      }
    }
  }

  modalMutavInsideClose = () => {
    const idxObjnow = this.state.idxObj
    const mutavArray = this.state.mutavArray.filter((item) => {
      if (item.biziboxMutavId !== null && item.total !== null && item.total !== '' && item.biziboxMutavId !== this.state.mutavArray[idxObjnow].biziboxMutavId) {
        return item
      }
    })

    if (this.state.mutavArray[idxObjnow].biziboxMutavId !== null && this.state.mutavArray[idxObjnow].total !== null && this.state.mutavArray[idxObjnow].total !== '') {
      mutavArray.push(this.state.mutavArray[idxObjnow])
    }

    this.setState({
      idxObj: 0,
      mutavArray,
    })

    setTimeout(() => {
      this.setState({
        modalMutavInsideShow: false,
      })
    }, 50)
  }

  handleToggleCheckBox = () => {
    const { screen } = this.props
    let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
    dataOfRowGroup.autoUpdateTypeName = (dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL') ? 'AVG_3_MONTHS' : 'USER_DEFINED_TOTAL'
    let targetType
    if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
      targetType = 'targetType'
    } else if (screen === 'BankMatchScreen') {
      targetType = 'targetTypeName'
    }

    if (dataOfRowGroup[targetType] === 'CYCLIC_TRANS') {
      let valuesSaveDis = Object.assign({}, this.state.disabledGrTab2)
      if (dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS') {
        valuesSaveDis.total = true
        valuesSaveDis.transFrequencyName = true
      } else {
        if (!this.state.saveOriginObj.isUnion) {
          valuesSaveDis.total = false
        }
        valuesSaveDis.transFrequencyName = false
      }
      this.setState({
        dataOfRowGroup: dataOfRowGroup,
        disabledGrTab2: valuesSaveDis,
        checkBoxChecked: dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS',
      })
    } else {
      this.setState({
        dataOfRowGroup: dataOfRowGroup,
        checkBoxChecked: dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS',
      })
    }
  }

  handleToggleCheckBoxCategory = () => {
    const { screen } = this.props
    const { dataOfRowGroup } = this.state
    let targetType
    if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
      targetType = 'targetType'
    } else if (screen === 'BankMatchScreen') {
      targetType = 'targetTypeName'
    }

    if (this.state.tab === 2 && this.state.dataOfRowGroup && this.state.dataOfRowGroup[targetType] === 'CYCLIC_TRANS' && this.state.dataOfRowGroup.mutavArray && this.state.dataOfRowGroup.mutavArray.length === 1 && this.state.dataOfRowGroup.mutavArray[0].biziboxMutavId && !this.state.mutavArray) {
      if (dataOfRowGroup.mutavArray && Array.isArray(dataOfRowGroup.mutavArray)) {
        dataOfRowGroup.mutavArray.forEach((item) => {
          item.isDeleted = (item.isDeleted === null) ? false : item.isDeleted
          item.updateType = (item.updateType === null) ? 'future' : item.updateType
          item.transType = (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === item.transTypeId) : {
            companyId: '00000000-0000-0000-0000-000000000000',
            createDefaultSupplier: true,
            iconType: 'No category',
            shonaScreen: true,
            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
            transTypeName: 'ללא קטגוריה',
          }
        })
        const mutavArray = JSON.parse(JSON.stringify(dataOfRowGroup.mutavArray))
        mutavArray.push({
          total: null,
          biziboxMutavId: null,
          transType: {
            companyId: '00000000-0000-0000-0000-000000000000',
            createDefaultSupplier: true,
            iconType: 'No category',
            shonaScreen: true,
            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
            transTypeName: 'ללא קטגוריה',
          },
        })
        this.setState({
          idxObj: mutavArray.length - 1,
          mutavArray: mutavArray,
        })
        setTimeout(() => {
          let dataOfRowGroupCheck = (this.state.updateType === 'future+matched') ? 'future' : 'future+matched'
          let mutavArrayCopy = JSON.parse(JSON.stringify(this.state.mutavArray))
          if (mutavArrayCopy && Array.isArray(mutavArrayCopy)) {
            mutavArrayCopy = mutavArrayCopy.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
          }
          if (mutavArrayCopy && Array.isArray(mutavArrayCopy) && mutavArrayCopy.length === 1) {
            let mutavArr = JSON.parse(JSON.stringify(this.state.mutavArray))
            mutavArr[0].updateType = dataOfRowGroupCheck
            this.setState({ updateType: dataOfRowGroupCheck, mutavArray: mutavArr })
          } else {
            this.setState({ updateType: dataOfRowGroupCheck })
          }
        }, 50)
      } else {
        this.setState({
          idxObj: 0,
          mutavArray: [{
            total: null,
            updateType: 'future',
            biziboxMutavId: null,
            transId: null,
            isDeleted: false,
            transType: {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            },
          }],
        })
        setTimeout(() => {
          let dataOfRowGroupCheck = (this.state.updateType === 'future+matched') ? 'future' : 'future+matched'
          let mutavArrayCopy = JSON.parse(JSON.stringify(this.state.mutavArray))
          if (mutavArrayCopy && Array.isArray(mutavArrayCopy)) {
            mutavArrayCopy = mutavArrayCopy.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
          }
          if (mutavArrayCopy && Array.isArray(mutavArrayCopy) && mutavArrayCopy.length === 1) {
            let mutavArr = JSON.parse(JSON.stringify(this.state.mutavArray))
            mutavArr[0].updateType = dataOfRowGroupCheck
            this.setState({ updateType: dataOfRowGroupCheck, mutavArray: mutavArr })
          } else {
            this.setState({ updateType: dataOfRowGroupCheck })
          }
        }, 50)
      }
    } else {
      let dataOfRowGroupCheck = (this.state.updateType === 'future+matched') ? 'future' : 'future+matched'
      let mutavArrayCopy = JSON.parse(JSON.stringify(this.state.mutavArray))
      if (mutavArrayCopy && Array.isArray(mutavArrayCopy)) {
        mutavArrayCopy = mutavArrayCopy.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
      }
      if (mutavArrayCopy && Array.isArray(mutavArrayCopy) && mutavArrayCopy.length === 1) {
        let mutavArr = JSON.parse(JSON.stringify(this.state.mutavArray))
        mutavArr[0].updateType = dataOfRowGroupCheck
        this.setState({ updateType: dataOfRowGroupCheck, mutavArray: mutavArr })
      } else {
        this.setState({ updateType: dataOfRowGroupCheck })
      }
    }
  }

  handleToggleCheckBoxCategoryInside = () => {
    let mutavArray = JSON.parse(JSON.stringify(this.state.mutavArray))
    mutavArray[this.state.idxObj].updateType = (mutavArray[this.state.idxObj].updateType === 'future+matched') ? 'future' : 'future+matched'
    this.setState({ mutavArray: mutavArray, updateType: mutavArray[this.state.idxObj].updateType })
  }

  addMutavim = (check) => {
    const params = this.state.mutavArray
    let valuesSave = JSON.parse(JSON.stringify(params))
    const idxObjnow = this.state.idxObj
    if (check) {
      if (params[this.state.idxObj].biziboxMutavId === null || params[this.state.idxObj].total === null || params[this.state.idxObj].total === '') {
        return
      }
    }

    const indexes = valuesSave
      .map((it, i) => it.biziboxMutavId === valuesSave[this.state.idxObj].biziboxMutavId ? i : null)
      .filter(i => i !== null)

    if (indexes.length > 1) {
      const idx = indexes.findIndex((item) => item !== idxObjnow)
      valuesSave.splice(indexes[idx], 1)
      this.setState({
        totalArrayNoValid: params[idxObjnow - 1].total === null || params[idxObjnow - 1].total === '',
        biziboxMutavValid: params[idxObjnow - 1].biziboxMutavId !== null,
        idxObj: idxObjnow - 1,
        mutavArray: valuesSave,
      })
    } else {
      this.setState({
        totalArrayNoValid: params[this.state.idxObj].total === null || params[this.state.idxObj].total === '',
        biziboxMutavValid: params[this.state.idxObj].biziboxMutavId !== null,
      })
    }

    // if (this.state.idxObj !== params.length - 1) {
    //   let isValid = true
    //   params.forEach((itemInside, idx) => {
    //     if ((params.length > (idx + 1)) && (itemInside.biziboxMutavId === null || itemInside.total === null || itemInside.total === '')) {
    //       isValid = false
    //     }
    //   })
    //   if (isValid) {
    //     let valuesSave = JSON.parse(JSON.stringify(params))
    //     valuesSave[valuesSave.length - 1] = {
    //       total: null,
    //       updateType: 'future',
    //       biziboxMutavId: null,
    //       transId: null,
    //       isDeleted: false,
    //       transType: {
    //         companyId: '00000000-0000-0000-0000-000000000000',
    //         createDefaultSupplier: true,
    //         iconType: 'No category',
    //         shonaScreen: true,
    //         transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
    //         transTypeName: 'ללא קטגוריה',
    //       },
    //     }
    //     this.setState({ idxObj: (valuesSave.length - 1), mutavArray: valuesSave })
    //   }
    // } else {
    //   debugger
    //
    // }

    let isValid = true
    if (indexes.length > 1) {
      if ((params[idxObjnow - 1].biziboxMutavId === null || params[idxObjnow - 1].total === null || params[idxObjnow - 1].total === '')) {
        isValid = false
      }
    } else {
      if ((params[this.state.idxObj].biziboxMutavId === null || params[this.state.idxObj].total === null || params[this.state.idxObj].total === '')) {
        isValid = false
      }
    }

    if (isValid) {
      if (!valuesSave[valuesSave.length - 1].total && !valuesSave[valuesSave.length - 1].biziboxMutavId) {
        this.setState({ idxObj: valuesSave.length - 1, mutavArray: valuesSave })
      } else {
        valuesSave.push({
          total: null,
          updateType: 'future',
          transId: null,
          biziboxMutavId: null,
          isDeleted: false,
          transTypeId: '00000000-0000-0000-0000-000000000000',
          transType: {
            companyId: '00000000-0000-0000-0000-000000000000',
            createDefaultSupplier: true,
            iconType: 'No category',
            shonaScreen: true,
            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
            transTypeName: 'ללא קטגוריה',
          },
        })
        this.setState({ idxObj: valuesSave.length - 1, mutavArray: valuesSave })
      }
      if (this.scrollView && this.scrollView.scrollToEnd) {
        setTimeout(() => this.scrollView.scrollToEnd({ animated: true }), 200)
      }
    }
  }

  isValidList () {
    const params = this.state.mutavArray
    let isValid = true

    if (this.state.idxObj !== (params.length - 1)) {
      params.forEach((itemInside, idx) => {
        if ((params.length > (idx + 1)) && (itemInside.biziboxMutavId === null || itemInside.total === null || itemInside.total === '')) {
          isValid = false
        }
      })
    } else {
      params.forEach((itemInside) => {
        if (itemInside.biziboxMutavId === null || itemInside.total === null || itemInside.total === '') {
          isValid = false
        }
      })
    }

    return isValid
  }

  blurMutavim = () => {
    if (this.state.tab === 2 && this.state.mutavArray.length === this.state.idxObj + 1) {
      setTimeout(() => this.addMutavim(true), 50)
    }
  }

  moveToTab = () => {
    const { screen } = this.props
    const { dataOfRow } = this.state

    let targetType
    if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
      targetType = 'targetType'
    } else if (screen === 'BankMatchScreen') {
      targetType = 'targetTypeName'
    }
    this.setState({
      tab: 1,
      mutavArray: null,
      editSum: false,
      disabledGrTab1: this.getRulesEditTab1(dataOfRow[targetType]),
    })
    setTimeout(() => this.prepareArrayOfMutavim(), 200)
  }

  render () {
    const { isRtl, currentCompanyId, screen, accounts } = this.props
    const { categoriesModalIsOpen, currentEditBankTrans, dataOfRow, defDIRECTD, modalMutavListShow, currentMutav, biziboxMutavListFilter, inProgressMutavList, addMutavModal, mutavRow, mutavText, modalMutavShow, mutavArray, idxObj, updateType, mutavText2, textCategory, checkBoxChecked } = this.state
    const numberStyle = cs(dataOfRow.expence, [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })
    const rowStyle = !isRtl ? 'row-reverse' : 'row'
    let current, transDate, markedDate, total, targetType, transName, totalVal
    if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
      transName = 'transName'
      totalVal = 'total'
      total = getFormattedValueArray(dataOfRow.total)
      transDate = 'transDate'
      current = AppTimezone.moment((this.state.tab === 1) ? ((dataOfRow.nigreret) ? dataOfRow.originalDate : dataOfRow.transDate) : this.state.dataOfRowGroup.transDate).format('YYYY-MM-DD')
      markedDate = {
        [AppTimezone.moment((this.state.tab === 1) ? ((dataOfRow.nigreret) ? dataOfRow.originalDate : dataOfRow.transDate) : this.state.dataOfRowGroup.transDate).format('YYYY-MM-DD')]: {
          startingDay: true,
          selected: true,
          color: colors.blue3,
        },
      }
      targetType = 'targetType'
    } else if (screen === 'BankMatchScreen') {
      transName = 'targetName'
      totalVal = 'targetOriginalTotal'
      total = getFormattedValueArray(dataOfRow.targetOriginalTotal)
      transDate = 'targetOriginalDate'
      current = AppTimezone.moment((this.state.tab === 1) ? (dataOfRow.targetOriginalDate) : this.state.dataOfRowGroup.targetOriginalDate).format('YYYY-MM-DD')
      markedDate = {
        [AppTimezone.moment((this.state.tab === 1) ? (dataOfRow.targetOriginalDate) : this.state.dataOfRowGroup.targetOriginalDate).format('YYYY-MM-DD')]: {
          startingDay: true,
          selected: true,
          color: colors.blue3,
        },
      }
      targetType = 'targetTypeName'
    }
    let hasError = false
    if (this.state.tab === 2 && this.state.dataOfRowGroup && this.state.dataOfRowGroup[targetType] === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL' && (!this.state.dataOfRowGroup[totalVal] || this.state.dataOfRowGroup[totalVal] === '' || (!this.state.setTransDate && defDIRECTD !== 'USER_DEFINED_TOTAL'))) {
      hasError = true
    }

    let peulotCount = false
    if (modalMutavShow && this.state.tab === 2 && this.state.dataOfRowGroup && this.state.dataOfRowGroup[targetType] === 'CYCLIC_TRANS' && this.state.biziboxMutavList && this.state.biziboxMutavList.length > 0) {
      const filterPeulotCount = this.state.biziboxMutavList.filter((item) => {
        return this.state.mutavArray.filter((it) => it.biziboxMutavId && !this.state.dataOfRowGroup.mutavArray.some((key) => key.biziboxMutavId === it.biziboxMutavId)).some((key) => key.biziboxMutavId === item.biziboxMutavId) && item.peulotCount
      }).map((it) => {
        return it.accountMutavName
      })
      if (filterPeulotCount.length > 0) {
        peulotCount = filterPeulotCount.join(', ')
      }
    }

    return (
      <View>
        <Modal
          animationType="slide"
          transparent={false}
          visible
          onRequestClose={() => {
            // //console.log('Modal has been closed.')
          }}>
          <Modal
            animationType="slide"
            transparent={false}
            visible={modalMutavListShow && targetType !== 'CYCLIC_TRANS'}>
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
                  justifyContent: 'center',
                }}>
                  <View style={[styles.container, {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }]}>
                    <View />
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        fontSize: sp(20),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>
                        {'בחירת מוטב'}
                      </Text>
                    </View>
                    <View>
                      <TouchableOpacity onPress={this.modalMutavListClose}>
                        <View style={{
                          marginRight: 'auto',
                        }}>
                          <Icon name="chevron-right" size={24} color={colors.white} />
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
                  paddingRight: 0,
                  flex: 1,
                }}>
                  <View style={[{
                    height: 27,
                    backgroundColor: '#ededed',
                    borderRadius: 5,
                    marginBottom: 10,
                    marginHorizontal: 39,
                    marginVertical: 5,
                    flexDirection: 'row-reverse',
                    justifyContent: 'space-between',
                  }]}>
                    <TextInput
                      placeholder={'הקלידו טקסט לחיפוש'}
                      placeholderTextColor={'#88909e'}
                      editable
                      maxLength={40}
                      onEndEditing={this.handleFilter}
                      autoCorrect={false}
                      autoCapitalize="sentences"
                      returnKeyType="done"
                      keyboardType="default"
                      underlineColorAndroid="rgba(0,0,0,0)"
                      style={[{
                        textAlign: 'right',
                        color: '#0f3860',
                        height: 27,
                        paddingHorizontal: 10,
                        fontSize: sp(14),
                        fontFamily: fonts.regular,
                        paddingVertical: 1,
                        flex: 1,
                      }]}
                      onChangeText={this.handleFilterField}
                      value={currentMutav}
                      multiline={false}
                    />
                    <View style={{
                      paddingHorizontal: 5,
                      paddingVertical: 3,
                      flex: 0.1,
                    }}>
                      <Icons
                        name="magnify"
                        type="material-community"
                        size={22}
                        color={'#88909e'}
                      />
                    </View>
                  </View>

                  <View style={{
                    width: '100%',
                    marginVertical: 5,
                    height: 1,
                    backgroundColor: '#6b6b6c',
                  }} />

                  {inProgressMutavList && (
                    <Loader
                      isDefault
                      containerStyle={{ backgroundColor: 'transparent' }}
                      color={colors.blue}
                    />
                  )}

                  {(!inProgressMutavList && biziboxMutavListFilter.length === 0 && currentMutav.length > 0) && (
                    <View>
                      <Image
                        style={[{
                          width: 144 / 2,
                          height: 92 / 2,
                          marginBottom: 22.5,
                          alignSelf: 'center',
                          marginTop: 115,
                        }]}
                        source={require('BiziboxUI/assets/notDataMutav.png')}
                      />
                      <Text style={{
                        fontFamily: fonts.semiBold,
                        fontSize: sp(20),
                        textAlign: 'center',
                        color: '#022258',
                      }}>{'לא נמצאו תוצאות לחיפוש המבוקש'}</Text>
                    </View>
                  )}

                  {(!inProgressMutavList && biziboxMutavListFilter && biziboxMutavListFilter.length > 0) && (
                    <SectionList
                      ref={ref => (this.sectionListRef = ref)}
                      removeClippedSubviews
                      stickySectionHeadersEnabled
                      showsVerticalScrollIndicator={false}
                      scrollEnabled
                      style={[styles.accountsContainer, {
                        flex: 1,
                        position: 'relative',
                      }]}
                      contentContainerStyle={[styles.tableWrapper, {
                        backgroundColor: '#ffffff',
                        flexGrow: 1,
                        paddingTop: 0,
                        marginTop: 0,
                        paddingHorizontal: 0,
                        paddingBottom: 40,
                      }]}
                      getItemLayout={this.getItemLayout}
                      sections={biziboxMutavListFilter}
                      renderItem={this.renderScrollItem}
                      renderSectionHeader={this.renderTitleSectionHeader}
                      ListHeaderComponent={this.renderFakeHeader}
                      keyExtractor={(item, i) => `${item.biziboxMutavId}_${i}`}
                      scrollEventThrottle={16}
                      initialNumToRender={100}
                      windowSize={20}
                    />)}

                  {/*<View style={{*/}
                  {/*  height: 36.5,*/}
                  {/*  position: 'absolute',*/}
                  {/*  bottom: 0,*/}
                  {/*  right: 0,*/}
                  {/*  left: 0,*/}
                  {/*  backgroundColor: '#ffffff',*/}
                  {/*  width: '100%',*/}
                  {/*  shadowColor: '#000',*/}
                  {/*  shadowOffset: {*/}
                  {/*    width: 0,*/}
                  {/*    height: 3,*/}
                  {/*  },*/}
                  {/*  shadowOpacity: 0.29,*/}
                  {/*  shadowRadius: 4.65,*/}
                  {/*  elevation: 7,*/}
                  {/*  zIndex: 99,*/}
                  {/*  paddingHorizontal: 39,*/}
                  {/*}}>*/}
                  {/*  <TouchableOpacity*/}
                  {/*    style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {*/}
                  {/*      flex: 1,*/}
                  {/*      flexDirection: 'row',*/}
                  {/*      justifyContent: 'flex-end',*/}
                  {/*      alignItems: 'center',*/}
                  {/*    }]}*/}
                  {/*    onPress={this.addMutav}>*/}
                  {/*    <View style={{*/}
                  {/*      paddingRight: 5,*/}
                  {/*    }}>*/}
                  {/*      <Text style={[{*/}
                  {/*        textAlign: 'right',*/}
                  {/*        color: '#2aa1d9',*/}
                  {/*        fontSize: sp(15),*/}
                  {/*      }, commonStyles.regularFont]}>*/}
                  {/*        {'מוטב חדש'}*/}
                  {/*      </Text>*/}
                  {/*    </View>*/}
                  {/*    <View style={{*/}
                  {/*      width: 25,*/}
                  {/*      height: 25,*/}
                  {/*      backgroundColor: '#0addc1',*/}
                  {/*      borderRadius: 12.5,*/}
                  {/*    }}>*/}
                  {/*      <Text style={{*/}
                  {/*        fontSize: sp(30),*/}
                  {/*        lineHeight: 30,*/}
                  {/*        textAlign: 'center',*/}
                  {/*        color: '#ffffff',*/}
                  {/*      }}>{'+'}</Text>*/}
                  {/*    </View>*/}
                  {/*  </TouchableOpacity>*/}
                  {/*</View>*/}
                </View>
              </View>
            </SafeAreaView>

            <ActionSheet
              showSeparator={false}
              showSparator={false}
              style={{
                paddingHorizontal: 20,
                flex: 1,
                zIndex: 999,
                elevation: 8,
              }}
              ref={(actionSheet) => {
                this.bottomActionSheet = actionSheet
              }}
              position="bottom"
              onChange={this.onChange}
              multiple
              showSelectedIcon={false}
            >

              <ActionSheetItem
                style={{
                  alignItems: 'flex-end',
                  alignSelf: 'flex-end',
                  alignContent: 'flex-end',
                  justifyContent: 'flex-end',
                  flex: 1,
                }}
                textStyle={{
                  color: '#022258',
                  textAlign: 'right',
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}
                showSelectedIcon={false}
                text="עריכה"
                value="edit"
                icon={
                  <CustomIcon
                    name="pencil"
                    size={18}
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: -25,
                    }}
                    color={'#022258'}
                  />
                }
                onPress={this.onItemPress}
              />
              <ActionSheetItem
                style={{
                  alignItems: 'flex-end',
                  alignSelf: 'flex-end',
                  alignContent: 'flex-end',
                  justifyContent: 'flex-end',
                  flex: 1,
                }}
                textStyle={{
                  color: '#022258',
                  textAlign: 'right',
                  fontSize: sp(18),
                  fontFamily: fonts.regular,
                }}
                showSelectedIcon={false}
                text="ביטול"
                value="delete"
                icon={
                  <CustomIcon name="times"
                    size={12}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: -21,
                    }}
                    color={'#022258'} />
                }
                onPress={this.onItemPress}
              />
            </ActionSheet>

            {addMutavModal && (
              <AddMutav
                isEdit={mutavRow}
                paymentDesc={dataOfRow.paymentDesc ? dataOfRow.paymentDesc : 'BankTransfer'}
                companyId={currentCompanyId}
                companyAccountId={dataOfRow.companyAccountId ? dataOfRow.companyAccountId : accounts[0].companyAccountId}
                update={this.updateAddMutav}
                closeModal={this.addMutav}
                isRtl={isRtl}
              />
            )}
          </Modal>
          <Modal
            animationType="slide"
            transparent={false}
            visible={this.state.editModalInsideIsOpen}
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
                    isRtl,
                    [styles.container, {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }],
                    commonStyles.rowReverse,
                  )}>
                    <View />
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{
                        fontSize: sp(20),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>
                        {this.state.titleModalInside}
                      </Text>
                    </View>
                    <View>
                      <TouchableOpacity
                        onPress={this.setModalInsideVisible(!this.state.editModalInsideIsOpen)}>
                        <View style={{
                          marginRight: 'auto',
                        }}>
                          <Icon name="chevron-right" size={24} color={colors.white} />
                        </View>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
                <View style={{
                  width: '100%',
                  height: '100%',
                  marginTop: 44,
                  marginBottom: 10,
                  paddingLeft: 0,
                  paddingRight: 10,
                  flex: 1,
                }}>
                  <KeyboardAwareScrollView enableOnAndroid>
                    {this.state.typeEditModal !== transDate && (<CheckList
                      close={this.handleCloseCheckListModal}
                      setDataState={this.setDataState}
                      data={this.state.dataList}
                      targetTypeDIRECTD={this.state.typeEditModal === 'autoUpdateTypeName' && this.state.targetTypeDIRECTD}
                      value={(this.state.tab === 1) ? dataOfRow : this.state.dataOfRowGroup}
                      type={this.state.typeEditModal} />)}
                    {this.state.typeEditModal === transDate && (<Calendar
                      minDate={(this.state.tab === 2 && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL' && this.state.dataOfRowGroup[targetType] === 'DIRECTD') ? undefined : this.today}
                      current={current}
                      markedDates={markedDate}
                      renderArrow={direction => (
                        <Icon
                          color={'#00adf5'}
                          name={direction === 'left'
                            ? (isRtl ? 'chevron-left' : 'chevron-right')
                            : (isRtl ? 'chevron-right' : 'chevron-left')}
                        />
                      )}
                      onDayPress={(day) => {
                        day.timestamp = AppTimezone.moment(day.dateString).valueOf()

                        if (this.state.tab === 1) {
                          if (screen === 'CashFlowScreen') {
                            if (dataOfRow.nigreret) {
                              let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                              dataOfRowVal.originalDate = day.timestamp
                              this.setState({ dataOfRow: dataOfRowVal })
                            } else {
                              let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                              dataOfRowVal.transDate = day.timestamp
                              this.setState({ dataOfRow: dataOfRowVal })
                            }
                          } else if (screen === 'BankMatchScreen') {
                            let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                            dataOfRowVal.targetOriginalDate = day.timestamp
                            this.setState({ dataOfRow: dataOfRowVal })
                          }
                        } else {
                          if (screen === 'CashFlowScreen' || screen === 'CyclicTransScreen') {
                            this.setState({ transDate: day.timestamp, setTransDate: true })
                            let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
                            dataOfRowGroup.transDate = day.timestamp
                            this.setState({ dataOfRowGroup: dataOfRowGroup })
                          } else if (screen === 'BankMatchScreen') {
                            this.setState({
                              targetOriginalDate: day.timestamp,
                              setTransDate: true,
                            })
                            let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
                            dataOfRowGroup.targetOriginalDate = day.timestamp
                            this.setState({ dataOfRowGroup: dataOfRowGroup })
                          }
                        }
                        this.setModalInsideVisible(!this.state.editModalInsideIsOpen)()
                      }}
                      theme={{
                        'stylesheet.calendar.main': {
                          calendar: {
                            paddingLeft: 0,
                            paddingRight: 0,
                          },
                          week: {
                            marginTop: 2,
                            marginBottom: 2,
                            flexDirection: rowStyle,
                            justifyContent: 'space-around',
                          },
                        },
                        'stylesheet.calendar.header': {
                          header: {
                            flexDirection: rowStyle,
                            justifyContent: 'space-between',
                            paddingLeft: 2,
                            paddingRight: 2,
                            alignItems: 'center',
                          },
                          week: {
                            marginTop: 7,
                            flexDirection: rowStyle,
                            justifyContent: 'space-around',
                          },
                          dayHeader: {
                            fontSize: sp(15),
                            fontFamily: fonts.semiBold,
                            color: colors.red4,
                          },
                          monthText: {
                            fontSize: sp(20),
                            color: colors.blue8,
                            fontFamily: fonts.regular,
                            margin: 10,
                          },
                        },
                      }}
                    />)}
                  </KeyboardAwareScrollView>
                </View>

              </View>
            </SafeAreaView>
          </Modal>

          {categoriesModalIsOpen && (
            <CategoriesModal
              isOpen
              isRtl={isRtl}
              companyId={currentCompanyId}
              bankTrans={currentEditBankTrans}
              onClose={this.handleCloseCategoriesModal}
              onUpdateBankTrans={this.handleSelectCategory}
              onSelectCategory={this.handleSelectCategory}
              onCreateCategory={this.handleCreateBankTransCategory}
              onRemoveCategory={this.handleRemoveBankTransCategory}
            />
          )}

          {modalMutavShow && (
            <Modal
              animationType="slide"
              transparent={false}
              visible={modalMutavShow}>
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
                    justifyContent: 'center',
                  }}>
                    <View style={[styles.container, {
                      flex: 1,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }]}>
                      <View />
                      <View style={{ alignItems: 'center' }}>
                        <Text style={{
                          fontSize: sp(20),
                          color: '#ffffff',
                          fontFamily: fonts.semiBold,
                        }}>
                          {'מוטב'}
                        </Text>
                      </View>
                      <View>
                        <TouchableOpacity onPress={this.modalMutavClose}>
                          <View style={{
                            marginRight: 'auto',
                          }}>
                            <Icon name="chevron-right" size={24} color={colors.white} />
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>

                  {mutavArray && mutavArray.length > 1 && (this.state.tab === 1 ? mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '').length > 1 : mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '').length > 0) && (
                    <View style={{
                      width: '100%',
                      backgroundColor: '#f3f6fa',
                    }}>
                      <View
                        style={{
                          paddingHorizontal: 15,
                          height: 32,
                        }}>
                        <View
                          style={[{
                            height: 32,
                            flexDirection: 'row',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }, cs(!isRtl, commonStyles.row, [commonStyles.rowReverse])]}>
                          <View style={{
                            flex: 70,
                          }} />
                          <View style={{
                            flex: 455,
                          }}>
                            <Text style={{
                              color: '#0f3860',
                              fontSize: sp(15),
                              textAlign: 'right',
                              paddingHorizontal: 33,
                              lineHeight: 32,
                              fontFamily: fonts.regular,
                            }}>
                              {'שם מוטב'}
                            </Text>
                          </View>
                          <View style={{
                            flex: 180,
                          }}>
                            <Text style={{
                              color: '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 32,
                              textAlign: 'center',
                              fontFamily: fonts.regular,
                            }}>
                              {'סכום'}
                            </Text>
                          </View>
                          <View style={{
                            flex: 70,
                          }} />
                        </View>
                      </View>

                      <View
                        style={{
                          maxHeight: 144,
                        }}>
                        <ScrollView
                          ref={scrollView => (this.scrollView = scrollView)}
                          contentContainerStyle={{
                            flexGrow: 0,
                          }}
                          keyboardShouldPersistTaps="always">
                          {mutavArray.map((c, i) => {
                            if ((i + 1) !== mutavArray.length && c.total && c.biziboxMutavId) {
                              return (
                                <View
                                  key={i}
                                  style={[{
                                    paddingHorizontal: 15,
                                    height: 36,
                                    flexDirection: 'row',
                                    flex: 1,
                                    backgroundColor: (i === this.state.idxObj) ? '#e9ecf0' : '#f3f6fa',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    borderTopWidth: (i > 0) ? 1 : 0,
                                    borderTopColor: '#e9ecf0',
                                  }, cs(!isRtl, commonStyles.row, [commonStyles.rowReverse])]}>
                                  <View style={{
                                    flex: 70,
                                  }}>
                                    <TouchableOpacity
                                      activeOpacity={1}
                                      onPress={this.editMutav(i)}>
                                      <Text
                                        style={{
                                          color: '#0f3860',
                                          fontSize: sp(15),
                                          textAlign: 'right',
                                          lineHeight: 36,
                                          fontFamily: fonts.semiBold,
                                        }}
                                        numberOfLines={1} ellipsizeMode="tail">
                                        {i + 1}</Text>
                                    </TouchableOpacity>
                                  </View>
                                  <View style={{
                                    flex: 455,
                                  }}>
                                    <TouchableOpacity
                                      activeOpacity={1}
                                      onPress={this.editMutav(i)}>
                                      <Text
                                        style={{
                                          color: '#0f3860',
                                          fontSize: sp(15),
                                          textAlign: 'right',
                                          lineHeight: 36,
                                          fontFamily: fonts.semiBold,
                                        }}
                                        numberOfLines={1} ellipsizeMode="tail">
                                        {(c.biziboxMutavId)
                                          ? (this.state.biziboxMutavList && this.state.biziboxMutavList.length > 0 && this.state.biziboxMutavList.find((it) => it.biziboxMutavId === c.biziboxMutavId) ? ((this.state.biziboxMutavList.find((it) => it.biziboxMutavId === c.biziboxMutavId).accountMutavName)) : '')
                                          : ''}
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                  <View style={{
                                    flex: 180,
                                  }}>
                                    <TouchableOpacity
                                      activeOpacity={1}
                                      onPress={this.editMutav(i)}>
                                      <Text
                                        style={{
                                          color: '#0f3860',
                                          fontSize: sp(15),
                                          textAlign: 'center',
                                          lineHeight: 36,
                                          fontFamily: fonts.semiBold,
                                        }}
                                        numberOfLines={1}
                                        ellipsizeMode="tail">
                                        {getFormattedValueArray(c.total)[0]}.{getFormattedValueArray(c.total)[1]}
                                      </Text>
                                    </TouchableOpacity>
                                  </View>
                                  <View style={{
                                    flex: 70,
                                  }}>
                                    <TouchableOpacity
                                      style={{
                                        marginTop: 1.5,
                                      }}
                                      onPress={this.editMutav(i)}>
                                      <Icon name="chevron-left" size={24}
                                        color={'#0f3860'} />
                                    </TouchableOpacity>
                                  </View>
                                </View>
                              )
                            }
                          })}
                        </ScrollView>
                      </View>
                    </View>
                  )}

                  <View style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#ffffff',
                    marginTop: (mutavArray.length > 1) ? 10 : 38,
                    marginBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 10,
                    flex: 1,
                  }}>
                    <KeyboardAwareScrollView enableOnAndroid>
                      {/* {this.state.idxObj > 0 && ( */}
                      {/* <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), { */}
                      {/* height: 20, */}
                      {/* marginBottom: 3, */}
                      {/* }]}> */}
                      {/* <View style={{ flex: 1.76, alignItems: 'flex-end' }}> */}
                      {/* <Text style={{ */}
                      {/* color: '#0f3860', */}
                      {/* fontSize: sp(13), */}
                      {/* lineHeight: 20, */}
                      {/* }}> */}
                      {/* {this.state.idxObj + 1} */}
                      {/* </Text> */}
                      {/* </View> */}
                      {/* </View> */}
                      {/* )} */}

                      <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            lineHeight: 42,
                          }}>מוטב</Text>
                        </View>
                        <View style={[{
                          flex: 5.73,
                          backgroundColor: '#f5f5f5',
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }, cs(!this.state.biziboxMutavValid, {}, {
                          borderWidth: 1,
                          borderColor: colors.red,
                        })]}>
                          <TouchableOpacity
                            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                            onPress={this.editInput('biziboxMutavList')}
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}>
                            <View style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flex: 1,
                            }}>
                              <View style={{
                                flex: 1,
                                alignItems: 'flex-start',
                              }}>
                                <Icon name="chevron-left" size={24}
                                  color={colors.blue34} />
                              </View>

                              {/* {this.state.mutavArray[this.state.idxObj].biziboxMutavId && ( */}
                              {/* <View style={{ */}
                              {/* flex: 1, */}
                              {/* alignItems: 'flex-end', */}
                              {/* }}> */}
                              {/* <TouchableOpacity */}
                              {/* style={{ */}
                              {/* paddingHorizontal: 5, */}
                              {/* }} */}
                              {/* hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }} */}
                              {/* onPress={this.removeMutavim} */}
                              {/* > */}
                              {/* <Image */}
                              {/* style={[{ */}
                              {/* resizeMode: 'contain', */}
                              {/* height: 20, */}
                              {/* width: 20, */}
                              {/* }]} */}
                              {/* source={require('BiziboxUI/assets/close-cancel.png')} */}
                              {/* /> */}
                              {/* </TouchableOpacity> */}
                              {/* </View> */}
                              {/* )} */}
                            </View>
                            <Text style={[{
                              textAlign: 'right',
                              color: (!mutavArray[this.state.idxObj].biziboxMutavId) ? '#d0cece' : '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {(mutavArray[this.state.idxObj].biziboxMutavId)
                                ? (this.state.biziboxMutavList && this.state.biziboxMutavList.length > 0 && this.state.biziboxMutavList.find((it) => it.biziboxMutavId === this.state.mutavArray[this.state.idxObj].biziboxMutavId) ? ((this.state.biziboxMutavList.find((it) => it.biziboxMutavId === this.state.mutavArray[this.state.idxObj].biziboxMutavId).accountMutavName)) : '')
                                : 'לא חובה'
                              }
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {this.state.tab === 2 && (
                        <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
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
                              onPress={this.handleOpenCategoriesModalInside(this.state.mutavArray[this.state.idxObj].transType)}
                            >
                              <View style={{
                                marginRight: 'auto',
                              }}>
                                <Icon name="chevron-left" size={24}
                                  color={colors.blue34} />
                              </View>
                              <Text style={[{
                                textAlign: 'right',
                                color: '#0f3860',
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}>
                                {this.state.mutavArray[this.state.idxObj].transType.transTypeName}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      {(this.state.tab === 2) && (
                        <View
                          style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                            height: 18,
                            marginBottom: 8,
                          }]}>
                          <View style={{ flex: 1.76, alignItems: 'flex-end' }} />
                          <View style={{
                            flex: 5.73,
                            paddingHorizontal: 21,
                            alignItems: 'flex-end',
                            // alignSelf: 'flex-end',
                            // alignItems: 'flex-end',
                            // alignContent: 'flex-end',
                            // justifyContent: 'flex-end',
                          }}>
                            <CheckBox
                              containerStyle={{
                                backgroundColor: 'transparent',
                                left: 0,
                                margin: 0,
                                padding: 0,
                                borderWidth: 0,
                                right: 0,
                                width: '100%',
                                marginRight: -2,
                              }}
                              textStyle={{
                                fontSize: sp(13),
                                color: '#022258',
                                fontWeight: 'normal',
                                textAlign: 'right',
                                fontFamily: fonts.regular,
                                right: 0,
                                left: 0,
                                marginRight: 5,
                                margin: 0,
                                padding: 0,
                              }}
                              size={18}
                              right
                              checkedColor="#0addc1"
                              uncheckedColor="#dddddd"
                              title={'עדכנו את הקטגוריה גם עבור תנועות העבר'}
                              iconRight
                              iconType="material-community"
                              checkedIcon="check"
                              uncheckedIcon="check"
                              checked={this.state.mutavArray[this.state.idxObj].updateType === 'future+matched'}
                              onPress={this.handleToggleCheckBoxCategoryInside}
                            />
                          </View>
                        </View>
                      )}

                      {this.state.tab === 1 && (
                        <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                          opacity: 0.3,
                        }]}>
                          <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                            <Text style={{
                              color: '#0f3860',
                              fontSize: sp(13),
                              lineHeight: 42,
                              fontFamily: fonts.regular,
                            }}>קטגוריה</Text>
                          </View>
                          <View style={{
                            flex: 5.73,
                            backgroundColor: '#f5f5f5',
                            paddingHorizontal: 21,
                            borderBottomRightRadius: 20,
                            borderTopRightRadius: 20,
                          }}>
                            <View
                              style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                              }]}
                            >
                              <View style={{
                                marginRight: 'auto',
                              }}>
                                <Icon name="chevron-left" size={24}
                                  color={colors.blue34} />
                              </View>
                              <Text style={[{
                                textAlign: 'right',
                                color: '#0f3860',
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}>
                                {mutavArray[idxObj].transType.transTypeName}
                              </Text>
                            </View>
                          </View>
                        </View>
                      )}

                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                          opacity: checkBoxChecked ? 0.3 : 1,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            lineHeight: 42,
                            fontFamily: fonts.regular,
                          }}>סכום</Text>
                        </View>
                        <View style={[{
                          flex: 5.73,
                          backgroundColor: '#f5f5f5',
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }, cs(this.state.totalArrayNoValid, {}, {
                          borderWidth: 1,
                          borderColor: colors.red,
                        })]}>
                          <TextInput
                            autoCorrect={false}
                            editable={!checkBoxChecked}
                            keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                            style={[{
                              direction: 'ltr',
                              textAlign: 'right',
                              color: '#0f3860',
                              height: 42,
                              fontSize: sp(15),
                              width: '100%',
                            }, commonStyles.regularFont]}
                            onBlur={this.blurMutavim}
                            onEndEditing={(e) => {
                              let valuesSave = JSON.parse(JSON.stringify(this.state.mutavArray))
                              valuesSave[idxObj].total = e.nativeEvent.text.toString().replace(/[^\d.]/g, '')
                              this.setState({
                                mutavArray: valuesSave,
                                totalArrayNoValid: valuesSave[this.state.idxObj].total === '',
                              })
                              if (this.state.tab === 2 && this.state.mutavArray.length === this.state.idxObj + 1) {
                                setTimeout(() => this.addMutavim(true), 50)
                              }
                            }}
                            onChangeText={(totals) => {
                              if (String(totals).split('.').length > 2) {
                                let valuesSave = JSON.parse(JSON.stringify(this.state.mutavArray))
                                this.setState({
                                  mutavArray: valuesSave,
                                  totalArrayNoValid: valuesSave[this.state.idxObj].total === '',
                                })
                              } else {
                                let valuesSave = JSON.parse(JSON.stringify(this.state.mutavArray))
                                valuesSave[this.state.idxObj].total = totals.toString().replace(/[^\d.]/g, '')
                                this.setState({
                                  mutavArray: valuesSave,
                                  totalArrayNoValid: valuesSave[this.state.idxObj].total === '',
                                })
                              }
                            }}
                            value={mutavArray[idxObj].total ? inputWorkaround.getWorkaroundChar() + String(mutavArray[idxObj].total) : null}
                            underlineColorAndroid="transparent"
                          />
                        </View>
                      </View>

                      <View style={{
                        flexDirection: 'row',
                        paddingHorizontal: 21,
                        paddingVertical: 10,
                      }}>
                        <TouchableOpacity
                          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                          onPress={this.removeMutav(this.state.idxObj)}>
                          <CustomIcon name="trash" size={16} color={'#0f3860'} />
                        </TouchableOpacity>
                      </View>

                      {this.state.tab === 2 && (
                        <Fragment>
                          <View
                            style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              height: 32,
                              marginBottom: 8,
                            }]}>
                            <View style={{ flex: 1.50, alignItems: 'flex-end' }} />
                            <View style={{
                              flex: 5.73,
                            }}>

                              {this.isValidList() && (<View
                                style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                  flexDirection: 'row',
                                  justifyContent: 'flex-end',
                                  alignItems: 'center',
                                  flex: 1,
                                }]}>
                                <TouchableOpacity
                                  onPress={this.addMutavim}
                                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                  style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                  }}>
                                  <View
                                    style={{
                                      paddingRight: 5,
                                    }}>
                                    <Text style={[{
                                      textAlign: 'right',
                                      color: '#2aa1d9',
                                      fontSize: sp(15),
                                    }, commonStyles.regularFont]}>
                                      {'מוטב נוסף'}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      width: 25,
                                      height: 25,
                                      backgroundColor: '#0addc1',
                                      borderRadius: 12.5,
                                    }}>
                                    <Text style={{
                                      fontSize: sp(30),
                                      lineHeight: 30,
                                      textAlign: 'center',
                                      fontFamily: fonts.regular,
                                      color: '#ffffff',
                                    }}>{'+'}</Text>
                                  </View>
                                </TouchableOpacity>
                              </View>)}

                              {!this.isValidList() && (<View
                                style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                  flex: 1,
                                  flexDirection: 'row',
                                  justifyContent: 'flex-end',
                                  alignItems: 'center',
                                  opacity: 0.3,
                                }]}>
                                <View style={{
                                  paddingRight: 5,
                                }}>
                                  <Text style={[{
                                    textAlign: 'right',
                                    color: '#2aa1d9',
                                    fontSize: sp(15),
                                  }, commonStyles.regularFont]}>
                                    {'מוטב נוסף'}
                                  </Text>
                                </View>
                                <View style={{
                                  width: 25,
                                  height: 25,
                                  backgroundColor: '#0addc1',
                                  borderRadius: 12.5,
                                }}>
                                  <Text style={{
                                    fontSize: sp(30),
                                    lineHeight: 30,
                                    fontFamily: fonts.regular,
                                    textAlign: 'center',
                                    color: '#ffffff',
                                  }}>{'+'}</Text>
                                </View>
                              </View>)}
                            </View>
                          </View>

                          {peulotCount && (
                            <Text style={[{
                              marginTop: 20,
                              paddingHorizontal: 10,
                              textAlign: 'center',
                              color: '#022258',
                              fontSize: sp(16),
                            }, commonStyles.regularFont]}>
                              {'שימו לב, כבר קיימת תנועה קבועה עבור'}
                              {'\n'}
                              {peulotCount}
                            </Text>
                          )}
                        </Fragment>
                      )}
                    </KeyboardAwareScrollView>
                  </View>
                </View>
              </SafeAreaView>

              <Modal
                animationType="slide"
                transparent={false}
                visible={modalMutavListShow}>
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
                      justifyContent: 'center',
                    }}>
                      <View style={[styles.container, {
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }]}>
                        <View />
                        <View style={{ alignItems: 'center' }}>
                          <Text style={{
                            fontSize: sp(20),
                            color: '#ffffff',
                            fontFamily: fonts.semiBold,
                          }}>
                            {'בחירת מוטב'}
                          </Text>
                        </View>
                        <View>
                          <TouchableOpacity onPress={this.modalMutavListClose}>
                            <View style={{
                              marginRight: 'auto',
                            }}>
                              <Icon name="chevron-right" size={24} color={colors.white} />
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
                      paddingRight: 0,
                      flex: 1,
                    }}>
                      <View style={[{
                        height: 27,
                        backgroundColor: '#ededed',
                        borderRadius: 5,
                        marginBottom: 10,
                        marginHorizontal: 39,
                        marginVertical: 5,
                        flexDirection: 'row-reverse',
                        justifyContent: 'space-between',
                      }]}>
                        <TextInput
                          placeholder={'הקלידו טקסט לחיפוש'}
                          placeholderTextColor={'#88909e'}
                          editable
                          maxLength={40}
                          onEndEditing={this.handleFilter}
                          autoCorrect={false}
                          autoCapitalize="sentences"
                          returnKeyType="done"
                          keyboardType="default"
                          underlineColorAndroid="rgba(0,0,0,0)"
                          style={[{
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 27,
                            paddingHorizontal: 10,
                            fontSize: sp(14),
                            fontFamily: fonts.regular,
                            paddingVertical: 1,
                            flex: 1,
                          }]}
                          onChangeText={this.handleFilterField}
                          value={currentMutav}
                          multiline={false}
                        />
                        <View style={{
                          paddingHorizontal: 5,
                          paddingVertical: 3,
                          flex: 0.1,
                        }}>
                          <Icons
                            name="magnify"
                            type="material-community"
                            size={22}
                            color={'#88909e'}
                          />
                        </View>
                      </View>

                      <View style={{
                        width: '100%',
                        marginVertical: 5,
                        height: 1,
                        backgroundColor: '#6b6b6c',
                      }} />

                      {inProgressMutavList && (
                        <Loader
                          isDefault
                          containerStyle={{ backgroundColor: 'transparent' }}
                          color={colors.blue}
                        />
                      )}

                      {(!inProgressMutavList && biziboxMutavListFilter.length === 0 && currentMutav.length > 0) && (
                        <View>
                          <Image
                            style={[{
                              width: 144 / 2,
                              height: 92 / 2,
                              marginBottom: 22.5,
                              alignSelf: 'center',
                              marginTop: 115,
                            }]}
                            source={require('BiziboxUI/assets/notDataMutav.png')}
                          />
                          <Text style={{
                            fontFamily: fonts.semiBold,
                            fontSize: sp(20),
                            textAlign: 'center',
                            color: '#022258',
                          }}>{'לא נמצאו תוצאות לחיפוש המבוקש'}</Text>
                        </View>
                      )}

                      {(!inProgressMutavList && biziboxMutavListFilter && biziboxMutavListFilter.length > 0) && (
                        <SectionList
                          ref={ref => (this.sectionListRef = ref)}
                          removeClippedSubviews
                          stickySectionHeadersEnabled
                          showsVerticalScrollIndicator={false}
                          scrollEnabled
                          style={[styles.accountsContainer, {
                            flex: 1,
                            position: 'relative',
                          }]}
                          contentContainerStyle={[styles.tableWrapper, {
                            backgroundColor: '#ffffff',
                            flexGrow: 1,
                            paddingTop: 0,
                            marginTop: 0,
                            paddingHorizontal: 0,
                            paddingBottom: 40,
                          }]}
                          getItemLayout={this.getItemLayout}
                          sections={biziboxMutavListFilter}
                          renderItem={this.renderScrollItem}
                          renderSectionHeader={this.renderTitleSectionHeader}
                          ListHeaderComponent={this.renderFakeHeader}
                          keyExtractor={(item, i) => `${item.biziboxMutavId}_${i}`}
                          scrollEventThrottle={16}
                          initialNumToRender={100}
                          windowSize={20}
                        />)}

                      {/*<View style={{*/}
                      {/*  height: 36.5,*/}
                      {/*  position: 'absolute',*/}
                      {/*  bottom: 0,*/}
                      {/*  right: 0,*/}
                      {/*  left: 0,*/}
                      {/*  backgroundColor: '#ffffff',*/}
                      {/*  width: '100%',*/}
                      {/*  shadowColor: '#000',*/}
                      {/*  shadowOffset: {*/}
                      {/*    width: 0,*/}
                      {/*    height: 3,*/}
                      {/*  },*/}
                      {/*  shadowOpacity: 0.29,*/}
                      {/*  shadowRadius: 4.65,*/}
                      {/*  elevation: 7,*/}
                      {/*  zIndex: 99,*/}
                      {/*  paddingHorizontal: 39,*/}
                      {/*}}>*/}
                      {/*  <TouchableOpacity*/}
                      {/*    style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {*/}
                      {/*      flex: 1,*/}
                      {/*      flexDirection: 'row',*/}
                      {/*      justifyContent: 'flex-end',*/}
                      {/*      alignItems: 'center',*/}
                      {/*    }]}*/}
                      {/*    onPress={this.addMutav}>*/}
                      {/*    <View style={{*/}
                      {/*      paddingRight: 5,*/}
                      {/*    }}>*/}
                      {/*      <Text style={[{*/}
                      {/*        textAlign: 'right',*/}
                      {/*        color: '#2aa1d9',*/}
                      {/*        fontSize: sp(15),*/}
                      {/*      }, commonStyles.regularFont]}>*/}
                      {/*        {'מוטב חדש'}*/}
                      {/*      </Text>*/}
                      {/*    </View>*/}
                      {/*    <View style={{*/}
                      {/*      width: 25,*/}
                      {/*      height: 25,*/}
                      {/*      backgroundColor: '#0addc1',*/}
                      {/*      borderRadius: 12.5,*/}
                      {/*    }}>*/}
                      {/*      <Text style={{*/}
                      {/*        fontSize: sp(30),*/}
                      {/*        lineHeight: 30,*/}
                      {/*        textAlign: 'center',*/}
                      {/*        color: '#ffffff',*/}
                      {/*      }}>{'+'}</Text>*/}
                      {/*    </View>*/}
                      {/*  </TouchableOpacity>*/}
                      {/*</View>*/}
                    </View>
                  </View>
                </SafeAreaView>

                <ActionSheet
                  showSeparator={false}
                  showSparator={false}
                  style={{
                    paddingHorizontal: 20,
                    flex: 1,
                    zIndex: 999,
                    elevation: 8,
                  }}
                  ref={(actionSheet) => {
                    this.bottomActionSheet = actionSheet
                  }}
                  position="bottom"
                  onChange={this.onChange}
                  multiple
                  showSelectedIcon={false}
                >

                  <ActionSheetItem
                    style={{
                      alignItems: 'flex-end',
                      alignSelf: 'flex-end',
                      alignContent: 'flex-end',
                      justifyContent: 'flex-end',
                      flex: 1,
                    }}
                    textStyle={{
                      color: '#022258',
                      textAlign: 'right',
                      fontSize: sp(18),
                      fontFamily: fonts.regular,
                    }}
                    showSelectedIcon={false}
                    text="עריכה"
                    value="edit"
                    icon={
                      <CustomIcon
                        name="pencil"
                        size={18}
                        style={{
                          position: 'absolute',
                          top: 2,
                          right: -25,
                        }}
                        color={'#022258'}
                      />
                    }
                    onPress={this.onItemPress}
                  />
                  <ActionSheetItem
                    style={{
                      alignItems: 'flex-end',
                      alignSelf: 'flex-end',
                      alignContent: 'flex-end',
                      justifyContent: 'flex-end',
                      flex: 1,
                    }}
                    textStyle={{
                      color: '#022258',
                      textAlign: 'right',
                      fontSize: sp(18),
                      fontFamily: fonts.regular,
                    }}
                    showSelectedIcon={false}
                    text="ביטול"
                    value="delete"
                    icon={
                      <CustomIcon name="times"
                        size={12}
                        style={{
                          position: 'absolute',
                          top: 6,
                          right: -21,
                        }}
                        color={'#022258'} />
                    }
                    onPress={this.onItemPress}
                  />
                </ActionSheet>

                {addMutavModal && (
                  <AddMutav
                    isEdit={mutavRow}
                    paymentDesc={dataOfRow.paymentDesc ? dataOfRow.paymentDesc : 'BankTransfer'}
                    companyId={currentCompanyId}
                    companyAccountId={dataOfRow.companyAccountId ? dataOfRow.companyAccountId : accounts[0].companyAccountId}
                    update={this.updateAddMutav}
                    closeModal={this.addMutav}
                    isRtl={isRtl}
                  />
                )}
              </Modal>
              {categoriesModalIsOpen && modalMutavShow && (
                <CategoriesModal
                  isOpen
                  isRtl={isRtl}
                  companyId={this.props.currentCompanyId}
                  bankTrans={currentEditBankTrans}
                  onClose={this.handleCloseCategoriesModal}
                  onUpdateBankTrans={this.handleSelectCategory}
                  onSelectCategory={this.handleSelectCategory}
                  onCreateCategory={this.handleCreateBankTransCategory}
                  onRemoveCategory={this.handleRemoveBankTransCategory}
                />
              )}
            </Modal>
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
                  [styles.container, {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }],
                  commonStyles.rowReverse,
                )}>
                  <View>
                    <TouchableOpacity onPress={this.updateRow(false)}>
                      <Text style={{
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>ביטול</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: sp(20), color: '#ffffff', fontFamily: fonts.semiBold }}>
                      {'עריכת'} {dataOfRow.expence ? 'הוצאה' : 'הכנסה'} {((screen === 'CashFlowScreen' || screen === 'BankMatchScreen') && (dataOfRow[targetType] === 'WIRE_TRANSFER' || dataOfRow[targetType] === 'CHEQUE' || dataOfRow[targetType] === 'OTHER' || dataOfRow[targetType] === 'BANK_CHEQUE')) ? 'צפויה' : 'קבועה'}
                    </Text>
                    <Text style={{ fontSize: sp(16), color: '#ffffff', fontFamily: fonts.semiBold }}>
                      {this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === dataOfRow.paymentDesc) ? this.props.searchkey.find((it) => it.paymentDescription === dataOfRow.paymentDesc).name : ''}
                    </Text>
                  </View>
                  <View>
                    <TouchableOpacity
                      activeOpacity={!hasError ? 0.2 : 1}
                      onPress={!hasError ? this.update : null}>
                      <Text style={{
                        opacity: (!hasError) ? 1 : 0.5,
                        fontSize: sp(16),
                        color: '#ffffff',
                        fontFamily: fonts.semiBold,
                      }}>שמירה</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {(screen !== 'CyclicTransScreen' &&
                (dataOfRow[targetType] === 'CYCLIC_TRANS' ||
                  dataOfRow[targetType] === 'DIRECTD' ||
                  dataOfRow[targetType] === 'SOLEK_TAZRIM' ||
                  dataOfRow[targetType] === 'CCARD_TAZRIM' ||
                  dataOfRow[targetType] === 'LOAN_TAZRIM' ||
                  dataOfRow[targetType] === 'CASH')) &&
              (<View style={{
                height: 38,
                backgroundColor: '#ffffff',
                width: '100%',
                marginTop: 26,
                marginBottom: dataOfRow[targetType] === 'DIRECTD' ? 20 : 44,
                paddingLeft: 10,
                paddingRight: 10,
              }}>
                <View style={cs(
                  isRtl,
                  [styles.container, {
                    flex: 1,
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                    alignItems: 'center',
                  }],
                  commonStyles.rowReverse,
                )}>
                  <View>
                    <TouchableOpacity
                      underlayColor={'#08d3b8'}
                      style={cs((this.state.tab === 2),
                        [{
                          alignItems: 'center',
                          height: 37,
                          paddingHorizontal: 8,
                          backgroundColor: '#ffffff',
                        },
                        ], {
                          backgroundColor: '#08d3b8',
                          borderRadius: 7,
                          shadowColor: 'black',
                          shadowOpacity: 0.1,
                          shadowRadius: 0.5,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 4,
                        })}
                      onPress={this.getSingleCyclicTrans(dataOfRow)}>
                      <Text
                        style={cs((this.state.tab === 1), [{
                          fontSize: sp(18),
                          fontFamily: fonts.semiBold,
                          lineHeight: 37,
                          color: '#ffffff',
                        }], {
                          color: '#0f3860',
                        })}>התנועה הקבועה כולה</Text>
                    </TouchableOpacity>
                  </View>
                  <View>
                    <TouchableOpacity
                      style={cs((this.state.tab === 1), [{
                        alignItems: 'center',
                        height: 37,
                        paddingHorizontal: 8,
                        backgroundColor: '#ffffff',
                      },
                      ], {
                        backgroundColor: '#08d3b8',
                        borderRadius: 7,
                        shadowColor: 'black',
                        shadowOpacity: 0.1,
                        shadowRadius: 0.5,
                        shadowOffset: { width: 0, height: 2 },
                        elevation: 4,
                      })}
                      onPress={this.moveToTab}>
                      <Text style={
                        cs((this.state.tab === 2), [{
                          fontSize: sp(18),
                          fontFamily: fonts.semiBold,
                          lineHeight: 37,
                          color: '#ffffff',
                        }], {
                          color: '#0f3860',
                        })
                      }>תנועה זו בלבד</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              )}

              {((screen === 'CyclicTransScreen') || (dataOfRow[targetType] !== 'CYCLIC_TRANS' &&
                dataOfRow[targetType] !== 'DIRECTD' &&
                dataOfRow[targetType] !== 'SOLEK_TAZRIM' &&
                dataOfRow[targetType] !== 'CCARD_TAZRIM' &&
                dataOfRow[targetType] !== 'LOAN_TAZRIM' &&
                dataOfRow[targetType] !== 'CASH')) && (<View style={{
                height: 38,
                width: '100%',
                paddingLeft: 10,
                paddingRight: 10,
              }} />
              )}

              <View style={{
                width: '100%',
                height: '100%',
                marginTop: 0,
                marginBottom: 0,
                paddingLeft: 0,
                paddingRight: 10,
                flex: 1,
              }}>
                {(this.state.tab === 1 && dataOfRow[targetType] === 'LOAN_TAZRIM') && (
                  <View style={{
                    flex: 1,
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}>
                    <Text style={{
                      color: '#0f3860',
                      fontSize: sp(16),
                      fontFamily: fonts.regular,
                      lineHeight: 42,
                      textAlign: 'center',
                    }}>
                      לא ניתן לערוך תנועה בודדת מסוג הלוואה
                    </Text>
                  </View>
                )}
                {(this.state.tab === 1 && dataOfRow[targetType] !== 'LOAN_TAZRIM') && (
                  <KeyboardAwareScrollView enableOnAndroid>
                    <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }, cs(this.state.disabledGrTab1.account, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>ח-ן</Text>
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
                          onPress={this.editInput('account')}>

                          <View style={{
                            marginRight: 'auto',
                          }}>
                            <Icon name="chevron-left" size={24} color={colors.blue34} />
                          </View>
                          <Text
                            style={[styles.dataRowLevel3Text, {
                              fontSize: sp(15),
                              color: '#0f3860',
                              lineHeight: 42,
                            }, commonStyles.regularFont]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {this.props.accounts.find(a => a.companyAccountId === dataOfRow.companyAccountId).accountNickname}
                          </Text>
                          <View style={commonStyles.spaceDivider} />
                          <AccountIcon
                            account={this.props.accounts.find(a => a.companyAccountId === dataOfRow.companyAccountId)} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {(dataOfRow[targetType] === 'WIRE_TRANSFER' || dataOfRow[targetType] === 'CHEQUE' || dataOfRow[targetType] === 'OTHER') && (
                      <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>מוטב</Text>
                        </View>

                        <View style={[{
                          flex: 5.73,
                          backgroundColor: '#f5f5f5',
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }]}>
                          <View
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}>
                            <View style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flex: 1,
                            }}>
                              <View style={{
                                flex: 1,
                                alignItems: 'flex-start',
                              }}>
                                <TouchableOpacity
                                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                  onPress={this.editInput('biziboxMutavList')}>
                                  <Icon name="chevron-left" size={24}
                                    color={colors.blue34} />
                                </TouchableOpacity>
                              </View>

                              {dataOfRow.biziboxMutavId && (
                                <View style={{
                                  flex: 1,
                                  alignItems: 'flex-end',
                                }}>
                                  <TouchableOpacity
                                    style={{
                                      paddingHorizontal: 5,
                                    }}
                                    hitSlop={{
                                      top: 20,
                                      bottom: 20,
                                      left: 20,
                                      right: 20,
                                    }}
                                    onPress={this.removeMutavimOther}
                                  >
                                    <Image
                                      style={[{
                                        resizeMode: 'contain',
                                        height: 20,
                                        width: 20,
                                      }]}
                                      source={require('BiziboxUI/assets/close-cancel.png')}
                                    />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                            <Text style={[{
                              textAlign: 'right',
                              color: (!dataOfRow.biziboxMutavId) ? '#d0cece' : '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {(dataOfRow.biziboxMutavId)
                                ? (this.state.biziboxMutavList && this.state.biziboxMutavList.length > 0 && this.state.biziboxMutavList.find((it) => it.biziboxMutavId === dataOfRow.biziboxMutavId) ? (this.state.biziboxMutavList.find((it) => it.biziboxMutavId === dataOfRow.biziboxMutavId).accountMutavName) : '')
                                : 'לא חובה'
                              }
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                    {(dataOfRow[targetType] === 'CYCLIC_TRANS') && (
                      <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>מוטב</Text>
                        </View>

                        <View style={[{
                          flex: 5.73,
                          backgroundColor: '#f5f5f5',
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }]}>
                          <View
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}>
                            <View style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flex: 1,
                            }}>
                              <View style={{
                                flex: 1,
                                alignItems: 'flex-start',
                              }}>
                                <TouchableOpacity
                                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                  onPress={this.editInput('biziboxMutavPop')}>
                                  <Icon name="chevron-left" size={24}
                                    color={colors.blue34} />
                                </TouchableOpacity>
                              </View>

                              {(mutavText !== 'לא חובה') && (
                                <View style={{
                                  flex: 1,
                                  alignItems: 'flex-end',
                                }}>
                                  <TouchableOpacity
                                    style={{
                                      paddingHorizontal: 5,
                                    }}
                                    hitSlop={{
                                      top: 20,
                                      bottom: 20,
                                      left: 20,
                                      right: 20,
                                    }}
                                    onPress={this.removeMutavim}
                                  >
                                    <Image
                                      style={[{
                                        resizeMode: 'contain',
                                        height: 20,
                                        width: 20,
                                      }]}
                                      source={require('BiziboxUI/assets/close-cancel.png')}
                                    />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                            <Text style={[{
                              textAlign: 'right',
                              color: (mutavText === 'לא חובה') ? '#d0cece' : '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {mutavText}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab1.transName, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>תיאור</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                        alignItems: 'flex-end',
                      }}>
                        <TextInput
                          autoCorrect={false}
                          editable={!this.state.disabledGrTab1.transName}
                          keyboardType="default"
                          style={[{
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            fontFamily: fonts.regular,
                            width: '100%',
                          }, commonStyles.regularFont]}
                          onEndEditing={(e) => {
                            let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                            dataOfRowVal[transName] = e.nativeEvent.text
                            this.setState({ dataOfRow: dataOfRowVal })
                          }}
                          onChangeText={(transNameVal) => {
                            let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                            dataOfRowVal[transName] = transNameVal
                            this.setState({ dataOfRow: dataOfRowVal })
                          }}
                          value={dataOfRow[transName]}
                          underlineColorAndroid="transparent"
                        />
                      </View>
                    </View>
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab1.transTypeName, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
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
                          onPress={this.editInput('transTypeName')}>
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
                            {dataOfRow.transType.transTypeName}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab1.paymentDesc, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>סוג תשלום</Text>
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
                          onPress={this.editInput('paymentDesc')}
                        >
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
                            {this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === dataOfRow.paymentDesc) ? this.props.searchkey.find((it) => it.paymentDescription === dataOfRow.paymentDesc).name : ''}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab1.asmachta, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          lineHeight: 42,
                        }}>אסמכתא</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }}>
                        <TextInput
                          focus={this.state.focusAsmachtaInput}
                          autoCorrect={false}
                          editable={!this.state.disabledGrTab1.asmachta}
                          keyboardType="numeric"
                          style={[{
                            direction: 'ltr',
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            width: '100%',
                          }, commonStyles.regularFont]}
                          onEndEditing={(e) => {
                            let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                            dataOfRowVal.asmachta = e.nativeEvent.text
                            this.setState({ dataOfRow: dataOfRowVal })
                          }}
                          onChangeText={(asmachta) => {
                            let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                            dataOfRowVal.asmachta = asmachta.toString().replace(/[^\d]/g, '')
                            this.setState({ dataOfRow: dataOfRowVal })
                          }}
                          value={dataOfRow.asmachta}
                          underlineColorAndroid="transparent"
                        />
                      </View>
                    </View>
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab1.transDate, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>תאריך</Text>
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
                          onPress={this.editInput('transDate')}>

                          <View style={{
                            marginRight: 'auto',
                          }}>
                            <CustomIcon name={'calendar'} size={24} color={colors.blue34} />
                          </View>
                          <Text style={[{
                            textAlign: 'right',
                            color: '#0f3860',
                            fontSize: sp(15),
                            lineHeight: 42,
                          }, commonStyles.regularFont]}>{(!dataOfRow.nigreret) ? AppTimezone.moment(dataOfRow[transDate]).format('DD/MM/YY') : AppTimezone.moment(dataOfRow.originalDate).format('DD/MM/YY')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab1.total, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>סכום בש״ח</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }}>
                        {this.state.editSum && (
                          <TextInput
                            autoCorrect={false}
                            autoFocus
                            editable={this.state.editSum && !this.state.disabledGrTab1.total}
                            keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                            style={[{
                              direction: 'ltr',
                              textAlign: 'right',
                              color: '#0f3860',
                              height: 42,
                              fontSize: sp(15),
                              width: '100%',
                            }, commonStyles.regularFont]}
                            onEndEditing={(e) => {
                              let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                              dataOfRowVal[totalVal] = e.nativeEvent.text.toString().replace(/[^\d.]/g, '')
                              this.setState({ dataOfRow: dataOfRowVal, editSum: false })
                            }}
                            onChangeText={(totals) => {
                              if (String(totals).split('.').length > 2) {
                                let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                                this.setState({ dataOfRow: dataOfRowVal })
                              } else {
                                let dataOfRowVal = Object.assign({}, this.state.dataOfRow)
                                dataOfRowVal[totalVal] = totals.toString().replace(/[^\d.]/g, '')
                                this.setState({ dataOfRow: dataOfRowVal })
                              }
                            }}
                            value={dataOfRow[totalVal] ? inputWorkaround.getWorkaroundChar() + String(dataOfRow[totalVal]) : null}
                            underlineColorAndroid="transparent"
                          />
                        )}

                        {!this.state.editSum && (
                          <TouchableOpacity
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              justifyContent: 'flex-start',
                              alignItems: 'center',
                            }]}
                            onPress={this.editInput('total')}>
                            <Text
                              style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2, {
                                fontSize: sp(15),
                                lineHeight: 42,
                                color: '#0f3860',
                                direction: 'ltr',
                                textAlign: 'right',
                              }, commonStyles.regularFont]}
                              numberOfLines={1}
                              ellipsizeMode="tail">
                              <Text style={[numberStyle, {
                                fontSize: sp(15),
                                lineHeight: 42,
                                color: '#0f3860',
                              }, commonStyles.regularFont]}>{total[0]}</Text>
                              <Text style={[styles.fractionalPart, {
                                fontSize: sp(15),
                                lineHeight: 42,
                                color: '#0f3860',
                              }, commonStyles.regularFont]}>.{total[1]}</Text>
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {(dataOfRow[targetType] === 'CYCLIC_TRANS' && this.state.disabledGrTab1.total) && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 24,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }} />
                        <View style={{
                          flex: 5.73,
                          paddingHorizontal: 21,
                          alignItems: 'flex-end',
                        }}>
                          <Text style={{
                            fontSize: sp(15),
                            lineHeight: 24,
                            color: '#0f3860',
                            fontFamily: fonts.regular,
                            textAlign: 'right',
                          }}>{'עדכון הסכום מתבצע דרך שדה מוטב'}</Text>
                        </View>
                      </View>
                    )}
                  </KeyboardAwareScrollView>
                )}
                {(this.state.tab === 2 && this.state.dataOfRowGroup) && (
                  <KeyboardAwareScrollView enableOnAndroid>
                    {(this.state.dataOfRowGroup[targetType] === 'DIRECTD' || this.state.dataOfRowGroup[targetType] === 'SOLEK_TAZRIM') && (
                      <View
                        style={{
                          marginHorizontal: 25,
                          flex: 1,
                          flexGrow: 1,
                          flexDirection: 'row-reverse',
                          marginBottom: 10,
                          borderColor: '#022258',
                          borderBottomWidth: 1,
                        }}>
                        <View style={{ flex: 1 }}>
                          <TouchableOpacity
                            onPress={this.setStateAutoUpdateTypeName('AVG_3_MONTHS', this.state.dataOfRowGroup[targetType] === 'SOLEK_TAZRIM')}>
                            <View style={{
                              borderColor: '#022258',
                              borderBottomWidth: ((this.state.dataOfRowGroup[targetType] === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS') || (this.state.dataOfRowGroup[targetType] === 'SOLEK_TAZRIM' && this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'AVG_3_MONTHS')) ? 2 : 0,
                              height: 28,
                              flex: 1,
                              width: '100%',
                            }}>
                              <Text style={[{
                                fontFamily: ((this.state.dataOfRowGroup[targetType] === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName !== 'AVG_3_MONTHS') || (this.state.dataOfRowGroup[targetType] === 'SOLEK_TAZRIM' && this.state.dataOfRowGroup.frequencyAutoUpdateTypeName !== 'AVG_3_MONTHS')) ? fonts.regular : fonts.semiBold,
                                textAlign: 'center',
                                width: '100%',
                                color: '#022258',
                                fontFamily: fonts.regular,
                                fontSize: sp(16),
                              }]}
                              >{'הגדרות מומלצות'}</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                        <View style={{ flex: 1 }}>
                          <TouchableOpacity
                            onPress={this.setStateAutoUpdateTypeName('USER_DEFINED_TOTAL', this.state.dataOfRowGroup[targetType] === 'SOLEK_TAZRIM')}>
                            <View style={{
                              borderColor: '#022258',
                              borderBottomWidth: ((this.state.dataOfRowGroup[targetType] === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL') || (this.state.dataOfRowGroup[targetType] === 'SOLEK_TAZRIM' && this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'USER_DEFINED_TOTAL')) ? 2 : 0,
                              height: 28,
                              flex: 1,
                              width: '100%',
                            }}>
                              <Text style={[{
                                fontFamily: ((this.state.dataOfRowGroup[targetType] === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName !== 'USER_DEFINED_TOTAL') || (this.state.dataOfRowGroup[targetType] === 'SOLEK_TAZRIM' && this.state.dataOfRowGroup.frequencyAutoUpdateTypeName !== 'USER_DEFINED_TOTAL')) ? fonts.regular : fonts.semiBold,
                                textAlign: 'center',
                                width: '100%',
                                fontFamily: fonts.regular,
                                color: '#022258',
                                fontSize: sp(16),
                              }]}
                              >{'ברצוני להגדיר בעצמי'}</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>)}
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab2.account, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>ח-ן</Text>
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
                          onPress={this.editInput('account')}
                        >
                          <View style={{
                            marginRight: 'auto',
                          }}>
                            <Icon name="chevron-left" size={24} color={colors.blue34} />
                          </View>
                          <Text
                            style={[styles.dataRowLevel3Text, {
                              fontSize: sp(15),
                              color: '#0f3860',
                              lineHeight: 42,
                            }, commonStyles.regularFont]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {this.props.accounts.find(a => a.companyAccountId === this.state.dataOfRowGroup.companyAccountId).accountNickname}
                          </Text>
                          <View style={commonStyles.spaceDivider} />
                          <AccountIcon
                            account={this.props.accounts.find(a => a.companyAccountId === this.state.dataOfRowGroup.companyAccountId)} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {(this.state.dataOfRowGroup[targetType] === 'CYCLIC_TRANS') && (
                      <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>מוטב</Text>
                        </View>

                        <View style={[{
                          flex: 5.73,
                          backgroundColor: '#f5f5f5',
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }]}>
                          <View
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}>
                            <View style={{
                              flexDirection: 'row',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flex: 1,
                            }}>
                              <View style={{
                                flex: 1,
                                alignItems: 'flex-start',
                              }}>
                                <TouchableOpacity
                                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                                  onPress={this.editInput('biziboxMutavPop')}>
                                  <Icon name="chevron-left" size={24}
                                    color={colors.blue34} />
                                </TouchableOpacity>
                              </View>

                              {(mutavText2 !== 'לא חובה') && (
                                <View style={{
                                  flex: 1,
                                  alignItems: 'flex-end',
                                }}>
                                  <TouchableOpacity
                                    style={{
                                      paddingHorizontal: 5,
                                    }}
                                    hitSlop={{
                                      top: 20,
                                      bottom: 20,
                                      left: 20,
                                      right: 20,
                                    }}
                                    onPress={this.removeMutavim}
                                  >
                                    <Image
                                      style={[{
                                        resizeMode: 'contain',
                                        height: 20,
                                        width: 20,
                                      }]}
                                      source={require('BiziboxUI/assets/close-cancel.png')}
                                    />
                                  </TouchableOpacity>
                                </View>
                              )}
                            </View>
                            <Text style={[{
                              textAlign: 'right',
                              color: (mutavText2 === 'לא חובה') ? '#d0cece' : '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {mutavText2}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab2.transName, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>תיאור</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                        alignItems: 'flex-end',
                      }}>
                        <TextInput
                          autoCorrect={false}
                          editable={!this.state.disabledGrTab2.transName}
                          keyboardType="default"
                          style={[{
                            textAlign: 'right',
                            color: '#0f3860',
                            height: 42,
                            fontSize: sp(15),
                            width: '100%',
                          }, commonStyles.regularFont]}
                          onEndEditing={(e) => {
                            let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
                            dataOfRowGroup[transName] = e.nativeEvent.text
                            this.setState({ dataOfRowGroup: dataOfRowGroup })
                          }}
                          onChangeText={(transNameVal) => {
                            let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
                            dataOfRowGroup[transName] = transNameVal
                            this.setState({ dataOfRowGroup: dataOfRowGroup })
                          }}
                          value={this.state.dataOfRowGroup[transName]}
                          underlineColorAndroid="transparent"
                        />
                      </View>
                    </View>

                    {textCategory && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                          opacity: 0.3,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
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
                          <View
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}>
                            <Text style={[{
                              textAlign: 'right',
                              color: '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {textCategory}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {!textCategory && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }, cs(this.state.disabledGrTab2.transTypeName, { opacity: 1 }, { opacity: 0.3 })]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
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
                            onPress={this.editInput('transTypeName')}
                          >
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
                              {this.state.dataOfRowGroup.transType.transTypeName}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] === 'CYCLIC_TRANS' && this.state.dataOfRowGroup.mutavArray && this.state.dataOfRowGroup.mutavArray.length === 1 && this.state.dataOfRowGroup.mutavArray[0].biziboxMutavId) && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 18,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }} />
                        <View style={{
                          flex: 5.73,
                          paddingHorizontal: 21,
                          alignItems: 'flex-end',
                          // alignSelf: 'flex-end',
                          // alignItems: 'flex-end',
                          // alignContent: 'flex-end',
                          // justifyContent: 'flex-end',
                        }}>
                          <CheckBox
                            containerStyle={{
                              backgroundColor: 'transparent',
                              left: 0,
                              margin: 0,
                              padding: 0,
                              borderWidth: 0,
                              right: 0,
                              width: '100%',
                              marginRight: -2,
                            }}
                            textStyle={{
                              fontSize: sp(13),
                              color: '#022258',
                              fontWeight: 'normal',
                              textAlign: 'right',
                              fontFamily: fonts.regular,
                              right: 0,
                              left: 0,
                              marginRight: 5,
                              margin: 0,
                              padding: 0,
                            }}
                            size={18}
                            right
                            checkedColor="#0addc1"
                            uncheckedColor="#dddddd"
                            title={'עדכנו את הקטגוריה גם עבור תנועות העבר'}
                            iconRight
                            iconType="material-community"
                            checkedIcon="check"
                            uncheckedIcon="check"
                            checked={updateType === 'future+matched'}
                            onPress={this.handleToggleCheckBoxCategory}
                          />
                        </View>
                      </View>
                    )}

                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab2.paymentDesc, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>סוג תשלום</Text>
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
                          onPress={this.editInput('paymentDesc')}
                        >
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
                            {this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === this.state.dataOfRowGroup.paymentDesc) ? this.props.searchkey.find((it) => it.paymentDescription === this.state.dataOfRowGroup.paymentDesc).name : ''}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {(this.state.dataOfRowGroup[targetType] === 'CYCLIC_TRANS') && (<View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs((this.state.disabledGrTab2.total || this.state.dataOfRowGroup.autoUpdateTypeName !== 'USER_DEFINED_TOTAL'), { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>סכום בש״ח</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }}>
                        {this.state.editSum && (
                          <TextInput
                            autoCorrect={false}
                            multiline={false}
                            autoFocus
                            editable={this.state.editSum && !this.state.disabledGrTab2.total && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL'}
                            keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                            style={[{
                              direction: 'ltr',
                              textAlign: 'right',
                              color: '#0f3860',
                              height: 42,
                              fontSize: sp(15),
                              width: '100%',
                            }, commonStyles.regularFont]}
                            onEndEditing={(e) => {
                              let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
                              dataOfRowGroup[totalVal] = e.nativeEvent.text.toString().replace(/[^\d.]/g, '')
                              this.setState({
                                dataOfRowGroup: dataOfRowGroup,
                                editSum: false,
                              })
                            }}
                            onChangeText={(totals) => {
                              if (String(totals).split('.').length > 2) {
                                let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
                                this.setState({ dataOfRowGroup: dataOfRowGroup })
                              } else {
                                let dataOfRowGroup = Object.assign({}, this.state.dataOfRowGroup)
                                dataOfRowGroup[totalVal] = totals.toString().replace(/[^\d.]/g, '')
                                this.setState({ dataOfRowGroup: dataOfRowGroup })
                              }
                            }}
                            value={this.state.dataOfRowGroup[totalVal] ? inputWorkaround.getWorkaroundChar() + String(this.state.dataOfRowGroup[totalVal]) : null}
                            underlineColorAndroid="transparent"
                          />
                        )}

                        {!this.state.editSum && (
                          <TouchableOpacity
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}
                            onPress={this.editInput('total')}
                          >
                            <Text
                              style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2, {
                                fontSize: sp(15),
                                direction: 'ltr',
                                textAlign: 'right',
                                lineHeight: 42,
                                color: '#0f3860',
                              }, commonStyles.regularFont]} numberOfLines={1}
                              ellipsizeMode="tail">
                              <Text style={[numberStyle, {
                                fontSize: sp(15),
                                lineHeight: 42,
                                color: '#0f3860',
                              }, commonStyles.regularFont]}>{getFormattedValueArray(this.state.dataOfRowGroup[totalVal])[0]}</Text>
                              <Text style={[styles.fractionalPart, {
                                fontSize: sp(15),
                                lineHeight: 42,
                                color: '#0f3860',
                              }, commonStyles.regularFont]}>.{getFormattedValueArray(this.state.dataOfRowGroup[totalVal])[1]}</Text>
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>)}

                    {(this.state.dataOfRowGroup[targetType] === 'CYCLIC_TRANS' && this.state.disabledGrTab2.total && this.state.dataOfRowGroup.mutavArray && this.state.dataOfRowGroup.mutavArray.length > 1) && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 24,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }} />
                        <View style={{
                          flex: 5.73,
                          paddingHorizontal: 21,
                          alignItems: 'flex-end',
                        }}>
                          <Text style={{
                            fontSize: sp(13),
                            lineHeight: 24,
                            fontFamily: fonts.regular,
                            color: '#0f3860',
                            textAlign: 'right',
                          }}>{'עדכון הסכום והקטגוריות מתבצע דרך שדה מוטב'}</Text>
                        </View>
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] !== 'CCARD_TAZRIM' && this.state.dataOfRowGroup[targetType] !== 'SOLEK_TAZRIM' && this.state.dataOfRowGroup[targetType] !== 'DIRECTD') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }, cs(this.state.disabledGrTab2.transFrequencyName, { opacity: 1 }, { opacity: 0.3 })]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>תדירות</Text>
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
                            onPress={this.editInput('transFrequencyName')}>

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
                              {this.state.transFrequencyName.find((item) => item.id === this.state.dataOfRowGroup.transFrequencyName) !== undefined ? this.state.transFrequencyName.find((item) => item.id === this.state.dataOfRowGroup.transFrequencyName).text : ((this.state.dataOfRowGroup.transFrequencyName === 'MULTIPLE') ? 'חודשי' : '')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] === 'DIRECTD') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }, cs(this.state.disabledGrTab2.transFrequencyName && (this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS'), { opacity: 1 }, { opacity: 0.3 })]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>תדירות</Text>
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
                            onPress={this.editInput('transFrequencyName')}>
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

                              {(this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS')
                                ? 'חישוב אוטומטי' : (
                                  (defDIRECTD === 'AVG_3_MONTHS')
                                    ? ('חודשי')
                                    : (
                                      this.state.transFrequencyName.find((item) => item.id === this.state.dataOfRowGroup.transFrequencyName) !== undefined
                                        ? this.state.transFrequencyName.find((item) => item.id === this.state.dataOfRowGroup.transFrequencyName).text
                                        : ((this.state.transFrequencyName === 'MULTIPLE') ? 'חודשי' : '')
                                    )
                                )
                              }
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] === 'DIRECTD') && (<View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>החל מתאריך</Text>
                      </View>

                      {this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL' && (
                        <View style={[{
                          flex: 5.73,
                          backgroundColor: '#f5f5f5',
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }, cs(!this.state.setTransDate && defDIRECTD !== 'USER_DEFINED_TOTAL', {}, {
                          borderWidth: 1,
                          borderColor: colors.red,
                        })]}>
                          <TouchableOpacity
                            style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                              flex: 1,
                              flexDirection: 'row',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                            }]}
                            onPress={this.editInput('transDate')}>
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
                              {!this.state.setTransDate ? (defDIRECTD === 'USER_DEFINED_TOTAL' ? AppTimezone.moment(this.state.dataOfRowGroup[transDate]).format('DD/MM/YY') : '') : AppTimezone.moment(this.state.dataOfRowGroup[transDate]).format('DD/MM/YY')}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}

                      {this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS' && (
                        <View style={{
                          flex: 5.73,
                          paddingHorizontal: 21,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}>
                          <Text
                            style={[styles.dataRowLevel3Text, {
                              fontSize: sp(15),
                              color: '#0f3860',
                              lineHeight: 42,
                            }, commonStyles.regularFont]}
                            numberOfLines={1}
                            ellipsizeMode="tail">
                            {this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL' ? (defDIRECTD === 'USER_DEFINED_TOTAL' ? AppTimezone.moment(this.state.dataOfRowGroup[transDate]).format('DD/MM/YY') : '') : AppTimezone.moment(this.state.dataOfRowGroup[transDate]).format('DD/MM/YY')}
                          </Text>
                        </View>
                      )}

                    </View>)}

                    {(this.state.dataOfRowGroup[targetType] === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>תאריך סיום</Text>
                        </View>
                        <View style={{
                          flex: 5.73,
                          paddingHorizontal: 21,
                          flexDirection: 'row',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                        }}>
                          <Text style={[styles.dataRowLevel3Text, {
                            fontSize: sp(15),
                            color: '#0f3860',
                            lineHeight: 42,
                          }, commonStyles.regularFont]} numberOfLines={1} ellipsizeMode="tail">ללא
                            סיום</Text>
                        </View>
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>סכום</Text>
                        </View>
                        <View style={{
                          flex: 5.73,
                          paddingHorizontal: 21,
                          flexDirection: 'column',
                          justifyContent: 'flex-end',
                          alignItems: 'flex-end',
                        }}>
                          <Text style={[styles.dataRowLevel3Text, {
                            fontSize: sp(15),
                            color: '#0f3860',
                            lineHeight: 26,
                          }, commonStyles.regularFont]} numberOfLines={1} ellipsizeMode="tail">
                            לפי ממוצע
                          </Text>
                          <Text style={[styles.dataRowLevel3Text, {
                            fontSize: sp(11),
                            color: '#0f3860',
                            lineHeight: 16,
                          }, commonStyles.regularFont]} numberOfLines={1} ellipsizeMode="tail">
                            הממוצע מתעדכן אוטומטית בהתאם להיסטוריית התנועה
                          </Text>
                        </View>
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>סכום לתזרים</Text>
                        </View>
                        <View style={[{
                          flex: 5.73,
                          backgroundColor: '#f5f5f5',
                          paddingHorizontal: 21,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }, cs(!this.state.dataOfRowGroup[totalVal] || this.state.dataOfRowGroup[totalVal] === '', {}, {
                          borderWidth: 1,
                          borderColor: colors.red,
                        })]}>
                          {this.state.editSum && (
                            <TextInput
                              autoCorrect={false}
                              autoFocus
                              editable={this.state.editSum}
                              keyboardType={(IS_IOS) ? 'decimal-pad' : 'numeric'}
                              style={[{
                                direction: 'ltr',
                                textAlign: 'right',
                                color: '#0f3860',
                                height: 42,
                                fontSize: sp(15),
                                width: '100%',
                              }, commonStyles.regularFont]}
                              onEndEditing={(e) => {
                                let dataOfRowVal = Object.assign({}, this.state.dataOfRowGroup)
                                dataOfRowVal[totalVal] = e.nativeEvent.text.toString().replace(/[^\d.]/g, '')
                                this.setState({
                                  dataOfRowGroup: dataOfRowVal,
                                  editSum: false,
                                })
                              }}
                              onChangeText={(totals) => {
                                if (String(totals).split('.').length > 2) {
                                  let dataOfRowVal = Object.assign({}, this.state.dataOfRowGroup)
                                  this.setState({ dataOfRowGroup: dataOfRowVal })
                                } else {
                                  let dataOfRowVal = Object.assign({}, this.state.dataOfRowGroup)
                                  dataOfRowVal[totalVal] = totals.toString().replace(/[^\d.]/g, '')
                                  this.setState({ dataOfRowGroup: dataOfRowVal })
                                }
                              }}
                              value={this.state.dataOfRowGroup[totalVal] ? inputWorkaround.getWorkaroundChar() + String(this.state.dataOfRowGroup[totalVal]) : null}
                              underlineColorAndroid="transparent"
                            />
                          )}
                          {!this.state.editSum && (
                            <TouchableOpacity
                              style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                flex: 1,
                                justifyContent: 'flex-start',
                                alignItems: 'center',
                              }]}
                              onPress={this.editInput('total')}>
                              <Text
                                style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2, {
                                  fontSize: sp(15),
                                  lineHeight: 42,
                                  color: '#0f3860',
                                }, commonStyles.regularFont]} numberOfLines={1} ellipsizeMode="tail">
                                <Text style={[numberStyle, {
                                  fontSize: sp(15),
                                  lineHeight: 42,
                                  color: '#0f3860',
                                }, commonStyles.regularFont]}>{getFormattedValueArray(this.state.dataOfRowGroup[totalVal])[0]}</Text>
                                <Text style={[styles.fractionalPart, {
                                  fontSize: sp(15),
                                  lineHeight: 42,
                                  color: '#0f3860',
                                }, commonStyles.regularFont]}>.{getFormattedValueArray(this.state.dataOfRowGroup[totalVal])[1]}</Text>
                              </Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] === 'DIRECTD' && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>תאריך סיום</Text>
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
                            onPress={this.editInput('endDate')}>
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
                              {this.state.endDate.find((item) => item.id === this.state.dataOfRowGroup.endDate) !== undefined ? this.state.endDate.find((item) => item.id === this.state.dataOfRowGroup.endDate).text : ''} {(this.state.dataOfRowGroup.endDate === 'on') ? AppTimezone.moment(this.state.dataOfRowGroup.expirationDate).format('DD/MM/YY') : (this.state.dataOfRowGroup.endDate === 'times') ? this.state.dataOfRowGroup.timesValue + ' פעמים' : ''}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] === 'CYCLIC_TRANS') && (<View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledGrTab2.transDate, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>החל מתאריך</Text>
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
                          onPress={this.editInput('transDate')}>
                          <View style={{
                            marginRight: 'auto',
                          }}>
                            <CustomIcon name={'calendar'} size={24} color={colors.blue34} />
                          </View>
                          <Text style={[{
                            textAlign: 'right',
                            color: '#0f3860',
                            fontSize: sp(15),
                            lineHeight: 42,
                          }, commonStyles.regularFont]}>{AppTimezone.moment(this.state.dataOfRowGroup[transDate]).format('DD/MM/YY')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>)}

                    {(this.state.dataOfRowGroup[targetType] === 'CASH') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>סכום לתזרים</Text>
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
                            onPress={this.editInput('autoUpdateTypeName')}
                          >
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
                              {(this.state.autoUpdateTypeName.find((item) => item.id === this.state.dataOfRowGroup.autoUpdateTypeName) !== undefined) ? this.state.autoUpdateTypeName.find((item) => item.id === this.state.dataOfRowGroup.autoUpdateTypeName).text : ''}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] === 'SOLEK_TAZRIM') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>תדירות</Text>
                        </View>

                        {(this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'USER_DEFINED_TOTAL' && this.state.dataOfRowGroup.autoUpdateTypeName !== 'USER_CURRENT_TOTAL') && (
                          <View style={[{
                            flex: 5.73,
                            backgroundColor: '#f5f5f5',
                            paddingHorizontal: 21,
                            borderBottomRightRadius: 20,
                            borderTopRightRadius: 20,
                          }, this.state.transFrequencyNameValid ? {} : {
                            borderWidth: 1,
                            borderColor: colors.red,
                          }]}>
                            <TouchableOpacity
                              style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                              }]}
                              onPress={this.editInput('transFrequencyName')}>
                              <View style={{
                                marginRight: 'auto',
                              }}>
                                <Icon name="chevron-left" size={24}
                                  color={colors.blue34} />
                              </View>
                              <Text style={[{
                                textAlign: 'right',
                                color: '#0f3860',
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}>
                                {this.getFrequencyDay(this.state.dataOfRowGroup.transFrequencyName, this.state.dataOfRowGroup.frequencyDay)}
                                {/* {this.state.transFrequencyName.find((item) => item.id === this.state.dataOfRowGroup.transFrequencyName) !== undefined ? this.state.transFrequencyName.find((item) => item.id === this.state.dataOfRowGroup.transFrequencyName).text : 'חישוב אוטומטי'} */}
                                {/* {this.state.dataOfRowGroup.transFrequencyName === 'WEEK' ? ', יום ' + LocaleConfig.locales['he'].dayNamesShort[Number(this.state.dataOfRowGroup.frequencyDay) - 1] : ''} */}
                                {/* {this.state.dataOfRowGroup.transFrequencyName === 'MONTH' ? ', ' + this.state.dataOfRowGroup.frequencyDay + ' בחודש ' : ''} */}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}

                        {(this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'USER_DEFINED_TOTAL' && this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_CURRENT_TOTAL') && (
                          <View style={{
                            flex: 5.73,
                          }}>
                            <Text style={[{
                              textAlign: 'right',
                              color: '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {''}
                            </Text>
                          </View>
                        )}
                        {this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'AVG_3_MONTHS' && (
                          <View style={{
                            flex: 5.73,
                          }}>
                            <Text style={[{
                              textAlign: 'right',
                              color: '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {'חישוב אוטומטי'}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}

                    {(this.state.dataOfRowGroup[targetType] === 'SOLEK_TAZRIM') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'USER_DEFINED_TOTAL' ? 42 : 'auto',
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>סכום לתזרים</Text>
                        </View>
                        <View style={{
                          flex: 5.73,
                          backgroundColor: this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'USER_DEFINED_TOTAL' ? '#f5f5f5' : 'transparent',
                          paddingHorizontal: this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'USER_DEFINED_TOTAL' ? 21 : 0,
                          borderBottomRightRadius: 20,
                          borderTopRightRadius: 20,
                        }}>

                          {(this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'USER_DEFINED_TOTAL') && (
                            <TouchableOpacity
                              style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                                flex: 1,
                                flexDirection: 'row',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                              }]}
                              onPress={this.editInput('autoUpdateTypeName_SOLEK_TAZRIM')}
                            >
                              <View style={{
                                marginRight: 'auto',
                              }}>
                                <Icon name="chevron-left" size={24}
                                  color={colors.blue34} />
                              </View>
                              <Text style={[{
                                textAlign: 'right',
                                color: '#0f3860',
                                fontSize: sp(15),
                                lineHeight: 42,
                              }, commonStyles.regularFont]}>
                                {(this.state.autoUpdateTypeName_SOLEK_TAZRIM.find((item) =>
                                  ((item.id === this.state.dataOfRowGroup.autoUpdateTypeName) || item.id === (this.state.dataOfRowGroup.autoUpdateTypeName + '_' + this.state.dataOfRowGroup.transFrequencyName))
                                )) ? this.state.autoUpdateTypeName_SOLEK_TAZRIM.find((item) => (item.id === this.state.dataOfRowGroup.autoUpdateTypeName) || (item.id === (this.state.dataOfRowGroup.autoUpdateTypeName + '_' + this.state.dataOfRowGroup.transFrequencyName))).text : ''}
                                {(this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL_MONTH' || this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL_WEEK') ? getFormattedValueArray(this.state.dataOfRowGroup.total)[0] : ''}
                              </Text>
                            </TouchableOpacity>
                          )}

                          {this.state.dataOfRowGroup.frequencyAutoUpdateTypeName === 'AVG_3_MONTHS' && (
                            <View style={{
                              flex: 5.73,
                              flexDirection: 'column',
                              justifyContent: 'flex-end',
                              alignItems: 'flex-end',
                            }}>
                              <Text
                                style={[styles.dataRowLevel3Text, {
                                  fontSize: sp(15),
                                  marginTop: 15,
                                  color: '#0f3860',
                                  lineHeight: 15,
                                }, commonStyles.boldFont]}
                                numberOfLines={1} ellipsizeMode="tail">
                                {'ממוצע'}
                              </Text>
                              <Text
                                style={[styles.dataRowLevel3Text, {
                                  fontSize: sp(15),
                                  color: '#0f3860',
                                  textAlign: 'right',
                                  lineHeight: 15,
                                }, commonStyles.regularFont]}
                                numberOfLines={2} ellipsizeMode="tail">
                                {'הממוצע מתעדכן אוטומטית בהתאם להיסטוריית התנועה'}
                              </Text>
                            </View>
                          )}

                        </View>
                      </View>
                    )}
                    {(this.state.dataOfRowGroup[targetType] === 'CCARD_TAZRIM') && (
                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            fontFamily: fonts.regular,
                            lineHeight: 42,
                          }}>סכום לתזרים</Text>
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
                            onPress={this.editInput('autoUpdateTypeName_CCARD_TAZRIM')}
                          >
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
                              {(this.state.autoUpdateTypeName_CCARD_TAZRIM.find((item) => item.id === this.state.dataOfRowGroup.autoUpdateTypeName) !== undefined) ? this.state.autoUpdateTypeName_CCARD_TAZRIM.find((item) => item.id === this.state.dataOfRowGroup.autoUpdateTypeName).text : ''} {(this.state.dataOfRowGroup.autoUpdateTypeName === 'USER_DEFINED_TOTAL') ? getFormattedValueArray(this.state.dataOfRowGroup.total)[0] : ''}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                    {(this.state.dataOfRowGroup[targetType] === 'CYCLIC_TRANS') && (<View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>תאריך סיום</Text>
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
                          onPress={this.editInput('endDate')}>
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
                            {this.state.endDate.find((item) => item.id === this.state.dataOfRowGroup.endDate) !== undefined ? this.state.endDate.find((item) => item.id === this.state.dataOfRowGroup.endDate).text : ''} {(this.state.dataOfRowGroup.endDate === 'on') ? AppTimezone.moment(this.state.dataOfRowGroup.expirationDate).format('DD/MM/YY') : (this.state.dataOfRowGroup.endDate === 'times') ? this.state.dataOfRowGroup.timesValue + ' פעמים' : ''}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>)}
                    {(this.state.dataOfRowGroup[targetType] === 'LOAN_TAZRIM') && (<View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>יום בחודש</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        paddingHorizontal: 21,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}>
                        <Text
                          style={[styles.dataRowLevel3Text, {
                            fontSize: sp(15),
                            color: '#0f3860',
                            lineHeight: 42,
                          }, commonStyles.regularFont]}
                          numberOfLines={1} ellipsizeMode="tail"
                        >
                          {this.state.dataOfRowGroup.frequencyDay}
                        </Text>
                      </View>
                    </View>)}
                    {(this.state.dataOfRowGroup[targetType] === 'LOAN_TAZRIM') && (<View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>תאריך סיום</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        paddingHorizontal: 21,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}>
                        <Text style={[styles.dataRowLevel3Text, {
                          fontSize: sp(15),
                          color: '#0f3860',
                          lineHeight: 42,
                        }, commonStyles.regularFont]} numberOfLines={1} ellipsizeMode="tail">
                          {this.state.endDate.find((item) => item.id === this.state.dataOfRowGroup.endDate) !== undefined ? this.state.endDate.find((item) => item.id === this.state.dataOfRowGroup.endDate).text : ''} {(this.state.dataOfRowGroup.endDate === 'on') ? AppTimezone.moment(this.state.dataOfRowGroup.expirationDate).format('DD/MM/YY') : (this.state.dataOfRowGroup.endDate === 'times') ? this.state.dataOfRowGroup.timesValue + ' פעמים' : ''}</Text>
                      </View>
                    </View>)}
                    {(this.state.dataOfRowGroup[targetType] === 'LOAN_TAZRIM') && (<View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          fontFamily: fonts.regular,
                          lineHeight: 42,
                        }}>סכום לתזרים</Text>
                      </View>
                      <View style={{
                        flex: 5.73,
                        paddingHorizontal: 21,
                        flexDirection: 'row',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                      }}>
                        <Text
                          style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2, {
                            fontSize: sp(15),
                            lineHeight: 42,
                            color: '#0f3860',
                            textAlign: 'right',
                          }, commonStyles.regularFont]} numberOfLines={1} ellipsizeMode="tail">
                          <Text style={[numberStyle, {
                            fontSize: sp(15),
                            lineHeight: 42,
                            color: '#0f3860',
                          }, commonStyles.regularFont]}>{getFormattedValueArray(this.state.dataOfRowGroup[totalVal])[0]}</Text>
                          <Text style={[styles.fractionalPart, {
                            fontSize: sp(15),
                            lineHeight: 42,
                            color: '#0f3860',
                          }, commonStyles.regularFont]}>.{getFormattedValueArray(this.state.dataOfRowGroup[totalVal])[1]}</Text>
                        </Text>
                      </View>
                    </View>)}
                    {(this.state.dataOfRowGroup[targetType] === 'CYCLIC_TRANS') && (
                      <View style={{
                        height: 60,
                        alignSelf: 'flex-end',
                        alignItems: 'flex-end',
                        alignContent: 'flex-end',
                        justifyContent: 'flex-end',
                      }}>
                        <CheckBox
                          containerStyle={{
                            backgroundColor: 'transparent',
                            left: 0,
                            margin: 0,
                            padding: 0,
                            borderWidth: 0,
                            right: 0,
                            width: '100%',
                            marginRight: -2,
                          }}
                          textStyle={{
                            fontSize: sp(15),
                            color: '#022258',
                            fontWeight: 'normal',
                            textAlign: 'right',
                            fontFamily: fonts.regular,
                            right: 0,
                            left: 0,
                            marginRight: 5,
                            margin: 0,
                            padding: 0,
                          }}
                          size={24}
                          right
                          checkedColor="#0addc1"
                          uncheckedColor="#dddddd"
                          title={'תנו לנו לעבוד בשבילכם. bizibox תעדכן את התדירות' +
                          '\n' +
                          'והסכום לתזרים על פי היסטורית התנועה'}
                          iconRight
                          iconType="material-community"
                          checkedIcon="check"
                          uncheckedIcon="check"
                          checked={this.state.dataOfRowGroup.autoUpdateTypeName === 'AVG_3_MONTHS'}
                          onPress={this.handleToggleCheckBox}
                        />
                      </View>
                    )}
                  </KeyboardAwareScrollView>
                )}
              </View>
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    )
  }
}
