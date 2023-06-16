import React, {PureComponent} from 'react'
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
import {colors, fonts} from '../../../styles/vars'
import styles from '../CyclicTransStyles'
import {combineStyles as cs, getFormattedValueArray, sp} from '../../../utils/func'
import commonStyles from '../../../styles/styles'
import AccountIcon from '../../../components/AccountIcon/AccountIcon'
import AppTimezone from '../../../utils/appTimezone'
import CheckList from './CheckList'
import {Calendar} from 'react-native-calendars'
import {CheckBox, Icon} from 'react-native-elements'
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view'
import {IS_IOS} from '../../../constants/common'
import CategoriesModal from 'src/components/CategoriesModal/CategoriesModal'
import {createAccountCflTransTypeApi, getMutavApi, removeAccountCflTransTypeApi} from '../../../api'
import CustomIcon from '../../../components/Icons/Fontello'
import {connect} from 'react-redux'
import {setPopAddCreateTranShow} from '../../../redux/actions/user'
import Loader from 'src/components/Loader/Loader'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import {ActionSheet, ActionSheetItem} from 'react-native-action-sheet-component'
import AddMutav from '../../../components/AddMutav/AddMutav'

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
  showPopAlertCreateTrans: state.showPopAlertCreateTrans,
}))
@withTranslation()
export default class CreateEditTransaction extends PureComponent {
    today = AppTimezone.moment().valueOf();

    constructor (props) {
      super(props)
      const targetType = props.dataTransaction.targetType
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
          text: 'אחר/מזומן',
          id: 'Other',
          selected: false,
        },
      ]
      if (!targetType || targetType === 'CYCLIC_TRANS') {
        paymentList = JSON.parse(JSON.stringify(this.props.searchkey.filter((it) => it.showInDrop))).map((it) => {
          return {
            text: it.name,
            id: it.paymentDescription,
            selected: false,
          }
        })
      }
      const dataTransaction = Object.assign({}, props.dataTransaction)
      if (props.selectedAccountIds.length === 1) {
        dataTransaction.companyAccountId = props.selectedAccountIds[0]
      }
      if (dataTransaction.type !== 'createRecommendationApi') {
        dataTransaction.autoUpdateTypeName = 'AVG_3_MONTHS'
      } else {
        dataTransaction.autoUpdateTypeName = 'USER_DEFINED_TOTAL'
      }
      if (!dataTransaction.mutavArray) {
        dataTransaction.mutavArray = [
          {
            total: null,
            biziboxMutavId: null,
            transTypeId: {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            },
          },
        ]
      } else {
        dataTransaction.mutavArray = dataTransaction.mutavArray.map((it) => {
          return {
            total: null,
            biziboxMutavId: it.biziboxMutavId,
            transTypeId: {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            },
          }
        })
      }
      if (dataTransaction.transFrequencyName === 'MULTIPLE') {
        dataTransaction.transFrequencyName = 'MONTH'
      }

      this.state = {
        originObj: props.dataTransaction,
        mutavText: 'לא חובה',
        disabledVal: (targetType) ? this.getRulesEdit(targetType) : {
          account: false,
          transName: false,
          transTypeName: false,
          paymentDesc: false,
          transDate: false,
          total: targetType ? targetType === 'CYCLIC_TRANS' && dataTransaction.autoUpdateTypeName === 'AVG_3_MONTHS' : props.dataTransaction.type === 'approveRecommendationApi' && dataTransaction.autoUpdateTypeName === 'AVG_3_MONTHS',
          transFrequencyName: targetType ? targetType === 'CYCLIC_TRANS' && dataTransaction.autoUpdateTypeName === 'AVG_3_MONTHS' : props.dataTransaction.type === 'approveRecommendationApi' && dataTransaction.autoUpdateTypeName === 'AVG_3_MONTHS',
        },
        auto_update_type: true,
        obj: (dataTransaction),
        expirationDate: null,
        editModalInsideIsOpen: false,
        timesValue: 0,
        editSum: false,
        titleModalInside: '',
        transDate: null,
        categoriesModalIsOpen: false,
        currentEditBankTrans: null,
        paymentList: paymentList,
        idxObj: 0,
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
        dataList: [],
        typeEditModal: null,
        transNameNoValid: false,
        companyAccountIdNoValid: false,
        totalNoValid: false,
        totalArrayNoValid: false,
        paymentDescValid: false,
        fadeAnim: new Animated.Value(1),
        showAlert: (props.showPopAlertCreateTrans),
        biziboxMutavValid: true,
        biziboxMutavList: [],
        biziboxMutavListFilter: [],
        modalMutavListShow: false,
        currentMutav: '',
        inProgressMutavList: false,
        addMutavModal: false,
        mutavRow: null,
        modalMutavShow: false,
        textCategory: false,
      }
    }

    setDataState = (data) => {
      this.setState({ obj: data })
    };

    getRulesEdit (data) {
      const disabledVal = {
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
          disabledVal.transName = false
          disabledVal.transTypeName = false
          disabledVal.transFrequencyName = false
          break
        case 'LOAN_TAZRIM':
        case 'DIRECTD':
        case 'CCARD_TAZRIM':
        case 'SOLEK_TAZRIM':
          disabledVal.transName = false
          disabledVal.transTypeName = false
          break
        case 'CYCLIC_TRANS':
          disabledVal.transName = false
          disabledVal.transTypeName = false
          disabledVal.account = false
          disabledVal.paymentDesc = false
          disabledVal.transDate = false
          disabledVal.transFrequencyName = (this.state && this.state.obj) ? this.state.obj.autoUpdateTypeName !== 'USER_DEFINED_TOTAL' : this.props.dataTransaction.autoUpdateTypeName !== 'USER_DEFINED_TOTAL'
          disabledVal.total = (this.state && this.state.obj) ? this.state.obj.autoUpdateTypeName !== 'USER_DEFINED_TOTAL' : this.props.dataTransaction.autoUpdateTypeName !== 'USER_DEFINED_TOTAL'
          break
      }
      return disabledVal
    }

    isEditTotal () {
      if (this.state.obj.targetType === 'CYCLIC_TRANS') {
        let valuesSave = Object.assign({}, this.state.disabledVal)
        valuesSave.total = this.state.obj.autoUpdateTypeName !== 'USER_DEFINED_TOTAL'
        valuesSave.transFrequencyName = this.state.obj.autoUpdateTypeName !== 'USER_DEFINED_TOTAL'
        this.setState({ disabledVal: valuesSave })
      }
    }

    componentDidMount () {
      getMutavApi.post({ body: { uuid: this.props.currentCompanyId } })
        .then(data => {
          this.setState({
            currentMutav: '',
            biziboxMutavList: data,
          })
          if (this.state.obj.type === 'approveRecommendationApi') {
            setTimeout(() => {
              const mutavArray = this.state.obj.mutavArray.filter((item) => item.biziboxMutavId)
              let mutavText = 'לא חובה'
              if (mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null) {
                mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
              } else if (mutavArray.length > 1) {
                mutavText = (mutavArray.length) + ' מוטבים'
              }
              this.setState({
                idxObj: 0,
                mutavText: mutavText,
              })
            }, 20)
          }
        })
    }

    update = () => {
      const { update } = this.props

      this.setState({
        transNameNoValid: this.state.obj.transName === null || this.state.obj.transName === '',
        companyAccountIdNoValid: this.state.obj.companyAccountId === null || this.state.obj.companyAccountId === '',
        totalNoValid: this.state.obj.total === null || this.state.obj.total === '',
        paymentDescValid: this.state.obj.paymentDesc === null || this.state.obj.paymentDesc === '',
      })

      if (this.state.obj.transName !== null && this.state.obj.transName !== '' &&
            this.state.obj.companyAccountId !== null && this.state.obj.companyAccountId !== '' &&
            this.state.obj.total !== null && this.state.obj.total !== '' &&
            this.state.obj.paymentDesc !== null && this.state.obj.paymentDesc !== ''
      ) {
        let mutavArray = this.state.obj.mutavArray
        if (this.state.obj.type === 'approveRecommendationApi') {
          if (mutavArray &&
                    ((mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null) ||

                        (mutavArray.length > 1))
          ) {
            mutavArray.forEach((it) => {
              it.accountMutavName = this.state.biziboxMutavList.find((item) => item.biziboxMutavId === it.biziboxMutavId) ? this.state.biziboxMutavList.find((item) => item.biziboxMutavId === it.biziboxMutavId).accountMutavName : null
            })
          }
        }

        if (this.state.originObj.transFrequencyName === 'MULTIPLE' && this.state.obj.transFrequencyName === 'MONTH') {
          if (this.state.obj.autoUpdateTypeName !== 'AVG_3_MONTHS') {
            update(Object.assign(this.state.obj, {
              transFrequencyName: 'MONTH',
              frequencyDay: AppTimezone.moment(this.state.obj.transDate).format('D'),
              mutavArray: mutavArray,
            }))
          } else {
            update(Object.assign(this.state.obj, {
              transFrequencyName: 'MULTIPLE',
              mutavArray: mutavArray,
            }))
          }
        } else {
          update(Object.assign(this.state.obj, {
            mutavArray: mutavArray,
          }))
        }
      }
    };

    dontShowAgain = () => {
      const { fadeAnim } = this.state
      Animated.timing(
        fadeAnim,
        {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }
      ).start(() => {
        this.setState({ showAlert: false })
        const { dispatch } = this.props
        dispatch(setPopAddCreateTranShow(false))
      })
    };
    animatedClose = () => {
      const { fadeAnim } = this.state
      Animated.timing(
        fadeAnim,
        {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }
      ).start(() => {
        this.setState({ showAlert: false })
      })
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

    setModalInsideVisible = (visible) => () => {
      this.setState({ editModalInsideIsOpen: visible })
    };
    handleSelectCategory = (category) => {
      const { currentEditBankTrans } = this.state
      if (!currentEditBankTrans || currentEditBankTrans.transTypeId === category.transTypeId) {return}

      const newBankTrans = {
        ...currentEditBankTrans,
        iconType: category.iconType,
        transTypeId: category.transTypeId,
        transTypeName: category.transTypeName,
      }
      let valuesSave = Object.assign({}, this.state.obj)

      if (this.state.modalMutavShow) {
        valuesSave.mutavArray[this.state.idxObj].transTypeId = { ...newBankTrans }
      } else {
        valuesSave.transTypeId = { ...newBankTrans }
      }

      this.setState({ obj: valuesSave, currentEditBankTrans: null, categoriesModalIsOpen: false })
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
    handleOpenCategoriesModalInside = (bankTransId) => () => {
      this.setState({
        categoriesModalIsOpen: true,
        currentEditBankTrans: bankTransId,
      })
    };

    handleRemoveBankTransCategory = (transTypeId) => {
      const { currentCompanyId } = this.props
      return removeAccountCflTransTypeApi.post({ body: { transTypeId, companyId: currentCompanyId } })
    };

    handleCreateBankTransCategory = (transTypeName) => {
      const { currentCompanyId } = this.props
      return createAccountCflTransTypeApi.post({
        body: {
          'transTypeId': null,
          transTypeName,
          companyId: currentCompanyId,
        },
      })
    };

    handleCloseCheckListModal = () => {
      if (this.state.typeEditModal === 'companyAccountId') {
        this.setState({
          companyAccountIdNoValid: this.state.obj.companyAccountId === null || this.state.obj.companyAccountId === '',
        })
      }
      if (this.state.typeEditModal === 'paymentDesc') {
        this.setState({
          paymentDescValid: this.state.obj.paymentDesc === null || this.state.obj.paymentDesc === '',
        })
      }
      if (this.state.typeEditModal === 'autoUpdateTypeName') {
        this.isEditTotal()
      }
      this.setModalInsideVisible(!this.state.editModalInsideIsOpen)()
    };

    editInput = (param) => () => {
      if (param === 'account') {
        if (!this.state.disabledVal.account) {
          const types = this.props.accounts.map((item) => {
            return {
              text: item.accountNickname,
              id: item.companyAccountId,
              selected: (item.companyAccountId === this.state.obj.companyAccountId),
              account: item,
            }
          })
          this.setState({
            typeEditModal: 'companyAccountId',
            titleModalInside: 'חשבון בנק',
            dataList: types,
          })
          this.setModalInsideVisible(true)()
        }
      } else if (param === 'transTypeName') {
        if (!this.state.disabledVal.transTypeName) {
          this.handleOpenCategoriesModal(this.state.obj.transTypeId)
        }
      } else if (param === 'paymentDesc') {
        if (!this.state.disabledVal.paymentDesc) {
          const paymentList = this.state.paymentList
          const selected = paymentList.find((item) => item.id === this.state.obj.paymentDesc)
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
      } else if (param === 'total') {
        if (!this.state.disabledVal.total) {
          this.setState({ editSum: true })
        }
      } else if (param === 'transFrequencyName') {
        if (!this.state.disabledVal.transFrequencyName) {
          const transFrequencyName = this.state.transFrequencyName
          const selected = transFrequencyName.find((item) => item.id === this.state.obj.transFrequencyName)
          selected.selected = true
          this.setState({
            typeEditModal: 'transFrequencyName',
            titleModalInside: 'תדירות',
            dataList: transFrequencyName,
          })
          this.setModalInsideVisible(true)()
        }
      } else if (param === 'autoUpdateTypeName') {
        const autoUpdateTypeName = this.state.autoUpdateTypeName
        const selected = autoUpdateTypeName.find((item) => item.id === this.state.obj.autoUpdateTypeName)
        selected.selected = true
        this.setState({
          typeEditModal: 'autoUpdateTypeName',
          titleModalInside: 'סכום לתזרים',
          dataList: autoUpdateTypeName,
        })
        this.setModalInsideVisible(true)()
      } else if (param === 'transDate') {
        if (!this.state.disabledVal.transDate) {
          this.setState({
            typeEditModal: 'transDate',
            titleModalInside: 'החל מתאריך',
          })
          this.setModalInsideVisible(true)()
        }
      } else if (param === 'endDate') {
        const endDate = this.state.endDate
        const selected = endDate.find((item) => item.id === this.state.obj.endDate)
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
        })
        this.openModalMutavList()
        if (!this.state.biziboxMutavList.length) {
          getMutavApi.post({ body: { uuid: this.props.currentCompanyId } })
            .then(data => {
              let biziboxMutavListFilter = JSON.parse(JSON.stringify(data))
              if (!this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId) {
                biziboxMutavListFilter = biziboxMutavListFilter.filter((item) => !this.state.obj.mutavArray.some((it) => it.biziboxMutavId === item.biziboxMutavId))
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
            if (this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId) {
              let itemExist = false
              this.state.biziboxMutavListFilter.forEach((item, idx) => {
                item.data.forEach((it, index) => {
                  if (it.biziboxMutavId === this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId) {
                    itemExist = true
                  }
                })
              })
              if (itemExist) {
                setTimeout(() => {
                  if (this.sectionListRef && this.sectionListRef.scrollToLocation) {
                    let sectionIndex = 0
                    let itemIndex = 0
                    let itemIndexTotal
                    this.state.biziboxMutavListFilter.forEach((item, idx) => {
                      // if(itemIndexTotal === 0){
                      //   sectionIndex += 1
                      // }
                      item.data.forEach((it, index) => {
                        itemIndex += 1
                        if (it.biziboxMutavId === this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId) {
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
      } else if (param === 'biziboxMutavPop') {
        this.setState({
          modalMutavShow: true,
        })
      }
    };

    closeModalCreateEditTransaction = () => {
      const { closeModalCreateEditTransaction } = this.props
      closeModalCreateEditTransaction()
    };

    openModalMutavList = () => {
      this.setState({
        modalMutavListShow: true,
      })
    };
    modalMutavListClose = () => {
      this.setState({
        modalMutavListShow: false,
      })
      if (this.state.obj.mutavArray.length === this.state.idxObj + 1) {
        setTimeout(() => this.addMutavim(true), 50)
      }
    };

    handleFilterField = val => {
      let value = val || ''
      this.setState({ currentMutav: value })
      setTimeout(() => this.filterMutav(), 40)
    };

    handleFilter = val => {
      let value = val.nativeEvent.text || ''
      this.setState({ currentMutav: value })
      setTimeout(() => this.filterMutav(), 40)
    };

    filterMutav = (scrollTo) => {
      let mutavListArr = JSON.parse(JSON.stringify(this.state.biziboxMutavList))
      if (this.state.currentMutav && this.state.currentMutav.length > 0) {
        mutavListArr = mutavListArr.filter((item) => item.accountMutavName.includes(this.state.currentMutav))
      }
      if (this.state.obj.mutavArray && !this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId) {
        mutavListArr = mutavListArr.filter((item) => !this.state.obj.mutavArray.some((it) => it.biziboxMutavId === item.biziboxMutavId))
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
        setTimeout(() => {
          if (this.sectionListRef && this.sectionListRef.scrollToLocation) {
            let sectionIndex = 0
            let itemIndex = 0
            let itemIndexTotal = 0
            this.state.biziboxMutavListFilter.forEach((item, idx) => {
              item.data.forEach((it, index) => {
                itemIndex += 1
                if (it.biziboxMutavId === this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId) {
                  itemIndexTotal = itemIndex
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
    };

    setMutav = (mutav) => () => {
      if (this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId && this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId === mutav.biziboxMutavId) {
        let currentObjState = Object.assign({}, this.state.obj)
        currentObjState.mutavArray[this.state.idxObj].biziboxMutavId = null
        currentObjState.mutavArray[this.state.idxObj].transTypeId = {
          companyId: '00000000-0000-0000-0000-000000000000',
          createDefaultSupplier: true,
          iconType: 'No category',
          shonaScreen: true,
          transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
          transTypeName: 'ללא קטגוריה',
        }
        this.setState({ obj: currentObjState, biziboxMutavValid: false })
      } else {
        let currentObjState = Object.assign({}, this.state.obj)
        if (!this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId || mutav.transTypeId !== 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d') {
          currentObjState.mutavArray[this.state.idxObj].transTypeId = (this.props.categories && this.props.categories.find(ctt => ctt.transTypeId === mutav.transTypeId)) ? this.props.categories.find(ctt => ctt.transTypeId === mutav.transTypeId) : {
            companyId: '00000000-0000-0000-0000-000000000000',
            createDefaultSupplier: true,
            iconType: 'No category',
            shonaScreen: true,
            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
            transTypeName: 'ללא קטגוריה',
          }
        }
        currentObjState.mutavArray[this.state.idxObj].biziboxMutavId = mutav.biziboxMutavId
        this.setState({
          biziboxMutavValid: true,
          obj: currentObjState,
        })
      }
    };

    renderFakeHeader = () => {
      return <Animated.View
        style={{
          flex: 1,
          height: 0,
          backgroundColor: 'transparent',
        }}
      />
    };
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
    };

    getItemLayout = (data, index) => ({
      length: 45,
      offset: 45 * index,
      index,
    });

    openActionSheet = (mutav) => () => {
      this.setState({
        mutavRow: mutav,
      })
      this.bottomActionSheet.show(() => {
        console.log('callback - show')
      })
    };

    onChange = (value, index, values) => {
      // console.log(values)
      this.setState({ selectedItems: values })
    };

    onItemPress = (value) => {
      if (value === 'edit') {
        // const mutavRow = this.state.mutavRow
        // console.log('Press: mutavRow -> ', mutavRow)
        this.addMutav()
      }
      // console.log('Press: value -> ', value)
    };

    renderScrollItem = ({ item, index }) => {
      const { t } = this.props
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
            backgroundColor: (item.biziboxMutavId === this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId) ? '#f5f5f5' : '#ffffff',
          }}>
          <View style={{
            flex: 12,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
            {item.biziboxMutavId === this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId && (
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
    };

    addMutav = () => {
      if (this.state.addMutavModal) {
        this.setState({
          mutavRow: null,
        })
      }
      this.setState({
        addMutavModal: !this.state.addMutavModal,
      })
    };

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
    };

    handleToggleCheckBox = () => {
      let obj = Object.assign({}, this.state.obj)
      obj.autoUpdateTypeName = (obj.autoUpdateTypeName === 'USER_DEFINED_TOTAL') ? 'AVG_3_MONTHS' : 'USER_DEFINED_TOTAL'
      if ((this.state.obj.targetType && this.state.obj.targetType === 'CYCLIC_TRANS') || this.state.obj.type === 'approveRecommendationApi') {
        let valuesSaveDis = Object.assign({}, this.state.disabledVal)
        if (obj.autoUpdateTypeName === 'AVG_3_MONTHS') {
          valuesSaveDis.total = true
          valuesSaveDis.transFrequencyName = true
        } else {
          valuesSaveDis.total = false
          valuesSaveDis.transFrequencyName = false
        }
        this.setState({ obj: obj, disabledVal: valuesSaveDis })
      } else {
        this.setState({ obj: obj })
      }
    };

    isValidList () {
      const params = this.state.obj

      let isValid = true

      if (this.state.idxObj !== (params.mutavArray.length - 1)) {
        params.mutavArray.forEach((itemInside, idx) => {
          if ((params.mutavArray.length > (idx + 1)) && (itemInside.biziboxMutavId === null || itemInside.total === null || itemInside.total === '')) {
            isValid = false
          }
        })
      } else {
        params.mutavArray.forEach((itemInside) => {
          if (itemInside.biziboxMutavId === null || itemInside.total === null || itemInside.total === '') {
            isValid = false
          }
        })
      }

      return isValid
    }

    editMutav = (index) => () => {
      const params = this.state.obj

      let isValid = true
      if ((this.state.idxObj !== (params.mutavArray.length - 1)) && (params.mutavArray[this.state.idxObj].biziboxMutavId === null || params.mutavArray[this.state.idxObj].total === null || params.mutavArray[this.state.idxObj].total === '')) {
        isValid = false
        this.setState({
          totalArrayNoValid: params.mutavArray[this.state.idxObj].total === null || params.mutavArray[this.state.idxObj].total === '',
          biziboxMutavValid: params.mutavArray[this.state.idxObj].biziboxMutavId !== null,
        })
      }
      // params.mutavArray.forEach((itemInside, idx) => {
      //   if ((params.mutavArray.length > (idx + 1)) && (itemInside.biziboxMutavId === null || itemInside.total === null || itemInside.total === '')) {
      //     isValid = false
      //   }
      // })
      if (isValid) {
        this.setState({ idxObj: index })
      }
    };

    removeMutav = (index) => () => {
      let valuesSave = Object.assign({}, this.state.obj)
      valuesSave.mutavArray.splice(index, 1)
      this.setState({
        idxObj: (((valuesSave.mutavArray.length - 1) < 0) ? 0 : (valuesSave.mutavArray.length - 1)),
        obj: valuesSave,
      })
    };

    modalMutavClose = () => {
      const mutavArray = this.state.obj.mutavArray.filter((item) => item.biziboxMutavId && item.total !== null && item.total !== '')
      let valuesSave = Object.assign({}, this.state.obj)
      let valuesSaveDis = Object.assign({}, this.state.disabledVal)
      valuesSave.mutavArray = mutavArray
      let editSum = this.state.editSum
      let mutavText = 'לא חובה'
      let textCategory = false
      valuesSaveDis.total = false
      if (mutavArray.length === 1 && mutavArray[0].biziboxMutavId !== null) {
        valuesSave.total = mutavArray[0].total
        mutavText = this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
        valuesSave.transTypeId = mutavArray[0].transTypeId
        valuesSave.transName = (!valuesSave.expence ? 'העברה מ' : 'העברה ל') + ' ' + this.state.biziboxMutavList.find((it) => it.biziboxMutavId === mutavArray[0].biziboxMutavId).accountMutavName
      } else if (mutavArray.length > 1) {
        valuesSave.transName = (!valuesSave.expence ? 'העברה מ' : 'העברה ל') + ' ' + mutavArray.length + ' מוטבים'
        valuesSave.total = mutavArray.reduce((memo, it) => {
          return memo + Number(it.total)
        }, 0)
        const transTypeIdCategory = [...new Set(mutavArray.map(x => x.transTypeId.transTypeId))]
        if (transTypeIdCategory.length > 1) {
          textCategory = 'קטגוריות שונות'
        } else {
          valuesSaveDis.transTypeName = true
          valuesSave.transTypeId = mutavArray[0].transTypeId
        }
        valuesSaveDis.total = true
        editSum = false
        mutavText = (mutavArray.length) + ' מוטבים'
      } else {
        valuesSave.mutavArray = [{
          total: null,
          biziboxMutavId: null,
          transTypeId: {
            companyId: '00000000-0000-0000-0000-000000000000',
            createDefaultSupplier: true,
            iconType: 'No category',
            shonaScreen: true,
            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
            transTypeName: 'ללא קטגוריה',
          },
        }]
      }

      console.log('----valuesSave----', valuesSave)
      this.setState({
        idxObj: 0,
        mutavText: mutavText,
        disabledVal: valuesSaveDis,
        editSum: editSum,
        modalMutavShow: false,
        obj: valuesSave,
        textCategory,
      })
    };
    blurMutavim = () => {
      if (this.state.obj.mutavArray.length === this.state.idxObj + 1) {
        setTimeout(() => this.addMutavim(true), 50)
      }
    };
    addMutavim = (check) => {
      const params = this.state.obj
      const idxObjnow = this.state.idxObj
      if (check) {
        if (params.mutavArray[this.state.idxObj].biziboxMutavId === null || params.mutavArray[this.state.idxObj].total === null || params.mutavArray[this.state.idxObj].total === '') {
          return
        }
      }
      let valuesSave = Object.assign({}, params)
      const indexes = params.mutavArray
        .map((it, i) => it.biziboxMutavId === params.mutavArray[this.state.idxObj].biziboxMutavId ? i : null)
        .filter(i => i !== null)
      if (indexes.length > 1) {
        const idx = indexes.findIndex((item) => item !== idxObjnow)
        params.mutavArray.splice(indexes[idx], 1)
        this.setState({
          totalArrayNoValid: params.mutavArray[idxObjnow - 1].total === null || params.mutavArray[idxObjnow - 1].total === '',
          biziboxMutavValid: params.mutavArray[idxObjnow - 1].biziboxMutavId !== null,
          idxObj: idxObjnow - 1,
          obj: valuesSave,
        })
      } else {
        this.setState({
          totalArrayNoValid: params.mutavArray[this.state.idxObj].total === null || params.mutavArray[this.state.idxObj].total === '',
          biziboxMutavValid: params.mutavArray[this.state.idxObj].biziboxMutavId !== null,
        })
      }

      // if (this.state.idxObj !== params.mutavArray.length - 1) {
      //   let isValid = true
      //   params.mutavArray.forEach((itemInside, idx) => {
      //     if ((params.mutavArray.length > (idx + 1)) && (itemInside.biziboxMutavId === null || itemInside.total === null || itemInside.total === '')) {
      //       isValid = false
      //     }
      //   })
      //   if (isValid) {
      //     let valuesSave = Object.assign({}, params)
      //     valuesSave.mutavArray[valuesSave.mutavArray.length - 1] = {
      //       total: null,
      //       biziboxMutavId: null,
      //       transTypeId: {
      //         companyId: '00000000-0000-0000-0000-000000000000',
      //         createDefaultSupplier: true,
      //         iconType: 'No category',
      //         shonaScreen: true,
      //         transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
      //         transTypeName: 'ללא קטגוריה',
      //       },
      //     }
      //     this.setState({ idxObj: (valuesSave.mutavArray.length - 1), obj: valuesSave })
      //   }
      // } else {

      let isValid = true
      if (indexes.length > 1) {
        if ((this.state.idxObj !== (params.mutavArray.length - 1)) && (params.mutavArray[idxObjnow - 1].biziboxMutavId === null || params.mutavArray[idxObjnow - 1].total === null || params.mutavArray[idxObjnow - 1].total === '')) {
          isValid = false
        }
      } else {
        if ((this.state.idxObj !== (params.mutavArray.length - 1)) && (params.mutavArray[this.state.idxObj].biziboxMutavId === null || params.mutavArray[this.state.idxObj].total === null || params.mutavArray[this.state.idxObj].total === '')) {
          isValid = false
        }
      }

      if (isValid) {
        if (!valuesSave.mutavArray[valuesSave.mutavArray.length - 1].total && !valuesSave.mutavArray[valuesSave.mutavArray.length - 1].biziboxMutavId) {
          this.setState({ idxObj: valuesSave.mutavArray.length - 1, obj: valuesSave })
        } else {
          valuesSave.mutavArray.push({
            total: null,
            biziboxMutavId: null,
            transTypeId: {
              companyId: '00000000-0000-0000-0000-000000000000',
              createDefaultSupplier: true,
              iconType: 'No category',
              shonaScreen: true,
              transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
              transTypeName: 'ללא קטגוריה',
            },
          })
          this.setState({ idxObj: valuesSave.mutavArray.length - 1, obj: valuesSave })
        }
        setTimeout(() => this.scrollView.scrollToEnd({ animated: true }), 200)
      }
    };

    removeMutavim = () => {
      if (this.state.modalMutavShow) {
        let currentObjState = Object.assign({}, this.state.obj)
        currentObjState.mutavArray[this.state.idxObj].biziboxMutavId = null
        currentObjState.mutavArray[this.state.idxObj].transTypeId = {
          companyId: '00000000-0000-0000-0000-000000000000',
          createDefaultSupplier: true,
          iconType: 'No category',
          shonaScreen: true,
          transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
          transTypeName: 'ללא קטגוריה',
        }
        this.setState({ obj: currentObjState, biziboxMutavValid: false })
      } else {
        let valuesSave = Object.assign({}, this.state.obj)
        valuesSave.mutavArray = [{
          total: null,
          biziboxMutavId: null,
          transTypeId: {
            companyId: '00000000-0000-0000-0000-000000000000',
            createDefaultSupplier: true,
            iconType: 'No category',
            shonaScreen: true,
            transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
            transTypeName: 'ללא קטגוריה',
          },
        }]
        valuesSave.transTypeId = {
          companyId: '00000000-0000-0000-0000-000000000000',
          createDefaultSupplier: true,
          iconType: 'No category',
          shonaScreen: true,
          transTypeId: 'f8dd5d61-fb5d-44ba-b7e6-65f25e7b2c6d',
          transTypeName: 'ללא קטגוריה',
        }
        this.setState({
          obj: valuesSave,
          textCategory: false,
          biziboxMutavValid: true,
          mutavText: 'לא חובה',
        })
      }
    };

    render () {
      const { categoriesModalIsOpen, currentEditBankTrans, showAlert, fadeAnim, modalMutavListShow, currentMutav, biziboxMutavListFilter, inProgressMutavList, addMutavModal, mutavRow, modalMutavShow, textCategory, mutavText } = this.state
      const { dataTransaction, isRtl, currentCompanyId } = this.props
      const total = getFormattedValueArray(this.state.obj.total)
      const numberStyle = cs(dataTransaction.expence, [styles.dataValue, { color: colors.green4 }], { color: colors.red2 })
      const rowStyle = !isRtl ? 'row-reverse' : 'row'
      let peulotCount = false
      if (this.state.biziboxMutavList && this.state.biziboxMutavList.length > 0) {
        const filterPeulotCount = this.state.biziboxMutavList.filter((item) => {
          return this.state.obj.mutavArray.some((key) => key.biziboxMutavId === item.biziboxMutavId) && item.peulotCount
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
                    height: 68,
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
                    marginTop: 30,
                    marginBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                    flex: 1,
                  }}>
                    <KeyboardAwareScrollView enableOnAndroid>
                      {this.state.typeEditModal !== 'transDate' && (<CheckList
                        close={this.handleCloseCheckListModal}
                        data={this.state.dataList}
                        setDataState={this.setDataState}
                        value={this.state.obj}
                        type={this.state.typeEditModal} />)}
                      {this.state.typeEditModal === 'transDate' && (<Calendar
                        minDate={this.today}
                        current={AppTimezone.moment(this.state.obj.transDate).format('YYYY-MM-DD')}
                        markedDates={{
                          [AppTimezone.moment(this.state.obj.transDate).format('YYYY-MM-DD')]: {
                            startingDay: true,
                            selected: true,
                            color: colors.blue3,
                          },
                        }}
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

                          this.setState({ transDate: day.timestamp })
                          let obj = Object.assign({}, this.state.obj)
                          obj.transDate = day.timestamp
                          this.setState({ obj: obj })
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

                  {this.state.obj.mutavArray.length > 1 && (
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
                          {this.state.obj.mutavArray.map((c, i) => {
                            if ((i + 1) !== this.state.obj.mutavArray.length && c.total && c.biziboxMutavId) {
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
                                        numberOfLines={1}
                                        ellipsizeMode="tail">
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
                                        numberOfLines={1}
                                        ellipsizeMode="tail">
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
                    marginTop: (this.state.obj.mutavArray.length > 1) ? 10 : 38,
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
                                <Icon name="chevron-left" size={24} color={colors.blue34} />
                              </View>

                              {/* {this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId && ( */}
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
                              color: (!this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId) ? '#d0cece' : '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {(this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId)
                                ? (this.state.biziboxMutavList && this.state.biziboxMutavList.length > 0 && this.state.biziboxMutavList.find((it) => it.biziboxMutavId === this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId) ? ((this.state.biziboxMutavList.find((it) => it.biziboxMutavId === this.state.obj.mutavArray[this.state.idxObj].biziboxMutavId).accountMutavName)) : '')
                                : 'לא חובה'
                              }
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

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
                            onPress={this.handleOpenCategoriesModalInside(this.state.obj.mutavArray[this.state.idxObj].transTypeId)}
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
                              {this.state.obj.mutavArray[this.state.idxObj].transTypeId.transTypeName}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      <View
                        style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                          height: 42,
                          marginBottom: 8,
                        }]}>
                        <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                          <Text style={{
                            color: '#0f3860',
                            fontSize: sp(13),
                            lineHeight: 42,
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
                            editable
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
                              let valuesSave = Object.assign({}, this.state.obj)
                              valuesSave.mutavArray[this.state.idxObj].total = e.nativeEvent.text.toString().replace(/[^\d.]/g, '')
                              this.setState({
                                obj: valuesSave,
                                totalArrayNoValid: valuesSave.mutavArray[this.state.idxObj].total === '',
                              })
                              if (this.state.obj.mutavArray.length === this.state.idxObj + 1) {
                                setTimeout(() => this.addMutavim(true), 50)
                              }
                            }}
                            onChangeText={(total) => {
                              if (String(total).split('.').length > 2) {
                                let valuesSave = Object.assign({}, this.state.obj)
                                this.setState({
                                  obj: valuesSave,
                                  totalArrayNoValid: valuesSave.mutavArray[this.state.idxObj].total === '',
                                })
                              } else {
                                let valuesSave = Object.assign({}, this.state.obj)
                                valuesSave.mutavArray[this.state.idxObj].total = total.toString().replace(/[^\d.]/g, '')
                                this.setState({
                                  obj: valuesSave,
                                  totalArrayNoValid: valuesSave.mutavArray[this.state.idxObj].total === '',
                                })
                              }
                            }}
                            value={this.state.obj.mutavArray[this.state.idxObj].total ? inputWorkaround.getWorkaroundChar() + String(this.state.obj.mutavArray[this.state.idxObj].total) : null}
                            underlineColorAndroid="transparent"
                          />
                        </View>
                      </View>

                      {this.state.obj.mutavArray.length > 1 && (
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
                      )}

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
                    paymentDesc={this.state.obj.paymentDesc ? this.state.obj.paymentDesc : 'BankTransfer'}
                    companyId={currentCompanyId}
                    companyAccountId={this.state.obj.companyAccountId ? this.state.obj.companyAccountId : this.props.accounts[0].companyAccountId}
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

            {categoriesModalIsOpen && !modalMutavShow && (
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
                      <TouchableOpacity onPress={this.closeModalCreateEditTransaction}>
                        <Text style={{
                          fontSize: sp(16),
                          color: '#ffffff',
                          fontFamily: fonts.semiBold,
                        }}>ביטול</Text>
                      </TouchableOpacity>
                    </View>
                    <View style={{ alignItems: 'center' }}>
                      <Text style={{ fontSize: sp(20), color: '#ffffff', fontFamily: fonts.semiBold }}>
                        {dataTransaction.type === 'update' ? 'עריכת' : 'הוספת'} {dataTransaction.expence ? 'הוצאה' : 'הכנסה'} {'קבועה'}
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
                {showAlert && (
                  <Animated.View style={{
                    opacity: fadeAnim,
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    left: 0,
                    top: 0,
                    zIndex: 9,
                    height: '100%',
                    width: '100%',
                    flexDirection: 'row',
                    alignSelf: 'center',
                    justifyContent: 'center',
                    alignItems: 'center',
                    alignContent: 'center',
                  }}>

                    <View style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      left: 0,
                      top: 68,
                      zIndex: 9,
                      height: '100%',
                      width: '100%',
                      backgroundColor: '#cccccc',
                      opacity: 0.7,
                    }} />

                    <View style={{
                      height: 185,
                      width: 290,
                      backgroundColor: '#ffffff',
                      borderRadius: 15,
                      zIndex: 10,
                      shadowColor: '#a0a0a0',
                      shadowOffset: { width: 0, height: 0 },
                      shadowOpacity: 0.8,
                      shadowRadius: 4,
                      elevation: 2,
                      paddingHorizontal: 20,
                      paddingVertical: 8,
                      flexDirection: 'column',
                      alignItems: 'flex-end',
                      justifyContent: 'flex-start',
                    }}>
                      <Text style={{
                        color: '#229f88',
                        fontSize: sp(18.5),
                        lineHeight: 30,
                        fontFamily: fonts.semiBold,
                      }}>שימו לב</Text>

                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(14),
                        lineHeight: 20,
                        fontFamily: fonts.regular,
                        textAlign: 'right',
                      }}>
                                            בחירה במוטב תאפשר
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(14),
                          lineHeight: 20,
                          fontFamily: fonts.bold,
                        }}>
                          {' התאמה אוטומטית '}
                        </Text>
                        {'\n'}
                                            כשהתנועה תופיע בבנק
                      </Text>

                      <View style={{
                        width: '100%',
                        marginVertical: 5,
                        height: 1,
                        backgroundColor: '#dbdbdb',
                      }} />

                      <Text style={{
                        color: '#0f3860',
                        fontSize: sp(14),
                        lineHeight: 20,
                        fontFamily: fonts.regular,
                        textAlign: 'right',
                      }}>
                                            תנועה ללא מוטב לא תופיע במסך המוטבים,
                        {'\n'}
                                            אלא במסך התזרים בלבד
                      </Text>

                      <View style={{
                        width: '100%',
                        marginVertical: 5,
                        height: 1,
                      }} />

                      <View style={{
                        flexDirection: 'row-reverse',
                        alignSelf: 'center',
                        alignItems: 'center',
                        alignContent: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <View style={{
                          flex: 1,
                        }}>
                          <TouchableOpacity
                            onPress={this.dontShowAgain}>
                            <View style={{
                              flexDirection: 'row-reverse',
                              alignSelf: 'flex-end',
                              justifyContent: 'center',
                            }}>
                              <CustomIcon name={'ok'} size={16} color={'#dddddd'} />
                              <View style={{
                                paddingHorizontal: 2,
                              }} />
                              <Text style={{
                                color: '#0f3860',
                                fontSize: sp(14),
                                lineHeight: 20,
                                fontFamily: fonts.regular,
                                textAlign: 'right',
                              }}>
                                                            אל תציג שוב
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                        <View style={{
                          flex: 1,
                        }}>
                          <TouchableOpacity onPress={this.animatedClose}>
                            <View style={{
                              height: 32.5,
                              width: 95,
                              backgroundColor: '#022258',
                              borderRadius: 5,
                              flexDirection: 'row-reverse',
                              alignSelf: 'center',
                              justifyContent: 'center',
                              alignItems: 'center',
                              alignContent: 'center',
                            }}>
                              <Text style={{
                                color: '#ffffff',
                                fontSize: sp(16),
                                fontFamily: fonts.semiBold,
                                textAlign: 'center',
                              }}>
                                                            הבנתי, תודה
                              </Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                )}
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
                  <KeyboardAwareScrollView enableOnAndroid>
                    <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }, cs(this.state.disabledVal.account, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          lineHeight: 42,
                        }}>חשבון</Text>
                      </View>
                      <View style={[{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs(this.state.companyAccountIdNoValid, {}, {
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
                            {(this.state.obj.companyAccountId) ? this.props.accounts.find(a => a.companyAccountId === this.state.obj.companyAccountId).accountNickname : 'בחר חשבון'}
                          </Text>
                          <View style={commonStyles.spaceDivider} />
                          <AccountIcon
                            account={this.props.accounts.find(a => a.companyAccountId === this.state.obj.companyAccountId)} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                      height: 42,
                      marginBottom: 8,
                    }, cs(this.state.obj.type === 'approveRecommendationApi', { opacity: 1 }, { opacity: 0.6 })]}>
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
                      }]}>

                        {this.state.obj.type !== 'approveRecommendationApi' && (
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
                                    hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
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
                              color: (this.state.obj.mutavArray.length === 1 && this.state.obj.mutavArray[0].biziboxMutavId === null) ? '#d0cece' : '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {mutavText}
                            </Text>
                          </View>
                        )}
                        {this.state.obj.type === 'approveRecommendationApi' && (
                          <View style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                            flex: 1,
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                          }]}>
                            <Text style={[{
                              textAlign: 'right',
                              color: (this.state.obj.mutavArray.length === 1 && this.state.obj.mutavArray[0].biziboxMutavId === null) ? '#d0cece' : '#0f3860',
                              fontSize: sp(15),
                              lineHeight: 42,
                            }, commonStyles.regularFont]}>
                              {mutavText}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>

                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledVal.transName, { opacity: 1 }, { opacity: 0.3 })]}>
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
                      }, cs(this.state.transNameNoValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                        <TextInput
                          editable={!this.state.disabledVal.transName}
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
                            valuesSave.transName = e.nativeEvent.text
                            this.setState({
                              obj: valuesSave,
                              transNameNoValid: valuesSave.transName === '',
                            })
                          }}
                          onChangeText={(transName) => {
                            let valuesSave = Object.assign({}, this.state.obj)
                            valuesSave.transName = transName
                            this.setState({
                              obj: valuesSave,
                              transNameNoValid: valuesSave.transName === '',
                            })
                          }}
                          value={this.state.obj.transName}
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
                        }, cs(this.state.disabledVal.transTypeName, { opacity: 1 }, { opacity: 0.3 })]}>
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
                              {this.state.obj.transTypeId.transTypeName}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledVal.paymentDesc, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          lineHeight: 42,
                        }}>סוג תשלום</Text>
                      </View>
                      <View style={[{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs(this.state.paymentDescValid, {}, {
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
                          onPress={this.editInput('paymentDesc')}>
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
                            {(this.state.obj.paymentDesc) ? (this.props.searchkey && this.props.searchkey.length > 0 && this.props.searchkey.find((it) => it.paymentDescription === this.state.obj.paymentDesc) ? this.props.searchkey.find((it) => it.paymentDescription === this.state.obj.paymentDesc).name : '') : 'בחר'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledVal.transFrequencyName, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
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
                            {this.state.transFrequencyName.find((item) => item.id === this.state.obj.transFrequencyName).text}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledVal.transDate, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
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
                          }, commonStyles.regularFont]}>{AppTimezone.moment(this.state.obj.transDate).format('DD/MM/YY')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }, cs(this.state.disabledVal.total, { opacity: 1 }, { opacity: 0.3 })]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
                          lineHeight: 42,
                        }}>סכום בש״ח</Text>
                      </View>
                      <View style={[{
                        flex: 5.73,
                        backgroundColor: '#f5f5f5',
                        paddingHorizontal: 21,
                        borderBottomRightRadius: 20,
                        borderTopRightRadius: 20,
                      }, cs(this.state.totalNoValid, {}, {
                        borderWidth: 1,
                        borderColor: colors.red,
                      })]}>
                        {this.state.editSum && (
                          <TextInput
                            autoCorrect={false}
                            autoFocus
                            editable={this.state.editSum && !this.state.disabledVal.total}
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
                              let valuesSave = Object.assign({}, this.state.obj)
                              valuesSave.total = e.nativeEvent.text.toString().replace(/[^\d.]/g, '')
                              this.setState({
                                obj: valuesSave,
                                editSum: false,
                                totalNoValid: valuesSave.total === '',
                              })
                            }}
                            onChangeText={(total) => {
                              if (String(total).split('.').length > 2) {
                                let valuesSave = Object.assign({}, this.state.obj)
                                this.setState({
                                  obj: valuesSave,
                                  totalNoValid: valuesSave.total === '',
                                })
                              } else {
                                let valuesSave = Object.assign({}, this.state.obj)
                                valuesSave.total = total.toString().replace(/[^\d.]/g, '')
                                this.setState({
                                  obj: valuesSave,
                                  totalNoValid: valuesSave.total === '',
                                })
                              }
                            }}
                            value={this.state.obj.total !== null ? inputWorkaround.getWorkaroundChar() + String(this.state.obj.total) : ''}
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
                            onPress={this.editInput('total')}>
                            {(this.state.obj.total !== null && this.state.obj.total !== '') && (
                              <Text
                                style={[styles.dataValueWrapper, styles.dataValueWrapperLevel2, {
                                  fontSize: sp(15),
                                  lineHeight: 42,
                                  color: '#0f3860',
                                }, commonStyles.regularFont]} numberOfLines={1}
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
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>

                    {/* <View */}
                    {/* style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), { */}
                    {/* height: 42, */}
                    {/* marginBottom: 8, */}
                    {/* }]}> */}
                    {/* <View style={{ flex: 1.76, alignItems: 'flex-end' }}> */}
                    {/* <Text style={{ */}
                    {/* color: '#0f3860', */}
                    {/* fontSize: sp(13), */}
                    {/* lineHeight: 42, */}
                    {/* }}>סכום לתזרים</Text> */}
                    {/* </View> */}
                    {/* <View style={{ */}
                    {/* flex: 5.73, */}
                    {/* backgroundColor: '#f5f5f5', */}
                    {/* paddingHorizontal: 21, */}
                    {/* borderBottomRightRadius: 20, */}
                    {/* borderTopRightRadius: 20, */}
                    {/* }}> */}
                    {/* <TouchableOpacity */}
                    {/* style={[cs(isRtl, commonStyles.row, [commonStyles.rowReverse]), { */}
                    {/* flex: 1, */}
                    {/* flexDirection: 'row', */}
                    {/* justifyContent: 'flex-end', */}
                    {/* alignItems: 'center', */}
                    {/* }]} */}
                    {/* onPress={this.editInput('autoUpdateTypeName')}> */}
                    {/* <View style={{ */}
                    {/* marginRight: 'auto', */}
                    {/* }}> */}
                    {/* <Icon name='chevron-left' size={24} color={colors.blue34} /> */}
                    {/* </View> */}
                    {/* <Text style={[{ */}
                    {/* textAlign: 'right', */}
                    {/* color: '#0f3860', */}
                    {/* fontSize: sp(15), */}
                    {/* lineHeight: 42, */}
                    {/* }, commonStyles.regularFont]}> */}
                    {/* {(this.state.autoUpdateTypeName.find((item) => item.id === this.state.obj.autoUpdateTypeName)) ? this.state.autoUpdateTypeName.find((item) => item.id === this.state.obj.autoUpdateTypeName).text : ''} */}
                    {/* </Text> */}
                    {/* </TouchableOpacity> */}
                    {/* </View> */}
                    {/* </View> */}
                    <View
                      style={[cs(!isRtl, commonStyles.row, [commonStyles.rowReverse]), {
                        height: 42,
                        marginBottom: 8,
                      }]}>
                      <View style={{ flex: 1.76, alignItems: 'flex-end' }}>
                        <Text style={{
                          color: '#0f3860',
                          fontSize: sp(13),
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
                            {this.state.endDate.find((item) => item.id === this.state.obj.endDate).text} {(this.state.obj.endDate === 'on') ? AppTimezone.moment(this.state.obj.expirationDate).format('DD/MM/YY') : (this.state.obj.endDate === 'times') ? this.state.obj.timesValue + ' פעמים' : ''}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>

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
                        checked={this.state.obj.autoUpdateTypeName === 'AVG_3_MONTHS'}
                        onPress={this.handleToggleCheckBox}
                      />
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
